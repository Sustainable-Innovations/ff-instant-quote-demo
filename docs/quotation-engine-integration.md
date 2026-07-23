# Quotation-engine integration

## Engine families

| Engine family | Process keys | Integration behavior | Repository location/status |
|---|---|---|---|
| Additive manufacturing | `fdm`, `sla`, `sls` | One integration contract. FDM uses the slicer-backed calculation; SLA and SLS use the same flow without invoking a slicer. | `engines/quote-3d/index.html` is the checked-in browser reference. It currently uses geometry-based estimates for all three processes; the production slicer adapter is not in this repository. |
| Laser cutting | `laser` | Separate 2D cutting quotation engine. | No laser engine is checked in. The existing laser listing (`J-7`) is fixed-price and is not connected to an instant-quote iframe. |
| PCB fabrication | `pcb` | Dedicated Gerber/NC-drill parsing and pricing flow. | `engines/quote-pcb/index.html`; currently embedded for `J-1` and `J-3`. |

## Marketplace integration points

1. **Listing configuration:** `app/client_data.jsx`
   - Set `instant: true` on the listing.
   - Set `quote: true`, `quoteEngine`, and `quoteProcess` in its `JOB_DETAILS` entry.
2. **Engine URL mapping:** `app/client_pages_job_detail.jsx`
   - `ENGINE_URLS` maps `quoteEngine` to the engine URL.
   - The marketplace embeds `ENGINE_URLS[quoteEngine] + '?embed=1&process=' + quoteProcess`.
3. **Legacy detail path:** `app/client_pages_detail.jsx`
   - Keep its `ENGINE_URLS` map aligned with the main job-detail component while this page remains in use.
4. **Engine implementation:** `engines/<engine>/index.html`
   - The checked-in engines are self-contained browser pages and support `?embed=1`.
   - The PCB engine reports its content height to `app/client_pages_job_detail.jsx` with `postMessage`.

## Adding or connecting an engine

- Add its URL under the same `quoteEngine` key in both `ENGINE_URLS` maps.
- Add or update the listing's `quoteEngine` and `quoteProcess` values in `app/client_data.jsx`.
- Make the engine accept `?embed=1`; it should also read `?process=<key>` when one engine serves multiple processes.
- Test the standalone URL and the embedded listing flow.

## Current integration gaps

- `engines/quote-3d/index.html` does not currently call a slicer and does not read the `process` query parameter; it starts with its default process.
- No laser-cutting engine URL or implementation exists in the checked-in code.
- Engine URLs are duplicated in two page components. Any new engine must be added to both until the map is centralized.
