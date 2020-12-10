---
title: "Data Sources"
weight: 30
---

OpenTelemetry supports multiple data sources as defined below. More data
sources may be added in the future.

## Traces

Traces track the progression of a single request, called a `trace`, as it is
handled by services that make up an application. The request may be initiated
by a user or an application. Distributed tracing is a form of tracing that
traverses process, network and security boundaries. Each unit of work in a
`trace` is called a `span`; a `trace` is a tree of `spans`. Spans are objects
that represent the work being done by individual services or components
involved in a request as it flows through a system. A `span` contains a _span
context_, which is a set of globally unique identifiers that represent the
unique request that each `span` is a part of. A `span` provides Request, Error
and Duration (RED) metrics that can be extracted used to debug availability as
well as performance issues.

A `trace` contains a single _root span_ which encapsulates the end-to-end latency
for the entire request. You can think of this as a single logical operation,
such as clicking a button in a web application to add a product to a shopping
cart. The _root span_ would measure the time it took from an end-user clicking
that button to the operation being completed or failing (so, the item is added
to the cart or some error occurs) and the result being displayed to the user. A
`trace` is comprised of the single _root span_ and any number of _child spans_,
which represent operations taking place as part of the request. Each `span`
contains metadata about the operation, such as its name, start and end
timestamps, attributes, events, and status.

To create and manage spans in OpenTelemetry, the OpenTelemetry API provides the `tracer`
interface. This object is responsible for tracking the active `span` in your
process, and allows you to access the current `span` in order to perform
operations on it such as adding attributes, events, and finishing it when the
work it tracks is complete. One or more `tracer` objects can be created in a
process through the _tracer provider_, a factory interface that allows for
multiple tracers to be instantiated in a single process with different options.

Generally, the lifecycle of a span resembles the following:

- A request is received by a service. The span context is _extracted_ from the
  request headers, if it exists.
- A new span is created as a child of the extracted span context; if none
  exists, a new root span is created.
- The service handles the request. Additional attributes and events are added
  to the span that are useful for understanding the context of the request,
  such as the hostname of the machine handling the request, or customer
  identifiers.
- New spans may be created to represent work being done by sub-components of
  the service.
- When the service makes a remote call to another service, the current span
  context is serialized and forwarded to the next service by _injecting_ the
  span context into the headers or message envelope.
- The work being done by the service completes, successfully or not. The span
  status is appropriately set, and the span is marked finished.

For more information, see the [distributed tracing
specification](https://github.com/open-telemetry/opentelemetry-specification/blob/master/specification/overview.md#distributed-tracing),
which covers concepts including: trace, span, parent/child relationship, span
context, attributes, events and links.

## Metrics

A `metric` is a measurement about a service, captured at runtime. Logically,
the moment of capturing one of these measurements is known as a _metric event_
which consists not only of the measurement itself, but the time that it was
captured and associated metadata.

Application and request metrics are important indicators of availability and
performance. Custom metrics can provide insights into how availability
indicators impact user experience or the business. Collected data can be used
to alert of an outage or trigger scheduling decisions to scale up a deployment
automatically upon high demand.

OpenTelemetry defines three _metric instruments_ today:

- `counter`: a value that is summed over time -- you can think of
this like an odometer on a car; it only ever goes up.
- `measure`: a value that is aggregated over time. This is more akin to the
  trip odometer on a car, it represents a value over some defined range.
- `observer`: captures a current set of values at a particular point in time,
  like a fuel gauge in a vehicle.

In addition to the three metric instruments, the concept of _aggregations_ is
an important one to understand. An aggregation is a technique whereby a large
number of measurements are combined into either exact or estimated statistics
about metric events that took place during a time window. The OpenTelemetry API
itself does not allow you to specify these aggregations, but provides some
default ones. Please see the
[specification](https://github.com/open-telemetry/opentelemetry-specification/blob/master/specification/metrics/api.md#aggregations)
for more details. In general, the OpenTelemetry SDK provides for common
aggregations (such as sum, count, last value, and histograms) that are
supported by visualizers and telemetry backends.

Unlike request tracing, which is intended to capture request lifecycles and
provide context to the individual pieces of a request, metrics are intended to
provide statistical information in aggregate. Some examples of use cases for
metrics include:

- Reporting the total number of bytes read by a service, per protocol type.
- Reporting the total number of bytes read and the bytes per request.
- Reporting the duration of a system call.
- Reporting request sizes in order to determine a trend.
- Reporting CPU or memory usage of a process.
- Reporting average balance values from an account.
- Reporting current active requests being handled.

For more information, see the [metrics
specification](https://github.com/open-telemetry/opentelemetry-specification/blob/master/specification/overview.md#metrics),
which covers topics including: measure, measurement, metric, data, data point
and labels.

## Logs

A `log` is a timestamped text record, either structured (recommended) or unstructured,
with metadata. While logs are an independent data source, they may also be
attached to spans. In OpenTelemetry, any data that is not part of a distributed trace or a metric
is a log. For example, _events_ are a specific type of log. Logs are often used
to determine the root cause of an issue and typically contain information about
who changed what as well as the result of the change.

For more information, see the [logs
specification](https://github.com/open-telemetry/opentelemetry-specification/blob/master/specification/overview.md#logs),
which covers topics including: log, defined fields, trace context fields and
severity fields.
