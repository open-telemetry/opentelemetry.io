# Asset Tracking

This folder contains the asset-tracking Edge Function implementation and its
tests.

It tracks explicit asset-path requests by extension using `context.next()`
(currently `*.md` and `*.txt`) and emits GA4 `asset_fetch` events for tracked
`GET` requests regardless of response status. Emitted events set `event_emitter`
to `tracking`.

If the request includes `X-Asset-Fetch-Ga-Info`, the function treats it as an
internal subrequest and skips tracking. This prevents duplicate events when
`markdown-negotiation` fetches sibling `index.md` assets internally.

### Live tests

To run the live checks over a server:

```console
npm run _test:ef:live:asset-tracking -- --help
```
