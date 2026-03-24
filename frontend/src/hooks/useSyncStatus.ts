import { useState, useEffect } from 'react';
import { syncQueue, SyncOperation } from '../services/syncQueue';

export function useSyncStatus() {
  const [queue, setQueue] = useState<SyncOperation[]>([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [failedCount, setFailedCount] = useState(0);

  useEffect(() => {
    // Initial load
    setQueue(syncQueue.getQueue());
    setPendingCount(syncQueue.getPendingCount());
    setFailedCount(syncQueue.getFailedCount());

    // Subscribe to changes
    const unsubscribe = syncQueue.subscribe((newQueue) => {
      setQueue(newQueue);
      setPendingCount(newQueue.filter((op) => op.status === 'pending').length);
      setFailedCount(newQueue.filter((op) => op.status === 'failed').length);
    });

    return unsubscribe;
  }, []);

  return {
    queue,
    pendingCount,
    failedCount,
    isSyncing: queue.some((op) => op.status === 'syncing'),
    hasPending: pendingCount > 0,
    hasFailed: failedCount > 0,
    retryFailed: () => syncQueue.retryFailed(),
    clearFailed: () => syncQueue.clearFailed(),
  };
}
