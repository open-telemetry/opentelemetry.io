---
title: OpenTelemetry End User Discussions Summary for February 2023
linkTitle: End User Discussions Feb 2023
date: 2023-02-27
author: >-
  [Pranay Prateek](https://github.com/pranay01) (SigNoz) <br/> with
  contributions from: <br/> [Henrik Rexed](https://github.com/henrikrexed)
  (Dynatrace) | [Michael Hausenblas](https://github.com/mhausenblas) (AWS) | [Rynn
  Mancuso](https://github.com/musingvirtual) (Honeycomb) | [Reese
  Lee](https://github.com/reese-lee) (New Relic) | [Adriana Villela](https://github.com/avillela) (Lightstep)
---

Welcome to the highlights of OpenTelemetry End User Discussions in February 2023. The OpenTelemetry end user group meet takes place every month for users in the Americas (AMER), Europe Middle-East & Africa (EMEA), and Asia-Pacific (APAC).

The discussions take place using a [Lean Coffee format](https://agilecoffee.com/leancoffee/), whereby folks are
invited to post their topics to the [Agile Coffee board like this one](http://agile.coffee/#3716060f-183a-4966-8da4-60daab2842c4),
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

**Q:** Are there any suggestions for monitoring OTel Collector's health or patterns for collecting agent telemetry?

**A:** Collectors can be used to collect telemetry data from other collectors, which doesn't really need to be a disparate telemetry system. Users should also think about collecting multiple signals so that even if one signal fails, they get alerted by another.
Here's an [article](https://ref.otel.help/otel-collector-ops/) discussing this.

#### 2 - Timeline for opamp extension

**Q:** Is there any timeline for implementing the opamp spec for agent management?

**A:** It's not a top priority as of now. It would be good to have a maintainer from the community for opamp. You can track the issue [here](https://github.com/open-telemetry/opentelemetry-collector-contrib/issues/16462).

#### 3 - Buffer capabilities of OTel collector

**Q:** What are some backup/retry buffer capabilities of OTel collectors when endpoints are unavailable?

**A:** There is an experimental [storage extension](https://github.com/open-telemetry/opentelemetry-collector/tree/main/extension/experimental/storage) that is currently under development to support buffering and data persistence.

### OpenTelemetry Language API & SDKs

#### 1 - Timeline for Go SDK

**Q:** What is the timeline for full specification compliance for OTel Go SDK?


**A:** In the Go Otel SDK, the current progress is mostly around metrics. The logging development is frozen. Major work is being done in metrics sdk.
Go metrics progress can be tracked [here](https://github.com/open-telemetry/opentelemetry-go/projects?query=is%3Aopen). Once metrics are done, logs will be taken care of.

### OpenTelemetry Traces

#### 1 - Sampling for traces

**Q:** Is there a way to sample traces based on the span counts? Example: Drop/truncate traces which have more than 1000 spans in a single trace.

**More context:** Sometimes, due to issues in the application itself, some traces generate a lot of spans that are not needed. Is there a way in OpenTelemetry to control this? More specifically, is there a way in which we can set up a condition where if a certain trace has more than ‘n’ number of spans, we can drop or truncate the number of spans.


**A:** Tail-based sampling processor provides users with a bunch of sampling policies. Span count is one such policy. You can also combine multiple policies. Here's the link to tail [sampling processor](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/processor/tailsamplingprocessor/README.md). The span count policy is based on min span count. Some users might look for some kind of exclusion policy.


#### 2 - Use cases of span links

**Q:** What are the use cases of span links?

**A:** Span links are used to have an overview when there are thousands of spans. It helps in navigation, and answers questions like, "Where does a trace start and end?" 

### OpenTelemetry Metrics

#### 1 - Supporting other metrics format

**Q:** Can Otel collector support metrics generated from other libraries like statsd library?

**A:** The OpenTelemetry Collector contrib has a lot of receivers for different types of metrics that can be used. For example, if you are sending out metrics in Prometheus format, you can configure your Otel collector to scrape Prometheus metrics.
There is also a statsd receiver that is available. If you have something that is already working, then you don’t need to change it. You can check the list of receivers [here](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/receiver).

#### 2 - Emitting business metrics

**Q:** What signals are you using to emit business metrics? For instance, at an arbitrary point in time, emit something that resembles a counter but only emit it once.

**A:** There is a [current issue](https://github.com/open-telemetry/opentelemetry-specification/issues/2318) regarding this which you can track.


### OpenTelemetry Adoption & Enablement

#### 1 - Improving contributions from APAC region

**Q:** How do we improve contributions from APAC region?

**A:** Suggestions from the community:
- Reach out to current OpenTelemetry maintainers and share the challenges
- Create a list of maintainers from APAC region to whom people can reach to
- Local in-person meetups for OpenTelemetry users
- A good place to start would be `good first issues` in any of the OTel repos, and ask for help in GitHub issues
- Join [OTel slack community](https://communityinviter.com/apps/cloud-native/cncf) and ping in relevant channels


## Other Important discussion points

The community also discussed these important points:

- Auto-discovery of sources to collect telemetry data from
- Hosting pattern suggestion of the collector within Azure to collect from Azure App services and Azure functions
- Periodically profiling collectors to improve performance


## Meeting Notes & Recordings

For a deeper dive into the above topics, check out the following:

- [AMER](https://docs.google.com/document/d/1p_FoGbLiDC9VPqqLblJqQtHBn3tr-aPxhu2GaIykU6k/edit?usp=sharing)
  meeting notes
- [EMEA](https://docs.google.com/document/d/1fh4RWyZ-ScWdwrgpRHO9mnfqLSKfxUTf4wZGdUvnnUM/edit?usp=sharing)
  meeting notes
- [APAC](https://docs.google.com/document/d/1eDYC97LfvE428cpIf3A_hSGirdNzglPurlxgKCmw8o4/edit?usp=sharing)
  meeting notes


## Join us!

If you have a story to share about how you use OpenTelemetry at your
organization, we’d love to hear from you! Ways to share:

- Join the [#otel-endusers channel](/community/end-user/slack-channel/) on the
  [CNCF Community Slack](https://communityinviter.com/apps/cloud-native/cncf)
- Join our monthly
  [End Users Discussion Group calls](/community/end-user/discussion-group/)
- [Join our OTel in Practice sessions](/community/end-user/otel-in-practice/)
- Share your stories on the
  [OpenTelemetry blog](https://github.com/open-telemetry/opentelemetry.io/blob/954103a7444d691db3967121f0f1cb194af1dccb/README.md#submitting-a-blog-post)

Be sure to follow OpenTelemetry on
[Mastodon](https://fosstodon.org/@opentelemetry) and
[Twitter](https://twitter.com/opentelemetry), and share your stories using the
**#OpenTelemetry** hashtag!
