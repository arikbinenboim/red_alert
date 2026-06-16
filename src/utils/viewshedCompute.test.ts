import { describe, it, expect } from 'vitest';
import { buildRays, computeVisibleDistanceKm, buildViewshedPolygon, RAY_COUNT, SAMPLES_PER_RAY } from './viewshedCompute';

describe('buildRays', () => {
  it('produces RAY_COUNT rays each with SAMPLES_PER_RAY points', () => {
    const rays = buildRays(31.6, 34.8, 5);
    expect(rays).toHaveLength(RAY_COUNT);
    for (const ray of rays) {
      expect(ray.points).toHaveLength(SAMPLES_PER_RAY);
      expect(ray.distancesKm).toHaveLength(SAMPLES_PER_RAY);
    }
  });

  it('spaces ray distances evenly up to the radius', () => {
    const rays = buildRays(31.6, 34.8, 5);
    expect(rays[0].distancesKm[SAMPLES_PER_RAY - 1]).toBeCloseTo(5, 5);
    expect(rays[0].distancesKm[0]).toBeCloseTo(5 / SAMPLES_PER_RAY, 5);
  });

  it('spreads ray bearings evenly across 360 degrees', () => {
    const rays = buildRays(31.6, 34.8, 5);
    expect(rays[0].bearingDeg).toBe(0);
    expect(rays[1].bearingDeg).toBeCloseTo(360 / RAY_COUNT, 5);
  });
});

describe('computeVisibleDistanceKm', () => {
  const distancesKm = [1, 2, 3, 4, 5];

  it('returns the farthest distance when terrain is flat (no obstruction)', () => {
    const flatElevations = [100, 100, 100, 100, 100];
    expect(computeVisibleDistanceKm(100, flatElevations, distancesKm)).toBe(5);
  });

  it('returns the farthest distance when terrain rises monotonically toward the observer\'s eye line', () => {
    const risingElevations = [100, 150, 200, 250, 300];
    expect(computeVisibleDistanceKm(100, risingElevations, distancesKm)).toBe(5);
  });

  it('truncates the ray at the first point that drops below the horizon angle', () => {
    // Steep nearby hill blocks everything behind it.
    const elevations = [500, 100, 100, 100, 100];
    expect(computeVisibleDistanceKm(100, elevations, distancesKm)).toBe(1);
  });

  it('treats a continuously flattening downhill slope as fully visible', () => {
    // Elevation keeps dropping, but the angle below the observer's eye line
    // keeps shrinking toward the horizon as distance grows, so each point
    // remains visible (true downhill sightline behavior).
    const elevations = [50, 40, 30, 20, 10];
    expect(computeVisibleDistanceKm(100, elevations, distancesKm)).toBe(5);
  });

  it('still returns the first sample distance even when it is the only visible one', () => {
    const elevations = [500, 100, 100, 100, 100];
    expect(computeVisibleDistanceKm(100, elevations, distancesKm)).toBe(distancesKm[0]);
  });
});

describe('buildViewshedPolygon', () => {
  it('produces a closed polygon ring with one extra point matching the first', () => {
    const rays = buildRays(31.6, 34.8, 5);
    const visibleDistancesKm = rays.map(() => 5);
    const feature = buildViewshedPolygon(31.6, 34.8, rays, visibleDistancesKm);

    expect(feature.geometry.type).toBe('Polygon');
    const ring = feature.geometry.coordinates[0];
    expect(ring).toHaveLength(RAY_COUNT + 1);
    expect(ring[0]).toEqual(ring[ring.length - 1]);
  });

  it('produces a smaller silhouette when visible distances shrink', () => {
    const rays = buildRays(31.6, 34.8, 5);
    const fullDistances = rays.map(() => 5);
    const shrunkDistances = rays.map(() => 1);

    const fullFeature = buildViewshedPolygon(31.6, 34.8, rays, fullDistances);
    const shrunkFeature = buildViewshedPolygon(31.6, 34.8, rays, shrunkDistances);

    // First ray (bearing 0, due north) should be farther from the observer in the full case.
    const [obsLon, obsLat] = [34.8, 31.6];
    const distSq = (coord: number[]) => (coord[0] - obsLon) ** 2 + (coord[1] - obsLat) ** 2;
    expect(distSq(fullFeature.geometry.coordinates[0][0])).toBeGreaterThan(
      distSq(shrunkFeature.geometry.coordinates[0][0]),
    );
  });
});
