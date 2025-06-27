---
default_lang_commit: 2f850a610b5f7da5730265b32c25c9226dc09e5f
---

这是 OpenTelemetry {{ $name }} 的文档。 OpenTelemetry 是一个可观测性框架，这个框架提供了
API、SDK 以及一系列工具，用于辅助生成以及收集应用程序的遥感数据，比如指标（metrics）、日志（logs）
和链路追踪（trace），通过本文档，你会了解如何开始使用 OpenTelemetry {{ $name }}。

## 状态以及版本发布{#status-and-releases}

OpenTelemetry {{ $name }} 的当前主要功能组件状态如下：

| 链路追踪（Traces）  | 指标（Metrics）      | 日志（Logs）      |
| ------------------- | -------------------- | ----------------- |
| {{ $tracesStatus }} | {{ $metricsStatus }} | {{ $logsStatus }} |

我们可以在 [Releases] 中找到所有已发布的版本，包括 [latest release][]。 {{ $.Inner }}

[latest release]: <https://github.com/open-telemetry/opentelemetry-{{ $lang }}/releases/latest>
[Releases]: <https://github.com/open-telemetry/opentelemetry-{{ $lang }}/releases>
