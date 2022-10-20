---
title: "Configuration"
weight: 20
---

Review the following documentation to gain understanding of the repositories applicable to 
the OpenTelemetry Collector and security standards respectively:

- [Data Collection concepts](../../concepts/data-collection)
- [Security guidance](https://github.com/open-telemetry/opentelemetry-collector/blob/main/docs/security.md)

## Components
The OpenTelemetry Collector consists of three components for accessing telemetry data:

- <img width="32" src="https://raw.github.com/open-telemetry/opentelemetry.io/main/iconography/32x32/Receivers.svg"></img>
[Receivers](#receivers)
- <img width="32" src="https://raw.github.com/open-telemetry/opentelemetry.io/main/iconography/32x32/Processors.svg"></img>
[Processors](#processors)
- <img width="32" src="https://raw.github.com/open-telemetry/opentelemetry.io/main/iconography/32x32/Exporters.svg"></img>
[Exporters](#exporters)

After configuring these components, they must be enabled via pipelines within the
[service](#service) section.

Furthermore, there are [extensions](#extensions) which provide capabilities
that can be added to the Collector, but do not require direct access to
telemetry data. They are also enabled within the
[service](#service) section, although they are not part of pipelines.

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

Note that _receivers_, _processors_, _exporters_ and _pipelines_ are defined via component identifiers in
`type[/name]` format (e.g. `otlp` or `otlp/2`).  Components of a given type can be defined more than 
once as long as the identifiers are unique. For example:

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
<img width="35" src="https://raw.github.com/open-telemetry/opentelemetry.io/main/iconography/32x32/Receivers.svg"></img>

Many receivers come with their own default settings. When configuring these kinds of receivers, 
specifying the name of the receiver is enough. An example of such receivers is provided in the YAML
configuration script below (see `zipkin:`). 

If further configuration is required or the user wants to change the default configuration, 
then the modifications must be defined under the receiver-specific section (e.g. under `hostmetrics` or `fluentforward`) in the script. 
The default configuration parameters specified in the receiver are consequently overridden.

> Configuring a receiver does not enable it. Receivers are enabled via
> pipelines within the [service](#service) section.

At least one or more receivers must be configured. By default, no receivers
are configured. A basic example of some available receivers is provided below:

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

> For detailed receiver configuration, please see the [receiver
README.md](https://github.com/open-telemetry/opentelemetry-collector/blob/main/receiver/README.md).

## Processors

<img width="35" src="https://raw.github.com/open-telemetry/opentelemetry.io/main/iconography/32x32/Processors.svg"></img>

Processors may come with their own default settings, but many of them require configuration. Any configuration for a
processor must be done in the `processors` section and the default configuration parameters specified 
in the processor are consequently overridden. The order of the components
in the configuration script matters for processors because the data is transported 
serially from one processor to the other.

> Configuring a processor does not enable it. Processors are enabled via
> pipelines within the [service](#service) section.

A basic example of the default processors is provided below. A full list of 
processors can be found [here](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor).

> For detailed processor configuration, please see the [processor
README.md](https://github.com/open-telemetry/opentelemetry-collector/blob/main/processor/README.md).

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

<img width="35" src="https://raw.github.com/open-telemetry/opentelemetry.io/main/iconography/32x32/Exporters.svg"></img>
An exporter, which can be push or pull based, is how you send data to one or
more backends/destinations. Exporters may support one or more [data
sources](../../concepts/signals).

Exporters are configured in the `exporters:` section of the YAML configuration file. Exporters may come
with their own default settings, but many require configuration to specify at least the
destination and security settings. Any configuration for an exporter must be
done in this section. The default configuration parameters specified in the exporter are consequently overridden.

> Configuring an exporter does not enable it. Exporters are enabled via
> pipelines within the [service](#service) section.

One or more exporters must be configured. By default, no exporters are
configured. A basic example of all available exporters is provided below.
Certain exporter configurations require x.509 certificates to be created in
order to be secure, as described in [setting up
certificates](#setting-up-certificates).

> For detailed exporter configuration, please see the [exporter
README.md](https://github.com/open-telemetry/opentelemetry-collector/blob/main/exporter/README.md).

```yaml
exporters:
  # Data sources: traces, metrics, logs
  file:
    path: ./filename.json

  # Data sources: traces
  jaeger:
    endpoint: "jaeger-all-in-one:14250"
    tls:
      cert_file: cert.pem
      key_file: cert-key.pem

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
    endpoint: otelcol2:4317
    tls:
      cert_file: cert.pem
      key_file: cert-key.pem

  # Data sources: traces, metrics
  otlphttp:
    endpoint: https://example.com:4318/v1/traces

  # Data sources: metrics
  prometheus:
    endpoint: "prometheus:8889"
    namespace: "default"

  # Data sources: metrics
  prometheusremotewrite:
    endpoint: "http://some.url:9411/api/prom/push"
    # For offical Prometheus (e.g. running via Docker)
    # endpoint: 'http://prometheus:9090/api/v1/write'
    # tls:
    #   insecure: true

  # Data sources: traces
  zipkin:
    endpoint: "http://localhost:9411/api/v2/spans"
```

## Extensions
Extensions are available primarily for tasks that do not involve processing telemetry
data.

Extensions are configured in the `extensions:` section of the YAML configuration file. Many extensions
come with their own default settings so simply specifying the name of the extension is
enough to configure it. An example of such extensions is provided in the YAML script below (see `health_check:`).
If configuration is required or a user wants to change the default configuration then such
configuration must be defined under the `extensions` section. The
default configuration parameters specified in the extensions are consequently overridden.

> Configuring an extension does not enable it. Extensions are enabled within
> the [service](#service) section.

By default, no extensions are configured. A basic example of all available
extensions is provided below.

> For detailed extension configuration, please see the [extension
README.md](https://github.com/open-telemetry/opentelemetry-collector/blob/main/extension/README.md).

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
consists of three subsections:

- extensions
- pipelines
- telemetry

Extensions consist of a list of all extensions to enable. For example:

```yaml
    service:
      extensions: [health_check, pprof, zpages]
```

Pipelines can be of the following types:

- _traces_: collects and processes trace data.
- _metrics_: collects and processes metric data.
- _logs_: collects and processes log data.

A pipeline consists of a set of receivers, processors and exporters. Each
receiver/processor/exporter must be defined in the configuration outside of the
service section to be included in a pipeline.

***Note**:* Each receiver/processor/exporter can be used in more than one pipeline.
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

Telemetry is where the telemetry for the collector itself can be configured.  It has two subsections: `logs` and `metrics`.

The `logs` subsection allows configuration of the logs generated by the collector.  By default the collector will write its logs to stderr with a log level of `INFO`.  You can also add static key-value pairs to all logs using the `initial_fields` section.  [View the full list of `logs` options here.](https://github.com/open-telemetry/opentelemetry-collector/blob/7666eb04c30e5cfd750db9969fe507562598f0ae/config/service.go#L41-L97)

The `metrics` subsection allows configuration of the metrics generated by the collector.  By default the collector will generate basic metrics about itself and expose them for scraping at `localhost:8888/metrics`  [View the full list of `metrics` options here.](https://github.com/open-telemetry/opentelemetry-collector/blob/7666eb04c30e5cfd750db9969fe507562598f0ae/config/service.go#L99-L111)

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
configuration using shell-style syntax. For example:

```yaml
processors:
  attributes/example:
    actions:
      - key: "${DB_KEY}"
        action: "$OPERATION"
```

Use `$$` to indicate a literal `$`. For example, representing
`$DataVisualization` would look like the following: 

```yaml
exporters:
  prometheus:
    endpoint: "prometheus:8889"
    namespace: "$$DataVisualization"
```

### Proxy Support

Exporters that leverage the net/http package (apparently all today) respect the
following proxy environment variables:

- HTTP_PROXY
- HTTPS_PROXY
- NO_PROXY

If set at Collector start time then exporters, regardless of protocol, will or
will not proxy traffic as defined by these environment variables.

### Authentication

Most receivers exposing an HTTP or gRPC port are able to be protected using the collector's
authentication mechanism, and most exporters using HTTP or gRPC clients are able to add
authentication data to the outgoing requests.

The authentication mechanism in the collector uses the extensions mechanism, allowing for
custom authenticators to be plugged into collector distributions. If you are interested
in developing a custom authenticator, check out the ["Building a custom authenticator"](../custom-auth) document.

Each authentication extension has two possible usages: as client authenticator for exporters,
adding auth data to outgoing requests, and as server authenticator for receivers, authenticating
incoming connections. Refer to the authentication extension for a list of its capabilities, but
in general, an authentication extension would only implement one of those traits. For a list of
known authenticators, use the [Registry](/registry/?s=authenticator&component=extension&language=) available in this website.

To add a server authenticator to a receiver in your collector, make sure to:

1. add the authenticator extension and its configuration under `.extensions`
1. add a reference to the authenticator to `.services.extensions`, so that it's loaded by the collector
1. add a reference to the authenticator under `.receivers.<your-receiver>.<http-or-grpc-config>.auth`

Here's an example that uses the OIDC authenticator on the receiver side, making this suitable for
a remote collector that receives data from an OpenTelemetry Collector acting as agent:

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
  logging:

service:
  extensions:
    - oidc
  pipelines:
    traces:
      receivers:
        - otlp/auth
      processors: []
      exporters:
        - logging
```

On the agent side, this is an example that makes the OTLP exporter obtain OIDC tokens, adding
them to every RPC made to a remote collector:

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
    "hosts": [
        "localhost",
        "127.0.0.1"
    ],
    "key": {
        "algo": "rsa",
        "size": 2048
    },
    "names": [
        {
            "O":  "OpenTelemetry Example"
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
