---
title: Observability入門
description: 重要なオブザーバビリティに関する概念
weight: 9
cSpell:ignore: webshop
default_lang_commit: ebd92bb
---

## オブザーバビリティとは何か {#what-is-observability}

オブザーバビリティは、システムの内部構造を知らなくても、そのシステムについて質問することで、システムを外側から理解することを可能にします。
さらに、真新しい問題、つまり「未知の未知」のトラブルシューティングや対処が容易になります。
また、「なぜこのようなことが起こるのか」という疑問に答えるのにも役立ちます。

システムに関してこれらの質問をするためには、アプリケーションが適切に計装されていなければなりません。
つまり、アプリケーションのコードは、[トレース](/docs/concepts/signals/traces/)、[メトリクス](/docs/concepts/signals/metrics/)、[ログ](/docs/concepts/signals/logs/)などの[シグナル](/docs/concepts/signals/)を発しなければなりません。
開発者が問題をトラブルシュートするために計装を追加する必要がないとき、アプリケーションは適切に計装されています。なぜなら開発者が必要な情報をすべて持っているということになるからです。

[OpenTelemetry](/docs/what-is-opentelemetry/)は、システムをオブザーバビリティがある状態にするために、アプリケーションコードの計装を手助けする仕組みです。

## Reliability and metrics

**Telemetry** refers to data emitted from a system and its behavior. The data
can come in the form of [traces](/docs/concepts/signals/traces/),
[metrics](/docs/concepts/signals/metrics/), and
[logs](/docs/concepts/signals/logs/).

**Reliability** answers the question: "Is the service doing what users expect it
to be doing?” A system could be up 100% of the time, but if, when a user clicks
"Add to Cart” to add a black pair of shoes to their shopping cart, the system
doesn't always add black shoes, then the system could be **un**reliable.

**Metrics** are aggregations over a period of time of numeric data about your
infrastructure or application. Examples include: system error rate, CPU
utilization, and request rate for a given service. For more on metrics and how
they relate to OpenTelemetry, see [Metrics](/docs/concepts/signals/metrics/).

**SLI**, or Service Level Indicator, represents a measurement of a service's
behavior. A good SLI measures your service from the perspective of your users.
An example SLI can be the speed at which a web page loads.

**SLO**, or Service Level Objective, represents the means by which reliability
is communicated to an organization/other teams. This is accomplished by
attaching one or more SLIs to business value.

## Understanding distributed tracing

Distributed tracing lets you observe requests as they propagate through complex,
distributed systems. Distributed tracing improves the visibility of your
application or system's health and lets you debug behavior that is difficult to
reproduce locally. It is essential for distributed systems, which commonly have
nondeterministic problems or are too complicated to reproduce locally.

To understand distributed tracing, you need to understand the role of each of
its components: logs, spans, and traces.

### Logs

A **log** is a timestamped message emitted by services or other components.
Unlike [traces](#distributed-traces), they aren't necessarily associated with
any particular user request or transaction. You can find logs almost everywhere
in software. Logs have been heavily relied on in the past by both developers and
operators to help them understand system behavior.

Sample log:

```text
I, [2021-02-23T13:26:23.505892 #22473]  INFO -- : [6459ffe1-ea53-4044-aaa3-bf902868f730] Started GET "/" for ::1 at 2021-02-23 13:26:23 -0800
```

Logs aren't enough for tracking code execution, as they usually lack contextual
information, such as where they were called from.

They become far more useful when they are included as part of a [span](#spans),
or when they are correlated with a trace and a span.

For more on logs and how they pertain to OpenTelemetry, see
[Logs](/docs/concepts/signals/logs/).

### Spans

A **span** represents a unit of work or operation. Spans track specific
operations that a request makes, painting a picture of what happened during the
time in which that operation was executed.

A span contains name, time-related data,
[structured log messages](/docs/concepts/signals/traces/#span-events), and
[other metadata (that is, Attributes)](/docs/concepts/signals/traces/#attributes)
to provide information about the operation it tracks.

#### Span attributes

Span attributes are metadata attached to a span.

The following table contains examples of span attributes:

| Key                         | Value                                                                              |
| :-------------------------- | :--------------------------------------------------------------------------------- |
| `http.request.method`       | `"GET"`                                                                            |
| `network.protocol.version`  | `"1.1"`                                                                            |
| `url.path`                  | `"/webshop/articles/4"`                                                            |
| `url.query`                 | `"?s=1"`                                                                           |
| `server.address`            | `"example.com"`                                                                    |
| `server.port`               | `8080`                                                                             |
| `url.scheme`                | `"https"`                                                                          |
| `http.route`                | `"/webshop/articles/:article_id"`                                                  |
| `http.response.status_code` | `200`                                                                              |
| `client.address`            | `"192.0.2.4"`                                                                      |
| `client.socket.address`     | `"192.0.2.5"` (the client goes through a proxy)                                    |
| `user_agent.original`       | `"Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:72.0) Gecko/20100101 Firefox/72.0"` |

For more on spans and how they relate to OpenTelemetry, see
[Spans](/docs/concepts/signals/traces/#spans).

### Distributed traces

A **distributed trace**, more commonly known as a **trace**, records the paths
taken by requests (made by an application or end-user) as they propagate through
multi-service architectures, like microservice and serverless applications.

A trace is made of one or more spans. The first span represents the root span.
Each root span represents a request from start to finish. The spans underneath
the parent provide a more in-depth context of what occurs during a request (or
what steps make up a request).

Without tracing, finding the root cause of performance problems in a distributed
system can be challenging. Tracing makes debugging and understanding distributed
systems less daunting by breaking down what happens within a request as it flows
through a distributed system.

Many Observability backends visualize traces as waterfall diagrams that look
like this:

![Sample Trace](/img/waterfall-trace.svg 'Trace waterfall diagram')

Waterfall diagrams show the parent-child relationship between a root span and
its child spans. When a span encapsulates another span, this also represents a
nested relationship.

For more on traces and how they pertain to OpenTelemetry, see
[Traces](/docs/concepts/signals/traces/).
