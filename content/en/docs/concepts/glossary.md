---
title: "Glossary"
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
- **[Attributes](https://github.com/open-telemetry/opentelemetry-specification/blob/master/specification/common/common.md#attributes):**
  Used by the `Tracing` `Data Source` to attach name/value pairs to a `Span`.
- **[Baggage](https://opentelemetry.io/docs/concepts/overview/#baggage):** A
  mechanism for propagating name/value pairs to help establish a causal
  relationship between events and services.
- **Client Library:** See `Instrumented Library`.
- **[Collector](https://opentelemetry.io/docs/concepts/overview/#collector):**
  A vendor-agnostic implementation on how to receive, process, and export
  telemetry data. A single binary that can be deployed as an agent or gateway.
- **Contrib:** Several `Instrumentation Libraries` and the `Collector` offer a set
  of core capabilities as well as a dedicated contrib repository for non-core
  capabilities including vendor `Exporters`.
- **[Context
  Propagation](https://opentelemetry.io/docs/concepts/overview/#context-propagation):**
  Allows all `Data Sources` to share an underlying context mechanism for storing
  state and accessing data across the lifespan of a `Transaction`.
- **[DAG](https://en.wikipedia.org/wiki/Directed_acyclic_graph):** Directed Acyclic Graph.
- **[Data
  Source](https://opentelemetry.io/docs/concepts/overview/#data-sources):** One
  of `Traces`, `Metrics` or `Logs`.
- **Dimension:** See `Label`.
- **[Distributed
  Tracing](https://opentelemetry.io/docs/concepts/overview/#distributed-tracing):**
  Tracks the progression of a single `Request`, called a `Trace`, as it is handled
  by `Services` that make up an `Application`. A `Distributed Trace` transverses
  process, network and security boundaries.
- **Event:** Something that happened where representation depends on the `Data
  Source`. For example,
  [`Spans`](https://github.com/open-telemetry/opentelemetry-specification/blob/master/specification/trace/api.md#add-events).
- **Exporter:** Provides functionality to emit telemetry to consumers. Used by
  [Instrumentation
  Libraries](https://github.com/open-telemetry/opentelemetry-specification/blob/master/specification/glossary.md#exporter-library)
  and the
  [Collector](https://opentelemetry.io/docs/collector/configuration/#exporters).
  Exporters can be push or pull based.
- **[Field](https://github.com/open-telemetry/opentelemetry-specification/blob/master/specification/logs/data-model.md#field-kinds):**
  name/value pairs added to `Log Records` (similar to `Attributes` for `Spans` and
  `Labels` for `Metrics`).
- **[gRPC](https://grpc.io):** A high-performance, open source universal `RPC` framework.
- **[HTTP](https://en.wikipedia.org/wiki/Hypertext_Transfer_Protocol):** Hypertext Transfer Protocol.
- **[Instrumented
  Library](https://github.com/open-telemetry/opentelemetry-specification/blob/master/specification/glossary.md#instrumented-library):**
  Denotes the `Library` for which the telemetry signals (`Traces`, `Metrics`, `Logs`)
  are gathered.
- **[Instrumentation
  Library](https://github.com/open-telemetry/opentelemetry-specification/blob/master/specification/glossary.md#instrumentation-library):**
  Denotes the `Library` that provides the instrumentation for a given
  `Instrumented Library`. `Instrumented Library` and `Instrumentation Library` may be
  the same `Library` if it has built-in OpenTelemetry instrumentation.
- **[JSON](https://en.wikipedia.org/wiki/JSON):** JavaScript Object Notation.
- **[Label](https://github.com/open-telemetry/opentelemetry-specification/blob/master/specification/metrics/api.md#labels):**
  name/value pairs added to `Metric` data oints (similar to `Attributes` for `Spans`
  and `Fields` for `Log Records`).
- **Language:** Programming Language.
- **Library:** A language-specific collection of behavior invoked by an interface.
- **[Log](https://github.com/open-telemetry/opentelemetry-specification/blob/master/specification/glossary.md#log):**
  Sometimes used to refer to a collection of `Log Records`. May be ambiguous,
  since people also sometimes use `Log` to refer to a single `Log Record`, thus
  this term should be used carefully and in the context where ambiguity is
  possible additional qualifiers should be used (e.g. `Log Record`).
- **[Log
  Record](https://github.com/open-telemetry/opentelemetry-specification/blob/master/specification/glossary.md#log-record):**
  A recording of an `Event`. Typically the record includes a timestamp indicating
  when the `Event` happened as well as other data that describes what happened,
  where it happened, etc.
- **Metadata:** name/value pair added to telemetry data. OpenTelemetry calls
  this `Attributes` on `Spans`, `Labels` on `Metrics` and `Fields` on `Logs`.
- **[Metric](https://opentelemetry.io/docs/concepts/overview/#metrics):**
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
  Libraries](https://github.com/open-telemetry/opentelemetry-specification/blob/master/specification/trace/sdk.md#span-processor)
  and the
  [Collector](https://opentelemetry.io/docs/collector/configuration/#processors).
- **[Propagators](https://opentelemetry.io/docs/concepts/overview/):** Used to
  serialize and deserialize specific parts of telemetry data such as span
  context and `Baggage` in `Spans`.
- **[Proto](https://opentelemetry.io/docs/concepts/overview/#proto):** Language independent interface types.
- **[Receiver](https://opentelemetry.io/docs/collector/configuration/#receivers):**
  Term used by the `Collector` to define how telemetry data is received.
  Receivers can be push or pull based.
- **Request:** See `Distributed Tracing`.
- **[Resource](https://opentelemetry.io/docs/concepts/overview/#resource):**
  Captures information about the entity for which telemetry is recorded. For
  example, a process producing telemetry that is running in a container on
  Kubernetes has a pod name, it is in a namespace and possibly is part of a
  deployment which also has a name. All three of these attributes can be
  included in the `Resource` and applied to any data source.
- **[REST](https://en.wikipedia.org/wiki/Representational_state_transfer):** Representation State Transfer.
- **[RPC](https://en.wikipedia.org/wiki/Remote_procedure_call):** Remote Procedure Call.
- **[Sampling](https://github.com/open-telemetry/opentelemetry-specification/blob/master/specification/trace/sdk.md#sampling):**
  A mechanism to control the amount of data exported. Most commonly used with
  the `Tracing` `Data Source`.
- **SDK:** Software Development Kit. Refers to a telemetry SDK that denotes a
  `Library` that implement the OpenTelemetry `API`.
- **Semantic Conventions:** Defines standard names and values of `Metadata` in
  order to provide vendor-agnostic telemetry data.
- **Service:** A component of an `Application`. Multiple instances of a
  `Service` are typically deployed for high availability and scalability. A
  `Service` may be deployed in multiple locations.
- **[Span](https://github.com/open-telemetry/opentelemetry-specification/blob/master/specification/trace/api.md#span):**
  Represents a single operation within a `Trace`.
- **[Specification](https://opentelemetry.io/docs/concepts/overview/#specification):**
  Describes the cross-language requirements and expectations for all
  implementations.
- **[Status](https://github.com/open-telemetry/opentelemetry-specification/blob/master/specification/trace/api.md#set-status):**
  The result of the operation. Typically used to indicate whether an error
  occurred.
- **Tag:** See `Metadata`.
- **[Trace](https://github.com/open-telemetry/opentelemetry-specification/blob/master/specification/overview.md#trace):**
  A `DAG` of `Spans`, where the edges between `Spans` are defined as
  parent/child relationship.
- **[Tracer](https://github.com/open-telemetry/opentelemetry-specification/blob/master/specification/trace/api.md#tracer):**
  Responsible for creating `Spans`.
- **Transaction:** See `Distributed Tracing`.
- **[zPages](https://github.com/open-telemetry/opentelemetry-specification/blob/master/experimental/trace/zpages.md):**
  An in-process alternative to external exporters. When included, they collect
  and aggregate tracing and metrics information in the background; this data is
  served on web pages when requested.

## Additional Terminology

### Traces

- **[Trace API Terminology](https://github.com/open-telemetry/opentelemetry-specification/blob/master/specification/trace/api.md)**
- **[Trace SDK Terminology](https://github.com/open-telemetry/opentelemetry-specification/blob/master/specification/trace/sdk.md)**

### Metrics

- **[Metric API Terminology](https://github.com/open-telemetry/opentelemetry-specification/blob/master/specification/metrics/api.md#overview)**
- **[Metric SDK Terminology](https://github.com/open-telemetry/opentelemetry-specification/blob/master/specification/metrics/sdk.md#sdk-terminology)**

### Logs

- **[Trace Context Fields](https://github.com/open-telemetry/opentelemetry-specification/blob/master/specification/logs/data-model.md#trace-context-fields)**
- **[Severity Fields](https://github.com/open-telemetry/opentelemetry-specification/blob/master/specification/logs/data-model.md#severity-fields)**
- **[Log Record Fields](https://github.com/open-telemetry/opentelemetry-specification/blob/master/specification/logs/data-model.md#log-and-event-record-definition)**

### Semantic Conventions

- **[Resource Conventions](https://github.com/open-telemetry/opentelemetry-specification/blob/master/specification/resource/semantic_conventions/README.md)**
- **[Span Conventions](https://github.com/open-telemetry/opentelemetry-specification/blob/master/specification/trace/semantic_conventions/README.md)**
- **[Metric Conventions](https://github.com/open-telemetry/opentelemetry-specification/blob/master/specification/metrics/semantic_conventions/README.md)**
