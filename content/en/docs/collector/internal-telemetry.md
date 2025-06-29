---
title: Internal telemetry
weight: 25
cSpell:ignore: alloc batchprocessor journalctl
---

You can inspect the health of any OpenTelemetry Collector instance by checking
its own internal telemetry. Read on to learn about this telemetry and how to
configure it to help you
[monitor](#use-internal-telemetry-to-monitor-the-collector) and
[troubleshoot](/docs/collector/troubleshooting/) the Collector.

{{% alert title="Important" color="warning" %}} The Collector uses the
OpenTelemetry SDK
[declarative configuration schema](https://github.com/open-telemetry/opentelemetry-configuration)
for configuring how to export its internal telemetry. This schema is still under
[development](/docs/specs/otel/document-status/#lifecycle-status) and may
undergo **breaking changes** in future releases. We intend to keep supporting
older schemas until a 1.0 schema release is available, and offer a transition
period for users to update their configurations before dropping pre-1.0 schemas.
For details and to track progress see
[issue #10808](https://github.com/open-telemetry/opentelemetry-collector/issues/10808).
{{% /alert %}}

## Activate internal telemetry in the Collector

By default, the Collector exposes its own telemetry in three ways:

- [Metrics](#configure-internal-metrics)
- [Logs](#configure-internal-logs)
- [Traces](#configure-internal-traces)

{{% alert title="Who monitors the monitor?" color="info" %}} As a matter of best
practice, the subject being monitored shouldn't also be the monitor. Internal
Collector telemetry should ideally be exported to another OpenTelemetry
Collector dedicated to processing telemetry from other Collectors, which then
exports the telemetry to an OTLP backend for analysis.

When a Collector is responsible for handling its own telemetry through a traces,
metrics, or logs pipeline and encounters an issue (e.g. memory limiter blocking
data), its internal telemetry won't be sent to its intended destination. This
makes it difficult to detect problems with the Collector itself. Likewise, if
the Collector generates additional telemetry related to the above issue, such
error logs, and those logs are sent into the same collector, it can create a
feedback loop where more error logs lead to increased ingestion, which in turn
produces even more error logs. {{% /alert %}}

### Configure internal metrics

You can configure how internal metrics are generated and exposed by the
Collector. By default, the Collector generates basic metrics about itself and
exposes them using the OpenTelemetry Go
[Prometheus exporter](https://github.com/open-telemetry/opentelemetry-go/tree/main/exporters/prometheus)
for scraping at `http://127.0.0.1:8888/metrics`.

There are three ways to export internal Collector metrics.

1. Self-ingesting, exporting internal metrics via the
   [Go Prometheus exporter](https://github.com/open-telemetry/opentelemetry-go/tree/main/exporters/prometheus).

   Here, your Collector exports its internal telemetry behind the scenes via the
   Go Prometheus exporter.

   {{% alert title="Note" color="info" %}}

   The
   [Go Prometheus exporter](https://github.com/open-telemetry/opentelemetry-go/tree/main/exporters/prometheus)
   is not the same as the
   [Collector’s Prometheus exporter](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/exporter/prometheusexporter).
   The Collector’s exporter is designed to aggregate metrics from multiple
   resources/targets together, whereas the Go SDK exporter is designed to only
   handle metrics from a single resource. This makes sense, since the only
   metrics source is the Collector’s own metrics, which means that using the
   Collector’s version of the exporter would be unnecessary.

   {{% /alert %}}

   You can expose the Prometheus endpoint to one specific or all network
   interfaces when needed. For containerized environments, you might want to
   expose this port on a public interface.

   Set the Prometheus export configuration under `service::telemetry::metrics`:

   ```yaml
   service:
     telemetry:
       metrics:
         readers:
           - pull:
               exporter:
                 prometheus:
                   host: '0.0.0.0'
                   port: 8888
   ```

2. Self-ingesting and exporting, scraping metrics via the Collector's own
   [Prometheus Receiver](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/receiver/prometheusreceiver).

   Here, your Collector scrapes its own metrics via its own Prometheus Receiver.
   This means that you must configure your Collector’s Prometheus receiver to
   scrape itself, like this:

   ```yaml
   prometheus:
     config:
       scrape_configs: []
         # Collector metrics
         - job_name: 'otel-collector'
           scrape_interval: 10s
           static_configs:
           - targets: [ '0.0.0.0:8888' ]
   ```

   And then set the export configuration under `service::telemetry::metrics`:

   ```yaml
   service:
     telemetry:
       metrics:
         level: detailed
         readers:
           - periodic:
               exporter:
                 otlp:
                   protocol: http/protobuf
                   endpoint: http://0.0.0.0:4318
   ```

3. Direct to another OTLP destination

   The Collector can push its internal metrics to an OpenTelemetry Collector
   dedicated to processing internal telemetry from other Collectors using the
   following configuration:

   ```yaml
   service:
     telemetry:
       metrics:
         readers:
           - periodic:
               exporter:
                 otlp:
                   protocol: http/protobuf
                   endpoint: https://${OTLP_ENDPOINT}
   ```

   To send telemetry directly to an OTLP backend, simply add a `headers`
   configuration:

   ```yaml
   service:
     telemetry:
       metrics:
         readers:
           - periodic:
               exporter:
                 otlp:
                   protocol: http/protobuf
                   endpoint: https://${OTLP_ENDPOINT}
                   headers:
                     - name: ${HEADER}
                       value: '${API_TOKEN}'
   ```

   {{% alert title="WARNING" color="warning" %}} Although the above approach is
   possible, it is not recommended, as it can introduce scaling issues.
   {{% /alert %}}

{{% alert title="Internal telemetry configuration changes" color="info" %}}

As of Collector [v0.123.0], the `service::telemetry::metrics::address` setting
is ignored. In earlier versions, it could be configured with:

```yaml
service:
  telemetry:
    metrics:
      address: 0.0.0.0:8888
```

[v0.123.0]:
  https://github.com/open-telemetry/opentelemetry-collector/releases/tag/v0.123.0

{{% /alert %}}

You can adjust the verbosity of the Collector metrics output by setting the
`level` field to one of the following values:

- `none`: no telemetry is collected.
- `basic`: essential service telemetry.
- `normal`: the default level, adds standard indicators on top of basic.
- `detailed`: the most verbose level, includes dimensions and views.

Each verbosity level represents a threshold at which certain metrics are
emitted. For the complete list of metrics, with a breakdown by level, see
[Lists of internal metrics](#lists-of-internal-metrics).

The default level for metrics output is `normal`. To use another level, set
`service::telemetry::metrics::level`:

```yaml
service:
  telemetry:
    metrics:
      level: detailed
```

### Configure internal logs

Log output is found in `stderr`. You can configure logs in the config
`service::telemetry::logs`. The
[configuration options](https://github.com/open-telemetry/opentelemetry-collector/blob/main/service/telemetry/config.go)
are:

| Field name             | Default value | Description                                                                                                                                                                                                                                                                                       |
| ---------------------- | ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `level`                | `INFO`        | Sets the minimum enabled logging level. Other possible values are `DEBUG`, `WARN`, and `ERROR`.                                                                                                                                                                                                   |
| `development`          | `false`       | Puts the logger in development mode.                                                                                                                                                                                                                                                              |
| `encoding`             | `console`     | Sets the logger's encoding. The other possible value is `json`.                                                                                                                                                                                                                                   |
| `disable_caller`       | `false`       | Stops annotating logs with the calling function's file name and line number. By default, all logs are annotated.                                                                                                                                                                                  |
| `disable_stacktrace`   | `false`       | Disables automatic stacktrace capturing. Stacktraces are captured for logs at `WARN` level and above in development and at `ERROR` level and above in production.                                                                                                                                 |
| `sampling::enabled`    | `true`        | Sets a sampling policy.                                                                                                                                                                                                                                                                           |
| `sampling::tick`       | `10s`         | The interval in seconds that the logger applies to each sampling.                                                                                                                                                                                                                                 |
| `sampling::initial`    | `10`          | The number of messages logged at the start of each `sampling::tick`.                                                                                                                                                                                                                              |
| `sampling::thereafter` | `100`         | Sets the sampling policy for subsequent messages after `sampling::initial` messages are logged. When `sampling::thereafter` is set to `N`, every `Nth` message is logged and all others are dropped. If `N` is zero, the logger drops all messages after `sampling::initial` messages are logged. |
| `output_paths`         | `["stderr"]`  | A list of URLs or file paths to write logging output to.                                                                                                                                                                                                                                          |
| `error_output_paths`   | `["stderr"]`  | A list of URLs or file paths to write logger errors to.                                                                                                                                                                                                                                           |
| `initial_fields`       |               | A collection of static key-value pairs added to all log entries to enrich logging context. By default, there is no initial field.                                                                                                                                                                 |

You can also see logs for the Collector on a Linux systemd system using
`journalctl`:

{{< tabpane text=true >}} {{% tab "All logs" %}}

```sh
journalctl | grep otelcol
```

{{% /tab %}} {{% tab "Errors only" %}}

```sh
journalctl | grep otelcol | grep Error
```

{{% /tab %}} {{< /tabpane >}}

The following configuration can be used to emit internal logs from the Collector
to an OTLP/HTTP destination:

```yaml
service:
  telemetry:
    logs:
      processors:
        - batch:
            exporter:
              otlp:
                protocol: http/protobuf
                endpoint: https://${OTLP_ENDPOINT}
```

Again, it is recommended to send internal Collector telemetry to a Collector
dedicated to processing only internal telemetry from other Collectors.

### Configure internal traces

The Collector does not expose traces by default, but it can be configured to.

{{% alert title="Caution" color="warning" %}}

Internal tracing is an experimental feature, and no guarantees are made as to
the stability of the emitted span names and attributes.

{{% /alert %}}

The following configuration can be used to emit internal traces from the
Collector to an OTLP/HTTP destination:

```yaml
service:
  telemetry:
    traces:
      processors:
        - batch:
            exporter:
              otlp:
                protocol: http/protobuf
                endpoint: https://${OTLP_ENDPOINT}
```

Again, it is recommended to send internal Collector telemetry to a Collector
dedicated to processing only internal telemetry from other Collectors.

See the [example configuration][kitchen-sink-config] for additional options.
Note that the `tracer_provider` section there corresponds to `traces` here.

[kitchen-sink-config]:
  https://github.com/open-telemetry/opentelemetry-configuration/blob/main/examples/kitchen-sink.yaml

## Types of internal telemetry

The OpenTelemetry Collector aims to be a model of observable service by clearly
exposing its own operational metrics. Additionally, it collects host resource
metrics that can help you understand if problems are caused by a different
process on the same host. Specific components of the Collector can also emit
their own custom telemetry. In this section, you will learn about the different
types of observability emitted by the Collector itself.

### Summary of values observable with internal metrics

The Collector emits internal metrics for at least the following values:

- Process uptime and CPU time since start.
- Process memory and heap usage.
- For receivers: Items accepted and refused, per data type.
- For processors: Incoming and outgoing items.
- For exporters: Items the exporter sent, failed to enqueue, and failed to send,
  per data type.
- For exporters: Queue size and capacity.
- Count, duration, and size of HTTP/gRPC requests and responses.

A more detailed list is available in the following sections.

### Metric names

This section explains special naming conventions applied to some internal
metrics.

#### `otelcol_` prefix

As of Collector v0.106.1, internal metric names are handled differently based on
their source:

- Metrics generated from Collector components are prefixed with `otelcol_`.
- Metrics generated from instrumentation libraries do not use the `otelcol_`
  prefix by default, unless their metric names are explicitly prefixed.

For Collector versions prior to v0.106.1, all internal metrics emitted using the
Prometheus exporter, regardless of their origin, are prefixed with `otelcol_`.
This includes metrics from both Collector components and instrumentation
libraries.

#### `_total` suffix

By default and unique to Prometheus, the Prometheus exporter adds a `_total`
suffix to summation metrics to follow Prometheus naming conventions, such as
`otelcol_exporter_send_failed_spans_total`. This behavior can be disabled by
setting `without_type_suffix: false` in the Prometheus exporter's configuration.

If you leave out `service::telemetry::metrics::readers` in the Collector
configuration, the default Prometheus exporter set up by the Collector already
has `without_type_suffix` set to `false`. However, if you customize the readers
and add a Prometheus exporter manually, you must set that option to return to
the "raw" metric name. For more information, see the
[Collector v1.25.0/v0.119.0 release notes](https://github.com/codeboten/opentelemetry-collector/blob/313167505b44e5dc9a29c0b9242cc4547db11ec3/CHANGELOG.md#v1250v01190).

Internal metrics exported through OTLP do not have this behavior. The
[internal metrics](#lists-of-internal-metrics) on this page are listed in OTLP
format, such as `otelcol_exporter_send_failed_spans`.

#### Dots (`.`) v. underscores (`_`)

`http*` and `rpc*` metrics come from instrumentation libraries. Their original
names used dots (`.`). Prior to Collector v0.120.0, internal metrics exposed
with Prometheus changed dots (`.`) to underscores (`_`) to match Prometheus
naming conventions, resulting in metric names that looked like
`rpc_server_duration`.

Versions 0.120.0 and later of the Collector use Prometheus 3.0 scrapers, so the
original `http*` and `rpc*` metric names with dots are preserved. The
[internal metrics](#lists-of-internal-metrics) on this page are listed in their
original form, such as`rpc.server.duration`. For more information, see the
[Collector v0.120.0 release notes](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/CHANGELOG.md#v01200).

### Lists of internal metrics

The following tables group each internal metric by level of verbosity: `basic`,
`normal`, and `detailed`. Each metric is identified by name and description and
categorized by instrumentation type.

{{< comment >}}

To compile this list, configure a Collector instance to emit its own metrics to
the localhost:8888/metrics endpoint. Select a metric and grep for it in the
Collector core repository. For example, the `otelcol_process_memory_rss` can be
found using:`grep -Hrn "memory_rss" .` Make sure to eliminate from your search
string any words that might be prefixes. Look through the results until you find
the .go file that contains the list of metrics. In the case of
`otelcol_process_memory_rss`, it and other process metrics can be found in
<https://github.com/open-telemetry/opentelemetry-collector/blob/31528ce81d44e9265e1a3bbbd27dc86d09ba1354/service/internal/proctelemetry/process_telemetry.go#L92>.
Note that the Collector's internal metrics are defined in several different
files in the repository.

{{< /comment >}}

#### `basic`-level metrics

| Metric name                                            | Description                                                                             | Type    |
| ------------------------------------------------------ | --------------------------------------------------------------------------------------- | ------- |
| `otelcol_exporter_enqueue_failed_`<br>`log_records`    | Number of logs that exporter(s) failed to enqueue.                                      | Counter |
| `otelcol_exporter_enqueue_failed_`<br>`metric_points`  | Number of metric points that exporter(s) failed to enqueue.                             | Counter |
| `otelcol_exporter_enqueue_failed_`<br>`spans`          | Number of spans that exporter(s) failed to enqueue.                                     | Counter |
| `otelcol_exporter_queue_capacity`                      | Fixed capacity of the sending queue, in batches.                                        | Gauge   |
| `otelcol_exporter_queue_size`                          | Current size of the sending queue, in batches.                                          | Gauge   |
| `otelcol_exporter_send_failed_`<br>`log_records`       | Number of logs that exporter(s) failed to send to destination.                          | Counter |
| `otelcol_exporter_send_failed_`<br>`metric_points`     | Number of metric points that exporter(s) failed to send to destination.                 | Counter |
| `otelcol_exporter_send_failed_`<br>`spans`             | Number of spans that exporter(s) failed to send to destination.                         | Counter |
| `otelcol_exporter_sent_log_records`                    | Number of logs successfully sent to destination.                                        | Counter |
| `otelcol_exporter_sent_metric_points`                  | Number of metric points successfully sent to destination.                               | Counter |
| `otelcol_exporter_sent_spans`                          | Number of spans successfully sent to destination.                                       | Counter |
| `otelcol_process_cpu_seconds`                          | Total CPU user and system time in seconds.                                              | Counter |
| `otelcol_process_memory_rss`                           | Total physical memory (resident set size) in bytes.                                     | Gauge   |
| `otelcol_process_runtime_heap_`<br>`alloc_bytes`       | Bytes of allocated heap objects (see 'go doc runtime.MemStats.HeapAlloc').              | Gauge   |
| `otelcol_process_runtime_total_`<br>`alloc_bytes`      | Cumulative bytes allocated for heap objects (see 'go doc runtime.MemStats.TotalAlloc'). | Counter |
| `otelcol_process_runtime_total_`<br>`sys_memory_bytes` | Total bytes of memory obtained from the OS (see 'go doc runtime.MemStats.Sys').         | Gauge   |
| `otelcol_process_uptime`                               | Uptime of the process in seconds.                                                       | Counter |
| `otelcol_processor_incoming_items`                     | Number of items passed to the processor.                                                | Counter |
| `otelcol_processor_outgoing_items`                     | Number of items emitted from the processor.                                             | Counter |
| `otelcol_receiver_accepted_`<br>`log_records`          | Number of logs successfully ingested and pushed into the pipeline.                      | Counter |
| `otelcol_receiver_accepted_`<br>`metric_points`        | Number of metric points successfully ingested and pushed into the pipeline.             | Counter |
| `otelcol_receiver_accepted_spans`                      | Number of spans successfully ingested and pushed into the pipeline.                     | Counter |
| `otelcol_receiver_refused_`<br>`log_records`           | Number of logs that could not be pushed into the pipeline.                              | Counter |
| `otelcol_receiver_refused_`<br>`metric_points`         | Number of metric points that could not be pushed into the pipeline.                     | Counter |
| `otelcol_receiver_refused_spans`                       | Number of spans that could not be pushed into the pipeline.                             | Counter |
| `otelcol_scraper_errored_`<br>`metric_points`          | Number of metric points the Collector failed to scrape.                                 | Counter |
| `otelcol_scraper_scraped_`<br>`metric_points`          | Number of metric points scraped by the Collector.                                       | Counter |

#### Additional `normal`-level metrics

| Metric name                                             | Description                                                     | Type      |
| ------------------------------------------------------- | --------------------------------------------------------------- | --------- |
| `otelcol_processor_batch_batch_`<br>`send_size`         | Number of units in the batch that was sent.                     | Histogram |
| `otelcol_processor_batch_batch_size_`<br>`trigger_send` | Number of times the batch was sent due to a size trigger.       | Counter   |
| `otelcol_processor_batch_metadata_`<br>`cardinality`    | Number of distinct metadata value combinations being processed. | Counter   |
| `otelcol_processor_batch_timeout_`<br>`trigger_send`    | Number of times the batch was sent due to a timeout trigger.    | Counter   |

{{% alert title="Batch processor metrics level changes" %}}

In Collector [v0.99.0], all batch processor metrics were upgraded from `basic`
to `normal` (current level), except for
`otelcol_processor_batch_batch_send_size_bytes`, which has been `detailed` since
its introduction. Note however that these metrics were inadvertently reverted to
`basic` from v0.109.0 to v0.121.0.

[v0.99.0]:
  https://github.com/open-telemetry/opentelemetry-collector/releases/tag/v0.99.0

{{% /alert %}}

#### Additional `detailed`-level metrics

| Metric name                                           | Description                                                                               | Type      |
| ----------------------------------------------------- | ----------------------------------------------------------------------------------------- | --------- |
| `http.client.active_requests`                         | Number of active HTTP client requests.                                                    | Counter   |
| `http.client.connection.duration`                     | Measures the duration of the successfully established outbound HTTP connections.          | Histogram |
| `http.client.open_connections`                        | Number of outbound HTTP connections that are active or idle on the client.                | Counter   |
| `http.client.request.size`                            | Measures the size of HTTP client request bodies.                                          | Counter   |
| `http.client.duration`                                | Measures the duration of HTTP client requests.                                            | Histogram |
| `http.client.response.size`                           | Measures the size of HTTP client response bodies.                                         | Counter   |
| `http.server.active_requests`                         | Number of active HTTP server requests.                                                    | Counter   |
| `http.server.request.size`                            | Measures the size of HTTP server request bodies.                                          | Counter   |
| `http.server.duration`                                | Measures the duration of HTTP server requests.                                            | Histogram |
| `http.server.response.size`                           | Measures the size of HTTP server response bodies.                                         | Counter   |
| `otelcol_processor_batch_batch_`<br>`send_size_bytes` | Number of bytes in the batch that was sent.                                               | Histogram |
| `rpc.client.duration`                                 | Measures the duration of outbound RPC.                                                    | Histogram |
| `rpc.client.request.size`                             | Measures the size of RPC request messages (uncompressed).                                 | Histogram |
| `rpc.client.requests_per_rpc`                         | Measures the number of messages received per RPC. Should be 1 for all non-streaming RPCs. | Histogram |
| `rpc.client.response.size`                            | Measures the size of RPC response messages (uncompressed).                                | Histogram |
| `rpc.client.responses_per_rpc`                        | Measures the number of messages sent per RPC. Should be 1 for all non-streaming RPCs.     | Histogram |
| `rpc.server.duration`                                 | Measures the duration of inbound RPC.                                                     | Histogram |
| `rpc.server.request.size`                             | Measures the size of RPC request messages (uncompressed).                                 | Histogram |
| `rpc.server.requests_per_rpc`                         | Measures the number of messages received per RPC. Should be 1 for all non-streaming RPCs. | Histogram |
| `rpc.server.response.size`                            | Measures the size of RPC response messages (uncompressed).                                | Histogram |
| `rpc.server.responses_per_rpc`                        | Measures the number of messages sent per RPC. Should be 1 for all non-streaming RPCs.     | Histogram |

{{% alert title="Note" color="info" %}} The `http*` and `rpc*` metrics are not
covered by the maturity levels below since they are not under the Collector SIG
control.

The `otelcol_processor_batch_` metrics are unique to the `batchprocessor`.

The `otelcol_receiver_`, `otelcol_scraper_`, `otelcol_processor_`, and
`otelcol_exporter_` metrics come from their respective `helper` packages. As
such, some components not using those packages might not emit them.
{{% /alert %}}

### Events observable with internal logs

The Collector logs the following internal events:

- A Collector instance starts or stops.
- Data dropping begins due to throttling for a specified reason, such as local
  saturation, downstream saturation, downstream unavailable, etc.
- Data dropping due to throttling stops.
- Data dropping begins due to invalid data. A sample of the invalid data is
  included.
- Data dropping due to invalid data stops.
- A crash is detected, differentiated from a clean stop. Crash data is included
  if available.

## Telemetry maturity levels

The Collector telemetry levels apply to all first-party telemetry produced by
the Collector. Third-party libraries, including those of OpenTelemetry Go, are
not covered by these maturity levels.

### Traces

Tracing instrumentation is still under active development, and changes might be
made to span names, attached attributes, instrumented endpoints, or other
aspects of the telemetry. Until this feature graduates to stable, there are no
guarantees of backwards compatibility for tracing instrumentation.

### Metrics

The Collector's first-party metrics follow a four-stage lifecycle:

> Alpha metric → Stable metric → Deprecated metric → Deleted metric

Third-party metrics, including those generated by OpenTelemetry Go
instrumentation libraries, are not covered by these maturity levels.

#### Alpha

Alpha metrics have no stability guarantees. These metrics can be modified or
deleted at any time.

#### Stable

Stable metrics are guaranteed to not change. This means:

- A stable metric without a deprecated signature will not be deleted or renamed.
- A stable metric's type and attributes will not be modified.

#### Deprecated

Deprecated metrics are slated for deletion but are still available for use. The
description of these metrics include an annotation about the version in which
they became deprecated. For example:

Before deprecation:

```sh
# HELP otelcol_exporter_queue_size this counts things
# TYPE otelcol_exporter_queue_size counter
otelcol_exporter_queue_size 0
```

After deprecation:

```sh
# HELP otelcol_exporter_queue_size (Deprecated since 1.15.0) this counts things
# TYPE otelcol_exporter_queue_size counter
otelcol_exporter_queue_size 0
```

#### Deleted

Deleted metrics are no longer published and cannot be used.

### Logs

Individual log entries and their formatting might change from one release to the
next. There are no stability guarantees at this time.

## Use internal telemetry to monitor the Collector

This section recommends best practices for monitoring the Collector using its
own telemetry.

### Monitoring

#### Queue length

Most exporters provide a
[queue and/or retry mechanism](https://github.com/open-telemetry/opentelemetry-collector/blob/main/exporter/exporterhelper/README.md)
that is recommended for use in any production deployment of the Collector.

The `otelcol_exporter_queue_capacity` metric indicates the capacity, in batches,
of the sending queue. The `otelcol_exporter_queue_size` metric indicates the
current size of the sending queue. Use these two metrics to check if the queue
capacity can support your workload.

Using the following three metrics, you can identify the number of spans, metric
points, and log records that failed to reach the sending queue:

- `otelcol_exporter_enqueue_failed_spans`
- `otelcol_exporter_enqueue_failed_metric_points`
- `otelcol_exporter_enqueue_failed_log_records`

These failures could be caused by a queue filled with unsettled elements. You
might need to decrease your sending rate or horizontally scale Collectors.

The queue or retry mechanism also supports logging for monitoring. Check the
logs for messages such as `Dropping data because sending_queue is full`.

#### Receive failures

Sustained rates of `otelcol_receiver_refused_log_records`,
`otelcol_receiver_refused_spans`, and `otelcol_receiver_refused_metric_points`
indicate that too many errors were returned to clients. Depending on the
deployment and the clients' resilience, this might indicate clients' data loss.

Sustained rates of `otelcol_exporter_send_failed_log_records`,
`otelcol_exporter_send_failed_spans`, and
`otelcol_exporter_send_failed_metric_points` indicate that the Collector is not
able to export data as expected. These metrics do not inherently imply data loss
since there could be retries. But a high rate of failures could indicate issues
with the network or backend receiving the data.

#### Data flow

You can monitor data ingress with the `otelcol_receiver_accepted_log_records`,
`otelcol_receiver_accepted_spans`, and `otelcol_receiver_accepted_metric_points`
metrics and data egress with the `otelcol_exporter_sent_log_records`,
`otelcol_exporter_sent_spans`, and `otelcol_exporter_sent_metric_points`
metrics.
