// engines/core/test/snapshot.mjs
// Prices-unchanged gate (roadmap §0.E). No test runner / npm: run with
//   node engines/core/test/snapshot.mjs
// Uses built-in node:test + node:assert. Asserts the extracted kernels reproduce the
// legacy engine formulas, anchored by hand-computed golden numbers.

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import { computeAMQuote } from '../../quote-3d/quote.kernel.js';
import { surrogateTimeModel } from '../../quote-3d/slicer/fallback.estimate.js';
import { computePCBQuote } from '../../quote-pcb/quote.kernel.js';
import { computeLaserQuote } from '../../quote-laser/quote.kernel.js';
import { metricsFromContours } from '../../quote-laser/parse/geom.metrics.js';
import { fastYield } from '../../quote-laser/nest/nest.fast.js';
import { refineYield } from '../../quote-laser/nest/nest.truenshape.js';
import { qtyFactorFromTiers, qtyFactorFromMap } from '../pricing.js';
import { analyzeMesh, meshTopology, sheetFeaturesFromMesh } from '../util/geometry.js';

const fdm = JSON.parse(readFileSync(new URL('../../coefficients/fdm.default.json', import.meta.url)));
const pcb = JSON.parse(readFileSync(new URL('../../coefficients/pcb.default.json', import.meta.url)));
const laser = JSON.parse(readFileSync(new URL('../../coefficients/laser.default.json', import.meta.url)));

const approx = (a, b, tol = 1e-6) =>
  assert.ok(Math.abs(a - b) <= tol * Math.max(1, Math.abs(b)), `expected ${a} ≈ ${b}`);

/* -------- independent re-implementation of the LEGACY 3D updateQuote() math -------- */
function legacyAM(features, sel, c) {
  const p = c.processes[sel.process];
  const m = c.materials[sel.material];
  const qty = Math.max(1, Math.min(500, parseInt(sel.qty, 10) || 1));
  const leadMult = c.general.leadMultipliers[sel.lead] ?? 1;
  const pr = sel.params || {};
  let materialFactor = 1, timeScale = 1;
  if (sel.process === 'fdm') {
    materialFactor = 0.15 + 0.85 * ((pr.infill ?? 20) / 100);
    timeScale = p.baseLayerHeight / (pr.layerHeight ?? p.baseLayerHeight);
  } else if (sel.process === 'sla' || sel.process === 'sls') {
    timeScale = p.baseLayerHeight / (pr.layerHeight ?? p.baseLayerHeight);
  }
  const vol_cm3 = features.volume_mm3 / 1000;
  const weight_g = vol_cm3 * m.density * materialFactor;
  const materialCost = weight_g * m.pricePerG;
  const est_hours = (features.volume_mm3 / p.mmPerHour) * timeScale;
  const machineCost = est_hours * p.hourlyRate;
  const setupPerUnit = p.setupFee / qty;
  // Original pre-rationalization markup was a blanket `complexity` (1.10/1.25/1.20),
  // now re-expressed exactly as marginPct (10/25/20). Reconstruct it so this reference
  // reproduces the ORIGINAL price (the qty=1 anchor), independent of the neutralized
  // `complexity` field (now 1.0, a machine-time-only lever).
  const legacyComplexity = 1 + (p.marginPct ?? 0) / 100;
  const subtotal = (materialCost + machineCost + setupPerUnit) * legacyComplexity;
  const qtyDisc = qtyFactorFromTiers(qty, c.general.qtyTiers);
  const unitPrice = subtotal * qtyDisc * leadMult;
  return { unitPrice, total: unitPrice * qty, subtotal };
}

/* -------- qty=1 preservation + rationality invariants (canonical model) -------- */
// Legacy `complexity` (1.10/1.25/1.20) is re-expressed as marginPct (10/25/20), so the
// qty=1 STANDARD price is identical to the pre-rationalization engine. What changed: there
// is no longer a blanket qty multiplier on variable cost — only setup amortizes.
const FDM1 = {
  features: { volume_mm3: 10000, surface_mm2: 6000, bbox_mm: { x: 20, y: 20, z: 25 }, watertight: true },
  sel: { process: 'fdm', material: 'pla', qty: 1, lead: 'standard', params: { infill: 20, layerHeight: 0.2 } },
  goldenTotal: 24.20868267, // unchanged vs legacy
};

test('AM qty=1 (standard) price preserved exactly vs legacy', () => {
  const got = computeAMQuote(FDM1.features, FDM1.sel, fdm); // legacy throughput path (no timeModel)
  approx(got.price, legacyAM(FDM1.features, FDM1.sel, fdm).total, 1e-9);
  approx(got.price, FDM1.goldenTotal, 1e-6);
  // SLA qty=1 standard also preserved (complexity 1.25 → marginPct 25)
  const slaSel = { process: 'sla', material: 'resin_std', qty: 1, lead: 'standard', params: { layerHeight: 0.025 } };
  const slaFeat = { volume_mm3: 8000, surface_mm2: 5000, bbox_mm: { x: 30, y: 30, z: 15 }, watertight: true };
  approx(computeAMQuote(slaFeat, slaSel, fdm).price, legacyAM(slaFeat, slaSel, fdm).total, 1e-9);
  assert.ok(got.breakdown.length >= 3);
});

test('AM canonical: variable cost is flat across qty (only setup amortizes)', () => {
  const feat = { volume_mm3: 125000, surface_mm2: 15000, bbox_mm: { x: 50, y: 50, z: 50 }, watertight: true };
  const base = { process: 'fdm', material: 'pla', lead: 'standard', params: { infill: 20, layerHeight: 0.2 } };
  const p = fdm.processes.fdm;
  const markup = (1 + (p.overheadPct || 0) / 100) * (1 + (p.marginPct || 0) / 100);
  // strip the amortized setup from the unit price → the remainder must be constant across qty
  const variablePart = (q) => {
    const r = computeAMQuote(feat, { ...base, qty: q }, fdm, { timeModel: surrogateTimeModel });
    return r.unitPrice - (p.setupFee / q) * markup;
  };
  approx(variablePart(1), variablePart(100), 1e-6);
  approx(variablePart(10), variablePart(100), 1e-6);
  // unit price still drops with qty (setup amortization) but converges to the variable floor
  const u1 = computeAMQuote(feat, { ...base, qty: 1 }, fdm, { timeModel: surrogateTimeModel }).unitPrice;
  const u100 = computeAMQuote(feat, { ...base, qty: 100 }, fdm, { timeModel: surrogateTimeModel }).unitPrice;
  assert.ok(u100 < u1, 'unit price decreases with qty');
  assert.ok(u100 > variablePart(100) - 1e-9, 'never below the variable floor');
});

test('AM minimum-order floor applies to tiny parts', () => {
  const tiny = { volume_mm3: 150, surface_mm2: 250, bbox_mm: { x: 5, y: 5, z: 6 }, watertight: true };
  const q = computeAMQuote(tiny, { process: 'fdm', material: 'pla', qty: 1, lead: 'standard', params: { infill: 20, layerHeight: 0.2 } }, fdm, { timeModel: surrogateTimeModel });
  approx(q.price, fdm.general.minOrder, 1e-9);
  assert.ok(q.factors.minOrderApplied, 'min-order flag set');
});

/* -------- independent re-implementation of the LEGACY PCB compute() math -------- */
function legacyPCB(spec, detected, c) {
  const s = spec;
  const w = parseFloat(s.w) || 0, h = parseFloat(s.h) || 0, qty = parseInt(s.qty, 10) || 0;
  const area = (w * h) / 100;
  const lay = c.layer[s.layers] || c.layer['2'];
  const qf = qtyFactorFromMap(qty, c.qty);
  const holes = (detected && detected.holes) || 0;
  const perBoardBase = (lay.board + lay.area * area) * qf;
  const adders = [
    c.finish[s.finish] * area, c.copper[s.copper] * area, c.mask[s.mask],
    c.thick[s.thick], c.feat[s.feat], c.via[s.via],
  ];
  if (s.gold === 'Yes') adders.push(c.goldFingers);
  if (holes) adders.push(c.drillRate * holes);
  let subtotal = lay.setup + perBoardBase * qty + c.testFee;
  for (const per of adders) if (per > 0) subtotal += per * qf * qty; // adders now carry the panel qty factor
  const leadMult = c.lead[s.lead] || 1;
  const total = (subtotal + subtotal * (leadMult - 1)) * (1 + c.platformPct / 100);
  return { subtotal, total, unit: qty ? total / qty : 0 };
}

const PCB_CASES = [
  {
    name: 'PCB · 2L · 50×50 · qty100 · base',
    spec: { material: 'FR-4', layers: '2', w: '50', h: '50', qty: '100', thick: '1.6', mask: 'Green', finish: 'HASL (lead-free)', copper: '1 oz', via: 'Tented', feat: '6/6 mil', gold: 'No', lead: 'Standard · 5-7 days' },
    detected: { holes: 0, source: 'gbrjob' },
    goldenTotal: 586.88,
  },
  {
    name: 'PCB · 4L · 80×60 · qty25 · express · loaded',
    spec: { material: 'FR-4', layers: '4', w: '80', h: '60', qty: '25', thick: '0.8', mask: 'Red', finish: 'ENIG', copper: '2 oz', via: 'Plugged', feat: '4/4 mil', gold: 'Yes', lead: 'Express · 24 h' },
    detected: { holes: 120, source: 'gbrjob' },
    goldenTotal: 2152.96256, // adders now share the panel qty factor (was 2518.4768)
  },
];

test('PCB kernel matches legacy formula + golden numbers', () => {
  for (const cse of PCB_CASES) {
    const ref = legacyPCB(cse.spec, cse.detected, pcb);
    const got = computePCBQuote(cse.spec, cse.detected, pcb);
    approx(got.price, ref.total, 1e-9);
    approx(got.unitPrice, ref.unit, 1e-9);
    approx(got.price, cse.goldenTotal, 1e-6);
    assert.equal(got.process, 'pcb');
    assert.ok(got.breakdown.length >= 3);
  }
});

test('PCB review gate flags low parser confidence (no .gbrjob render)', () => {
  const spec = PCB_CASES[0].spec;
  const q = computePCBQuote(spec, { holes: 0, source: 'svg-fallback' }, pcb, { parserConfidence: 0.4 });
  assert.ok(q.needsReview, 'low parser confidence should need review');
});

test('Phase-1 FDM surrogate: legacy path unchanged, surrogate is layer-aware', () => {
  const flat = { volume_mm3: 10000, surface_mm2: 6000, bbox_mm: { x: 80, y: 80, z: 10 }, watertight: true }; // 50 layers
  const tall = { volume_mm3: 10000, surface_mm2: 9000, bbox_mm: { x: 18, y: 18, z: 200 }, watertight: true }; // 1000 layers
  const sel = { process: 'fdm', material: 'pla', qty: 1, lead: 'standard', params: { infill: 20, layerHeight: 0.2 } };

  // default path (no timeModel) is the legacy formula — must stay identical
  const legacy = computeAMQuote(flat, sel, fdm);
  approx(legacy.price, legacyAM(flat, sel, fdm).total, 1e-9);

  // surrogate path: equal-volume tall part costs MORE than the flat one (the whole point of P1)
  const sFlat = computeAMQuote(flat, sel, fdm, { timeModel: surrogateTimeModel });
  const sTall = computeAMQuote(tall, sel, fdm, { timeModel: surrogateTimeModel });
  assert.ok(sTall.price > sFlat.price, `tall (${sTall.price}) should cost more than flat (${sFlat.price})`);
  assert.ok(sFlat.breakdown.some((b) => b.key === 'support'), 'surrogate FDM adds a support row');
  assert.ok(sFlat.breakdown.some((b) => b.key === 'postproc'), 'surrogate FDM adds a post-processing row');

  // golden anchor for the surrogate (locks the model coefficients)
  const cube = { volume_mm3: 10000, surface_mm2: 6000, bbox_mm: { x: 20, y: 20, z: 25 }, watertight: true };
  const sCube = computeAMQuote(cube, sel, fdm, { timeModel: surrogateTimeModel });
  approx(sCube.price, 23.518845, 1e-3);

  // when a timeModel returns null (process with no build block), the kernel must fall
  // back to the legacy throughput model — identical to the no-timeModel result.
  const legacyFdm = computeAMQuote(cube, sel, fdm);
  const fallbackFdm = computeAMQuote(cube, sel, fdm, { timeModel: () => null });
  approx(fallbackFdm.price, legacyFdm.price, 1e-9);
});

/* ----------------------------- laser engine ----------------------------- */
// A 100×80 plate with one Ø20 hole.
const PLATE = [
  { type: 'poly', closed: true, points: [{ x: 0, y: 0 }, { x: 100, y: 0 }, { x: 100, y: 80 }, { x: 0, y: 80 }] },
  { type: 'circle', cx: 50, cy: 40, r: 10 },
];

// Independent re-implementation of the CANONICAL laser model (mirrors quote.kernel.js):
// material is pass-through; cutting is constant per unit; programming amortizes with qty;
// lead premium on conversion only; no blanket qty discount.
function refLaser(features, sel, c) {
  const mat = c.materials[sel.material];
  const thKey = String(sel.thickness);
  const edge = c.edgeQuality[sel.edgeQuality] || c.edgeQuality.standard;
  const speed = mat.cutSpeed[thKey] * edge.speedMult;
  const machineMin = features.perimeter_mm / speed + (features.pierces * mat.pierceSec[thKey]) / 60;
  const machineCost = (machineMin / 60) * c.rates.machineRatePerHour;
  const gas = machineMin * mat.gasCostPerMin;
  const cutCost = (machineCost + gas) * edge.multiplier;
  const matCost = (((features.bbox_mm.x * features.bbox_mm.y) / 1e6) / c.nest.defaultYield) * mat.sheetCostPerM2[thKey];
  const deburr = c.rates.deburrPerMeterCut * (features.perimeter_mm / 1000);
  const qty = parseInt(sel.qty, 10);
  const labor = (c.rates.unloadSortPerPart + deburr) * 1; // learningRate 1.0 = neutral
  const programmingPerUnit = (c.rates.programmingFee || 0) / qty;
  const passthrough = matCost;
  const conversion = cutCost + labor + programmingPerUnit;
  const markup = (1 + c.rates.overheadPct / 100) * (1 + c.rates.marginPct / 100);
  const unit0 = (passthrough + conversion * (c.lead[sel.lead] || 1)) * markup;
  return Math.max(c.rates.minCharge, unit0 * qty);
}

test('laser metrics + kernel match reference & golden', () => {
  const m = metricsFromContours(PLATE);
  approx(m.perimeter_mm, 360 + 2 * Math.PI * 10, 1e-9);
  assert.equal(m.pierces, 2);
  approx(m.bbox_mm.x, 100, 1e-9);
  approx(m.partAreaCm2, (8000 - Math.PI * 100) / 100, 1e-9);

  const sel = { material: 'mild_steel', thickness: '3', qty: '100', lead: 'standard', edgeQuality: 'standard' };
  const features = { ...m };
  const q = computeLaserQuote(features, sel, laser);
  approx(q.price, refLaser(features, sel, laser), 1e-9);
  approx(q.price, 636.866006, 1e-3); // golden anchor (canonical model: programming fee, no blanket qty discount)
  assert.equal(q.process, 'laser');
  assert.ok(q.breakdown.some((b) => b.key === 'material' && /nest yield/.test(b.note)), 'nest yield exposed in breakdown');
});

test('laser min-charge floor applies on tiny orders', () => {
  const m = metricsFromContours(PLATE);
  const sel = { material: 'mild_steel', thickness: '3', qty: '1', lead: 'standard', edgeQuality: 'standard' };
  const q = computeLaserQuote(m, sel, laser);
  approx(q.price, laser.rates.minCharge, 1e-9);
  assert.ok(q.factors.minChargeApplied, 'min-charge flag set');
});

test('nest: fast yield is a fraction; true-shape refine never lowers it', async () => {
  const fast = fastYield({ x: 100, y: 80 });
  assert.ok(fast.yield > 0.2 && fast.yield <= 0.92);
  // an L-shape (low bbox fill) should gain from interlocking
  const refined = await refineYield({ bbox_mm: { x: 100, y: 80 }, partAreaCm2: 40, fast, budgetMs: 200 });
  assert.ok(refined.yield >= fast.yield, 'refine should not reduce yield');
});

test('AM review gate flags oversized / non-watertight parts', () => {
  const huge = { volume_mm3: 1e6, surface_mm2: 5e5, bbox_mm: { x: 400, y: 400, z: 400 }, watertight: true };
  const q = computeAMQuote(huge, { process: 'fdm', material: 'pla', qty: 1, lead: 'standard', params: {} }, fdm);
  assert.ok(q.needsReview, 'oversized FDM part should need review');

  const open = { volume_mm3: 10000, surface_mm2: 6000, bbox_mm: { x: 20, y: 20, z: 25 }, watertight: false };
  const q2 = computeAMQuote(open, { process: 'fdm', material: 'pla', qty: 1, lead: 'standard', params: {} }, fdm);
  assert.ok(q2.needsReview, 'non-watertight part should need review');
});

test('qty factor helpers match legacy selection rules', () => {
  // array tiers (3D): highest minQty <= qty
  assert.equal(qtyFactorFromTiers(1, fdm.general.qtyTiers), 1.0);
  assert.equal(qtyFactorFromTiers(9, fdm.general.qtyTiers), 1.0);
  assert.equal(qtyFactorFromTiers(10, fdm.general.qtyTiers), 0.85);
  assert.equal(qtyFactorFromTiers(75, fdm.general.qtyTiers), 0.75);
  assert.equal(qtyFactorFromTiers(1000, fdm.general.qtyTiers), 0.65);
  // map tiers (PCB): highest key <= qty
  const pcbQty = { 5: 1.0, 10: 0.85, 25: 0.7, 50: 0.58, 100: 0.48, 200: 0.4 };
  assert.equal(qtyFactorFromMap(75, pcbQty), 0.58);
  assert.equal(qtyFactorFromMap(3, pcbQty), 1.0);
  assert.equal(qtyFactorFromMap(500, pcbQty), 0.4);
});

test('analyzeMesh computes volume/area/bbox on a unit cube', () => {
  // axis-aligned 10mm cube, 12 triangles, non-indexed (CCW outward), origin at 0..10
  const cube = unitCube(10);
  const a = analyzeMesh(cube);
  approx(a.volume_mm3, 1000, 1e-6); // 10^3
  approx(a.surface_mm2, 600, 1e-6); // 6 * 10^2
  approx(a.bbox_mm.x, 10, 1e-9);
  assert.equal(a.triCount, 12);
  assert.equal(a.watertight, true);
});

test('sheet feature extraction from a 3D plate (thickness/perimeter/genus)', () => {
  // 100 × 80 × 3 plate. volume=24000, surface=2*8000 + 2*300 + 2*240 = 17080.
  const plate = box(100, 80, 3);
  const a = analyzeMesh(plate);
  approx(a.volume_mm3, 24000, 1e-6);
  approx(a.surface_mm2, 17080, 1e-6);
  const topo = meshTopology(plate, plate.length / 3, Math.hypot(100, 80, 3));
  assert.equal(topo.closed, true);
  assert.equal(topo.genus, 0); // solid plate, no through-holes

  const sf = sheetFeaturesFromMesh(a, topo);
  approx(sf.thickness_mm, 3, 1e-9);              // smallest dim
  approx(sf.perimeter_mm, 360, 1e-6);            // (17080 - 2*8000)/3 = 360 = 2*(100+80)
  approx(sf.partAreaCm2, 80, 1e-6);              // 8000 mm² / 100
  assert.equal(sf.pierces, 1);                   // genus 0 → 1 pierce (outer)
  assert.deepEqual([sf.bbox_mm.x, sf.bbox_mm.y], [80, 100]);
  assert.ok(sf.sheetConfidence >= 0.9 && sf.isSheet, 'thin plate is high-confidence sheet');
});

/* a closed 10mm cube as a flat non-indexed positions array (CCW outward normals) */
function unitCube(s) {
  return box(s, s, s);
}

/* an axis-aligned closed box (sx×sy×sz) as flat non-indexed CCW-outward positions */
function box(sx, sy, sz) {
  const v = [
    [0, 0, 0], [sx, 0, 0], [sx, sy, 0], [0, sy, 0], // bottom z=0
    [0, 0, sz], [sx, 0, sz], [sx, sy, sz], [0, sy, sz], // top z=sz
  ];
  const faces = [
    [0, 3, 2], [0, 2, 1], // bottom (-z)
    [4, 5, 6], [4, 6, 7], // top (+z)
    [0, 1, 5], [0, 5, 4], // front (-y)
    [2, 3, 7], [2, 7, 6], // back (+y)
    [1, 2, 6], [1, 6, 5], // right (+x)
    [3, 0, 4], [3, 4, 7], // left (-x)
  ];
  const out = [];
  for (const f of faces) for (const idx of f) out.push(...v[idx]);
  return out;
}
