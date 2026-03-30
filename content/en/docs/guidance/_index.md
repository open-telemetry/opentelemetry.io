---
title: Guidance & Architecture
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

- Blueprints are living documents that solve common adoption and implementation
  challenges in a given environment. Each blueprint is tightly scoped to address
  specific challenges, so you might need to refer to multiple blueprints,
  depending on your environment.
- Reference implementations are snapshots in time that show how different
  institutions, with different organizational structures and technology stacks,
  approach OpenTelemetry adoption.

<!-- If your organization has implemented OpenTelemetry and you think others could benefit from your experience, you can propose a new reference implementation by raising an issue in the End User SIG repository. To request a new blueprint for an environment or challenge not already covered, raise an issue using the Blueprints template. TODO: add links to issue template, if possible -->
