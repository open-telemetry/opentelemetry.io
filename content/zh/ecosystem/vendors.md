---
title: 厂商
description: 原生支持 OpenTelemetry 的厂商
aliases: [/vendors]
default_lang_commit: b13d5dd3a9f288ab64d2af98c0b4ec1694499ef3
---

以下是部分通过 [OTLP](/docs/specs/otlp/) 原生接入 OpenTelemetry
的组织（如可观测性后端和可观测性数据管道）提供的解决方案列表（该列表并不完整）。

部分厂商还提供了 [OpenTelemetry 发行版](/ecosystem/distributions/)，即定制化的
OpenTelemetry 组件集合，用于增强功能或提升使用体验。

开源（OSS）厂商指的是那些拥有[开源](https://opensource.org/osd)可观测性产品的厂商。
这些厂商可能仍会提供其他闭源产品，例如为客户托管开源产品的 SaaS 服务。

{{% ecosystem/vendor-table %}}

## 添加你的组织 {#how-to-add}

若希望将你的组织列入列表，请[提交 PR][submit a PR]，
在[厂商清单][vendors list]中添加条目。条目需包含以下内容：

- 一份文档链接，说明你的产品如何通过 [OTLP](/docs/specs/otlp/) 原生接入 OpenTelemetry。
- 若适用，请提供你们的 OpenTelemetry 发行版链接。
- 若适用，请提供能证明你的产品是开源的链接。仅仅使用开源发行版并不能使你的产品标记为“开源”。
- GitHub 账号或电子邮箱地址，作为联系方式，以便我们在有问题时联系。

请注意，此列表面向那些消费 OpenTelemetry 数据并为[最终用户](/community/end-user/)提供可观测性服务的组织。

如果你是以[最终用户组织](https://www.cncf.io/enduser/)的身份采用 OpenTelemetry
进行可观测性建设，且不提供任何 OpenTelemetry 相关服务，请参阅[采用者清单](/ecosystem/adopters/)。

如果你提供的是通过 OpenTelemetry 实现可观测性的库、服务或应用，请参阅[集成](/ecosystem/integrations/)页面。

[submit a PR]: /docs/contributing/pull-requests/

{{% include keep-up-to-date.md vendor %}}

[vendors list]: https://github.com/open-telemetry/opentelemetry.io/tree/main/data/ecosystem/vendors.yaml
