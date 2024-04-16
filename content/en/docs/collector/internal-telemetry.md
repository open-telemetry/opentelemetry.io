---
title: Internal telemetry
weight: 25
cSpell:ignore: journalctl kube otecol pprof tracez zpages
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

{{% alert title="Caution" color="warning" %}}

Self-monitoring is a risky practice. If an issue arises, the source of the
problem is unclear and the telemetry is unreliable.

{{% /alert %}}

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
