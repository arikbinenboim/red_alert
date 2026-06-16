import { useEffect, useState } from 'react';
import type { Poi, BboxTuple } from '@/types/poi';
import { fetchPoisInBbox } from '@/services/overpassApi';

export function useOverpassPois(bbox: BboxTuple | null) {
  const [pois, setPois] = useState<Poi[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!bbox) {
      setPois([]);
      return;
    }

    const controller = new AbortController();
    setIsLoading(true);
    setError(null);

    fetchPoisInBbox(bbox, { signal: controller.signal })
      .then((result) => {
        setPois(result);
        setIsLoading(false);
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return;
        setError(err instanceof Error ? err.message : 'Failed to fetch POIs');
        setIsLoading(false);
      });

    return () => controller.abort();
  }, [bbox]);

  return { pois, isLoading, error };
}
