---
title: Deployment
description: Patterns you can apply to run the OpenTelemetry collector
weight: 2
---

The OpenTelemetry collector consists of a single binary which you can use in
different ways, for different use cases. This document describes deployment
patterns, their use cases along with pros and cons.

## Decentralized Deployment

The decentralized collector deployment pattern consists of applications,
[instrumented][instrumentation] with an OpenTelemetry SDK, using [OpenTelemetry
protocol (OTLP)][otlp] to send telemetry data to one or more
[collectors][collector], with each client-side SDK configured with a collector
location:

![OpAMP example setup](../img/decentralized-sdk.svg)

1. In the app, the SDK is configured to send OTLP data to a collector.
1. The collector is configured to send telemetry data to one or more backends.

### Example

A concrete example of the decentralized collector deployment pattern could look
as follows: you manually instrument, say, a [Java application to export
metrics][instrument-java-metrics] using the OpenTelemetry Java SDK. In the
context of the app, you would set the `OTEL_METRICS_EXPORTER` to `otlp` (which
is the default value) and configure the [OTLP exporter][otlp-exporter] with the
address of your collector, for example (in Bash or `zsh` shell):

```
export OTEL_EXPORTER_OTLP_ENDPOINT=http://collector.example.com:4318
```

The collector would then be configured like so:

<!-- prettier-ignore-start -->
{{< ot-tabs Traces Metrics Logs >}} {{< ot-tab lang="yaml">}}
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
{{< /ot-tab >}}

{{< ot-tab lang="yaml">}}
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
{{< /ot-tab >}}

{{< ot-tab lang="yaml">}}
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
{{< /ot-tab >}} {{< /ot-tabs >}}
<!-- prettier-ignore-end -->

If you want to try it out for yourself, you can have a look at the end-to-end
[Java][java-otlp-example] or [Python][py-otlp-example] examples.

### Tradeoffs

As with anything in engineering, there are tradeoffs with the decentralized
collector deployment pattern:

Pros:

- Simple to get started
- Clear 1:1 mapping between application and collector

Cons:

- Scalability (human and load-wise)
- Inflexible

## Centralized Deployment

The centralized collector deployment pattern consists of applications (or other
collectors) sending signals to a group of collectors behind a load balancer. The
main point is that there's only one OTLP endpoint shared between a fleet of
collectors.

![OpAMP example setup](../img/centralized-sdk.svg)

1. In the app, the SDK is configured to send OTLP data to a central location.
1. A collector configured using the [Trace ID/Service-name aware load-balancing
   exporter][lb-exporter] distributes the telemetry data to a group of
   collectors.
1. The collectors are configured to send telemetry data to one or more backends.

### Example

```yaml
receivers:
  otlp:
    protocols:
      grpc:

processors:

exporters:
  loadbalancing:
    protocol:
      otlp:
        insecure: true
    resolver:
      static:
        hostnames:
          - collector-1.example.com:5317
          - collector-2.example.com:5317
          - collector-3.example.com:5317

service:
  pipelines:
    traces:
      receivers:
        - otlp
      processors: []
      exporters:
        - loadbalancing
```

### Tradeoffs

Pros:

- Separation of concerns
- Centralized policy management

Cons:

- Effort

## Best Practices

Now that you are equipped with the essential deployment patterns for the
collector, let's have a closer look at best practices for collector (pipeline)
configurations for different use cases.

### Fan Out

Export signals into more than one back-end destination, for example, for
testing, policy (signals from dev/test go into backend X, prod goes into Y), or
migrations from one back-end to another (cut-over).

### Normalizing

Normalize the metadata from different instrumentations

### Multitenancy

You want to isolate different tenants (customers, teams, etc.)

### Cross-Environment

You want to aggregate signals from multiple environments (on-prem, Kubernetes,
etc.)

### Per-Signal Instances

Have one collector instance per signal type, for example, one dedicated to
Prometheus metrics, one dedicated to Jaeger traces.

## Other information

- GitHub repo [OpenTelemetry Collector Deployment Patterns][gh-patterns]
- YouTube video [OpenTelemetry Collector Deployment Patterns][y-patterns]

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
[gh-patterns]:
  https://github.com/jpkrohling/opentelemetry-collector-deployment-patterns/
[y-patterns]: https://www.youtube.com/watch?v=WhRrwSHDBFs
