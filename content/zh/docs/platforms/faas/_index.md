---
title: 功能即服务
linkTitle: FaaS
description: >-
  OpenTelemetry 支持多种方法监控不同云服务商提供的功能即服务（FaaS）
redirects: [{ from: /docs/faas/*, to: ':splat' }] # cSpell:disable-line
default_lang_commit: a18833df3c17db379911a796f1b0a549c4d8f10f # patched
drifted_from_default: true
---

功能即服务（FaaS）是[云原生应用][cloud native apps]的一种重要无服务器计算平台。
然而，这种平台的特殊性通常意味着这些应用与运行在 Kubernetes 或虚拟机上的应用在监控指导和需求方面略有不同。

FaaS 文档的初始供应商范围涵盖 Microsoft Azure、Google Cloud Platform（GCP）和
Amazon Web Services（AWS）。AWS 的函数也被称为 Lambda。

## 社区资产 {#community-assets}

OpenTelemetry 社区目前提供了预构建的 Lambda 层，可实现应用的自动检测，也提供了独立的
Collector Lambda 层，适用于手动或自动检测应用时使用。

发布状态可在 [OpenTelemetry-Lambda 仓库](https://github.com/open-telemetry/opentelemetry-lambda)中跟踪。

[cloud native apps]: https://glossary.cncf.io/cloud-native-apps/
