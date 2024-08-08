---
title: Multiple Collectors
description:
  Considerations for single-writer responsibility when deploying multiple
  collectors in a gateway configuration.
weight: 3
---

## Deploying Multiple Collectors

When deploying multiple collectors in a gateway configuration, it's important to
ensure that all metric data streams have a single writer and a globally unique
identity.

### The Single-Writer Principle

The Single-Writer Principle refers to employing a single logical writer for a
particular resource. Concurrent access from multiple applications that modify or
report on the same data can lead to data loss or, at least, degraded data
quality. In gateway collector deployments, applying this principle guards
against sending inconsistent data to the backend. All metric data streams within
OTLP must have a
[single writer](/docs/specs/otel/metrics/data-model/#single-writer).
In a system with multiple collectors, the single-writer principle is most
relevant for receivers that create their own metrics, such a pull-based scrapers
or a host metrics receiver.

### Deployment Considerations

#### Host Metrics Receiver

When creating metrics related to the host system via the
[host metrics receiver](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/receiver/hostmetricsreceiver),
it is important to have only one host metrics receiver instance per host. A
violation of the single-writer principle in this scenario would mean deploying
more than one host metrics receiver on the same host. If both try to collect
system data at the same time, this may result in inconsistent data or data loss.
Collisions resulting from inconsistent timestamps may lead to an unstable or
inconsistent representation of metrics, such as CPU usage.

### Detection

There are patterns in the data that may provide some insight into whether this
is happening or not. For example, upon visual inspection, a series with
unexplained gaps or jumps in the same series may be a clue that multiple
collectors are sending the same samples. Unexplained behavior in a time series
could potentially point to the backend scraping data from multiple sources.

There are also more direct errors that could surface in the backend.

With a Prometheus backend, an example error is:
`Error on ingesting out-of-order samples`.

This could indicate that identical targets exist in two jobs, and the order of
the timestamps is incorrect.

Ex:

- Metric T2 received at time 13:56:04
- Metric T1 received at time 13:56:07 for the same state as T2

### Prevention

All metric streams produced by OTel SDKs should have a globally unique
[Metric Identity](/docs/specs/otel/metrics/data-model/#opentelemetry-protocol-data-model-producer-recommendations).
This is to lower the risk of duplication, and ensure writers are sending unique
data to the backend.

### References

- [Understanding Duplicate Samples and Out-of-order Timestamp Errors in Prometheus ](https://promlabs.com/blog/2022/12/15/understanding-duplicate-samples-and-out-of-order-timestamp-errors-in-prometheus)
