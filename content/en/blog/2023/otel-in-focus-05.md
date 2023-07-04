---
title: OpenTelemetry in Focus, May 2023
linkTitle: OTel in Focus 2023/05
date: 2023-05-31
author: '[Austin Parker](https://github.com/austinlparker)'
spelling: cSpell:ignore vertx Dyrmishi Farfetch
---

Welcome back to **OpenTelemetry in Focus** for May, 2023! The sun is shining,
the sky is blue, and it's time to run down the latest updates from the
OpenTelemetry project!

Are you a maintainer with something you’d like featured here? Get in touch with
me [via email](mailto:austin+otel@ap2.io), or on the
[CNCF Slack #otel-comms](https://cloud-native.slack.com/archives/C02UN96HZH6)
channel.

## Releases and Updates

Here are the latest updates from some of our core repositories.

##### [Specification](/docs/specs/otel/)

[Version 1.21](https://github.com/open-telemetry/opentelemetry-specification/releases/tag/v1.21.0)
has been released with a variety of important changes, including:

- Log Bridge API and SDK have been marked stable.
- Add groundwork for file-based configuration of OpenTelemetry.
- OpenCensus compatibility specification marked stable.

##### [Collector](/docs/collector/)

[Version 0.78.0](https://github.com/open-telemetry/opentelemetry-collector/releases/tag/v0.78.0)
has been released, along with 0.77. These releases address several important
core issues, including:

- Batch processor can now batch by attribute keys.
- Initial support for internal OpenTelemetry SDK usage.
- Default queue size for exporters reduced from 5000 to 1000.
- Feature gate added to disable internal metrics with high cardinality.

In addition,
[collector-contrib](https://github.com/open-telemetry/opentelemetry-collector-contrib/releases/tag/v0.78.0)
has been updated with several changes and enhancements. The
[Operator](https://github.com/open-telemetry/opentelemetry-operator/releases/tag/v0.77.0)
now supports Golang & Apache HTTP server auto-instrumentation in addition to
Python, Java, Node.js, and .NET.

##### [Go](/docs/instrumentation/go/)

[Version 1.16.0/0.39.0](https://github.com/open-telemetry/opentelemetry-go/releases/tag/v1.16.0)
marks the stable release of the OpenTelemetry Metric API in Go.

##### [Java](/docs/instrumentation/java/)

[Version 1.26](https://github.com/open-telemetry/opentelemetry-java/releases/tag/v1.26.0)
is the Release Candidate for the Log Bridge. This release enables log appenders
to bridge logs from existing log frameworks, allowing users to configure the Log
SDK and dictate how logs are processed and exported. In addition,
opentelemetry-opentracing-shim is now stable, as well as other bug fixes and
improvements.

[Java Instrumentation](https://github.com/open-telemetry/opentelemetry-java-instrumentation/releases/tag/v1.26.0)
includes instrumentation support for vertx-sql-client, as well as several bug
fixes.

#### [Javascript](/docs/instrumentation/js/)

[Version 1.13](https://github.com/open-telemetry/opentelemetry-js/releases/tag/v1.13.0)
has been released, adding support for gRPC log export. In addition, a couple
bugs have been fixed.

#### [Python](/docs/instrumentation/python/)

[Version 1.18](https://github.com/open-telemetry/opentelemetry-python/releases/tag/v1.18.0)
adds a new feature that allows histogram aggregation to be set using an
environment variable, as well as various bug fixes related to resource
detection, exporting, and suppressing instrumentation.

- Add ability to select histogram aggregation with an environment variable
- Move protobuf encoding to its own package
- Add experimental feature to detect resource detectors in auto instrumentation
- Fix exporting of ExponentialBucketHistogramAggregation from
  opentelemetry.sdk.metrics.view
- Fix headers types mismatch for OTLP Exporters

#### [.NET](/docs/instrumentation/net/)

[Version 1.5.0-rc1](https://github.com/open-telemetry/opentelemetry-dotnet/releases/tag/core-1.5.0-rc.1)
includes many bug fixes across a variety of packages.

## Project and Community Updates

### YouTube and Meeting Recordings

Recently, you may have noticed that the OpenTelemetry YouTube channel stopped
publishing meeting recordings. In the future, you will be able to access
recordings, transcripts, and chat history for meetings through the Zoom cloud.
Please see [this issue](https://github.com/open-telemetry/community/pull/1431)
for more information.

We'll be publishing more curated content on the OpenTelemetry channel starting
in June, including interviews with end-users and more. Please keep an eye on the
OpenTelemetry Blog for updates.

### From the blog...

[OpenTelemetry Lambda Layers](/blog/2023/lambda-release/) are now available.
Congratulations to the Functions-as-a-Service SIG on the release!

A new blog series discussing
[Histograms vs. Summaries](/blog/2023/histograms-vs-summaries/) and
[Exponential Histograms](/blog/2023/exponential-histograms/) has gone up on the
blog, giving an overview of this important topic.

## News and Upcoming Events

OpenTelemetry in Practice is coming up on June 8th at 10:00 PT/13:00 ET/19:00
CET featuring Iris Dyrmishi of Farfetch. Please see the #otel-comms channel on
the CNCF Slack for more info.

Observability Day is coming to KubeCon North America in Chicago! Keep an eye on
the
[KubeCon](https://events.linuxfoundation.org/kubecon-cloudnativecon-north-america/)
page for more information. A call for proposals is expected to be available in
early June.
