---
title: OpenTelemetry
description: >-
  高质量、普遍适用和可移植的遥测助你实现有效的可观测
show_banner: true
developer_note:
  下文所用的 blocks/cover 短代码将使用文件名中包含 "background"
  的图像文件作为背景图。
cascade:
  draft: true
---

<div class="d-none"><a rel="me" href="https://fosstodon.org/@opentelemetry"></a></div>

{{< blocks/cover image_anchor="top" height="max" color="primary" >}}

<!-- prettier-ignore -->
![OpenTelemetry](/img/logos/opentelemetry-horizontal-color.svg)
{.otel-logo}

<!-- prettier-ignore -->
{{% param description %}}
{.display-6}

<div class="l-primary-buttons mt-5">

- [了解更多](/docs/what-is-opentelemetry/)
- [尝试 Demo](/docs/demo/)
- [探索集成组件](/ecosystem/integrations)

</div>

<div class="h3 mt-4">
<a class="text-secondary" href="/docs/getting-started/">为各种角色定制的入门指南</a>
</div>
<div class="l-get-started-buttons">

- [开发人员](/docs/getting-started/dev/)
- [运维人员](/docs/getting-started/ops/)

</div>
{{< /blocks/cover >}}

{{% blocks/lead color="white" %}}

OpenTelemetry 是各类 API、SDK 和工具形成的集合。可用于插桩、生成、采集和导出遥测数据（链路、指标和日志），帮助你分析软件的性能和行为。

> OpenTelemetry 在[多种编程语言](/docs/languages/)均达到 **GA** 级别，普适性很高。

{{% /blocks/lead %}}

{{% blocks/section color="dark" type="row" %}}

{{% blocks/feature icon="fas fa-chart-line" title="链路、指标、日志" %}}

从你的服务和软件中生成并采集遥测数据，然后将其转发给各种分析工具。

{{% /blocks/feature %}}

{{% blocks/feature icon="fas fa-magic" title="现成的插桩支持" %}}

OpenTelemetry 与流行的库和框架集成，例如 [Spring](https://spring.io)、
[ASP.NET Core](https://docs.microsoft.com/aspnet/core)、
[Express](https://expressjs.com)、 [Quarkus](https://quarkus.io) 等等！
安装和集成可能只需要几行代码。

{{% /blocks/feature %}}

{{% blocks/feature icon="fab fa-github" title="开源、厂商中立" %}}

OpenTelemetry 是 100% 免费和开源的，
得到了可观测性领域[众多行业领导者](/ecosystem/vendors/)的采用和支持。

{{% /blocks/feature %}}

{{% /blocks/section %}}

{{% blocks/section color="secondary" type="cncf" %}}

**OpenTelemetry 是一个 [CNCF][] [孵化级][]项目**。<br> 这个项目是由
OpenTracing 和 OpenCensus 项目合并而诞生的。

[![CNCF logo][]][cncf]

[cncf]: https://cncf.io
[cncf logo]: /img/logos/cncf-white.svg
[孵化级]: https://www.cncf.io/projects/

{{% /blocks/section %}}
