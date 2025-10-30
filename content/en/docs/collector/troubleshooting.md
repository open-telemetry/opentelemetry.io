---
title: Troubleshooting
description: Recommendations for troubleshooting the Collector
weight: 25
cSpell:ignore: confmap pprof tracez zpages
---

On this page, you can learn how to troubleshoot the health and performance of
the OpenTelemetry Collector.

## Troubleshooting tools

The Collector provides a variety of metrics, logs, and extensions for debugging
issues.

### Internal telemetry

You can configure and use the Collector's own
[internal telemetry](/docs/collector/internal-telemetry/) to monitor its
performance.

### Local exporters

For certain types of issues, such as configuration verification and network
debugging, you can send a small amount of test data to a Collector configured to
output to local logs. Using a
[local exporter](https://github.com/open-telemetry/opentelemetry-collector/tree/main/exporter#general-information),
you can inspect the data being processed by the Collector.

For live troubleshooting, consider using the
[`debug` exporter](https://github.com/open-telemetry/opentelemetry-collector/blob/main/exporter/debugexporter/README.md),
which can confirm that the Collector is receiving, processing, and exporting
data. For example:

```yaml
receivers:
  zipkin:
exporters:
  debug:
service:
  pipelines:
    traces:
      receivers: [zipkin]
      processors: []
      exporters: [debug]
```

To begin testing, generate a Zipkin payload. For example, you can create a file
called `trace.json` that contains:

```json
[
  {
    "traceId": "5982fe77008310cc80f1da5e10147519",
    "parentId": "90394f6bcffb5d13",
    "id": "67fae42571535f60",
    "kind": "SERVER",
    "name": "/m/n/2.6.1",
    "timestamp": 1516781775726000,
    "duration": 26000,
    "localEndpoint": {
      "serviceName": "api"
    },
    "remoteEndpoint": {
      "serviceName": "apip"
    },
    "tags": {
      "data.http_response_code": "201"
    }
  }
]
```

With the Collector running, send this payload to the Collector:

```shell
curl -X POST localhost:9411/api/v2/spans -H'Content-Type: application/json' -d @trace.json
```

You should see a log entry like the following:

```shell
2023-09-07T09:57:43.468-0700    info    TracesExporter  {"kind": "exporter", "data_type": "traces", "name": "debug", "resource spans": 1, "spans": 2}
```

You can also configure the `debug` exporter so the entire payload is printed:

```yaml
exporters:
  debug:
    verbosity: detailed
```

If you re-run the previous test with the modified configuration, the log output
looks like this:

```shell
2023-09-07T09:57:12.820-0700    info    TracesExporter  {"kind": "exporter", "data_type": "traces", "name": "debug", "resource spans": 1, "spans": 2}
2023-09-07T09:57:12.821-0700    info    ResourceSpans #0
Resource SchemaURL: https://opentelemetry.io/schemas/1.4.0
Resource attributes:
     -> service.name: Str(telemetrygen)
ScopeSpans #0
ScopeSpans SchemaURL:
InstrumentationScope telemetrygen
Span #0
    Trace ID       : 0c636f29e29816ea76e6a5b8cd6601cf
    Parent ID      : 1a08eba9395c5243
    ID             : 10cebe4b63d47cae
    Name           : okey-dokey
    Kind           : Internal
    Start time     : 2023-09-07 16:57:12.045933 +0000 UTC
    End time       : 2023-09-07 16:57:12.046058 +0000 UTC
    Status code    : Unset
    Status message :
Attributes:
     -> span.kind: Str(server)
     -> net.peer.ip: Str(1.2.3.4)
     -> peer.service: Str(telemetrygen)
```

### Check Collector components

Use the following sub-command to list the available components in a Collector
distribution, including their stability levels. Please note that the output
format might change across versions.

```shell
otelcol components
```

Sample output:

```yaml
buildinfo:
  command: otelcol
  description: OpenTelemetry Collector
  version: 0.96.0
receivers:
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
exporters:
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
      traces-to-traces: Beta
extensions:
  - name: zpages
    stability:
      extension: Beta
  - name: health_check
    stability:
      extension: Beta
  - name: pprof
    stability:
      extension: Beta
```

### Extensions

Here is a list of extensions you can enable for debugging the Collector.

#### Performance Profiler (pprof)

The
[pprof extension](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/extension/pprofextension/README.md),
which is available locally on port `1777`, allows you to profile the Collector
as it runs. This is an advanced use-case that should not be needed in most
circumstances.

#### zPages

The
[zPages extension](https://github.com/open-telemetry/opentelemetry-collector/tree/main/extension/zpagesextension/README.md),
which is exposed locally on port `55679`, can be used to inspect live data from
the Collector's receivers and exporters.

The TraceZ page, exposed at `/debug/tracez`, is useful for debugging trace
operations, such as:

- Latency issues. Find the slow parts of an application.
- Deadlocks and instrumentation problems. Identify running spans that don't end.
- Errors. Determine what types of errors are occurring and where they happen.

Note that `zpages` might contain error logs that the Collector does not emit
itself.

For containerized environments, you might want to expose this port on a public
interface instead of just locally. The `endpoint` can be configured using the
`extensions` configuration section:

```yaml
extensions:
  zpages:
    endpoint: 0.0.0.0:55679
```

## Checklist for debugging complex pipelines

It can be difficult to isolate problems when telemetry flows through multiple
Collectors and networks. For each "hop" of telemetry through a Collector or
other component in your pipeline, it’s important to verify the following:

- Are there error messages in the logs of the Collector?
- How is the telemetry being ingested into this component?
- How is the telemetry being modified (for example, sampling or redacting) by
  this component?
- How is the telemetry being exported from this component?
- What format is the telemetry in?
- How is the next hop configured?
- Are there any network policies that prevent data from getting in or out?

## Common Collector issues

This section covers how to resolve common Collector issues.

### Collector is experiencing data issues

The Collector and its components might experience data issues.

#### Collector is dropping data

The Collector might drop data for a variety of reasons, but the most common are:

- The Collector is improperly sized, resulting in an inability to process and
  export the data as fast as it is received.
- The exporter destination is unavailable or accepting the data too slowly.

To mitigate drops, configure the
[queued retry options](https://github.com/open-telemetry/opentelemetry-collector/tree/main/exporter/exporterhelper#configuration)
on enabled exporters, in particular the
[Sending queue batch settings](https://github.com/open-telemetry/opentelemetry-collector/tree/main/exporter/exporterhelper#sending-queue-batch-settings).

#### Collector is not receiving data

The Collector might not receive data for the following reasons:

- A network configuration issue.
- An incorrect receiver configuration.
- An incorrect client configuration.
- The receiver is defined in the `receivers` section but not enabled in any
  `pipelines`.

Check the Collector's
[logs](/docs/collector/internal-telemetry/#configure-internal-logs) as well as
[zPages](https://github.com/open-telemetry/opentelemetry-collector/blob/main/extension/zpagesextension/README.md)
for potential issues.

#### Collector is not processing data

Most processing issues result from of a misunderstanding of how the processor
works or a misconfiguration of the processor. For example:

- The attributes processor works only for "tags" on spans. The span name is
  handled by the span processor.
- Processors for trace data (except tail sampling) work only on individual
  spans.

#### Collector is not exporting data

The Collector might not export data for the following reasons:

- A network configuration issue.
- An incorrect exporter configuration.
- The destination is unavailable.

Check the Collector's
[logs](/docs/collector/internal-telemetry/#configure-internal-logs) as well as
[zPages](https://github.com/open-telemetry/opentelemetry-collector/blob/main/extension/zpagesextension/README.md)
for potential issues.

Exporting data often does not work because of a network configuration issue,
such as a firewall, DNS, or proxy issue. Note that the Collector does have
[proxy support](https://github.com/open-telemetry/opentelemetry-collector/tree/main/exporter#proxy-support).

### Collector is experiencing control issues

The Collector might experience failed startups or unexpected exits or restarts.

#### Collector exits or restarts

The Collector might exit or restart due to:

- Memory pressure from a missing or misconfigured
  [`memory_limiter` processor](https://github.com/open-telemetry/opentelemetry-collector/blob/main/processor/memorylimiterprocessor/README.md).
- Improper sizing for load.
- Improper configuration. For example, a queue sized to be larger than available
  memory.
- Infrastructure resource limits. For example, Kubernetes.

#### Collector fails to start in Windows Docker containers

With v0.90.1 and earlier, the Collector might fail to start in a Windows Docker
container, producing the error message
`The service process could not connect to the service controller`. In this case,
the `NO_WINDOWS_SERVICE=1` environment variable must be set to force the
Collector to start as if it were running in an interactive terminal, without
attempting to run as a Windows service.

### Collector is experiencing configuration issues

The Collector might experience problems due to configuration issues.

#### Null maps

During configuration resolution of multiple configs, values in earlier configs
are removed in favor of later configs, even if the later value is null. You can
fix this issue by

- Using `{}` to represent an empty map, such as `processors: {}` instead of
  `processors:`.
- Omitting empty configurations such as `processors:` from the configuration.

See
[confmap troubleshooting](https://github.com/open-telemetry/opentelemetry-collector/blob/main/confmap/README.md#null-maps)
for more information.
