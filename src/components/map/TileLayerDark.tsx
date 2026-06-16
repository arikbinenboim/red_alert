import { TileLayer } from 'react-leaflet';

// Tile source tradeoff: OpenFreeMap serves vector tiles (MapLibre style/PBF),
// which react-leaflet's TileLayer cannot render directly. CartoDB DarkMatter
// is a free, keyless raster XYZ alternative that matches the dark tactical
// theme. Swapping tile sources later only requires changing this config.
export const MAP_TILE_CONFIG = {
  url: 'https://{s}.basemaps.cartocdn.com/dark_matter/{z}/{x}/{y}{r}.png',
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
};

export function TileLayerDark() {
  return <TileLayer url={MAP_TILE_CONFIG.url} attribution={MAP_TILE_CONFIG.attribution} />;
}
