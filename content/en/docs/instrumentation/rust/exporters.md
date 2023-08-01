---
title: Exporters
weight: 50
cSpell:ignore: chrono millis ostream
---

In order to visualize and analyze your telemetry, you will need to export them to a
backend such as [Jaeger](https://www.jaegertracing.io/) or
[Zipkin](https://zipkin.io/). OpenTelemetry Rust provides exporters for some
common open source backends.

## OTLP endpoint

To send trace data to a OTLP endpoint (like the [collector](/docs/collector) or
Jaeger) you'll want to use an exporter package, such as
[`opentelemetry_otlp`](https://docs.rs/opentelemetry-otlp/latest/opentelemetry_otlp/):

