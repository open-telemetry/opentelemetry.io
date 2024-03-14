---
title: Troubleshooting
description: Recommendations for troubleshooting the collector
weight: 25
---

This page describes some options when troubleshooting the health or performance
of the OpenTelemetry Collector. The Collector provides a variety of metrics,
logs, and extensions for debugging issues.

## Sending test data

For certain types of issues, particularly verifying configuration and debugging
network issues, it can be helpful to send a small amount of data to a collector
configured to output to local logs. For details, see
[Local exporters](https://github.com/open-telemetry/opentelemetry-collector/blob/main/docs/troubleshooting.md#local-exporters).

## Check available components in the Collector

Use the following sub-command to list the available components in a Collector
distribution, including their stability levels.

```sh
otelcol components
```

Sample Output

```yaml
buildinfo:
  command: otelcol
  description: OpenTelemetry Collector
  version: 0.96.0
receivers:
  - name: kafka
    stability:
      logs: Beta
      metrics: Beta
      traces: Beta
  - name: opencensus
    stability:
      logs: Undefined
      metrics: Beta
      traces: Beta
  - name: prometheus
    stability:
      logs: Undefined
      metrics: Beta
      traces: Undefined
  - name: zipkin
    stability:
      logs: Undefined
      metrics: Undefined
      traces: Beta
  - name: otlp
    stability:
      logs: Beta
      metrics: Stable
      traces: Stable
  - name: hostmetrics
    stability:
      logs: Undefined
      metrics: Beta
      traces: Undefined
  - name: jaeger
    stability:
      logs: Undefined
      metrics: Undefined
      traces: Beta
processors:
  - name: resource
    stability:
      logs: Beta
      metrics: Beta
      traces: Beta
  - name: span
    stability:
      logs: Undefined
      metrics: Undefined
      traces: Alpha
  - name: probabilistic_sampler
    stability:
      logs: Alpha
      metrics: Undefined
      traces: Beta
  - name: filter
    stability:
      logs: Alpha
      metrics: Alpha
      traces: Alpha
  - name: batch
    stability:
      logs: Beta
      metrics: Beta
      traces: Beta
  - name: memory_limiter
    stability:
      logs: Beta
      metrics: Beta
      traces: Beta
  - name: attributes
    stability:
      logs: Beta
      metrics: Beta
      traces: Beta
exporters:
  - name: file
    stability:
      logs: Alpha
      metrics: Alpha
      traces: Alpha
  - name: kafka
    stability:
      logs: Beta
      metrics: Beta
      traces: Beta
  - name: opencensus
    stability:
      logs: Undefined
      metrics: Beta
      traces: Beta
  - name: prometheusremotewrite
    stability:
      logs: Undefined
      metrics: Beta
      traces: Undefined
  - name: zipkin
    stability:
      logs: Undefined
      metrics: Undefined
      traces: Beta
  - name: logging
    stability:
      logs: Deprecated
      metrics: Deprecated
      traces: Deprecated
  - name: otlp
    stability:
      logs: Beta
      metrics: Stable
      traces: Stable
  - name: otlphttp
    stability:
      logs: Beta
      metrics: Stable
      traces: Stable
  - name: debug
    stability:
      logs: Development
      metrics: Development
      traces: Development
  - name: prometheus
    stability:
      logs: Undefined
      metrics: Beta
      traces: Undefined
connectors:
  - name: forward
    stability:
      logs-to-logs: Beta
      logs-to-metrics: Undefined
      logs-to-traces: Undefined
      metrics-to-logs: Undefined
      metrics-to-metrics: Beta
      metrics-to-traces: Undefined
      traces-to-logs: Undefined
      traces-to-metrics: Undefined
      traces-to-traces: Beta
extensions:
  - name: zpages
    stability:
      extension: Beta
  - name: memory_ballast
    stability:
      extension: Deprecated
  - name: health_check
    stability:
      extension: Beta
  - name: pprof
    stability:
      extension: Beta
```

## Checklist for debugging complex pipelines

It can be difficult to isolate problems when telemetry flows through multiple
collectors and networks. For each "hop" of telemetry data through a collector or
other component in your telemetry pipeline, it’s important to verify the
following:

- Are there error messages in the logs of the collector?
- How is the telemetry being ingested into this component?
- How is the telemetry being modified (i.e. sampling, redacting) by this
  component?
- How is the telemetry being exported from this component?
- What format is the telemetry in?
- How is the next hop configured?
- Are there any network policies that prevent data from getting in or out?

### More

For detailed recommendations, including common problems, see
[Troubleshooting](https://github.com/open-telemetry/opentelemetry-collector/blob/main/docs/troubleshooting.md)
from the Collector repository.
