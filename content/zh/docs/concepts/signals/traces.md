---
title: 链路（Trace）
weight: 1
description: 请求通过应用的路径。
default_lang_commit: 7c0e4db0b6c39b0ca0e7efb17df5610d1b77b8a3
drifted_from_default: true
---

**链路**为我们提供了向应用发出请求时会发生什么的总览图。
无论你的应用是具有单个数据库的单体应用还是复杂的服务网格，链路对于了解请求在应用中的完整“路径”至关重要。

让我们通过三个用 [Span](#spans) 表示的工作单元来探讨这个问题：

{{% alert title="Note" %}}

以下 JSON 示例不表示特定格式，尤其是不表示
[OTLP/JSON](/docs/specs/otlp/#json-protobuf-encoding)，因为 OTLP/JSON 更详细。

{{% /alert %}}

`hello` span:

```json
{
  "name": "hello",
  "context": {
    "trace_id": "5b8aa5a2d2c872e8321cf37308d69df2",
    "span_id": "051581bf3cb55c13"
  },
  "parent_id": null,
  "start_time": "2022-04-29T18:52:58.114201Z",
  "end_time": "2022-04-29T18:52:58.114687Z",
  "attributes": {
    "http.route": "some_route1"
  },
  "events": [
    {
      "name": "Guten Tag!",
      "timestamp": "2022-04-29T18:52:58.114561Z",
      "attributes": {
        "event_attributes": 1
      }
    }
  ]
}
```

这是根 Span，表示整个操作的开始和结束。请注意，它有一个 `trace_id` 字段指示链路，
但没有 `parent_id`。因此这是一个根 Span。

`hello-greetings` span:

```json
{
  "name": "hello-greetings",
  "context": {
    "trace_id": "5b8aa5a2d2c872e8321cf37308d69df2",
    "span_id": "5fb397be34d26b51"
  },
  "parent_id": "051581bf3cb55c13",
  "start_time": "2022-04-29T18:52:58.114304Z",
  "end_time": "2022-04-29T22:52:58.114561Z",
  "attributes": {
    "http.route": "some_route2"
  },
  "events": [
    {
      "name": "hey there!",
      "timestamp": "2022-04-29T18:52:58.114561Z",
      "attributes": {
        "event_attributes": 1
      }
    },
    {
      "name": "bye now!",
      "timestamp": "2022-04-29T18:52:58.114585Z",
      "attributes": {
        "event_attributes": 1
      }
    }
  ]
}
```

此 Span 封装了特定任务，例如 hello-greetings，其父级 Span 是 `hello` Span。请注意，它的 `trace_id` 与根 Span
相同，这表明它们属于同一链路。此外，它的 `parent_id` 与 `hello` Span 的 `span_id`一致。

`hello-salutations` Span:

```json
{
  "name": "hello-salutations",
  "context": {
    "trace_id": "5b8aa5a2d2c872e8321cf37308d69df2",
    "span_id": "93564f51e1abe1c2"
  },
  "parent_id": "051581bf3cb55c13",
  "start_time": "2022-04-29T18:52:58.114492Z",
  "end_time": "2022-04-29T18:52:58.114631Z",
  "attributes": {
    "http.route": "some_route3"
  },
  "events": [
    {
      "name": "hey there!",
      "timestamp": "2022-04-29T18:52:58.114561Z",
      "attributes": {
        "event_attributes": 1
      }
    }
  ]
}
```

此 Span 表示此链路中的第三个操作，与上一个操作一样，它是 `hello` Span 的子级，
因此它与 `hello-greetings` Span 同级。

这三个 JSON 块的 `trace_id` 都相同，并且 `parent_id` 属性表示层次结构，它们构成了整个链路！

你可能会发现，每个 Span 看起来都像一个结构化的日志，这就是 Span ！
将链路视为结构化日志的集合，其中包含上下文、关联关系、层次结构等。但是，
这些“结构化日志”可能来自不同的进程、服务、虚拟机、数据中心等。因此链路可以表示任何系统的端到端视图。

为了了解 OpenTelemetry 中的链路是如何工作的，接下来看看在代码插桩中涉及到的几个组件。

## Tracer 提供者 {#tracer-provider}

Tracer Provider（有时称为 `TracerProvider`）是 `Trace` 的生产工厂。
在大多数应用中，Tracer Provider 初始化一次，其生命周期与应用的生命周期一致。
Tracer Provider 初始化还包括 Resource 和 Exporter 初始化。这通常是使用
OpenTelemetry 进行跟踪的第一步。在某些语言 SDK 中，已为你初始化了全局 Tracer Provider。

## Tracer

Tracer 创建的 Span 的中包含指定操作（例如服务中的请求）执行的更多信息。
Tracer 是从 Tracer Provider 创建的。

## 链路 Exporter {#trace-exporters}

链路 Exporter 将链路信息发送给消费者。消费者可以是开发、调试时候的标准输出、
OpenTelemetry Collector 或你选择的任何开源或供应的后端。

## 上下文传播 {#context-propagation}

上下文传播是实现分布式追踪的核心概念。通过上下文传播，Span
可以相互关联并组合成一个链路，而不管 Span 是在何处生成的。要了解有关此主题的更多信息，
请参阅有关[上下文传播](../../context-propagation)的概念页面。

## Span {#spans}

一个 **Span** 代表一个作业或者操作的单元，是链路的组成部分。在 OpenTelemetry 中，它们包括以下信息：

- 名字
- 父 Span ID（根 Span 为空）
- 开始和结束时间
- [Span 上下文](#span-context)
- [属性](#attributes)
- [Span 事件](#span-events)
- [Span 链接](#span-links)
- [Span 状态](#span-status)

Span 样例:

```json
{
  "name": "/v1/sys/health",
  "context": {
    "trace_id": "7bba9f33312b3dbb8b2c2c62bb7abe2d",
    "span_id": "086e83747d0e381e"
  },
  "parent_id": "",
  "start_time": "2021-10-22 16:04:01.209458162 +0000 UTC",
  "end_time": "2021-10-22 16:04:01.209514132 +0000 UTC",
  "status_code": "STATUS_CODE_OK",
  "status_message": "",
  "attributes": {
    "net.transport": "IP.TCP",
    "net.peer.ip": "172.17.0.1",
    "net.peer.port": "51820",
    "net.host.ip": "10.177.2.152",
    "net.host.port": "26040",
    "http.method": "GET",
    "http.target": "/v1/sys/health",
    "http.server_name": "mortar-gateway",
    "http.route": "/v1/sys/health",
    "http.user_agent": "Consul Health Check",
    "http.scheme": "http",
    "http.host": "10.177.2.152:26040",
    "http.flavor": "1.1"
  },
  "events": [
    {
      "name": "",
      "message": "OK",
      "timestamp": "2021-10-22 16:04:01.209512872 +0000 UTC"
    }
  ]
}
```

Span 可以嵌套，通过设置 Span 的 `parent_id` 来标识，子 Span 表示子操作，这使得 Span 可以更准确地跟踪应用中的各种操作。

### Span 上下文 {#span-context}

Span 上下文是每个 Span 上的不可变对象，其中包含以下内容：

- 表示 Span 所属链路的`trace_id`
- Span 的 `span_id`
- 链路标志，包含有关链路信息的二进制编码的值
- 链路状态，可以携带供应商特定链路信息的键值对列表

Span 上下文是 Span 的一部分，它与 Span 一起序列化和传递[分布式上下文](#context-propagation)和[透传数据](../baggage)。

由于 Span Context 包含链路 ID，因此可以用来创建 [Span 链接](#span-links)。

### 属性 {#attributes}

属性是包含元数据的键值对，你可以使用这些元数据对 Span 进行注释，以携带有关它正在跟踪的操作的信息。

例如，如果 Span 跟踪了将商品添加到电子商务系统中用户购物车的操作，
则可以捕获用户的 ID、要添加到购物车的商品的 ID 以及购物车 ID。

你可以在创建 Span 时或之后向 Span 添加属性。最好在创建的时候添加，
以使属性被 SDK 采集。如果必须在 Span 创建后添加值，请使用该值更新 Span。

针对属性的键值对，每种语言 SDK 都适用以下规则：

- 键必须是非 null 字符串值
- 值必须是非 null 字符串、布尔值、浮点值、整数或这些值的数组

此外，还有[语义化属性](/docs/specs/semconv/general/trace/)，这是通常存在的元数据的已知命名约定。
尽可能使用语义化属性命名会很有帮助，这样就可以跨系统标准化常见类型的元数据。

### Span 事件 {#span-events}

可以将 Span 事件视为 Span 上的结构化日志消息（或注释），通常用于表示 Span 持续时间内有意义的单个时间点。

例如，考虑 Web 浏览器中的两个场景：

1. 跟踪页面加载
2. 表示页面何时变为可交互的

Span 最适合用于第一种情况，因为它是一个具有开始和结束的操作。

Span Event 最适合用于跟踪第二种情况，因为它表示有意义的单一时间点。

#### 何时使用 Span 事件与 Span 属性 {#when-to-use-span-events-versus-span-attributes}

由于 Span 事件也包含属性，因此何时使用事件而不是属性的问题答案可能并不唯一。
为了做出明智的决定，请考虑特定时间戳是否有意义。

例如，当你使用 Span 跟踪操作并且操作完成时，你可能希望将操作中的数据添加到你的 telemetry 中。

- 如果操作完成的时间戳有意义或相关，请将数据附加到 Span 事件。
- 如果时间戳没有意义，请将数据附加为 Span 属性。

### Span 链接 {#span-links}

链接的存在以便你可以将一个 Span 与一个或多个 Span 相关联，从而表示因果关系。
例如，假设我们有一个分布式系统，其中某些操作包含链路跟踪。

为了响应某些些操作，其他操作将排队等待执行，其执行是异步的。我们也可以通过链路来跟踪这个后续操作。

我们希望将后续操作的链路与第一个链路相关联，但无法预测后续操作何时开始。
我们需要关联这两个链路，因此我们将使用 Span 链接。

你可以将第一个链路的最后一个 Span 链接到第二个链路中的第一个
Span。这样它们彼此之间就有了因果关系。

链接是可选的，但它可以很好地将跟踪的 Span 彼此关联起来。

有关 Span 链接的更多信息，请参阅[Span 链接](/docs/specs/otel/trace/api/#link)。

### Span 状态 {#span-status}

每个 Span 都有一个状态。三个可能的值是：

- `Unset`
- `Error`
- `Ok`

默认值为 `Unset`。Span 状态为 Unset 表示它跟踪的操作已成功完成，没有错误。

当 Span 状态为 `Error` 时，这意味着它跟踪的操作中发生了一些错误。例如，
这可能是由于处理请求的服务器上的 HTTP 500 错误造成的。

当 Span 状态为 `Ok`（正常） 时，这意味着应用开发人员已将该 Span 显式标记为无错误。
虽然这不直观，但当已知 Span 已完成且没有错误时，不需要将 Span 状态设置为 `Ok`，因为
`Unset` 涵盖了这一点。`Ok` 的作用是表示对用户**显式**设置的 Span 状态的明确“调用”。
这在开发人员希望除了 “successful” 之外没有其他 Span 状态的情况下非常有用。

重申一下：`Unset` 表示一个 Span 完成且没有错误。`Ok` 表示开发人员在某刻明确将 Span 显式标记为 `Ok`。

### Span 类型 {#span-kind}

创建 Span 时，它是 `Client`、`Server`、`Internal`、`Producer` 或 `Consumer` 之一。
这些 Span 类型为跟踪后端提示提供如何组装链路的。根据 OpenTelemetry 规范，
服务端 Span 的父级通常是远程客户端 Span，而 client Span 的子级通常是服务端 Span。
同样，消费者 Span 的父级始终是生产者，而生产者 Span 的子级始终是消费者。
如果没有设置，默认 Span 类型为 internal。

有关 SpanKind 的更多信息，请参阅 [Span 类型](/docs/specs/otel/trace/api/#spankind)。

#### Client

Client Span 表示同步远程调用，例如 HTTP 请求或数据库调用。请注意，在此上下文中，
“同步” 不是指 `async/await`，而是指它不是后续异步处理的调用（对比与 Producer Span ）。

#### Server

Server Span 表示同步的远程调用，例如响应 HTTP 请求或远程过程调用。

#### Internal

Internal Span 表示不跨越进程边界的操作。诸如检测函数调用或 Express 中间件之类的操作可能会使用 Internal Span。

#### Producer

Producer Span 表示创建可在以后异步处理的任务。它可以是远程任务，例如插入任务队列，也可以是由事件监听器处理的事件。

#### Consumer

Consumer Span 表示对生产者创建的任务的处理，并且可能在生产者 Span 结束很久之后才开始。

## 规范 {#specification}

有关更多信息，请参阅[链路规范](/docs/specs/otel/overview/#tracing-signal)。
