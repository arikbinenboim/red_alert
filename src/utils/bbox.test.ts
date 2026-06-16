import { describe, it, expect } from 'vitest';
import { polygonToBbox, roundBbox, bboxToCacheKey } from './bbox';

describe('polygonToBbox', () => {
  it('returns [south, west, north, east]', () => {
    const polygon: GeoJSON.Polygon = {
      type: 'Polygon',
      coordinates: [[[10, 20], [10.01, 20], [10.01, 20.01], [10, 20.01], [10, 20]]],
    };
    const bbox = polygonToBbox(polygon);
    expect(bbox).toEqual([20, 10, 20.01, 10.01]);
  });
});

describe('roundBbox', () => {
  it('rounds each coordinate to the given precision', () => {
    const rounded = roundBbox([20.123456, 10.123456, 20.654321, 10.654321], 4);
    expect(rounded).toEqual([20.1235, 10.1235, 20.6543, 10.6543]);
  });

  it('defaults to 4 decimal places', () => {
    const rounded = roundBbox([1.123456789, 2.123456789, 3.123456789, 4.123456789]);
    expect(rounded).toEqual([1.1235, 2.1235, 3.1235, 4.1235]);
  });
});

describe('bboxToCacheKey', () => {
  it('is stable across float jitter under the rounding precision', () => {
    const key1 = bboxToCacheKey([20.00001, 10.00001, 20.01, 10.01]);
    const key2 = bboxToCacheKey([20.00002, 10.00002, 20.01, 10.01]);
    expect(key1).toBe(key2);
  });

  it('differs for meaningfully different bboxes', () => {
    const key1 = bboxToCacheKey([20, 10, 21, 11]);
    const key2 = bboxToCacheKey([22, 12, 23, 13]);
    expect(key1).not.toBe(key2);
  });
});
