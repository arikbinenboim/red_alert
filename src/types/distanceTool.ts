export interface DistanceToolPoint {
  lat: number;
  lon: number;
}

export interface DistanceResults {
  /** Straight-line distance via turf. */
  aerialKm: number | null;
  /** Extrapolated cross-country walking time for aerialKm at 4 km/h. */
  offRoadWalkingMin: number | null;
  /** OSRM car profile. */
  drivingKm: number | null;
  drivingMin: number | null;
  /** OSRM foot profile. */
  onRoadWalkingKm: number | null;
  onRoadWalkingMin: number | null;
  /** OSRM bike profile. */
  bikingKm: number | null;
  bikingMin: number | null;
}
