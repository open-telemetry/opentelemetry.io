---
title: Configure OBI Prometheus and OpenTelemetry data export
linkTitle: Export data
description:
  Configure the OBI components to export Prometheus and OpenTelemetry metrics
  and OpenTelemetry traces
weight: 10
---

OBI can export OpenTelemetry metrics and traces to a OTLP endpoint.

## OpenTelemetry metrics exporter component

YAML section: `otel_metrics_export`

Enable the OpenTelemetry metrics export component by setting the endpoint
attribute in your configuration file or via an environment variable, refer to
[metric export configuration options](#opentelemetry-metrics-exporter-component).

Configure the component under the `otel_metrics_export` section of your YAML
configuration or via environment variables.

In addition to the configuration documented in this article, the component
supports environment variables from the
[standard OpenTelemetry exporter configuration](/docs/languages/sdk-configuration/otlp-exporter/).

For example:

```yaml
otel_metrics_export:
  ttl: 5m
  endpoint: http://otelcol:4318
  protocol: grpc
  buckets:
    duration_histogram: [0, 1, 2]
  histogram_aggregation: base2_exponential_bucket_histogram
```

| YAML<br>environment variable                                                             | Description                                                                                                                                                                                                                                                                                                  | Type            | Default                     |
| ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------- | --------------------------- |
| `endpoint`<br>`OTEL_EXPORTER_OTLP_METRICS_ENDPOINT`                                      | The endpoint OBI sends metrics to.                                                                                                                                                                                                                                                                           | URL             |                             |
| `OTEL_EXPORTER_OTLP_ENDPOINT`                                                            | The shared endpoint for metrics and traces exporters. OBI adds `/v1/metrics` path to the URL when sending metrics, following the OpenTelemetry standard. To prevent this behavior, use the metrics specific setting.                                                                                         | URL             |                             |
| `protocol`<br>`OTEL_EXPORTER_OTLP_METRICS_PROTOCOL`                                      | The protocol transport/encoding of the OpenTelemetry endpoint, refer to [metrics export protocol](#metrics-export-protocol). [Accepted values](/docs/languages/sdk-configuration/otlp-exporter/#otel_exporter_otlp_protocol) `http/json`, `http/protobuf`, and `grpc`.                                       | string          | Inferred from port usage    |
| `OTEL_EXPORTER_OTLP_PROTOCOL`                                                            | Similar to the shared endpoint, the protocol for metrics and traces.                                                                                                                                                                                                                                         | string          | Inferred from port usage    |
| `insecure_skip_verify`<br>`OTEL_EBPF_INSECURE_SKIP_VERIFY`                               | If `true`, OBI skips verifying and accepts any server certificate. Only override this setting for non-production environments.                                                                                                                                                                               | boolean         | `false`                     |
| `interval`<br>`OTEL_EBPF_METRICS_INTERVAL`                                               | The duration between exports.                                                                                                                                                                                                                                                                                | Duration        | `60s`                       |
| `allow_service_graph_self_references`<br>`OTEL_EBPF_ALLOW_SERVICE_GRAPH_SELF_REFERENCES` | Controls if OBI includes self-referencing services in service graph generation, for example a service that calls itself. Self referencing reduces service graph usefulness and increases data cardinality.                                                                                                   | boolean         | `false`                     |
| `instrumentations`<br>`OTEL_EBPF_METRICS_INSTRUMENTATIONS`                               | The list of metrics instrumentation OBI collects data for, refer to [metrics instrumentation](#metrics-instrumentation) section.                                                                                                                                                                             | list of strings | `["*"]`                     |
| `buckets`                                                                                | Sets how you can override bucket boundaries of diverse histograms, refer to [override histogram buckets](../metrics-histograms/).                                                                                                                                                                            | (n/a)           | Object                      |
| `histogram_aggregation`<br>`OTEL_EXPORTER_OTLP_METRICS_DEFAULT_HISTOGRAM_AGGREGATION`    | Sets the default aggregation OBI uses for histogram instruments. Accepted values [`explicit_bucket_histogram`](/docs/specs/otel/metrics/sdk/#explicit-bucket-histogram-aggregation) or [`base2_exponential_bucket_histogram`](/docs/specs/otel/metrics/sdk/#base2-exponential-bucket-histogram-aggregation). | `string`        | `explicit_bucket_histogram` |

### Metrics export protocol

If you don't set a protocol OBI sets the protocol as follows:

- `grpc`: if the port ends in `4317`, for example `4317`, `14317`, or `24317`.
- `http/protobuf`: if the port ends in `4318`, for example `4318`, `14318`, or
  `24318`.

### Metrics instrumentation

The list of instrumentation areas OBI can collection data from:

- `*`: all instrumentation, if `*` is present OBI ignores other values
- `http`: HTTP/HTTPS/HTTP/2 application metrics
- `grpc`: gRPC application metrics
- `sql`: SQL database client call metrics
- `redis`: Redis client/server database metrics
- `kafka`: Kafka client/server message queue metrics

For example, setting the `instrumentations` option to: `http,grpc` enables the
collection of `HTTP/HTTPS/HTTP2` and `gRPC` application metrics, and disables
other instrumentation.

## OpenTelemetry traces exporter component

YAML section: `otel_traces_export`

You can configure the component under the `otel_traces_export` section of your
YAML configuration or via environment variables.

In addition to the configuration documented in this article, the component
supports the environment variables from the
[standard OpenTelemetry exporter configuration](/docs/languages/sdk-configuration/otlp-exporter/).

```yaml
otel_traces_export:
  endpoint: http://jaeger:4317
  protocol: grpc
  instrumentations: ["http, "sql"]
```

| YAML<br>environment variable                                                        | Description                                                                                                                                                                                                                                                          | Type            | Default                  |
| ----------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------- | ------------------------ |
| `endpoint`<br>`OTEL_EXPORTER_OTLP_TRACES_ENDPOINT`<br>`OTEL_EXPORTER_OTLP_ENDPOINT` | The endpoint OBI sends traces to. When using `OTEL_EXPORTER_OTLP_ENDPOINT`, OBI follows the OpenTelemetry standard and automatically adds `/v1/traces` path to the URL. If you don't want this to happen, use the traces specific setting.                           | URL             |                          |
| `protocol`<br>`OTEL_EXPORTER_OTLP_TRACES_PROTOCOL`<br>`OTEL_EXPORTER_OTLP_PROTOCOL` | The protocol transport/encoding of the OpenTelemetry endpoint, refer to [traces export protocol](#traces-export-protocol). [Accepted values](/docs/languages/sdk-configuration/otlp-exporter/#otel_exporter_otlp_protocol) `http/json`, `http/protobuf`, and `grpc`. | string          | Inferred from port usage |
| `insecure_skip_verify`<br>`OTEL_EBPF_INSECURE_SKIP_VERIFY`                          | If `true`, OBI skips verifying and accepts any server certificate. Only override this setting for non-production environments.                                                                                                                                       | boolean         | `false`                  |
| `instrumentations`<br>`OTEL_EBPF_TRACES_INSTRUMENTATIONS`                           | The list of instrumentation OBI collects data for, refer to [traces instrumentation](#traces-instrumentation) section.                                                                                                                                               | list of strings | `["*"]`                  |

### Traces export protocol

If you don't set a protocol OBI sets the protocol as follows:

- `grpc`: if the port ends in `4317`, for example `4317`, `14317`, or `24317`.
- `http/protobuf`: if the port ends in `4318`, for example `4318`, `14318`, or
  `24318`.

### Traces instrumentation

The list of instrumentation areas OBI can collection data from:

- `*`: all instrumentation, if `*` is present OBI ignores other values
- `http`: HTTP/HTTPS/HTTP/2 application traces
- `grpc`: gRPC application traces
- `sql`: SQL database client call traces
- `redis`: Redis client/server database traces
- `kafka`: Kafka client/server message queue traces

For example, setting the `instrumentations` option to: `http,grpc` enables the
collection of `HTTP/HTTPS/HTTP2` and `gRPC` application traces, and disables
other instrumentation.

## Prometheus exporter component

YAML section: `prometheus_export`

You can configure the component under the `prometheus_export` section of your
YAML configuration or via environment variables. This component opens an HTTP
endpoint in the auto-instrumentation tool that allows any external scraper to
pull metrics in Prometheus format. It is enabled if the `port` property is set.

```yaml
prometheus_export:
  port: 8999
  path: /metrics
  extra_resource_attributes: ["deployment_environment"]
  ttl: 1s
  buckets:
    request_size_histogram: [0, 10, 20, 22]
    response_size_histogram: [0, 10, 20, 22]
  instrumentations: ["http, "sql"]
```

| YAML<br>environment variable                                                                        | Description                                                                                                                                                                                                                       | Type            | Default           |
| --------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------- | ----------------- |
| `port`<br>`OTEL_EBPF_PROMETHEUS_PORT`                                                               | The HTTP port for the Prometheus scrape endpoint. If unset or 0, no Prometheus endpoint is open.                                                                                                                                  | int             |                   |
| `path`<br>`OTEL_EBPF_PROMETHEUS_PATH`                                                               | The HTTP query path to fetch the list of Prometheus metrics.                                                                                                                                                                      | string          | `/metrics`        |
| `extra_resource_attributes`<br>`OTEL_EBPF_PROMETHEUS_EXTRA_RESOURCE_ATTRIBUTES`                     | A list of additional resource attributes to be added to the reported `target_info` metric. Refer to [extra resource attributes](#prometheus-extra-resource-attributes) for important details about runtime discovered attributes. | list of strings |                   |
| `ttl`<br>`OTEL_EBPF_PROMETHEUS_TTL`                                                                 | The duration after which metric instances are not reported if they haven't been updated. Used to avoid reporting indefinitely finished application instances.                                                                     | Duration        | `5m`              |
| `buckets`                                                                                           | Sets how you can override bucket boundaries of diverse histograms, refer to [override histogram buckets](../metrics-histograms/).                                                                                                 | Object          |                   |
| `allow_service_graph_self_references`<br>`OTEL_EBPF_PROMETHEUS_ALLOW_SERVICE_GRAPH_SELF_REFERENCES` | Does OBI include self-referencing service in service graph generation. Self referencing isn't useful for service graphs and increases data cardinality.                                                                           | boolean         | `false`           |
| `instrumentations`<br>`OTEL_EBPF_PROMETHEUS_INSTRUMENTATIONS`                                       | The list of instrumentation OBI collects data for, refer to [Prometheus instrumentation](#prometheus-instrumentation) section.                                                                                                    | list of strings | `["*"]`           |

### Prometheus extra resource attributes

Due to internal limitations of the Prometheus API client, OBI needs to know
beforehand which attributes are exposed for each metric. This would cause that
some attributes that are discovered at runtime, during instrumentation, won't be
visible by default. For example, attributes defined on each application via
Kubernetes annotations, or in the target application's
`OTEL_RESOURCE_ATTRIBUTES` environment variable.

For example, an application defining the
`OTEL_RESOURCE_ATTRIBUTES=deployment.environment=production` as environment
variable, the `target_info{deployment.environment="production"}` attribute would
be visible by default if the metrics are exported via OpenTelemetry but not if
they are exported via Prometheus.

To make `deployment_environment` visible in Prometheus, you need to add it to
the `extra_resource_attributes` list.

### Prometheus instrumentation

The list of instrumentation areas OBI can collection data from:

- `*`: all instrumentation, if `*` is present OBI ignores other values
- `http`: HTTP/HTTPS/HTTP/2 application metrics
- `grpc`: gRPC application metrics
- `sql`: SQL database client call metrics
- `redis`: Redis client/server database metrics
- `kafka`: Kafka client/server message queue metrics

For example, setting the `instrumentations` option to: `http,grpc` enables the
collection of `HTTP/HTTPS/HTTP2` and `gRPC` application metrics, and disables
other instrumentation.

## Metrics export features

OBI allows you to select which metric groups are exported, either globally or
on a per-application basis (for each group in the [metrics discovery](./)
configuration section).

The top-level `metrics > features` YAML option (or the `OTEL_EBPF_METRICS_FEATURES`
environment variable) controls the metric groups that OBI exports.

For example:
```yaml
otel_metrics_export:
  endpoint: http://otelcol:4318
metrics:
  features:
    - application_service_graph
    - network
    - network_inter_zone
```

The following values are accepted:

- `application`: Application-level metrics.
- `application_span`: Application-level trace span metrics.
- `application_host`: Application-level host metrics for host-based pricing.
- `application_service_graph`: Application-level service graph metrics. We
  recommend using DNS for service discovery and ensuring that DNS names
  match the OpenTelemetry service names used by OBI. In Kubernetes environments,
  the OpenTelemetry service name set by service discovery is the best
  choice for service graph metrics.
- `application_process`: Metrics for the processes running the instrumented
  application.
- `network`: Network-level metrics; refer to the
  [network metrics](../../network) configuration documentation for details.
- `network_inter_zone`: Network inter-zone metrics; refer to the
  [network metrics](../../network/) configuration documentation for details.

Additionally, OBI allows you to override global metrics export features on a per-application
basis by adding `metrics > features` as a property to each `instrument > discovery` entry.

For example, in the following configuration:
- The `apache`, `nginx`, and `tomcat` service instances will only export `application_service_graph` metrics (as defined in the top-level `metrics > features` configuration).
- The `pyserver` service will only export the `application` group of metrics.
- Services listening on ports 3030 or 3040 will export the `application`, `application_span`, and `application_service_graph` metric groups.

```yaml
metrics:
  features: ["application_service_graph"]
discovery:
  instrument:
    - open_ports: 3030,3040
      metrics:
        features:
          - "application"
          - "application_span"
          - "application_service_graph"
    - name: pyserver
      open_ports: 7773
      metrics:
        features:
          - "application"
    - name: apache
      open_ports: 8080
    - name: nginx
      open_ports: 8085
    - name: tomcat
      open_ports: 8090
```
