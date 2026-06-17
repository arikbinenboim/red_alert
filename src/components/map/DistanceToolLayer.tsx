import { Marker, Polyline } from 'react-leaflet';
import { useAppStore } from '@/store/useAppStore';

function lineStringToLatLngs(geometry: GeoJSON.LineString): [number, number][] {
  return geometry.coordinates.map(([lon, lat]) => [lat, lon]);
}

export function DistanceToolLayer() {
  const distancePointA = useAppStore((s) => s.distancePointA);
  const distancePointB = useAppStore((s) => s.distancePointB);
  const carRouteGeometry = useAppStore((s) => s.carRouteGeometry);
  const walkingRouteGeometry = useAppStore((s) => s.walkingRouteGeometry);
  const bikingRouteGeometry = useAppStore((s) => s.bikingRouteGeometry);

  return (
    <>
      {distancePointA && <Marker position={[distancePointA.lat, distancePointA.lon]} />}
      {distancePointB && <Marker position={[distancePointB.lat, distancePointB.lon]} />}
      {distancePointA && distancePointB && (
        <Polyline
          positions={[
            [distancePointA.lat, distancePointA.lon],
            [distancePointB.lat, distancePointB.lon],
          ]}
          pathOptions={{ color: '#f43f5e', weight: 2, dashArray: '6 6' }}
        />
      )}
      {carRouteGeometry && (
        <Polyline
          positions={lineStringToLatLngs(carRouteGeometry)}
          pathOptions={{ color: '#3b82f6', weight: 3 }}
        />
      )}
      {walkingRouteGeometry && (
        <Polyline
          positions={lineStringToLatLngs(walkingRouteGeometry)}
          pathOptions={{ color: '#14b8a6', weight: 3, dashArray: '2 6' }}
        />
      )}
      {bikingRouteGeometry && (
        <Polyline
          positions={lineStringToLatLngs(bikingRouteGeometry)}
          pathOptions={{ color: '#f97316', weight: 3, dashArray: '8 4' }}
        />
      )}
    </>
  );
}
