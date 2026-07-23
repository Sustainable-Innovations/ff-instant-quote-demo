// engines/core/capture.js
// Closed-loop data capture (roadmap §0.C). Every quote computation emits one
// structured event. The transport is a stub until the host backend exists — what
// matters today is that the CALL SITES and the SCHEMA are correct so no outcome
// data is lost. See CAPTURE.md for the full outcome-event contract.

const hasWindow = typeof window !== 'undefined';
const hasLocalStorage = () => {
  try {
    return typeof localStorage !== 'undefined' && localStorage !== null;
  } catch {
    return false;
  }
};

const QUEUE_KEY = 'ff_capture_queue_v1';

// A per-page session id. crypto.randomUUID where available, else a cheap fallback.
let _sessionId = null;
function sessionId() {
  if (_sessionId) return _sessionId;
  try {
    _sessionId = (globalThis.crypto && crypto.randomUUID && crypto.randomUUID()) || null;
  } catch {
    _sessionId = null;
  }
  if (!_sessionId) {
    _sessionId = 'sess-' + Math.random().toString(36).slice(2) + '-' + (hasWindow ? Date.now() : 0);
  }
  return _sessionId;
}

/**
 * Create a capture client.
 * @param {Object} [cfg]
 * @param {'noop'|'localStorage'|'httpBeacon'} [cfg.transport='localStorage']
 * @param {string} [cfg.endpoint]   required for httpBeacon (host backend URL)
 * @param {boolean}[cfg.console=true] also console.debug each event (dev visibility)
 * @param {Object} [cfg.context]    static fields merged into every event (listingId, supplierId…)
 */
export function createCapture(cfg = {}) {
  const transport = cfg.transport || 'localStorage';
  const logToConsole = cfg.console !== false;
  const context = cfg.context || {};

  function persistLocal(event) {
    if (!hasLocalStorage()) return;
    try {
      const q = JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]');
      q.push(event);
      // keep the queue bounded so a demo session can't blow the quota
      while (q.length > 200) q.shift();
      localStorage.setItem(QUEUE_KEY, JSON.stringify(q));
    } catch {
      /* quota / disabled storage — non-fatal */
    }
  }

  function beacon(event) {
    if (!cfg.endpoint || !hasWindow) return;
    try {
      const body = JSON.stringify(event);
      if (navigator.sendBeacon) {
        navigator.sendBeacon(cfg.endpoint, new Blob([body], { type: 'application/json' }));
      } else {
        fetch(cfg.endpoint, { method: 'POST', body, keepalive: true, headers: { 'Content-Type': 'application/json' } });
      }
    } catch {
      /* network failure must never break a quote */
    }
  }

  /**
   * Emit one event. `ts` is stamped here; callers pass the event name + payload.
   * @param {string} eventName e.g. "quote_generated"
   * @param {Object} payload
   */
  function emit(eventName, payload = {}) {
    const event = {
      event: eventName,
      ts: new Date().toISOString(),
      sessionId: sessionId(),
      ...context,
      ...payload,
    };
    if (logToConsole) {
      try {
        console.debug('[ff-capture]', eventName, event);
      } catch {
        /* ignore */
      }
    }
    if (transport === 'localStorage') persistLocal(event);
    else if (transport === 'httpBeacon') beacon(event);
    // 'noop' → nothing
    return event;
  }

  return { emit, transport, get sessionId() { return sessionId(); } };
}

/** Build the canonical `quote_generated` payload from a QuoteResult + file meta. */
export function quoteGeneratedEvent(quoteResult, extra = {}) {
  const q = quoteResult || {};
  return {
    process: q.process,
    fileMeta: extra.fileMeta || null,
    parserConfidence: extra.parserConfidence ?? null,
    features: q.features || {},
    humanEdits: extra.humanEdits || [],
    coefficientsRef: q.coefficientsRef,
    shouldCost: q.shouldCost,
    quotedPrice: q.price,
    leadTimeDays: q.leadTimeDays,
    confidence: q.confidence,
    needsReview: q.needsReview,
    ...extra.overrides,
  };
}

/** Read the queued events (demo/debug helper). */
export function readQueue() {
  if (!hasLocalStorage()) return [];
  try {
    return JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]');
  } catch {
    return [];
  }
}

/** Simple leading+trailing debounce so rapid recomputes emit once. */
export function debounce(fn, ms = 400) {
  let t = null;
  return function (...args) {
    if (t) clearTimeout(t);
    t = setTimeout(() => {
      t = null;
      fn.apply(this, args);
    }, ms);
  };
}
