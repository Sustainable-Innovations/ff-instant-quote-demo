# FlexFactory quote engines — production integration guide

**Status:** target contract for integrating the demo engines with the implemented FlexFactory platform  
**Audience:** platform, marketplace, supplier-portal, pricing, security, and QA teams  
**Scope:** polymer additive manufacturing (FDM, SLA, SLS), laser/sheet cutting, and PCB fabrication

## 1. Integration outcome

The platform must own the quote lifecycle, identity, files, configuration versions, approvals, and outcomes. The existing browser engines remain useful as deterministic feature-extraction and pricing modules, but they are not a system of record.

The recommended production flow is:

```text
Client UI
  -> upload file to platform object storage
  -> create quote session with listing, supplier, selections, and file reference
  -> platform resolves an approved coefficient version
  -> process adapter extracts features and runs the engine kernel
  -> platform stores the immutable quote snapshot
  -> automatic quote OR manual-review task
  -> client accepts an unexpired quote
  -> platform creates order and preserves the accepted price/configuration
  -> supplier records job actuals after delivery
```

Use the proposed HTTP contract in [quote-api.openapi.yaml](quote-api.openapi.yaml). The field-level responsibilities and acceptance criteria are in [quotation-requirements.md](quotation-requirements.md).

## 2. What is implemented today

| Engine | Implemented inputs and analysis | Pricing kernel | Production caveat |
|---|---|---|---|
| Polymer AM | STL/STEP/STP; source units; volume, surface, bounding box, triangle count, mesh quality; FDM/SLA/SLS; material, quantity, lead, quality, machine; FDM infill | `computeAMQuote()` in `engines/quote-3d/quote.kernel.js`; machine selection; explainable complexity; physics fallback for all processes; optional PrusaSlicer for FDM | Real slicing is FDM-only. SLA and SLS are surrogate estimates. No platform quote ID, persistence, authenticated coefficients, or order handoff. |
| Laser / sheet cutting | DXF plus STL/STEP/STP; contour length, pierces, bounding box, area, inferred 3D thickness; material, thickness, quantity, edge quality, grain, lead, estimated nest yield | `computeLaserQuote()` in `engines/quote-laser/quote.kernel.js`; sheet allocation, cutting/gas, programming, handling, deburr, overhead, margin, minimum charge | Grain is captured by the UI but not used by the kernel. Nesting is approximate and must not be treated as a production nest. 3D input represents a cut flat part only; bending is not priced. |
| PCB fabrication | Gerber RS-274X, Excellon drill, ZIP, `.gbrjob`; board dimensions, layers, hole count/minimum hole; material, thickness, mask, finish, copper, feature class, via covering, gold fingers, quantity, lead | `computePCBQuote()` in `engines/quote-pcb/quote.kernel.js`; tooling, fabrication, per-board adders, electrical test, lead uplift, platform fee | Fabrication only—no BOM, placement, components, or assembly. The UI offers Aluminum, but material is not currently a pricing dimension. |
| FDM slicer service | Binary STL upload; machine/process/material/parameter payload; orientation trials; mesh analysis | FastAPI `/slice-jobs`, polling, and `/slice`; PrusaSlicer execution | Demo endpoint has open CORS, no authentication, in-memory jobs, and accepts client-supplied profiles. Production must resolve profiles server-side and enforce tenant quotas. |

Shared modules provide the canonical `QuoteResult`, coefficient loading, cost helpers, confidence/review rules, machine selection, complexity scoring, mesh analysis, and capture events. Coefficient fixtures live under `engines/coefficients/`.

## 3. Current demo boundary versus production boundary

| Concern | Current demo | Required production behavior |
|---|---|---|
| Embedding | Static cross-page iframe | Prefer platform-native UI calling the quote API. A transitional iframe may be used with the strict message contract below. |
| Host communication | `ffQuoteHeight` and legacy `ffPcbHeight` only; target origin is `*` | Quote state and actions must cross an authenticated API or an origin-validated message channel. |
| Quote persistence | Browser variables and local storage | Immutable database record with `quoteId`, tenant, client, listing, supplier, file, inputs, features, result, coefficient version, timestamps, status, and expiry. |
| Supplier configuration | Bundled JSON, optional `?coeffs=<url>`, and browser overrides | Versioned, validated, approved supplier configuration resolved by server-side IDs. Never trust rates sent by a client. |
| File handling | In-browser, except FDM slicer upload | Antivirus scan, content validation, object storage, checksum, access controls, retention, and deletion policy. |
| Review | UI warning only | Review task with owner, reason codes, SLA, decision, override audit, and revised/declined quote outcome. |
| Order handoff | Demo toast/modal | Transactional acceptance that locks the quote snapshot and creates an order once. |
| Learning loop | Local `quote_generated` queue | Server events for generated/accepted/rejected/expired/revised and supplier job actuals. |

## 4. Canonical domain model

### 4.1 Quote session

A quote session is the authoritative record for one uploaded manufacturing request. Minimum fields:

```json
{
  "quoteId": "q_01J...",
  "clientRequestId": "browser-generated-idempotency-key",
  "tenantId": "tenant_123",
  "clientId": "client_456",
  "listingId": "listing_789",
  "supplierId": "supplier_123",
  "process": "fdm",
  "fileId": "file_123",
  "status": "quoted",
  "selection": {},
  "features": {},
  "result": {},
  "coefficientsRef": "supplier:supplier_123@2026-07-22.1",
  "engineVersion": "iq-2026-07-22",
  "createdAt": "2026-07-22T12:00:00Z",
  "expiresAt": "2026-07-29T12:00:00Z"
}
```

Recommended status values are `created`, `uploading`, `analyzing`, `quoting`, `quoted`, `needs_review`, `revising`, `declined`, `failed`, `expired`, `accepted`, and `cancelled`. Status transitions must be server-controlled and recorded in an audit log.

### 4.2 Canonical quote result

The current kernels already converge on this shape, but their `shouldCost` basis is
not yet consistent: AM and laser return a per-unit basis, while PCB returns an
order subtotal. The production adapter must normalize both `shouldCost` (order)
and `shouldCostUnit` (unit); it must not copy the legacy field without an explicit
basis conversion.

```json
{
  "process": "fdm",
  "currency": "SAR",
  "shouldCost": 42.15,
  "shouldCostUnit": 21.075,
  "price": 55.80,
  "unitPrice": 27.90,
  "quantity": 2,
  "leadTimeDays": 7,
  "breakdown": [
    { "key": "material", "label": "Material (PLA)", "amount": 4.10, "note": "24.1 g" }
  ],
  "factors": {
    "complexity": 1.08,
    "leadMult": 1.0,
    "overheadPct": 0,
    "marginPct": 10,
    "minOrderApplied": false
  },
  "components": {},
  "features": {},
  "coefficientsRef": "supplier:supplier_123@2026-07-22.1",
  "confidence": 0.95,
  "needsReview": false,
  "reviewReasons": []
}
```

`shouldCost` is the total deterministic order cost before the final commercial
rules and `shouldCostUnit` is its per-unit equivalent. `price` is the total order
price, excluding tax and shipping unless the response explicitly states
otherwise. Monetary values must be stored as integer minor units in the platform
database even if the engine adapter uses decimal numbers internally.

### 4.3 Versioning rules

Every stored quote must pin all of the following:

- `engineVersion`: deployed adapter/kernel version.
- `contractVersion`: API/message schema version.
- `coefficientsRef`: immutable approved supplier coefficient set.
- `parserVersion` and, where used, `slicerVersion`.
- original client selection and normalized selection.
- extracted features and review reasons.

Changing any price-bearing field creates a new quote revision; it must not silently mutate an accepted or issued quote.

## 5. Engine adapter contract

Implement one server-side adapter per engine behind a common interface:

```ts
interface QuoteEngineAdapter {
  validate(request: QuoteRequest): ValidationIssue[];
  analyze(file: StoredFile, request: QuoteRequest): Promise<FeatureResult>;
  quote(features: object, selection: object, coefficients: object): Promise<QuoteResult>;
  explain(result: QuoteResult): ExplainabilityRecord;
}
```

Adapters may reuse the DOM-free JavaScript kernels directly. Browser-only parsers should be extracted into testable modules or replaced by server equivalents before they become authoritative. The adapter must validate input and coefficient schemas before calling a kernel and must reject non-finite or negative cost outputs.

### 5.1 AM adapter

Normalize geometry to millimetres before analysis. Resolve material and machine profiles by server-side ID. Machine selection must check both envelope and material compatibility. Use the PrusaSlicer service only for FDM and fall back to the documented physics model when it is unavailable; the fallback source must remain visible in `components.buildTimeSource` and may reduce confidence.

The adapter must preserve mesh-quality signals, complexity terms, selected machine, alternatives, build-time source, layer count, support/powder allocation, and slicer/orientation metadata. Oversized parts, incompatible materials, non-watertight meshes, low parser confidence, and high complexity route to review.

### 5.2 Laser adapter

For DXF, normalize units and reject or review unsupported entities rather than silently pricing incomplete geometry. The authoritative feature set includes cut length, pierces, net part area, bounding box, thickness, and parser warnings. For STL/STEP, the platform must confirm the model represents a constant-thickness cut part; bending, forming, welding, and machining require separate operations.

Nest yield is a supplier/planning parameter, not a normal client-controlled commercial input. A client override may be accepted only as an explicitly audited estimate. Grain direction must either alter feasible rotations/yield and price or be removed from the quote inputs until implemented.

### 5.3 PCB adapter

Validate Gerber/Excellon contents and record whether dimensions and stack data came from `.gbrjob`, geometry inference, or client override. Manual edits to detected fields must be captured. The current engine supports bare-board fabrication only.

Do not expose Aluminum as an instant-priced choice until material-specific coefficients and validation are implemented. Requests for PCBA, controlled impedance, blind/buried/microvias, special stackups, castellations, edge plating, unusual routing, or unsupported layer counts must route to review unless a priced capability is added.

## 6. Transitional iframe contract

The preferred integration is API-driven, but an iframe can be retained during migration. Replace wildcard messaging with an allowlisted parent origin supplied by configuration, validate `event.origin` and `event.source` on both sides, and include `contractVersion`, `quoteSessionId`, and `correlationId` in every message.

Host to engine:

```json
{
  "type": "ff.quote.init",
  "contractVersion": "1.0",
  "quoteSessionId": "q_01J...",
  "listingId": "listing_789",
  "supplierId": "supplier_123",
  "process": "fdm",
  "coefficientSetId": "coeff_123",
  "defaults": { "material": "pla", "quantity": 1 }
}
```

Engine to host:

| Message | Required payload |
|---|---|
| `ff.quote.ready` | engine/process capabilities and contract version |
| `ff.quote.height` | bounded numeric height |
| `ff.quote.progress` | state, progress, stage, optional ETA |
| `ff.quote.updated` | normalized request, canonical result, revision, checksum |
| `ff.quote.review_required` | reason codes and confidence |
| `ff.quote.accept_requested` | quote session and revision; host performs authenticated acceptance |
| `ff.quote.error` | stable code, safe message, retryable flag, correlation ID |

The host must never accept a browser-supplied price as authoritative. It sends the selection to the platform API and displays the stored server response.

## 7. Supplier coefficient lifecycle

1. Supplier edits a draft coefficient set in the provider portal.
2. The platform validates the process-specific schema, units, allowed ranges, and referential integrity.
3. A pricing approver reviews a change summary and sample-quote regression results.
4. Approval creates an immutable version and optional effective date.
5. Listings point to an approved version or an approved active alias.
6. Each quote snapshots the resolved version.
7. Rollback changes the active alias; it does not rewrite historical quotes.

The coefficient API must use authenticated IDs rather than `?coeffs=<arbitrary-url>`. Local-storage overrides are development-only and must be disabled in production.

## 8. Security and privacy requirements

- Authorize every quote, file, supplier, and coefficient read/write within tenant scope.
- Use pre-signed upload URLs with short expiry; scan files before processing.
- Enforce declared extension, MIME type, magic bytes, decompressed-size limits, ZIP entry limits, parser timeouts, and recursion limits.
- Store files encrypted, use least-privilege service identities, and define retention/deletion rules.
- Do not send supplier rates or full commercial coefficients to the client unless the business explicitly accepts that disclosure.
- Resolve machine, process, material, rate, margin, and review policy server-side. The slicing service must not trust these values from multipart form fields.
- Restrict CORS and iframe ancestors to approved platform origins.
- Rate-limit by tenant/client and isolate expensive slicing queues.
- Sanitize filenames and never render uploaded SVG/HTML as active content.
- Log configuration and manual price changes without storing unnecessary personal data.

## 9. Reliability and observability

Each request needs a correlation ID spanning upload, parser, slicer, kernel, review, and order creation. Record latency by stage, parser/slicer version, fallback use, review reason, coefficient version, and outcome. Recommended initial objectives:

- cached capability/config reads: p95 under 300 ms;
- non-sliced quote analysis: p95 under 5 s for supported files;
- FDM slicing: asynchronous, progress-visible, hard timeout at 180 s;
- quote acceptance: exactly once and p95 under 2 s;
- no silent fallback—fallback source is stored and displayed;
- failed processing never creates an order or authoritative price.

## 10. Delivery sequence

1. Implement the canonical quote/session database model and the proposed API.
2. Add authenticated file upload and immutable supplier coefficient versions.
3. Wrap the three DOM-free kernels in server adapters; keep the existing UI as a consumer.
4. Add result persistence, review tasks, quote revisions, expiry, and order acceptance.
5. Secure and scale the PrusaSlicer service; resolve profiles server-side.
6. Move capture events and job actuals to the platform data model.
7. Replace or harden the iframe bridge and remove duplicate embed logic from the two marketplace detail pages.
8. Calibrate coefficients from supplier actuals and add regression gates before activating a new version.

## 11. Definition of done

Integration is complete only when a supported request can be uploaded, quoted, reviewed when necessary, accepted, converted to one order, traced to immutable configuration and engine versions, and reconciled with supplier actuals. All unsupported or ambiguous requests must fail safely into a visible review path rather than return an apparently firm automatic price.
