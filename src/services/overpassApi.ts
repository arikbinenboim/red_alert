import { booleanPointInPolygon, point } from '@turf/turf';
import type { Poi, BboxTuple } from '@/types/poi';
import { bboxToCacheKey } from '@/utils/bbox';
import { buildOverpassQuery, tagsToCategory } from '@/utils/overpassQueryBuilder';

// overpass-api.de is a shared public instance with a documented fair-use policy:
// no bulk/heavy automated use, no guaranteed uptime/SLA. This module does not
// implement retry/backoff/queueing — that is deliberately out of scope here.
const OVERPASS_ENDPOINT = 'https://overpass-api.de/api/interpreter';

interface OverpassElement {
  id: number;
  lat: number;
  lon: number;
  tags?: Record<string, string>;
}

interface OverpassResponse {
  elements: OverpassElement[];
}

const cache = new Map<string, Poi[]>();

export async function fetchPoisInBbox(bbox: BboxTuple, opts?: { signal?: AbortSignal }): Promise<Poi[]> {
  const cacheKey = bboxToCacheKey(bbox);
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  const query = buildOverpassQuery(bbox);
  const res = await fetch(OVERPASS_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `data=${encodeURIComponent(query)}`,
    signal: opts?.signal,
  });

  if (!res.ok) {
    throw new Error(`Overpass request failed: ${res.status} ${res.statusText}`);
  }

  const data: OverpassResponse = await res.json();
  const pois: Poi[] = data.elements
    .map((el): Poi | null => {
      const tags = el.tags ?? {};
      const category = tagsToCategory(tags);
      if (!category) return null;
      return { id: el.id, lat: el.lat, lon: el.lon, tags, category };
    })
    .filter((p): p is Poi => p !== null);

  cache.set(cacheKey, pois);
  return pois;
}

export function clearPoiCache(): void {
  cache.clear();
}

export function filterPoisInPolygon(
  pois: Poi[],
  polygon: GeoJSON.Polygon | GeoJSON.Feature<GeoJSON.Polygon>,
): Poi[] {
  return pois.filter((poi) => booleanPointInPolygon(point([poi.lon, poi.lat]), polygon));
}

// Simple promise-aware debounce: only the most recent call's promise resolves;
// used during marker drag so we don't hammer the public Overpass instance.
let debounceTimer: ReturnType<typeof setTimeout> | null = null;
const DEBOUNCE_MS = 300;

export function fetchPoisInBboxDebounced(bbox: BboxTuple): Promise<Poi[]> {
  return new Promise((resolve, reject) => {
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      fetchPoisInBbox(bbox).then(resolve, reject);
    }, DEBOUNCE_MS);
  });
}
