import type { StateCreator } from 'zustand';
import type { RootState } from './useAppStore';

export interface SelectionSlice {
  selectedSettlementId: string | null;
  setSelectedSettlement: (id: string | null) => void;
}

export const createSelectionSlice: StateCreator<RootState, [], [], SelectionSlice> = (set) => ({
  selectedSettlementId: null,
  setSelectedSettlement: (id) => set({ selectedSettlementId: id }),
});
