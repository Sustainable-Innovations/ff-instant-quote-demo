// engines/core/util/units.js
// Single source of truth for units, density math, and Saudi-Riyal currency formatting.
// DOM-free and framework-free: runs unchanged in the browser (ES module) and in Node.
//
// The SAR glyph is drawn as inline SVG (the new Saudi Riyal symbol) so it renders in any
// font and matches the marketplace. Never use the legacy `﷼` codepoint or the text "SAR"
// in price displays.

/* ------------------------------------------------------------------ units */

// Length unit → millimetres. Volume scales with f³, area with f².
export const UNIT_TO_MM = { mm: 1, cm: 10, in: 25.4 };

/** Convert a geometry-feature vector expressed in `unit` into millimetre-based units. */
export function convertFeaturesToMm(features, unit) {
  const f = UNIT_TO_MM[unit] || 1;
  if (f === 1) return { ...features };
  return {
    ...features,
    volume_mm3: features.volume_mm3 * f * f * f,
    surface_mm2: features.surface_mm2 * f * f,
    bbox_mm: features.bbox_mm && {
      x: features.bbox_mm.x * f,
      y: features.bbox_mm.y * f,
      z: features.bbox_mm.z * f,
    },
  };
}

/** Part weight in grams from solid volume (mm³) and density (g/cm³). */
export function weightGrams(volume_mm3, density_g_cm3, fillFactor = 1) {
  return (volume_mm3 / 1000) * density_g_cm3 * fillFactor;
}

/* --------------------------------------------------------------- currency */

const _numFmt = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** Format a number with exactly two fraction digits (no currency mark). */
export function fmtNumber(n) {
  return _numFmt.format(Number.isFinite(n) ? n : 0);
}

// Two <path> glyphs of the new Saudi Riyal symbol (viewBox 1124.14 × 1256.39).
export const RY_PATHS =
  '<path d="M699.62,1113.02h0c-20.06,44.48-33.32,92.75-38.4,143.37l424.51-90.24c20.06-44.47,33.31-92.75,38.4-143.37l-424.51,90.24Z"/><path d="M1085.73,895.8c20.06-44.47,33.32-92.75,38.4-143.37l-330.68,70.33v-135.2l292.27-62.11c20.06-44.47,33.32-92.75,38.4-143.37l-330.68,70.27V66.13c-50.67,28.45-95.67,66.32-132.25,110.99v403.35l-132.25,28.11V0c-50.67,28.44-95.67,66.32-132.25,110.99v525.69l-295.91,62.88c-20.06,44.47-33.33,92.75-38.42,143.37l334.33-71.05v170.26l-358.3,76.14c-20.06,44.47-33.32,92.75-38.4,143.37l375.04-79.7c30.53-6.35,56.77-24.4,73.83-49.24l68.78-101.97v-.02c7.14-10.55,11.3-23.27,11.3-36.97v-149.98l132.25-28.11v270.4l424.53-90.28Z"/>';

/**
 * Inline SAR glyph as an SVG string, sized in `em`.
 * `opts.valign` / `opts.mr` let callers reproduce engine-specific spacing
 * (quote-3d used -0.08em / .14em; quote-pcb used -0.06em / .16em).
 */
export function ry(em, opts = {}) {
  const valign = opts.valign ?? -0.08;
  const mr = opts.mr ?? 0.14;
  const extra = opts.flexShrink ? 'flex-shrink:0;' : '';
  return (
    `<svg viewBox="0 0 1124.14 1256.39" style="height:${em}em;width:auto;display:inline-block;` +
    `vertical-align:${valign}em;margin-right:${mr}em;${extra}" fill="currentColor" aria-hidden="true">` +
    `${RY_PATHS}</svg>`
  );
}

/** Price as HTML (glyph + number) — assign via innerHTML. */
export function fmtPrice(n, em = 0.82, opts) {
  return ry(em, opts) + fmtNumber(n);
}

/** Price as plain text (e.g. "SAR 1,234.56") — for aria/email/print. */
export function fmtPriceText(n, currency = 'SAR') {
  return `${currency} ${fmtNumber(n)}`;
}
