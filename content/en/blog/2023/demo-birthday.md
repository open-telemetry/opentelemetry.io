---
title: The OpenTelemetry Demo Turns 1(.4)
linkTitle: OTel Demo Updates
date: 2023-04-16
author: '[Carter Socha](https://github.com/cartersocha) (Lightstep)'
---

It's hard to believe as we prepare our 1.4.0 release but the
[OpenTelemetry demo](https://opentelemetry.io/docs/demo/) is turning 1 year old
and it's been 6 months since we declared general availability with our
[1.0.0 release](https://opentelemetry.io/blog/2022/announcing-opentelemetry-demo-release/).

### Project Milestones

The demo has achieved remarkable milestones in its first year, with more than
**70 contributors, 20 official vendor forks, 780 Github stars, and 180K Docker
pulls**. The project team has been hard at work adding new capabilities and
improving on existing ones with more than _460 merged PRs, 5 re-written services
in new languages, and 7 brand new components / services_.

Time flies when you're stabilizing semantic conventions. But what's actually
changed between our 1.0.0 and 1.4.0 releases? Quite a lot actually.

### The Highlights

- **2x build time improvements despite adding additional services**
- _Support added for arm64 architectures (M1 and M2 Macs)_
- **Async support using Kafka and 2 new services**
- _Kubernetes manifest_
- **More out of the box dashboards**
- _Our first logging SDK addition_
- **A myriad of frontend bug fixes**
- _First
  [Connector](https://github.com/open-telemetry/opentelemetry-collector/blob/main/connector/README.md)
  in the Collector_
- **New metric SDKs**
- _New manual metric instruments_
- **More auto-instrumentation in more languages**
- _Browser and compute resource detectors_
- **More feature flag scenarios**
- _General stability improvements to fix service restarts_

For detailed changes, check out our in depth
[release notes](https://github.com/open-telemetry/opentelemetry-demo/releases)
or
[changelog](https://github.com/open-telemetry/opentelemetry-demo/blob/main/CHANGELOG.md).

Our contributors are essential to all of this and the project team can't thank
them enough. New development is constantly ongoing as we add new capabilities
and the community's tools evolve. If you'd like to help, check out our
[contributing guidance](https://github.com/open-telemetry/opentelemetry-demo/blob/main/CONTRIBUTING.md)
or join our
[Slack channel](https://cloud-native.slack.com/archives/C03B4CWV4DA).
