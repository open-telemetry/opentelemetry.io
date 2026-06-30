---
title: Metrics
weight: 2
description: A measurement captured at runtime.
---

A **metric** is a **measurement** of a service captured at runtime. The moment
of capturing a measurement is known as a **metric event**, which consists not
only of the measurement itself, but also the time at which it was captured and
associated metadata.

Application and request metrics are important indicators of availability and
performance. Custom metrics can provide insights into how availability
indicators impact user experience or the business. Collected data can be used to
alert of an outage or trigger scheduling decisions to scale up a deployment
automatically upon high demand.

To understand how metrics in OpenTelemetry works, let's look at a list of
components that will play a part in instrumenting our code.

## Meter Provider

A Meter Provider (sometimes called `MeterProvider`) is a factory for `Meter`s.
In most applications, a Meter Provider is initialized once and its lifecycle
matches the application's lifecycle. Meter Provider initialization also includes
Resource and Exporter initialization. It is typically the first step in metering
with OpenTelemetry. In some language SDKs, a global Meter Provider is already
initialized for you.

## Meter

A Meter creates [metric instruments](#metric-instruments), capturing
measurements about a service at runtime. Meters are created from Meter
Providers.

## Metric Exporter

Metric Exporters send metric data to a consumer. This consumer can be standard
output for debugging during development, the OpenTelemetry Collector, or any
open source or vendor backend of your choice.

## Metric Instruments

In OpenTelemetry measurements are captured by **metric instruments**. A metric
instrument is defined by:

- Name
- Kind
- Unit (optional)
- Description (optional)

The name, unit, and description are chosen by the developer or defined via
[semantic conventions](/docs/specs/semconv/general/metrics/) for common ones
like request and process metrics.

The instrument kind is one of the following:

- **Counter**: A value that accumulates over time -- you can think of this like
  an odometer on a car; it only ever goes up.
- **Asynchronous Counter**: Same as the **Counter**, but is collected once for
  each export. Could be used if you don't have access to the continuous
  increments, but only to the aggregated value.
- **UpDownCounter**: A value that accumulates over time, but can also go down
  again. An example could be a queue length, it will increase and decrease with
  the number of work items in the queue.
- **Asynchronous UpDownCounter**: Same as the **UpDownCounter**, but is
  collected once for each export. Could be used if you don't have access to the
  continuous changes, but only to the aggregated value (e.g., current queue
  size).
- **Gauge**: Measures a current value at the time it is read. An example would
  be the fuel gauge in a vehicle. Gauges are synchronous.
- **Asynchronous Gauge**: Same as the **Gauge**, but is collected once for each
  export. Could be used if you don't have access to the continuous changes, but
  only to the aggregated value.
- **Histogram**: A client-side aggregation of values, such as request latencies.
  A histogram is a good choice if you are interested in value statistics. For
  example: How many requests take fewer than 1s?

For more on synchronous and asynchronous instruments, and which kind is best
suited for your use case, see
[Supplementary Guidelines](/docs/specs/otel/metrics/supplementary-guidelines/).

## Aggregation

In addition to the metric instruments, the concept of **aggregations** is an
important one to understand. An aggregation is a technique whereby a large
number of measurements are combined into either exact or estimated statistics
about metric events that took place during a time window. The OTLP protocol
transports such aggregated metrics. The OpenTelemetry API provides a default
aggregation for each instrument which can be overridden using the Views. The
OpenTelemetry project aims to provide default aggregations that are supported by
visualizers and telemetry backends.

Unlike [request tracing](../traces/), which is intended to capture request
lifecycles and provide context to the individual pieces of a request, metrics
are intended to provide statistical information in aggregate. Some examples of
use cases for metrics include:

- Reporting the total number of bytes read by a service, per protocol type.
- Reporting the total number of bytes read and the bytes per request.
- Reporting the duration of a system call.
- Reporting request sizes in order to determine a trend.
- Reporting CPU or memory usage of a process.
- Reporting average balance values from an account.
- Reporting current active requests being handled.

## Views

A view provides SDK users with the flexibility to customize the metrics output
by the SDK. You can customize which metric instruments are to be processed or
ignored. You can also customize aggregation and what attributes you want to
report on metrics.

## Cardinality limits

The **cardinality** of a metric is the number of unique attribute combinations
reported for it. Because the SDK keeps a separate aggregation state (a data
point) in memory for each unique combination, cardinality drives the memory cost
of metrics. Unlike logs, this cost scales with the number of distinct attribute
combinations rather than with request volume, so high-cardinality attributes,
such as user IDs or raw URL paths, can cause unbounded memory growth.

To protect applications from this, the OpenTelemetry metrics SDK enforces a
**cardinality limit**: a maximum number of unique attribute combinations tracked
per metric stream, per collection cycle. The default is 2000 and can be
overridden with a [View](#views).

When the limit is reached, additional attribute combinations are not dropped
outright. Instead, their measurements are aggregated into a single **overflow
data point** identified by the attribute `otel.metric.overflow=true`. This
design has three important properties:

- **No measurements are lost.** Only the attributes are dropped; the recorded
  values are folded into the overflow data point, so the metric's overall total
  stays correct.
- **Memory is bounded.** The SDK never tracks more than the configured number of
  combinations.
- **Overflow is observable.** Every SDK uses the same
  `otel.metric.overflow=true` marker, so a single query can detect overflow
  across services, languages, and backends.

The trade-off is that any query that **filters or groups by an attribute** on an
overflowed metric undercounts, because the measurements folded into overflow no
longer carry that attribute.

This is easy to underestimate, because overflow replaces the **entire**
attribute combination, not just its high-cardinality part. Suppose a request
counter records `url.path` (high cardinality) together with `success` (a
boolean). Once the instrument overflows, a measurement for
`{url.path=/checkout, success=false}` is folded into the single overflow data
point `{otel.metric.overflow=true}`, dropping `success` along with `url.path`. A
query for `success=false` then misses that measurement, even though `success` on
its own is as low-cardinality as an attribute can be. An error-rate alert built
on `success=false` can therefore stop firing, while the metric's overall total
stays correct.

### What the limit does not apply to

The cardinality limit applies only to attributes supplied when recording
measurements through the metrics API. It does **not** apply to:

- [Resource](/docs/concepts/resources/) attributes, such as `service.name` or
  `service.instance.id`.
- Instrumentation scope attributes set when a [Meter](#meter) is created.

Values in Resource and instrumentation scope attributes are recorded on every
data point, including the overflow one, so they remain reliably queryable even
during overflow. This is not a reason to relocate measurement attributes to work
around the limit. Attributes should be placed according to what they describe: a
Resource describes the entity producing telemetry, instrumentation scope
describes the instrumenting library, and measurement attributes describe an
individual measurement. When attributes are modeled this way, context that is
constant for the lifetime of the process, such as service name, environment, or
region, naturally belongs in the Resource, where it also stays queryable under
overflow.

### Temporality and cardinality limits

The limit applies per collection cycle. For synchronous instruments,
[aggregation temporality](/docs/specs/otel/metrics/data-model/#temporality)
determines how forgiving it is:

- With **delta** temporality, the SDK resets state after each cycle, so the
  limit bounds only the combinations active within a single cycle.
- With **cumulative** temporality, the SDK retains state across cycles, so once
  the limit is reached, new combinations keep overflowing until the process
  restarts.

Asynchronous instruments follow different rules that are beyond the scope of
this overview.

## Language Support

Metrics are a [stable](/docs/specs/otel/versioning-and-stability/#stable) signal
in the OpenTelemetry specification. For the individual language specific
implementations of the Metrics API & SDK, the status is as follows:

{{% signal-support-table "metrics" %}}

## Specification

To learn more about metrics in OpenTelemetry, see the
[metrics specification](/docs/specs/otel/overview/#metric-signal).
