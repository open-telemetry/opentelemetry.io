---
title: 插桩
description: OpenTelemetry 如何促进插桩
aliases: [instrumenting]
weight: 15
default_lang_commit: deb98d0648c4833d9e9d77d42e91e2872658b50c
---

要使系统具备[可观测性][observable]，就必须进行**插桩（Instrumentation）**：
也就是说，系统组件中的代码必须发出[信号][signals]，如[链路][traces]、[指标][metrics]和[日志][logs]。

使用 OpenTelemetry，你可以通过两种主要方式对代码进行插桩：

1. 通过官方[适用于大多数编程语言的 API 和 SDK](/docs/languages/)的[代码开发方案](code-based/)
2. [零代码方案](zero-code/)

**基于代码**的方案可以让你从应用本身获取更深入的洞察和丰富的遥测数据。
它们使你能够使用 OpenTelemetry API 从应用中生成遥测数据，作为零代码方案生成遥测数据的重要补充。

**零代码**方案非常适合入门使用，或在你无法修改需要获取遥测数据的应用时使用。
它们可以从你所使用的库和/或应用运行的环境中提供丰富的遥测数据。
换句话说，它们提供的是关于应用**边缘**发生情况的信息。

你可以同时使用这两种方案。

## OpenTelemetry 的其他优势 {#additional-opentelemetry-benefits}

OpenTelemetry 不仅仅提供零代码和基于代码的遥测解决方案。以下内容也是 OpenTelemetry 的一部分：

- 代码库可以将 OpenTelemetry API 作为依赖项进行集成，除非导入 OpenTelemetry SDK，
  否则对使用该库的应用不会产生任何影响。
- 对于每种[信号]，你都有多种方法可以创建、处理和导出它们。
- 借助实现中内建的[上下文传播](../context-propagation/)，你可以关联不同位置生成的信号。
- [资源](../resources/)和[插桩作用域](../instrumentation-scope/)允许按不同实体对信号进行分组，
  例如[主机](/docs/specs/semconv/resource/host/)、[操作系统](/docs/specs/semconv/resource/os/)或
  [K8s 集群](/docs/specs/semconv/resource/k8s/#cluster)。
- 每个语言特定的 API 和 SDK 实现都遵循 [OpenTelemetry 规范](/docs/specs/otel/)的要求和预期。
- [语义约定](../semantic-conventions/)提供了一个通用的命名模式，可用于在不同代码库和平台之间实现标准化。

[logs]: ../signals/logs/
[metrics]: ../signals/metrics/
[observable]: ../observability-primer/#what-is-observability
[signals]: ../signals/
[traces]: ../signals/traces/
