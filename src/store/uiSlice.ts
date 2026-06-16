import type { StateCreator } from 'zustand';
import type { RootState } from './useAppStore';

export interface UiSlice {
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
}

export const createUiSlice: StateCreator<RootState, [], [], UiSlice> = (set) => ({
  sidebarCollapsed: false,
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
});
