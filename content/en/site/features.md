---
title: Features
description: >-
  Brief summaries of notable site features with links to their primary
  references.
weight: 20
cSpell:ignore: otelwebtelemetry
---

## Agent-friendly content delivery

Make site content easier for agents to discover and consume. Current work adds
Markdown output for content pages and HTTP negotiation for
`Accept: text/markdown`.

- Status: in progress
- Design: [Agent support](../design/agent-support/)
- Implementation: under `netlify/edge-functions/markdown-negotiation.ts` with
  folder for logic and tests.
- References:
  [opentelemetry.io#9449](https://github.com/open-telemetry/opentelemetry.io/issues/9449),
  [docsy#2596](https://github.com/docsy/docsy/issues/2596)

## Website tracing

The site instruments page loads, user interactions, and `fetch`/XHR calls with
the OpenTelemetry JS SDK. Spans are exported over OTLP to `otelwebtelemetry.com`
and printed in the browser console. The tracer loads when the `SITE_NAME` build
variable is the official site's, which Netlify sets for its production, preview,
and branch deploys; a fork's own Netlify site does not trace.

- Status: active
- Design: [Website tracing](../design/tracing/)
- Implementation: [`assets/js/tracing.js`][], loaded by
  `layouts/_partials/hooks/body-end.html`
- Local build: [Build and serve](../build/npm-scripts/#build-and-serve)

<!-- prettier-ignore-start -->
[`assets/js/tracing.js`]: https://github.com/open-telemetry/opentelemetry.io/blob/main/assets/js/tracing.js
<!-- prettier-ignore-end -->
