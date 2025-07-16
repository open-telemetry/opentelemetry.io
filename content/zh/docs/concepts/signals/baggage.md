---
title: Baggage（行李）
weight: 4
description: 在信号之间传递的上下文信息。
default_lang_commit: 8a5b880c16d49257a147c2c3ec4a6ef6fcee8e20
---

在 OpenTelemetry 中，Baggage 是在 Span 之间传递的上下文信息。Baggage 是一个键值对存储，
这意味着它允许你在传递[上下文](../../context-propagation/#context)的同时
[传播](../../context-propagation/#propagation)任何你想传递的数据。

Baggage 允许你在服务和进程之间传递数据，
从而可以将其添加到这些服务中的[链路](../traces/)、[指标](../metrics/)或[日志](../logs/)中。

## 示例 {#example}

Baggage 通常用于链路，以在服务之间传播附加数据。

例如，假设你在请求开始时拥有一个 `clientId`，但你希望该 ID 能在链路中的所有
Span、中间某个服务的指标，以及沿途的一些日志中都能使用。由于链路可能跨越多个服务，
因此你需要一种方法来传播该数据，而无需在代码库的多个位置复制 `clientId`。

通过使用[上下文传播](../traces/#context-propagation)在这些服务之间传递
Baggage，`clientId` 就可以用于添加到任何额外的 Span、指标或日志中。此外，
插桩会自动为你传播 Baggage。

![OTel Baggage](../otel-baggage.svg)

## OTel Baggage 应该用于什么？ {#why-should-otel-baggage-be-used-for}

Baggage 最适合用于将请求开始时通常可用的信息，传递到后续处理流程中。
这些信息可以包括账户标识、用户 ID、产品 ID 和来源 IP 等。

使用 Baggage 传播这些信息，可以对后端的遥测数据进行更深入的分析。例如，
如果你在一个链路数据库调用的 Span 上包含用户 ID，
你就可以更轻松地回答“哪些用户遇到的数据库调用最慢？”这样的问题。
你还可以在记录下游操作的日志时，将相同的用户 ID 包含在日志数据中。

![OTel Baggage](../otel-baggage-2.svg)

## Baggage 的安全注意事项 {#baggage-security-considerations}

敏感的 Baggage 项可能会被共享给非预期的资源，例如第三方 API。
这是因为自动插桩会在大多数服务的网络请求中包含 Baggage。具体而言，
Baggage 和其他链路上下文的部分会通过 HTTP 头部发送，
因此对任何检查你的网络流量的人都是可见的。
如果网络流量限制在你的内部网络中，则该风险可能不适用，
但请注意下游服务可能会将 Baggage 传播到你的网络之外。

此外，没有内建的完整性检查机制来确保 Baggage 项确实是你的，因此在读取时需小心谨慎。

## Baggage 不等同于属性 {#baggage-is-not-the-same-as-attributes}

关于 Baggage 的一个重要说明是，它是一个独立的键值对存储，默认不会与
Span、指标或日志上的属性关联，除非你显式地将其添加。

要将 Baggage 条目添加为属性，你需要显式地从 Baggage 中读取数据，
并将其作为属性添加到你的 Span、指标或日志中。

由于 Baggage 的常见用例之一是将数据添加到整个链路的
[Span 属性](../traces/#attributes)中，因此一些语言提供了
Baggage Span Processor，可在创建 Span 时将 Baggage 中的数据作为属性添加。

> 更多信息，请参阅 [Baggage 规范][baggage specification]。

[baggage specification]: /docs/specs/otel/overview/#baggage-signal
