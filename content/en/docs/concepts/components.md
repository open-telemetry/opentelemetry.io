---
title: Components
description: The main components that make up OpenTelemetry
weight: 20
---

OpenTelemetry is currently made up of several main components:

- [Cross-language specification](/docs/reference/specification/)
- [OpenTelemetry Collector](/docs/collector/)
- [Per-language SDKs](/docs/instrumentation/)
- [Per-language instrumentation libraries](/docs/concepts/instrumenting-library/)
- [Per-language automatic instrumentation](/docs/concepts/instrumenting/#automatic-instrumentation)
- [K8s Operator](/docs/k8s-operator/)

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

For more information, see the [specification](/docs/reference/specification/).

Additionally, extensively-commented protobuf interface files for API concepts
can be found in the
[proto repository](https://github.com/open-telemetry/opentelemetry-proto).

## Collector

The OpenTelemetry Collector is a vendor-agnostic proxy that can receive,
process, and export telemetry data. It supports receiving telemetry data in
multiple formats (for example, OTLP, Jaeger, Prometheus, as well as many
commercial/proprietary tools) and sending data to one or more backends. It also
supports processing and filtering telemetry data before it gets exported.
Collector contrib packages bring support for more data formats and vendor
backends.

For more information, see [Collector](/docs/collector/).

## Language SDKs

OpenTelemetry also has language SDKs that let you use the OpenTelemetry API to
generate telemetry data with your language of choice and export that data to a
preferred backend. These SDKs also let you incorporate instrumentation libraries
for common libraries and frameworks that you can use to connect to manual
instrumentation in your application.

For more information, see [Instrumenting](/docs/concepts/instrumenting/).

## Instrumentation Libraries

OpenTelemetry supports a broad number of components that generate relevant
telemetry data from popular libraries and frameworks for supported languages.
For example, inbound and outbound HTTP requests from an HTTP library will
generate data about those requests.

It is a long-term goal that popular libraries are authored to be observable out
of the box, such that pulling in a separate component is not required.

For more information, see
[Instrumenting Libraries](/docs/concepts/instrumenting-library/).

## Automatic Instrumentation

If applicable a language specific implementation of OpenTelemetry will provide a
way to instrument your application without touching your source code. While the
underlying mechanism depends on the language, at a minimum this will add the
OpenTelemetry API and SDK capabilities to your application. Additionally they
may add a set of Instrumentation Libraries and exporter dependencies.

For more information, see
[Instrumenting](/docs/concepts/instrumenting/#automatic-instrumentation).

## K8s operator

The OpenTelemetry Operator is an implementation of a Kubernetes Operator. The
operator manages the OpenTelemetry Collector and auto-instrumentation of the
workloads using OpenTelemetry.

For more information, see [K8s Operator](/docs/k8s-operator/).
