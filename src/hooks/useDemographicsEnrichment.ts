import { useEffect, useState } from 'react';
import type { VillageFeatureCollection } from '@/types/demographics';
import type { EnrichedDemographics } from '@/services/groqApi';
import { fetchWikipediaExtract } from '@/services/wikipediaApi';
import { extractDemographicsFromText } from '@/services/groqApi';

export type DemographicsEnrichmentMap = Record<string, EnrichedDemographics>;

// Process this many settlements in parallel before waiting for the next batch.
// Keeps us well inside Groq's free-tier rate limit (~30 req/min).
const BATCH_SIZE = 3;
const BATCH_DELAY_MS = 2500;

function sleep(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

/**
 * Progressively enriches settlement demographics by fetching each settlement's
 * Wikipedia article and running Groq LLM extraction on it.
 *
 * Returns a map of settlement id → extracted demographics that updates as
 * each settlement resolves. Settlements without a wikipedia tag are skipped.
 * Any failure (network, Groq error) is silently ignored so the map just stays
 * sparse for that settlement.
 *
 * Does nothing if VITE_GROQ_API_KEY is not set.
 */
export function useDemographicsEnrichment(
  settlements: VillageFeatureCollection,
): DemographicsEnrichmentMap {
  const [enrichmentMap, setEnrichmentMap] = useState<DemographicsEnrichmentMap>({});

  useEffect(() => {
    const apiKey = import.meta.env.VITE_GROQ_API_KEY as string | undefined;
    if (!apiKey || settlements.features.length === 0) return;

    let cancelled = false;
    const controller = new AbortController();

    const enrichable = settlements.features.filter((f) => f.properties.wikipedia);

    async function runBatches() {
      for (let i = 0; i < enrichable.length; i += BATCH_SIZE) {
        if (cancelled) break;

        const batch = enrichable.slice(i, i + BATCH_SIZE);

        await Promise.allSettled(
          batch.map(async (feature) => {
            const { id, name, wikipedia } = feature.properties;
            if (!wikipedia) return;

            const text = await fetchWikipediaExtract(wikipedia, { signal: controller.signal });
            if (!text || cancelled) return;

            const extracted = await extractDemographicsFromText(text, name, {
              signal: controller.signal,
            });
            if (!extracted || cancelled) return;

            setEnrichmentMap((prev) => ({ ...prev, [id]: extracted }));
          }),
        );

        if (!cancelled && i + BATCH_SIZE < enrichable.length) {
          await sleep(BATCH_DELAY_MS);
        }
      }
    }

    runBatches().catch(() => {/* silently ignore top-level errors */});

    return () => {
      cancelled = true;
      controller.abort();
    };
  // Re-run only when the set of settlements changes (new Overpass load).
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settlements.features.length]);

  return enrichmentMap;
}
