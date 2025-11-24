---
title: Distributions
weight: 25
---

The OpenTelemetry project currently offers pre-built [distributions][] of the
Collector. The components included in the distributions can be found by in the
`manifest.yaml` of each distribution.

[distributions]:
  https://github.com/open-telemetry/opentelemetry-collector-releases/tree/main/distributions

{{% ecosystem/distributions-table filter="first-party-collector" %}}

## Custom Distributions

Existing distributions provided by the OpenTelemetry project may not meet your
needs. For example, you may want a smaller binary or need to implement custom
functionality like
[authenticator extensions](../building/authenticator-extension),
[receivers](../building/receiver), processors, exporters or
[connectors](../building/connector). The tool used to build distributions
[ocb](../custom-collector) (OpenTelemetry Collector Builder) is available to
build your own distributions.

## Third-party Distributions

Some organizations provide a Collector distribution with additional capabilities
or for improved ease of use. What follows is a list of Collector distributions
maintained by third parties.

{{% ecosystem/distributions-table filter="third-party-collector" %}}

## Adding your Collector distribution {#how-to-add}

To have your Collector distribution listed, [submit a PR][] with an entry added
to the [distributions list][]. The entry should include the following:

- Link to the main page of your distribution
- Link to the documentation that explains how to use the distribution
- GitHub handle or email address as a point of contact so that we can reach out
  in case we have questions

[submit a PR]: /docs/contributing/pull-requests/
[distributions list]:
  https://github.com/open-telemetry/opentelemetry.io/tree/main/data/ecosystem/distributions.yaml
