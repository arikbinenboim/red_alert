import { TileLayer } from 'react-leaflet';

// CartoDB DarkMatter tiles no longer serve valid tiles (404). Using ESRI
// World Dark Gray Base instead — free, keyless, CORS-enabled. The URL uses
// ESRI's {z}/{y}/{x} path order (row before column), which Leaflet handles
// correctly via its {y}/{x} template variables.
export const MAP_TILE_CONFIG = {
  url: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',
  attribution:
    'Tiles &copy; <a href="https://www.esri.com/">Esri</a> &mdash; Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NPS, NRCAN, GeoBase, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), and the GIS User Community',
};

export function TileLayerDark() {
  return <TileLayer url={MAP_TILE_CONFIG.url} attribution={MAP_TILE_CONFIG.attribution} />;
}
