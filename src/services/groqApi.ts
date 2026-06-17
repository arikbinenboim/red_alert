const GROQ_ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL = 'llama-3.3-70b-versatile';

// Demographic fields we can extract from Wikipedia text.
// Sub-objects are all-or-nothing: if a field is present, all its children are numbers.
export interface EnrichedDemographics {
  total_population?: number;
  gender?: { male_pct: number; female_pct: number };
  age_distribution?: {
    age_0_4: number;
    age_5_19: number;
    age_20_64: number;
    age_65_plus: number;
  };
  religion?: {
    jewish_pct: number;
    muslim_pct: number;
    christian_pct: number;
    druze_pct: number;
  };
}

const SYSTEM_PROMPT = `You are a demographic data extraction assistant specialising in Israeli and Palestinian settlements.
Given a Wikipedia article (which may be in Hebrew, Arabic, or English), extract population and demographic statistics.
Respond ONLY with a JSON object — no prose, no markdown.
Use null for any value not mentioned in the article.
Percentages are 0–100. Population is a whole integer.`;

function buildUserPrompt(text: string, name: string): string {
  return `Extract demographics for the settlement named "${name}" from this Wikipedia article.

Return exactly this JSON structure (use null for missing values):
{
  "total_population": <integer | null>,
  "gender": { "male_pct": <number | null>, "female_pct": <number | null> },
  "age_distribution": { "age_0_4": <number | null>, "age_5_19": <number | null>, "age_20_64": <number | null>, "age_65_plus": <number | null> },
  "religion": { "jewish_pct": <number | null>, "muslim_pct": <number | null>, "christian_pct": <number | null>, "druze_pct": <number | null> }
}

Wikipedia text:
${text}`;
}

interface RawExtraction {
  total_population: number | null;
  gender: { male_pct: number | null; female_pct: number | null };
  age_distribution: {
    age_0_4: number | null;
    age_5_19: number | null;
    age_20_64: number | null;
    age_65_plus: number | null;
  };
  religion: {
    jewish_pct: number | null;
    muslim_pct: number | null;
    christian_pct: number | null;
    druze_pct: number | null;
  };
}

function toEnriched(raw: RawExtraction): EnrichedDemographics {
  const result: EnrichedDemographics = {};

  if (raw.total_population != null) result.total_population = raw.total_population;

  if (raw.gender.male_pct != null && raw.gender.female_pct != null) {
    result.gender = { male_pct: raw.gender.male_pct, female_pct: raw.gender.female_pct };
  }

  const ad = raw.age_distribution;
  if (ad.age_0_4 != null && ad.age_5_19 != null && ad.age_20_64 != null && ad.age_65_plus != null) {
    result.age_distribution = {
      age_0_4: ad.age_0_4,
      age_5_19: ad.age_5_19,
      age_20_64: ad.age_20_64,
      age_65_plus: ad.age_65_plus,
    };
  }

  const rel = raw.religion;
  if (rel.jewish_pct != null || rel.muslim_pct != null || rel.christian_pct != null || rel.druze_pct != null) {
    result.religion = {
      jewish_pct: rel.jewish_pct ?? 0,
      muslim_pct: rel.muslim_pct ?? 0,
      christian_pct: rel.christian_pct ?? 0,
      druze_pct: rel.druze_pct ?? 0,
    };
  }

  return result;
}

/**
 * Calls the Groq LLM to extract demographic data from a Wikipedia article extract.
 * Returns null if the API key is not configured, or on any error.
 */
export async function extractDemographicsFromText(
  text: string,
  settlementName: string,
  opts?: { signal?: AbortSignal },
): Promise<EnrichedDemographics | null> {
  const apiKey = import.meta.env.VITE_GROQ_API_KEY as string | undefined;
  if (!apiKey) return null;

  try {
    const res = await fetch(GROQ_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: buildUserPrompt(text, settlementName) },
        ],
        response_format: { type: 'json_object' },
        temperature: 0,
        max_tokens: 400,
      }),
      signal: opts?.signal,
    });

    if (!res.ok) {
      console.warn(`Groq ${res.status} for "${settlementName}"`);
      return null;
    }

    const data = await res.json();
    const content: string | undefined = data.choices?.[0]?.message?.content;
    if (!content) return null;

    const raw = JSON.parse(content) as RawExtraction;
    return toEnriched(raw);
  } catch {
    return null;
  }
}
