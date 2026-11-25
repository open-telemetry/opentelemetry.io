---
title: Performance
description: Measure and evaluate the performance of the OpenTelemetry Collector.
weight: 98
---

The performance of the OpenTelemetry Collector depends on its configuration,
the characteristics and volume of the telemetry it processes, and the resources
available in its deployment environment.

Understanding how these factors affect resource consumption and telemetry
delivery helps you make informed configuration and deployment decisions.

## Establish a performance baseline

Before optimizing a Collector configuration, establish a baseline against
which subsequent measurements can be compared.

A performance baseline should capture resource consumption and telemetry
delivery under a known workload.

### What to measure

When evaluating Collector performance, consider the following:

- **CPU usage**: The computational resources consumed by the Collector.
- **Memory usage**: The memory required to receive, process, and export
  telemetry.
- **Throughput**: The number of telemetry items received and exported per
  unit of time.
- **Telemetry delivery**: Whether telemetry is successfully exported,
  refused, or fails to be exported.
- **Queue utilization**: Where applicable, the extent to which exporter
  queues are occupied.

Use the Collector's [internal telemetry](../internal-telemetry/) to observe
these indicators.

### Define your test conditions

To make performance measurements comparable and reproducible, document
the following:

- Collector version and distribution.
- Collector configuration.
- Available CPU and memory resources.
- Telemetry signal, data volume, and workload characteristics.
- Test duration and warm-up period.
- Export destination and its configuration.

When comparing Collector configurations, keep the test conditions consistent
and change one configuration variable at a time.

A reduction in CPU or memory usage does not necessarily indicate improved
performance if the Collector also exports less telemetry than intended.

## Related resources

- [Collector internal telemetry](../internal-telemetry/)
- [Collector benchmarks](../benchmarks/)
- [Collector troubleshooting](../troubleshooting/)

