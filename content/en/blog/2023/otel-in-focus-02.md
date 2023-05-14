---
title: OpenTelemetry in Focus, February 2023
linkTitle: OTel in Focus 2023/02
date: 2023-02-28
author: '[Austin Parker](https://github.com/austinlparker)'
---

Welcome to this month’s edition of OpenTelemetry in Focus! It might be cold and
snowy in much of the Northern Hemisphere, but that hasn’t frozen our progress.
Read on for an overview of new releases, announcements, and other important
updates.

Are you a maintainer with something you’d like featured here? Get in touch with
me [via email](mailto:austin@lightstep.com), or on the
[CNCF Slack #otel-comms](https://cloud-native.slack.com/archives/C02UN96HZH6)
channel.

## Releases and Updates

Here are the latest updates from our core repositories.

##### [Specification](/docs/specs/otel/)

[v1.18](https://github.com/open-telemetry/opentelemetry-specification/releases/tag/v1.18.0)
has been released, with a batch of semantic convention updates and
clarifications on mapping and converting between Prometheus and OpenTelemetry
Metrics.

##### [Collector](/docs/collector/) and contrib

[v0.72](https://github.com/open-telemetry/opentelemetry-collector-contrib/releases)
have been released with several major changes to be aware of:

- The minimum supported Golang version is now 1.19
- The host metrics receiver has removed deprecated metrics for process memory.
- The promtail receiver has been removed from collector-contrib.
- The Jaeger exporters are now deprecated, to be removed in a future release.
- [Connectors](https://github.com/open-telemetry/opentelemetry-collector/blob/main/connector/README.md)
  have been added! These are components that act as exporters and receivers,
  allowing you to route data through pipelines. Please see the component docs
  for more information.
- Many bug fixes and enhancements.

##### [Go](/docs/instrumentation/go/)

[v1.14](https://github.com/open-telemetry/opentelemetry-go/releases/tag/v1.14.0)
has been released. This is the last release to support Go 1.18; 1.19 will be
required in the future. Semantic conventions have been updated, resulting in
changes to constant and function names. Finally, there’s a variety of bug fixes
and other small changes.

##### [Java](/docs/instrumentation/java/)

[v1.23](https://github.com/open-telemetry/opentelemetry-java/releases/tag/v1.23.0)
has been released, bringing with it stable base2 exponential histogram
aggregations and significant metrics refactoring. Semantic convention updates,
improvements to SDK shutdown, and several enhancements to the SDK extensions are
also in this release.
[Java Instrumentation](https://github.com/open-telemetry/opentelemetry-java-instrumentation/releases/tag/v1.23.0)
has been updated as well, most notably changing HTTP span names to reflect
updated semantic conventions.

##### [PHP](/docs/instrumentation/php/)

[v1 beta](https://github.com/open-telemetry/opentelemetry-php/releases/tag/1.0.0beta1)
was [announced](/blog/2023/php-beta-release/) at the end of January. The PHP SIG
is looking forward to your feedback. In addition, the Communications SIG is
planning a release of new documentation for PHP soon.

##### [Python](/docs/instrumentation/python/)

[v1.16](https://github.com/open-telemetry/opentelemetry-python/releases/tag/v1.16.0)
has been released with deprecations to Jaeger exporters, several performance
improvements and bug fixes, and changes to Prometheus export.

##### [.NET](/docs/instrumentation/net/)

[v1.4](https://github.com/open-telemetry/opentelemetry-dotnet/releases/tag/core-1.4.0)
removes several deprecated extension methods.

As always, this is just a snapshot of important changes and improvements across
the core projects. Make sure you thoroughly read the release notes when
upgrading your OpenTelemetry dependencies.

## Project Updates

The [Outreachy](/blog/2023/outreachy-may-cohort/) project is looking for
participants. This is an annual program that connects new open source
contributors with small, self-contained projects that they can work on. There
are also opportunities to volunteer to mentor these contributors. Read the blog
for more information!

The
[Collector SIG will be starting new APAC-friendly meetings](/blog/2023/new-apac-meetings/)
to support contributors and maintainers worldwide.

Our End-User Working Group has written up a
[Q&A about using OpenTelemetry with GraphQL](/blog/2023/end-user-q-and-a-01/).

## News and Upcoming Events

OpenTelemetry maintainers and contributors will be in attendance at
[Observability Day Europe](https://events.linuxfoundation.org/kubecon-cloudnativecon-europe/co-located-events/observability-day/)
on April 18th, 2023, as part of KubeCon/CloudNativeCon Europe 2023.
