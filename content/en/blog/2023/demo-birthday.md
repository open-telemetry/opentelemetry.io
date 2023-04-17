---
title: The OpenTelemetry Demo Turns 1(.4)
linkTitle: OTel Demo Updates
date: 2023-04-16
author: '[Carter Socha](https://github.com/cartersocha) (Lightstep)'
---

It's hard to believe as we prepare our 1.4.0 release but the [OpenTelemetry
demo](https://opentelemetry.io/docs/demo/) is turning 1 year old and it's been 6
months since we declared general availability with our [1.0.0
release](https://opentelemetry.io/blog/2022/announcing-opentelemetry-demo-release/).

Over the past year, the demo project has gained more than 70 individual
contributors, 180K docker pulls, 20 official [vendor
forks](https://opentelemetry.io/docs/demo/forking/), and 780 Github stars. We've
merged 460+ PRs, re-written 5 services in new languages, and added 7 new
components / services.

Time flies when you're stabilizing semantic conventions. But what's actually
changed between our 1.0.0 and 1.4.0 releases? Quite a lot actually.

The highlights:

* 2x build time improvements despite adding additional services
* Support added for arm64 architectures (M1 and M2 Macs)
* Async support using Kafka and 2 new services
* Kubernetes manifest
* More out of the box dashboards
* Our first logging SDK addition
* A myriad of frontend bug fixes
* First
  [Connector](https://github.com/open-telemetry/opentelemetry-collector/blob/main/connector/README.md)
  in the Collector
* New metric SDKs
* New manual metric instruments
* Browser and compute resource detectors
* More feature flag scenarios
* General stability improvements to fix service restarts

For detailed changes check out our in depth [release
notes](https://github.com/open-telemetry/opentelemetry-demo/releases) or
[changelog](https://github.com/open-telemetry/opentelemetry-demo/blob/main/CHANGELOG.md).

Our contributors are essential to all of this and the project team can't thank
them enough. New development is constantly ongoing as we add new capabilities
and the community's tools evolve. If you'd like to help, check out our
[contributing
guidance](https://github.com/open-telemetry/opentelemetry-demo/blob/main/CONTRIBUTING.md)
or join our [Slack
channel](https://cloud-native.slack.com/archives/C03B4CWV4DA).
