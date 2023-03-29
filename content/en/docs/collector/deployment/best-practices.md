---
title: Best Practices
description: How to configure collectors for various use cases
weight: 4
---

Now that you are equipped with the essential deployment patterns for the
collector, let's have a closer look at best practices for collector (pipeline)
configurations for different use cases.

## Fan Out

Export signals into more than one backend. For example, for testing, policy
(signals from dev/test go into backend X, prod goes into Y), or migrations from
one back-end to another (cut-over) or different signal types go into different
backends.

<!-- prettier-ignore-start -->
{{< tabpane lang=yaml persistLang=false >}}
{{< tab "Per type" >}}
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
{{< /tab >}}
{{< tab "Per environment" >}}
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
{{< /tab >}}
{{< tab Migration >}}
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
{{< /tab >}}
{{< /tabpane>}}
<!-- prettier-ignore-end -->

## Normalizing

Normalize the metadata from different instrumentations

```yaml
receivers:
  prometheus:
    config:
      scrape_configs:
        - job_name: 'otel-collector'
          scrape_interval: 5s
          static_configs:
            - targets: ['0.0.0.0:8888']
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

## Multitenancy

You want to isolate different tenants (customers, teams, etc.)

## Cross-Environment

You want to aggregate signals from multiple environments (on-prem, Kubernetes,
etc.)

## Per-Signal Instances

Have one collector instance per signal type, for example, one dedicated to
Prometheus metrics, one dedicated to Jaeger traces.

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
