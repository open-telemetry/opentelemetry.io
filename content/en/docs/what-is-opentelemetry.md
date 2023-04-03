---
title: What is OpenTelemetry?
description: A short explanation of what OpenTelemetry is, and is not.
aliases: [/about, /docs/concepts/what-is-opentelemetry, /otel]
weight: -1
---

Microservices architectures have enabled developers to build and release
software faster and with greater independence, as they were no longer beholden
to the elaborate release processes associated with monolithic architectures.

As these now-distributed systems scaled, it became increasingly difficult for
developers to see how their own services depend on or affect other services,
especially after a deployment or during an outage, where speed and accuracy are
critical.

> [Observability](/docs/concepts/observability-primer/#what-is-observability)
> has made it possible for both developers and operators to gain that visibility
> into their systems.

## So what?

In order to make a system observable, it must be instrumented. That is, the code
must emit [traces](/docs/concepts/observability-primer/#distributed-traces),
[metrics](/docs/concepts/observability-primer/#reliability--metrics), and
[logs](/docs/concepts/observability-primer/#logs). The instrumented data must
then be sent to an Observability back-end. There are a number of Observability
back-ends out there, ranging from self-hosted open source tools (e.g.
[Jaeger](https://www.jaegertracing.io/) and [Zipkin](https://zipkin.io/)), to
commercial SaaS offerings.

In the past, the way in which code was instrumented would vary, as each
Observability back-end would have its own instrumentation libraries and agents
for emitting data to the tools.

This meant that there was no standardized data format for sending data to an
Observability back-end. Furthermore, if a company chose to switch Observability
back-ends, it meant that they would have to re-instrument their code and
configure new agents just to be able to emit telemetry data to the new tool of
choice.

> With a lack of standardization, the net result is the lack of data portability
> and the burden on the user to maintain instrumentation libraries.

Recognizing the need for standardization, the cloud community came together, and
two open source projects were born: [OpenTracing](https://opentracing.io) (a
[Cloud Native Computing Foundation (CNCF)](https://www.cncf.io) project) and
[OpenCensus](https://opencensus.io) (a
[Google Open Source](https://opensource.google) community project).

**OpenTracing** provided a vendor-neutral API for sending telemetry data over to
an Observability back-end; however, it relied on developers to implement their
own libraries to meet the specification.

**OpenCensus** provided a set of language-specific libraries that developers
could use to instrument their code and send to any one of their supported
back-ends.

## Hello, OpenTelemetry!

In the interest of having one single standard, OpenCensus and OpenTracing were
merged to form OpenTelemetry (OTel for short) [in May
2019][cncf-incubating-project]. As a CNCF incubating project, OpenTelemetry
takes the best of both worlds, and then some.

OTel's goal is to provide a set of standardized vendor-agnostic SDKs, APIs, and
[tools](/docs/collector) for ingesting, transforming, and sending data to an
Observability back-end (i.e. open source or commercial vendor).

## What can OpenTelemetry do for me?

OTel has broad industry support and adoption from cloud providers,
[vendors](/ecosystem/vendors/) and end users. It provides you with:

- A single, vendor-agnostic instrumentation library
  [per language](/docs/instrumentation) with support for both automatic and
  manual instrumentation.
- A single vendor-neutral [collector](/docs/collector) binary that can be
  deployed in a variety of ways.
- An end-to-end implementation to generate, emit, collect, process and export
  telemetry data.
- Full control of your data with the ability to send data to multiple
  destinations in parallel through configuration.
- Open-standard semantic conventions to ensure vendor-agnostic data collection
- The ability to support multiple
  [context propagation](/docs/reference/specification/overview/#context-propagation)
  formats in parallel to assist with migrating as standards evolve.
- A path forward no matter where you are on your observability journey.

With support for a variety of [open source and commercial
protocols][otel-collector-contrib], format and context propagation mechanisms as
well as providing shims to the OpenTracing and OpenCensus projects, it is easy
to adopt OpenTelemetry.

## What OpenTelemetry is not

OpenTelemetry is not an observability back-end like Jaeger or Prometheus.
Instead, it supports exporting data to a variety of open source and commercial
back-ends. It provides a pluggable architecture so additional technology
protocols and formats can be easily added.

## What next?

- [Getting started](/docs/getting-started/) &mdash; jump right in!
- Learn about [OpenTelemetry concepts](/docs/concepts/).

[cncf-incubating-project]:
  https://www.cncf.io/blog/2021/08/26/opentelemetry-becomes-a-cncf-incubating-project/
[otel-collector-contrib]:
  https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/receiver
