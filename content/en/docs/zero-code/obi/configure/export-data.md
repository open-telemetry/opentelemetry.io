---
title: Configure OBI Prometheus and OpenTelemetry data export
linkTitle: Export data
description:
  Configure the OBI components to export Prometheus and OpenTelemetry metrics
  and OpenTelemetry traces
weight: 10
# prettier-ignore
cSpell:ignore: AsterixDB couchbase jackc memcached pgxpool pyserver spanmetrics
---

OBI can export OpenTelemetry metrics and traces to a OTLP endpoint.

## Common metrics configuration

YAML section: `metrics`.

The `metrics` section contains the common configuration for the OpenTelemetry
metrics and traces exporters.

It currently supports selecting the different sets of metrics to export.

Example:

```yaml
metrics:
  features: ['network', 'network_inter_zone']
```

| YAML<br>environment variable               | Description                                                                                                                                                                                                                                           | Type            | Default           |
| ------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------- | ----------------- |
| `features`<br>`OTEL_EBPF_METRICS_FEATURES` | The list of metric groups OBI exports data for, refer to [metrics export features](#metrics-export-features). Accepted values `application`, `application_span`, `application_host`, `application_service_graph`, `network` and `network_inter_zone`. | list of strings | `["application"]` |

### Metrics export features

The OBI metrics exporter can export the following metrics data groups for
processes matching entries in the [metrics discovery](./) configuration.

- `application`: Application-level metrics.
- `application_host`: Application-level host metrics for host-based pricing.
- `application_span`: Application-level trace span metrics in legacy format
  (like `traces_spanmetrics_latency`); `spanmetrics` is not separate.
- `application_span_otel`: Application-level trace span metrics in OpenTelemetry
  format (like `traces_span_metrics_calls_total`); `span_metrics` is separate.
- `application_span_sizes`: Application-level trace span metrics reporting
  information about request and response sizes.
- `application_service_graph`: Application-level service graph metrics. It's
  recommended to use a DNS for service discovery and to ensure the DNS names
  match the OpenTelemetry service names OBI uses. In Kubernetes environments,
  the OpenTelemetry service name set by the service name discovery is the best
  choice for service graph metrics.
- `network`: Network-level metrics, refer to the
  [network metrics](../../network) configuration documentation to learn more.
- `network_inter_zone`: Network inter-zone metrics, refer to the
  [network metrics](../../network/) configuration documentation to learn more.

### Per-application metrics export features

Additionally, OBI allows you to override global metrics export features on a
per-application basis by adding `metrics > features` as a property to each
`discovery > instrument` entry.

For example, in the following configuration:

- The `apache`, `nginx`, and `tomcat` service instances will only export
  `application_service_graph` metrics (as defined in the top-level
  `metrics > features` configuration).

- The `pyserver` service will only export the `application` group of metrics.

- Services listening on ports 3030 or 3040 will export the `application`,
  `application_span`, and `application_service_graph` metric groups.

```yaml
metrics:
  features: ['application_service_graph']
discovery:
  instrument:
    - open_ports: 3030,3040
      metrics:
        features:
          - 'application'
          - 'application_span'
          - 'application_service_graph'
    - name: pyserver
      open_ports: 7773
      metrics:
        features:
          - 'application'
    - name: apache
      open_ports: 8080
    - name: nginx
      open_ports: 8085
    - name: tomcat
      open_ports: 8090
```

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
- `sql`: SQL database client call metrics (includes PostgreSQL, MySQL and Go
  `database/sql` drivers like pgx)
- `redis`: Redis client/server database metrics
- `kafka`: Kafka client/server message queue metrics
- `mqtt`: MQTT publish/subscribe message metrics (MQTT 3.1.1 and 5.0)
- `couchbase`: Couchbase N1QL/SQL++ query metrics and KV (Key-Value) protocol
  metrics based on memcached protocol
- `gpu`: GPU performance metrics
- `mongo`: MongoDB client call metrics
- `dns`: DNS query metrics

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
- `sql`: SQL database client call metrics (includes PostgreSQL, MySQL and Go
  `database/sql` drivers like pgx)
- `redis`: Redis client/server database traces
- `kafka`: Kafka client/server message queue traces
- `mqtt`: MQTT publish/subscribe message traces (MQTT 3.1.1 and 5.0)
- `couchbase`: Couchbase N1QL/SQL++ query traces and KV (Key-Value) protocol
  traces, with query text and operation details
- `gpu`: GPU performance traces
- `mongo`: MongoDB client call traces
- `dns`: DNS query traces

For example, setting the `instrumentations` option to: `http,grpc` enables the
collection of `HTTP/HTTPS/HTTP2` and `gRPC` application traces, and disables
other instrumentation.

#### MQTT instrumentation

OBI automatically instruments MQTT communication, a lightweight messaging
protocol commonly used in IoT and embedded systems.

**Supported operations**:

- `publish`: Message publication to topics
- `subscribe`: Topic subscription requests

**Protocol versions**:

- MQTT 3.1.1
- MQTT 5.0

**What's captured**:

- Topic names (limited to first topic filter for subscribe operations)
- Operation latency
- Client-server communication patterns

**Limitations**:

- For subscribe operations, only the first topic filter is captured
- Message payloads are not captured to minimize overhead

**Example use case**: Monitor an IoT gateway publishing sensor data to an MQTT
broker, tracking message delivery rates and identifying communication issues.

#### PostgreSQL pgx driver instrumentation

OBI provides specialized instrumentation for pgx, a high-performance native Go
driver for PostgreSQL databases.

**What makes pgx special**: pgx instrumentation hooks directly into the Go
driver using Go-specific eBPF tracing, providing database-specific observability
without the overhead of generic network-level SQL instrumentation.

**Supported operations**:

- `Query`: SQL query execution with result sets
- Connection pooling (via pgxpool)
- Both native pgx API and database/SQL wrapper interface

**What's captured**:

- SQL query text
- PostgreSQL server hostname (extracted from pgx connection configuration)
- Operation duration and error details
- All standard database/SQL metric labels

**Supported pgx versions**: pgx v5.0.0 and later (tested up to v5.8.0). Also
supported via database/SQL wrapper: `github.com/jackc/pgx/v5/stdlib`

#### Couchbase instrumentation

Couchbase is a NoSQL document database that supports both direct key-value
access and SQL-like queries through SQL++, commonly used for applications with
flexible schemas and high availability requirements. OBI instruments Couchbase
operations through two protocols:

- **KV (Key-Value) protocol**: Binary protocol for direct key-value access on
  port 11210, based on an extension of the
  [Memcached Binary Protocol](https://github.com/couchbase/memcached/blob/master/docs/BinaryProtocol.md).
- **SQL++ (N1QL)**: HTTP-based query protocol on port 8093 via the
  `/query/service` endpoint.

##### KV (Key-Value) protocol

**What's captured**:

| Attribute                 | Source                 | Example             |
| ------------------------- | ---------------------- | ------------------- |
| `db.system.name`          | Constant               | `couchbase`         |
| `db.operation.name`       | Opcode                 | `GET`, `SET`        |
| `db.namespace`            | Bucket                 | `travel-sample`     |
| `db.collection.name`      | Scope + Collection     | `inventory.airline` |
| `db.collection.name`      | Collection             | `airline`           |
| `db.response.status_code` | Status code (on error) | `1`                 |
| `server.address`          | Connection info        | Server hostname     |
| `server.port`             | Connection info        | `11210`             |

**Bucket, scope, and collection tracking**: Couchbase uses a hierarchical
namespace: Bucket → Scope → Collection. Unlike per-request namespace protocols,
namespace is established at the connection level:

- `SELECT_BUCKET` (not traced): Sets the active bucket for all subsequent
  operations on the connection. Analogous to `USE database` in MySQL or
  `SELECT db_number` in Redis.
- `GET_COLLECTION_ID` (not traced): Resolves a `scope.collection` path to a
  numeric collection ID. OBI uses this to enrich span attributes with scope and
  collection names.

OBI maintains a per-connection cache of bucket, scope, and collection names and
uses it to annotate every subsequent span.

**Limitations**:

- If `SELECT_BUCKET` occurs before OBI starts, the bucket name is unknown for
  that connection
- If `GET_COLLECTION_ID` occurs before OBI starts, the collection name is not
  available
- Authentication and metadata operations are not captured
- These limitations only affect connections established before OBI
  initialization

##### SQL++ (N1QL) operations

SQL++ queries (the modern name for the N1QL query language) are automatically
detected through Couchbase's HTTP query service on port 8093 at the
`/query/service` endpoint.

**Supported operations**:

- All SQL++ query types: SELECT, INSERT, UPDATE, DELETE, UPSERT
- Bucket and collection operations accessed via SQL paths (e.g.,
  `bucket.scope.collection`)
- Cross-collection and cross-bucket queries

**What's captured**:

| Attribute                 | Source                       | Example                      |
| ------------------------- | ---------------------------- | ---------------------------- |
| `db.system.name`          | N1QL version header          | `couchbase` or `other_sql`   |
| `db.operation.name`       | SQL parser                   | `SELECT`, `INSERT`, `UPDATE` |
| `db.namespace`            | Table path / `query_context` | `travel-sample`              |
| `db.collection.name`      | Table path                   | `inventory.airline`          |
| `db.query.text`           | Request body                 | Full SQL++ query text        |
| `db.response.status_code` | Error code (on error)        | `12003`                      |
| `error.type`              | Error message (on error)     | Error message from Couchbase |

**Supported databases**:

- **Couchbase Server**: Detected via the N1QL version header in the response
- **Other SQL++ implementations**: Apache AsterixDB and compatible databases are
  also supported with a generic `other_sql` designation

**Request formats**: SQL++ requests are accepted as both JSON body and
form-encoded POST to `/query/service`:

{{< tabpane text=true >}} {{% tab "JSON Body" %}}

```json
{
  "statement": "SELECT * FROM `bucket`.`scope`.`collection` WHERE id = $1",
  "query_context": "default:`bucket`.`scope`"
}
```

{{% /tab %}} {{% tab "Form Encoded" %}}

```text
statement=SELECT+*+FROM+users&query_context=default:`travel-sample`.`inventory`
```

{{% /tab %}} {{< /tabpane >}}

**Namespace resolution**: The parser extracts bucket and collection from:

1. Table path in the SQL statement: `` `bucket`.`scope`.`collection` ``
2. The `query_context` field when present
3. Single identifier: treated as collection name (with `query_context`) or
   bucket name (without `query_context`, legacy mode)

**Configuration**: SQL++ instrumentation requires explicit enablement:

```bash
export OTEL_EBPF_HTTP_SQLPP_ENABLED=true
export OTEL_EBPF_BPF_BUFFER_SIZE_HTTP=2048  # Larger than default; needed to capture request/response bodies
```

**Limitations**:

- Bucket and collection discovery requires SQL path notation in the query (e.g.,
  `bucket.scope.collection`) or a `query_context` field in the request
- Responses without a Couchbase version header are labeled as generic
  `other_sql` operations

**Example use case**: Monitor a high-traffic web application using Couchbase for
session storage and content management, tracking query performance and
identifying inefficient N1QL queries.

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

| YAML<br>environment variable                                                                        | Description                                                                                                                                                                                                                       | Type            | Default    |
| --------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------- | ---------- |
| `port`<br>`OTEL_EBPF_PROMETHEUS_PORT`                                                               | The HTTP port for the Prometheus scrape endpoint. If unset or 0, no Prometheus endpoint is open.                                                                                                                                  | int             |            |
| `path`<br>`OTEL_EBPF_PROMETHEUS_PATH`                                                               | The HTTP query path to fetch the list of Prometheus metrics.                                                                                                                                                                      | string          | `/metrics` |
| `extra_resource_attributes`<br>`OTEL_EBPF_PROMETHEUS_EXTRA_RESOURCE_ATTRIBUTES`                     | A list of additional resource attributes to be added to the reported `target_info` metric. Refer to [extra resource attributes](#prometheus-extra-resource-attributes) for important details about runtime discovered attributes. | list of strings |            |
| `ttl`<br>`OTEL_EBPF_PROMETHEUS_TTL`                                                                 | The duration after which metric instances are not reported if they haven't been updated. Used to avoid reporting indefinitely finished application instances.                                                                     | Duration        | `5m`       |
| `buckets`                                                                                           | Sets how you can override bucket boundaries of diverse histograms, refer to [override histogram buckets](../metrics-histograms/).                                                                                                 | Object          |            |
| `allow_service_graph_self_references`<br>`OTEL_EBPF_PROMETHEUS_ALLOW_SERVICE_GRAPH_SELF_REFERENCES` | Does OBI include self-referencing service in service graph generation. Self referencing isn't useful for service graphs and increases data cardinality.                                                                           | boolean         | `false`    |
| `instrumentations`<br>`OTEL_EBPF_PROMETHEUS_INSTRUMENTATIONS`                                       | The list of instrumentation OBI collects data for, refer to [Prometheus instrumentation](#prometheus-instrumentation) section.                                                                                                    | list of strings | `["*"]`    |

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
- `sql`: SQL database client call metrics (includes PostgreSQL, MySQL and Go
  `database/sql` drivers like pgx)
- `redis`: Redis client/server database metrics
- `kafka`: Kafka client/server message queue metrics
- `mqtt`: MQTT publish/subscribe message metrics
- `couchbase`: Couchbase N1QL/SQL++ query metrics and KV protocol metrics

For example, setting the `instrumentations` option to: `http,grpc` enables the
collection of `HTTP/HTTPS/HTTP2` and `gRPC` application metrics, and disables
other instrumentation.
