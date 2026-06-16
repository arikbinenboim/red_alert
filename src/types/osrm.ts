export type OsrmProfile = 'driving' | 'foot';

export interface OsrmRouteResult {
  distanceKm: number;
  durationMin: number;
  geometry: GeoJSON.LineString;
}
