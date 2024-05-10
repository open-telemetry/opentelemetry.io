---
title: Configuration
weight: 20
description: Learn how to configure the Collector to suit your needs
# prettier-ignore
cSpell:ignore: cfssl cfssljson fluentforward gencert genkey hostmetrics initca loglevel OIDC oidc otlphttp pprof prodevent prometheusremotewrite servicegraph spanevents spanmetrics struct upsert zpages
---

<!-- markdownlint-disable link-fragments -->

You can configure the OpenTelemetry Collector to suit your observability needs.
Before you learn how Collector configuration works, familiarize yourself with
the following content:

- [Data collection concepts][dcc], to understand the repositories applicable to
  the OpenTelemetry Collector.
- [Security guidance](https://github.com/open-telemetry/opentelemetry-collector/blob/main/docs/security-best-practices.md)

## Location {#location}

By default, the Collector configuration is located in
`/etc/<otel-directory>/config.yaml`, where `<otel-directory>` can be `otelcol`,
`otelcol-contrib`, or another value, depending on the Collector version or the
Collector distribution you're using.

You can provide one or more configurations using the `--config` option. For
example:

```shell
otelcol --config=customconfig.yaml
```

You can also provide configurations using environment variables, YAML paths, or
HTTP URIs. For example:

```shell
otelcol --config=env:MY_CONFIG_IN_AN_ENVVAR --config=https://server/config.yaml
otelcol --config="yaml:exporters::debug::verbosity: normal"
```

To validate a configuration file, use the `validate` command. For example:

```shell
otelcol validate --config=customconfig.yaml
```

## Configuration structure {#basics}

The structure of any Collector configuration file consists of four classes of
pipeline components that access telemetry data:

- [Receivers](#receivers)
  <img width="32" alt="" class="img-initial" src="/img/logos/32x32/Receivers.svg">
- [Processors](#processors)
  <img width="32" alt="" class="img-initial" src="/img/logos/32x32/Processors.svg">
- [Exporters](#exporters)
  <img width="32" alt="" class="img-initial" src="/img/logos/32x32/Exporters.svg">
- [Connectors](#connectors)
  <img width="32" alt="" class="img-initial" src="/img/logos/32x32/Load_Balancer.svg">

After each pipeline component is configured you must enable it using the
pipelines within the [service](#service) section of the configuration file.

Besides pipeline components you can also configure [extensions](#extensions),
which provide capabilities that can be added to the Collector, such as
diagnostic tools. Extensions don't require direct access to telemetry data and
are enabled through the [service](#service) section.

<a id="endpoint-0.0.0.0-warning"></a> The following is an example of Collector
configuration with a receiver, a processor, an exporter, and three extensions.

{{% alert title="Important" color="warning" %}}

While it is generally preferable to bind endpoints to `localhost` when all
clients are local, our example configurations use the "unspecified" address
`0.0.0.0` as a convenience. The Collector currently defaults to `0.0.0.0`, but
the default will be changed to `localhost` in the near future. For details
concerning either of these choices as endpoint configuration value, see
[Safeguards against denial of service attacks].

[Safeguards against denial of service attacks]:
  https://github.com/open-telemetry/opentelemetry-collector/blob/main/docs/security-best-practices.md#safeguards-against-denial-of-service-attacks

{{% /alert %}}

```yaml
receivers:
  otlp:
    protocols:
      grpc:
        endpoint: 0.0.0.0:4317
      http:
        endpoint: 0.0.0.0:4318
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

Note that receivers, processors, exporters and pipelines are defined through
component identifiers following the `type[/name]` format, for example `otlp` or
`otlp/2`. You can define components of a given type more than once as long as
the identifiers are unique. For example:

```yaml
receivers:
  otlp:
    protocols:
      grpc:
        endpoint: 0.0.0.0:4317
      http:
        endpoint: 0.0.0.0:4318
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
them in a single in-memory representation of the YAML configuration:

```yaml
receivers:
  otlp:
    protocols:
      grpc:
        endpoint: 0.0.0.0:4317

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
        endpoint: 0.0.0.0:4317

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

## Receivers <img width="35" class="img-initial" alt="" src="/img/logos/32x32/Receivers.svg"> {#receivers}

Receivers collect telemetry from one or more sources. They can be pull or push
based, and may support one or more [data sources](/docs/concepts/signals/).

Receivers are configured in the `receivers` section. Many receivers come with
default settings, so that specifying the name of the receiver is enough to
configure it. If you need to configure a receiver or want to change the default
configuration, you can do so in this section. Any setting you specify overrides
the default values, if present.

> Configuring a receiver does not enable it. Receivers are enabled by adding
> them to the appropriate pipelines within the [service](#service) section.

The Collector requires one or more receivers. The following example shows
various receivers in the same configuration file:

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
        endpoint: 0.0.0.0:4317
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
        endpoint: 0.0.0.0:4317
      http:
        endpoint: 0.0.0.0:4318

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

> For detailed receiver configuration, see the
> [receiver README](https://github.com/open-telemetry/opentelemetry-collector/blob/main/receiver/README.md).

## Processors <img width="35" class="img-initial" alt="" src="/img/logos/32x32/Processors.svg"> {#processors}

Processors take the data collected by receivers and modify or transform it
before sending it to the exporters. Data processing happens according to rules
or settings defined for each processor, which might include filtering, dropping,
renaming, or recalculating telemetry, among other operations. The order of the
processors in a pipeline determines the order of the processing operations that
the Collector applies to the signal.

Processors are optional, although some
[are recommended](https://github.com/open-telemetry/opentelemetry-collector/tree/main/processor#recommended-processors).

You can configure processors using the `processors` section of the Collector
configuration file. Any setting you specify overrides the default values, if
present.

> Configuring a processor does not enable it. Processors are enabled by adding
> them to the appropriate pipelines within the [service](#service) section.

The following example shows several default processors in the same configuration
file. You can find the full list of processors by combining the list from
[opentelemetry-collector-contrib](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor)
and the list from
[opentelemetry-collector](https://github.com/open-telemetry/opentelemetry-collector/tree/main/processor).

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

> For detailed processor configuration, see the
> [processor README](https://github.com/open-telemetry/opentelemetry-collector/blob/main/processor/README.md).

## Exporters <img width="35" class="img-initial" alt="" src="/img/logos/32x32/Exporters.svg"> {#exporters}

Exporters send data to one or more backends or destinations. Exporters can be
pull or push based, and may support one or more
[data sources](/docs/concepts/signals/).

The `exporters` section contains exporters configuration. Most exporters require
configuration to specify at least the destination, as well as security settings,
like authentication tokens or TLS certificates. Any setting you specify
overrides the default values, if present.

> Configuring an exporter does not enable it. Exporters are enabled by adding
> them to the appropriate pipelines within the [service](#service) section.

The Collector requires one or more exporters. The following example shows
various exporters in the same configuration file:

```yaml
exporters:
  # Data sources: traces, metrics, logs
  file:
    path: ./filename.json

  # Data sources: traces
  otlp/jaeger:
    endpoint: jaeger-server:4317
    tls:
      cert_file: cert.pem
      key_file: cert-key.pem

  # Data sources: traces, metrics, logs
  kafka:
    protocol_version: 2.0.0

  # Data sources: traces, metrics, logs
  # NOTE: Prior to v0.86.0 use `logging` instead of `debug`
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
    endpoint: https://otlp.example.com:4318

  # Data sources: metrics
  prometheus:
    endpoint: 0.0.0.0:8889
    namespace: default

  # Data sources: metrics
  prometheusremotewrite:
    endpoint: http://prometheus.example.com:9411/api/prom/push
    # When using the official Prometheus (running via Docker)
    # endpoint: 'http://prometheus:9090/api/v1/write', add:
    # tls:
    #   insecure: true

  # Data sources: traces
  zipkin:
    endpoint: http://zipkin.example.com:9411/api/v2/spans
```

Notice that some exporters require x.509 certificates in order to establish
secure connections, as described in
[setting up certificates](#setting-up-certificates).

> For more information on exporter configuration, see the
> [exporter README.md](https://github.com/open-telemetry/opentelemetry-collector/blob/main/exporter/README.md).

## Connectors <img width="32" class="img-initial" alt="" src="/img/logos/32x32/Load_Balancer.svg"> {#connectors}

Connectors join two pipelines, acting as both exporter and receiver. A connector
consumes data as an exporter at the end of one pipeline and emits data as a
receiver at the beginning of another pipeline. The data consumed and emitted may
be of the same type or of different data types. You can use connectors to
summarize consumed data, replicate it, or route it.

You can configure one or more connectors using the `connectors` section of the
Collector configuration file. By default, no connectors are configured. Each
type of connector is designed to work with one or more pairs of data types and
may only be used to connect pipelines accordingly.

> Configuring a connector doesn't enable it. Connectors are enabled through
> pipelines within the [service](#service) section.

The following example shows the `count` connector and how it's configured in the
`pipelines` section. Notice that the connector acts as an exporter for traces
and as a receiver for metrics, connecting both pipelines:

```yaml
receivers:
  foo:

exporters:
  bar:

connectors:
  count:
    spanevents:
      my.prod.event.count:
        description: The number of span events from my prod environment.
        conditions:
          - 'attributes["env"] == "prod"'
          - 'name == "prodevent"'

service:
  pipelines:
    traces:
      receivers: [foo]
      exporters: [count]
    metrics:
      receivers: [count]
      exporters: [bar]
```

> For detailed connector configuration, see the
> [connector README](https://github.com/open-telemetry/opentelemetry-collector/blob/main/connector/README.md).

## Extensions

Extensions are optional components that expand the capabilities of the Collector
to accomplish tasks not directly involved with processing telemetry data. For
example, you can add extensions for Collector health monitoring, service
discovery, or data forwarding, among others.

You can configure extensions through the `extensions` section of the Collector
configuration file. Most extensions come with default settings, so you can
configure them just by specifying the name of the extension. Any setting you
specify overrides the default values, if present.

> Configuring an extension doesn't enable it. Extensions are enabled within the
> [service](#service) section.

By default, no extensions are configured. The following example shows several
extensions configured in the same file:

```yaml
extensions:
  health_check:
  pprof:
  zpages:
  memory_ballast:
    size_mib: 512
```

> For detailed extension configuration, see the
> [extension README](https://github.com/open-telemetry/opentelemetry-collector/blob/main/extension/README.md).

## Service section {#service}

The `service` section is used to configure what components are enabled in the
Collector based on the configuration found in the receivers, processors,
exporters, and extensions sections. If a component is configured, but not
defined within the `service` section, then it's not enabled.

The service section consists of three subsections:

- Extensions
- Pipelines
- Telemetry

### Extensions {#service-extensions}

The `extensions` subsection consists of a list of desired extensions to be
enabled. For example:

```yaml
service:
  extensions: [health_check, pprof, zpages]
```

### Pipelines

The `pipelines` subsection is where the pipelines are configured, which can be
of the following types:

- `traces` collect and processes trace data.
- `metrics` collect and processes metric data.
- `logs` collect and processes log data.

A pipeline consists of a set of receivers, processors and exporters. Before
including a receiver, processor, or exporter in a pipeline, make sure to define
its configuration in the appropriate section.

You can use the same receiver, processor, or exporter in more than one pipeline.
When a processor is referenced in multiple pipelines, each pipeline gets a
separate instance of the processor.

The following is an example of pipeline configuration. Note that the order of
processors dictates the order in which data is processed:

```yaml
service:
  pipelines:
    metrics:
      receivers: [opencensus, prometheus]
      processors: [batch]
      exporters: [opencensus, prometheus]
    traces:
      receivers: [opencensus, jaeger]
      processors: [batch, memory_limiter]
      exporters: [opencensus, zipkin]
```

### Telemetry

The `telemetry` is where the telemetry for the Collector itself can be
configured. Collector's own telemetry can be useful when troubleshooting
Collector issues. It consists of two subsections: `logs` and `metrics`.

The `logs` subsection lets you configure how the logs can be generated by the
Collector. By default, the Collector writes its logs to `stderr` with a log
level of `INFO`. You can also add static key-value pairs to all log entries with
the `initial_fields` to enrich the logging context. The [`logs` configuration
options](https://github.com/open-telemetry/opentelemetry-collector/blob/v{{%
param vers %}}/service/telemetry/config.go) are:

- `level`: sets the minimum enabled logging level, default `INFO`.
- `development`: puts the logger in development mode, default `false`.
- `encoding`: sets the logger's encoding, default `console`. Example values are
  `json`, `console`.
- `disable_caller`: stops annotating logs with the calling function's file name
  and line number. By default `false`, all logs are annotated.
- `disable_stacktrace`: disables automatic stacktrace capturing, default
  `false`. By default, stacktraces are captured for `WARN` level and above logs
  in development and `ERROR` level and above in production.
- `sampling`: sets a sampling policy.
- `output_paths`: a list of URLs or file paths to write logging output to,
  default `["stderr"]`.
- `error_output_paths`: a list of URLs or file paths to write logger errors to,
  default `["stderr"]`.
- `initial_fields`: a collection of fields to add to the root logger. By
  default, there is no initial field.

The `metrics` subsection lets you configure how the metrics can be generated and
exposed by the Collector. By default, the Collector generates basic metrics
about itself and expose them for scraping at <http://127.0.0.1:8888/metrics>.
You can expose the endpoint to a specific or even all network interfaces when
needed. The [`metrics` configuration
options](https://github.com/open-telemetry/opentelemetry-collector/blob/v{{%
param vers %}}/service/telemetry/config.go) are:

- `level`: the level of telemetry metrics, default `basic`. The possible values
  are:
  - `none`: no telemetry is collected.
  - `basic`: essential service telemetry.
  - `normal`: the default level, adds standard indicators on top of basic.
  - `detailed`: the most verbose level, includes dimensions and views.
- `address`: the `[address]:port` formatted URL that metrics exposition should
  be bound to. Default `127.0.0.1:8888`.

The following example shows the Collector telemetry configuration:

```yaml
service:
  telemetry:
    logs:
      level: DEBUG
      initial_fields:
        service: my-instance
    metrics:
      level: detailed
      address: 0.0.0.0:8888
```

Note that it's possible to scrape the metrics by using a
[Prometheus receiver](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/receiver/prometheusreceiver)
within the Collector configuration so that we can consume the Collector's
metrics at the backend. For example:

```yaml
receivers:
  prometheus:
    trim_metric_suffixes: true
    use_start_time_metric: true
    start_time_metric_regex: .*
    config:
      scrape_configs:
        - job_name: 'otel-collector'
          scrape_interval: 5s
          static_configs:
            - targets: ['127.0.0.1:8888']

exporters:
  otlp:
    endpoint: my.company.com:4317
    tls:
      insecure: true

service:
  pipelines:
    metrics:
      receivers: [prometheus]
      exporters: [otlp]
```

## Other Information

### Environment variables

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

### Proxy support

Exporters that use the [`net/http`](https://pkg.go.dev/net/http) package respect
the following proxy environment variables:

- `HTTP_PROXY`: Address of the HTTP proxy
- `HTTPS_PROXY`: Address of the HTTPS proxy
- `NO_PROXY`: Addresses that must not use the proxy

If set at Collector start time, exporters, regardless of the protocol, proxy
traffic or bypass proxy traffic as defined by these environment variables.

### Authentication

Most receivers exposing an HTTP or gRPC port can be protected using the
Collector's authentication mechanism. Similarly, most exporters using HTTP or
gRPC clients can add authentication to outgoing requests.

The authentication mechanism in the Collector uses the extensions mechanism,
allowing for custom authenticators to be plugged into Collector distributions.
Each authentication extension has two possible usages:

- As client authenticator for exporters, adding auth data to outgoing requests
- As server authenticator for receivers, authenticating incoming connections.

For a list of known authenticators, see the
[Registry](/ecosystem/registry/?s=authenticator&component=extension). If you're
interested in developing a custom authenticator, see
[Building an authenticator extension](../building/authenticator-extension).

To add a server authenticator to a receiver in the Collector, follow these
steps:

1. Add the authenticator extension and its configuration under `.extensions`.
2. Add a reference to the authenticator to `.services.extensions`, so that it's
   loaded by the Collector.
3. Add a reference to the authenticator under
   `.receivers.<your-receiver>.<http-or-grpc-config>.auth`.

The following example uses the OIDC authenticator on the receiver side, making
this suitable for a remote Collector that receives data from an OpenTelemetry
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
        endpoint: 0.0.0.0:4317
        auth:
          authenticator: oidc

processors:

exporters:
  # NOTE: Prior to v0.86.0 use `logging` instead of `debug`.
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
tokens, adding them to every RPC made to a remote Collector:

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
        endpoint: 0.0.0.0:4317

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

### Configuring certificates {#setting-up-certificates}

In a production environment, use TLS certificates for secure communication or
mTLS for mutual authentication. Follow these steps to generate self-signed
certificates as in this example. You might want to use your current cert
provisioning procedures to procure a certificate for production usage.

Install [`cfssl`](https://github.com/cloudflare/cfssl) and create the following
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

Then run the following commands:

```sh
cfssl genkey -initca csr.json | cfssljson -bare ca
cfssl gencert -ca ca.pem -ca-key ca-key.pem csr.json | cfssljson -bare cert
```

This creates two certificates:

- An "OpenTelemetry Example" Certificate Authority (CA) in `ca.pem`, with the
  associated key in `ca-key.pem`
- A client certificate in `cert.pem`, signed by the OpenTelemetry Example CA,
  with the associated key in `cert-key.pem`.

[dcc]: /docs/concepts/components/#collector

## Override settings

You can override Collector settings using the `--set` option. The settings you
define with this method are merged into the final configuration after all
`--config` sources are resolved and merged.

The following examples show how to override settings inside nested sections:

```sh
otelcol --set "exporters::debug::verbosity=detailed"
otelcol --set "receivers::otlp::protocols::grpc={endpoint:localhost:4317, compression: gzip}"
```

{{% alert title="Important" color="warning" %}}

The `--set` option doesn't support setting a key that contains a dot or an equal
sign.

{{% /alert %}}
