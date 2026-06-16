import { describe, it, expect } from 'vitest';
import { villageMatchesFilters } from './filterVillages';
import type { VillageFeature } from '@/types/demographics';
import type { FilterValues } from '@/store/filtersSlice';

function makeVillage(totalPopulation: number, under4: number, under19: number, over65: number): VillageFeature {
  return {
    type: 'Feature',
    geometry: { type: 'Polygon', coordinates: [[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]] },
    properties: {
      id: 'v1',
      name: 'Test Village',
      demographics: {
        total_population: totalPopulation,
        gender: { male_pct: 50, female_pct: 50 },
        age_distribution: { age_0_4: under4, age_5_19: under19, age_20_64: 100 - under4 - under19 - over65, age_65_plus: over65 },
        languages: { hebrew_mother_tongue_pct: 100, arabic_mother_tongue_pct: 0, other_pct: 0 },
        religion: { jewish_pct: 100, muslim_pct: 0, christian_pct: 0, druze_pct: 0 },
      },
    },
  };
}

const baseFilters: FilterValues = {
  populationRange: [0, 10000],
  under18PctMax: 100,
  over65PctMax: 100,
  showOnlyWithSchool: false,
};

describe('villageMatchesFilters', () => {
  it('matches when within population range and age thresholds', () => {
    const village = makeVillage(5000, 5, 20, 10);
    expect(villageMatchesFilters(village, baseFilters, undefined)).toBe(true);
  });

  it('excludes villages outside the population range', () => {
    const village = makeVillage(20000, 5, 20, 10);
    expect(villageMatchesFilters(village, baseFilters, undefined)).toBe(false);
  });

  it('excludes villages above the under-18 percentage cap', () => {
    const village = makeVillage(5000, 20, 30, 5); // under18Pct = 50
    const filters = { ...baseFilters, under18PctMax: 40 };
    expect(villageMatchesFilters(village, filters, undefined)).toBe(false);
  });

  it('excludes villages above the over-65 percentage cap', () => {
    const village = makeVillage(5000, 5, 20, 30);
    const filters = { ...baseFilters, over65PctMax: 20 };
    expect(villageMatchesFilters(village, filters, undefined)).toBe(false);
  });

  it('does not exclude on the school filter while hasSchool is unknown (undefined)', () => {
    const village = makeVillage(5000, 5, 20, 10);
    const filters = { ...baseFilters, showOnlyWithSchool: true };
    expect(villageMatchesFilters(village, filters, undefined)).toBe(true);
  });

  it('excludes villages confirmed to have no school when the filter is on', () => {
    const village = makeVillage(5000, 5, 20, 10);
    const filters = { ...baseFilters, showOnlyWithSchool: true };
    expect(villageMatchesFilters(village, filters, false)).toBe(false);
  });

  it('includes villages confirmed to have a school when the filter is on', () => {
    const village = makeVillage(5000, 5, 20, 10);
    const filters = { ...baseFilters, showOnlyWithSchool: true };
    expect(villageMatchesFilters(village, filters, true)).toBe(true);
  });
});
