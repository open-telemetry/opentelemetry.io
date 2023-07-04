---
title: 'End-User Q&A Series: Using OTel with GraphQL'
linkTitle: 'End-User Q&A: OTel with GraphQL'
date: 2023-02-13
author: '[Adriana Villela](https://github.com/avillela) (Lightstep)'
aliases:
  - /blog/2023/end-user-q-and-a-series-otel-and-graphql
  - /blog/2023/otel-end-user-q-and-a-series-otel-and-graphql
body_class: otel-with-contributions-from
spelling: cSpell:ignore Deno
---

With contributions from [Rynn Mancuso](https://github.com/musingvirtual)
(Honeycomb) and [Reese Lee](https://github.com/reese-lee) (New Relic).

On Thursday, January 26th, 2023, the OpenTelemetry End User Working Group hosted
the first of its monthly End User Q&A sessions of 2023. This series is a monthly
casual discussion with a team using OpenTelemetry in production. The goal is to
learn more about their environment, their successes, and the challenges that
they face, and to share it with the community, so that together, we can help
make OpenTelemetry awesome!

This month, Dynatrace’s [Henrik Rexed](https://github.com/henrikrexed) spoke
with J, who works at a financial services organization, about how they use
OpenTelemetry with [GraphQL](https://graphql.org/).

## Overview

J and his team embarked on their OpenTelemetry journey for two main reasons:

- J’s company uses a few different observability back-ends. His team had
  switched to a vendor back-end that was different from the back-end used by
  other teams that they interfaced with. OpenTelemetry allowed them to continue
  to get end-to-end Traces in spite of using different vendors.
- His team was using GraphQL, and needed to be able to better understand what
  was happening behind the scenes with their GraphQL calls.

J also shared:

- His team’s OpenTelemetry setup
- How he and his team have helped other teams start using OpenTelemetry
- His quest to make OpenTelemetry a standard at his organization
- Challenges that he and his team encountered in their OpenTelemetry journey,
  along with a few suggestions for improvement.

## Q&A

### Why OpenTelemetry?

J’s company has a diverse tech ecosystem, ranging from on-premise old-school
mainframes, to AWS Cloud and Azure Cloud, where they run both Windows and Linux
servers. They also use a number of different languages, including
[Node.js](https://nodejs.org/en/), [.NET](https://dotnet.microsoft.com/en-us/),
[Java](https://www.java.com/en/), C, C++, and
[PL/I](https://en.wikipedia.org/wiki/PL/I) (mainframe).

Across the organization, different teams have chosen to use different
observability platforms to suit their needs, resulting in a mix of both open
source and proprietary observability tools.

J’s team had recently migrated from one observability back-end to another. After
this migration, they started seeing gaps in trace data, because other teams that
they integrated with were still using a different observability back-end. As a
result, they no longer had an end-to-end picture of their traces. The solution
was to use a standard, vendor-neutral way to emit telemetry: OpenTelemetry.

Another reason that his team took to using OpenTelemetry was
[GraphQL](https://graphql.org), which they had been using for four years.
GraphQL
[is an open source language used to query and manipulate APIs](https://en.wikipedia.org/wiki/GraphQL).
With GraphQL, everything is held in the body of data: request, response and
errors, and as a result everything returns an
[HTTP status of 200](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/200),
giving the impression that even failures are successful. This meant that J and
his team had no visibility into what was going on behind the scenes.

They pass a lot of data into a GraphQL response, because they have a main
gateway that brings all of the different GraphQL endpoints into a single one, so
it all looks like one massive query. OpenTelemetry exposed massive amounts of
data from their GraphQL systems–with traces as large as **three to four
thousand** spans! Instrumentation has been done around Node.js GraphQL systems,
and instrumentation has also started for their .NET GraphQL systems.

Another black box that they are still facing is around AWS, and they are looking
to add some distributed tracing around components like
[Lambdas](https://docs.aws.amazon.com/lambda/latest/dg/welcome.html) and
[ECS](https://aws.amazon.com/ecs/).

### How are applications deployed into production?

The team is on GitLab, and uses GitLab pipelines for CI/CD, leveraging
[Ansible Tower](https://access.redhat.com/products/ansible-tower-red-hat) to
manage deployments. The GitLab custom pipelines deploy Kubernetes YAML files
(without [Helm](https://helm.sh)) to an
[EKS cluster](https://docs.aws.amazon.com/eks/latest/userguide/clusters.html).

The team is currently in the early stages of planning to use Amazon’s
[cdk8s](https://aws.amazon.com/about-aws/whats-new/2021/10/cdk-kubernetes-cdk8s-available/)
to deploy to Kubernetes, and Flagger to manage those deployments (including
[Canary deployments](https://martinfowler.com/bliki/CanaryRelease.html)).

### How are queries built in GraphQL?

There are two systems for building gateways in GraphQL. One is using
[Apollo Federation](https://www.apollographql.com/docs/federation/), and the
other is through
[Schema Stitching](https://blog.logrocket.com/understanding-schema-stitching-graphql/).
Schema stitching allows users to run a single query that spans across multiple
GraphQL APIs. J’s team chose Schema Stitching because, unlike Apollo which is
getting more locked down, it is more open source, flexible, and less
proprietary.

This allows users to query or
[mutate](https://graphql.org/learn/queries/#mutations) as much data as they
want. Uses of GraphQL include microservices development, and extracting data for
analysis.

### How do you generate traces?

To instrument their code, they configure the
[Node.js SDK](/docs/instrumentation/js/getting-started/nodejs/) and use a number
of
[Node.js auto-instrumentation plug-ins](https://github.com/open-telemetry/opentelemetry-js-contrib/tree/main/plugins/node).
While the team is currently only using
[auto-instrumentation](/docs/specs/otel/glossary/#automatic-instrumentation) to
generate traces and [spans](/docs/concepts/observability-primer/#spans), they do
occasionally add more data to a span (e.g.
[attributes](/docs/concepts/signals/traces/#attributes)). They do this by
grabbing the [context](/docs/concepts/signals/traces/#context-propagation) to
find the span, and injecting custom attributes into that spans.

There are currently no plans for the team to create custom spans, and in fact, J
is currently discouraging teams from creating their own custom spans. Since they
do a lot of asynchronous programming, it can be very difficult for developers to
understand how the context is going to behave across asynchronous processes.

Traces are sent to their observability back-end using that vendor’s agent, which
is installed on all of their nodes.

### Besides traces, do you use other signals?

The team has implemented a custom Node.js plugin for getting certain
[metrics](/docs/concepts/signals/metrics/) data about GraphQL, such as
deprecated field usage and overall query usage, which is something that they
can’t get from their traces. These metrics are being sent to the observability
back-end through the
[OpenTelemetry Collector](https://github.com/open-telemetry/opentelemetry-collector#-opentelemetry-collector)’s
[OTLP metrics receiver](https://github.com/open-telemetry/opentelemetry-collector/blob/main/receiver/otlpreceiver/README.md).

There is a long-term goal to have this plugin contributed back to the
OpenTelemetry community. At the moment, however, the plugin is currently coupled
to their own systems, and needs to be modified for more generic use cases. In
addition, the plugin needs to be reviewed by the organization’s open source
Software group before it can be shared externally.

### Do you do any logging?

The team uses
[Amazon Elasticache](https://en.wikipedia.org/wiki/Amazon_ElastiCache) and the
[ELK stack](https://www.techtarget.com/searchitoperations/definition/Elastic-Stack)
for logging. They are currently doing a proof-of-concept (POC) of migrating .NET
logs to their observability back-end. The ultimate goal is to have
[metrics](/docs/concepts/signals/metrics/),
[logs](/docs/concepts/signals/logs/), and
[traces](/docs/concepts/signals/traces/) under one roof.

They have currently been able to automatically link traces to logs in ELK using
[Node.js Bunyan](https://nodejs.org/en/blog/module/service-logging-in-json-with-bunyan/).
They are hoping to leverage
[OpenTelemetry’s Exemplars](/docs/specs/otel/metrics/data-model/#exemplars) to
link traces and metrics.

### How is the organization sending telemetry data to various observability back-ends?

J’s team uses a combination of the proprietary back-end agent and the
OpenTelemetry Collector (for metrics). They are one of the primary users of
OpenTelemetry at J’s company, and he hopes to help get more teams to make the
switch.

### Who has access to the instrumentation data?

Traces are used for diagnostic purposes. If there’s an issue in production,
traces help developers pinpoint where the problem might be.

Because GraphQL mostly returns HTTP 200s, it gives the impression that it
returns no errors, when in fact, there might be errors lurking behind the
scenes. Having traces enables developers to see if there’s actually an error in
the response body. For example, when accessing a database, if there’s a
connection hangup, GraphQL will report HTTP 200, but the Trace will show that
there’s an error, and where.

The SRE team also uses the observability data for the purposes of improving
system reliability and performance.

### How would you describe the overall OpenTelemetry adoption experience?

The team’s initial adoption was super fast and easy–80% of their tracing needs
were met right away. The next 20% required some additional proof of concept
work, which was completed relatively quickly. Overall, it was a very positive
experience.

J’s team has convinced a couple of other groups to use OpenTelemetry; however,
they have been met with a few challenges. For example, J wants to make sure that
these teams move away from proprietary software, such as
[Apollo Studio](https://studio.apollographql.com), since OpenTelemetry already
meets these same needs.

### Are there plans to use OpenTelemetry across the organization?

The team has recently been talking to their internal Open Source Software (OSS)
and Enterprise Architecture (EA) groups to make OpenTelemetry an enterprise
standard. They are hoping to use their own success with their production-ready
OpenTelemetry system to illustrate the benefits of OpenTelemetry across the
organization.

### Are you seeing the benefits of using OpenTelemetry with GraphQL in your production environments?

Using the
[GraphQL OpenTelemetry plugin-for Node.js](https://github.com/open-telemetry/opentelemetry-js-contrib/tree/main/plugins/node/opentelemetry-instrumentation-graphql)
made it super easy to identify an issue with a GraphQL resolver that was acting
up in production.

### Were the outputs produced by the instrumentation libraries that you used meaningful to you, or did you have to make any adjustments?

On the Node.js side, the team used auto-instrumentation for
[HTTP](https://www.npmjs.com/package/@opentelemetry/instrumentation-http),
[Express](https://github.com/open-telemetry/opentelemetry-js-contrib/tree/main/plugins/node/opentelemetry-instrumentation-express),
[GraphQL](https://github.com/open-telemetry/opentelemetry-js-contrib/tree/main/plugins/node/opentelemetry-instrumentation-graphql),
and also the
[AWS SDK](https://github.com/open-telemetry/opentelemetry-js-contrib/tree/main/plugins/node/opentelemetry-instrumentation-aws-sdk)
on some systems.

The most useful instrumentation was GraphQL and AWS SDK. Although GraphQL
auto-instrumentation has been very useful, there are still some areas for
improvement, such as adding the ability to ignore certain fields. J has opened a
[pull request to address this](https://github.com/open-telemetry/opentelemetry-js-contrib/pull/1134).

The team didn’t see much benefit in auto-instrumentation for HTTP and Express.
They found HTTP instrumentation to be a little too noisy. Express is being used
very minimally, and therefore there was no real value in having that
instrumentation. Also, the team plans to migrate from Express to
[GraphQL Yoga](https://github.com/dotansimha/graphql-yoga) in the near future.
They expect there to be some instrumentation gaps when they move to GraphQL
Yoga, and are therefore planning on writing an OpenTelemetry plugin for it,
which they intend to give back to the OpenTelemetry community.

### Are you planning on instrumenting mainframe code?

The observability back-end used by J’s team provided native instrumentation for
the mainframe. J and his team would have loved to instrument mainframe code
using OpenTelemetry. Unfortunately, there is currently no OpenTelemetry SDK for
PL/I (and other mainframe languages such as
[FORTRAN](https://en.wikipedia.org/wiki/Fortran) and
[COBOL](https://en.wikipedia.org/wiki/COBOL)). The team would love to have
OpenTelemetry available for the mainframe, but aren’t sure if there’s enough
appetite out there for undertaking such an effort.

**NOTE:** If anyone is interested in or ends up creating an OpenTelemetry
implementation for the mainframe, please reach out to us!

## Challenges/Moving Forward

As part of our conversation with J, he also shared some areas and suggestions
for improvement.

### JavaScript Maintenance

OpenTelemetry has a small number of language maintainers, and as a result, they
don’t necessarily have enough cycles to work on all the things. Thus, they
currently focus on keeping up with spec changes to update the SDK and API. This
means that they often don’t have time (and sometimes not even the expertise) to
manage the contrib repos (e.g. GraphQL). This is a known problem, and there is
currently no solution in place. The OpenTelemetry Community welcomes any
suggestions for improvement!

There is also a huge focus on
[stabilizing semantic conventions](https://docs.google.com/document/d/1ghvajKaipiNZso3fDtyNxU7x1zx0_Eyd02OGpMGEpLE/edit#),
and as part of that effort, maintainers plan to go through the existing
instrumentation packages and to make sure that they’re all up to date with the
latest conventions. While it’s very well-maintained for certain languages, such
as Java, that is not the case for other languages, such as Node.js.

JavaScript environments are akin to the Wild West of Development due to:

- Multiple facets: web side vs server side
- Multiple languages: JavaScript, TypeScript, Elm
- Two similar, but different server-side runtimes: Node.js and
  [Deno](https://deno.land)

One of J’s suggestions is to treat OTel Javascript as a hierarchy, which starts
with a Core JavaScript team that splits into two subgroups: front-end web group,
and back-end group. Front-end and back-end would in turn split. For example, for
the back-end, have a separate Deno and Node.js group.

Another suggestion is to have a contrib maintainers group, separate from core
SDK and API maintainers group.

### JavaScript Contributions

Making OpenTelemetry JavaScript contributions has been slow-moving at times,
specifically around plug-ins. Much of the plug-in maintenance relies on the
plug-in’s original owner; however, the original owner is gone in many cases, or
maintainers don’t check GitHub very frequently, and as a result, movement on
some pull requests (PRs) is very slow. One way to mitigate this is to get
contributors more involved, which could potentially help bring in more
contributors.

### Documentation

J and his team have also experienced some challenges with documentation, noting
that there are some gaps in the online docs:

- Under metrics for JavaScript, there is no mention of the Observable Gauge at
  all. J had to go into the code to find it.
- There are some short, very high-level metric API examples. Those examples
  currently don't show which libraries you need to bring in. It also doesn't
  talk about how to export items.
- In .NET, it is very hard to keep a trace going in your work due to all the
  async/await and it jumping between threads. .NET docs lack some detail around
  context propagation in this particular scenario.

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
- [Join our OTel in Practice sessions](/community/end-user/otel-in-practice/)
- [Sign up for one of our monthly interview/feedback sessions](/community/end-user/interviews-feedback/)
- Share your stories on the
  [OpenTelemetry blog](https://github.com/open-telemetry/opentelemetry.io/blob/954103a7444d691db3967121f0f1cb194af1dccb/README.md#submitting-a-blog-post)

Be sure to follow OpenTelemetry on
[Mastodon](https://fosstodon.org/@opentelemetry) and
[Twitter](https://twitter.com/opentelemetry), and share your stories using the
**#OpenTelemetry** hashtag!
