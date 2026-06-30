// engines/core/mesh/stl-step.js
// Shared mesh ingestion: STL (sync) + STEP (lazy occt-import-js) → flat non-indexed
// positions ready for engines/core/util/geometry.js analyzeMesh().
// Browser-only: imports `three` via the host page's importmap (both engines define it).
// occt-import-js is lazy-loaded from CDN on the first STEP drop (~8 MB).

import * as THREE from 'three';
import { STLLoader } from 'three/addons/loaders/STLLoader.js';

/** Parse an STL ArrayBuffer → {positions:Float32Array, count, geometry}. */
export function parseSTL(buffer) {
  const geometry = new STLLoader().parse(buffer);
  const g = geometry.index ? geometry.toNonIndexed() : geometry;
  return { positions: g.attributes.position.array, count: g.attributes.position.count, geometry: g };
}

let _occt = null;
export function loadOcct() {
  if (_occt) return _occt;
  _occt = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/occt-import-js@0.0.22/dist/occt-import-js.js';
    script.onload = () => {
      if (typeof occtimportjs !== 'function') { reject(new Error('occt-import-js global not found')); return; }
      occtimportjs({ locateFile: (f) => `https://cdn.jsdelivr.net/npm/occt-import-js@0.0.22/dist/${f}` }).then(resolve).catch(reject);
    };
    script.onerror = () => reject(new Error('Failed to download STEP parser from CDN.'));
    document.head.appendChild(script);
  });
  return _occt;
}

/** Parse a STEP ArrayBuffer → {positions, count, geometry}. Merges all solids. */
export async function parseSTEP(buffer) {
  const occt = await loadOcct();
  const result = occt.ReadStepFile(new Uint8Array(buffer), null);
  if (!result || !result.success || !result.meshes || !result.meshes.length) {
    throw new Error('STEP file contained no usable geometry.');
  }
  let totalVerts = 0, totalIdx = 0;
  result.meshes.forEach((m) => {
    totalVerts += m.attributes.position.array.length;
    totalIdx += m.index ? m.index.array.length : m.attributes.position.array.length / 3;
  });
  const positions = new Float32Array(totalVerts);
  const indices = new Uint32Array(totalIdx);
  let vOff = 0, iOff = 0, vertBase = 0;
  result.meshes.forEach((m) => {
    const p = m.attributes.position.array;
    positions.set(p, vOff);
    if (m.index) {
      const idx = m.index.array;
      for (let i = 0; i < idx.length; i++) indices[iOff + i] = idx[i] + vertBase;
      iOff += idx.length;
    } else {
      const n = p.length / 3;
      for (let i = 0; i < n; i++) indices[iOff + i] = vertBase + i;
      iOff += n;
    }
    vOff += p.length;
    vertBase += p.length / 3;
  });
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setIndex(new THREE.BufferAttribute(indices, 1));
  const nonIndexed = geometry.toNonIndexed();
  geometry.dispose();
  return { positions: nonIndexed.attributes.position.array, count: nonIndexed.attributes.position.count, geometry: nonIndexed };
}

/** Dispatch by extension. ext one of 'stl' | 'step' | 'stp'. */
export async function parseMesh(buffer, ext) {
  if (ext === 'stl') return parseSTL(buffer);
  if (ext === 'step' || ext === 'stp') return parseSTEP(buffer);
  throw new Error('Unsupported mesh type: ' + ext);
}
