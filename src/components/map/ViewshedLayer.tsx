import { GeoJSON, Marker } from 'react-leaflet';
import { useAppStore } from '@/store/useAppStore';

const viewshedStyle = {
  color: '#22c55e',
  weight: 1,
  fillColor: '#22c55e',
  fillOpacity: 0.4,
};

export function ViewshedLayer() {
  const viewshedObserver = useAppStore((s) => s.viewshedObserver);
  const viewshedResult = useAppStore((s) => s.viewshedResult);

  return (
    <>
      {viewshedObserver && <Marker position={[viewshedObserver.lat, viewshedObserver.lon]} />}
      {viewshedResult?.sectors.map((sector, i) => (
        <GeoJSON key={i} data={sector} style={viewshedStyle} />
      ))}
    </>
  );
}
