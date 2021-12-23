---
title: Glossary
weight: 100
---

The OpenTelemetry project uses terminology you may or may not be familiar with.
In addition, the project may define the terminology in a different way than
others. This page captures terminology used in the project and what it means.

## Generic Terminology

- **Aggregation:** The process of combining multiple measurements into exact or
  estimated statistics about the measurements that took place during an
  interval of time, during program execution. Used by the `Metric` `Data Source`.
- **API:** Application Programming Interface. In the OpenTelemetry project,
  used to define how telemetry data is generated per `Data Source`.
- **Application:** One or more `Services` designed for end users or other applications.
- **APM:** Application Performance Monitoring. Typically a back-end of the
  `Tracing` `Data Source`.
- <a id="attribute"></a>
  **[Attribute][]:** A key-value pair. Used by the `Tracing` `Data Source` to attach data to a `Span`.
- **[Baggage]({{< relref "/docs/reference/specification/overview#baggage-signal" >}}):** A
  mechanism for propagating name/value pairs to help establish a causal
  relationship between events and services.
- **Client Library:** See `Instrumented Library`.
- **Client-side App:** A component of an `Application` that is not running inside a private infrastructure and is typically used directly by end-users. Examples of client-side apps are browser apps, mobile apps, and apps running on IoT devices.
- **[Collector](/docs/collector/):**
  A vendor-agnostic implementation on how to receive, process, and export
  telemetry data. A single binary that can be deployed as an agent or gateway.
- **Contrib:** Several `Instrumentation Libraries` and the `Collector` offer a set
  of core capabilities as well as a dedicated contrib repository for non-core
  capabilities including vendor `Exporters`.
- **[Context
  Propagation]({{< relref "/docs/reference/specification/overview#context-propagation" >}}):**
  Allows all `Data Sources` to share an underlying context mechanism for storing
  state and accessing data across the lifespan of a `Transaction`.
- **[DAG](https://en.wikipedia.org/wiki/Directed_acyclic_graph):** Directed Acyclic Graph.
- **[Data Source](/docs/concepts/data-sources):** One of `Traces`, `Metrics` or `Logs`.
- **Dimension:** See `Label`.
- **[Distributed Tracing](/docs/concepts/data-sources/#traces):**
  Tracks the progression of a single `Request`, called a `Trace`, as it is handled
  by `Services` that make up an `Application`. A `Distributed Trace` transverses
  process, network and security boundaries.
- **Event:** Something that happened where representation depends on the `Data
  Source`. For example,
  [`Spans`]({{< relref "/docs/reference/specification/trace/api#add-events" >}}).
- **Exporter:** Provides functionality to emit telemetry to consumers. Used by
  [Instrumentation Libraries][spec-exporter-lib] and the
  [Collector](/docs/collector/configuration#basics).
  Exporters can be push or pull based.
- **[Field]({{< relref "/docs/reference/specification/logs/data-model#field-kinds" >}}):**
  name/value pairs added to `Log Records` (similar to `Attributes` for `Spans` and
  `Labels` for `Metrics`).
- **[gRPC](https://grpc.io):** A high-performance, open source universal `RPC` framework.
- **[HTTP](https://en.wikipedia.org/wiki/Hypertext_Transfer_Protocol):** Hypertext Transfer Protocol.
- **[Instrumented Library][spec-instrumented-lib]:**
  Denotes the `Library` for which the telemetry signals (`Traces`, `Metrics`, `Logs`)
  are gathered.
- **[Instrumentation Library][spec-instrumentation-lib]:**
  Denotes the `Library` that provides the instrumentation for a given
  `Instrumented Library`. `Instrumented Library` and `Instrumentation Library` may be
  the same `Library` if it has built-in OpenTelemetry instrumentation.
- **[JSON](https://en.wikipedia.org/wiki/JSON):** JavaScript Object Notation.
- **Label:** see [Attribute](#attribute).
- **Language:** Programming Language.
- **Library:** A language-specific collection of behavior invoked by an interface.
- **[Log]({{< relref "/docs/reference/specification/glossary#log" >}}):**
  Sometimes used to refer to a collection of `Log Records`. May be ambiguous,
  since people also sometimes use `Log` to refer to a single `Log Record`, thus
  this term should be used carefully and in the context where ambiguity is
  possible additional qualifiers should be used (e.g. `Log Record`).
- **[Log
  Record]({{< relref "/docs/reference/specification/glossary#log-record" >}}):**
  A recording of an `Event`. Typically the record includes a timestamp indicating
  when the `Event` happened as well as other data that describes what happened,
  where it happened, etc.
- **Metadata:** name/value pair added to telemetry data. OpenTelemetry calls
  this `Attributes` on `Spans`, `Labels` on `Metrics` and `Fields` on `Logs`.
- **[Metric](/docs/concepts/data-sources/#metrics):**
  Records a data point, either raw measurements or predefined aggregation, as
  timeseries with `Metadata`.
- **OC:** `OpenCensus`.
- **[OpenCensus](https://opencensus.io):** a set of libraries for various languages that allow you to
  collect application metrics and distributed traces, then transfer the data to
  a backend of your choice in real time. Precursor to OpenTelemetry.
- **[OpenTracing](https://opentracing.io):** Vendor-neutral APIs and instrumentation for distributed tracing. Precursor to OpenTelemetry.
- **OT:** `OpenTracing`.
- **OTel:** OpenTelemetry.
- **OtelCol:** OpenTelemetry Collector.
- **OTLP:** OpenTelemetry Protocol.
- **Processor:** Operation performed on data between being received and being
  exported. For example, batching. Used by [Instrumentation
  Libraries]({{< relref "/docs/reference/specification/trace/sdk#span-processor" >}})
  and the
  [Collector](/docs/collector/configuration/#processors).
- **[Propagators](/docs/instrumentation/go/manual/#propagators-and-context):** Used to
  serialize and deserialize specific parts of telemetry data such as span
  context and `Baggage` in `Spans`.
- **[Proto](https://github.com/open-telemetry/opentelemetry-proto):** Language independent interface types.
- **[Receiver](/docs/collector/configuration/#receivers):**
  Term used by the `Collector` to define how telemetry data is received.
  Receivers can be push or pull based.
- **Request:** See `Distributed Tracing`.
- **Resource:**
  Captures information about the entity for which telemetry is recorded. For
  example, a process producing telemetry that is running in a container on
  Kubernetes has a pod name, it is in a namespace and possibly is part of a
  deployment which also has a name. All three of these attributes can be
  included in the `Resource` and applied to any data source.
- **[REST](https://en.wikipedia.org/wiki/Representational_state_transfer):** Representation State Transfer.
- **[RPC](https://en.wikipedia.org/wiki/Remote_procedure_call):** Remote Procedure Call.
- **[Sampling]({{< relref "/docs/reference/specification/trace/sdk#sampling" >}}):**
  A mechanism to control the amount of data exported. Most commonly used with
  the `Tracing` `Data Source`.
- **SDK:** Software Development Kit. Refers to a telemetry SDK that denotes a
  `Library` that implement the OpenTelemetry `API`.
- **Semantic Conventions:** Defines standard names and values of `Metadata` in
  order to provide vendor-agnostic telemetry data.
- **Service:** A component of an `Application`. Multiple instances of a
  `Service` are typically deployed for high availability and scalability. A
  `Service` may be deployed in multiple locations.
- **[Span]({{< relref "/docs/reference/specification/trace/api#span" >}}):**
  Represents a single operation within a `Trace`.
- **Span Link:** A span link is a link between causally-related spans. For details see [Links between spans]({{< relref "/docs/reference/specification/overview#links-between-spans" >}}) and [Specifying Links]({{< relref "/docs/reference/specification/trace/api#specifying-links" >}}).
- **[Specification](/docs/concepts/components/#specification):**
  Describes the cross-language requirements and expectations for all
  implementations.
- **[Status]({{< relref "/docs/reference/specification/trace/api#set-status" >}}):**
  The result of the operation. Typically used to indicate whether an error
  occurred.
- **Tag:** see `Metadata`.
- **[Trace]({{< relref "/docs/reference/specification/overview#traces" >}}):**
  A `DAG` of `Spans`, where the edges between `Spans` are defined as
  parent/child relationship.
- **[Tracer]({{< relref "/docs/reference/specification/trace/api#tracer" >}}):**
  Responsible for creating `Spans`.
- **Transaction:** See `Distributed Tracing`.
- **[zPages][]:**
  An in-process alternative to external exporters. When included, they collect
  and aggregate tracing and metrics information in the background; this data is
  served on web pages when requested.

## Additional Terminology

### Traces

- **[Trace API Terminology]({{< relref "/docs/reference/specification/trace/api" >}})**
- **[Trace SDK Terminology]({{< relref "/docs/reference/specification/trace/sdk" >}})**

### Metrics

- **[Metric API Terminology]({{< relref "/docs/reference/specification/metrics/api#overview" >}})**
- **[Metric SDK Terminology]({{< relref "/docs/reference/specification/metrics#specifications" >}})**

### Logs

- **[Trace Context Fields]({{< relref "/docs/reference/specification/logs/data-model#trace-context-fields" >}})**
- **[Severity Fields]({{< relref "/docs/reference/specification/logs/data-model#severity-fields" >}})**
- **[Log Record Fields]({{< relref "/docs/reference/specification/logs/data-model#log-and-event-record-definition" >}})**

### Semantic Conventions

- **[Resource Conventions]({{< relref "/docs/reference/specification/resource/semantic_conventions" >}})**
- **[Span Conventions]({{< relref "/docs/reference/specification/trace/semantic_conventions" >}})**
- **[Metric Conventions]({{< relref "/docs/reference/specification/metrics/semantic_conventions" >}})**

[Attribute]: {{< relref "/docs/reference/specification/common/common#attributes" >}}
[spec-exporter-lib]: {{< relref "/docs/reference/specification/glossary#exporter-library" >}}
[spec-instrumentation-lib]: {{< relref "/docs/reference/specification/glossary#instrumentation-library" >}}
[spec-instrumented-lib]: {{< relref "/docs/reference/specification/glossary#instrumented-library" >}}
[zPages]: https://github.com/open-telemetry/opentelemetry-specification/blob/main/experimental/trace/zpages.md
