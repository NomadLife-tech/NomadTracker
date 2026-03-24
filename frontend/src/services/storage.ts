import { universalStorage } from './storageAdapter';
import { Visit, UserProfile, AppSettings, SupportedLanguage } from '../types';

export const STORAGE_KEYS = {
  VERSION: '@nomad_storage_version',
  VISITS: '@nomad_visits',
  PROFILE: '@nomad_profile',
  SETTINGS: '@nomad_settings',
};

const CURRENT_VERSION = '1.0';

// Default profile
const getDefaultProfile = (): UserProfile => ({
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

// Default settings
const getDefaultSettings = (): AppSettings => ({
  darkMode: false,
  language: 'en',
  visaAlertsEnabled: true,
  visaAlertDays: [30, 15, 7],
  customAlertDays: 0,
  alertFrequency: 'daily',
});

// Initialize storage
export async function initializeStorage(): Promise<void> {
  const version = await universalStorage.getItem(STORAGE_KEYS.VERSION);
  if (!version) {
    await universalStorage.setItem(STORAGE_KEYS.VERSION, CURRENT_VERSION);
    await universalStorage.setItem(STORAGE_KEYS.VISITS, JSON.stringify([]));
    await universalStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(getDefaultProfile()));
    await universalStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(getDefaultSettings()));
  }
}

// Visits
export async function getVisits(): Promise<Visit[]> {
  const data = await universalStorage.getItem(STORAGE_KEYS.VISITS);
  return data ? JSON.parse(data) : [];
}

export async function saveVisits(visits: Visit[]): Promise<void> {
  await universalStorage.setItem(STORAGE_KEYS.VISITS, JSON.stringify(visits));
}

export async function addVisit(visit: Visit): Promise<Visit[]> {
  const visits = await getVisits();
  visits.push(visit);
  await saveVisits(visits);
  return visits;
}

export async function updateVisit(visit: Visit): Promise<Visit[]> {
  const visits = await getVisits();
  const index = visits.findIndex(v => v.id === visit.id);
  if (index !== -1) {
    visits[index] = { ...visit, updatedAt: new Date().toISOString() };
    await saveVisits(visits);
  }
  return visits;
}

export async function deleteVisit(visitId: string): Promise<Visit[]> {
  const visits = await getVisits();
  const filtered = visits.filter(v => v.id !== visitId);
  await saveVisits(filtered);
  return filtered;
}

// Profile
export async function getProfile(): Promise<UserProfile> {
  const data = await universalStorage.getItem(STORAGE_KEYS.PROFILE);
  return data ? JSON.parse(data) : getDefaultProfile();
}

export async function saveProfile(profile: UserProfile): Promise<void> {
  await universalStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify({
    ...profile,
    updatedAt: new Date().toISOString(),
  }));
}

// Settings
export async function getSettings(): Promise<AppSettings> {
  const data = await universalStorage.getItem(STORAGE_KEYS.SETTINGS);
  if (data) {
    const saved = JSON.parse(data);
    // Merge with defaults to ensure new fields are included
    return { ...getDefaultSettings(), ...saved };
  }
  return getDefaultSettings();
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  await universalStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
}

// Export all data
export async function exportAllData(): Promise<string> {
  const visits = await getVisits();
  const profile = await getProfile();
  const settings = await getSettings();
  
  return JSON.stringify({
    version: CURRENT_VERSION,
    exportDate: new Date().toISOString(),
    visits,
    profile,
    settings,
  }, null, 2);
}

// Import all data
export async function importAllData(jsonString: string): Promise<boolean> {
  try {
    const data = JSON.parse(jsonString);
    
    if (data.visits) {
      await saveVisits(data.visits);
    }
    if (data.profile) {
      await saveProfile(data.profile);
    }
    if (data.settings) {
      await saveSettings(data.settings);
    }
    
    return true;
  } catch (e) {
    console.error('Import error:', e);
    return false;
  }
}

// Clear all data
export async function clearAllData(): Promise<void> {
  await universalStorage.clear();
  await initializeStorage();
}
