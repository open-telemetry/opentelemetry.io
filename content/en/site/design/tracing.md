---
title: Website tracing
description: >-
  How tracing is gated to the official site, why context propagation stays
  Zone-free, and why exporter and collector versions are not pinned together
weight: 30
---

Design notes for the [website tracing](/site/features/#website-tracing) feature.

## Deployment gate

Load the tracer only when the build is for the official site: Netlify sets the
`SITE_NAME` build variable to `opentelemetry` for that site, and the template
compares against that value.

- Previews must trace. Gating on the site's identity, not the Hugo environment,
  puts production, deploy previews, and branch deploys on the same footing, so a
  change to tracing shows in its deploy preview.
- Forks must not trace. A fork deployed to its own Netlify site has its own
  `SITE_NAME`, so it inherits the gate but not the tracing.
- This is a simple deployment gate, not an authentication mechanism. Netlify's
  value is not changeable from the repository, but anyone who controls their own
  build can set any variable. Rejecting fabricated telemetry is the collector's
  job, not the site's.
- `SITE_NAME` is on the Hugo `security.funcs.getenv` allowlist; when the
  variable is unset, `os.Getenv` returns an empty string and the gate fails
  closed. A local build opts in by setting it:
  [Build and serve](/site/build/npm-scripts/#build-and-serve).

## Context manager

Use `StackContextManager`, the synchronous context manager the SDK ships in
`@opentelemetry/sdk-trace`, rather than `ZoneContextManager`.

- `zone.js` patches every async primitive in the browser (`Promise`, timers,
  event listeners) and adds about 12 KB gzipped to every page, for context
  propagation that cannot cross native `async`/`await` anyway. A static site
  with one or two fetches per page gains nothing from it.
- The JS SDK's 3.x migration guide places `StackContextManager` in
  `@opentelemetry/sdk-trace` and retires `@opentelemetry/sdk-trace-web`; the
  site follows that path.

Context does not survive an async turn: a span started after an `await` or in a
callback is its own root, not a child of the span that led to it. For this
site's telemetry that is acceptable.

## Collector

The collector behind the export is maintained outside this repository, and its
OTLP version is not pinned to the site's exporter version, so an exporter
upgrade can emit fields the collector does not yet accept. An export failure
does not affect the page and is not logged: the SDK's diagnostic logger is not
configured, and the console exporter prints spans, not export results.
