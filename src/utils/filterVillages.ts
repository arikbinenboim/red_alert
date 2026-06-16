import type { VillageFeature } from '@/types/demographics';
import type { FilterValues } from '@/store/filtersSlice';

export function villageMatchesFilters(
  village: VillageFeature,
  filters: FilterValues,
  hasSchool: boolean | undefined,
): boolean {
  const d = village.properties.demographics;
  const [minPop, maxPop] = filters.populationRange;
  const under18Pct = d.age_distribution.age_0_4 + d.age_distribution.age_5_19;
  const over65Pct = d.age_distribution.age_65_plus;

  if (d.total_population < minPop || d.total_population > maxPop) return false;
  if (under18Pct > filters.under18PctMax) return false;
  if (over65Pct > filters.over65PctMax) return false;
  // hasSchool === undefined means "not yet resolved" (still fetching, or the
  // public Overpass instance errored) — don't hide the village on uncertainty.
  if (filters.showOnlyWithSchool && hasSchool === false) return false;

  return true;
}
