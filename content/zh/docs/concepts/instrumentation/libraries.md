---
title: 库
description: 了解如何为你的库添加原生插桩。
aliases: [../instrumenting-library]
weight: 40
default_lang_commit: deb98d0648c4833d9e9d77d42e91e2872658b50c
---

OpenTelemetry 为许多库提供了[插桩库][instrumentation libraries]，
这些插桩通常通过库的钩子或对库代码的猴子补丁来实现。

使用 OpenTelemetry 实现库的原生插桩可以为用户提供更好的可观测性和开发体验，
省去了库公开和记录钩子的需求。原生插桩的其他优势包括：

- 可以用通用、易用的 OpenTelemetry API 替代自定义日志钩子，用户只需接触 OpenTelemetry。
- 来自库和应用代码的链路、日志和指标是相关且一致的。
- 通用的约定使用户能够在同一技术体系内或跨库、跨语言获取一致的遥测数据。
- 遥测信号可以通过 OpenTelemetry 提供的众多、文档完善的可扩展点进行精细调控（过滤、处理、聚合）以适应不同使用场景。

![原生插桩与插桩库对比](../native-vs-libraries.svg)

## 语义约定 {#semantic-convention}

[语义约定](/docs/specs/semconv/general/trace/)是关于 Web 框架、RPC 客户端、数据库、消息客户端、基础设施等所生成的
Span 中应包含哪些信息的权威来源。约定使插桩行为保持一致：用户无需了解每个库的细节，
而可观测性工具厂商可以为数据库或消息系统等各种技术构建一致的用户体验。
当库遵循这些约定时，很多场景可以在无需用户配置或干预的情况下启用。

语义约定始终在演进，新的约定也在不断添加。如果你的库没有适配的约定，
请考虑[新增约定](https://github.com/open-telemetry/semantic-conventions/issues)。请特别注意
Span 名称的定义：要使用有意义的名称，并在定义时考虑基数问题。同时请设置
[`schema_url`](/docs/specs/otel/schemas/#schema-url) 属性，用于记录你使用的是哪个版本的语义约定。

如果你有反馈或想要添加新约定，可以通过加入
[Instrumentation Slack](https://cloud-native.slack.com/archives/C01QZFGMLQ7)，
或在[规范仓库](https://github.com/open-telemetry/opentelemetry-specification)提交
Issue 或 PR 的方式参与贡献。

### 定义 Span {#definition-spans}

从库用户的角度思考你的库，他们可能想了解哪些行为和活动。作为库的维护者，
你熟悉其内部实现，但用户更关注的是其应用功能，而非库的内部逻辑。
思考哪些信息有助于分析库的使用情况，并选择合适的方式建模数据。以下方面值得考虑：

- Span 及其层级结构
- Span 中的数值属性（作为聚合指标的替代）
- Span 事件
- 聚合指标

例如，如果你的库会发起数据库请求，只需为逻辑请求创建 Span，底层网络通信的插桩应由实现该功能的库负责。
同时，更适合将诸如对象或数据序列化等活动记录为 Span 事件，而不是创建额外的 Span。

设置 Span 属性时，请遵循语义约定。

## 何时不应添加插桩 {#when-not-to-instrument}

有些库只是对网络调用的轻量封装。这类情况下，OpenTelemetry 很可能已经为底层 RPC 客户端提供了插桩库。
请查看[登记表](/ecosystem/registry/)，寻找已有插桩库。如果已经存在该库的插桩，为封装库再添加插桩可能没有必要。

一般而言，仅在你库自身的层级添加插桩。如果以下条件全部满足，则无需插桩：

- 你的库只是对已记录或易于理解的 API 的轻量封装。
- OpenTelemetry 已对底层网络调用实现了插桩。
- 没有适用的约定可用于丰富遥测数据。

如有疑问，宁可不添加插桩。但即使你选择不插桩，仍建议提供配置方式，让用户可以为你库中的内部
RPC 客户端实例设置 OpenTelemetry 处理程序。对于不支持完全自动插桩的语言来说，这一点尤为重要，即便在其他语言中也是有益的。

本文其余部分将指导你如何插桩你的应用。

## OpenTelemetry API

插桩的第一步是将 OpenTelemetry API 包作为依赖引入。

OpenTelemetry 包含[两个主要模块](/docs/specs/otel/overview/)：API 和 SDK。
OpenTelemetry API 是一组抽象和非运行时实现。如果应用未引入 SDK，则你的插桩逻辑不会执行，也不会影响应用性能。

### 库应仅使用 OpenTelemetry API {#libraries-should-only-use-the-opentelemetry-api}

如果你担心引入新依赖，可参考以下建议以减少依赖冲突的可能：

- OpenTelemetry Trace API 在 2021 年初已达到稳定状态，
  遵循[语义版本 2.0](/docs/specs/otel/versioning-and-stability/)。
- 使用最早的稳定 API 版本（1.0.\*），非必要不要升级。
- 在插桩逻辑尚未稳定时，考虑将其作为单独的包发布，避免影响不使用该逻辑的用户。
  可以保存在你自己的代码仓库中，也可以[提交到 OpenTelemetry 社区](https://github.com/open-telemetry/opentelemetry-specification/blob/main/oteps/0155-external-modules.md#contrib-components)，
  与其他插桩库一起发布。
- 语义约定是[稳定的但仍会演进][stable, but subject to evolution]：虽然不会造成功能性问题，但你可能需不时更新插桩逻辑。
  将其置于预览插件或 OpenTelemetry contrib 仓库中有助于在不破坏用户使用的情况下保持约定更新。

  [stable, but subject to evolution]: /docs/specs/otel/versioning-and-stability/#semantic-conventions-stability

### 获取 Tracer {#getting-a-tracer}

所有应用配置对库是透明的，库通过 Tracer API 使用遥测功能。库可以允许应用传入 `TracerProvider`
实例以便依赖注入和测试便利，或通过[全局 `TracerProvider`](/docs/specs/otel/trace/api/#get-a-tracer)
获取。不同语言的实现可能会依据其惯用方式选择传参或使用全局变量。

获取 Tracer 时，请提供库（或插桩插件）名称及版本信息：这些信息将出现在遥测数据中，帮助用户理解来源、筛选信息并调试或报告问题。

## 插桩范围 {#what-to-instrument}

### 公共 API {#public-apis}

公共 API 是良好的插桩对象：为公共方法创建 Span 能帮助用户将遥测信息映射到应用代码，
了解库调用的耗时与结果。可插桩的调用包括：

- 内部包含网络调用或本地耗时（且可能失败）操作的公共方法，例如 I/O。
- 请求或消息处理的处理程序。

#### 插桩示例 {#instrumentation-example}

以下是 Java 应用的插桩示例：

```java
private static Tracer tracer =  getTracer(TracerProvider.noop());

public static void setTracerProvider(TracerProvider tracerProvider) {
    tracer = getTracer(tracerProvider);
}

private static Tracer getTracer(TracerProvider tracerProvider) {
    return tracerProvider.getTracer("demo-db-client", "0.1.0-beta1");
}

private Response selectWithTracing(Query query) {
    // 检查有关 span 名称和属性是否符合约定惯例
    Span span = tracer.spanBuilder(String.format("SELECT %s.%s", dbName, collectionName))
            .setSpanKind(SpanKind.CLIENT)
            .setAttribute("db.name", dbName)
            ...
            .startSpan();

    // 激活 span 并允许关联日志和嵌套 span
    try (Scope unused = span.makeCurrent()) {
        Response response = query.runWithRetries();
        if (response.isSuccessful()) {
            span.setStatus(StatusCode.OK);
        }

        if (span.isRecording()) {
           // 为响应代码和其他信息填充响应属性
        }
    } catch (Exception e) {
        span.recordException(e);
        span.setStatus(StatusCode.ERROR, e.getClass().getSimpleName());
        throw e;
    } finally {
        span.end();
    }
}
```

请遵循语义约定设置属性。如无合适的约定，可参考[通用属性约定](/docs/specs/semconv/general/attributes/)。

### 嵌套的网络调用及其他 Span {#nested-network-and-other-spans}

网络调用通常由 OpenTelemetry 的自动插桩功能通过相应客户端实现来进行追踪。

![在 Jaeger UI 中展示嵌套的数据库和 HTTP Span](../nested-spans.svg)

如果 OpenTelemetry 尚未支持你的网络客户端，请参考以下建议来决定是否要手动插桩：

- 插桩网络调用是否能提高用户可观测性或便于你支持用户？
- 你的库是否是某个公开、文档化的 RPC API 的封装？当出现问题时，用户是否需要联系底层服务？
  - 如果是，请插桩此库，并确保追踪每一次网络重试。

- 对这些调用进行 Span 追踪是否会非常冗长？是否会明显影响性能？
  - 使用带有可调日志级别的日志记录，或使用 Span 事件代替：日志可与父 Span（如公共 API 调用）关联，而
    Span 事件应添加在公共 API 的 Span 上。
  - 若必须使用 Span（例如为了携带并传播链路上下文），应提供配置项并默认关闭。

如果 OpenTelemetry 已支持你的网络调用追踪，通常不应重复插桩。但也有例外：

- 需要支持无法启用自动插桩的用户（某些环境下 monkey-patch 无效或用户有顾虑）。
- 需要与底层服务使用自定义或遗留的上下文传播协议。
- 需要为 RPC Span 增加自动插桩未涵盖的关键库或服务相关信息。

当前社区正在构建通用方案，以避免此类插桩重复问题。

### 事件 {#events}

Trace 是你应用可以发出的遥测信号之一。事件（或日志）和链路是互补的，不是冗余的。
当你需要记录某些信息时，如果对详细程度有要求，日志通常比链路更合适。

如果你的应用已经使用日志记录模块，它可能已集成 OpenTelemetry。
可查看[登记表](/ecosystem/registry/)验证。此类集成通常会在所有日志中附加当前链路上下文，以便用户进行关联。

如果你的语言或生态尚无通用日志方案，可使用 [Span 事件][span events]记录额外应用信息。当你还想附加属性时，事件也更方便。

一般原则是：对于详细数据，优先使用事件或日志而非额外 Span。务必将事件附加在由你插桩创建的
Span 实例上。避免使用当前活跃 Span，因为其所指可能并不明确。

## 上下文传播 {#context-propagation}

### 提取上下文 {#extracting-context}

如果你维护的是一个会接收上游调用的库或服务（如 Web 框架或消息消费者），请从传入请求或消息中提取上下文。
OpenTelemetry 提供了 `Propagator` API，可屏蔽具体传播标准并从网络中读取链路上下文。
在单一请求/响应场景下，网络中只包含一个上下文，该上下文将成为新创建 Span 的父级。

创建 Span 后，请将新的链路上下文传递给应用代码（如回调函数或处理器），建议显式地激活该 Span。
以下 Java 示例展示了如何提取链路上下文并激活 Span。更多例子见
[Java 中的上下文提取](/docs/languages/java/api/#contextpropagators)。

```java
// 提取上下文
Context extractedContext = propagator.extract(Context.current(), httpExchange, getter);
Span span = tracer.spanBuilder("receive")
            .setSpanKind(SpanKind.SERVER)
            .setParent(extractedContext)
            .startSpan();

// 激活 span，以便关联子层级的遥测数据
try (Scope unused = span.makeCurrent()) {
  userCode();
} catch (Exception e) {
  span.recordException(e);
  span.setStatus(StatusCode.ERROR);
  throw e;
} finally {
  span.end();
}
```

在消息系统中，你可能会同时接收到多条消息。此时应将每条接收的消息作为新建 Span 的链接。
详细内容参见[消息约定](/docs/specs/semconv/messaging/messaging-spans/)。

### 注入上下文 {#injecting-context}

当你发起下游调用时，通常需要将上下文传播到下游服务。这种情况下，你需要为调用创建新 Span，并使用
`Propagator` API 将上下文注入消息中。在异步处理场景下，如构造消息，也可能需要注入上下文。以下是
Java 示例，更多例子见 [Java 中的上下文注入](/docs/languages/java/instrumentation/#context-propagation)。

```java
Span span = tracer.spanBuilder("send")
            .setSpanKind(SpanKind.CLIENT)
            .startSpan();

// 激活 span，使任何嵌套的遥测数据能够关联起来
// 即使网络调用也可能包含多层嵌套的 span、日志或事件
try (Scope unused = span.makeCurrent()) {
  // 注入上下文
  propagator.inject(Context.current(), transportLayer, setter);
  send();
} catch (Exception e) {
  span.recordException(e);
  span.setStatus(StatusCode.ERROR);
  throw e;
} finally {
  span.end();
}
```

某些情况下无需传播上下文：

- 下游服务不支持元数据，或禁止未知字段。
- 下游服务尚未定义关联协议。你可以考虑在未来版本中添加传播支持。
- 下游服务支持自定义关联协议：
  - 可尝试使用自定义 `Propagator`：若协议兼容，可使用 OpenTelemetry
    链路上下文，否则可生成自定义关联 ID 并附加到 Span。

### 进程内上下文 {#in-process}

- 激活你的 Span，这样可以将其与日志及嵌套自动插桩内容关联。
- 如果库中有上下文概念，建议在支持活跃 Span 的同时，提供显式传递链路上下文的能力：
  - 将库创建的链路上下文显式置于上下文中，并说明如何访问。
  - 允许用户在自己的上下文中传递链路上下文。

- 在库内部，应显式传递上下文。因为回调过程中活跃 Span 可能发生变化：
  - 尽早在公共 API 入口捕获活跃上下文，并用其作为你创建 Span 的父上下文。
  - 在内部逻辑中显式传递上下文，记录属性、异常、事件等。
  - 如果你主动开启线程、做后台处理或其它可能破坏上下文流的异步行为，这一点至关重要。

## 其他注意事项 {#additional-considerations}

### 插桩登记表 {#instrumentation-registry}

将你的插桩库添加到 [OpenTelemetry 登记表](/ecosystem/registry/)，方便用户发现使用。

### 性能 {#performance}

在未配置 OpenTelemetry SDK 时，API 默认为 no-op，实现极为高效。当启用 SDK 后，
它会[消耗绑定资源](/docs/specs/otel/performance/)。

在高负载场景下，应用常使用基于头部的采样机制。被采样掉的 Span 开销很小。在填充属性时，
可以通过判断是否正在记录来避免额外分配和高成本计算。以下 Java 示例展示如何为采样提供属性，并判断是否记录：

```java
// 创建 span 时设置对采样重要的属性
Span span = tracer.spanBuilder(String.format("SELECT %s.%s", dbName, collectionName))
        .setSpanKind(SpanKind.CLIENT)
        .setAttribute("db.name", dbName)
        ...
        .startSpan();

// 计算代价大的属性时，先判断是否启用记录
if (span.isRecording()) {
    span.setAttribute("db.statement", sanitize(query.statement()))
}
```

### 错误处理 {#error-handling}

OpenTelemetry API 在运行时非常宽容：不会因无效参数抛出异常、不会中断程序逻辑、异常会被吞掉，
详见[错误处理原则](/docs/specs/otel/error-handling/#basic-error-handling-principles)。
因此插桩问题不会影响应用逻辑，但你仍应测试插桩逻辑以发现 API 所隐藏的问题。

### 测试 {#testing}

OpenTelemetry 提供多种自动插桩方式，因此请测试你的插桩与其他遥测信号（如入站/出站请求、日志等）的交互方式。
使用典型应用及流行框架/库并启用完整追踪进行测试，查看你的库的遥测表现。

在单元测试中，你通常可以 mock 或 fake `SpanProcessor` 和 `SpanExporter`，如下例所示：

```java
@Test
public void checkInstrumentation() {
  SpanExporter exporter = new TestExporter();

  Tracer tracer = OpenTelemetrySdk.builder()
           .setTracerProvider(SdkTracerProvider.builder()
              .addSpanProcessor(SimpleSpanProcessor.create(exporter)).build()).build()
           .getTracer("test");
  // 执行测试...

  validateSpans(exporter.exportedSpans);
}

class TestExporter implements SpanExporter {
  public final List<SpanData> exportedSpans = Collections.synchronizedList(new ArrayList<>());

  @Override
  public CompletableResultCode export(Collection<SpanData> spans) {
    exportedSpans.addAll(spans);
    return CompletableResultCode.ofSuccess();
  }
  ...
}
```

[instrumentation libraries]: /docs/specs/otel/overview/#instrumentation-libraries
[span events]: /docs/specs/otel/trace/api/#add-events
