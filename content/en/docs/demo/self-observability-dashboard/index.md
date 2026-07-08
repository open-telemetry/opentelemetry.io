---
title: Self-Observability Dashboard
linkTitle: Self-Observability Dashboard
---

The OpenTelemetry SDKs can emit their own internal metrics (using the
experimental
[`otel.sdk.*` semantic conventions](/docs/specs/semconv/otel/sdk-metrics/)) that
describe how the SDK is behaving — for example whether a service is dropping
telemetry, how long exports take, or whether processor queues are filling up.
The demo's **Self-Observability** dashboard visualizes these metrics across the
span, log, and metric pipelines.

## Enabling SDK self-observability

SDK self-observability is opt-in and still experimental. OpenTelemetry Java
services enable it by setting `OTEL_EXPERIMENTAL_SDK_TELEMETRY_VERSION=latest`.
In the demo, the Java services (`ad`, `fraud-detection`, and `kafka`) opt in
this way. The dashboard is driven by a `Service` template variable, so any
additional service that opts in appears automatically.

## Accessing the dashboard

Once the demo is running, open the dashboard directly at
<http://localhost:8080/grafana/d/self-observability>, or navigate to it from the
Grafana dashboard list ("Self-Observability").
