---
title: Decentralized
description:
  Why and how to send signals to collectors and from there to backends
weight: 2
---

The decentralized collector deployment pattern consists of
applications—[instrumented][instrumentation] with an OpenTelemetry SDK using
[OpenTelemetry protocol (OTLP)][otlp]—or other collectors (using the OTLP
exporter) that send telemetry signals to one or more [collectors][collector].
Each client-side SDK or downstream collector is configured with a collector
location:

![Decentralized collector deployment concept](../../img/decentralized-sdk.svg)

1. In the app, the SDK is configured to send OTLP data to a collector.
1. The collector is configured to send telemetry data to one or more backends.

## Example

A concrete example of the decentralized collector deployment pattern could look
as follows: you manually instrument, say, a [Java application to export
metrics][instrument-java-metrics] using the OpenTelemetry Java SDK. In the
context of the app, you would set the `OTEL_METRICS_EXPORTER` to `otlp` (which
is the default value) and configure the [OTLP exporter][otlp-exporter] with the
address of your collector, for example (in Bash or `zsh` shell):

```
export OTEL_EXPORTER_OTLP_ENDPOINT=http://collector.example.com:4318
```

The collector serving at `collector.example.com:4318` would then be configured
like so:

<!-- prettier-ignore-start -->
{{< tabpane persistLang=false >}}
{{< tab header="Traces" lang="yaml" >}}
receivers:
  otlp: # the OTLP receiver the app is sending traces to
    protocols:
      grpc:

processors:
  batch:

exporters:
  jaeger: # the Jaeger exporter, to ingest traces to backend
    endpoint: "https://jaeger.example.com:14250"
    insecure: true

service:
  pipelines:
    traces/dev:
      receivers: [otlp]
      processors: [batch]
      exporters: [jaeger]
{{< /tab >}}
{{< tab header="Metrics" lang="yaml" >}}
receivers:
  otlp: # the OTLP receiver the app is sending metrics to
    protocols:
      grpc:

processors:
  batch:

exporters:
  prometheusremotewrite: # the PRW exporter, to ingest metrics to backend
    endpoint: "https://prw.example.com/v1/api/remote_write"

service:
  pipelines:
    metrics/prod:
      receivers: [otlp]
      processors: [batch]
      exporters: [prometheusremotewrite]

{{< /tab >}}
{{< tab header="Logs" lang="yaml" >}}
receivers:
  otlp: # the OTLP receiver the app is sending logs to
    protocols:
      grpc:

processors:
  batch:

exporters:
  file: # the File Exporter, to ingest logs to local file 
    path: "./app42_example.log"
    rotation:

service:
  pipelines:
    logs/dev:
      receivers: [otlp]
      processors: [batch]
      exporters: [file]
{{< /tab >}}
{{< /tabpane>}}
<!-- prettier-ignore-end -->

If you want to try it out for yourself, you can have a look at the end-to-end
[Java][java-otlp-example] or [Python][py-otlp-example] examples.

## Tradeoffs

Pros:

- Simple to get started
- Clear 1:1 mapping between application and collector

Cons:

- Scalability (human and load-wise)
- Inflexible

[instrumentation]: /docs/instrumentation/
[otlp]: /docs/reference/specification/protocol/
[collector]: /docs/collector/
[instrument-java-metrics]: /docs/instrumentation/java/manual/#metrics
[otlp-exporter]: /docs/reference/specification/protocol/exporter/
[java-otlp-example]:
  https://github.com/open-telemetry/opentelemetry-java-docs/tree/main/otlp
[py-otlp-example]:
  https://opentelemetry-python.readthedocs.io/en/stable/examples/metrics/instruments/README.html
[lb-exporter]:
  https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/exporter/loadbalancingexporter
[spanmetrics-processor]:
  https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/spanmetricsprocessor
