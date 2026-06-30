// engines/quote-3d/slicer/fallback.estimate.js
// Phase-1 build-time SURROGATE for polymer AM (FDM · SLA · SLS). DOM/THREE-free.
//
// Why: the legacy machine-time proxy was `volume / mmPerHour`, which ignores part
// height. A tall, thin, hollow part has little volume but many layers and long build
// time — the legacy model underprices it badly. This surrogate is layer-aware:
//
//   build_time ≈ depositedVolume / volumetricFlow  +  layerCount × perLayerOverhead
//   depositedVolume = solidVolume × infillFactor   +  supportVolume
//
// It is the always-present fast path (keeps the <5s budget). A future CuraEngine-WASM
// worker (slicer.bridge.js) can return the same {est_hours, materialFactor, supportVol_mm3}
// shape to override it when feasible.
//
// Returns null when the process has no `build` block (e.g. CNC) so the kernel falls
// back to its legacy time model — never throws.

/**
 * @param {Object} features  {volume_mm3, surface_mm2, bbox_mm:{x,y,z}, watertight}
 * @param {Object} process   coeffs.processes[key] (carries the `build` block + `baseLayerHeight`/`params`)
 * @param {Object} params    UI param values {infill?, layerHeight?}
 * @returns {{est_hours:number, materialFactor:number, supportVol_mm3:number, layerCount:number}|null}
 */
export function surrogateTimeModel(features, process, params) {
  const b = process && process.build;
  if (!b) return null; // subtractive / unmodelled process → kernel keeps legacy proxy

  const lh = (params && params.layerHeight) || process.baseLayerHeight || 0.2;
  const z = (features.bbox_mm && features.bbox_mm.z) || 0;
  const layerCount = Math.max(1, Math.ceil(z / lh));

  // Infill only applies where the process exposes it (FDM). SLA/SLS print solid.
  const hasInfill = !!(process.params && process.params.infill);
  const infill = hasInfill ? (params && params.infill != null ? params.infill : process.params.infill.default) : 100;
  const materialFactor = hasInfill ? 0.15 + 0.85 * (infill / 100) : 1.0;

  const solidVol = features.volume_mm3 || 0;
  const depositedVol = solidVol * materialFactor;

  // Support proxy: a fraction of model volume, scaled up a little for tall parts
  // (taller → more overhang risk). Kept simple and supplier-tunable via supportFraction.
  const heightFactor = 1 + Math.min(0.5, z / 600); // up to +50% for very tall parts
  const supportVol_mm3 = solidVol * (b.supportFraction || 0) * heightFactor;

  const flow = b.volumetricFlow_mm3ps || 10; // effective deposition/cure rate
  const overheadSec = b.layerOverheadSec || 0; // per-layer travel / recoat / exposure
  const printSec = (depositedVol + supportVol_mm3) / flow + layerCount * overheadSec;

  return {
    est_hours: (printSec / 3600) * (b.timeMult || 1),
    materialFactor,
    supportVol_mm3,
    layerCount,
  };
}
