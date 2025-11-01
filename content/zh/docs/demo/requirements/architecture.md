---
title: 架构要求
linkTitle: 架构
aliases: [architecture_requirements]
default_lang_commit: beee9035dba8128dc3b970aa73e8b2a8d17d16dc
cSpell:ignore: dockerstatsreceiver
---

## 概述 {#summary}

OpenTelemetry 社区演示应用旨在展示如何将 OpenTelemetry API、SDK 和工具用于轻量生产级别的云原生应用中。
这个演示应用的总体目标不仅是提供一个规范性的 OpenTelemetry 组件“演示”，
还要作为一个框架，供终端用户、厂商和其他利益相关者进一步定制。

### 要求 {#requirements}

- [应用要求](../application/)
- [OpenTelemetry 要求](../opentelemetry/)
- [系统要求](../system/)

### 应用目标 {#application-goals}

- 为开发者提供一个强大的示例应用，帮助他们学习 OpenTelemetry 的插桩方法。
- 为可观测性厂商提供一个单一的、受良好支持的演示平台，他们可以进一步定制（或直接开箱即用）。
- 为 OpenTelemetry 社区提供一个可持续更新的工件，用于展示 OTel API、SDK 和工具的功能与能力。
- 为 OpenTelemetry 维护者和工作组提供一个平台，用于在真实环境中展示新功能和新概念。

以下是演示应用逻辑组件的常规描述。

## 主应用 {#main-application}

演示应用的主体是一个自包含的、基于微服务的应用，能够完成一些有用的“真实世界”工作，例如电商网站。
此应用由多个服务组成，这些服务通过 gRPC 和 HTTP 相互通信，并运行在 Kubernetes（或本地 Docker）上。

每个服务都应使用 OpenTelemetry 进行插桩，支持链路、指标和日志（随应用/可用性有所差异）。

每个服务应当可以与执行相同业务逻辑的其他服务互换，这些服务需实现相同的
gRPC 端点，但可以用不同的语言或实现编写。

每个服务应能够与特性开关服务通信，以便启用或禁用故障，用于展示遥测如何帮助解决分布式应用中的问题。

## 特性开关组件 {#feature-flag-component}

特性开关是云原生应用开发的重要组成部分。演示使用 CNCF 孵化项目 OpenFeature 来管理特性开关。

特性开关可通过 flagd 配置器用户界面进行设置。

## 编排与部署 {#orchestration-and-deployment}

所有服务均运行在 Kubernetes 上。OpenTelemetry Collector 应通过 OpenTelemetry Operator
部署，并以边车 + 网关的模式运行。来自每个 Pod 的遥测应从 Agent 路由到网关，
网关默认应将遥测导出到一个开源的链路 + 指标可视化工具。

对于本地/非 Kubernetes 部署，Collector 应通过 compose 文件部署，不仅监控应用的链路/指标，还要通过
`dockerstatsreceiver` 监控 Docker 容器。

本项目的设计目标之一是包含一个 CI/CD 流水线，用于在云环境中实现自部署。本地开发时可以跳过此步骤。
