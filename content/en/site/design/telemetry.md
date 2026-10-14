---
title: Website telemetry
description: >-
  How tracing is gated to the project's Netlify site, why context propagation
  stays Zone-free, and why exporter and collector versions are not pinned
  together
weight: 30
---

Design notes for the [website telemetry](/site/features/#website-telemetry)
feature.

## Deployment gate

Load the tracer only when the build is for the project's own Netlify site, which
the template recognizes by the `SITE_NAME` build variable Netlify sets. Features
states [when the tracer loads](/site/features/#website-telemetry); this page
says why that is the gate.

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

- `zone.js` patches the common async APIs in the browser (`Promise`, timers,
  event listeners) and adds about 12 KB gzipped to every page. Its context
  propagation through callbacks is real, but it cannot cross native
  `async`/`await`, and a static site with one or two fetches per page has no use
  for it.
- The JS SDK's 3.x migration guide places `StackContextManager` in
  `@opentelemetry/sdk-trace` and retires `@opentelemetry/sdk-trace-web`; the
  site follows that path.

Context does not propagate automatically across an `await` or into an unbound
callback: a span started there is its own root unless the code passes the parent
context explicitly, as the fetch instrumentation does for its preflight span.
For this site's telemetry that is acceptable.

## Collector

The collector behind the export is maintained outside this repository, and its
OTLP version is not pinned to the site's exporter version, so an exporter
upgrade can emit fields the collector does not yet accept. An export failure
does not affect the page. The SDK does not report it (no diagnostic logger is
configured), so the only trace of it is the browser's own network error for the
failed request; the spans the console exporter prints say nothing about whether
the collector accepted them.
