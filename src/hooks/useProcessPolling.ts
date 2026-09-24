import { useState, useCallback, useRef, useEffect } from 'react';
import {
  getProcessStatus,
  getProcessResultImageUrl,
  getProcessSavedImageUrl,
  getVariantSave,
} from '../services/api';
import type { InfographicRecommendedItem, TextLayer } from '../types/infographicEditor';
import {
  buildProcessVariant,
  type ProcessVariant,
} from '../types/processVariant';
import {
  clearWorkspaceMeta,
  readWorkspaceMeta,
  writeWorkspaceMeta,
  type WorkspacePersistedMeta,
} from '../lib/workspaceStorage';

const POLL_INTERVAL_MS = 2000;

export type QueueStatus = 'pending' | 'processing' | 'completed' | 'failed' | null;

/** ML may return `processing` while the worker runs; treat unknown in-flight values as pending. */
function normalizeQueueStatus(raw: string | undefined): QueueStatus {
  if (raw === 'completed' || raw === 'failed' || raw === 'pending' || raw === 'processing') {
    return raw;
  }
  if (!raw) return 'pending';
  return 'pending';
}

function buildVariantsFromTask(
  taskId: string,
  imageUrls: string[],
  items: InfographicRecommendedItem[]
): ProcessVariant[] {
  return imageUrls.map((originalUrl, i) =>
    buildProcessVariant({
      taskId,
      resultIndex: i,
      originalUrl,
      infographicItems: [...items],
    })
  );
}

async function hydrateSavedVariants(variants: ProcessVariant[]): Promise<ProcessVariant[]> {
  const out: ProcessVariant[] = [];
  for (const v of variants) {
    try {
      const res = await getVariantSave(v.taskId, v.resultIndex);
      if (res.success && res.data) {
        out.push({
          ...v,
          displayBase: 'saved',
          savedUrl: getProcessSavedImageUrl(v.taskId, v.resultIndex),
          savedRevision: res.data.revision,
          textLayers: (res.data.textLayers ?? []) as TextLayer[],
        });
        continue;
      }
    } catch {
      /* no saved variant */
    }
    out.push(v);
  }
  return out;
}

export function useProcessPolling() {
  const [queueStatus, setQueueStatus] = useState<QueueStatus>(null);
  const [variants, setVariants] = useState<ProcessVariant[]>([]);
  const [activeResultIndex, setActiveResultIndex] = useState(0);
  const [resultSessionId, setResultSessionId] = useState<string | null>(null);
  const taskIdsRef = useRef<string[]>([]);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const persistWorkspaceMeta = useCallback(
    (list: ProcessVariant[], activeIndex: number, sessionId: string | null) => {
      if (!sessionId || list.length === 0) return;
      const meta: WorkspacePersistedMeta = {
        version: 2,
        sessionId,
        activeIndex,
        variants: list.map((v) => ({
          taskId: v.taskId,
          resultIndex: v.resultIndex,
          displayBase: v.displayBase,
        })),
      };
      writeWorkspaceMeta(meta);
    },
    []
  );

  const applyVariants = useCallback(
    async (list: ProcessVariant[], sessionId: string | null) => {
      const hydrated = await hydrateSavedVariants(list);
      setVariants(hydrated);
      if (sessionId) {
        persistWorkspaceMeta(hydrated, 0, sessionId);
      }
    },
    [persistWorkspaceMeta]
  );

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  const resetResults = useCallback(() => {
    setQueueStatus(null);
    setVariants([]);
    setActiveResultIndex(0);
    setResultSessionId(null);
    taskIdsRef.current = [];
    clearWorkspaceMeta();
  }, []);

  const setActiveResultIndexWrapped = useCallback(
    (index: number) => {
      setActiveResultIndex(index);
      if (resultSessionId && variants.length > 0) {
        persistWorkspaceMeta(variants, index, resultSessionId);
      }
    },
    [resultSessionId, variants, persistWorkspaceMeta]
  );

  const updateVariant = useCallback(
    (id: string, patch: Partial<ProcessVariant>) => {
      setVariants((prev) => prev.map((v) => (v.id === id ? { ...v, ...patch } : v)));
    },
    []
  );

  const pollTask = useCallback(
    async (id: string) => {
      try {
        const res = await getProcessStatus(id);
        if (!res.success || !res.data) return;
        const status = normalizeQueueStatus(res.data.status);
        if (status === 'completed' && res.data.result?.images) {
          const images = res.data.result.images;
          const items = res.data.infographicItems ?? [];
          const itemCopy = items.length > 0 ? [...items] : [];
          const list = buildVariantsFromTask(id, images, itemCopy);
          const sessionId = crypto.randomUUID();
          setResultSessionId(sessionId);
          // Apply variants before flipping to completed so the UI never lands on setup mid-hydrate.
          await applyVariants(list, sessionId);
          setActiveResultIndex(0);
          setQueueStatus('completed');
          stopPolling();
          return;
        }
        if (status === 'failed') {
          setVariants([]);
          setActiveResultIndex(0);
          setQueueStatus('failed');
          stopPolling();
          return;
        }
        setQueueStatus(status);
      } catch {
        /* keep polling */
      }
    },
    [stopPolling, applyVariants]
  );

  const pollAllTasks = useCallback(
    async (ids: string[]) => {
      const responses = await Promise.all(ids.map((id) => getProcessStatus(id).catch(() => null)));

      let finished = 0;
      const allVariants: ProcessVariant[] = [];

      for (let t = 0; t < responses.length; t++) {
        const res = responses[t];
        const taskId = ids[t];
        if (!res?.success || !res.data) continue;
        if (res.data.status === 'completed' && res.data.result?.images) {
          const items = res.data.infographicItems ?? [];
          const itemCopy = items.length > 0 ? [...items] : [];
          allVariants.push(...buildVariantsFromTask(taskId, res.data.result.images, itemCopy));
          finished += 1;
        } else if (res.data.status === 'failed') {
          finished += 1;
        }
      }

      if (finished === ids.length) {
        stopPolling();
        setQueueStatus(allVariants.length > 0 ? 'completed' : 'failed');
        const sessionId = crypto.randomUUID();
        setResultSessionId(sessionId);
        await applyVariants(allVariants, sessionId);
        setActiveResultIndex(0);
      }
    },
    [stopPolling, applyVariants]
  );

  const startPolling = useCallback(
    (taskIds: string[]) => {
      stopPolling();
      if (taskIds.length === 0) return;
      taskIdsRef.current = taskIds;
      setQueueStatus('pending');
      if (taskIds.length === 1) {
        void pollTask(taskIds[0]);
        pollRef.current = setInterval(() => pollTask(taskIds[0]), POLL_INTERVAL_MS);
      } else {
        void pollAllTasks(taskIds);
        pollRef.current = setInterval(() => pollAllTasks(taskIds), POLL_INTERVAL_MS);
      }
    },
    [stopPolling, pollTask, pollAllTasks]
  );

  const restoreWorkspaceFromMeta = useCallback(async () => {
    const meta = readWorkspaceMeta();
    if (!meta) return false;
    setResultSessionId(meta.sessionId);
    setQueueStatus('completed');

    const statusByTask = new Map<
      string,
      { images: string[]; infographicItems: InfographicRecommendedItem[] }
    >();
    const uniqueTaskIds = [...new Set(meta.variants.map((m) => m.taskId))];
    await Promise.all(
      uniqueTaskIds.map(async (taskId) => {
        try {
          const statusRes = await getProcessStatus(taskId);
          if (statusRes.success && statusRes.data?.result?.images) {
            statusByTask.set(taskId, {
              images: statusRes.data.result.images,
              infographicItems: statusRes.data.infographicItems ?? [],
            });
          }
        } catch {
          /* ignore */
        }
      })
    );

    const list: ProcessVariant[] = meta.variants.map((m) => {
      const status = statusByTask.get(m.taskId);
      const originalUrl =
        status?.images[m.resultIndex] ?? getProcessResultImageUrl(m.taskId, m.resultIndex);
      return buildProcessVariant({
        taskId: m.taskId,
        resultIndex: m.resultIndex,
        originalUrl,
        infographicItems: status?.infographicItems ?? [],
        displayBase: m.displayBase,
        savedUrl:
          m.displayBase === 'saved'
            ? getProcessSavedImageUrl(m.taskId, m.resultIndex)
            : undefined,
      });
    });
    const hydrated = await hydrateSavedVariants(list);
    setVariants(hydrated);
    setActiveResultIndex(Math.min(meta.activeIndex, Math.max(0, hydrated.length - 1)));
    return hydrated.length > 0;
  }, []);

  useEffect(() => () => stopPolling(), [stopPolling]);

  const resultImages = variants.map((v) =>
    v.displayBase === 'saved' && v.savedUrl ? v.savedUrl : v.originalUrl
  );

  const infographicItemsByVariant = variants.map((v) => v.infographicItems);

  return {
    queueStatus,
    setQueueStatus,
    variants,
    setVariants,
    updateVariant,
    resultImages,
    infographicItemsByVariant,
    activeResultIndex,
    setActiveResultIndex: setActiveResultIndexWrapped,
    resultSessionId,
    startPolling,
    stopPolling,
    resetResults,
    restoreWorkspaceFromMeta,
    persistWorkspaceMeta,
  };
}
