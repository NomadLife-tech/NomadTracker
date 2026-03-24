import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { Visit, UserProfile, AppSettings } from '../types';

// Get the backend URL from environment
const getBackendUrl = (): string => {
  // For Expo, use the environment variable
  const backendUrl = Constants.expoConfig?.extra?.backendUrl || 
                     process.env.EXPO_PUBLIC_BACKEND_URL ||
                     '';
  return backendUrl;
};

const DEVICE_ID_KEY = 'nomad-device-id';

// Generate or retrieve device ID
async function getDeviceId(): Promise<string> {
  try {
    let deviceId = await AsyncStorage.getItem(DEVICE_ID_KEY);
    if (!deviceId) {
      deviceId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      await AsyncStorage.setItem(DEVICE_ID_KEY, deviceId);
    }
    return deviceId;
  } catch (error) {
    console.error('[API] Failed to get device ID:', error);
    return `temp_${Date.now()}`;
  }
}

// Check network connectivity
async function isOnline(): Promise<boolean> {
  try {
    const netInfo = await NetInfo.fetch();
    return netInfo.isConnected === true && netInfo.isInternetReachable === true;
  } catch {
    return false;
  }
}

// Generic API request handler
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ data: T | null; error: string | null }> {
  const baseUrl = getBackendUrl();
  
  if (!baseUrl) {
    console.warn('[API] No backend URL configured');
    return { data: null, error: 'Backend URL not configured' };
  }

  if (!(await isOnline())) {
    return { data: null, error: 'No internet connection' };
  }

  try {
    const url = `${baseUrl}/api${endpoint}`;
    console.log(`[API] ${options.method || 'GET'} ${url}`);
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[API] Error ${response.status}: ${errorText}`);
      return { data: null, error: `HTTP ${response.status}: ${errorText}` };
    }

    const data = await response.json();
    return { data, error: null };
  } catch (error) {
    console.error('[API] Request failed:', error);
    return { data: null, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// SYNC API
// ═══════════════════════════════════════════════════════════════════════════

export interface SyncOperation {
  id: string;
  type: 'CREATE' | 'UPDATE' | 'DELETE';
  entity: 'visit' | 'profile' | 'passport' | 'insurance' | 'settings';
  data: any;
  timestamp: Date;
  retryCount: number;
  status: 'pending' | 'syncing' | 'failed' | 'completed';
}

export interface SyncBatchResponse {
  success: boolean;
  processedCount: number;
  failedIds: string[];
  serverTimestamp: string;
}

export interface UserDataResponse {
  visits: Visit[];
  profile: UserProfile | null;
  settings: AppSettings | null;
  lastSyncTimestamp: string;
}

/**
 * Sync a batch of operations to the cloud
 */
export async function syncBatch(operations: SyncOperation[]): Promise<SyncBatchResponse | null> {
  const deviceId = await getDeviceId();
  
  const { data, error } = await apiRequest<SyncBatchResponse>('/sync', {
    method: 'POST',
    body: JSON.stringify({
      deviceId,
      operations: operations.map(op => ({
        ...op,
        timestamp: op.timestamp.toISOString(),
      })),
    }),
  });

  if (error) {
    console.error('[API] Sync batch failed:', error);
    return null;
  }

  return data;
}

/**
 * Get all synced data from the cloud
 */
export async function getSyncedData(): Promise<UserDataResponse | null> {
  const deviceId = await getDeviceId();
  
  const { data, error } = await apiRequest<UserDataResponse>(`/sync/${deviceId}`);

  if (error) {
    console.error('[API] Get synced data failed:', error);
    return null;
  }

  return data;
}

/**
 * Clear all synced data from the cloud (for testing/reset)
 */
export async function clearSyncedData(): Promise<boolean> {
  const deviceId = await getDeviceId();
  
  const { data, error } = await apiRequest<{ success: boolean }>(`/sync/${deviceId}`, {
    method: 'DELETE',
  });

  if (error) {
    console.error('[API] Clear synced data failed:', error);
    return false;
  }

  return data?.success ?? false;
}

// ═══════════════════════════════════════════════════════════════════════════
// VISIT API (Direct operations)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Create a visit in the cloud
 */
export async function createVisitRemote(visit: Visit): Promise<boolean> {
  const deviceId = await getDeviceId();
  
  const { error } = await apiRequest(`/visits/${deviceId}`, {
    method: 'POST',
    body: JSON.stringify(visit),
  });

  return !error;
}

/**
 * Update a visit in the cloud
 */
export async function updateVisitRemote(visit: Visit): Promise<boolean> {
  const deviceId = await getDeviceId();
  
  const { error } = await apiRequest(`/visits/${deviceId}/${visit.id}`, {
    method: 'PUT',
    body: JSON.stringify(visit),
  });

  return !error;
}

/**
 * Delete a visit from the cloud
 */
export async function deleteVisitRemote(visitId: string): Promise<boolean> {
  const deviceId = await getDeviceId();
  
  const { error } = await apiRequest(`/visits/${deviceId}/${visitId}`, {
    method: 'DELETE',
  });

  return !error;
}

/**
 * Get all visits from the cloud
 */
export async function getVisitsRemote(): Promise<Visit[] | null> {
  const deviceId = await getDeviceId();
  
  const { data, error } = await apiRequest<{ visits: Visit[] }>(`/visits/${deviceId}`);

  if (error) {
    console.error('[API] Get visits failed:', error);
    return null;
  }

  return data?.visits ?? null;
}

// ═══════════════════════════════════════════════════════════════════════════
// HEALTH CHECK
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Check if the backend is healthy
 */
export async function healthCheck(): Promise<{ healthy: boolean; database: string }> {
  const { data, error } = await apiRequest<{ status: string; database: string }>('/health');

  if (error || !data) {
    return { healthy: false, database: 'unknown' };
  }

  return {
    healthy: data.status === 'healthy',
    database: data.database,
  };
}

// Export device ID getter for other services
export { getDeviceId };
