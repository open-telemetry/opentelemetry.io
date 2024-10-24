---
title:
  'OTel End User Working Group Presents: The Future of Observability Panel
  Discussion'
linkTitle: The Future of Observability Panel
date: 2023-10-21
author: >-
  [Adriana Villela](https://github.com/avillela) (Lightstep)
cSpell:ignore: Dyrmishi Farfetch Iris Mellifera Nočnica Samuel Vijay youtube
---

OpenTelemetry has greatly impacted the
[Observability](/docs/concepts/observability-primer/) landscape over the past
few years. While it introduces an open standard for telemetry generation and
collection, what is actually improving the lives of Observability teams?

Guests [David Wynn](https://www.linkedin.com/in/davidbwynn/),
[Austin Parker](https://www.linkedin.com/in/austinlparker/),
[Vijay Samuel](https://www.linkedin.com/in/vjsamuel/),
[Nočnica Mellifera](https://www.linkedin.com/in/otel-mom/), and
[Iris Dyrmishi](https://www.linkedin.com/in/iris-dyrmishi-b15a9a164/) came
together to share their experiences and insights on the evolution of
Observability practices, in this panel hosted by the
[OpenTelemetry End User Working Group](/community/end-user/). The discussion
centered around their journey with OpenTelemetry and how it has shaped their
Observability practices. Watch the full recording:

{{<youtube zSeKL2-_sVg>}}

<br/>For a quick summary, check out some of the key discussion takeaways below.

## 1- Observability Before OpenTelemetry

The panelists started off by talking about their experiences before
OpenTelemetry. Challenges included the lack of standardization, the use of
proprietary clients, and difficulties in monitoring large, complex systems.
Observability practices were often driven by specific tools and technologies,
leading to fragmented solutions.

Companies like [eBay](/blog/2022/why-and-how-ebay-pivoted-to-opentelemetry/) and
[Farfetch](/blog/2023/end-user-q-and-a-03/) found value in adopting
OpenTelemetry due to its standardization of telemetry data and its
vendor-neutrality.

## 2- OpenTelemetry as a Game Changer

OpenTelemetry emerged as a game-changing solution for enabling Observability. It
provided a standardized approach to instrumenting applications. The adoption of
OpenTelemetry allowed for seamless integration across various systems and
languages. The community-driven and open source nature of OpenTelemetry appealed
to many organizations, making Observability more accessible and
developer-friendly.

## 3- The OpenTelemetry Collector

The panelists talked about the [OpenTelemetry Collector](/docs/collector/), and
how they were able to use it to replace vendor-specific agents. Some
organizations built their own Collector distributions to meet their own
requirements using the
[Collector Builder tool](/docs/collector/custom-collector/) tool. In doing so,
they were able to include only the components that were applicable to their use
case, including using custom processors.

## 4- Surprising Aspects of OpenTelemetry Adoption

Challenges included convincing teams to adopt OpenTelemetry, especially when
components like [Logs](/docs/concepts/signals/logs/) were not yet stable. The
evolving nature of OpenTelemetry made sometimes challenging to keep up with new
features and updates while ensuring that teams did not lag behind.

## 5- The People Problem of Observability

Observability, like so many issues in the tech industry is more of a people
problem than a technical problem. Successful OpenTelemetry adoption and
implementation required addressing cultural and organizational challenges,
including leadership buy-in and developer acceptance.

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
- Contact us on the
  [CNCF Community Slack](https://communityinviter.com/apps/cloud-native/cncf)
  for any other types of sessions you'd like to see!

Be sure to follow OpenTelemetry on
[Mastodon](https://fosstodon.org/@opentelemetry) and
[LinkedIn](https://www.linkedin.com/company/opentelemetry/), and share your
stories using the **#OpenTelemetry** hashtag!

And don't forget to subscribe to our
[YouTube channel](https://youtube.com/@otel-official) for more great
OpenTelemetry content!
