---
title: "Metrics"
description: >-
  A metric is a measurement about a service, captured at runtime.
weight: 2
---

A **metric** is a measurement about a service, captured at runtime. Logically,
the moment of capturing one of these measurements is known as a _metric event_
which consists not only of the measurement itself, but the time that it was
captured and associated metadata.

Application and request metrics are important indicators of availability and
performance. Custom metrics can provide insights into how availability
indicators impact user experience or the business. Collected data can be used to
alert of an outage or trigger scheduling decisions to scale up a deployment
automatically upon high demand.

OpenTelemetry defines three _metric instruments_ today:

- **counter**: a value that is summed over time -- you can think of this like an
  odometer on a car; it only ever goes up.
- **measure**: a value that is aggregated over time. This is more akin to the
  trip odometer on a car, it represents a value over some defined range.
- **observer**: captures a current set of values at a particular point in time,
  like a fuel gauge in a vehicle.

In addition to the three metric instruments, the concept of _aggregations_ is an
important one to understand. An aggregation is a technique whereby a large
number of measurements are combined into either exact or estimated statistics
about metric events that took place during a time window. The OpenTelemetry API
itself does not allow you to specify these aggregations, but provides some
default ones. In general, the OpenTelemetry SDK provides for common aggregations
(such as sum, count, last value, and histograms) that are supported by
visualizers and telemetry backends.

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

> For more information, see the [metrics specification][].

[metrics specification]: /docs/reference/specification/overview/#metric-signal