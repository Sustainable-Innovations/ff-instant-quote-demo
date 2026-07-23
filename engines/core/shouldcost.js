// engines/core/shouldcost.js
// Layer 2 — deterministic should-cost helpers + the review-gate primitive.
// Generic and DOM-free: engines build a Breakdown[] then use these to summarise it.

/**
 * Sum a Breakdown[] (or any {amount} list). Non-finite amounts count as 0.
 * @param {{amount:number}[]} items
 * @returns {number}
 */
export function sumBreakdown(items) {
  return (items || []).reduce(
    (acc, it) => acc + (Number.isFinite(it && it.amount) ? it.amount : 0),
    0
  );
}

/** Convenience: build one Breakdown row. */
export function row(key, label, amount, note) {
  const r = { key, label, amount };
  if (note) r.note = note;
  return r;
}

/**
 * Review-gate primitive (roadmap §0.D). Evaluate confidence and decide whether a
 * quote should be flagged for human review. Engines pass a feature vector plus a
 * coefficient-supplied `review` block; reasons are accumulated, never throwing.
 *
 * `coeffs.review` (all optional) may contain:
 *   parserConfidenceFloor   number   min acceptable parser confidence (default 0.6)
 *   envelope                {x,y,z}  max part bbox in mm (orientation-independent)
 *   maxAreaCm2              number   max board/sheet area
 *   uncertaintyCeiling      number   supplier threshold on predicted uncertainty (0..1)
 *
 * @param {Object} features
 * @param {Object} [coeffs]
 * @param {Object} [ctx] extra signals: {parserConfidence, uncertainty}
 * @returns {{confidence:number, needsReview:boolean, reasons:string[]}}
 */
export function evaluateConfidence(features = {}, coeffs = {}, ctx = {}) {
  const rv = (coeffs && coeffs.review) || {};
  const reasons = [];
  let confidence = 1;

  const parserConfidence = ctx.parserConfidence ?? features.parserConfidence ?? 1;
  const floor = rv.parserConfidenceFloor ?? 0.6;
  if (parserConfidence < floor) {
    reasons.push(`Parser confidence ${(parserConfidence * 100).toFixed(0)}% below ${(floor * 100).toFixed(0)}% threshold`);
    confidence = Math.min(confidence, parserConfidence);
  }

  // Geometry ambiguity: non-watertight mesh is a classic review trigger.
  if (features.watertight === false) {
    reasons.push('Mesh is not watertight (open/non-manifold geometry)');
    confidence = Math.min(confidence, 0.7);
  }

  // Oversized part vs. supplier build/sheet envelope (sorted dims → orientation-free).
  if (rv.envelope && features.bbox_mm) {
    const part = [features.bbox_mm.x, features.bbox_mm.y, features.bbox_mm.z].sort((a, b) => b - a);
    const cap = [rv.envelope.x, rv.envelope.y, rv.envelope.z].sort((a, b) => b - a);
    if (part.some((d, i) => d > cap[i])) {
      reasons.push('Part exceeds typical build envelope — may need splitting or manual review');
      confidence = Math.min(confidence, 0.75);
    }
  }

  if (rv.maxAreaCm2 != null && features.areaCm2 != null && features.areaCm2 > rv.maxAreaCm2) {
    reasons.push(`Area ${features.areaCm2.toFixed(0)} cm² exceeds ${rv.maxAreaCm2} cm² fast-quote limit`);
    confidence = Math.min(confidence, 0.8);
  }

  // Predicted uncertainty above the supplier's tolerance.
  if (ctx.uncertainty != null && rv.uncertaintyCeiling != null && ctx.uncertainty > rv.uncertaintyCeiling) {
    reasons.push('Predicted uncertainty exceeds supplier threshold');
    confidence = Math.min(confidence, 1 - ctx.uncertainty);
  }

  confidence = Math.max(0, Math.min(1, confidence));
  return { confidence, needsReview: reasons.length > 0, reasons };
}
