# Markdown Negotiation

This folder contains the markdown-negotiation Edge Function implementation and
its tests.

Successful `2xx` Markdown responses enqueue a GA4 `asset_fetch` event (GET only)
when `GA4_API_SECRET` and `HUGO_SERVICES_GOOGLEANALYTICS_ID` are set (see
`../lib/ga4-asset-fetch.ts` and `projects/2026/asset-fetch-analytics.plan.md`).
`asset_path` is the resolved `*.md` path; `original_path` is included only when
it differs from `asset_path`; `content_type` is read from the response headers.
Non-2xx results fall back to the normal HTML page, which is covered by the
site's client-side GA `page_view` instrumentation.

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
