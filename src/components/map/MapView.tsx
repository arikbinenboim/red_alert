import { useEffect } from 'react';
import { MapContainer, useMapEvents } from 'react-leaflet';
import { useAppStore } from '@/store/useAppStore';
import { useViewshedWorker } from '@/hooks/useViewshedWorker';
import { useDistanceCalculations } from '@/hooks/useDistanceCalculations';
import { TileLayerDark } from './TileLayerDark';
import { SettlementPolygonsLayer } from './SettlementPolygonsLayer';
import { PoiMarkersLayer } from './PoiMarkersLayer';
import { ViewshedLayer } from './ViewshedLayer';
import { DistanceToolLayer } from './DistanceToolLayer';

const VIEWSHED_RADIUS_KM = 5;

function MapClickHandler() {
  const toolMode = useAppStore((s) => s.toolMode);
  const setSelectedSettlement = useAppStore((s) => s.setSelectedSettlement);
  const setViewshedObserver = useAppStore((s) => s.setViewshedObserver);
  const setViewshedResult = useAppStore((s) => s.setViewshedResult);
  const setDistancePoint = useAppStore((s) => s.setDistancePoint);
  const resetDistanceTool = useAppStore((s) => s.resetDistanceTool);
  const distancePointA = useAppStore((s) => s.distancePointA);
  const distancePointB = useAppStore((s) => s.distancePointB);
  const { compute, result } = useViewshedWorker();
  useDistanceCalculations();

  useMapEvents({
    click(e) {
      const point = { lat: e.latlng.lat, lon: e.latlng.lng };

      if (toolMode === 'viewshed') {
        setViewshedObserver(point);
        compute({ observerLat: point.lat, observerLon: point.lon, radiusKm: VIEWSHED_RADIUS_KM });
        return;
      }

      if (toolMode === 'distance') {
        if (!distancePointA || (distancePointA && distancePointB)) {
          resetDistanceTool();
          setDistancePoint('A', point);
        } else {
          setDistancePoint('B', point);
        }
        return;
      }

      // Pan mode: clicking blank map space clears the current settlement selection.
      setSelectedSettlement(null);
    },
  });

  // Push the worker's latest result into the store as it resolves.
  useEffect(() => {
    if (result) setViewshedResult(result);
  }, [result, setViewshedResult]);

  return null;
}

export function MapView() {
  return (
    <MapContainer
      center={[31.6, 34.8]}
      zoom={12}
      preferCanvas
      className="isolate h-full w-full"
    >
      <TileLayerDark />
      <SettlementPolygonsLayer />
      <PoiMarkersLayer />
      <ViewshedLayer />
      <DistanceToolLayer />
      <MapClickHandler />
    </MapContainer>
  );
}
