import { useMemo } from 'react';
import { GeoJSON } from 'react-leaflet';
import { DomEvent, type Layer, type LeafletMouseEvent } from 'leaflet';
import { useSettlementDatabase } from '@/hooks/useSettlementDatabase';
import { useDemographicsEnrichment } from '@/hooks/useDemographicsEnrichment';
import { useAppStore } from '@/store/useAppStore';
import { useVillagesSchoolFlags } from '@/hooks/useVillagesSchoolFlags';
import { villageMatchesFilters } from '@/utils/filterVillages';
import type { VillageDemographics, VillageFeature } from '@/types/demographics';
import type { EnrichedDemographics } from '@/services/groqApi';

const MATCH_OPACITY = 0.8;
const NON_MATCH_OPACITY = 0.1;

function styleFor(isSelected: boolean, matchesFilter: boolean) {
  const fillOpacity = matchesFilter ? MATCH_OPACITY : NON_MATCH_OPACITY;
  return isSelected
    ? { color: '#f59e0b', weight: 1, fillColor: '#f59e0b', fillOpacity }
    : { color: '#38bdf8', weight: 1, fillColor: '#38bdf8', fillOpacity };
}

function mergeDemo(base: VillageDemographics, extra: EnrichedDemographics): VillageDemographics {
  return {
    total_population: extra.total_population ?? base.total_population,
    gender: extra.gender ?? base.gender,
    age_distribution: extra.age_distribution ?? base.age_distribution,
    languages: base.languages,
    religion: extra.religion ?? base.religion,
  };
}

export function SettlementPolygonsLayer() {
  const selectedSettlementId = useAppStore((s) => s.selectedSettlementId);
  const setSelectedSettlement = useAppStore((s) => s.setSelectedSettlement);
  const filters = useAppStore((s) => s.filters);

  const { settlements, isLoading } = useSettlementDatabase();
  const enrichmentMap = useDemographicsEnrichment(settlements);

  // Merge enriched demographics into features so filters see real data.
  const enrichedSettlements = useMemo(
    () => ({
      ...settlements,
      features: settlements.features.map((f) => {
        const extra = enrichmentMap[f.properties.id];
        if (!extra) return f;
        return {
          ...f,
          properties: {
            ...f.properties,
            demographics: mergeDemo(f.properties.demographics, extra),
          },
        };
      }),
    }),
    [settlements, enrichmentMap],
  );

  const schoolFlags = useVillagesSchoolFlags(enrichedSettlements.features, filters.showOnlyWithSchool);

  if (isLoading || enrichedSettlements.features.length === 0) return null;

  return (
    <GeoJSON
      key={`${selectedSettlementId ?? 'none'}|${JSON.stringify(filters)}|${JSON.stringify(schoolFlags)}|${Object.keys(enrichmentMap).length}`}
      data={enrichedSettlements}
      style={(feature) => {
        const props = feature?.properties as VillageFeature['properties'] | undefined;
        if (!props) return styleFor(false, true);
        const village = enrichedSettlements.features.find((f) => f.properties.id === props.id)!;
        const matches = villageMatchesFilters(village, filters, schoolFlags[props.id]);
        return styleFor(props.id === selectedSettlementId, matches);
      }}
      onEachFeature={(feature, layer: Layer) => {
        const props = feature.properties as VillageFeature['properties'];
        layer.on('click', (e: LeafletMouseEvent) => {
          DomEvent.stopPropagation(e);
          setSelectedSettlement(props.id, props.name);
        });
      }}
    />
  );
}
