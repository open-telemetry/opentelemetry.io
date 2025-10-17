---
title: 配置 SDK
linkTitle: 配置 SDK
weight: 13
aliases: [config]
default_lang_commit: 83de5de552bc9c05af1f5e8769368b1e49ea45ee
drifted_from_default: true
# prettier-ignore
cSpell:ignore: autoconfigured blrp Customizer Dotel ignore LOWMEMORY ottrace PKCS
---

<!-- markdownlint-disable blanks-around-fences -->
<?code-excerpt path-base="examples/java/configuration"?>

[SDK](../sdk/) 是 [API](../api/) 的内置参考实现，用于处理和导出由插桩的 API 调用所生成的遥测数据。
将 SDK 配置为能够适当处理和导出遥测数据，是将 OpenTelemetry 集成到应用程序中的关键步骤。

所有 SDK 组件都拥有[编程式配置 API](#programmatic-configuration)。
这是配置 SDK 最灵活、最具表现力的方式。
然而，修改配置需要调整代码并重新编译应用程序，而且由于该 API 是用 Java 编写的，因此不具备语言互操作性。

[零代码 SDK 自动配置](#zero-code-sdk-autoconfigure)模块通过系统属性或环境变量来配置 SDK 组件，
同时针对属性配置不足以满足需求的情况提供了多种扩展点。

{{% alert %}} 我们推荐使用[零代码 SDK 自动配置](#zero-code-sdk-autoconfigure)模块，
因为它减少了样板代码，允许无需重写代码或重新编译应用程序即可重新配置，
并且具有语言互操作性。 {{% /alert %}}

{{% alert %}} [Java 代理](/docs/zero-code/java/agent/)和
[Spring 启动器](/docs/zero-code/java/spring-boot-starter/)会使用零代码 SDK 自动配置模块来自动配置 SDK ，
并随之安装插桩组件。
所有自动配置内容都适用于 Java 代理和 Spring 启动器用户。 {{% /alert %}}

## 编程式配置 {#programmatic-configuration}

编程式配置接口是用于构建 [SDK](../sdk/) 组件的一组 API。
所有 SDK 组件都拥有编程式配置 API，并且其他所有配置机制都是基于此 API 构建的。
例如，[自动配置的环境变量和系统属性](#environment-variables-and-system-properties)
配置接口会将众所周知的环境变量和系统属性解析为一系列对编程式配置 API 的调用。

尽管其他配置机制提供了更高的便利性，但没有一种机制能像编写代码那样能够精确表达所需的配置并提供同等的灵活性。
当某种特定功能不被更高级的配置机制支持时，你可能别无选择只能使用编程式配置。

[SDK 组件](../sdk/#sdk-components)部分演示了适用于 SDK 关键用户交互领域的简单编程式配置 API。
有关完整的 API 参考，请查阅代码。

## 零代码 SDK 自动配置 {#zero-code-sdk-autoconfigure}

自动配置模块（构件 `io.opentelemetry:opentelemetry-sdk-extension-autoconfigure:{{% param vers.otel %}}`）
是一个构建在[编程式配置接口](#programmatic-configuration)之上的配置接口，
它能够以零代码方式配置 [SDK 组件](../sdk/#sdk-components)。
有两种不同的自动配置工作流：

- [环境变量和系统属性](#environment-variables-and-system-properties)
  会解析环境变量和系统属性来创建 SDK 组件，其中包含用于叠加编程式配置的各种自定义点。
- [声明式配置](#declarative-configuration)（**当前正在开发中**）
  通过解析配置模型来创建 SDK 组件，这种配置模型通常以 YAML 配置文件的形式进行编码。

使用自动配置模块自动配置 SDK 组件的方法如下：

<!-- prettier-ignore-start -->
<?code-excerpt "src/main/java/otel/AutoConfiguredSdk.java"?>
```java
package otel;

import io.opentelemetry.sdk.OpenTelemetrySdk;
import io.opentelemetry.sdk.autoconfigure.AutoConfiguredOpenTelemetrySdk;

public class AutoConfiguredSdk {
  public static OpenTelemetrySdk autoconfiguredSdk() {
    return AutoConfiguredOpenTelemetrySdk.initialize().getOpenTelemetrySdk();
  }
}
```
<!-- prettier-ignore-end -->

{{% alert %}} [Java 代理](/docs/zero-code/java/agent/)和
[Spring 启动器](/docs/zero-code/java/spring-boot-starter/)会使用零代码
SDK 自动配置模块来自动配置 SDK ，并随之安装插桩组件。
所有自动配置内容都适用于 Java 代理和 Spring 启动器用户。 {{% /alert %}}

{{% alert %}} 自动配置模块注册了 Java 关闭钩子，以在适当的时候关闭 SDK。
自动配置模块还会注册一个关闭钩子，以便在适当时机关闭 SDK。
由于 OpenTelemetry Java [使用 `java.util.logging` 进行内部日志记录](../sdk/#internal-logging)，
在关闭钩子期间可能会抑制某些日志记录。
这是 JDK 本身的一个错误，而不是 OpenTelemetry Java 所能控制的。
如果你需要在关闭钩子期间进行日志记录，请考虑使用 `System.out`，
而非日志框架，因为日志框架本身可能会在某个关闭钩子中自行关闭，从而导致您的日志消息被抑制。
有关更多详细信息，请参阅此 [JDK bug](https://bugs.openjdk.java.net/browse/JDK-8161253)。 {{% /alert %}}

### 环境变量和系统属性 {#environment-variables-and-system-properties}

自动配置模块支持[环境变量配置规范](/docs/specs/otel/configuration/sdk-environment-variables/)中列出的属性，
偶尔还会添加一些实验性的和 Java 特有的属性。

以下属性以系统属性的形式列出，但也可以通过环境变量进行设置。
将系统属性转换为环境变量，请执行以下步骤：

- 将名称转换为大写。
- 用 `_` 替换所有的 `.` 和 `-`。

例如，`otel.sdk.enabled` 系统属性等同于 `OTEL_SDK_ENABLED` 环境变量。

如果某个属性同时定义为系统属性和环境变量，则系统属性优先。

#### 属性: 通用 {#properties-general}

禁用 [SDK](../sdk/#opentelemetrysdk) 的相关属性：

| 系统属性            | 描述                                              | 默认值  |
| ------------------- | ------------------------------------------------- | ------- |
| `otel.sdk.disabled` | 如果为 true，则会禁用 OpenTelemetry SDK。 **[1]** | `false` |

**[1]**：如果禁用，`AutoConfiguredOpenTelemetrySdk#getOpenTelemetrySdk()`
将返回一个最小配置的实例（例如，`OpenTelemetrySdk.builder().build()`）。

属性用于设置属性限制（参见 [span 限制](../sdk/#spanlimits)、[log 限制](../sdk/#loglimits)）：

| 系统属性                            | 描述                                                                                                                            | 默认值 |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- | ------ |
| `otel.attribute.value.length.limit` | 属性值的最大长度。适用于 Span 和 日志。 会被 `otel.span.attribute.value.length.limit`、`otel.span.attribute.count.limit` 覆盖。 | 无限制 |
| `otel.attribute.count.limit`        | 属性的最大数量。适用于 Span、Span 事件、Span 链接和日志。                                                                       | `128`  |

<!-- Properties for [context propagation](../sdk/#textmappropagator): -->

[上下文传播](../sdk/#textmappropagator)的相关属性：

| 系统属性           | 描述                                                                                                                               | 默认值                       |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------- | ---------------------------- |
| `otel.propagators` | 逗号分隔的传播器列表。 已知值包括 `tracecontext`、`baggage`、`b3`、`b3multi`、`jaeger`、`ottrace`、`xray`、`xray-lambda`。 **[1]** | `tracecontext,baggage` (W3C) |

**[1]**：已知的传播器和构件（有关构件，请参阅[文本映射传播器](../sdk/#textmappropagator)）：

- `tracecontext` 配置 `W3CTraceContextPropagator`。
- `baggage` 配置 `W3CBaggagePropagator`。
- `b3`, `b3multi` 配置 `B3Propagator`。
- `jaeger` 配置 `JaegerPropagator`。
- `ottrace` 配置 `OtTracePropagator`。
- `xray` 配置 `AwsXrayPropagator`。
- `xray-lambda` 配置 `AwsXrayLambdaPropagator`。

#### 属性: 资源 {#properties-resource}

用于配置[资源](../sdk/#resource)的属性：

| 系统属性                                | 描述                                                                                               | 默认值                 |
| --------------------------------------- | -------------------------------------------------------------------------------------------------- | ---------------------- |
| `otel.service.name`                     | 指定逻辑服务名称。其优先级高于通过 `otel.resource.attributes` 定义的 `service.name`。              | `unknown_service:java` |
| `otel.resource.attributes`              | 指定资源属性，格式为： `key1=val1,key2=val2,key3=val3`。                                           |                        |
| `otel.resource.disabled.keys`           | 指定要过滤的资源属性键。                                                                           |                        |
| `otel.java.enabled.resource.providers`  | 以逗号分隔的、要启用的 `ResourceProvider` 全限定类名列表。**[1]** 若未设置，则启用所有资源提供器。 |                        |
| `otel.java.disabled.resource.providers` | 以逗号分隔的、要禁用的 ResourceProvider（资源提供器）全限定类名列表。**[1]**                       |                        |

**[1]**：例如，要禁用 [OS 资源提供器](https://github.com/open-telemetry/opentelemetry-java-instrumentation/blob/main/instrumentation/resources/library/src/main/java/io/opentelemetry/instrumentation/resources/OsResourceProvider.java)，
请设置
`-Dotel.java.disabled.resource.providers=io.opentelemetry.instrumentation.resources.OsResourceProvider`。

**注意**：`otel.service.name` 和 `otel.resource.attributes` 系统属性/环境变量
会被 `io.opentelemetry.sdk.autoconfigure.EnvironmentResourceProvider` 资源提供器解释。
如果选择通过 `otel.java.enabled.resource-providers` 来指定资源提供器，
则建议包含它以避免意外情况。
有关资源提供器构件坐标，请参阅 [ResourceProvider](#resourceprovider)。

#### 属性: 链路 {#properties-traces}

与通过 `otel.traces.exporter` 指定的导出器配对使用的[批量 Span 处理器](../sdk/#spanprocessor)相关属性包括：

| 系统属性                         | 描述                                 | 默认值  |
| -------------------------------- | ------------------------------------ | ------- |
| `otel.bsp.schedule.delay`        | 两次连续导出之间的间隔，单位为毫秒。 | `5000`  |
| `otel.bsp.max.queue.size`        | 批量导出前可以排队的最大跨度数。     | `2048`  |
| `otel.bsp.max.export.batch.size` | 单个批量导出中要导出的最大跨度数。   | `512`   |
| `otel.bsp.export.timeout`        | 导出数据的最大允许时间，单位为毫秒。 | `30000` |

属性用于配置[采样器](../sdk/#sampler)：

| 系统属性                  | 描述                                                                                                                                                                           | 默认值                  |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------- |
| `otel.traces.sampler`     | 要使用的采样器。可选值包括 `always_on`、`always_off`、`traceidratio`、`parentbased_always_on`、`parentbased_always_off`、`parentbased_traceidratio`、`jaeger_remote`。 **[1]** | `parentbased_always_on` |
| `otel.traces.sampler.arg` | 如果配置的追踪器支持，可为其指定一个参数，例如采样率。                                                                                                                         |                         |

**[1]**：已知的采样器和构件（有关构件，请参阅 [sampler](../sdk/#sampler)）：

- `always_on` 配置 `AlwaysOnSampler`。
- `always_off` 配置 `AlwaysOffSampler`。
- `traceidratio` 配置 `TraceIdRatioBased`。 `otel.traces.sampler.arg` 设置采样率。
- `parentbased_always_on` 配置 `ParentBased(root=AlwaysOnSampler)`。
- `parentbased_always_off` 配置 `ParentBased(root=AlwaysOffSampler)`。
- `parentbased_traceidratio` 配置 `ParentBased(root=TraceIdRatioBased)`。 `otel.traces.sampler.arg` 设置采样率。
- `jaeger_remote` 配置 `JaegerRemoteSampler`。
  `otel.traces.sampler.arg` 是一个逗号分隔的参数列表，
  如[规范](/docs/specs/otel/configuration/sdk-environment-variables/#general-sdk-configuration)中所述。

属性用于配置 [Span 限制值](../sdk/#spanlimits)：

| 系统属性                                 | 描述                                                                                     | 默认值 |
| ---------------------------------------- | ---------------------------------------------------------------------------------------- | ------ |
| `otel.span.attribute.value.length.limit` | 跨度数的最大属性值长度。如果设置了 `otel.attribute.value.length.limit`，则优先使用该值。 | 无限制 |
| `otel.span.attribute.count.limit`        | 每个跨度数的最大属性数。如果设置了 `otel.attribute.count.limit`，则优先使用该值。        | `128`  |
| `otel.span.event.count.limit`            | 每个跨度数的最大事件数。                                                                 | `128`  |
| `otel.span.link.count.limit`             | 每个跨度数的最大链接数。                                                                 | `128`  |

#### 属性: 指标 {#properties-metrics}

属性用于配置 [定期指标读取器](../sdk/#metricreader)：

| 系统属性                      | 描述                                 | 默认值  |
| ----------------------------- | ------------------------------------ | ------- |
| `otel.metric.export.interval` | 两次连续导出之间的间隔，单位为毫秒。 | `60000` |

属性用于配置示例：

| 系统属性                       | 描述                                                                | 默认值        |
| ------------------------------ | ------------------------------------------------------------------- | ------------- |
| `otel.metrics.exemplar.filter` | 示例筛选器。可选值包括 `ALWAYS_OFF`、`ALWAYS_ON` 或 `TRACE_BASED`。 | `TRACE_BASED` |

属性用于配置基数限制：

| 系统属性                              | 描述                                                                   | 默认值 |
| ------------------------------------- | ---------------------------------------------------------------------- | ------ |
| `otel.java.metrics.cardinality.limit` | 若设置此属性，将配置基数限制。该值规定了每个指标的最大不同数据点数量。 | `2000` |

#### 属性: 日志 {#properties-logs}

与通过 `otel.logs.exporter` 配置的导出器配对使用的[日志记录处理器](../sdk/#logrecordprocessor)相关属性：

| 系统属性                          | 描述                                   | 默认值  |
| --------------------------------- | -------------------------------------- | ------- |
| `otel.blrp.schedule.delay`        | 两次连续导出之间的间隔，单位为毫秒。   | `1000`  |
| `otel.blrp.max.queue.size`        | 批量导出前可以排队的最大日志记录数。   | `2048`  |
| `otel.blrp.max.export.batch.size` | 单个批量导出中要导出的最大日志记录数。 | `512`   |
| `otel.blrp.export.timeout`        | 导出数据的最大允许时间，单位为毫秒。   | `30000` |

#### 属性: 导出器 {#properties-exporters}

设置导出器的属性：

| 系统属性                         | 描述                                                                                                                                                                          | 默认值          |
| -------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------- |
| `otel.traces.exporter`           | 逗号分隔的跨度导出器列表。已知值包括 `otlp`、`zipkin`、`console`、`logging-otlp`、`none`。 **[1]**                                                                            | `otlp`          |
| `otel.metrics.exporter`          | 逗号分隔的指标导出器列表。已知值包括 `otlp`、`prometheus`、`none`。 **[1]**                                                                                                   | `otlp`          |
| `otel.logs.exporter`             | 逗号分隔的日志记录导出器列表。已知值包括 `otlp`、`console`、`logging-otlp`、`none`。 **[1]**                                                                                  | `otlp`          |
| `otel.java.exporter.memory_mode` | 如果设置为 `reusable_data`，则启用可重用内存模式（在支持该模式的导出器上）以减少内存分配。已知值包括 `reusable_data`（可重用数据）和 `immutable_data`（不可变数据）。 **[2]** | `reusable_data` |

**[1]**：已知的导出器及其构件（请参阅[Span 导出器](../sdk/#spanexporter)、[指标导出器](../sdk/#metricexporter)、[日志导出器](../sdk/#logrecordexporter)以获取导出器构件坐标）：

- `otlp` 配置 `OtlpHttp{Signal}Exporter`、`OtlpGrpc{Signal}Exporter`。
- `zipkin` 配置 `ZipkinSpanExporter`。
- `console` 配置 `LoggingSpanExporter`, `LoggingMetricExporter`,
  `SystemOutLogRecordExporter`。
- `logging-otlp` 配置 `OtlpJsonLogging{Signal}Exporter`。
- `experimental-otlp/stdout` 配置 `OtlpStdout{Signal}Exporter`（此选项实验性且可能会更改或移除）。

**[2]**：遵循 `otel.java.exporter.memory_mode=reusable_data` 的导出器包括 `OtlpGrpc{Signal}Exporter`、`OtlpHttp{Signal}Exporter`、`OtlpStdout{Signal}Exporter` 和 `PrometheusHttpServer`。

`otlp` Span、指标和日志导出器的相关属性包括：

| 系统属性                                                   | 描述                                                                                                                                                                                                                                                                                                                                                                                               | 默认值                                                                                                             |
| ---------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `otel.{signal}.exporter=otlp`                              | 为 {signal} 选择 OpenTelemetry 导出器。                                                                                                                                                                                                                                                                                                                                                            |                                                                                                                    |
| `otel.exporter.otlp.protocol`                              | 用于 OTLP 链路、指标和日志请求的传输协议。选项包括 `grpc` 和 `http/protobuf`。                                                                                                                                                                                                                                                                                                                     | `grpc` **[1]**                                                                                                     |
| `otel.exporter.otlp.{signal}.protocol`                     | 用于 OTLP {signal} 请求的传输协议。选项包括 `grpc` 和 `http/protobuf`。                                                                                                                                                                                                                                                                                                                            | `grpc` **[1]**                                                                                                     |
| `otel.exporter.otlp.endpoint`                              | 用于发送所有 OTLP 链路、指标和日志的端点。通常是 OpenTelemetry Collector 的地址。必须是基于 TLS 使用情况、 scheme 为 `http` 或 `https` 的 URL。                                                                                                                                                                                                                                                    | 当协议为 `grpc` 时是 `http://localhost:4317`，当协议为 `http/protobuf` 时是 `http://localhost:4318`。              |
| `otel.exporter.otlp.{signal}.endpoint`                     | 用于发送 OTLP {signal} 的端点。通常是 OpenTelemetry Collector 的地址。必须是基于 TLS 使用情况、scheme 为 `http` 或 `https` 的 URL。若协议为 `http/protobuf`，则必须在路径中附加版本和信号（例如 `v1/traces`、`v1/metrics` 或 `v1/logs`）。                                                                                                                                                         | 当协议为 `grpc` 时是 `http://localhost:4317`， 当协议为 `http/protobuf` 时是 `http://localhost:4318/v1/{signal}`。 |
| `otel.exporter.otlp.certificate`                           | 用于验证 OTLP 链路、指标或日志服务器 TLS 凭据时所使用的可信证书文件路径。该文件应包含一个或多个 PEM 格式的 X.509 证书。                                                                                                                                                                                                                                                                            | 将使用主机平台的可信根证书。                                                                                       |
| `otel.exporter.otlp.{signal}.certificate`                  | 用于验证 OTLP {signal} 服务器 TLS 凭据时所使用的可信证书文件路径。该文件应包含一个或多个 PEM 格式的 X.509 证书。                                                                                                                                                                                                                                                                                   | 将使用主机平台的可信根证书。                                                                                       |
| `otel.exporter.otlp.client.key`                            | 用于验证 OTLP 链路、指标或日志客户端 TLS 凭据时所使用的私有客户端密钥文件路径。该文件应包含一个 PKCS8 PEM 格式的私有密钥。                                                                                                                                                                                                                                                                         | 不使用客户端密钥文件。                                                                                             |
| `otel.exporter.otlp.{signal}.client.key`                   | 用于验证 OTLP {signal} 客户端 TLS 凭据的私有客户端密钥文件路径。该文件应包含一个 PKCS8 PEM 格式的私有密钥。                                                                                                                                                                                                                                                                                        | 不使用客户端密钥文件。                                                                                             |
| `otel.exporter.otlp.client.certificate`                    | 用于验证 OTLP 链路、指标或日志客户端 TLS 凭据时所使用的可信证书文件路径。该文件应包含一个或多个 PEM 格式的 X.509 证书。                                                                                                                                                                                                                                                                            | 不使用证书链文件。                                                                                                 |
| `otel.exporter.otlp.{signal}.client.certificate`           | 用于验证 OTLP {signal} 客户端 TLS 凭据时所使用的可信证书文件路径。该文件应包含一个或多个 PEM 格式的 X.509 证书。                                                                                                                                                                                                                                                                                   | 不使用证书链文件。                                                                                                 |
| `otel.exporter.otlp.headers`                               | 以逗号分隔的键值对，用作 OTLP 链路、指标和日志请求的请求头。                                                                                                                                                                                                                                                                                                                                       |                                                                                                                    |
| `otel.exporter.otlp.{signal}.headers`                      | 以逗号分隔的键值对，用作 OTLP {signal} 请求的请求头。                                                                                                                                                                                                                                                                                                                                              |                                                                                                                    |
| `otel.exporter.otlp.compression`                           | 用于 OTLP 链路、指标和日志请求的压缩类型。可选值包括 `gzip`。                                                                                                                                                                                                                                                                                                                                      | 不使用压缩。                                                                                                       |
| `otel.exporter.otlp.{signal}.compression`                  | 用于 OTLP {signal} 请求的压缩类型。可选值包括 `gzip`。                                                                                                                                                                                                                                                                                                                                             | 不使用压缩。                                                                                                       |
| `otel.exporter.otlp.timeout`                               | 发送每个 OTLP 链路、指标和日志批次所允许的最大等待时间，单位为毫秒。                                                                                                                                                                                                                                                                                                                               | `10000`                                                                                                            |
| `otel.exporter.otlp.{signal}.timeout`                      | 发送每个 OTLP {signal} 批次所允许的最大等待时间，单位为毫秒。                                                                                                                                                                                                                                                                                                                                      | `10000`                                                                                                            |
| `otel.exporter.otlp.metrics.temporality.preference`        | 首选的输出聚合时间性。可选项包括`DELTA`、`LOWMEMORY` 和 `CUMULATIVE`。若设置为 `CUMULATIVE`，则所有指标（instrument）都将采用累积时间性。若设置为 `DELTA`，则计数器（同步和异步）与直方图将采用增量时间性，而上下计数器（同步和异步）将采用累积时间性。若设置为 `LOWMEMORY`，则同步计数器和直方图将采用增量时间性（DELTA），而异步计数器及上下计数器（同步和异步）将采用累积时间性（CUMULATIVE）。 | `CUMULATIVE`                                                                                                       |
| `otel.exporter.otlp.metrics.default.histogram.aggregation` | 首选的默认直方图聚合。可选项包括 `BASE2_EXPONENTIAL_BUCKET_HISTOGRAM` 和 `EXPLICIT_BUCKET_HISTOGRAM`。                                                                                                                                                                                                                                                                                             | `EXPLICIT_BUCKET_HISTOGRAM`                                                                                        |
| `otel.java.exporter.otlp.retry.disabled`                   | 若设置为 `false`，则当发生暂时性错误时会进行重试。 **[2]**                                                                                                                                                                                                                                                                                                                                         | `false`                                                                                                            |

文本占位符 `{signal}` 指代受支持的 [OpenTelemetry 信号](/docs/concepts/signals/)。
有效值包括 `traces`、`metrics` 和 `logs`。特定信号的配置优先于通用版本。
例如，如果同时设置了 `otel.exporter.otlp.endpoint` 和 `otel.exporter.otlp.traces.endpoint`，则后者将优先于前者。

**[1]**：OpenTelemetry Java 代理 2.x 和 OpenTelemetry Spring Boot 启动器默认使用 `http/protobuf`。

**[2]**：[OTLP](/docs/specs/otlp/#otlpgrpc-response) 要求对[暂时性](/docs/specs/otel/protocol/exporter/#retry)错误采用重试策略进行处理。
当启用重试功能时，对于可重试的 gRPC 状态码将采用带抖动的指数退避算法进行重试。
`RetryPolicy` 的具体选项只能通过[编程方式自定义](#programmatic-customization)进行配置。

`zipkin` Span 导出器的相关属性包括：

| 系统属性                        | 描述                                | 默认值                               |
| ------------------------------- | ----------------------------------- | ------------------------------------ |
| `otel.traces.exporter=zipkin`   | 选择 Zipkin 导出器                  |                                      |
| `otel.exporter.zipkin.endpoint` | 连接到的 Zipkin 端点。仅支持 HTTP。 | `http://localhost:9411/api/v2/spans` |

`prometheus` 指标导出器的相关属性包括：

| 系统属性                           | 描述                                       | 默认值    |
| ---------------------------------- | ------------------------------------------ | --------- |
| `otel.metrics.exporter=prometheus` | 选择 Prometheus 导出器                     |           |
| `otel.exporter.prometheus.port`    | 用于绑定 Prometheus 指标服务器的本地端口。 | `9464`    |
| `otel.exporter.prometheus.host`    | 用于绑定 Prometheus 指标服务器的本地地址。 | `0.0.0.0` |

#### 编程方式自定义 {#programmatic-customization}

编程方式自定义提供了一些钩子，
用于在[支持的属性](#environment-variables-and-system-properties)的基础上补充[编程配置](#programmatic-configuration)。

如果使用的是[Spring 启动器](/docs/zero-code/java/spring-boot-starter/)，
另请参考[Spring 启动器编程配置](/docs/zero-code/java/spring-boot-starter/sdk-configuration/#programmatic-configuration)。

<!-- prettier-ignore-start -->
<?code-excerpt "src/main/java/otel/CustomizedAutoConfiguredSdk.java"?>
```java
package otel;

import io.opentelemetry.sdk.OpenTelemetrySdk;
import io.opentelemetry.sdk.autoconfigure.AutoConfiguredOpenTelemetrySdk;
import java.util.Collections;

public class CustomizedAutoConfiguredSdk {
  public static OpenTelemetrySdk autoconfiguredSdk() {
    return AutoConfiguredOpenTelemetrySdk.builder()
        // 可以选择性地自定义 TextMapPropagator.
        .addPropagatorCustomizer((textMapPropagator, configProperties) -> textMapPropagator)
        // 可以选择性地自定义 Resource.
        .addResourceCustomizer((resource, configProperties) -> resource)
        // 可以选择性地自定义 Sampler.
        .addSamplerCustomizer((sampler, configProperties) -> sampler)
        // 可以选择性地自定义 SpanExporter.
        .addSpanExporterCustomizer((spanExporter, configProperties) -> spanExporter)
        // 可以选择性地自定义 SpanProcessor.
        .addSpanProcessorCustomizer((spanProcessor, configProperties) -> spanProcessor)
        // 可以选择性地提供额外属性.
        .addPropertiesSupplier(Collections::emptyMap)
        // 可以选择性地自定义 ConfigProperties.
        .addPropertiesCustomizer(configProperties -> Collections.emptyMap())
        // 可以选择性地自定义 SdkTracerProviderBuilder.
        .addTracerProviderCustomizer((builder, configProperties) -> builder)
        // 可以选择性地自定义 SdkMeterProviderBuilder.
        .addMeterProviderCustomizer((builder, configProperties) -> builder)
        // 可以选择性地自定义 MetricExporter.
        .addMetricExporterCustomizer((metricExporter, configProperties) -> metricExporter)
        // 可以选择性地自定义 MetricReader.
        .addMetricReaderCustomizer((metricReader, configProperties) -> metricReader)
        // 可以选择性地自定义 SdkLoggerProviderBuilder.
        .addLoggerProviderCustomizer((builder, configProperties) -> builder)
        // 可以选择性地自定义 LogRecordExporter.
        .addLogRecordExporterCustomizer((logRecordExporter, configProperties) -> logRecordExporter)
        // 可以选择性地自定义 LogRecordProcessor.
        .addLogRecordProcessorCustomizer((processor, configProperties) -> processor)
        .build()
        .getOpenTelemetrySdk();
  }
}
```
<!-- prettier-ignore-end -->

#### SPI (服务提供者接口) {#spi-service-provider-interface}

[SPI](https://docs.oracle.com/javase/tutorial/sound/SPI-intro.html) (构件
`io.opentelemetry:opentelemetry-sdk-extension-autoconfigure-spi:{{% param vers.otel %}}`)
能够扩展 SDK 的自动配置能力，使其超出 SDK 内置组件的范畴。

以下部分介绍了可用的 SPI。每个 SPI 部分包括：

- 简要描述，包括指向 Javadoc 类型参考的链接。
- 可用的内置和 `opentelemetry-java-contrib` 实现的表格。
- 自定义实现的简单演示。

##### ResourceProvider {#resourceprovider}

[ResourceProvider](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-sdk-extension-autoconfigure-spi/latest/io/opentelemetry/sdk/autoconfigure/spi/ResourceProvider.html)
能够贡献自动配置的[资源](../sdk/#resource)。

`ResourceProvider` 内置在 SDK 中，由社区维护在 `opentelemetry-java-contrib` 中：

| Class                                                                       | Artifact                                                                                            | 描述                                                                          |
| --------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| `io.opentelemetry.sdk.autoconfigure.internal.EnvironmentResourceProvider`   | `io.opentelemetry:opentelemetry-sdk-extension-autoconfigure:{{% param vers.otel %}}`                | 基于环境变量 `OTEL_SERVICE_NAME` 和 `OTEL_RESOURCE_ATTRIBUTES` 提供资源属性。 |
| `io.opentelemetry.instrumentation.resources.ContainerResourceProvider`      | `io.opentelemetry.instrumentation:opentelemetry-resources:{{% param vers.instrumentation %}}-alpha` | 提供容器相关的资源属性。                                                      |
| `io.opentelemetry.instrumentation.resources.HostResourceProvider`           | `io.opentelemetry.instrumentation:opentelemetry-resources:{{% param vers.instrumentation %}}-alpha` | 提供主机相关的资源属性。                                                      |
| `io.opentelemetry.instrumentation.resources.HostIdResourceProvider`         | `io.opentelemetry.instrumentation:opentelemetry-resources:{{% param vers.instrumentation %}}-alpha` | 提供主机 ID 相关的资源属性。                                                  |
| `io.opentelemetry.instrumentation.resources.ManifestResourceProvider`       | `io.opentelemetry.instrumentation:opentelemetry-resources:{{% param vers.instrumentation %}}-alpha` | 基于 JAR 清单文件提供服务相关的资源属性。                                     |
| `io.opentelemetry.instrumentation.resources.OsResourceProvider`             | `io.opentelemetry.instrumentation:opentelemetry-resources:{{% param vers.instrumentation %}}-alpha` | 提供 OS 相关的资源属性。                                                      |
| `io.opentelemetry.instrumentation.resources.ProcessResourceProvider`        | `io.opentelemetry.instrumentation:opentelemetry-resources:{{% param vers.instrumentation %}}-alpha` | 提供进程相关的资源属性。                                                      |
| `io.opentelemetry.instrumentation.resources.ProcessRuntimeResourceProvider` | `io.opentelemetry.instrumentation:opentelemetry-resources:{{% param vers.instrumentation %}}-alpha` | 提供进程运行时相关的资源属性                                                  |
| `io.opentelemetry.contrib.gcp.resource.GCPResourceProvider`                 | `io.opentelemetry.contrib:opentelemetry-gcp-resources:{{% param vers.contrib %}}-alpha`             | 提供 GCP（Google Cloud Platform）运行时环境的资源属性。                       |
| `io.opentelemetry.contrib.aws.resource.BeanstalkResourceProvider`           | `io.opentelemetry.contrib:opentelemetry-aws-resources:{{% param vers.contrib %}}-alpha`             | 提供 AWS Elastic Beanstalk 运行时环境的资源属性。                             |
| `io.opentelemetry.contrib.aws.resource.Ec2ResourceProvider`                 | `io.opentelemetry.contrib:opentelemetry-aws-resources:{{% param vers.contrib %}}-alpha`             | 提供 AWS EC2 运行时环境的资源属性。                                           |
| `io.opentelemetry.contrib.aws.resource.EcsResourceProvider`                 | `io.opentelemetry.contrib:opentelemetry-aws-resources:{{% param vers.contrib %}}-alpha`             | 提供 AWS ECS 运行时环境的资源属性。                                           |
| `io.opentelemetry.contrib.aws.resource.EksResourceProvider`                 | `io.opentelemetry.contrib:opentelemetry-aws-resources:{{% param vers.contrib %}}-alpha`             | 提供 AWS EKS 运行时环境的资源属性。                                           |
| `io.opentelemetry.contrib.aws.resource.LambdaResourceProvider`              | `io.opentelemetry.contrib:opentelemetry-aws-resources:{{% param vers.contrib %}}-alpha`             | 提供 AWS Lambda 运行时环境的资源属性。                                        |

实现 `ResourceProvider` 接口以参与资源自动配置。例如：

<!-- prettier-ignore-start -->
<?code-excerpt "src/main/java/otel/CustomResourceProvider.java"?>
```java
package otel;

import io.opentelemetry.sdk.autoconfigure.spi.ConfigProperties;
import io.opentelemetry.sdk.autoconfigure.spi.ResourceProvider;
import io.opentelemetry.sdk.resources.Resource;

public class CustomResourceProvider implements ResourceProvider {

  @Override
  public Resource createResource(ConfigProperties config) {
    // 为资源提供属性的回调函数。
    return Resource.builder().put("my.custom.resource.attribute", "abc123").build();
  }

  @Override
  public int order() {
    // 可选地影响调用顺序。
    return 0;
  }
}
```
<!-- prettier-ignore-end -->

##### AutoConfigurationCustomizerProvider {#autoconfigurationcustomizerprovider}

实现 [AutoConfigurationCustomizerProvider](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-sdk-extension-autoconfigure-spi/latest/io/opentelemetry/sdk/autoconfigure/spi/AutoConfigurationCustomizerProvider.html) 接口以自定义各种自动配置的 SDK 组件。例如：

<!-- prettier-ignore-start -->
<?code-excerpt "src/main/java/otel/CustomizerProvider.java"?>
```java
package otel;

import io.opentelemetry.sdk.autoconfigure.spi.AutoConfigurationCustomizer;
import io.opentelemetry.sdk.autoconfigure.spi.AutoConfigurationCustomizerProvider;
import java.util.Collections;

public class CustomizerProvider implements AutoConfigurationCustomizerProvider {

  @Override
  public void customize(AutoConfigurationCustomizer customizer) {
    // 可选择自定义 TextMapPropagator。
    customizer.addPropagatorCustomizer((textMapPropagator, configProperties) -> textMapPropagator);
    // 可选择自定义 Resource。
    customizer.addResourceCustomizer((resource, configProperties) -> resource);
    // 可选择自定义 Sampler。
    customizer.addSamplerCustomizer((sampler, configProperties) -> sampler);
    // 可选择自定义 SpanExporter。
    customizer.addSpanExporterCustomizer((spanExporter, configProperties) -> spanExporter);
    // 可选择自定义 SpanProcessor。
    customizer.addSpanProcessorCustomizer((spanProcessor, configProperties) -> spanProcessor);
    // 可选择提供额外的属性。
    customizer.addPropertiesSupplier(Collections::emptyMap);
    // 可选择自定义 ConfigProperties。
    customizer.addPropertiesCustomizer(configProperties -> Collections.emptyMap());
    // 可选择自定义 SdkTracerProviderBuilder。
    customizer.addTracerProviderCustomizer((builder, configProperties) -> builder);
    // 可选择自定义 SdkMeterProviderBuilder。
    customizer.addMeterProviderCustomizer((builder, configProperties) -> builder);
    // 可选择自定义 MetricExporter。
    customizer.addMetricExporterCustomizer((metricExporter, configProperties) -> metricExporter);
    // 可选择自定义 MetricReader。
    customizer.addMetricReaderCustomizer((metricReader, configProperties) -> metricReader);
    // 可选择自定义 SdkLoggerProviderBuilder。
    customizer.addLoggerProviderCustomizer((builder, configProperties) -> builder);
    // 可选择自定义 LogRecordExporter。
    customizer.addLogRecordExporterCustomizer((exporter, configProperties) -> exporter);
    // 可选择自定义 LogRecordProcessor。
    customizer.addLogRecordProcessorCustomizer((processor, configProperties) -> processor);
  }

  @Override
  public int order() {
    // 可选地影响调用顺序。
    return 0;
  }
}
```
<!-- prettier-ignore-end -->

##### ConfigurableSpanExporterProvider {#configurablespanexporterprovider}

实现 [ConfigurableSpanExporterProvider](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-sdk-extension-autoconfigure-spi/latest/io/opentelemetry/sdk/autoconfigure/spi/traces/ConfigurableSpanExporterProvider.html) 接口以允许自定义 Span 导出器参与自动配置。例如：

<!-- prettier-ignore-start -->
<?code-excerpt "src/main/java/otel/CustomSpanExporterProvider.java"?>
```java
package otel;

import io.opentelemetry.sdk.autoconfigure.spi.ConfigProperties;
import io.opentelemetry.sdk.autoconfigure.spi.traces.ConfigurableSpanExporterProvider;
import io.opentelemetry.sdk.trace.export.SpanExporter;

public class CustomSpanExporterProvider implements ConfigurableSpanExporterProvider {

  @Override
  public SpanExporter createExporter(ConfigProperties config) {
    // 当 OTEL_TRACES_EXPORTER 包含 getName() 的值时调用的回调函数。
    return new CustomSpanExporter();
  }

  @Override
  public String getName() {
    return "custom-exporter";
  }
}
```
<!-- prettier-ignore-end -->

##### ConfigurableMetricExporterProvider {#configurablemetricexporterprovider}

实现 [ConfigurableMetricExporterProvider](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-sdk-extension-autoconfigure-spi/latest/io/opentelemetry/sdk/autoconfigure/spi/metrics/ConfigurableMetricExporterProvider.html) 接口以允许自定义指标导出器参与自动配置。例如：

<!-- prettier-ignore-start -->
<?code-excerpt "src/main/java/otel/CustomMetricExporterProvider.java"?>
```java
package otel;

import io.opentelemetry.sdk.autoconfigure.spi.ConfigProperties;
import io.opentelemetry.sdk.autoconfigure.spi.metrics.ConfigurableMetricExporterProvider;
import io.opentelemetry.sdk.metrics.export.MetricExporter;

public class CustomMetricExporterProvider implements ConfigurableMetricExporterProvider {

  @Override
  public MetricExporter createExporter(ConfigProperties config) {
    // 当 OTEL_METRICS_EXPORTER 包含 getName() 的值时调用的回调函数。
    return new CustomMetricExporter();
  }

  @Override
  public String getName() {
    return "custom-exporter";
  }
}
```
<!-- prettier-ignore-end -->

##### ConfigurableLogRecordExporterProvider {#configurablelogrecordexporterprovider}

实现 [ConfigurableLogRecordExporterProvider](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-sdk-extension-autoconfigure-spi/latest/io/opentelemetry/sdk/autoconfigure/spi/logs/ConfigurableLogRecordExporterProvider.html) 接口以允许自定义日志记录导出器参与自动配置。例如：

<!-- prettier-ignore-start -->
<?code-excerpt "src/main/java/otel/CustomLogRecordExporterProvider.java"?>
```java
package otel;

import io.opentelemetry.sdk.autoconfigure.spi.ConfigProperties;
import io.opentelemetry.sdk.autoconfigure.spi.logs.ConfigurableLogRecordExporterProvider;
import io.opentelemetry.sdk.logs.export.LogRecordExporter;

public class CustomLogRecordExporterProvider implements ConfigurableLogRecordExporterProvider {

  @Override
  public LogRecordExporter createExporter(ConfigProperties config) {
    // 当 OTEL_LOGS_EXPORTER 包含 getName() 的值时调用的回调函数。
    return new CustomLogRecordExporter();
  }

  @Override
  public String getName() {
    return "custom-exporter";
  }
}
```
<!-- prettier-ignore-end -->

##### ConfigurableSamplerProvider {#configurablesamplerprovider}

实现 [ConfigurableSamplerProvider](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-sdk-extension-autoconfigure-spi/latest/io/opentelemetry/sdk/autoconfigure/spi/traces/ConfigurableSamplerProvider.html) 接口以允许自定义采样器参与自动配置。例如：

<!-- prettier-ignore-start -->
<?code-excerpt "src/main/java/otel/CustomSamplerProvider.java"?>
```java
package otel;

import io.opentelemetry.sdk.autoconfigure.spi.ConfigProperties;
import io.opentelemetry.sdk.autoconfigure.spi.traces.ConfigurableSamplerProvider;
import io.opentelemetry.sdk.trace.samplers.Sampler;

public class CustomSamplerProvider implements ConfigurableSamplerProvider {

  @Override
  public Sampler createSampler(ConfigProperties config) {
    // 当 OTEL_TRACES_SAMPLER 设置为 getName() 的值时调用的回调函数。
    return new CustomSampler();
  }

  @Override
  public String getName() {
    return "custom-sampler";
  }
}
```
<!-- prettier-ignore-end -->

##### ConfigurablePropagatorProvider {#configurablepropagatorprovider}

实现 [ConfigurablePropagatorProvider](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-sdk-extension-autoconfigure-spi/latest/io/opentelemetry/sdk/autoconfigure/spi/ConfigurablePropagatorProvider.html) 接口以允许自定义传播器参与自动配置。例如：

<!-- prettier-ignore-start -->
<?code-excerpt "src/main/java/otel/CustomTextMapPropagatorProvider.java"?>
```java
package otel;

import io.opentelemetry.context.propagation.TextMapPropagator;
import io.opentelemetry.sdk.autoconfigure.spi.ConfigProperties;
import io.opentelemetry.sdk.autoconfigure.spi.ConfigurablePropagatorProvider;

public class CustomTextMapPropagatorProvider implements ConfigurablePropagatorProvider {
  @Override
  public TextMapPropagator getPropagator(ConfigProperties config) {
    // 当 OTEL_PROPAGATORS 包含 getName() 的值时调用的回调函数。
    return new CustomTextMapPropagator();
  }

  @Override
  public String getName() {
    return "custom-propagator";
  }
}
```
<!-- prettier-ignore-end -->

### 声明式配置 {#declarative-configuration}

声明式配置目前正在开发中。它允许基于 YAML 文件的配置，如 [opentelemetry-configuration](https://github.com/open-telemetry/opentelemetry-configuration) 和[声明式配置](/docs/specs/otel/configuration/#declarative-configuration) 中所述。

要使用，请包含 `io.opentelemetry:opentelemetry-sdk-extension-incubator:{{% param vers.otel %}}-alpha`，并按照下表所述指定配置文件的路径。

| 系统属性                        | 目的                 | 默认值 |
| ------------------------------- | -------------------- | ------ |
| `otel.experimental.config.file` | SDK 配置文件的路径。 | 未设置 |

{{% alert title="Note" color="warning" %}}
当指定配置文件后，[环境变量和系统属性](#environment-variables-and-system-properties)将被忽略，
[编程式定制](#programmatic-customization)和 [SPI](#spi-service-provider-interface) 将被跳过。
SDK 配置完全由该文件的内容决定。 {{% /alert %}}

有关更多详细信息，请参考以下资源：

- [使用文档](https://github.com/open-telemetry/opentelemetry-java/tree/main/sdk-extensions/incubator#declarative-configuration)
- [使用 Java 代理的示例](https://github.com/open-telemetry/opentelemetry-java-examples/tree/main/javaagent#declarative-configuration)
- [不使用 Java 代理的示例](https://github.com/open-telemetry/opentelemetry-java-examples/tree/main/declarative-configuration)
