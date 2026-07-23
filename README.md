# Flex Factory — Instant Quote Demo

A fully client-side instant-quotation demo for on-demand manufacturing. It pairs a React marketplace (the **client website**) with self-contained instant-quote **engines** that the marketplace embeds.

The demo covers three quotation engines:

- **Polymer additive manufacturing** — upload an `.stl` / `.step` file and quote FDM, SLA, or SLS. FDM can use the optional PrusaSlicer service; every process has a deterministic fallback model.
- **Laser / sheet cutting** — upload DXF, STL, or STEP and quote material, cutting, gas, programming, handling, deburr, and estimated nest allocation.
- **PCB fabrication** — upload Gerber/Excellon files or a ZIP and quote bare-board fabrication. PCBA is not implemented and requires a separate reviewed workflow.

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
│   ├── quote-3d/           # FDM / SLA / SLS engine
│   ├── quote-laser/        # laser / sheet-cutting engine
│   ├── quote-pcb/          # bare-PCB fabrication engine
│   ├── core/               # shared schemas, pricing, review, capture, utilities
│   └── coefficients/       # supplier-overridable coefficient fixtures
├── services/
│   └── prusaslicer-api/    # optional asynchronous FDM slicing service
├── brand/                  # logos + brand guidelines
└── archive/                # earlier prototypes kept for reference
```

The marketplace embeds an engine in an `<iframe>` on a job's detail page. Which engine
is chosen comes from each listing's `quoteEngine` flag in `app/client_data.jsx`
(`'3d'`, `'laser'`, or `'pcb'`). Each engine also runs standalone when the repository
is served over HTTP.

## Production integration documentation

The static demo is not the system of record for a production quote. Use these
documents to integrate the developed engines with the FlexFactory platform:

- [`docs/engine-integration-guide.md`](docs/engine-integration-guide.md) — architecture, lifecycle, security, versioning, iframe migration, and delivery sequence.
- [`docs/quotation-engine-integration.md`](docs/quotation-engine-integration.md) — marketplace wiring and engine contract.
- [`docs/quotation-requirements.md`](docs/quotation-requirements.md) — client, service-provider, and platform requirements for all implemented engines.
- [`docs/quote-api.openapi.yaml`](docs/quote-api.openapi.yaml) — proposed production HTTP contract.

## Additive reference engine (`engines/quote-3d/index.html`)

- **FF Engine** — three.js viewer + client-side STL/STEP analysis (volume, surface area, bounding box) + should-cost pricing in SAR. Additive (polymer AM) only: FDM / SLA / SLS. (CNC machining is subtractive — a different cost model — and is intentionally out of this engine; it belongs in a dedicated CNC engine later.)
- **Settings** — shows the cost model up top, then edit currency, quantity-discount tiers, lead-time multipliers, per-process rates (FDM / SLA / SLS) and process-specific parameters (infill, layer height), plus a full materials editor. Persists to localStorage.

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
- Quantity-discount tiers and lead-time multipliers.
- Full settings editor with reset-to-defaults, all persisted to the browser.

## Tech

- No build step, no npm. The marketplace is React 18 + Babel-standalone, transpiled in the browser; each engine is a single standalone HTML file.
- Three.js 0.160 from jsDelivr (ES modules + importmap).
- occt-import-js (lazy-loaded).
- SAR-native pricing defaults.

## Running locally

- **Serve the repo root over HTTP** (e.g. `python -m http.server 8741`) and open `http://localhost:8741/` — it redirects to `app/`. The included VS Code / Claude launch config (`.claude/launch.json`) does this on port 8741.
- A server is now required for the engines too: since the Phase-0 refactor, each engine imports a shared ES-module pricing core (`engines/core/`) and fetches its coefficients from `engines/coefficients/*.json`, which browsers block under `file://`. (Before the refactor all engine code was inlined, so the 3D engine could be opened directly — that's no longer the case.)
- Run the prices-unchanged gate with `node engines/core/test/snapshot.mjs` (no npm install needed).

## Privacy

Uploaded 3D models are parsed entirely in the browser and never leave the device.
