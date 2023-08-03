---
title: OpenTelemetry in Focus, July 2023
linkTitle: OTel in Focus 2023/07
date: 2023-08-03
author: '[Austin Parker](https://github.com/austinlparker)'
---

Welcome back to **OpenTelemetry in Focus** for July, 2023! I hope you're all
having a great summer (or if you're in the southern hemisphere, a great winter!)
Let's get into the updates and releases from the past month.

Are you a maintainer with something you’d like featured here? Get in touch with
me [via email](mailto:austin+otel@ap2.io), or on the
[CNCF Slack #otel-comms](https://cloud-native.slack.com/archives/C02UN96HZH6)
channel.

## Releases and Updates

Here are the latest updates from some of our core repositories.

<!-- markdownlint-disable heading-increment -->

##### [Specification](/docs/specs/otel/)

[Version 1.23](https://github.com/open-telemetry/opentelemetry-specification/releases/tag/v1.23.0)
does not include any significant changes, but some refinements have been made to
the configuration of TracerProvider and MeterProvider.

##### [Semantic Conventions](/docs/specs/semantic-conventions/)

[Version 1.21](https://github.com/open-telemetry/semantic-conventions/releases/tag/v1.21.0)
is the first standalone release of the semantic conventions, separate from the
specification. This release is a substantial one, with several notable breaking
changes to `messaging`, `http`, and `net` namespaces. Please carefully review
the release notes for more details.

##### [Collector](/docs/collector/)

[Version 0.82.0](https://github.com/open-telemetry/opentelemetry-collector/releases/tag/v0.82.0)
has been released, along with 0.81.

The major addition in 0.82 is the ability to export Collector telemetry via
OTLP. This is an experimental feature, please see the release notes for more
details. 0.81 removes the connectors feature gate, as connectors are no longer
experimental. Both releases include a variety of enhancements and bug fixes, as
well. Please see the release notes for more details.

[collector-contrib](https://github.com/open-telemetry/opentelemetry-collector-contrib/releases/tag/v0.82.0)
has also seen many updates, enhancements, and bug fixes. Notably, many receivers
now use opaque strings for configuration. This may require changes to your
collector configuration. New connectors and exporters have been added as well,
such as the `exceptionsconnector` and `opensearchexporter`.

##### [Java](/docs/instrumentation/java/)

[Version 1.28](https://github.com/open-telemetry/opentelemetry-java/releases/tag/v1.28.0)
includes a variety of updates and bug fixes.

[Java Instrumentation](https://github.com/open-telemetry/opentelemetry-java-instrumentation/releases/tag/v1.28.0)
has also been released, with some required migrations due to semantic convention
updates.

#### [Python](/docs/instrumentation/python/)

[Version 1.19](https://github.com/open-telemetry/opentelemetry-python/releases/tag/v1.19.0)
includes updates to OTLP and Log support.

#### [JavaScript](/docs/instrumentation/js/)

[Version 1.15.1](https://github.com/open-telemetry/opentelemetry-js/releases/tag/v1.15.1)
includes metric bug fixes for histograms and exponential histograms. In
addition, OTLP support has been updated.

#### [.NET](/docs/instrumentation/net/)

[Version 1.6.0-alpha.1](https://github.com/open-telemetry/opentelemetry-dotnet/releases/tag/core-1.6.0-alpha.1)
has been released. 1.6 re-introduces support for exemplars, as well as
implementing the logs bridge API. Other updates and bug fixes are included as
well.

## News and Upcoming Events

Observability Day is coming to KubeCon North America in Chicago! The CFP is open
until August 6th.
[Submit your talk today!](https://events.linuxfoundation.org/kubecon-cloudnativecon-north-america/co-located-events/cfp-colocated-events/)
