export interface ViewshedRequest {
  observerLat: number;
  observerLon: number;
  radiusKm: number;
}

export interface ViewshedResponse {
  sectors: GeoJSON.Feature<GeoJSON.Polygon>[];
}

export type ViewshedWorkerMessage =
  | { type: 'compute'; payload: ViewshedRequest }
  | { type: 'cancel' };

export type ViewshedWorkerResult =
  | { type: 'result'; payload: ViewshedResponse }
  | { type: 'error'; message: string };
