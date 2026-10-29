---
title:
  'Preserving telemetry when rewriting the recommendation service in Spring Boot
  4'
linkTitle: Preserving telemetry in a service rewrite
date: 2026-10-23
author: '[Aditya Reddy](https://github.com/adityareddy-dev)'
issue: 12100
sig: SIG Demo
cSpell:ignore: Aditya
---

The recommendation service in the OpenTelemetry Demo used to be Python. I
rewrote it in Spring Boot 4 and the
[rewrite](https://github.com/open-telemetry/opentelemetry-demo/pull/3966) merged
on October 13. The first version was up a week after I picked up the issue. Over
the next month its instrumentation changed three times, from Spring's own setup
to the OpenTelemetry Spring Boot starter, then to the Java agent, then back to
the starter. The trace from the old service stayed fixed through all of it, so
that's where this starts.

Why Spring at all? The Demo had four Python services and no Spring one, though
Spring is widely used. Its JVM services, Ad in Java and fraud detection in
Kotlin, both run the OpenTelemetry Java agent. The Demo maintainer preferred
rewriting an existing service over adding one, and recommendation got picked.
The [Java agent](/docs/zero-code/java/agent/) is still the default for Spring
Boot. This service shows the
[Spring Boot starter](/docs/zero-code/java/spring-boot-starter/) as a second
way.

## Start with the Python trace

![Python recommendation trace showing the incoming RPC, get_product_list, and the catalog client and server spans](python-trace.png)

Read it from the incoming recommendation RPC down. `get_product_list` is its
child, the catalog client span sits inside that work and the catalog's server
span continues the same trace. The database span belongs to the catalog, which
didn't change. Those parent-child links tell you whether the time went into
picking products or waiting on another service, so keeping a span name without
its parent isn't enough.

With ten catalog products, one viewed product excluded and the cache failure
off, both versions should record these attributes:

| Attribute                                | Python (expected) | Spring (expected) |
| ---------------------------------------- | ----------------- | ----------------- |
| `demo.product.count`                     | 10                | 10                |
| `demo.product.filtered.count`            | 9                 | 9                 |
| `demo.product.recommended.count`         | 5                 | 5                 |
| `demo.feature_flag.recommendation_cache` | `false`           | `false`           |

The recommended products are picked at random, so the exact list was never going
to match. The counts and the exclusion have to.

## Spring, the starter, the agent and the starter again

The
[issue I picked up](https://github.com/open-telemetry/opentelemetry-demo/issues/1368)
asked for Micrometer tracing on Spring Boot. I picked up Spring Boot cause I
felt it was a good entry point. I was comfortable in Java and Spring from my day
job and previous workplaces, and the issue was tagged good first issue. I
honestly thought it would probably be one place where responses would be quick
for a newbie. Turns out Juliano was amazing and guided me through, I just got
lucky I guess. The first version used Spring Boot's
`spring-boot-starter-opentelemetry`, with Micrometer Tracing for the
`get_product_list` span and a `MeterRegistry` for the counter. The gRPC server
and client spans came from interceptors Spring Boot configures by itself. Logs
were the only part I wired by hand.

On September 23 the Demo maintainer
[asked the Java instrumentation approvers](https://github.com/open-telemetry/opentelemetry-demo/pull/3966#issuecomment-5797579640)
whether Micrometer made sense in the OpenTelemetry Demo. The answer was one
line, "I think the OpenTelemetry Demo should use OpenTelemetry's recommended
approach", with a link to the starter page. I switched that day.

That's where the gRPC spans went missing. The starter's
[out-of-the-box instrumentation](/docs/zero-code/java/spring-boot-starter/out-of-the-box-instrumentation/)
doesn't include gRPC in 2.31.1, the version the rewrite uses, and Spring gRPC's
own setup needs a Micrometer `ObservationRegistry` the service no longer had.
That's cause gRPC isn't part of core Spring Boot, it comes from the separate
Spring gRPC project. So I added the
[OpenTelemetry gRPC library](https://github.com/open-telemetry/opentelemetry-java-instrumentation/blob/v2.31.1/instrumentation/grpc-1.6/library/README.md)
and registered its interceptors myself. The span and counter moved to the
OpenTelemetry API, and my Logback setup went cause the starter installs its own
appender.

In review came the question,
["Isn't that done automatically with the spring-boot-starter?"](https://github.com/open-telemetry/opentelemetry-demo/pull/3966#discussion_r4164040740)
I took the interceptors out to check. The main test then failed waiting for the
`ListRecommendations` server span. On October 6 a Demo approver ran the stack,
checked the spans in Jaeger and approved it.

The same day another reviewer
[pointed out what the linked page says](https://github.com/open-telemetry/opentelemetry-demo/pull/3966#issuecomment-6017929704):
"The default choice for instrumenting Spring Boot applications is the
OpenTelemetry Java agent". The starter is for when the agent can't be used, and
the reviewer didn't see that in the Demo. So I moved to the agent, loaded
through `JAVA_TOOL_OPTIONS` like Ad. The starter and the gRPC library came out
cause the agent instruments gRPC itself.

The tests don't run with the agent though, so they had to build an in-memory SDK
and register the same gRPC interceptors I had just deleted from the app. Jaeger
showed the same spans and `demo.*` attributes, plus flagd's own gRPC calls.
Memory under load went to about 380 MiB of the 500 MiB limit, where the starter
had sat around 305. And the approval I'd just got now covered code that was
gone.

On October 8 the Demo maintainer
[asked me to hold](https://github.com/open-telemetry/opentelemetry-demo/pull/3966#issuecomment-6058694428):
"On the Demo, we already have the `Ad` service using the OTel Java agent. The
idea to add an extra Java service in Spring is to showcase a different
instrumentation approach." The Java approver was
[fine with that](https://github.com/open-telemetry/opentelemetry-demo/pull/3966#issuecomment-6066087816)
as long as the example is "super clear about it not being the default
recommendation". People copy from this repository as is, so that part matters.

I reverted the agent commit. The code went back to exactly what had been
approved, plus a note at the top of the service README and a changelog line
saying the Java agent is the default. Looking back, that reason was in the
thread on day two, when a maintainer said a Spring service could
["introduce some other ways to instrument Java code"](https://github.com/open-telemetry/opentelemetry-demo/pull/3966#issuecomment-5631284857).
It took two switches to get back to it. The Java agent is the default for a good
reason, it instruments everything out of the box. Pick the starter only when the
agent doesn't fit, like a native image, another agent already attached, or a
tight container where every bit of headroom matters. Memory came up early in the
review, and the starter ran about 75 MiB lighter under load than the agent, so
going back to it made sense for the Demo too.

## Wire the gRPC spans back in

The starter hands out the `OpenTelemetry` instance as a bean but doesn't attach
anything to a Spring gRPC server or channel. As the
[recommendation service docs](/docs/demo/services/recommendation/#grpc-spans)
show, the service creates `GrpcTelemetry` from that bean and registers its
interceptors with `@GlobalServerInterceptor` and `@GlobalClientInterceptor`. The
server one creates the incoming RPC span from the caller's context, the client
one creates the catalog span and passes the context on.

Inside those boundaries the service
[creates `get_product_list`](/docs/demo/services/recommendation/#create-new-spans)
and makes it current while it fetches products, which makes the catalog call its
child. The [Java API docs](/docs/languages/java/api/#span) cover spans and
context in general.

## Compare the Spring trace against the original

![Spring recommendation trace showing the same incoming RPC, get_product_list, and catalog parent-child relationships](java-trace.png)

Same chain: recommendation server, product-list work, catalog client, catalog
server, with the attributes from the table. The Python instrumentation prefixes
RPC span names with `/` and the Java library doesn't. The Java library also
still writes the older `rpc.system` attribute while the catalog uses
`rpc.system.name`, so a query across services has to handle both. Two single
requests say nothing about performance.

## Keep the behavior behind the signals

The frontend sends product IDs as one repeated element per character. The Python
service joined them and split on commas. The Spring service does the same and
also accepts whole IDs, otherwise it could recommend the product already on the
screen.

I kept `demo.recommendation.requests`, its `recommendation.type=catalog`
attribute and the counting, so five returned recommendations add five. Counting
once per request would keep the name and change what every dashboard on it
measures.

The `recommendationCacheFailure` flag is a failure scenario on purpose. On a
cache miss the service appends the catalog IDs, then copies a quarter of the
cache back into itself. Responses use distinct IDs, so they look fine while the
list grows until the container restarts. Fixing it would remove the scenario, so
the cache-hit and product-count attributes stay for whoever goes looking.

The setup changed three times and the check didn't: open Jaeger and compare the
chain and the `demo.*` attributes with the Python trace. The final setup is in
the [recommendation service docs](/docs/demo/services/recommendation/).
