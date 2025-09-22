---
title: Metrics
weight: 2
description: 在运行时捕获的测量值。
default_lang_commit: 7c0e4db0b6c39b0ca0e7efb17df5610d1b77b8a3
---

一个 **metric** 是在运行时捕获的服务的**测量值**。捕获测量值的时刻称为 **metric 事件**，它不仅包括测量值本身，还包括捕获它的时间和相关的元数据。

应用和请求的 metrics 是可用性和性能的重要指标。自定义 metric 可以在‘可用性因素是如何影响到用户体验和业务’方面提供见解。收集的数据可以用于异常警告或触发调度决策，以在高要求时自动扩展部署。

要了解 OpenTelemetry 中的 metrics 是如何工作的，让我们看看在对代码进行观测时会涉及的一系列组件。

## Meter Provider {#meter-provider}

Meter Provider（有时称为 `MeterProvider`）是 `Meter` 的提供者。在大多数应用程序中，Meter Provider 只初始化一次，其生命周期与应用程序的生命周期匹配。Meter Provider 的初始化还包括资源和导出器（Exporter）的初始化。它通常是使用 OpenTelemetry 进行观测的第一步。在某些语言 SDK 中，已经为您初始化了全局 Meter Provider。

## Meter {#meter}

Meter 创建 [metric instruments](#metric-instruments)，在运行时捕获有关服务的测量值。Meter 是由 Meter Provider 创建的。

## Metric Exporter {#metric-exporter}

Metric Exporter 将度量数据发送给消费者。这个消费者可以是开发期间用于调试的标准输出、OpenTelemetry Collector，或您选择的任何开源或供应商后端。

## Metric Instruments（测量仪器）{#metric-instruments}

在 OpenTelemetry 中，测量值是由 **metric instruments** 捕获的。Metric instruments 由以下部分定义：

- 名称
- 类型
- 单位（可选）
- 描述（可选）

名称、单位和描述由开发人员选择，或者通过[语义约定](/docs/specs/semconv/general/metrics/)为常见的如请求和进程指标定义。

仪器类型如下：

- **Counter**：随着时间的推移累积的值——您可以将其视为汽车的里程表；它只会增加。
- **Asynchronous Counter**：与 **Counter** 相同，但每次导出时收集一次。如果您无法访问连续的增量值，但只能访问聚合值，可以使用它。
- **UpDownCounter**：随着时间的推移累积的值，但也可以再次下降。例如，队列长度会随着队列中工作项的数量而增加和减少。
- **Asynchronous UpDownCounter**：与 **UpDownCounter** 相同，但每次导出时收集一次。如果您无法访问连续的变化值，但只能访问聚合值（例如当前队列大小），可以使用它。
- **Gauge**：在读取时测量当前值。例如，车辆中的燃油表。Gauges 是同步的。
- **Asynchronous Gauge**：与 **Gauge** 相同，但每次导出时收集一次。如果您无法访问连续的变化值，但只能访问聚合值，可以使用它。
- **Histogram**：客户端侧对测量值的聚合，例如请求延迟。如果您对测量值的统计信息感兴趣，直方图是一个不错的选择。例如：有多少请求少于 1 秒？

有关同步和异步仪器的更多信息，以及哪种类型最适合您的用例，请参见[补充指南](/docs/specs/otel/metrics/supplementary-guidelines/)。

## 聚合 {#aggregation}

除了度量仪器之外，**聚合**的概念也是一个重要的理解点。聚合是一种技术，通过该技术将大量测量值组合成在一个时间窗口内发生的指标事件的精确或估计统计数据。OTLP 协议传输这些聚合的指标。OpenTelemetry API 为每个仪器提供默认聚合，可以使用视图覆盖。OpenTelemetry 项目旨在提供可视化工具和遥测后端支持的默认聚合。

与[请求链路追踪](../traces/)不同，后者旨在捕获请求生命周期并为请求的各个部分提供上下文，指标旨在汇总提供统计信息。一些指标的使用示例包括：

- 报告一个服务的不同协议类型所读取的总字节数。
- 报告读取的总字节数和每次请求的字节数。
- 报告系统调用的持续时间。
- 报告请求大小以确定趋势。
- 报告进程的 CPU 或内存使用情况。
- 报告账户的平均余额值。
- 报告当前正在处理的活动请求。

## 视图 {#views}

视图为 SDK 用户提供了灵活性，可以自定义 SDK 输出的指标。您可以自定义要处理或忽略的度量仪器。您还可以自定义聚合和您希望在指标上报告的属性。

## 语言支持 {#language-support}

指标是 OpenTelemetry 规范中的[稳定性](/docs/specs/otel/versioning-and-stability/#stable)信号。有关 Metrics API 和 SDK 的各个语言特定实现，状态如下：

{{% signal-support-table "metrics" %}}

## 规范 {#specification}

要了解有关 OpenTelemetry 中指标的更多信息，请参见[指标规范](/docs/specs/otel/overview/#metric-signal)。
