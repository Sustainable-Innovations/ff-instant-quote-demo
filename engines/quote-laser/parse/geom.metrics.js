// engines/quote-laser/parse/geom.metrics.js
// Pure geometry metrics from normalized contours (DOM-free; Node-testable).
//
// A "contour" is one of:
//   { type:'poly',   points:[{x,y},...], closed:bool }
//   { type:'circle', cx, cy, r }
//   { type:'arc',    cx, cy, r, a0, a1 }   // angles in radians, CCW a0→a1
//
// Cut length = total path length of every contour (this is what the laser traces).
// Pierces    = number of contours (the head pierces once per contour / hole).
// Part area  = outer loop area minus internal hole areas (best-effort).

const dist = (a, b) => Math.hypot(b.x - a.x, b.y - a.y);

function contourLength(ct) {
  if (ct.type === 'circle') return 2 * Math.PI * ct.r;
  if (ct.type === 'arc') {
    let d = ct.a1 - ct.a0;
    while (d < 0) d += 2 * Math.PI;
    return ct.r * d;
  }
  const p = ct.points || [];
  let L = 0;
  for (let i = 1; i < p.length; i++) L += dist(p[i - 1], p[i]);
  if (ct.closed && p.length > 2) L += dist(p[p.length - 1], p[0]);
  return L;
}

function contourArea(ct) {
  if (ct.type === 'circle') return Math.PI * ct.r * ct.r;
  if (ct.type === 'arc') return 0; // open arc encloses no area on its own
  const p = ct.points || [];
  if (!ct.closed || p.length < 3) return 0;
  let a = 0;
  for (let i = 0; i < p.length; i++) {
    const j = (i + 1) % p.length;
    a += p[i].x * p[j].y - p[j].x * p[i].y;
  }
  return Math.abs(a) / 2;
}

function contourBBox(ct, acc) {
  const add = (x, y) => {
    if (x < acc.minX) acc.minX = x; if (x > acc.maxX) acc.maxX = x;
    if (y < acc.minY) acc.minY = y; if (y > acc.maxY) acc.maxY = y;
  };
  if (ct.type === 'circle') { add(ct.cx - ct.r, ct.cy - ct.r); add(ct.cx + ct.r, ct.cy + ct.r); return; }
  if (ct.type === 'arc') { add(ct.cx - ct.r, ct.cy - ct.r); add(ct.cx + ct.r, ct.cy + ct.r); return; }
  for (const pt of ct.points || []) add(pt.x, pt.y);
}

/**
 * @param {Array} contours
 * @returns {{perimeter_mm:number, pierces:number, partAreaCm2:number,
 *            bbox_mm:{x:number,y:number}, areaCm2:number, featureDensity:number}}
 */
export function metricsFromContours(contours) {
  const acc = { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity };
  let perimeter = 0;
  const areas = [];
  for (const ct of contours) {
    perimeter += contourLength(ct);
    const a = contourArea(ct);
    if (a > 0) areas.push(a);
    contourBBox(ct, acc);
  }
  const w = acc.maxX > acc.minX ? acc.maxX - acc.minX : 0;
  const h = acc.maxY > acc.minY ? acc.maxY - acc.minY : 0;

  // net part area: largest closed loop is the outer boundary; the rest are holes
  areas.sort((p, q) => q - p);
  const outer = areas[0] || 0;
  const holes = areas.slice(1).reduce((s, v) => s + v, 0);
  const partArea_mm2 = Math.max(0, outer - holes);

  const pierces = contours.length;
  const bboxAreaCm2 = (w * h) / 100;
  return {
    perimeter_mm: perimeter,
    pierces,
    partAreaCm2: partArea_mm2 / 100,
    areaCm2: bboxAreaCm2,
    bbox_mm: { x: w, y: h },
    featureDensity: bboxAreaCm2 > 0 ? perimeter / bboxAreaCm2 : 0, // mm cut per cm² footprint
  };
}
