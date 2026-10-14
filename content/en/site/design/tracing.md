---
title: Website tracing
description: >-
  Design notes for the site's self-instrumentation: how tracing is gated to the
  official deployment, and why context propagation stays Zone-free.
weight: 20
cSpell:ignore: otelwebtelemetry
---

Design notes for the [website tracing](/site/features/#website-tracing) feature.

## Deployment gate

Load the tracer only when the build runs on the official site's Netlify account,
identified by the `SITE_NAME` build variable equal to `opentelemetry`.

- Previews must trace. The regression that motivated this design shipped green
  because `tracing.js` loaded only under `hugo.IsProduction`, so no deploy
  preview or CI build ever ran it. Gating on the site's identity instead of the
  Hugo environment puts production, deploy previews, and branch deploys on the
  same footing.
- Forks must not trace. A fork deployed to its own Netlify site has its own
  `SITE_NAME`, so it inherits the gate but not the tracing. Setting the variable
  in `netlify.toml` would undo that; it stays out of the repository.
- The gate selects a deployment; it does not authenticate one. Netlify sets
  `SITE_NAME` read-only for a given site, but anyone controlling their own build
  can set any variable. Rejecting fabricated telemetry is the collector's job,
  not the site's.
- `SITE_NAME` is on the Hugo `security.funcs.getenv` allowlist; `os.Getenv`
  returns an empty string when it is unset, which fails the gate.
- Local builds exercise tracing by setting the variable explicitly:
  [Build and serve](/site/build/npm-scripts/#build-and-serve).

## Context manager

Use `StackContextManager`, the synchronous context manager the SDK ships in
`@opentelemetry/sdk-trace`, rather than `ZoneContextManager`.

- It is the behavior the site has had since 2021, when a typo in the
  `register()` options silently left the Web SDK's default in place. Making it
  explicit restores that behavior; a brief switch to the Zone manager without
  `zone.js` on the page is what broke every instrumented fetch.
- `zone.js` patches every async primitive in the browser (`Promise`, timers,
  event listeners) and adds about 12 KB gzipped to every page, for context
  propagation that cannot cross native `async`/`await` anyway. A static site
  with one or two fetches per page gains nothing from it.
- The JS SDK's 3.x migration guide places `StackContextManager` in
  `@opentelemetry/sdk-trace` and retires `@opentelemetry/sdk-trace-web`; the
  site follows that path.

Spans from different async steps of one page interaction are siblings under the
root, not a parent-child chain. For this site's telemetry that is acceptable.

## Collector

Spans are exported over OTLP/HTTP to `https://otelwebtelemetry.com/v1/traces`,
and to the browser console through `ConsoleSpanExporter`. The collector is
maintained outside this repository; its OTLP version and the site's exporter
version are not pinned together, so an exporter upgrade can emit fields the
collector does not yet accept. The export failure is logged to the console and
does not affect the page.
