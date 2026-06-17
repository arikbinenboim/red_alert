// OSM wikipedia tag format: "he:דימונה", "en:Al-Tira, Haifa", etc.
function parseWikipediaTag(tag: string): { lang: string; title: string } | null {
  const colon = tag.indexOf(':');
  if (colon < 2) return null;
  return { lang: tag.slice(0, colon), title: tag.slice(colon + 1) };
}

interface WikipediaSummaryResponse {
  extract?: string;
}

/**
 * Fetches the introductory extract of a Wikipedia article.
 * Returns null on any error (missing article, network, etc.) so the caller
 * can silently skip enrichment for that settlement.
 */
export async function fetchWikipediaExtract(
  wikitag: string,
  opts?: { signal?: AbortSignal },
): Promise<string | null> {
  const parsed = parseWikipediaTag(wikitag);
  if (!parsed) return null;

  const { lang, title } = parsed;
  const url = `https://${lang}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`;

  try {
    const res = await fetch(url, { signal: opts?.signal });
    if (!res.ok) return null;
    const data: WikipediaSummaryResponse = await res.json();
    return data.extract ?? null;
  } catch {
    return null;
  }
}
