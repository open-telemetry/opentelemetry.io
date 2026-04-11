# Markdown Negotiation

This folder contains the markdown-negotiation Edge Function implementation and
its tests.

Negotiated Markdown requests that prefer Markdown enqueue a GA4 `asset_fetch`
event for the returned Markdown subresponse status, including `2xx`, `3xx`,
`4xx`, and `5xx`, when `GA4_API_SECRET` and `HUGO_SERVICES_GOOGLEANALYTICS_ID`
are set (see `../lib/ga4-asset-fetch.ts` and
`projects/2026/asset-fetch-analytics.plan.md`). `asset_path` is the resolved
`*.md` path; `original_path` is included only when it differs from `asset_path`;
`content_type` is read from the returned response headers; and `event_emitter`
is `negotiation`.

Negotiated non-`2xx` Markdown outcomes are surfaced directly to the client
instead of falling back to `context.next()`.

Internal fetches for sibling `index.md` assets include `X-Asset-Fetch-Ga-Info`
so the asset-tracking Edge Function can detect and skip those subrequests,
avoiding duplicate `asset_fetch` events.

Responses also include `X-Asset-Fetch-Ga-Info` for coarse sanity-checking of the
derived GA path and local request-path/config state.

Explicit `GET` requests to a `*.md` URL pass straight through and do **not**
emit `asset_fetch` here.

## Unit tests

From the repository root, run all edge-function unit tests, see
[`../README.md`](../README.md).

### Live tests

To run the live checks over a server run the `test:edge-functions:live` NPM
script. For usage information:

```console
npm run test:edge-functions:live -- --help
```

Live tests use Node’s built-in **`node:test`** runner in
[`live-check.test.mjs`](./live-check.test.mjs). They are **not** picked up by
`npm run test:edge-functions`, which only runs `**/*.test.ts`.

<!-- cSpell:ignore GOOGLEANALYTICS -->
