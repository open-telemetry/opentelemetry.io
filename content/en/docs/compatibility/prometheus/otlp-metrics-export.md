---
title: OTLP metrics export to Prometheus
linkTitle: OTLP metrics export
cSpell:ignore: uuidgen
---

## Introduction

Prometheus was designed and optimized for pull-based monitoring, where it
discovers targets and scrapes metrics endpoints at regular intervals. This model
is central to its architecture, supporting features like service discovery and
consistent target-based collection.

With the growing adoption of OpenTelemetry, newer versions of Prometheus have
introduced support for receiving push-based metrics via OTLP. In this setup,
OpenTelemetry SDKs export metrics using OTLP over HTTP, and Prometheus acts as
an OTLP receiver instead of scraping metrics. This approach can be used in
simpler setups, experiments, or local development environments. However, for
production deployments using OpenTelemetry, it is strongly recommended to use an
[OpenTelemetry Collector](/docs/collector/#when-to-use-a-collector) as an
intermediary.

This guide explains how to configure direct OTLP metric export from
OpenTelemetry SDKs to a Prometheus OTLP endpoint. It covers required environment
variables, exporter configuration, and key considerations such as service
identification, export intervals, and operational trade-offs.

## Prerequisite

Before you begin, make sure the following requirements are met:

- Set up Prometheus. Follow the
  [example prometheus.yml configuration in this Prometheus guide](https://prometheus.io/docs/guides/opentelemetry/#configuring-prometheus).
- [Enable the OTLP receiver](https://prometheus.io/docs/guides/opentelemetry/#enable-the-otlp-receiver)

Once you have Prometheus set up, you can move on to configure your application
to send metrics directly to an OTLP ingestion endpoint.

### Use environment variables

You can configure OpenTelemetry SDKs and instrumentation libraries with
[standard environment variables](/docs/languages/sdk-configuration/). Set the
environment variables before starting your application. The following
OpenTelemetry variables are needed to send OpenTelemetry metrics to a Prometheus
server on localhost:

```bash
export OTEL_EXPORTER_OTLP_PROTOCOL=http/protobuf
export OTEL_EXPORTER_OTLP_METRICS_ENDPOINT=http://localhost:9090/api/v1/otlp
```

Turn off traces and logs when using Prometheus if you only need metrics:

```bash
export OTEL_TRACES_EXPORTER=none
export OTEL_LOGS_EXPORTER=none
```

The default push interval for OpenTelemetry metrics is 60 seconds. This can be
adjusted depending on monitoring requirements. For example, a 15-second interval
provides more responsive metrics and faster alerting at the cost of higher
network and processing overhead.

```bash
export OTEL_METRIC_EXPORT_INTERVAL=15000
```

If your instrumentation library does not provide `service.name` and
`service.instance.id` out-of-the-box, it is highly recommended to set them.
Without these attributes, it becomes difficult to reliably identify services or
distinguish between instances, making debugging and aggregation significantly
harder. The example below assumes that the `uuidgen` command is available on
your system.

```bash
export OTEL_SERVICE_NAME="my-example-service"
export OTEL_RESOURCE_ATTRIBUTES="service.instance.id=$(uuidgen)"
```

> [!NOTE]
>
> Make sure that `service.instance.id` is unique for each instance, and that a
> new `service.instance.id` is generated whenever a resource attribute changes.
> The [recommended way](/docs/specs/semconv/resource/service/#service-instance)
> is to generate a new UUID on each startup of an instance.

### Configure telemetry

Update your OpenTelemetry configuration to use the same `exporter` and `reader`
from the OTLP setup in your
[language SDK documentation](/docs/languages/_index.md). If the environment
variables are set up and loaded correctly, the OpenTelemetry SDK reads them
automatically.

## Querying histogram metrics in Prometheus and Grafana

When OpenTelemetry exports histogram metrics to Prometheus (either directly or
via the OpenTelemetry Collector using the Prometheus exporter/receiver), the
data is stored using standard Prometheus histogram conventions:

- `<metric_name>_bucket{le="..."}`: Cumulative count of measurements with values
  less than or equal to `le`.
- `<metric_name>_count`: Total count of recorded measurements.
- `<metric_name>_sum`: Total sum of all recorded measurement values.

Below are common PromQL example queries, how to interpret their results, and how
to configure visualizations in Grafana.

### 1. Calculating percentiles (quantiles, e.g. p95, p90, p50)

To calculate latency percentiles (such as 95th percentile duration) over a
5-minute time window, use `histogram_quantile()`:

```promql
histogram_quantile(0.95, sum(rate(http_server_request_duration_seconds_bucket[5m])) by (le))
```

**How it works:**

- **`rate(...[5m])`**: Histograms record cumulative counts over time. Taking the
  `rate()` over a range window calculates the per-second rate of increase for
  each bucket while correctly handling counter resets (such as application
  restarts).
- **`sum(...) by (le)`**: Aggregates the bucket rates across all instances or
  resources while preserving the `le` (less-than-or-equal) boundary label
  required by `histogram_quantile()`.

**Grouping by specific attributes (e.g. span name or HTTP route):**

If you want to view the 95th percentile per span or endpoint, add that attribute
to the `by (...)` clause alongside `le`:

```promql
histogram_quantile(0.95, sum(rate(traces_span_metrics_duration_milliseconds_bucket[5m])) by (le, span_name))
```

> [!TIP] If grouping by attributes like `span_name` produces too many lines in
> your chart, filter the metric to specific high-traffic spans or services using
> label selectors:
> `traces_span_metrics_duration_milliseconds_bucket{span_name=~"checkout|payment"}`.

### 2. Calculating average value (average duration)

To calculate the average duration across all requests over a 5-minute interval:

```promql
sum(rate(http_server_request_duration_seconds_sum[5m])) / sum(rate(http_server_request_duration_seconds_count[5m]))
```

**How it works:**

- Divides the overall rate of time spent (`_sum`) by the overall rate of events
  (`_count`).
- To calculate the average per span or route, append `by (span_name)` to both
  `sum(...)` aggregations:

```promql
sum(rate(traces_span_metrics_duration_milliseconds_sum[5m])) by (span_name)
  /
sum(rate(traces_span_metrics_duration_milliseconds_count[5m])) by (span_name)
```

### 3. Measuring request rate (throughput)

To measure the overall throughput (requests per second) recorded by a histogram:

```promql
sum(rate(http_server_request_duration_seconds_count[5m]))
```

### 4. Visualizing histograms in Grafana Heatmaps

Grafana Heatmap panels provide a visual representation of how measurement
distributions change over time.

To set up a Grafana Heatmap panel for an OpenTelemetry histogram:

1. **PromQL Query**: Enter the bucket rate query:

   ```promql
   sum(rate(http_server_request_duration_seconds_bucket[5m])) by (le)
   ```

2. **Format**: Set the query format to **Time series**.
3. **Legend**: Set the Legend format to `{{le}}` so Grafana can extract bucket
   boundaries from the `le` label.
4. **Panel Type**: Select **Heatmap** as the panel visualization type. Under
   Heatmap options, choose **Calculate from data** (or **Sum of rate**) to let
   Grafana render the distribution buckets properly.
