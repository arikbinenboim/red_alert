import { useMemo } from 'react';
import { circle } from '@turf/turf';
import {
  SETTLEMENT_DATABASE,
  type Settlement,
  type SettlementClassification,
  type PlaceType,
} from '@/data/settlementDatabase';
import type { VillageDemographics, VillageFeature, VillageFeatureCollection } from '@/types/demographics';

const RADIUS_KM: Record<PlaceType, number> = {
  city:               1.5,
  town:               0.8,
  village:            0.3,
  hamlet:             0.15,
  isolated_dwelling:  0.08,
};

// Approximate age distributions per settlement classification, based on
// CBS Israel and Palestinian Central Bureau of Statistics data.
const AGE_BY_CLASS: Record<SettlementClassification, VillageDemographics['age_distribution']> = {
  haifa:              { age_0_4:  7, age_5_19: 19, age_20_64: 60, age_65_plus: 14 },
  tirat_karmel:       { age_0_4: 10, age_5_19: 22, age_20_64: 56, age_65_plus: 12 },
  jewish_il:          { age_0_4:  8, age_5_19: 20, age_20_64: 57, age_65_plus: 15 },
  jewish_negev_il:    { age_0_4: 10, age_5_19: 22, age_20_64: 54, age_65_plus: 14 },
  dimona_city:        { age_0_4: 11, age_5_19: 23, age_20_64: 52, age_65_plus: 14 },
  haredi_il:          { age_0_4: 15, age_5_19: 30, age_20_64: 47, age_65_plus:  8 },
  arab_muslim_il:     { age_0_4: 12, age_5_19: 26, age_20_64: 52, age_65_plus: 10 },
  druze_il:           { age_0_4: 10, age_5_19: 24, age_20_64: 54, age_65_plus: 12 },
  shefaram:           { age_0_4: 12, age_5_19: 26, age_20_64: 52, age_65_plus: 10 },
  harduf:             { age_0_4:  8, age_5_19: 22, age_20_64: 58, age_65_plus: 12 },
  bedouin_negev:      { age_0_4: 16, age_5_19: 32, age_20_64: 46, age_65_plus:  6 },
  bedouin_recognized: { age_0_4: 15, age_5_19: 30, age_20_64: 48, age_65_plus:  7 },
  israeli_settler_wb: { age_0_4: 13, age_5_19: 27, age_20_64: 52, age_65_plus:  8 },
  palestinian_wb:     { age_0_4: 14, age_5_19: 28, age_20_64: 50, age_65_plus:  8 },
  christian_wb:       { age_0_4: 10, age_5_19: 24, age_20_64: 54, age_65_plus: 12 },
  mixed_christian_wb: { age_0_4: 11, age_5_19: 25, age_20_64: 52, age_65_plus: 12 },
  refugee_wb:         { age_0_4: 15, age_5_19: 30, age_20_64: 47, age_65_plus:  8 },
};

const DEFAULT_POP: Record<PlaceType, number> = {
  city:               50000,
  town:               5000,
  village:            1000,
  hamlet:             200,
  isolated_dwelling:  50,
};

function toFeature(s: Settlement): VillageFeature {
  const radiusKm = RADIUS_KM[s.placeType];
  const polygon = circle([s.lon, s.lat], radiusKm, { units: 'kilometers' });
  const ageDist = AGE_BY_CLASS[s.classification];

  const demographics: VillageDemographics = {
    total_population: s.population ?? DEFAULT_POP[s.placeType],
    gender: { male_pct: 50, female_pct: 50 },
    age_distribution: ageDist,
    languages: {
      hebrew_mother_tongue_pct: s.languages.hebrew,
      arabic_mother_tongue_pct: s.languages.arabic,
      other_pct: s.languages.russian + s.languages.amharic + s.languages.other,
    },
    religion: {
      jewish_pct:    s.religion.jewish,
      muslim_pct:    s.religion.muslim,
      christian_pct: s.religion.christian,
      druze_pct:     s.religion.druze,
    },
  };

  return {
    type: 'Feature',
    geometry: polygon.geometry,
    properties: {
      id: `osm-${s.osmId}`,
      name: s.nameHe || s.name,
      nameEn: s.nameEn || undefined,
      wikidata: s.wikidata || undefined,
      wikipedia: s.wikipedia || undefined,
      demographics,
    },
  };
}

// Pre-build once at module load — the database is static.
const SETTLEMENT_GEOJSON: VillageFeatureCollection = {
  type: 'FeatureCollection',
  features: SETTLEMENT_DATABASE.map(toFeature),
};

/**
 * Returns the pre-built GeoJSON feature collection from the static settlement
 * database. No network calls; instant availability.
 */
export function useSettlementDatabase(): {
  settlements: VillageFeatureCollection;
  isLoading: false;
  error: null;
} {
  // useMemo keeps the reference stable across re-renders without rebuilding.
  const settlements = useMemo(() => SETTLEMENT_GEOJSON, []);
  return { settlements, isLoading: false, error: null };
}
