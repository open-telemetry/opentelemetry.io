---
title: 宣布启动 RPC 语义约定稳定性项目
linkTitle: 稳定 RPC 语义约定
date: 2025-06-02
author: >-
  [Liudmila Molkova](https://github.com/lmolkova)（微软）、[Trask Stalnaker](https://github.com/trask)（微软）
sig: Semantic Conventions
default_lang_commit: 881be59002ff3c840ea147358bc05147d2d629e3
cSpell:ignore: Dubbo Liudmila Molkova
---

语义约定 SIG 很高兴宣布正式启动 RPC 稳定性推进工作！

继 2025 年 5 月数据库语义约定完成稳定后，我们将继续推进关键领域的标准化，而 RPC 是下一个重点。

要制定出坚实的约定，尤其在像 RPC 这样技术多样的领域，需要集体协作。RPC
涵盖了 gRPC、JSON-RPC、Apache Dubbo 等众多框架。如果你正在使用或开发这些框架，
或对它们感兴趣，欢迎加入我们的工作 —— 我们非常欢迎你的参与！

## 致力于构建可靠的遥测约定 {#towards-reliable-telemetry-conventions}

可靠、定义清晰的约定是构建丰富遥测体验的前提。当信号和属性名称保持一致时，
开发者就能专注于构建告警、仪表板和可视化，而不是应对由不兼容变更引发的问题。

现有的实验性约定已被使用了一段时间，我们也意识到对相关探针做出破坏性更改将带来干扰。

但我们坚信，从长远来看，这些更改对于实现高质量、可操作的遥测数据是必不可少的。

为了平稳过渡，
我们将遵循一项[温和迁移计划](https://github.com/open-telemetry/semantic-conventions/blob/v1.34.0/docs/rpc/rpc-spans.md?plain=1#L26-L50)。
各类探针库将：

- 将新语义约定作为“可选开启”功能与现有约定并行提供；
- 在较长一段时间内同时支持新旧两个版本；
- 提供详细的迁移指南。

## 语义约定如何完成“稳定”？ {#how-does-semantic-convention-stabilization-work}

在稳定化阶段，我们将审查现有约定，确保它们能为大多数应用提供有意义的洞察。
我们会验证这些约定是否支持通用探针实现，且在性能、隐私、遥测体积、
一致性以及与应用层或传输层遥测的关联性方面达成合理平衡。

我们追求“有用、可用、可扩展”的语义约定。

关于 RPC，我方将聚焦以下关键领域：

- **核心信号**：定义一套核心遥测信号（如 client/server span 及调用时延直方图），
  可在不同框架中一致记录，支持常见调试流程和 RED 指标（请求率、错误率、延迟）。
  我们将审查现有约定，识别关键属性，并文档化其通用定义与框架特定实现。

- **框架特定遥测**：我们鼓励各框架在通用约定基础上，扩展其特有属性、span 或指标。
  例如社区维护的 [gRPC metrics](https://grpc.io/docs/guides/opentelemetry-metrics/)。
  我们也将审查这些扩展内容。

- **适用范围**：双向流式调用天然存在可观测性限制，我们将评估哪些信号具有现实可行性。

- **一致性与最佳实践**：我们过去几年在命名、记录对端信息和错误方面积累了不少最佳实践，
  RPC 约定也将对齐这些新准则。

- **原型验证**：要完成稳定，必须有符合约定的真实世界探针或原型。
  这些实现能帮助验证约定的清晰度、可行性和实际价值，也能确保它们适用于不同的库和协议。

## 如何参与？ {#how-to-get-involved}

我们正在寻找熟悉任何主流 RPC 框架的开发者，也欢迎希望参与原型探针开发的贡献者。
如果你有兴趣参与，请在
[RPC 稳定化项目提案](https://github.com/open-telemetry/community/issues/1859)下留言，
与我们一同推进这个项目。
