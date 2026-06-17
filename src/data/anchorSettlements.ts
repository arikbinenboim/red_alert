export interface AnchorSettlement {
  id: string;
  name: string;
  lat: number;
  lon: number;
}

// 32°05'28.1"N 35°20'32.9"E → 32.0911°N, 35.3425°E
export const ANCHOR_SETTLEMENTS: AnchorSettlement[] = [
  { id: 'dimona',       name: 'דימונה',        lat: 31.0679, lon: 35.0315 },
  { id: 'tirat-carmel', name: 'טירת כרמל',    lat: 32.7597, lon: 34.9697 },
  { id: 'migdalim',     name: 'מגדלים',        lat: 32.0911, lon: 35.3425 },
];

export const SEARCH_RADIUS_KM = 20;
