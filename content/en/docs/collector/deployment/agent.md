---
title: Agent
description:
  Why and how to send signals to collectors and from there to backends
weight: 2
cSpell:ignore: prometheusremotewrite
---

In the agent deployment pattern, telemetry signals can come from

- Applications [instrumented][instrumentation] with an OpenTelemetry SDK using
  the [OpenTelemetry Protocol (OTLP)][otlp]
- Collectors using the OTLP exporter

The signals are sent to a [Collector][collector] instance that runs alongside
the application or on the same host, such as a sidecar or DaemonSet.

Each client-side SDK or downstream Collector is configured with the address of a
Collector instance:

![Decentralized collector deployment concept](../../img/otel-agent-sdk.svg)

1. In the application, the SDK is configured to send OTLP data to a Collector.
1. The Collector is configured to send telemetry data to one or more backends.

## Example

In this example of the agent deployment pattern, begin by manually instrumenting
a [Java application to export metrics][instrument-java-metrics] using the
OpenTelemetry Java SDK, including the default `OTEL_METRICS_EXPORTER` value,
`otlp`. Next, configure the [OTLP exporter][otlp-exporter] with the address of
your Collector. For example:

```shell
export OTEL_EXPORTER_OTLP_ENDPOINT=http://collector.example.com:4318
```

Next, configure the Collector running at `collector.example.com:4318` as
follows:

{{< tabpane text=true >}} {{% tab Traces %}}

```yaml
receivers:
  otlp: # the OTLP receiver the app is sending traces to
    protocols:
      http:
        endpoint: 0.0.0.0:4318

exporters:
  otlp/jaeger: # Jaeger supports OTLP directly
    endpoint: https://jaeger.example.com:4317
    sending_queue:
      batch:

service:
  pipelines:
    traces/dev:
      receivers: [otlp]
      exporters: [otlp/jaeger]
```

{{% /tab %}} {{% tab Metrics %}}

```yaml
receivers:
  otlp: # the OTLP receiver the app is sending metrics to
    protocols:
      http:
        endpoint: 0.0.0.0:4318

exporters:
  prometheusremotewrite: # the PRW exporter, to ingest metrics to backend
    endpoint: https://prw.example.com/v1/api/remote_write
    sending_queue:
      batch:

service:
  pipelines:
    metrics/prod:
      receivers: [otlp]
      exporters: [prometheusremotewrite]
```

{{% /tab %}} {{% tab Logs %}}

```yaml
receivers:
  otlp: # the OTLP receiver the app is sending logs to
    protocols:
      http:
        endpoint: 0.0.0.0:4318

exporters:
  file: # the File Exporter, to ingest logs to local file
    path: ./app42_example.log
    rotation:

service:
  pipelines:
    logs/dev:
      receivers: [otlp]
      exporters: [file]
```

{{% /tab %}} {{< /tabpane >}}

To explore this pattern end to end, see the [Java][java-otlp-example] or
[Python][py-otlp-example] examples.

## Trade-offs

Here are the key pros and cons of using an agent collector:

Pros:

- Straightforward to get started
- Clear one-to-one mapping between application and Collector

Cons:

- Limited scalability for teams and infrastructure resources
- Inflexible for complex or evolving deployments

[instrumentation]: /docs/languages/
[otlp]: /docs/specs/otel/protocol/
[collector]: /docs/collector/
[instrument-java-metrics]: /docs/languages/java/api/#meterprovider
[otlp-exporter]: /docs/specs/otel/protocol/exporter/
[java-otlp-example]:
  https://github.com/open-telemetry/opentelemetry-java-docs/tree/main/otlp
[py-otlp-example]:
  https://opentelemetry-python.readthedocs.io/en/stable/examples/metrics/instruments/README.html
