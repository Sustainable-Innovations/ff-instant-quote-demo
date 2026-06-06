# Flex Factory — Instant Quote Demo

A single-page, fully client-side instant-quotation demo for manufacturing parts. Drop in an `.stl` or `.step` file and receive an indicative quote in seconds — no backend, no API keys.

## Live demo

Once published via GitHub Pages, the demo is available at:

```
https://<your-username>.github.io/<repo-name>/
```

## What's inside

- **`Flex Factory Instant Quote _standalone_.html`** — the main demo. Two tabs:
  - **FF Engine** — custom FF-branded quoting: three.js viewer + client-side STL/STEP analysis (volume, surface area, bounding box) + heuristic pricing in SAR. All coefficients configurable in the Settings tab.
  - **Settings** — edit currency, quantity-discount tiers, lead-time multipliers, per-process rates (FDM / SLA / SLS / CNC) and process-specific parameters (infill, layer height, tolerance, finish), plus a full materials editor. Persists to localStorage.
- **`Flex Factory Landing _standalone_.html`** — an earlier landing-page exploration (kept for visual identity reference).
- **`index.html`** — redirect to the main demo so the Pages root URL works.

## Features

- Client-side STL parsing via three.js `STLLoader`.
- Client-side STEP parsing via lazy-loaded [`occt-import-js`](https://github.com/kovacsv/occt-import-js) WASM (~8 MB, fetched from jsDelivr on first STEP drop).
- Volume / surface-area / bounding-box computation using signed-tetrahedron formulas.
- Process-specific pricing:
  - **FDM**: infill % (material scaling) + layer height (time scaling).
  - **SLA / SLS**: layer height.
  - **CNC**: tolerance grade and surface finish multipliers.
- Quantity-discount tiers and lead-time multipliers.
- Full settings editor with reset-to-defaults, all persisted to the browser.

## Tech

- Single standalone HTML file — no build step, no npm.
- Three.js 0.160 from jsDelivr (ES modules + importmap).
- occt-import-js (lazy-loaded).
- SAR-native pricing defaults.

## Running locally

Open `index.html` (or the standalone HTML file directly) in any modern browser. No server required.

## Privacy

Uploaded 3D models are parsed entirely in the browser and never leave the device.
