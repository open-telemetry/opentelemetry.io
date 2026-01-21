---
title: OpenTelemetry eBPF Instrumentation 2026 Goals
linkTitle: OBI 2026 Goals
date: 2026-01-23
author: >-
  [Tyler Yahn](https://github.com/MrAlias) (Splunk)
sig: SIG eBPF Instrumentation
cSpell:ignore: AMQP grcevski marctc MQTT NATS NimrodAvni rafaelroquetto Yahn
---

As we kick off 2026, the
[OpenTelemetry eBPF Instrumentation](/docs/zero-code/obi/) SIG has come together
to set an ambitious roadmap for the year. Our focus is on achieving production
readiness with a stable 1.0 release while expanding protocol and language
support to serve a broader range of use cases. We're also strengthening
integration with OpenTelemetry APIs and SDKs to support hybrid instrumentation
approaches. For those new to OBI, check out the documentation link above to
learn more about zero-code observability using eBPF.

## Goals

Here's an overview of our priorities for 2026 and the key contributors
supporting each initiative.

### Stable 1.0 Release

- Tracking Issue:
  [#1133](https://github.com/open-telemetry/opentelemetry-ebpf-instrumentation/issues/1133)
- Sponsor: [@MrAlias](https://github.com/MrAlias)

Achieving a stable 1.0 release is our flagship goal for 2026. This milestone
represents OBI's readiness for production deployments and serves as the
foundation for all other initiatives. The path to 1.0 focuses on three critical
areas: comprehensive documentation, configuration standardization, and
production-readiness validation.

We're building out complete documentation for all configuration options,
including JSON Schema definitions that enable validation and autocomplete in
modern editors. As the OpenTelemetry community stabilizes
[declarative configuration standards](https://github.com/orgs/open-telemetry/projects/38),
OBI will adopt these standards to ensure consistent configuration across the
entire OpenTelemetry ecosystem. This includes support for per-service and
per-process configuration, allowing fine-grained control over telemetry
collection in complex environments.

The 1.0 release also includes adopting telemetry schemas, comprehensive
versioning documentation, and achieving our targeted test coverage thresholds.
These investments ensure OBI can be confidently deployed in production
environments where reliability and stability are paramount.

### Expanding Protocol Support

- Tracking Issue:
  [#1134](https://github.com/open-telemetry/opentelemetry-ebpf-instrumentation/issues/1134)
- Sponsors: [@marctc](https://github.com/marctc),
  [@NimrodAvni78](https://github.com/NimrodAvni78)

While OBI currently supports HTTP, gRPC, and SQL protocols, modern applications
rely on a diverse ecosystem of communication patterns. This goal expands OBI's
protocol coverage to include messaging systems, NoSQL databases, and cloud
service SDKs.

For messaging systems, we're adding support for MQTT, AMQP, NATS, and Redis
pub/sub, enabling observability for event-driven architectures and microservices
that communicate asynchronously. On the database side, we're extending support
for MongoDB, including compression and support for legacy versions. We're also
enhancing gRPC instrumentation with full context propagation support.

Perhaps most significantly, we're working on instrumenting cloud service SDKs
for Google Cloud, AWS, and Azure. This will provide visibility into cloud API
calls, helping teams understand their applications' interactions with cloud
infrastructure and identify performance bottlenecks in distributed cloud native
systems.

### Supporting .NET

- Tracking Issue:
  [#1136](https://github.com/open-telemetry/opentelemetry-ebpf-instrumentation/issues/1136)
- Sponsor: [@rafaelroquetto](https://github.com/rafaelroquetto)

.NET represents one of the last major language ecosystems OBI needs to fully
support. Early testing shows promising results with .NET 9 and later versions,
and we're focused on expanding and validating this support across the .NET
ecosystem.

Our work includes determining the supported version range—both modern .NET
(versions 8+) and .NET Framework (versions 4.x and 3.5 SP1)—and ensuring context
propagation works reliably across all supported versions. We're building
comprehensive integration tests to validate distributed tracing and RED metrics
(Rate, Errors, Duration) collection, ensuring .NET applications receive the same
level of observability as other supported languages.

This expansion is particularly important for enterprises with significant .NET
investments, providing them with zero-code observability that integrates
seamlessly with their existing OpenTelemetry infrastructure.

### Hybrid Instrumentation with OTel APIs/SDKs

- Tracking Issue:
  [#1140](https://github.com/open-telemetry/opentelemetry-ebpf-instrumentation/issues/1140)
- Sponsor: [@grcevski](https://github.com/grcevski)

Many organizations are adopting a hybrid approach to instrumentation, combining
zero-code eBPF instrumentation with manual instrumentation using OpenTelemetry
APIs and SDKs. This goal ensures these approaches work together seamlessly,
providing added value rather than conflicts or duplicate telemetry.

We're developing capabilities for OBI to wrap SDK-generated traces, ensuring
request timing information remains accurate regardless of instrumentation
source. We're also working on consistent labeling between OBI and SDK telemetry,
metric exemplars that reference trace information from either source, and the
ability to combine manual instrumentation with auto-instrumentation across all
supported languages (building on what's already available for Go).

This hybrid approach is particularly valuable in gradually adopting
observability: teams can start with zero-code eBPF instrumentation for immediate
visibility, then add manual instrumentation for business-specific insights
without needing to choose one approach over the other.

### Additional Focus Areas

Beyond these four major goals, we're also prioritizing several supporting
initiatives that strengthen OBI's integration with the broader OpenTelemetry
ecosystem. We're aligning network attributes with
[OpenTelemetry semantic conventions](https://github.com/open-telemetry/opentelemetry-ebpf-instrumentation/issues/1092)
and updating all semantic convention usage to the
[latest versions](https://github.com/open-telemetry/opentelemetry-ebpf-instrumentation/issues/1135).
We're also building an
[OpenTelemetry Collector distribution](https://github.com/open-telemetry/opentelemetry-ebpf-instrumentation/issues/1157)
with OBI as a receiver, integrating with the
[OpenTelemetry eBPF profiler](https://github.com/open-telemetry/opentelemetry-ebpf-instrumentation/issues/1137)
for unified observability, and providing
[runtime metrics](https://github.com/open-telemetry/opentelemetry-ebpf-instrumentation/issues/1139)
directly from OBI. For the complete list of 2026 goals, check out our
[full roadmap](https://github.com/open-telemetry/opentelemetry-ebpf-instrumentation/issues?q=is%3Aissue+is%3Aopen+label%3A%22goal%3A+2026%22).

## Join the Conversation

These goals represent our priorities based on community feedback and project
maturity. We'd love to hear whether these areas address your use cases or if you
see gaps we should consider. Your input helps shape OBI's development and
ensures we're building features that matter most to real-world deployments.

Here's how you can get involved:

- **Track progress**: Follow our
  [2026 roadmap project board](https://github.com/orgs/open-telemetry/projects/187/views/1)
  to see what we're working on
- **Share feedback**: Comment on the
  [epic issues](https://github.com/open-telemetry/opentelemetry-ebpf-instrumentation/issues?q=is%3Aissue%20is%3Aopen%20label%3A%22goal%3A%202026%22%20label%3Aepic)
  or any 2026 goal with your questions, suggestions, or use cases
- **Join discussions**: Participate in our
  [weekly SIG meetings](https://github.com/open-telemetry/community?tab=readme-ov-file#sig-ebpf-instrumentation),
  connect with us on the
  [#otel-ebpf-instrumentation](https://cloud-native.slack.com/archives/C06DQ7S2YEP)
  channel on [CNCF Slack](https://slack.cncf.io), or
  [open a discussion](https://github.com/open-telemetry/opentelemetry-ebpf-instrumentation/discussions)
- **Contribute**: Check out
  [open issues](https://github.com/open-telemetry/opentelemetry-ebpf-instrumentation/issues)
  and help build the future of zero-code observability

## Acknowledgments

OBI's progress toward production readiness is the result of collaboration across
a global, multi-vendor community of contributors. Thank you to everyone who has
contributed code, documentation, testing, feedback, and enthusiasm to make this
project possible. We're excited to work with the community to achieve these
goals and bring production-ready zero-code observability to the OpenTelemetry
ecosystem!
