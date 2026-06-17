import type { StateCreator } from 'zustand';
import type { DistanceToolPoint, DistanceResults } from '@/types/distanceTool';
import type { RootState } from './useAppStore';

export interface DistanceToolSlice {
  distancePointA: DistanceToolPoint | null;
  distancePointB: DistanceToolPoint | null;
  distanceResults: DistanceResults;
  carRouteGeometry: GeoJSON.LineString | null;
  walkingRouteGeometry: GeoJSON.LineString | null;
  bikingRouteGeometry: GeoJSON.LineString | null;
  routesLoading: boolean;
  routesError: string | null;
  setDistancePoint: (which: 'A' | 'B', pt: DistanceToolPoint | null) => void;
  setDistanceResults: (res: Partial<DistanceResults>) => void;
  setRouteGeometry: (which: 'car' | 'walking' | 'bike', geometry: GeoJSON.LineString | null) => void;
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
  bikingKm: null,
  bikingMin: null,
};

export const createDistanceToolSlice: StateCreator<RootState, [], [], DistanceToolSlice> = (set) => ({
  distancePointA: null,
  distancePointB: null,
  distanceResults: emptyResults,
  carRouteGeometry: null,
  walkingRouteGeometry: null,
  bikingRouteGeometry: null,
  routesLoading: false,
  routesError: null,
  setDistancePoint: (which, pt) =>
    set(which === 'A' ? { distancePointA: pt } : { distancePointB: pt }),
  setDistanceResults: (res) =>
    set((state) => ({ distanceResults: { ...state.distanceResults, ...res } })),
  setRouteGeometry: (which, geometry) => {
    if (which === 'car') return set({ carRouteGeometry: geometry });
    if (which === 'bike') return set({ bikingRouteGeometry: geometry });
    return set({ walkingRouteGeometry: geometry });
  },
  setRoutesLoading: (loading) => set({ routesLoading: loading }),
  setRoutesError: (error) => set({ routesError: error }),
  resetDistanceTool: () =>
    set({
      distancePointA: null,
      distancePointB: null,
      distanceResults: emptyResults,
      carRouteGeometry: null,
      walkingRouteGeometry: null,
      bikingRouteGeometry: null,
      routesLoading: false,
      routesError: null,
    }),
});
