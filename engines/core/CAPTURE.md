# Closed-loop capture — event contract

> For the host-backend team. The engines emit these events client-side via
> `engines/core/capture.js`. Today the transport is a stub (`localStorage` queue +
> `console`); at Phase 4 it switches to `httpBeacon` pointed at a host endpoint.
> **The schema below is frozen now so no outcome data is lost before the backend exists.**
> Without the `job_actuals` outcomes you can train a price *predictor* but never a
> trustworthy *costing* engine.

## Transport

`createCapture({ transport, endpoint, context })`:

- `noop` — discard (e.g. when embedded in a context that captures upstream).
- `localStorage` — **default**; appends to `ff_capture_queue_v1` (bounded to 200), and `console.debug`s each event.
- `httpBeacon` — `navigator.sendBeacon(endpoint, json)` (falls back to `fetch(keepalive)`). **Phase 4.**

Selected per embed with `?capture=noop|localStorage|httpBeacon`. `context` carries static fields (`listingId`, `supplierId`) merged into every event.

## Events

### `quote_generated` — emitted now, on every (debounced) recompute

| field | type | source |
|---|---|---|
| `event` | string | `"quote_generated"` |
| `ts` | ISO-8601 | stamped by capture.js |
| `sessionId` | uuid | per-page |
| `listingId` | string | embed context |
| `supplierId` | string | embed context (default `"default"`) |
| `process` | string | `fdm`/`sla`/`sls`/`cnc`/`pcb`/`laser` |
| `fileMeta` | `{name,type,bytes,hash}` | uploaded file (hash optional) |
| `parserConfidence` | 0..1 | ingestion layer |
| `features` | object | the same vector in `QuoteResult.features` |
| `humanEdits` | array | any override of an auto-detected field |
| `coefficientsRef` | string | e.g. `supplier:default@v1` |
| `shouldCost` | number | Layer-2 cost basis |
| `quotedPrice` | number | final price shown |
| `leadTimeDays` | number | |
| `confidence` | 0..1 | review gate |
| `needsReview` | bool | review gate |

### `quote_accepted` / `quote_rejected` — wired at Phase 4 (marketplace order flow)

`{ event, ts, sessionId, quoteId, listingId, accepted:bool, reason? }`. The host
links these back to the originating `quote_generated` by `sessionId` + `quoteId`.

### `job_actuals` — wired at Phase 4 (supplier/ops after completion)

The costing ground truth. **Fields defined now, filled by the backend later:**

`actualMachineTimeSec`, `setupTimeSec`, `laborTouchTimeSec`, `consumablesCost`,
`finishingLoadedCost`, `qcTimeSec`, `scrapReworkCost`, `capacitySnapshot`
(utilisation at quote time), `loadedCostTotal`.

## Host data model (Phase 4)

`quotes` (request + features + shouldCost + price + confidence) ·
`coefficients` (versioned, per supplier) · `outcomes` (accepted/rejected + actuals) ·
`files` (object storage). This dataset is the only path to ±10% accuracy and to any
future ML overlay — public datasets carry feature/manufacturability labels but no
real quote/cost labels.
