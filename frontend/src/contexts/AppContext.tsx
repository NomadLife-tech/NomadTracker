import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Visit, UserProfile, AppSettings, SupportedLanguage } from '../types';
import * as storage from '../services/storage';
import { getTranslation } from '../constants/translations';

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
    const updatedVisits = await storage.addVisit(visit);
    setVisits(updatedVisits);
  }, []);

  const updateVisit = useCallback(async (visit: Visit) => {
    const updatedVisits = await storage.updateVisit(visit);
    setVisits(updatedVisits);
  }, []);

  const deleteVisit = useCallback(async (visitId: string) => {
    const updatedVisits = await storage.deleteVisit(visitId);
    setVisits(updatedVisits);
  }, []);

  const refreshVisits = useCallback(async () => {
    const loadedVisits = await storage.getVisits();
    setVisits(loadedVisits);
  }, []);

  // Profile operations
  const updateProfile = useCallback(async (newProfile: UserProfile) => {
    await storage.saveProfile(newProfile);
    setProfile(newProfile);
  }, []);

  const refreshProfile = useCallback(async () => {
    const loadedProfile = await storage.getProfile();
    setProfile(loadedProfile);
  }, []);

  // Settings operations
  const updateSettings = useCallback(async (newSettings: AppSettings) => {
    await storage.saveSettings(newSettings);
    setSettings(newSettings);
  }, []);

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
