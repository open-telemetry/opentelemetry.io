---
title: OpenTelemetry End-User Discussions Summary for March 2023
linkTitle: End-User Discussions Mar 2023
date: 2023-03-30
author: '[Reese Lee](https://github.com/reese-lee) (New Relic)'
body_class: otel-with-contributions-from
cSpell:ignore: distro distros firehosing telecommand
---

With contributions from [Henrik Rexed](https://github.com/henrikrexed)
(Dynatrace), [Michael Hausenblas](https://github.com/mhausenblas) (AWS),
[Rynn Mancuso](https://github.com/musingvirtual) (Honeycomb),
[Adriana Villela](https://github.com/avillela) (Lightstep), and
[Pranay Prateek](https://github.com/pranay01) (SigNoz).

The OpenTelemetry end-user group meet takes place every month for users in the
Americas (AMER), Europe Middle-East & Africa (EMEA), and Asia-Pacific (APAC).

The discussions take place using a
[Lean Coffee format](https://agilecoffee.com/leancoffee/), whereby folks are
invited to post their topics to the
[Agile Coffee board like this one](http://agile.coffee/#3716060f-183a-4966-8da4-60daab2842c4),
and everyone in attendance votes on what they want to talk about.

## What we talked about

Sampling and collector capabilities continue to be topics of interest, along
with questions about instrumentation and adoption.

## Discussion Highlights

Below is the summary of this month's discussions.

### OpenTelemetry Collector

#### 1 - Losing gRPC with Azure App Services

**Q:** When looking at the hosting models in Azure for the OTel Collector, only
HTTP is supported (for running in Azure App Service). What are the risks
associated with losing gRPC capability?

**A:** If HTTP/2 is supported in Azure, gRPC might work there, since gRPC is
HTTP under the hood with extra complications built on top of HTTP/2. One
suggestion is to follow up with Microsoft about gRPC support, as it may have
very long-running connections.

#### 2 - Uptime monitoring/synthetics

**Q:** Does the OTel Collector have the capability to do uptime monitoring/
synthetics? If not, are there any plans to work towards such a thing?

**A:** The
[health check](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/extension/healthcheckextension/README.md)
might be a helpful reference. Also check out the
[HTTP check receiver](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/extension/healthcheckextension/README.md).

#### 3 - Collector distributions

**Q:** Should I use a vendor distribution versus the community collector
distribution?

**A:** Each vendor distribution will come with customizations, whereas the
community Collector distribution will include everything: receivers and
exporters. If you need the flexibility, then you should use the OTel Collector
distro.

#### 4 - Rate limiting on receivers

**Q:** Are there any plans for enabling rate limiting and circuit breaks on
receivers? Imagine having lots of clients sending telemetry to the same set of
OTel collectors.

**More context**: How do I rate-limit in a situation where I have collectors for
traces, metrics, and logs, and I’m receiving traffic from more than 100
individual apps? If I have even one customer who is generating heavy traffic, it
might impact the overall health of my collectors.

**A:** Use a reverse proxy. Something to note is that once the data is inside
the collector, the data is already being deserialized, and you’ve already
started firehosing the collector, so it’s a bit late to rate limit at that
point. One approach might be to add additional headers when you configure your
SDKs that contain the additional information, which would help with load
balancing.

#### 5 - Connectors

**Q:** What is a connector?

**A:** A connector is a collector component that consumes telemetry signals as
an exporter in one pipeline, and emits it as a receiver in another pipeline.
[Read more here](https://o11y.news/2023-03-13/#opentelemetry-connectors).

#### 6 - Definitions of upstream, downstream, and distro

**Q:** What is upstream? Downstream? Distro?

**A:** The terms "upstream" and "downstream" refer to how services or components
in a system are connected to each other. Check out
[this article](https://reflectoring.io/upstream-downstream/) for more
information as it applies to different situations in software.

The term "distro" is short for distribution. For a list of vendors that provide
distros, see [Vendors](/ecosystem/vendors/).

### Sampling

#### 1 - Tail sampling

**Q:** What are the perceived downsides of tail sampling, for example, on all
HTTP requests that have errors or long latencies, instead of just relying on
head-based sampling? Are there best practices around trace sampling? Tail
sampling can get very expensive.

**A:** Generally, head sampling is not recommended, as you aren’t going to be
able to do 100% of what you want to do with it, but it is true that tail
sampling is expensive. The reason why sampling is such a complicated discussion
is that there really isn’t a universal answer; furthermore, it also depends on
what kind of features are offered by your data analysis tool. For example, do
you have a data ingest or storage cost? If you have ingest cost, you’ll want to
sample before the data gets ingested; if it’s storage cost, you’ll have to
delete a lot of the data, so it depends on the tradeoffs.

One thing to consider is that you can use tail sampling on attributes, such as
if there’s an error on a span, but it does require more memory. Suggested
further exploration:

- [Column data store for OpenTelemetry](https://github.com/open-telemetry/oteps/pull/171)
- [OpAMP](/blog/2022/opamp/)
- Your backend vendor’s tail-based sampling strategies
- [Paper by Uber](https://www.uber.com/en-IN/blog/crisp-critical-path-analysis-for-microservice-architectures/)
- [Tail sampling processor](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/processor/tailsamplingprocessor/README.md)

### Adoption, Migration, and Implementation

#### 1 - Common migration challenges

**Q:** What are common challenges faced by developers when migrating to
OpenTelemetry?

**More context:** We have hundreds of microservices that need to be migrated,
including big monolith systems with a lot of custom tracing locked into specific
vendors and their libraries. Setting up agents to facilitate this migration is
like having two different sets of observability systems running at the same
time.

**A:** One user shared their journey: They started by using a backend that
supports OpenTelemetry. The two challenges they faced were: a cultural change in
the engineer’s mindset, and raising awareness of OpenTelemetry, which are bigger
than the technical challenges. The key is to not propose one big change; the
journey of moving from a vendor-based solution to OpenTelemetry should be a
step-by-step process, rather than going into a full transformation.

Additional suggestions:

- Start with dev or testing environments first to build trust in the software
- Choose a stack where OTel is more robust, such as Java and Node.js
- For countering developer resistance, using auto-instrumentation modules to
- start with is a good step

#### 2 - Starting and scaling

**Q:** What is a good place to start from with OpenTelemetry? For example, from
infra to data collection, or starting in the application? And how do you scale
it up?

**More context**: Our use case is end-to-end visibility; currently, we are using
a vendor for monitoring logs, metrics, and traces. We are also using things like
RUM (real user monitoring). Can we do the same with OpenTelemetry, and at scale?

**A:** It depends on if you are starting to use OTel in a new project, or trying
to re-orchestrate an existing or old project. It’s best to start with a
transition plan, make sure the performance impact is not bad, and scale up what
you need. One suggestion is to start experimenting with Java OTel
instrumentation, as the overall performance impact is negligible.

Another suggestion is to try infrastructure monitoring with OpenTelemetry using
the
[host metrics receiver](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/receiver/hostmetricsreceiver/README.md)
in the Collector, as it covers a lot of metrics, and has no dependencies. One
user noticed a 20% reduction in CPU usage when they moved from a vendor-specific
agent to the host metrics receiver for infrastructure monitoring.

#### 3 - Auto-instrumentation

**Q:** Is there a way to automatically create spans without code changes?

**A:** It depends on the use cases:

- [Auto instrumentation](/docs/concepts/instrumentation/automatic/) options are
  maturing in OTel; for example, the Java JAR agent takes care of instrumenting
  [most libraries](https://github.com/open-telemetry/opentelemetry-java-instrumentation/blob/main/docs/supported-libraries.md#libraries--frameworks)
  that are used by applications. Auto-instrumentation is also available for
  [Python](/docs/instrumentation/python/automatic/),
  [.NET](/docs/instrumentation/net/automatic/), and
  [Node.js](/docs/instrumentation/js/automatic).
- If you’re using Kubernetes, they can use the
  [OTel operator](https://github.com/open-telemetry/opentelemetry-operator),
  which takes care of instrumentations for applications deployed on K8s. The
  OTel Operator also supports injecting and configuring auto-instrumentation
  libraries where available (see point above).
- If you’re using AWS lambda, you should check out the
  [OTel Lambda extension](https://github.com/open-telemetry/opentelemetry-lambda).

#### 4 - Leveraging telemetry from OTel

**Q:** Has there been work toward telecommand standards to leverage the
telemetry from OTel?

**A:** Telecommand is a command sent to control a remote system or systems that
are not directly connected to the place from which the telecommand is sent (per
Wikipedia). Check out
[this paper](https://www.gsse.biz/pdfs/papers/DASIA2018-abstract.pdf), and
[OpAMP](/blog/2022/opamp/).

#### 5 - Message brokers

**Q:** What are some use cases for message brokers?

**A:** IoT use cases (car manufacturer). There is also ongoing work for semantic
conventions support for messages.

### Updates and Communications

#### 1 - Unified query standard

**Q:** Is there an update on the upcoming Unified Query Standard working group
for observability data and discussion at O11y Day at KubeCon EU?

**A:** The Observability TAG within CNCF is working to launch a working group
that is going to analyze the various query languages that are out there and come
up with use cases, such as, what are your most common alert and diagnostic
types, and what are some uncommon patterns that you’d like to have available?
Then, we’d like to see if there’s any way we can come up with a recommendation
for a unified standard language across vendors. Maybe SQL-ish?

We’re officially launching the working group at the end of the month; the
charter is open for comments.
[View here](https://docs.google.com/document/d/1JRQ4hoLtvWl6NqBu_RN8T7tFaFY5jkzdzsB9H-V370A).
We are going to start making the conference circuit and gather feedback, the
first place will be at
[Observability Day](https://events.linuxfoundation.org/kubecon-cloudnativecon-europe/co-located-events/observability-day/).
Join the discussion at
[#telemetry-analysis](https://cloud-native.slack.com/archives/C04LXHPDW6M) in
CNCF’s Slack instance.

#### 2 - Documentation and searches

**Q:** Where do you go to find documentation and answers to your questions?

**A:** We have many resources, including official documentation and Github
repositories.

To help us improve our resources, it would be helpful to gather feedback from
you as an end user – what is your process for finding OTel information? Do you
search for answers or post questions on Stack Overflow? The community is
researching options that make sense so that questions can be indexed for
searching. One option is Stack Overflow. Please share your answers using one of
the avenues below!

## Meeting Notes & Recordings

For a deeper dive into the above topics, check out the following:

- [AMER](https://docs.google.com/document/d/1p_FoGbLiDC9VPqqLblJqQtHBn3tr-aPxhu2GaIykU6k)
  meeting notes
- [EMEA](https://docs.google.com/document/d/1fh4RWyZ-ScWdwrgpRHO9mnfqLSKfxUTf4wZGdUvnnUM)
  meeting notes
- [APAC](https://docs.google.com/document/d/1eDYC97LfvE428cpIf3A_hSGirdNzglPurlxgKCmw8o4)
  meeting notes

## Join us

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
