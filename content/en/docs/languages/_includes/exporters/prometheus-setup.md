## Prometheus

To send your metric data to [Prometheus](https://prometheus.io/), you can either:
- [enable Prometheus' OTLP Receiver](https://prometheus.io/docs/guides/opentelemetry/#enable-the-otlp-receiver)
and use the [OTLP exporter](#otlp) (best practice),
- [enable Prometheus' OTLP Receiver](https://prometheus.io/docs/guides/opentelemetry/#enable-the-otlp-receiver)
and [push Prometheus to the metrics endpoint directly](#push-metrics-directly) (for development or testing purposes),
- or you can use the Prometheus exporter, a `MetricReader` that starts an HTTP server that collects metrics and serialize to Prometheus text format on request.

### Backend setup {#prometheus-setup}

For [OTLP Exporter](#otlp-dependencies) or [Prometheus exporter](#prometheus-dependencies):

  To run a Prometheus server backend and begin scraping metrics, see the [Prometheus getting started guide](https://prometheus.io/docs/prometheus/latest/getting_started/). To enable the OTLP Receiver, see the [Prometheus guide for enabling the OTLP Receiver](https://prometheus.io/docs/guides/opentelemetry/#enable-the-otlp-receiver).

For pushing to a metrics endpoint directly:
  
  Follow the [example prometheus.yml configuration in this Prometheus guide](https://prometheus.io/docs/guides/opentelemetry/#configuring-prometheus).

Once you have Prometheus set up, you can set up the OTLP Exporter, Prometheus exporter, or push to a metrics endpoint directly.

### Push To Metrics Endpoint {#push-metrics-directly}
#### Step 1: Using Environment Variables
OpenTelemetry SDKs and instrumentation libraries can usually be configured via [standard environment variables](/docs/languages/sdk-configuration/). Set the environment variables before starting your application by:
- exporting them directly from your terminal,
- adding them to your shell config file (e.g., `.bashrc`, `.zshrc`), 
- or loading them from a `.env` file. 

Below are the OpenTelemetry variables needed to send OpenTelemetry metrics to a Prometheus server on localhost:

```bash
export OTEL_EXPORTER_OTLP_PROTOCOL=http/protobuf
export OTEL_EXPORTER_OTLP_METRICS_ENDPOINT=http://localhost:9090/api/v1/otlp

```
Note:

- The [OpenTelemetry specification](https://github.com/open-telemetry/opentelemetry-specification/blob/v1.50.0/specification/protocol/exporter.md#endpoint-urls-for-otlphttp) states that the OTEL_EXPORTER_OTLP_METRICS_ENDPOINT env var must be used as a base URL. The signal `/v1/metrics` is automatically appended
- See also: [opentelemetry-python #2443](https://github.com/open-telemetry/opentelemetry-python/issues/2443) 

Turn off traces and logs:

```bash
export OTEL_TRACES_EXPORTER=none
export OTEL_LOGS_EXPORTER=none
```

The default push interval for OpenTelemetry metrics is 60 seconds. The following will set a 15-second push interval:

```bash
export OTEL_METRIC_EXPORT_INTERVAL=15000
```

If your instrumentation library does not provide `service.name` and `service.instance.id` out-of-the-box, it is highly recommended to set them.

```bash
export OTEL_SERVICE_NAME="my-example-service"
export OTEL_RESOURCE_ATTRIBUTES="service.instance.id=$(uuidgen)"
```

The above assumes that the `uuidgen` command is available on your system. Make sure that `service.instance.id` is unique for each instance, and that a new `service.instance.id` is generated whenever a resource attribute changes. The [recommended way](https://github.com/open-telemetry/semantic-conventions/tree/main/docs/resource) is to generate a new UUID on each startup of an instance.

#### Step 2: Configuring Telemetry
Update your OpenTelemetry Configuration to use the same `exporter` and `reader` from the [OTLP](#otlp-dependencies) setup. If the environment variables are set up and loaded correctly, the OpenTelemetry SDK reads them automatically. 
