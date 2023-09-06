---
title: OpenTelemetry in Focus, August 2023
linkTitle: OTel in Focus 2023/08
date: 2023-09-06
author: '[Austin Parker](https://github.com/austinlparker)'
cSpell:ignore: loggingexporter configgrpc jaegerreceiver googlecloudexporter Tanzu redisreceiver postgresqlreceiver azuremonitor zpages Ktor
---

Welcome back to **OpenTelemetry in Focus** for August, 2023! It's been a busy
summer, so let's get into the updates without further ado.

Are you a maintainer with something you’d like featured here? Get in touch with
me [via email](mailto:austin+otel@ap2.io), or on the
[CNCF Slack #otel-comms](https://cloud-native.slack.com/archives/C02UN96HZH6)
channel.

## Releases and Updates

Here are the latest updates from some of our core repositories.

<!-- markdownlint-disable heading-increment -->

##### [Specification](/docs/specs/otel/)

[Version 1.24](https://github.com/open-telemetry/opentelemetry-specification/releases/tag/v1.24.0)
includes metrics and logs.

##### [Collector](/docs/collector/)

[Version 0.84.0](https://github.com/open-telemetry/opentelemetry-collector/releases/tag/v0.84.0)
has been released, along with 0.83.

Notable user-facing changes include:

- `loggingexporter` now supports exemplars logging when the verbosity level is set
  to detailed.
- `configgrpc` now allows the use of any registered gRPC load balancer name.
- Internal traces can now be exported via OTLP.
- `configgrpc` now supports the `:authority` pseudo-header in gRPC client.

In addition, there's a variety of bug fixes and changes in the Collector API for
exporters.

[collector-contrib](https://github.com/open-telemetry/opentelemetry-collector-contrib/releases/tag/v0.84.0)
includes many updates -- be sure to check the release notes.

There are several user-facing changes, including breaking changes:

- The `jaegerreceiver` has deprecated the remote_sampling config. It will now fail
  to start if the config is specified. In a future version, this feature will be
  removed and the receiver will always fail when the config is specified.
- The `googlecloudexporter` has removed the retry_on_failure config, as it caused
  issues when handling retries.
- The Datadog processor has been deprecated in favor of the Datadog connector.
- The Tanzu Observability (Wavefront) Exporter has been deprecated in favor of
  native OTLP ingestion.
- The redisreceiver now supports adding a username parameter for connecting to
  Redis.
- The `postgresqlreceiver` has added the postgresql.temp_files metric.
- The `receiver/azuremonitor` has added new attributes to metrics like name, type,
  and resource_group.

##### [Java](/docs/instrumentation/java/)

[Version 1.29](https://github.com/open-telemetry/opentelemetry-java/releases/tag/v1.29.0)
includes updates to the API and SDK for tracing and metrics. Please note that
the `zpages` extension has been removed.

[Java Instrumentation](https://github.com/open-telemetry/opentelemetry-java-instrumentation/releases/tag/v1.29.0)
includes support for Ktor and ElasticSearch Rest Client.

#### [Python](/docs/instrumentation/python/)

[Version 1.20](https://github.com/open-telemetry/opentelemetry-python/releases/tag/v1.20.0)
modifies the Prometheus exporter to translate non-monotonic Sums into Gauges.

#### [Go](/docs/instrumentation/go/)

[Version 1.17.0](https://github.com/open-telemetry/opentelemetry-go/releases/tag/v1.17.0)
includes updates to the API and SDK. Highlights include adding support for
exponential histogram aggregations, support for Semantic Conventions 1.21, and
bug fixes. Please note that the Jaeger exporter has been deprecated in favor of
the OTLP exporter.

#### [JavaScript](/docs/instrumentation/js/)

[Version 1.15.2](https://github.com/open-telemetry/opentelemetry-js/releases/tag/v1.15.1)
fixes several bugs.

#### [.NET](/docs/instrumentation/net/)

[Version 1.6.0-rc.1](https://github.com/open-telemetry/opentelemetry-dotnet/releases/tag/core-1.6.0-rc.1)
has been released, bringing small changes to metrics, export, and an
experimental implementation of the Log Bridge.

## News and Upcoming Events

KubeCon North America is coming to Chicago in just over eight weeks, and the
schedule has been announced!
[Check out the observability track](https://events.linuxfoundation.org/kubecon-cloudnativecon-north-america/program/schedule/)
for talks on OpenTelemetry, Prometheus, and more.

Talks for Observability Day should be announced shortly, as well.

If you're planning to attend KubeCon, we hope to offer a variety of options for
you to meet, network, and engage with OpenTelemetry contributors and
maintainers. Keep an eye on our blog for more information.
