// engines/quote-3d/quote.kernel.js
// Layer-2/4 should-cost kernel for the polymer AM engine (FDM, SLA, SLS).
// DOM-free and framework-free: imported by index.html and Node snapshot tests.

import { makeQuoteResult } from '../core/schema.js';
import { row, sumBreakdown, evaluateConfidence } from '../core/shouldcost.js';
import { leadDays, learningFactor } from '../core/pricing.js';
import { coefficientsRef } from '../core/coefficients.js';
import { selectMachine } from '../core/machines.js';
import { autoComplexity, complexityModel, resolveComplexityOverride } from '../core/complexity.js';

const clampQty = (q) => Math.max(1, Math.min(500, parseInt(q, 10) || 1));

/**
 * @param {Object} features  {volume_mm3, surface_mm2, bbox_mm, triCount, watertight, genus}
 * @param {Object} sel       {process, material, qty, lead, machineId?, params:{infill,layerHeight}}
 * @param {Object} coeffs    {general, materials, processes}
 * @param {Object} [opts]    {parserConfidence, timeModel}
 * @returns {import('../core/schema.js').QuoteResult}
 */
export function computeAMQuote(features, sel, coeffs, opts = {}) {
  const processKey = sel.process;
  const process = coeffs.processes[processKey];
  const material = coeffs.materials[sel.material];
  const general = coeffs.general || {};
  if (!process || !material) return makeQuoteResult({ process: processKey, currency: general.currency || 'SAR' });

  const qty = clampQty(sel.qty);
  const lead = sel.lead === 'express' ? 'express' : 'standard';
  const leadMult = (general.leadMultipliers && general.leadMultipliers[lead]) ?? 1.0;
  const params = sel.params || {};
  const quoteCache = new Map();

  const quoteForMachine = (machine, selection = null) => {
    const effectiveProcess = {
      ...process,
      hourlyRate: machine.ratePerHour ?? process.hourlyRate,
      envelope: machine.envelope || process.envelope,
      build: machine.build || process.build,
    };

    let materialFactor = 1.0;
    let timeScale = 1.0;
    const modifiers = [];
    const qualitySpec = process.params && process.params.quality;
    const qualityOpt = qualitySpec && Array.isArray(qualitySpec.options)
      ? qualitySpec.options.find(o => o.value === (params.quality || qualitySpec.default))
      : null;
    if (qualityOpt) {
      modifiers.push({ label: `Print quality (${qualityOpt.label})`, value: params.quality || qualitySpec.default });
    }

    if (processKey === 'fdm') {
      const infillPct = params.infill ?? 20;
      materialFactor = 0.15 + 0.85 * (infillPct / 100);
      const lh = params.layerHeight ?? process.baseLayerHeight;
      timeScale = process.baseLayerHeight / lh;
      modifiers.push({ label: `Infill (${infillPct}%)`, value: `x${materialFactor.toFixed(2)} mat.` });
      modifiers.push({ label: `Layer height (${lh.toFixed(2)} mm)`, value: `x${timeScale.toFixed(2)} time` });
    } else if (processKey === 'sla' || processKey === 'sls') {
      const lh = params.layerHeight ?? process.baseLayerHeight;
      timeScale = process.baseLayerHeight / lh;
      modifiers.push({ label: `Layer height (${lh.toFixed(3)} mm)`, value: `x${timeScale.toFixed(2)} time` });
    }

    const vol_cm3 = features.volume_mm3 / 1000;
    const tm = opts.timeModel ? opts.timeModel(features, process, params, machine) || null : null;
    const est_hours = tm && tm.est_hours != null
      ? tm.est_hours
      : (features.volume_mm3 / process.mmPerHour) * timeScale;
    const buildTimeSource = tm && tm.source ? tm.source : (tm ? 'physics' : 'legacy');
    if (tm && tm.materialFactor != null) materialFactor = tm.materialFactor;

    const slicedMaterialGrams = tm && Number.isFinite(Number(tm.gramsModel)) && Number(tm.gramsModel) > 0 ? Number(tm.gramsModel) : null;
    let weight_g = vol_cm3 * material.density * materialFactor;
    if (slicedMaterialGrams != null) weight_g = slicedMaterialGrams;
    let supportGrams = tm && tm.supportVol_mm3 ? (tm.supportVol_mm3 / 1000) * material.density : 0;
    if (tm && Number.isFinite(Number(tm.gramsSupport)) && Number(tm.gramsSupport) > 0) supportGrams = Number(tm.gramsSupport);
    const supportCost = supportGrams * material.pricePerG;
    const powderRefreshVol_mm3 = tm && Number.isFinite(Number(tm.powderRefreshVol_mm3)) ? Math.max(0, Number(tm.powderRefreshVol_mm3)) : 0;
    const powderRefreshGrams = (powderRefreshVol_mm3 / 1000) * material.density;
    const powderRefreshCost = powderRefreshGrams * material.pricePerG;
    const postProcPerUnit = tm ? (effectiveProcess.build && effectiveProcess.build.postProcPerUnit) || 0 : 0;
    const layerCount = tm ? tm.layerCount : null;

    const model = complexityModel(coeffs, process);
    const autoCx = autoComplexity(features, model, { supportVol_mm3: tm && tm.supportVol_mm3 });
    const overrideCx = resolveComplexityOverride(process);
    const useAutoComplexity = !!opts.timeModel;
    const complexity = overrideCx != null ? overrideCx : (useAutoComplexity ? autoCx.value : 1.0);
    const complexityDetail = overrideCx != null
      ? { value: complexity, override: true, terms: [{ key: 'override', label: 'Supplier override', contribution: complexity - 1 }] }
      : (useAutoComplexity ? autoCx : { value: complexity, terms: [], reviewThreshold: model.reviewThreshold });

    const overheadPct = process.overheadPct ?? 0;
    const marginPct = process.marginPct ?? 0;
    const learningRate = general.learningRate ?? 1.0;
    const minOrder = general.minOrder ?? 0;

    const materialCost = weight_g * material.pricePerG;
    const machineCost = est_hours * effectiveProcess.hourlyRate * complexity;
    const laborCost = postProcPerUnit * learningFactor(qty, learningRate);
    const setupFee = process.setupFee;
    const setupPerUnit = setupFee / qty;

    const passthrough = materialCost + supportCost + powderRefreshCost;
    const conversion = machineCost + laborCost + setupPerUnit;
    const subtotal = passthrough + conversion;
    const markup = (1 + overheadPct / 100) * (1 + marginPct / 100);

    const unitPrice0 = (passthrough + conversion * leadMult) * markup;
    const orderRaw = unitPrice0 * qty;
    const total = Math.max(minOrder, orderRaw);
    const minOrderApplied = total > orderRaw + 1e-9;
    const unitPrice = qty ? total / qty : total;

    const breakdown = [row('material', `Material (${material.name})`, materialCost)];
    if (supportCost > 0) breakdown.push(row('support', 'Support material', supportCost, `${supportGrams.toFixed(1)} g`));
    if (powderRefreshCost > 0) breakdown.push(row('powder-refresh', 'Powder refresh allocation', powderRefreshCost, `${powderRefreshGrams.toFixed(1)} g`));
    breakdown.push(
      row('machine', 'Machine time', machineCost, `${(est_hours * 60).toFixed(0)} min @ ${effectiveProcess.hourlyRate.toFixed(2)}/h on ${machine.name}${complexity !== 1 ? ` x${complexity.toFixed(2)}` : ''}`),
      row('setup', 'Setup fee', setupPerUnit, qty > 1 ? `${setupFee.toFixed(2)} / ${qty}` : 'one-time')
    );
    if (laborCost > 0) breakdown.push(row('postproc', 'Post-processing', laborCost, qty > 1 && learningRate < 1 ? 'per unit - learning curve' : 'per unit'));

    const review = evaluateConfidence(
      features,
      { review: { envelope: effectiveProcess.envelope, parserConfidenceFloor: general.parserConfidenceFloor } },
      { parserConfidence: opts.parserConfidence }
    );
    const reviewReasons = [...review.reasons];
    let confidence = review.confidence;
    if (selection && selection.oversized) {
      reviewReasons.push('No compatible machine fits this part - manual review or splitting required');
      confidence = Math.min(confidence, 0.7);
    }
    if (buildTimeSource === 'legacy' && opts.timeModel) {
      reviewReasons.push('Build time used legacy throughput fallback');
      confidence = Math.min(confidence, 0.8);
    }
    if (!complexityDetail.override && complexity >= (complexityDetail.reviewThreshold || 1.25)) {
      reviewReasons.push(`Geometry complexity ${complexity.toFixed(2)} exceeds review threshold`);
      confidence = Math.min(confidence, 0.8);
    }

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
      components: {
        weight_g,
        est_hours,
        materialCost,
        machineCost,
        setupFee,
        setupPerUnit,
        vol_cm3,
        modifiers,
        supportGrams,
        supportCost,
        powderRefreshVol_mm3,
        powderRefreshGrams,
        powderRefreshCost,
        slicedMaterialGrams,
        postProcPerUnit: laborCost,
        layerCount,
        machine: { id: machine.id, name: machine.name, ratePerHour: effectiveProcess.hourlyRate },
        machineAlternatives: selection ? selection.feasible.map((m) => ({ id: m.id, name: m.name, unitPrice: m.unitPrice })) : [],
        machineOptions: selection ? selection.all : [],
        buildTimeSource,
        modelKind: tm && tm.modelKind ? tm.modelKind : ((effectiveProcess.build && effectiveProcess.build.kind) || 'fdm'),
        resinLayerTimeSec: tm && Number.isFinite(Number(tm.resinLayerTimeSec)) ? Number(tm.resinLayerTimeSec) : null,
        deadTimeSec: tm && Number.isFinite(Number(tm.deadTimeSec)) ? Number(tm.deadTimeSec) : null,
        bottomLayers: tm && Number.isFinite(Number(tm.bottomLayers)) ? Number(tm.bottomLayers) : null,
        bottomExposureMult: tm && Number.isFinite(Number(tm.bottomExposureMult)) ? Number(tm.bottomExposureMult) : null,
        packingDensity: tm && Number.isFinite(Number(tm.packingDensity)) ? Number(tm.packingDensity) : null,
        occupancyShare: tm && Number.isFinite(Number(tm.occupancyShare)) ? Number(tm.occupancyShare) : null,
        fullBuildHours: tm && Number.isFinite(Number(tm.fullBuildHours)) ? Number(tm.fullBuildHours) : null,
        chamber: tm && tm.chamber ? tm.chamber : null,
        slicer: tm && tm.slicer ? tm.slicer : null,
        physicsEstHours: tm && Number.isFinite(Number(tm.physicsEstHours)) ? Number(tm.physicsEstHours) : null,
        selectedOrientation: tm && tm.selectedOrientation ? tm.selectedOrientation : null,
        slicerTrials: tm && Array.isArray(tm.trials) ? tm.trials : [],
        slicedMesh: tm && tm.slicedMesh ? tm.slicedMesh : null,
        orientationScore: tm && tm.orientationScore ? tm.orientationScore : null,
        analysis: tm && tm.analysis ? tm.analysis : null,
        complexity: complexityDetail,
      },
      features,
      coefficientsRef: coefficientsRef(coeffs),
      confidence,
      needsReview: reviewReasons.length > 0,
      reviewReasons,
    });
  };

  const cachedQuoteForMachine = (machine) => {
    if (!quoteCache.has(machine.id)) quoteCache.set(machine.id, quoteForMachine(machine));
    return quoteCache.get(machine.id);
  };

  const selection = selectMachine(
    process,
    { bbox_mm: features.bbox_mm, materialKey: sel.material, overrideId: sel.machineId, processKey },
    (machine) => cachedQuoteForMachine(machine).unitPrice
  );
  if (!selection.machine) return makeQuoteResult({ process: processKey, currency: general.currency || 'SAR' });
  return quoteForMachine(selection.machine, selection);
}

export { sumBreakdown };
