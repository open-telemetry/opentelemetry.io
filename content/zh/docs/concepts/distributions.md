---
title: Distributions（发行版）
description: 发行版是 OpenTelemetry 组件的定制版本，不应与“分支（fork）”混淆。
weight: 190
anchor: distributions
default_lang_commit: 3337aa6fbaccf5e8734a1ef2c6ca8b61496c3d93
---

## 简介 {#introduction}

OpenTelemetry 项目由多个支持不同[信号](../signals)的[组件](../components)构成。
其官方参考实现包括：

- 各语言的[自动插桩库](../instrumentation)
- 一个 [Collector 二进制文件](/docs/concepts/components/#collector)

任何参考实现都可以进行定制，形成一个发行版（Distribution）。

## 什么是发行版？{#what-is-a-distribution}

**发行版**是某个 OpenTelemetry 组件的定制版本。本质上，
它是对上游 OpenTelemetry 仓库的封装，并包含一些定制功能。
**发行版不应与 Fork 混淆**。

发行版中的定制内容可能包括：

- 用于简化使用流程或对某个后端/厂商环境定制的脚本
- 为了适配特定后端、厂商或最终用户而修改的默认设置
- 面向厂商或最终用户的额外打包选项
- 比 OpenTelemetry 原生实现更广的测试、性能或安全覆盖
- OpenTelemetry 尚未提供的附加功能
- 经过精简、功能减少的版本

发行版大致可分为以下几类：

- **“纯净版”（Pure）**：这类发行版与上游功能保持一致，100% 兼容，
  通常仅针对易用性或打包方式进行增强。此类定制通常面向特定后端、厂商或最终用户。
- **“增强版”（Plus）**：这类发行版在上游基础上增加了额外功能，
  例如添加了尚未合入 OpenTelemetry 主项目的插桩库或厂商专用导出器。
- **“精简版”（Minus）**：这类发行版移除了上游部分功能。
  例如，可能剔除了某些插桩库、接收器、处理器、导出器或扩展组件。
  此类定制可能是为了提升支持性或安全性。

## 谁可以创建发行版？{#who-can-create-a-distribution}

\*\*任何人都可以创建自己的发行版。
\*\*目前已有多个[厂商](/ecosystem/vendors/)提供了自己的[发行版](/ecosystem/distributions/)。
此外，如果你希望使用某些尚未合入 OpenTelemetry 主项目的 Registry 组件，
作为最终用户你也可以考虑创建一个定制发行版。

## 贡献还是发行？{#contribution-or-distribution}

在深入学习如何创建发行版之前，建议你先思考一下：
你对某个 OpenTelemetry 组件的改动是否对所有用户都有价值？是否应该合并到官方参考实现中？

以下问题可以帮助你判断：

- 你编写的“易用性脚本”能否被通用化？
- 你修改的默认设置是否对大多数用户都更合适？
- 你添加的打包方式是否确实特定于某个使用场景？
- 你增加的测试、性能或安全覆盖能否直接用于参考实现？
- 你新增的功能是否可能成为 OpenTelemetry 的标准部分？是否与社区沟通过？

## 创建你自己的发行版 {#creating-your-own-distribution}

### Collector 发行版 {#collector}

你可以参考以下博客文章了解如何创建属于你自己的 Collector 发行版：
[如何构建属于你的 OpenTelemetry Collector 发行版](https://medium.com/p/42337e994b63)

如果你正计划构建一个 Collector 发行版，可以使用官方的
[OpenTelemetry Collector Builder 工具](https://github.com/open-telemetry/opentelemetry-collector/tree/main/cmd/builder)
作为起点。

### 语言特定的自动插桩库 {#language-specific-instrumentation-libraries}

不同语言的自动插桩库也提供了定制扩展机制。例如：

- [Java agent 扩展机制](/docs/zero-code/java/agent/extensions)

## 遵循品牌使用规范 {#follow-the-guidelines}

如果你在发行版中使用了 OpenTelemetry 项目的标识（如 logo、名称等），
请务必遵循 [OpenTelemetry 品牌使用指南][guidelines]。

目前，OpenTelemetry 项目**尚未提供发行版认证机制**。未来可能会效仿 Kubernetes 项目，
引入认证与合作伙伴机制。在评估某个发行版时，请确保它不会导致供应商锁定（Vendor Lock-in）。

> 注意：**发行版的技术支持由发行版的作者负责，非 OpenTelemetry 官方团队。**

[guidelines]: https://github.com/open-telemetry/community/blob/main/marketing-guidelines.md
