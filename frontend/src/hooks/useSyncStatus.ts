import { useState, useEffect, useCallback } from 'react';
import { syncQueue, SyncOperation } from '../services/syncQueue';

export interface SyncStatus {
  enabled: boolean;
  isProcessing: boolean;
  pending: number;
  failed: number;
  syncing: number;
  total: number;
  queue: SyncOperation[];
}

export function useSyncStatus() {
  const [status, setStatus] = useState<SyncStatus>({
    enabled: false,
    isProcessing: false,
    pending: 0,
    failed: 0,
    syncing: 0,
    total: 0,
    queue: [],
  });

  useEffect(() => {
    // Subscribe to queue changes
    const unsubscribe = syncQueue.subscribe((queue) => {
      const queueStatus = syncQueue.getStatus();
      setStatus({
        ...queueStatus,
        queue,
      });
    });

    // Get initial status
    const initialStatus = syncQueue.getStatus();
    setStatus({
      ...initialStatus,
      queue: syncQueue.getQueue(),
    });

    return unsubscribe;
  }, []);

  const retryFailed = useCallback(async () => {
    return syncQueue.retryFailed();
  }, []);

  const clearFailed = useCallback(async () => {
    return syncQueue.clearFailed();
  }, []);

  const clearAll = useCallback(async () => {
    return syncQueue.clearAll();
  }, []);

  const processQueue = useCallback(async () => {
    return syncQueue.processQueue();
  }, []);

  const setEnabled = useCallback((enabled: boolean) => {
    syncQueue.setEnabled(enabled);
  }, []);

  return {
    ...status,
    retryFailed,
    clearFailed,
    clearAll,
    processQueue,
    setEnabled,
  };
}
