---
title: Distributions
weight: 25
---

An OpenTelemetry Collector distribution is a collection of components
(receivers, processors, connectors, exporters, extensions) assembled in a
binary.

The OpenTelemetry projects provides two official [pre-built distributions][] of
the Collector: core and contrib. While core contains a few selected components,
geared towards interoperability with other open-source projects, the contrib
distribution includes everything under the sun, including vendor-specific
components. For the components included in a [distribution][distributions], see
the distribution's `manifest.yaml` file.

While we expect the core distribution to be useful to a wide variety of
use-cases, we acknowledge that users might end up needing components that are
only available in the contrib distribution. Given that the attack surface and
binary size of the contrib distribution, it might be intimidating to most users.
Users of the OpenTelemetry Collector are encouraged to build their own custom
distributions with the [OpenTelemetry Collector Builder](../builder/), using the
components they need from the core repository, the contrib repository, and
possibly third-party or internal repositories.

[pre-built distributions]:
  https://github.com/open-telemetry/opentelemetry-collector-releases/releases
[distributions]:
  https://github.com/open-telemetry/opentelemetry-collector-releases/tree/main/distributions

{{% latest_release "collector-releases" /%}}
