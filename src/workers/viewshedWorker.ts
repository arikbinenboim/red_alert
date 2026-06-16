import { circle } from '@turf/turf';
import type { ViewshedWorkerMessage, ViewshedWorkerResult } from '@/types/viewshed';
import { buildRays, computeVisibleDistanceKm, buildViewshedPolygon } from '@/utils/viewshedCompute';

const ELEVATION_ENDPOINT = 'https://api.open-elevation.com/api/v1/lookup';
const FETCH_TIMEOUT_MS = 15000;

interface ElevationResult {
  latitude: number;
  longitude: number;
  elevation: number;
}

async function fetchElevations(locations: { lat: number; lon: number }[]): Promise<number[]> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const res = await fetch(ELEVATION_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        locations: locations.map((p) => ({ latitude: p.lat, longitude: p.lon })),
      }),
      signal: controller.signal,
    });

    if (!res.ok) {
      throw new Error(`Open-Elevation request failed: ${res.status} ${res.statusText}`);
    }

    const data: { results: ElevationResult[] } = await res.json();
    return data.results.map((r) => r.elevation);
  } finally {
    clearTimeout(timeout);
  }
}

self.onmessage = (e: MessageEvent<ViewshedWorkerMessage>) => {
  const msg = e.data;
  if (msg.type === 'cancel') return;

  void (async () => {
    const { observerLat, observerLon, radiusKm } = msg.payload;

    try {
      const rays = buildRays(observerLat, observerLon, radiusKm);
      const allPoints = [{ lat: observerLat, lon: observerLon }, ...rays.flatMap((r) => r.points)];
      const elevations = await fetchElevations(allPoints);

      const observerElevation = elevations[0];
      const sampleElevations = elevations.slice(1);

      const visibleDistancesKm = rays.map((ray, rayIndex) => {
        const start = rayIndex * ray.points.length;
        const rayElevations = sampleElevations.slice(start, start + ray.points.length);
        return computeVisibleDistanceKm(observerElevation, rayElevations, ray.distancesKm);
      });

      const sector = buildViewshedPolygon(observerLat, observerLon, rays, visibleDistancesKm);

      const result: ViewshedWorkerResult = { type: 'result', payload: { sectors: [sector] } };
      self.postMessage(result);
    } catch (err) {
      // Open-Elevation is a free, best-effort public API — fall back to a
      // full circle so the tool still produces a usable result when it's
      // slow/unreachable, rather than leaving the user with nothing.
      console.warn('Viewshed elevation lookup failed, falling back to flat-circle estimate:', err);
      const fallback = circle([observerLon, observerLat], radiusKm, { units: 'kilometers' });
      const result: ViewshedWorkerResult = { type: 'result', payload: { sectors: [fallback] } };
      self.postMessage(result);
    }
  })();
};
