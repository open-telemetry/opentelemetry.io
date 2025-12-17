---
title: 从 OpenTracing 迁移
linkTitle: OpenTracing
weight: 2
default_lang_commit: 0b7c6aeafe53e44fdeb64ed2c7bdb42e88f35802
---

OpenTelemetry 项目自从诞生以来，[OpenTracing][] 的向后兼容性就是优先事项之一。
为了简化迁移过程，OpenTelemetry 支持在同一代码库中同时使用 OpenTelemetry **和**
OpenTracing API。这样就可以使用 OpenTelemetry SDK 记录 OpenTracing 的插桩数据。

为实现这一点，每个 OpenTelemetry SDK 都提供了一个 **OpenTracing Shim**，
它充当 OpenTracing API 和 OpenTelemetry SDK 之间的桥梁。请注意，OpenTracing Shim 默认是禁用的。

## 语言版本支持 {#language-version-support}

在使用 OpenTracing Shim 之前，请检查你的编程语言和运行时组件版本，
并在必要时进行更新。下表列出了 OpenTracing 和 OpenTelemetry API 的最低**语言**版本要求：

| 语言           | OpenTracing API | OpenTelemetry API |
| -------------- | --------------- | ----------------- |
| [Go][]         | 1.13            | 1.16              |
| [Java][]       | 7               | 8                 |
| [Python][]     | 2.7             | 3.6               |
| [JavaScript][] | 6               | 8.5               |
| [.NET][]       | 1.3             | 1.4               |
| [C++][]        | 11              | 11                |

请注意，OpenTelemetry API 和 SDK 通常比 OpenTracing 要求更高的语言版本。

## 迁移概述 {#migration-overview}

目前许多代码库都使用 OpenTracing 进行了插桩。这些代码库使用 OpenTracing API
来对应用代码进行插桩，并/或安装 OpenTracing 插件以对其使用的库和框架进行插桩。

迁移到 OpenTelemetry 的通用方法总结如下：

1. 安装 OpenTelemetry SDK，并移除当前的 OpenTracing 实现，例如 Jaeger 客户端。
2. 安装 OpenTelemetry 的插桩库，并移除对应的 OpenTracing 版本。
3. 更新插桩盘、告警等以消费新的 OpenTelemetry 数据。
4. 编写新应用代码时，全部使用 OpenTelemetry API 进行插桩。
5. 逐步用 OpenTelemetry API 重新对应用进行插桩。并不强制移除已有的
   OpenTracing API 调用，它们仍然可以正常工作。

如上所述，迁移一个大型应用可能需要显著的工作量，我们建议 OpenTracing
用户逐步迁移他们的应用代码。这样可以减轻迁移负担，避免可观测性中断。

以下步骤展示了一种谨慎的、渐进式的 OpenTelemetry 迁移路径。

### 第 1 步：安装 OpenTelemetry SDK {#step-1-install-the-opentelemetry-sdk}

在更改任何插桩之前，请确保可以切换到 OpenTelemetry SDK，而不会导致当前应用发送的遥测数据中断。
单独完成这一步（不引入任何新插桩）是推荐做法，因为这样更容易判断是否出现了插桩中断。

1. 用 OpenTelemetry SDK 替换你当前使用的 OpenTracing Tracer 实现。例如，
   如果你在使用 Jaeger，请移除 Jaeger 客户端并安装对应的 OpenTelemetry 客户端。
2. 安装 OpenTracing Shim。该 shim 允许 OpenTelemetry SDK 消费 OpenTracing 的插桩数据。
3. 配置 OpenTelemetry SDK，以使用与之前 OpenTracing 客户端相同的协议和格式导出数据。
   例如，如果你使用的是以 Zipkin 格式导出数据的 OpenTracing 客户端，请将 OpenTelemetry 客户端配置为使用相同格式。
4. 或者，将 OpenTelemetry SDK 配置为发出 OTLP 数据，并将其发送至 Collector，在 Collector 中管理以多种格式导出数据。

安装好 OpenTelemetry SDK 后，请确认你可以部署应用并继续接收基于 OpenTracing
的遥测数据。换句话说，确认你的插桩盘、告警和其他基于追踪的分析工具仍能正常工作。

### 第 2 步：逐步替换插桩 {#step-2-progressively-replace-instrumentation}

安装 OpenTelemetry SDK 后，所有新插桩现在都可以使用 OpenTelemetry API 编写。
除少数情况外，OpenTelemetry 与 OpenTracing 的插桩可以无缝协同工作
（见下文的[兼容性限制](#limits-on-compatibility)）。

那现有的插桩怎么办？并不强制将现有应用代码迁移至 OpenTelemetry。不过，我们建议将使用的
OpenTracing 插桩库（用于插桩 Web 框架、HTTP 客户端、数据库客户端等）迁移至对应的
OpenTelemetry 库。这将获得更好的支持，因为许多 OpenTracing 库将停止维护，可能不再更新。

需要注意的是，切换至 OpenTelemetry 插桩库后，产出的数据将发生变化。OpenTelemetry
对软件插桩有更好的模型（即所谓的“语义约定”）。在许多情况下，OpenTelemetry 生成更好、更全面的追踪数据。
然而，“更好”也意味着“不同”。这就意味着基于旧 OpenTracing 插桩库构建的插桩盘、告警等，可能在替换后不再起作用。

对于现有的插桩，建议按照以下步骤操作：

1. 将某一部分 OpenTracing 插桩替换为其 OpenTelemetry 等价物。
2. 观察这对应用产出的遥测数据带来了哪些变化。
3. 创建新的插桩盘、告警等以消费这些新数据。务必在将新的 OpenTelemetry
   库部署到生产环境之前设置好这些插桩盘。
4. 可选：在 Collector 中添加处理规则，将新的遥测数据转换为旧格式。
   Collector 可配置为同时发出两种格式的遥测数据，形成数据重叠。
   这可以让新的插桩盘填充数据，同时你仍可使用旧的插桩盘。

## 兼容性限制 {#limits-on-compatibility}

本节将描述除前述[语言版本限制](#language-version-support)之外的兼容性限制。

### 语义约定 {#semantic-conventions}

如前所述，OpenTelemetry 提供了改进的软件插桩模型。这意味着，OpenTracing 设置的
“tags” 可能与 OpenTelemetry 设置的 “attributes” 不同。换句话说，替换现有插桩时，
OpenTelemetry 产生的数据可能与 OpenTracing 不一致。

再次强调：更改插桩时，请同步更新所有依赖旧数据的插桩盘、告警等内容。

### Baggage

在 OpenTracing 中，Baggage 是与 Span 关联的 SpanContext 对象一起携带的。而在
OpenTelemetry 中，上下文和传播是更底层的概念：Span、Baggage、指标工具等都是通过上下文对象传递的。

由于这种设计上的变化，通过 OpenTracing API 设置的 Baggage 无法被 OpenTelemetry
的 Propagator 访问。因此，在使用 Baggage 时不建议混用 OpenTelemetry 和 OpenTracing API。

具体来说，当使用 OpenTracing API 设置 Baggage 时：

- 无法通过 OpenTelemetry API 访问；
- 无法通过 OpenTelemetry Propagator 进行注入。

如果你在使用 Baggage，建议所有与 Baggage 相关的 API 调用同时切换到 OpenTelemetry。
在部署这些变更前，请确认所有关键的 Baggage 项仍能正确传递。

### JavaScript 中的上下文管理 {#context-management-in-javascript}

在 JavaScript 中，OpenTelemetry API 使用了通用的上下文管理器，比如 Node.js 的
`async_hooks` 和浏览器中的 `Zones.js`。与需要手动将 Span 参数传递给每个方法相比，
这些上下文管理器使追踪更易于实现，侵入性更低。

而 OpenTracing API 出现得更早，并未广泛使用这些上下文管理器。OpenTracing
代码通过参数传递当前活跃 Span，这与 OpenTelemetry 中通过上下文存储 Span
的方式存在冲突。在同一个链路中混用这两种方式，可能会导致链路中断或 Span 不匹配，因此不推荐这样做。

我们建议你按完整的代码路径将 OpenTracing 迁移至 OpenTelemetry，避免在同一链路中混用两套 API。

## 规范与实现细节 {#specification-and-implementation-details}

关于各语言中 OpenTracing Shim 的工作原理，请参阅对应的语言文档。关于
OpenTracing Shim 的设计细节，请参阅 [OpenTracing 兼容性文档][ot_spec]。

[.net]: /docs/languages/dotnet/shim/
[go]: https://pkg.go.dev/go.opentelemetry.io/otel/bridge/opentracing
[java]: https://github.com/open-telemetry/opentelemetry-java/tree/main/opentracing-shim
[javascript]: https://www.npmjs.com/package/@opentelemetry/shim-opentracing
[opentracing]: https://opentracing.io
[ot_spec]: /docs/specs/otel/compatibility/opentracing/
[python]: https://opentelemetry-python.readthedocs.io/en/stable/shim/opentracing_shim/opentracing_shim.html
[c++]: https://github.com/open-telemetry/opentelemetry-cpp/tree/main/opentracing-shim
