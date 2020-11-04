---
title: "Overview"
weight: 1
---

The OpenTelemetry project supports multiple data sources and consists of
various components to generate, emit and collect telemetry data. All of these
concepts are documented in the [specification
repository](https://github.com/open-telemetry/opentelemetry-specification).
This page provides quick links to learn more about these concepts and how they
are defined in OpenTelemetry.

## Data Sources

OpenTelemetry supports multiple data sources as defined below. More data
sources may be added in the future.

### Traces

Traces tracks the progression of a single request, called a trace, as it is
handled by services that make up an application. The request may be initiated
by a user or an application. Distributed tracing transverses process, network
and security boundaries. Each unit of work is called a span; a trace is a tree
of spans. Spans include metadata about the work including the time spent
(latency), status and name/value tags called attributes. Distributed tracing
provides Request, Error and Duration (RED) metrics and can be used to debug
availability as well as performance issues.

For more information, see the [distributed tracing
specification](https://github.com/open-telemetry/opentelemetry-specification/blob/master/specification/overview.md#distributed-tracing),
which covers concepts including: trace, span, parent/child relationship, span
context, attributes, events and links.

### Metrics

Metrics record data points, either raw measurements or predefined aggregation,
as timeseries with metadata. The data contained within the metric consists of a
single type, for example gauge or histogram, as well as points and labels. A
metric also contains a name, description and unit. Application and request
metrics are important indicators of availability and performance. Custom
metrics can provide insights into how availability indicators impact user
experience or the business. Collected data can be used to alert of an outage or
trigger scheduling decisions to scale up a deployment automatically upon high
demand.

For more information, see the [metrics
specification](https://github.com/open-telemetry/opentelemetry-specification/blob/master/specification/overview.md#metrics),
which covers topics including: measure, measurement, metric, data, data point
and labels.

### Logs

Logs record timestamped text, either structured (recommended) or unstructured,
with metadata. While logs are an independent data source, they may also be
attached to spans. Any data that is not part of a distributed trace or a metric
is a log. For example, events are a specific type of log. Logs are often used
to determine the root cause of an issue and typically contain information about
who changed what as well as the result of the change.

For more information, see the [logs
specification](https://github.com/open-telemetry/opentelemetry-specification/blob/master/specification/overview.md#logs),
which covers topics including: log, defined fields, trace context fields and
severity fields.

## Components

The OpenTelemetry project consists of multiple components. These components are
made available as a single implementation to ease adoption and ensure a
vendor-agnostic solution. More components may be added in the future.

### Proto

Language independent interface types. Defined per data source for
instrumentation libraries and the collector as well as for common aspects and
resources. Proto files are extensively commented. For more information, see the
[proto repository](https://github.com/open-telemetry/opentelemetry-proto).

### Specification

Describes the cross-language requirements and expectations for all
implementations. Beyond definition of terms, the specification defines the
following:

- **API:** Used to generate telemetry data. Defined per data source as well as for
  other aspects including baggage and propagators.
- **SDK:** Implementation of the API with processing and exporting capabilities.
  Defined per data source as well as for other aspects including resources and
  configuration.
- **Data:** Defines semantic conventions to provide vendor-agnostic
  implementations as well as the OpenTelemetry protocol (OTLP).

For more information, see the [specification
repository](https://github.com/open-telemetry/opentelemetry-specification).

### Collector

The OpenTelemetry Collector offers a vendor-agnostic implementation on how to
receive, process, and export telemetry data. It removes the need to run,
operate, and maintain multiple agents/collectors in order to support
open-source observability data formats (e.g. Jaeger, Prometheus, etc.) sending
to one or more open-source or commercial back-ends. The Collector is the
default location instrumentation libraries export telemetry data.

The Collector provides a single binary and two deployment methods:

- An agent running with the application or on the same host as the application
  (e.g. binary, sidecar, or daemonset).
- A gateway running as a standalone service (e.g. container or deployment)
  typically per cluster, datacenter or region.

For more information, see the [collector documentation](https://opentelemetry.io/docs/collector/).

### Instrumentation Libraries

The inspiration of the OpenTelemetry project is to make every library and
application observable out of the box by having them call the OpenTelemetry API
directly. Until that happens, there is a need for a separate library which can
inject this information. A library that enables observability for another
library is called an instrumentation library. The OpenTelemetry project
provides an instrumentation library for multiple languages. All instrumentation
libraries support manual (code modified) instrumentation and several support
automatic (byte-code) instrumentation.

For more information, see [instrumentation
libraries](https://github.com/open-telemetry/opentelemetry-specification/blob/master/specification/overview.md#instrumentation-libraries).

## Other Concepts

### Baggage

Baggage is a mechanism for propagating name/value pairs to help establish a
causal relationship between events and services. For more information, see
the [baggage
API](https://github.com/open-telemetry/opentelemetry-specification/blob/master/specification/baggage/api.md).

### Context Propagation

Context propagation allows all data sources to share an underlying context
mechanism for storing state and accessing data across the lifespan of a
transaction. For more information, see the [context
specification](https://github.com/open-telemetry/opentelemetry-specification/blob/master/specification/context/context.md).

### Propagators

Propagators are used to serialize and deserialize specific parts of telemetry
data such as span context and baggage in spans. For more information, see the
[propagators
API](https://github.com/open-telemetry/opentelemetry-specification/blob/master/specification/context/api-propagators.md).

### Resources

Resources capture information about the entity for which telemetry is recorded.
For example, a process producing telemetry that is running in a container on
Kubernetes has a pod name, it is in a namespace and possibly is part of a
deployment which also has a name. All three of these attributes can be included
in the Resource and applied to any data source. Decoupling the discovery of
resource information from exporters allow for independent development and easy
customization or integration with other systems. For more information, see the
[resource
SDK](https://github.com/open-telemetry/opentelemetry-specification/blob/master/specification/resource/sdk.md).
