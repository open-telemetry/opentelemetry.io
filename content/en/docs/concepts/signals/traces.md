---
title: "Traces"
description: >-
  Traces give us the big picture of what happens when a request is made by user or an application.
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
            "name": "Guten Tag!",
            "timestamp": "2022-04-29T18:52:58.114561Z",
            "attributes": {
                "event_attributes": 1
            }
        }
    ],
}
```
This sample trace output has three items, named "hey there!", "Hello-Salutations" and "Hello". Because each request's context has the same trace ID, all of the infornation can be tied together. This provides a trail through the requests' various routes, timestamps and other attributes.

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
Providers. In some languages, a global Tracer is already initialized for you.

### Trace Exporters

Trace Exporters send traces to a consumer. This consumer can be standard output
for debugging and development-time, the OpenTelemetry Collector, or any
open-source or vendor backend of your choice.

### Trace Context

Trace Context is metadata about trace spans that provides correlation between
spans across service and process boundaries. For example, let's say that Service
A calls Service B and you want to track the call in a trace. In that case,
OpenTelemetry will use Trace Context to capture the ID of the trace and current
span from Service A, so that spans created in Service B can connect and add to
the trace.

This is known as Context Propagation.

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
multiple distributed systems. Please refer to [W3C Trace
Context](https://www.w3.org/TR/trace-context/#trace-flags) for further
explanation.

By combining Context and Propagation, you now can assemble a Trace.

> For more information, see the [traces specification][]

[traces specification]: /docs/reference/specification/overview/#tracing-signal

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
identifiers: Trace ID and Span ID. Each Span is identified by an ID that is
unique within a Trace called a Span ID. A Span uses a Trace ID to identify the
relationship between span and its trace. A string represents the Span ID. A Span
requires Span Context to travel across service and process boundaries.

### Attributes

Attributes are key-value pairs that contain metadata that you can use to
annotate a Span to carry information about the operation it is tracking.

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
