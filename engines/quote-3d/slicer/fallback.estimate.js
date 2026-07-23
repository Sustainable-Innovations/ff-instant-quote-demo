// engines/quote-3d/slicer/fallback.estimate.js
// DOM-free parametric build-time surrogate for polymer AM.
//
// FDM: deposited volume / effective flow + per-layer overhead.
// SLA/MSLA/DLP: layer exposure + lift/peel/dead time, with bottom exposure premium.
// SLS: shared powder build allocation by bounding-box occupancy and packing density.

function num(value, fallback) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function layerHeight(process, params, build, fallback) {
  return num(params && params.layerHeight, num(build && build.layerHeight, num(process && process.baseLayerHeight, fallback)));
}

function fdmTimeModel(features, process, params, build) {
  const lh = layerHeight(process, params, build, 0.2);
  const z = (features.bbox_mm && features.bbox_mm.z) || 0;
  const layerCount = Math.max(1, Math.ceil(z / lh));
  const infill = params && params.infill != null
    ? params.infill
    : ((process.params && process.params.infill && process.params.infill.default) || 20);
  const materialFactor = 0.15 + 0.85 * (infill / 100);
  const solidVol = features.volume_mm3 || 0;
  const depositedVol = solidVol * materialFactor;
  const heightFactor = 1 + Math.min(0.5, z / 600);
  const supportVol_mm3 = solidVol * (build.supportFraction || 0) * heightFactor;
  const flow = build.volumetricFlow_mm3ps || 10;
  const overheadSec = build.layerOverheadSec || 0;
  const printSec = (depositedVol + supportVol_mm3) / flow + layerCount * overheadSec;

  return {
    est_hours: (printSec / 3600) * num(build.timeMult, 1),
    materialFactor,
    supportVol_mm3,
    layerCount,
    source: 'physics',
    modelKind: 'fdm',
  };
}

function resinTimeModel(features, process, params, build) {
  const lh = layerHeight(process, params, build, 0.05);
  const z = (features.bbox_mm && features.bbox_mm.z) || 0;
  const layerCount = Math.max(1, Math.ceil(z / lh));
  const bottomLayers = Math.min(layerCount, Math.max(0, Math.round(num(build.bottomLayers, 5))));
  const normalLayers = Math.max(0, layerCount - bottomLayers);
  const layerTimeSec = num(build.layerTimeSec, 2.2);
  const deadTimeSec = num(build.deadTimeSec, num(build.layerOverheadSec, 6.0));
  const bottomExposureMult = num(build.bottomExposureMult, 4.0);
  const laserTraceFactor = Math.max(0, num(build.laserTraceFactor, 0));
  const supportVol_mm3 = (features.volume_mm3 || 0) * Math.max(0, num(build.supportFraction, 0.15));
  const laserTraceSec = laserTraceFactor * ((features.surface_mm2 || 0) / 1000);
  const printSec =
    bottomLayers * layerTimeSec * bottomExposureMult +
    normalLayers * layerTimeSec +
    layerCount * deadTimeSec +
    laserTraceSec;

  return {
    est_hours: (printSec / 3600) * num(build.timeMult, 1),
    materialFactor: 1.0,
    supportVol_mm3,
    layerCount,
    source: 'physics',
    modelKind: 'resin',
    resinLayerTimeSec: layerTimeSec,
    deadTimeSec,
    bottomLayers,
    bottomExposureMult,
    laserTraceSec,
  };
}

function powderTimeModel(features, process, params, machine, build) {
  const chamber = build.chamber || (machine && machine.envelope) || process.envelope || {};
  const lh = layerHeight(process, params, build, 0.11);
  const chamberX = Math.max(1, num(chamber.x, 1));
  const chamberY = Math.max(1, num(chamber.y, 1));
  const chamberZ = Math.max(1, num(chamber.z, 1));
  const bbox = features.bbox_mm || {};
  const bboxVol = Math.max(0, (bbox.x || 0) * (bbox.y || 0) * (bbox.z || 0));
  const chamberVol = chamberX * chamberY * chamberZ;
  const packingDensity = Math.max(0.01, Math.min(1, num(build.packingDensity, 0.1)));
  const occupancyShare = bboxVol / Math.max(1, chamberVol * packingDensity);
  const fullBuildLayers = Math.max(1, Math.ceil(chamberZ / lh));
  const fullBuildHours = (fullBuildLayers * num(build.layerTimeSec, 9.0)) / 3600;
  const fusedVol = Math.max(0, features.volume_mm3 || 0);
  const powderRefreshVol_mm3 = Math.max(0, bboxVol - fusedVol) * Math.max(0, num(build.powderRefreshFraction, 0.5));

  return {
    est_hours: fullBuildHours * occupancyShare * num(build.timeMult, 1),
    materialFactor: 1.0,
    supportVol_mm3: 0,
    powderRefreshVol_mm3,
    layerCount: fullBuildLayers,
    source: 'physics',
    modelKind: 'powder',
    packingDensity,
    occupancyShare,
    fullBuildHours,
    chamber: { x: chamberX, y: chamberY, z: chamberZ },
  };
}

/**
 * @param {Object} features {volume_mm3, surface_mm2, bbox_mm:{x,y,z}, watertight}
 * @param {Object} process coeffs.processes[key]
 * @param {Object} params UI param values {infill?, layerHeight?, quality?}
 * @param {Object} [machine] selected machine profile
 */
export function surrogateTimeModel(features, process, params, machine) {
  const build = (machine && machine.build) || (process && process.build);
  if (!build) return null;
  const kind = build.kind || 'fdm';
  if (kind === 'resin') return resinTimeModel(features, process, params, build);
  if (kind === 'powder') return powderTimeModel(features, process, params, machine, build);
  return fdmTimeModel(features, process, params, build);
}
