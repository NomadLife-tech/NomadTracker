import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

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

class SyncQueueService {
  private queue: SyncOperation[] = [];
  private isProcessing = false;
  private listeners: Set<(queue: SyncOperation[]) => void> = new Set();

  constructor() {
    this.loadQueue();
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
      if (state.isConnected && state.isInternetReachable) {
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

  // Add operation to queue
  async enqueue(operation: Omit<SyncOperation, 'id' | 'retryCount' | 'status'>) {
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

    // Try to process immediately if online
    const netInfo = await NetInfo.fetch();
    if (netInfo.isConnected && netInfo.isInternetReachable) {
      this.processQueue();
    }
  }

  // Process pending operations
  async processQueue() {
    if (this.isProcessing || this.queue.length === 0) return;

    this.isProcessing = true;
    console.log(`[SyncQueue] Processing ${this.queue.length} operations...`);

    const pendingOps = this.queue.filter((op) => op.status === 'pending');

    for (const operation of pendingOps) {
      try {
        operation.status = 'syncing';
        this.notifyListeners();

        await this.syncOperation(operation);

        // Remove successful operation
        this.queue = this.queue.filter((op) => op.id !== operation.id);
        console.log(`[SyncQueue] Successfully synced ${operation.type} ${operation.entity}`);
      } catch (error) {
        console.error(`[SyncQueue] Failed to sync operation:`, error);
        operation.retryCount++;

        if (operation.retryCount >= MAX_RETRIES) {
          operation.status = 'failed';
          console.warn(`[SyncQueue] Operation exceeded max retries, marked as failed`);
        } else {
          operation.status = 'pending';
        }
      }
    }

    await this.saveQueue();
    this.notifyListeners();
    this.isProcessing = false;
  }

  // Sync single operation to cloud (placeholder - implement with actual cloud service)
  private async syncOperation(operation: SyncOperation): Promise<void> {
    // TODO: Implement actual cloud sync when cloud backend is ready
    // For now, this is a placeholder that simulates successful sync
    // 
    // Example implementation with Firebase:
    // const db = getFirestore();
    // switch (operation.type) {
    //   case 'CREATE':
    //     await addDoc(collection(db, operation.entity), operation.data);
    //     break;
    //   case 'UPDATE':
    //     await updateDoc(doc(db, operation.entity, operation.data.id), operation.data);
    //     break;
    //   case 'DELETE':
    //     await deleteDoc(doc(db, operation.entity, operation.data.id));
    //     break;
    // }

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 100));
    
    console.log(`[SyncQueue] Would sync: ${operation.type} ${operation.entity}`, operation.data);
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

  // Subscribe to queue changes
  subscribe(listener: (queue: SyncOperation[]) => void): () => void {
    this.listeners.add(listener);
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
    this.processQueue();
  }

  // Clear all operations (for testing/reset)
  async clearAll() {
    this.queue = [];
    await this.saveQueue();
    this.notifyListeners();
  }
}

// Export singleton instance
export const syncQueue = new SyncQueueService();
