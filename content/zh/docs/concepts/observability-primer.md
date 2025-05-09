---
title: 可观测性入门
description: 可观测性的核心概念
weight: 9
default_lang_commit: e771c886739c4847b332b74f24b09d2769aab875
cSpell:ignore: webshop
---

## 什么是可观测性？ {#what-is-observability}

可观测性让你能够从外部理解一个系统，它允许你在不了解系统内部运作的情况下，对该系统提出问题。更重要的是，
它能帮你轻松排查和处理新出现的问题，也就是所谓的"未知的未知"。它还能帮你回答"为什么会发生这种情况？"这样的问题。

要对你的系统提出这些问题，你的应用程序必须进行适当的插桩。也就是说，应用程序代码必须能够发出[信号](/docs/concepts/signals/)，
例如[链路](/docs/concepts/signals/traces/)、
[指标](/docs/concepts/signals/metrics/)和
[日志](/docs/concepts/signals/logs/)。当开发人员不需要添加更多插桩就能排查问题时，
我们就可以说这个应用程序已经完成了适当的插桩，因为他们已经拥有了所需的所有信息。

[OpenTelemetry](/docs/what-is-opentelemetry/)就是一种为应用程序代码进行插桩的机制，它的目的是帮助使系统变得可观测。

## 可靠性和指标

**Telemetry** 指的是系统及其行为发出的数据。这些数据可以是[链路](/docs/concepts/signals/traces/)、[指标](/docs/concepts/signals/metrics/)和[日志](/docs/concepts/signals/logs/)的形式。

**可靠性** 回答了这个问题："服务是否在按用户期望的方式运行？"一个系统可能 100% 的时间都在运行，但如果当用户点击"加入购物车"来添加一双黑色鞋子时，系统并不总是能准确地添加黑色鞋子，那么这个系统就可能是**不**可靠的。

**指标** 是对一段时间内基础设施或应用程序的数值数据的汇总。例如：系统错误率、CPU使用率和特定服务的请求率。要了解更多关于指标以及它们与OpenTelemetry的关系，可查阅[指标](/docs/concepts/signals/metrics/)。

**SLI**，即服务水平指标（Service Level Indicator），代表对服务行为的衡量。一个好的SLI应该从用户的角度来衡量你的服务。SLI的一个例子可以是网页加载的速度。

**SLO**，服务水平目标（Service Level Objective）是一种向组织内部或其他团队传达服务可靠性的方法。它通过将具体的技术指标（SLI）与业务目标关联起来，使技术性能变得对业务有意义。例如，"网站页面加载时间（SLI）必须在3秒内，以确保良好的用户体验和提高转化率（业务价值）"。

## 理解分布式链路

分布式链路让你能够观察请求如何在复杂的分布式系统中传播。它提高了应用程序或系统健康状况的可见性，并让你能够调试那些难以在本地重现的行为。对于分布式系统来说，分布式链路是必不可少的，因为这些系统通常存在不确定性问题，或者过于复杂而无法在本地重现。

要理解分布式链路，你需要了解其各个组成部分的角色：日志、span（跨度）和 trace（链路）。

### 日志

**日志** 日志是由服务或其他组件发出的带时间戳的消息。与[链路](#分布式链路)不同，它们不一定与特定的用户请求或事务相关联。在软件中几乎到处都能找到日志。长期以来，开发人员和运维人员一直依靠日志来洞察系统行为。

日志样例：

```text
I, [2021-02-23T13:26:23.505892 #22473]  INFO -- : [6459ffe1-ea53-4044-aaa3-bf902868f730] Started GET "/" for ::1 at 2021-02-23 13:26:23 -0800
```

日志虽然有用，但仅靠它们来追踪代码执行还不够，因为日志通常缺乏上下文信息，比如它们是从哪里被调用的。

当日志作为 [span](#spans)（跨度）的一部分，或者与 trace（链路）和 span 关联起来时，它们的价值就会大大增加。

要深入了解日志以及它们与OpenTelemetry的关系，请参阅[日志](/docs/concepts/signals/logs/)章节。

### Spans

**Span**（跨度）是分布式链路中的基本构建块，它代表了一个具体的操作或工作单元。每个 span 都记录了请求中的特定动作，帮助我们了解操作执行过程中发生的详细情况。

一个 span 包含名称、时间相关的数据、[结构化的日志消息](/docs/concepts/signals/traces/#span-events)，以及其他[元数据（属性）](/docs/concepts/signals/traces/#attributes)，这些信息共同描绘了该操作的完整画面。

### Span 属性

Span 属性是附加在 span 上的额外信息。这些属性为我们提供了更多关于操作上下文的细节。

下面的表格列出了一些 span 属性的例子：

| 键                          | 值                                                                                 |
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

要深入了解 spans 及其与 OpenTelemetry 的关系，请查看 [Spans](/docs/concepts/signals/traces/#spans)。

### 分布式链路

**分布式链路**，通常简称为**链路**，记录了请求（无论是来自应用程序还是终端用户）在多服务架构（如微服务和无服务器应用）中传播的路径。

一个链路由一个或多个 span 组成。第一个 span 被称为根 span，它代表了一个请求从开始到结束的全过程。根 span 下的子 span 则提供了请求过程中更详细的上下文信息（或者说，构成了请求的各个步骤）。

如果没有链路，在分布式系统中找出性能问题的根源将会非常具有挑战性。链路通过分解请求在分布式系统中的流转过程，使得调试和理解分布式系统变得不那么令人生畏。

许多可观测性后端会将链路可视化为瀑布图，如下所示：

![链路示例](/img/waterfall-trace.svg '链路瀑布图')

瀑布图清晰地展示了根 span 与其子 span 之间的父子关系。当一个 span 包含另一个 span 时，这种关系就表现为嵌套结构。

想要更深入地了解链路，以及它如何在 OpenTelemetry 中发挥作用，欢迎查阅[链路](/docs/concepts/signals/traces/)。
