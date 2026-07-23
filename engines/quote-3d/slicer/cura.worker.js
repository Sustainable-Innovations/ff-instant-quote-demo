// engines/quote-3d/slicer/cura.worker.js
// Deprecated placeholder. Browser Cura/Kiri slicing is intentionally disabled;
// real slicing now goes through the opt-in PrusaSlicer backend bridge.

self.onmessage = () => {
  self.postMessage({
    result: null,
    error: 'browser Cura/Kiri slicer disabled; use ?slicer=prusaslicer&slicerApi=<url>',
  });
};

