---
title: "Configuration"
weight: 20
---

## Basics

The Collector handles data via pipelines which are enabled within the
[service](#service) section. Pipelines are constructed from components that
access the telemetry data. These components are categorized and configured as:

* [Receivers](#receivers)
* [Processors](#processors)
* [Exporters](#exporters)

Secondarily, there are extensions, which provide capabilities that can be added
to the Collector, but which do not require direct access to telemetry data and
are not part of pipelines. They are also enabled within the [service](#service) section.

## Receivers

A receiver is how data gets into the OpenTelemetry Collector. One or more receivers
must be configured. By default, no receivers are configured.

A basic example of all available receivers is provided below. For detailed
receiver configuration, please see the [receiver
README.md](https://github.com/open-telemetry/opentelemetry-collector/blob/master/receiver/README.md).

```yaml
receivers:
  opencensus:
    address: "localhost:55678"

  zipkin:
    address: "localhost:9411"

  jaeger:
    protocols:
      grpc:
      thrift_http:
      thrift_tchannel:
      thrift_compact:
      thrift_binary:

  prometheus:
    config:
      scrape_configs:
        - job_name: "caching_cluster"
          scrape_interval: 5s
          static_configs:
            - targets: ["localhost:8889"]
```

## Processors

Processors are run on data between being received and being exported.
Processors are optional though some are recommended.

A basic example of all available processors is provided below. For
detailed processor configuration, please see the [processor
README.md](https://github.com/open-telemetry/opentelemetry-collector/blob/master/processor/README.md).

```yaml
processors:
  attributes/example:
    actions:
      - key: db.statement
        action: delete
  batch:
    timeout: 5s
    send_batch_size: 1024
  probabilistic_sampler:
    disabled: true
  span:
    name:
      from_attributes: ["db.svc", "operation"]
      separator: "::"
  queued_retry: {}
  tail_sampling:
    policies:
      - name: policy1
        type: rate_limiting
        rate_limiting:
          spans_per_second: 100
```

## Exporters

An exporter is how you send data to one or more backends/destinations. One or
more exporters must be configured. By default, no exporters are configured.

A basic example of all available exporters is provided below. For detailed
exporter configuration, please see the [exporter
README.md](https://github.com/open-telemetry/opentelemetry-collector/blob/master/exporter/README.md).

```yaml
exporters:
  opencensus:
    headers: {"X-test-header": "test-header"}
    compression: "gzip"
    cert_pem_file: "server-ca-public.pem" # optional to enable TLS
    endpoint: "localhost:55678"
    reconnection_delay: 2s

  logging:
    loglevel: debug

  jaeger_grpc:
    endpoint: "http://localhost:14250"

  jaeger_thrift_http:
    headers: {"X-test-header": "test-header"}
    timeout: 5
    url: "http://localhost:14268/api/traces"

  zipkin:
    url: "http://localhost:9411/api/v2/spans"

  prometheus:
    endpoint: "localhost:8889"
    namespace: "default"
```

## Service

The service section is used to configure what features are enabled in the
OpenTelemetry Collector based on the configuration found in the receivers,
processors, exporters, and extensions sections. The service section
consists of two sub-sections:

* extensions
* pipelines

Extensions consist of a list of all extensions to enable. For example:

```yaml
    service:
      extensions: [health_check, pprof, zpages]
```

Pipelines can be of two types:

* metrics: collects and processes metrics data.
* traces: collects and processes trace data.

A pipeline consists of a set of receivers, processors, and exporters. Each
receiver/processor/exporter must be defined in the configuration outside of the
service section to be included in a pipeline.

*Note:* Each receiver/processor/exporter can be used in more than one pipeline.
For processor(s) referenced in multiple pipelines, each pipeline will get a
separate instance of that processor(s). This is in contrast to
receiver(s)/exporter(s) referenced in multiple pipelines, where only one
instance of a receiver/exporter is used for all pipelines.

The following is an example pipeline configuration. For more information, refer
to [pipeline
documentation](https://github.com/open-telemetry/opentelemetry-collector/blob/master/docs/pipelines.md).

```yaml
service:
  pipelines:
    metrics:
      receivers: [opencensus, prometheus]
      exporters: [opencensus, prometheus]
    traces:
      receivers: [opencensus, jaeger]
      processors: [batch, queued_retry]
      exporters: [opencensus, zipkin]
```

## Extensions

Extensions are provided to monitor the health of the OpenTelemetry
Collector. Extensions are optional. By default, no extensions are configured.

A basic example of all available extensions is provided below. For detailed
extension configuration, please see the [extension
README.md](https://github.com/open-telemetry/opentelemetry-collector/blob/master/extension/README.md).

```yaml
extensions:
  health_check: {}
  pprof: {}
  zpages: {}
```
