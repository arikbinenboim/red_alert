import type { StateCreator } from 'zustand';
import type { DistanceToolPoint } from '@/types/distanceTool';
import type { ViewshedResponse } from '@/types/viewshed';
import type { RootState } from './useAppStore';

export interface ViewshedSlice {
  viewshedObserver: DistanceToolPoint | null;
  viewshedResult: ViewshedResponse | null;
  setViewshedObserver: (pt: DistanceToolPoint | null) => void;
  setViewshedResult: (res: ViewshedResponse | null) => void;
}

export const createViewshedSlice: StateCreator<RootState, [], [], ViewshedSlice> = (set) => ({
  viewshedObserver: null,
  viewshedResult: null,
  setViewshedObserver: (pt) => set({ viewshedObserver: pt }),
  setViewshedResult: (res) => set({ viewshedResult: res }),
});
