---
title: Internal telemetry
weight: 25
cSpell:ignore: journalctl kube otecol pprof tracez zpages
---

You can check the health of any Collector instance by checking its own internal
telemetry. Read on to learn how to use this data to diagnose and troubleshoot
Collector issues.

## Enabling observability internal to the Collector

By default, the Collector exposes service telemetry in two ways:

- Internal [metrics](#configure-internal-metrics) are exposed using a Prometheus
  interface which defaults to port `8888`.
- [Logs](#configure-internal-logs) are emitted to `stdout`.

[Traces](#configure-internal-traces) are not exposed by default but two feature gates
offer experimental support for a configuration based on the OpenTelemetry
Configuration schema.

### Configure internal metrics

Prometheus metrics are exposed locally on port `8888` and path `/metrics`. For
containerized environments, you might want to expose this port on a public
interface instead of only locally.

Set the address in the config `service::telemetry::metrics`:

```yaml
service:
  telemetry:
    metrics:
      address: ':8888'
```

To visualize these metrics, you can use the
[Grafana dashboard](https://grafana.com/grafana/dashboards/15983-opentelemetry-collector/),
for example.

You can enhance the metrics telemetry level using the `level` field. The
following is a list of all possible values and their explanations.

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

### Configure internal logs

You can find log output in `stdout`. The verbosity level for logs defaults to
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

### Configure internal traces

Although the Collector does not expose traces by default, an effort is underway
to
[change this](https://github.com/open-telemetry/opentelemetry-collector/issues/7532).
The work includes supporting configuration of the OpenTelemetry SDK used to
produce the Collector's internal telemetry. This feature is currently behind two
feature gates:

```sh
--feature-gates=telemetry.useOtelWithSDKConfigurationForInternalTelemetry
```

The gate `useOtelWithSDKConfigurationForInternalTelemetry` enables the Collector
to parse configuration that aligns with the
[OpenTelemetry Configuration](https://github.com/open-telemetry/opentelemetry-configuration)
schema. Support for this schema is still experimental, but it does allow
telemetry to be exported using OTLP.

The following configuration can be used in combination with the aforementioned
feature gates to emit internal metrics and traces from the Collector to an OTLP
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

See the
[example configuration](https://github.com/open-telemetry/opentelemetry-configuration/blob/main/examples/kitchen-sink.yaml)
for additional configuration options.

> Note that this configuration does not support emitting logs as there is no
> support for logs in OpenTelemetry Go SDK at this time.
