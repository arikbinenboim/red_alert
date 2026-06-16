import { CircleMarker, Tooltip } from 'react-leaflet';
import { useEffect, useMemo } from 'react';
import { sampleVillages } from '@/data/sampleVillages';
import { useAppStore } from '@/store/useAppStore';
import { useOverpassPois } from '@/hooks/useOverpassPois';
import { polygonToBbox } from '@/utils/bbox';
import { filterPoisInPolygon } from '@/services/overpassApi';
import type { PoiCategory } from '@/types/poi';

const CATEGORY_COLORS: Record<PoiCategory, string> = {
  education: '#8b5cf6', // violet
  leisure: '#10b981', // emerald
  public: '#f59e0b', // amber
};

export function PoiMarkersLayer() {
  const selectedSettlementId = useAppStore((s) => s.selectedSettlementId);

  const selectedFeature = useMemo(
    () => sampleVillages.features.find((f) => f.properties.id === selectedSettlementId) ?? null,
    [selectedSettlementId],
  );

  const bbox = useMemo(
    () => (selectedFeature ? polygonToBbox(selectedFeature.geometry) : null),
    [selectedFeature],
  );

  const { pois, isLoading, error } = useOverpassPois(bbox);
  const setPoiLoading = useAppStore((s) => s.setPoiLoading);
  const setPoiError = useAppStore((s) => s.setPoiError);

  useEffect(() => {
    setPoiLoading(isLoading);
    setPoiError(error);
  }, [isLoading, error, setPoiLoading, setPoiError]);

  const visiblePois = useMemo(
    () => (selectedFeature ? filterPoisInPolygon(pois, selectedFeature.geometry) : []),
    [pois, selectedFeature],
  );

  return (
    <>
      {visiblePois.map((poi) => (
        <CircleMarker
          key={poi.id}
          center={[poi.lat, poi.lon]}
          radius={6}
          pathOptions={{ color: CATEGORY_COLORS[poi.category], fillOpacity: 0.9 }}
        >
          <Tooltip>{poi.tags.name ?? poi.category}</Tooltip>
        </CircleMarker>
      ))}
    </>
  );
}
