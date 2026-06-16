export type PoiCategory = 'education' | 'leisure' | 'public';

export interface Poi {
  id: number;
  lat: number;
  lon: number;
  tags: Record<string, string>;
  category: PoiCategory;
}

/** [south, west, north, east] */
export type BboxTuple = [south: number, west: number, north: number, east: number];
