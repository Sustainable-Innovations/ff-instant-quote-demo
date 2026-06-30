// engines/core/schema.js
// Canonical shared types for every FlexFactory quote engine (Layer-agnostic).
// Plain JSDoc typedefs — no runtime cost — plus a `makeQuoteResult()` factory so
// every engine returns an identically-shaped object. DOM-free; Node + browser.

/**
 * @typedef {Object} Breakdown
 * @property {string} key     machine-stable id, e.g. "material"
 * @property {string} label   human label, e.g. "Material (PLA)"
 * @property {number} amount  additive cost in `currency`, per the breakdown's basis
 * @property {string} [note]  optional sub-label (e.g. "120 min @ 15.00/h")
 */

/**
 * @typedef {Object} Features
 * Extracted geometry / board features. Engine-specific keys allowed; common ones:
 * @property {number} [volume_mm3]
 * @property {number} [surface_mm2]
 * @property {{x:number,y:number,z:number}} [bbox_mm]
 * @property {number} [triCount]
 * @property {boolean|null} [watertight]
 * @property {number} [perimeter_mm]   // laser: cut length
 * @property {number} [pierces]        // laser: pierce/hole count
 * @property {number} [areaCm2]        // pcb/laser
 * @property {number} [layers]         // pcb
 * @property {number} [holes]          // pcb
 */

/**
 * @typedef {Object} QuoteResult
 * @property {string} process            "fdm" | "sla" | "sls" | "cnc" | "pcb" | "laser"
 * @property {string} currency           "SAR"
 * @property {number} shouldCost         Layer-2 deterministic per-unit cost basis
 * @property {number} price              final order total (all units)
 * @property {number} unitPrice          final per-unit price
 * @property {number} quantity
 * @property {number} leadTimeDays
 * @property {Breakdown[]} breakdown     additive cost components (sum-able)
 * @property {Object} [factors]          multiplier rows for display (complexity, qtyDisc…)
 * @property {Object} [components]        raw intermediates (weight_g, est_hours…)
 * @property {Features} features
 * @property {string} coefficientsRef    e.g. "supplier:default@v1"
 * @property {number} confidence         0..1
 * @property {boolean} needsReview
 * @property {string[]} reviewReasons
 */

/**
 * Build a QuoteResult with sane defaults; spread overrides on top.
 * @param {Partial<QuoteResult>} init
 * @returns {QuoteResult}
 */
export function makeQuoteResult(init = {}) {
  return {
    process: '',
    currency: 'SAR',
    shouldCost: 0,
    price: 0,
    unitPrice: 0,
    quantity: 1,
    leadTimeDays: 7,
    breakdown: [],
    factors: {},
    components: {},
    features: {},
    coefficientsRef: 'supplier:default@v1',
    confidence: 1,
    needsReview: false,
    reviewReasons: [],
    ...init,
  };
}

/**
 * @typedef {Object} QuoteRequest
 * @property {string} process
 * @property {Features} features
 * @property {Object} params            user-chosen options (qty, material, lead, …)
 * @property {Object} coefficients      resolved coefficient set (Coefficients)
 */
