---
title: 信号
description: 了解 OpenTelemetry 支持的遥测类别
aliases: [data-sources, otel-concepts]
weight: 11
default_lang_commit: e7c30e9
drifted_from_default: true
---

OpenTelemetry 的目的是收集、处理和导出[信号][signals]。
信号是系统输出，描述了操作系统和平台上运行的应用程序的底层活动。
信号可以是你希望在特定时间点测量的某项指标，如温度或内存使用率，
也可以是贯穿你希望跟踪的分布式系统组件的事件。
你可以将不同的信号组合在一起，从不同角度观察同一种技术的内部运作方式。

目前，OpenTelemetry 支持以下类型的信号：

- [链路（Trace）](/docs/concepts/signals/traces)
- [指标 (Metric)](/docs/concepts/signals/metrics)
- [日志 (Log)](/docs/concepts/signals/logs)
- [行李 (Baggage)](/docs/concepts/signals/baggage)

正在开发或处于[提案][proposal]阶段的信号：

- [事件][Events]，一种特定类型的[日志](logs)
- [性能分析数据][Profiles]，由 Profiling 工作组负责推进。

[Events]: /docs/specs/otel/logs/data-model/#events
[Profiles]: https://github.com/open-telemetry/opentelemetry-specification/blob/main/oteps/profiles/0212-profiling-vision.md
[proposal]: https://github.com/open-telemetry/opentelemetry-specification/tree/main/oteps/#readme
[signals]: /docs/specs/otel/glossary/#signals
