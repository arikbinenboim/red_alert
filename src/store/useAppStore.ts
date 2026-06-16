import { create } from 'zustand';
import { createFiltersSlice, type FiltersSlice } from './filtersSlice';
import { createSelectionSlice, type SelectionSlice } from './selectionSlice';
import { createPoiCacheSlice, type PoiCacheSlice } from './poiCacheSlice';
import { createToolModeSlice, type ToolModeSlice } from './toolModeSlice';
import { createViewshedSlice, type ViewshedSlice } from './viewshedSlice';
import { createDistanceToolSlice, type DistanceToolSlice } from './distanceToolSlice';
import { createUiSlice, type UiSlice } from './uiSlice';

export type RootState = FiltersSlice &
  SelectionSlice &
  PoiCacheSlice &
  ToolModeSlice &
  ViewshedSlice &
  DistanceToolSlice &
  UiSlice;

export const useAppStore = create<RootState>()((...args) => ({
  ...createFiltersSlice(...args),
  ...createSelectionSlice(...args),
  ...createPoiCacheSlice(...args),
  ...createToolModeSlice(...args),
  ...createViewshedSlice(...args),
  ...createDistanceToolSlice(...args),
  ...createUiSlice(...args),
}));
