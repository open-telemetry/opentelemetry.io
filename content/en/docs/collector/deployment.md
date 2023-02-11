---
title: Deployment
description: Patterns you can apply to run the OpenTelemetry collector
weight: 2
---

The OpenTelemetry collector consists of a single binary which you can use in
different ways, for different use cases. This document describes deployment
patterns, their use cases along with pros and cons.

## No Collector

The simplest pattern is not to use a collector at all. This pattern consists of
applications [instrumented][instrumentation] with an OpenTelemetry SDK that
export telemetry signals (traces, metrics, logs) directly into a backend:

![No collector deployment concept](../img/sdk.svg)

### Example

See the [code instrumentation for programming languages][instrumentation] for
concrete end-to-end examples for how to export signals from your app directly
into a backend.

### Tradeoffs

Pros:

- Simple to use (especially in a dev/test environment)
- No additional moving parts to operate (in production environments)

Cons:

- Requires code changes if collection, processing, or ingestion changes
- Strong coupling between the application code and the backend

## Decentralized Deployment

The decentralized collector deployment pattern consists of applications
(instrumented with an OpenTelemetry SDK using [OpenTelemetry protocol
(OTLP)][otlp]) or other collectors (using the OTLP exporter) that send telemetry
signals to one or more [collectors][collector]. Each client-side SDK or
downstream collector is configured with a collector location:

![Decentralized collector deployment concept](../img/decentralized-sdk.svg)

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

The collector serving at `collector.example.com:4318` would then be configured
like so:

<!-- prettier-ignore-start -->
{{< ot-tabs Traces Metrics Logs >}}
{{< ot-tab lang="yaml">}}
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
{{< /ot-tab >}}
{{< /ot-tabs >}}
<!-- prettier-ignore-end -->

If you want to try it out for yourself, you can have a look at the end-to-end
[Java][java-otlp-example] or [Python][py-otlp-example] examples.

### Tradeoffs

Pros:

- Simple to get started
- Clear 1:1 mapping between application and collector

Cons:

- Scalability (human and load-wise)
- Inflexible

## Centralized Deployment

The centralized collector deployment pattern consists of applications (or other
collectors) sending traces to a single OTLP endpoint. For this OTLP endpoint you
would use a collector that has a trace pipeline configured with the
[Load-balancing exporter][lb-exporter] which in term distributes the spans to a
group of downstream collectors.

![Centralized collector deployment concept](../img/centralized-sdk.svg)

1. In the app, the SDK is configured to send OTLP data to a central location.
1. A collector configured using the Load-balancing exporter that distributes
   signals to a group of collectors.
1. The collectors are configured to send telemetry data to one or more backends.

> **Note** Currently, only trace pipelines are supported by the Load-balancing
> exporter.

### Example

For a concrete example of the centralized collector deployment pattern we first
need to have a closer look at the Load-balancing exporter. It has two main
configuration fields:

- The `resolver`, which determines where to find the downstream collectors (or:
  backends). If you use the `static` sub-key here, you will have to manually
  enumerate the collector URLs. The other supported resolver is the DNS resolver
  which will periodically check for updates and resolve IP addresses. For this
  resolver type, the `hostname` sub-key specifies the hostname to query in order
  to obtain the list of IP addresses.
- With the `routing_key` field you tell the Load-balancing exporter to route
  spans to specific downstream collectors. If you set this field to `traceID`
  (default) then the Load-balancing exporter exports spans based on their
  `traceID`. Otherwise, if you use `service` as the value for `routing_key`, it
  exports spans based on their service name which is useful when using
  processors like the [Span Metrics processor][spanmetrics-processor], so all
  spans of a service will be send to the same downstream collector for metric
  collection, guaranteeting accurate aggregations.

The collector servicing the central OTLP endpoint would be configured as shown
below:

<!-- prettier-ignore-start -->
{{< ot-tabs Static DNS "DNS with service" >}}
{{< ot-tab lang="yaml">}}
receivers:
  otlp:
    protocols:
      grpc:

exporters:
  loadbalancing:
    protocol:
      otlp:
        insecure: true
    resolver:
      static:
        hostnames:
          - collector-1.example.com:4317
          - collector-2.example.com:5317
          - collector-3.example.com

service:
  pipelines:
    traces:
      receivers: [otlp]
      exporters: [loadbalancing]
{{< /ot-tab >}}

{{< ot-tab lang="yaml">}}
receivers:
  otlp:
    protocols:
      grpc:

exporters:
  loadbalancing:
    protocol:
      otlp:
        insecure: true
    resolver:
      dns:
        hostname: collectors.example.com

service:
  pipelines:
    traces:
      receivers: [otlp]
      exporters: [loadbalancing]
{{< /ot-tab >}}

{{< ot-tab lang="yaml">}}
receivers:
  otlp:
    protocols:
      grpc:

exporters:
  loadbalancing:
    routing_key: "service"
    protocol:
      otlp:
        insecure: true
    resolver:
      dns:
        hostname: collectors.example.com
        port: 5317

service:
  pipelines:
    traces:
      receivers: [otlp]
      exporters: [loadbalancing]
{{< /ot-tab >}}
{{< /ot-tabs >}}
<!-- prettier-ignore-end -->

The Load-balancing exporter emits metrics including
`otelcol_loadbalancer_num_backends` and `otelcol_loadbalancer_backend_latency`
that you can use for health and performance monitoring of the central OTLP
endpoint collector.

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

Export signals into more than one backend. For example, for testing, policy
(signals from dev/test go into backend X, prod goes into Y), or migrations from
one back-end to another (cut-over) or different signal types go into different
backends.

<!-- prettier-ignore-start -->
{{< ot-tabs "Per type" "Per env" "Migration" >}}
{{< ot-tab lang="yaml">}}
receivers:
  otlp:
    protocols:
      grpc:

exporters:
  jaeger:
    endpoint: "https://jaeger.example.com:14250"
    insecure: true
  prometheusremotewrite:
    endpoint: "https://prw.example.com/v1/api/remote_write"

service:
  pipelines:
    metrics/prod:
      receivers: [otlp]
      processors: [batch]
      exporters: [prometheusremotewrite]
    traces:
      receivers: [otlp]
      processors: [batch]
      exporters: [jaeger]
{{< /ot-tab >}}

{{< ot-tab lang="yaml">}}
receivers:
  otlp:
    protocols:
      grpc:

processors:
  metricstransform/dev:
    transforms:
    - include: ".*"
      match_type: regexp
      action: update
      operations:
      - action: delete_label_value
        label: env
        label_value: prod

exporters:
  prometheus:
    endpoint: "0.0.0.0:1234"
    namespace: dev
    metric_expiration: 30m
    enable_open_metrics: true
    resource_to_telemetry_conversion:
      enabled: true
  prometheusremotewrite:
    endpoint: "https://prw.example.com/v1/api/remote_write"

service:
  pipelines:
    metrics/prod:
      receivers: [otlp]
      exporters: [prometheusremotewrite]
    metrics/dev:
      receivers: [otlp]
      processors: [metricstransform/dev]
      exporters: [prometheus]
{{< /ot-tab >}}

{{< ot-tab lang="yaml">}}
receivers:
  otlp:
    protocols:
      grpc:

exporters:
  prometheusremotewrite/old:
    endpoint: "https://old.example.com/v1/api/remote_write"
  prometheusremotewrite/new:
    endpoint: "https://new.example.com/v1/api/remote_write"

service:
  pipelines:
    metrics/prod:
      receivers: [otlp]
      exporters: [prometheusremotewrite/old]
    metrics/target:
      receivers: [otlp]
      exporters: [prometheusremotewrite/new]
{{< /ot-tab >}}

{{< /ot-tabs >}}
<!-- prettier-ignore-end -->

### Normalizing

Normalize the metadata from different instrumentations

```yaml
receivers:
  prometheus:
    config:
      scrape_configs:
        - job_name: "otel-collector"
          scrape_interval: 5s
          static_configs:
            - targets: ["0.0.0.0:8888"]
  jaeger:
    protocols:
      grpc:
      thrift_binary:
      thrift_compact:

processors:
  attributes:
    actions:
      - key: cluster
        value: eu-west-1
        action: upsert
  metricstransform:
    transforms:
      - include: otelcol_process_uptime
        action: update
        operations:
          - action: add_label
            new_label: cluster
            new_value: eu-west-1

exporters:
  jaeger:
    endpoint: localhost:15250
    insecure: true
  prometheus:
    endpoint: localhost:9090

service:
  extensions: []
  pipelines:
    metrics:
      receivers: [prometheus]
      processors: [metricstransform]
      exporters: [prometheus]
    traces:
      receivers: [jaeger]
      processors: [attributes]
      exporters: [jaeger]
```

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
[spanmetrics-processor]:
  https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/spanmetricsprocessor
[gh-patterns]:
  https://github.com/jpkrohling/opentelemetry-collector-deployment-patterns/
[y-patterns]: https://www.youtube.com/watch?v=WhRrwSHDBFs
