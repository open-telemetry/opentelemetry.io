---
title: OpenTelemetry in Focus, June 2023
linkTitle: OTel in Focus 2023/06
date: 2023-07-01
author: '[Austin Parker](https://github.com/austinlparker)'
# prettier-ignore
cSpell:ignore: autoconfigure Dyrmishi Farfetch Inet Ktor Logback Quarkus scraperhelper Skywalking
---

Welcome back to **OpenTelemetry in Focus** for June, 2023! It's officially
summer, but it's not just hot outside -- we've had some major announcements and
releases this month.

Are you a maintainer with something you’d like featured here? Get in touch with
me [via email](mailto:austin+otel@ap2.io), or on the
[CNCF Slack #otel-comms](https://cloud-native.slack.com/archives/C02UN96HZH6)
channel.

## Releases and Updates

Here are the latest updates from some of our core repositories.

<!-- markdownlint-disable heading-increment -->

##### [Specification](/docs/specs/otel/)

[Version 1.22](https://github.com/open-telemetry/opentelemetry-specification/releases/tag/v1.22.0)
includes a recommendation to reserve the aggregator normative for metrics, a
move of the OTLP specification to the opentelemetry-proto repository, and an
explanation of why custom attributes are not recommended to be placed in OTel
namespaces.

There are no changes in other areas.

##### [Collector](/docs/collector/)

[Version 0.80.0](https://github.com/open-telemetry/opentelemetry-collector/releases/tag/v0.80.0)
has been released, along with 0.79.

0.80.0 includes a deprecation, enhancements, and module splits. The deprecation
is the `service.PipelineConfig` in favor of the `pipelines.Config`. Enhancements
include the addition of a dry run flag, allowing TLS settings to be provided in
memory, updates to the connector nodes, and updates to various modules.

0.79.0 includes deprecations, enhancements, and bugfixes. The release deprecates
the `Host.GetExporters` function, adds connectors to the output of the
components command, improves the behavior of the scraperhelper, optimizes the
multiBatcher to avoid a global lock, and fixes a bug related to data replication
in connectors.

In addition,
[collector-contrib](https://github.com/open-telemetry/opentelemetry-collector-contrib/releases/tag/v0.80.0)
has been released. Some notable changes include the addition of the WebSocket
processor, updates to metric units in various receivers, and deprecation of
options in the SumoLogic exporter. Check the release notes for more details.

0.79.0 included a number of bugfixes and enhancements, including breaking
changes to hashing algorithms and changes to endpoint requirements. Enhancements
include improved metric retrieval and new configuration options, while bug fixes
address issues with subprocess cancellation and incorrect log stream filtering.

There were three releases of the
[Operator](https://github.com/open-telemetry/opentelemetry-operator/releases/tag/v0.80.0)
in June. The latest, release v0.80.0, introduces enhancements such as adding a
Skywalking parser and populating credentials for Prometheus CR scrape configs.
Bugfixes include a fix for the upgrade mechanism and empty global scrape
interval, and a new component was added for NGINX auto-instrumentation in the
operator.

0.79.0 of the Operator includes enhancements such as Prometheus metric exporter
support for Node.js auto-instrumentation and the ability to inject the service
version into the environment of the instrumented application. There is also a
bugfix regarding the OpenTelemetry Collector version not displaying properly in
the status field.

0.78.0 includes enhancements such as updating various packages, support for
scaling on Pod custom metrics, and improved config validation. Bugfixes include
addressing issues related to prometheus relabel configs and setting the default
go auto-instrumentation version correctly. Components that were updated include
the OpenTelemetry Collector, OpenTelemetry Contrib, Java auto-instrumentation,
.NET auto-instrumentation, Node.js, Python, Go, and Apache HTTP Server.

##### [Java](/docs/instrumentation/java/)

[Version 1.27](https://github.com/open-telemetry/opentelemetry-java/releases/tag/v1.27.0)
has made the Log Bridge API and SDK stable. Important changes include merging
log-related contents into the appropriate artifacts, marking the log SDK
artifact as stable, and changing the default value of otel.logs.exporter in
opentelemetry-sdk-extension-autoconfigure. The release also includes various bug
fixes and improvements for the API, SDK, metrics, exporters, testing, SDK
extensions, and semantic conventions.

Remember - the Log Bridge API is not intended for end users. It is used to
bridge existing appenders (e.g., Log4j, SLf4J, Logback, JUL) into OpenTelemetry.

[Java Instrumentation](https://github.com/open-telemetry/opentelemetry-java-instrumentation/releases/tag/v1.27.0)
has been released, requiring some migrations to be performed.

- Migration notes: changes in Jersey 3.0 instrumentation suppression keys,
  renaming and splitting of opentelemetry-runtime-metrics artifact, deprecation
  of InetSocketAddressNetServerAttributesGetter and
  InetSocketAddressNetClientAttributesGetter, and introduction of new HTTP and
  network semantic conventions.
- New javaagent instrumentation for Quarkus RESTEasy Reactive and Reactor Kafka.
- Enhancements including improvements in Micrometer bridge, Ktor
  instrumentations, AWS SDK support, OkHttp 3, Jetty 11, Spring Boot, AWS Lambda
  tracing, and type matching.
- Bugfixes related to Logback MDC instrumentation, Kafka metrics reporter, jetty
  context leak, filtering scalar Mono/Flux instances, and others.

#### [JavaScript](/docs/instrumentation/js/)

[Version 1.14](https://github.com/open-telemetry/opentelemetry-js/releases/tag/v1.14.0)
includes an optional `forceFlush` method to the `SpanExporter` interface.

#### [.NET](/docs/instrumentation/net/)

[Version 1.5.1](https://github.com/open-telemetry/opentelemetry-dotnet/releases/tag/core-1.5.1)
has been released, as well as 1.5.0. 1.5.1 is a fix for issues introduced in
1.5.0, and 1.5.0 consisted of the following major changes:

- The bug introduced in 1.5.0-rc.1 that caused the "Build" extension to return
  null has been fixed.
- The Exemplars feature has been marked as internal and will be added back in
  the 1.6.x prerelease versions.
- A new overload has been added for configuring MeterProviderBuilders while the
  IServiceCollection is modifiable.
- The Console and OpenTelemetryProtocol exporters no longer support exporting
  Exemplars.
- The ASP.NET Core instrumentation has been updated to fix an issue where
  baggage was cleared when the Activity stopped and to add a direct reference to
  System.Text.Encodings.Web.
- The HTTP instrumentation has been updated to fix an issue with missing metric
  data in network failures and to improve performance by avoiding boxing of
  common status code values.

## Project and Community Updates

### OTLP 1.0 is here

OTLP 1.0 is out (or will soon be)! We'll publish more details about what this
means on the blog at some later point. Keep in mind that just because the
specification and protocol are 1.0, this does not mean all OpenTelemetry SIGs
have adopted or released it. Please keep an eye out for future information.

This is still a major accomplishment, and a huge congratulations is in order to
everyone who has contributed. Thank you!

### From the blog

Here's the latest blog posts. Want to contribute? Get in touch!

- [End-User Q&A: OTel at Farfetch](/blog/2023/end-user-q-and-a-03/) is the
  latest in the End-User Q&A series, featuring Iris Dyrmishi of Farfetch.

- [Creating a Kubernetes Cluster with Runtime Observability](/blog/2023/k8s-runtime-observability/)
  discusses how to use recent tracing features in Kubernetes components to
  better understand your K8s clusters.

## News and Upcoming Events

Observability Day is coming to KubeCon North America in Chicago! The CFP is open
until August 6th.
[Submit your talk today!](https://events.linuxfoundation.org/kubecon-cloudnativecon-north-america/co-located-events/cfp-colocated-events/)
