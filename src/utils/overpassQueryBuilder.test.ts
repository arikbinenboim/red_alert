import { describe, it, expect } from 'vitest';
import { buildOverpassQuery, tagsToCategory, POI_TAG_FILTERS } from './overpassQueryBuilder';

describe('buildOverpassQuery', () => {
  it('includes all 9 tag filters from the spec', () => {
    const query = buildOverpassQuery([52.51, 13.37, 52.52, 13.39]);
    for (const { key, value } of POI_TAG_FILTERS) {
      expect(query).toContain(`["${key}"="${value}"]`);
    }
  });

  it('embeds the bbox coordinates in south,west,north,east order', () => {
    const query = buildOverpassQuery([1, 2, 3, 4]);
    expect(query).toContain('(1,2,3,4)');
  });

  it('respects a custom timeout', () => {
    expect(buildOverpassQuery([1, 2, 3, 4], 60)).toContain('[timeout:60]');
  });
});

describe('tagsToCategory', () => {
  it('maps each known tag combination to its expected category', () => {
    expect(tagsToCategory({ amenity: 'school' })).toBe('education');
    expect(tagsToCategory({ amenity: 'kindergarten' })).toBe('education');
    expect(tagsToCategory({ amenity: 'college' })).toBe('education');
    expect(tagsToCategory({ leisure: 'park' })).toBe('leisure');
    expect(tagsToCategory({ leisure: 'playground' })).toBe('leisure');
    expect(tagsToCategory({ leisure: 'sports_centre' })).toBe('leisure');
    expect(tagsToCategory({ amenity: 'townhall' })).toBe('public');
    expect(tagsToCategory({ amenity: 'place_of_worship' })).toBe('public');
    expect(tagsToCategory({ amenity: 'community_centre' })).toBe('public');
  });

  it('returns null for unmatched tags', () => {
    expect(tagsToCategory({ shop: 'bakery' })).toBeNull();
    expect(tagsToCategory({})).toBeNull();
  });
});
