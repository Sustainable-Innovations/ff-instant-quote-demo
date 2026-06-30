# FlexFactory AM Engine — Machine Profiles · Real Build-Time · Auto-Complexity (requirements)

> **Audience:** Claude Code (a fresh chat) + engineering. Self-contained spec to implement three
> upgrades to the polymer-AM engine (`engines/quote-3d/`). Read alongside
> `docs/instant-quote-roadmap.md` (Phase 1) and `docs/pricing-rationalization.md` (cost model).
> **Status:** not started. The engine today is additive-only (FDM·SLA·SLS), prices via a canonical
> should-cost model, estimates build time with a **surrogate heuristic**, uses **one machine rate per
> process**, and carries a **static `complexity` factor (1.0, admin-set)**.

---

## 0. Current state (what exists, so you don't re-derive it)

- **Engine:** `engines/quote-3d/index.html` (view), `engines/quote-3d/quote.kernel.js` (DOM-free Layer-2/4 kernel), `engines/quote-3d/slicer/fallback.estimate.js` (build-time surrogate).
- **Coefficients:** `engines/coefficients/fdm.default.json` (canonical) **mirrored** by an inline `DEFAULTS` object in `index.html`. **Both must stay in sync** (memory: `ff-engine-conventions`). `?coeffs=<url>` can inject a supplier set; `localStorage` is a demo dev override (key `ff_instant_quote_settings_v2`).
- **Core (DOM-free, Node-testable):** `engines/core/{schema,shouldcost,pricing,coefficients,capture}.js`, `engines/core/util/{geometry,units}.js`, `engines/core/mesh/stl-step.js`.
- **Geometry available per part** (already computed): `volume_mm3`, `surface_mm2`, `bbox_mm{x,y,z}`, `triCount`, `watertight` (`analyzeMesh`), and `meshTopology()` → Euler χ + **genus** (hole count). STL + STEP both parse to a flat positions array via `core/mesh/stl-step.js`.
- **Cost model (canonical, per `pricing-rationalization.md`):**
  `unit_price = (material(+support) + conversion×leadMult) × (1+overhead%)×(1+margin%)`, where
  `conversion = machine_time×rate×complexity + labor×learningFactor(qty) + setup/qty`, floored by `minOrder`.
  - `machineCost = est_hours × process.hourlyRate × process.complexity` (kernel line ~85).
  - `complexity` is `process.complexity ?? 1.0` — **static, admin-editable, currently 1.0** (a neutral hook).
  - Build time `est_hours` comes from `opts.timeModel` (the surrogate) which reads `process.build` (`volumetricFlow_mm3ps`, `layerOverheadSec`, `supportFraction`, `postProcPerUnit`); falls back to `volume/mmPerHour` when no `build` block.
- **Confidence/review:** every quote carries `confidence`+`needsReview`+`reviewReasons` (`evaluateConfidence` in `shouldcost.js`); oversized/non-watertight already flag review. `quote_generated` capture fires on each recompute.
- **Tests:** `engines/core/test/snapshot.mjs` (Node `node:test`, run `node engines/core/test/snapshot.mjs`). Encodes pricing invariants + golden anchors.

**Guardrails to keep:** no build step (ES modules + CDN importmaps); inline `DEFAULTS` mirrors JSON; bump `quoteVersion` in `app/client_pages_job_detail.jsx` + `app/client_pages_detail.jsx` and the per-engine localStorage key on coefficient-shape changes; `<5s` latency with a fast fallback; `?embed=1` + height postMessage intact; SAR SVG glyph.

---

## Requirement 1 — Machine profiles + auto-selection

**Why:** one rate/throughput per process can't represent a real fleet. A Bambu X1-C prints ~3× faster
than a Prusa MK4; a large-format machine costs more/hr but fits bigger parts; budget resin vs Formlabs
differ in price and quality. Machine choice materially changes price **and feasibility**.

### 1.1 Data model — add `machines[]` to each process (in `fdm.default.json` + inline `DEFAULTS`)

```jsonc
"fdm": {
  "name": "FDM 3D Printing", "setupFee": 13.0, "complexity": 1.0, "overheadPct": 0, "marginPct": 10,
  "params": { /* infill, layerHeight — unchanged */ },
  "machines": [
    { "id": "fdm-prusa-mk4", "name": "Prusa MK4", "ratePerHour": 15.0,
      "envelope": { "x": 250, "y": 210, "z": 220 },
      "materials": ["pla","petg","abs","asa","flex_tpu","nylon_fdm"],
      "build": { "volumetricFlow_mm3ps": 12, "layerOverheadSec": 6, "supportFraction": 0.12 },
      "quality": 1.0 },
    { "id": "fdm-bambu-x1c", "name": "Bambu Lab X1-C", "ratePerHour": 18.0,
      "envelope": { "x": 256, "y": 256, "z": 256 }, "materials": ["pla","petg","abs","asa","flex_tpu"],
      "build": { "volumetricFlow_mm3ps": 24, "layerOverheadSec": 3.5, "supportFraction": 0.12 }, "quality": 1.0 },
    { "id": "fdm-modix-big60", "name": "Modix Big-60 (large format)", "ratePerHour": 28.0,
      "envelope": { "x": 600, "y": 600, "z": 660 }, "materials": ["pla","petg","abs","asa"],
      "build": { "volumetricFlow_mm3ps": 14, "layerOverheadSec": 9 }, "quality": 0.95 }
  ]
}
```

- Provide a comparable `machines[]` for **sla** (e.g., Elegoo Saturn budget · Formlabs Form 3+ · Form 3L large) and **sls** (Formlabs Fuse 1+ · EOS P396 industrial), each with `ratePerHour`, `envelope`, `materials`, `build`.
- **Back-compat:** the per-process `hourlyRate`/`mmPerHour`/`build`/`envelope` remain as a **synthesized fallback machine** when `machines` is absent.
- The `build` block moves to the *machine* (machine-specific flow/overhead) — process-level `build` stays only as fallback.

### 1.2 Selection logic — `engines/core/machines.js` (NEW, DOM-free, Node-testable)

```js
selectMachine(process, { bbox_mm, materialKey, overrideId }, costFn) →
  { machine, feasible:[...], all:[...], oversized:boolean, reason }
```
- **Feasible** = machines whose `envelope` fits the part (sorted dims, orientation-independent) **and** whose `materials` includes `materialKey` (or no `materials` list = any).
- If `overrideId` is set and feasible → use it. Else pick **cheapest feasible** by `costFn(machine)` (the kernel passes a per-machine total-cost closure).
- If **none feasible** → `oversized:true`, fall back to the largest machine (or process fallback) and set a review reason "no machine fits — manual review / split."

### 1.3 Kernel (`quote-3d/quote.kernel.js`)

- Resolve machine list → feasible → compute the full quote **per feasible machine** (machine drives `ratePerHour` + `build` profile for the time model) → keep the cheapest (or override).
- Use `machine.ratePerHour` in `machineCost`; pass `machine.build` to the time model (Req 2).
- Add to output: `components.machine = { id, name }`, `components.machineAlternatives = [{id,name,unitPrice}]`, and a review reason when `oversized`.
- **Pricing-rationality:** keep the existing canonical structure; designate the **representative machine per process** with `ratePerHour` == today's `hourlyRate` and `build` == today's `build` so the snapshot golden anchors hold when that machine is pinned (tests pin a machine id).

### 1.4 Engine UI (`quote-3d/index.html`)

- Add a **Machine** field to the config panel: shows the auto-selected machine ("Bambu Lab X1-C · auto") with a dropdown to override; show "fits / too large" per option.
- Show the chosen machine in the breakdown note (e.g., `Machine time (… on Bambu Lab X1-C)`).
- Settings: per-machine rate editor (machines table). Bump localStorage key to `…_v3`.
- Capture: add `machineId` + alternatives to the `quote_generated` event.

### 1.5 Tests (`snapshot.mjs`)
- Auto-select picks the **cheapest feasible** machine; oversized part → only large-format feasible (or `oversized`).
- Material filter excludes incompatible machines.
- qty=1 anchor preserved when the representative machine is pinned.

**Acceptance:** part auto-routes to the cheapest machine that fits + supports the material; user can override; oversized parts flag review; price reflects the chosen machine's rate.

---

## Requirement 2 — Machine-aware build-time model + slicer bridge

**Why:** `volume ÷ throughput` ignores height/layers/travel and isn't machine-specific. Build time is the
dominant AM cost driver, so this is the biggest accuracy lever (roadmap Phase 1).

### 2.1 Guaranteed deliverable — machine-aware **physics** surrogate (`slicer/fallback.estimate.js`)

Upgrade the surrogate to consume the **selected machine's `build` profile** and a more physical model:

```
layerCount   = ceil(bbox.z / layerHeight)
depositedVol = solidVolume × infillFactor + supportVol            (mm³)
printSec     = depositedVol / volumetricFlow_mm3ps                (extrusion/cure time)
             + layerCount × layerOverheadSec                      (recoat/travel/layer-change)
             + travelFactor × surfaceArea / refSpeed              (optional travel term)
est_hours    = printSec / 3600
```
- Per-machine `volumetricFlow_mm3ps` + `layerOverheadSec` make the estimate machine-specific (fast machine = higher flow, lower overhead).
- SLA/SLS: `layerOverheadSec` models exposure/recoat (cure-time dominated); infill = 100%.
- Keep it a pure function returning `{ est_hours, materialFactor, supportVol_mm3, layerCount }`. Bounded, `<5s`.

### 2.2 Best-effort spike — real toolpath slicer (`slicer/cura.worker.js` + `slicer/slicer.bridge.js`)

- `slicer.bridge.js`: `sliceMesh(meshBuffer, machineProfile, params, {budgetMs}) → Promise<{timeSec, gramsModel, gramsSupport}|null>`. Runs in a **Web Worker**; **time-capped**; returns `null` on timeout/failure so the kernel falls back to 2.1.
- Attempt **CuraEngine-WASM** (e.g. the `cura-wasm` package) or Kiri:Moto's slicing core loaded from CDN. **Treat as experimental, behind a `?slicer=cura` flag.** Do **not** make it the default or a hard dependency; the physics surrogate is the guaranteed path. Document the spike outcome (works / partial / not viable) in this file.
- Map machine profiles → slicer machine definitions (nozzle, speed, layer height, material).

### 2.3 Confidence
- Real-slice result → higher `confidence`; physics surrogate → medium; legacy `volume/mmPerHour` fallback → lower. Surface the source in the breakdown ("build time: estimated / sliced").

**Acceptance:** build time varies correctly with **height/layers and machine** (tall part costs more; faster machine costs less); `<5s` always (worker capped, surrogate fallback); real slicer, if it lands, is opt-in and degrades gracefully.

---

## Requirement 3 — Auto-derived, explainable complexity

**Why:** replace the static admin `complexity` knob with a geometry-driven difficulty score, so price
reflects support/thin-wall/feature risk automatically — transparently, not as a black box.

### 3.1 Compute — `engines/core/complexity.js` (NEW, DOM-free) from features we already have

```
complexity = clamp( 1.0 … cap(default 1.6),
   1.0
   + w_overhang · overhangFraction          // from surrogate support estimate / surface
   + w_thin     · max(0, (SA:V − baseline) / baseline)   // thin-wall / fine-detail proxy
   + w_aspect   · aspectPenalty(bbox.z / min(x,y))        // tall-thin instability
   + w_holes    · min(holeCap, genus) / holeCap           // internal features (meshTopology)
   + (watertight === false ? w_open : 0) )                // manifold risk
```
- Weights `w_*`, `cap`, `baseline` live in coefficients (`general.complexityModel` or per-process), supplier-tunable. Default weights chosen so a "normal" part ≈ 1.0.
- Return `{ value, terms: [{key,label,contribution}] }` for display + audit.

### 3.2 Wire-in
- Kernel: `complexity = process.complexity-override ?? autoComplexity(features).value`. Keep an **admin override** (a fixed number) that bypasses the auto score. Still applies to **machine time only** (per pricing doc).
- Breakdown: show "Geometry complexity ×1.2" with a tooltip/sub-line of the top contributing terms.
- Capture: write `complexity.value` + `terms` into `quote_generated` (so it can be calibrated against outcomes later).
- Default behaviour: ship **conservative** (low weights / cap 1.3) until calibrated; consider routing high-complexity parts (≥ threshold) through the review gate.

### 3.3 Tests
- Monotonic: more overhang / higher SA:V / taller-thinner / more holes → higher complexity, clamped to `cap`.
- A simple solid cube ≈ 1.0 (within tolerance).
- Override coefficient bypasses the auto score.

**Acceptance:** complexity is computed from geometry, bounded, explained in the breakdown, captured, and overridable; removes the static admin number as the default.

---

## Cross-cutting requirements

- **Keep inline `DEFAULTS` mirrored** to `fdm.default.json` for every change (machines, build profiles, complexity model). Snapshot test reads the JSON; the live engine reads the inline copy.
- **Pricing rationality preserved** (`pricing-rationalization.md`): no blanket qty discount; quantity economy only from `setup/qty` + labor learning; lead premium on conversion only; margin/overhead explicit; `minOrder` floor. Machine rate and complexity affect **machine time** (conversion), not pass-through material.
- **Confidence/review** updated for: oversized (no machine fits), low-confidence build-time source, high auto-complexity.
- **Versioning:** bump `quoteVersion` (both job-detail files) and the AM localStorage key on each coefficient-shape change. No-build / ES-module / CDN constraints hold.
- **Closed loop:** capture `machineId`, build-time source, and complexity terms so the **ML residual layer** (roadmap Layer 3) can later calibrate machine rates, time model, and complexity weights against real job actuals — the rigorous end-state. Hand-tuned weights are a stopgap.

## Files affected
- **New:** `engines/core/machines.js`, `engines/core/complexity.js`, `engines/quote-3d/slicer/slicer.bridge.js`, `engines/quote-3d/slicer/cura.worker.js`.
- **Modified:** `engines/quote-3d/quote.kernel.js`, `engines/quote-3d/slicer/fallback.estimate.js`, `engines/quote-3d/index.html` (machine UI + complexity display + settings), `engines/coefficients/fdm.default.json` (+ inline mirror), `engines/core/test/snapshot.mjs`, `app/client_pages_job_detail.jsx` + `app/client_pages_detail.jsx` (version bump).

## Sequencing
1. **Req 1** (machine profiles) — foundation; the machine carries the build profile.
2. **Req 2.1** (machine-aware physics time) — consumes the profile; immediate accuracy gain.
3. **Req 3** (auto-complexity) — independent; quick win.
4. **Req 2.2** (real slicer WASM) — last, flagged spike, optional.

## Out of scope (future)
ML residual correction / analog retrieval (roadmap Layer 3), capacity-aware lead pricing, metal AM
(LPBF orientation/support), and a dedicated **CNC** engine (subtractive — different cost model; removed
from this additive engine on purpose).
