---
title: Performance
description:
  Measure and evaluate the performance of the OpenTelemetry Collector.
weight: 98
---

The performance of the OpenTelemetry Collector depends on its configuration, the
characteristics and volume of the telemetry it processes, and the resources
available in its deployment environment.

Understanding how these factors affect resource consumption and telemetry
delivery helps you make informed configuration and deployment decisions.

## Establish a performance baseline

Before optimizing a Collector configuration, establish a baseline against which
subsequent measurements can be compared.

A performance baseline should capture resource consumption and telemetry
delivery under a known workload.

### What to measure

When evaluating Collector performance, consider the following:

- **CPU usage**: The computational resources consumed by the Collector.
- **Memory usage**: The memory required to receive, process, and export
  telemetry.
- **Throughput**: The number of telemetry items received and exported per unit
  of time.
- **Telemetry delivery**: Whether telemetry is successfully exported, refused,
  or fails to be exported.
- **Queue utilization**: Where applicable, the extent to which exporter queues
  are occupied.

Use the Collector's [internal telemetry](../internal-telemetry/) to observe
these indicators.

### Define your test conditions

To make performance measurements comparable and reproducible, document the
following:

- Collector version and distribution.
- Collector configuration.
- Available CPU and memory resources.
- Telemetry signal, data volume, and workload characteristics.
- Test duration and warm-up period.
- Export destination and its configuration.

When comparing Collector configurations, keep the test conditions consistent and
change one configuration variable at a time.

A reduction in CPU or memory usage does not necessarily indicate improved
performance if the Collector also exports less telemetry than intended.

## Measure performance using Telemetrygen

[Telemetrygen](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/cmd/telemetrygen)
is a utility that generates synthetic traces, metrics, and logs. You can use it
to create controlled workloads for evaluating Collector performance.

The following example establishes a baseline for processing traces using a
minimal Collector configuration. It measures resource consumption and
throughput without introducing processors or an external telemetry backend.

### Prerequisites

- An OpenTelemetry Collector distribution that includes the OTLP receiver
  and the nop exporter.
- Telemetrygen.
- Docker.
- A tool such as `curl` to retrieve the Collector's internal metrics.

Use fixed versions of the Collector and Telemetrygen throughout your
experiments. Record these versions alongside your measurements.

### Configure the Collector

Create a file named `collector-config.yaml` with the following configuration:

```yaml
receivers:
  otlp:
    protocols:
      grpc:
        endpoint: 0.0.0.0:4317

exporters:
  nop:

service:
  telemetry:
    metrics:
      readers:
        - pull:
            exporter:
              prometheus:
                host: 0.0.0.0
                port: 8888

  pipelines:
    traces:
      receivers: [otlp]
      exporters: [nop]
```

This configuration uses the following components:

- The OTLP receiver accepts traces over gRPC.
- The nop exporter discards received telemetry without forwarding it to an
  external destination.
- The Collector exposes its internal metrics in Prometheus format on
  port 8888.

Using the nop exporter isolates the experiment from the additional network
and processing overhead associated with exporting telemetry to an external
backend.

### Start the Collector

Run the Collector using Docker, replacing `<version>` with the Collector
version you want to evaluate:

```sh
docker run --rm -d \
  --name otel-collector \
  -p 127.0.0.1:4317:4317 \
  -p 127.0.0.1:8888:8888 \
  -v "$(pwd)/collector-config.yaml:/etc/otelcol-contrib/config.yaml:ro" \
  otel/opentelemetry-collector-contrib:<version>
```

Verify that the Collector is running and that its internal metrics are
accessible:

```sh
curl http://localhost:8888/metrics
```

Before generating telemetry, observe the Collector's resource consumption
while it is idle:

```sh
docker stats otel-collector
```

### Generate a controlled workload

Use Telemetrygen to generate traces and send them to the Collector's OTLP
receiver.

First, generate a short workload to warm up the Collector:

```sh
telemetrygen traces \
  --otlp-endpoint localhost:4317 \
  --otlp-insecure \
  --rate 1000 \
  --duration 30s
```

After the warm-up period, generate a workload using the same rate for a longer
duration:

```sh
telemetrygen traces \
  --otlp-endpoint localhost:4317 \
  --otlp-insecure \
  --rate 1000 \
  --duration 2m
```

The `--rate` parameter controls the configured trace generation rate.
The actual throughput depends on the workload characteristics and the
resources available to Telemetrygen and the Collector.

A trace can contain multiple spans. Do not assume that the configured trace
generation rate is equivalent to the number of spans received by the Collector.

The `--otlp-insecure` option disables transport security for this local
experiment. Use appropriate transport security when sending telemetry across
untrusted networks.

### Collect performance measurements

While the workload is running, monitor the Collector's resource consumption
using:

```sh
docker stats otel-collector
```

Record CPU and memory usage at regular intervals throughout the test.
A single observation might not capture variations or peaks in resource
consumption.

Retrieve the Collector's internal metrics before and after the measured
workload:

```sh
curl -s http://localhost:8888/metrics > metrics-before.txt
```

```sh
curl -s http://localhost:8888/metrics > metrics-after.txt
```

Collect the first snapshot after the warm-up period and before starting the
measured workload. Collect the second snapshot after the workload has completed
and telemetry processing has settled.

The following internal metric families are useful for evaluating the baseline:

| Metric | Description |
| --- | --- |
| `otelcol_process_cpu_seconds` | Cumulative CPU time consumed by the Collector. |
| `otelcol_process_memory_rss` | Resident memory usage of the Collector process. |
| `otelcol_receiver_accepted_spans` | Number of spans accepted by the receiver. |
| `otelcol_receiver_refused_spans` | Number of spans refused by the receiver. |
| `otelcol_exporter_sent_spans` | Number of spans successfully handled by the exporter. |
| `otelcol_exporter_send_failed_spans` | Number of spans the exporter failed to send. |

The exposed metric names might include additional suffixes depending on
the Collector version and Prometheus exposition settings.

For more information about available metrics and their configuration, see
[Collector internal telemetry](../internal-telemetry/).

### Interpret the results

For cumulative metrics, calculate the difference between the measurements
taken before and after the workload.

For example, calculate the average span ingestion throughput by dividing
the increase in accepted spans by the measurement duration in seconds.

Evaluate the following:

- Average and peak CPU usage during the workload.
- Average and peak memory usage during the workload.
- The number of spans accepted and refused by the receiver.
- The number of spans successfully handled by the exporter.
- The number of failed exports.
- Average span throughput during the measurement period.

Under this configuration, the Collector does not intentionally filter or
sample spans. Once processing has settled, investigate any unexpected
difference between accepted spans and spans successfully handled by the
exporter.

Record the results alongside the test conditions. Repeat the experiment
multiple times to account for variability in resource consumption and
throughput.

Use these measurements as a reference when evaluating subsequent
configuration changes.

### Limitations

This example establishes a baseline for a minimal Collector pipeline.
It does not represent the performance of a production deployment.

Consider the following limitations:

- The nop exporter does not reproduce the network overhead, latency, or
  backpressure associated with an external telemetry backend.
- Synthetic telemetry might not reflect the characteristics of production
  workloads.
- Running Telemetrygen and the Collector on the same host can introduce
  resource contention.
- The absence of processors means the baseline does not account for
  transformations, filtering, sampling, or other processing operations.

Performance measurements are specific to the configuration, workload,
Collector version, and deployment environment used during the experiment.

### Clean up

After completing the experiment, stop the Collector:

```sh
docker stop otel-collector
```

## Related resources

- [Collector internal telemetry](../internal-telemetry/)
- [Collector benchmarks](../benchmarks/)
- [Collector troubleshooting](../troubleshooting/)
