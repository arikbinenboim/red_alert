export type OsrmProfile = 'car' | 'foot' | 'bike';

export interface OsrmRouteResult {
  distanceKm: number;
  durationMin: number;
  geometry: GeoJSON.LineString;
}
