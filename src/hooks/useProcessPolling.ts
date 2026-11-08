import { useState, useCallback, useRef, useEffect } from 'react';
import {
  getProcessStatus,
  getMultiProcessStatus,
  getProcessResultImageUrl,
  getProcessSavedImageUrl,
  getVariantSave,
} from '../services/api';
import type { InfographicSlideApi, ProcessStatusData } from '../services/api';
import { itemsForImage } from '../lib/infographicSlides';
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

export interface CardTexts {
  titles: string[];
  descriptions: string[];
}

function buildVariantsFromTask(
  taskId: string,
  imageUrls: string[],
  items: InfographicRecommendedItem[],
  slides?: InfographicSlideApi[]
): ProcessVariant[] {
  return imageUrls.map((originalUrl, i) =>
    buildProcessVariant({
      taskId,
      resultIndex: i,
      originalUrl,
      infographicItems: itemsForImage(i, slides, items),
      scenePrompt: slides?.[i]?.imagePrompt,
    })
  );
}

function variantsFromStatus(task: ProcessStatusData): ProcessVariant[] {
  const images = task.result?.images ?? [];
  if (images.length === 0) return [];
  return buildVariantsFromTask(
    task.taskId,
    images,
    task.infographicItems ?? [],
    task.infographicSlides
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
  const [cardTexts, setCardTexts] = useState<CardTexts>({ titles: [], descriptions: [] });
  const [activeResultIndex, setActiveResultIndex] = useState(0);
  const [resultSessionId, setResultSessionId] = useState<string | null>(null);
  const taskIdsRef = useRef<string[]>([]);
  const textTaskIdsRef = useRef<string[]>([]);
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
        textTaskIds: textTaskIdsRef.current,
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
    setCardTexts({ titles: [], descriptions: [] });
    setActiveResultIndex(0);
    setResultSessionId(null);
    taskIdsRef.current = [];
    textTaskIdsRef.current = [];
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
          const list = variantsFromStatus(res.data);
          if (res.data.titles?.length || res.data.descriptions?.length) {
            setCardTexts({
              titles: res.data.titles ?? [],
              descriptions: res.data.descriptions ?? [],
            });
          }
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
      let tasks: ProcessStatusData[] = [];
      try {
        const res = await getMultiProcessStatus(ids);
        if (!res.success || !res.data?.tasks?.length) return;
        tasks = res.data.tasks;
      } catch {
        return;
      }

      let finished = 0;
      const allVariants: ProcessVariant[] = [];
      const titles: string[] = [];
      const descriptions: string[] = [];

      for (const task of tasks) {
        const status = normalizeQueueStatus(task.status);
        if (status === 'completed' || status === 'failed') finished += 1;
        if (status === 'completed') {
          allVariants.push(...variantsFromStatus(task));
          if (task.titles?.length) titles.push(...task.titles);
          if (task.descriptions?.length) descriptions.push(...task.descriptions);
        }
      }

      if (finished === tasks.length) {
        stopPolling();
        textTaskIdsRef.current = tasks
          .filter((task) => (task.titles?.length ?? 0) > 0 || (task.descriptions?.length ?? 0) > 0)
          .map((task) => task.taskId);
        setCardTexts({ titles, descriptions });
        const hasTexts = titles.length > 0 || descriptions.length > 0;
        setQueueStatus(allVariants.length > 0 || hasTexts ? 'completed' : 'failed');
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
      {
        images: string[];
        infographicItems: InfographicRecommendedItem[];
        infographicSlides?: InfographicSlideApi[];
      }
    >();
    const uniqueTaskIds = [...new Set(meta.variants.map((m) => m.taskId))];
    const textTaskIds = meta.textTaskIds ?? [];
    const titles: string[] = [];
    const descriptions: string[] = [];
    await Promise.all(
      [...new Set([...uniqueTaskIds, ...textTaskIds])].map(async (taskId) => {
        try {
          const statusRes = await getProcessStatus(taskId);
          if (!statusRes.success || !statusRes.data) return;
          if (statusRes.data.result?.images) {
            statusByTask.set(taskId, {
              images: statusRes.data.result.images,
              infographicItems: statusRes.data.infographicItems ?? [],
              infographicSlides: statusRes.data.infographicSlides,
            });
          }
          if (statusRes.data.titles?.length) titles.push(...statusRes.data.titles);
          if (statusRes.data.descriptions?.length) descriptions.push(...statusRes.data.descriptions);
        } catch {
          /* ignore */
        }
      })
    );
    if (titles.length > 0 || descriptions.length > 0) {
      setCardTexts({ titles, descriptions });
    }

    const list: ProcessVariant[] = meta.variants.map((m) => {
      const status = statusByTask.get(m.taskId);
      const originalUrl =
        status?.images[m.resultIndex] ?? getProcessResultImageUrl(m.taskId, m.resultIndex);
      return buildProcessVariant({
        taskId: m.taskId,
        resultIndex: m.resultIndex,
        originalUrl,
        infographicItems: itemsForImage(
          m.resultIndex,
          status?.infographicSlides,
          status?.infographicItems
        ),
        scenePrompt: status?.infographicSlides?.[m.resultIndex]?.imagePrompt,
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
    cardTexts,
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
