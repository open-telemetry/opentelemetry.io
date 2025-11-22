---
title: 组件
description: 构成 OpenTelemetry 的主要组件
aliases: [data-collection]
weight: 20
default_lang_commit: 1ca30b4d
drifted_from_default: true
---

OpenTelemetry 项目目前由以下几个主要部分构成：

- [规范](#specification)
- [Collector](#collector)
- [特定语言的 API 和 SDK 实现](#language-specific-api--sdk-implementations)
  - [插桩库](#instrumentation-libraries)
  - [导出器](#exporters)
  - [零代码插桩](#zero-code-instrumentation)
  - [资源检测器](#resource-detectors)
  - [跨服务传播器](#cross-service-propagators)
  - [采样器](#samplers)
- [K8s Operator](#kubernetes-operator)
- [函数即服务（FaaS）资产](#function-as-a-service-assets)

OpenTelemetry 让你无需使用特定供应商的 SDK 和工具就能生成和导出遥测数据。

## 规范 {#specification}

本节说明了针对所有实现的跨语言要求和期望。除了术语定义之外，规范还定义了以下内容：

- **API:** 定义了用于生成和关联跟踪、指标和日志数据的数据类型和操作。
- **SDK:** 定义了 API 特定语言实现的要求。配置、数据处理和导出概念也在这里定义。
- **数据:** 定义了 OpenTelemetry 协议（OTLP）和与供应商无关的、遥测后端可以提供支持的语义约定。

更多信息，请参见[规范](/docs/specs/)。

## Collector

OpenTelemetry Collector 是一个与供应商无关的代理，可以接收、处理和导出遥测数据。
它支持以多种格式接收遥测数据（例如 OTLP、Jaeger、Prometheus 以及许多商业/专有工具）并将数据发送到一个或多个后端。
它还支持在导出之前处理和过滤遥测数据。

更多信息，请参见 [Collector](/docs/collector/)。

## 针对特定编程语言的 API 和 SDK 实现 {#language-specific-api--sdk-implementations}

OpenTelemetry 还提供语言 SDK，允许你使用所选语言的 OpenTelemetry API 生成遥测数据，并将这些数据导出到首选后端。
这些 SDK 还允许你结合常见库和框架的插桩库，以便你可以将其用于应用程序中的手动插桩。

更多信息，请参见[插桩操作](/docs/concepts/instrumentation/)。

### 插桩库 {#instrumentation-libraries}

OpenTelemetry 支持通过大量组件来为所支持的语言根据流行的库和框架生成相关遥测数据。
例如，来自 HTTP 库的入站和出站 HTTP 请求生成有关这些请求的数据。

OpenTelemetry 的一个远景目标是，使所有流行的库默认即可被观测，从而无需额外依赖。

更多信息，请参见[插桩库](/docs/concepts/instrumentation/libraries/)。

### 导出器 {#exporters}

{{% docs/languages/exporters/intro %}}

### 零代码插桩 {#zero-code-instrumentation}

如果适用，OpenTelemetry 的特定语言实现提供一种无需修改源代码即可对应用程序进行插桩的方法。
虽然底层机制取决于使用的语言，零代码插桩将 OpenTelemetry API 和 SDK 能力添加到你的应用程序中。
此外，零代码插桩还可以添加一组插桩库和导出器依赖项。

更多信息，请参见[零代码插桩](/docs/concepts/instrumentation/zero-code/)。

### 资源检测器 {#resource-detectors}

[资源](/docs/concepts/resources/)以资源属性表示生成遥测数据的实体。
例如，在 Kubernetes 上运行的容器中生成遥测数据的进程具有 Pod 名称、命名空间和可能的 Deployment 名称。
你可以将所有这些属性包含在资源中。

OpenTelemetry 的特定语言实现提供了从环境变量 `OTEL_RESOURCE_ATTRIBUTES`
和许多常见实体（如进程运行时、服务、主机或操作系统）中检测资源的功能。

更多信息，请参见[资源](/docs/concepts/resources/)。

### 跨服务传播器 {#cross-service-propagators}

传播是一种用于跨服务和进程边界传递信息的机制。
虽然不限于跟踪，但传播允许跟踪在跨越进程和网络边界的服务中建立系统因果关系的信息。

对于绝大多数场景，上下文传播是通过插桩库为你完成的。
如果有必要，你可以自己使用自定义的传播器来序列化和反序列化跨领域的关注点，
例如 Span 的上下文和 [baggage](/docs/concepts/signals/baggage/)。

### 采样器 {#samplers}

采样是限制系统生成跟踪数量的过程。
OpenTelemetry 每个特定语言的实现都提供了几种[标头采样器](/docs/concepts/sampling/#head-sampling)。

更多信息，请参见[采样](/docs/concepts/sampling)。

## Kubernetes Operator

OpenTelemetry Operator 是 Kubernetes Operator 的一种实现。
Operator 管理 OpenTelemetry Collector 以及使用 OpenTelemetry 对工作负载进行自动插桩。

更多信息，请参见 [K8s Operator](/docs/platforms/kubernetes/operator/)。

## 函数即服务资产 {#function-as-a-service-assets}

OpenTelemetry 支持多种由不同云服务商提供的函数即服务的监控方法。
OpenTelemetry 社区目前提供预构建的 Lambda 层，能够自动对你的应用进行插桩，
另外在手动或自动对应用进行插桩时可以使用的独立 Collector Lambda 层选项。

更多信息，请参见[函数即服务](/docs/platforms/faas/)。
