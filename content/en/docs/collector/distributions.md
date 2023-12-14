---
title: Distributions
weight: 25
---

The OpenTelemetry project currently offers [pre-built distributions][] of the
collector. The components included in the [distributions][] can be found by in
the `manifest.yaml` of each distribution.

[pre-built distributions]:
  https://github.com/open-telemetry/opentelemetry-collector-releases/releases
[distributions]:
  https://github.com/open-telemetry/opentelemetry-collector-releases/tree/main/distributions

{{% docs/latest-release collector-releases /%}}

## Custom Distributions

For various reasons the existing distributions provided by the OpenTelemetry
project may not meet your needs. Whether you want a smaller version, or have the
need to implement custom functionality like
[authenticator extensions](../building/authenticator-extension),
[receivers](../building/receiver), processors, exporters or
[connectors](../building/connector). The tool used to build distributions
[ocb](../custom-collector) (OpenTelemetry Collector Builder) is available to
build your own distributions.
