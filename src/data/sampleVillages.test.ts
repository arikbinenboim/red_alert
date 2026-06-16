import { describe, it, expect } from 'vitest';
import { sampleVillages } from './sampleVillages';

describe('sampleVillages', () => {
  it('has at least one village', () => {
    expect(sampleVillages.features.length).toBeGreaterThan(0);
  });

  it.each(sampleVillages.features)('$properties.name: demographic percentages sum to ~100', (feature) => {
    const d = feature.properties.demographics;
    const genderSum = d.gender.male_pct + d.gender.female_pct;
    const ageSum =
      d.age_distribution.age_0_4 +
      d.age_distribution.age_5_19 +
      d.age_distribution.age_20_64 +
      d.age_distribution.age_65_plus;
    const langSum = d.languages.hebrew_mother_tongue_pct + d.languages.arabic_mother_tongue_pct + d.languages.other_pct;
    const religionSum = d.religion.jewish_pct + d.religion.muslim_pct + d.religion.christian_pct + d.religion.druze_pct;

    expect(genderSum).toBeCloseTo(100, 0);
    expect(ageSum).toBeCloseTo(100, 0);
    expect(langSum).toBeCloseTo(100, 0);
    expect(religionSum).toBeCloseTo(100, 0);
  });

  it.each(sampleVillages.features)('$properties.name: has a valid closed polygon ring', (feature) => {
    const ring = feature.geometry.coordinates[0];
    expect(ring.length).toBeGreaterThanOrEqual(4);
    expect(ring[0]).toEqual(ring[ring.length - 1]);
  });
});
