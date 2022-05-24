---
title: "OTel Concepts"
weight: 11
---

This page dives into OpenTelemetry concepts.

## Spans in OpenTelemetry

A [**Span**](/docs/concepts/observability-primer/#spans) represents a unit of
work or operation. Spans are the building blocks of Traces. In OpenTelemetry,
they include the following information:

- Name
- Start and End Timestamps
- [Span Context](#span-context)
- [Attributes](#attributes)
- [Span Events](#span-events)
- [Span Links](#span-links)
- [Span Status](#span-status)

Sample Span:

```json
{
  "trace_id": "7bba9f33312b3dbb8b2c2c62bb7abe2d",
  "parent_id": "",
  "span_id": "086e83747d0e381e",
  "name": "/v1/sys/health",
  "start_time": "2021-10-22 16:04:01.209458162 +0000 UTC",
  "end_time": "2021-10-22 16:04:01.209514132 +0000 UTC",
  "status_code": "STATUS_CODE_OK",
  "status_message": "",
  "attributes": {
    "net.transport": "IP.TCP",
    "net.peer.ip": "172.17.0.1",
    "net.peer.port": "51820",
    "net.host.ip": "10.177.2.152",
    "net.host.port": "26040",
    "http.method": "GET",
    "http.target": "/v1/sys/health",
    "http.server_name": "mortar-gateway",
    "http.route": "/v1/sys/health",
    "http.user_agent": "Consul Health Check",
    "http.scheme": "http",
    "http.host": "10.177.2.152:26040",
    "http.flavor": "1.1"
  },
  "events": {
    "name": "",
    "message": "OK",
    "timestamp": "2021-10-22 16:04:01.209512872 +0000 UTC"
  }
}
```

### Span Context

Span Context provides specific context about the trace and span using two
identifiers: Trace ID and Span ID. Each Span is identified by a unique ID called
a Span ID. A Span uses a Trace ID to identify the relationship between span and
its trace. A string represents the Span ID. A Span requires Span Context to
travel across service and process boundaries.

### Attributes

Attributes are key-value pairs that contain metadata that you can use to
annotate a Span to carry information about the operation it is tracking.

### Span Events

A Span Event can be thought of as a structured log message (or annotation) on a
Span, provides additional context on what is occurring during a specific
operation.

For example, a critical path in a multi-threaded application might need to
acquire a lock on a mutex to have exclusive access to a resource. An Event can
be created at two points: once when the resource is acquired, and once when it
is released.

### Span Links

Links exist so that you can associate one span with one or more spans, implying
a causal relationship. For example, let’s say we have a distributed system where
some operations are tracked by a trace.

In response to some of these operations, an additional operation is queued to be
executed, but its execution is asynchronous. We can track this subsequent
operation with a trace as well.

We would like to associate the trace for the subsequent operations with the
first trace, but we cannot predict when the subsequent operations will start. We
need to associate these two traces, so we will use a span link.

You can link the last span from the first trace to the first span in the second
trace. Now, they are causally associated with one another.

Links are optional but serve as a good way to associate trace spans with one
another.

### Span Status

A status will be attached to a span. Typically, you will set a span status when
there is a known error in the application code, such as an exception. A Span
Status will be tagged as one of the following values:

- `Unset`
- `Ok`
- `Error`

When an exception is handled, a Span status can be set to Error. Otherwise, a
Span status is in the Unset state. By setting a Span status to Unset, the
back-end that processes spans can now assign a final status.

## Tracing in OpenTelemetry

[**Traces**](/docs/concepts/observability-primer/#distributed-traces) give us
the big picture of what happens when a request is made by user or an
application. OpenTelemetry provides us with a way to implement Observability
into our code in production by tracing our microservices and related
applications.

Sample Trace:

```json
{
    "name": "Hello-Greetings",
    "context": {
        "trace_id": "0x5b8aa5a2d2c872e8321cf37308d69df2",
        "span_id": "0x5fb397be34d26b51",
    },
    "parent_id": "0x051581bf3cb55c13",
    "start_time": "2022-04-29T18:52:58.114304Z",
    "end_time": "2022-04-29T18:52:58.114435Z",
    "attributes": {
        "http.route": "some_route1"
    },
    "events": [
        {
            "name": "hey there!",
            "timestamp": "2022-04-29T18:52:58.114561Z",
            "attributes": {
                "event_attributes": 1
            }
        },
        {
            "name": "bye now!",
            "timestamp": "2022-04-29T22:52:58.114561Z",
            "attributes": {
                "event_attributes": 1
            }
        }
    ],
}
{
    "name": "Hello-Salutations",
    "context": {
        "trace_id": "0x5b8aa5a2d2c872e8321cf37308d69df2",
        "span_id": "0x93564f51e1abe1c2",
    },
    "parent_id": "0x051581bf3cb55c13",
    "start_time": "2022-04-29T18:52:58.114492Z",
    "end_time": "2022-04-29T18:52:58.114631Z",
    "attributes": {
        "http.route": "some_route2"
    },
    "events": [
        {
            "name": "hey there!",
            "timestamp": "2022-04-29T18:52:58.114561Z",
            "attributes": {
                "event_attributes": 1
            }
        }
    ],
}
{
    "name": "Hello",
    "context": {
        "trace_id": "0x5b8aa5a2d2c872e8321cf37308d69df2",
        "span_id": "0x051581bf3cb55c13",
    },
    "parent_id": null,
    "start_time": "2022-04-29T18:52:58.114201Z",
    "end_time": "2022-04-29T18:52:58.114687Z",
    "attributes": {
        "http.route": "some_route3"
    },
    "events": [
        {
            "name": "Guten tag!",
            "timestamp": "2022-04-29T18:52:58.114561Z",
            "attributes": {
                "event_attributes": 1
            }
        }
    ],
}
```

To understand how tracing in OpenTelemetry works, let's look at a list of
components that will play a part in instrumenting our code:

- Tracer
- Tracer Provider
- Trace Exporter
- Trace Context

The primary responsibility of a **Tracer** is to create spans containing more
information about what is happening during a request. The **Tracer** is also
responsible for knowing the instrumentation library and data related to that
specific library.

Finally, the **Trace Provider** is responsible for providing access to and
interaction with the **Tracer**.

**Trace Exporters** send data to the open-source or vendor backend of your
choice.

**Trace Context** is metadata about trace spans that provides correlation
between spans across service and process boundaries. For example, if Service A
calls Service B and you want to track the call in a trace. In that case, we will
use Trace Context to capture and propagate metadata about spans in Service A so
that spans created in Service B can connect to them.

Trace Context is how distributed tracing ultimately works.

### Context Propagation

Context Propagation is the core concept that enables Distributed Tracing. With
Context Propagation, Spans can be correlated with each other and assembled into
a trace, regardless of where Spans are generated. We define Context Propagation
by two sub-concepts: Context and Propagation.

A **Context** is an object that contains the information for the sending and
receiving service to correlate one span with another and associate it with the
trace overall.

**Propagation** is the mechanism that moves Context between services and
processes. By doing so, it assembles a Distributed Trace. It serializes or
deserializes Span Context and provides the relevant Trace information to be
propagated from one service to another. We now have what we call: **Trace
Context**.

There are other forms of Context in OpenTelemetry. For example, some Context is
an implementation of the W3C `TraceContext` specification on spans, and in
OpenTelemetry, this is called **`SpanContext`**.

We identify Span Context using four major components: a **`traceID`** and
**`spanID`**, **Trace Flags**, and **Trace State**.

**`traceID`** - A unique 16-byte array to identify the trace that a span is
associated with

**`spanID`** - Hex-encoded 8-byte array to identify the current span

**Trace Flags** - Provides more details about the trace, such as if it is
sampled

**Trace State** - Provides more vendor-specific information for tracing across
multiple distributed systems. Please refer to
[W3C Trace Context](https://www.w3.org/TR/trace-context/#trace-flags) for
further explanation.

By combining Context and Propagation, you now can assemble a Trace.

> For more information, see the [traces specification][]

## Metrics in OpenTelemetry

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

## Logs in OpenTelemetry

A **log** is a timestamped text record, either structured (recommended) or
unstructured, with metadata. While logs are an independent data source, they may
also be attached to spans. In OpenTelemetry, any data that is not part of a
distributed trace or a metric is a log. For example, _events_ are a specific
type of log. Logs are often used to determine the root cause of an issue and
typically contain information about who changed what as well as the result of
the change.

> For more information, see the [logs specification][].

## Baggage in OpenTelemetry

Imagine you want to have a `CustomerId` attribute on every span in your trace,
which involves multiple services; however, `CustomerId` is only available in one
specific service. To accomplish your goal, you can use OpenTelemetry Baggage to
propagate this value across your system.

In OpenTelemetry, "Baggage" refers to contextual information that’s passed
between spans. It's a key-value store that resides within a trace context,
making values available to any span created within that trace.

OpenTelemetry uses [Context Propagation](#context-propagation) to pass Baggage
around, and each of the different library implementations has propagators that
will parse and make that Baggage available without you needing to explicitly
implement it.

![OTel Baggage](/img/otel_baggage.png)

### Why does OTel Baggage exist?

OpenTelemetry is cross-platform and cross-framework. Baggage makes it such that
the context values live in the same place, have the same format, and follow the
same pattern. That means that all your applications, no matter what the
language, will be able to read them, parse them, and use them. This is important
when you’re building a large-scale distributed system, and you want to provide
autonomy to teams to work in whatever language or framework they want.

While it is completely possible to use something else for this (e.g.,
standardizing on headers and whatnot, in your organization), it puts the burden
on development teams to build helpers in every framework and language, which can
unintentionally get neglected when other higher-priority items come up.

### What OTel Baggage be used for?

OTel Baggage should be used for non-sensitive data that you're okay with
potentially exposing to third parties.

Common use cases include information that’s only accessible further up a stack.
This can include things like Account Identification, User Ids, Product Ids, and
origin IPs, for example. Passing these down your stack allows you to then add
them to your Spans in downstream services to make it easier to filter when
you’re searching in your Observability back-end.

There are no built-in integrity checks to ensure that the Baggage items are
yours, so exercise caution when working with Baggage.

![OTel Baggage](/img/otel_baggage-2.png)

### Baggage != Span attributes

One important thing to note about Baggage is that it is not a subset of the
[Span Attributes](#attributes). When you add something as Baggage, it does not
automatically end up on the Attributes of the child system’s spans. You must
explicitly take something out of Baggage and append it as Attributes.

```csharp
var accountId = Baggage.GetBaggage("AccountId");
Activity.Current?.SetTag("AccountId", accountId);
```

> For more information, see the [baggage specification][].

[baggage specification]: /docs/reference/specification/overview/#baggage-signal
[logs specification]: /docs/reference/specification/overview/#log-signal
[metrics specification]: /docs/reference/specification/overview/#metric-signal
[traces specification]: /docs/reference/specification/overview/#tracing-signal
