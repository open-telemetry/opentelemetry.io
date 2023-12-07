---
title: 'End-User Q&A Series: Using OTel at Uplight'
linkTitle: 'End-User Q&A: OTel at Uplight'
date: 2023-03-20
author: '[Adriana Villela](https://github.com/avillela) (Lightstep)'
body_class: otel-with-contributions-from
cSpell:ignore: hackathons Uplight
---

With contributions from [Rynn Mancuso](https://github.com/musingvirtual)
(Honeycomb) and [Reese Lee](https://github.com/reese-lee) (New Relic).

On Thursday, March 2nd, 2023, the OpenTelemetry (OTel) End User Working Group
hosted its second
[End User Q&A session](/community/end-user/interviews-feedback/) of 2023. This
series is a monthly casual discussion with a team using OpenTelemetry in
production. The goal is to learn more about their environment, their successes,
and the challenges that they face, and to share it with the community, so that
together, we can help make OpenTelemetry awesome!

This month, I spoke with
[Doug Ramirez](https://www.linkedin.com/in/dougramirez/), Principal Architect at
[Uplight](https://uplight.com).

## Overview

Doug loves observability, and by extension, OpenTelemetry, because of the
excitement that he gets from getting feedback for code that he has written.

In this session, Doug shared:

- His organization’s OpenTelemetry journey
- How he has evangelized OpenTelemetry at Uplight
- Challenges that he encountered in Uplight’s OpenTelemetry journey, along with
  a few suggestions for improvement.

## Q&A

### Tell us about your role?

Uplight is made up of a number of companies that were brought together as a
result of mergers and acquisitions, and now all exist under the Uplight brand.
Its mission is to save the planet, by helping utilities operate their grid to
minimize resource consumption and offset CO2 emissions. The organization has a
main data platform that centralizes large data sets for utilities. As they’ve
grown, the Uplight data platform has become an extremely important component
that enables the apps that ultimately deliver value to its customers.

Doug’s role as Principal Architect on the platform is to help design and
architect the platform in ways that satisfy business requirements, while also
allowing developers to easily leverage the platform. To help achieve that, he
has optimized on observability as an architecture characteristic, having spent a
significant amount of time in the past year talking about and thinking about
observability, and baking it into everything

### What do you think that Observability will help you solve?

Because Uplight is a conglomerate of companies, it means that there are
different tech stacks, different design patterns, and different ways to approach
the same problems.

In spite of having all these different systems with different stacks, Doug feels
that it is essential to be able observe them all running together, as a cohesive
unit. He wants to create the same experience for developers across the company
to observe their code, irrespective of the tech stack that they’re using – i.e.
a common path to observability. This is being achieved by leaning into
OpenTelemetry as the standard and tool to get there.

### What is your architecture like?

Uplight uses “everything”, including a lot of Ruby, Java, Python, some .NET, and
as a result, it’s hard to describe the tech stack. There’s a lot of legacy code.
There are many monoliths. New development work is being written in Python, and
they are leveraging [FastAPI](https://fastapi.tiangolo.com) for micro-services
work.

With so many different languages and frameworks being used, the question was,
how do you get observability and OTel injected or baked into these different
platforms?

The ultimate goal was to get folks to understand OpenTelemetry and the long-term
vision around observability. Most developers are familiar and comfortable with
logs – they just want to be able to write a log and see what happens. So, Doug
started by getting developers to add
[OpenTelemetry (structured) logs](/docs/specs/otel/logs/) to all of the services
across their various platforms. In order to leverage OTel logs, developers had
to add the
[OpenTelemetry language-specific SDKs](/docs/concepts/sdk-configuration/) into
their code. Once they got past that initial hump and got the SDKs into their
code, it then became easier for developers to add
[other signals](/docs/concepts/signals/) (such as
[metrics](/docs/concepts/signals/metrics/) and
[traces](/docs/concepts/signals/traces/)) to the code as well, since the OTel
scaffolding was already in place!

Doug and his team realized that the problem of structured logging had already
been solved by OpenTelemetry. Contributors and maintainers have thought long and
hard about logging and standardization on structure, and it didn’t make sense to
reinvent the wheel. The log spec already existed, so Uplight chose to ride the
coattails of OTel, in order for developers to get to their observability path
more quickly and easily. Again, in adopting OpenTelemetry logs, adopting
[traces](/docs/concepts/signals/traces/) and
[metrics](/docs/concepts/signals/metrics/) became a natural next step.

### What is your build and deployment process like?

Builds are done using [CircleCI](https://circleci.com) and
[Jenkins](https://www.jenkins.io). Everything is run in containers, and they use
all of the cloud providers. They are working to standardize on tooling and
processing for deploying to the cloud.

### OTel logs are relatively new. Why use something so new?

As one of the [newer OpenTelemetry signals](/docs/specs/otel/logs/), there was a
lot of concern around the maturity of logs. There were also many concerns about
whether OTel itself would go away, or whether logs would be eliminated from the
spec. All of that unease was put to rest once the folks at Uplight began
exploring and using log correlation – i.e. linking logs to traces.

### What were some of the challenges on the road to OTel?

One of the biggest challenges faced internally at Uplight was defending against
vendor lock-in, while still emitting meaningful telemetry data in order to
achieve observability. Some folks at Uplight felt that the SDKs provided by
their APM vendor did the job; however, that meant vendor lock-in.

Providing a good developer experience was key. It was important to show
developers that they could instrument their code easily, using a framework that
has become the de facto standard for instrumentation, and which is also
portable, so it won’t keep them locked into a particular vendor.

The hearts and minds of developers began to change after they were able to
experience OpenTelemetry in action:

- Seeing structured logs, being able to correlate traces and logs, and emitting
  metrics.
- Experiencing the benefits of
  [context propagation](/docs/instrumentation/js/propagation/) – i.e. spans and
  traces interacting across different operations to provide an end-to-end view
  of a service call.

### How did you promote OpenTelemetry across the organization?

There was a lot of internal debate on whether or not OpenTelemetry was mature
enough to warrant adoption. As a result, Doug spent a lot of time educating
folks on OpenTelemetry, to show that OpenTelemetry was not bleeding edge (it’s
been around for a while), and that it has the support of the major Observability
vendors. In fact, these vendors are all talking about it on their blogs. These
efforts helped get buy-in from both Uplight’s leadership and engineers.

Doug’s main architecture goals at Uplight are observability, deployability, and
security. Part of the observability narrative included talking about
OpenTelemetry and showing folks how it all works. To do that, Doug has created a
number of short internal [Loom](https://loom.com) videos, inspired by
[Microsoft’s Channel 9](<https://en.wikipedia.org/wiki/Channel_9_(Microsoft)>).
The Loom videos have been a very effective means of sharing information about
OpenTelemetry (both theory and code snippets) very quickly across the
organization. They have been extremely well-received. Video topics have included
structured logging, metrics, traces, and integrating distributed tracing with
webhook platforms.

Internal hackathons have also proven to be a very effective means of promoting
OpenTelemetry, and getting folks to use it.

### How have developers found the experience of integrating the OTel SDKs into the application code?

One of Doug’s goals with OpenTelemetry was to create a pleasant developer
experience around implementing the language SDKs. There was a lot of internal
debate on whether or not shared libraries would help lower the barrier to entry
for implementing the OTel SDK. It was ultimately decided to allow teams to
choose their own path: some teams are implementing Uplight shared libraries,
others are leveraging code snippets from a reference architecture created by
Doug, and others are using the SDK directly.

Doug’s main takeaway is for folks to just start using OpenTelemetry right away,
get to know it, and not worry about creating shared libraries.

### Manual or auto-instrumentation?

Folks at Uplight have used a combination of manual and auto-instrumentation.
Doug’s main advice is to do the minimum you need to get instrumentation up and
running, do the minimum required to get traces and logs emitted and correlated,
and then refine as needed.

The SDKs give you everything you need. How much you decided to optimize on top
of that is up to you. Doug’s advice is to do the minimum you need to get started

### How do you deploy your OTel Collectors?

Uplight currently has a few different Collector configurations:

- Collectors running standalone as some
  [sidecars](https://github.com/open-telemetry/opentelemetry-operator#deployment-modes)
- For larger Kubernetes clusters, there’s a
  [Collector running in each cluster](/docs/collector/installation/#kubernetes)
- Developers running their own Collectors
  [locally with Docker](/docs/collector/installation/#docker)

Doug’s ultimate goal is for any deployment in any environment to be able to
easily send telemetry to an
[OTel Collector gateway](/docs/collector/deployment/gateway/).

Collectors at Uplight are typically run and maintained by the infrastructure
team, unless individual teams decide to take ownership of their own Collectors.
Those who do take ownership of their own Collectors have had a positive
experience thus far. Uplight may revisit whether or not development teams should
own their own Collectors at a later date, but for now, giving developers a quick
path to standing up the Collector is more important to help further
OpenTelemetry adoption.

## Feedback

### Community Engagement

Doug has had a very positive experience with OpenTelemetry so far. He has been
happy to see that the OTel community is very active on the
[CNCF Community Slack](https://communityinviter.com/apps/cloud-native/cncf), and
recommends for anyone new to OpenTelemetry to just join some OTel Channels (e.g.
[#otel-collector](https://cloud-native.slack.com/archives/C01N6P7KR6W),
[#otel-logs](https://cloud-native.slack.com/archives/C01N5UCHTEH),
[#otel-python](https://cloud-native.slack.com/archives/C01PD4HUVBL)) and just
see what people are talking about. The conversations happening in the various
channels have helped inform his decisions at Uplight.

### Contribution

Doug has made some contributions to the Python SDK; however, it took a little
bit of time to understand the logistics of contributing. He was initially unsure
about how to get engaged, who to talk to in Slack, and how to nudge folks to
request a review of his PRs. Anything that can be done to make it super easy and
obvious for people to contribute would be super helpful.

### Communication

Doug has found it challenging to determine where to go for certain types of
conversations. Is it GitHub issues, or Slack? Where do you go if you’re someone
new who wants to make a contribution? Where do you go if you’re new to OTel and
are seeing a problem? How do you ensure that the conversations are not being
duplicated?

### Simple Reference Implementations

Doug would like to see really simple reference implementations to help folks who
are starting OTel from scratch. For example, they’re running a simple “Hello
World” program to send data to the Collector, and nothing is showing up, and
need some guidance around this. How do we help folks who aren’t super familiar
with Docker and aren’t super familiar with OpenTelemetry? Can we have some super
simple reference implementations to hold folks’ hands as they get started? For
example, for a Ruby developer, clone X repository, run `docker compose up`[^1],
and everything should be up and running. That way, they can focus on learning
OpenTelemetry, rather than mess around with Docker networking and other
distracting things.

I shared with Doug that we have the
[OTel Demo App](https://github.com/open-telemetry/opentelemetry-demo#-opentelemetry-demo)
(and [#otel-community-demo](https://cloud-native.slack.com/archives/C03B4CWV4DA)
channel on Slack), which provides an OTel-example-in-a-box. I also shared the
[#otel-config-file](https://cloud-native.slack.com/archives/C0476L7UJT1) Slack
channel, which aims to simplify OTel bootstrapping

Doug would like to see a more targeted, language-specific example in a box. For
example, a FastAPI example with 2 Python services talking to each other, to
demonstrate context propagation, going through the Collector, which sends traces
to Jaeger.

## What's next?

If you’d like to see my conversation with Doug in full, you can check out the
video [here](https://www.youtube.com/watch?v=ptYWBF-R1Fc).

If anyone would like to continue the conversation with Doug, please reach out to
him in the
[#otel-user-research](https://cloud-native.slack.com/archives/C01RT3MSWGZ) Slack
channel!

Also, be sure to check out more of Doug's OTel adventures at this month's
[OTel in Practice series, on March 27th, 09:00 PT/11:00 ET](http://surl.li/fqdox).

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
  [OpenTelemetry blog](https://github.com/open-telemetry/opentelemetry.io/blob/954103a7444d691db3967121f0f1cb194af1dccb/README.md#submitting-a-blog-post)

Be sure to follow OpenTelemetry on
[Mastodon](https://fosstodon.org/@opentelemetry) and
[Twitter](https://twitter.com/opentelemetry), and share your stories using the
**#OpenTelemetry** hashtag!

[^1]: {{% _param notes.docker-compose-v2 %}}
