---
title:
  Kubernetes attributes promoted to release candidate in OTel Semantic
  Conventions
linkTitle: Kubernetes SemConv RC
date: 2026-03-18
author: >-
  [Christos Markou](https://github.com/ChrsMark)(Elastic) [David
  Ashpole](https://github.com/dashpole)(Google)
cSpell:ignore: Ashpole Markou resourcedetection sattributes
---

## Prior art

Last October, the K8s SemConv SIG
[completed](https://github.com/open-telemetry/semantic-conventions/issues/1032#issuecomment-3401648352)
the first target of the group's goals: to define as Semantic Conventions the
K8s-related metrics that the OpenTelemetry Collector already had in place, i.e.,
`k8s.pod.cpu.time`, etc.

## KubeCon NA 2025

During last KubeCon NA in November 2025, the group met in person and discussed
the SIG's next plans. The proposal was to focus on K8s attributes' stability and
leave metrics as a secondary priority. The main reason for this was to work in
alignment with the recently set
[Collector SIG's goals](https://github.com/open-telemetry/opentelemetry-collector-contrib/issues/44130),
one of which was to stabilize the `k8sattributes` processor component, a
component that heavily relies on the K8s attributes Semantic Conventions. In
this context, having stable K8s attributes as Semantic Conventions would greatly
benefit the `k8sattributes` processor's stability progress.

## Alignment with Collector SIG

From this discussion, the decision was made, and the plan for the following
months was set, as described at
[this link](https://github.com/open-telemetry/semantic-conventions/issues/3119).
The plan was indeed to focus on attributes' stability in alignment with the
Collector's SIG priorities and after that to focus K8s metrics' stability
accordingly.

## Recent accomplishments

Consequently, for the past few months, the group has focused on the stability of
the K8s attributes Semantic Conventions, specifically those already used by the
OpenTelemetry Collector Contrib components that are targeting stability (i.e.,
`k8sattributes` processor, `resourcedetection` processor, etc.). The respective
issue
([issue 3120](https://github.com/open-telemetry/semantic-conventions/issues/3120))
tracks this work, and the K8s SemConv SIG is happy to share that
[the K8s attributes are now at the release candidate stability level](https://github.com/open-telemetry/semantic-conventions/pull/3491).

## Next steps

Next, once Semantic Conventions are released, the `k8sattributes` processor will
be updated accordingly to use the latest `release_candidate` K8s Semantic
Conventions behind the respective feature gates, following the Collector's
[guidelines](https://github.com/open-telemetry/opentelemetry-collector/blob/v0.147.0/docs/rfcs/semconv-feature-gates.md#proposed-mechanism).
This will allow users to optionally switch to the new schema using the feature
gates, enabling the community to provide feedback before the K8s attributes
Semantic Conventions are promoted to `stable`.
During that period, the K8s SemConv SIG will be accepting feedback while also
working on K8s metrics' and entities' stability.

## Call for feedback

So, if you are using or relying on K8s Semantic Conventions, now is the time to
provide your feedback while these are still at the `release_candidate` stability
level. Feel free to reach out in CNCF Slack in the
[#otel-k8s-semconv-sig](https://cloud-native.slack.com/archives/C07Q1L0FGKX)
channel or join one of the
[K8s SemConv SIG](https://github.com/open-telemetry/community/blob/184336e3d39010eb22496d97a01cc2120763c929/projects/k8s-semconv.md)
meetings directly. We would love to hear from you!
