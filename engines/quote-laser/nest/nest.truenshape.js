// engines/quote-laser/nest/nest.truenshape.js
// True-shape (no-fit-polygon) nesting refine — the ASYNC, latency-gated path behind a
// "Refine nesting" action. For non-rectangular parts, real production nests interlock
// shapes far better than bbox tiling, so the achievable yield is higher than fastYield.
//
// A full SVGnest/Deepnest NFP solver is heavy (combinatorial, seconds). To keep the
// engine dependency-light today, this returns an *improved* yield estimate derived from
// the part's true area-fill ratio inside its bbox (how much of the bbox the part shape
// actually occupies) — interlocking recovers a fraction of the bbox waste. The interface
// is async and time-bounded so a real NFP solver can drop in later without UI changes.

/**
 * @param {Object} args {contours, bbox_mm, partAreaCm2, fast:{yield}, budgetMs}
 * @returns {Promise<{yield:number, method:string, improvedBy:number}>}
 */
export function refineYield(args) {
  const { bbox_mm, partAreaCm2, fast } = args;
  return new Promise((resolve) => {
    const run = () => {
      const bboxAreaCm2 = ((bbox_mm.x || 0) * (bbox_mm.y || 0)) / 100;
      const fillRatio = bboxAreaCm2 > 0 ? Math.min(1, (partAreaCm2 || bboxAreaCm2) / bboxAreaCm2) : 1;
      // The "wasted" bbox area (1 - fillRatio) can be partly reclaimed by interlocking.
      // Recover up to ~55% of it; rectangles (fillRatio≈1) gain nothing.
      const base = (fast && fast.yield) || 0.6;
      const recovered = (1 - fillRatio) * 0.55;
      const improved = Math.max(base, Math.min(0.95, base + recovered));
      resolve({ yield: improved, method: 'area-fill-heuristic', improvedBy: improved - base });
    };
    // mimic async solver; keep within the latency budget
    const budget = Math.min(args.budgetMs || 1200, 2000);
    setTimeout(run, Math.min(120, budget));
  });
}
