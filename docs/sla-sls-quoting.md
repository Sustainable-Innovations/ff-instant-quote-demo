# FlexFactory — SLA & SLS Quoting Upgrade (plan · best practices · tooling)

> **Audience:** Claude Code (fresh chat) + engineering. Self-contained plan to make **resin (SLA/MSLA/DLP)**
> and **powder (SLS/MJF)** quoting process-correct. Read with `docs/instant-quote-roadmap.md`,
> `docs/pricing-rationalization.md`, and `docs/am-machine-profiles-slicing-complexity.md`.
> **Status:** not started. Machine profiles exist for SLA/SLS, but **both still run the FDM build-time model**,
> which is physically wrong for resin and powder — that is the accuracy gap this plan closes.

---

## 0. Current state (so you don't re-derive it)

- Engine: `engines/quote-3d/` (additive FDM·SLA·SLS). Kernel `quote.kernel.js`; time surrogate `slicer/fallback.estimate.js`; optional PrusaSlicer backend bridge (`?slicerApi=`, FDM) via `readEngineConfig()` in `core/coefficients.js`.
- Coefficients `engines/coefficients/fdm.default.json` (+ **inline `DEFAULTS` mirror** in `index.html` — keep in sync). SLA machines: *Elegoo Saturn · Formlabs Form 3+ · Form 3L*. SLS machines: *Formlabs Fuse 1+ · EOS P396*.
- **The problem:** SLA/SLS `build` blocks reuse the FDM shape (`volumetricFlow_mm3ps`, `layerOverheadSec`, `supportFraction`) and the surrogate computes `time = depositedVol/flow + layers×overhead`. That is FDM physics. Resin and powder don't work that way (§2).
- Canonical pricing (`pricing-rationalization.md`): flat per-unit variable cost; qty economy only from `setup/qty` (+ labor learning); lead on conversion; explicit margin/overhead; min-order floor. Machine profiles + `confidence`/`needsReview` + `quote_generated` capture already in place.

---

## 1. Why the FDM model is wrong here (the core insight)

| | **FDM** | **SLA / MSLA / DLP (resin)** | **SLS / MJF (powder)** |
|---|---|---|---|
| Time driver | deposited volume (nozzle traces paths) + layers | **layers × (exposure + peel)** — *whole layer cures at once; area-independent* (MSLA/DLP). Laser-SLA (Formlabs) traces → area matters | **shared build height** (machine fuses the whole bed per layer) — **per-part time ≈ share of total build**, driven by nesting |
| Support | overhangs need support | fine-tip supports, orientation-heavy | **none** (powder self-supports) — big saving |
| Material | filament ≈ deposited volume | cured resin volume + supports; vat resin reused | **fused volume + powder-refresh allocation on bounding box** (only 50–80% powder reused) |
| Cost economy of scale | setup/qty | setup/qty + **plate packing** (fill the vat ~free) | **3D packing density** (#1 lever) + build-height amortization |

**Consequences:**
- **SLA:** two parts of equal height take ~equal time regardless of footprint; the FDM `volume/flow` term mis-prices short-fat vs tall-thin. Real MSLA per-layer time = **exposure + dead/peel time (~4–8 s/layer)**, with the first 3–8 **bottom layers at 3–6× exposure**.
- **SLS:** cost is a **build-volume allocation problem**, not a per-part slice. Bounding box (XYZ) matters even for low-volume parts; **packing density** and **powder refresh ratio** dominate. Industry tools price SLS by *bounding-box (XYZ)* or *low-density/offset* methods, MJF by *material* method.

---

## 2. Best practices (how the industry actually quotes these)

**Resin (SLA/MSLA/DLP):**
- Time = `bottomLayers·bottomExposure + (layers−bottom)·exposure + layers·deadTime`. **Area-independent** on MSLA/DLP; add a laser-trace term only for laser-SLA (Formlabs).
- Material = cured part volume + **support volume** (support-heavy; orientation-dependent). Vat resin is reused, so bill cured mL, not vat fill.
- Batch economy = **vat packing**: many parts, same height, ≈ same machine time → amortize build time across the plate.

**Powder (SLS/MJF):**
- **Packing density is the #1 cost lever.** Allocate the shared build: `machineTime_share = (part build-height contribution / total build height) × build machine time`, or simpler bounding-box XYZ pricing.
- Material = `fusedVolume × price` + **powder-refresh allocation** ≈ `(bboxVolume − fusedVolume) × refreshFraction × price` (SLS ~50% fresh, MJF ~20% fresh).
- No supports. MJF typically **15–30% cheaper** than SLS at volume.
- This is the **3D analog of the laser nest-yield** you already built — allocate a shared resource by a packing/yield factor, and **expose the assumption in the breakdown**.

**What's already in use (commercial):**
| Tool | Role | Embeddable? |
|---|---|---|
| **AMFG** | Enterprise AM quoting; 20+ processes (SLS/MJF/DMLS/SLA); pricing validated on real EOS/HP machine data; factors material, build optimization, machine time, post-processing | ❌ backend SaaS |
| **Oqton** | Cloud Manufacturing OS; AI instant quote; build time + material + **optimal nesting/orientation** across SLS/SLA/PBF | ❌ backend SaaS |
| **DigiFabster / AutoQuote3D** | Instant-quote engines; SLS via **bounding-box** + **low-density** pricing, MJF via **material** pricing | ❌ backend SaaS |
| **Materialise Magics** | Industry-standard SLS/MJF **build prep + 3D nesting** | ❌ desktop/enterprise |
| **PrusaSlicer (SLA/SL1)** | Support gen + cured material + time — **but CLI is limited**: `--export-sla` emits layer PNGs, not automated supports/metrics; GUI-only for supports | ⚠️ weak automation |
| **ChiTuBox / Lychee** | Dominant MSLA/DLP slicers → exposure time + resin mL | ⚠️ GUI-first, no clean CLI |
| **Formlabs PreForm + Local/Web API** | Time + material for Formlabs laser SLA | ⚠️ vendor-locked (host backend) |

**Takeaway:** the accurate commercial engines are **cloud/enterprise** and run **nesting + real machine data** — they belong in the **host backend**, not the browser. Client-side, the right primary is a **process-correct parametric model**; slicers/APIs are optional server-side accuracy boosts through the existing bridge.

---

## 3. What to implement

### 3.A SLA — resin exposure model (client, primary) + optional support/material backend

**Coefficient shape** — replace the FDM `build` with a resin `build` per machine:
```jsonc
"build": {
  "kind": "resin",
  "layerTimeSec": 2.2,        // exposure per normal layer (material/machine)
  "deadTimeSec": 6.0,         // lift + peel + settle per layer
  "bottomLayers": 5,
  "bottomExposureMult": 4.0,
  "supportFraction": 0.15,    // support volume as fraction of part volume (orientation proxy)
  "laserTraceFactor": 0.0     // >0 only for laser-SLA (Formlabs): adds area/perimeter term
}
```
**Time model** (new `resinTimeModel` in `slicer/fallback.estimate.js`, selected by `build.kind`):
```
layers   = ceil(bbox.z / layerHeight)
bottom   = min(bottomLayers, layers)
time_s   = bottom·(layerTimeSec·bottomExposureMult) + (layers−bottom)·layerTimeSec + layers·deadTimeSec
         + laserTraceFactor · (surfaceArea or perimeter proxy) / refSpeed      // laser-SLA only
est_hours = time_s / 3600
```
**Material:** cured `partVolume × materialFactor(=1) + supportVol` → grams via resin density (already computed). Keep support in the breakdown.

**Backend (optional, opt-in via `?slicerApi=`):** a resin slicer service (PrusaSlicer-SLA headless, or PreForm API for Formlabs suppliers) that returns `{timeSec, gramsModel, gramsSupport}`. **Honest note:** PrusaSlicer's SLA **CLI can't cleanly emit supports+metrics today** — a real backend likely computes metrics from the sliced layer stack (≈ the parametric model) or uses the vendor API. So the **parametric model is the deliverable**; the slicer backend is a lower-priority spike. Falls back to the parametric model on timeout/absence.

### 3.B SLS — 3D packing / build-share cost model (client) + optional nesting backend

**Coefficient shape** — SLS machine gets a chamber + powder economics, no supports:
```jsonc
"build": {
  "kind": "powder",
  "chamber": { "x": 165, "y": 165, "z": 300 },   // build volume (Fuse 1+ ≈; EOS larger)
  "layerTimeSec": 9.0,          // machine time per full-bed layer (recoat + fuse pass)
  "layerHeight": 0.11,
  "packingDensity": 0.10,       // typical fraction of chamber volume that is good parts (supplier-tunable)
  "powderRefreshFraction": 0.5, // SLS ~0.5 fresh, MJF ~0.2
  "postProcPerUnit": 2.5
}
```
**Cost model** (new `powderCostModel`): allocate the **shared build** to the part by its bounding-box occupancy.
```
partBbox_mm3   = bbox.x·bbox.y·bbox.z
buildLayers    = ceil(chamber.z / layerHeight)              // a full build
machineTimeFull= buildLayers · layerTimeSec                 // hours for a full chamber
occupancyShare = partBbox_mm3 / (chamber_mm3 · packingDensity)   // fraction of a build this part 'uses'
machineCost    = occupancyShare · machineTimeFull · ratePerHour
material       = fusedVol·pricePerG                                   // the part itself
               + max(0, partBbox_mm3 − fusedVol)·powderRefreshFraction·pricePerG   // refresh allocation
```
- Expose **packing density** in the breakdown (supplier-visible, tunable) — exactly like laser **nest yield**. Add a "refine packing" hook later (true 3D nesting) analogous to laser true-shape nesting.
- No support row. Height-dominated: a tall part uses more build layers → costs more (correct).

**Backend (optional, future):** true 3D nesting / build-share from **Oqton/Materialise-class** services in the host backend; client keeps the packing-density estimate as the fast path.

### 3.C Shared
- **Process dispatch in the kernel/surrogate by `build.kind`** (`fdm`|`resin`|`powder`); keep FDM as-is. Each returns the same `{est_hours, materialFactor, supportVol_mm3|0, layerCount, source}` shape so the canonical pricing + breakdown reuse works unchanged.
- **Confidence:** resin/powder estimates start medium; oversized-vs-chamber → review; expose the estimate **source** ("resin exposure model" / "powder packing model" / "sliced").
- **Capture** the model kind, packing density / vat-fill assumption, and machine id into `quote_generated` for later calibration.
- **Pricing rationality preserved** (no blanket qty discount; machine time is conversion; material is pass-through; min-order floor). **Mirror inline `DEFAULTS`**; bump `quoteVersion` + AM localStorage key.

---

## 4. Backend vs client — where each engine runs

- **Client (in this repo, now):** parametric **resin exposure model** and **powder packing model** — fast, offline, `<5s`, good ±20% indicative accuracy after tuning. This is the deliverable.
- **Host backend (Phase-4, later):** real slicers / nesting / vendor APIs for accuracy — **PrusaSlicer-SLA or PreForm** (resin material+supports), **Oqton/Materialise/AMFG-style nesting + machine-data pricing** (powder). Wired through the existing bridge seam (`?slicerApi=`), same pattern as FDM; results override the parametric model when present, else graceful fallback.
- **Never** try to embed Magics/EOS/HP/AMFG in the browser — they're enterprise; they belong server-side.

## 5. Files affected
- **New:** resin + powder model functions in `engines/quote-3d/slicer/fallback.estimate.js` (or split into `slicer/resin.estimate.js`, `slicer/powder.estimate.js`); optional `slicer/sla.bridge.js`.
- **Modified:** `engines/quote-3d/quote.kernel.js` (dispatch by `build.kind`; powder cost path), `engines/coefficients/fdm.default.json` (+ inline mirror) — resin/powder `build` blocks per SLA/SLS machine, `engines/quote-3d/index.html` (breakdown rows: exposure/peel for resin, packing density for powder; settings), `engines/core/test/snapshot.mjs`, marketplace version bump.

## 6. Tests (invariants)
- **SLA:** build time scales with **height/layers**, ~**independent of footprint** (equal-height parts ≈ equal time); bottom-layer exposure adds a fixed premium; support row present; qty economy only from setup/vat amortization.
- **SLS:** cost scales with **bounding box + height**, drops with **higher packing density**; **no support row**; powder-refresh term present; tall part costs more than flat of equal volume.
- Machine dispatch: `build.kind` selects the right model; FDM unchanged (existing goldens hold).

## 7. Acceptance
Resin quotes reflect exposure/peel/height (not FDM volume-flow); SLS quotes reflect bounding-box occupancy + packing density + powder refresh (not per-part volume-flow), with packing density supplier-visible; both keep canonical pricing, confidence/review, capture; `<5s`; optional backend slicer/nesting overrides via the bridge with graceful fallback.

## 8. Sequencing
1. **SLA resin model** (self-contained; high fidelity for MSLA/DLP; reuses machine profiles).
2. **SLS powder/packing model** (reuses the laser nest-yield pattern in 3D).
3. **Optional backends** (resin slicer / 3D nesting) — flagged spikes, host-backend, last.

## 9. Out of scope (future)
Metal PBF (LPBF orientation/support/warpage), true 3D nesting solver in-browser, vendor-API integrations (PreForm/HP/EOS), and ML residual calibration of exposure/packing coefficients against real job actuals (roadmap Layer 3).

---

## Sources
- SLS/MJF pricing methods (bounding-box, low-density; packing density as #1 lever; powder refresh; MJF cheaper): [AutoQuote3D — instant SLS quotes](https://www.autoquote3d.com/blog/now-supporting-instant-sls-3d-printing-quotes), [Protolabs Network — MJF vs SLS](https://www.hubs.com/knowledge-base/hp-mjf-vs-sls-3d-printing-technology-comparison/), [Formlabs — MJF vs SLS](https://formlabs.com/blog/mjf-vs-sls-plastic-powder-bed-fusion-3d-printer-comparison/), [Ponoko — SLS vs MJF cost](https://www.ponoko.com/guides/3d-printing/sls-vs-mjf-the-cost-breakdown/)
- MSLA time (exposure + dead/peel per layer; bottom-layer exposure): [Kudo3D — exposure/lift parameters](https://www.kudo3d.com/recommended-printing-parameters-exposure-time-lifting-height-lifting-speed-2/), [Fabbaloo — MSLA core concepts](https://www.fabbaloo.com/news/unlocking-mslas-secrets-3-core-concepts-for-better-resin-3d-prints)
- PrusaSlicer SLA CLI limits: [PrusaSlicer CLI wiki](https://github.com/prusa3d/PrusaSlicer/wiki/Command-Line-Interface), [Issue #7737 — SLA supports from CLI](https://github.com/prusa3d/PrusaSlicer/issues/7737)
- Commercial AM quoting engines (nesting + real machine data): [AMFG](https://www.amfg.ai/), [Oqton via SourceForge AM roundup](https://sourceforge.net/software/additive-manufacturing/), [DigiFabster](https://digifabster.com/)
