---
title: Glossary
description: >-
  Terminology you may or may not be familiar with used by the OpenTelemetry
  project.
weight: 100
---

The OpenTelemetry project uses terminology you may or may not be familiar with.
In addition, the project may define the terminology in a different way than
others. This page captures terminology used in the project and what it means.

## Generic Terminology

### **Aggregation**

The process of combining multiple measurements into exact or estimated
statistics about the measurements that took place during an interval of time,
during program execution. Used by the [`Metric`](#metric)
[`Data Source`](#data-source).

### **API**

Application Programming Interface. In the OpenTelemetry project, used to define
how telemetry data is generated per [`Data Source`](#data-source).

### **Application**

One or more [`Services`](#service) designed for end users or other applications.

### **APM**

Application Performance Monitoring is about monitoring software applications,
their performance (speed, reliability, availability, etc.) to detect issues,
alerting and tooling for finding the root cause.

### **Attribute**

A key-value pair. Used across telemetry signals - e.g. in [`Traces`](#trace) to
attach data to a [`Span`](#span), or in [`Metrics`](#metric). See [attribute
spec][attribute].

### **Automatic Instrumentation**

Refers to telemetry collection methods that do not require the end-user to
modify application's source code. Methods vary by programming language, and
examples include bytecode injection or monkey patching.

### **Baggage**

A mechanism for propagating name/value pairs to help establish a causal
relationship between events and services. See [baggage spec][baggage].

### **Builder**

See [Collector Builder](#collector-builder).

### **Client Library**

See [`Instrumented Library`](#instrumented-library).

### **Client-side App**

A component of an [`Application`](#application) that is not running inside a
private infrastructure and is typically used directly by end-users. Examples of
client-side apps are browser apps, mobile apps, and apps running on IoT devices.

### **Collector**

A vendor-agnostic implementation on how to receive, process, and export
telemetry data. A single binary that can be deployed as an agent or gateway.

Also known as the OpenTelemetry Collector. More on the Collector
[here][collector].

### **Collector Builder**

A command-line tool that generates sources and binaries for OpenTelemetry
Collector [distributions](/docs/collector/distributions/). For more information,
see [OpenTelemetry Collector Builder (ocb)](/docs/collector/builder).

### **Contrib**

Several [`Instrumentation Libraries`](#instrumentation-library) and the
[`Collector`](#collector) offer a set of core capabilities as well as a
dedicated contrib repository for non-core capabilities including vendor
`Exporters`.

### **Context Propagation**

Allows all [`Data Sources`](#data-source) to share an underlying context
mechanism for storing state and accessing data across the lifespan of a
[`Transaction`](#transaction). See [context propagation
spec][context propagation].

### **DAG**

[Directed Acyclic Graph][dag].

### **Data Source**

See [`Signal`](#signal)

### **Dimension**

See [`Label`](#label).

### **Distributed Tracing**

Tracks the progression of a single [`Request`](#request), called a
[`Trace`](#trace), as it is handled by [`Services`](#service) that make up an
[`Application`](#application). A [`Distributed Trace`](#distributed-tracing)
transverses process, network and security boundaries.

More on Distributed Tracing [here][distributed tracing].

### **Event**

Something that happened where representation depends on the
[`Data Source`](#data-source). For example, [`Spans`](#span).

### **Exporter**

Provides functionality to emit telemetry to consumers. Used by
[`Instrumentation Libraries`][spec-exporter-lib] and the
[`Collector`](/docs/collector/configuration#basics). Exporters can be push- or
pull-based.

### **Field**

Name/value pairs added to [`Log Records`](#log-record) (similar to
[`Attributes`](#attribute) for [`Spans`](#span) and [`Labels`](#label) for
[`Metrics`](#metric)). See [field spec][field].

### **gRPC**

A high-performance, open source universal [`RPC`](#rpc) framework. More on gRPC
[here](https://grpc.io).

### **HTTP**

Short for [Hypertext Transfer Protocol][http].

### **Instrumented Library**

Denotes the [`Library`](#library) for which the telemetry signals
([`Traces`](#trace), [`Metrics`](#metric), [`Logs`](#log)) are gathered. See
[more][spec-instrumented-lib].

### **Instrumentation Library**

Denotes the [`Library`](#library) that provides the instrumentation for a given
[`Instrumented Library`](#instrumented-library).
[`Instrumented Library`](#instrumented-library) and
[`Instrumentation Library`](#instrumentation-library) may be the same
[`Library`](#library) if it has built-in OpenTelemetry instrumentation. See
[more][spec-instrumentation-lib].

### **JSON**

Short for [JavaScript Object Notation][json].

### **Label**

See [Attribute](#attribute).

### **Language**

Programming Language.

### **Library**

A language-specific collection of behavior invoked by an interface.

### **Log**

Sometimes used to refer to a collection of [`Log Records`](#log-record). May be
ambiguous, since people also sometimes use [`Log`](#log) to refer to a single
[`Log Record`](#log-record), thus this term should be used carefully and in the
context where ambiguity is possible additional qualifiers should be used (e.g.
`Log Record`). See [more][log].

### **Log Record**

A recording of an [`Event`](#event). Typically the record includes a timestamp
indicating when the [`Event`](#event) happened as well as other data that
describes what happened, where it happened, etc. See [more][log record].

### **Metadata**

A name/value pair added to telemetry data. OpenTelemetry calls this
[`Attributes`](#attribute) on [`Spans`](#span), [`Labels`](#label) on
[`Metrics`](#metric) and [`Fields`](#field) on [`Logs`](#log).

### **Metric**

Records a data point, either raw measurements or predefined aggregation, as time
series with [`Metadata`](#metadata). See [more][metric].

### **OC**

Short form for [`OpenCensus`](#opencensus).

### **`ocb`**

See [Collector Builder](#collector-builder).

### **OpenCensus**

A set of libraries for various languages that allow you to collect application
metrics and distributed traces, then transfer the data to a backend of your
choice in real time.
[Precursor to OpenTelemetry](/docs/concepts/what-is-opentelemetry/#so-what). See
[more][opencensus].

### **OpenTracing**

Vendor-neutral APIs and instrumentation for distributed tracing.
[Precursor to OpenTelemetry](/docs/concepts/what-is-opentelemetry/#so-what). See
[more][opentracing].

### **OT**

Short form for [`OpenTracing`](#opentracing).

### **OTel**

Short form for [OpenTelemetry](/docs/concepts/what-is-opentelemetry).

### **OTelCol**

Short form for [OpenTelemetry Collector](#collector).

### **OTLP**

Short for
[OpenTelemetry Protocol](/docs/reference/specification/protocol/otlp/).

### **Processor**

Operation performed on data between being received and being exported. For
example, batching. Used by
['Instrumentation Libraries'](#instrumentation-library) and the
[Collector](/docs/collector/configuration/#processors).

### **Propagators**

Used to serialize and deserialize specific parts of telemetry data such as span
context and [`Baggage`](#baggage) in [`Spans`](#span). See [more][propagators].

### **Proto**

Language independent interface types. See [more][proto].

### **Receiver**

Term used by the [`Collector`](/docs/collector/configuration/#receivers) to
define how telemetry data is received. Receivers can be push- or pull-based. See
[more][receiver].

### **Request**

See [`Distributed Tracing`](#distributed-tracing).

### **Resource**

Captures information about the entity for which telemetry is recorded. For
example, a process producing telemetry that is running in a container on
Kubernetes has a pod name, it is in a namespace and possibly is part of a
deployment which also has a name. All three of these attributes can be included
in the `Resource` and applied to any data source.

### **REST**

Short for [Representational State Transfer][rest].

### **RPC**

Short for [Remote Procedure Call][rpc].

### **Sampling**

A mechanism to control the amount of data exported. Most commonly used with the
[`Tracing`](#trace) [`Data Source`](#data-source). See [more][sampling].

### **SDK**

Short for Software Development Kit. Refers to a telemetry SDK that denotes a
[`Library`](#library) that implement the OpenTelemetry [`API`](#api).

### **Semantic Conventions**

Defines standard names and values of [`Metadata`](#metadata) in order to provide
vendor-agnostic telemetry data.

### **Service**

A component of an [`Application`](#application). Multiple instances of a
[`Service`](#service) are typically deployed for high availability and
scalability. A [`Service`](#service) may be deployed in multiple locations.

### **Signal**

One of [`Traces`](#trace), [`Metrics`](#metric) or [`Logs`](#log). More on
Signals [here][signals].

### **Span**

Represents a single operation within a [`Trace`](#trace). See [more][span].

### **Span Link**

A span link is a link between causally-related spans. For details see
[Links between spans](/docs/reference/specification/overview#links-between-spans)
and
[Specifying Links](/docs/reference/specification/trace/api#specifying-links).

### **Specification**

Describes the cross-language requirements and expectations for all
implementations. See [more][specification].

### **Status**

The result of the operation. Typically used to indicate whether an error
occurred. See [more][status].

### **Tag**

See [`Metadata`](#metadata).

### **Trace**

A [`DAG`](#dag) of [`Spans`](#span), where the edges between [`Spans`](#span)
are defined as parent/child relationship. See [more][trace].

### **Tracer**

Responsible for creating [`Spans`](#span). See [more][tracer].

### **Transaction**

See [`Distributed Tracing`](#distributed-tracing).

### **zPages**

An in-process alternative to external exporters. When included, they collect and
aggregate tracing and metrics information in the background; this data is served
on web pages when requested. See [more][zpages].

## Additional Terminology

### Traces

#### **[Trace API Terminology](/docs/reference/specification/trace/api)**

#### **[Trace SDK Terminology](/docs/reference/specification/trace/sdk)**

### Metrics

#### **[Metric API Terminology](/docs/reference/specification/metrics/api#overview)**

#### **[Metric SDK Terminology](/docs/reference/specification/metrics#specifications)**

### Logs

#### **[Trace Context Fields](/docs/reference/specification/logs/data-model#trace-context-fields)**

#### **[Severity Fields](/docs/reference/specification/logs/data-model#severity-fields)**

#### **[Log Record Fields](/docs/reference/specification/logs/data-model#log-and-event-record-definition)**

### Semantic Conventions

#### **[Resource Conventions](/docs/reference/specification/resource/semantic_conventions)**

#### **[Span Conventions](/docs/reference/specification/trace/semantic_conventions)**

#### **[Metric Conventions](/docs/reference/specification/metrics/semantic_conventions)**

[baggage]: /docs/reference/specification/baggage/api/
[attribute]: /docs/reference/specification/common/#attributes
[collector]: /docs/collector
[context propagation]:
  /docs/reference/specification/overview#context-propagation
[dag]: https://en.wikipedia.org/wiki/Directed_acyclic_graph
[distributed tracing]: /docs/concepts/signals/traces/
[field]: /docs/reference/specification/logs/data-model#field-kinds
[http]: https://en.wikipedia.org/wiki/Hypertext_Transfer_Protocol
[json]: https://en.wikipedia.org/wiki/JSON
[log]: /docs/reference/specification/glossary#log
[log record]: /docs/reference/specification/glossary#log-record
[metric]: /docs/concepts/signals/metrics/
[opencensus]: https://opencensus.io
[opentracing]: https://opentracing.io
[propagators]: /docs/instrumentation/go/manual/#propagators-and-context
[proto]: https://github.com/open-telemetry/opentelemetry-proto
[receiver]: /docs/collector/configuration/#receivers
[rest]: https://en.wikipedia.org/wiki/Representational_state_transfer
[rpc]: https://en.wikipedia.org/wiki/Remote_procedure_call
[sampling]: /docs/reference/specification/trace/sdk#sampling
[signals]: /docs/concepts/signals/
[span]: /docs/reference/specification/trace/api#span
[spans]: /docs/reference/specification/trace/api#add-events
[spec-exporter-lib]: /docs/reference/specification/glossary/#exporter-library
[spec-instrumentation-lib]:
  /docs/reference/specification/glossary/#instrumentation-library
[spec-instrumented-lib]:
  /docs/reference/specification/glossary/#instrumented-library
[specification]: /docs/concepts/components/#specification
[status]: /docs/reference/specification/trace/api#set-status
[trace]: /docs/reference/specification/overview#traces
[tracer]: /docs/reference/specification/trace/api#tracer
[zpages]:
  https://github.com/open-telemetry/opentelemetry-specification/blob/main/experimental/trace/zpages.md
