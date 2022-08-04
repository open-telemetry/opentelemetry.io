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
 
The sample trace given below has three items: "hey there!",
"Hello-Salutations" and "Hello". Because each operation's context has the same
trace ID, all of the information can be tied together. This provides a trail
through the operations' various routes, timestamps and other attributes.
 
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
 
The basic unit of a Trace in OpenTelemetry is a Span:
 
A [**Span**](/docs/concepts/observability-primer/#spans) represents a unit of
work or operation. Spans are the building blocks of Traces.
 
We'll dive into Spans in [greater
detail](/docs/concepts/observability-primer/#spans), but let's first look at the
list of OpenTelemetry components that play a part in instrumenting our code:
 
- Tracer
- Tracer Provider
- Trace Exporter
- Trace Context
 
### Tracer
 
A **tracer** creates spans, where each span has information about what's happening
for a given operation; for example a request in a service. Tracers are created
by a **tracer provider**. In some languages, a global tracer is already
initialized for you.
 
### Tracer Provider
 
A **Tracer Provider** (sometimes called `TracerProvider`) is a factory to create
Tracers. In most applications, a Tracer Provider is initialized once, and the
Trace Provider's lifecycle matches the application's lifecycle.
 
Initializing a Tracer Provider is typically the first step in tracing with
OpenTelemetry. The Tracer Provider's initialization also includes Resource and
Exporter initialization. In some language SDKs, a global Tracer Provider is
already initialized for you.
 
### Trace Exporters
 
A **trace exporter** sends traces to a consumer. The consumer can be standard output
for debugging and development-time, the OpenTelemetry Collector, or
any open-source or vendor backend of your choice.
 
### Trace Context
 
A **trace context** is data about trace spans. It provides correlation between
spans, across service and process boundaries. For example, let's say that
ServiceA calls ServiceB, and you want to track that call in a trace. In this case,
OpenTelemetry will use Trace Context to capture the trace ID and current
span from ServiceA, so that Spans created in ServiceB can connect and add to
the trace.
 
This is known as **context propagation**.
 
### Context Propagation
 
**Context propagation** is the core concept that enables distributed tracing. With
Context Propagation, Spans can be correlated with each other and assembled into
a Trace, regardless of where Spans are generated. We define Context Propagation
by two sub-concepts: *Context* and *Propagation*.
 
A **Context** is an object that contains the information for the sending and
receiving service to correlate one Span with another and associate it with the
Trace overall.
 
**Propagation** is the mechanism that moves Context between services and
processes. By doing so, it assembles a *Distributed Trace*. It serializes or
deserializes Span Context and provides the relevant Trace information to be
propagated from one service to another. We now have what we call: **Trace
Context**.
 
There are other forms of Context in OpenTelemetry. For example, some Context is
an implementation of the W3C `TraceContext` specification on spans, and in
OpenTelemetry, this is called **`SpanContext`**.
 
We identify Span Context using four major components:
- **`traceID`** A unique 16-byte array to identify the Trace that a Span is
associated with
- **`spanID`** Hex-encoded 8-byte array to identify the current Span
- **Trace Flags** Provides more details about the trace, such as if it is
sampled
- **Trace State** Provides more vendor-specific information for tracing across
multiple distributed systems. Please refer to [W3C Trace
Context](https://www.w3.org/TR/trace-context/#trace-flags) for further
explanation.
 
By combining **Context** and **Propagation**, you can now assemble a **Trace**.
 
> For more information, see the [traces specification][]
 
[traces specification]: /docs/reference/specification/overview/#tracing-signal
 
## Spans in OpenTelemetry
 
As mentioned earlier, Spans represents a unit of work or operation, and are the
building blocks of Traces. In OpenTelemetry they include the following
information:
 
- Name
- Start and End Timestamps
- [Span Context](#span-context)
- [Attributes](#attributes)
- [Span Events](#span-events)
- [Span Links](#span-links)
- [Span Status](#span-status)
 
**Sample Span** In this example the Span includes the Trace ID (so that it can be
correlated with other Spans and information associated with that Trace),
metadata about the request, and the event itself.
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
 
**Span Context** provides specific context about the Trace and Span using two
identifiers: Trace ID (`traceID`) and Span ID (`spanID`). A Span ID is
represented by a string, and is unique within a Trace. A Span uses the Trace ID
to identify the relationship between the Span and its Trace. A Span requires
**Span Context** to travel across service and process boundaries.
 
### Attributes
 
**Attributes** are key-value pairs that contain metadata. By annotating a Span
with the appropriate metadata, the Span carries information about the operation
its tracking.
 
### Span Events
 
A **Span Event** can be thought of as a structured log message (or annotation) on a
Span, typically used to denote a meaningful, singular point in time during the
Span's duration.
 
For example, consider two scenarios in a web browser:
 
1. Tracking a page load
2. Noting when a page becomes interactive
 
A Span is best for the first scenario because it's a finite operation, with a start
and an end.
 
A Span Event is best used to track the second scenario because it represents a
meaningful, singular point in time.
 
### Span Links
 
**Span Links** exist so that you can associate a Span with one or more other
Spans, implying a causal relationship. For example, let’s say we have a
distributed system where some operations are tracked by a Trace (with ID *t1*).
 
In response to some of these operations, an additional operation (addOp) is
queued to be executed, but its execution is asynchronous. We can track addOp
with a Trace as well (*t2*).
 
We'd like to associate the Trace for addOp *t1* with the first Trace (*t2*), but
we can't predict when addOp will start: we'll use a Span Link to associate the
two Traces.
 
You can link the last Span from the first Trace to the first Span in the second
Trace.
 
Now, they are causally associated with one another.
 
Links are optional but serve as a good way to associate trace spans with one
another.
 
### Span Status
 
A Status will be attached to a Span. Typically, you will set a Span Status when
there is a known error in the application code, such as an exception. A Span
Status will be tagged as one of the following values:
 
- `Unset`
- `Ok`
- `Error`
 
When an exception is handled, a Span Status can be set to Error. Otherwise, a
Span Status is in the Unset state. By setting a Span Status to Unset, the
back-end that processes Spans can now assign a final Status.
