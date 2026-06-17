import type { BboxTuple, PoiCategory } from '@/types/poi';
import type { AnchorSettlement } from '@/data/anchorSettlements';

export const POI_TAG_FILTERS: ReadonlyArray<{ key: string; value: string; category: PoiCategory }> = [
  { key: 'leisure', value: 'park', category: 'leisure' },
  { key: 'leisure', value: 'playground', category: 'leisure' },
  { key: 'leisure', value: 'sports_centre', category: 'leisure' },
  { key: 'amenity', value: 'townhall', category: 'public' },
  { key: 'amenity', value: 'place_of_worship', category: 'public' },
  { key: 'amenity', value: 'community_centre', category: 'public' },
  { key: 'amenity', value: 'school', category: 'education' },
  { key: 'amenity', value: 'kindergarten', category: 'education' },
  { key: 'amenity', value: 'college', category: 'education' },
];

export function buildOverpassQuery(bbox: BboxTuple, timeoutSec = 25): string {
  const [south, west, north, east] = bbox;
  const bboxStr = `${south},${west},${north},${east}`;
  const clauses = POI_TAG_FILTERS.map(
    ({ key, value }) => `node["${key}"="${value}"](${bboxStr});`,
  ).join('');
  return `[out:json][timeout:${timeoutSec}];(${clauses});out body;`;
}

export function tagsToCategory(tags: Record<string, string>): PoiCategory | null {
  for (const filter of POI_TAG_FILTERS) {
    if (tags[filter.key] === filter.value) return filter.category;
  }
  return null;
}

// Fetches place nodes (city/town/village/hamlet) within radiusMeters of each anchor.
export function buildSettlementsAroundQuery(
  anchors: Pick<AnchorSettlement, 'lat' | 'lon'>[],
  radiusMeters: number,
  timeoutSec = 60,
): string {
  const placeTypes = ['city', 'town', 'village', 'hamlet', 'moshav', 'kibbutz'];
  const clauses = anchors
    .flatMap(({ lat, lon }) =>
      placeTypes.map(
        (t) => `node["place"="${t}"](around:${radiusMeters},${lat},${lon});`,
      ),
    )
    .join('');
  return `[out:json][timeout:${timeoutSec}];(${clauses});out body;`;
}
