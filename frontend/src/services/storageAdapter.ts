import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const APP_PREFIX = '@nomad_';

// In-memory storage fallback for when localStorage is blocked (iframe contexts)
const memoryStorage = new Map<string, string>();
let useMemoryFallback = false;
let localStorageChecked = false;

// Check if localStorage is available (blocked in some iframe contexts)
const checkLocalStorageAvailability = (): boolean => {
  if (localStorageChecked) {
    return !useMemoryFallback;
  }
  
  try {
    const testKey = '__storage_test__';
    localStorage.setItem(testKey, testKey);
    localStorage.removeItem(testKey);
    localStorageChecked = true;
    useMemoryFallback = false;
    console.log('[Storage] localStorage is available');
    return true;
  } catch (e) {
    console.warn('[Storage] localStorage is NOT available (likely iframe sandbox restriction). Using in-memory fallback.');
    console.warn('[Storage] Data will NOT persist between sessions in this preview mode.');
    localStorageChecked = true;
    useMemoryFallback = true;
    return false;
  }
};

// Web storage implementation with in-memory fallback
const webStorage = {
  getItem: async (key: string): Promise<string | null> => {
    try {
      if (!checkLocalStorageAvailability()) {
        return memoryStorage.get(key) || null;
      }
      return localStorage.getItem(key);
    } catch (e) {
      console.error('[Storage] webStorage getItem error:', e);
      // Fallback to memory
      return memoryStorage.get(key) || null;
    }
  },
  
  setItem: async (key: string, value: string): Promise<void> => {
    try {
      if (!checkLocalStorageAvailability()) {
        memoryStorage.set(key, value);
        console.log(`[Storage] Saved to memory (key: ${key.substring(0, 30)}...)`);
        return;
      }
      localStorage.setItem(key, value);
    } catch (e) {
      console.error('[Storage] webStorage setItem error:', e);
      // Try memory fallback instead of throwing
      memoryStorage.set(key, value);
      useMemoryFallback = true;
      console.warn('[Storage] Fell back to in-memory storage due to error');
    }
  },
  
  removeItem: async (key: string): Promise<void> => {
    try {
      if (!checkLocalStorageAvailability()) {
        memoryStorage.delete(key);
        return;
      }
      localStorage.removeItem(key);
      memoryStorage.delete(key); // Also remove from memory if it was there
    } catch (e) {
      console.error('[Storage] webStorage removeItem error:', e);
      memoryStorage.delete(key);
    }
  },
  
  multiRemove: async (keys: string[]): Promise<void> => {
    try {
      if (!checkLocalStorageAvailability()) {
        keys.forEach(k => memoryStorage.delete(k));
        return;
      }
      keys.forEach(k => {
        localStorage.removeItem(k);
        memoryStorage.delete(k);
      });
    } catch (e) {
      console.error('[Storage] webStorage multiRemove error:', e);
      keys.forEach(k => memoryStorage.delete(k));
    }
  },
  
  clear: async (): Promise<void> => {
    try {
      // Clear memory storage
      const memoryKeys = Array.from(memoryStorage.keys()).filter(k => k.startsWith(APP_PREFIX));
      memoryKeys.forEach(k => memoryStorage.delete(k));
      
      if (!checkLocalStorageAvailability()) {
        return;
      }
      
      // Clear localStorage
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(APP_PREFIX)) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(k => localStorage.removeItem(k));
    } catch (e) {
      console.error('[Storage] webStorage clear error:', e);
    }
  },
  
  getAllKeys: async (): Promise<string[]> => {
    try {
      const keys: string[] = [];
      
      // Get keys from memory storage
      memoryStorage.forEach((_, k) => {
        if (k.startsWith(APP_PREFIX) && !keys.includes(k)) {
          keys.push(k);
        }
      });
      
      if (!checkLocalStorageAvailability()) {
        return keys;
      }
      
      // Get keys from localStorage
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(APP_PREFIX) && !keys.includes(key)) {
          keys.push(key);
        }
      }
      return keys;
    } catch (e) {
      console.error('[Storage] webStorage getAllKeys error:', e);
      // Return memory keys as fallback
      return Array.from(memoryStorage.keys()).filter(k => k.startsWith(APP_PREFIX));
    }
  },
  
  // Helper to check if we're using fallback storage
  isUsingFallback: (): boolean => {
    checkLocalStorageAvailability();
    return useMemoryFallback;
  },
};

// Native storage implementation using AsyncStorage
const nativeStorage = {
  getItem: async (key: string): Promise<string | null> => {
    try {
      const value = await AsyncStorage.getItem(key);
      return value;
    } catch (e) {
      console.error('[Storage] nativeStorage getItem error:', e);
      return null;
    }
  },
  
  setItem: async (key: string, value: string): Promise<void> => {
    try {
      console.log(`[Storage] nativeStorage setItem called - key: ${key}, size: ${value.length} bytes`);
      await AsyncStorage.setItem(key, value);
      console.log(`[Storage] nativeStorage setItem SUCCESS - key: ${key}`);
    } catch (e: any) {
      console.error('[Storage] nativeStorage setItem FAILED:', {
        key,
        valueSize: value.length,
        errorName: e?.name,
        errorMessage: e?.message,
        error: e
      });
      throw e; // Re-throw so caller can handle the error properly
    }
  },
  
  removeItem: async (key: string): Promise<void> => {
    try {
      await AsyncStorage.removeItem(key);
    } catch (e) {
      console.error('[Storage] nativeStorage removeItem error:', e);
      throw e;
    }
  },
  
  multiRemove: async (keys: string[]): Promise<void> => {
    try {
      await AsyncStorage.multiRemove(keys);
    } catch (e) {
      console.error('[Storage] nativeStorage multiRemove error:', e);
      throw e;
    }
  },
  
  clear: async (): Promise<void> => {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const appKeys = keys.filter(k => k.startsWith(APP_PREFIX));
      await AsyncStorage.multiRemove(appKeys);
    } catch (e) {
      console.error('[Storage] nativeStorage clear error:', e);
      throw e;
    }
  },
  
  getAllKeys: async (): Promise<string[]> => {
    try {
      const keys = await AsyncStorage.getAllKeys();
      return keys.filter(k => k.startsWith(APP_PREFIX));
    } catch (e) {
      console.error('[Storage] nativeStorage getAllKeys error:', e);
      return [];
    }
  },
  
  isUsingFallback: (): boolean => false,
};

export const universalStorage = Platform.OS === 'web' ? webStorage : nativeStorage;
