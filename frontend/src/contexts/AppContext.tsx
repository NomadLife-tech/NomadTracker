import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Platform } from 'react-native';
import { Visit, UserProfile, AppSettings, SupportedLanguage } from '../types';
import * as storage from '../services/storage';
import { getTranslation } from '../constants/translations';
import { 
  requestNotificationPermissions, 
  scheduleVisaNotifications 
} from '../services/notificationService';
import { syncQueue } from '../services/syncQueue';

interface AppContextType {
  // Data
  visits: Visit[];
  profile: UserProfile;
  settings: AppSettings;
  isLoading: boolean;
  
  // Visit operations
  addVisit: (visit: Visit) => Promise<void>;
  updateVisit: (visit: Visit) => Promise<void>;
  deleteVisit: (visitId: string) => Promise<void>;
  refreshVisits: () => Promise<void>;
  
  // Profile operations
  updateProfile: (profile: UserProfile) => Promise<void>;
  refreshProfile: () => Promise<void>;
  
  // Settings operations
  updateSettings: (settings: AppSettings) => Promise<void>;
  setDarkMode: (darkMode: boolean) => Promise<void>;
  setLanguage: (language: SupportedLanguage) => Promise<void>;
  
  // i18n
  t: (key: string, params?: Record<string, string>) => string;
  
  // Data management
  refreshAll: () => Promise<void>;
  clearAllData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [visits, setVisits] = useState<Visit[]>([]);
  const [profile, setProfile] = useState<UserProfile>({
    id: '1',
    firstName: '',
    lastName: '',
    avatar: '🌍',
    avatarType: 'preset',
    passports: [],
    insurances: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  const [settings, setSettings] = useState<AppSettings>({
    darkMode: false,
    language: 'en',
    visaAlertsEnabled: true,
    visaAlertDays: [30, 15, 7],
    customAlertDays: 0,
    alertFrequency: 'daily',
    cloudSaveEnabled: false,
  });
  const [isLoading, setIsLoading] = useState(true);

  // Initialize data
  useEffect(() => {
    const init = async () => {
      try {
        await storage.initializeStorage();
        const [loadedVisits, loadedProfile, loadedSettings] = await Promise.all([
          storage.getVisits(),
          storage.getProfile(),
          storage.getSettings(),
        ]);
        setVisits(loadedVisits);
        setProfile(loadedProfile);
        setSettings(loadedSettings);
        
        // Initialize notifications on native platforms
        if (Platform.OS !== 'web') {
          try {
            const permissionGranted = await requestNotificationPermissions();
            if (permissionGranted && loadedSettings.visaAlertsEnabled) {
              await scheduleVisaNotifications(loadedVisits, loadedSettings);
              console.log('[Notifications] Visa alerts scheduled on app init');
            }
          } catch (notifError) {
            console.warn('[Notifications] Failed to initialize:', notifError);
          }
        }
      } catch (error) {
        console.error('Failed to initialize app data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    init();
  }, []);

  // Visit operations
  const addVisit = useCallback(async (visit: Visit) => {
    console.log('[AppContext] addVisit called with visit:', visit.countryName);
    try {
      console.log('[AppContext] Calling storage.addVisit...');
      const updatedVisits = await storage.addVisit(visit);
      console.log('[AppContext] storage.addVisit succeeded, visits count:', updatedVisits.length);
      setVisits(updatedVisits);
      
      // Enqueue sync operation if cloud sync is enabled
      if (settings.cloudSaveEnabled) {
        try {
          await syncQueue.enqueue({
            type: 'CREATE',
            entity: 'visit',
            data: visit,
            timestamp: new Date(),
          });
        } catch (err) {
          console.warn('[Sync] Failed to enqueue:', err);
        }
      }
      
      // Reschedule notifications when visits change
      if (Platform.OS !== 'web' && settings.visaAlertsEnabled) {
        try {
          await scheduleVisaNotifications(updatedVisits, settings);
          console.log('[Notifications] Rescheduled after adding visit');
        } catch (error) {
          console.warn('[Notifications] Failed to reschedule:', error);
        }
      }
      console.log('[AppContext] addVisit completed successfully');
    } catch (error) {
      console.error('[AppContext] Failed to add visit:', error);
      throw error;
    }
  }, [settings]);

  const updateVisit = useCallback(async (visit: Visit) => {
    try {
      const updatedVisits = await storage.updateVisit(visit);
      setVisits(updatedVisits);
      
      // Enqueue sync operation if cloud sync is enabled
      if (settings.cloudSaveEnabled) {
        try {
          await syncQueue.enqueue({
            type: 'UPDATE',
            entity: 'visit',
            data: visit,
            timestamp: new Date(),
          });
        } catch (err) {
          console.warn('[Sync] Failed to enqueue:', err);
        }
      }
      
      // Reschedule notifications when visits change
      if (Platform.OS !== 'web' && settings.visaAlertsEnabled) {
        try {
          await scheduleVisaNotifications(updatedVisits, settings);
          console.log('[Notifications] Rescheduled after updating visit');
        } catch (error) {
          console.warn('[Notifications] Failed to reschedule:', error);
        }
      }
    } catch (error) {
      console.error('[AppContext] Failed to update visit:', error);
      throw error;
    }
  }, [settings]);

  const deleteVisit = useCallback(async (visitId: string) => {
    try {
      const updatedVisits = await storage.deleteVisit(visitId);
      setVisits(updatedVisits);
      
      // Enqueue sync operation if cloud sync is enabled
      if (settings.cloudSaveEnabled) {
        try {
          await syncQueue.enqueue({
            type: 'DELETE',
            entity: 'visit',
            data: { id: visitId },
            timestamp: new Date(),
          });
        } catch (err) {
          console.warn('[Sync] Failed to enqueue:', err);
        }
      }
      
      // Reschedule notifications when visits change
      if (Platform.OS !== 'web' && settings.visaAlertsEnabled) {
        try {
          await scheduleVisaNotifications(updatedVisits, settings);
          console.log('[Notifications] Rescheduled after deleting visit');
        } catch (error) {
          console.warn('[Notifications] Failed to reschedule:', error);
        }
      }
    } catch (error) {
      console.error('[AppContext] Failed to delete visit:', error);
      throw error;
    }
  }, [settings]);

  const refreshVisits = useCallback(async () => {
    const loadedVisits = await storage.getVisits();
    setVisits(loadedVisits);
  }, []);

  // Profile operations
  const updateProfile = useCallback(async (newProfile: UserProfile) => {
    try {
      await storage.saveProfile(newProfile);
      setProfile(newProfile);
    } catch (error) {
      console.error('[AppContext] Failed to update profile:', error);
      throw error;
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    const loadedProfile = await storage.getProfile();
    setProfile(loadedProfile);
  }, []);

  // Settings operations
  const updateSettings = useCallback(async (newSettings: AppSettings) => {
    await storage.saveSettings(newSettings);
    setSettings(newSettings);
    
    // Enable/disable sync queue based on cloud sync setting
    syncQueue.setEnabled(newSettings.cloudSaveEnabled);
    
    // Reschedule notifications when settings change
    if (Platform.OS !== 'web') {
      try {
        await scheduleVisaNotifications(visits, newSettings);
        console.log('[Notifications] Rescheduled after settings update');
      } catch (error) {
        console.warn('[Notifications] Failed to reschedule:', error);
      }
    }
  }, [visits]);

  const setDarkMode = useCallback(async (darkMode: boolean) => {
    setSettings(prevSettings => {
      const newSettings = { ...prevSettings, darkMode };
      storage.saveSettings(newSettings);
      return newSettings;
    });
  }, []);

  const setLanguage = useCallback(async (language: SupportedLanguage) => {
    setSettings(prevSettings => {
      const newSettings = { ...prevSettings, language };
      storage.saveSettings(newSettings);
      return newSettings;
    });
  }, []);

  // i18n
  const t = useCallback((key: string, params?: Record<string, string>) => {
    let text = getTranslation(settings.language, key);
    if (params) {
      Object.entries(params).forEach(([paramKey, paramValue]) => {
        text = text.replace(`{{${paramKey}}}`, paramValue);
      });
    }
    return text;
  }, [settings.language]);

  // Data management
  const refreshAll = useCallback(async () => {
    setIsLoading(true);
    try {
      const [loadedVisits, loadedProfile, loadedSettings] = await Promise.all([
        storage.getVisits(),
        storage.getProfile(),
        storage.getSettings(),
      ]);
      setVisits(loadedVisits);
      setProfile(loadedProfile);
      setSettings(loadedSettings);
    } catch (error) {
      console.error('Failed to refresh data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Clear all data
  const clearAllData = useCallback(async () => {
    console.log('[AppContext] clearAllData called');
    setIsLoading(true);
    try {
      // Clear storage and reinitialize with defaults
      console.log('[AppContext] Calling storage.clearAllData()...');
      await storage.clearAllData();
      console.log('[AppContext] storage.clearAllData() completed');
      
      // Reload fresh data from storage (which now has defaults)
      console.log('[AppContext] Reloading fresh data from storage...');
      const [freshVisits, freshProfile, freshSettings] = await Promise.all([
        storage.getVisits(),
        storage.getProfile(),
        storage.getSettings(),
      ]);
      
      console.log('[AppContext] Fresh data loaded:', {
        visitsCount: freshVisits.length,
        profilePassports: freshProfile.passports?.length || 0,
        profileInsurances: freshProfile.insurances?.length || 0,
      });
      
      // Update state with fresh data from storage
      setVisits(freshVisits);
      setProfile(freshProfile);
      setSettings({
        ...freshSettings,
        cloudSaveEnabled: false, // Disable cloud sync after clear
      });
      
      // Also save the updated settings back
      await storage.saveSettings({
        ...freshSettings,
        cloudSaveEnabled: false,
      });
      
      console.log('[AppContext] All data cleared successfully');
    } catch (error) {
      console.error('[AppContext] Failed to clear data:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const value: AppContextType = {
    visits,
    profile,
    settings,
    isLoading,
    addVisit,
    updateVisit,
    deleteVisit,
    refreshVisits,
    updateProfile,
    refreshProfile,
    updateSettings,
    setDarkMode,
    setLanguage,
    t,
    refreshAll,
    clearAllData,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
