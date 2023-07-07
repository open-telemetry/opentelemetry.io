---
title: 'End-User Q&A Series: Using OTel at Farfetch'
linkTitle: 'End-User Q&A: OTel at Farfetch'
date: 2023-06-07
author: '[Adriana Villela](https://github.com/avillela) (Lightstep)'
body_class: otel-with-contributions-from
spelling: cSpell:ignore Farfetch Dyrmishi Thanos
---

With contributions from [Rynn Mancuso](https://github.com/musingvirtual)
(Honeycomb) and [Reese Lee](https://github.com/reese-lee) (New Relic).

On Thursday, May 25th, 2023, the OpenTelemetry (OTel) End User Working Group
hosted its third
[End User Q&A session](/community/end-user/interviews-feedback/) of 2023. We had
a bit of a gap due to KubeCon Europe, but now we’re back! This series is a
monthly casual discussion with a team using OpenTelemetry in production. The
goal is to learn more about their environment, their successes, and the
challenges that they face, and to share it with the community, so that together,
we can help make OpenTelemetry awesome!

This month, I spoke with
[Iris Dyrmishi](https://www.linkedin.com/in/iris-dyrmishi-b15a9a164/), Platform
Engineer at [Farfetch](https://www.farfetch.com).

## Overview

Iris is a huge fan of [observability](/docs/concepts/observability-primer/) and
OpenTelemetry, and her love of these two topics is incredibly infectious.

In this session, Iris shared:

- Farfetch’s journey to OpenTelemetry
- How metrics and traces are instrumented
- OpenTelemetry Collector deployment and configuration

## Q&A

### Tell us about your role?

Iris is part of a central team that provides tools for all the engineering teams
across Farfetch to monitor their services, including traces, metrics, logs, and
alerting. The team is responsible for maintaining Observability tooling,
managing deployments related to Observability tooling, and educating teams on
instrumenting code using OpenTelemetry.

Iris first started her career as a software engineer, focusing on back-end
development. She eventually moved to a DevOps Engineering role, and it was in
this role that she was introduced to cloud monitoring through products such as
[Amazon CloudWatch](https://aws.amazon.com/cloudwatch/) and
[Azure App Insights](https://azure.microsoft.com/en-ca/products/monitor). The
more she learned about monitoring, the more it became a passion for her.

She then moved into another role where she was introduced to OpenTelemetry,
Prometheus, and Grafana, and got to dabble a little more in the world of
Observability. This role became an excellent stepping stone for her current role
at Farfetch, which she has been doing for a little over a year now.

### How did you hear about OpenTelemetry?

Iris first heard about OpenTelemetry on LinkedIn. The company she was working at
at the time, which was not using [traces](/docs/concepts/signals/traces/), had
started exploring the possibility of using them and was looking into tracing
solutions. After reading about OpenTelemetry, Iris created a small
Proof-of-Concept (POC) for her manager. While nothing had moved past the POC at
that role, when Iris joined Farfetch and OpenTelemetry came up again, she jumped
at the chance to work with it.

### What is the architecture at Farfetch like? How has OpenTelemetry helped?

Farfetch currently has 2000 engineers, with a complex and varied architecture
which includes cloud-native, Kubernetes, and virtual machines running on three
different cloud providers. There is a lot of information coming from everywhere,
with a lack of standardization on how to collect this information. For example,
Prometheus is used mostly as a standard for collecting metrics; however, in some
cases, engineers found that Prometheus did not suit their needs. With the
introduction of OpenTelemetry, Farfetch was able to standardize the collection
of both [metrics](/docs/concepts/signals/metrics/) and
[traces](/docs/concepts/signals/traces/), and enabled them to collect
[telemetry signals](/docs/concepts/signals/) from services where signal
collection had not previously been possible.

### Can you describe the build and deployment process at Farfetch?

Farfetch uses Jenkins for CI/CD, and there is a separate team that manages this.

### What Observability tooling do you use?

Iris’ team uses mostly open source tooling, alongside some in-house tooling
created by her team. On the open source tooling front:

- [Grafana](https://grafana.com) is used for dashboards
- OpenTelemetry is used for emitting traces, and
  [Grafana Tempo](https://grafana.com/oss/tempo/) is used as a tracing back-end
- [Jaeger](https://jaegertracing.io) is still used in some cases for emitting
  traces and as a tracing back-end, because some teams have not yet completely
  moved to OpenTelemetry for instrumenting traces
  ([via Jaeger’s implementation of the OpenTracing API](https://medium.com/velotio-perspectives/a-comprehensive-tutorial-to-implementing-opentracing-with-jaeger-a01752e1a8ce)).
- [Prometheus Thanos](https://github.com/thanos-io/thanos) (highly-available
  Prometheus) is used for metrics collection and storage
- OpenTelemetry is also being used to collect metrics

### Tell us about Farfetch’s OpenTelemetry journey

Farfetch is a very Observability-driven organization, so when senior leadership
floated the idea of bringing OpenTelemetry into the organization, it got
overwhelming support across the organization. The biggest challenge faced around
OpenTelemetry was around timing for its implementation; however, once work on
OpenTelemetry started, everyone embraced it.

### How did you and your team enable Observability through OpenTelemetry?

By the time Iris joined Farfetch, most of the big struggles and challenges
around Observability had passed. When Observability was first introduced within
the organization, it was very new and unknown to many engineers there, and as
with all new things, there is a learning curve.

When Iris and her team took on the task of enabling OpenTelemetry across the
organization, Observability as a concept had already been embraced. Their
biggest challenge in bringing OpenTelemetry to Farfetch was making sure that
engineers did not experience major disruptions to their work, while still
benefiting from having OpenTelemetry in place. It helped that OpenTelemetry is
compatible with many of the tools in their existing Observability stack,
including Jaeger and Prometheus.

Due to the enthusiasm, drive, and push that Iris and one of her co-workers, an
architect at Farfetch, made for OpenTelemetry, Iris was proud to share that they
are now using OpenTelemetry in production.

### How long did it take your team to get OpenTelemetry in production?

Iris and her team planned to start using OpenTelemetry in January 2023. This
included initial investigation and information-gathering. By mid-March, they had
their first pieces in production.

They are not fully there yet:

- There is still a lot of reliance on Prometheus and Jaeger for generating
  metrics and traces, respectively
- Not all applications have been instrumented with OpenTelemetry

In spite of that, Iris and her team are leveraging the power of the
[OpenTelemetry Collector](/docs/collector/) to gather and send metrics and
traces to various Observability back-ends. Since she and her team started using
OpenTelemetry, they started instrumenting more traces. In fact, with their
current setup, Iris has happily reported that they went from processing 1,000
spans per second, to processing 40,000 spans per second!

### How are you collecting your traces right now?

Traces are being collected through a combination of
[manual and auto instrumentation](/docs/concepts/instrumentation/).

Some applications are being manually instrumented through OpenTelemetry, and
others are still instrumented using the [legacy OpenTracing
[using shims](/docs/migration/opentracing/).

The OpenTelemetry Operator is being implemented to auto-instrument Java and .NET
code. Among other things, the [OTel Operator](/docs/k8s-operator/) supports
injecting and
[configuring auto-instrumentation](/docs/k8s-operator/automatic/#configure-automatic-instrumentation)
in .NET, Java, Python, and Node.js. Iris hopes that Go auto-instrumentation will
be available in the near-future. To track progress of auto-instrumentation in
Go, see
[OpenTelemetry Go Automatic Instrumentation](https://github.com/open-telemetry/opentelemetry-go-instrumentation).

Although this will be a lengthy and time-consuming process, the team’s goal is
to have all applications instrumented using OpenTelemetry.

### What kind of support does your team provide for manual instrumentation?

By design, Iris and her team don’t instrument other teams’ code. Instead, they
provide documentation and guidelines on manual instrumentation, and refer teams
to the OpenTelemetry docs where applicable. They also have sessions with
engineers to show them best practices around instrumenting their own code. It’s
a team sport!

### Can you share your experience around using the OTel Operator?

The OTel Operator is only partially used in production, and is currently not
available for everyone. Iris and her team really love the OTel Operator;
however, it did take a bit of getting used to. Iris and her team found that
there is a tight coupling between [cert-manager](https://cert-manager.io/) and
the OTel Operator. They were not able to use our own custom certificates, and
they did not support [cert-manager](https://cert-manager.io/) in their clusters,
so they found it hard to use the Operator in our clusters. They solved this by
submitting a PR --
[opentelemetry-helm-charts PR #760](https://github.com/open-telemetry/opentelemetry-helm-charts/pull/760)!

One of the things she loves about OpenTelemetry was that, when she was trying to
troubleshoot an issue whereby Prometheus was not sending metrics to the
Collector, and was therefore not able to create alerts from it. Then a colleague
suggested using OpenTelemetry to troubleshoot OpenTelemetry.

### Have you or anyone on your team or at Farfetch started playing with OTel Logging?

Iris has played around a bit with OTel [logging](/docs/concepts/signals/logs/),
mostly consuming logs from a
[Kafka topic](https://developer.confluent.io/learn-kafka/apache-kafka/topics/).
This experiment has not included
[log correlation](/docs/specs/otel/logs/#log-correlation), but it is something
that Iris would like to explore further.

Since logs are not yet stable, Iris doesn’t expect logging to go into production
at Farfetch just yet. Farfetch has a huge volume of logs (more than traces), so
they don’t want to start converting to OTel logging until things are more
stable.

> **Note**: some parts of OTel logs are stable. For details, see
> [Specification Status Summary](/docs/specs/status/#logging).

### How are you collecting the metrics signal?

Auto-instrumentation emits some
[OTLP](https://github.com/open-telemetry/opentelemetry-proto/blob/main/docs/specification.md)
metrics; however, the majority of metrics still come from Prometheus.

The team currently uses the
[Prometheus Receiver](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/receiver/prometheusreceiver/README.md)
to scrape metrics from [Consul](https://consul.io). Specifically, they use
Consul to get the targets and the ports where to scrape them. The
[Receiver’s scrape configs](https://github.com/prometheus/prometheus/blob/v2.28.1/docs/configuration/configuration.md#scrape_config)
are the same as in Prometheus, so it was relatively easy to move from Prometheus
to the Prometheus Receiver (lift and shift).

They also plan to collect OTLP metrics from Kubernetes. This is facilitated by
the Prometheus Receiver’s support for the
[OTel Operator’s Target Allocator](https://github.com/open-telemetry/opentelemetry-operator#target-allocator).

Prometheus is also still currently used for metrics collection in other areas,
and will probably remain this way, especially when collecting metrics from
virtual machines.

### How many Kubernetes clusters are you observing?

There are 100 Kubernetes clusters being observed, and thousands of virtual
machines. Iris and her team are responsible for managing the OTel Operator
across all of these clusters, and are therefore also trained in Kubernetes, so
that they can maintain their stack on the clusters.

### Have you dabbled in any of the OTel experimental features in Kubernetes?

> This question is referring to the ability for Kubernetes components to emit
> OTLP traces which can then be consumed by the OTel Collector. For more info,
> see
> [Traces For Kubernetes System Components](https://kubernetes.io/docs/concepts/cluster-administration/system-traces/).
> This feature is currently in beta, and was first introduced in
> [Kubernetes 1.25](https://sysdig.com/blog/kubernetes-1-25-whats-new/).

Iris and team have not played around with this beta feature.

### How do you deploy your OTel Collectors?

Because there are so many Kubernetes clusters, having a single OTel Collector
would be a bottleneck in terms of load and single point of failure. The team
currently has one
[OpenTelemetry Collector agent](/docs/collector/deployment/agent/) per
Kubernetes cluster. The end goal is to replace those agents with the
[OTel Operator](/docs/k8s-operator/) instead, which allows you to deploy and
configure the OTel Collector and inject and configure auto-instrumentation.

Everything is then sent to a central OTel Collector (i.e. an
[OTel Collector gateway](/docs/collector/deployment/gateway/)) per data center,
where data masking (using the
[transform processor](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/transformprocessor),
or
[redaction processor](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/redactionprocessor)),
data sampling (e.g.
[tail sampling processor](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/tailsamplingprocessor)
or
[probabilistic sample processor](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/probabilisticsamplerprocessor)),
and other things happen. It then sends traces to Grafana Tempo.

The central OTel Collector resides on another Kubernetes cluster that belongs
solely to the Farfetch Observability team, which runs the Collector and other
applications that belong to the team.

### What happens if the central Collector fails?

The team has fallback clusters, so that if a central Collector fails, the
fallback cluster will be used in its place. The satellite clusters are
configured to send data to the central Collector on the fallback cluster, so if
the central cluster fails, the fallback cluster can be brought up without
disruption to OTel data flow.

Having autoscaling policies in place to ensure that the Collectors have enough
memory and CPU to handle data loads also helps to keep the system highly
available.

### What were some of the challenges you experienced in deploying the OTel Collector?

The biggest challenge was getting to know the Collector and how to use it
effectively. Farfetch relies heavily on auto-scaling, so one of the first things
that the team did was to enable auto-scaling for the Collectors, and tweak
settings to make sure that it could handle large amounts of data.

The team also leaned heavily on
[OTel Helm charts](https://github.com/open-telemetry/opentelemetry-helm-charts/tree/main/charts),
and on the OTel Community for additional support.

Are you currently using any processors on the OTel Collector? \
The team is currently experimenting with processors, namely for data masking ([transform processor](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/transformprocessor),
or [redaction processor](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/redactionprocessor)),
especially as they move to using OTel Logs, which will contain sensitive data that
they won’t want to transmit to their Observability back-end. They currently, however,
are only using the [batch processor](https://github.com/open-telemetry/opentelemetry-collector/blob/main/processor/batchprocessor/README.md).

### Are you aware of any teams using span events?

> A [span event](/docs/concepts/signals/traces/#span-events) provides additional
> point-in-time information in a trace. It’s basically a structured log within a
> span.

Not at the moment, but it is something that they would like to explore. When the
Observability team first started, there was little interest in tracing. As they
started implementing OpenTelemetry and tracing, they have moved to make traces
first-class citizens, and now it is piquing the interest of engineers, as they
begin to see the relevance of traces.

### Have you encountered anyone who was resistant to OpenTelemetry?

Farfetch is a very Observability-driven culture, and the Observability team
hasn’t really encountered anyone who is against Observability or OpenTelemetry.
Some engineers might not care either way, but they are not opposed to it,
either.

### Have you or your team made any contributions to OpenTelemetry?

The team, led by the architect, has made a contribution recently to the OTel
Operator around certificates. The OTel Operator relied on
[cert-manager](https://cert-manager.io/) for certificates, rather than custom
certificates. They initially put in a feature request, but then decided to
develop the feature themselves, and
[filed a pull request](https://github.com/open-telemetry/opentelemetry-helm-charts/pull/760).

## Audience Questions

### How much memory and CPU?

When their Collector was processing around 30,000 spans per second, there were 4
instances of the Collector, using around 8GB memory.

### Are you doing any correlation between metrics data, trace data, and log data?

This is something that is currently being explored. The team is exploring
[traces/metrics correlation (exemplars)](/docs/specs/otel/metrics/data-model/#exemplars)
through OpenTelemetry; however, they found that this correlation is accomplished
more easily through their tracing back-end, Tempo.

### Are you concerned about the amount of data that you end up producing, transporting, and collecting? How do you ensure data quality?

This is not a concern, since the volume of data never changed, and the team
knows that they can handle these large volumes. The team is simply changing how
the data is being produced, transported, and collected. Iris also recognizes
that the amount of trace data is gradually increasing; however, the data
increase is gradual, so that the team can prepare itself to handle larger data
volumes.

The team is working very hard to ensure that they are getting quality data. This
is especially true for metrics, where they are cleaning up metrics data to make
sure that they are processing meaningful data. If a team decided to drastically
increase the volume of metrics it emits, the Observability team is consulted
beforehand, to ensure that the increase makes sense.

Since trace volumes were initially a low lower, they did not need to concern
themselves with trace sampling. Now that trace volume is increasing, they are
keeping a close eye on things.

The team is also focusing its attention on data quality and volume of logs,
which means researching log processors to see which ones suit their needs.
Ultimately, they will publish a set of guidelines for development teams to
follow, and evangelize practices within the company.

## Feedback

Iris and her team have had a very positive experience with OpenTelemetry and the
OpenTelemetry community.

### Documentation

Iris shared that the docs at times are not as clear as they could be, requiring
some extra digging on the part of the engineer, to understand how a certain
component works or is supposed to be configured. For example, she had a hard
time finding documentation on
[Consul SD configuration](https://prometheus.io/docs/prometheus/latest/configuration/configuration/)
for OpenTelemetry. That being said, Iris is hoping to contribute back to docs to
help improve them.

### Turnaround time on PRs

Iris and her team were pleasantly surprised by the quick turnaround time on
getting their
[OTel Operator PR](https://github.com/open-telemetry/opentelemetry-helm-charts/pull/760)
approved and merged.

## Additional Resources

My conversation with Iris, in full, is
[available on YouTube](https://youtu.be/9iaGG-YZw5I).

If anyone would like to continue the conversation with Iris, reach out to her in
the [#otel-user-research](https://cloud-native.slack.com/archives/C01RT3MSWGZ)
Slack channel!

She will also be presenting at
[OTel in Practice on June 8th](https://shorturl.at/bqtxO).

## Final Thoughts

OpenTelemetry is all about community, and we wouldn’t be where we are without
our contributors, maintainers, and users. Hearing stories of how OpenTelemetry
is being implemented in real life is only part of the picture. We value user
feedback, and encourage all of our users to share your experiences with us, so
that we can continue to improve OpenTelemetry. ❣️

If you have a story to share about how you use OpenTelemetry at your
organization, we’d love to hear from you! Ways to share:

- Join the [#otel-endusers channel](/community/end-user/slack-channel/) on the
  [CNCF Community Slack](https://communityinviter.com/apps/cloud-native/cncf)
- Join our monthly
  [End Users Discussion Group calls](/community/end-user/discussion-group/)
- Join our [OTel in Practice sessions](/community/end-user/otel-in-practice/)
- Sign up for one of our
  [monthly interview/feedback sessions](/community/end-user/interviews-feedback/)
- Join the
  [OpenTelemetry group on LinkedIn](https://www.linkedin.com/groups/14081251)
- Share your stories on the
  [OpenTelemetry blog](https://github.com/open-telemetry/opentelemetry.io/blob/main/README.md#submitting-a-blog-post)

Be sure to follow OpenTelemetry on
[Mastodon](https://fosstodon.org/@opentelemetry) and
[Twitter](https://twitter.com/opentelemetry), and share your stories using the
**#OpenTelemetry** hashtag!
