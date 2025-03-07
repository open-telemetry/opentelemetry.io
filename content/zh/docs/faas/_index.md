---
title: 功能即服务（FaaS）
linkTitle: FaaS
description: >-
  OpenTelemetry 支持不同云供应商提供的各种功能即服务（FaaS）的监控方法
weight: 360
default_lang_commit: c2cd5b14a73e051acacb6914740fb3e20536f8ba
drifted_from_default: file not found
---

功能即服务（FaaS）是云原生应用的重要无服务（Serverless）计算平台。
但不同的平台有自己的风格特点，这通常意味着这些云原生应用与在 Kubernetes 或虚拟机上运行的应用相比，其监控指导和要求会略微不同。

FaaS 文档的初始供应商范围是 Microsoft Azure、Google Cloud Platform（GCP）和
Amazon Web Services（AWS），AWS 的平台也称为 Lambda。

### 社区资产

OpenTelemetry 社区目前提供预构建的 Lambda 层，能够自动检测你的应用，
以及可以在手动或自动检测应用时使用的独立 Collector Lambda 层选项。

你可以在
[OpenTelemetry-Lambda 仓库](https://github.com/open-telemetry/opentelemetry-lambda)中跟踪发布状态。
