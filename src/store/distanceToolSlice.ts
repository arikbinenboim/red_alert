import type { StateCreator } from 'zustand';
import type { DistanceToolPoint, DistanceResults } from '@/types/distanceTool';
import type { RootState } from './useAppStore';

export interface DistanceToolSlice {
  distancePointA: DistanceToolPoint | null;
  distancePointB: DistanceToolPoint | null;
  distanceResults: DistanceResults;
  drivingRouteGeometry: GeoJSON.LineString | null;
  walkingRouteGeometry: GeoJSON.LineString | null;
  routesLoading: boolean;
  routesError: string | null;
  setDistancePoint: (which: 'A' | 'B', pt: DistanceToolPoint | null) => void;
  setDistanceResults: (res: Partial<DistanceResults>) => void;
  setRouteGeometry: (which: 'driving' | 'walking', geometry: GeoJSON.LineString | null) => void;
  setRoutesLoading: (loading: boolean) => void;
  setRoutesError: (error: string | null) => void;
  resetDistanceTool: () => void;
}

const emptyResults: DistanceResults = {
  aerialKm: null,
  offRoadWalkingMin: null,
  drivingKm: null,
  drivingMin: null,
  onRoadWalkingKm: null,
  onRoadWalkingMin: null,
};

export const createDistanceToolSlice: StateCreator<RootState, [], [], DistanceToolSlice> = (set) => ({
  distancePointA: null,
  distancePointB: null,
  distanceResults: emptyResults,
  drivingRouteGeometry: null,
  walkingRouteGeometry: null,
  routesLoading: false,
  routesError: null,
  setDistancePoint: (which, pt) =>
    set(which === 'A' ? { distancePointA: pt } : { distancePointB: pt }),
  setDistanceResults: (res) =>
    set((state) => ({ distanceResults: { ...state.distanceResults, ...res } })),
  setRouteGeometry: (which, geometry) =>
    set(which === 'driving' ? { drivingRouteGeometry: geometry } : { walkingRouteGeometry: geometry }),
  setRoutesLoading: (loading) => set({ routesLoading: loading }),
  setRoutesError: (error) => set({ routesError: error }),
  resetDistanceTool: () =>
    set({
      distancePointA: null,
      distancePointB: null,
      distanceResults: emptyResults,
      drivingRouteGeometry: null,
      walkingRouteGeometry: null,
      routesLoading: false,
      routesError: null,
    }),
});
