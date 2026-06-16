import { describe, it, expect, vi, afterEach } from 'vitest';
import { fetchOsrmRoute } from './osrmApi';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('fetchOsrmRoute', () => {
  it('converts meters/seconds to km/minutes and passes through geometry', async () => {
    const mockGeometry: GeoJSON.LineString = { type: 'LineString', coordinates: [[13.37, 52.51], [13.39, 52.52]] };
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        routes: [{ distance: 1740, duration: 240, geometry: mockGeometry }],
      }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const result = await fetchOsrmRoute({ lat: 52.51, lon: 13.37 }, { lat: 52.52, lon: 13.39 }, 'driving');

    expect(result.distanceKm).toBeCloseTo(1.74, 6);
    expect(result.durationMin).toBeCloseTo(4, 6);
    expect(result.geometry).toEqual(mockGeometry);
  });

  it('builds the URL with the given profile and lon,lat order', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ routes: [{ distance: 100, duration: 10, geometry: { type: 'LineString', coordinates: [] } }] }),
    });
    vi.stubGlobal('fetch', fetchMock);

    await fetchOsrmRoute({ lat: 1, lon: 2 }, { lat: 3, lon: 4 }, 'foot');

    const calledUrl = fetchMock.mock.calls[0][0] as string;
    expect(calledUrl).toContain('/route/v1/foot/2,1;4,3');
  });

  it('throws when the response is not ok', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 504, statusText: 'Gateway Timeout' }));
    await expect(fetchOsrmRoute({ lat: 1, lon: 2 }, { lat: 3, lon: 4 }, 'driving')).rejects.toThrow(/504/);
  });

  it('throws when no route is returned', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({ routes: [] }) }));
    await expect(fetchOsrmRoute({ lat: 1, lon: 2 }, { lat: 3, lon: 4 }, 'driving')).rejects.toThrow(/no route/);
  });
});
