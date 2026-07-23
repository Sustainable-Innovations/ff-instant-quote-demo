# FlexFactory — Instant-Quote Engine Roadmap (Implementation Spec)

> **Audience:** Claude Code (and the engineering team). This is an executable plan, not a vision doc.
> **Repo:** `ff-instant-quote-demo/`
> **Status of what exists:** `engines/quote-3d/` (FDM/SLA/SLS/CNC, live, browser-only) · `engines/quote-pcb/` (PCB fab, built, browser-only) · `app/` (React marketplace shell that embeds engines via iframe; listing `quoteEngine` flag in `app/client_data.jsx`, embed wiring in `app/client_pages_job_detail.jsx`).
> **Grounding research:** `../Instant-Quotation Algorithms for Custom Manufacturing (1).pdf`, `../Categories & Plan Phase1 - Revised.xlsx`, `../../FF/comparison research.md`.

---

## 0. Read this first — architecture decision & guardrails

### 0.1 The backend-timing decision (locked)

FlexFactory's engines will integrate into a **host platform that already has its own backend**. Therefore:

- **Do NOT build a standalone engine backend now.** For Tier A (FDM, laser, PCB) every real computation — slicing, nesting, Gerber parsing, geometry math — runs correctly **in the browser**. A parallel backend adds ops cost and zero quote-accuracy today.
- **DO make the code backend-ready now**, via two non-negotiable disciplines (Phase 0). This guarantees the client-side work is *not* throwaway and lifts cleanly into the host backend at integration time.
- **DO start closed-loop data capture on day one.** Outcome data cannot be collected retroactively. Every uncaptured quote is permanently lost ML training data.

**Rule of thumb for "does this need a backend?":**

| Capability | Browser OK? | Notes |
|---|---|---|
| FDM/AM build-time + price | ✅ | Slicer (WASM) or geometry surrogate runs client-side |
| Laser/sheet cut price + nesting yield | ✅ | DXF parse + nesting in-browser |
| PCB fab price + Gerber render | ✅ | Already proven with tracespace |
| STEP/Parasolid B-rep feature recognition | ⚠️ | Heavy — needs server (pythonOCC/OpenCascade). STL/DXF/Gerber stay client-side. |
| Persist quote → outcome (closed loop) | ❌ | Must POST to host backend |
| Shared, multi-user supplier coefficients | ❌ | Host backend DB (localStorage is demo-only) |
| ML overlays (residual, analog, acceptance) | ❌ | Host backend, later phase |

### 0.2 The four-layer model (target end state)

Each engine, no matter where it runs, is structured as four layers. Keep them as separate modules so any layer can move browser→server independently.

```
Layer 1  Ingestion/normalization   parse file → geometry + features (+ parser confidence)
Layer 2  Should-cost kernel         deterministic: C_should = Σ(material, machine, setup, labor,
                                     tooling, finishing, QC, packaging, overhead)
Layer 3  ML overlay (later)         residual correction · analog retrieval · uncertainty
Layer 4  Pricing/business rules     P = C_should + margin + risk + capacity + lead-time
```

Coefficients (machine rate, setup burden, scrap %, labor loading, finish minimums, margin) are **explicit, supplier-tunable inputs** to Layer 2/4 — never hardcoded, never trapped in `localStorage`.

### 0.3 Global guardrails (apply to every phase)

- **Latency budget < 5s** on the request path. Anything combinatorial (true-shape nesting, slicing, STEP analysis, drawing parsing) must have a *fast-rule fallback* and/or run async.
- **Confidence + review gate.** Every quote carries a `confidence` and `needsReview` flag. Trigger review when: parser confidence low, geometry ambiguous, nearest analog too far, or predicted uncertainty exceeds a supplier threshold.
- **Currency:** Saudi Riyal (SVG glyph, as in the PCB engine — not `﷼`/text).
- **Embed contract preserved:** every engine supports `?embed=1` (hide chrome) and `postMessage` height reporting to the marketplace iframe host.
- **No secrets in engines.** Engines are static assets; any keys live in the host backend.

---

## Phase 0 — Foundation refactor (do before adding processes)

**Goal:** make the existing engines backend-ready and start capturing data, without changing user-visible behaviour. ~1–2 weeks.

### 0.A Extract a portable pricing core

Pull all pricing math out of the engine HTML into framework-free, DOM-free ES modules that take inputs and return a structured quote. Same file runs in-browser now and in Node/host backend later.

**Create:**

```
engines/
  core/
    schema.js          # shared types: QuoteRequest, QuoteResult, Breakdown, Coefficients
    shouldcost.js      # Layer 2: generic should-cost summation + helpers
    pricing.js         # Layer 4: margin/risk/capacity/lead-time → final price
    capture.js         # closed-loop event builder + POST hook (stub-safe)
    coefficients.js    # loader: fetch JSON config; fall back to bundled defaults
    util/units.js      # mm/in, g/cm³, SAR formatting (single source of truth)
```

**`QuoteResult` shape (canonical — every engine returns this):**

```jsonc
{
  "process": "fdm",
  "currency": "SAR",
  "shouldCost": 0.0,
  "price": 0.0,
  "unitPrice": 0.0,
  "quantity": 1,
  "leadTimeDays": 7,
  "breakdown": [ { "key": "material", "label": "Material", "amount": 0.0 } ],
  "features": { /* extracted geometry: volume, bbox, area, perimeter, holes... */ },
  "coefficientsRef": "supplier:default@v1",
  "confidence": 0.0,
  "needsReview": false,
  "reviewReasons": []
}
```

**Tasks:**
- [ ] Create `engines/core/` modules above.
- [ ] Move the `materials`/rate tables out of `quote-3d/index.html` and `quote-pcb/index.html` into `coefficients.js` defaults + a `coefficients/*.json` file per engine.
- [ ] Refactor both engines to import the core and render `QuoteResult` (no math left in the HTML/view layer).
- [ ] Keep `localStorage` **only** as a dev override of fetched coefficients (clearly flagged as demo-mode).
- [ ] Confirm both engines still produce identical prices to pre-refactor (snapshot test).

### 0.B Externalize coefficients

**Create:**

```
engines/coefficients/
  fdm.default.json        # machine rate/hr, setup min, support %, material table, margin
  laser.default.json
  pcb.default.json
  _schema.json            # JSON Schema validating all coefficient files
```

`coefficients.js` resolution order: **host API (if configured) → bundled default JSON → localStorage dev override**. This is the seam the host backend plugs into at Phase 4.

**Tasks:**
- [ ] Define `_schema.json` (every coefficient is named, typed, unit-annotated, supplier-overridable).
- [ ] Author default JSON for the 3 Tier-A processes from current hardcoded values.
- [ ] Add `?coeffs=<url>` query param so the marketplace/host can inject a supplier's coefficient set per embed.

### 0.C Closed-loop data capture (START NOW)

Every quote computation emits one structured event. Endpoint can be a stub (`console`/no-op/localStorage queue) until the host backend exists — the **call sites and schema** are what matter today.

**`capture.js` event (minimum fields — superset of research §"closed loop"):**

```jsonc
{
  "event": "quote_generated",
  "ts": "ISO-8601",
  "sessionId": "uuid",
  "listingId": "J-1",
  "supplierId": "default",
  "process": "fdm",
  "fileMeta": { "name": "part.stl", "type": "stl", "bytes": 12345, "hash": "sha256" },
  "parserConfidence": 0.0,
  "features": { /* same vector returned in QuoteResult.features */ },
  "humanEdits": [ /* any override of an auto-detected field */ ],
  "coefficientsRef": "supplier:default@v1",
  "shouldCost": 0.0,
  "quotedPrice": 0.0,
  "leadTimeDays": 7,
  "confidence": 0.0,
  "needsReview": false
}
```

**Outcome events to wire (fields filled later by host backend, schema defined now):** `quote_accepted` / `quote_rejected`, and `job_actuals` (actual machine time, setup time, labor touch time, consumables, finishing/loaded cost, QC time, scrap/rework, capacity snapshot at quote time). *Without the actuals you can train a price predictor but never a trustworthy costing engine.*

**Tasks:**
- [ ] Implement `capture.emit(event)` with pluggable transport (`noop` | `localStorage` | `httpBeacon`).
- [ ] Call `emit('quote_generated', …)` from every engine on each recompute (debounced).
- [ ] Document the outcome-event schema in `engines/core/CAPTURE.md` for the host backend team.

### 0.D Review-gate primitive

- [ ] Add `evaluateConfidence(features, coeffs) → {confidence, needsReview, reasons}` in `shouldcost.js`.
- [ ] Render a non-blocking "Estimate — pending review" badge in the engine UI when `needsReview`.

**Phase 0 acceptance:** both engines refactored, prices unchanged, coefficients in JSON, `quote_generated` events firing (visible in console/localStorage), `?coeffs=` and `?embed=1` working. Nothing requires a backend yet.

---

## Phase 1 — FDM / Polymer AM engine (flagship, upgrade existing)

**Why first:** AM is the one domain where pricing is natively simulation-based; you already have a live engine. Highest-confidence ±10% target.

**Current gap:** `quote-3d` prices on `volume × pricePerG` (material only) — no build time, no machine occupancy, no support estimate. That underprices time-dominated parts.

**Target should-cost (Layer 2):**
`C = build_material + support_material + machine_time×rate + setup + post_processing + QC + packaging`, then margin/lead-time in Layer 4.

### Files

```
engines/quote-3d/
  index.html                 # view only after refactor
  slicer/                    # NEW
    cura.worker.js           # CuraEngine WASM in a Web Worker (build time + material)
    slicer.bridge.js         # File → STL → slice → {timeSec, gramsModel, gramsSupport}
    fallback.estimate.js     # geometry surrogate when WASM unavailable / >budget
engines/coefficients/fdm.default.json   # + machine rate/hr, setup, post-proc, support factor
```

### Approach
- **Primary:** CuraEngine compiled to WASM in a worker → real build time & material from the actual machine profile (mirror profiles per supplier later). Keep off the main thread; show spinner; enforce a time cap.
- **Fallback (always present):** surrogate from `volume`, `bbox.z` (layer count), `surface area`, `overhang area` → time estimate. Used when WASM is slow/unavailable or part is huge. This keeps the <5s budget.
- Extend to SLA/SLS/MJF via process-specific coefficient blocks (same kernel, different rates + support logic). Metal AM (LPBF) deferred to Tier B (orientation/support/build-occupancy is the hard sub-problem).

### Tasks
- [ ] Add Three.js-independent STL/3MF parser path feeding the worker (reuse existing volume/bbox math for the fallback).
- [ ] Integrate CuraEngine WASM worker; map output → `QuoteResult.features` + breakdown.
- [ ] Author `fdm.default.json`: machine `rate/hr`, `setupMin`, `supportRemovalRate`, per-material `pricePerG`+`density`, `marginPct`.
- [ ] Wire `quote_generated` capture with slicer outputs + `parserConfidence`.
- [ ] STEP upload → mesh tessellation fallback (note: true B-rep deferred to Phase 4 server).

### Libraries / gotchas
- CuraEngine (open, AGPL — confirm licensing posture for SaaS) or **PrusaSlicer/Slic3r** CLI logic; both compute time+material. WASM build is the main integration risk → spike first.
- Worker required (slicing blocks UI). Always ship the surrogate fallback.

**Acceptance:** indicative quote in <5s for typical STL; slicer-backed when feasible, surrogate otherwise; SLA + SLS selectable; events captured. Sanity-check 5 sample parts against hand estimates (target ±15% now, ±10% after coefficient tuning on real data).

---

## Phase 2 — Laser / sheet-metal cutting engine (new)

**Why second:** deterministic, geometry-driven, second-easiest per research. Covers your laser priority + waterjet/plasma/punch with the same kernel.

**Target should-cost (Layer 2):**
`C = sheet_material × nest_yield_allocation + cut_time + pierces + gas/abrasive/consumables + unload/sort + deburr + overhead`, then margin. **Nest yield is a nest-level variable** — estimate likely yield and amortize back to the RFQ line with a supplier-visible rule.

### Files

```
engines/quote-laser/             # NEW
  index.html                     # viewer (DXF/SVG preview) + params + itemized price (mirror PCB engine UI)
  parse/
    dxf.parse.js                 # DXF → polylines, perimeter, pierce/hole count, bbox
    geom.metrics.js              # cut length, pierce count, feature density, convex/concave
  nest/
    nest.fast.js                 # bbox/rectangular yield heuristic (default, fast)
    nest.truenshape.js           # no-fit-polygon (SVGnest/Deepnest) — async, latency-gated
engines/coefficients/laser.default.json  # per-material: cut speed (mm/min) by thickness,
                                         # pierce time, gas cost, sheet cost, min charge, margin
```

### Tasks
- [ ] DXF parser → geometry metrics (perimeter = cut length, holes = pierces, bbox, nest fit).
- [ ] `nest.fast.js` yield heuristic as default; `nest.truenshape.js` (SVGnest) behind a latency guard with a "refine nesting" action.
- [ ] Process params: material, thickness, quantity, edge-quality class, grain (human inputs per research).
- [ ] Coefficient table: cut speed × thickness × material, pierce time, consumables, **minimum charge**, scrap/yield rule.
- [ ] Vector-PDF → DXF path optional (note as stretch; warn + manual entry otherwise).
- [ ] Add listing(s) in `app/client_data.jsx` with `quoteEngine: 'laser'`; extend `ENGINE_URLS` in `app/client_pages_job_detail.jsx`.
- [ ] Wire capture; expose nest-yield assumption in the breakdown (supplier-visible).

### Libraries / gotchas
- DXF: `dxf-parser` / `dxf` (JS). Nesting: **SVGnest / Deepnest** (open, no-fit-polygon).
- Research warning: pricing from isolated parts mis-prices vs. real production nests — make the yield rule explicit and tunable, not hidden.

**Acceptance:** upload DXF → preview + itemized quote <5s with fast nesting; optional true-shape refine; min-charge respected; events captured.

---

## Phase 3 — PCB fabrication engine (harden existing)

**Why third:** already built (`engines/quote-pcb`, Gerber parse/render + itemized pricing). This phase = bring it onto the core + capture, not a rebuild. PCBA stays Tier C.

### Tasks
- [ ] Refactor to import `engines/core/` (move rate tables → `pcb.default.json`, prices unchanged).
- [ ] Emit `quote_generated` with board features (size, layers, holes, min-hole) + chosen params.
- [ ] Apply `confidence`/`needsReview` (e.g., ODB++/IPC-2581 fallback = lower confidence, no render).
- [ ] Confirm `?coeffs=` injection + `?embed=1` height reporting still correct.
- [ ] Keep PCBA explicitly out of scope (BOM/component-sourcing driven — Tier C).

### Libraries / gotchas
- Keep tracespace stack & documented gotchas (see `docs/pcb-engine-plan.md` §11: `fflate` not JSZip; `@tracespace/core@5.0.0-alpha`; rasterize SVG→canvas; `setTimeout` not rAF; live mask recolour via `#004200` replace).

**Acceptance:** identical pricing to current build, now core-backed + capturing; review flag on unparseable formats.

---

## Phase 4 — Host-backend integration & closed-loop activation

**Trigger:** when wiring engines into the host platform. This is where the deferred backend lands — into the host's stack, not a new one.

### What moves server-side
- **Coefficient service:** host API serves supplier coefficient sets; engines load via `?coeffs=<api-url>` (seam built in Phase 0). Supplier-management UI lives in host admin.
- **Capture sink:** `capture.js` `httpBeacon` transport points at a host endpoint; persist `quote_generated` + wire `quote_accepted/rejected` (from marketplace order flow) + `job_actuals` (from supplier/ops after job completion).
- **STEP/Parasolid B-rep service (optional, when CNC milling needs it):** containerized **pythonOCC/OpenCascade** microservice for feature recognition, removed volume, access directions. Engines call it async; STL/DXF/Gerber remain client-side.
- **Review-gate routing:** `needsReview` quotes route to a human queue in the host platform.

### Data model the host backend must own (closed loop)
`quotes` (request + features + shouldCost + price + confidence) · `coefficients` (versioned, per supplier) · `outcomes` (accepted/rejected, actuals) · `files` (object storage). See `engines/core/CAPTURE.md`. **This dataset is the only path to ±10% and to any future ML** — public datasets have feature/manufacturability labels but no real quote/cost labels.

### Tasks
- [ ] Implement coefficient API + supplier admin (host side).
- [ ] Implement capture endpoints + persistence (host side).
- [ ] Switch engine transports/loaders from stub/default → host API via env/query config.
- [ ] (If/when milling) stand up the OCC B-rep microservice.
- [ ] Backfill: confirm every Tier-A engine writes the full event schema.

**Acceptance:** a quote made in an embedded engine persists end-to-end; supplier coefficients editable centrally; outcomes attachable to quotes.

---

## Tier B — outline (parametric kernel, after Tier A + integration)

Same four-layer pattern; each is a new `engines/quote-*/` + `coefficients/*.json`. Detail to be expanded when scheduled.

- **Sheet bending / press brake** — bend count, bend length, gauge, tool family, setup-change count, sequence-complexity heuristic. Hard sub-problem: collision-free sequence & tooling feasibility. Pairs naturally with the laser engine (cut+bend).
- **CNC turning / Swiss** — rotational symmetry makes it tractable: bar stock + spindle time + live-tooling + part-off + setup + secondary + QC. Inputs: diameters, lengths, features; tolerances/finish are human inputs. *(Turning is Tier B; milling is Tier C — keep them separate engines.)*
- **Metal AM (LPBF/DMLS)** — build occupancy, orientation, support volume, support-removal class, post-processing route. Hard sub-problem: orientation/support/build-occupancy under warpage risk.
- **Surface finishing (anodize/plate/powder/paint)** — **not geometry-to-price**: minimum-charge + rack/batch tables, exposed area, masking. Build as a **config form**, not a CAD upload. Hard sub-problem: batch economics.
- **Injection molding** — tooling (cavity/core complexity, projected area, slides) + part (shot weight, cycle, material, scrap). Most mature should-cost template; good reference even if deferred.

---

## Tier C — outline (hardest / review-gated)

Quote as an **instant estimate with uncertainty band + automatic human-review gate**, or as a guided config form. Do not promise sub-5s / ±10% geometry-to-price here.

- **CNC milling (3-axis → then 4/5-axis)** — the hardest family. Cost driven by setup count, workholding, approach directions, routing — not geometry parsing. Needs: OCC B-rep service (Phase 4) + deterministic kernel with **editable setup count** + analog retrieval + review gate. Sequence: 3-axis first, 4/5-axis last with explicit uncertainty bands.
- **EDM (wire/sinker)** — parametric, machine-family-specific time estimation; thin public benchmarks. Keep deterministic + coefficient-exposed.
- **PCBA / box build / wiring harness / panel assembly** — BOM- and component-sourcing driven; config-form + sourcing lookups, not geometry parsing.
- **Other "Service"-tagged rows** (assembly, electrical, casting services) — config-form quoting with min-charge/batch tables.

---

## ML overlays — Phase 2+ (after data accumulates, never in v1)

Once the closed loop has enough labeled outcomes, add Layer 3 (host-side), in this order of ROI:
1. **Residual correction** on the deterministic kernel (esp. CNC setup/routing). Use gradient-boosted trees on tabular features — research found GBT/SVR beat neural nets and end-to-end mesh-to-price.
2. **Quote-analog retrieval** — nearest-neighbor on the feature vector for cost priors + explainable analogs.
3. **Acceptance-probability / margin optimization** (Xometry-style) — optimize win probability × margin × on-time, not lowest cost.
4. **Uncertainty estimation** feeding the review gate.

**Never** start with end-to-end mesh-to-price: no open real-shop accuracy evidence, and it breaks coefficient-level supplier tuning.

---

## Sequence & dependency summary

```
Phase 0  Foundation (core + coefficients + capture)      ← blocks everything
Phase 1  FDM/AM upgrade            ─┐
Phase 2  Laser/sheet (new)          ├─ Tier A (parallelizable after P0)
Phase 3  PCB harden                ─┘
Phase 4  Host-backend integration   ← needs host stack; activates closed loop
Tier B   bending · turning · metal AM · finishing · IM
Tier C   CNC milling (3→5 axis) · EDM · PCBA · services   ← needs OCC service + ML overlays
ML       residual → analog → acceptance → uncertainty     ← needs accumulated outcome data
```

## How to use this doc with Claude Code
- Treat each `Phase`/`Tier` heading as a milestone; each `[ ]` as an issue.
- **Always do Phase 0 first** — it's the seam that makes everything else backend-portable.
- Keep math in `engines/core/`, views in `engines/quote-*/index.html`, coefficients in JSON.
- After each phase, confirm: prices stable, `<5s`, `quote_generated` events firing, `?embed=1` + `?coeffs=` intact.
