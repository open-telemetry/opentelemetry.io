---
title: Collector（收集器）
description: 提供厂商中立的遥测数据接收、处理和导出功能。
aliases: [./about]
cascade:
  vers: 0.128.0
weight: 270
default_lang_commit: b13d5dd3a9f288ab64d2af98c0b4ec1694499ef3
drifted_from_default: true
---

![集成 Jaeger、OTLP 和 Prometheus 的 OpenTelemetry Collector 示意图](img/otel-collector.svg)

## 简介 {#introduction}

OpenTelemetry Collector 提供了一种与厂商中立的实现方式，用于接收、处理和导出遥测数据。
它省去了运行、操作和维护多个代理/收集器的需要。这种方式具有更好的可扩展性，
并支持开源可观测性数据格式（例如 Jaeger、Prometheus、Fluent Bit 等），可将数据发送到一个或多个开源或商业后端。

## 目标 {#objectives}

- **可用性**：合理的默认配置，支持主流协议，开箱即用地运行和采集数据。
- **性能**：在不同负载和配置下都具有高度稳定性和高性能。
- **可观测性**：作为可观测服务的典范。
- **可扩展性**：可在不修改核心代码的前提下进行自定义。
- **统一性**：统一代码库，既可作为代理也可作为收集器部署，支持链路、指标和日志。

## 何时使用 Collector {#when-to-use-a-collector}

对于大多数编程语言的特定插桩库来说，你已经拥有用于主流后端和 OTLP 的导出器。你可能会问：

> 在什么情况下应该使用 Collector 来发送数据，而不是让每个服务直接发送到后端？

在尝试或入门 OpenTelemetry 时，直接将数据发送到后端是快速获取价值的好方法。
同样地，在开发或小规模环境中，即使不使用 Collector 也能获得不错的效果。

然而，通常我们建议你在服务旁边使用一个 Collector，因为它能让服务快速卸载数据，而
Collector 可以处理如重试、批处理、加密甚至敏感数据过滤等额外操作。

实际上，[配置 Collector](quick-start) 比你想象的要简单：每种语言的默认
OTLP 导出器都假定 Collector 在本地运行，因此只要你启动 Collector，它就会自动开始接收遥测数据。

## Collector 安全性 {#collector-security}

请遵循最佳实践，确保你的 Collector 被[安全托管][hosted]并[正确配置][configured]。

## 状态 {#status}

**Collector** 的当前状态为：[混合][mixed]，因为核心 Collector
组件当前具有不同的[稳定性等级][stability levels]。

**Collector 组件**的成熟度水平不同。每个组件的稳定性在其 `README.md` 文件中有说明。
你可以在[组件镜像仓库][registry]中找到所有可用的 Collector 组件列表。

Collector 软件构件的支持在一段时间内有保障，具体取决于该构件的目标用户。
这种支持至少包括关键 Bug 和安全问题的修复。
更多细节参阅[支持策略](https://github.com/open-telemetry/opentelemetry-collector/blob/main/VERSIONING.md)。

## 发行版与发布版本 {#releases}

有关 Collector 的[最新][latest release]发行版和发布信息，请参见[发行版页面](distributions/)。

[configured]: /docs/security/config-best-practices/
[hosted]: /docs/security/hosting-best-practices/
[latest release]: https://github.com/open-telemetry/opentelemetry-collector-releases/releases/latest
[mixed]: /docs/specs/otel/document-status/#mixed
[registry]: /ecosystem/registry/?language=collector
[stability levels]: https://github.com/open-telemetry/opentelemetry-collector#stability-levels
