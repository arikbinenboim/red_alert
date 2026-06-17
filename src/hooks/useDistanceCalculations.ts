import { useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { aerialDistanceKm, walkingTimeMinFromKm } from '@/utils/distance';
import { fetchOsrmRoute } from '@/services/osrmApi';

/**
 * Drives the distance tool's four parallel computations once both points are
 * set: aerial + extrapolated off-road walking time resolve instantly (turf,
 * no network), while OSRM car/foot/bike routes are fetched in parallel and
 * update the store as they resolve.
 */
export function useDistanceCalculations() {
  const distancePointA = useAppStore((s) => s.distancePointA);
  const distancePointB = useAppStore((s) => s.distancePointB);
  const setDistanceResults = useAppStore((s) => s.setDistanceResults);
  const setRouteGeometry = useAppStore((s) => s.setRouteGeometry);
  const setRoutesLoading = useAppStore((s) => s.setRoutesLoading);
  const setRoutesError = useAppStore((s) => s.setRoutesError);

  useEffect(() => {
    if (!distancePointA || !distancePointB) return;

    const aerialKm = aerialDistanceKm(distancePointA, distancePointB);
    setDistanceResults({ aerialKm, offRoadWalkingMin: walkingTimeMinFromKm(aerialKm) });

    let cancelled = false;
    setRoutesLoading(true);
    setRoutesError(null);

    const carPromise = fetchOsrmRoute(distancePointA, distancePointB, 'car').then((route) => {
      if (cancelled) return;
      setDistanceResults({ drivingKm: route.distanceKm, drivingMin: route.durationMin });
      setRouteGeometry('car', route.geometry);
    });

    const walkingPromise = fetchOsrmRoute(distancePointA, distancePointB, 'foot').then((route) => {
      if (cancelled) return;
      setDistanceResults({ onRoadWalkingKm: route.distanceKm, onRoadWalkingMin: route.durationMin });
      setRouteGeometry('walking', route.geometry);
    });

    const bikingPromise = fetchOsrmRoute(distancePointA, distancePointB, 'bike').then((route) => {
      if (cancelled) return;
      setDistanceResults({ bikingKm: route.distanceKm, bikingMin: route.durationMin });
      setRouteGeometry('bike', route.geometry);
    });

    Promise.allSettled([carPromise, walkingPromise, bikingPromise]).then((results) => {
      if (cancelled) return;
      const errors = results.filter((r) => r.status === 'rejected') as PromiseRejectedResult[];
      if (errors.length > 0) {
        setRoutesError(`OSRM route lookup failed (${errors.length}/3) — public instance may be rate-limited.`);
      }
      setRoutesLoading(false);
    });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [distancePointA, distancePointB]);
}
