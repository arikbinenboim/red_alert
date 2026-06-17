import { booleanPointInPolygon, circle, point } from '@turf/turf';
import type { Poi, BboxTuple } from '@/types/poi';
import type { VillageDemographics, VillageFeatureCollection } from '@/types/demographics';
import type { AnchorSettlement } from '@/data/anchorSettlements';
import { bboxToCacheKey } from '@/utils/bbox';
import { buildOverpassQuery, buildSettlementsAroundQuery, tagsToCategory } from '@/utils/overpassQueryBuilder';

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

// Radius in km to use when generating synthetic polygons per place type
const PLACE_POLYGON_RADIUS_KM: Record<string, number> = {
  city: 1.5,
  town: 0.8,
  village: 0.3,
  hamlet: 0.15,
  moshav: 0.4,
  kibbutz: 0.4,
};

function emptyDemographics(population: number): VillageDemographics {
  return {
    total_population: population,
    gender: { male_pct: 0, female_pct: 0 },
    age_distribution: { age_0_4: 0, age_5_19: 0, age_20_64: 0, age_65_plus: 0 },
    languages: { hebrew_mother_tongue_pct: 0, arabic_mother_tongue_pct: 0, other_pct: 0 },
    religion: { jewish_pct: 0, muslim_pct: 0, christian_pct: 0, druze_pct: 0 },
  };
}

export async function fetchSettlementsAround(
  anchors: Pick<AnchorSettlement, 'lat' | 'lon'>[],
  radiusMeters: number,
  opts?: { signal?: AbortSignal },
): Promise<VillageFeatureCollection> {
  const query = buildSettlementsAroundQuery(anchors, radiusMeters);
  const res = await fetch(OVERPASS_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `data=${encodeURIComponent(query)}`,
    signal: opts?.signal,
  });

  if (!res.ok) throw new Error(`Overpass request failed: ${res.status} ${res.statusText}`);

  const data: OverpassResponse = await res.json();
  const seen = new Set<number>();

  const features = data.elements
    .filter((el) => {
      if (seen.has(el.id)) return false;
      seen.add(el.id);
      return !!el.tags?.name;
    })
    .map((el) => {
      const tags = el.tags ?? {};
      const placeType = tags.place ?? 'village';
      const radiusKm = PLACE_POLYGON_RADIUS_KM[placeType] ?? 0.3;
      const population = parseInt(tags.population ?? '0', 10) || 0;
      const polygon = circle([el.lon, el.lat], radiusKm, { units: 'kilometers' });

      return {
        type: 'Feature' as const,
        geometry: polygon.geometry,
        properties: {
          id: `osm-${el.id}`,
          name: tags['name:he'] ?? tags.name,
          nameEn: tags['name:en'] ?? undefined,
          wikidata: tags.wikidata ?? undefined,
          // OSM wikipedia tag format: "he:דימונה" or "en:Al-Tira, Haifa"
          wikipedia: tags['wikipedia:he']
            ? `he:${tags['wikipedia:he']}`
            : (tags.wikipedia ?? undefined),
          demographics: emptyDemographics(population),
        },
      };
    });

  return { type: 'FeatureCollection', features };
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
