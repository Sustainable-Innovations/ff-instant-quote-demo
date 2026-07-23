# FlexFactory — PCB Instant-Quote Engine · Detailed Plan

> Status: **BUILT** (Phase 0–3) at `engines/quote-pcb/index.html`. Scope: **PCB fabrication only**
> (no PCBA/assembly). Decisions locked: 2D top/bottom viewer · auto-detect from Gerber · core
> price-driver parameters · layered itemized pricing with admin-editable rates (localStorage).
> See **§11 Implementation notes** for the as-built stack and gotchas.

## 11. Implementation notes (as built)

**Confirmed stack (Phase 0 spike, on a real KiCad 4-layer board):**
- **Unzip:** `fflate` (`unzipSync`/`strFromU8`) via esm.sh. ⚠️ `JSZip` via esm.sh **hangs** on decompression — do not use.
- **Render:** `@tracespace/core@5.0.0-alpha.0` via esm.sh (v4 `pcb-stackup` is unusable in-browser — depends on Node `readable-stream`). Pipeline: build `File[]` → `await read(files)` → `await plot()` → `renderLayers()` → `renderBoard(renderLayersResult)` → `{top, bottom}` → `stringifySvg()`. **Inputs must be `File` objects; exclude `.gbrjob` and documentation layers (`*_Fab`, `*Comment*`, `*Assembly*`, `*Drawing*`) or the parser throws.**
- **Display:** rasterize each SVG (blob-URL `Image`) onto a fit-to-view **`<canvas>`** — raw SVG DOM/`<img>` of dense copper is too heavy to paint.
- **Auto-detect:** prefer the `.gbrjob` (KiCad job file → authoritative size/layers/thickness/material); fall back to the board SVG `viewBox` (W×H mm) + copper-layer count. Holes + min-hole parsed from Excellon `.drl` (tool table + coordinate hits).
- ⚠️ **Gotcha:** never gate async flow on `requestAnimationFrame` — rAF doesn't fire in headless/background preview contexts and hangs the pipeline. Use `setTimeout`.

**Design:** the engine mirrors the **3D engine's** design system exactly (shared tokens, Helvetica Neue, fixed 64px blurred topbar + `LIVE` chip, `1fr / 420px` viewer+side-pane grid, side-pane tabs with full Settings overlay, blue **quote-hero** with folded-lime corner + lime total, `mats-table` rate editor). Currency is the marketplace's **Saudi Riyal SVG glyph** (not `﷼`/text).

**Live solder-mask recolour:** tracespace bakes the soldermask as `#004200` (dark green) inline in the board SVG; there is **no color option** in the core API. So we keep the raw SVG strings and `String.replace(/#004200/gi, MASK_BOARD[colour])` before rasterising to the canvas — changing the swatch re-themes and redraws instantly. `MASK_BOARD` maps each colour to a realistic soldermask hex.

**Embedded layout + iframe auto-resize:** standalone uses the fixed `1fr/420px` app-shell; **embedded** (`?embed=1`) switches to natural document flow (`main` static block, viewer 420px, side-pane no internal scroll, params in an auto-fit grid) and **`postMessage({type:'ffPcbHeight', height})`** to the parent on every render. The marketplace job page (`client_pages_job_detail.jsx`) listens and sets the iframe height (clamped 560–3000), so the price/breakdown is **never clipped**. Don't rely on `ResizeObserver` alone — it (like rAF) doesn't fire in the headless preview, so `postHeight()` is also called explicitly from `recompute()`/`drawBoard()` + timed ticks. Report `document.body.scrollHeight` (set `html{height:auto}` first, since it was `100%`).

**Verified on the sample board** (`dendrometer_v6`): rendered top/bottom, auto-detected **46.25 × 55.03 mm, 4 layers, 152 holes, 0.2 mm min hole**; live itemized pricing; **mask swatch recolours the preview** (green 78%→ red 83% on Red); admin Settings overlay save/persist/reset; `?embed=1` hides chrome + admin tabs; marketplace J-1 & J-3 embed it (J-2 still 3D).

---

## 1. Goal & context

The built engine is a self-contained, browser-only PCB quotation engine — the same architecture as the existing
3D engine (`engines/quote-3d/index.html`): a single HTML file, libraries via CDN/importmap,
all state client-side, `?embed=1` support, SAR-native pricing, and brand styling. It is
embedded by the marketplace on listings **J-1 "6-Layer PCB"** and **J-3 "Prototype PCB"**.

The engine must, like JLCPCB / NextPCB / AllPCB:
1. Accept a **Gerber + NC-drill ZIP**, parse it, and **render the board** (top & bottom).
2. **Auto-detect** board size, layer count, and hole count to prefill the form & feed price.
3. Let the user pick the **core fabrication parameters** that drive price.
4. Show a **live, itemized price breakdown**.
5. Let an **admin set every rate** behind that breakdown (Settings tab, persisted).

---

## 2. What PCB manufacturing quoting requires (domain)

A PCB fab quote is a function of the **board geometry** (from the Gerber) and a set of
**process parameters** (chosen by the buyer, constrained by the fab's capabilities). The
reference sites all expose the same core knobs. We implement the **core price-drivers**:

| # | Parameter | Source | Values (defaults **bold**) | Why it affects price |
|---|-----------|--------|----------------------------|----------------------|
| 1 | Base material | user | **FR-4**, Aluminum | Substrate cost |
| 2 | Layers | **auto** + override | 1, **2**, 4, 6 | More layers = more lamination/processing |
| 3 | Dimensions (W × H mm) | **auto** + override | from board outline | Board area is the main cost scalar |
| 4 | Quantity | user | 5, 10, 25, 50, **100**, 200, custom | Economies of scale (tiered) |
| 5 | Thickness | user | 0.6, 0.8, 1.0, 1.2, **1.6**, 2.0 mm | Material / handling |
| 6 | Solder-mask color | user | **Green**, Red, Yellow, Blue, White, Black, Purple | Non-green = setup adder / lead time |
| 7 | Silkscreen color | auto by mask | **White** / Black | Usually free, derived from mask |
| 8 | Surface finish | user | **HASL (lead-free)**, ENIG, OSP | ENIG (gold) is a significant adder |
| 9 | Outer copper weight | user | **1 oz**, 2 oz, 3 oz | More copper = material + etch difficulty |
| 10 | Via covering | user | **Tented**, Untented, Plugged, POFV | Process adder |
| 11 | Min track / spacing | user (capability tier) | **6/6 mil**, 5/5, 4/4, 3.5/3.5 | Finer features = yield cost |
| 12 | Gold fingers | user | **No**, Yes | Extra bevel/plating step |

Auto-detected, shown as a read-only **board readout** (override allowed where sensible):
**board size (mm), layer count, min hole size, hole count, units (mm/inch)**.

**Out of scope (noted, not built):** castellated holes, edge plating, controlled impedance,
explicit stackup selection, panelization / delivery format, "remove order number", and
**PCBA/assembly** entirely. Min track/space is **user-selected as a capability tier**, not
measured from the Gerber (aperture analysis is out of scope).

**File formats:** parse & render **Gerber RS-274X + Excellon/NC drill**, delivered as a **ZIP**
(also accept loose multi-file selection). ODB++ / IPC-2581 are *accepted* but fall back to
**manual parameter entry** (no render) — tracespace does not parse them.

---

## 3. Technical architecture

Single file `engines/quote-pcb/index.html`, mirroring the 3D engine:
- ES-module **importmap** + CDN libs (esm.sh / jsDelivr), no build step.
- `localStorage` for admin settings, `?embed=1` hides the topbar.
- Brand tokens (FF blue/navy/lime, Helvetica Neue) and layout matching `quote-3d`.

### 3.1 Gerber processing pipeline (as built; browser, no upload)

```
ZIP drop ──► fflate (unzip in-browser)
          ──► File objects filtered to manufacturing layers
          ──► @tracespace/core v5: read → plot → renderLayers → renderBoard
                ├─► top render  (SVG string + width/height in mm + viewBox)
                ├─► bottom render (SVG string + dimensions)
                └─► SVG rasterized to canvas; soldermask recolored live
          ──► .gbrjob or board viewBox ──► board W × H (mm) + layer count
          ──► Excellon drill parse ──► hole count + min hole size
```

**Libraries (loaded as ESM via esm.sh):**
- [`fflate`](https://www.npmjs.com/package/fflate) — ZIP decompression.
- [`@tracespace/core@5.0.0-alpha.0`](https://www.npmjs.com/package/@tracespace/core) — layer parsing, plotting, and top/bottom board rendering.

`JSZip` and tracespace v4's `pcb-stackup` were evaluated but are not used by the built engine; see the implementation notes above for the browser compatibility findings.

### 3.2 Auto-detect details
- **Board size:** bounding box of the outline layer (`Edge.Cuts` / `.gko` / `.gm1`), else the
  overall stackup dimensions from pcb-stackup. Convert to mm. → fills **Dimensions**, drives area.
- **Layers:** count of copper layers identified (top + bottom + inner `.g2`,`.g3`…). → fills **Layers**.
- **Holes:** parse the Excellon drill file → tool table + hit count → **hole count** + **min hole**.
- All overridable; price recomputes on change.

---

## 4. Pricing model (layered + itemized)

All rates live in an admin-editable settings object (defaults in code, persisted to
`localStorage`). Area in cm²: `area = (W_mm × H_mm) / 100`. Computed per board, then × quantity,
with a quantity-tier factor for economies of scale.

**Line items (each shown in the breakdown):**

| Line item | Formula (rates are admin-set) |
|-----------|-------------------------------|
| Engineering / setup (tooling) | `setupFee[layers]` — one-time per order |
| Board fabrication | `(fabSetupPerBoard[layers] + areaRate[layers] × area_cm2) × qty × qtyFactor(qty)` |
| Surface finish | `finishRate[finish] × area_cm2 × qty` (HASL ≈ 0, ENIG > 0) |
| Copper weight | `copperAdder[oz] × area_cm2 × qty` (1 oz = 0) |
| Solder-mask color | `colorAdder[color] × qty` (green = 0) |
| Thickness | `thicknessAdder[t] × qty` (1.6 mm = 0) |
| Fine-feature (track/space) | `featureAdder[tier] × qty` (6/6 = 0) |
| Via covering | `viaAdder[type] × qty` (tented = 0) |
| Gold fingers | `goldFingerAdder × qty` (if Yes) |
| Drilling | `drillRate × holeCount × qty` (optional; from auto-detect) |
| Electrical test | `testFee` per order (flying probe) |
| **Subtotal** | sum of the above |
| Lead-time | `× leadMultiplier[option]` (Standard 1.0 · 48 h · 24 h express) |
| Platform fee | `+ platformPct × subtotal` (marketplace cut, e.g. 12% — matches existing demo) |
| **Total** | final, plus **unit price = total / qty** |

`qtyFactor(qty)` is a decreasing tier table (e.g. 5→1.0, 50→0.7, 100→0.55…) so larger runs
get cheaper per board — admin-editable.

Currency: **SAR** with symbol, same setting as the 3D engine.

---

## 5. Admin Settings tab

Second top-tab "Settings" (like the 3D engine), editing every rate above, persisted to
`localStorage`, with **Reset to defaults** and optional **Export/Import JSON**:
- Currency + symbol.
- Per-layer tables: `setupFee`, `fabSetupPerBoard`, `areaRate` for 1 / 2 / 4 / 6 layers.
- Quantity-tier factor table.
- Adder tables: surface finish, copper weight, mask color, thickness, fine-feature tier, via covering, gold fingers.
- `drillRate`, `testFee`, `platformPct`.
- Lead-time options + multipliers.

---

## 6. UI layout (mirrors the 3D engine)

```
┌ topbar (FF logo · tabs: Quote | Settings)  — hidden when ?embed=1 ┐
│ ┌──────────────── Quote tab ─────────────────────────────────┐ │
│ │  LEFT: viewer                    RIGHT: parameters + price   │ │
│ │  • drop zone / file picker       • board readout (auto)      │ │
│ │  • Top / Bottom SVG (toggle)     • 12 core parameters        │ │
│ │  • layer visibility toggles      • live itemized breakdown   │ │
│ │  • board info (size/layers/holes)• total + unit price        │ │
│ └─────────────────────────────────────────────────────────────┘ │
└───────────────────────────────────────────────────────────────────┘
```
- Price recomputes **live** on any change (3D-engine behavior).
- Mask color selection **recolors the SVG preview** live.
- Optional: print/quote sheet (the 3D engine has print support) — Phase 4.

---

## 7. Implementation phases

- **Phase 0 — Spike (de-risk):** load `jszip` + `whats-that-gerber` + `pcb-stackup` via CDN in a
  scratch page; render a sample KiCad Gerber ZIP to top/bottom SVG; confirm dimensions & layer
  count. Pick primary vs fallback lib based on the result.
- **Phase 1 — Viewer:** ZIP/multi-file upload → identify → render top/bottom SVG → layer toggles
  → board readout (size, layers, holes, units).
- **Phase 2 — Parameters + pricing:** 12-field param panel + layered pricing engine + live
  itemized breakdown (defaults in code).
- **Phase 3 — Admin Settings:** editable rate tables, `localStorage` persistence, reset/export.
- **Phase 4 — Polish:** live mask recolor, `?embed=1`, brand styling parity with `quote-3d`,
  print/quote sheet, marketplace intro copy on J-3.

---

## 8. Marketplace integration

The PCB engine is wired to both PCB instant-quote listings:
- `J-1` "6-Layer PCB" and `J-3` "Prototype PCB" set `quote:true`, `quoteEngine:'pcb'`, and `quoteProcess:'pcb'` in `app/client_data.jsx`.
- `app/client_pages_job_detail.jsx` maps `pcb` to `../engines/quote-pcb/index.html`, appends `?embed=1&process=pcb`, and listens for `ffPcbHeight` messages to resize the iframe.
- `app/client_pages_detail.jsx` contains the same engine URL map for the legacy detail route and must remain aligned.

The cross-engine integration overview is in `docs/quotation-engine-integration.md`.

---

## 9. Verification

- Sample Gerber ZIP (KiCad demo board): top/bottom render correctly; auto-detected **size,
  layers, hole count** match the known board.
- Change each parameter → breakdown line items and **total** update live and sum correctly.
- Mask color change recolors the preview.
- Settings edits persist across reload; Reset restores defaults.
- Embedded views inside the J-1 and J-3 marketplace pages (`?embed=1`) hide the topbar and fit.
- No console errors; Chrome verified via the preview tools.

---

## 10. Operational follow-ups

- Replace the seeded SAR rates with approved production rates before treating results as firm quotations.
- Revalidate parsing and pricing against representative Gerber packages from supported PCB tools.
