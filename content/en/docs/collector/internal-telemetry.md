# Internal Telemetry

The Collector offers you multiple ways to measure and monitor its health as well
as investigate issues. In this section, you'll learn how to enable internal
observability, what types of telemetry are available, and how best to use them
to monitor your Collector deployment.

## Enabling observability internal to the Collector

By default, the Collector exposes service telemetry in two ways currently:

- internal metrics are exposed via a Prometheus interface which defaults to port
  `8888`
- logs are emitted to stdout

Traces are not exposed by default. There is an effort underway to [change
this][issue7532]. The work includes supporting configuration of the
OpenTelemetry SDK used to produce the Collector's internal telemetry. This
feature is currently behind two feature gates:

```bash
  --feature-gates=telemetry.useOtelWithSDKConfigurationForInternalTelemetry
```

The gate `useOtelWithSDKConfigurationForInternalTelemetry` enables the Collector
to parse configuration that aligns with the [OpenTelemetry Configuration]
schema. The support for this schema is still experimental, but it does allow
telemetry to be exported via OTLP.

The following configuration can be used in combination with the feature gates
aforementioned to emit internal metrics and traces from the Collector to an OTLP
backend:

```yaml
service:
  telemetry:
    metrics:
      readers:
        - periodic:
            interval: 5000
            exporter:
              otlp:
                protocol: grpc/protobuf
                endpoint: https://backend:4317
    traces:
      processors:
        - batch:
            exporter:
              otlp:
                protocol: grpc/protobuf
                endpoint: https://backend2:4317
```

See the configuration's [example][kitchen-sink] for additional configuration
options.

Note that this configuration does not support emitting logs as there is no
support for [logs] in OpenTelemetry Go SDK at this time.

<!--- TODO: From Common Issues of Troubleshooting page. Move to Types? --->

To see logs for the Collector:

On a Linux systemd system, logs can be found using `journalctl`:  
`journalctl | grep otelcol`

or to find only errors:  
`journalctl | grep otelcol | grep Error`

## Types of internal observability

<!--- TODO: Add intro sentence. --->

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

## Using metrics to monitor the Collector

<!--- TODO: Add intro sentence - key recommendations? --->

### Critical monitoring

#### Data loss

Use rate of `otelcol_processor_dropped_spans > 0` and
`otelcol_processor_dropped_metric_points > 0` to detect data loss, depending on
the requirements set up a minimal time window before alerting, avoiding
notifications for small losses that are not considered outages or within the
desired reliability level.

#### Low on CPU resources

Monitoring CPU resources depends on the CPU metrics available on the deployment.
For example, a Kubernetes deployment may include
`kube_pod_container_resource_limits{resource="cpu", unit="core"}`. Let's call it
`available_cores` below. The idea here is to have an upper bound of the number
of available cores, and the maximum expected ingestion rate considered safe,
let's call it `safe_rate`, per core. This should trigger increase of resources/
instances (or raise an alert as appropriate) whenever
`(actual_rate/available_cores) < safe_rate`.

The `safe_rate` depends on the specific configuration being used.

<!--- TODO: (Carry-over) Provide reference `safe_rate` for a few selected configurations. --->

### Secondary monitoring

#### Queue length

Most exporters offer a
[queue/retry mechanism](../exporter/exporterhelper/README.md) that is
recommended as the retry mechanism for the Collector and as such should be used
in any production deployment.

The `otelcol_exporter_queue_capacity` indicates the capacity of the retry queue
(in batches). The `otelcol_exporter_queue_size` indicates the current size of
retry queue. So you can use these two metrics to check if the queue capacity is
enough for your workload.

The `otelcol_exporter_enqueue_failed_spans`,
`otelcol_exporter_enqueue_failed_metric_points` and
`otelcol_exporter_enqueue_failed_log_records` indicate the number of span/metric
points/log records failed to be added to the sending queue. This may be cause by
a queue full of unsettled elements, so you may need to decrease your sending
rate or horizontally scale collectors.

The queue/retry mechanism also supports logging for monitoring. Check the logs
for messages like `"Dropping data because sending_queue is full"`.

#### Receive failures

Sustained rates of `otelcol_receiver_refused_spans` and
`otelcol_receiver_refused_metric_points` indicate too many errors returned to
clients. Depending on the deployment and the client’s resilience this may
indicate data loss at the clients.

Sustained rates of `otelcol_exporter_send_failed_spans` and
`otelcol_exporter_send_failed_metric_points` indicate that the Collector is not
able to export data as expected. It doesn't imply data loss per se since there
could be retries but a high rate of failures could indicate issues with the
network or backend receiving the data.

### Data flow

<!--- TODO: Add explanation on using metrics listed in Types? --->

### Logs

Logs can be helpful in identifying issues. Always start by checking the log
output and looking for potential issues. The verbosity level defaults to `INFO`
and can be adjusted.

Set the log level in the config `service::telemetry::logs`

```yaml
service:
  telemetry:
    logs:
      level: 'debug'
```

### Metrics

Prometheus metrics are exposed locally on port `8888` and path `/metrics`. For
containerized environments it may be desirable to expose this port on a public
interface instead of just locally.

Set the address in the config `service::telemetry::metrics`

```yaml
service:
  telemetry:
    metrics:
      address: ':8888'
```

A Grafana dashboard for these metrics can be found
[here](https://grafana.com/grafana/dashboards/15983-opentelemetry-collector/).

You can enhance metrics telemetry level using `level` field. The following is a
list of all possible values and their explanations.

- "none" indicates that no telemetry data should be collected;
- "basic" is the recommended and covers the basics of the service telemetry.
- "normal" adds some other indicators on top of basic.
- "detailed" adds dimensions and views to the previous levels.

For example:

```yaml
service:
  telemetry:
    metrics:
      level: detailed
      address: ':8888'
```

Also note that a Collector can be configured to scrape its own metrics and send
it through configured pipelines. For example:

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
      processors: []
      exporters: [debug]
```

### Traces

OpenTelemetry Collector has an ability to send it's own traces using OTLP
exporter. You can send the traces to OTLP server running on the same
OpenTelemetry Collector, so it goes through configured pipelines. For example:

```yaml
service:
  telemetry:
    traces:
      processors:
        batch:
          exporter:
            otlp:
              protocol: grpc/protobuf
              endpoint: ${MY_POD_IP}:4317
```

### zPages

The
[zpages](https://github.com/open-telemetry/opentelemetry-collector/tree/main/extension/zpagesextension/README.md)
extension, which if enabled is exposed locally on port `55679`, can be used to
check receivers and exporters trace operations via `/debug/tracez`. `zpages` may
contain error logs that the Collector does not emit.

For containerized environments it may be desirable to expose this port on a
public interface instead of just locally. This can be configured via the
extensions configuration section. For example:

```yaml
extensions:
  zpages:
    endpoint: 0.0.0.0:55679
```

### Local exporters

[Local exporters](https://github.com/open-telemetry/opentelemetry-collector/tree/main/exporter#general-information)
can be configured to inspect the data being processed by the Collector.

For live troubleshooting purposes consider leveraging the `debug` exporter,
which can be used to confirm that data is being received, processed and exported
by the Collector.

```yaml
receivers:
  zipkin:
exporters:
  debug:
service:
  pipelines:
    traces:
      receivers: [zipkin]
      processors: []
      exporters: [debug]
```

Get a Zipkin payload to test. For example create a file called `trace.json` that
contains:

```json
[
  {
    "traceId": "5982fe77008310cc80f1da5e10147519",
    "parentId": "90394f6bcffb5d13",
    "id": "67fae42571535f60",
    "kind": "SERVER",
    "name": "/m/n/2.6.1",
    "timestamp": 1516781775726000,
    "duration": 26000,
    "localEndpoint": {
      "serviceName": "api"
    },
    "remoteEndpoint": {
      "serviceName": "apip"
    },
    "tags": {
      "data.http_response_code": "201"
    }
  }
]
```

With the Collector running, send this payload to the Collector. For example:

```console
$ curl -X POST localhost:9411/api/v2/spans -H'Content-Type: application/json' -d @trace.json
```

You should see a log entry like the following from the Collector:

```
2023-09-07T09:57:43.468-0700    info    TracesExporter  {"kind": "exporter", "data_type": "traces", "name": "debug", "resource spans": 1, "spans": 2}
```

You can also configure the `debug` exporter so the entire payload is printed:

```yaml
exporters:
  debug:
    verbosity: detailed
```

With the modified configuration if you re-run the test above the log output
should look like:

```
2023-09-07T09:57:12.820-0700    info    TracesExporter  {"kind": "exporter", "data_type": "traces", "name": "debug", "resource spans": 1, "spans": 2}
2023-09-07T09:57:12.821-0700    info    ResourceSpans #0
Resource SchemaURL: https://opentelemetry.io/schemas/1.4.0
Resource attributes:
     -> service.name: Str(telemetrygen)
ScopeSpans #0
ScopeSpans SchemaURL:
InstrumentationScope telemetrygen
Span #0
    Trace ID       : 0c636f29e29816ea76e6a5b8cd6601cf
    Parent ID      : 1a08eba9395c5243
    ID             : 10cebe4b63d47cae
    Name           : okey-dokey
    Kind           : Internal
    Start time     : 2023-09-07 16:57:12.045933 +0000 UTC
    End time       : 2023-09-07 16:57:12.046058 +0000 UTC
    Status code    : Unset
    Status message :
Attributes:
     -> span.kind: Str(server)
     -> net.peer.ip: Str(1.2.3.4)
     -> peer.service: Str(telemetrygen)
```

### Health Check

The
[health_check](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/extension/healthcheckextension/README.md)
extension, which by default is available on all interfaces on port `13133`, can
be used to ensure the Collector is functioning properly.

```yaml
extensions:
  health_check:
service:
  extensions: [health_check]
```

It returns a response like the following:

```json
{
  "status": "Server available",
  "upSince": "2020-11-11T04:12:31.6847174Z",
  "uptime": "49.0132518s"
}
```

### pprof

The
[pprof](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/extension/pprofextension/README.md)
extension, which by default is available locally on port `1777`, allows you to
profile the Collector as it runs. This is an advanced use-case that should not
be needed in most circumstances.
