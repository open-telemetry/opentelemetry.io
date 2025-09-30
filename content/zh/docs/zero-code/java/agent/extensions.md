---
title: 扩展
default_lang_commit: 94b83c9010b9e61255dc840066ae23313a05f592
aliases: [/docs/instrumentation/java/extensions]
description: 扩展功能可为代理增加能力，而无需创建单独的发行版本。
weight: 300
---

## 介绍 {#introduction}

扩展的设计目的是覆盖或自定义上游代理提供的插桩功能，而无需创建新的 OpenTelemetry 发行版本，
也无需以任何方式修改代理代码。

假设有一个经过插桩的数据库客户端，它会为每个数据库调用创建一个 Span，并从数据库连接中提取数据以提供 Span 属性。
以下是该场景下可通过使用扩展解决的示例用例：

- _"我根本不想要这个 Span"_：

  创建一个扩展，通过提供新的默认设置来禁用所选插桩。

- _"我想编辑一些不依赖于任何数据库连接实例的属性"_：

  创建一个扩展，该扩展提供自定义的 `SpanProcessor`。

- _"我想编辑一些属性，且这些属性的值取决于特定的数据库连接实例。"_：

  创建一个带有新插桩逻辑的扩展，将其自己的通知注入到与原始插桩相同的方法中。
  你可以使用 `order` 方法确保它在原始插桩之后运行，并使用新信息增强当前 Span。

- _"我想移除一些属性"_：

  创建一个带有自定义导出器的扩展，或者使用 OpenTelemetry Collector 中的属性过滤功能。

- _"我不喜欢 OTel 生成的 Span。我想修改它们及其生命周期。"_：

  创建一个扩展，用于禁用现有的插桩逻辑，并替换为新的插桩逻辑，
  将 `Advice` 注入到与原始插桩相同（或更合适）的方法中。
  你可以为此编写自己的 `Advice`，直接使用现有的 `Tracer` 或对其进行扩展。
  由于拥有自己的 `Advice`，你可以控制所使用的 `Tracer`。

## 扩展示例 {#extension-examples}

要了解如何为 OpenTelemetry Java 插桩代理创建扩展的示例，请参阅[构建并运行扩展项目](https://github.com/open-telemetry/opentelemetry-java-instrumentation/tree/main/examples/extension)。
