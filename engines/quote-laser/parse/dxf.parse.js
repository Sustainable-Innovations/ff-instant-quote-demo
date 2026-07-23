// engines/quote-laser/parse/dxf.parse.js
// DXF → normalized contours + SVG preview + parser confidence.
//
// Two-stage parse for robustness on real-world exports:
//   1. dxf-parser (esm.sh) — structured parse, expands BLOCKS via INSERT transforms.
//   2. raw group-code scanner (dependency-free) — fallback when (1) yields nothing
//      (dxf-parser silently returns 0 entities on some versions/encodings). The raw
//      scanner reads the code/value stream directly and recovers LINE / LWPOLYLINE /
//      POLYLINE+VERTEX / CIRCLE / ARC / SPLINE wherever they appear (incl. block defs).
//
// Browser-only (network import for dxf-parser); kernel/metrics stay Node-testable.

import DxfParser from 'https://esm.sh/dxf-parser@1.1.2';

const d2r = (deg) => (deg * Math.PI) / 180;

/* ---- 2×3 affine transforms: world = (a*x + c*y + e, b*x + d*y + f) ---- */
const IDENT = [1, 0, 0, 1, 0, 0];
function mul(m, n) {
  return [
    m[0] * n[0] + m[2] * n[1], m[1] * n[0] + m[3] * n[1],
    m[0] * n[2] + m[2] * n[3], m[1] * n[2] + m[3] * n[3],
    m[0] * n[4] + m[2] * n[5] + m[4], m[1] * n[4] + m[3] * n[5] + m[5],
  ];
}
const tPoint = (m, p) => ({ x: m[0] * p.x + m[2] * p.y + m[4], y: m[1] * p.x + m[3] * p.y + m[5] });
const tScale = (m) => Math.sqrt(Math.abs(m[0] * m[3] - m[1] * m[2])) || 1;
const tRot = (m) => Math.atan2(m[1], m[0]);

function insertMatrix(e) {
  const px = (e.position && e.position.x) || 0, py = (e.position && e.position.y) || 0;
  const sx = e.xScale ?? 1, sy = e.yScale ?? 1, rot = d2r(e.rotation || 0);
  const T = [1, 0, 0, 1, px, py];
  const R = [Math.cos(rot), Math.sin(rot), -Math.sin(rot), Math.cos(rot), 0, 0];
  const S = [sx, 0, 0, sy, 0, 0];
  return mul(mul(T, R), S);
}

/**
 * @param {string} dxfText
 * @returns {{contours:Array, bbox:Object, svg:string, entityCounts:Object,
 *            parserConfidence:number, warnings:string[]}}
 */
export function parseDxf(dxfText) {
  if (/^AutoCAD Binary DXF/.test(dxfText)) {
    return { contours: [], bbox: empty(), svg: '', entityCounts: {}, parserConfidence: 0, warnings: ['Binary DXF detected — re-export as ASCII DXF (R12 or 2013).'] };
  }

  const counts = {};
  const unsupported = new Set();
  const warnings = [];
  const contours = [];
  let approx = false;

  // ---- stage 1: structured parse via dxf-parser ----
  let dxf = null;
  try {
    dxf = new DxfParser().parseSync(dxfText);
  } catch (e) {
    warnings.push('Structured parse failed (' + (e && e.message) + ') — using raw scan.');
  }

  if (dxf) {
    const blocks = dxf.blocks || {};
    const walk = (entities, m, depth) => {
      if (!entities || depth > 8) return;
      for (const e of entities) {
        counts[e.type] = (counts[e.type] || 0) + 1;
        switch (e.type) {
          case 'INSERT': {
            const blk = blocks[e.name];
            if (blk && blk.entities) walk(blk.entities, mul(m, insertMatrix(e)), depth + 1);
            else unsupported.add('INSERT(' + e.name + ')');
            break;
          }
          case 'LINE':
            if (e.vertices && e.vertices.length >= 2) contours.push({ type: 'poly', points: e.vertices.map((v) => tPoint(m, v)), closed: false });
            break;
          case 'LWPOLYLINE':
          case 'POLYLINE':
            if (e.vertices && e.vertices.length) contours.push({ type: 'poly', points: e.vertices.map((v) => tPoint(m, v)), closed: !!(e.shape || e.closed) });
            break;
          case 'CIRCLE':
            if (e.center) { const c = tPoint(m, e.center); contours.push({ type: 'circle', cx: c.x, cy: c.y, r: e.radius * tScale(m) }); }
            break;
          case 'ARC':
            if (e.center) { const c = tPoint(m, e.center), rr = tRot(m); contours.push({ type: 'arc', cx: c.x, cy: c.y, r: e.radius * tScale(m), a0: d2r(e.startAngle) + rr, a1: d2r(e.endAngle) + rr }); }
            break;
          case 'ELLIPSE':
          case 'SPLINE': {
            const pts = (e.fitPoints && e.fitPoints.length ? e.fitPoints : e.controlPoints) || [];
            if (pts.length >= 2) { contours.push({ type: 'poly', points: pts.map((v) => tPoint(m, v)), closed: !!e.closed }); approx = true; }
            break;
          }
          case 'SOLID':
          case '3DFACE':
            if (e.points && e.points.length >= 3) { contours.push({ type: 'poly', points: e.points.map((v) => tPoint(m, v)), closed: true }); approx = true; }
            break;
          default:
            unsupported.add(e.type);
        }
      }
    };
    walk(dxf.entities || [], IDENT, 0);
    if (!contours.length) {
      const ms = blocks['*Model_Space'] || blocks['$MODEL_SPACE'] || blocks['*MODEL_SPACE'] || blocks['*Paper_Space'];
      if (ms && ms.entities) walk(ms.entities, IDENT, 0);
    }
  }

  // ---- stage 2: raw group-code scan fallback ----
  let usedRaw = false;
  if (!contours.length) {
    const rs = rawScanDxf(dxfText);
    for (const k in rs.counts) counts[k] = (counts[k] || 0) + rs.counts[k];
    if (rs.contours.length) {
      contours.push(...rs.contours);
      usedRaw = true;
      approx = true;
      warnings.push('Recovered geometry via raw scan (structured parser found nothing).');
    }
  }

  if (unsupported.size) warnings.push('Unsupported entities ignored: ' + [...unsupported].slice(0, 6).join(', '));

  const bbox = bboxOf(contours);
  let parserConfidence = contours.length ? 0.95 : 0;
  if (approx) parserConfidence = Math.min(parserConfidence, 0.7);
  if (usedRaw) parserConfidence = Math.min(parserConfidence, 0.6);
  if (unsupported.size) parserConfidence = Math.min(parserConfidence, 0.65);

  return { contours, bbox, svg: buildSvg(contours, bbox), entityCounts: counts, parserConfidence, warnings };
}

/* ---------------- raw group-code scanner ---------------- */
function rawScanDxf(text) {
  const lines = text.split(/\r\n|\r|\n/);
  // pair (code, value) with resync if a code line isn't an integer
  const pairs = [];
  for (let i = 0; i + 1 < lines.length;) {
    const c = parseInt(lines[i].trim(), 10);
    if (Number.isNaN(c)) { i += 1; continue; }
    pairs.push([c, (lines[i + 1] ?? '').trim()]);
    i += 2;
  }
  // split into entity records at each code-0 marker
  const ents = [];
  let cur = null;
  for (const [c, v] of pairs) {
    if (c === 0) { if (cur) ents.push(cur); cur = { type: v.toUpperCase(), props: [] }; }
    else if (cur) cur.props.push([c, v]);
  }
  if (cur) ents.push(cur);

  const counts = {};
  const contours = [];
  const num = (e, code) => { const p = e.props.find((x) => x[0] === code); return p ? parseFloat(p[1]) : undefined; };
  const intFlag = (e, code) => { const v = num(e, code); return Number.isFinite(v) ? v | 0 : 0; };
  const pairsOf = (props, cx, cy) => { const pts = []; let x = null; for (const [c, v] of props) { if (c === cx) x = parseFloat(v); else if (c === cy && x !== null) { pts.push({ x, y: parseFloat(v) }); x = null; } } return pts; };

  let poly = null; // open POLYLINE accumulating VERTEX records
  for (const e of ents) {
    counts[e.type] = (counts[e.type] || 0) + 1;
    switch (e.type) {
      case 'LWPOLYLINE': {
        const pts = pairsOf(e.props, 10, 20);
        if (pts.length) contours.push({ type: 'poly', points: pts, closed: (intFlag(e, 70) & 1) === 1 });
        break;
      }
      case 'POLYLINE':
        poly = { type: 'poly', points: [], closed: (intFlag(e, 70) & 1) === 1 };
        break;
      case 'VERTEX': {
        const x = num(e, 10), y = num(e, 20);
        if (poly && Number.isFinite(x) && Number.isFinite(y)) poly.points.push({ x, y });
        break;
      }
      case 'SEQEND':
        if (poly) { if (poly.points.length >= 2) contours.push(poly); poly = null; }
        break;
      case 'LINE': {
        const x1 = num(e, 10), y1 = num(e, 20), x2 = num(e, 11), y2 = num(e, 21);
        if ([x1, y1, x2, y2].every(Number.isFinite)) contours.push({ type: 'poly', points: [{ x: x1, y: y1 }, { x: x2, y: y2 }], closed: false });
        break;
      }
      case 'CIRCLE': {
        const x = num(e, 10), y = num(e, 20), r = num(e, 40);
        if ([x, y, r].every(Number.isFinite)) contours.push({ type: 'circle', cx: x, cy: y, r });
        break;
      }
      case 'ARC': {
        const x = num(e, 10), y = num(e, 20), r = num(e, 40), a0 = num(e, 50), a1 = num(e, 51);
        if ([x, y, r].every(Number.isFinite)) contours.push({ type: 'arc', cx: x, cy: y, r, a0: d2r(a0 || 0), a1: d2r(a1 || 0) });
        break;
      }
      case 'SPLINE':
      case 'ELLIPSE': {
        const fit = pairsOf(e.props, 11, 21);
        const ctrl = pairsOf(e.props, 10, 20);
        const use = fit.length >= 2 ? fit : ctrl;
        if (use.length >= 2) contours.push({ type: 'poly', points: use, closed: (intFlag(e, 70) & 1) === 1 });
        break;
      }
      default:
        break;
    }
  }
  if (poly && poly.points.length >= 2) contours.push(poly);
  return { contours, counts };
}

/* ---------------- geometry → bbox + svg ---------------- */
const empty = () => ({ minX: 0, minY: 0, maxX: 0, maxY: 0, w: 0, h: 0 });

function bboxOf(contours) {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  const add = (x, y) => { if (x < minX) minX = x; if (x > maxX) maxX = x; if (y < minY) minY = y; if (y > maxY) maxY = y; };
  for (const ct of contours) {
    if (ct.type === 'circle' || ct.type === 'arc') { add(ct.cx - ct.r, ct.cy - ct.r); add(ct.cx + ct.r, ct.cy + ct.r); }
    else for (const p of ct.points) add(p.x, p.y);
  }
  if (!isFinite(minX)) return empty();
  return { minX, minY, maxX, maxY, w: maxX - minX, h: maxY - minY };
}

function buildSvg(contours, b) {
  if (!contours.length || !(b.w > 0 || b.h > 0)) return '';
  const pad = Math.max(b.w, b.h) * 0.03 + 1;
  const vbW = b.w + pad * 2, vbH = b.h + pad * 2;
  const parts = [];
  for (const ct of contours) {
    if (ct.type === 'circle') parts.push(`<circle cx="${ct.cx}" cy="${ct.cy}" r="${ct.r}" fill="none"/>`);
    else if (ct.type === 'arc') parts.push(arcPath(ct));
    else {
      const p = ct.points; if (!p.length) continue;
      let d = `M ${p[0].x} ${p[0].y}`;
      for (let i = 1; i < p.length; i++) d += ` L ${p[i].x} ${p[i].y}`;
      if (ct.closed) d += ' Z';
      parts.push(`<path d="${d}" fill="none"/>`);
    }
  }
  const sw = Math.max(b.w, b.h) / 320 || 0.3;
  return (
    `<svg viewBox="${b.minX - pad} ${b.minY - pad} ${vbW} ${vbH}" xmlns="http://www.w3.org/2000/svg" ` +
    `style="width:100%;height:100%"><g transform="translate(0 ${2 * b.minY + b.h}) scale(1 -1)" ` +
    `stroke="#0135f4" stroke-width="${sw}" stroke-linejoin="round" vector-effect="non-scaling-stroke">${parts.join('')}</g></svg>`
  );
}

function arcPath(ct) {
  const x0 = ct.cx + ct.r * Math.cos(ct.a0), y0 = ct.cy + ct.r * Math.sin(ct.a0);
  const x1 = ct.cx + ct.r * Math.cos(ct.a1), y1 = ct.cy + ct.r * Math.sin(ct.a1);
  let d = ct.a1 - ct.a0; while (d < 0) d += 2 * Math.PI;
  const large = d > Math.PI ? 1 : 0;
  return `<path d="M ${x0} ${y0} A ${ct.r} ${ct.r} 0 ${large} 1 ${x1} ${y1}" fill="none"/>`;
}
