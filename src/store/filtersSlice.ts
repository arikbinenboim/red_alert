import type { StateCreator } from 'zustand';
import type { RootState } from './useAppStore';

export interface FilterValues {
  populationRange: [number, number];
  under18PctMax: number;
  over65PctMax: number;
  showOnlyWithSchool: boolean;
}

export interface FiltersSlice {
  filters: FilterValues;
  setFilter: <K extends keyof FilterValues>(key: K, value: FilterValues[K]) => void;
  resetFilters: () => void;
}

const defaultFilters: FilterValues = {
  populationRange: [0, 10000],
  under18PctMax: 100,
  over65PctMax: 100,
  showOnlyWithSchool: false,
};

export const createFiltersSlice: StateCreator<RootState, [], [], FiltersSlice> = (set) => ({
  filters: defaultFilters,
  setFilter: (key, value) =>
    set((state) => ({ filters: { ...state.filters, [key]: value } })),
  resetFilters: () => set({ filters: defaultFilters }),
});
