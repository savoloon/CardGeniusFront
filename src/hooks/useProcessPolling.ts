import { useState, useCallback, useRef, useEffect } from 'react';
import { getProcessStatus } from '../services/api';
import type { InfographicRecommendedItem } from '../components/dashboard/InfographicEditor';

const POLL_INTERVAL_MS = 2000;

export type QueueStatus = 'pending' | 'completed' | 'failed' | null;

export function useProcessPolling() {
  const [queueStatus, setQueueStatus] = useState<QueueStatus>(null);
  const [resultImages, setResultImages] = useState<string[]>([]);
  const [infographicItemsByVariant, setInfographicItemsByVariant] = useState<
    InfographicRecommendedItem[][]
  >([]);
  const [activeResultIndex, setActiveResultIndex] = useState(0);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  const resetResults = useCallback(() => {
    setQueueStatus(null);
    setResultImages([]);
    setInfographicItemsByVariant([]);
    setActiveResultIndex(0);
  }, []);

  const pollTask = useCallback(
    async (id: string) => {
      try {
        const res = await getProcessStatus(id);
        if (!res.success || !res.data) return;
        setQueueStatus(res.data.status);
        if (res.data.status === 'completed' && res.data.result?.images) {
          const imgs = res.data.result.images;
          const items = res.data.infographicItems ?? [];
          const itemCopy = items.length > 0 ? [...items] : [];
          setResultImages(imgs);
          setActiveResultIndex(0);
          setInfographicItemsByVariant(imgs.map(() => [...itemCopy]));
          stopPolling();
        }
        if (res.data.status === 'failed') {
          setResultImages([]);
          setInfographicItemsByVariant([]);
          setActiveResultIndex(0);
          stopPolling();
        }
      } catch {
        // Keep polling on transient network errors.
      }
    },
    [stopPolling]
  );

  const pollAllTasks = useCallback(
    async (ids: string[]) => {
      const responses = await Promise.all(
        ids.map((id) =>
          getProcessStatus(id).catch(() => null)
        )
      );

      let finished = 0;
      const allImages: string[] = [];
      const itemsMatrix: InfographicRecommendedItem[][] = [];

      for (const res of responses) {
        if (!res?.success || !res.data) continue;
        if (res.data.status === 'completed' && res.data.result?.images) {
          const imgs = res.data.result.images;
          const rawItems = res.data.infographicItems ?? [];
          const itemCopy = rawItems.length > 0 ? [...rawItems] : [];
          for (const _u of imgs) {
            allImages.push(_u);
            itemsMatrix.push([...itemCopy]);
          }
          finished += 1;
        } else if (res.data.status === 'failed') {
          finished += 1;
        }
      }

      if (finished === ids.length) {
        stopPolling();
        setQueueStatus(allImages.length > 0 ? 'completed' : 'failed');
        setResultImages(allImages);
        setActiveResultIndex(0);
        setInfographicItemsByVariant(allImages.map((_, i) => itemsMatrix[i] ?? []));
      }
    },
    [stopPolling]
  );

  const startPolling = useCallback(
    (taskIds: string[]) => {
      stopPolling();
      if (taskIds.length === 0) return;
      setQueueStatus('pending');
      if (taskIds.length === 1) {
        pollRef.current = setInterval(() => pollTask(taskIds[0]), POLL_INTERVAL_MS);
      } else {
        pollRef.current = setInterval(() => pollAllTasks(taskIds), POLL_INTERVAL_MS);
      }
    },
    [stopPolling, pollTask, pollAllTasks]
  );

  useEffect(() => () => stopPolling(), [stopPolling]);

  return {
    queueStatus,
    setQueueStatus,
    resultImages,
    infographicItemsByVariant,
    activeResultIndex,
    setActiveResultIndex,
    startPolling,
    stopPolling,
    resetResults,
  };
}
