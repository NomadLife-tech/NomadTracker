import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { syncBatch, SyncBatchResponse } from './api';

export type SyncOperation = {
  id: string;
  type: 'CREATE' | 'UPDATE' | 'DELETE';
  entity: 'visit' | 'profile' | 'passport' | 'insurance' | 'settings';
  data: any;
  timestamp: Date;
  retryCount: number;
  status: 'pending' | 'syncing' | 'failed' | 'completed';
};

const SYNC_QUEUE_KEY = 'nomad-sync-queue';
const MAX_RETRIES = 3;
const BATCH_SIZE = 10;

class SyncQueueService {
  private queue: SyncOperation[] = [];
  private isProcessing = false;
  private isEnabled = false;
  private listeners: Set<(queue: SyncOperation[]) => void> = new Set();
  private initialized = false;

  constructor() {
    // Defer initialization to avoid SSR issues
    if (typeof window !== 'undefined') {
      this.initialize();
    }
  }

  private async initialize() {
    if (this.initialized) return;
    this.initialized = true;
    
    await this.loadQueue();
    this.setupNetworkListener();
  }

  private async loadQueue() {
    try {
      const stored = await AsyncStorage.getItem(SYNC_QUEUE_KEY);
      if (stored) {
        this.queue = JSON.parse(stored).map((op: any) => ({
          ...op,
          timestamp: new Date(op.timestamp),
        }));
        this.notifyListeners();
      }
    } catch (error) {
      console.error('[SyncQueue] Failed to load queue:', error);
    }
  }

  private async saveQueue() {
    try {
      await AsyncStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(this.queue));
    } catch (error) {
      console.error('[SyncQueue] Failed to save queue:', error);
    }
  }

  private setupNetworkListener() {
    NetInfo.addEventListener((state) => {
      if (state.isConnected && state.isInternetReachable && this.isEnabled) {
        console.log('[SyncQueue] Network available, processing queue...');
        this.processQueue();
      }
    });
  }

  private notifyListeners() {
    this.listeners.forEach((listener) => listener([...this.queue]));
  }

  // Generate unique ID for operations
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // Enable/disable cloud sync
  setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
    console.log(`[SyncQueue] Cloud sync ${enabled ? 'enabled' : 'disabled'}`);
    
    if (enabled) {
      // Initialize if not already done
      this.initialize();
      // Try to process queue when enabled
      this.processQueue();
    }
  }

  isCloudSyncEnabled(): boolean {
    return this.isEnabled;
  }

  // Add operation to queue
  async enqueue(operation: Omit<SyncOperation, 'id' | 'retryCount' | 'status'>) {
    // Initialize if needed
    if (!this.initialized && typeof window !== 'undefined') {
      await this.initialize();
    }

    const newOperation: SyncOperation = {
      ...operation,
      id: this.generateId(),
      retryCount: 0,
      status: 'pending',
    };

    this.queue.push(newOperation);
    await this.saveQueue();
    this.notifyListeners();

    console.log(`[SyncQueue] Enqueued ${operation.type} ${operation.entity}`);

    // Try to process immediately if online and enabled
    if (this.isEnabled) {
      const netInfo = await NetInfo.fetch();
      if (netInfo.isConnected && netInfo.isInternetReachable) {
        this.processQueue();
      }
    }

    return newOperation.id;
  }

  // Process pending operations
  async processQueue(): Promise<{ processed: number; failed: number }> {
    if (!this.isEnabled) {
      console.log('[SyncQueue] Cloud sync is disabled, skipping queue processing');
      return { processed: 0, failed: 0 };
    }

    if (this.isProcessing) {
      console.log('[SyncQueue] Already processing, skipping');
      return { processed: 0, failed: 0 };
    }

    const pendingOps = this.queue.filter((op) => op.status === 'pending');
    if (pendingOps.length === 0) {
      console.log('[SyncQueue] No pending operations');
      return { processed: 0, failed: 0 };
    }

    this.isProcessing = true;
    console.log(`[SyncQueue] Processing ${pendingOps.length} pending operations...`);

    let totalProcessed = 0;
    let totalFailed = 0;

    // Process in batches
    for (let i = 0; i < pendingOps.length; i += BATCH_SIZE) {
      const batch = pendingOps.slice(i, i + BATCH_SIZE);
      
      // Mark batch as syncing
      batch.forEach((op) => {
        op.status = 'syncing';
      });
      this.notifyListeners();

      try {
        // Send batch to server
        const response = await syncBatch(batch);

        if (response) {
          // Process response
          const { processedCount, failedIds } = response;

          batch.forEach((op) => {
            if (failedIds.includes(op.id)) {
              // Mark as failed or pending for retry
              op.retryCount++;
              if (op.retryCount >= MAX_RETRIES) {
                op.status = 'failed';
                totalFailed++;
                console.warn(`[SyncQueue] Operation ${op.id} exceeded max retries`);
              } else {
                op.status = 'pending';
              }
            } else {
              // Remove successful operations
              this.queue = this.queue.filter((q) => q.id !== op.id);
              totalProcessed++;
            }
          });

          console.log(`[SyncQueue] Batch processed: ${processedCount} success, ${failedIds.length} failed`);
        } else {
          // Network error - keep as pending
          batch.forEach((op) => {
            op.status = 'pending';
          });
          console.warn('[SyncQueue] Batch sync failed, will retry later');
          break; // Stop processing if network is down
        }
      } catch (error) {
        console.error('[SyncQueue] Batch processing error:', error);
        batch.forEach((op) => {
          op.status = 'pending';
        });
        break;
      }
    }

    await this.saveQueue();
    this.notifyListeners();
    this.isProcessing = false;

    console.log(`[SyncQueue] Queue processing complete: ${totalProcessed} processed, ${totalFailed} failed`);
    return { processed: totalProcessed, failed: totalFailed };
  }

  // Get current queue state
  getQueue(): SyncOperation[] {
    return [...this.queue];
  }

  // Get pending count
  getPendingCount(): number {
    return this.queue.filter((op) => op.status === 'pending').length;
  }

  // Get failed count
  getFailedCount(): number {
    return this.queue.filter((op) => op.status === 'failed').length;
  }

  // Get syncing count
  getSyncingCount(): number {
    return this.queue.filter((op) => op.status === 'syncing').length;
  }

  // Subscribe to queue changes
  subscribe(listener: (queue: SyncOperation[]) => void): () => void {
    this.listeners.add(listener);
    // Immediately call with current state
    listener([...this.queue]);
    return () => this.listeners.delete(listener);
  }

  // Clear failed operations
  async clearFailed() {
    this.queue = this.queue.filter((op) => op.status !== 'failed');
    await this.saveQueue();
    this.notifyListeners();
  }

  // Retry failed operations
  async retryFailed() {
    this.queue.forEach((op) => {
      if (op.status === 'failed') {
        op.status = 'pending';
        op.retryCount = 0;
      }
    });
    await this.saveQueue();
    this.notifyListeners();
    return this.processQueue();
  }

  // Clear all operations (for testing/reset)
  async clearAll() {
    this.queue = [];
    await this.saveQueue();
    this.notifyListeners();
  }

  // Get status summary
  getStatus(): {
    enabled: boolean;
    isProcessing: boolean;
    pending: number;
    failed: number;
    syncing: number;
    total: number;
  } {
    return {
      enabled: this.isEnabled,
      isProcessing: this.isProcessing,
      pending: this.getPendingCount(),
      failed: this.getFailedCount(),
      syncing: this.getSyncingCount(),
      total: this.queue.length,
    };
  }
}

// Export singleton instance
export const syncQueue = new SyncQueueService();
