import type { StateCreator } from 'zustand';
import type { RootState } from './useAppStore';

export type ToolMode = 'pan' | 'viewshed' | 'distance';

export interface ToolModeSlice {
  toolMode: ToolMode;
  setToolMode: (mode: ToolMode) => void;
}

export const createToolModeSlice: StateCreator<RootState, [], [], ToolModeSlice> = (set) => ({
  toolMode: 'pan',
  setToolMode: (mode) => set({ toolMode: mode }),
});
