import { destination, point } from '@turf/turf';

export const RAY_COUNT = 24;
export const SAMPLES_PER_RAY = 8;

export interface SamplePoint {
  lat: number;
  lon: number;
}

export interface RaySamples {
  bearingDeg: number;
  /** Sample points along this ray, nearest to farthest. */
  points: SamplePoint[];
  /** Distance in km for each entry in `points`, same order. */
  distancesKm: number[];
}

export function buildRays(observerLat: number, observerLon: number, radiusKm: number): RaySamples[] {
  const stepKm = radiusKm / SAMPLES_PER_RAY;
  const rays: RaySamples[] = [];

  for (let r = 0; r < RAY_COUNT; r++) {
    const bearingDeg = (360 / RAY_COUNT) * r;
    const points: SamplePoint[] = [];
    const distancesKm: number[] = [];

    for (let s = 1; s <= SAMPLES_PER_RAY; s++) {
      const distanceKm = stepKm * s;
      const dest = destination(point([observerLon, observerLat]), distanceKm, bearingDeg, {
        units: 'kilometers',
      });
      const [lon, lat] = dest.geometry.coordinates;
      points.push({ lat, lon });
      distancesKm.push(distanceKm);
    }

    rays.push({ bearingDeg, points, distancesKm });
  }

  return rays;
}

/**
 * Classic radial-horizon visibility: walking outward along a ray, a sample is
 * visible if its elevation angle from the observer is >= the steepest angle
 * seen so far on that ray. The first point beyond the horizon blocks the rest
 * of the ray (a simplification — it doesn't model "visible again behind a
 * dip", which a full 3D viewshed would).
 */
export function computeVisibleDistanceKm(
  observerElevationM: number,
  sampleElevationsM: number[],
  distancesKm: number[],
): number {
  let maxAngle = -Infinity;
  let visibleDistanceKm = 0;

  for (let i = 0; i < sampleElevationsM.length; i++) {
    const distanceM = distancesKm[i] * 1000;
    const angle = Math.atan2(sampleElevationsM[i] - observerElevationM, distanceM);
    if (angle >= maxAngle) {
      maxAngle = angle;
      visibleDistanceKm = distancesKm[i];
    } else {
      break;
    }
  }

  return visibleDistanceKm;
}

/** Builds a closed polygon ring from each ray's visible-horizon endpoint. */
export function buildViewshedPolygon(
  observerLat: number,
  observerLon: number,
  rays: RaySamples[],
  visibleDistancesKm: number[],
): GeoJSON.Feature<GeoJSON.Polygon> {
  const ring = rays.map((ray, i) => {
    const dest = destination(point([observerLon, observerLat]), Math.max(visibleDistancesKm[i], 0.05), ray.bearingDeg, {
      units: 'kilometers',
    });
    return dest.geometry.coordinates;
  });
  ring.push(ring[0]);

  return {
    type: 'Feature',
    properties: {},
    geometry: { type: 'Polygon', coordinates: [ring] },
  };
}
