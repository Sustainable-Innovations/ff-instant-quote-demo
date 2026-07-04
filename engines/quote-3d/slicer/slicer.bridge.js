// engines/quote-3d/slicer/slicer.bridge.js
// Remote PrusaSlicer bridge. The browser stays no-build/static; native slicing
// happens in an opt-in backend selected by ?slicer=prusaslicer&slicerApi=<url>.

const DEFAULT_BUDGET_MS = 180000;

function joinUrl(base, path) {
  return `${String(base || '').replace(/\/+$/, '')}${path}`;
}

function toErrorMessage(err) {
  if (!err) return 'failed';
  if (err.name === 'AbortError') return 'timeout';
  return err.message || String(err);
}

function normalizeSliceResponse(data) {
  if (!data || data.ok === false) return { error: data && data.error ? String(data.error) : 'slicer failed' };
  const timeSec = Number(data.timeSec);
  if (!Number.isFinite(timeSec) || timeSec <= 0) return { error: 'empty slicer time' };
  const out = {
    timeSec,
    source: 'sliced',
    slicer: data.slicer || 'prusaslicer',
    warnings: Array.isArray(data.warnings) ? data.warnings : [],
    selectedOrientation: data.selectedOrientation || null,
    trials: Array.isArray(data.trials) ? data.trials : [],
    mesh: data.mesh || null,
    orientationScore: data.orientationScore || null,
    analysis: data.analysis || null,
  };
  const gramsModel = Number(data.gramsModel);
  const gramsSupport = Number(data.gramsSupport);
  if (Number.isFinite(gramsModel) && gramsModel > 0) out.gramsModel = gramsModel;
  if (Number.isFinite(gramsSupport) && gramsSupport > 0) out.gramsSupport = gramsSupport;
  return out;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function readJson(res) {
  const text = await res.text();
  try { return text ? JSON.parse(text) : null; } catch { return null; }
}

/**
 * @param {ArrayBuffer} meshBuffer Binary STL buffer, including STEP meshes serialized by the UI
 * @param {Object} machineProfile Selected machine profile
 * @param {Object} params Process parameter values
 * @param {{apiUrl?:string,budgetMs?:number,onProgress?:Function,processProfile?:Object,materialProfile?:Object}} [opts]
 * @returns {Promise<{timeSec:number, gramsModel:number, gramsSupport:number, source:string, slicer?:string, error?:string}|null>}
 */
export async function sliceMesh(meshBuffer, machineProfile, params, opts = {}) {
  if (!meshBuffer || machineProfile?.processKey !== 'fdm') return null;
  if (!opts.apiUrl) return null;
  if (typeof fetch !== 'function' || typeof FormData === 'undefined' || typeof Blob === 'undefined') {
    return { error: 'browser upload APIs unavailable' };
  }

  const budgetMs = Math.max(1000, opts.budgetMs || DEFAULT_BUDGET_MS);
  const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
  const timer = controller ? setTimeout(() => controller.abort(), budgetMs) : null;

  try {
    opts.onProgress?.('uploading');
    const form = new FormData();
    form.append('file', new Blob([meshBuffer], { type: 'model/stl' }), 'mesh.stl');
    form.append('machine', JSON.stringify(machineProfile || {}));
    form.append('process', JSON.stringify(opts.processProfile || { key: machineProfile.processKey || 'fdm' }));
    form.append('material', JSON.stringify(opts.materialProfile || {}));
    form.append('params', JSON.stringify({
      ...(params || {}),
      optimizeOrientation: opts.optimizeOrientation !== false,
    }));

    opts.onProgress?.({ stage: 'queued', progress: 0.03 });
    const res = await fetch(joinUrl(opts.apiUrl, '/slice-jobs'), {
      method: 'POST',
      body: form,
      signal: controller ? controller.signal : undefined,
    });
    const data = await readJson(res);
    if (!res.ok) {
      return { error: (data && (data.error || data.detail)) || `HTTP ${res.status}` };
    }
    const statusUrl = data && data.statusUrl;
    if (!statusUrl) return { error: 'missing slicer job status URL' };

    while (true) {
      await sleep(1000);
      const statusRes = await fetch(joinUrl(opts.apiUrl, statusUrl), {
        signal: controller ? controller.signal : undefined,
      });
      const status = await readJson(statusRes);
      if (!statusRes.ok) return { error: (status && (status.error || status.detail)) || `HTTP ${statusRes.status}` };
      opts.onProgress?.({
        stage: status.stage || status.state || 'slicing',
        progress: Number.isFinite(Number(status.progress)) ? Number(status.progress) : 0,
        elapsedSec: status.elapsedSec,
        etaSec: status.etaSec,
        currentTrial: status.currentTrial,
        totalTrials: status.totalTrials,
        state: status.state,
      });
      if (status.state === 'succeeded') return normalizeSliceResponse(status.result);
      if (status.state === 'failed' || status.state === 'expired') return { error: status.error || status.stage || status.state };
    }
  } catch (err) {
    return { error: toErrorMessage(err) };
  } finally {
    if (timer) clearTimeout(timer);
  }
}
