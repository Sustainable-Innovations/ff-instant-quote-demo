// engines/core/complexity.js
// Explainable geometry-derived AM complexity. Conservative by default: normal
// blocky parts stay close to 1.0, risky geometry nudges machine-time cost upward.

const DEFAULT_MODEL = {
  cap: 1.3,
  baselineSaV: 0.6,
  baselineSupportFraction: 0.15,
  wOverhang: 0.08,
  wThin: 0.06,
  wAspect: 0.06,
  wHoles: 0.05,
  wOpen: 0.08,
  holeCap: 4,
  reviewThreshold: 1.25,
};

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

function addTerm(terms, key, label, contribution) {
  const value = Number.isFinite(contribution) ? Math.max(0, contribution) : 0;
  if (value > 1e-6) terms.push({ key, label, contribution: value });
  return value;
}

function aspectPenalty(bbox = {}) {
  const dims = [bbox.x || 0, bbox.y || 0, bbox.z || 0].sort((a, b) => a - b);
  const minXY = Math.max(1e-9, Math.min(bbox.x || 0, bbox.y || 0));
  const tallRatio = (bbox.z || dims[2] || 0) / minXY;
  return clamp((tallRatio - 4) / 8, 0, 1);
}

export function complexityModel(coeffs = {}, process = {}) {
  return {
    ...DEFAULT_MODEL,
    ...(coeffs.general && coeffs.general.complexityModel ? coeffs.general.complexityModel : {}),
    ...(process.complexityModel || {}),
  };
}

export function resolveComplexityOverride(process = {}) {
  if (process.complexityOverride != null) return process.complexityOverride;
  if (process.complexity != null && Math.abs(process.complexity - 1) > 1e-9) return process.complexity;
  return null;
}

/**
 * @param {Object} features {volume_mm3,surface_mm2,bbox_mm,watertight,genus}
 * @param {Object} [model]
 * @param {Object} [signals] {supportVol_mm3}
 */
export function autoComplexity(features = {}, model = DEFAULT_MODEL, signals = {}) {
  const m = { ...DEFAULT_MODEL, ...(model || {}) };
  const terms = [];
  const volume = Math.max(0, features.volume_mm3 || 0);
  const surface = Math.max(0, features.surface_mm2 || 0);
  const supportVol = Math.max(0, signals.supportVol_mm3 || features.supportVol_mm3 || 0);

  const supportRatio = volume > 0 ? supportVol / volume : 0;
  const supportBase = m.baselineSupportFraction ?? DEFAULT_MODEL.baselineSupportFraction;
  const overhangFraction = clamp((supportRatio - supportBase) / Math.max(1e-9, 1 - supportBase), 0, 1);
  const saV = volume > 0 ? surface / volume : 0;
  const thinProxy = m.baselineSaV > 0 ? Math.max(0, (saV - m.baselineSaV) / m.baselineSaV) : 0;
  const genus = Math.max(0, features.genus || 0);
  const holeRatio = m.holeCap > 0 ? Math.min(m.holeCap, genus) / m.holeCap : 0;

  let raw = 1.0;
  raw += addTerm(terms, 'overhang', 'Support / overhang risk', m.wOverhang * overhangFraction);
  raw += addTerm(terms, 'thin', 'Thin walls / fine detail proxy', m.wThin * thinProxy);
  raw += addTerm(terms, 'aspect', 'Tall-thin instability', m.wAspect * aspectPenalty(features.bbox_mm));
  raw += addTerm(terms, 'holes', 'Internal features / holes', m.wHoles * holeRatio);
  raw += addTerm(terms, 'open', 'Open or non-manifold mesh', features.watertight === false ? m.wOpen : 0);

  const value = clamp(raw, 1.0, m.cap || DEFAULT_MODEL.cap);
  return {
    value,
    raw,
    cap: m.cap || DEFAULT_MODEL.cap,
    reviewThreshold: m.reviewThreshold || DEFAULT_MODEL.reviewThreshold,
    terms: terms
      .sort((a, b) => b.contribution - a.contribution)
      .map((t) => ({ ...t, contribution: Math.min(t.contribution, value - 1) })),
  };
}
