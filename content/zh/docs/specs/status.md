---
title: 规范状态概览
linkTitle: 状态
aliases: [otel/status]
weight: -10
default_lang_commit: 880560388fab20d661f7c093df08ae36ea453203
drifted_from_default: true
---

OpenTelemetry 是基于各种信号逐一开发的。链路追踪、指标、Baggage 和日志都是一种信号。
每个信号都构建在上下文传播机制之上，这是一种用于在分布式系统中关联数据的共享机制。

每个信号由四个[核心组件](/docs/concepts/components/)组成：

- API
- SDK
- [OpenTelemetry 协议](/docs/specs/otlp/)（OTLP）
- [Collector](/docs/collector/)

信号还包括 contrib 组件，这是插件和插桩组成的生态体系。
所有插桩遵循统一的语义约定，以确保在观察常见操作（如 HTTP 请求）时生成相同的数据。

如需了解信号和组件的信息，请参阅 OTel 规范的[概览页面](/docs/specs/otel/overview/)。

## 组件生命周期 {#component-lifecycle}

组件遵循以下开发生命周期：

- **草案（Draft）**组件仍在设计中，尚未纳入规范。
- **实验性（Experimental）**组件已发布并可进行测试。
- **稳定（Stable）**组件向后兼容，并享有长期支持。
- **弃用（Deprecated）**组件仍然稳定，但未来可能被移除。

有关生命周期和长期支持的完整定义，
参阅[版本管理与稳定性](/docs/specs/otel/versioning-and-stability/)。

## 当前状态 {#current-status}

以下是目前各个信号的高层次状态报告。请注意，虽然 OpenTelemetry 各客户端遵循统一规范开发，但它们是独立开发的。

建议查看每个客户端在其
[GitHub 仓库](https://github.com/open-telemetry)中 README 文件的当前状态说明。客户端对特性支持的具体情况可在
[规范兼容性表](https://github.com/open-telemetry/opentelemetry-specification/blob/main/spec-compliance-matrix.md)中查看。

注意，以下各部分中的 **Collector** 状态与**协议**状态一致。

### 链路追踪 {#tracing}

- [规范][tracing]
- 备注：
  - 链路追踪规范现已完全稳定，并纳入长期支持范围。
  - 链路追踪规范仍可扩展，但必须保持向后兼容。
  - 一旦链路追踪实现完成，OpenTelemetry 客户端将进入 v1.0 版本。

### 指标 {#metrics}

- [规范][metrics]
- 备注：
  - OpenTelemetry 各项指标正在积极开发中。
  - 数据模型已稳定，并作为 OTLP 协议的一部分发布。
  - Collector 中已提供对指标处理的实验性支持。
  - Collector 正与 Prometheus 社区合作，开发对 Prometheus 的支持。

### Baggage

- [规范][baggage]
- **SDK：** 稳定
- **协议：** 不适用
- 备注：
  - Baggage 现已完全稳定。
  - Baggage 不是可观测性工具，而是一种在事务中附加任意键值对的系统，使下游服务可以访问这些值。
    因此，Baggage 没有 OTLP 或 Collector 组件。

### 日志 {#logging}

- [规范][logging]
- 备注：
  - [日志数据模型][logs data model]已作为 OpenTelemetry 协议的一部分发布。
  - 多种数据格式的日志处理已通过 Stanza 捐赠集成至 Collector。
  - OpenTelemetry 的 Log Bridge API 允许开发日志附加器，用于将现有日志框架中的日志桥接到 OpenTelemetry
    中。该 API 并不面向终端用户直接调用。目前正在开发多种编程语言的日志附加器。
  - OpenTelemetry Log SDK 是 Log Bridge API 的标准实现。应用可以通过配置该 SDK
    来指定日志的处理与导出方式（例如使用 OTLP 协议）。
  - OpenTelemetry 的 Log Bridge API 还包含实验性支持，
    可用于生成符合[事件语义约定][event semantic conventions]的日志记录。

### 分析配置 {#profiles}

- [规范][profiles]

[baggage]: /docs/specs/otel/baggage/
[event semantic conventions]: /docs/specs/semconv/general/events/
[logging]: /docs/specs/otel/logs/
[logs data model]: /docs/specs/otel/logs/data-model/
[metrics]: /docs/specs/otel/metrics/
[profiles]: /docs/specs/otel/profiles/
[tracing]: /docs/specs/otel/trace/
