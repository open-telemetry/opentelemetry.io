---
title: Kubernetes attributes processor reaches v1.0.0 milestone
linkTitle: Kubernetes Processor v1
date: 2026-09-16
author: >-
  [Christos Markou](https://github.com/ChrsMark)(Elastic), [Pablo
  Baeyens](https://github.com/mx-psi/)(Datadog)
cSpell:ignore: Baeyens Markou
---

The
[Kubernetes attributes processor](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/42e6adb99d409af1935536652e633d49c98e77cd/processor/k8sattributesprocessor#kubernetes-attributes-processor),
which enriches your telemetry with Kubernetes metadata, has officially moved to
v1.0.0! You can try it out on your custom distro, and it is also available as
part of the latest opentelemetry-collector-contrib and
opentelemetry-collector-k8s distro releases.

Being v1.0.0 means the component now is verified to fulfill the
['stable' stability criteria](https://github.com/open-telemetry/opentelemetry-collector/blob/7d1c25d46b14cce04a820d92a4ce462bf7a04b0b/docs/component-stability.md#stable)
including requirements around testing, benchmarking, documentation and telemetry
stability. It also ensures you can redistribute it as a Go library or as part of
your binaries without API breakage.

Read the
[migration guide](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/42e6adb99d409af1935536652e633d49c98e77cd/processor/k8sattributesprocessor#semantic-conventions-compatibility)
to understand what changes this comes with and how you can manage the transition
period.

## How we got here and what comes next

Since late 2025, the OpenTelemetry Collector SIG has been working on the
[stability of several components](https://github.com/open-telemetry/opentelemetry-collector-contrib/issues/44130)
as part of the
[“Stable by Default”](/blog/2025/stability-proposal-announcement/) efforts of
the OpenTelemetry project. These efforts continue and supplement the
[existing efforts](https://github.com/open-telemetry/opentelemetry-collector/issues/9375)
to provide Collector library framework stability and produce a v1 Collector
distro.

Thanks to end user feedback on
[Collector surveys](/blog/2026/otel-collector-follow-up-survey-analysis/), we
know the most used components as well as how stability and reliability are some
of the top priorities for our users. This clarified what components to focus on
as well as the roadmap to stability, which focuses on
[a strict set of criteria](https://github.com/open-telemetry/opentelemetry-collector/blob/7d1c25d46b14cce04a820d92a4ce462bf7a04b0b/docs/component-stability.md#stable)
that aims to meet their expectations.

Fulfilling these criteria is no small effort: stabilizing a component also
involves stabilizing the respective Semantic Conventions and parts of the
specification it relies on, so the Collector SIG is collaborating closely with
other SIGs like the K8s Semantic Conventions SIG, the System Semantic
Conventions SIG and the Prometheus Interoperability SIG.

The K8s Semantic Conventions SIG
[spotted this dependency early on](/blog/2026/k8s-semconv-rc/) and in November
2025 the K8s started
[the focused work to stabilize](https://github.com/open-telemetry/semantic-conventions/issues/3120)
the respective K8s Semantic Conventions. In March 2026 these Semantic
Conventions reached the Release Candidate state and in June 2026
[they shipped as stable in Semantic Conventions v1.42.0](https://github.com/open-telemetry/semantic-conventions/releases/tag/v1.42.0).

This allowed the Kubernetes attributes processor to enrich the telemetry with
stable K8s attributes, ensuring the component's telemetry remains stable going
forward. Along with the
[long running work](https://github.com/open-telemetry/opentelemetry-collector-contrib/issues/44483)
to make the component meet the stability requirements, the component
[went through the graduation process](https://github.com/open-telemetry/opentelemetry-collector-contrib/issues/49274).
After several weeks of communications and endorsements from end users that use
this component already in production and vendors that redistribute it, the
component was accepted for v1.0.0.

The final PR that applies the required changes to move to the new semantic
conventions names as well as several other promotion related changes
[went through review right after](https://github.com/open-telemetry/opentelemetry-collector-contrib/pull/49152).
As mentioned at the beginning, this means some breakage for existing processor
users, for which we have written a
[summary of the changes and migration guide](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/42e6adb99d409af1935536652e633d49c98e77cd/processor/k8sattributesprocessor#semantic-conventions-compatibility)
to help with updates.

This milestone paves the way for more components to follow and more help from
the community will be much appreciated. If you want to help the OpenTelemetry
Collector move towards its more stable future, there's still
[a lot to do](https://github.com/open-telemetry/opentelemetry-collector-contrib/issues/44130).
Join us with your feedback and thoughts, or ask the maintainers how you could help in
more direct ways.
