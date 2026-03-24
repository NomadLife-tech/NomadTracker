import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Visit } from '../types';
import { syncQueue } from '../services/syncQueue';

interface VisitState {
  visits: Visit[];
  isLoading: boolean;
  lastSynced: Date | null;
  
  // Actions
  setVisits: (visits: Visit[]) => void;
  addVisit: (visit: Visit) => void;
  updateVisit: (visit: Visit) => void;
  deleteVisit: (visitId: string) => void;
  setLoading: (loading: boolean) => void;
  
  // Computed
  getActiveVisit: () => Visit | null;
  getVisitsByYear: (year: number) => Visit[];
  getUniqueCountries: () => string[];
}

export const useVisitStore = create<VisitState>()(
  persist(
    (set, get) => ({
      visits: [],
      isLoading: false,
      lastSynced: null,

      setVisits: (visits) => set({ visits }),

      addVisit: (visit) => {
        set((state) => ({ 
          visits: [...state.visits, visit] 
        }));
        // Queue for sync
        syncQueue.enqueue({
          type: 'CREATE',
          entity: 'visit',
          data: visit,
          timestamp: new Date(),
        });
      },

      updateVisit: (visit) => {
        set((state) => ({
          visits: state.visits.map((v) => 
            v.id === visit.id ? visit : v
          ),
        }));
        // Queue for sync
        syncQueue.enqueue({
          type: 'UPDATE',
          entity: 'visit',
          data: visit,
          timestamp: new Date(),
        });
      },

      deleteVisit: (visitId) => {
        set((state) => ({
          visits: state.visits.filter((v) => v.id !== visitId),
        }));
        // Queue for sync
        syncQueue.enqueue({
          type: 'DELETE',
          entity: 'visit',
          data: { id: visitId },
          timestamp: new Date(),
        });
      },

      setLoading: (loading) => set({ isLoading: loading }),

      // Computed getters
      getActiveVisit: () => {
        const { visits } = get();
        const today = new Date();
        return visits.find((v) => {
          const start = new Date(v.entryDate);
          const end = v.exitDate ? new Date(v.exitDate) : null;
          return start <= today && (!end || end >= today);
        }) || null;
      },

      getVisitsByYear: (year) => {
        const { visits } = get();
        return visits.filter((v) => {
          const visitYear = new Date(v.entryDate).getFullYear();
          return visitYear === year;
        });
      },

      getUniqueCountries: () => {
        const { visits } = get();
        return [...new Set(visits.map((v) => v.countryCode))];
      },
    }),
    {
      name: 'nomad-visits-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ 
        visits: state.visits,
        lastSynced: state.lastSynced,
      }),
    }
  )
);
