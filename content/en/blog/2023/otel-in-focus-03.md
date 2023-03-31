---
title: OpenTelemetry in Focus, March 2023
linkTitle: OTel in Focus 2023/03
date: 2023-03-31
author: '[Austin Parker](https://github.com/austinlparker)'
---

Welcome to this month’s edition of **OpenTelemetry in Focus**! It's been another
busy month in the OpenTelemetry community, with some big announcements and new
releases from our core repositories. I've also put together an overview of some
[blog, website, and project highlights](https://arc.net/e/18897C6F-3A57-4769-A929-902A18AB1B04) -
give it a look, and tell me what you think.

Are you a maintainer with something you’d like featured here? Get in touch with
me [via email](mailto:austin@lightstep.com), or on the
[CNCF Slack #otel-comms](https://cloud-native.slack.com/archives/C02UN96HZH6)
channel.

## Releases and Updates

Here are the latest updates from our core repositories.

##### [Specification](/docs/reference/specification/)

[Version 1.19](https://github.com/open-telemetry/opentelemetry-specification/releases/tag/v1.19.0)
has been released with a number of important udates.

- OTLP/JSON has been declared stable.
- To clarify its purpose, the Logs API has been renamed to the Logs Bridge API.
- Semantic convention updates.

##### [Collector](/docs/collector/) and contrib

[Version 0.74/v1.0-rc8](https://github.com/open-telemetry/opentelemetry-collector-releases/releases/tag/v0.74.0)
has been released for the collector, resulting in a new
[operator](https://github.com/open-telemetry/opentelemetry-operator/releases/tag/v0.74.0)
version as well. Highlights include:

- Connectors are enabled by default.
- The `spanmetricsprocessor` has been deprecated in favor of the
  `spanmetricsconnector`. Other changes have been made to the behavior of this
  component.
- A new receiver for CloudFlare logs has been added.
- Many bugfixes and enhancements.

##### [Go](/docs/instrumentation/go/)

[Version v1.15.0-rc.2](https://github.com/open-telemetry/opentelemetry-go/releases/tag/v1.15.0-rc.2)
has been released. Version 1.15 will ship with Metrics v1 support, and its
associated stability guarantees. Other highlights of the release candidate
include:

- Support for global meter providers.
- Exemplar support added for metric data.
- Several optimizations, bugfixes, and removals/deprecations.

##### [Java](/docs/instrumentation/java/)

[Version 1.24.0](https://github.com/open-telemetry/opentelemetry-java/releases/tag/v1.24.0)
of the Java SDK has been released, featuring several optimizations and bugfixes
to the metrics SDK.

In addition, the
[Java Instrumentation](https://github.com/open-telemetry/opentelemetry-java-instrumentation/releases/tag/v1.24.0)
package has been updated to 1.24 as well, featuring several new instrumentations
and fixes:

- Apache Pulsar and Jodd-Http can now be instrumented automatically via the
  agent.
- Ktor and Spring Webflux libraries can be instrumented using the library.
- Improvements to the RxJava2, Cassandra, Spring Boot, and other instrumentation
  packages.

##### [Python](/docs/instrumentation/python/)

[Version 1.17](https://github.com/open-telemetry/opentelemetry-python/releases/tag/v1.17.0)
has been released with a handful of fixes and improvements, most notably support
for exponential histograms!

## Project Updates

The proposal to merge the
[Elastic Common Schema (ECS) into OpenTelemetry](https://github.com/open-telemetry/oteps/pull/222)
has been passed! This is a big step towards reducing competing standards and
aligning the open source observability ecosystem around a common data model.

A proposal to
[donate OpenTelemetry Instrumentation for Android](https://github.com/open-telemetry/community/issues/1400)
has been made. You can follow along with the discussion in the linked issue --
exciting to see more options for client observability in OpenTelemetry!

We're on a mission to reduce the number of unanswered OpenTelemetry questions on
Stack Overflow. Be sure to check out the
[Stack Overflow Watch in the Monthly Highlights](https://arc.net/e/18897C6F-3A57-4769-A929-902A18AB1B04)
to learn how you can help, and get some cool swag in the process.

The
[Logs Bridge Specification](https://github.com/open-telemetry/opentelemetry-specification/issues/2911)
is in the final stretch before merge. If you'd like to help proofread, or have
any comments, now's the time to get involved!

## News and Upcoming Events

The
[schedule for KubeCon EU](https://events.linuxfoundation.org/kubecon-cloudnativecon-europe/program/schedule/)
is up, and there's a lot of OpenTelemetry to go around! We'll also be at
[Observability Day EU](https://events.linuxfoundation.org/kubecon-cloudnativecon-europe/co-located-events/observability-day/)
-- which will be live-streamed, including project updates and a panel discussion
featuring several OpenTelemetry maintainers. Will you be there in-person? Find
me (I'm the guy with the hat) and say hi -- I'd love to meet you (and I'll have
some stickers to give away). We'll also have a project booth, so swing by -- and
stay tuned for another blog detailing our full involvement at KubeCon EU.
