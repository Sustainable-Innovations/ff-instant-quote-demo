# FlexFactory quotation-tool requirements

**Purpose:** source requirements for the platform backlog and the `quote_requirement` workbook  
**Sides:** Client (buyer), Service Provider (supplier), Platform  
**Coverage:** all fields and behavior found in the developed AM, laser, and PCB engines, plus the production controls needed to use their output safely

## Status legend

- **Implemented:** present in the demo engine or slicer service.
- **Partial:** present but not production-complete or not used consistently.
- **Required:** absent from the demo and required for platform integration.
- **Review-only:** capture the request, but do not automatically price it until an engine/capability supports it.

Priority uses **P0** for launch-blocking, **P1** for the first production iteration, and **P2** for later enhancement.

## 1. Common platform and lifecycle requirements

| ID | Side | Requirement | Current evidence / gap | Status | Priority | Acceptance criterion |
|---|---|---|---|---|---|---|
| QR-COM-001 | Client | Start a quote from a specific listing and process. | Listings map to `quoteEngine` and optional `quoteProcess`. | Partial | P0 | Stored quote contains tenant, client, listing, supplier, and normalized process IDs. |
| QR-COM-002 | Client | Upload supported manufacturing files with visible type and size rules. | Engines advertise up to 100 MB; slicer enforces 50 MB STL. Browser engines do not enforce one common limit. | Partial | P0 | Platform validates extension, MIME, magic bytes, compressed/uncompressed size, and process-specific limits before analysis. |
| QR-COM-003 | Client | See upload, analysis, slicing, quoting, review, and failure progress. | FDM slicer has queued/analyzing/slicing/scoring progress; other engines use local loading states. | Partial | P0 | Every quote exposes a server-owned status, stage, correlation ID, retryability, and progress where meaningful. |
| QR-COM-004 | Client | Review all auto-detected values and edit allowed fields. | PCB and laser expose detected values; capture supports `humanEdits` but UI does not populate it consistently. | Partial | P0 | Original detection, normalized value, edited value, editor, timestamp, and reason are stored. |
| QR-COM-005 | Client | See total, unit price, currency, quantity, lead time, breakdown, assumptions, and whether tax/shipping are included. | Kernels return the core values and breakdown; tax/shipping scope is not defined. | Partial | P0 | Issued quote explicitly states price scope, validity, tax, shipping, and all price-bearing assumptions. |
| QR-COM-006 | Client | Understand whether the quote is automatic, indicative, or requires supplier review. | `confidence`, `needsReview`, and reasons exist. | Implemented | P0 | UI displays quote class and safe reason text; a review-required quote cannot be accepted as firm. |
| QR-COM-007 | Client | Save/resume a quote and retain a stable quote ID. | No backend persistence or quote ID. | Required | P0 | Reloading or changing device retrieves the authorized stored session until expiry. |
| QR-COM-008 | Client | Accept an unexpired quote exactly once. | Request/match actions are demo toasts or lead capture. | Required | P0 | Acceptance is authenticated and idempotent, locks the revision, and creates one order. |
| QR-COM-009 | Client | Receive an explicit revised, declined, expired, or failed outcome. | Not integrated. | Required | P0 | Each terminal state has a timestamp, reason code, safe message, and allowed next action. |
| QR-COM-010 | Client | Request a human quote for unsupported requirements. | Manual quote UI exists outside the engines, but there is no shared handoff. | Partial | P0 | Unsupported fields/files create an RFQ/review task without losing uploaded files or entered requirements. |
| QR-COM-011 | Service Provider | Maintain process capabilities separately from price coefficients. | Capability and rate data are mixed in JSON. | Required | P0 | Provider can specify processes, materials, envelopes, file types, limits, finishes, tolerances, service area, and review rules independently of rates. |
| QR-COM-012 | Service Provider | Maintain draft, approved, active, retired, and effective-dated coefficient versions. | JSON has supplier/version but no workflow. | Partial | P0 | Only approved versions can price; every quote pins an immutable version; rollback preserves history. |
| QR-COM-013 | Service Provider | Preview coefficient changes against regression cases before approval. | Snapshot tests cover default coefficients only. | Partial | P1 | Portal shows old/new sample quotes and blocks activation outside configured tolerances without approval. |
| QR-COM-014 | Service Provider | Review exceptions with source file, inputs, features, reasons, and proposed price. | Engine only flags locally. | Required | P0 | Review queue supports assign, request information, override, revise, approve, decline, and audit history. |
| QR-COM-015 | Service Provider | Override a quote without changing the global coefficient set. | AM has process complexity override in config, not quote-level approval. | Required | P0 | Quote revision records old/new value, reason, approver, and affected price components. |
| QR-COM-016 | Service Provider | Record actual setup, machine, labor, consumable, QC, scrap/rework, and loaded costs after delivery. | Capture contract defines `job_actuals`; no backend. | Partial | P1 | Actuals link to accepted quote/order, have units, validation, author, timestamp, and completeness state. |
| QR-COM-017 | Platform | Use one canonical `QuoteResult` across engines. | `makeQuoteResult()` is implemented, but `shouldCost` is per-unit in AM/laser and an order subtotal in PCB. | Partial | P0 | Adapter normalizes `shouldCost` (order) and `shouldCostUnit` (unit), validates required fields, and rejects NaN, infinity, negative prices, invalid confidence, and inconsistent breakdown bases. |
| QR-COM-018 | Platform | Store engine, parser, slicer, contract, and coefficient versions. | Only `coefficientsRef` is in the current result. | Partial | P0 | Every issued revision is reproducible from stored versions, normalized inputs, and features. |
| QR-COM-019 | Platform | Make quote creation idempotent and acceptance exactly once. | Not implemented. | Required | P0 | Replayed create/accept requests return the existing resource and never duplicate orders or charges. |
| QR-COM-020 | Platform | Enforce tenant and role authorization on quotes, files, suppliers, and coefficients. | Static demo has none. | Required | P0 | Cross-tenant access tests fail; provider and client views expose only authorized fields. |
| QR-COM-021 | Platform | Scan and isolate uploaded files. | No malware/content scanning. | Required | P0 | Files remain unavailable to parsers until clean; unsafe/invalid archives are quarantined with safe errors. |
| QR-COM-022 | Platform | Avoid disclosing private provider rates and margin data to clients. | Coefficients and full breakdown run in the browser. | Required | P0 | Client response contains approved explanation fields only; commercial coefficients remain server-side. |
| QR-COM-023 | Platform | Route unsupported, low-confidence, oversized, ambiguous, or high-uncertainty work to review. | Core review primitive exists. | Partial | P0 | Stable reason codes drive workflow; automatic acceptance is blocked for review-required revisions. |
| QR-COM-024 | Platform | Capture generated, revised, accepted, rejected, expired, failed, and actual-cost events. | Only `quote_generated` is emitted locally; other contracts are documented. | Partial | P1 | Events are durable, deduplicated, tenant-scoped, and traceable to quote revision and order. |
| QR-COM-025 | Platform | Define quote validity, currency, tax, shipping, and rounding. | Currency is SAR; expiry/tax/shipping/rounding policy are absent. | Required | P0 | Policy is explicit and test-covered; database money uses integer minor units. |
| QR-COM-026 | Platform | Validate provider coefficient schemas and units. | `_schema.json` is permissive and no runtime validation is evident. | Partial | P0 | Process-specific schema rejects missing, unknown critical, out-of-range, or unit-inconsistent values before approval. |
| QR-COM-027 | Platform | Provide correlated observability across upload, parsing, slicing, pricing, review, and order creation. | Local console capture only. | Required | P1 | Metrics/logs contain correlation ID and versions without exposing sensitive file content or coefficients. |
| QR-COM-028 | Platform | Define retention and deletion for files, quotes, events, and personal data. | Not defined. | Required | P0 | Retention is configurable by record type and legal status; authorized deletion is auditable. |
| QR-COM-029 | Platform | Use a secure integration boundary. | Iframes send height to `*`; parent validates neither origin nor source. | Required | P0 | Production uses API results, or both iframe parties enforce an allowlisted origin, source window, schema version, and bounded payload. |
| QR-COM-030 | Platform | Prevent duplicate integration logic. | Two marketplace detail pages independently build URLs and listen for height. | Required | P1 | A single quote-integration component owns engine routing, API/messages, errors, height, and analytics. |

## 2. Polymer AM — client requirements

| ID | Requirement | Current engine coverage | Status | Priority | Acceptance criterion |
|---|---|---|---|---|---|
| QR-AM-C-001 | Upload STL, STEP, or STP. | Supported; up to 100 MB is advertised. | Implemented | P0 | File is normalized, scanned, parsed, hashed, and linked to the quote. |
| QR-AM-C-002 | Confirm source units: mm, cm, or in. | Supported; defaults to mm for each file. | Implemented | P0 | Selected units are stored; normalized millimetre geometry is shown for confirmation. |
| QR-AM-C-003 | Select process FDM, SLA, or SLS. | Supported; listing can preset `process`. | Implemented | P0 | Only supplier-supported processes are offered and the normalized process is stored. |
| QR-AM-C-004 | Select a compatible material. | FDM: PLA, PETG, ABS, ASA, TPU, Nylon 12; SLA: standard/tough resin; SLS: Nylon 12. | Implemented | P0 | Options come from provider capability; incompatible process/material combinations are rejected. |
| QR-AM-C-005 | Set quantity from 1 to 500. | Kernel clamps to 1–500. | Implemented | P0 | UI/API use the same bounds and return a validation error instead of silently changing invalid input. |
| QR-AM-C-006 | Choose standard or express lead. | Supported; defaults map to 7/3 days. | Implemented | P0 | Available lead options and capacity dates come from the selected provider. |
| QR-AM-C-007 | Choose draft, standard, or fine quality. | Supported through layer-height presets. | Implemented | P0 | Preset, resulting layer height, and process are stored in the normalized selection. |
| QR-AM-C-008 | Set FDM infill. | Supported, 10–100% in 5% steps; default 20%. | Implemented | P0 | Infill is present only for FDM and affects material/time according to the pinned model. |
| QR-AM-C-009 | Select/override a feasible machine when allowed. | Automatic cheapest feasible machine plus optional override. | Partial | P1 | Client sees only provider-approved choices; infeasible overrides are rejected and machine selection is server-authoritative. |
| QR-AM-C-010 | Review geometry properties and mesh warnings. | Volume, surface, dimensions, triangles, weight, watertightness, and quality risks are computed. | Implemented | P0 | Displayed values match stored features; warnings have stable codes and review impact. |
| QR-AM-C-011 | Specify tolerance, surface finish, color, orientation-critical faces, inserts, threads, supports/removal expectations, and inspection. | Not priced or captured as structured production inputs. | Required / Review-only | P0 | Fields are stored; unsupported combinations route to supplier review before a firm quote. |
| QR-AM-C-012 | Upload drawings/notes in addition to the model. | Not integrated in engine. | Required | P1 | Supplementary files are linked, scanned, versioned, and visible to reviewer and order. |

## 3. Polymer AM — service-provider requirements

| ID | Provider configuration / operation | Engine field or behavior | Status | Priority | Acceptance criterion |
|---|---|---|---|---|---|
| QR-AM-P-001 | Supported AM processes and display names. | `processes.fdm/sla/sls`. | Implemented | P0 | Provider can activate/deactivate per listing without editing code. |
| QR-AM-P-002 | Material name, density, effective SAR/g, and compatible processes. | `materials.*.{name,density,pricePerG,processes}`. | Implemented | P0 | Units and positive ranges validate; material versions are pinned to quotes. |
| QR-AM-P-003 | Machine ID/name, hourly rate, build envelope, materials, quality indicator, and build profile. | `processes.*.machines[]`. | Implemented | P0 | IDs are unique; envelope/material feasibility is regression-tested. |
| QR-AM-P-004 | FDM volumetric flow, layer overhead, support fraction, and post-processing cost. | Machine/process `build` fields. | Implemented | P0 | Provider UI labels every unit and produces the canonical JSON shape. |
| QR-AM-P-005 | SLA layer exposure, dead time, bottom layers/exposure, support fraction, trace factor, and post-processing. | Resin `build` profile. | Implemented | P0 | Sample parts demonstrate height/layer sensitivity and store model source. |
| QR-AM-P-006 | SLS chamber, layer time/height, packing density, refresh fraction, and post-processing. | Powder `build` profile. | Implemented | P0 | Quote exposes occupancy and powder allocation; out-of-range values are blocked. |
| QR-AM-P-007 | Setup fee, overhead, margin, minimum order, and learning rate. | Process/general fields. | Implemented | P0 | Changes pass price regression tests and require approval. |
| QR-AM-P-008 | Standard/express lead days and conversion multipliers. | `general.leadDays` and `leadMultipliers`. | Implemented | P0 | Rush uplift does not apply to defined pass-through material cost. |
| QR-AM-P-009 | Quality presets and layer-height limits/defaults; FDM infill limits/default. | `processes.*.params`. | Implemented | P0 | Defaults are valid for each machine/process and consistent with UI/API validation. |
| QR-AM-P-010 | Explainable complexity model weights, cap, and review threshold. | `general.complexityModel`; optional supplier override. | Implemented | P1 | Terms and override are stored; activation is tested against a geometry suite. |
| QR-AM-P-011 | Parser-confidence threshold and machine envelope review rules. | `parserConfidenceFloor`; selected envelope. | Implemented | P0 | Threshold breach produces stable review code and blocks firm acceptance. |
| QR-AM-P-012 | Slicer capability, profile ownership, concurrency, timeout, and fallback policy. | PrusaSlicer service is FDM-only; one worker/default queue in memory. | Partial | P0 | Server resolves approved profile IDs, authenticates requests, applies quotas, persists/recovers job state, and records fallback. |
| QR-AM-P-013 | Capacity-aware lead time and temporary machine availability. | Not in engine. | Required | P1 | Provider availability can disable machines or revise lead dates without rewriting historic coefficients. |
| QR-AM-P-014 | Manufacturability rules for minimum wall, overhang/support, trapped volume/powder, orientation, and dimensional limits. | Advisory mesh risks only. | Partial | P1 | Rules are provider-configurable with warn/review/reject actions and test cases. |
| QR-AM-P-015 | Actual machine, build time, material/support use, setup, labor, failures, and rework. | Capture schema anticipates actuals. | Required | P1 | Provider completes actuals against order; variances are calculated against quote components. |

## 4. Laser / sheet cutting — client requirements

| ID | Requirement | Current engine coverage | Status | Priority | Acceptance criterion |
|---|---|---|---|---|---|
| QR-LAS-C-001 | Upload ASCII DXF, STL, STEP, or STP. | Supported; binary DXF rejected with re-export guidance. | Implemented | P0 | Platform records parser warnings and does not silently ignore unsupported price-bearing geometry. |
| QR-LAS-C-002 | Confirm drawing/model units. | DXF parser does not expose a client units control. | Required | P0 | Units are detected where reliable or explicitly confirmed; normalized mm dimensions are shown. |
| QR-LAS-C-003 | Select material. | Mild steel, stainless 304, and aluminum 5052 defaults. | Implemented | P0 | Options and grades come from provider capability. |
| QR-LAS-C-004 | Select supported sheet thickness. | Material-specific thickness tables. 3D files infer nearest thickness. | Implemented | P0 | Detected and selected thickness are both stored; non-uniform thickness routes to review. |
| QR-LAS-C-005 | Set quantity from 1 to 100,000. | Kernel clamps this range; UI defaults from tier map. | Implemented | P0 | UI/API validation matches and does not silently clamp invalid values. |
| QR-LAS-C-006 | Select standard/fine edge quality. | Supported and affects speed and multiplier. | Implemented | P0 | Selection and resulting speed/multiplier version are stored. |
| QR-LAS-C-007 | Specify grain direction. | UI supports any/with grain; kernel ignores it. | Partial | P0 | Grain either constrains rotations/yield and price or forces review; it must not be cosmetic. |
| QR-LAS-C-008 | Select standard/express lead. | Supported; defaults 7/3 days. | Implemented | P0 | Provider availability validates offered lead. |
| QR-LAS-C-009 | Review cut length, pierces, bounds, area, thickness, parser confidence, and warnings. | Implemented from contours/3D metrics. | Implemented | P0 | Display equals stored features; ignored/approximated entities are visible. |
| QR-LAS-C-010 | Provide nest-yield assumption only when authorized. | UI allows client editing from 20–95%. | Partial | P0 | Normal clients cannot set the authoritative provider yield; any override is labelled estimate and audited. |
| QR-LAS-C-011 | Specify cut tolerances, hole tolerances, burr direction, deburr level, surface protection, finish/coating, marking, inspection, and certificates. | Only edge quality and basic deburr cost exist. | Required / Review-only | P0 | Structured fields are retained and unsupported combinations route to review. |
| QR-LAS-C-012 | Request bending/forming/welding or machining as separate operations. | 3D inputs are reduced to a cut profile; downstream operations are not priced. | Review-only | P0 | Client is clearly told cutting-only scope; additional operations create manual routing. |

## 5. Laser / sheet cutting — service-provider requirements

| ID | Provider configuration / operation | Engine field or behavior | Status | Priority | Acceptance criterion |
|---|---|---|---|---|---|
| QR-LAS-P-001 | Machine hourly rate and programming/setup fee. | `rates.machineRatePerHour`, `programmingFee`. | Implemented | P0 | Units, non-negative ranges, approval, and regression checks exist. |
| QR-LAS-P-002 | Material grade, density, assist gas, gas cost/minute, and supported thicknesses. | `materials.*`. | Implemented | P0 | Tables are complete for every enabled thickness. |
| QR-LAS-P-003 | Sheet cost/m², cut speed, and pierce seconds by material and thickness. | Material maps. | Implemented | P0 | Missing table cells prevent activation; interpolation/snap policy is documented. |
| QR-LAS-P-004 | Edge-quality speed and price multipliers. | `edgeQuality.*`. | Implemented | P0 | Option can be mapped to capability and stored quote. |
| QR-LAS-P-005 | Default/allowed nest yield and true-nest policy. | `nest.defaultYield`; fast/refine estimator. | Partial | P0 | Provider controls bounds; production nest revision is distinguishable from estimate. |
| QR-LAS-P-006 | Unload/sort and deburr rates plus labor learning. | Rate fields exist. | Implemented | P0 | Labor rates and learning affect only the intended components. |
| QR-LAS-P-007 | Overhead, margin, minimum charge, lead multiplier, and lead days. | Implemented. | Implemented | P0 | Price reconciliation tests prove minimum and rush behavior. |
| QR-LAS-P-008 | Maximum fast-quote area and parser confidence floor. | Review fields exist. | Implemented | P0 | Thresholds generate review codes and block firm acceptance. |
| QR-LAS-P-009 | Supported DXF entities/layers and handling of open/duplicate/overlapping contours. | Parser supports common entities and warnings but does not fully validate manufacturability. | Partial | P0 | Provider policy defines reject/review behavior and no ignored geometry can silently lower price. |
| QR-LAS-P-010 | Grain-aware nesting and stock sheet sizes. | Not in kernel. | Required | P1 | Allowed rotations and stock dimensions affect yield, feasibility, and explanation. |
| QR-LAS-P-011 | Minimum feature/hole, kerf, common-line cutting, heat/warp, and part-spacing rules. | Not implemented. | Required | P1 | Rules are material/thickness/machine specific and produce review/reject reasons. |
| QR-LAS-P-012 | Record actual sheet allocation, cut/pierce time, gas, programming, labor, scrap, and rework. | Not wired. | Required | P1 | Actuals reconcile to quote components and coefficient calibration reports. |

## 6. PCB fabrication — client requirements

| ID | Requirement | Current engine coverage | Status | Priority | Acceptance criterion |
|---|---|---|---|---|---|
| QR-PCB-C-001 | Upload ZIP or individual Gerber RS-274X and Excellon drill files. | Supported extensions include Gerber/drill/job-file patterns; up to 100 MB advertised. | Implemented | P0 | Archive is scanned, bounded, and validated for a coherent fabrication set. |
| QR-PCB-C-002 | Review auto-detected width, height, copper layers, holes, minimum hole, thickness, material, and detection source. | `.gbrjob` and board geometry detection exist; holes parsed from drill. | Implemented | P0 | Original values, confidence/source, and overrides are stored. |
| QR-PCB-C-003 | Select base material. | UI offers FR-4 and Aluminum; kernel does not use material. | Partial | P0 | Either implement material-specific pricing/capability or route Aluminum to review and remove it from instant price. |
| QR-PCB-C-004 | Select 1, 2, 4, or 6 copper layers. | Supported; detected count snaps to available values. | Implemented | P0 | Unsupported counts never silently snap without client confirmation; they route to review. |
| QR-PCB-C-005 | Confirm board dimensions in mm. | Supported and price-bearing. | Implemented | P0 | Positive dimensions reconcile with parsed outline and area thresholds. |
| QR-PCB-C-006 | Select supported quantity. | UI uses 5, 10, 25, 50, 100, or 200 from coefficient keys. | Implemented | P0 | Available quantities are provider/listing capability; API handles exact normalized quantity. |
| QR-PCB-C-007 | Select board thickness. | 0.6, 0.8, 1.0, 1.2, 1.6, or 2.0 mm. | Implemented | P0 | Option is valid for material/layer stack and stored. |
| QR-PCB-C-008 | Select solder-mask color. | Green, red, yellow, blue, white, black, purple. | Implemented | P0 | Provider-enabled colors and price adders are versioned. |
| QR-PCB-C-009 | Select surface finish. | Lead-free HASL, ENIG, OSP. | Implemented | P0 | Provider capability and price adder validate. |
| QR-PCB-C-010 | Select copper weight. | 1, 2, or 3 oz. | Implemented | P0 | Option is checked against layer count/stack capability. |
| QR-PCB-C-011 | Select minimum trace/space class. | 6/6, 5/5, 4/4, 3.5/3.5 mil. | Implemented | P0 | Parsed design rules are checked where possible; selection and actual minimum are retained. |
| QR-PCB-C-012 | Select via covering. | Tented, untented, plugged, POFV. | Implemented | P0 | Capability/adder is validated and stored. |
| QR-PCB-C-013 | Indicate gold fingers. | Yes/no supported. | Implemented | P0 | Presence is verified or confirmed; geometry/spec details route to review where needed. |
| QR-PCB-C-014 | Select standard 5–7 day, batch 48 h, or express 24 h. | Supported. | Implemented | P0 | Provider capacity confirms availability; lead terms are explicit. |
| QR-PCB-C-015 | Specify controlled impedance, stackup, dielectric/overall tolerances, IPC class, Tg, RoHS/UL, panelization, route/V-score, edge plating/castellations, blind/buried/microvias, countersinks, and electrical-test requirements. | Not implemented beyond flying-probe fee. | Required / Review-only | P0 | Structured options are captured and any unsupported value routes to review. |
| QR-PCB-C-016 | Request PCBA with BOM, centroid/placement, component sourcing, assembly sides, stencil, programming, and functional test. | Not implemented; kernel explicitly covers bare-board fabrication only. | Review-only | P0 | Product UI never labels the automatic result as PCBA; assembly request enters a separate reviewed workflow. |
| QR-PCB-C-017 | Upload fabrication drawing and readme/notes. | Documentation files are ignored by renderer and not stored by a platform workflow. | Required | P1 | Supplemental documents are scanned, linked, and visible during review/order. |

## 7. PCB fabrication — service-provider requirements

| ID | Provider configuration / operation | Engine field or behavior | Status | Priority | Acceptance criterion |
|---|---|---|---|---|---|
| QR-PCB-P-001 | Setup, base-board, and area rates by layer count. | `layer.*.{setup,board,area}`. | Implemented | P0 | Every enabled layer count has complete non-negative rates. |
| QR-PCB-P-002 | Quantity/panelization factors. | `qty` factor map. | Implemented | P0 | Factors apply only to defined per-board costs and pass regression checks. |
| QR-PCB-P-003 | Finish, copper, mask, thickness, feature-class, via, gold-finger, and drill rates. | Corresponding coefficient maps/scalars. | Implemented | P0 | Each client-visible option maps to a provider capability and approved coefficient. |
| QR-PCB-P-004 | Electrical-test fee and method. | Fixed flying-probe fee. | Partial | P0 | Provider defines test method applicability, fee basis, and alternatives by quantity/design. |
| QR-PCB-P-005 | Platform/commercial percentage and lead multipliers/days. | `platformPct`, `lead`, `leadDays`. | Implemented | P0 | Commercial ownership is explicit; changes are approved and historic quotes remain pinned. |
| QR-PCB-P-006 | Parser-confidence floor and maximum instant-quote area. | Review configuration exists. | Implemented | P0 | Low-confidence or oversized boards route to review. |
| QR-PCB-P-007 | Material-specific and stackup-specific pricing. | Missing; client material is ignored by kernel. | Required | P0 | FR-4/Aluminum and any stackup offered have distinct validated capabilities and rates. |
| QR-PCB-P-008 | Drill and via capability limits, annular ring, aspect ratio, and special-via handling. | Hole count/minimum hole is detected; only a per-hole adder exists. | Partial | P0 | Limits produce explicit automatic/review/reject outcomes. |
| QR-PCB-P-009 | Manufacturing rule validation for outline, copper, solder mask, silkscreen, drill, and layer set. | Rendering/detection is not a complete DFM check. | Required | P1 | Automated checks produce stable issues with severity and source layer/location. |
| QR-PCB-P-010 | Panelization, routing/V-score, impedance, certificates, special processes, and PCBA capability. | Not represented. | Required / Review-only | P1 | Provider capability drives structured options and review routing. |
| QR-PCB-P-011 | Record actual panel yield, fabrication/test cost, scrap/rework, expedite cost, and delivery performance. | Not wired. | Required | P1 | Actuals reconcile to quote and support provider calibration. |

## 8. Required provider coefficient data dictionary

### AM

| Object | Required fields and units |
|---|---|
| Header | supplier ID, immutable version, process family, currency |
| Material | stable key, name, density `g/cm³`, effective material rate `SAR/g`, compatible process IDs |
| Process | name, setup `SAR/order`, overhead `%`, margin `%`, base layer height `mm`, optional complexity override |
| Machine | stable ID/name, rate `SAR/hour`, envelope `mm x/y/z`, compatible materials, quality/capability state |
| FDM build | volumetric flow `mm³/s`, layer overhead `s/layer`, support fraction, post-processing `SAR/unit` |
| SLA build | layer time `s`, dead time `s`, bottom layers, bottom exposure multiplier, support fraction, trace factor, post-processing `SAR/unit` |
| SLS build | chamber `mm x/y/z`, layer time `s`, layer height `mm`, packing density, powder refresh fraction, post-processing `SAR/unit` |
| Commercial/review | lead multipliers/days, minimum order `SAR`, learning rate, parser floor, complexity model/threshold |

### Laser

| Object | Required fields and units |
|---|---|
| Header | supplier ID, immutable version, process, currency |
| General rates | machine `SAR/hour`, programming `SAR/order`, unload/sort `SAR/part`, deburr `SAR/m cut`, learning rate, overhead/margin `%`, minimum charge `SAR` |
| Material | stable key/name, grade, density `g/cm³`, gas type and `SAR/min`, supported thicknesses `mm` |
| Thickness table | sheet `SAR/m²`, cut speed `mm/min`, pierce time `s` for every material/thickness |
| Nest/quality | default and allowed yield, stock sheets, allowed rotations/grain rules, edge-quality speed/price multipliers |
| Commercial/review | lead multipliers/days, parser floor, maximum auto-quote area `cm²`, manufacturability limits |

### PCB fabrication

| Object | Required fields and units |
|---|---|
| Header | supplier ID, immutable version, process, currency |
| Layer rates | layer count, setup `SAR/order`, base board `SAR/board`, area `SAR/cm²` |
| Quantity | supported quantities and per-board panel factor |
| Option adders | finish and copper `SAR/cm²`; mask/thickness/feature/via/gold/drilling using explicitly documented bases |
| Test/commercial | test method/fee, platform/commercial `%`, lead multipliers and days |
| Capability/review | materials/stackups, dimensions, layers, drill/via rules, feature limits, special processes, parser floor, maximum auto-quote area `cm²` |

## 9. Workbook mapping

When updating `quote_requirement`, keep one row per ID above and, where the workbook supports them, map fields as follows:

| Workbook field | Source here |
|---|---|
| Requirement ID | `QR-*` ID |
| Module / Engine | Common, AM, Laser, or PCB |
| User side / Owner | Client, Service Provider, or Platform |
| Requirement | Requirement or provider configuration column |
| Current implementation | Current evidence / engine coverage |
| Status | Implemented, Partial, Required, or Review-only |
| Priority | P0, P1, or P2 |
| Acceptance criteria | Acceptance criterion column |
| Source | `docs/quotation-requirements.md` plus the referenced engine/coefficient file |

Do not collapse client and service-provider requirements into one row: their permissions, data visibility, and acceptance criteria are different even when they refer to the same option.
