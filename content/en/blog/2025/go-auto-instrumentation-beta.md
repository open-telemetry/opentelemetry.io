---
title: >-
  Announcing the Beta Release of OpenTelemetry Go Auto-Instrumentation using
  eBPF
linkTitle: Go Auto-Instrumentation Beta
date: 2025-01-30
author: >-
  [Tyler Yahn](https://github.com/MrAlias) (Splunk), [Mike
  Dame](https://github.com/damemi) (Odigos)
sig: SIG Go Auto-Instrumentation
cSpell:ignore: Beyla Odigos rolldice Yahn
---

The OpenTelemetry community is excited to announce the beta release of the
[OpenTelemetry Go Auto-Instrumentation project](https://github.com/open-telemetry/opentelemetry-go-instrumentation)!
This milestone brings us closer to our mission of making observability simple,
accessible, and effective for Go applications.

## What is Go Auto-Instrumentation?

OpenTelemetry Go Auto-Instrumentation allows developers to collect traces from
their Go applications without requiring manual code modifications or rebuilding
binaries. By dynamically instrumenting applications at runtime using
[eBPF](https://ebpf.io/), this project lowers the barrier to adopting
observability best practices and provides deep insights into your application's
behavior.

## Key features of the beta release

The beta release offers foundational support for automatic instrumentation with
these key features:

- **HTTP server instrumentation**: Automatically trace incoming and outgoing
  HTTP requests with trace context propagation when using the
  [`net/http` package](https://pkg.go.dev/net/http).
- **Database instrumentation**: Instrument database queries and connections that
  use the [`database/sql` package](https://pkg.go.dev/database/sql).
- **gRPC instrumentation**: Easily collect telemetry data from
  [gRPC clients and servers](https://pkg.go.dev/google.golang.org/grpc).
- **Kafka-go instrumentation**: Monitor and trace Kafka messaging using the
  [`kafka-go` package](https://pkg.go.dev/github.com/segmentio/kafka-go).
- **Extensible with OpenTelemetry’s Trace API**: Seamlessly extend
  auto-instrumentation with custom spans using the
  [OpenTelemetry Go Trace API](https://pkg.go.dev/go.opentelemetry.io/otel).
- **Configuration using environment variables**: Simplify configuration with
  environment-based settings, reducing the need for code changes.
- **Semantic convention compliance**: Produced telemetry complies with the
  latest OpenTelemetry semantic conventions ensuring compatibility with the OTel
  ecosystem.

## Getting started

Getting started with OpenTelemetry Go Auto-Instrumentation is straightforward!
For detailed instructions on installation, configuration, and running your
application with auto-instrumentation, check out the
[Getting Started guide](https://github.com/open-telemetry/opentelemetry-go-instrumentation/blob/main/docs/getting-started.md).

To see a complete example, check out the
[`rolldice` application](https://github.com/open-telemetry/opentelemetry-go-instrumentation/tree/0ebb7f21116bfdd8e29c315efdbf359cd74bddac/examples/rolldice).

## The road to stabilization

With the beta release now available, the project team is focused on preparing
for a stable release. Over the coming year, we’ll concentrate on achieving the
following goals:

1. **Optimize runtime instrumentation with eBPF**

   We will continue to leverage and improve eBPF for dynamic runtime
   instrumentation, ensuring that Go applications have reliable, low-overhead
   observability. This includes staying up to date with the latest developments
   in both the Go and eBPF ecosystems.

2. **Expand ecosystem support**

   While the beta release supports a limited number of Go packages and only a
   single telemetry processing pipeline, we plan to broaden this support. We’ll
   introduce instrumentation for additional Go packages and allow users to
   create custom telemetry processing pipelines. This expansion will make it
   easier to integrate with popular Go packages and provide flexibility for
   custom instrumentation.

3. **Integrate with Beyla’s donation to OpenTelemetry**

   The proposed
   [donation of Beyla to OpenTelemetry](https://github.com/open-telemetry/community/issues/2406)
   presents an opportunity to enhance OpenTelemetry’s eBPF-based
   auto-instrumentation capabilities. If accepted, this donation will help
   expand support for additional signals, protocols, and languages, creating a
   more comprehensive eBPF-based observability solution. OpenTelemetry Go
   Auto-Instrumentation will evolve alongside these developments, ensuring
   seamless collaboration while continuing to provide robust tracing for Go
   applications.

Keep track of our progress in the
[2025 Goals tracking issue](https://github.com/open-telemetry/opentelemetry-go-instrumentation/issues/1659).

## Join the journey

As with all OpenTelemetry projects, the success of Go Auto-Instrumentation
depends on the community. Whether you’re a developer interested in contributing,
a company looking to adopt the project, or simply curious about observability,
we’d love for you to join us.

Here’s how you can get involved:

- **Try the beta**: Integrate the project into your applications and
  [provide feedback](https://github.com/open-telemetry/opentelemetry-go-instrumentation/discussions/1697).
- **Contribute**: Check out
  [open issues](https://github.com/open-telemetry/opentelemetry-go-instrumentation/issues)
  and
  [contribute](https://github.com/open-telemetry/opentelemetry-go-instrumentation/blob/0ebb7f21116bfdd8e29c315efdbf359cd74bddac/CONTRIBUTING.md)
  to the project on
  [GitHub](https://github.com/open-telemetry/opentelemetry-go-instrumentation).
- **Join the discussion**: Participate in our
  [SIG meetings](https://groups.google.com/a/opentelemetry.io/g/calendar-go) and
  discussions on [Slack](https://cloud-native.slack.com/archives/C03S01YSAS0).

## Acknowledgments

This beta release is the result of countless hours of work by contributors from
around the world. Thank you to everyone who has contributed code, documentation,
feedback, and enthusiasm to make this milestone possible.
