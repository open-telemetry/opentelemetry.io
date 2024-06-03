---
title: Internal telemetry
weight: 25
# prettier-ignore
cSpell:ignore: alloc journalctl kube otecol pprof tracez underperforming zpages
---

You can monitor the health of any OpenTelemetry Collector instance by checking
its own internal telemetry. Read on to learn about this telemetry and how to
configure it to help you [troubleshoot](/docs/collector/troubleshooting/)
Collector issues.

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
      address: 0.0.0.0:8888
```

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

The Collector can also be configured to scrape its own metrics using a
[Prometheus receiver](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/receiver/prometheusreceiver)
and send them through configured pipelines. For example:

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

When self-monitoring, the Collector collects its own telemetry and sends it to
the desired backend for analysis. This can be a risky practice. If the Collector
is underperforming, its self-monitoring capability could be impacted. As a
result, the self-monitored telemetry might not reach the backend in time for
critical analysis.

{{% /alert %}}

### Configure internal logs

Log output is found in `stderr`. You can configure logs in the config
`service::telemetry::logs`. The [configuration
options](https://github.com/open-telemetry/opentelemetry-collector/blob/v{{%
param vers %}}/service/telemetry/config.go) are:

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

## Types of internal telemetry

The OpenTelemetry Collector aims to be a model of observable service by clearly
exposing its own operational metrics. Additionally, it collects host resource
metrics that can help you understand if problems are caused by a different
process on the same host. Specific components of the Collector can also emit
their own custom telemetry. In this section, you will learn about the different
types of observability emitted by the Collector itself.

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

Rate values are averages over 10 second periods, measured in bytes/sec or
units/sec (for example, spans/sec).

{{% alert title="Caution" color="warning" %}}

Byte measurements can be expensive to compute.

{{% /alert %}}

The Collector also emits internal metrics for these **cumulative values**:

- Total received data, broken down by receivers.
- Total exported data, broken down by exporters.
- Total dropped data due to throttling, broken down by data type.
- Total dropped data due to invalid data received, broken down by data type.
- Total incoming connection count, broken down by receiver.
- Uptime since start.

### Lists of internal metrics

The following tables group each internal metric by level of verbosity: `basic`,
`normal`, and `detailed`. Each metric is identified by name and description and
categorized by instrumentation type.

<!---To compile this list, configure a Collector instance to emit its own metrics to the localhost:8888/metrics endpoint. Select a metric and grep for it in the Collector core repository. For example, the `otelcol_process_memory_rss` can be found using:`grep -Hrn "memory_rss" .` Make sure to eliminate from your search string any words that might be prefixes. Look through the results until you find the .go file that contains the list of metrics. In the case of `otelcol_process_memory_rss`, it and other process metrics can be found in https://github.com/open-telemetry/opentelemetry-collector/blob/31528ce81d44e9265e1a3bbbd27dc86d09ba1354/service/internal/proctelemetry/process_telemetry.go#L92. Note that the Collector's internal metrics are defined in several different files in the repository.--->

#### `basic`-level metrics

| Metric name                                            | Description                                                                             | Type      |
| ------------------------------------------------------ | --------------------------------------------------------------------------------------- | --------- |
| `otelcol_exporter_enqueue_failed_`<br>`log_records`    | Number of spans that exporter(s) failed to enqueue.                                     | Counter   |
| `otelcol_exporter_enqueue_failed_`<br>`metric_points`  | Number of metric points that exporter(s) failed to enqueue.                             | Counter   |
| `otelcol_exporter_enqueue_failed_`<br>`spans`          | Number of spans that exporter(s) failed to enqueue.                                     | Counter   |
| `otelcol_exporter_queue_capacity`                      | Fixed capacity of the retry queue, in batches.                                          | Gauge     |
| `otelcol_exporter_queue_size`                          | Current size of the retry queue, in batches.                                            | Gauge     |
| `otelcol_exporter_send_failed_`<br>`log_records`       | Number of logs that exporter(s) failed to send to destination.                          | Counter   |
| `otelcol_exporter_send_failed_`<br>`metric_points`     | Number of metric points that exporter(s) failed to send to destination.                 | Counter   |
| `otelcol_exporter_send_failed_`<br>`spans`             | Number of spans that exporter(s) failed to send to destination.                         | Counter   |
| `otelcol_exporter_sent_log_records`                    | Number of logs successfully sent to destination.                                        | Counter   |
| `otelcol_exporter_sent_metric_points`                  | Number of metric points successfully sent to destination.                               | Counter   |
| `otelcol_exporter_sent_spans`                          | Number of spans successfully sent to destination.                                       | Counter   |
| `otelcol_process_cpu_seconds`                          | Total CPU user and system time in seconds.                                              | Counter   |
| `otelcol_process_memory_rss`                           | Total physical memory (resident set size).                                              | Gauge     |
| `otelcol_process_runtime_heap_`<br>`alloc_bytes`       | Bytes of allocated heap objects (see 'go doc runtime.MemStats.HeapAlloc').              | Gauge     |
| `otelcol_process_runtime_total_`<br>`alloc_bytes`      | Cumulative bytes allocated for heap objects (see 'go doc runtime.MemStats.TotalAlloc'). | Counter   |
| `otelcol_process_runtime_total_`<br>`sys_memory_bytes` | Total bytes of memory obtained from the OS (see 'go doc runtime.MemStats.Sys').         | Gauge     |
| `otelcol_process_uptime`                               | Uptime of the process.                                                                  | Counter   |
| `otelcol_processor_accepted_`<br>`log_records`         | Number of logs successfully pushed into the next component in the pipeline.             | Counter   |
| `otelcol_processor_accepted_`<br>`metric_points`       | Number of metric points successfully pushed into the next component in the pipeline.    | Counter   |
| `otelcol_processor_accepted_spans`                     | Number of spans successfully pushed into the next component in the pipeline.            | Counter   |
| `otelcol_processor_batch_batch_`<br>`send_size_bytes`  | Number of bytes in the batch that was sent.                                             | Histogram |
| `otelcol_processor_dropped_`<br>`log_records`          | Number of logs dropped by the processor.                                                | Counter   |
| `otelcol_processor_dropped_`<br>`metric_points`        | Number of metric points dropped by the processor.                                       | Counter   |
| `otelcol_processor_dropped_spans`                      | Number of spans dropped by the processor.                                               | Counter   |
| `otelcol_receiver_accepted_`<br>`log_records`          | Number of logs successfully ingested and pushed into the pipeline.                      | Counter   |
| `otelcol_receiver_accepted_`<br>`metric_points`        | Number of metric points successfully ingested and pushed into the pipeline.             | Counter   |
| `otelcol_receiver_accepted_spans`                      | Number of spans successfully ingested and pushed into the pipeline.                     | Counter   |
| `otelcol_receiver_refused_`<br>`log_records`           | Number of logs that could not be pushed into the pipeline.                              | Counter   |
| `otelcol_receiver_refused_`<br>`metric_points`         | Number of metric points that could not be pushed into the pipeline.                     | Counter   |
| `otelcol_receiver_refused_spans`                       | Number of spans that could not be pushed into the pipeline.                             | Counter   |
| `otelcol_scraper_errored_`<br>`metric_points`          | Number of metric points the Collector failed to scrape.                                 | Counter   |
| `otelcol_scraper_scraped_`<br>`metric_points`          | Number of metric points scraped by the Collector.                                       | Counter   |

#### Additional `normal`-level metrics

| Metric name                                             | Description                                                     | Type      |
| ------------------------------------------------------- | --------------------------------------------------------------- | --------- |
| `otelcol_processor_batch_batch_`<br>`send_size`         | Number of units in the batch.                                   | Histogram |
| `otelcol_processor_batch_batch_`<br>`size_trigger_send` | Number of times the batch was sent due to a size trigger.       | Counter   |
| `otelcol_processor_batch_metadata_`<br>`cardinality`    | Number of distinct metadata value combinations being processed. | Counter   |
| `otelcol_processor_batch_timeout_`<br>`trigger_send`    | Number of times the batch was sent due to a timeout trigger.    | Counter   |

#### Additional `detailed`-level metrics

| Metric name                       | Description                                                                               | Type      |
| --------------------------------- | ----------------------------------------------------------------------------------------- | --------- |
| `http_client_active_requests`     | Number of active HTTP client requests.                                                    | Counter   |
| `http_client_connection_duration` | Measures the duration of the successfully established outbound HTTP connections.          | Histogram |
| `http_client_open_connections`    | Number of outbound HTTP connections that are active or idle on the client.                | Counter   |
| `http_client_request_body_size`   | Measures the size of HTTP client request bodies.                                          | Histogram |
| `http_client_request_duration`    | Measures the duration of HTTP client requests.                                            | Histogram |
| `http_client_response_body_size`  | Measures the size of HTTP client response bodies.                                         | Histogram |
| `http_server_active_requests`     | Number of active HTTP server requests.                                                    | Counter   |
| `http_server_request_body_size`   | Measures the size of HTTP server request bodies.                                          | Histogram |
| `http_server_request_duration`    | Measures the duration of HTTP server requests.                                            | Histogram |
| `http_server_response_body_size`  | Measures the size of HTTP server response bodies.                                         | Histogram |
| `rpc_client_duration`             | Measures the duration of outbound RPC.                                                    | Histogram |
| `rpc_client_request_size`         | Measures the size of RPC request messages (uncompressed).                                 | Histogram |
| `rpc_client_requests_per_rpc`     | Measures the number of messages received per RPC. Should be 1 for all non-streaming RPCs. | Histogram |
| `rpc_client_response_size`        | Measures the size of RPC response messages (uncompressed).                                | Histogram |
| `rpc_client_responses_per_rpc`    | Measures the number of messages sent per RPC. Should be 1 for all non-streaming RPCs.     | Histogram |
| `rpc_server_duration`             | Measures the duration of inbound RPC.                                                     | Histogram |
| `rpc_server_request_size`         | Measures the size of RPC request messages (uncompressed).                                 | Histogram |
| `rpc_server_requests_per_rpc`     | Measures the number of messages received per RPC. Should be 1 for all non-streaming RPCs. | Histogram |
| `rpc_server_response_size`        | Measures the size of RPC response messages (uncompressed).                                | Histogram |
| `rpc_server_responses_per_rpc`    | Measures the number of messages sent per RPC. Should be 1 for all non-streaming RPCs.     | Histogram |

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

## Use internal telemetry to monitor the Collector

This section recommends best practices for monitoring the Collector using its
own telemetry.

### Critical monitoring

#### Data loss

Use the rate of `otelcol_processor_dropped_spans > 0` and
`otelcol_processor_dropped_metric_points > 0` to detect data loss. Depending on
your project's requirements, select a narrow time window before alerting begins
to avoid notifications for small losses that are within the desired reliability
range and not considered outages.

#### Low on CPU resources

This depends on the CPU metrics available on the deployment, eg.:
`kube_pod_container_resource_limits{resource="cpu", unit="core"}` for
Kubernetes. Let's call it `available_cores`. The idea here is to have an
upper bound of the number of available cores, and the maximum expected ingestion
rate considered safe, let's call it `safe_rate`, per core. This should trigger
increase of resources/ instances (or raise an alert as appropriate) whenever
`(actual_rate/available_cores) < safe_rate`.

The `safe_rate` depends on the specific configuration being used. // TODO:
Provide reference `safe_rate` for a few selected configurations.

### Secondary monitoring

#### Queue length

Most exporters provide a
[queue or retry mechanism](https://github.com/open-telemetry/opentelemetry-collector/blob/main/exporter/exporterhelper/README.md)
that is recommended for use in any production deployment of the Collector.

The `otelcol_exporter_queue_capacity` metric indicates the capacity, in batches,
of the retry queue. The `otelcol_exporter_queue_size` metric indicates the
current size of the retry queue. Use these two metrics to check if the queue
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

Sustained rates of `otelcol_receiver_refused_spans` and
`otelcol_receiver_refused_metric_points` indicate that too many errors were
returned to clients. Depending on the deployment and the clients' resilience,
this might indicate clients' data loss.

Sustained rates of `otelcol_exporter_send_failed_spans` and
`otelcol_exporter_send_failed_metric_points` indicate that the Collector is not
able to export data as expected. These metrics do not inherently imply data loss
since there could be retries. But a high rate of failures could indicate issues
with the network or backend receiving the data.

#### Data flow

You can monitor data ingress with the `otelcol_receiver_accepted_spans` and
`otelcol_receiver_accepted_metric_points` metrics and data egress with the
`otecol_exporter_sent_spans` and `otelcol_exporter_sent_metric_points` metrics.
