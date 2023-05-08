---
title: OpenTelemetry End-User Discussions Summary for April 2023
linkTitle: End-User Discussions April 2023
date: 2023-05-02
author: '[Pranay Prateek](https://github.com/pranay01) (SigNoz)'
---

For the month of April 2023, the OpenTelemetry end-user group meet took place
for users in the Asia-Pacific (APAC) region. Due to KubeCon EU, the AMER and EMEA sessions did not take place; however, we will have meetings for all 3 regions again in May.

The discussions take place using a
[Lean Coffee format](https://agilecoffee.com/leancoffee/), whereby folks are
invited to post their topics to the
[Agile Coffee board like this one](http://agile.coffee/#2f83c1c1-918c-4c78-8671-194b2e9d8e54),
and everyone in attendance votes on what they want to talk about.

## What we talked about

We talked about evangelizing the adoption of OpenTelemetry in a big organization
and also discussed how to optimize observability data at scale.

## Discussion Highlights

Below is the summary of this month's discussion.

### Evangelizing adoption of OpenTelemetry in a big organization

**Q:** How do you evangelize the adoption of OpenTelemetry in a big
organization?

**A:** In a big organization, the first step would be to put out the current
pain points of observability to leadership. There are benefits of having an open
source standard for observability. If there is no standard in place, it gets
very difficult to communicate across different teams. If you use OpenTelemetry,
you do not have to depend on any vendor agents, and you have the flexibility to
send data to multiple backends.

### How to optimize observability data at scale?

**Q:** In a big organization, observability data can be in the range of TBs per
day, which comes with associated costs. But there is always a feeling that 80%
of captured data is unusable. None of the vendors help you understand what data
is accessed and how to bring that visibility to the engineering teams sending
the data.

**A:** One of the ways to optimize observability at scale is sampling. Here's an
article on
[tail sampling with OpenTelemetry](https://opentelemetry.io/blog/2022/tail-sampling/).
There are a number of options for you to reduce the data volumes at the SDKs
level and the collector level.

Also, there is active work going on the OpenTelemetry Collector side to handle
data at scale more efficiently. For example, there is work going around using
[Apache Arrow](https://github.com/open-telemetry/oteps/pull/171) for
serialization to optimize network costs.

One of the other ways to optimize observability data at scale is to decide how
much of it you want to store for future use.

## Other Important discussion points

#### Maturity model for OpenTelemetry

**Q:** Is there some literature available around understanding steps to reach a
certain maturity level in adopting OTel in your organization? For example, I
should be able to go to a team and tell them to start with X, and then do Y to
move ahead. In a big enterprise, you have to provide something for people to
understand the maturity of OpenTelemetry.

**A:** For teams adopting OpenTelemetry, a good idea is to start with minimal
changes. For example, teams can start with languages that have
auto-instrumentation support. Seeing value from small changes can build more
confidence in the team to go deeper into OpenTelemetry adoption.

There are also several OpenTelemetry receivers
[available](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/receiver).
These receivers help to collect the telemetry end-users already have. For
example,
[Prometheus receiver](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/receiver/prometheusreceiver/README.md)
can help you receive metrics data in Prometheus format. Using these receivers,
you can start sending telemetry data from different components of your
application.


## Meeting Notes & Recordings

For a deeper dive into the above topics, check out the following:

- [APAC](https://docs.google.com/document/d/1eDYC97LfvE428cpIf3A_hSGirdNzglPurlxgKCmw8o4)
  meeting notes

## Join us!

If you have a story to share about how you use OpenTelemetry at your
organization, we’d love to hear from you! Ways to share:

- Join the [#otel-endusers channel](/community/end-user/slack-channel/) on the
  [CNCF Community Slack](https://communityinviter.com/apps/cloud-native/cncf)
- Join our monthly
  [End-User Discussion Group calls](/community/end-user/discussion-group/)
- Join our [OTel in Practice](/community/end-user/otel-in-practice/) sessions
- Share your stories on the
  [OpenTelemetry blog](https://github.com/open-telemetry/opentelemetry.io/blob/954103a7444d691db3967121f0f1cb194af1dccb/README.md#submitting-a-blog-post)

Be sure to follow OpenTelemetry on
[Mastodon](https://fosstodon.org/@opentelemetry) and
[Twitter](https://twitter.com/opentelemetry), and share your stories using the
**#OpenTelemetry** hashtag!
