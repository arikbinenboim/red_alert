import { GeoJSON } from 'react-leaflet';
import { DomEvent, type Layer, type LeafletMouseEvent } from 'leaflet';
import { sampleVillages } from '@/data/sampleVillages';
import { useAppStore } from '@/store/useAppStore';
import { useVillagesSchoolFlags } from '@/hooks/useVillagesSchoolFlags';
import { villageMatchesFilters } from '@/utils/filterVillages';
import type { VillageFeature } from '@/types/demographics';

const MATCH_OPACITY = 0.8;
const NON_MATCH_OPACITY = 0.1;

function styleFor(isSelected: boolean, matchesFilter: boolean) {
  const fillOpacity = matchesFilter ? MATCH_OPACITY : NON_MATCH_OPACITY;
  return isSelected
    ? { color: '#f59e0b', weight: 1, fillColor: '#f59e0b', fillOpacity }
    : { color: '#38bdf8', weight: 1, fillColor: '#38bdf8', fillOpacity };
}

export function SettlementPolygonsLayer() {
  const selectedSettlementId = useAppStore((s) => s.selectedSettlementId);
  const setSelectedSettlement = useAppStore((s) => s.setSelectedSettlement);
  const filters = useAppStore((s) => s.filters);
  const schoolFlags = useVillagesSchoolFlags(sampleVillages.features, filters.showOnlyWithSchool);

  return (
    <GeoJSON
      key={`${selectedSettlementId ?? 'none'}|${JSON.stringify(filters)}|${JSON.stringify(schoolFlags)}`}
      data={sampleVillages}
      style={(feature) => {
        const props = feature?.properties as VillageFeature['properties'] | undefined;
        if (!props) return styleFor(false, true);
        const village = sampleVillages.features.find((f) => f.properties.id === props.id)!;
        const matches = villageMatchesFilters(village, filters, schoolFlags[props.id]);
        return styleFor(props.id === selectedSettlementId, matches);
      }}
      onEachFeature={(feature, layer: Layer) => {
        const props = feature.properties as VillageFeature['properties'];
        layer.on('click', (e: LeafletMouseEvent) => {
          DomEvent.stopPropagation(e);
          setSelectedSettlement(props.id);
        });
      }}
    />
  );
}
