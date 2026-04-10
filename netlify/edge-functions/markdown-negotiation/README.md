# Markdown Negotiation

This folder contains the markdown-negotiation Edge Function implementation and
its tests.

Successful Markdown responses enqueue a GA4 `asset_fetch` event when
`GA4_API_SECRET` and `HUGO_SERVICES_GOOGLEANALYTICS_ID` are set (see
`../lib/ga4-asset-fetch.ts` and `projects/2026/asset-fetch-analytics.plan.md`):
`asset_path` is the resolved `*.md` path; `original_path` is included only when
it differs from `asset_path`.

The local `package.json` sets `"type": "module"` so Node treats the `.ts` test
files in this folder as ESM without changing module semantics for the whole
repo.

## Unit tests

Run the unit tests with:

```console
npm run test:edge-functions
```

### Live tests

To run the live checks over a server run the `test:edge-functions:live` NPM
script. For usage information:

```console
npm run test:edge-functions:live -- --help
```

Live tests use Node’s built-in **`node:test`** runner in
[`live-check.test.mjs`](./live-check.test.mjs). They are **not** picked up by
`npm run test:edge-functions`, which only runs `**/*.test.ts`.
