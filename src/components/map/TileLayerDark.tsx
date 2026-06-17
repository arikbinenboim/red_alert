import { TileLayer } from 'react-leaflet';
import { useAppStore } from '@/store/useAppStore';

// Both sources are ESRI — free, keyless, CORS-enabled.
// ESRI uses {z}/{y}/{x} path order (row before column); Leaflet's {y}/{x}
// template variables map correctly to that order.
const TILE_CONFIGS = {
  dark: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; <a href="https://www.esri.com/">Esri</a> &mdash; Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NPS, NRCAN, GeoBase, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), and the GIS User Community',
  },
  satellite: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; <a href="https://www.esri.com/">Esri</a> &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
  },
};

export function TileLayerDark() {
  const baseLayer = useAppStore((s) => s.baseLayer);
  const config = TILE_CONFIGS[baseLayer];
  return <TileLayer key={baseLayer} url={config.url} attribution={config.attribution} />;
}
