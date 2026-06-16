import type { StateCreator } from 'zustand';
import type { Poi } from '@/types/poi';
import type { RootState } from './useAppStore';

export interface PoiCacheSlice {
  poiCache: Map<string, Poi[]>;
  poiLoading: boolean;
  poiError: string | null;
  setPoisForKey: (key: string, pois: Poi[]) => void;
  getPoisForKey: (key: string) => Poi[] | undefined;
  clearPoiCache: () => void;
  setPoiLoading: (loading: boolean) => void;
  setPoiError: (error: string | null) => void;
}

export const createPoiCacheSlice: StateCreator<RootState, [], [], PoiCacheSlice> = (set, get) => ({
  poiCache: new Map(),
  poiLoading: false,
  poiError: null,
  setPoisForKey: (key, pois) =>
    set((state) => {
      const next = new Map(state.poiCache);
      next.set(key, pois);
      return { poiCache: next };
    }),
  getPoisForKey: (key) => get().poiCache.get(key),
  clearPoiCache: () => set({ poiCache: new Map() }),
  setPoiLoading: (loading) => set({ poiLoading: loading }),
  setPoiError: (error) => set({ poiError: error }),
});
