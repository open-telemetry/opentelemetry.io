---
title: OpenTelemetry End-User Discussions Summary for February 2023
linkTitle: End-User Discussions Feb 2023
date: 2023-03-07
author: >-
  [Pranay Prateek](https://github.com/pranay01) (SigNoz)
---

_With contributions from [Henrik Rexed](https://github.com/henrikrexed)
(Dynatrace), [Michael Hausenblas](https://github.com/mhausenblas) (AWS),
[Rynn Mancuso](https://github.com/musingvirtual) (Honeycomb),
[Reese Lee](https://github.com/reese-lee) (New Relic) and
[Adriana Villela](https://github.com/avillela) (Lightstep)_

The OpenTelemetry end-user group meet takes place every month for users in the
Americas (AMER), Europe Middle-East & Africa (EMEA), and Asia-Pacific (APAC).

The discussions take place using a
[Lean Coffee format](https://agilecoffee.com/leancoffee/), whereby folks are
invited to post their topics to the
[Agile Coffee board like this one](http://agile.coffee/#3716060f-183a-4966-8da4-60daab2842c4),
and everyone in attendance votes on what they want to talk about.

## What we talked about

Some interesting topics that were discussed this month were:

- Sampling for traces
- Emitting business metrics
- Monitoring the health of OpenTelemetry Collector
- Backup/Buffer capabilities of OTel Collector

## Discussion Highlights

Below is the summary of this month's discussions.

### OpenTelemetry Collector

#### 1 - Monitoring OTel Collector's health

**Q:** Are there any suggestions for monitoring OTel Collector's health or
patterns for collecting agent telemetry?

**A:** Collectors can be used to collect telemetry data from other Collectors,
which doesn't really need to be a disparate telemetry system. Users should also
think about collecting multiple signals so that even if one signal fails, they
get alerted by another. Here's an
[article](https://ref.otel.help/otel-collector-ops/) discussing this.

#### 2 - Timeline for OpAMP extension

**Q:** Is there any timeline for implementing the
[OpAMP spec](https://github.com/open-telemetry/opamp-spec) for agent management?

**A:** It's not a top priority as of now. It would be good to have a maintainer
from the community for OpAMP. To track progress, see 
[issue #16462](https://github.com/open-telemetry/opentelemetry-collector-contrib/issues/16462).

#### 3 - Buffer capabilities of OTel Collector

**Q:** What are some backup/retry buffer capabilities of OTel Collector when
endpoints are unavailable?

**A:** There is an experimental
[storage extension](https://github.com/open-telemetry/opentelemetry-collector/tree/main/extension/experimental/storage)
that is currently under development to support buffering and data persistence.

#### 4 - Periodically profiling Collectors to improve performance

**Q:** Is there any effort to periodically profile the Collector and improve
performance on an ongoing basis?

**A:** There is a GitHub action that runs load test on OpenTelemetry Collector,
but noone is working to improve it.

### OpenTelemetry Language API & SDKs

#### 1 - Timeline for Go SDK

**Q:** What is the timeline for full specification compliance for OTel Go SDK?

**A:** In the Go OTel SDK, the current progress is mostly around metrics. The
logging development is frozen. Major work is being done on the metrics SDK. To track
progress on Go metrics, see the
[Metric project tables](https://github.com/open-telemetry/opentelemetry-go/projects?query=metric).
Once metrics are done, logs will be taken care of.

### OpenTelemetry Traces

#### 1 - Sampling for traces

**Q:** Is there a way to sample traces based on the span counts? Example:
Drop/truncate traces which have more than 1000 spans in a single trace.

**More context:** Sometimes, due to issues in the application itself, some
traces generate a lot of spans that are not needed. Is there a way in
OpenTelemetry to control this? More specifically, is there a way in which we can
set up a condition where if a certain trace has more than ‘n’ number of spans,
we can drop or truncate the number of spans.

**A:** Tail-based sampling processor provides users with a bunch of sampling
policies. Span count is one such policy. You can also combine multiple policies.
Here's the link to tail
[sampling processor](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/processor/tailsamplingprocessor/README.md).
The span count policy is based on min span count. Some users might look for some
kind of exclusion policy.

#### 2 - Use cases of span links

**Q:** What are the use cases of span links?

**A:** [Span links](/docs/concepts/signals/traces/#span-links) are used for
implying a causal relationship between one or more spans. It was a part of the
original traces specification, and its status is now stable. It can be used to
link traces that are related but runs asynchronously.

For example, span links can be used in batched operations to link spans
initiated by multiple initiating spans. Spans can have many-to-many mappings via
links. Jaeger supports span links in its UI.

### OpenTelemetry Metrics

#### 1 - Supporting other metrics format

**Q:** Can OTel Collector support metrics generated from other libraries like
statsd library?

**A:** The
[OpenTelemetry Collector contrib](https://github.com/open-telemetry/opentelemetry-collector-contrib)
has a lot of
[receivers](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/receiver)
for different types of metrics that can be used. For example, if you are sending
out metrics in Prometheus format, you can configure your OTel Collector to
scrape Prometheus metrics. There is also a
[statsd receiver](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/receiver/statsdreceiver)
that is available. If you have something that is already working, then you don’t
need to change it. You can check the list of receivers
[here](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/receiver).

#### 2 - Emitting business metrics

**Q:** What signals are you using to emit business metrics? For instance, at an
arbitrary point in time, emit something that resembles a counter but only emit
it once.

**A:** There is a
[current issue](https://github.com/open-telemetry/opentelemetry-specification/issues/2318)
regarding this which you can track. An example of business metric can be users
landing on a particular page which can be tracked with a counter.

### OpenTelemetry Adoption & Enablement

#### 1 - Improving contributions from APAC region

**Q:** How do we improve contributions from APAC region?

**A:** Suggestions from the community:

- Reach out to current OpenTelemetry maintainers and share the challenges
- Create a list of maintainers from APAC region to whom people can reach to
- Local in-person meetups for OpenTelemetry users
- A good place to start would be `good first issues` in any of the OTel repos,
  and ask for help in GitHub issues
- Join
  [OTel slack community](https://communityinviter.com/apps/cloud-native/cncf)
  and ping in relevant channels

## Other Important discussion points

The community also discussed these important points:

#### Auto-discovery of sources to collect telemetry data

**Q:** Can OTel Collector automatically discover known sources and collect
telemetry from them?

**A:** The idea is to let OTel Collector self-configure itself to collect
telemetry from known sources. Prometheus has automatic service discovery in
Kubernetes. Currently, there is nothing in the Collector which solves this.

There is a
[receiver creator](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/receiver/receivercreator/README.md)
which can instantiate other receivers at runtime based on whether an observed
endpoint matches a configured rule. To use the receiver creator, you must first
configure one or more
[observers](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/extension/observer/README.md).
Using
[Kubernetes observer](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/extension/observer/k8sobserver#kubernetes-observer),
users should be able to detect and report Kubernetes pod, port, and node
endpoints via the Kubernetes API.

#### Hosting pattern suggestion of the OTel Collector within Azure

**Q:** Are there any suggestions for hosting pattern of the Collector within
Azure to collect telemetry from Azure App Services and Azure functions?

**A:** Usually, the community relies on folks from Microsoft to provide best
practices. There is some issue with the latest version of OTel and Azure
functions. You can track it
[here](https://github.com/Azure/azure-functions-host/issues/8938).

## Meeting Notes & Recordings

For a deeper dive into the above topics, check out the following:

- [AMER](https://docs.google.com/document/d/1p_FoGbLiDC9VPqqLblJqQtHBn3tr-aPxhu2GaIykU6k)
  meeting notes
- [EMEA](https://docs.google.com/document/d/1fh4RWyZ-ScWdwrgpRHO9mnfqLSKfxUTf4wZGdUvnnUM)
  meeting notes
- [APAC](https://docs.google.com/document/d/1eDYC97LfvE428cpIf3A_hSGirdNzglPurlxgKCmw8o4)
  meeting notes

## Join us!

If you have a story to share about how you use OpenTelemetry at your
organization, we’d love to hear from you! Ways to share:

- Join the [#otel-endusers channel](/community/end-user/slack-channel/) on the
  [CNCF Community Slack](https://communityinviter.com/apps/cloud-native/cncf)
- Join our monthly
  [End-Users Discussion Group calls](/community/end-user/discussion-group/)
- [Join our OTel in Practice sessions](/community/end-user/otel-in-practice/)
- Share your stories on the
  [OpenTelemetry blog](https://github.com/open-telemetry/opentelemetry.io/blob/954103a7444d691db3967121f0f1cb194af1dccb/README.md#submitting-a-blog-post)

Be sure to follow OpenTelemetry on
[Mastodon](https://fosstodon.org/@opentelemetry) and
[Twitter](https://twitter.com/opentelemetry), and share your stories using the
**#OpenTelemetry** hashtag!
