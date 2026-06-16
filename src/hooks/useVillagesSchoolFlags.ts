import { useEffect, useState } from 'react';
import type { VillageFeature } from '@/types/demographics';
import { fetchPoisInBbox } from '@/services/overpassApi';
import { polygonToBbox } from '@/utils/bbox';

/**
 * Lazily determines, per village, whether its bbox contains an education POI
 * (school/kindergarten/college). Only fires Overpass requests once `enabled`
 * is true, and only for villages not already resolved — avoids hitting the
 * public Overpass instance unless the "Has school" filter is actually used.
 * `undefined` means "not yet known" (still loading or not requested).
 */
export function useVillagesSchoolFlags(villages: VillageFeature[], enabled: boolean) {
  const [flags, setFlags] = useState<Record<string, boolean | undefined>>({});

  useEffect(() => {
    if (!enabled) return;

    const pending = villages.filter((v) => flags[v.properties.id] === undefined);
    if (pending.length === 0) return;

    pending.forEach((village) => {
      const bbox = polygonToBbox(village.geometry);
      fetchPoisInBbox(bbox)
        .then((pois) => {
          const hasSchool = pois.some((p) => p.category === 'education');
          setFlags((prev) => ({ ...prev, [village.properties.id]: hasSchool }));
        })
        .catch(() => {
          // Public Overpass instance can be flaky/rate-limited — default to
          // "unknown" so the filter doesn't hide villages on a transient error.
          setFlags((prev) => ({ ...prev, [village.properties.id]: undefined }));
        });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, villages]);

  return flags;
}
