---
title: 基于代码的方式
description: 了解设置基于代码插桩的基本步骤
weight: 20
aliases: [manual]
default_lang_commit: deb98d0648c4833d9e9d77d42e91e2872658b50c
---

## 导入 OpenTelemetry API 和 SDK {#import-the-opentelemetry-api-and-sdk}

你首先需要在服务代码中导入 OpenTelemetry。如果你正在开发一个库或其他打算被可运行二进制文件使用的组件，
那么你只需要依赖 API。如果你的构件是一个独立的进程或服务，那么你需要同时依赖 API 和 SDK。
有关 OpenTelemetry API 和 SDK 的更多信息，请参阅[规范](/docs/specs/otel/)。

## 配置 OpenTelemetry API {#configure-the-opentelemetry-api}

为了创建链路或指标，你需要先创建一个 tracer 和/或 meter 提供程序。通常，我们建议
SDK 为这些对象提供一个默认的单一提供程序。随后，你将从该提供程序获取一个 tracer 或 meter
实例，并为其指定名称和版本。你在此处选择的名称应能标识正在进行插桩的对象。
例如，如果你正在编写一个库，那么你应将其命名为你的库名称（例如 `com.example.myLibrary`），
因为该名称将为所有生成的 Span 或指标事件设置命名空间。也建议你提供一个版本字符串
（即 `semver:1.0.0`），对应于你库或服务的当前版本。

## 配置 OpenTelemetry SDK {#configure-the-opentelemetry-sdk}

如果你正在构建一个服务进程，你还需要使用适当的选项来配置 SDK，以便将你的遥测数据导出到某个分析后端。
我们建议通过配置文件或其他机制以编程方式处理该配置。每种语言还提供可供调整的选项，你可能希望加以利用。

## 创建遥测数据 {#create-telemetry-data}

在你配置好 API 和 SDK 后，你就可以通过从提供程序获取的 tracer 和 meter
对象来创建链路和指标事件。请为你的依赖项使用插桩库，
即查看[镜像仓库](/ecosystem/registry/)或你所使用语言的代码仓库，以获取更多信息。

## 导出数据 {#export-data}

一旦你创建了遥测数据，你就需要将它发送出去。OpenTelemetry 支持两种主要的数据导出方式：
直接从进程导出，或通过 [OpenTelemetry Collector](/docs/collector) 代理导出。

进程内导出要求你导入并依赖一个或多个**导出器**，这些库将 OpenTelemetry 的内存中
Span 和指标对象转换为适用于遥测分析工具（如 Jaeger 或 Prometheus）的格式。此外，
OpenTelemetry 支持一种称为 `OTLP` 的传输协议，所有 OpenTelemetry SDK 都支持该协议。
此协议可用于将数据发送到 OpenTelemetry Collector，这是一种独立的二进制进程，
可以作为服务实例的代理或边车运行，也可以在单独的主机上运行。
Collector 可配置为将这些数据转发并导出到你选择的分析工具中。

除了 Jaeger 或 Prometheus 等开源工具外，越来越多的公司也支持从 OpenTelemetry
接收遥测数据。详情请参阅[供应商](/ecosystem/vendors/)。
