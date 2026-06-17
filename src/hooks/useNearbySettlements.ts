import { useEffect, useState } from 'react';
import type { VillageFeatureCollection } from '@/types/demographics';
import type { AnchorSettlement } from '@/data/anchorSettlements';
import { fetchSettlementsAround } from '@/services/overpassApi';

const EMPTY: VillageFeatureCollection = { type: 'FeatureCollection', features: [] };

export function useNearbySettlements(anchors: AnchorSettlement[], radiusKm: number) {
  const [settlements, setSettlements] = useState<VillageFeatureCollection>(EMPTY);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (anchors.length === 0) return;

    const controller = new AbortController();
    setIsLoading(true);
    setError(null);

    fetchSettlementsAround(anchors, radiusKm * 1000, { signal: controller.signal })
      .then((result) => {
        setSettlements(result);
        setIsLoading(false);
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return;
        setError(err instanceof Error ? err.message : 'Failed to fetch settlements');
        setIsLoading(false);
      });

    return () => controller.abort();
  // anchors array identity is stable from the constant — eslint wants the dep but it won't change
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [radiusKm]);

  return { settlements, isLoading, error };
}
