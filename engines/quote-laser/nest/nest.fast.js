// engines/quote-laser/nest/nest.fast.js
// Fast rectangular-bbox nesting yield heuristic (DEFAULT, synchronous, <1ms).
// Estimates how densely the part's bounding box tiles a stock sheet, accounting for
// part-to-part gap and sheet edge margin. This is intentionally a bbox heuristic — the
// true-shape refine (nest.truenshape.js) improves it for non-rectangular parts.

const STD_SHEET = { w: 2500, h: 1250 }; // mm, common large-format sheet

/**
 * @param {{x:number,y:number}} bbox_mm  part bounding box
 * @param {Object} [opts] {sheet:{w,h}, gap, margin, partAreaCm2}
 * @returns {{yield:number, partsPerSheet:number, sheet:{w,h}, rotated:boolean}}
 */
export function fastYield(bbox_mm, opts = {}) {
  const sheet = opts.sheet || STD_SHEET;
  const gap = opts.gap ?? 6;     // kerf + safe spacing between parts (mm)
  const margin = opts.margin ?? 10; // sheet edge clamp margin (mm)
  const pw = (bbox_mm.x || 0) + gap;
  const ph = (bbox_mm.y || 0) + gap;
  if (pw <= gap || ph <= gap) return { yield: 0.5, partsPerSheet: 0, sheet, rotated: false };

  const usableW = sheet.w - 2 * margin;
  const usableH = sheet.h - 2 * margin;

  const fit = (a, b) => Math.max(0, Math.floor(usableW / a)) * Math.max(0, Math.floor(usableH / b));
  const upright = fit(pw, ph);
  const rotated = fit(ph, pw);
  const partsPerSheet = Math.max(upright, rotated);

  const sheetArea = sheet.w * sheet.h;
  const bboxArea = (bbox_mm.x || 0) * (bbox_mm.y || 0);
  const rawYield = sheetArea > 0 ? (partsPerSheet * bboxArea) / sheetArea : 0;
  // clamp into a sane band; a single huge part still yields something usable
  const y = Math.max(0.2, Math.min(0.92, rawYield || 0.5));
  return { yield: y, partsPerSheet, sheet, rotated: rotated > upright };
}
