---
title: 零代码
description: 了解如何在无需编写代码的情况下为应用添加可观测性
weight: 10
aliases: [automatic]
default_lang_commit: deb98d0648c4833d9e9d77d42e91e2872658b50c
---

作为一名[运维人员](/docs/getting-started/ops/)，你可能希望在不编辑源代码的情况下为一个或多个应用添加可观测性。
OpenTelemetry 允许你快速为某个服务增加一定程度的可观测性，而无需使用 OpenTelemetry API 和
SDK 进行[基于代码的插桩](/docs/concepts/instrumentation/code-based)。

![零代码](./zero-code.svg)

零代码插桩通常以代理或类似代理的安装方式，将 OpenTelemetry API 和 SDK 的能力添加到你的应用中。
所涉及的具体机制可能因语言而异，包括字节码操作、猴子补丁或 eBPF，用于将对
OpenTelemetry API 和 SDK 的调用注入你的应用中。

通常，零代码插桩会为你所使用的库添加插桩。这意味着对请求和响应、数据库调用、消息队列调用等操作进行了插桩。
而你的应用代码本身通常不会被插桩。若要对你的代码进行插桩，
你需要使用[基于代码的插桩](/docs/concepts/instrumentation/code-based)。

此外，零代码插桩允许你配置加载的[插桩库](/docs/concepts/instrumentation/libraries)和[导出器](/docs/concepts/components/#exporters)。

你可以通过环境变量和其他特定语言的机制（如系统属性或传递给初始化方法的参数）来配置零代码插桩。
要开始使用，你只需要配置一个服务名称，以便你可以在所选择的可观测性后端中识别该服务。

还有其他可用的配置选项，包括：

- 特定数据源的配置
- 导出器配置
- 传播器配置
- 资源配置

以下语言提供了自动插桩功能：

- [.NET](/docs/zero-code/dotnet/)
- [Go](/docs/zero-code/go)
- [Java](/docs/zero-code/java/)
- [JavaScript](/docs/zero-code/js/)
- [PHP](/docs/zero-code/php/)
- [Python](/docs/zero-code/python/)
