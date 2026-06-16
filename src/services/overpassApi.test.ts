import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { fetchPoisInBbox, filterPoisInPolygon, clearPoiCache } from './overpassApi';
import type { Poi } from '@/types/poi';

beforeEach(() => {
  clearPoiCache();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('fetchPoisInBbox', () => {
  it('parses Overpass elements into typed Pois, dropping unmatched tags', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        elements: [
          { id: 1, lat: 52.51, lon: 13.37, tags: { amenity: 'school' } },
          { id: 2, lat: 52.52, lon: 13.38, tags: { shop: 'bakery' } }, // unmatched -> dropped
          { id: 3, lat: 52.53, lon: 13.39, tags: { leisure: 'park' } },
        ],
      }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const pois = await fetchPoisInBbox([52.5, 13.36, 52.54, 13.4]);

    expect(pois).toHaveLength(2);
    expect(pois.find((p) => p.id === 1)?.category).toBe('education');
    expect(pois.find((p) => p.id === 3)?.category).toBe('leisure');
    expect(pois.find((p) => p.id === 2)).toBeUndefined();
  });

  it('sends a POST with a form-encoded Overpass QL body', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ elements: [] }) });
    vi.stubGlobal('fetch', fetchMock);

    await fetchPoisInBbox([1, 2, 3, 4]);

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('https://overpass-api.de/api/interpreter');
    expect(init.method).toBe('POST');
    expect(init.headers['Content-Type']).toBe('application/x-www-form-urlencoded');
    expect(init.body).toContain('data=');
  });

  it('caches results per bbox so a second call does not hit the network again', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ elements: [] }) });
    vi.stubGlobal('fetch', fetchMock);

    const bbox: [number, number, number, number] = [1, 2, 3, 4];
    await fetchPoisInBbox(bbox);
    await fetchPoisInBbox(bbox);

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('throws a descriptive error when the response is not ok', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 406, statusText: 'Not Acceptable' }));
    await expect(fetchPoisInBbox([1, 2, 3, 4])).rejects.toThrow(/406/);
  });
});

describe('filterPoisInPolygon', () => {
  it('keeps only points strictly inside the polygon', () => {
    const polygon: GeoJSON.Polygon = {
      type: 'Polygon',
      coordinates: [[[0, 0], [10, 0], [10, 10], [0, 10], [0, 0]]],
    };
    const pois: Poi[] = [
      { id: 1, lat: 5, lon: 5, tags: {}, category: 'leisure' }, // inside
      { id: 2, lat: 20, lon: 20, tags: {}, category: 'leisure' }, // outside
    ];

    const filtered = filterPoisInPolygon(pois, polygon);
    expect(filtered.map((p) => p.id)).toEqual([1]);
  });
});
