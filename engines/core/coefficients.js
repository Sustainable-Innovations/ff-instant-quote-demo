// engines/core/coefficients.js
// Resolves a supplier coefficient set for an engine.
// Resolution order (roadmap §0.B):
//   1. host API           — ?coeffs=<url>   (the Phase-4 backend seam)
//   2. bundled default    — engines/coefficients/<process>.default.json
//   3. localStorage dev override (demo-mode only; clearly flagged)
//
// DOM-free apart from optional browser globals, which are feature-detected so the
// module imports cleanly in Node (the snapshot test passes coefficients directly).

export const deepClone = (o) => JSON.parse(JSON.stringify(o));

export function deepMerge(target, src) {
  if (!src) return target;
  for (const k of Object.keys(src)) {
    const v = src[k];
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      target[k] = deepMerge(target[k] && typeof target[k] === 'object' ? target[k] : {}, v);
    } else {
      target[k] = v;
    }
  }
  return target;
}

const hasWindow = typeof window !== 'undefined';
const hasLocalStorage = () => {
  try {
    return typeof localStorage !== 'undefined' && localStorage !== null;
  } catch {
    return false;
  }
};

/** Parse engine config from the current URL (browser only). */
export function readEngineConfig() {
  if (!hasWindow) return { embed: false, coeffsUrl: null, captureMode: null, process: null, slicer: null, slicerApi: null };
  const q = new URLSearchParams(location.search);
  const slicerApi = q.get('slicerApi');
  const slicer = slicerApi && (!q.get('slicer') || q.get('slicer') === 'cura')
    ? 'prusaslicer'
    : q.get('slicer');
  return {
    embed: q.has('embed'),
    coeffsUrl: q.get('coeffs'),
    captureMode: q.get('capture'),
    process: q.get('process'),
    slicer,
    slicerApi,
  };
}

function resolveCoeffsUrl(coeffsUrl, process) {
  // Full file → use as-is; otherwise treat as a base dir and append the filename.
  if (/\.json($|\?)/i.test(coeffsUrl)) return coeffsUrl;
  const sep = coeffsUrl.endsWith('/') ? '' : '/';
  return `${coeffsUrl}${sep}${process}.default.json`;
}

function bundledUrl(process) {
  return new URL(`../coefficients/${process}.default.json`, import.meta.url).href;
}

/**
 * @param {string} process  "fdm" | "pcb" | "laser" | ...
 * @param {Object} [opts]
 * @param {string} [opts.coeffsUrl]   host/supplier override (from ?coeffs=)
 * @param {Object} [opts.defaults]    inline JS fallback if fetch fails (offline-safe)
 * @param {string} [opts.storageKey]  localStorage key for demo dev overrides
 * @param {boolean}[opts.allowLocalOverride=true]
 * @returns {Promise<Object>} coefficient set with a non-enumerable `__ref` tag
 */
export async function loadCoefficients(process, opts = {}) {
  const { coeffsUrl, defaults, storageKey, allowLocalOverride = true } = opts;
  let coeffs = defaults ? deepClone(defaults) : {};
  let source = defaults ? 'inline-default' : 'empty';

  const url = coeffsUrl ? resolveCoeffsUrl(coeffsUrl, process) : bundledUrl(process);
  try {
    const res = await fetch(url, { cache: 'no-cache' });
    if (res && res.ok) {
      coeffs = deepMerge(deepClone(coeffs), await res.json());
      source = coeffsUrl ? 'host-api' : 'bundled-json';
    }
  } catch {
    // keep inline defaults; over file:// or offline this is expected
  }

  let demoOverride = false;
  if (allowLocalOverride && storageKey && hasLocalStorage()) {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        coeffs = deepMerge(coeffs, JSON.parse(raw));
        demoOverride = true;
      }
    } catch {
      /* ignore corrupt dev override */
    }
  }

  const version = coeffs.version || 'v1';
  const supplier = coeffs.supplier || 'default';
  Object.defineProperty(coeffs, '__ref', {
    value: `supplier:${supplier}@${version}${demoOverride ? '+local' : ''}`,
    enumerable: false,
  });
  Object.defineProperty(coeffs, '__source', { value: source, enumerable: false });
  return coeffs;
}

/** Stable coefficient reference string for capture/QuoteResult. */
export function coefficientsRef(coeffs) {
  return (coeffs && coeffs.__ref) || 'supplier:default@v1';
}
