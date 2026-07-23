# Flex Factory — Instant Quote Demo

A fully client-side instant-quotation demo for on-demand manufacturing. It pairs a React marketplace (the **client website**) with self-contained instant-quote **engines** that the marketplace embeds.

The quotation platform has three engine families:

- **Additive manufacturing** — FDM uses the slicer-backed flow; SLA and SLS use the same integration without invoking a slicer.
- **Laser cutting** — a separate engine for 2D cutting files and process parameters.
- **PCB fabrication** — a dedicated Gerber/NC-drill quotation engine.

This repository currently contains the browser-only additive reference engine and the live PCB fabrication engine. The additive reference calculates FDM/SLA/SLS prices from analysed model geometry; the production slicer adapter is not checked in here. A laser-engine implementation is also not present in this repository, and the current laser marketplace listing uses fixed pricing. See [`docs/quotation-engine-integration.md`](docs/quotation-engine-integration.md) for the integration map and current status.

## Live demo

Once published via GitHub Pages, the demo is available at:

```
https://<your-username>.github.io/<repo-name>/
```

The root `index.html` redirects to `app/` (the marketplace).

## Structure

```
/
├── index.html              # redirect → app/
├── favicon.svg
├── app/                    # React + Babel-standalone marketplace (the client website)
│   ├── index.html  *.jsx
│   └── assets/{cards,hero}/
├── engines/
│   ├── quote-3d/index.html # additive/CNC browser reference engine
│   └── quote-pcb/index.html# live PCB fabrication engine
├── docs/
│   ├── quotation-engine-integration.md # engine contract and marketplace wiring
│   └── pcb-engine-plan.md              # detailed PCB implementation notes
├── brand/                  # logos + brand guidelines
└── archive/                # earlier prototypes kept for reference
```

The marketplace embeds an engine in an `<iframe>` on a job's detail page. Each instant-quote listing in `app/client_data.jsx` selects an engine and process with `quoteEngine` and `quoteProcess`. The URL maps and iframe construction are in `app/client_pages_job_detail.jsx` and `app/client_pages_detail.jsx`.

## Additive reference engine (`engines/quote-3d/index.html`)

- **FF Engine** — three.js viewer + client-side STL/STEP analysis (volume, surface area, bounding box) + heuristic FDM/SLA/SLS pricing in SAR. It does not call a slicer in this repository.
- **Settings** — edit currency, quantity-discount tiers, lead-time multipliers, per-process rates (FDM / SLA / SLS / CNC) and process-specific parameters (infill, layer height, tolerance, finish), plus a full materials editor. Persists to localStorage.

## PCB engine (`engines/quote-pcb/index.html`)

- Accepts a Gerber/NC-drill ZIP, renders the board, and auto-detects dimensions, copper layers, holes, and minimum hole size.
- Produces an itemized PCB-fabrication price with editable rates stored in localStorage.
- Supports the embedded marketplace layout through `?embed=1`.

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

- No build step, no npm. The marketplace is React 18 + Babel-standalone, transpiled in the browser; each engine is a single standalone HTML file.
- Three.js 0.160 from jsDelivr (ES modules + importmap).
- occt-import-js (lazy-loaded).
- SAR-native pricing defaults.

## Running locally

- **Engine only:** open `engines/quote-3d/index.html` directly in any modern browser. No server required.
- **Full marketplace:** serve the repo root over HTTP (e.g. `python -m http.server 8741`) and open `http://localhost:8741/` — it redirects to `app/`. A server is needed because the marketplace fetches `.jsx` files. The included VS Code / Claude launch config (`.claude/launch.json`) does this on port 8741.

## Privacy

Uploaded 3D models are parsed entirely in the browser and never leave the device.
