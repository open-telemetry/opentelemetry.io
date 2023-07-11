---
title: OpenTelemetry in Focus, April 2023
linkTitle: OTel in Focus 2023/04
date: 2023-05-01
author: '[Austin Parker](https://github.com/austinlparker)'
spelling: cSpell:ignore confmap renamings
---

Welcome to this month’s edition of **OpenTelemetry in Focus**! It's been another
busy month in the OpenTelemetry community, with some big announcements and new
releases from our core repositories. I'll also be sharing some highlights from
OpenTelemetry at KubeCon EU, which was a blast. Can't wait for Chicago this
fall!

Are you a maintainer with something you’d like featured here? Get in touch with
me [via email](mailto:austin@lightstep.com), or on the
[CNCF Slack #otel-comms](https://cloud-native.slack.com/archives/C02UN96HZH6)
channel.

## Releases and Updates

Here are the latest updates from some of our core repositories.

##### [Specification](/docs/specs/otel/)

[Version 1.20](https://github.com/open-telemetry/opentelemetry-specification/releases/tag/v1.20.0)
has been released, and it's a big one!

First, **OpenTelemetry Protocol** has been declared stable! Second, we've
started a process to converge the
[Elastic Common Schema with OpenTelemetry Semantic Conventions](/blog/2023/ecs-otel-semconv-convergence/).
What does this mean? At a high level, you can expect to see that semantic
conventions will split out of the specification as we proceed towards aligning
our standards. Please be on the look out for more information.

Other changes include:

- Changes to span and metric SDK details.
- Clean up the log bridge API.
- Key stability work for existing Semantic Conventions.
- Breaking change to `http.server.active_requests` metric; The
  `http.status_code` attribute is no longer present.

##### [Collector](/docs/collector/) and contrib

[Version 0.76.1/v1.0-rcv0011](https://github.com/open-telemetry/opentelemetry-collector-releases/releases/tag/v0.76.1)
has been released for the collector. The
[operator](https://github.com/open-telemetry/opentelemetry-operator/releases/tag/v0.75.0)
has been updated to v0.75.0, adding support for feature gates in the operator.

This release includes several bugfixes and improvements to connectors, along
with a breaking change to the `confmap` component.

##### [Go](/docs/instrumentation/go/)

[Version v1.15.0](https://github.com/open-telemetry/opentelemetry-go/releases/tag/v1.15.0)
has been released! This marks the official release of OpenTelemetry Metrics v1
in Go. Please check out the full release notes, as there are several important
changes and renamings, especially if you're using metrics.

##### [Java](/docs/instrumentation/java/)

[Version 1.25.0](https://github.com/open-telemetry/opentelemetry-java/releases/tag/v1.25.0)
of the Java SDK has been released, with several bugfixes and improvements.
Please note that this includes a change to exponential bucket histograms, please
see the release notes for details if you rely on automatic configuration of
histograms.

In addition, the
[Java Instrumentation](https://github.com/open-telemetry/opentelemetry-java-instrumentation/releases/tag/v1.25.1)
package has been updated to 1.25.1 as well. Highlights include:

- New instrumentation added for R2DBC, JFR streaming metrics, and ZIO 2.0
- Passwords no longer emitted from db.user when using JDBC instrumentation.
- Apache HTTP Client library now emits client metrics as well.
- Alignment with semantic conventions.

There's much more -- be sure to check out the release notes!

## Project Updates

KubeCon EU saw over ten thousand cloud-native developers gather in Amsterdam,
and a lot of you stopped by the OpenTelemetry booth to say hi! Hopefully some of
you got your hands on our limited-edition KubeCon stickers... if not, well,
there'll be more limited edition stickers. Just not for KubeCon, because it's
come and gone.

There was a lot of great feedback that we're excited to tackle as a project over
the coming months, including:

- Improving discoverability of components for the collector.
- Increasing responsiveness to PR's and issues.
- Finishing up the Logging Bridge API and getting logs to stability.

There were also a lot of great talks from the Observability community at
KubeCon, including at
[Observability Day Europe](https://www.youtube.com/watch?v=2VuAIhL3xG4&list=PLj6h78yzYM2ORxwcjTn4RLAOQOYjvQ2A3).
Go check it out if you have some time, there's some really interesting
real-world examples in there of how people are using OpenTelemetry!

## News and Upcoming Events

[OpenCensus is being sunset](/blog/2023/sunsetting-opencensus/) in July 2023.
Once this has concluded, our initial goal of OpenTelemetry as a single
replacement for OpenTracing and OpenCensus will have been realized!
