---
title: The OpenTelemetry Demo Turns 1(.4)
linkTitle: OTel Demo Updates
date: 2023-04-18
author: '[Carter Socha](https://github.com/cartersocha) (Lightstep)'
---

![The OTel Demo turns 1.4](demo-birthday-3.png 'The OTel Demo turns 1.4')

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
- **Async support using Kafka and the new Fraud Detection (Kotlin) / Accounting
  (Go) services**
- _Kubernetes manifest to enable Kubernetes deployment without using requiring
  Helm_
- **More out of the box dashboards like our
  [Collector Data Flow Dashboard](https://opentelemetry.io/docs/demo/collector-data-flow-dashboard/)**
- **A myriad of frontend bug fixes**
- _Our first
  [Connector](https://github.com/open-telemetry/opentelemetry-collector/blob/main/connector/README.md)
  in the Collector to demonstrate how telemetry pipelines can be linked_
- **New OTel SDKs like the Java logging SDK and JavaScript / Go Metric SDK**
- _New manual metric instruments in the Ad, Currency, Product Catalog services_
- **PHP no-code change auto-instrumentation**
- _Browser and compute resource detectors that enrich our data with
  infrastructure information_
- **More
  [feature flag scenarios](https://opentelemetry.io/docs/demo/feature-flags/)
  like generating a failure for every 10th Ad shown**
- _General stability improvements to fix service restarts_

For detailed changes, check out our in depth
[release notes](https://github.com/open-telemetry/opentelemetry-demo/releases)
or
[changelog](https://github.com/open-telemetry/opentelemetry-demo/blob/main/CHANGELOG.md).

### Get Involved

Our contributors are essential to all of this and the project team can't thank
them enough. New development is constantly ongoing as we add new capabilities
and the community's tools evolve. If you'd like to help, check out our
[contributing guidance](https://github.com/open-telemetry/opentelemetry-demo/blob/main/CONTRIBUTING.md)
or join our
[Slack channel](https://cloud-native.slack.com/archives/C03B4CWV4DA).
