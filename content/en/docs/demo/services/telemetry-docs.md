---
title: Telemetry Docs Service
linkTitle: Telemetry Docs
aliases: [telemetrydocs]
cSpell:ignore: MkDocs telemetrydocs
---

The Telemetry Docs service generates and hosts documentation for the demo's
telemetry schema — every custom attribute and metric used across the
application. When the demo is running, it is available through the frontend
proxy at <http://localhost:8080/telemetry>.

[Telemetry Docs service source](https://github.com/open-telemetry/opentelemetry-demo/blob/main/src/telemetry-docs/)

The documentation is generated from the YAML schema definitions in the
`telemetry-schema/` directory using a three-stage Docker build:

1. [OpenTelemetry Weaver](https://github.com/open-telemetry/weaver) resolves the
   schema and generates Markdown.
2. [MkDocs](https://www.mkdocs.org/) builds a static HTML site from that
   Markdown.
3. [NGINX with the OpenTelemetry module](https://github.com/nginxinc/nginx-otel)
   serves the site, on port `8000` by default (`TELEMETRY_DOCS_PORT`).

## Instrumentation

The NGINX server is instrumented with the
[nginx-otel module](https://github.com/nginxinc/nginx-otel), the same module
used by the [Image Provider](../image-provider/) service. Its configuration
demonstrates a few production-minded practices:

- **Low-cardinality span names** through route parameters — for example,
  `/services/*.html` is recorded as `GET /services/{service_name}` rather than
  one span name per page.
- **Tracing exclusions** for static assets, search indexes, and the `/status`
  health-check endpoint, following the OpenTelemetry
  [HTTP semantic conventions](/docs/specs/semconv/http/http-spans/).
- **Batched export** every 5 seconds in batches of 256 spans.
