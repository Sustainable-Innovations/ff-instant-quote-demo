// engines/quote-3d/quote.kernel.js
// Layer-2/4 should-cost kernel for the polymer AM engine (FDM · SLA · SLS — additive only;
// CNC/subtractive is a separate Tier-C engine with a setup/removal-based cost model).
// DOM-free and framework-free — imported by index.html (browser) and the snapshot
// test (Node). For Phase 0 this reproduces the legacy updateQuote() math EXACTLY
// (prices unchanged). The Phase-1 FDM upgrade swaps only the machine-time model via
// `timeModel` (see ./slicer/fallback.estimate.js); the default keeps legacy behaviour.

import { makeQuoteResult } from '../core/schema.js';
import { row, sumBreakdown, evaluateConfidence } from '../core/shouldcost.js';
import { leadDays, learningFactor, applyMarkup } from '../core/pricing.js';
import { coefficientsRef } from '../core/coefficients.js';

const clampQty = (q) => Math.max(1, Math.min(500, parseInt(q, 10) || 1));

/**
 * @param {Object} features  {volume_mm3, surface_mm2, bbox_mm, triCount, watertight}
 * @param {Object} sel       selections: {process, material, qty, lead, params:{infill,layerHeight,tolerance,finish}}
 * @param {Object} coeffs    {general, materials, processes}
 * @param {Object} [opts]    {parserConfidence, timeModel}
 *   timeModel(features, process, params) → {est_hours, materialFactor?, gramsModel?, gramsSupport?}
 *   overrides legacy time/material derivation (Phase 1). Optional.
 * @returns {import('../core/schema.js').QuoteResult}
 */
export function computeAMQuote(features, sel, coeffs, opts = {}) {
  const processKey = sel.process;
  const process = coeffs.processes[processKey];
  const material = coeffs.materials[sel.material];
  const general = coeffs.general;
  if (!process || !material) return makeQuoteResult({ process: processKey, currency: general?.currency || 'SAR' });

  const qty = clampQty(sel.qty);
  const lead = sel.lead === 'express' ? 'express' : 'standard';
  const leadMult = general.leadMultipliers[lead] ?? 1.0;
  const params = sel.params || {};

  // ----- per-process material-usage and time-scale factors (legacy semantics) -----
  let materialFactor = 1.0;
  let timeScale = 1.0;
  const modifiers = [];

  if (processKey === 'fdm') {
    const infillPct = params.infill ?? 20;
    materialFactor = 0.15 + 0.85 * (infillPct / 100);
    const lh = params.layerHeight ?? process.baseLayerHeight;
    timeScale = process.baseLayerHeight / lh;
    modifiers.push({ label: `Infill (${infillPct}%)`, value: `×${materialFactor.toFixed(2)} mat.` });
    modifiers.push({ label: `Layer height (${lh.toFixed(2)} mm)`, value: `×${timeScale.toFixed(2)} time` });
  } else if (processKey === 'sla' || processKey === 'sls') {
    const lh = params.layerHeight ?? process.baseLayerHeight;
    timeScale = process.baseLayerHeight / lh;
    modifiers.push({ label: `Layer height (${lh.toFixed(3)} mm)`, value: `×${timeScale.toFixed(2)} time` });
  }

  // ----- cost components -----
  const vol_cm3 = features.volume_mm3 / 1000;

  // machine time: legacy throughput proxy unless a Phase-1 timeModel is supplied.
  // ALL Phase-1 additions (support material, post-processing) are gated on `tm` so the
  // default/legacy path stays byte-identical to the pre-refactor engine (snapshot gate).
  const tm = opts.timeModel ? opts.timeModel(features, process, params) || null : null;
  const est_hours = tm && tm.est_hours != null ? tm.est_hours : (features.volume_mm3 / process.mmPerHour) * timeScale;
  if (tm && tm.materialFactor != null) materialFactor = tm.materialFactor;
  const weight_g = vol_cm3 * material.density * materialFactor;

  const supportGrams = tm && tm.supportVol_mm3 ? (tm.supportVol_mm3 / 1000) * material.density : 0;
  const supportCost = supportGrams * material.pricePerG;
  const postProcPerUnit = tm ? (process.build && process.build.postProcPerUnit) || 0 : 0;
  const layerCount = tm ? tm.layerCount : null;

  // Canonical decomposition (docs/pricing-rationalization.md):
  //   variable = material(+support)  +  machine_time×rate×complexity   ← constant per unit
  //   labor    = post-processing × learningFactor(qty)                 ← only qty-elastic variable
  //   fixed    = setup / qty                                           ← the legitimate qty economy
  //   price    = (material + conversion×leadMult) × (1+oh)(1+margin),  floored by minOrder
  // `complexity` now scales MACHINE TIME only (default 1.0); AM's old blanket 1.1/1.25/1.20
  // markup is re-expressed as marginPct, so qty=1 (standard) prices are unchanged.
  const complexity = process.complexity ?? 1.0;
  const overheadPct = process.overheadPct ?? 0;
  const marginPct = process.marginPct ?? 0;
  const learningRate = general.learningRate ?? 1.0;
  const minOrder = general.minOrder ?? 0;

  const materialCost = weight_g * material.pricePerG;
  const machineCost = est_hours * process.hourlyRate * complexity;
  const laborCost = postProcPerUnit * learningFactor(qty, learningRate);
  const setupFee = process.setupFee; // one-time per order
  const setupPerUnit = setupFee / qty; // amortised across the batch

  const passthrough = materialCost + supportCost; // no rush premium on pass-through material
  const conversion = machineCost + laborCost + setupPerUnit;
  const subtotal = passthrough + conversion; // per-unit should-cost (pre overhead/margin/lead)
  const markup = (1 + overheadPct / 100) * (1 + marginPct / 100);

  const unitPrice0 = (passthrough + conversion * leadMult) * markup;
  const orderRaw = unitPrice0 * qty;
  const total = Math.max(minOrder, orderRaw);
  const minOrderApplied = total > orderRaw + 1e-9;
  const unitPrice = qty ? total / qty : total;

  // ----- canonical additive breakdown (sums to per-unit should-cost) -----
  const breakdown = [
    row('material', `Material (${material.name})`, materialCost),
  ];
  if (supportCost > 0) breakdown.push(row('support', 'Support material', supportCost, `${supportGrams.toFixed(1)} g`));
  breakdown.push(
    row('machine', 'Machine time', machineCost, `${(est_hours * 60).toFixed(0)} min @ ${process.hourlyRate.toFixed(2)}/h${complexity !== 1 ? ` ×${complexity.toFixed(2)}` : ''}`),
    row('setup', 'Setup fee', setupPerUnit, qty > 1 ? `${setupFee.toFixed(2)} ÷ ${qty}` : 'one-time')
  );
  if (laborCost > 0) breakdown.push(row('postproc', 'Post-processing', laborCost, qty > 1 && learningRate < 1 ? 'per unit · learning curve' : 'per unit'));

  // ----- review gate -----
  const review = evaluateConfidence(
    features,
    { review: { envelope: process.envelope, parserConfidenceFloor: general.parserConfidenceFloor } },
    { parserConfidence: opts.parserConfidence }
  );

  return makeQuoteResult({
    process: processKey,
    currency: general.currency || 'SAR',
    shouldCost: subtotal,
    price: total,
    unitPrice,
    quantity: qty,
    leadTimeDays: leadDays(general.leadDays, lead, lead === 'express' ? 3 : 7),
    breakdown,
    factors: { complexity, qtyDisc: 1.0, leadMult, marginPct, overheadPct, minOrderApplied },
    components: { weight_g, est_hours, materialCost, machineCost, setupFee, setupPerUnit, vol_cm3, modifiers,
                  supportGrams, supportCost, postProcPerUnit: laborCost, layerCount },
    features,
    coefficientsRef: coefficientsRef(coeffs),
    confidence: review.confidence,
    needsReview: review.needsReview,
    reviewReasons: review.reasons,
  });
}

export { sumBreakdown };
