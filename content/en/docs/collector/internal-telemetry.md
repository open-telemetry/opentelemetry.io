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

The OpenTelemetry Collector aims to be an exemplar of observable service by
clearly exposing its own operational metrics. In this section, you can explore
the different types of observability emitted by the Collector itself.

### Values observable with internal metrics

The Collector emits internal metrics for the following **current values**:

- Resource consumption, including CPU, memory, and I/O.

- Data reception rate, broken down by receiver.

- Data export rate, broken down by exporters.

- Data drop rate due to throttling, broken down by data type.

- Data drop rate due to invalid data received, broken down by data type.

- Throttling state, including Not Throttled, Throttled by Downstream, and
  Internally Saturated.

- Incoming connection count, broken down by receiver.

- Incoming connection rate showing new connections per second, broken down by
  receiver.

- In-memory queue size in bytes and in units.

- Persistent queue size.

- End-to-end latency from receiver input to exporter output.

- Latency broken down by pipeline elements, including exporter network roundtrip
  latency for request/response protocols.

{{% alert title="Important" color="warning" %}}

- Rate values reflect the average rate of the last 10 seconds. They are exposed
  in bytes/sec and units/sec (for example, spans/sec).
- Measurements in bytes might be difficult and expensive to obtain. They should
  be used with caution.

{{% /alert %}}

The Collector also emits internal metrics for these **cumulative values**:

- Total received data, broken down by receivers.

- Total exported data, broken down by exporters.

- Total dropped data due to throttling, broken down by data type.

- Total dropped data due to invalid data received, broken down by data type.

- Total incoming connection count, broken down by receiver.

- Uptime since start.

### List of internal metrics

The following table identifies each internal metric by name and description.
Each metric is also categorized by instrumentation type and level of verbosity.

| Name                                              | Description                                                                               | Type      | Level      |
| ------------------------------------------------- | ----------------------------------------------------------------------------------------- | --------- | ---------- |
| `otelcol_exporter_enqueue_failed_log_records`     | Number of spans that exporter(s) failed to enqueue.                                       | Counter   |            |
| `otelcol_exporter_enqueue_failed_metric_points`   | Number of metric points that exporter(s) failed to enqueue.                               | Counter   |            |
| `otelcol_exporter_enqueue_failed_spans`           | Number of spans that exporter(s) failed to enqueue.                                       | Counter   |            |
| `otelcol_exporter_queue_capacity`                 | Fixed capacity of the retry queue, in batches.                                            | Gauge     |            |
| `otelcol_exporter_queue_size`                     | Current size of the retry queue, in batches.                                              | Gauge     |            |
| `otelcol_exporter_send_failed_log_records`        | Number of logs that exporter(s) failed to send to destination.                            | Counter   |            |
| `otelcol_exporter_send_failed_metric_points`      | Number of metric points that exporter(s) failed to send to destination.                   | Counter   |            |
| `otelcol_exporter_send_failed_spans`              | Number of spans that exporter(s) failed to send to destination.                           | Counter   |            |
| `otelcol_exporter_sent_log_records`               | Number of logs successfully sent to destination.                                          | Counter   |            |
| `otelcol_exporter_sent_metric_points`             | Number of metric points successfully sent to destination.                                 | Counter   |            |
| `otelcol_exporter_sent_spans`                     | Number of spans successfully sent to destination.                                         | Counter   |            |
| `otelcol_http_client_active_requests`             | Number of active HTTP client requests.                                                    | Counter   | `detailed` |
| `otelcol_http_client_connection_duration`         | Measures the duration of the successfully established outbound HTTP connections.          | Histogram | `detailed` |
| `otelcol_http_client_open_connections`            | Number of outbound HTTP connections that are active or idle on the client.                | Counter   | `detailed` |
| `otelcol_http_client_request_body_size`           | Measures the size of HTTP client request bodies.                                          | Histogram | `detailed` |
| `otelcol_http_client_request_duration`            | Measures the duration of HTTP client requests.                                            | Histogram | `detailed` |
| `otelcol_http_client_response_body_size`          | Measures the size of HTTP client response bodies.                                         | Histogram | `detailed` |
| `otelcol_http_server_active_requests`             | Number of active HTTP server requests.                                                    | Counter   | `detailed` |
| `otelcol_http_server_request_body_size`           | Measures the size of HTTP server request bodies.                                          | Histogram | `detailed` |
| `otelcol_http_server_request_duration`            | Measures the duration of HTTP server requests.                                            | Histogram | `detailed` |
| `otelcol_http_server_response_body_size`          | Measures the size of HTTP server response bodies.                                         | Histogram | `detailed` |
| `otelcol_process_cpu_seconds`                     | Total CPU user and system time in seconds.                                                | Counter   |            |
| `otelcol_process_memory_rss`                      | Total physical memory (resident set size).                                                | Gauge     |            |
| `otelcol_process_runtime_heap_alloc_bytes`        | Bytes of allocated heap objects (see 'go doc runtime.MemStats.HeapAlloc').                | Gauge     |            |
| `otelcol_process_runtime_total_alloc_bytes`       | Cumulative bytes allocated for heap objects (see 'go doc runtime.MemStats.TotalAlloc').   | Counter   |            |
| `otelcol_process_runtime_total_sys_memory_bytes`  | Total bytes of memory obtained from the OS (see 'go doc runtime.MemStats.Sys').           | Gauge     |            |
| `otelcol_process_uptime`                          | Uptime of the process.                                                                    | Counter   |            |
| `otelcol_processor_accepted_log_records`          | Number of logs successfully pushed into the next component in the pipeline.               | Counter   |            |
| `otelcol_processor_accepted_metric_points`        | Number of metric points successfully pushed into the next component in the pipeline.      | Counter   |            |
| `otelcol_processor_accepted_spans`                | Number of spans successfully pushed into the next component in the pipeline.              | Counter   |            |
| `otelcol_processor_batch_batch_send_size_bytes`   | Number of bytes in the batch that was sent.                                               | Histogram |            |
| `otelcol_processor_batch_batch_send_size`         | Number of units in the batch.                                                             | Histogram | `normal`   |
| `otelcol_processor_batch_batch_size_trigger_send` | Number of times the batch was sent due to a size trigger.                                 | Counter   | `normal`   |
| `otelcol_processor_batch_metadata_cardinality`    | Number of distinct metadata value combinations being processed.                           | Counter   | `normal`   |
| `otelcol_processor_batch_timeout_trigger_send`    | Number of times the batch was sent due to a timeout trigger.                              | Counter   | `normal`   |
| `otelcol_processor_dropped_log_records`           | Number of logs dropped by the processor.                                                  | Counter   |            |
| `otelcol_processor_dropped_metric_points`         | Number of metric points dropped by the processor.                                         | Counter   |            |
| `otelcol_processor_dropped_spans`                 | Number of spans dropped by the processor.                                                 | Counter   |            |
| `otelcol_receiver_accepted_log_records`           | Number of logs successfully pushed into the pipeline.                                     | Counter   |            |
| `otelcol_receiver_accepted_metric_points`         | Number of metric points successfully pushed into the pipeline.                            | Counter   |            |
| `otelcol_receiver_accepted_spans`                 | Number of spans successfully pushed into the pipeline.                                    | Counter   |            |
| `otelcol_receiver_refused_log_records`            | Number of logs that could not be pushed into the pipeline.                                | Counter   |            |
| `otelcol_receiver_refused_metric_points`          | Number of metric points that could not be pushed into the pipeline.                       | Counter   |            |
| `otelcol_receiver_refused_spans`                  | Number of spans that could not be pushed into the pipeline.                               | Counter   |            |
| `otelcol_rpc_client_duration`                     | Measures the duration of outbound RPC.                                                    | Histogram | `detailed` |
| `otelcol_rpc_client_request_size`                 | Measures the size of RPC request messages (uncompressed).                                 | Histogram | `detailed` |
| `otelcol_rpc_client_requests_per_rpc`             | Measures the number of messages received per RPC. Should be 1 for all non-streaming RPCs. | Histogram | `detailed` |
| `otelcol_rpc_client_response_size`                | Measures the size of RPC response messages (uncompressed).                                | Histogram | `detailed` |
| `otelcol_rpc_client_responses_per_rpc`            | Measures the number of messages sent per RPC. Should be 1 for all non-streaming RPCs.     | Histogram | `detailed` |
| `otelcol_rpc_server_duration`                     | Measures the duration of inbound RPC.                                                     | Histogram | `detailed` |
| `otelcol_rpc_server_request_size`                 | Measures the size of RPC request messages (uncompressed).                                 | Histogram | `detailed` |
| `otelcol_rpc_server_requests_per_rpc`             | Measures the number of messages received per RPC. Should be 1 for all non-streaming RPCs. | Histogram | `detailed` |
| `otelcol_rpc_server_response_size`                | Measures the size of RPC response messages (uncompressed).                                | Histogram | `detailed` |
| `otelcol_rpc_server_responses_per_rpc`            | Measures the number of messages sent per RPC. Should be 1 for all non-streaming RPCs.     | Histogram | `detailed` |
| `otelcol_scraper_errored_metric_points`           | Number of metric points the Collector failed to scrape.                                   | Counter   |            |
| `otelcol_scraper_scraped_metric_points`           | Number of metric points scraped by the Collector.                                         | Counter   |            |

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

<!--- TODO: Include extensions here? --->
