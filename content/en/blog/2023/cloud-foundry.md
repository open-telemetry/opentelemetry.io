---
title: 'Experience Report: Adopting OpenTelemetry for Metrics in Cloud Foundry'
linkTitle: OpenTelemetry in Cloud Foundry
date: 2023-11-08
author: >-
  [Matthew Kocher](https://github.com/mkocher) (VMware) and [Carson
  Long](https://github.com/ctlong) (VMware)
cSpell:ignore: Kocher unscalable
---

{{< blog/integration-badge >}}

[Cloud Foundry](https://www.cloudfoundry.org/) recently integrated the
[OpenTelemetry Collector](/docs/collector/) for metrics egress and we learned a lot along the way.
We're excited about what the integration offers today and all the possibilities
it opens up for us.

## What we were looking for

Cloud Foundry is a large multi-tenant platform as a service that runs 12-factor
applications. Cloud Foundry platform engineering teams usually run 4 to 8 Cloud
Foundry deployments running thousands of applications and hundreds of thousands
of containers. There are many users of Cloud Foundry, and our goal when it comes
to metrics is to enable platform engineering teams to integrate with their
monitoring tool of choice, not to dictate a single solution.

Historically adding support for a new monitoring tool was done via our own
Firehose API which required writing a new “Nozzle” for each tool, a high barrier
to entry. The Firehose API was also found to have inherent performance
limitations when being used for high volumes of logs and metrics. With an
unscalable API, and an unscalable approach to integrations, we started looking
to replace the way metrics egress from Cloud Foundry.

We were looking for a scalable way to egress metrics from hundreds of VMs and
thousands of containers with no bottlenecks or single points of failure. We also
wanted a real community working to support the many monitoring tools that
platform engineering teams might want to use, so we could get out of the
business of writing and maintaining custom integrations.

## What we evaluated

It was easy to align on adding an agent to each VM sending metrics directly to
monitoring tools. Within Cloud Foundry we had already seen that this approach
worked well for logs egress, eliminating bottlenecks and single points of
failure.

We evaluated several popular metric egress solutions. Besides OpenTelemetry, we
also looked seriously at [Fluent Bit](https://fluentbit.io/) and
[Telegraf](https://www.influxdata.com/time-series-platform/telegraf/).

For every solution we considered, we looked at them in following ways:

- Flexibility: How many monitoring tools can we send to?
- Performance: How efficient is the CPU and memory usage?
- Community: How engaged is the community? What languages/tools do they use?
- Deployment: Can it be deployed as a BOSH job and work within the constraints
  of a Cloud Foundry deployment? Is it possible to hot reload the configuration?

## Why we chose OpenTelemetry

When we looked at Fluent Bit we found that it is being written in C, which may
offer some performance benefits, but we primarily write in Go. We discarded
Fluent Bit early because our ability to contribute to the codebase would be
minimal, which we worried would limit us in the future.

We then looked more seriously at Telegraf and OpenTelemetry. Both are written in
Go, so we were good there. Telegraf has a more limited community, and does not
offer a customizable build process. We liked that OpenTelemetry allows us to
build a Collector with a curated selection of our own components and community
components.

Additionally, when looking at OpenTelemetry we found that many [tools](/ecosystem/integrations/) and [vendors](/ecosystem/vendors/)
were adding native support for the [OpenTelemetry Protocol](/docs/specs/otlp/) (OTLP). This caused us to be confident
in adopting OpenTelemetry Collector as a widely adopted first-party
implementation of the OTLP protocol.

We
[proposed adding the OpenTelemetry Collector to Cloud Foundry in an RFC](https://github.com/cloudfoundry/community/blob/0365df129e52ae7b784957a5569b16b7e133f97e/toc/rfc/rfc-0018-aggregate-metric-egress-with-opentelemetry-collector.md),
and solicited our community's feedback. It was accepted on 07-07-2023 and we got
to work.

## How we integrated OpenTelemetry with our current metric system

In Cloud Foundry we have a suite of agents responsible for forwarding logs and
metrics. The front door is a “Forwarder Agent” which accepts logs and metrics in
our own custom format and multiplexes them to the other agents.

We added support in our agent to translate metrics to OTLP and forward them onto
the OpenTelemetry Collector. This required
[just 200 lines of Go code](https://github.com/cloudfoundry/loggregator-agent-release/blob/1fd275fe85d6190bac73dc1195007cc8726c1871/src/pkg/otelcolclient/otelcolclient.go#L108-L153),
with many of those lines simply closing curly brackets. In writing this code we
had to think about how to take our existing data model and translate it into the
OpenTelemetry protobuf data model. We found OpenTelemetry to have considered
many edge cases we had encountered in the past, and plenty we had not yet
encountered. Someday we hope to understand how to use Scopes and Resources
effectively.

Our implementation worked well, though we found the OpenTelemetry Collector to
be using large amounts of CPU. We had done the simplest thing to start with, and
were only sending one metric per gRPC request. Our Collector's Resource
utilization dropped drastically when we
[added batching](https://github.com/cloudfoundry/loggregator-agent-release/pull/396).

## How it works for Cloud Foundry platform engineering teams

Platform Engineering teams can now
[optionally provide an OpenTelemetry Collector exporter configuration when deploying Cloud Foundry](https://github.com/cloudfoundry/cf-deployment/blob/fcde539a81a6b091a25d06992e16bb2fb641a329/operations/experimental/add-otel-collector.yml).
Every VM in the deployment will then run a Collector that uses that
configuration to forward metrics to the specified monitoring tools.

We’ve started small and currently only support the OTLP and Prometheus
exporters. However, we’re looking forward to hearing what additional exporters
platform engineering teams want to use, and adding them to our OpenTelemetry
Collector distribution.

## What's next

When we took on this track of work we focused exclusively on metrics. There’s a
clear path to add logs as another supported signal type for our OpenTelemetry
Collector integration. We do not yet support traces as a built-in signal in
Cloud Foundry, but we are excited about the possibilities that traces could
offer for both platform components and applications running on the platform.

Our current OpenTelemetry Collector integration offers what we call “aggregate
drains”, which egress signals generated by the platform or by applications
running on the platform. We would also like to offer “application drains”, which
would only egress signals from individual applications to the monitoring tools
of the application teams’ choice. This involves complex routing and frequent
creation and removal of exporters, which may require new OpenTelemetry Collector
features.

If we can accomplish those goals, we could replace our entire agent suite with a
single OpenTelemetry Collector running on each VM. Those Collectors would handle
logs, metrics and traces for our system components as well as every application
running on the platform.
