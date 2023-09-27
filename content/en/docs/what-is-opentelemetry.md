---
title: What is OpenTelemetry?
description: A short explanation of what OpenTelemetry is, and is not.
aliases: [/about, /docs/concepts/what-is-opentelemetry, /otel]
weight: -1
---

OpenTelemetry is an
[Observability](/docs/concepts/observability-primer/#what-is-observability)
framework and toolkit designed to create and manage _telemetry data_ such as
[traces](/docs/concepts/signals/traces/),
[metrics](/docs/concepts/signals/metrics/), and
[logs](/docs/concepts/signals/logs/). Crucially, OpenTelemetry is vendor- and
tool-agnostic, meaning that it can be used with a broad variety of Observability
backends, including open source tools like
[Jaeger](https://www.jaegertracing.io/) and
[Prometheus](https://prometheus.io/), as well as commercial offerings.
OpenTelemetry is a
[Cloud Native Computing Foundation (CNCF)](https://www.cncf.io) project.

## Major components

OpenTelemetry consists of the following major components:

- A [specification](/docs/specs/otel) for all components
- A standard [protocol](/docs/specs/otlp/) that defines the shape of telemetry
  data
- Semantic conventions that define a standard naming scheme for common telemetry
  data types
- APIs that define how to generate telemetry data
- A [library ecosystem](/ecosystem/registry) that implements instrumentation for
  common libraries and frameworks
- Automatic instrumentation components that generate telemetry data without
  requiring code changes
- Language SDKs that implement the specification, APIs, and export of telemetry
  data
- The [OpenTelemetry Collector](/docs/collector), a proxy that receives,
  processes, and exports telemetry data
- Various other tools, such as the
  [OpenTelemetry Operator for Kubernetes](/docs/kubernetes/operator/),
  [OpenTelemetry Helm Charts](/docs/kubernetes/helm/), and
  [community assets for FaaS](/docs/faas/)

OpenTelemetry is compatible with a wide variety of
[ecosystem integrations](/ecosystem/integrations/).

OpenTelemetry is supported by 40+ [vendors](/ecosystem/vendors/), many of whom
provide commercial support for OpenTelemetry and contribute to the project
directly.

## Extensibility

OpenTelemetry is designed to be extensible. Some examples of how it can be
extended include:

- Adding a receiver to the OpenTelemetry Collector to support telemetry data
  from a custom source
- Loading custom instrumentation into an SDK
- Creating a distribution of an SDK or the Collector tailored to a specific use
  case
- Creating a new exporter for a custom backend that doesn't yet support the
  OpenTelemetry protocol (OTLP)
- Creating a custom propagator for a nonstandard context propagation format

Although most users will not need to extend OpenTelemetry, the project is
designed to make it possible at nearly every level.

## Why OpenTelemetry?

With the rise of cloud computing, microservices architectures, and ever-more
complex business requirements, the need for
[Observability](/docs/concepts/observability-primer/#what-is-observability) has
never been greater. Observability is the ability to understand the internal
state of a system by examining its outputs. In the context of software, this
means being able to understand the internal state of a system by examining its
telemetry data, which includes traces, metrics, and logs.

In order to make a system observable, it must be instrumented. That is, the code
must emit [traces](/docs/concepts/observability-primer/#distributed-traces),
[metrics](/docs/concepts/observability-primer/#reliability--metrics), and
[logs](/docs/concepts/observability-primer/#logs). The instrumented data must
then be sent to an Observability backend.

OpenTelemetry does two important things:

1. Allows **you to own the data that you generate** rather than be stuck with a
   proprietary data format or tool.
2. Allows you to learn a single set of APIs and conventions

These two things combined enables teams and organizations the flexibility they
need in today's modern computing world.

### History

OpenTelemetry is the result of a merger between two prior projects,
[OpenTracing](https://opentracing.io) and [OpenCensus](https://opencensus.io).
Both of these projects were created to solve the same problem: the lack of a
standard for how to instrument code and send telemetry data to an Observability
backend. However, neither project was fully able to solve the problem on its
own, and so the two projects merged to form OpenTelemetry so that they could
combine their strengths and truly offer a single standard.

## What OpenTelemetry is not

OpenTelemetry is not an observability back-end like Jaeger, Prometheus, or
commercial vendors. OpenTelemetry is focused on the generation, collection,
management, and export of telemetry data. The storage and visualization of that
data is intentionally left to other tools.

## What next?

- [Getting started](/docs/getting-started/) &mdash; jump right in!
- Learn about [OpenTelemetry concepts](/docs/concepts/).
