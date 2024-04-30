---
title: Internal telemetry
weight: 25
cSpell:ignore: alloc journalctl kube otecol pprof tracez zpages
---

You can monitor the health of any OpenTelemetry Collector instance by checking
its own internal telemetry. Read on to learn how to configure this telemetry to
help you [troubleshoot](/docs/collector/troubleshooting/) Collector issues.

## Activate internal telemetry in the Collector

By default, the Collector exposes its own telemetry in two ways:

- Internal [metrics](#configure-internal-metrics) are exposed using a Prometheus
  interface which defaults to port `8888`.
- [Logs](#configure-internal-logs) are emitted to `stderr` by default.

### Configure internal metrics

You can configure how internal metrics are generated and exposed by the
Collector. By default, the Collector generates basic metrics about itself and
exposes them for scraping at `http://127.0.0.1:8888/metrics`. You can expose the
endpoint to one specific or all network interfaces when needed. For
containerized environments, you might want to expose this port on a public
interface.

Set the address in the config `service::telemetry::metrics`:

```yaml
service:
  telemetry:
    metrics:
      address: '0.0.0.0:8888'
```

You can enhance the metrics telemetry using the `level` field. This field
controls how verbose the metric is. The following is a list of all possible
values and their explanations.

- `none` indicates that no telemetry data should be collected.
- `basic` is the recommended value and covers the basics of the service
  telemetry.
- `normal` adds other indicators on top of basic.
- `detailed` adds dimensions and views to the previous levels.

For example:

```yaml
service:
  telemetry:
    metrics:
      level: detailed
      address: ':8888'
```

You can find the default verbosity level for each metric in this
[list of metrics](#list-of-internal-metrics).

The Collector can also be configured to scrape its own metrics and send them
through configured pipelines. For example:

```yaml
receivers:
  prometheus:
    config:
      scrape_configs:
        - job_name: 'otelcol'
          scrape_interval: 10s
          static_configs:
            - targets: ['0.0.0.0:8888']
          metric_relabel_configs:
            - source_labels: [__name__]
              regex: '.*grpc_io.*'
              action: drop
exporters:
  debug:
service:
  pipelines:
    metrics:
      receivers: [prometheus]
      exporters: [debug]
```

{{% alert title="Caution" color="warning" %}}

Self-monitoring is a risky practice. If an issue arises, the source of the
problem is unclear and the telemetry is unreliable.

{{% /alert %}}

### Configure internal logs

You can find log output in `stderr`. The verbosity level for logs defaults to
`INFO`, but you can adjust it in the config `service::telemetry::logs`:

```yaml
service:
  telemetry:
    logs:
      level: 'debug'
```

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

## Types of internal observability

<!--- TODO: Add intro sentence. --->

### List of internal metrics

The following table identifies each internal metric by name and description.
Each metric is also categorized by instrumentation type and level of verbosity.

| Name                                      | Description                                                                               | Type      | Level      |
| ----------------------------------------- | ----------------------------------------------------------------------------------------- | --------- | ---------- |
| `errored_metric_points`                   | Number of metric points the Collector failed to scrape.                                   | Counter   |            |
| `exporter_enqueue_failed_log_records`     | Number of spans that exporter(s) failed to enqueue.                                       | Counter   |            |
| `exporter_enqueue_failed_metric_points`   | Number of metric points that exporter(s) failed to enqueue.                               | Counter   |            |
| `exporter_enqueue_failed_spans`           | Number of spans that exporter(s) failed to enqueue.                                       | Counter   |            |
| `exporter_send_failed_log_records`        | Number of logs that exporter(s) failed to send to destination.                            | Counter   |            |
| `exporter_send_failed_metric_points`      | Number of metric points that exporter(s) failed to send to destination.                   | Counter   |            |
| `exporter_send_failed_spans`              | Number of spans that exporter(s) failed to send to destination.                           | Counter   |            |
| `exporter_sent_log_records`               | Number of logs successfully sent to destination.                                          | Counter   |            |
| `exporter_sent_metric_points`             | Number of metric points successfully sent to destination.                                 | Counter   |            |
| `exporter_sent_spans`                     | Number of spans successfully sent to destination.                                         | Counter   |            |
| `http_client_active_requests`             | Number of active HTTP client requests.                                                    | Counter   | `detailed` |
| `http_client_connection_duration`         | Measures the duration of the successfully established outbound HTTP connections.          | Histogram | `detailed` |
| `http_client_open_connections`            | Number of outbound HTTP connections that are active or idle on the client.                | Counter   | `detailed` |
| `http_client_request_body_size`           | Measures the size of HTTP client request bodies.                                          | Histogram | `detailed` |
| `http_client_request_duration`            | Measures the duration of HTTP client requests.                                            | Histogram | `detailed` |
| `http_client_response_body_size`          | Measures the size of HTTP client response bodies.                                         | Histogram | `detailed` |
| `http_server_active_requests`             | Number of active HTTP server requests.                                                    | Counter   | `detailed` |
| `http_server_request_body_size`           | Measures the size of HTTP server request bodies.                                          | Histogram | `detailed` |
| `http_server_request_duration`            | Measures the duration of HTTP server requests.                                            | Histogram | `detailed` |
| `http_server_response_body_size`          | Measures the size of HTTP server response bodies.                                         | Histogram | `detailed` |
| `process_cpu_seconds`                     | Total CPU user and system time in seconds.                                                | Counter   |            |
| `process_memory_rss`                      | Total physical memory (resident set size).                                                | Gauge     |            |
| `process_runtime_heap_alloc_bytes`        | Bytes of allocated heap objects (see 'go doc runtime.MemStats.HeapAlloc').                | Gauge     |            |
| `process_runtime_total_alloc_bytes`       | Cumulative bytes allocated for heap objects (see 'go doc runtime.MemStats.TotalAlloc').   | Counter   |            |
| `process_runtime_total_sys_memory_bytes`  | Total bytes of memory obtained from the OS (see 'go doc runtime.MemStats.Sys').           | Gauge     |            |
| `process_uptime`                          | Uptime of the process.                                                                    | Counter   |            |
| `processor_batch_batch_send_size_bytes`   | Number of bytes in the batch that was sent.                                               | Histogram |            |
| `processor_batch_batch_send_size`         | Number of units in the batch.                                                             | Histogram | `normal`   |
| `processor_batch_batch_size_trigger_send` | Number of times the batch was sent due to a size trigger.                                 | Counter   | `normal`   |
| `processor_batch_metadata_cardinality`    | Number of distinct metadata value combinations being processed.                           | Counter   | `normal`   |
| `processor_batch_timeout_trigger_send`    | Number of times the batch was sent due to a timeout trigger.                              | Counter   | `normal`   |
| `processor_dropped_log_records`           | Number of logs dropped by the processor.                                                  | Counter   |            |
| `processor_dropped_metric_points`         | Number of metric points dropped by the processor.                                         | Counter   |            |
| `processor_dropped_spans`                 | Number of spans dropped by the processor.                                                 | Counter   |            |
| `processor_processor`                     | <!--- "Identifies processors in metrics and traces." --->                                 |           |            |
| `receiver_accepted_log_records`           | Number of logs successfully pushed into the pipeline.                                     | Counter   |            |
| `receiver_accepted_metric_points`         | Number of metric points successfully pushed into the pipeline.                            | Counter   |            |
| `receiver_accepted_spans`                 | Number of spans successfully pushed into the pipeline.                                    | Counter   |            |
| `receiver_format`                         | <!--- "Identifies the format of the data received." --->                                  |           |            |
| `receiver_receiver`                       | <!--- "Identifies receivers in metrics and traces." --->                                  |           |            |
| `receiver_refused_log_records`            | Number of logs that could not be pushed into the pipeline.                                | Counter   |            |
| `receiver_refused_metric_points`          | Number of metric points that could not be pushed into the pipeline.                       | Counter   |            |
| `receiver_refused_spans`                  | Number of spans that could not be pushed into the pipeline.                               | Counter   |            |
| `receiver_transport`                      | <!--- "Identifies the transport used to receive the data." --->                           |           |            |
| `rpc_client_duration`                     | Measures the duration of outbound RPC.                                                    | Histogram | `detailed` |
| `rpc_client_request_size`                 | Measures the size of RPC request messages (uncompressed).                                 | Histogram | `detailed` |
| `rpc_client_requests_per_rpc`             | Measures the number of messages received per RPC. Should be 1 for all non-streaming RPCs. | Histogram | `detailed` |
| `rpc_client_response_size`                | Measures the size of RPC response messages (uncompressed).                                | Histogram | `detailed` |
| `rpc_client_responses_per_rpc`            | Measures the number of messages sent per RPC. Should be 1 for all non-streaming RPCs.     | Histogram | `detailed` |
| `rpc_server_duration`                     | Measures the duration of inbound RPC.                                                     | Histogram | `detailed` |
| `rpc_server_request_size`                 | Measures the size of RPC request messages (uncompressed).                                 | Histogram | `detailed` |
| `rpc_server_requests_per_rpc`             | Measures the number of messages received per RPC. Should be 1 for all non-streaming RPCs. | Histogram | `detailed` |
| `rpc_server_response_size`                | Measures the size of RPC response messages (uncompressed).                                | Histogram | `detailed` |
| `rpc_server_responses_per_rpc`            | Measures the number of messages sent per RPC. Should be 1 for all non-streaming RPCs.     | Histogram | `detailed` |
| `scraped_metric_points`                   | Number of metric points scraped by the Collector.                                         | Counter   |            |
| `target_info`                             | Target metadata.                                                                          | Gauge     |            |

<!--- TODO: Figure out which of these values are available now and which are still on the roadmap. --->

### Current values that need observation

- Resource consumption: CPU, RAM (in the future also IO - if we implement
  persistent queues) and any other metrics that may be available to Go apps
  (e.g. garbage size, etc).

- Receiving data rate, broken down by receivers and by data type
  (traces/metrics).

- Exporting data rate, broken down by exporters and by data type
  (traces/metrics).

- Data drop rate due to throttling, broken down by data type.

- Data drop rate due to invalid data received, broken down by data type.

- Current throttling state: Not Throttled/Throttled by Downstream/Internally
  Saturated.

- Incoming connection count, broken down by receiver.

- Incoming connection rate (new connections per second), broken down by
  receiver.

- In-memory queue size (in bytes and in units). Note: measurements in bytes may
  be difficult / expensive to obtain and should be used cautiously.

- Persistent queue size (when supported).

- End-to-end latency (from receiver input to exporter output). Note that with
  multiple receivers/exporters we potentially have NxM data paths, each with
  different latency (plus different pipelines in the future), so realistically
  we should likely expose the average of all data paths (perhaps broken down by
  pipeline).

- Latency broken down by pipeline elements (including exporter network roundtrip
  latency for request/response protocols).

“Rate” values must reflect the average rate of the last 10 seconds. Rates must
exposed in bytes/sec and units/sec (e.g. spans/sec).

Note: some of the current values and rates may be calculated as derivatives of
cumulative values in the backend, so it is an open question if we want to expose
them separately or no.

### Cumulative values that need observation

- Total received data, broken down by receivers and by data type
  (traces/metrics).

- Total exported data, broken down by exporters and by data type
  (traces/metrics).

- Total dropped data due to throttling, broken down by data type.

- Total dropped data due to invalid data received, broken down by data type.

- Total incoming connection count, broken down by receiver.

- Uptime since start.

### Trace or log on events

We want to generate the following events (log and/or send as a trace with
additional data):

- Collector started/stopped.

- Collector reconfigured (if we support on-the-fly reconfiguration).

- Begin dropping due to throttling (include throttling reason, e.g. local
  saturation, downstream saturation, downstream unavailable, etc).

- Stop dropping due to throttling.

- Begin dropping due to invalid data (include sample/first invalid data).

- Stop dropping due to invalid data.

- Crash detected (differentiate clean stopping and crash, possibly include crash
  data if available).

For begin/stop events we need to define an appropriate hysteresis to avoid
generating too many events. Note that begin/stop events cannot be detected in
the backend simply as derivatives of current rates, the events include
additional data that is not present in the current value.

### Host metrics

The service should collect host resource metrics in addition to service's own
process metrics. This may help to understand that the problem that we observe in
the service is induced by a different process on the same host.

### Data ingress

The `otelcol_receiver_accepted_spans` and
`otelcol_receiver_accepted_metric_points` metrics provide information about the
data ingested by the Collector.

### Data egress

The `otecol_exporter_sent_spans` and `otelcol_exporter_sent_metric_points`
metrics provide information about the data exported by the Collector.

<!--- TODO: Breakdown by signal and add definitions. Include extensions here? --->
