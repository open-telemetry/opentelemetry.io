---
title: Announcing the Beta Release of OpenTelemetry Go Auto-Instrumentation
linkTitle: Go Auto-Instrumentation Beta
date: 2025-01-29
# prettier-ignore
author: >-
  [Tyler Yahn](https://github.com/MrAlias) (Splunk)
  [Mike Dame](https://github.com/damemi) (Odigos)
sig: SIG Go Auto-Instrumentation
# prettier-ignore
cSpell:ignore: Yahn Odigos rolldice Beyla's Beyla
---

The OpenTelemetry community is excited to announce the beta release of the
OpenTelemetry Go Auto-Instrumentation project! This milestone brings us closer
to our mission of making observability simple, accessible, and effective for Go
applications.

## What is Go Auto-Instrumentation?

OpenTelemetry Go Auto-Instrumentation allows developers to collect traces from
their Go applications without requiring manual code modifications. By
dynamically instrumenting applications at runtime using
[eBPF](https://ebpf.io/), this project lowers the barrier to adopting
observability best practices and provides deep insights into your application's
behavior.

## Key Features of the Beta Release

The beta release offers foundational support for automatic instrumentation with
these key features:

- **HTTP Server Instrumentation**: Automatically trace incoming and outgoing
  HTTP requests, with trace context propagation when using the
  [`net/http` package](https://pkg.go.dev/net/http).
- **Database Instrumentation**: Instrument database queries and connections that
  use the [`database/sql` package](https://pkg.go.dev/database/sql).
- **gRPC Instrumentation**: Easily collect telemetry data from
  [gRPC clients and servers](https://pkg.go.dev/google.golang.org/grpc).
- **Kafka-go Instrumentation**: Monitor and trace Kafka messaging using the
  [`kafka-go` package](https://pkg.go.dev/github.com/segmentio/kafka-go).
- **Extensible with OpenTelemetry’s Trace API**: Seamlessly extend
  auto-instrumentation with custom spans via the
  [OpenTelemetry Go Trace API](https://pkg.go.dev/go.opentelemetry.io/otel).
- **Configuration via Environment Variables**: Simplify configuration with
  environment-based settings, reducing the need for code changes.
- **Semantic Convention Compliance**: Produced telemetry complies with the
  latest OpenTelemetry semantic conventions ensuring compatibility with the OTel
  ecosystem.

## Getting Started

Getting started with OpenTelemetry Go Auto-Instrumentation is straightforward!
For detailed instructions on installation, configuration, and running your
application with auto-instrumentation, check out the
[Getting Started guide](https://github.com/open-telemetry/opentelemetry-go-instrumentation/blob/main/docs/getting-started.md).

To see a complete example, check out the
[`rolldice` application](https://github.com/open-telemetry/opentelemetry-go-instrumentation/tree/0ebb7f21116bfdd8e29c315efdbf359cd74bddac/examples/rolldice).

## The Road to Stabilization

With the beta release now available, the project team is focused on preparing
for a stable release. Over the coming year, we’ll concentrate on achieving the
following goals:

1. **Optimize Runtime Instrumentation with eBPF**

   We will continue to leverage and improve eBPF for dynamic runtime
   instrumentation, ensuring that Go applications have reliable, low-overhead
   observability. This includes staying up to date with the latest developments
   in both the Go and eBPF ecosystems.

2. **Expand Ecosystem Support**

   While the beta release supports a limited number of Go packages and only a
   single telemetry processing pipeline, we plan to broaden this support. We’ll
   introduce instrumentation for additional Go packages and allow users to
   create custom telemetry processing pipelines. This expansion will make it
   easier to integrate with popular Go packages and provide flexibility for
   custom instrumentation.

3. **Integrate with Beyla’s Donation to OpenTelemetry**

   The
   [donation of Beyla to OpenTelemetry](https://github.com/open-telemetry/community/issues/2406)
   brings the opportunity to unify and enhance OpenTelemetry's eBPF
   auto-instrumentation offerings. As an eBPF-based tool for both traces and
   metrics, this donation will help provide instrumentation for more signals,
   protocols, and languages in open source. And because the Go instrumentation
   in Beyla is already based on the OpenTelemetry Go Auto-Instrumentation
   libraries, we plan to merge the projects – and their development teams –
   under the OpenTelemetry community organization.

   The integration of Beyla will significantly enhance auto-instrumentation for
   Go!

Keep track of our progress in the
[2025 Goals tracking issue](https://github.com/open-telemetry/opentelemetry-go-instrumentation/issues/1659).

## Join the Journey

As with all OpenTelemetry projects, the success of Go Auto-Instrumentation
depends on the community. Whether you’re a developer interested in contributing,
a company looking to adopt the project, or simply curious about observability,
we’d love for you to join us.

Here’s how you can get involved:

- **Try the Beta**: Integrate the project into your applications and
  [provide feedback](https://github.com/open-telemetry/opentelemetry-go-instrumentation/discussions/1697).
- **Contribute**: Check out
  [open issues](https://github.com/open-telemetry/opentelemetry-go-instrumentation/issues)
  and
  [contribute](https://github.com/open-telemetry/opentelemetry-go-instrumentation/blob/0ebb7f21116bfdd8e29c315efdbf359cd74bddac/CONTRIBUTING.md)
  to the project on
  [GitHub](https://github.com/open-telemetry/opentelemetry-go-instrumentation).
- **Join the Discussion**: Participate in our
  [SIG meetings](https://groups.google.com/a/opentelemetry.io/g/calendar-go) and
  discussions on [Slack](https://cloud-native.slack.com/archives/C03S01YSAS0).

## Acknowledgments

This beta release is the result of countless hours of work by contributors from
around the world. Thank you to everyone who has contributed code, documentation,
feedback, and enthusiasm to make this milestone possible.
