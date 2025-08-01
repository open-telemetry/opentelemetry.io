---
title: 发行版
weight: 25
default_lang_commit: b13d5dd3a9f288ab64d2af98c0b4ec1694499ef3
---

OpenTelemetry 项目目前提供了 Collector 的预构建[发行版][distributions]。
每个发行版中包含的组件可以在该发行版的 `manifest.yaml` 文件中找到。

[distributions]: https://github.com/open-telemetry/opentelemetry-collector-releases/tree/main/distributions

{{% ecosystem/distributions-table filter="first-party-collector" %}}

## 自定义发行版 {#custom-distributions}

OpenTelemetry 项目提供的现有发行版可能无法满足你的需求。
例如，你可能希望构建更小的二进制文件，或者需要实现自定义功能，
如[认证扩展](../building/authenticator-extension)、
[接收器](../building/receiver)、处理器、导出器或[连接器](../building/connector)。
你可以使用构建发行版的工具
[ocb](../custom-collector)（OpenTelemetry Collector Builder）来自行构建发行版。

## 第三方发行版 {#third-party-distributions}

一些组织提供了具有额外功能或使用体验更佳的 Collector
发行版。以下列出了由第三方维护的 Collector 发行版。

{{% ecosystem/distributions-table filter="third-party-collector" %}}

## 添加你的 Collector 发行版 {#how-to-add}

如需将你的 Collector 发行版列入上述列表，请[提交一个 PR][submit a PR]，
在[发行版列表][distributions list]中添加一个条目。该条目应包含以下内容：

- 指向你的发行版主页的链接
- 指向说明如何使用该发行版的文档的链接
- GitHub 账号或电子邮箱地址，作为联系方式，以便我们在有问题时与你联系

[submit a PR]: /docs/contributing/pull-requests/
[distributions list]: https://github.com/open-telemetry/opentelemetry.io/tree/main/data/ecosystem/distributions.yaml
