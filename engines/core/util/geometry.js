// engines/core/util/geometry.js
// DOM/THREE-free mesh analysis. Operates on a flat, non-indexed positions array
// (Float32Array | number[]) of length triCount*9 — i.e. 3 vertices × 3 floats per
// triangle. Ported 1:1 from quote-3d's THREE-based analyzeGeometry/computeWatertight
// so results are identical. Reused by the Phase-1 FDM build-time surrogate.

/**
 * @param {ArrayLike<number>} positions  flat xyz triples, 9 floats per triangle
 * @param {number} [vertCount]           number of vertices (positions.length/3)
 * @returns {{volume_mm3:number, surface_mm2:number, bbox_mm:{x:number,y:number,z:number},
 *            triCount:number, watertight:(boolean|null)}}
 */
export function analyzeMesh(positions, vertCount) {
  const n = vertCount != null ? vertCount : Math.floor(positions.length / 3);

  let minX = Infinity, minY = Infinity, minZ = Infinity;
  let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;
  let volume = 0;
  let surface = 0;

  for (let i = 0; i < n; i += 3) {
    const ax = positions[3 * i],     ay = positions[3 * i + 1],     az = positions[3 * i + 2];
    const bx = positions[3 * (i + 1)], by = positions[3 * (i + 1) + 1], bz = positions[3 * (i + 1) + 2];
    const cx = positions[3 * (i + 2)], cy = positions[3 * (i + 2) + 1], cz = positions[3 * (i + 2) + 2];

    // signed tetra volume = A · (B × C) / 6
    const crX = by * cz - bz * cy;
    const crY = bz * cx - bx * cz;
    const crZ = bx * cy - by * cx;
    volume += (ax * crX + ay * crY + az * crZ) / 6;

    // triangle area = |(B-A) × (C-A)| / 2
    const e1x = bx - ax, e1y = by - ay, e1z = bz - az;
    const e2x = cx - ax, e2y = cy - ay, e2z = cz - az;
    const nx = e1y * e2z - e1z * e2y;
    const ny = e1z * e2x - e1x * e2z;
    const nz = e1x * e2y - e1y * e2x;
    surface += Math.sqrt(nx * nx + ny * ny + nz * nz) / 2;
  }

  // bbox in a second pass over vertices (cheap; keeps the loop above readable)
  for (let v = 0; v < n; v++) {
    const x = positions[3 * v], y = positions[3 * v + 1], z = positions[3 * v + 2];
    if (x < minX) minX = x; if (x > maxX) maxX = x;
    if (y < minY) minY = y; if (y > maxY) maxY = y;
    if (z < minZ) minZ = z; if (z > maxZ) maxZ = z;
  }

  const sx = maxX - minX, sy = maxY - minY, sz = maxZ - minZ;
  const diag = Math.sqrt(sx * sx + sy * sy + sz * sz);

  return {
    volume_mm3: Math.abs(volume),
    surface_mm2: surface,
    bbox_mm: { x: sx, y: sy, z: sz },
    triCount: Math.floor(n / 3),
    watertight: computeWatertight(positions, n, diag),
  };
}

/**
 * Weld vertices within tolerance and tally edges. Shared backbone for the watertight
 * check and topology (Euler characteristic / genus).
 * @returns {{V:number, E:number, F:number, edges:Map<string,number>}|null} null if too large
 */
export function weldTopology(positions, vertCount, diag) {
  const n = vertCount;
  if (n > 900000) return null;

  const g = diag * 1e-5 || 1e-6; // weld tolerance (~1µm for a 100mm part)
  const idOf = new Map();
  const vid = new Int32Array(n);
  let next = 0;
  for (let v = 0; v < n; v++) {
    const key =
      Math.round(positions[3 * v] / g) + ',' +
      Math.round(positions[3 * v + 1] / g) + ',' +
      Math.round(positions[3 * v + 2] / g);
    let id = idOf.get(key);
    if (id === undefined) { id = next++; idOf.set(key, id); }
    vid[v] = id;
  }

  const edges = new Map();
  const bump = (p, q) => {
    const k = p < q ? p + '_' + q : q + '_' + p;
    edges.set(k, (edges.get(k) || 0) + 1);
  };
  for (let t = 0; t < n; t += 3) {
    bump(vid[t], vid[t + 1]);
    bump(vid[t + 1], vid[t + 2]);
    bump(vid[t + 2], vid[t]);
  }
  return { V: next, E: edges.size, F: n / 3, edges };
}

/**
 * Manifold/watertight check: every welded edge shared by exactly two triangles.
 * Returns null for very large meshes (skipped).
 */
export function computeWatertight(positions, vertCount, diag) {
  const t = weldTopology(positions, vertCount, diag);
  if (!t) return null;
  for (const count of t.edges.values()) if (count !== 2) return false;
  return true;
}

/**
 * Topology of a closed mesh: Euler characteristic χ = V − E + F and genus g = (2−χ)/2.
 * For a flat plate, genus == number of through-holes. Returns closed=false if the mesh
 * is open/non-manifold (genus unreliable).
 */
export function meshTopology(positions, vertCount, diag) {
  const t = weldTopology(positions, vertCount, diag);
  if (!t) return { closed: null, genus: null, V: null, E: null, F: null, chi: null };
  let closed = true;
  for (const count of t.edges.values()) if (count !== 2) { closed = false; break; }
  const chi = t.V - t.E + t.F;
  const genus = closed ? Math.max(0, Math.round((2 - chi) / 2)) : null;
  return { closed, genus, V: t.V, E: t.E, F: t.F, chi };
}

/**
 * Derive flat-sheet laser features from a solid mesh analysis. A constant-thickness
 * sheet satisfies  volume = faceArea·t  and  surface ≈ 2·faceArea + perimeter·t,
 * so  thickness = smallest bbox dim,  perimeter = (surface − 2·faceArea)/thickness.
 * Through-holes come from genus. `sheetConfidence` falls as the part gets less plate-like.
 *
 * @param {{volume_mm3, surface_mm2, bbox_mm, watertight}} a  analyzeMesh() result
 * @param {{genus, closed}} [topo]  meshTopology() result
 */
export function sheetFeaturesFromMesh(a, topo = {}) {
  const dims = [a.bbox_mm.x, a.bbox_mm.y, a.bbox_mm.z].sort((p, q) => p - q);
  const thickness = dims[0];
  const planeW = dims[1];
  const planeH = dims[2];
  const faceArea = thickness > 0 ? a.volume_mm3 / thickness : 0; // mm²
  const lateral = Math.max(0, a.surface_mm2 - 2 * faceArea);
  const perimeter = thickness > 0 ? lateral / thickness : 0;
  const genus = topo && topo.genus != null ? topo.genus : null;
  const pierces = genus != null ? genus + 1 : 1;

  // plate-likeness: thin relative to footprint, and watertight → high confidence
  const ratio = planeH > 0 ? thickness / planeH : 1;
  let sheetConfidence = ratio < 0.05 ? 0.95 : ratio < 0.15 ? 0.85 : ratio < 0.3 ? 0.65 : 0.4;
  if (a.watertight === false) sheetConfidence = Math.min(sheetConfidence, 0.55);
  if (genus == null) sheetConfidence = Math.min(sheetConfidence, 0.6);

  return {
    thickness_mm: thickness,
    perimeter_mm: perimeter,
    pierces,
    bbox_mm: { x: planeW, y: planeH },
    partAreaCm2: faceArea / 100,
    areaCm2: (planeW * planeH) / 100,
    sheetConfidence,
    isSheet: ratio < 0.3,
  };
}
