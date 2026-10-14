---
title: Website telemetry
description: >-
  Why the tracer loads for every deploy of the project's Netlify site and no
  other, why context propagation stays Zone-free, and how an export failure
  shows when the collector lags the exporter
weight: 30
---

Design notes for the [website telemetry](/site/features/#website-telemetry)
feature.

## Deployment gate

Load the tracer for
[every deploy of the project's Netlify site](/site/features/#website-telemetry)
and for no other deploy. The body-end partial recognizes that site by the
`SITE_NAME` build variable Netlify sets.

- Previews must trace. Gating on the site's identity, not the Hugo environment,
  puts production, deploy previews, and branch deploys on the same footing, so a
  change to tracing shows in its deploy preview.
- Forks must not trace. A fork deployed to its own Netlify site has its own
  `SITE_NAME`, so it inherits the gate but not the tracing.
- This is a simple deployment gate. Netlify's value is not changeable, but
  anyone who controls their own build can set any variable. Rejecting
  fabricated telemetry is the collector's job, not the site's.
- An unset `SITE_NAME` fails the gate closed, with no signal; a Netlify site
  rename would do the same until the template follows. A local build opts in by
  setting the variable
  ([Build and serve](/site/build/npm-scripts/#build-and-serve)).

## Context manager

Use `StackContextManager` from `@opentelemetry/sdk-trace`, the package the JS
SDK's [3.x migration guide][] names as the `sdk-trace-web` replacement, rather
than `ZoneContextManager`.

- `zone.js` patches the common async APIs in the browser (`Promise`, timers,
  event listeners) and adds about 13 KB gzipped to every page. Its context
  propagation through callbacks is real, but it cannot cross native
  `async`/`await`, and a static site with one or two fetches per page has no use
  for it.

Context does not propagate automatically across an `await` or into an unbound
callback: a span started there is its own root unless the code passes the parent
context explicitly, as the fetch instrumentation does for its preflight span.
For this site's telemetry that is acceptable.

## Collector

The collector behind the export has a different owner and release train from the
site, so its OTLP version is not pinned to the site's exporter version, and an
exporter upgrade can emit fields the collector does not yet accept. An export
failure does not affect the page. The SDK does not report it (no diagnostic
logger is configured), so the only sign of it is the browser's own record of the
rejected request, in the DevTools network panel (Chromium consoles log it too;
Firefox's does not); the spans the console exporter prints say nothing about
whether the collector accepted them.

<!-- prettier-ignore-start -->
[3.x migration guide]: https://github.com/open-telemetry/opentelemetry-js/blob/main/doc/3.x/migration-guide.md#opentelemetrysdk-trace-web-package-removed
<!-- prettier-ignore-end -->
