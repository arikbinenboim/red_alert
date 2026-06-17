import type { StateCreator } from 'zustand';
import type { RootState } from './useAppStore';

export type BaseLayer = 'dark' | 'satellite';

export interface UiSlice {
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  baseLayer: BaseLayer;
  setBaseLayer: (layer: BaseLayer) => void;
}

export const createUiSlice: StateCreator<RootState, [], [], UiSlice> = (set) => ({
  sidebarCollapsed: false,
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  baseLayer: 'dark',
  setBaseLayer: (layer) => set({ baseLayer: layer }),
});
