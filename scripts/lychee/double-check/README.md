# Double-check of failing links

A browser-grade second opinion on link failures reported by [Lychee][]: some
sites serve valid pages to browsers but turn away plain HTTP clients. The driver
re-verifies each reported failure through the probe and records resolved URLs in
the committed link cache (`.lycheecache`). For when the site runs this and how
to run it locally, see [Double-check of failing links][docs].

## Files

- `cli.mjs`: driver. Parses a captured `check:links` log and probes each
  reported failure. Run with `--help` for options.
- `index.mjs`: pure logic (report-consistency checks, cache-line synthesis and
  merging).
- `get-url-status.mjs`: the probe; also runnable directly as
  `node scripts/lychee/double-check/get-url-status.mjs URL`.
- `live-check.mjs`: opt-in live smoke check of the probe, run via
  `npm run test:double-check:live`.

Offline unit tests (`*.test.mjs`) run as part of `npm run test:local-tools`.

## Probe behavior

The probe fetches the URL through headless Chrome ([puppeteer-core][]) with
bot-evasion measures (browser user agent, `Accept-Language` header). Beyond the
plain HTTP status, it:

- **Verifies URL fragments** against the rendered page, including GitHub
  line-range (`#L10-L20`) and `-ov-file` tab anchors.
- **Special-cases misleading hosts**: crates.io serves 404 for page requests
  even when the page exists, so the page body is analyzed instead; npmjs.com can
  redirect to a signin page for nonexistent packages and bot-wall (403) valid
  ones, so the page title is checked and 403s fall back to `npm view PACKAGE`.

Synthetic statuses:

- `206` ("OK by analysis"): resolved by inspection rather than HTTP status. This
  is the status the driver records in `.lycheecache`.
- `422`: page fetched, but the URL fragment was not found.

In local (non-CI) runs, URLs that remain unresolved are retried in a visible
browser window.

## Chrome

The probe requires Chrome: either set `CHROME_PATH`, or let the tooling install
a Puppeteer-managed copy (`npm exec --no puppeteer browsers install chrome`).

<!-- prettier-ignore-start -->
[docs]: ../../../content/en/site/build/link-checking.md
[Lychee]: https://lychee.cli.rs/
[puppeteer-core]: https://pptr.dev/
<!-- prettier-ignore-end -->
