---
title: 链路（Trace）
weight: 1
description: 请求通过应用程序的路径。
default_lang_commit: f6af710a28eb8e4cd4306f0a807ac6c6220bbc76
---

**Traces** 为我们提供了向应用程序发出请求时会发生什么的总览图。无论您的应用程序是具有单个数据库的整体式应用程序还是复杂的服务网格，trace 对于了解请求在应用程序中的完整“路径”至关重要。

让我们用三个工作单元来探讨这个问题，表示为 [Spans](#spans):

{{% alert title="Note" %}}

以下 JSON 示例不表示特定格式，尤其是不表示 [OTLP/JSON](/docs/specs/otlp/#json-protobuf-encoding)，因为 OTLP/JSON 更详细。

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

这是根 Span，表示整个操作的开始和结束。请注意，它有一个 `trace_id` 字段指示 trace，但没有 `parent_id`。这就是您知道它是根 Span 的方式。

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

此 Span 封装了特定任务，例如说问候，其父级是 `hello` Span。请注意，它与根 Span 共享相同的`trace_id`，这表明它是同一 trace 的一部分。此外，它还具有`parent_id` 与 `hello` Span 的 `span_id`匹配。

`hello-salutations` span:

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

此 Span 表示此 trace 中的第三个操作，与上一个操作一样，它是 `hello` Span 的子级。这也使它与 `hello-greetings` Span 同级。

这三个 JSON 块都共享相同的 `trace_id`，并且 `parent_id` field 表示层次结构。这使它成为 Trace！

您需要注意的另一件事是，每个 Span 看起来都像一个结构化的日志。那是因为它有点像！将 Traces 视为结构化日志的集合，其中包含上下文、关联、层次结构等。但是，这些“结构化日志”可能来自不同的进程、服务、虚拟机、数据中心等。这就是允许 trace 表示任何系统的端到端视图的原因。

为了了解 OpenTelemetry 中的 trace 是如何工作的，让我们看看将在检测代码中发挥作用的组件列表。

## Tracer 提供者

Tracer Provider（有时称为 `TracerProvider`）是 `Trace` 的生产工厂。在大多数应用程序中，Tracer Provider 初始化一次，其生命周期与应用程序的生命周期相匹配。Tracer Provider 初始化还包括 Resource 和 Exporter 初始化。这通常是使用 OpenTelemetry 进行跟踪的第一步。在某些语言 SDK 中，已为您初始化了全局 Tracer Provider。

## Tracer

Tracer 创建的 Span 包含有关给定操作（例如服务中的请求）所发生情况的更多信息。Tracer 是从 Tracer Provider 创建的。

## Trace 导出者

Trace Exporter 将 traces 发送给使用者。此使用者可以是调试和开发时的标准输出、OpenTelemetry Collector 或您选择的任何开源或供应商后端。

## 上下文传播

Context Propagation 是实现 Distributed Tracing 的核心概念。使用上下文传播，Span 可以相互关联并组合成一个trace，而不管 Span 是在何处生成的。要了解有关此主题的更多信息，请参阅有关 [Context Propagation](../../context-propagation) 的概念页面。

## Spans

**Span** 表示工作或操作单元。Span 是 Trace 的构建块。在 OpenTelemetry 中，它们包括以下信息：

- 名字
- 父 Span ID（根 Span 为空）
- 开始和结束时间戳
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

Span 可以嵌套，这由父 Span ID 的存在来标识：子 Span 表示子操作。这允许 Span 更准确地捕获应用程序中完成的工作。

### Span 上下文

Span context 是每个 Span 上的不可变对象，其中包含以下内容：

- 表示 Span 所属 trace 的 Trace ID
- Span 的 Span ID
- Trace Flags，一种二进制编码，包含有关 trace 的信息
- Trace State，可以携带供应商特定 trace 信息的键值对列表

Span 上下文是 Span 的一部分，它与 Span 一起序列化和传播[分布式上下文](#context-propagation)和[包袱](../baggage)。

由于 Span Context 包含 trace ID，因此在创建 [Span 链接](#span-links)。

### 属性

属性是包含元数据的键值对，您可以使用这些元数据对 Span 进行注释，以携带有关它正在跟踪的操作的信息。

例如，如果 Span 跟踪了将商品添加到电子商务系统中用户购物车的操作，则可以捕获用户的 ID、要添加到购物车的商品的 ID 以及购物车 ID。

您可以在创建 Span 期间或之后向 Span 添加属性。最好在创建范围时添加属性，以使属性可用于 SDK 采样。如果必须在 Span 创建后添加值，请使用该值更新 Span。

属性具有每种语言 SDK 实现的以下规则：

- 键必须是非 null 字符串值
- 值必须是非 null 字符串、布尔值、浮点值、整数或这些值的数组

此外，还有[语义属性](/docs/specs/semconv/general/trace/)，这是常见操作中通常存在的元数据的已知命名约定。尽可能使用语义属性命名会很有帮助，这样就可以跨系统标准化常见类型的元数据

### Span 事件

可以将 Span 事件视为 Span 上的结构化日志消息（或注释），通常用于表示 Span 持续时间内有意义的单个时间点。

例如，考虑 Web 浏览器中的两个场景：

1. 跟踪页面加载
2. 表示页面何时变为交互式

Span 最适合用于第一种情况，因为它是具有开始和结束的操作。

Span Event 最适合用于跟踪第二种情况，因为它表示有意义的单一时间点。

#### 何时使用 Span 事件与 Span 属性

由于 Span 事件也包含属性，因此何时使用事件而不是属性的问题可能并不总是有明显的答案。为了做出明智的决定，请考虑特定时间戳是否有意义。

例如，当您使用 Span 跟踪操作并且操作完成时，您可能希望将操作中的数据添加到您的遥测数据中。

- 如果操作完成的时间戳有意义或相关，请将数据附加到 Span 事件。
- 如果时间戳没有意义，请将数据附加为 Span 属性。

### Span 链接

链接的存在以便您可以将一个 Span 与一个或多个 Span 相关联，从而暗示因果关系。例如，假设我们有一个分布式系统，其中某些操作由 trace 跟踪。

为了响应其中一些操作，其他操作将排队等待执行，但其执行是异步的。我们也可以通过 trace 来跟踪这个后续操作。

我们希望将后续操作的 trace 与第一个 trace 相关联，但无法预测后续操作何时开始。我们需要关联这两个 trace，因此我们将使用 Span 链接。

您可以将第一个 trace 的最后一个 Span 链接到第二个 trace 中的第一个 Span。现在，它们彼此之间有因果关系。

链接是可选的，但可以将跟踪 Span 彼此关联起来。

有关 Span 链接的更多信息，请参阅[链接](/docs/specs/otel/trace/api/#link)。

### Span 状态

每个 Span 都有一个状态。三个可能的值是：

- `Unset`
- `Error`
- `Ok`

默认值为 `Unset`。Span 状态为 Unset 表示它跟踪的操作已成功完成，没有错误。

当 Span 状态为 `Error` 时，这意味着它跟踪的操作中发生了一些错误。例如，这可能是由于处理请求的服务器上的 HTTP 500 错误造成的。

当 Span 状态为 `Ok`（正常） 时，这意味着应用程序开发人员已将该 Span 显式标记为无错误。虽然这不直观，但当已知 Span 已完成且没有错误时，不需要将 Span 状态设置为 `Ok，因为` `Unset` `涵盖了这一点。Ok` 的作用是表示对用户显式设置的 Span 状态的明确“最终调用”。这在开发人员希望除了 “successful” 之外没有其他 Span 解释的情况下非常有用。

重申一下：`Unset` 表示一个 Span 完成且没有错误。还行 表示开发人员何时明确将 Span 显式标记为 `Ok`。

### Span 类型

创建 Span 时，它是 `Client`、`Server`、`Internal`、`Producer` 或 `Consumer` 之一。这种 Span 类型为跟踪后端提供了有关如何组装 trace 的提示。根据 OpenTelemetry 规范，服务器 Span 的父级通常是远程客户端 Span，而 client Span 的子级通常是服务器 Span。同样，使用者 Span 的父级始终是生产者，而生产者 Span 的子级始终是使用者。如果未提供，则假定 Span 类型为 internal。


有关 SpanKind 的更多信息，请参阅[SpanKind](/docs/specs/otel/trace/api/#spankind)。

#### Client

Client Span 表示同步传出远程调用，例如传出 HTTP 请求或数据库调用。请注意，在此上下文中， “synchronous” 不是指 `async/await`，而是指它不排队以供以后处理的事实。

#### Server

Server Span 表示同步传入的远程调用，例如传入的 HTTP 请求或远程过程调用。

#### Internal

Internal Span 表示不跨越进程边界的操作。诸如检测函数调用或 Express 中间件之类的操作可能会使用内部 Span。

#### Producer

Producer Span 表示创建可在以后异步处理的任务。它可以是远程任务，例如插入任务队列的任务，也可以是由事件侦听器处理的本地任务。

#### Consumer

Consumer Span 表示对生产者创建的任务的处理，并且可能在生产者 Span 结束很久之后才开始。

## 规范

有关更多信息，请参阅[traces 规范](/docs/specs/otel/overview/#tracing-signal)。