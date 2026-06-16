import { distance as turfDistance, point } from '@turf/turf';
import type { DistanceToolPoint } from '@/types/distanceTool';

export function aerialDistanceKm(a: DistanceToolPoint, b: DistanceToolPoint): number {
  return turfDistance(point([a.lon, a.lat]), point([b.lon, b.lat]), { units: 'kilometers' });
}

export function walkingTimeMinFromKm(km: number, speedKmh = 4): number {
  return (km / speedKmh) * 60;
}
