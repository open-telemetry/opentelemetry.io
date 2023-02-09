---
title: Traces
description: >-
  Traces give us the big picture of what happens when a request is made by a user
  or an application.
weight: 1
---

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
    "end_time": "2022-04-29T22:52:58.114561Z",
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
            "timestamp": "2022-04-29T18:52:58.114585Z",
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
            "name": "Guten Tag!",
            "timestamp": "2022-04-29T18:52:58.114561Z",
            "attributes": {
                "event_attributes": 1
            }
        }
    ],
}
```

This sample trace output has three items, named "Hello-Greetings",
"Hello-Salutations" and "Hello". Because each request's context has the same
trace ID, all of the information can be tied together. This provides a trail
through the requests' various routes, timestamps and other attributes.

To understand how tracing in OpenTelemetry works, let's look at a list of
components that will play a part in instrumenting our code:

- Tracer
- Tracer Provider
- Trace Exporter
- Trace Context

### Tracer Provider

A Tracer Provider (sometimes called `TracerProvider`) is a factory for
`Tracer`s. In most applications, a Tracer Provider is initialized once and its
lifecycle matches the application's lifecycle. Tracer Provider initialization
also includes Resource and Exporter initialization. It is typically the first
step in tracing with OpenTelemetry. In some language SDKs, a global Tracer
Provider is already initialized for you.

### Tracer

A Tracer creates spans containing more information about what is happening for a
given operation, such as a request in a service. Tracers are created from Tracer
Providers.

### Trace Exporters

Trace Exporters send traces to a consumer. This consumer can be standard output
for debugging and development-time, the OpenTelemetry Collector, or any open
source or vendor backend of your choice.

### Context Propagation

Context Propagation is the core concept that enables Distributed Tracing. With
Context Propagation, Spans can be correlated with each other and assembled into
a trace, regardless of where Spans are generated. We define Context Propagation
by two sub-concepts: Context and Propagation.

A **Context** is an object that contains the information for the sending and
receiving service to correlate one span with another and associate it with the
trace overall. For example, if Service A calls Service B, then a span from
Service A whose ID is in context will be used as the parent span for the next
span created in Service B.

**Propagation** is the mechanism that moves Context between services and
processes. By doing so, it assembles a Distributed Trace. It serializes or
deserializes Span Context and provides the relevant Trace information to be
propagated from one service to another. We now have what we call: **Trace
Context**.

Context is an abstract concept - it requires a concrete implementation to
actually be useful. OpenTelemetry supports several different Context formats.
The default format used in OpenTelemetry tracing is W3C `TraceContext`. Each
Context object is associated with a span and can be accessed specification on
spans. See [Span Context](#span-context).

By combining Context and Propagation, you now can assemble a Trace.

> For more information, see the [traces specification][]

[traces specification]: /docs/reference/specification/overview/#tracing-signal

## Spans in OpenTelemetry

A [**Span**](/docs/concepts/observability-primer/#spans) represents a unit of
work or operation. Spans are the building blocks of Traces. In OpenTelemetry,
they include the following information:

- Name
- Parent span ID (empty for root spans)
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
  "events": [
    {
      "name": "",
      "message": "OK",
      "timestamp": "2021-10-22 16:04:01.209512872 +0000 UTC"
    }
  ]
}
```

Spans can be nested, as is implied by the presence of a parent span ID: child
spans represent sub-operations. This allows spans to more accurately capture the
work done in an application.

### Span Context

Span Context is an immutable object on every span that contains the following:

* The Trace ID representing the trace that the span is a part of
* The Span's Span ID
* Trace Flags, a binary encoding containing information about the trace
* Trace State, a list of key-value pairs that can carry vendor-specific trace
  information

Span Context is the part of a span that is serialized and propagated alongside
[Distributed Context](#context-propagation) and
[Baggage](/docs/concepts/signals/baggage).

Because Span Context contains the Trace ID, it is used when creating [Span
Links](#span-links).

### Attributes

Attributes are key-value pairs that contain metadata that you can use to
annotate a Span to carry information about the operation it is tracking.

For example, if a span tracks an operation that adds an item to a user's
shopping cart in an eCommerce system, you can capture the user's ID, the ID of
the item to add to the cart, and the cart ID.

Attributes have the following rules that each language SDK implements:

* Keys must be non-null string values
* Values must be a non-null string, boolean, floating point value, integer, or
  an array of these values

Additionally, there are [Semantic
Attributes](/docs/reference/specification/trace/semantic_conventions/), which
are known naming conventions for metadata that is typically present in common
operations. It's helpful to use semantic attribute naming wherever possible so
that common kinds of metadata are standardized across systems.

### Span Events

A Span Event can be thought of as a structured log message (or annotation) on a
Span, typically used to denote a meaningful, singular point in time during the
Span's duration.

For example, consider two scenarios in a web browser:

1. Tracking a page load
2. Denoting when a page becomes interactive

A Span is best used to the first scenario because it's an operation with a start
and an end.

A Span Event is best used to track the second scenario because it represents a
meaningful, singular point in time.

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

### Span Kind

When a span is created, it is one of `Client`, `Server`, `Internal`, `Producer`,
or `Consumer`. This span kind provides a hint to the tracing backend as to how
the trace should be assembled. According to the OpenTelemetry specification, the
parent of a server span is often a remote client span, and the child of a client
span is usually a server span. Similarly, the parent of a consumer span is
always a producer and the child of a producer span is always a consumer. If not
provided, the span kind is assumed to be internal.

For more information regarding SpanKind, see [SpanKind]({{< relref
"/docs/reference/specification/trace/api#spankind" >}}).

#### Client

A client span represents a synchronous outgoing remote call such as an outgoing
HTTP request or database call. Note that in this context, "synchronous" does not
refer to `async/await`, but to the fact that it is not queued for later
processing.

#### Server

A server span represents a synchronous incoming remote call such as an incoming
HTTP request or remote procedure call.

#### Internal

Internal spans represent operations which do not cross a process boundary.
Things like instrumenting a function call or an express middleware may use
internal spans.

#### Producer

Producer spans represent the creation of a job which may be asynchronously
processed later. It may be a remote job such as one inserted into a job queue or
a local job handled by an event listener.

#### Consumer

Consumer spans represent the processing of a job created by a producer and may
start long after the producer span has already ended.
