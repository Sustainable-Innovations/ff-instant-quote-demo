// engines/core/pricing.js
// Layer 4 — business rules turning a should-cost into a final price.
// Generic, DOM-free. Engines compose these; the per-process recipe stays in the
// engine's quote.kernel.js so this module never hardcodes a process.

/**
 * Quantity multiplier from an array of tiers `[{minQty, multiplier}]`.
 * Picks the highest `minQty` that is <= qty (matches quote-3d `quantityDiscount`).
 */
export function qtyFactorFromTiers(qty, tiers) {
  const sorted = [...(tiers || [])].sort((a, b) => b.minQty - a.minQty);
  for (const t of sorted) if (qty >= t.minQty) return t.multiplier;
  return 1.0;
}

/**
 * Quantity multiplier from a map `{ "5":1.0, "10":0.85, ... }`.
 * Picks the factor of the highest key <= qty (matches quote-pcb `nearestQtyFactor`).
 */
export function qtyFactorFromMap(qty, map) {
  const tiers = Object.keys(map || {})
    .map(Number)
    .sort((a, b) => a - b);
  if (!tiers.length) return 1.0;
  let f = map[String(tiers[0])];
  for (const t of tiers) if (qty >= t) f = map[String(t)];
  return f;
}

/** Lead-time multiplier lookup (>=1). */
export function leadMultiplier(leadMap, key, fallback = 1.0) {
  return (leadMap && leadMap[key]) ?? fallback;
}

/** Additive lead-time uplift on a subtotal, given a multiplier. */
export function leadUplift(subtotal, leadMult) {
  return subtotal * (leadMult - 1);
}

/** Percentage fee on an amount (e.g. PCB platform fee). */
export function pctFee(amount, pct) {
  return amount * (pct / 100);
}

/** Apply a margin percentage to a cost (returns marked-up total). */
export function applyMarginPct(cost, marginPct) {
  return cost * (1 + (marginPct || 0) / 100);
}

/** Lead-time in days for a lead key, from a coefficient map (display only). */
export function leadDays(leadDaysMap, key, fallback = 7) {
  return (leadDaysMap && leadDaysMap[key]) ?? fallback;
}

// ---------------------------------------------------------------------------
// Canonical decomposition helpers (see docs/pricing-rationalization.md).
// The rule: variable cost is constant per unit; only FIXED cost amortizes with
// quantity, plus an optional learning curve on touch labor. No blanket qty
// multiplier on the whole unit price.
// ---------------------------------------------------------------------------

/**
 * Wright cumulative-average learning factor for a batch of `qty` units.
 * Average per-unit labor multiplier = qty^log2(rate). rate=1 → 1 (neutral/off).
 * rate 0.9 ≈ 10% labor reduction per doubling. Applied to TOUCH LABOR only.
 */
export function learningFactor(qty, rate = 1) {
  const r = Number(rate);
  const q = Math.max(1, qty || 1);
  if (!Number.isFinite(r) || r >= 1 || r <= 0) return 1;
  return Math.pow(q, Math.log2(r));
}

/** Amortize a one-time per-order fixed cost across the batch. */
export function amortizeFixed(fixedOrder, qty) {
  return (fixedOrder || 0) / Math.max(1, qty || 1);
}

/** Apply overhead% then margin% to a cost basis. */
export function applyMarkup(cost, overheadPct = 0, marginPct = 0) {
  return cost * (1 + (overheadPct || 0) / 100) * (1 + (marginPct || 0) / 100);
}
