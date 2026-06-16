export interface VillageDemographics {
  total_population: number;
  gender: {
    male_pct: number;
    female_pct: number;
  };
  age_distribution: {
    age_0_4: number;
    age_5_19: number;
    age_20_64: number;
    age_65_plus: number;
  };
  languages: {
    hebrew_mother_tongue_pct: number;
    arabic_mother_tongue_pct: number;
    other_pct: number;
  };
  religion: {
    jewish_pct: number;
    muslim_pct: number;
    christian_pct: number;
    druze_pct: number;
  };
}

export interface VillageProperties {
  id: string;
  name: string;
  demographics: VillageDemographics;
}

export type VillageFeature = GeoJSON.Feature<GeoJSON.Polygon, VillageProperties>;

export type VillageFeatureCollection = GeoJSON.FeatureCollection<GeoJSON.Polygon, VillageProperties>;
