---
title: Configure the OBI internal metrics reporter
linkTitle: Internal metrics reporter
description:
  Configure how the optional internal metrics reporter component reports metrics
  on the internal behavior of the auto-instrumentation tool in Prometheus
  format.
weight: 80
---

YAML section: `internal_metrics`

This component reports internal metrics about the auto-instrumentation tool's
behavior. You can export these metrics using
[Prometheus](https://prometheus.io/) or [OpenTelemetry](/).

To export metrics with Prometheus, set `exporter` to `prometheus` in the
`internal_metrics` section. Then set `port` in the `prometheus` subsection.

To export metrics with OpenTelemetry, set `exporter` to `otel` in the
`internal_metrics` section. Then set an endpoint in the `otel_metrics_export`.

Example:

```yaml
internal_metrics:
  exporter: prometheus
  prometheus:
    port: 6060
    path: /internal/metrics
```

## Configuration summary

| YAML                        | Environment Variable                                   | Type    | Default             | Summary                                                              |
| --------------------------- | ------------------------------------------------------ | ------- | ------------------- | -------------------------------------------------------------------- |
| `exporter`                  | `OTEL_EBPF_INTERNAL_METRICS_EXPORTER`                  | string  | `disabled`          | [Selects the internal metrics exporter.](#internal-metrics-exporter) |
| `prometheus.port`           | `OTEL_EBPF_INTERNAL_METRICS_PROMETHEUS_PORT`           | int     | (unset)             | [HTTP port for Prometheus scrape endpoint.](#prometheus-port)        |
| `prometheus.path`           | `OTEL_EBPF_INTERNAL_METRICS_PROMETHEUS_PATH`           | string  | `/internal/metrics` | [HTTP query path for Prometheus metrics.](#prometheus-path)          |
| `avoided_services.disabled` | `OTEL_EBPF_INTERNAL_METRICS_AVOIDED_SERVICES_DISABLED` | boolean | `false`             | Disables the avoided-services metric.                                |
| `avoided_services.limit`    | `OTEL_EBPF_INTERNAL_METRICS_AVOIDED_SERVICES_LIMIT`    | int     | `2000`              | Limits avoided-services series, including the overflow series.       |

---

## Internal metrics exporter

Set the internal metrics exporter. You can use `disabled`, `prometheus`, or
`otel`.

---

## Prometheus port

Set the HTTP port for the Prometheus scrape endpoint. If you leave it unset or
set it to 0, OBI doesn't open a Prometheus endpoint and doesn't report metrics.

You can use the same value as
[`prometheus_export.port`](../export-data/#prometheus-exporter-component) (both
metric families share the same HTTP server, but use different paths), or use a
different value (OBI opens two HTTP servers for the different metric families).

---

## Prometheus path

Set the HTTP query path to fetch Prometheus metrics.

If [`prometheus_export.port`](../export-data/#prometheus-exporter-component) and
`internal_metrics.prometheus.port` use the same value, you can set
`internal_metrics.prometheus.path` to a different value than
`prometheus_export.path` to keep the metric families separate, or use the same
value to list both metric families in the same scrape endpoint.

## Avoided-services cardinality

The `obi.avoided.services` OTLP metric (`obi_avoided_services` in Prometheus)
reports services for which OBI avoided duplicate telemetry after detecting that
the service exports OpenTelemetry data directly. Series include service name,
service namespace, and the avoided signal (`metrics` or `traces`), but not the
high-cardinality service instance ID.

`avoided_services.limit` bounds the number of series. Additional services are
combined into a series with `otel.metric.overflow=true` (Prometheus:
`otel_metric_overflow="true"`). Set the limit to `0` to use the OpenTelemetry
SDK's default metric cardinality limit, or set `disabled: true` to omit this
metric.
