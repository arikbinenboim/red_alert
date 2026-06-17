import { useAppStore } from '@/store/useAppStore';

function formatMetric(value: number | null, unit: string, digits = 1) {
  return value === null ? '—' : `${value.toFixed(digits)} ${unit}`;
}

export function BottomHud() {
  const selectedSettlementName = useAppStore((s) => s.selectedSettlementName);
  const toolMode = useAppStore((s) => s.toolMode);
  const distanceResults = useAppStore((s) => s.distanceResults);
  const routesLoading = useAppStore((s) => s.routesLoading);
  const routesError = useAppStore((s) => s.routesError);
  const poiLoading = useAppStore((s) => s.poiLoading);
  const poiError = useAppStore((s) => s.poiError);

  return (
    <div className="absolute bottom-4 left-1/2 z-10 -translate-x-1/2 rounded-xl border border-zinc-800 bg-zinc-900/60 px-6 py-3 text-sm text-zinc-100 backdrop-blur-md">
      <div className="flex items-center gap-6">
        <span>
          <span className="text-zinc-400">Selected: </span>
          {selectedSettlementName ?? 'None'}
        </span>

        {selectedSettlementName && poiLoading && <span className="text-zinc-400">POIs loading…</span>}
        {selectedSettlementName && poiError && <span className="text-amber-400">POIs unavailable</span>}

        {toolMode === 'distance' && (
          <>
            <span>
              <span className="text-zinc-400">Aerial: </span>
              {formatMetric(distanceResults.aerialKm, 'km')}
              {' ('}
              {formatMetric(distanceResults.offRoadWalkingMin, 'min off-road', 0)}
              {')'}
            </span>
            <span>
              <span className="text-blue-400">Car: </span>
              {formatMetric(distanceResults.drivingKm, 'km')} /{' '}
              {formatMetric(distanceResults.drivingMin, 'min', 0)}
            </span>
            <span>
              <span className="text-teal-400">Foot: </span>
              {formatMetric(distanceResults.onRoadWalkingKm, 'km')} /{' '}
              {formatMetric(distanceResults.onRoadWalkingMin, 'min', 0)}
            </span>
            <span>
              <span className="text-orange-400">Bike: </span>
              {formatMetric(distanceResults.bikingKm, 'km')} /{' '}
              {formatMetric(distanceResults.bikingMin, 'min', 0)}
            </span>
            {routesLoading && <span className="text-zinc-400">Routing…</span>}
            {routesError && <span className="text-amber-400">{routesError}</span>}
          </>
        )}
      </div>
    </div>
  );
}
