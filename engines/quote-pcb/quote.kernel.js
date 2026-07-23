// engines/quote-pcb/quote.kernel.js
// Layer-2/4 should-cost kernel for the PCB fabrication engine (no PCBA).
// DOM-free; imported by index.html (browser) and the snapshot test (Node).
// Reproduces the legacy compute() math EXACTLY (prices unchanged) and adds the
// canonical QuoteResult shape + review gate + capture-ready features.

import { makeQuoteResult } from '../core/schema.js';
import { row, evaluateConfidence } from '../core/shouldcost.js';
import { qtyFactorFromMap, leadDays } from '../core/pricing.js';
import { coefficientsRef } from '../core/coefficients.js';
import { fmtNumber } from '../core/util/units.js';

const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');

/**
 * @param {Object} spec      state.spec (material, layers, w, h, qty, thick, mask, finish, copper, via, feat, gold, lead)
 * @param {Object} detected  state.detected (holes, minHole, source, ...)
 * @param {Object} c         coefficient set (legacy SET shape)
 * @param {Object} [opts]    {parserConfidence}
 */
export function computePCBQuote(spec, detected, c, opts = {}) {
  const s = spec;
  const w = parseFloat(s.w) || 0;
  const h = parseFloat(s.h) || 0;
  const qty = parseInt(s.qty, 10) || 0;
  const area = (w * h) / 100; // cm²
  const lay = c.layer[s.layers] || c.layer['2'];
  const qf = qtyFactorFromMap(qty, c.qty);
  const holes = (detected && detected.holes) || 0;
  const perBoardBase = (lay.board + lay.area * area) * qf;

  const adders = [
    ['Surface finish · ' + s.finish, c.finish[s.finish] * area],
    ['Copper weight · ' + s.copper, c.copper[s.copper] * area],
    ['Solder-mask · ' + s.mask, c.mask[s.mask]],
    ['Thickness · ' + s.thick + ' mm', c.thick[s.thick]],
    ['Fine features · ' + s.feat, c.feat[s.feat]],
    ['Via covering · ' + s.via, c.via[s.via]],
  ];
  if (s.gold === 'Yes') adders.push(['Gold fingers', c.goldFingers]);
  if (holes) adders.push(['Drilling · ' + holes + ' holes', c.drillRate * holes]);

  // Panel qty factor applies UNIFORMLY to every per-board cost (base + adders): boards
  // share a panel, so per-board processing (finish, copper, drilling…) really does drop
  // with volume. Engineering/tooling and test are FIXED per order (no qty factor).
  const items = [];
  items.push({ l: 'Engineering / tooling', s: 'one-time · ' + s.layers + '-layer', v: lay.setup });
  items.push({ l: 'Board fabrication', s: qty + ' pcs · ' + fmtNumber(area) + ' cm² · ' + s.layers + 'L', v: perBoardBase * qty });
  for (const [l, per] of adders) {
    if (per > 0) items.push({ l, s: qty + ' pcs', v: per * qf * qty });
  }
  items.push({ l: 'Electrical test', s: 'flying probe · per order', v: c.testFee });

  const subtotal = items.reduce((a, b) => a + b.v, 0);
  const leadMult = c.lead[s.lead] || 1;
  const leadAdd = subtotal * (leadMult - 1);
  const afterLead = subtotal + leadAdd;
  const platform = (afterLead * c.platformPct) / 100;
  const total = afterLead + platform;
  const unit = qty ? total / qty : 0;

  const features = { areaCm2: area, layers: parseInt(s.layers, 10) || null, holes, minHole: detected && detected.minHole, w, h, source: detected && detected.source };
  const review = evaluateConfidence(features, { review: c.review }, { parserConfidence: opts.parserConfidence });

  const result = makeQuoteResult({
    process: 'pcb',
    currency: c.currency || 'SAR',
    shouldCost: subtotal,
    price: total,
    unitPrice: unit,
    quantity: qty,
    leadTimeDays: leadDays(c.leadDays, s.lead, 6),
    breakdown: items.map((it) => row(slug(it.l), it.l, it.v, it.s)),
    components: { items, subtotal, leadMult, leadAdd, platform, platformPct: c.platformPct, qtyFactor: qf },
    features,
    coefficientsRef: coefficientsRef(c),
    confidence: review.confidence,
    needsReview: review.needsReview,
    reviewReasons: review.reasons,
  });
  return result;
}
