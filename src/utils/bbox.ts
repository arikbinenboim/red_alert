import { bbox as turfBbox } from '@turf/turf';
import type { BboxTuple } from '@/types/poi';

export function polygonToBbox(polygon: GeoJSON.Polygon | GeoJSON.Feature): BboxTuple {
  const [west, south, east, north] = turfBbox(polygon);
  return [south, west, north, east];
}

export function roundBbox(bbox: BboxTuple, precision = 4): BboxTuple {
  return bbox.map((v) => Number(v.toFixed(precision))) as BboxTuple;
}

export function bboxToCacheKey(bbox: BboxTuple): string {
  return roundBbox(bbox).join(',');
}
