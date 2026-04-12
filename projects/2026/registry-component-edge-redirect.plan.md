---
name: Registry component edge redirect
overview:
  'Add a Netlify Edge Function for `/ecosystem/registry/<non-empty-suffix>` (any
  extra path segment, including `index.html|md|json`): probe with an internal
  `fetch` plus probe guard header; return the subresponse for 2xx/3xx/5xx; on
  4xx emit a GA event and redirect to `/ecosystem/registry/`; then remove the
  Hugo-generated Netlify redirect for the old catch-all.'
todos:
  - id: implement-handler
    content:
      'Add `registry-component-redirect` handler: path gate, internal fetch with
      loop-guard header, status branching, GA on 4xx, 301/302 to
      `/ecosystem/registry/` + preserved query'
    status: completed
  - id: wire-netlify-toml
    content:
      'Register in `netlify.toml` with `path = "/ecosystem/registry/*"`
      (URLPattern glob), above `markdown-negotiation`'
    status: completed
  - id: ga-integration
    content:
      'Reuse existing GA4 edge helpers (`enqueueAssetFetchEvent` / headers from
      `lib/ga4-asset-fetch.ts`) with a clear event name or params for
      registry-component 4xx'
    status: completed
  - id: remove-hugo-redirect
    content:
      'Remove `redirects` workaround from
      `content/en/ecosystem/registry/_index.md` (rebuild updates
      `public/_redirects`)'
    status: completed
  - id: unit-tests
    content:
      'Add `registry-component-redirect/index.test.ts` with `node:test`, same
      conventions as other edge functions; follow test-writing guidance in
      `content/en/site/testing/_index.md` (DRY, shared helpers, assertion
      style); no package.json script changes (`npm run test:edge-functions` glob
      picks up `**/*.test.ts`)'
    status: completed
  - id: live-checks
    content:
      'Live-check suite: bogus slug → redirect; `adding/` → 200; `index.json` /
      negotiated `index.md` → 200 via probe+`next()`; register in grouped runner'
    status: completed
  - id: verify
    content:
      'Run `npm run test:edge-functions` and grouped live suite as applicable'
    status: completed
isProject: false
custodian: Patrice Chalin
cSpell:ignore: distinguisher subresponse
---

# Registry component redirect edge function (revised)

## Desired behavior (authoritative)

1. **Path gate**: Only handle requests whose pathname has a **non-empty path
   segment** after `/ecosystem/registry/`—equivalently match
   `/ecosystem/registry/(.+)` for **any** captured suffix, including
   `index.html`, `index.md`, and `index.json`. Bare `/ecosystem/registry` and
   `/ecosystem/registry/` do **not** match (no subrequest; `context.next()`
   only). Real assets under those paths are served via the **probe** (`fetch`
   with the probe header → `context.next()` on the subrequest).
2. **Probe**: For matching requests, perform a **subrequest** to the same URL
   (typical pattern: `fetch()` with the incoming URL, same method where
   appropriate—usually **GET** or **HEAD** aligned with the client request).
3. **Interpret subresponse status**:
   - **2xx, 3xx, or 5xx**: return that subresponse to the client (pass through
     status, headers, and body as needed—mirror “what the origin returned”).
   - **4xx**: enqueue a **GA event** (reuse the repo’s existing Measurement
     Protocol / edge GA plumbing, e.g.
     [`netlify/edge-functions/lib/ga4-asset-fetch.ts`](../../netlify/edge-functions/lib/ga4-asset-fetch.ts)
     and patterns from
     [`netlify/edge-functions/asset-tracking/index.ts`](../../netlify/edge-functions/asset-tracking/index.ts)),
     then respond with a **redirect to `/ecosystem/registry/`** (preserve
     incoming **query string** unless product says otherwise).
4. **Non-matching** paths: bare `/ecosystem/registry` and `/ecosystem/registry/`
   only—**`context.next()`** with no outer `fetch` (the registry index page and
   its normal pipeline, including markdown negotiation when applicable).

## Recursion / double-fetch guard

The path gate does **not** replace a probe guard: a subrequest uses the **same**
pathname as the client (e.g. `/ecosystem/registry/old-component-slug` or
`/ecosystem/registry/index.json`), so it still matches the gate. Without a
distinguisher, the handler would run again on that `fetch` and recurse.

**Required** (unless Netlify documents that same-origin `fetch` from an edge
function bypasses edge for that URL—do not assume): send a dedicated **internal
request header** on the subrequest (e.g. `X-Otel-Registry-Legacy-Probe: 1`) and,
at the **top** of this handler, if that header is present **immediately**
`return context.next()` so the probe hits static / downstream logic without
probing again.

## Netlify registration

- Add `[[edge_functions]]` in [`netlify.toml`](../../netlify.toml) **above**
  `markdown-negotiation` so this runs first on overlapping paths.
- Use **`path = "/ecosystem/registry/*"`**
  ([`URLPattern`](https://developer.mozilla.org/en-US/docs/Web/API/URL_Pattern_API)
  wildcard, same style as `/schemas/*` in this repo). Per MDN, `*` is greedy and
  matches zero or more characters after that slash, so `/ecosystem/registry/`
  also matches; the handler’s path gate immediately `next()`s there. The probe
  header still prevents inner `fetch` recursion.

## Remove legacy Hugo redirect

- Delete
  `redirects: [{ from: /ecosystem/registry*, to: '/ecosystem/registry?' }]` and
  the Netlify self-loop commentary from
  [`content/en/ecosystem/registry/_index.md`](../../content/en/ecosystem/registry/_index.md)
  once the edge function is deployed, so routing is defined in one place.

## Files to add / touch

- [`netlify/edge-functions/registry-component-redirect.ts`](../../netlify/edge-functions/registry-component-redirect.ts)
  — barrel export.
- [`netlify/edge-functions/registry-component-redirect/index.ts`](../../netlify/edge-functions/registry-component-redirect/index.ts)
  — handler + small helpers (path parse, build redirect URL, build probe
  `Request`).
- [`netlify/edge-functions/registry-component-redirect/index.test.ts`](../../netlify/edge-functions/registry-component-redirect/index.test.ts)
  — unit tests (`node:test`); see **Unit tests** below.
- [`netlify/edge-functions/registry-component-redirect/live-check.test.mjs`](../../netlify/edge-functions/registry-component-redirect/live-check.test.mjs) +
  registration in
  [`netlify/edge-functions/tests/live-check.test.mjs`](../../netlify/edge-functions/tests/live-check.test.mjs);
  [`package.json`](../../package.json) /
  [`netlify/edge-functions/README.md`](../../netlify/edge-functions/README.md)
  if other functions document live runners.

## Unit tests (required; same as other edge functions)

Ship
[`netlify/edge-functions/registry-component-redirect/index.test.ts`](../../netlify/edge-functions/registry-component-redirect/index.test.ts)
alongside the handler, using **`node:test`** and the same import/style patterns
as [`markdown-negotiation`](../../netlify/edge-functions/markdown-negotiation/),
[`asset-tracking`](../../netlify/edge-functions/asset-tracking/), and
[`schema-analytics`](../../netlify/edge-functions/schema-analytics/). Discovery
is automatic: root script [`npm run test:edge-functions`](../../package.json)
runs `node --test "netlify/edge-functions/**/*.test.ts"`—no new npm script is
required once the file exists.

### Test-writing guidance (site)

Follow
[**Testing — Test assertions**](../../content/en/site/testing/_index.md#test-assertions):
prefer **`assert.strictEqual`** with a **short third-argument label** (for
example `HTTP status`, `Location`, `Content-Type`), use **`assert.match`** when
a regex expresses intent better than `includes` chains, and **avoid** long
custom `assert.ok` failure strings. Keep tests **DRY**: reuse
[`netlify/edge-functions/lib/test-helpers.ts`](../../netlify/edge-functions/lib/test-helpers.ts)
(and any other shared edge-test utilities) where appropriate; add **new shared
helpers** next to this function’s tests (for example
`registry-component-redirect/test-helpers.ts`) when the same setup or assertions
repeat—do not copy-paste large blocks across cases.

Use **`t.mock.method(globalThis, 'fetch', ...)`** (or the repo’s prevailing mock
pattern) once in a helper if multiple cases need the same `fetch` stub shape.

**Cover at minimum:**

- **Path gate**: `/ecosystem/registry` and `/ecosystem/registry/` → `next()`
  only (no `fetch`); `/ecosystem/registry/foo` → probe path taken.
- **Probe header**: incoming request with probe header → immediate `next()`.
- **Subresponse passthrough**: mocked `fetch` returns 2xx / 3xx / 5xx → client
  sees that status (and body/headers where relevant).
- **4xx branch**: mocked `fetch` returns 4xx → redirect `Location` is
  `/ecosystem/registry/` (plus preserved query); GA enqueue / `waitUntil` wired
  or spied the same way as existing GA edge tests (see
  [`netlify/edge-functions/lib/test-helpers.ts`](../../netlify/edge-functions/lib/test-helpers.ts)).

## Redirect semantics

- **Location**: origin-relative **`/ecosystem/registry/`** (trailing slash per
  your spec).
- **Status**: Prefer **301** for permanent “slug removed” unless analytics
  prefers **302**; keep consistent with existing site redirects.

```mermaid
flowchart TD
  req[Incoming request]
  gate["Non-empty path after /ecosystem/registry/"]
  bypass[context.next]
  probeHeader{Probe header set?}
  probe[fetch same URL with probe header]
  status{Subresponse status}
  pass[Return subresponse]
  ga[Enqueue GA event]
  redir[Redirect to /ecosystem/registry/]

  req --> gate
  gate -->|no| bypass
  gate -->|yes| probeHeader
  probeHeader -->|yes| bypass
  probeHeader -->|no| probe
  probe --> status
  status -->|"2xx 3xx 5xx"| pass
  status -->|"4xx"| ga
  ga --> redir
```

## Out of scope

- Localized `/es/ecosystem/registry/...` trees unless you extend the same
  pattern later.
