---
title: >
  Kubernetes CPU Metrics in the kubeletstats Receiver: Transition from
  .cpu.utilization to .cpu.usage
linkTitle: kubeletstats Receiver metrics update
author: >
  [Christos Markou](https://github.com/ChrsMark) (Elastic), [Tyler
  Helmuth](https://github.com/TylerHelmuth) (Honeycomb), [Dmitrii
  Anoshin](https://github.com/dmitryax) (Cisco/Splunk)
date: 2025-05-30
issue: https://github.com/open-telemetry/opentelemetry.io/issues/6847
cSpell:ignore: Anoshin Dmitrii Helmuth Kubelet kubeletstats Kubelet’s Markou
---

The OpenTelemetry Collector’s
[`kubeletstats`](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/v0.127.0/receiver/kubeletstatsreceiver/README.md)
receiver is a crucial component for collecting Kubernetes node, pod and
container metrics. To improve metric accuracy and adhere to
[OpenTelemetry semantic conventions](/docs/specs/semconv/general/naming/#instrument-naming),
we are updating how CPU metrics are named and emitted.

This blog post explains the motivation behind this change, the impact on users,
the role of the feature gate which was introduced for this change, and guidance
on migrating.

## Why This Change?

Historically, the
[`kubeletstats`](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/v0.127.0/receiver/kubeletstatsreceiver/README.md)
receiver emitted CPU metrics labeled with `.cpu.utilization`, such as:

- [`k8s.node.cpu.utilization`](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/v0.127.0/receiver/kubeletstatsreceiver/documentation.md#k8snodecpuutilization)
- [`k8s.pod.cpu.utilization`](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/v0.127.0/receiver/kubeletstatsreceiver/documentation.md#k8spodcpuutilization)
- [`container.cpu.utilization`](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/v0.127.0/receiver/kubeletstatsreceiver/documentation.md#containercpuutilization)

These metrics actually represent
[**raw CPU usage in cores**](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/v0.127.0/receiver/kubeletstatsreceiver/internal/kubelet/cpu.go#L25-L26),
derived from the Kubernetes Kubelet’s
[`UsageNanoCores`](https://github.com/kubernetes/kubernetes/blob/8adc0f041b8e7ad1d30e29cc59c6ae7a15e19828/staging/src/k8s.io/kubelet/pkg/apis/stats/v1alpha1/types.go#L230-L233)
field, which is an absolute measure of CPU usage (in units of nanocores).

The term _utilization_ generally refers to a relative metric, typically
expressed as a ratio or percentage of used CPU against total CPU capacity or
limits. Using `.cpu.utilization` for absolute usage values violates
[Semantic Conventions](/docs/specs/semconv/general/naming/#instrument-naming),
potentially confusing users and tooling expecting utilization metrics to be
relative.

## What Is Changing?

To address this semantic mismatch, we introduced new `.cpu.usage` metrics that
correctly represent raw CPU usage values:

- [`k8s.node.cpu.usage`](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/v0.127.0/receiver/kubeletstatsreceiver/documentation.md#k8snodecpuusage)
- [`k8s.pod.cpu.usage`](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/v0.127.0/receiver/kubeletstatsreceiver/documentation.md#k8spodcpuusage)
- [`container.cpu.usage`](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/v0.127.0/receiver/kubeletstatsreceiver/documentation.md#containercpuusage)

At the same time, the legacy `.cpu.utilization` metrics have been
[**marked for deprecation**](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/v0.127.0/receiver/kubeletstatsreceiver/README.md#metrics-deprecation).

## Feature Gate: `receiver.kubeletstats.enableCPUUsageMetrics`

Note that the `.cpu.utilization` metrics were enabled by default so far. To
manage the transition smoothly, a **feature gate** named
`receiver.kubeletstats.enableCPUUsageMetrics`
[was introduced](https://github.com/open-telemetry/opentelemetry-collector-contrib/pull/35139):

- **Alpha
  ([v0.111.0](https://github.com/open-telemetry/opentelemetry-collector-contrib/releases/tag/v0.111.0)):**
  The feature gate was introduced but disabled by default. Users needed to
  explicitly enable it to receive `.cpu.usage` metrics instead of
  `.cpu.utilization` by default.
- **Beta
  ([v0.125.0](https://github.com/open-telemetry/opentelemetry-collector-contrib/releases/tag/v0.125.0)):**
  The feature gate
  [was promoted to beta](https://github.com/open-telemetry/opentelemetry-collector-contrib/pull/39488)
  and **enabled by default**. In this state:
  - The `.cpu.usage` metrics are emitted by default. - Attempts to enable
    `.cpu.utilization` metrics will fail.
  - Users can **explicitly disable the feature gate** to temporarily restore the
    deprecated `.cpu.utilization` metrics if needed.
- **Stable (Upcoming):** The feature gate will remain in beta for several
  releases to allow the community ample time to adapt. The plan and discussion
  for moving it to stable is tracked in
  [Issue #39650](https://github.com/open-telemetry/opentelemetry-collector-contrib/issues/39650).

## What Does This Mean for You?

### Impact on Existing Users

- If you upgrade to **v0.125.0 or later**, the Collector will emit `.cpu.usage`
  metrics by default.
- Any monitoring dashboards, alerting rules, or queries relying on
  `.cpu.utilization` metrics will **break or not function as expected**.
- The deprecated `.cpu.utilization` metrics are planned for eventual removal, so
  updating is necessary for long-term compatibility.

### Recommended Actions

1. **Audit your observability pipelines** for references to `.cpu.utilization`
   metrics.
2. **Update dashboards, alerts, and queries** to use the new `.cpu.usage`
   metrics.
3. **Test the new metrics** by enabling the feature gate in staging (or rely on
   the default enabled state in v0.125.0+).
4. **Plan your migration timeline** considering that `.cpu.utilization` will be
   removed in future releases.
5. **Stay engaged** with the OpenTelemetry community via
   [GitHub issues](https://github.com/open-telemetry/opentelemetry-collector-contrib/issues/27885)
   and PR discussions.

## Why Keep the Feature Gate in Beta?

The decision to keep the feature gate in beta for multiple releases is driven
by:

- The **critical nature** of kubeletstats CPU metrics for many production
  observability pipelines.
- The need to **allow users and vendors ample time** to adapt and update their
  tooling.
- The opportunity to **gather feedback** and address any unexpected issues
  before the change becomes permanent.

This approach minimizes disruption and helps ensure a smooth transition for
everyone.

## Useful Links and References

- [Issue #27885 - Semantic update for kubeletstats CPU metrics](https://github.com/open-telemetry/opentelemetry-collector-contrib/issues/27885)
- [PR #35139 - Introduce `.cpu.usage` metrics and feature gate (alpha)](https://github.com/open-telemetry/opentelemetry-collector-contrib/pull/35139)
- [PR #39488 - Promote feature gate to beta and enable by default](https://github.com/open-telemetry/opentelemetry-collector-contrib/pull/39488)
- [Issue #39650 - Plan to move feature gate to stable](https://github.com/open-telemetry/opentelemetry-collector-contrib/issues/39650)
- [OpenTelemetry Metrics Semantic Conventions](/docs/specs/semconv/general/metrics/)
- [Kubernetes Kubelet Stats API](https://pkg.go.dev/k8s.io/kubernetes@v1.19.16/pkg/kubelet/apis/stats/v1alpha1)

## Final Thoughts

The transition from `.cpu.utilization` to `.cpu.usage` metrics in the
`kubeletstats` receiver is an important step to ensure that Kubernetes metrics
conform to semantic best practices. We appreciate the community’s patience and
collaboration as we make these improvements.

If you have questions, want to share feedback, or need help migrating, please
join us on the [CNCF Slack](https://slack.cncf.io/).

Thank you for helping us build clearer, more reliable Kubernetes observability!
