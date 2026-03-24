import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const APP_PREFIX = '@nomad_';

// Web storage implementation using localStorage
const webStorage = {
  getItem: async (key: string): Promise<string | null> => {
    try {
      return localStorage.getItem(key);
    } catch (e) {
      console.error('webStorage getItem error:', e);
      return null;
    }
  },
  setItem: async (key: string, value: string): Promise<void> => {
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      console.error('webStorage setItem error:', e);
      throw e; // Re-throw so caller can handle the error
    }
  },
  removeItem: async (key: string): Promise<void> => {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.error('webStorage removeItem error:', e);
      throw e; // Re-throw so caller can handle the error
    }
  },
  multiRemove: async (keys: string[]): Promise<void> => {
    try {
      keys.forEach(k => localStorage.removeItem(k));
    } catch (e) {
      console.error('webStorage multiRemove error:', e);
      throw e; // Re-throw so caller can handle the error
    }
  },
  clear: async (): Promise<void> => {
    try {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(APP_PREFIX)) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(k => localStorage.removeItem(k));
    } catch (e) {
      console.error('webStorage clear error:', e);
      throw e; // Re-throw so caller can handle the error
    }
  },
  getAllKeys: async (): Promise<string[]> => {
    try {
      const keys: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(APP_PREFIX)) {
          keys.push(key);
        }
      }
      return keys;
    } catch (e) {
      console.error('webStorage getAllKeys error:', e);
      return [];
    }
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
      await AsyncStorage.setItem(key, value);
    } catch (e) {
      console.error('[Storage] nativeStorage setItem error:', e);
      throw e; // Re-throw so caller can handle the error properly
    }
  },
  removeItem: async (key: string): Promise<void> => {
    try {
      await AsyncStorage.removeItem(key);
    } catch (e) {
      console.error('nativeStorage removeItem error:', e);
      throw e; // Re-throw so caller can handle the error
    }
  },
  multiRemove: async (keys: string[]): Promise<void> => {
    try {
      await AsyncStorage.multiRemove(keys);
    } catch (e) {
      console.error('nativeStorage multiRemove error:', e);
      throw e; // Re-throw so caller can handle the error
    }
  },
  clear: async (): Promise<void> => {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const appKeys = keys.filter(k => k.startsWith(APP_PREFIX));
      await AsyncStorage.multiRemove(appKeys);
    } catch (e) {
      console.error('nativeStorage clear error:', e);
      throw e; // Re-throw so caller can handle the error
    }
  },
  getAllKeys: async (): Promise<string[]> => {
    try {
      const keys = await AsyncStorage.getAllKeys();
      return keys.filter(k => k.startsWith(APP_PREFIX));
    } catch (e) {
      console.error('nativeStorage getAllKeys error:', e);
      return [];
    }
  },
};

export const universalStorage = Platform.OS === 'web' ? webStorage : nativeStorage;
