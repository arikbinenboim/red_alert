import type { VillageFeatureCollection } from '@/types/demographics';

function square(centerLon: number, centerLat: number, halfSize: number): GeoJSON.Polygon {
  return {
    type: 'Polygon',
    coordinates: [
      [
        [centerLon - halfSize, centerLat - halfSize],
        [centerLon + halfSize, centerLat - halfSize],
        [centerLon + halfSize, centerLat + halfSize],
        [centerLon - halfSize, centerLat + halfSize],
        [centerLon - halfSize, centerLat - halfSize],
      ],
    ],
  };
}

export const sampleVillages: VillageFeatureCollection = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      geometry: square(34.8, 31.6, 0.01),
      properties: {
        id: 'v1',
        name: 'Northfield',
        demographics: {
          total_population: 4200,
          gender: { male_pct: 49.5, female_pct: 50.5 },
          age_distribution: { age_0_4: 9, age_5_19: 24, age_20_64: 53, age_65_plus: 14 },
          languages: { hebrew_mother_tongue_pct: 70, arabic_mother_tongue_pct: 20, other_pct: 10 },
          religion: { jewish_pct: 68, muslim_pct: 18, christian_pct: 8, druze_pct: 6 },
        },
      },
    },
    {
      type: 'Feature',
      geometry: square(34.85, 31.55, 0.012),
      properties: {
        id: 'v2',
        name: 'Eastbrook',
        demographics: {
          total_population: 7800,
          gender: { male_pct: 51, female_pct: 49 },
          age_distribution: { age_0_4: 11, age_5_19: 28, age_20_64: 48, age_65_plus: 13 },
          languages: { hebrew_mother_tongue_pct: 15, arabic_mother_tongue_pct: 80, other_pct: 5 },
          religion: { jewish_pct: 5, muslim_pct: 88, christian_pct: 4, druze_pct: 3 },
        },
      },
    },
    {
      type: 'Feature',
      geometry: square(34.75, 31.62, 0.008),
      properties: {
        id: 'v3',
        name: 'Westmoor',
        demographics: {
          total_population: 2100,
          gender: { male_pct: 48, female_pct: 52 },
          age_distribution: { age_0_4: 6, age_5_19: 17, age_20_64: 49, age_65_plus: 28 },
          languages: { hebrew_mother_tongue_pct: 92, arabic_mother_tongue_pct: 3, other_pct: 5 },
          religion: { jewish_pct: 90, muslim_pct: 2, christian_pct: 2, druze_pct: 6 },
        },
      },
    },
    {
      type: 'Feature',
      geometry: square(34.82, 31.65, 0.015),
      properties: {
        id: 'v4',
        name: 'Druze Heights',
        demographics: {
          total_population: 5600,
          gender: { male_pct: 50, female_pct: 50 },
          age_distribution: { age_0_4: 8, age_5_19: 22, age_20_64: 55, age_65_plus: 15 },
          languages: { hebrew_mother_tongue_pct: 35, arabic_mother_tongue_pct: 60, other_pct: 5 },
          religion: { jewish_pct: 4, muslim_pct: 8, christian_pct: 3, druze_pct: 85 },
        },
      },
    },
    {
      type: 'Feature',
      geometry: square(34.78, 31.58, 0.009),
      properties: {
        id: 'v5',
        name: 'Southgate',
        demographics: {
          total_population: 9400,
          gender: { male_pct: 49, female_pct: 51 },
          age_distribution: { age_0_4: 10, age_5_19: 26, age_20_64: 50, age_65_plus: 14 },
          languages: { hebrew_mother_tongue_pct: 78, arabic_mother_tongue_pct: 12, other_pct: 10 },
          religion: { jewish_pct: 75, muslim_pct: 10, christian_pct: 9, druze_pct: 6 },
        },
      },
    },
  ],
};
