// engines/core/mesh-quality.js
// Advisory mesh/manufacturability checks for FDM quote readiness. DOM-free and
// intentionally conservative: flags likely risks, not certified metrology.

function edgeKey(a, b) {
  return a < b ? `${a}_${b}` : `${b}_${a}`;
}

function weld(positions, vertCount, diag) {
  const n = vertCount != null ? vertCount : Math.floor(positions.length / 3);
  if (n > 900000) return null;
  const tol = diag * 1e-5 || 1e-6;
  const idOf = new Map();
  const vid = new Int32Array(n);
  let next = 0;
  for (let i = 0; i < n; i++) {
    const key = `${Math.round(positions[i * 3] / tol)},${Math.round(positions[i * 3 + 1] / tol)},${Math.round(positions[i * 3 + 2] / tol)}`;
    let id = idOf.get(key);
    if (id === undefined) { id = next++; idOf.set(key, id); }
    vid[i] = id;
  }
  return { vid, vertexCount: next };
}

class DSU {
  constructor(n) {
    this.p = Array.from({ length: n }, (_, i) => i);
  }
  find(x) {
    while (this.p[x] !== x) { this.p[x] = this.p[this.p[x]]; x = this.p[x]; }
    return x;
  }
  union(a, b) {
    const ra = this.find(a), rb = this.find(b);
    if (ra !== rb) this.p[rb] = ra;
  }
}

/**
 * @param {ArrayLike<number>} positions flat xyz triples, non-indexed triangles
 * @param {number} [vertCount]
 * @param {{thinWallMm?:number, overhangDeg?:number}} [opts]
 */
export function analyzeMeshQuality(positions, vertCount, opts = {}) {
  const n = vertCount != null ? vertCount : Math.floor(positions.length / 3);
  let minX = Infinity, minY = Infinity, minZ = Infinity;
  let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;
  for (let i = 0; i < n; i++) {
    const x = positions[i * 3], y = positions[i * 3 + 1], z = positions[i * 3 + 2];
    if (x < minX) minX = x; if (x > maxX) maxX = x;
    if (y < minY) minY = y; if (y > maxY) maxY = y;
    if (z < minZ) minZ = z; if (z > maxZ) maxZ = z;
  }
  const bbox = { x: maxX - minX, y: maxY - minY, z: maxZ - minZ };
  const diag = Math.hypot(bbox.x, bbox.y, bbox.z);
  const triCount = Math.floor(n / 3);
  const riskClasses = new Uint8Array(triCount);
  const thinWallMm = opts.thinWallMm ?? 1.0;
  const overhangCos = Math.cos(((opts.overhangDeg ?? 45) * Math.PI) / 180);

  let surface = 0;
  let volume = 0;
  let overhangFaces = 0;
  let bridgeFaces = 0;
  let thinFaces = 0;

  const welded = weld(positions, n, diag);
  const edges = new Map();
  const edgeToTris = new Map();
  const dsu = new DSU(triCount || 1);

  for (let t = 0; t < triCount; t++) {
    const i = t * 3;
    const p = t * 9;
    const ax = positions[p], ay = positions[p + 1], az = positions[p + 2];
    const bx = positions[p + 3], by = positions[p + 4], bz = positions[p + 5];
    const cx = positions[p + 6], cy = positions[p + 7], cz = positions[p + 8];
    const abx = bx - ax, aby = by - ay, abz = bz - az;
    const acx = cx - ax, acy = cy - ay, acz = cz - az;
    const nx = aby * acz - abz * acy;
    const ny = abz * acx - abx * acz;
    const nz = abx * acy - aby * acx;
    const area2 = Math.hypot(nx, ny, nz);
    surface += area2 / 2;
    volume += (ax * (by * cz - bz * cy) + ay * (bz * cx - bx * cz) + az * (bx * cy - by * cx)) / 6;

    const normalZ = area2 ? nz / area2 : 0;
    if (normalZ < -overhangCos) {
      overhangFaces++;
      riskClasses[t] = Math.max(riskClasses[t], 1);
      if (normalZ < -0.9) bridgeFaces++;
    }
    const minEdge = Math.min(
      Math.hypot(abx, aby, abz),
      Math.hypot(cx - bx, cy - by, cz - bz),
      Math.hypot(ax - cx, ay - cy, az - cz)
    );
    if (minEdge > 0 && minEdge < thinWallMm) {
      thinFaces++;
      riskClasses[t] = 2;
    }

    if (welded) {
      const a = welded.vid[i], b = welded.vid[i + 1], c = welded.vid[i + 2];
      for (const [p, q] of [[a, b], [b, c], [c, a]]) {
        const key = edgeKey(p, q);
        edges.set(key, (edges.get(key) || 0) + 1);
        const firstTri = edgeToTris.get(key);
        if (firstTri == null) edgeToTris.set(key, t);
        else dsu.union(firstTri, t);
      }
    }
  }

  let boundaryEdges = null;
  let nonManifoldEdges = null;
  let badEdges = null;
  let shellCount = null;
  if (welded) {
    boundaryEdges = 0;
    nonManifoldEdges = 0;
    for (const c of edges.values()) {
      if (c === 1) boundaryEdges++;
      else if (c > 2) nonManifoldEdges++;
    }
    badEdges = boundaryEdges + nonManifoldEdges;
    const shells = new Set();
    for (let t = 0; t < triCount; t++) shells.add(dsu.find(t));
    shellCount = shells.size;
  }

  const risks = {
    openMesh: badEdges == null ? null : badEdges > 0,
    groupedModels: shellCount == null ? null : Math.max(0, shellCount - 1),
    thinWalls: thinFaces,
    overhangFaces,
    bridgeFaces,
  };

  return {
    properties: {
      dimensions_mm: bbox,
      volume_mm3: Math.abs(volume),
      surface_mm2: surface,
      triCount,
    },
    quality: {
      shellCount,
      boundaryEdges,
      nonManifoldEdges,
      badEdges,
      watertight: badEdges == null ? null : badEdges === 0,
    },
    risks,
    riskClasses: Array.from(riskClasses),
  };
}
