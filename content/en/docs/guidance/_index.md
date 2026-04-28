---
title: Blueprints and reference implementations
description:
  Blueprints and sample architectures for best practices when adopting and
  implementing OpenTelemetry in common environments
weight: 600
---

Adopting OpenTelemetry at scale is not just a matter of configuring individual
components. It requires coordinated decisions across teams and systems. The
official project documentation explains how specific pieces of OpenTelemetry
work, but many adopters need help connecting those pieces into a cohesive,
production-ready architecture.

This section provides high-level guidance and architectural patterns for
designing and operating OpenTelemetry in real-world environments. It focuses on
the challenges organizations face and maps these challenges to proven approaches
and best practices you can apply in your own environment.

There is no single “correct” way to deploy OpenTelemetry, so this guidance aims
to address all organizational structures, not to force a specific one. With this
flexibility in mind, you can find two types of reference documents in this
section:

- **Blueprints** are living documents that solve common adoption and
  implementation challenges in a given environment. Each blueprint is tightly
  scoped to address specific challenges, so you might need to refer to multiple
  blueprints, depending on your environment.
- **Reference implementations** are snapshots in time that show how real-world
  organizations use OpenTelemetry to build scalable, resilient pipelines that
  send application telemetry to observability backends.

## How to contribute

If your organization has implemented OpenTelemetry and you think others could
benefit from your experience, or you want to propose a blueprint to share best
practices for adopting OpenTelemetry in a new environment, we want to hear from
you!

You can propose a new blueprint or reference implementation by raising an issue
in the [End User SIG repository](https://github.com/open-telemetry/sig-end-user)
using the following issue templates:

- [Blueprint](https://github.com/open-telemetry/sig-end-user/issues/new?template=blueprint_proposal.yml)
- [Reference Implementation](https://github.com/open-telemetry/sig-end-user/issues/new?template=reference_implementation.yml)

End-User SIG members will guide you through the process, from helping you craft
a high-quality document following our
[standard templates](https://github.com/open-telemetry/sig-end-user/tree/main/architecture),
to ultimately making your contribution to the official documentation.
