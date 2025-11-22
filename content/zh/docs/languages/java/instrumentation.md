---
title: 插桩生态系统
default_lang_commit: 6eddc725571667e112a41aa7422bcd4c69764503
aliases:
  - /docs/java/getting_started
  - /docs/java/manual_instrumentation
  - manual
  - manual_instrumentation
  - libraries
weight: 10
description: OpenTelemetry Java 中的插桩生态系统
cSpell:ignore: logback
---

<!-- markdownlint-disable no-duplicate-heading -->

插桩（Instrumentation）使用 [API](../api/) 记录遥测数据。
[SDK](../sdk/) 是 API 的内置参考实现，并且经过[配置](../configuration/)来处理和导出插桩 API 调用生成的遥测数据。
本页将探讨 OpenTelemetry Java 中的 OpenTelemetry 生态系统，包括面向终端用户的资源以及跨领域的插桩相关主题：

- [插桩类别](#instrumentation-categories)针对不同的使用场景和安装模式。
- [上下文传播](#context-propagation)实现了链路、指标和日志之间的关联，使这些信号能够相互补充。
- [语义约定](#semantic-conventions)定义了如何为标准操作生成遥测数据。
- [日志插桩](#log-instrumentation)用于将现有 Java 日志框架中的日志接入 OpenTelemetry。

{{% alert %}} 尽管[插桩类别](#instrumentation-categories)列举了多种应用插桩方案，
但我们建议用户从[Java 代理](#zero-code-java-agent)开始尝试。
Java 代理的安装过程简单，能自动检测并能从大量库中安装插桩组件。{{% /alert %}}

## 插桩类别 {#instrumentation-categories}

插桩分为以下几类：

- [零代码: Java 代理](#zero-code-java-agent)是一种零代码插桩形式 **[1]**，可动态操作应用的字节码。
- [零代码: Spring Boot 启动器](#zero-code-spring-boot-starter)是一种零代码插桩形式 **[1]**，
  它利用 Spring 自动配置来安装[库插桩](#library-instrumentation).
- [库插桩](#library-instrumentation) 通过包装或使用扩展点来对库进行插桩，
  这要求用户手动安装和/或调整库的使用方式。
- [原生插桩](#native-instrumentation)是直接内置在库和框架中的。
- [手动插桩](#manual-instrumentation)是由应用开发者编写的，且通常特定于应用的业务领域。
- [适配层](#shims)用于将数据从一个可观测性库桥接到另一个，通常是**从**某些库导入到 OpenTelemetry 中。

**[1]**： 零代码插桩会根据检测到的库或框架自动安装。

[opentelemetry-java-instrumentation](https://github.com/open-telemetry/opentelemetry-java-instrumentation)
项目包含了 Java 代理、Spring Boot 启动器和库插桩的源代码。

### 零代码: Java 代理 {#zero-code-java-agent}

Java 代理是一种零代码的[自动插桩](/docs/specs/otel/glossary/#automatic-instrumentation)形式，可动态操作应用的字节码。

要查看 Java 代理已插桩库列表，请参考[支持的库](https://github.com/open-telemetry/opentelemetry-java-instrumentation/blob/main/docs/supported-libraries.md)中 “自动插桩版本” 一栏。

更多详情请参见 [Java 代理](/docs/zero-code/java/agent/)。

### 零代码: Spring Boot 启动器 {#zero-code-spring-boot-starter}

Spring Boot 启动器是一种零代码的[自动插桩](/docs/specs/otel/glossary/#automatic-instrumentation)形式，
它利用 Spring 自动配置来安装[库插桩](#library-instrumentation)。

详情请参见 [Spring Boot 启动器](/docs/zero-code/java/spring-boot-starter/)。

### 库插桩 {#library-instrumentation}

[库插桩](/docs/specs/otel/glossary/#instrumentation-library)
通过包装或使用扩展点来对库进行插桩，这要求用户安装和/或调整库的使用方式。

关于插桩库的列表，请参见[支持的库](https://github.com/open-telemetry/opentelemetry-java-instrumentation/blob/main/docs/supported-libraries.md)中的 “独立库插桩” 列。

### 原生插桩 {#native-instrumentation}

[原生插桩](/docs/specs/otel/glossary/#natively-instrumented)是直接内置在库或框架中的。
OpenTelemetry 鼓励库的作者使用 API(../api/) 添加原生插桩。
从长远来看，我们希望原生插桩能成为行业常态，
同时将 OpenTelemetry 在 [opentelemetry-java-instrumentation](https://github.com/open-telemetry/opentelemetry-java-instrumentation)
中维护的插桩方案视为填补当前空白的临时手段。

{{% docs/languages/native-libraries %}}

### 手动插桩 {#manual-instrumentation}

[手动插桩](/docs/specs/otel/glossary/#manual-instrumentation)是由应用开发者编写的，且通常特定于应用的业务领域。

### 适配层 {#shims}

适配层是一种插桩组件，用于将数据从一个可观测性库桥接到另一个，通常是从某些库导入到 OpenTelemetry 中。

OpenTelemetry Java 生态中维护的适配层包括：

| 描述                                                                                                        | 文档                                                                                                                                                                            | 信号       | 构件                                                                                                                            |
| ----------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------- |
| 将 [OpenTracing](https://opentracing.io/) 桥接到 OpenTelemetry                                              | [README](https://github.com/open-telemetry/opentelemetry-java/tree/main/opentracing-shim)                                                                                       | 链路       | `io.opentelemetry:opentelemetry-opentracing-shim:{{% param vers.otel %}}`                                                       |
| 将 [Opencensus](https://opencensus.io/) 桥接到 OpenTelemetry                                                | [README](https://github.com/open-telemetry/opentelemetry-java/tree/main/opencensus-shim)                                                                                        | 链路, 指标 | `io.opentelemetry:opentelemetry-opencensus-shim:{{% param vers.otel %}}-alpha`                                                  |
| 将 [Micrometer](https://micrometer.io/) 桥接到 OpenTelemetry                                                | [README](https://github.com/open-telemetry/opentelemetry-java-instrumentation/tree/main/instrumentation/micrometer/micrometer-1.5/library)                                      | 指标       | `io.opentelemetry.instrumentation:opentelemetry-micrometer-1.5:{{% param vers.instrumentation %}}-alpha`                        |
| 将 [JMX](https://docs.oracle.com/javase/7/docs/technotes/guides/management/agent.html) 桥接到 OpenTelemetry | [README](https://github.com/open-telemetry/opentelemetry-java-instrumentation/blob/main/instrumentation/jmx-metrics/README.md)                                                  | 指标       | `io.opentelemetry.instrumentation:opentelemetry-jmx-metrics:{{% param vers.instrumentation %}}-alpha`                           |
| 将 OpenTelemetry 桥接到 [Prometheus Java client](https://github.com/prometheus/client_java)                 | [README](https://github.com/open-telemetry/opentelemetry-java-contrib/tree/main/prometheus-client-bridge)                                                                       | 指标       | `io.opentelemetry.contrib:opentelemetry-prometheus-client-bridge:{{% param vers.contrib %}}-alpha`                              |
| 将 OpenTelemetry 桥接到 [Micrometer](https://micrometer.io/)                                                | [README](https://github.com/open-telemetry/opentelemetry-java-contrib/tree/main/micrometer-meter-provider)                                                                      | 指标       | `io.opentelemetry.contrib:opentelemetry-micrometer-meter-provider:{{% param vers.contrib %}}-alpha`                             |
| 将 [Log4j](https://logging.apache.org/log4j/2.x/index.html) 桥接到 OpenTelemetry                            | [README](https://github.com/open-telemetry/opentelemetry-java-instrumentation/tree/main/instrumentation/log4j/log4j-appender-2.17/library)                                      | 日志       | `io.opentelemetry.instrumentation:opentelemetry-log4j-appender-2.17:{{% param vers.instrumentation %}}-alpha`                   |
| 将 [Logback](https://logback.qos.ch/) 桥接到 OpenTelemetry                                                  | [README](https://github.com/open-telemetry/opentelemetry-java-instrumentation/tree/main/instrumentation/logback/logback-appender-1.0/library)                                   | 日志       | `io.opentelemetry.instrumentation:opentelemetry-logback-appender-1.0:{{% param vers.instrumentation %}}-alpha`                  |
| 将 OpenTelemetry 上下文桥接到 [Log4j](https://logging.apache.org/log4j/2.x/index.html)                      | [README](https://github.com/open-telemetry/opentelemetry-java-instrumentation/tree/main/instrumentation/log4j/log4j-context-data/log4j-context-data-2.17/library-autoconfigure) | 上下文     | `io.opentelemetry.instrumentation:opentelemetry-log4j-context-data-2.17-autoconfigure:{{% param vers.instrumentation %}}-alpha` |
| 将 OpenTelemetry 上下文桥接到 [Logback](https://logback.qos.ch/)                                            | [README](https://github.com/open-telemetry/opentelemetry-java-instrumentation/tree/main/instrumentation/logback/logback-mdc-1.0/library)                                        | 上下文     | `io.opentelemetry.instrumentation:opentelemetry-logback-mdc-1.0:{{% param vers.instrumentation %}}-alpha`                       |

## 上下文传播 {#context-propagation}

OpenTelemetry 的各类 API 旨在实现互补协同，其整体效用远大于各部分单独作用之和。
每种信号都有其独特优势，它们共同构建出一个完整且有价值的可观测性图景。

重要的是，来自各类信号的数据通过链路上下文关联在一起：

- Span 通过父级 Span 和链接与其他 Span 相关联，而这两者均记录了相关 Span 的链路上下文。
- 指标通过[示例（exemplars）](/docs/specs/otel/metrics/data-model/#exemplars)与 Span 相关联，这些示例记录了特定度量的链路上下文。
- 日志通过在日志记录中包含链路上下文，与 Span 建立关联。

要使这种关联机制生效，链路上下文必须在整个应用内部（跨函数调用和线程）以及应用边界之间进行传播。
[上下文 API](../api/#context-api) 为此提供了支持。插桩代码的编写需具备上下文感知能力，具体而言：

- 作为应用入口点的库（即 HTTP 服务器、消息消费者等）应当从传入的消息中[提取上下文](../api/#contextpropagators)。
- 作为应用出口点的库（即 HTTP 客户端、消息生产者等）应当将[上下文注入](../api/#contextpropagators)到传出的消息中。
- 库应当以隐式或显式的方式，在调用栈中以及跨线程传递[上下文](../api/#context)。

## 语义约定 {#semantic-conventions}

[语义约定](/docs/specs/semconv/)定义了如何为标准操作生成遥测数据。
具体而言，语义约定规定了跨度名称、跨度类型、指标工具、指标单位、指标类型，以及属性键、属性值和属性要求级别等内容。

编写插桩代码时，请参考语义约定并遵循所有适用于该领域的规范。

OpenTelemetry Java 发布了一些[构件](../api/#semantic-attributes)来帮助遵循语义约定，其中包括为属性键和属性值生成的常量。

## 日志插桩 {#log-instrumentation}

尽管 [LoggerProvider](../api/#loggerprovider) 或 [Logger](../api/#logger) 的 API 在结构上
与对应的[链路](../api/#tracerprovider)和[指标](../api/#meterprovider) 的API 相似，
但它们适用于不同的使用场景。
截至目前，`LoggerProvider` 或 `Logger` 及相关类代表了[日志桥接 API](/docs/specs/otel/logs/api/)，
其存在的目的是编写日志附加器（log appenders），以便将通过其他日志 API 或框架记录的日志桥接到 OpenTelemetry 中。
它们并非供终端用户用作 Log4j、SLF4J、Logback 等日志工具的替代品。

在 OpenTelemetry 中，针对不同的应用需求，有两种典型的日志插桩使用流程：

### 直接发送至收集器（collector） {#direct-to-collector}

在 “直接发送至收集器” 流程中，日志通过网络协议（例如 OTLP）直接从应用发送到收集器。
这种流程设置简单，因为它不需要任何额外的日志转发组件，
并且允许应用能够轻松地输出符合[日志数据模型](/docs/specs/otel/logs/data-model/)的结构化日志。
然而，应用将日志进行队列处理并导出到网络地址所产生的开销，可能并非适用于所有应用。

要使用此流程，步骤如下：

- 安装合适的日志附加器（appender）。**[1]**
- 配置 OpenTelemetry [日志 SDK](../sdk/#sdkloggerprovider)，
  将日志记录导出至期望的目标地址（[收集器](https://github.com/open-telemetry/opentelemetry-collector) 或其他位置）。

**[1]**：日志附加器是一种[适配层（shim）](#shims)，用于将来自日志框架的日志桥接到 OpenTelemetry 日志 SDK 中。
参见 “将 Log4j 桥接到 OpenTelemetry”、“将 Logback 桥接到 OpenTelemetry” 条目。
有关多种场景的演示，可参考 [日志附加器示例](https://github.com/open-telemetry/opentelemetry-java-docs/tree/main/log-appender)。

### 通过文件或标准输出（stdout） {#via-file-or-stdout}

在“通过文件或标准输出”流程中，日志会被写入文件或标准输出。
另一个组件（例如 FluentBit）负责读取或跟踪（tailing）这些日志，将其解析为更结构化的格式，并将其转发到目标位置（如收集器）。
在应用的需求不允许因[直接发送至收集器](#direct-to-collector)而产生额外开销的情况下，这种流程可能更为适用。
然而，这种流程要求所有下游所需的日志字段都必须编码到日志中，并且读取日志的组件需要将数据解析为[日志数据模型]格式(/docs/specs/otel/logs/data-model)。
日志转发组件的安装与配置不在本文档的讨论范围内。

通过安装[适配层](#shims)将 OpenTelemetry 上下文桥接到日志框架中，即可实现日志与链路的关联。
参见 “将 OpenTelemetry 上下文桥接到 Log4j”、“将 OpenTelemetry 上下文桥接到 Logback” 条目。

{{% alert title="注意" %}}

在 [Java 示例仓库](https://github.com/open-telemetry/opentelemetry-java-examples/blob/main/logging-k8s-stdout-otlp-json/README.md)
中提供了一个使用标准输出（stdout）进行日志插桩的端到端示例。

{{% /alert %}}
