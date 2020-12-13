---
title: "Configuration"
weight: 20
---

## Basics

The Collector consists of three components that access telemetry data:

- [Receivers](#receivers)
- [Processors](#processors)
- [Exporters](#exporters)

These components once configured must be enabled via pipelines within the
[service](#service) section.

Secondarily, there are extensions, which provide capabilities that can be added
to the Collector, but which do not require direct access to telemetry data and
are not part of pipelines. They are also enabled within the [service](#service)
section.

An example configuration would look like:

```yaml
receivers:
  otlp:
    protocols:
      grpc:
      http:

processors:
  batch:

exporters:
  otlp:
    endpoint: otelcol:55680

extensions:
  health_check:
  pprof:
  zpages:

service:
  extensions: [health_check,pprof,zpages]
  pipelines:
    traces:
      receivers: [otlp]
      processors: [batch]
      exporters: [otlp]
    metrics:
      receivers: [otlp]
      processors: [batch]
      exporters: [otlp]
    logs:
      receivers: [otlp]
      processors: [batch]
      exporters: [otlp]
```

Note that the same receiver, processor, exporter and/or pipeline can be defined
more than once. For example:

```yaml
receivers:
  otlp:
    protocols:
      grpc:
      http:
  otlp/2:
    protocols:
      grpc:
        endpoint: 0.0.0.0:55690

processors:
  batch:
  batch/test:

exporters:
  otlp:
    endpoint: otelcol:55680
  otlp/2:
    endpoint: otelcol2:55680

extensions:
  health_check:
  pprof:
  zpages:

service:
  extensions: [health_check,pprof,zpages]
  pipelines:
    traces:
      receivers: [otlp]
      processors: [batch]
      exporters: [otlp]
    traces/2:
      receivers: [otlp/2]
      processors: [batch/test]
      exporters: [otlp/2]
    metrics:
      receivers: [otlp]
      processors: [batch]
      exporters: [otlp]
    logs:
      receivers: [otlp]
      processors: [batch]
      exporters: [otlp]
```

## Receivers

A receiver, which can be push or pull based, is how data gets into the
Collector. One or more receivers must be configured. By default, no receivers
are configured. A basic example of all available receivers is provided below.
For detailed receiver configuration, please see the [receiver
README.md](https://github.com/open-telemetry/opentelemetry-collector/blob/master/receiver/README.md).

```yaml
receivers:
  # Data sources: logs
  fluentforward:
    listenAddress: 0.0.0.0:8006

  # Data sources: metrics
  hostmetrics:
    scrapers:
      cpu:
      disk:
      filesystem:
      load:
      memory:
      network:
      process:
      processes:
      swap:

  # Data sources: traces
  jaeger:
    protocols:
      grpc:
      thrift_binary:
      thrift_compact:
      thrift_http:

  # Data sources: traces
  kafka:
    protocol_version: 2.0.0

  # Data sources: traces, metrics
  opencensus:

  # Data sources: traces, metrics, logs
  otlp:
    protocols:
      grpc:
      http:

  # Data sources: metrics
  prometheus:
    config:
      scrape_configs:
        - job_name: "otel-collector"
          scrape_interval: 5s
          static_configs:
            - targets: ["localhost:8888"]

  # Data sources: traces
  zipkin:
```

## Processors

Processors are run on data between being received and being exported.
Processors are optional though some are recommended. A basic example of all
available processors is provided below. For detailed processor configuration,
please see the [processor
README.md](https://github.com/open-telemetry/opentelemetry-collector/blob/master/processor/README.md).

```yaml
processors:
  # Data sources: traces
  attributes:
    actions:
      - key: environment
        value: production
        action: insert
      - key: db.statement
        action: delete
      - key: email
        action: hash

  # Data sources: traces, metrics, logs
  batch:

  # Data sources: metrics
  filter:
    metrics:
      include:
        match_type: regexp
        metric_names:
        - prefix/.*
        - prefix_.*

  # Data sources: traces, metrics, logs
  memory_limiter:
    ballast_size_mib: 2000
    check_interval: 5s
    limit_mib: 4000
    spike_limit_mib: 500

  # Data sources: traces
  resource:
    attributes:
    - key: cloud.zone
      value: "zone-1"
      action: upsert
    - key: k8s.cluster.name
      from_attribute: k8s-cluster
      action: insert
    - key: redundant-attribute
      action: delete

  # Data sources: traces
  probabilistic_sampler:
    hash_seed: 22
    sampling_percentage: 15

  # Data sources: traces
  span:
    name:
      to_attributes:
        rules:
          - ^\/api\/v1\/document\/(?P<documentId>.*)\/update$
      from_attributes: ["db.svc", "operation"]
      separator: "::"
```

## Exporters

An exporter, which can be push or pull based, is how you send data to one or
more backends/destinations. One or more exporters must be configured. By
default, no exporters are configured. A basic example of all available
exporters is provided below. For detailed exporter configuration, please see
the [exporter
README.md](https://github.com/open-telemetry/opentelemetry-collector/blob/master/exporter/README.md).

```yaml
exporters:
  # Data sources: traces, metrics, logs
  file:
    path: ./filename.json

  # Data sources: traces
  jaeger:
    endpoint: "http://jaeger-all-in-one:14250"
    insecure: true

  # Data sources: traces
  kafka:
    protocol_version: 2.0.0

  # Data sources: traces, metrics, logs
  logging:
    loglevel: debug

  # Data sources: traces, metrics
  opencensus:
    endpoint: "otelcol2:55678"

  # Data sources: traces, metrics, logs
  otlp:
    endpoint: otelcol2:55680
    insecure: true

  # Data sources: traces, metrics
  otlphttp:
    endpoint: https://example.com:55681/v1/traces

  # Data sources: metrics
  prometheus:
    endpoint: "prometheus:8889"
    namespace: "default"

  # Data sources: metrics
  prometheusremotewrite:
    endpoint: "http://some.url:9411/api/prom/push"

  # Data sources: traces
  zipkin:
    endpoint: "http://localhost:9411/api/v2/spans"
```

## Extensions

Extensions are available for for tasks that do not involve processing telemetry
data. Examples of extensions include health monitors. Extensions are optional.
By default, no extensions are configured. A basic example of all available
extensions is provided below. For detailed extension configuration, please see
the [extension
README.md](https://github.com/open-telemetry/opentelemetry-collector/blob/master/extension/README.md).

```yaml
extensions:
  health_check:
  pprof:
  zpages:
```

## Service

The service section is used to configure what components are enabled in the
Collector based on the configuration found in the receivers,
processors, exporters, and extensions sections. If a component is configured,
but not defined within the service section then it is not enabled. The service
section consists of two sub-sections:

- extensions
- pipelines

Extensions consist of a list of all extensions to enable. For example:

```yaml
    service:
      extensions: [health_check, pprof, zpages]
```

Pipelines can be of the following types:

- traces (stable): collects and processes trace data.
- metrics (alpha): collects and processes metric data.
- logs (alpha): collects and processes log data.

A pipeline consists of a set of receivers, processors and exporters. Each
receiver/processor/exporter must be defined in the configuration outside of the
service section to be included in a pipeline.

*Note:* Each receiver/processor/exporter can be used in more than one pipeline.
For processor(s) referenced in multiple pipelines, each pipeline will get a
separate instance of that processor(s). This is in contrast to
receiver(s)/exporter(s) referenced in multiple pipelines, where only one
instance of a receiver/exporter is used for all pipelines. Also note that the
order of processors dictates the order in which data is processed.

The following is an example pipeline configuration:

```yaml
service:
  pipelines:
    metrics:
      receivers: [opencensus, prometheus]
      exporters: [opencensus, prometheus]
    traces:
      receivers: [opencensus, jaeger]
      processors: [batch]
      exporters: [opencensus, zipkin]
```

## Other Information

### Configuration Environment Variables

The use of environment variables is supported in the Collector configuration.
For example:

```yaml
processors:
  attributes/example:
    actions:
      - key: "${DB_KEY}"
        action: "${OPERATION}"
```

### Proxy Support

Exporters that leverage the net/http package (all do today) respect the
following proxy environment variables:

- HTTP_PROXY
- HTTPS_PROXY
- NO_PROXY

If set at Collector start time then exporters, regardless of protocol, will or
will not proxy traffic as defined by these environment variables.
