# FlexFactory — Pricing Rationalization (spec + as-built)

> Scope: make the Tier-A instant-quote pricing (AM · laser · PCB) economically rational without
> silently repricing the demo. **Calibration principle: qty=1 prices are preserved exactly;**
> only the *scaling* with quantity (and a few structural gaps) changes.
> Files: `engines/core/pricing.js`, `engines/quote-*/quote.kernel.js`, `engines/coefficients/*.json`,
> `engines/quote-3d/index.html`, `engines/quote-laser/index.html`, `engines/core/test/snapshot.mjs`.

## 1. The problem (what was irrational)

1. **Blanket quantity discount on variable cost (AM + laser).** A hardcoded `qtyTier` multiplier
   (e.g. 0.65 at qty100) was applied to the *entire* unit price — material, machine time, everything —
   on top of separate setup amortization. But in AM you print every part identically and in laser you
   cut every part identically: per-part variable cost is **constant**. The model double-counted
   economies of scale and underpriced batches ~35%.
2. **Laser had no setup/programming cost**, so its qty discount modelled a mechanism that did not exist;
   single parts only survived via the `minCharge` floor.
3. **Margin/overhead opaque and inconsistent.** AM's only markup was a `complexity: 1.1` factor
   (profit hidden in rates); laser/PCB had explicit `marginPct`/`overheadPct`/`platformPct`.
4. **Complexity multiplied material + setup** (AM) — a complex part does not make filament or a fixed
   setup fee more expensive.
5. **No AM minimum order** — tiny parts floored only at the setup fee.
6. **Express lead premium hit pass-through material.**
7. **PCB qty/panel factor applied to the base board only, not the per-board adders** (finish, copper,
   drilling) — inconsistent.

## 2. Canonical cost decomposition (all engines follow this)

```
variable_unit  = material(+support)            ← pass-through, constant per unit
               + machine_time × rate           ← constant per unit (no qty discount)
               + consumables                   ← constant per unit
labor_unit     = touch labor (deburr, unload, support removal, post-proc)
               × learningFactor(qty, rate)     ← ONLY qty-elastic variable; default rate 1.0 = neutral
fixed_order    = setup + programming + tooling + engineering
fixed_unit     = fixed_order / qty             ← the PRIMARY, legitimate qty economy

conversion_unit = machine_time×rate + consumables + labor_unit + fixed_unit
unit_cost       = material + conversion_unit
unit_price      = ( material + conversion_unit × leadMult )   ← lead premium on conversion only
                  × (1 + overheadPct/100) × (1 + marginPct/100)
order_total     = max( minOrder , unit_price × qty )
```

Quantity economics now emerge from `fixed_order/qty` (+ optional learning curve on labor), **not** from a
magic multiplier. Material and machine throughput stay flat per unit — which is the real physics of AM and
laser. PCB keeps a panel `qtyFactor` because boards genuinely **share a panel** (per-board processing really
does drop with volume) — but it is now applied **uniformly** to every per-board cost.

### Why qty=1 is unchanged
At qty=1, `fixed_unit = fixed_order` (old setup fee), the removed `qtyTier` factor was already 1.0, and AM's
old `complexity` markup is re-expressed exactly as `marginPct` (1.10 → 10%, 1.25 → 25%, 1.20 → 20%). So the
qty=1 number is identical; the difference appears only at qty>1, where the model stops over-discounting.

## 3. Shared helpers — `engines/core/pricing.js`

- `learningFactor(qty, rate=1)` — Wright cumulative-average factor `qty^log2(rate)`; `rate=1 → 1` (neutral).
- `amortizeFixed(fixedOrder, qty)` — `fixedOrder / max(1,qty)`.
- `applyMarkup(cost, overheadPct, marginPct)` — `cost × (1+oh/100) × (1+margin/100)`.
- (kept) `qtyFactorFromTiers`, `qtyFactorFromMap`, `leadDays`, `leadMultiplier`.

## 4. Per-engine changes

### 4.1 AM — `quote-3d/quote.kernel.js` + `coefficients/fdm.default.json`
- Remove `general.qtyTiers` usage (no blanket discount). `factors.qtyDisc` fixed at `1.0`.
- `complexity` no longer a blanket multiplier → re-expressed as per-process **`marginPct`** (fdm 10, sla 25,
  sls 20). Add per-process **`overheadPct`** (default 0). A `complexity` hook remains, default 1.0, and now
  scales **machine time only** (future geometry-difficulty lever).
- Add **`general.minOrder`** (default 20 SAR — set below the smallest normal-part price so it floors only genuinely tiny parts and never disturbs the preserved qty=1 anchors) → order floor.
- Add **`general.learningRate`** (default 1.0) → applied to `postProc` labor.
- Lead multiplier applies to **conversion only** (machine + labor + setup), not material.
- Output shape preserved (`components.*`, `factors.*`) so `index.html` keeps working; new
  `factors.marginPct/overheadPct/minOrderApplied`.

### 4.2 Laser — `quote-laser/quote.kernel.js` + `coefficients/laser.default.json`
- Add **`rates.programmingFee`** (default 60 SAR/order) → amortized `/qty` as the real qty driver.
- Remove blanket `qty` tier discount (`factors.qtyDisc = 1.0`; `qty` array removed).
- `learningRate` (default 1.0) on `unload + deburr` labor.
- Lead multiplier on conversion (cut + labor + programming), not sheet material.
- New breakdown row **"Programming / setup"**; `minCharge` floor retained.

### 4.3 PCB — `quote-pcb/quote.kernel.js` (coefficients unchanged)
- Apply the panel `qtyFactor` **uniformly** to every per-board item (base + finish + copper + mask +
  thickness + features + via + gold + drilling), not just the base board.
- Keep engineering/tooling **setup** and **test fee** as fixed per-order (no qty factor) — correct.
- qty=1 unchanged (`qtyFactor=1.0` at qty≤5).

## 5. Tests — `engines/core/test/snapshot.mjs`
Replace the "matches legacy" gate with **invariant tests** that encode rationality:
- **qty=1 preserved:** AM/laser qty1 price == legacy qty1 price (golden anchors).
- **flat variable cost:** for AM and laser, `unit_price(qty) − fixed_unit(qty)`, de-marked-up, is constant
  across qty (the core fix).
- **fixed amortization monotonic:** unit price strictly decreases with qty but converges to the variable
  floor (never below it).
- **min-order / min-charge** floors apply as expected.

## 6. Task checklist
- [x] `pricing.js` helpers (`learningFactor`, `amortizeFixed`, `applyMarkup`).
- [x] AM kernel + `fdm.default.json` (marginPct/overheadPct/minOrder/learningRate; drop blanket qtyDisc).
- [x] Laser kernel + `laser.default.json` (programmingFee; drop blanket qtyDisc; lead-on-conversion).
- [x] PCB kernel (uniform qtyFactor).
- [x] AM + laser `index.html` breakdown display updated (margin/min-order rows; drop qty-discount row).
- [x] Snapshot test rewritten to invariants; `node engines/core/test/snapshot.mjs` green.

## 7. Out of scope (future)
Capacity-aware lead pricing & win-probability/margin optimization (research §lead-time + ML overlays);
nest-yield-by-quantity for laser; geometry-driven `complexity` from feature counts.
