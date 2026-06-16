import { describe, it, expect } from 'vitest';
import { aerialDistanceKm, walkingTimeMinFromKm } from './distance';

describe('aerialDistanceKm', () => {
  it('matches the known real-world distance between two landmarks (Eiffel Tower -> Arc de Triomphe ~1.7km)', () => {
    const eiffel = { lat: 48.8584, lon: 2.2945 };
    const arc = { lat: 48.8738, lon: 2.295 };
    const km = aerialDistanceKm(eiffel, arc);
    expect(km).toBeGreaterThan(1.5);
    expect(km).toBeLessThan(2.0);
  });

  it('returns 0 for identical points', () => {
    const p = { lat: 10, lon: 20 };
    expect(aerialDistanceKm(p, p)).toBe(0);
  });
});

describe('walkingTimeMinFromKm', () => {
  it('matches distance / speed * 60', () => {
    expect(walkingTimeMinFromKm(4)).toBeCloseTo(60, 6);
    expect(walkingTimeMinFromKm(2)).toBeCloseTo(30, 6);
  });

  it('respects a custom speed', () => {
    expect(walkingTimeMinFromKm(5, 5)).toBeCloseTo(60, 6);
  });
});
