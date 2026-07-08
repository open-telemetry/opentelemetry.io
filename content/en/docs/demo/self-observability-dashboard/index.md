---
title: Self-Observability Dashboard
linkTitle: Self-Observability Dashboard
---

Operating an OpenTelemetry pipeline in production means the SDKs themselves
become critical infrastructure: if a service's exporter is failing, its queue is
saturated, or telemetry is being dropped, you want to see it. The OpenTelemetry
SDKs can emit their own internal metrics (using the experimental
[`otel.sdk.*` semantic conventions](/docs/specs/semconv/otel/sdk-metrics/)) that
describe how the SDK is behaving, and the demo's **Self-Observability**
dashboard visualizes them.

This dashboard demonstrates how to monitor the health of the OpenTelemetry SDKs
running inside your instrumented services, so you can answer questions such as
"is any service dropping spans?", "how long do exports take?", and "are the
batch processor queues filling up?".

## Enabling SDK self-observability

SDK self-observability is opt-in and, at the time of writing, still
experimental. Each SDK exposes its own switch:

- **OpenTelemetry Java** services enable it by setting the environment variable
  `OTEL_EXPERIMENTAL_SDK_TELEMETRY_VERSION=latest`.

In the demo, the Java services (`ad`, `fraud-detection`, and `kafka`) opt in
this way. The dashboard is driven by a `Service` template variable, so any
additional service that opts in appears automatically without any dashboard
changes. As more SDKs add support for the `otel.sdk.*` conventions, they can be
enabled and will show up here too.

## Accessing the dashboard

Once the demo is running, open the dashboard directly at
<http://localhost:8080/grafana/d/self-observability>, or navigate to it from the
Grafana dashboard list ("Self-Observability").

## Dashboard sections

The dashboard is organized into an overview followed by one section per signal
pipeline.

### Overview

A high-level summary across all selected services: how many services are
reporting self-observability metrics, the rate of spans, metric data points, and
log records exported, export and processing error counts, and the number of
items currently in flight. This is the fastest way to spot a service that is
failing to export or dropping telemetry.

### Span pipeline

Focuses on the tracing SDK: the rate of spans started, live (in-progress) spans,
span processor queue utilization (queue size versus capacity), spans exported
and their error breakdown by `error.type`, spans in flight, and the average span
export operation duration. Rising queue utilization or a growing error rate here
indicates the exporter cannot keep up with the span volume.

### Log pipeline

The equivalent view for the logs SDK: log records created, processor queue
utilization, exported log records with error breakdown, log records in flight,
and the average log export operation duration.

### Metric pipeline

Focuses on the metrics SDK: metric data points exported and their error
breakdown, data points in flight, the average metric collection duration (how
long the metric reader takes to collect from all instruments), and the average
metric export operation duration.

## Extending the dashboard

Because every panel is filtered by the `Service` template variable and keyed on
the standardized `otel.sdk.*` metric names, this dashboard works for any service
that opts in — regardless of language. It is intended as a starting point: you
can add panels for additional `otel.sdk.*` metrics, or split the existing panels
by attributes such as `otel.component.name` to drill into individual exporters
and processors within a service.
