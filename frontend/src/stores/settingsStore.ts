import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppSettings, SupportedLanguage } from '../types';

const DEFAULT_SETTINGS: AppSettings = {
  darkMode: false,
  language: 'en',
  visaAlertsEnabled: true,
  visaAlertDays: [30, 15, 7],
  customAlertDays: undefined,
  alertFrequency: 'daily',
  cloudSaveEnabled: false,
};

interface SettingsState {
  settings: AppSettings;
  isLoading: boolean;

  // Actions
  setSettings: (settings: AppSettings) => void;
  updateSettings: (updates: Partial<AppSettings>) => void;
  setDarkMode: (enabled: boolean) => void;
  setLanguage: (language: SupportedLanguage) => void;
  setVisaAlerts: (enabled: boolean) => void;
  setVisaAlertDays: (days: number[]) => void;
  setCloudSave: (enabled: boolean) => void;
  setLoading: (loading: boolean) => void;
  reset: () => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      settings: DEFAULT_SETTINGS,
      isLoading: false,

      setSettings: (settings) => set({ settings }),

      updateSettings: (updates) => {
        set((state) => ({
          settings: { ...state.settings, ...updates },
        }));
      },

      setDarkMode: (enabled) => {
        set((state) => ({
          settings: { ...state.settings, darkMode: enabled },
        }));
      },

      setLanguage: (language) => {
        set((state) => ({
          settings: { ...state.settings, language },
        }));
      },

      setVisaAlerts: (enabled) => {
        set((state) => ({
          settings: { ...state.settings, visaAlertsEnabled: enabled },
        }));
      },

      setVisaAlertDays: (days) => {
        set((state) => ({
          settings: { ...state.settings, visaAlertDays: days },
        }));
      },

      setCloudSave: (enabled) => {
        set((state) => ({
          settings: { ...state.settings, cloudSaveEnabled: enabled },
        }));
      },

      setLoading: (loading) => set({ isLoading: loading }),
      
      reset: () => set({ settings: DEFAULT_SETTINGS }),
    }),
    {
      name: 'nomad-settings-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ settings: state.settings }),
    }
  )
);
