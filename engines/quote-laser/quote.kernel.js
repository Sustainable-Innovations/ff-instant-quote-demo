// engines/quote-laser/quote.kernel.js
// Layer-2/4 should-cost kernel for laser / sheet-metal cutting. DOM-free.
//
//   C = sheet_material × nest_yield_allocation        (material, amortised by likely nest yield)
//     + cut_time + pierces (machine occupancy)
//     + gas / consumables
//     + unload/sort + deburr
//     + overhead,  then margin + qty + lead.
//
// Nest yield is a NEST-level variable: we estimate a likely yield and amortise the
// sheet cost back to the RFQ line with a supplier-visible, tunable rule (exposed in
// the breakdown). Pricing isolated parts without this mis-prices vs. real production nests.

import { makeQuoteResult } from '../core/schema.js';
import { row, evaluateConfidence } from '../core/shouldcost.js';
import { leadDays, learningFactor } from '../core/pricing.js';
import { coefficientsRef } from '../core/coefficients.js';

const clampQty = (q) => Math.max(1, Math.min(100000, parseInt(q, 10) || 1));
const nearestThicknessKey = (mat, thickness) => {
  const keys = Object.keys(mat.cutSpeed).map(Number).sort((a, b) => a - b);
  let best = keys[0];
  for (const k of keys) if (thickness >= k) best = k;
  // also snap up if request is below the smallest tabulated value
  if (thickness <= keys[0]) best = keys[0];
  return String(best);
};

/**
 * @param {Object} features  {perimeter_mm, pierces, bbox_mm:{x,y}, partAreaCm2, areaCm2}
 * @param {Object} sel       {material, thickness, qty, lead, edgeQuality, yieldOverride?}
 * @param {Object} c         laser coefficient set (laser.default.json shape)
 * @param {Object} [opts]    {parserConfidence}
 */
export function computeLaserQuote(features, sel, c, opts = {}) {
  const mat = c.materials[sel.material] || c.materials[Object.keys(c.materials)[0]];
  const rates = c.rates;
  const qty = clampQty(sel.qty);
  const lead = sel.lead === 'express' ? 'express' : 'standard';
  const leadMult = (c.lead && c.lead[lead]) ?? 1.0;
  const edge = (c.edgeQuality && c.edgeQuality[sel.edgeQuality]) || c.edgeQuality.standard || { speedMult: 1, multiplier: 1 };

  const thKey = nearestThicknessKey(mat, parseFloat(sel.thickness) || mat.thicknesses[0]);
  const cutSpeed = (mat.cutSpeed[thKey] || 1000) * (edge.speedMult || 1); // mm/min
  const pierceSec = mat.pierceSec[thKey] || 0.5;
  const sheetCostPerM2 = mat.sheetCostPerM2[thKey] || 0;

  const cutLen_mm = features.perimeter_mm || 0;
  const pierces = features.pierces || 0;
  const bbox = features.bbox_mm || { x: 0, y: 0 };

  // ----- machine occupancy -----
  const cutMin = cutLen_mm / cutSpeed;
  const pierceMin = (pierces * pierceSec) / 60;
  const machineMin = cutMin + pierceMin;
  const machineCost = (machineMin / 60) * rates.machineRatePerHour;
  const gasCost = machineMin * (mat.gasCostPerMin || 0);
  const cutCost = (machineCost + gasCost) * (edge.multiplier || 1);

  // ----- material amortised by nest yield -----
  const yieldFrac = clampYield(sel.yieldOverride != null ? sel.yieldOverride : c.nest.defaultYield);
  const footprint_m2 = ((bbox.x || 0) * (bbox.y || 0)) / 1e6;
  const allocated_m2 = yieldFrac > 0 ? footprint_m2 / yieldFrac : footprint_m2;
  const materialCost = allocated_m2 * sheetCostPerM2;

  // ----- handling + finishing (touch labor — learning-curve eligible) -----
  const learningRate = rates.learningRate ?? 1.0;
  const unloadSort = rates.unloadSortPerPart || 0;
  const deburr = (rates.deburrPerMeterCut || 0) * (cutLen_mm / 1000);
  const labor = (unloadSort + deburr) * learningFactor(qty, learningRate);

  // ----- canonical decomposition (docs/pricing-rationalization.md) -----
  //   variable  = material (nest-allocated, pass-through) + cutCost (machine+gas, constant/unit)
  //   labor     = unload + deburr × learningFactor(qty)   ← only qty-elastic variable
  //   fixed     = programming/setup per order  → /qty     ← the legitimate qty economy
  //   price     = (material + conversion×leadMult) × (1+oh)(1+margin), floored by minCharge
  // No blanket qty discount: cutting one part is identical work whether you order 1 or 1000.
  const programmingFee = rates.programmingFee || 0;
  const programmingPerUnit = programmingFee / qty;

  const passthrough = materialCost;                       // no rush premium on sheet material
  const conversion = cutCost + labor + programmingPerUnit;
  const unitCost = passthrough + conversion;              // Layer-2 should-cost basis
  const markup = (1 + (rates.overheadPct || 0) / 100) * (1 + (rates.marginPct || 0) / 100);
  const unitPrice0 = (passthrough + conversion * leadMult) * markup;

  const orderRaw = unitPrice0 * qty;
  const total = Math.max(rates.minCharge || 0, orderRaw);
  const minChargeApplied = total > orderRaw + 1e-9;
  const unitPrice = qty ? total / qty : total;

  // ----- per-order additive breakdown (sums to should-cost basis) -----
  const breakdown = [
    row('material', `Sheet material (${mat.name})`, materialCost * qty, `${(yieldFrac * 100).toFixed(0)}% nest yield · ${thKey} mm`),
    row('cutting', 'Cutting (machine + gas)', cutCost * qty, `${machineMin.toFixed(1)} min/pc · ${pierces} pierces`),
    row('programming', 'Programming / setup', programmingPerUnit * qty, qty > 1 ? `${programmingFee.toFixed(2)} ÷ ${qty}` : 'one-time'),
    row('unload', 'Unload / sort', unloadSort * qty, `${qty} pcs`),
    row('deburr', 'Deburr', deburr * qty, `${(cutLen_mm / 1000).toFixed(2)} m edge`),
  ];

  const f = { areaCm2: features.areaCm2 ?? (bbox.x * bbox.y) / 100, perimeter_mm: cutLen_mm, pierces, bbox_mm: bbox, nestYield: yieldFrac, thicknessMm: parseFloat(sel.thickness) || null };
  const review = evaluateConfidence(f, { review: c.review }, { parserConfidence: opts.parserConfidence });
  if (minChargeApplied) review.reasons.push('Below minimum charge — min-charge applied');

  return makeQuoteResult({
    process: 'laser',
    currency: c.currency || 'SAR',
    shouldCost: unitCost,
    price: total,
    unitPrice,
    quantity: qty,
    leadTimeDays: leadDays(c.leadDays, lead, 7),
    breakdown,
    factors: { qtyDisc: 1.0, leadMult, marginPct: rates.marginPct, overheadPct: rates.overheadPct, edgeMult: edge.multiplier, minChargeApplied },
    components: { materialCost, cutCost, machineCost, gasCost, unloadSort, deburr, labor, programmingFee, programmingPerUnit, machineMin, cutMin, pierceMin, yieldFrac, thicknessKey: thKey, unitCost },
    features: f,
    coefficientsRef: coefficientsRef(c),
    confidence: review.confidence,
    needsReview: review.needsReview,
    reviewReasons: review.reasons,
  });
}

function clampYield(y) {
  const v = Number(y);
  if (!Number.isFinite(v) || v <= 0) return 0.5;
  return Math.max(0.2, Math.min(0.95, v));
}
