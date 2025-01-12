---
title: Glossary
description:
  Definitions and conventions for telemetry terms as used in OpenTelemetry.
weight: 200
---

This glossary defines terms and [concepts](/docs/concepts/) that are new to the
OpenTelemetry project, and clarifies OpenTelemetry-specific uses of terms common
in the observability field.

We also comment on spelling and capitalization when helpful. For example, see
[OpenTelemetry](#opentelemetry) and [OTel](#otel).

## Terms

### Aggregation

The process of combining multiple measurements into exact or estimated
statistics about the measurements that took place during an interval of time,
during program execution. Used by the [Metric](#metric)
[Data source](#data-source).

### API

Application Programming Interface. In the OpenTelemetry project, used to define
how telemetry data is generated per [Data source](#data-source).

### Application

One or more [Services](#service) designed for end users or other applications.

### APM

Application Performance Monitoring is about monitoring software applications,
their performance (speed, reliability, availability, and so on) to detect
issues, alerting and tooling for finding the root cause.

### Attribute

OpenTelemetry term for [Metadata](#metadata). Adds key-value information to the
entity producing telemetry. Used across [Signals](#signal) and
[Resources](#resource). See [attribute spec][attribute].

### Automatic instrumentation

Refers to telemetry collection methods that do not require the end-user to
modify application's source code. Methods vary by programming language, and
examples include bytecode injection or monkey patching.

### Baggage

A mechanism for propagating [Metadata](#metadata) to help establish a causal
relationship between events and services. See [baggage spec][baggage].

### Client library

See [Instrumented library](#instrumented-library).

### Client-side app

A component of an [Application](#application) that is not running inside a
private infrastructure and is typically used directly by end-users. Examples of
client-side apps are browser apps, mobile apps, and apps running on IoT devices.

### Collector

The [OpenTelemetry Collector], or Collector for short, is a vendor-agnostic
implementation on how to receive, process, and export telemetry data. A single
binary that can be deployed as an agent or gateway.

> **Spelling**: When referring to the [OpenTelemetry Collector], always
> capitalize Collector. Use just "Collector" if you are using Collector as an
> adjective &mdash; for example, "Collector configuration".

[OpenTelemetry Collector]: /docs/collector/

### Contrib

Several [Instrumentation Libraries](#instrumentation-library) and the
[Collector](#collector) offer a set of core capabilities as well as a dedicated
contrib repository for non-core capabilities including vendor `Exporters`.

### Context propagation

Allows all [Data sources](#data-source) to share an underlying context mechanism
for storing state and accessing data across the lifespan of a
[Transaction](#transaction). See [context propagation
spec][context propagation].

### DAG

[Directed Acyclic Graph][dag].

### Data source

See [Signal](#signal)

### Dimension

A term used specifically by [Metrics](#metric). See [Attribute](#attribute).

### Distributed tracing

Tracks the progression of a single [Request](#request), called a
[Trace](#trace), as it is handled by [Services](#service) that make up an
[Application](#application). A [Distributed trace](#distributed-tracing)
transverses process, network and security boundaries.

See [Distributed tracing][distributed tracing].

### Distribution

A distribution is a wrapper around an upstream OpenTelemetry repository with
some customizations. See [more][distribution].

### Event

An Event is a [Log Record](#log-record) with an event name and a well-known
structure. For example, browser events in OpenTelemetry follow a particular
naming convention and carry particular data in a common structure.

### Exporter

Provides functionality to emit telemetry to consumers. Exporters can be push- or
pull-based.

### Field

A term used specifically by [Log Records](#log-record). [Metadata](#metadata)
can be added through defined fields, including [Attributes](#attribute) and
[Resource](#resource). Other fields may also be considered `Metadata`, including
severity and trace information. See the [field spec][field].

### gRPC

A high-performance, open source universal [RPC](#rpc) framework. See
[gRPC](https://grpc.io).

### HTTP

Short for [Hypertext Transfer Protocol][http].

### Instrumented library

Denotes the [Library](#library) for which the telemetry signals
([Traces](#trace), [Metrics](#metric), [Logs](#log)) are gathered. See
[more][spec-instrumented-lib].

### Instrumentation library

Denotes the [Library](#library) that provides the instrumentation for a given
[Instrumented library](#instrumented-library).
[Instrumented library](#instrumented-library) and
[Instrumentation library](#instrumentation-library) can be the same
[Library](#library) if it has built-in OpenTelemetry instrumentation. See [the
lib specification][spec-instrumentation-lib].

### JSON

Short for [JavaScript Object Notation][json].

### Label

A term used specifically by [Metrics](#metric). See [Metadata](#metadata).

### Language

Programming Language.

### Library

A language-specific collection of behavior invoked by an interface.

### Log

Sometimes used to refer to a collection of [Log records](#log-record). Can be
ambiguous since people also sometimes use [Log](#log) to refer to a single
[Log record](#log-record). Where ambiguity is possible, use additional
qualifiers, for example, `Log record`. See [more][log]

### Log record

A recording of data with a timestamp and a severity. May also have a
[Trace ID](#trace) and [Span ID](#span) when correlated with a trace. See
[more][log record].

### Metadata

A key-value pair, for example `foo="bar"`, added to an entity producing
telemetry. OpenTelemetry calls these pairs [Attributes](#attribute). In
addition, [Metrics](#metric) have [Dimensions](#dimension) an [Labels](#label),
while [Logs](#log) have [Fields](#field).

### Metric

Records a data point, either raw measurements or predefined aggregation, as time
series with [Metadata](#metadata). See [more][metric].

### OC

Short form for [OpenCensus](#opencensus).

### OpAMP

Abbreviation for the
[Open Agent Management Protocol](/docs/collector/management/#opamp).

> **Spelling**: Write OpAMP, not `OPAMP` nor `opamp` in descriptions or
> instructions.

### OpenCensus

Precursor to OpenTelemetry. For details, see
[History](/docs/what-is-opentelemetry/#history).

### OpenTelemetry

Formed through a [merger] of the [OpenTracing](#opentracing) and
[OpenCensus](#opencensus) projects, OpenTelemetry &mdash; the subject of this
website &mdash; is a collection of [APIs](#api), [SDKs](#sdk), and tools that
you can use to [instrument](/docs/concepts/instrumentation/), generate,
[collect](/docs/concepts/components/#collector), and
[export](/docs/concepts/components/#exporters)
[telemetry data](/docs/concepts/signals/) such as [metrics](#metric),
[logs](#log), and [traces](#trace).

> **Spelling**: OpenTelemetry should always be a single unhyphenated word and
> capitalized as shown.

[merger]: /docs/what-is-opentelemetry/#history

### OpenTracing

Precursor to OpenTelemetry. For details, see
[History](/docs/what-is-opentelemetry/#history).

### OT

Short form for [OpenTracing](#opentracing).

### OTel

Short form for [OpenTelemetry](/docs/what-is-opentelemetry/).

> **Spelling**: Write OTel, not `OTEL`.

### OTelCol

Short form for [OpenTelemetry Collector](#collector).

### OTEP

An acronym for [OpenTelemetry Enhancement Proposal].

> **Spelling**: Write "OTEPs" as plural form. Don't write `OTep` or `otep` in
> descriptions.

[OpenTelemetry Enhancement Proposal]:
  https://github.com/open-telemetry/opentelemetry-specification/blob/main/oteps/README.md

### OTLP

Short for [OpenTelemetry Protocol](/docs/specs/otlp/).

### Propagators

Used to serialize and deserialize specific parts of telemetry data such as span
context and [Baggage](#baggage) in [Spans](#span). See [more][propagators].

### Proto

Language independent interface types. See [more][proto].

### Receiver

The term used by the [Collector](/docs/collector/configuration/#receivers) to
define how telemetry data is received. Receivers can be push- or pull-based. See
[more][receiver].

### Request

See [Distributed Tracing](#distributed-tracing).

### Resource

Captures information about the entity producing telemetry as
[Attributes](#attribute). For example, a process producing telemetry that is
running in a container on Kubernetes has a process name, a pod name, a
namespace, and possibly a deployment name. All these attributes can be included
in the `Resource`.

### REST

Short for [Representational State Transfer][rest].

### RPC

Short for [Remote Procedure Call][rpc].

### Sampling

A mechanism to control the amount of data exported. Most commonly used with the
[Tracing](#trace) [Data Source](#data-source). See [more][sampling].

### SDK

Short for Software Development Kit. Refers to a telemetry SDK that denotes a
[Library](#library) that implement the OpenTelemetry [API](#api).

### Semantic conventions

Defines standard names and values of [Metadata](#metadata) in order to provide
vendor-agnostic telemetry data.

### Service

A component of an [Application](#application). Multiple instances of a
[Service](#service) are typically deployed for high availability and
scalability. A [Service](#service) can be deployed in multiple locations.

### Signal

One of [Traces](#trace), [Metrics](#metric) or [Logs](#log). More on Signals
[here][signals].

### Span

Represents a single operation within a [Trace](#trace). See [more][span].

### Span link

A span link is a link between causally-related spans. For details see
[Links between spans](/docs/specs/otel/overview#links-between-spans) and
[Specifying Links](/docs/specs/otel/trace/api#specifying-links).

### Specification

Describes the cross-language requirements and expectations for all
implementations. See [more][specification].

### Status

The result of the operation. Typically used to indicate whether an error
occurred. See [more][status].

### Tag

See [Metadata](#metadata).

### Trace

A [DAG](#dag) of [Spans](#span), where the edges between [Spans](#span) are
defined as parent-child relationship. See [more][trace].

### Tracer

Responsible for creating [Spans](#span). See [more][tracer].

### Transaction

See [Distributed Tracing](#distributed-tracing).

### zPages

An in-process alternative to external exporters. When included, they collect and
aggregate tracing and metrics information in the background; this data is served
on web pages when requested. See [more][zpages].

[baggage]: /docs/specs/otel/baggage/api/
[attribute]: /docs/specs/otel/common/#attributes
[context propagation]: /docs/specs/otel/overview#context-propagation
[dag]: https://en.wikipedia.org/wiki/Directed_acyclic_graph
[distributed tracing]: /docs/concepts/signals/traces/
[distribution]: /docs/concepts/distributions/
[field]: /docs/specs/otel/logs/data-model#field-kinds
[http]: https://en.wikipedia.org/wiki/Hypertext_Transfer_Protocol
[json]: https://en.wikipedia.org/wiki/JSON
[log]: /docs/specs/otel/glossary#log
[log record]: /docs/specs/otel/glossary#log-record
[metric]: /docs/concepts/signals/metrics/
[propagators]: /docs/languages/go/instrumentation/#propagators-and-context
[proto]: https://github.com/open-telemetry/opentelemetry-proto
[receiver]: /docs/collector/configuration/#receivers
[rest]: https://en.wikipedia.org/wiki/Representational_state_transfer
[rpc]: https://en.wikipedia.org/wiki/Remote_procedure_call
[sampling]: /docs/specs/otel/trace/sdk#sampling
[signals]: /docs/concepts/signals/
[span]: /docs/specs/otel/trace/api#span
[spec-instrumentation-lib]: /docs/specs/otel/glossary/#instrumentation-library
[spec-instrumented-lib]: /docs/specs/otel/glossary/#instrumented-library
[specification]: /docs/concepts/components/#specification
[status]: /docs/specs/otel/trace/api#set-status
[trace]: /docs/specs/otel/overview#traces
[tracer]: /docs/specs/otel/trace/api#tracer
[zpages]:
  https://github.com/open-telemetry/opentelemetry-specification/blob/main/development/trace/zpages.md
