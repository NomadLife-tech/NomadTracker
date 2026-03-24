import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserProfile, Passport, Insurance } from '../types';
import { syncQueue } from '../services/syncQueue';

const DEFAULT_PROFILE: UserProfile = {
  firstName: '',
  lastName: '',
  avatar: '🌍',
  avatarType: 'preset',
  homeCountry: '',
  passports: [],
  insurances: [],
};

interface ProfileState {
  profile: UserProfile;
  isLoading: boolean;

  // Actions
  setProfile: (profile: UserProfile) => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  
  // Passport actions
  addPassport: (passport: Passport) => void;
  updatePassport: (passport: Passport) => void;
  deletePassport: (passportId: string) => void;
  
  // Insurance actions
  addInsurance: (insurance: Insurance) => void;
  updateInsurance: (insurance: Insurance) => void;
  deleteInsurance: (insuranceId: string) => void;
  
  setLoading: (loading: boolean) => void;
  reset: () => void;
}

export const useProfileStore = create<ProfileState>()(
  persist(
    (set, get) => ({
      profile: DEFAULT_PROFILE,
      isLoading: false,

      setProfile: (profile) => set({ profile }),

      updateProfile: (updates) => {
        const newProfile = { ...get().profile, ...updates };
        set({ profile: newProfile });
        syncQueue.enqueue({
          type: 'UPDATE',
          entity: 'profile',
          data: newProfile,
          timestamp: new Date(),
        });
      },

      // Passport management
      addPassport: (passport) => {
        set((state) => ({
          profile: {
            ...state.profile,
            passports: [...state.profile.passports, passport],
          },
        }));
        syncQueue.enqueue({
          type: 'CREATE',
          entity: 'passport',
          data: passport,
          timestamp: new Date(),
        });
      },

      updatePassport: (passport) => {
        set((state) => ({
          profile: {
            ...state.profile,
            passports: state.profile.passports.map((p) =>
              p.id === passport.id ? passport : p
            ),
          },
        }));
        syncQueue.enqueue({
          type: 'UPDATE',
          entity: 'passport',
          data: passport,
          timestamp: new Date(),
        });
      },

      deletePassport: (passportId) => {
        set((state) => ({
          profile: {
            ...state.profile,
            passports: state.profile.passports.filter((p) => p.id !== passportId),
          },
        }));
        syncQueue.enqueue({
          type: 'DELETE',
          entity: 'passport',
          data: { id: passportId },
          timestamp: new Date(),
        });
      },

      // Insurance management
      addInsurance: (insurance) => {
        set((state) => ({
          profile: {
            ...state.profile,
            insurances: [...state.profile.insurances, insurance],
          },
        }));
        syncQueue.enqueue({
          type: 'CREATE',
          entity: 'insurance',
          data: insurance,
          timestamp: new Date(),
        });
      },

      updateInsurance: (insurance) => {
        set((state) => ({
          profile: {
            ...state.profile,
            insurances: state.profile.insurances.map((i) =>
              i.id === insurance.id ? insurance : i
            ),
          },
        }));
        syncQueue.enqueue({
          type: 'UPDATE',
          entity: 'insurance',
          data: insurance,
          timestamp: new Date(),
        });
      },

      deleteInsurance: (insuranceId) => {
        set((state) => ({
          profile: {
            ...state.profile,
            insurances: state.profile.insurances.filter((i) => i.id !== insuranceId),
          },
        }));
        syncQueue.enqueue({
          type: 'DELETE',
          entity: 'insurance',
          data: { id: insuranceId },
          timestamp: new Date(),
        });
      },

      setLoading: (loading) => set({ isLoading: loading }),
      
      reset: () => set({ profile: DEFAULT_PROFILE }),
    }),
    {
      name: 'nomad-profile-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ profile: state.profile }),
    }
  )
);
