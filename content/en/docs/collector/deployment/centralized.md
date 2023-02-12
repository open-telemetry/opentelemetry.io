---
title: Centralized
description:
  Why and how to send signals to a single OTLP end-point and from there to
  backends
weight: 3
---

The centralized collector deployment pattern consists of applications (or other
collectors) sending traces to a single OTLP endpoint. For this OTLP endpoint you
would use a collector that has a trace pipeline configured with the
[Load-balancing exporter][lb-exporter] which in term distributes the spans to a
group of downstream collectors.

![Centralized collector deployment concept](../../img/centralized-sdk.svg)

1. In the app, the SDK is configured to send OTLP data to a central location.
1. A collector configured using the Load-balancing exporter that distributes
   signals to a group of collectors.
1. The collectors are configured to send telemetry data to one or more backends.

> **Note** Currently, only trace pipelines are supported by the Load-balancing
> exporter.

## Example

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

## Tradeoffs

Pros:

- Separation of concerns
- Centralized policy management

Cons:

- Effort

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
