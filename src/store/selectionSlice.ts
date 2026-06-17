import type { StateCreator } from 'zustand';
import type { RootState } from './useAppStore';

export interface SelectionSlice {
  selectedSettlementId: string | null;
  selectedSettlementName: string | null;
  setSelectedSettlement: (id: string | null, name?: string | null) => void;
}

export const createSelectionSlice: StateCreator<RootState, [], [], SelectionSlice> = (set) => ({
  selectedSettlementId: null,
  selectedSettlementName: null,
  setSelectedSettlement: (id, name = null) =>
    set({ selectedSettlementId: id, selectedSettlementName: name }),
});
