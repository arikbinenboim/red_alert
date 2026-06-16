# Geospatial Village Analysis Dashboard

A $0-cost, fully client-side dashboard for regional village analysis: demographic filtering, contextual POI lookup, 5km viewshed analysis, and a tri-mode distance calculator. No backend — everything runs in the browser, using free/keyless public APIs.

## Stack

React + Vite + TypeScript, Tailwind CSS v4, shadcn/ui, react-leaflet, @turf/turf, zustand.

## Running locally

```bash
npm install
npm run dev
```

## Testing

```bash
npm test
```

Vitest covers the pure utils (`bbox`, `distance`, `overpassQueryBuilder`, `filterVillages`, `viewshedCompute`), the Overpass/OSRM services with mocked `fetch` (cache behavior, error handling, request shape), and a sample-dataset schema sanity check. The viewshed and distance-tool browser flows, and the live public-API integrations, were verified manually rather than via automated end-to-end tests — there's no E2E browser test suite (e.g. Playwright) wired up yet.

## Deploying for free

`npm run build` produces a static `dist/` folder — deploy it to Netlify, Vercel, or GitHub Pages (all have free static-hosting tiers).

## Known tradeoffs & limitations

- **Tile source**: the spec called for OpenFreeMap, but OpenFreeMap serves vector tiles (MapLibre style/PBF), which `react-leaflet`'s `TileLayer` cannot render directly without dropping Leaflet for MapLibre. We use **CartoDB DarkMatter** raster XYZ tiles instead — free, keyless, and matches the dark tactical theme (an option the spec explicitly allows). The tile URL lives in one file ([src/components/map/TileLayerDark.tsx](src/components/map/TileLayerDark.tsx)) so swapping sources later is a one-file change.
- **Public API rate limits**: both the Overpass API instance (`overpass-api.de`) and the OSRM demo server (`router.project-osrm.org`) are shared, free, public instances with documented fair-use policies — no bulk/heavy automated use, no uptime guarantee. This project does not implement retry/backoff/queueing against rate limiting; that's a deliberate non-goal for now. In practice, `overpass-api.de` can outright reject requests with `406 Not Acceptable` when it's rate-limiting/blocking a client (observed during testing), not just time out — so a `406` from `fetchPoisInBbox` should be treated the same as any other transient Overpass failure, not as a client-side bug.

## What's implemented

- Project scaffold, Tailwind v4 + shadcn wiring, `@` path aliases.
- Zustand store (filters, selection, POI cache, tool mode, viewshed, distance tool, sidebar UI).
- Overpass service: query building, fetch + parse, in-memory bbox cache, 300ms debounce wrapper, turf-based polygon filter.
- OSRM service: typed driving/walking route fetchers.
- Web Worker message protocol + `useViewshedWorker` lifecycle hook.
- Map shell with correct layer order and dark tiles; sidebar/toolbar/HUD shell components wired to the store.
- Sample dataset of 5 villages conforming to the demographics schema.
- **Demographic filters** ([src/utils/filterVillages.ts](src/utils/filterVillages.ts)): population range and age-distribution sliders restyle settlement polygons live (80% opacity match / 10% non-match). The "Has school" switch lazily fetches POIs per village bbox via Overpass ([src/hooks/useVillagesSchoolFlags.ts](src/hooks/useVillagesSchoolFlags.ts)) — villages aren't hidden while that lookup is pending or if it errors, since the public instance can be flaky.
- **Contextual POI highlighting**: clicking a settlement fetches POIs for its bbox, filters them to ones strictly inside the polygon via `turf.booleanPointInPolygon`, and renders them color-coded by category; cleared on deselect.
- **5km viewshed analysis** ([src/workers/viewshedWorker.ts](src/workers/viewshedWorker.ts), [src/utils/viewshedCompute.ts](src/utils/viewshedCompute.ts)): real elevation-based line-of-sight. The worker samples 24 rays × 8 distances out to 5km, batches all points into a single request to the free [Open-Elevation](https://www.open-elevation.com/) API, and computes per-ray visibility with a radial-horizon algorithm (a point is visible if its elevation angle from the observer is ≥ the steepest angle seen so far on that ray; the first blocked point truncates the rest of the ray). This is a 2.5D simplification — it doesn't model "visible again behind a dip" the way a full 3D viewshed would — and falls back to a flat circle if the elevation API is unreachable.
- **Tri-mode distance calculator** ([src/hooks/useDistanceCalculations.ts](src/hooks/useDistanceCalculations.ts)): placing both points instantly computes aerial distance + extrapolated 4km/h off-road walking time (turf, no network), then fetches OSRM driving and foot routes in parallel, painting each route's polyline on the map and populating the HUD as results arrive.
- Loading/error indicators in the HUD for both POI fetches and OSRM route fetches, so a slow/rate-limited public API degrades visibly rather than silently.

## Known quirks observed during testing

- The free OSRM demo server can return **identical** distance/duration for the `driving` and `foot` profiles on the same route — a quirk of the public demo instance, not a parsing bug (verified by comparing raw API responses).
- The viewshed's 2.5D radial-horizon approach can produce a noticeably irregular (non-circular) shape on real terrain — that's expected and is the point of using real elevation data instead of a flat-circle mock.

Deployed via Netlify + GitHub continuous deployment.
