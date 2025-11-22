---
title: 术语表
description: OpenTelemetry 中遥测术语的定义与惯例。
weight: 200
default_lang_commit: 7535ae5560fb961cbf02df25f92af65fb9c7c745
drifted_from_default: true
---

本术语表定义了 OpenTelemetry 项目中出现的新术语和[概念](/docs/concepts/)，
并阐明了常见可观测性术语在 OpenTelemetry 中的特定含义。

当有助于理解时，我们也会注释拼写与大小写用法。例如，请参见
[OpenTelemetry](#opentelemetry) 和 [OTel](#otel)。

## 术语 {#terms}

### 聚合 {#aggregation}

在程序执行期间，将多个测量值组合为关于在某个时间区间内发生的测量的精确或估算统计数据的过程。
由[指标](#metric)[数据源](#data-source)使用。

### API

应用编程接口（Application Programming Interface）。在
OpenTelemetry 项目中，用于定义如何从[数据源](#data-source)生成遥测数据。

### 应用 {#application}

为终端用户或其他应用设计的一个或多个[服务](#service)。

### APM

应用性能监控（Application Performance Monitoring），
用于监控软件应用的性能（速度、可靠性、可用性等），以发现问题、发送警报，并支持定位根因的工具。

### 属性 {#attribute}

OpenTelemetry 中对[元数据](#metadata)的术语。为产生遥测数据的实体添加键值信息。
用于所有[信号](#signal)和[资源](#resource)。参见[属性规范][attribute]。

### 自动插桩 {#automatic-instrumentation}

指无需终端用户修改应用源代码的遥测采集方式。具体方法因编程语言而异，
示例包括字节码注入或猴子补丁（monkey patching）。

### 行李 {#baggage}

传播[元数据](#metadata)的一种机制，帮助建立事件和服务之间的因果关系。
参见 [baggage 规范][baggage]。

### 客户端库 {#client-library}

参见[已插桩库](#instrumented-library)。

### 客户端应用 {#client-side-app}

[应用](#application)的一部分，运行在非私有基础设施中，通常直接被终端用户使用。
例如浏览器应用、移动应用和运行在物联网设备上的应用。

### Collector

[OpenTelemetry Collector]，简称 Collector，是一个与厂商无关的遥测数据接收、处理和导出实现。
一个可部署为代理或网关的单一二进制程序。

> **拼写提示**：在指代 [OpenTelemetry Collector] 时，请始终将 “Collector” 大写。
> 如果用作形容词，可直接使用 “Collector”，例如 “Collector 配置”。

[OpenTelemetry Collector]: /docs/collector/

### Contrib

多个[插桩库](#instrumentation-library)和 [Collector](#collector)
提供一组核心功能，并有一个专门的 contrib 仓库用于包含非核心功能，如厂商的 `Exporters`。

### 上下文传播 {#context-propagation}

允许所有[数据源](#data-source)共享一个底层的上下文机制，
以便在[事务](#transaction)的生命周期内存储状态和访问数据。参见[上下文传播规范][context propagation]。

### 有向无环图（DAG） {#dag}

[Directed Acyclic Graph（有向无环图）][dag]。

### 数据源 {#data-source}

参见[信号](#signal)。

### 维度 {#dimension}

[指标](#metric)中使用的术语。参见[属性](#attribute)。

### 分布式追踪 {#distributed-tracing}

追踪单个[请求](#request)（称为[链路](#trace)）在多个[服务](#service)中的传播过程，
这些服务构成了一个[应用](#application)。[分布式追踪](#distributed-tracing)会跨越进程、网络和安全边界。

参见[分布式追踪][distributed tracing]。

### 分发版本 {#distribution}

是对上游 OpenTelemetry 仓库的封装，包含一些自定义内容。参见 [Distributions]。

### 实体 {#entity}

实体由一组用于标识和描述物理对象或逻辑对象的[属性](#attribute)组成。
实体通常与遥测数据相关联。例如，CPU 实体描述一个物理 CPU，
而服务实体描述构成 HTTP 或其他服务的一组逻辑进程。

### 事件 {#event}

事件是一个带有事件名称和已知结构的[日志记录](#log-record)。
例如，OpenTelemetry 中的浏览器事件采用特定的命名规则并携带具有通用结构的特定数据。

### 导出器 {#exporter}

用于将遥测数据发送给消费者的功能组件。导出器可以是推送型或拉取型。

### 字段 {#field}

[日志记录](#log-record)中使用的术语。[元数据](#metadata)可通过定义字段添加，
包括[属性](#attribute)和[资源](#resource)。其他字段，如严重级别和链路信息，
也可以视为`元数据`。参见[字段规范][field]。

### gRPC

一个高性能的开源通用 [RPC](#rpc) 框架。参见 [gRPC](https://grpc.io)。

### HTTP

超文本传输协议的缩写。参见 [Hypertext Transfer Protocol（超文本传输协议）][http]。

### 已插桩库 {#instrumented-library}

指收集遥测信号（[链路](#trace)、[指标](#metric)、[日志](#log)）的[库](#library)。
参见[已插桩库][Instrumented library]。

### 插桩库 {#instrumentation-library}

指为特定[已插桩库](#instrumented-library)提供插桩功能的[库](#library)。
[已插桩库](#instrumented-library)和[插桩库](#instrumentation-library)可以是同一个[库](#library)，
如果它已内置 OpenTelemetry 插桩功能。参见 [插桩库规范][spec-instrumentation-lib]。

### JSON

JavaScript 对象表示法的缩写。参见 [JSON][json]。

### 标签 {#label}

[指标](#metric)中使用的术语。参见[元数据](#metadata)。

### 语言 {#language}

即编程语言。

### 库 {#library}

通过接口调用的一组语言特定行为集合。

### 日志 {#log}

有时指一组[日志记录](#log-record)。也可能表示单个[日志记录](#log-record)。
为避免歧义，建议使用明确术语，例如 `日志记录`。参见 [日志][log]。

### 日志记录 {#log-record}

带有时间戳和严重级别的数据记录。当与链路相关时，也可能包含[链路 ID](#trace)
和 [Span ID](#span)。参见[日志记录][Log record]。

### 元数据 {#metadata}

键值对形式，例如 `foo="bar"`，添加到产生遥测数据的实体中。
OpenTelemetry 将这些键值对称为[属性](#attribute)。此外，
[指标](#metric)有[维度](#dimension)和[标签](#label)，而[日志](#log)有[字段](#field)。

### 指标 {#metric}

记录一个数据点，可以是原始测量值或预定义聚合结果，按时间序列形式呈现，
并附带[元数据](#metadata)。参见[指标][metric]。

### OC

[OpenCensus](#opencensus) 的简称。

### 可观测性后端 {#observability-backend}

可观测性平台中的组件，负责接收、处理、存储和查询遥测数据。示例包括开源工具如
[Jaeger] 和 [Prometheus]，以及商业产品。OpenTelemetry 本身不是一个可观测性后端。

### 可观测性前端 {#observability-frontend}

可观测性平台中的组件，提供可视化和分析遥测数据的用户界面。
它通常是可观测性后端的一部分，尤其是在商业产品中更为常见。

### OpAMP

Open Agent Management Protocol（开放代理管理协议）的缩写。参见
[OpAMP 文档](/docs/collector/management/#opamp)。

> **拼写提示**：请写作 OpAMP，不要写成 `OPAMP` 或 `opamp`。

### OpenCensus

OpenTelemetry 的前身之一。详见[项目历史](/docs/what-is-opentelemetry/#history)。

### OpenTelemetry

由 [OpenTracing](#opentracing) 和 [OpenCensus](#opencensus) 两个项目[合并][merger]而来，
OpenTelemetry 是本网站的主题，是一组 [API](#api)、[SDK](#sdk) 和工具的集合，
可用于[插桩](/docs/concepts/instrumentation/)、生成、
[收集](/docs/concepts/components/#collector)和[导出](/docs/concepts/components/#exporters)[遥测数据](/docs/concepts/signals/)，
如[指标](#metric)、[日志](#log) 和 [追踪](#trace)。

> **拼写提示**：OpenTelemetry 应为一个单词，无连字符，首字母大写。

[merger]: /docs/what-is-opentelemetry/#history

### OpenTracing

OpenTelemetry 的前身之一。详见[项目历史](/docs/what-is-opentelemetry/#history)。

### OT

[OpenTracing](#opentracing) 的简称。

### OTel

[OpenTelemetry](/docs/what-is-opentelemetry/) 的简称。

> **拼写提示**：应写作 OTel，不应写作 `OTEL`。

### OTelCol

[OpenTelemetry Collector](#collector) 的简称。

### OTEP

[OpenTelemetry Enhancement Proposal（OpenTelemetry 增强提案）][OpenTelemetry Enhancement Proposal]的缩写。

> **拼写提示**：复数形式写作 "OTEPs"，不要写作 `OTep` 或 `otep`。

[OpenTelemetry Enhancement Proposal]: https://github.com/open-telemetry/opentelemetry-specification/blob/main/oteps/README.md

### OTLP

OpenTelemetry 协议的缩写。参见 [/docs/specs/otlp/](/docs/specs/otlp/)。

### 传播器 {#propagators}

用于序列化和反序列化遥测数据的特定部分，如 [Span](#span)
上下文和 [Baggage](#baggage)。参见[传播器][propagators]。

### Proto

语言无关的接口类型。参见 [opentelemetry-proto]。

### 接收器 {#receiver}

在 [Collector](/docs/collector/configuration/#receivers)
中定义如何接收遥测数据的组件。接收器可以是推送型或拉取型。参见 [Receiver]。

### 请求 {#request}

参见[分布式追踪](#distributed-tracing)。

### 资源 {#resource}

由一组[实体](#entity)或[属性](#attribute)组成，用于标识或描述产生遥测数据的物理对象或逻辑对象。

### REST

Representational State Transfer（表现层状态转移）的缩写。参见 [REST][rest]。

### RPC

Remote Procedure Call（远程过程调用）的缩写。参见 [RPC][rpc]。

### 采样 {#sampling}

控制导出数据量的一种机制。最常用于[追踪](#trace)[数据源](#data-source)。
参见[采样][sampling]。

### SDK

软件开发工具包（Software Development Kit）的缩写。指实现了
OpenTelemetry [API](#api) 的遥测 SDK，也是一种[库](#library)。

### 语义约定 {#semantic-conventions}

定义 [元数据](#metadata) 的标准名称和值，以提供与厂商无关的遥测数据。

### 服务 {#service}

一个[应用](#application)的组成部分。为实现高可用性和可扩展性，
通常会部署多个[服务](#service)实例。[服务](#service)也可以部署在多个位置。

### 信号 {#signal}

[链路](#trace)、[指标](#metric)或[日志](#log)之一。参见[信号][signals]。

### Span

表示一次[追踪](#trace)中的单个操作。参见 [Span]。

### Span 链接 {#span-link}

Span 之间因果关系的链接。详细信息参见
[Span 之间的链接](/docs/specs/otel/overview#links-between-spans)和[指定链接](/docs/specs/otel/trace/api#specifying-links)。

### 规范 {#specification}

描述所有实现之间跨语言的要求与预期。参见[规范][specification]。

### 状态 {#status}

操作的结果，通常用于指示是否发生错误。参见[状态][status]。

### 标记 {#tag}

参见[元数据](#metadata)。

### 链路 {#trace}

由多个 [Span](#span) 构成的[有向无环图（DAG）](#dag)，其中
[Span](#span) 之间的边表示父子关系。参见[链路][traces]。

### Tracer

负责创建 [Span](#span) 的组件。参见 [Tracer]。

### 事务 {#transaction}

参见[分布式追踪](#distributed-tracing)。

### zPages

一种进程内的替代导出方式。启用后，它会在后台收集和聚合追踪与指标数据，并在网页中提供展示。参见 [zPages]。

[attribute]: /docs/specs/otel/common/#attributes
[baggage]: /docs/specs/otel/baggage/api/
[context propagation]: /docs/specs/otel/overview#context-propagation
[dag]: https://en.wikipedia.org/wiki/Directed_acyclic_graph
[distributed tracing]: ../signals/traces/
[distributions]: ../distributions/
[field]: /docs/specs/otel/logs/data-model#field-kinds
[http]: https://en.wikipedia.org/wiki/Hypertext_Transfer_Protocol
[instrumented library]: /docs/specs/otel/glossary/#instrumented-library
[Jaeger]: https://www.jaegertracing.io/
[json]: https://en.wikipedia.org/wiki/JSON
[log record]: /docs/specs/otel/glossary#log-record
[log]: /docs/specs/otel/glossary#log
[metric]: ../signals/metrics/
[opentelemetry-proto]: https://github.com/open-telemetry/opentelemetry-proto
[propagators]: /docs/languages/go/instrumentation/#propagators-and-context
[Prometheus]: https://prometheus.io/
[receiver]: /docs/collector/configuration/#receivers
[rest]: https://en.wikipedia.org/wiki/Representational_state_transfer
[rpc]: https://en.wikipedia.org/wiki/Remote_procedure_call
[sampling]: /docs/specs/otel/trace/sdk#sampling
[signals]: ../signals/
[span]: /docs/specs/otel/trace/api#span
[spec-instrumentation-lib]: /docs/specs/otel/glossary/#instrumentation-library
[specification]: ../components/#specification
[status]: /docs/specs/otel/trace/api#set-status
[tracer]: /docs/specs/otel/trace/api#tracer
[traces]: /docs/specs/otel/overview#traces
[zpages]: https://github.com/open-telemetry/opentelemetry-specification/blob/main/development/trace/zpages.md
