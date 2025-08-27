---
title: 各种编程语言的 API & SDK
description: OpenTelemetry 代码插桩支持多种流行的编程语言
weight: 250
aliases: [/docs/instrumentation]
default_lang_commit: f35b3300574b428f94dfeeca970d93c5a6ddbf35
redirects:
  - { from: 'net/*', to: 'dotnet/:splat' }
---

OpenTelemetry 代码[插桩][instrumentation]支持下表[“状态与发布版本”](#status-and-releases)中所列的各种编程语言。
当然你也可以获取[其他语言](/docs/languages/other)的非官方实现版本。你可以在 [Registry（登记表）](/ecosystem/registry/)中找到它们。

对于 Go、.NET、PHP、Python、Java 和 JavaScript，你可以使用[零代码解决方案](/docs/zero-code)将插桩添加到你的应用，无需修改代码。

如果你正在使用 Kubernetes，可以借助 [Kubernetes 的 OpenTelemetry Operator][otel-op] 向你的应用中[注入这些零代码解决方案][zero-code]。

## 状态与发布版本 {#status-and-releases}

OpenTelemetry 主要功能组件的当前状态如下：

{{% alert title="重要" color="warning" %}}

无论 API/SDK 的状态如何，如果你的插桩依赖于在[语义约定规范][semantic conventions specification]中被标记为[实验性][Experimental]的[语义约定][semantic conventions]，你的数据流可能会发生**破坏性变更**。

[semantic conventions]: /docs/concepts/semantic-conventions/
[Experimental]: /docs/specs/otel/document-status/
[semantic conventions specification]: /docs/specs/semconv/

{{% /alert %}}

{{% telemetry-support-table " " %}}

## API 参考文档 {#api-references}

各个特别兴趣小组（SIG）以特定语言实现 OpenTelemetry API 和 SDK，他们也会为开发者发布 API 参考文档。
以下是可用的参考文档：

{{% apidocs %}}

{{% alert title="注意" %}}

上述列表是 [`/api`](/api) 的别名。

{{% /alert %}}

[zero-code]: /docs/platforms/kubernetes/operator/automatic/
[instrumentation]: /docs/concepts/instrumentation/
[otel-op]: /docs/platforms/kubernetes/operator/
