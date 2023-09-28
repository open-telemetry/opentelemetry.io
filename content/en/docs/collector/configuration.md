---
title: Configuration
weight: 20
# prettier-ignore
cSpell:ignore: cfssl cfssljson fluentforward gencert genkey hostmetrics initca loglevel OIDC oidc otlphttp pprof prodevent prometheusremotewrite servicegraph spanevents spanmetrics upsert zpages
---

<!-- markdownlint-disable link-fragments -->

Familiarity with the following pages is assumed:

- [Data collection concepts][dcc] in order to understand the repositories
  applicable to the OpenTelemetry Collector.
- [Security guidance](https://github.com/open-telemetry/opentelemetry-collector/blob/main/docs/security-best-practices.md)

## Basics

The Collector consists of four components that access telemetry data:

- [Receivers](#receivers)
  <img width="32" class="img-initial" src="/img/logos/32x32/Receivers.svg">
- [Processors](#processors)
  <img width="32" class="img-initial" src="/img/logos/32x32/Processors.svg">
- [Exporters](#exporters)
  <img width="32" class="img-initial" src="/img/logos/32x32/Exporters.svg">
- [Connectors](#connectors)
  <img width="32" class="img-initial" src="/img/logos/32x32/Load_Balancer.svg">

These components once configured must be enabled via pipelines within the
[service](#service) section.

Secondarily, there are [extensions](#extensions), which provide capabilities
that can be added to the Collector, but which do not require direct access to
telemetry data and are not part of pipelines. They are also enabled within the
[service](#service) section.

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
    endpoint: otelcol:4317

extensions:
  health_check:
  pprof:
  zpages:

service:
  extensions: [health_check, pprof, zpages]
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

Note that receivers, processors, exporters and/or pipelines are defined via
component identifiers in `type[/name]` format (e.g. `otlp` or `otlp/2`).
Components of a given type can be defined more than once as long as the
identifiers are unique. For example:

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
    endpoint: otelcol:4317
  otlp/2:
    endpoint: otelcol2:4317

extensions:
  health_check:
  pprof:
  zpages:

service:
  extensions: [health_check, pprof, zpages]
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

The configuration can also include other files, causing the Collector to merge
the two files in a single in-memory representation of the YAML configuration:

```yaml
receivers:
  otlp:
    protocols:
      grpc:

exporters: ${file:exporters.yaml}

service:
  extensions: []
  pipelines:
    traces:
      receivers: [otlp]
      processors: []
      exporters: [otlp]
```

With the `exporters.yaml` file being:

```yaml
otlp:
  endpoint: otelcol.observability.svc.cluster.local:443
```

The final result in memory will be:

```yaml
receivers:
  otlp:
    protocols:
      grpc:

exporters:
  otlp:
    endpoint: otelcol.observability.svc.cluster.local:443

service:
  extensions: []
  pipelines:
    traces:
      receivers: [otlp]
      processors: []
      exporters: [otlp]
```

## Receivers <img width="35" class="img-initial" src="/img/logos/32x32/Receivers.svg"> {#receivers}

A receiver, which can be push or pull based, is how data gets into the
Collector. Receivers may support one or more
[data sources](/docs/concepts/signals/).

The `receivers:` section is how receivers are configured. Many receivers come
with default settings so simply specifying the name of the receiver is enough to
configure it (for example, `zipkin:`). If configuration is required or a user
wants to change the default configuration then such configuration must be
defined in this section. Configuration parameters specified for which the
receiver provides a default configuration are overridden.

> Configuring a receiver does not enable it. Receivers are enabled via pipelines
> within the [service](#service) section.

One or more receivers must be configured. By default, no receivers are
configured. A basic example of receivers is provided below.

> For detailed receiver configuration, see the
> [receiver README](https://github.com/open-telemetry/opentelemetry-collector/blob/main/receiver/README.md).

```yaml
receivers:
  # Data sources: logs
  fluentforward:
    endpoint: 0.0.0.0:8006

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
      paging:

  # Data sources: traces
  jaeger:
    protocols:
      grpc:
      thrift_binary:
      thrift_compact:
      thrift_http:

  # Data sources: traces, metrics, logs
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
        - job_name: otel-collector
          scrape_interval: 5s
          static_configs:
            - targets: [localhost:8888]

  # Data sources: traces
  zipkin:
```

## Processors <img width="35" class="img-initial" src="/img/logos/32x32/Processors.svg"> {#processors}

Processors are run on data between being received and being exported. Processors
are optional though
[some are recommended](https://github.com/open-telemetry/opentelemetry-collector/tree/main/processor#recommended-processors).

The `processors:` section is how processors are configured. Processors may come
with default settings, but many require configuration. Any configuration for a
processor must be done in this section. Configuration parameters specified for
which the processor provides a default configuration are overridden.

> Configuring a processor does not enable it. Processors are enabled via
> pipelines within the [service](#service) section.

A basic example of the default processors is provided below. The full list of
processors can be found by combining the list found
[here](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor)
and
[here](https://github.com/open-telemetry/opentelemetry-collector/tree/main/processor).

> For detailed processor configuration, see the
> [processor README](https://github.com/open-telemetry/opentelemetry-collector/blob/main/processor/README.md).

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
    check_interval: 5s
    limit_mib: 4000
    spike_limit_mib: 500

  # Data sources: traces
  resource:
    attributes:
      - key: cloud.zone
        value: zone-1
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
      from_attributes: [db.svc, operation]
      separator: '::'
```

## Exporters <img width="35" class="img-initial" src="/img/logos/32x32/Exporters.svg"> {#exporters}

An exporter, which can be push or pull based, is how you send data to one or
more backends/destinations. Exporters may support one or more
[data sources](/docs/concepts/signals/).

The `exporters:` section is how exporters are configured. Exporters may come
with default settings, but many require configuration to specify at least the
destination and security settings. Any configuration for an exporter must be
done in this section. Configuration parameters specified for which the exporter
provides a default configuration are overridden.

> Configuring an exporter does not enable it. Exporters are enabled via
> pipelines within the [service](#service) section.

One or more exporters must be configured. By default, no exporters are
configured. A basic example of exporters is provided below. Certain exporter
configurations require x.509 certificates to be created in order to be secure,
as described in [setting up certificates](#setting-up-certificates).

> For detailed exporter configuration, see the
> [exporter README.md](https://github.com/open-telemetry/opentelemetry-collector/blob/main/exporter/README.md).

```yaml
exporters:
  # Data sources: traces, metrics, logs
  file:
    path: ./filename.json

  # Data sources: traces
  otlp/jaeger:
    endpoint: jaeger-all-in-one:4317
    tls:
      cert_file: cert.pem
      key_file: cert-key.pem

  # Data sources: traces, metrics, logs
  kafka:
    protocol_version: 2.0.0

  # Data sources: traces, metrics, logs
  # NOTE: Prior to v0.86.0 use `logging` and `loglevel: debug`
  #       instead of `debug` and `verbosity: detailed`
  debug:
    verbosity: detailed

  # Data sources: traces, metrics
  opencensus:
    endpoint: otelcol2:55678

  # Data sources: traces, metrics, logs
  otlp:
    endpoint: otelcol2:4317
    tls:
      cert_file: cert.pem
      key_file: cert-key.pem

  # Data sources: traces, metrics
  otlphttp:
    endpoint: https://example.com:4318

  # Data sources: metrics
  prometheus:
    endpoint: prometheus:8889
    namespace: default

  # Data sources: metrics
  prometheusremotewrite:
    endpoint: http://some.url:9411/api/prom/push
    # For official Prometheus (e.g. running via Docker)
    # endpoint: 'http://prometheus:9090/api/v1/write'
    # tls:
    #   insecure: true

  # Data sources: traces
  zipkin:
    endpoint: http://localhost:9411/api/v2/spans
```

## Connectors <img width="32" class="img-initial" src="/img/logos/32x32/Load_Balancer.svg"> {#connectors}

A connector is both an exporter and receiver. As the name suggests a Connector
connects two pipelines: It consumes data as an exporter at the end of one
pipeline and emits data as a receiver at the start of another pipeline. It may
consume and emit data of the same data type, or of different data types. A
connector may generate and emit data to summarize the consumed data, or it may
simply replicate or route data.

The `connectors:` section is how connectors are configured.

> Configuring a connectors does not enable it. Connectors are enabled via
> pipelines within the [service](#service) section.

One or more connectors may be configured. By default, no connectors are
configured. A basic example of connectors is provided below.

> For detailed connector configuration, see the
> [connector README](https://github.com/open-telemetry/opentelemetry-collector/blob/main/connector/README.md).

```yaml
connectors:
  forward:

  count:
    spanevents:
      my.prod.event.count:
        description: The number of span events from my prod environment.
        conditions:
          - 'attributes["env"] == "prod"'
          - 'name == "prodevent"'

  spanmetrics:
    histogram:
      explicit:
        buckets: [100us, 1ms, 2ms, 6ms, 10ms, 100ms, 250ms]
    dimensions:
      - name: http.method
        default: GET
      - name: http.status_code
    dimensions_cache_size: 1000
    aggregation_temporality: 'AGGREGATION_TEMPORALITY_CUMULATIVE'

  servicegraph:
    latency_histogram_buckets: [1, 2, 3, 4, 5]
    dimensions:
      - dimension-1
      - dimension-2
    store:
      ttl: 1s
      max_items: 10
```

## Extensions

Extensions are available primarily for tasks that do not involve processing
telemetry data. Examples of extensions include health monitoring, service
discovery, and data forwarding. Extensions are optional.

The `extensions:` section is how extensions are configured. Many extensions come
with default settings so simply specifying the name of the extension is enough
to configure it (for example, `health_check:`). If configuration is required or
a user wants to change the default configuration then such configuration must be
defined in this section. Configuration parameters specified for which the
extension provides a default configuration are overridden.

> Configuring an extension does not enable it. Extensions are enabled within the
> [service](#service) section.

By default, no extensions are configured. A basic example of extensions is
provided below.

> For detailed extension configuration, see the
> [extension README](https://github.com/open-telemetry/opentelemetry-collector/blob/main/extension/README.md).

```yaml
extensions:
  health_check:
  pprof:
  zpages:
  memory_ballast:
    size_mib: 512
```

## Service

The service section is used to configure what components are enabled in the
Collector based on the configuration found in the receivers, processors,
exporters, and extensions sections. If a component is configured, but not
defined within the service section then it is not enabled. The service section
consists of three sub-sections:

- extensions
- pipelines
- telemetry

Extensions consist of a list of all extensions to enable. For example:

```yaml
service:
  extensions: [health_check, pprof, zpages]
```

Pipelines can be of the following types:

- traces: collects and processes trace data.
- metrics: collects and processes metric data.
- logs: collects and processes log data.

A pipeline consists of a set of receivers, processors and exporters. Each
receiver/processor/exporter must be defined in the configuration outside of the
service section to be included in a pipeline.

_Note:_ Each receiver/processor/exporter can be used in more than one pipeline.
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

Telemetry is where the telemetry for the collector itself can be configured. It
has two subsections: `logs` and `metrics`.

The `logs` subsection allows configuration of the logs generated by the
collector. By default the collector will write its logs to stderr with a log
level of `INFO`. You can also add static key-value pairs to all logs using the
`initial_fields` section.
[View the full list of `logs` options here.](https://github.com/open-telemetry/opentelemetry-collector/blob/7666eb04c30e5cfd750db9969fe507562598f0ae/config/service.go#L41-L97)

The `metrics` subsection allows configuration of the metrics generated by the
collector. By default the collector will generate basic metrics about itself and
expose them for scraping at `localhost:8888/metrics`
[View the full list of `metrics` options here.](https://github.com/open-telemetry/opentelemetry-collector/blob/7666eb04c30e5cfd750db9969fe507562598f0ae/config/service.go#L99-L111)

The following is an example telemetry configuration:

```yaml
service:
  telemetry:
    logs:
      level: debug
      initial_fields:
        service: my-instance
    metrics:
      level: detailed
      address: 0.0.0.0:8888
```

## Other Information

### Configuration Environment Variables

The use and expansion of environment variables is supported in the Collector
configuration. For example to use the values stored on the `DB_KEY` and
`OPERATION` environment variables you can write the following:

```yaml
processors:
  attributes/example:
    actions:
      - key: ${env:DB_KEY}
        action: ${env:OPERATION}
```

Use `$$` to indicate a literal `$`. For example, representing
`$DataVisualization` would look like the following:

```yaml
exporters:
  prometheus:
    endpoint: prometheus:8889
    namespace: $$DataVisualization
```

### Proxy Support

Exporters that leverage the `net/http` package (all do today) respect the
following proxy environment variables:

- HTTP_PROXY
- HTTPS_PROXY
- NO_PROXY

If set at Collector start time then exporters, regardless of protocol, will or
will not proxy traffic as defined by these environment variables.

### Authentication

Most receivers exposing an HTTP or gRPC port are able to be protected using the
collector's authentication mechanism, and most exporters using HTTP or gRPC
clients are able to add authentication data to the outgoing requests.

The authentication mechanism in the collector uses the extensions mechanism,
allowing for custom authenticators to be plugged into collector distributions.
If you are interested in developing a custom authenticator, check out the
["Building a custom authenticator"](../custom-auth) document.

Each authentication extension has two possible usages: as client authenticator
for exporters, adding auth data to outgoing requests, and as server
authenticator for receivers, authenticating incoming connections. Refer to the
authentication extension for a list of its capabilities, but in general, an
authentication extension would only implement one of those traits. For a list of
known authenticators, use the
[Registry](/ecosystem/registry/?s=authenticator&component=extension) available
in this website.

To add a server authenticator to a receiver in your collector, make sure to:

1. add the authenticator extension and its configuration under `.extensions`
1. add a reference to the authenticator to `.services.extensions`, so that it's
   loaded by the collector
1. add a reference to the authenticator under
   `.receivers.<your-receiver>.<http-or-grpc-config>.auth`

Here's an example that uses the OIDC authenticator on the receiver side, making
this suitable for a remote collector that receives data from an OpenTelemetry
Collector acting as agent:

```yaml
extensions:
  oidc:
    issuer_url: http://localhost:8080/auth/realms/opentelemetry
    audience: collector

receivers:
  otlp/auth:
    protocols:
      grpc:
        auth:
          authenticator: oidc

processors:

exporters:
  # NOTE: Prior to v0.86.0 use `logging` instead of `debug`:
  debug:

service:
  extensions:
    - oidc
  pipelines:
    traces:
      receivers:
        - otlp/auth
      processors: []
      exporters:
        - debug
```

On the agent side, this is an example that makes the OTLP exporter obtain OIDC
tokens, adding them to every RPC made to a remote collector:

```yaml
extensions:
  oauth2client:
    client_id: agent
    client_secret: some-secret
    token_url: http://localhost:8080/auth/realms/opentelemetry/protocol/openid-connect/token

receivers:
  otlp:
    protocols:
      grpc:
        endpoint: localhost:4317

processors:

exporters:
  otlp/auth:
    endpoint: remote-collector:4317
    auth:
      authenticator: oauth2client

service:
  extensions:
    - oauth2client
  pipelines:
    traces:
      receivers:
        - otlp
      processors: []
      exporters:
        - otlp/auth
```

### Setting up certificates

For a production setup, we strongly recommend using TLS certificates, either for
secure communication or mTLS for mutual authentication. See the below steps to
generate self-signed certificates used in this example. You might want to use
your current cert provisioning procedures to procure a certificate for
production usage.

Install [cfssl](https://github.com/cloudflare/cfssl), and create the following
`csr.json` file:

```json
{
  "hosts": ["localhost", "127.0.0.1"],
  "key": {
    "algo": "rsa",
    "size": 2048
  },
  "names": [
    {
      "O": "OpenTelemetry Example"
    }
  ]
}
```

Now, run the following commands:

```bash
cfssl genkey -initca csr.json | cfssljson -bare ca
cfssl gencert -ca ca.pem -ca-key ca-key.pem csr.json | cfssljson -bare cert
```

This will create two certificates; first, an "OpenTelemetry Example" Certificate
Authority (CA) in `ca.pem` and the associated key in `ca-key.pem`, and second a
client certificate in `cert.pem` (signed by the OpenTelemetry Example CA) and
the associated key in `cert-key.pem`.

[dcc]: /docs/concepts/components/#collector
