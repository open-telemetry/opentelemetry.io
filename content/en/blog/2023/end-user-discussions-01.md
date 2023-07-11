---
title: OpenTelemetry End-User Discussions Summary for January 2023
linkTitle: End-User Discussions Jan 2023
date: 2023-01-27
author: '[Adriana Villela](https://github.com/avillela) (Lightstep)'
aliases: [/blog/2023/otel-end-user-discussions-january-2023]
body_class: otel-with-contributions-from
spelling: cSpell:ignore OTTL january
---

With contributions from [Henrik Rexed](https://github.com/henrikrexed)
(Dynatrace), [Michael Hausenblas](https://github.com/mhausenblas) (AWS),
[Pranay Prateek](https://github.com/pranay01) (SigNoz),
[Rynn Mancuso](https://github.com/musingvirtual) (Honeycomb), and
[Reese Lee](https://github.com/reese-lee) (New Relic).

Each month, users in the OpenTelemetry (OTel) community gather to talk about how
they use OpenTelemetry in real life. Sessions are held for users in the Americas
(AMER), Europe Middle-East & Africa (EMEA), and Asia-Pacific (APAC). The
discussions take place using a
[Lean Coffee format](https://agilecoffee.com/leancoffee/), whereby folks are
invited to post their topics to the
[Agile Coffee board like this one](http://agile.coffee/#b3b37364-d40e-4029-847c-8ee059d60855),
and everyone in attendance votes on what they want to talk about.

This is a great way to meet other users in the OpenTelemetry community, and to
learn about and share practical experience on how OpenTelemetry is being used in
the wild. Each meeting is attended by an OTel Governance Committee member and/or
maintainer to help answer questions, listen to user feedback, and provide
additional context and insight into the topics discussed.

This is the first in a series of blog posts summarizing our monthly OTel End
User Discussions, starting with our January 2023 sessions.

## What we talked about

We saw a few common themes this month across our three sessions:

- OpenTelemetry adoption & enablement
- [Connectors](https://github.com/open-telemetry/opentelemetry-collector/pull/6140)
  (Collector)
- [Service Graph Processor](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/servicegraphprocessor)
  (Collector)
- Signal correlation (e.g., metrics/traces correlation, logs/traces correlation)

We’ll dig into these and more!

## Discussion highlights

Below is a summary of this month’s discussions.

### OpenTelemetry Collector

#### 1- OpenTelemetry Transformation Language (OTTL)

**Q:** Will exporters support
[OTTL](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/pkg/ottl)
(a language for transforming OpenTelemetry data)? Use case: data needs to be
transformed, but don’t want to do it in a processor.

**A:** Due to separation of concerns, it is unlikely that OTTL will be added to
exporters; however, this may be a use case for either
[connectors](https://github.com/open-telemetry/opentelemetry-collector/pull/6140)
(a new Collector component that acts as an exporter/receiver pair to join
pipelines together) or the
[routing processor](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/routingprocessor).
A routing processor reads data from an HTTP request or attribute, and routes it
to a specified exporter.

#### 2- Service Graph Processor

**Q:** How can OpenTelemetry be used to generate a service graph, generate
metrics, and send the data to a visualization tool?

**A:** The
[Service Graph Processor](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/servicegraphprocessor)
generates a service graph. This processor is still in alpha, and as a result,
some known issues around the Service Graph regarding the dependency mapping. One
span doesn’t have the entire context, and in order to get the complete picture,
you will have to send the spans to a centralized service.

#### 3- Bifurcating data in a pipeline

**Q:** If I want to use the Collector to send different sets of data to
different back-ends, what’s the best way to go about it?

**A:**
[Connectors](https://github.com/open-telemetry/opentelemetry-collector/pull/6140)
(a new Collector component that acts as an exporter/receiver pair to join
pipelines together) can be used to solve this. Connectors will be launching
soon. For more info, see the Connector PR
[here](https://github.com/open-telemetry/opentelemetry-collector/pull/6372).

Another approach would be to use a
[routing processor](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/routingprocessor).
A routing processor reads data from an HTTP request or attribute, and routes it
to a specified exporter. This is done by making new network connections, which
can make this approach inefficient.

#### 4- Managing time drift in telemetry data

**Q:** When clocks on servers are not in sync, you can end up with some data
points being recorded in the future. Can something be implemented on the OTel
Collector to mitigate this?

**A:** Clock skew is always going to happen. There is no way for clocks to be
synchronized, especially in microservices architectures. The owner of the system
that generates the telemetry is in a better position to understand the clock
nuances. The Collector is not suited to address this.

#### 5- Advanced Collector deployment and configuration

**Q:** When should I be horizontally scaling my pod vs modifying config of an
individual collector? When do I add more collectors or change collector config?

**A:** There are a few things to consider when deploying and configuring
Collectors.

- If you only have stateless components in your Collector, you can scale (add
  more replicas) based on metrics.
- You may want to shard your pipelines based on the type of processing that
  you’re doing. For example, creating one metrics pipeline, one logs pipeline,
  and one traces pipeline, because the workload for each of these pipelines is
  different.
- You might want to split your Collectors based on the type of data being
  processed. If there’s one namespace where there’s more data that comes in with
  [personally identifiable information (PII)](https://www.investopedia.com/terms/p/personally-identifiable-information-pii.asp),
  you might want to have a dedicated Collector for that namespace that uses the
  [attributes processor](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/processor/attributesprocessor/README.md).

### OpenTelemetry Adoption & Enablement

**Q:** So you’ve decided to go with OpenTelemetry at your organization…now what?
What’s the best way to promote OpenTelemetry adoption, and get developers
excited about using OpenTelemetry, without overwhelming them?

**A:** Some suggestions from the community:

- Find folks who are willing to be OpenTelemetry champions
- Pair developers new to OpenTelemetry with those who are more familiar with it
- The real value of OpenTelemetry won’t be seen until you instrument a few
  services, to see how things are stitched together.
- Developers must be mentally ready to start instrumenting their code. Keep in
  mind that it may mean going into existing code to instrument it.
- A “big bang” approach may not be the best way to adopt OpenTelemetry, as it
  may be too overwhelming for an organization. Start with a component or two.

### OpenTelemetry Language API & SDKs

#### 1- New language instrumentation

**Q:** How do you find information on OTel implementations for different
languages, for example, [Dart](https://dart.dev) and [Lua](https://www.lua.org)?

**A:** [CNCF Slack](https://communityinviter.com/apps/cloud-native/cncf) is
always a good place to start your search. There are language-specific channels,
which follow the naming convention **otel-&lt;language_name>**. If you don’t
find a channel for your language, feel free to start a discussion on the
[OpenTelemetry CNCF Slack channel](https://cloud-native.slack.com/archives/CJFCJHG4Q),
or on [GitHub](https://github.com/open-telemetry/community), like with
[this issue for OTel for Perl](https://github.com/open-telemetry/community/issues/828).
Please also check out [this page](/docs/instrumentation/other/) for more info.

#### 2- Python instrumentation

**Q:** How mature is auto-instrumentation for Python and what has been the
experience of folks working with OpenTelemetry Python?

**A:** Python auto-instrumentation is in beta; however, there are companies
using OTel Python in production, so it likely won’t cause any issues in prod. As
a SIG, OTel Python tries to minimize shipping breaking changes, but as with
everything, there is no guarantee that there will be no breaking changes. There
is no firm time frame on when Python instrumentation will be marked as stable.

### Misc Items

#### 1- OpenTelemetry exemplars

**Q:** Where can users learn more about
[Exemplars](/docs/specs/otel/metrics/data-model/) and how they are being used in
the real world?

**A:** [Exemplars](/docs/specs/otel/metrics/data-model/) are used to correlate
OpenTelemetry [metrics](/docs/concepts/signals/metrics/) to
[traces](/docs/concepts/signals/traces/). Exemplars are currently in the early
stages of development, and more work still needs to be done. For more on the
state of exemplars, check out the
[#otel-metrics channel on CNCF](https://cloud-native.slack.com/archives/C01NP3BV26R)Slack.
Please also check out
[Michael Hausenblas’ recent talk on this topic](https://www.slideshare.net/Altinity/osa-con-2022-signal-correlation-the-ho11y-grail-michael-hausenblas-awspdf).

#### 2- Correlation between traces and logs

**Q:** Is there a way to more easily correlate traces to logs?

**A:** Implementing correlation takes time and is a work in progress.
Correlation work is more mature for some languages (e.g. Java, Go) than for
others. The best approach is to raise this issue in one of the language-specific
repositories that pertains to your situation. A possible work-around is to start
traces at the log level, whereby every log will have its own associated trace.

#### 3- Profiling

**Q:** What is the status of Profiling in OpenTelemetry?

**A:** There is an OTel proposal on profiling, which has been accepted and is
being actively being worked on and discussed. The current focus is on finalizing
the protocol, before SDK work can start. You can check out the
[profiling repository on GitHub](https://github.com/open-telemetry/opentelemetry-profiling),
as well as the
[Profiling Vision pull request on GitHub](https://github.com/open-telemetry/oteps/pull/212).

#### 4- Context propagation

**Q:** Browsers cannot track context propagation automatically, and must
therefore be done manually. Current workarounds have come with a lot of
overhead. How can this be addressed?

**A:** The way to address this is to join the
[JavaScript SIG](https://cloud-native.slack.com/archives/C01NL1GRPQR) and to
raise the issue there. If anyone is actively working on an API to solve this
internally, it would be great to contribute this back to the OTel community.

## Meeting Notes & Recordings

For a deeper dive on the above topics, check out the following:

- [AMER](https://docs.google.com/document/d/1p_FoGbLiDC9VPqqLblJqQtHBn3tr-aPxhu2GaIykU6k/edit?usp=sharing)
  meeting notes +
  [Session Recording](https://www.youtube.com/watch?v=a_Hr515wl9U)
- [EMEA](https://docs.google.com/document/d/1fh4RWyZ-ScWdwrgpRHO9mnfqLSKfxUTf4wZGdUvnnUM/edit?usp=sharing)
  meeting notes
- [APAC](https://docs.google.com/document/d/1eDYC97LfvE428cpIf3A_hSGirdNzglPurlxgKCmw8o4/edit?usp=sharing)
  meeting notes

Going forward, we will be recording all End-User Discussion meetings.

## Join us!

If you have a story to share about how you use OpenTelemetry at your
organization, we’d love to hear from you! Ways to share:

- Join the [#otel-endusers channel](/community/end-user/slack-channel/) on the
  [CNCF Community Slack](https://communityinviter.com/apps/cloud-native/cncf)
- Join our monthly
  [End-User Discussion Group calls](/community/end-user/discussion-group/)
- [Join our OTel in Practice sessions](/community/end-user/otel-in-practice/)
- Share your stories on the
  [OpenTelemetry blog](https://github.com/open-telemetry/opentelemetry.io/blob/954103a7444d691db3967121f0f1cb194af1dccb/README.md#submitting-a-blog-post)

Be sure to follow OpenTelemetry on
[Mastodon](https://fosstodon.org/@opentelemetry) and
[Twitter](https://twitter.com/opentelemetry), and share your stories using the
**#OpenTelemetry** hashtag!
