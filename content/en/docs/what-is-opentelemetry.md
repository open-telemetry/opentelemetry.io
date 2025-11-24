---
title: What is OpenTelemetry?
description: A brief explanation of what OpenTelemetry is and isn't.
aliases: [/about, /docs/concepts/what-is-opentelemetry, /otel]
weight: 150
cSpell:ignore: youtube
---

OpenTelemetry is:

- An **[observability] framework and toolkit** designed to facilitate the
  - [Generation][instr]
  - Export
  - [Collection](../concepts/components/#collector)

  of [telemetry data][] such as [traces], [metrics], and [logs].

- **Open source**, as well as **vendor- and tool-agnostic**, meaning that it can
  be used with a broad variety of observability backends, including open source
  tools like [Jaeger] and [Prometheus], as well as commercial offerings.
  OpenTelemetry is **not** an observability backend itself.

A major goal of OpenTelemetry is to enable easy instrumentation of your
applications and systems, regardless of the programming language,
infrastructure, and runtime environments used.

The backend (storage) and the frontend (visualization) of telemetry data are
intentionally left to other tools.

<div class="td-max-width-on-larger-screens">
{{< youtube iEEIabOha8U >}}
</div>

For more videos in this series and additional resources, see
[What next?](#what-next)

## What is observability?

[Observability] is the ability to understand the internal state of a system by
examining its outputs. In the context of software, this means being able to
understand the internal state of a system by examining its telemetry data, which
includes traces, metrics, and logs.

To make a system observable, it must be [instrumented][instr]. That is, the code
must emit [traces], [metrics], or [logs]. The instrumented data must then be
sent to an observability backend.

## Why OpenTelemetry?

With the rise of cloud computing, microservices architectures, and increasingly
complex business requirements, the need for software and infrastructure
[observability] is greater than ever.

OpenTelemetry satisfies the need for observability while following two key
principles:

1. You own the data that you generate. There's no vendor lock-in.
2. You only have to learn a single set of APIs and conventions.

Both principles combined grant teams and organizations the flexibility they need
in today's modern computing world.

If you want to learn more, take a look at OpenTelemetry's
[mission, vision, and values](/community/mission/).

## Main OpenTelemetry components

OpenTelemetry consists of the following major components:

- A [specification](/docs/specs/otel) for all components
- A standard [protocol](/docs/specs/otlp/) that defines the shape of telemetry
  data
- [Semantic conventions](/docs/specs/semconv/) that define a standard naming
  scheme for common telemetry data types
- APIs that define how to generate telemetry data
- [Language SDKs](../languages) that implement the specification, APIs, and
  export of telemetry data
- A [library ecosystem](/ecosystem/registry) that implements instrumentation for
  common libraries and frameworks
- Automatic instrumentation components that generate telemetry data without
  requiring code changes
- The [OpenTelemetry Collector](../collector), a proxy that receives, processes,
  and exports telemetry data
- Various other tools, such as the
  [OpenTelemetry Operator for Kubernetes](../platforms/kubernetes/operator/),
  [OpenTelemetry Helm Charts](../platforms/kubernetes/helm/), and
  [community assets for FaaS](../platforms/faas/)

OpenTelemetry is used by a wide variety of
[libraries, services and apps](/ecosystem/integrations/) that have OpenTelemetry
integrated to provide observability by default.

OpenTelemetry is supported by numerous [vendors](/ecosystem/vendors/), many of
whom provide commercial support for OpenTelemetry and contribute to the project
directly.

## Extensibility

OpenTelemetry is designed to be extensible. Some examples of how it can be
extended include:

- Adding a receiver to the OpenTelemetry Collector to support telemetry data
  from a custom source
- Loading custom instrumentation libraries into an SDK
- Creating a [distribution](../concepts/distributions/) of an SDK or the
  Collector tailored to a specific use case
- Creating a new exporter for a custom backend that doesn't yet support the
  OpenTelemetry protocol (OTLP)
- Creating a custom propagator for a nonstandard context propagation format

Although most users might not need to extend OpenTelemetry, the project is
designed to make it possible at nearly every level.

## History

OpenTelemetry is a [Cloud Native Computing Foundation][] (CNCF) project that is
the result of a [merger] between two prior projects,
[OpenTracing](https://opentracing.io) and [OpenCensus](https://opencensus.io).
Both of these projects were created to solve the same problem: the lack of a
standard for how to instrument code and send telemetry data to an Observability
backend. As neither project was fully able to solve the problem independently,
they merged to form OpenTelemetry and combine their strengths while offering a
single solution.

If you are currently using OpenTracing or OpenCensus, you can learn how to
migrate to OpenTelemetry in the [Migration guide](../migration/).

[merger]:
  https://www.cncf.io/blog/2019/05/21/a-brief-history-of-opentelemetry-so-far/

## What next?

- [Getting started](../getting-started/) &mdash; jump right in!
- Learn about [OpenTelemetry concepts](../concepts/).
- [Watch videos][] from the [OTel for beginners][] or other [playlists].
- Sign up for [training](/training), including the **free course**
  [Getting started with OpenTelemetry](/training/#courses).

[Cloud Native Computing Foundation]: https://www.cncf.io
[instr]: ../concepts/instrumentation
[Jaeger]: https://www.jaegertracing.io/
[logs]: ../concepts/signals/logs/
[metrics]: ../concepts/signals/metrics/
[observability]: ../concepts/observability-primer/#what-is-observability
[OTel for beginners]:
  https://www.youtube.com/playlist?list=PLVYDBkQ1TdyyWjeWJSjXYUaJFVhplRtvN
[playlists]: https://www.youtube.com/@otel-official/playlists
[Prometheus]: https://prometheus.io/
[telemetry data]: ../concepts/signals/
[traces]: ../concepts/signals/traces/
[Watch videos]: https://www.youtube.com/@otel-official
