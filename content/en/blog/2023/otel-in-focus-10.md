---
title: OpenTelemetry in Focus, October 2023
linkTitle: OTel in Focus 2023/10
date: 2023-11-01
author: '[Austin Parker](https://github.com/austinlparker)'
# prettier-ignore
cSpell:ignore: distro pdata k8sclusterreceiver splunkhecexporter signalfxexporter dockerstats receiver parquetexporter Pekko structs resourcetype dockerstatsreceiver Contribfest
---

Welcome back to **OpenTelemetry in Focus** for October, 2023! It's been another
busy month as we prepare for KubeCon North America in Chicago. We've got a lot
to talk about once we're there, and we're excited to see you all in person!

Are you a maintainer with something you’d like featured here? Get in touch with
me [via email](mailto:austin+otel@ap2.io), or on the
[CNCF Slack #otel-comms](https://cloud-native.slack.com/archives/C02UN96HZH6)
channel.

## Releases and Updates

Here are the latest updates from some of our core repositories.

<!-- markdownlint-disable heading-increment -->

##### [Specification and Semantic Conventions](/docs/specs/otel/)

Version 1.26.0 of the OpenTelemetry Specification has been released. This
release includes several small changes, along with a new section that explains
how OpenTelemetry handles upgrading and version management for components. For
full details, please visit the full changelog
[here](https://github.com/open-telemetry/opentelemetry-specification/compare/v1.25.0...v1.26.0)

Semantic Conventions v1.22.0 introduces critical changes to the JVM, HTTP,
System, and Messaging namespaces.

Major Breaking Changes, Highlights:

- All JVM metrics have been renamed from `process.runtime.jvm.*` to `jvm.*.`
- Added namespaces to JVM metric attributes.
- Renamed `http.client.duration` and `http.server.duration` metrics to
  `http.client.request.duration` and `http.server.request.duration`
  respectively.
- Renamed `jvm.classes.current_loaded` metrics to `jvm.classes.count.`
- Removed pluralization from JVM metric namespaces.
- Renamed several attribute metrics under `system.cpu.`, `system.memory.`,
  `system.paging.`, `system.disk.`, `system.filesystem.`, and `system.network.`
  metrics.

Significant changes for HTTP metrics include renaming
`http.server.request.size`metric to `http.server.request.body.size` and
`http.server.response.size` metric to `http.server.response.body.size`.
Important changes in messaging metrics entail renaming
`messaging.message.payload_size_bytes` to `messaging.message.body.size` and
removing `messaging.message.payload_compressed_size_bytes`. There have also been
crucial updates to telemetry metrics such as renaming `telemetry.auto.version`
resource attribute to `telemetry.distro.version`.

Numerous non-breaking changes have been introduced, including additions of new
attribute metrics, updates to naming conventions, and introducing new schemes
for certain metrics.

See
[this link](https://github.com/open-telemetry/semantic-conventions/releases/tag/v1.22.0)
for full release notes. Please be aware of these changes as you update your
OpenTelemetry SDKs.

##### [Collector](/docs/collector/)

October saw, as usual, two releases of the Collector. You can find the
[release notes](https://github.com/open-telemetry/opentelemetry-collector-releases/releases/tag/v0.88.0)
here.

These releases include two major feature enhancements, along with a handful of
deprecations. APIs have been introduced to control the mutability of `pdata`. In
addition, logging for all components will now default to sampled logging mode.
Certain structs and methods that were marked deprecated in earlier releases have
now been removed.

[collector-contrib](https://github.com/open-telemetry/opentelemetry-collector-contrib/releases/tag/v0.88.0)
also has seen multiple releases. Notable deprecations and breaking changes
include:

- `k8sclusterreceiver`: `opencensus.resourcetype` attribute removed.
- `splunkhecexporter` and `signalfxexporter`: `max_connections` configuration
  field removed, replaced by `max_idle_conns` or `max_idle_conns_per_host`.
- `dockerstatsreceiver`: `cpu.container.percent` deprecated in favor of
  `container.cpu.utilization`.
- `parquetexporter` has been removed.

In addition, many changes and enhancements have been made to a variety of
processors, receivers, and exporters.

The Operator has also been updated several times -- highlights include:

- Minimum required version of Kubernetes is now 1.23.
- Support for automatic instrumentation of NGINX pods.
- Improvements to the OpAMP bridge.
- Instrumentation libraries have been updated across the board.

See
[the release notes](https://github.com/open-telemetry/opentelemetry-operator/releases/tag/v0.88.0)
for more details.

##### [Java](/docs/instrumentation/java/)

[Version 1.31.0](https://github.com/open-telemetry/opentelemetry-java/releases/tag/v1.31.0)
includes many small changes. Notably, there is a breaking change around the
semantic conventions package, as a new module has been published that aligns
with semantic convention versions.

[JavaInstrumentation](https://github.com/open-telemetry/opentelemetry-java-instrumentation/releases/tag/v1.31.0)
includes new instrumentation for Apache Pekko, as well as many enhancements and
bug fixes.

#### [JavaScript](/docs/instrumentation/js/)

[Version 1.17.1](https://github.com/open-telemetry/opentelemetry-js/releases/tag/v1.17.1)
fixes several bugs in tracing and metrics. Experimental builds include several
bug fixes and enhancements to the logging exporter, the deprecation of direct
Jaeger export, and more.

#### [.NET](/docs/instrumentation/net/)

[Version 1.7.0-alpha](https://github.com/open-telemetry/opentelemetry-dotnet/releases/tag/core-1.7.0-alpha.1)
includes many bug fixes and updates, including some breaking changes.

## News and Upcoming Events

KubeCon North America is coming to Chicago soon, and the schedule has been
announced!
[Check out the observability track](https://events.linuxfoundation.org/kubecon-cloudnativecon-north-america/program/schedule/)
for talks on OpenTelemetry, Prometheus, and more.

[Observability Day](https://colocatedeventsna2023.sched.com/overview/type/Observability+Day)
returns as well, and it's shaping up to be a great one! Check out the announced
schedule at the link above.

We're also excited to announce our first ever
[Contribfest](https://kccncna2023.sched.com/event/1R2rQ)! You'll have the
opportunity to work with maintainers of the Collector and JavaScript SIGs on
issues and PRs, and learn more about how to contribute to OpenTelemetry.

Finally, be sure to catch us at the OpenTelemetry Observatory on the expo floor
for a variety of meetups, Q&As, and networking with your fellow contributors and
users.
