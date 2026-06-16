import type { OsrmProfile, OsrmRouteResult } from '@/types/osrm';
import type { DistanceToolPoint } from '@/types/distanceTool';

// router.project-osrm.org is a shared public demo instance with a documented
// fair-use policy: no bulk/heavy automated use, no guaranteed uptime/SLA.
// No retry/backoff implemented here — deliberately out of scope for now.
const OSRM_BASE = 'https://router.project-osrm.org';

interface OsrmApiResponse {
  routes: Array<{
    distance: number;
    duration: number;
    geometry: GeoJSON.LineString;
  }>;
}

export async function fetchOsrmRoute(
  start: DistanceToolPoint,
  end: DistanceToolPoint,
  profile: OsrmProfile,
): Promise<OsrmRouteResult> {
  const url = `${OSRM_BASE}/route/v1/${profile}/${start.lon},${start.lat};${end.lon},${end.lat}?overview=full&geometries=geojson`;
  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(`OSRM request failed: ${res.status} ${res.statusText}`);
  }

  const data: OsrmApiResponse = await res.json();
  const route = data.routes[0];
  if (!route) {
    throw new Error('OSRM returned no route');
  }

  return {
    distanceKm: route.distance / 1000,
    durationMin: route.duration / 60,
    geometry: route.geometry,
  };
}
