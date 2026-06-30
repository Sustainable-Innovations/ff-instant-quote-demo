# Flex Factory — Instant Quote Demo

A fully client-side instant-quotation demo for on-demand manufacturing. It pairs a React marketplace (the **client website**) with self-contained instant-quote **engines** that the marketplace embeds — no backend, no API keys.

The demo covers two quotation flows:

- **3D models** — upload an `.stl` / `.step` file and get an indicative price in seconds. _(Live.)_
- **PCB / PCBA** — upload a Gerber / ODB++ package for an indicative board price. _(Placeholder; pricing engine in progress.)_

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
│   ├── quote-3d/index.html # the live 3D-model quote engine (embedded via iframe)
│   └── quote-pcb/index.html# PCB/PCBA quote engine — placeholder ("coming soon")
├── brand/                  # logos + brand guidelines
└── archive/                # earlier prototypes kept for reference
```

The marketplace embeds an engine in an `<iframe>` on a job's detail page. Which engine
is chosen comes from each listing's `quoteEngine` flag in `app/client_data.jsx`
(`'3d'` → `engines/quote-3d/`, `'pcb'` → `engines/quote-pcb/`). The 3D engine also
runs standalone — open `engines/quote-3d/index.html` directly.

## The 3D engine (`engines/quote-3d/index.html`)

- **FF Engine** — three.js viewer + client-side STL/STEP analysis (volume, surface area, bounding box) + should-cost pricing in SAR. Additive (polymer AM) only: FDM / SLA / SLS. (CNC machining is subtractive — a different cost model — and is intentionally out of this engine; it belongs in a dedicated CNC engine later.)
- **Settings** — shows the cost model up top, then edit currency, quantity-discount tiers, lead-time multipliers, per-process rates (FDM / SLA / SLS) and process-specific parameters (infill, layer height), plus a full materials editor. Persists to localStorage.

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
