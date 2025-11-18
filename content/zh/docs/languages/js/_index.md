---
title: JavaScript
description: >-
  <img width="35" class="img-initial" src="/img/logos/32x32/JS_SDK.svg"
  alt="JavaScript"> OpenTelemetry 在 JavaScript 中的特定语言实现（适用于 Node.js 和浏览器）。
aliases: [/js, /js/metrics, /js/tracing]
default_lang_commit: 28e17fd89ff3783043fe0537c1adc53266476344
weight: 20
---

{{% docs/languages/index-intro js /%}}

{{% include browser-instrumentation-warning.md %}}

## 版本支持 {#version-support}

OpenTelemetry JavaScript 支持所有处于活跃或维护 LTS 版本的 Node.js。
旧版本的 Node.js 可能也能使用，但 OpenTelemetry 不会对其进行测试。

OpenTelemetry JavaScript 没有官方支持的浏览器列表。它旨在主流浏览器的当前受支持版本上正常运行。

OpenTelemetry JavaScript 遵循 DefinitelyTyped 的 TypeScript 支持政策，该政策设定了 2 年的支持周期。
对于超过 2 年的旧版 TypeScript，OpenTelemetry JavaScript 将在小版本更新中停止支持。

有关运行时支持的更多详细信息，请参阅[概述](https://github.com/open-telemetry/opentelemetry-js#supported-runtimes)。

## 仓库 {#repositories}

OpenTelemetry JavaScript 由以下仓库组成：

- [opentelemetry-js](https://github.com/open-telemetry/opentelemetry-js), 核心仓库，包含核心分发的 API 和 SDK。
- [opentelemetry-js-contrib](https://github.com/open-telemetry/opentelemetry-js-contrib), 贡献项，不属于 API 和 SDK 核心分发内容。

## 帮助或反馈 {#help-or-feedback}

如果您对 OpenTelemetry JavaScript 有任何疑问，
请通过 [GitHub 讨论区](https://github.com/open-telemetry/opentelemetry-js/discussions)或 [CNCF Slack](https://slack.cncf.io/) 的 [#otel-js] 频道联系我们。

如果您想为 OpenTelemetry JavaScript 做出贡献，
请参阅[贡献说明](https://github.com/open-telemetry/opentelemetry-js/blob/main/CONTRIBUTING.md)。
