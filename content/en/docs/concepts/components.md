---
title: Components
description: >-
  The main components that make up OpenTelemetry
weight: 20
---

OpenTelemetry is currently made up of several main components:

- Cross-language specification
- Tools to collect, transform, and export telemetry data
- Per-language SDKs
- Automatic instrumentation and contrib packages

OpenTelemetry lets you replace the need for vendor-specific SDKs and tools for
generating and exporting telemetry data.

## Specification

Describes the cross-language requirements and expectations for all
implementations. Beyond a definition of terms, the specification defines the
following:

- **API:** Defines data types and operations for generating and correlating
  tracing, metrics, and logging data.
- **SDK:** Defines requirements for a language-specific implementation of the
  API. Configuration, data processing, and exporting concepts are also defined
  here.
- **Data:** Defines the OpenTelemetry Protocol (OTLP) and vendor-agnostic
  semantic conventions that a telemetry backend can provide support for.

For more information, see the [Specification](/docs/reference/specification/).

Additionally, extensively-commented protobuf interface files for API concepts
can be found in the
[proto repository](https://github.com/open-telemetry/opentelemetry-proto).

## Collector

The OpenTelemetry Collector is a vendor-agnostic proxy that can receive,
process, and export telemetry data. It supports receiving telemetry data in
multiple formats (e.g., OTLP, Jaeger, Prometheus, as well as many
commercial/proprietary tools) and sending data to one or more backends. It also
supports processing and filtering telemetry data before it gets exported.
Collector contrib packages bring support for more data formats and vendor
backends.

For more information, see [Data Collection](/docs/concepts/data-collection/).

## Language SDKs

OpenTelemetry also has language SDKs that let you use the OpenTelemetry API to
generate telemetry data with your language of choice and export that data to a
preferred backend. These SDKs also let you incorporate automatic instrumentation
for common libraries and frameworks that you can use to connect to manual
instrumentation in your application. Vendors often make distributions of
language SDKs to make exporting to their backends simpler.

For more information, see [Instrumenting](/docs/concepts/instrumenting).

## Automatic Instrumentation

OpenTelemetry supports a broad number of components that generate relevant
telemetry data from popular libraries and frameworks for supported languages.
For example, inbound and outbound HTTP requests from an HTTP library will
generate data about those requests. Using automatic instrumentation may differ
from language to language, where one might prefer or require the use of a
component that you load alongside your application, and another might prefer
that you pull in a package explicitly in your codebase.

It is a long-term goal that popular libraries are authored to be observable out
of the box, such that pulling in a separate component is not required.

For more information, see
[Instrumenting Libraries](/docs/concepts/instrumenting-library/).
