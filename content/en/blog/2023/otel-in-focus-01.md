---
title: OpenTelemetry in Focus, January 2023
linkTitle: OTel in Focus 2023/01
date: 2023-01-31
author: '[Austin Parker](https://github.com/austinlparker)'
---

Welcome to the first edition of _OpenTelemetry In Focus_! This blog is intended
to be an overview of important releases, roadmap updates, and community news.
This series will be focusing on our core components, such as the specification,
data format, tools, and most popular API/SDKs.

Are you a maintainer with something you’d like featured here? Get in touch with
me [via email](mailto:austin@lightstep.com), or on the
[CNCF Slack, #otel-comms](https://cloud-native.slack.com/archives/C02UN96HZH6)
channel.

## Releases and Updates

New year, new code! The following repositories have released new versions this
month. For more details on what’s in each release, be sure to check out the full
release notes.

- [Specification v.1.17.0](https://github.com/open-telemetry/opentelemetry-specification/releases/tag/v1.17.0)
  has been released! This includes deprecation notices for the Jaeger exporter,
  histogram data model stability, changes to semantic conventions, and several
  other changes.
- [Go v1.12.0/v0.35.0](https://github.com/open-telemetry/opentelemetry-go/releases/tag/v1.12.0)
  celebrates an important release of updated semantic conventions and metric
  instruments, along with a handful of bugfixes and other important changes.
- [JavaScript](https://github.com/open-telemetry/opentelemetry-js/releases) has
  released v1.4.0 of the API, v.1.9.0 of core, and v0.35.0 of experimental
  packages! These releases include important bugfixes in tracing around clock
  drift, as well as other deprecations and enhancements.
- [Java v1.22.0](https://github.com/open-telemetry/opentelemetry-java/releases/tag/v1.22.0)
  includes several fixes and enhancements for exporters, as well as other
  ease-of-use and correctness issues. In addition,
  [Java agent v1.22.1](https://github.com/open-telemetry/opentelemetry-java-instrumentation/releases/tag/v1.22.1)
  has been released to align with the core API and SDK, in addition to new
  instrumentations for Spring Web MVC, JMS 3.0 (Jakarta), and Spring JMS 6.0.
- [Operator v0.68.0](https://github.com/open-telemetry/opentelemetry-operator/releases/tag/v0.68.0)
  brings with it a new OpAMP Bridge service,and a fix to allow for deployment to
  OpenShift clusters, along with other bugfixes.
- [Collector v1.0.0 (RC4)](https://github.com/open-telemetry/opentelemetry-collector/releases/tag/v0.70.0)
  and
  [Collector Contrib v0.70.0](https://github.com/open-telemetry/opentelemetry-collector-contrib/releases/tag/v0.70.0)
  have been released with a significant amount of changes, including support for
  connectors in the Collector Builder.
- [Demo v1.3.0](https://github.com/open-telemetry/opentelemetry-demo/releases/tag/1.3.0)
  has been released with support for metric exemplars, enhanced resource
  detection, and updates to OpenTelemetry API and SDKs.

## Project Updates

Over the past few months, through community discussions both in-person and
online, a new public [roadmap](/community/roadmap/) has been created and
published! This roadmap isn’t meant to be a set-in-stone list of priorities, but
more of a guide to our priorities and prioritization.

Interested in AWS Lambda, or other Functions-as-a-Service workloads, and how to
emit OpenTelemetry data from them? Our
[FaaS Working Group](https://github.com/open-telemetry/community#implementation-sigs)
has restarted in order to work on this problem. Join a meeting, or
[check out their notes](https://docs.google.com/document/d/187XYoQcXQ9JxS_5v2wvZ0NEysaJ02xoOYNXj08pT0zc/),
for more information.

The [End User Working Group](/blog/2023/end-user-discussions-01) has published a
summary of their discussions for the month. If you’re a user of OpenTelemetry,
these meetings are a great place to get connected with your peers and discuss
how you’re using the project.

## News and Upcoming Events

We’re proud to support
[Observability Day Europe](https://events.linuxfoundation.org/kubecon-cloudnativecon-europe/cncf-hosted-co-located-events/observability-day/)
as part of KubeCon EU 2023. If you’re planning to be in Amsterdam for KubeCon,
be sure to come a day early and meet up with OpenTelemetry contributors and
maintainers!
