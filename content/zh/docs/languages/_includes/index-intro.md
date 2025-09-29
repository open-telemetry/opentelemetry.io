---
default_lang_commit: 2f850a610b5f7da5730265b32c25c9226dc09e5f
---

这是 OpenTelemetry {{ $name }} 的文档。 OpenTelemetry 是一个可观测性框架，这个框架提供了
API、SDK 以及一系列工具，用于辅助生成以及收集应用的遥测数据，比如链路、指标、日志。
通过本文档，你将了解如何开始使用 OpenTelemetry {{ $name }}。

## 状态以及版本发布 {#status-and-releases}

OpenTelemetry {{ $name }} 的当前主要功能组件状态如下：

| 链路                | 指标                 | 日志              |
| ------------------- | -------------------- | ----------------- |
| {{ $tracesStatus }} | {{ $metricsStatus }} | {{ $logsStatus }} |

我们可以在 [Releases] 中找到所有已发布的版本，包括[最新发布的版本][latest release]。 {{ $.Inner }}

[latest release]: <https://github.com/open-telemetry/opentelemetry-{{ $lang }}/releases/latest>
[Releases]: <https://github.com/open-telemetry/opentelemetry-{{ $lang }}/releases>
