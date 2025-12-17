---
title: Announcing the RPC Semantic Conventions stabilization project
linkTitle: Stabilizing RPC Semantic Conventions
date: 2025-06-02
author: >-
  [Liudmila Molkova](https://github.com/lmolkova) (Microsoft), [Trask
  Stalnaker](https://github.com/trask) (Microsoft)
sig: Semantic Conventions
cSpell:ignore: Dubbo Liudmila Molkova
---

The Semantic Conventions SIG is excited to kick off the RPC stabilization
effort!

Following the stabilization of the database conventions in May 2025, we're
continuing our work to stabilize key areas—and RPC is next.

It takes a village to define a solid convention, especially for a space as
diverse as RPC technologies, which include gRPC, JSON-RPC, Apache Dubbo, and
many others. If you work on one of these frameworks, use them extensively, or
are simply interested in learning more, come join us—we’d love your help!

## Towards reliable telemetry conventions

Reliable, well-defined conventions are the runway for richer telemetry
experiences. When signal and attribute names stay consistent, everyone can spend
their time building alerts, dashboards, and visualizations - not firefighting
breaking changes.

Existing experimental conventions have been in use for quite a while, and we
understand that introducing any breaking changes in the corresponding
instrumentations will be disruptive.

We firmly believe that these changes are essential in the long run to deliver
high-quality instrumentation that produces actionable, useful telemetry.

To ensure a smooth transition, we are planning to follow a
[graceful migration plan](https://github.com/open-telemetry/semantic-conventions/blob/v1.34.0/docs/rpc/rpc-spans.md?plain=1#L26-L50).
Instrumentation libraries will:

- Ship the new semantic conventions behind an opt-in flag, side-by-side with the
  existing ones,
- Maintain both versions of conventions for an extended period,
- Provide detailed migration guide.

## How does semantic convention stabilization work?

During the stabilization phase, we review existing conventions to ensure they
offer meaningful insights for most applications using the technology. We check
that the conventions enable generic instrumentation with reasonable performance
overhead, while also accounting for privacy, telemetry volume, consistency, and
correlation with higher-level application and lower-level transport telemetry.

We aim for conventions that are useful, usable, and extensible.

For RPC, we're focusing on the following major areas:

- **Essential signals**: We aim to define a core set of telemetry signals, such
  as client/server spans and call duration histograms, that can be recorded
  consistently across frameworks. These support common debugging workflows and
  RED (rate, errors, duration) metrics. We'll review existing conventions,
  identify core attributes, and document both their generic definitions and
  framework-specific applications.

- **Framework-specific telemetry**: We encourage frameworks to extend the
  generic conventions with additional attributes, spans, or metrics that reflect
  their specific features. We'll review these extensions, including
  community-maintained ones like
  [gRPC metrics](https://grpc.io/docs/guides/opentelemetry-metrics/).

- **Scope**: Bi-directional streaming inherently comes with limited
  observability. We’ll evaluate which useful signals can realistically be
  captured.

- **Consistency and guidelines**: Over the years, we’ve developed better
  practices for naming, and recording peer details or errors. RPC conventions
  will be updated to align with these latest guidelines.

- **Prototyping**: A key requirement for stabilization is having real-world
  instrumentations and prototypes that follow the conventions. These
  implementations provide critical feedback on clarity, feasibility, and
  practical value, and help validate that the approach works across different
  libraries and protocols.

## How to get involved?

We're looking for contributors with experience in any popular RPC frameworks, as
well as anyone interested in building instrumentation prototypes. If you'd like
to participate, please join us by commenting on the
[RPC stabilization project proposal](https://github.com/open-telemetry/community/issues/1859).
