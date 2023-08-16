---
title: No Collector
description: Why and how to send signals directly from app to backends
weight: 1
---

The simplest pattern is not to use a collector at all. This pattern consists of
applications [instrumented][instrumentation] with an OpenTelemetry SDK that
export telemetry signals (traces, metrics, logs) directly into a backend:

![No collector deployment concept](../../img/otel-sdk.svg)

## Example

See the [code instrumentation for programming languages][instrumentation] for
concrete end-to-end examples for how to export signals from your app directly
into a backend.

## Tradeoffs

Pros:

- Simple to use (especially in a dev/test environment)
- No additional moving parts to operate (in production environments)

Cons:

- Requires code changes if collection, processing, or ingestion changes
- Strong coupling between the application code and the backend
- There are limited number of exporters per language implementation

[instrumentation]: /docs/instrumentation/
