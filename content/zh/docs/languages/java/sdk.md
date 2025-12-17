---
title: 使用 SDK 管理遥测数据
weight: 12
aliases: [exporters]
default_lang_commit: 6652551fda266f2edff5c60456a59e3bfcb5989f
drifted_from_default: true
cSpell:ignore: Interceptable Logback okhttp
---

<!-- markdownlint-disable blanks-around-fences -->
<?code-excerpt path-base="examples/java/configuration"?>

该 SDK 是 [API](../api/) 的内置参考实现，用于处理和导出由插桩 API 调用所生成的遥测数据。
本页是该 SDK 的概念概述，包含说明介绍、相关 Javadoc 链接、构件（artifact）坐标、程序化配置示例等内容。
有关 SDK 配置的详细信息（包括 [零代码 SDK 自动配置](../configuration/#zero-code-sdk-autoconfigure)），
请参阅 **[SDK 配置](../configuration/)**。

该 SDK 由以下顶级组件构成：

- [SdkTracerProvider](#sdktracerprovider)：`TracerProvider` 的 SDK 实现，包含用于采样、处理和导出 Span 的工具。
- [SdkMeterProvider](#sdkmeterprovider)：`MeterProvider` 的 SDK 实现，包含用于配置指标流以及读取、导出指标的工具。
- [SdkLoggerProvider](#sdkloggerprovider)：`LoggerProvider` 的 SDK 实现，包含用于处理和导出日志的工具。
- [TextMapPropagator](#textmappropagator)：跨进程边界传播上下文的组件。

这些组件被整合到 [OpenTelemetrySdk](#opentelemetrysdk) 中，
这是一个可便捷地将配置完备的 [SDK 组件](#sdk-components)传递给插桩工具的载体对象。
该 SDK 内置了多种组件，足以满足许多使用场景，并且支持通过[插件接口](#sdk-plugin-extension-interfaces)进行扩展。

## SDK 插件扩展接口 {#sdk-plugin-extension-interfaces}

当内置组件不足以满足需求时，可通过实现各种插件扩展接口来扩展 SDK 功能：

- [Sampler](#sampler): 配置哪些 Span 会被记录和采样。
- [SpanProcessor](#spanprocessor): 在 Span 开始和结束的时候对其进行处理。
- [SpanExporter](#spanexporter): 将 Span 导出到进程外部。
- [MetricReader](#metricreader): 读取聚合后的指标数据。
- [MetricExporter](#metricexporter): 将指标数据导出到进程外部。
- [LogRecordProcessor](#logrecordprocessor): 在日志记录发出时对其进行处理
- [LogRecordExporter](#logrecordexporter): 将日志记录导出到进程外部。
- [TextMapPropagator](#textmappropagator): 跨进程边界传播上下文。

## SDK 组件 {#sdk-components}

`io.opentelemetry:opentelemetry-sdk:{{% param vers.otel %}}` 构件（artifact） 包含 OpenTelemetry SDK。

以下章节将介绍该 SDK 中面向用户的核心组件。每个组件章节均包含：

- 一段简要说明，包含指向该组件类型 Javadoc 参考文档的链接。
- 如果该组件是一个[插件扩展接口](#sdk-plugin-extension-interfaces)，
  则包含一张列出可用的内置实现和 `opentelemetry-java-contrib` 实现的表格。
- [程序化配置](../configuration/#programmatic-configuration)的简单演示。
- 如果该组件是一个[插件扩展接口](#sdk-plugin-extension-interfaces)，则包含一个自定义实现的简单演示。

### OpenTelemetrySdk {#opentelemetrysdk}

[OpenTelemetrySdk](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-sdk/latest/io/opentelemetry/sdk/OpenTelemetrySdk.html)
是 [OpenTelemetry](../api/#opentelemetry) 的 SDK 实现。
它是顶级 SDK 组件的持有者，可便捷地将配置完备的 SDK 组件传递给插桩工具。

`OpenTelemetrySdk` 由应用所有者进行配置，且包含以下内容：

- [SdkTracerProvider](#sdktracerprovider): `TracerProvider` 的 SDK实现。
- [SdkMeterProvider](#sdkmeterprovider): `MeterProvider` 的 SDK实现。
- [SdkLoggerProvider](#sdkloggerprovider): `LoggerProvider` 的 SDK实现。
- [ContextPropagators](#textmappropagator): 跨进程边界传播上下文。

<!-- prettier-ignore-start -->
<?code-excerpt "src/main/java/otel/OpenTelemetrySdkConfig.java"?>
```java
package otel;

import io.opentelemetry.sdk.OpenTelemetrySdk;
import io.opentelemetry.sdk.resources.Resource;

public class OpenTelemetrySdkConfig {
  public static OpenTelemetrySdk create() {
    Resource resource = ResourceConfig.create();
    return OpenTelemetrySdk.builder()
        .setTracerProvider(SdkTracerProviderConfig.create(resource))
        .setMeterProvider(SdkMeterProviderConfig.create(resource))
        .setLoggerProvider(SdkLoggerProviderConfig.create(resource))
        .setPropagators(ContextPropagatorsConfig.create())
        .build();
  }
}
```
<!-- prettier-ignore-end -->

### Resource {#resource}

[Resource](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-sdk-common/latest/io/opentelemetry/sdk/resources/Resource.html)
是一组定义遥测数据源的属性。应用程序应将相同的资源与 [SdkTracerProvider](#sdktracerprovider)、
[SdkMeterProvider](#sdkmeterprovider)、 [SdkLoggerProvider](#sdkloggerprovider) 相关联。

{{% alert %}} [ResourceProviders](../configuration/#resourceprovider) 会根据环境为
[自动配置](../configuration/#zero-code-sdk-autoconfigure)的资源提供上下文信息。
有关可用 `ResourceProvider` 的列表，请参阅文档。{{% /alert %}}

以下代码片段展示了 `Resource` 的编程式配置：

<!-- prettier-ignore-start -->
<?code-excerpt "src/main/java/otel/ResourceConfig.java"?>
```java
package otel;

import io.opentelemetry.sdk.resources.Resource;
import io.opentelemetry.semconv.ServiceAttributes;

public class ResourceConfig {
  public static Resource create() {
    return Resource.getDefault().toBuilder()
        .put(ServiceAttributes.SERVICE_NAME, "my-service")
        .build();
  }
}
```
<!-- prettier-ignore-end -->

### SdkTracerProvider {#sdktracerprovider}

[SdkTracerProvider](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-sdk-trace/latest/io/opentelemetry/sdk/trace/SdkTracerProvider.html)
是 [TracerProvider](../api/#tracerprovider) 的 SDK 实现，
并负责处理由 API 生成的链路遥测数据。

`SdkTracerProvider` 由应用所有者进行配置，其包含：

- [Resource](#resource): Span 所关联的资源。
- [Sampler](#sampler): 配置哪些 Span 被记录和采样。
- [SpanProcessors](#spanprocessor): 在 Span 开始和结束的时候对其进行处理。
- [SpanExporters](#spanexporter): 将 Span 导出到进程外部（与相关联的 `SpanProcessor` 配合使用）。
- [SpanLimits](#spanlimits): 控制与 Span 相关联的数据的限制条件。

以下代码片段演示了 `SdkTracerProvider` 的编程式配置：

<!-- prettier-ignore-start -->
<?code-excerpt "src/main/java/otel/SdkTracerProviderConfig.java"?>
```java
package otel;

import io.opentelemetry.sdk.resources.Resource;
import io.opentelemetry.sdk.trace.SdkTracerProvider;

public class SdkTracerProviderConfig {
  public static SdkTracerProvider create(Resource resource) {
    return SdkTracerProvider.builder()
        .setResource(resource)
        .addSpanProcessor(
            SpanProcessorConfig.batchSpanProcessor(
                SpanExporterConfig.otlpHttpSpanExporter("http://localhost:4318/v1/spans")))
        .setSampler(SamplerConfig.parentBasedSampler(SamplerConfig.traceIdRatioBased(.25)))
        .setSpanLimits(SpanLimitsConfig::spanLimits)
        .build();
  }
}
```
<!-- prettier-ignore-end -->

#### Sampler {#sampler}

[Sampler](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-sdk-trace/latest/io/opentelemetry/sdk/trace/samplers/Sampler.html)
是一个[插件扩展接口](#sdk-plugin-extension-interfaces)，负责确定哪些 Span 会被记录和采样。

{{% alert %}} 默认情况下，`SdkTracerProvider` 配置了 `ParentBased(root=AlwaysOn)` 采样器。
这意味着，除非调用应用程序执行了采样操作，否则 100% 的 Span 都会被采样。
如果这种方式产生的信息过多或成本过高，可以更换采样器。 {{% /alert %}}

SDK 内置的以及社区在 opentelemetry-java-contrib 中维护的采样器包括：

| Class                     | Artifact                                                                                      | 描述                                                                                                |
| ------------------------- | --------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| `ParentBased`             | `io.opentelemetry:opentelemetry-sdk:{{% param vers.otel %}}`                                  | 根据父级 Span 的采样状态对 Span 进行采样。parent.                                                   |
| `AlwaysOn`                | `io.opentelemetry:opentelemetry-sdk:{{% param vers.otel %}}`                                  | 对所有 Span 进行采样。                                                                              |
| `AlwaysOff`               | `io.opentelemetry:opentelemetry-sdk:{{% param vers.otel %}}`                                  | 对所有 Span 进行丢弃。                                                                              |
| `TraceIdRatioBased`       | `io.opentelemetry:opentelemetry-sdk:{{% param vers.otel %}}`                                  | 根据可配置的比例对 Span 进行采样。                                                                  |
| `JaegerRemoteSampler`     | `io.opentelemetry:opentelemetry-sdk-extension-jaeger-remote-sampler:{{% param vers.otel %}}`  | 根据来自远程服务器的配置对 Span 进行采样。                                                          |
| `LinksBasedSampler`       | `io.opentelemetry.contrib:opentelemetry-samplers:{{% param vers.contrib %}}-alpha`            | 根据 Span 关联项的采样状态对其进行采样。                                                            |
| `RuleBasedRoutingSampler` | `io.opentelemetry.contrib:opentelemetry-samplers:{{% param vers.contrib %}}-alpha`            | 根据配置规则对 Span 进行采样。                                                                      |
| `ConsistentSamplers`      | `io.opentelemetry.contrib:opentelemetry-consistent-sampling:{{% param vers.contrib %}}-alpha` | 根据[概率采样](/docs/specs/otel/trace/tracestate-probability-sampling/)定义的各种一致性采样器实现。 |

以下代码片段展示了 `Sampler` 的编程式配置：

<!-- prettier-ignore-start -->
<?code-excerpt "src/main/java/otel/SamplerConfig.java"?>
```java
package otel;

import io.opentelemetry.sdk.extension.trace.jaeger.sampler.JaegerRemoteSampler;
import io.opentelemetry.sdk.trace.samplers.Sampler;
import java.time.Duration;

public class SamplerConfig {
  public static Sampler parentBasedSampler(Sampler root) {
    return Sampler.parentBasedBuilder(root)
        .setLocalParentNotSampled(Sampler.alwaysOff())
        .setLocalParentSampled(Sampler.alwaysOn())
        .setRemoteParentNotSampled(Sampler.alwaysOff())
        .setRemoteParentSampled(Sampler.alwaysOn())
        .build();
  }

  public static Sampler alwaysOn() {
    return Sampler.alwaysOn();
  }

  public static Sampler alwaysOff() {
    return Sampler.alwaysOff();
  }

  public static Sampler traceIdRatioBased(double ratio) {
    return Sampler.traceIdRatioBased(ratio);
  }

  public static Sampler jaegerRemoteSampler() {
    return JaegerRemoteSampler.builder()
        .setInitialSampler(Sampler.alwaysOn())
        .setEndpoint("http://endpoint")
        .setPollingInterval(Duration.ofSeconds(60))
        .setServiceName("my-service-name")
        .build();
  }
}
```
<!-- prettier-ignore-end -->

实现 `Sampler` 接口以提供自定义采样逻辑。例如：

<!-- prettier-ignore-start -->
<?code-excerpt "src/main/java/otel/CustomSampler.java"?>
```java
package otel;

import io.opentelemetry.api.common.Attributes;
import io.opentelemetry.api.trace.SpanKind;
import io.opentelemetry.context.Context;
import io.opentelemetry.sdk.trace.data.LinkData;
import io.opentelemetry.sdk.trace.samplers.Sampler;
import io.opentelemetry.sdk.trace.samplers.SamplingResult;
import java.util.List;

public class CustomSampler implements Sampler {
  @Override
  public SamplingResult shouldSample(
      Context parentContext,
      String traceId,
      String name,
      SpanKind spanKind,
      Attributes attributes,
      List<LinkData> parentLinks) {

    // 当 Span 启动时，任何 SpanProcessor 被调用之前触发的回调函数。
    // 如果采样决策为：
    // - DROP: Span 会被丢弃。此时会创建一个有效的 Span 上下文，且仍会调用 SpanProcessor#onStart 方法，
    // 但不会记录任何数据，也不会调用 SpanProcessor#onEnd 方法。
    // - RECORD_ONLY: Span 会被记录但不会被采样。数据会记录到 Span 中，
    // SpanProcessor#onStart 和 SpanProcessor#onEnd 方法都会被调用，
    // 但该 Span 的采样状态表明它不应被导出到进程外部。
    // - RECORD_AND_SAMPLE: Span 会被记录并采样。数据会记录到跨度中，
    // SpanProcessor#onStart 和 SpanProcessor#onEnd 方法都会被调用，
    // 且该 Span 的采样状态表明它应当被导出到进程外部。
    return SpanKind.SERVER == spanKind ? SamplingResult.recordAndSample() : SamplingResult.drop();
  }

  @Override
  public String getDescription() {
    // 返回这个采样器的描述信息。
    return this.getClass().getSimpleName();
  }
}
```
<!-- prettier-ignore-end -->

#### SpanProcessor {#spanprocessor}

[SpanProcessor](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-sdk-trace/latest/io/opentelemetry/sdk/trace/SpanProcessor.html)
是一个 [插件扩展接口](#sdk-plugin-extension-interfaces)，
包含在 Span 启动和结束时触发的回调函数。
它们通常与 [SpanExporters](#spanexporter) 配合使用，以将 Span 导出到进程外部，
但它们也有其他应用场景，例如数据增强。

SDK 内置的以及社区在 `opentelemetry-java-contrib` 中维护的 Span 处理器包括：

| Class                     | Artifact                                                                                    | 描述                                                      |
| ------------------------- | ------------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| `BatchSpanProcessor`      | `io.opentelemetry:opentelemetry-sdk:{{% param vers.otel %}}`                                | 批处理采样 Span，并通过可配置的 `SpanExporter` 导出它们。 |
| `SimpleSpanProcessor`     | `io.opentelemetry:opentelemetry-sdk:{{% param vers.otel %}}`                                | 通过可配置的 `SpanExporter` 导出每个经过采样的 Span。     |
| `BaggageSpanProcessor`    | `io.opentelemetry.contrib:opentelemetry-baggage-processor:{{% param vers.contrib %}}-alpha` | 使用 Baggage 增强 Span。                                  |
| `JfrSpanProcessor`        | `io.opentelemetry.contrib:opentelemetry-jfr-events:{{% param vers.contrib %}}-alpha`        | 根据 Span 创建 JFR 事件。                                 |
| `StackTraceSpanProcessor` | `io.opentelemetry.contrib:opentelemetry-span-stacktrace:{{% param vers.contrib %}}-alpha`   | 为选定的 Span 添加堆栈跟踪数据以增强其信息。              |
| `InferredSpansProcessor`  | `io.opentelemetry.contrib:opentelemetry-inferred-spans:{{% param vers.contrib %}}-alpha`    | 从异步分析器而非从插桩生成 Span。                         |

以下代码片段展示了 `SpanProcessor` 的编程式配置：

<!-- prettier-ignore-start -->
<?code-excerpt "src/main/java/otel/SpanProcessorConfig.java"?>
```java
package otel;

import io.opentelemetry.sdk.trace.SpanProcessor;
import io.opentelemetry.sdk.trace.export.BatchSpanProcessor;
import io.opentelemetry.sdk.trace.export.SimpleSpanProcessor;
import io.opentelemetry.sdk.trace.export.SpanExporter;
import java.time.Duration;

public class SpanProcessorConfig {
  public static SpanProcessor batchSpanProcessor(SpanExporter spanExporter) {
    return BatchSpanProcessor.builder(spanExporter)
        .setMaxQueueSize(2048)
        .setExporterTimeout(Duration.ofSeconds(30))
        .setScheduleDelay(Duration.ofSeconds(5))
        .build();
  }

  public static SpanProcessor simpleSpanProcessor(SpanExporter spanExporter) {
    return SimpleSpanProcessor.builder(spanExporter).build();
  }
}
```
<!-- prettier-ignore-end -->

实现 `SpanProcessor` 接口以提供你自己的自定义 Span 处理逻辑。例如：

<!-- prettier-ignore-start -->
<?code-excerpt "src/main/java/otel/CustomSpanProcessor.java"?>
```java
package otel;

import io.opentelemetry.context.Context;
import io.opentelemetry.sdk.common.CompletableResultCode;
import io.opentelemetry.sdk.trace.ReadWriteSpan;
import io.opentelemetry.sdk.trace.ReadableSpan;
import io.opentelemetry.sdk.trace.SpanProcessor;

public class CustomSpanProcessor implements SpanProcessor {

  @Override
  public void onStart(Context parentContext, ReadWriteSpan span) {
    // 当 Span 启动时触发的回调函数。
    // 为记录添加自定义属性以丰富其信息。
    span.setAttribute("my.custom.attribute", "hello world");
  }

  @Override
  public boolean isStartRequired() {
    // 指出是否应调用 onStart
    return true;
  }

  @Override
  public void onEnd(ReadableSpan span) {
    // 当 Span 结束时调用的回调函数。
  }

  @Override
  public boolean isEndRequired() {
    // 指出是否应调用 onEnd。
    return false;
  }

  @Override
  public CompletableResultCode shutdown() {
    // 可以选择关闭处理器（processor）并清理所有资源。
    return CompletableResultCode.ofSuccess();
  }

  @Override
  public CompletableResultCode forceFlush() {
    // 可以选择处理所有已排队但尚未处理的记录。
    return CompletableResultCode.ofSuccess();
  }
}
```
<!-- prettier-ignore-end -->

#### SpanExporter {#spanexporter}

[SpanExporter](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-sdk-trace/latest/io/opentelemetry/sdk/trace/export/SpanExporter.html)
是一种[插件扩展接口](#sdk-plugin-extension-interfaces)，负责将 Span 导出到进程外。它不直接向 `SdkTracerProvider` 注册，
而是与 [SpanProcessors](#spanprocessor) 配对使用（通常是 `BatchSpanProcessor`）。

SDK 内置的以及社区在 `opentelemetry-java-contrib` 中维护的 Span 导出器包括：

| Class                          | Artifact                                                                                 | 描述                                                                     |
| ------------------------------ | ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| `OtlpHttpSpanExporter` **[1]** | `io.opentelemetry:opentelemetry-exporter-otlp:{{% param vers.otel %}}`                   | 通过 OTLP `http/protobuf` 来导出 Span。                                  |
| `OtlpGrpcSpanExporter` **[1]** | `io.opentelemetry:opentelemetry-exporter-otlp:{{% param vers.otel %}}`                   | 通过 OTLP `grpc` 来导出 Span。                                           |
| `LoggingSpanExporter`          | `io.opentelemetry:opentelemetry-exporter-logging:{{% param vers.otel %}}`                | 以调试格式将 Span 记录到 JUL 中。                                        |
| `OtlpJsonLoggingSpanExporter`  | `io.opentelemetry:opentelemetry-exporter-logging-otlp:{{% param vers.otel %}}`           | 以 OTLP JSON 编码格式将 Span 记录到 JUL 中。                             |
| `OtlpStdoutSpanExporter`       | `io.opentelemetry:opentelemetry-exporter-logging-otlp:{{% param vers.otel %}}`           | 以 OTLP [JSON 文件编码][]（实验性） 将 Span 格式记录到 `System.out` 中。 |
| `ZipkinSpanExporter`           | `io.opentelemetry:opentelemetry-exporter-zipkin:{{% param vers.otel %}}`                 | 将 Span 导出到 Zipkin。                                                  |
| `InterceptableSpanExporter`    | `io.opentelemetry.contrib:opentelemetry-processors:{{% param vers.contrib %}}-alpha`     | 在导出前将 Span 传递给灵活的拦截器。                                     |
| `KafkaSpanExporter`            | `io.opentelemetry.contrib:opentelemetry-kafka-exporter:{{% param vers.contrib %}}-alpha` | 通过写入 Kafka topic 来导出 Span。                                       |

**[1]**： 有关实现细节请参见 [OTLP 导出器](#otlp-exporters)。

以下代码片段演示了 `SpanExporter` 的编程式配置：

<!-- prettier-ignore-start -->
<?code-excerpt "src/main/java/otel/SpanExporterConfig.java"?>
```java
package otel;

import io.opentelemetry.exporter.logging.LoggingSpanExporter;
import io.opentelemetry.exporter.logging.otlp.OtlpJsonLoggingSpanExporter;
import io.opentelemetry.exporter.otlp.http.trace.OtlpHttpSpanExporter;
import io.opentelemetry.exporter.otlp.trace.OtlpGrpcSpanExporter;
import io.opentelemetry.sdk.trace.export.SpanExporter;
import java.time.Duration;

public class SpanExporterConfig {
  public static SpanExporter otlpHttpSpanExporter(String endpoint) {
    return OtlpHttpSpanExporter.builder()
        .setEndpoint(endpoint)
        .addHeader("api-key", "value")
        .setTimeout(Duration.ofSeconds(10))
        .build();
  }

  public static SpanExporter otlpGrpcSpanExporter(String endpoint) {
    return OtlpGrpcSpanExporter.builder()
        .setEndpoint(endpoint)
        .addHeader("api-key", "value")
        .setTimeout(Duration.ofSeconds(10))
        .build();
  }

  public static SpanExporter logginSpanExporter() {
    return LoggingSpanExporter.create();
  }

  public static SpanExporter otlpJsonLoggingSpanExporter() {
    return OtlpJsonLoggingSpanExporter.create();
  }
}
```
<!-- prettier-ignore-end -->

实现 `SpanExporter` 接口以提供你专属的自定义的 Span 导出逻辑。例如：

<!-- prettier-ignore-start -->
<?code-excerpt "src/main/java/otel/CustomSpanExporter.java"?>
```java
package otel;

import io.opentelemetry.sdk.common.CompletableResultCode;
import io.opentelemetry.sdk.trace.data.SpanData;
import io.opentelemetry.sdk.trace.export.SpanExporter;
import java.util.Collection;
import java.util.logging.Level;
import java.util.logging.Logger;

public class CustomSpanExporter implements SpanExporter {

  private static final Logger logger = Logger.getLogger(CustomSpanExporter.class.getName());

  @Override
  public CompletableResultCode export(Collection<SpanData> spans) {
    // 导出这些记录。通常情况下，记录会通过某种网络协议发送到进程外，但为了演示说明我们仅进行日志记录。
    logger.log(Level.INFO, "Exporting spans");
    spans.forEach(span -> logger.log(Level.INFO, "Span: " + span));
    return CompletableResultCode.ofSuccess();
  }

  @Override
  public CompletableResultCode flush() {
    // 导出所有已排队但尚未导出的记录。
    logger.log(Level.INFO, "flushing");
    return CompletableResultCode.ofSuccess();
  }

  @Override
  public CompletableResultCode shutdown() {
    // 关闭导出器并清理所有资源。
    logger.log(Level.INFO, "shutting down");
    return CompletableResultCode.ofSuccess();
  }
}
```
<!-- prettier-ignore-end -->

#### SpanLimits {#spanlimits}

[SpanLimits](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-sdk-trace/latest/io/opentelemetry/sdk/trace/SpanLimits.html)
定义了对 Span 所捕获数据的约束，包括最大属性长度、最大属性数量等。

以下代码片段演示了 `SpanLimits` 的编程式配置：

<!-- prettier-ignore-start -->
<?code-excerpt "src/main/java/otel/SpanLimitsConfig.java"?>
```java
package otel;

import io.opentelemetry.sdk.trace.SpanLimits;

public class SpanLimitsConfig {
  public static SpanLimits spanLimits() {
    return SpanLimits.builder()
        .setMaxNumberOfAttributes(128)
        .setMaxAttributeValueLength(1024)
        .setMaxNumberOfLinks(128)
        .setMaxNumberOfAttributesPerLink(128)
        .setMaxNumberOfEvents(128)
        .setMaxNumberOfAttributesPerEvent(128)
        .build();
  }
}
```
<!-- prettier-ignore-end -->

### SdkMeterProvider {#sdkmeterprovider}

[SdkMeterProvider](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-sdk-metrics/latest/io/opentelemetry/sdk/metrics/SdkMeterProvider.html)
是 [MeterProvider](../api/#meterprovider) 的 SDK 实现，负责处理由 API 生成的指标遥测数据。

`SdkMeterProvider` 由应用程序所有者配置，它包含以下部分：

- [Resource](#resource): 指标数据与资源相关联。
- [MetricReader](#metricreader): 读取指标数据的聚合状态。
  - 可以选择配合 [CardinalityLimitSelector](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-sdk-metrics/latest/io/opentelemetry/sdk/metrics/export/CardinalityLimitSelector.html)，
    按仪表（instrument）类型覆盖基数限制。
    若未设置，则在每个收集周期内，每个仪表的属性唯一组合数上限为 2000。
    基数限制也可通过 [views](#views) 为单个仪表进行配置。
    更多详情请见[基数限制](/docs/specs/otel/metrics/sdk/#cardinality-limits)
- [MetricExporter](#metricexporter): 将指标数据导出到进程外（需与关联的 `MetricReader` 配合使用）。
- [Views](#views): 配置指标数据流，包括丢弃未使用的指标数据。

<!-- prettier-ignore-start -->
<?code-excerpt "src/main/java/otel/SdkMeterProviderConfig.java"?>
```java
package otel;

import io.opentelemetry.sdk.metrics.SdkMeterProvider;
import io.opentelemetry.sdk.metrics.SdkMeterProviderBuilder;
import io.opentelemetry.sdk.resources.Resource;
import java.util.List;
import java.util.Set;

public class SdkMeterProviderConfig {
  public static SdkMeterProvider create(Resource resource) {
    SdkMeterProviderBuilder builder =
        SdkMeterProvider.builder()
            .setResource(resource)
            .registerMetricReader(
                MetricReaderConfig.periodicMetricReader(
                    MetricExporterConfig.otlpHttpMetricExporter(
                        "http://localhost:4318/v1/metrics")));
    // 取消注释，即可选择性地注册带有基数限制的 MetricReader。
    // builder.registerMetricReader(
    //     MetricReaderConfig.periodicMetricReader(
    //         MetricExporterConfig.otlpHttpMetricExporter("http://localhost:4318/v1/metrics")),
    //     instrumentType -> 100);

    ViewConfig.dropMetricView(builder, "some.custom.metric");
    ViewConfig.histogramBucketBoundariesView(
        builder, "http.server.request.duration", List.of(1.0, 5.0, 10.0));
    ViewConfig.attributeFilterView(
        builder, "http.client.request.duration", Set.of("http.request.method"));
    ViewConfig.cardinalityLimitsView(builder, "http.server.active_requests", 100);
    return builder.build();
  }
}
```
<!-- prettier-ignore-end -->

#### MetricReader {#metricreader}

[MetricReader](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-sdk-metrics/latest/io/opentelemetry/sdk/metrics/export/MetricReader.html)
是一个[插件扩展接口](#sdk-plugin-extension-interfaces) ，负责读取聚合后的指标数据。
它们通常与 [MetricExporters](#metricexporter) 配合使用，将指标数据导出到进程外，
不过也可用于通过基于拉取的协议向外部抓取工具提供指标数据。

SDK 中内置的并由社区在 `opentelemetry-java-contrib` 中维护的指标读取器包括：

| Class                  | Artifact                                                                           | 描述                                                             |
| ---------------------- | ---------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| `PeriodicMetricReader` | `io.opentelemetry:opentelemetry-sdk:{{% param vers.otel %}}`                       | 定期读取度量数据，并通过可配置的 `MetricExporter` 导出这些数据。 |
| `PrometheusHttpServer` | `io.opentelemetry:opentelemetry-exporter-prometheus:{{% param vers.otel %}}-alpha` | 在 HTTP 服务器上以多种 Prometheus 格式提供度量数据。             |

以下代码片段演示了 `MetricReader` 的编程式配置：

<!-- prettier-ignore-start -->
<?code-excerpt "src/main/java/otel/MetricReaderConfig.java"?>
```java
package otel;

import io.opentelemetry.exporter.prometheus.PrometheusHttpServer;
import io.opentelemetry.sdk.metrics.export.MetricExporter;
import io.opentelemetry.sdk.metrics.export.MetricReader;
import io.opentelemetry.sdk.metrics.export.PeriodicMetricReader;
import java.time.Duration;

public class MetricReaderConfig {
  public static MetricReader periodicMetricReader(MetricExporter metricExporter) {
    return PeriodicMetricReader.builder(metricExporter).setInterval(Duration.ofSeconds(60)).build();
  }

  public static MetricReader prometheusMetricReader() {
    return PrometheusHttpServer.builder().setHost("localhost").setPort(9464).build();
  }
}
```
<!-- prettier-ignore-end -->

实现 `MetricReader` 接口，以提供你的自定义的指标阅读器逻辑。例如：

<!-- prettier-ignore-start -->
<?code-excerpt "src/main/java/otel/CustomMetricReader.java"?>
```java
package otel;

import io.opentelemetry.sdk.common.CompletableResultCode;
import io.opentelemetry.sdk.common.export.MemoryMode;
import io.opentelemetry.sdk.metrics.Aggregation;
import io.opentelemetry.sdk.metrics.InstrumentType;
import io.opentelemetry.sdk.metrics.data.AggregationTemporality;
import io.opentelemetry.sdk.metrics.export.AggregationTemporalitySelector;
import io.opentelemetry.sdk.metrics.export.CollectionRegistration;
import io.opentelemetry.sdk.metrics.export.MetricReader;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicReference;
import java.util.logging.Level;
import java.util.logging.Logger;

public class CustomMetricReader implements MetricReader {

  private static final Logger logger = Logger.getLogger(CustomMetricExporter.class.getName());

  private final ScheduledExecutorService executorService = Executors.newScheduledThreadPool(1);
  private final AtomicReference<CollectionRegistration> collectionRef =
      new AtomicReference<>(CollectionRegistration.noop());

  @Override
  public void register(CollectionRegistration collectionRegistration) {
    // 当 SdkMeterProvider 初始化时会调用此回调函数，该回调提供一个用于收集指标数据的句柄。
    collectionRef.set(collectionRegistration);
    executorService.scheduleWithFixedDelay(this::collectMetrics, 0, 60, TimeUnit.SECONDS);
  }

  private void collectMetrics() {
    // 收集指标数据。通常，记录会通过某种网络协议发送到进程外，但为了演示说明我们仅进行日志记录。
    logger.log(Level.INFO, "Collecting metrics");
    collectionRef
        .get()
        .collectAllMetrics()
        .forEach(metric -> logger.log(Level.INFO, "Metric: " + metric));
  }

  @Override
  public CompletableResultCode forceFlush() {
    // 导出所有已排队但尚未导出的记录。
    logger.log(Level.INFO, "flushing");
    return CompletableResultCode.ofSuccess();
  }

  @Override
  public CompletableResultCode shutdown() {
    // 关闭导出器并清理所有资源。
    logger.log(Level.INFO, "shutting down");
    return CompletableResultCode.ofSuccess();
  }

  @Override
  public AggregationTemporality getAggregationTemporality(InstrumentType instrumentType) {
    // 根据一个仪表类型的函数指定所需的聚合时间范围（temporality）。
    return AggregationTemporalitySelector.deltaPreferred()
        .getAggregationTemporality(instrumentType);
  }

  @Override
  public MemoryMode getMemoryMode() {
    // 可以选择指定内存模式，用于表明指标记录是否可以被重用或必须保持不可变。
    return MemoryMode.REUSABLE_DATA;
  }

  @Override
  public Aggregation getDefaultAggregation(InstrumentType instrumentType) {
    // 可以选择根据仪表类型指定默认的聚合方式。
    return Aggregation.defaultAggregation();
  }
}
```
<!-- prettier-ignore-end -->

#### MetricExporter {#metricexporter}

[MetricExporter](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-sdk-metrics/latest/io/opentelemetry/sdk/metrics/export/MetricExporter.html)
是一个[插件扩展接口](#sdk-plugin-extension-interfaces) ，负责将指标数据导出到进程外。
它们并非直接注册到 `SdkMeterProvider`，而是与 [PeriodicMetricReader](#metricreader) 配对使用。

SDK 内置的以及社区在 `opentelemetry-java-contrib` 中维护的指标导出器包括：

| Class                            | Artifact                                                                             | 描述                                                             |
| -------------------------------- | ------------------------------------------------------------------------------------ | ---------------------------------------------------------------- |
| `OtlpHttpMetricExporter` **[1]** | `io.opentelemetry:opentelemetry-exporter-otlp:{{% param vers.otel %}}`               | 通过 OTLP `http/protobuf` 导出指标。                             |
| `OtlpGrpcMetricExporter` **[1]** | `io.opentelemetry:opentelemetry-exporter-otlp:{{% param vers.otel %}}`               | 通过 OTLP `grpc` 导出指标。                                      |
| `LoggingMetricExporter`          | `io.opentelemetry:opentelemetry-exporter-logging:{{% param vers.otel %}}`            | 将指标以 Debug 格式记录到 JUL 中。                               |
| `OtlpJsonLoggingMetricExporter`  | `io.opentelemetry:opentelemetry-exporter-logging-otlp:{{% param vers.otel %}}`       | 将指标以 OTLP JSON 格式记录到 JUL 中。                           |
| `OtlpStdoutMetricExporter`       | `io.opentelemetry:opentelemetry-exporter-logging-otlp:{{% param vers.otel %}}`       | 将指标以 OTLP [JSON 文件编码]（实验性） 记录到 `System.out` 中。 |
| `InterceptableMetricExporter`    | `io.opentelemetry.contrib:opentelemetry-processors:{{% param vers.contrib %}}-alpha` | 在导出前将度量数据传递给灵活的拦截器。                           |

**[1]**: 实现细节请见 [OTLP 导出器](#otlp-exporters)。

以下代码片段演示了 `MetricExporter` 的编程式配置：

<!-- prettier-ignore-start -->
<?code-excerpt "src/main/java/otel/MetricExporterConfig.java"?>
```java
package otel;

import io.opentelemetry.exporter.logging.LoggingMetricExporter;
import io.opentelemetry.exporter.logging.otlp.OtlpJsonLoggingMetricExporter;
import io.opentelemetry.exporter.otlp.http.metrics.OtlpHttpMetricExporter;
import io.opentelemetry.exporter.otlp.metrics.OtlpGrpcMetricExporter;
import io.opentelemetry.sdk.metrics.export.MetricExporter;
import java.time.Duration;

public class MetricExporterConfig {
  public static MetricExporter otlpHttpMetricExporter(String endpoint) {
    return OtlpHttpMetricExporter.builder()
        .setEndpoint(endpoint)
        .addHeader("api-key", "value")
        .setTimeout(Duration.ofSeconds(10))
        .build();
  }

  public static MetricExporter otlpGrpcMetricExporter(String endpoint) {
    return OtlpGrpcMetricExporter.builder()
        .setEndpoint(endpoint)
        .addHeader("api-key", "value")
        .setTimeout(Duration.ofSeconds(10))
        .build();
  }

  public static MetricExporter logginMetricExporter() {
    return LoggingMetricExporter.create();
  }

  public static MetricExporter otlpJsonLoggingMetricExporter() {
    return OtlpJsonLoggingMetricExporter.create();
  }
}
```
<!-- prettier-ignore-end -->

实现 `MetricExporter` 接口以提供自定义的指标导出逻辑。例如：

<!-- prettier-ignore-start -->
<?code-excerpt "src/main/java/otel/CustomMetricExporter.java"?>
```java
package otel;

import io.opentelemetry.sdk.common.CompletableResultCode;
import io.opentelemetry.sdk.common.export.MemoryMode;
import io.opentelemetry.sdk.metrics.Aggregation;
import io.opentelemetry.sdk.metrics.InstrumentType;
import io.opentelemetry.sdk.metrics.data.AggregationTemporality;
import io.opentelemetry.sdk.metrics.data.MetricData;
import io.opentelemetry.sdk.metrics.export.AggregationTemporalitySelector;
import io.opentelemetry.sdk.metrics.export.MetricExporter;
import java.util.Collection;
import java.util.logging.Level;
import java.util.logging.Logger;

public class CustomMetricExporter implements MetricExporter {

  private static final Logger logger = Logger.getLogger(CustomMetricExporter.class.getName());

  @Override
  public CompletableResultCode export(Collection<MetricData> metrics) {
    // 导出指标记录。通常，记录通过某种网络协议发送到进程外，但为了演示说明我们仅进行日志记录。
    logger.log(Level.INFO, "Exporting metrics");
    metrics.forEach(metric -> logger.log(Level.INFO, "Metric: " + metric));
    return CompletableResultCode.ofSuccess();
  }

  @Override
  public CompletableResultCode flush() {
    // 导出任何已排队但未导出的记录。
    logger.log(Level.INFO, "flushing");
    return CompletableResultCode.ofSuccess();
  }

  @Override
  public CompletableResultCode shutdown() {
    // 关闭导出器并清理任何资源。
    logger.log(Level.INFO, "shutting down");
    return CompletableResultCode.ofSuccess();
  }

  @Override
  public AggregationTemporality getAggregationTemporality(InstrumentType instrumentType) {
    // 为仪表类型指定所需的聚合时间范围（temporality）。
    return AggregationTemporalitySelector.deltaPreferred()
        .getAggregationTemporality(instrumentType);
  }

  @Override
  public MemoryMode getMemoryMode() {
    // 可以选择指定内存模式，指示指标记录是否可以重用或必须是不可变的。
    return MemoryMode.REUSABLE_DATA;
  }

  @Override
  public Aggregation getDefaultAggregation(InstrumentType instrumentType) {
    // 可以选择根据仪表类型指定默认聚合方式。
    return Aggregation.defaultAggregation();
  }
}
```
<!-- prettier-ignore-end -->

#### Views {#views}

[Views](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-sdk-metrics/latest/io/opentelemetry/sdk/metrics/View.html)
允许自定义指标流，包括更改指标名称、指标描述、指标聚合方式（例如，直方图桶边界）、要保留的属性键集合、基数（cardinality）限制等。

{{% alert %}} 当多个视图匹配某个特定仪表时，视图会表现出一定程度不符合直觉的行为。
如果一个匹配的视图更改了指标名称，而另一个匹配的视图更改了指标聚合方式，
你可能会期望名称和聚合方式都会被更改，但实际情况并非如此。
相反，会生成两个指标流：一个使用配置的指标名称和默认聚合方式，另一个使用原始指标名称和配置的聚合方式。
换句话说，匹配的视图**不会合并**。为获得最佳效果，请配置具有精确选择条件的视图（即仅选择单个特定的仪表）。
{{% /alert %}}

以下代码片段演示了 `View` 的编程式配置：

<!-- prettier-ignore-start -->
<?code-excerpt "src/main/java/otel/ViewConfig.java"?>
```java
package otel;

import io.opentelemetry.sdk.metrics.Aggregation;
import io.opentelemetry.sdk.metrics.InstrumentSelector;
import io.opentelemetry.sdk.metrics.SdkMeterProviderBuilder;
import io.opentelemetry.sdk.metrics.View;
import java.util.List;
import java.util.Set;

public class ViewConfig {
  public static SdkMeterProviderBuilder dropMetricView(
      SdkMeterProviderBuilder builder, String metricName) {
    return builder.registerView(
        InstrumentSelector.builder().setName(metricName).build(),
        View.builder().setAggregation(Aggregation.drop()).build());
  }

  public static SdkMeterProviderBuilder histogramBucketBoundariesView(
      SdkMeterProviderBuilder builder, String metricName, List<Double> bucketBoundaries) {
    return builder.registerView(
        InstrumentSelector.builder().setName(metricName).build(),
        View.builder()
            .setAggregation(Aggregation.explicitBucketHistogram(bucketBoundaries))
            .build());
  }

  public static SdkMeterProviderBuilder attributeFilterView(
      SdkMeterProviderBuilder builder, String metricName, Set<String> keysToRetain) {
    return builder.registerView(
        InstrumentSelector.builder().setName(metricName).build(),
        View.builder().setAttributeFilter(keysToRetain).build());
  }

  public static SdkMeterProviderBuilder cardinalityLimitsView(
      SdkMeterProviderBuilder builder, String metricName, int cardinalityLimit) {
    return builder.registerView(
        InstrumentSelector.builder().setName(metricName).build(),
        View.builder().setCardinalityLimit(cardinalityLimit).build());
  }
}
```
<!-- prettier-ignore-end -->

### SdkLoggerProvider {#sdkloggerprovider}

[SdkLoggerProvider](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-sdk-logs/latest/io/opentelemetry/sdk/logs/SdkLoggerProvider.html)
是 [LoggerProvider](../api/#loggerprovider) 的 SDK 实现，负责处理由日志桥接 API 生成的日志日志遥测数据。

`SdkLoggerProvider` 由应用程序所有者配置，它包含以下部分：

- [Resource](#resource): 日志与资源相关联。
- [LogRecordProcessor](#logrecordprocessor): 在日志被输出时对其进行处理。
- [LogRecordExporter](#logrecordexporter): （结合关联的 `LogRecordProcessor`）将日志导出到进程外。
- [LogLimits](#loglimits): 控制与日志关联的数据限制。

以下代码片段演示了 `SdkLoggerProvider` 的编程式配置：

<!-- prettier-ignore-start -->
<?code-excerpt "src/main/java/otel/SdkLoggerProviderConfig.java"?>
```java
package otel;

import io.opentelemetry.sdk.logs.SdkLoggerProvider;
import io.opentelemetry.sdk.resources.Resource;

public class SdkLoggerProviderConfig {
  public static SdkLoggerProvider create(Resource resource) {
    return SdkLoggerProvider.builder()
        .setResource(resource)
        .addLogRecordProcessor(
            LogRecordProcessorConfig.batchLogRecordProcessor(
                LogRecordExporterConfig.otlpHttpLogRecordExporter("http://localhost:4318/v1/logs")))
        .setLogLimits(LogLimitsConfig::logLimits)
        .build();
  }
}
```
<!-- prettier-ignore-end -->

#### LogRecordProcessor {#logrecordprocessor}

[LogRecordProcessor](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-sdk-logs/latest/io/opentelemetry/sdk/logs/LogRecordProcessor.html)
是一个[插件扩展接口](#sdk-plugin-extension-interfaces) ，当日志被输出时会调用一个回调函数。
它们通常与 [LogRecordExporters](#logrecordexporter) 配对使用，将日志导出到进程外，
但也有其他应用场景，比如数据增强。

SDK 内置的日志记录处理器和社区维护的 `opentelemetry-java-contrib` 中的日志记录处理器包括：

| Class                      | Artifact                                                                             | 描述                                                                    |
| -------------------------- | ------------------------------------------------------------------------------------ | ----------------------------------------------------------------------- |
| `BatchLogRecordProcessor`  | `io.opentelemetry:opentelemetry-sdk:{{% param vers.otel %}}`                         | 它会对日志记录进行批处理，并通过可配置的 `LogRecordExporter` 将其导出。 |
| `SimpleLogRecordProcessor` | `io.opentelemetry:opentelemetry-sdk:{{% param vers.otel %}}`                         | 它会通过可配置的 `LogRecordExporter` 逐条导出每条日志记录。             |
| `EventToSpanEventBridge`   | `io.opentelemetry.contrib:opentelemetry-processors:{{% param vers.contrib %}}-alpha` | 将事件类日志记录为当前 Span 上的 Span 事件。                            |

以下代码片段演示了 `LogRecordProcessor` 的编程式配置：

<!-- prettier-ignore-start -->
<?code-excerpt "src/main/java/otel/LogRecordProcessorConfig.java"?>
```java
package otel;

import io.opentelemetry.sdk.logs.LogRecordProcessor;
import io.opentelemetry.sdk.logs.export.BatchLogRecordProcessor;
import io.opentelemetry.sdk.logs.export.LogRecordExporter;
import io.opentelemetry.sdk.logs.export.SimpleLogRecordProcessor;
import java.time.Duration;

public class LogRecordProcessorConfig {
  public static LogRecordProcessor batchLogRecordProcessor(LogRecordExporter logRecordExporter) {
    return BatchLogRecordProcessor.builder(logRecordExporter)
        .setMaxQueueSize(2048)
        .setExporterTimeout(Duration.ofSeconds(30))
        .setScheduleDelay(Duration.ofSeconds(1))
        .build();
  }

  public static LogRecordProcessor simpleLogRecordProcessor(LogRecordExporter logRecordExporter) {
    return SimpleLogRecordProcessor.create(logRecordExporter);
  }
}
```
<!-- prettier-ignore-end -->

实现 `LogRecordProcessor` 接口以提供自定义的日志处理逻辑。例如：

<!-- prettier-ignore-start -->
<?code-excerpt "src/main/java/otel/CustomLogRecordProcessor.java"?>
```java
package otel;

import io.opentelemetry.api.common.AttributeKey;
import io.opentelemetry.context.Context;
import io.opentelemetry.sdk.common.CompletableResultCode;
import io.opentelemetry.sdk.logs.LogRecordProcessor;
import io.opentelemetry.sdk.logs.ReadWriteLogRecord;

public class CustomLogRecordProcessor implements LogRecordProcessor {

  @Override
  public void onEmit(Context context, ReadWriteLogRecord logRecord) {
    // 当日志记录被输出时调用的回调函数。
    // 为记录添加自定义属性以丰富其信息。
    logRecord.setAttribute(AttributeKey.stringKey("my.custom.attribute"), "hello world");
  }

  @Override
  public CompletableResultCode shutdown() {
    // 可选地关闭处理器并清理任何资源。
    return CompletableResultCode.ofSuccess();
  }

  @Override
  public CompletableResultCode forceFlush() {
    // 可选地处理所有已加入队列但尚未被处理的记录。
    return CompletableResultCode.ofSuccess();
  }
}
```
<!-- prettier-ignore-end -->

#### LogRecordExporter {#logrecordexporter}

[LogRecordExporter](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-sdk-logs/latest/io/opentelemetry/sdk/logs/export/LogRecordExporter.html)
是一个[插件扩展接口](#sdk-plugin-extension-interfaces) ，负责将日志记录导出到进程外。
与 `SdkLoggerProvider` 直接注册不同，它们与 [LogRecordProcessors](#logrecordprocessor) 配对使用
（通常是 `BatchLogRecordProcessor`）。

SDK 内置的日志记录导出器和社区维护的 `opentelemetry-java-contrib` 中的日志记录导出器包括：

| Class                                      | Artifact                                                                             | 描述                                                           |
| ------------------------------------------ | ------------------------------------------------------------------------------------ | -------------------------------------------------------------- |
| `OtlpHttpLogRecordExporter` **[1]**        | `io.opentelemetry:opentelemetry-exporter-otlp:{{% param vers.otel %}}`               | 通过 OTLP `http/protobuf` 导出日志记录。                       |
| `OtlpGrpcLogRecordExporter` **[1]**        | `io.opentelemetry:opentelemetry-exporter-otlp:{{% param vers.otel %}}`               | 通过 OTLP `grpc` 导出日志记录。                                |
| `SystemOutLogRecordExporter`               | `io.opentelemetry:opentelemetry-exporter-logging:{{% param vers.otel %}}`            | 将日志记录以 Debug 格式输出到系统标准输出。                    |
| `OtlpJsonLoggingLogRecordExporter` **[2]** | `io.opentelemetry:opentelemetry-exporter-logging-otlp:{{% param vers.otel %}}`       | 通过 OTLP JSON 编码将日志记录输出到 JUL。                      |
| `OtlpStdoutLogRecordExporter`              | `io.opentelemetry:opentelemetry-exporter-logging-otlp:{{% param vers.otel %}}`       | 将日志记录以 OTLP JSON 文件编码输出到 `System.out`（实验性）。 |
| `InterceptableLogRecordExporter`           | `io.opentelemetry.contrib:opentelemetry-processors:{{% param vers.contrib %}}-alpha` | 在导出前将日志记录传递给一个灵活的拦截器。                     |

**[1]**: 实现细节请见 [OTLP exporters](#otlp-exporters)。

**[2]**: `OtlpJsonLoggingLogRecordExporter` 会将日志记录到 JUL，
并可能导致无限循环（即 JUL -> SLF4J -> Logback -> OpenTelemetry Appender -> OpenTelemetry Log SDK -> JUL），
如果未正确配置。

以下代码片段演示了 `LogRecordExporter` 的编程式配置：

<!-- prettier-ignore-start -->
<?code-excerpt "src/main/java/otel/LogRecordExporterConfig.java"?>
```java
package otel;

import io.opentelemetry.exporter.logging.SystemOutLogRecordExporter;
import io.opentelemetry.exporter.logging.otlp.OtlpJsonLoggingLogRecordExporter;
import io.opentelemetry.exporter.otlp.http.logs.OtlpHttpLogRecordExporter;
import io.opentelemetry.exporter.otlp.logs.OtlpGrpcLogRecordExporter;
import io.opentelemetry.sdk.logs.export.LogRecordExporter;
import java.time.Duration;

public class LogRecordExporterConfig {
  public static LogRecordExporter otlpHttpLogRecordExporter(String endpoint) {
    return OtlpHttpLogRecordExporter.builder()
        .setEndpoint(endpoint)
        .addHeader("api-key", "value")
        .setTimeout(Duration.ofSeconds(10))
        .build();
  }

  public static LogRecordExporter otlpGrpcLogRecordExporter(String endpoint) {
    return OtlpGrpcLogRecordExporter.builder()
        .setEndpoint(endpoint)
        .addHeader("api-key", "value")
        .setTimeout(Duration.ofSeconds(10))
        .build();
  }

  public static LogRecordExporter systemOutLogRecordExporter() {
    return SystemOutLogRecordExporter.create();
  }

  public static LogRecordExporter otlpJsonLoggingLogRecordExporter() {
    return OtlpJsonLoggingLogRecordExporter.create();
  }
}
```
<!-- prettier-ignore-end -->

实现 `LogRecordExporter` 接口以提供自定义的日志记录导出逻辑。例如：

<!-- prettier-ignore-start -->
<?code-excerpt "src/main/java/otel/CustomLogRecordExporter.java"?>
```java
package otel;

import io.opentelemetry.sdk.common.CompletableResultCode;
import io.opentelemetry.sdk.logs.data.LogRecordData;
import io.opentelemetry.sdk.logs.export.LogRecordExporter;
import java.util.Collection;
import java.util.logging.Level;
import java.util.logging.Logger;

public class CustomLogRecordExporter implements LogRecordExporter {

  private static final Logger logger = Logger.getLogger(CustomLogRecordExporter.class.getName());

  @Override
  public CompletableResultCode export(Collection<LogRecordData> logs) {
    // 导出日志记录。通常，记录通过某种网络协议发送到进程外，但为了演示说明我们仅进行日志记录。
    System.out.println("Exporting logs");
    logs.forEach(log -> System.out.println("log record: " + log));
    return CompletableResultCode.ofSuccess();
  }

  @Override
  public CompletableResultCode flush() {
    // 导出任何已加入队列但尚未导出的记录。
    logger.log(Level.INFO, "flushing");
    return CompletableResultCode.ofSuccess();
  }

  @Override
  public CompletableResultCode shutdown() {
    // 关闭导出器并清理任何资源。
    logger.log(Level.INFO, "shutting down");
    return CompletableResultCode.ofSuccess();
  }
}
```
<!-- prettier-ignore-end -->

#### LogLimits {#loglimits}

[LogLimits](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-sdk-logs/latest/io/opentelemetry/sdk/logs/LogLimits.html)
定义了日志记录所捕获数据的约束条件，包括最大属性长度和最大属性数量。

以下代码片段演示了 `LogLimits` 的编程式配置：

<!-- prettier-ignore-start -->
<?code-excerpt "src/main/java/otel/LogLimitsConfig.java"?>
```java
package otel;

import io.opentelemetry.sdk.logs.LogLimits;

public class LogLimitsConfig {
  public static LogLimits logLimits() {
    return LogLimits.builder()
        .setMaxNumberOfAttributes(128)
        .setMaxAttributeValueLength(1024)
        .build();
  }
}
```
<!-- prettier-ignore-end -->

### TextMapPropagator {#textmappropagator}

[TextMapPropagator](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-context/latest/io/opentelemetry/context/propagation/TextMapPropagator.html)
是一个 [插件扩展接口](#sdk-plugin-extension-interfaces)，负责在文本格式中跨进程边界传播上下文。

SDK 内置的 TextMapPropagators 以及社区维护的 `opentelemetry-java-contrib` 中的 TextMapPropagators 包括：

| Class                       | Artifact                                                                                      | Description                                         |
| --------------------------- | --------------------------------------------------------------------------------------------- | --------------------------------------------------- |
| `W3CTraceContextPropagator` | `io.opentelemetry:opentelemetry-api:{{% param vers.otel %}}`                                  | 使用 W3C 追踪上下文传播协议来传播追踪上下文。       |
| `W3CBaggagePropagator`      | `io.opentelemetry:opentelemetry-api:{{% param vers.otel %}}`                                  | 使用 W3C baggage 传播协议来传播 baggage。           |
| `MultiTextMapPropagator`    | `io.opentelemetry:opentelemetry-context:{{% param vers.otel %}}`                              | 组合多个传播器。                                    |
| `JaegerPropagator`          | `io.opentelemetry:opentelemetry-extension-trace-propagators:{{% param vers.otel %}}`          | 使用 Jaeger 传播协议来传播追踪上下文。              |
| `B3Propagator`              | `io.opentelemetry:opentelemetry-extension-trace-propagators:{{% param vers.otel %}}`          | 使用 B3 传播协议来传播追踪上下文。                  |
| `OtTracePropagator`         | `io.opentelemetry:opentelemetry-extension-trace-propagators:{{% param vers.otel %}}`          | 使用 OpenTracing 传播协议来传播追踪上下文。         |
| `B3Propagator`              | `io.opentelemetry:opentelemetry-extension-trace-propagators:{{% param vers.otel %}}`          | 使用 B3 传播协议来传播追踪上下文。                  |
| `OtTracePropagator`         | `io.opentelemetry:opentelemetry-extension-trace-propagators:{{% param vers.otel %}}`          | 使用 OpenTracing 传播协议来传播追踪上下文。         |
| `PassThroughPropagator`     | `io.opentelemetry:opentelemetry-api-incubator:{{% param vers.otel %}}-alpha`                  | 传播可配置的字段集，而不参与遥测。                  |
| `AwsXrayPropagator`         | `io.opentelemetry.contrib:opentelemetry-aws-xray-propagator:{{% param vers.contrib %}}-alpha` | 使用 AWS X-Ray 传播协议来传播追踪上下文。           |
| `AwsXrayLambdaPropagator`   | `io.opentelemetry.contrib:opentelemetry-aws-xray-propagator:{{% param vers.contrib %}}-alpha` | 使用环境变量和 AWS X-Ray 传播协议来传播追踪上下文。 |

以下代码片段演示了 `TextMapPropagator` 的编程式配置：

<!-- prettier-ignore-start -->
<?code-excerpt "src/main/java/otel/ContextPropagatorsConfig.java"?>
```java
package otel;

import io.opentelemetry.api.baggage.propagation.W3CBaggagePropagator;
import io.opentelemetry.api.trace.propagation.W3CTraceContextPropagator;
import io.opentelemetry.context.propagation.ContextPropagators;
import io.opentelemetry.context.propagation.TextMapPropagator;

public class ContextPropagatorsConfig {
  public static ContextPropagators create() {
    return ContextPropagators.create(
        TextMapPropagator.composite(
            W3CTraceContextPropagator.getInstance(), W3CBaggagePropagator.getInstance()));
  }
}
```
<!-- prettier-ignore-end -->

实现 `TextMapPropagator` 接口以提供自定义的传播逻辑。例如：

<!-- prettier-ignore-start -->
<?code-excerpt "src/main/java/otel/CustomTextMapPropagator.java"?>
```java
package otel;

import io.opentelemetry.context.Context;
import io.opentelemetry.context.propagation.TextMapGetter;
import io.opentelemetry.context.propagation.TextMapPropagator;
import io.opentelemetry.context.propagation.TextMapSetter;
import java.util.Collection;
import java.util.Collections;

public class CustomTextMapPropagator implements TextMapPropagator {

  @Override
  public Collection<String> fields() {
    // 返回用于传播的字段。参考 W3CTraceContextPropagator 的实现示例。
    return Collections.emptyList();
  }

  @Override
  public <C> void inject(Context context, C carrier, TextMapSetter<C> setter) {
    // 注入上下文。参考 W3CTraceContextPropagator 的实现示例。
  }

  @Override
  public <C> Context extract(Context context, C carrier, TextMapGetter<C> getter) {
    // 提取上下文。参考 W3CTraceContextPropagator 的实现示例。
    return context;
  }
}
```
<!-- prettier-ignore-end -->

## 附录 {#appendix}

### 内部日志 {#internal-logging}

SDK 组件会将各类信息记录到 [java.util.logging](https://docs.oracle.com/javase/7/docs/api/java/util/logging/package-summary.html)中，
这些日志会使用不同的日志级别，并采用相关组件的全限定类名作为日志记录器（logger）的名称。

默认情况下，日志消息由应用程序中的根处理器（root handler）处理。
如果您尚未为应用程序安装自定义的根处理器，那么级别为 INFO 或更高级别的日志会默认发送到控制台。

您可能希望更改 OpenTelemetry 日志记录器的行为。
例如，在调试时可以降低日志级别以输出更多信息；
可以提高特定类的日志级别，以忽略来自该类的错误；
或者安装自定义处理器（handler）或过滤器（filter），以便在 OpenTelemetry 记录特定消息时执行自定义代码。
目前没有维护详细的日志记录器名称和日志信息列表。
不过，所有 OpenTelemetry 的 API、SDK、 贡献 （contrib） 组件和插桩 （instrumentation） 都共享相同的 `io.opentelemetry.*` 包前缀。
为所有 `io.opentelemetry.*` 启用更细粒度的日志会很有用，您可以检查输出，然后缩小到感兴趣的包或全限定类名（FQCN）。

例如：

```properties
## 关闭所有 OpenTelemetry 日志
io.opentelemetry.level = OFF
```

```properties
## 仅关闭 BatchSpanProcessor 的日志
io.opentelemetry.sdk.trace.export.BatchSpanProcessor.level = OFF
```

```properties
## 调试时记录 "FINE" 级别的消息
io.opentelemetry.level = FINE

## 配置默认 ConsoleHandler 的日志记录器级别
## 注意，这会影响 OpenTelemetry 之外的日志记录
java.util.logging.ConsoleHandler.level = FINE
```

对于更精细的控制和特殊情况处理，可以通过代码指定自定义处理器和过滤器。

```java
// 自定义过滤器，不记录导出器抛出的错误
public class IgnoreExportErrorsFilter implements java.util.logging.Filter {

 public boolean isLoggable(LogRecord record) {
    return !record.getMessage().contains("Exception thrown by the export");
 }
}
```

```properties
## 注册自定义过滤器到 BatchSpanProcessor
io.opentelemetry.sdk.trace.export.BatchSpanProcessor = io.opentelemetry.extension.logging.IgnoreExportErrorsFilter
```

### OTLP 导出器 {#otlp-exporters}

[Span 导出器](#spanexporter)、[指标导出器](#metricexporter) 和 [日志导出器](#logrecordexporter) 部分描述了以下形式的 OTLP 导出器：

- `OtlpHttp{Signal}Exporter`，通过 OTLP `http/protobuf` 导出数据
- `OtlpGrpc{Signal}Exporter`，通过 OTLP `grpc` 导出数据

所有信号的导出器都可以通过 `io.opentelemetry:opentelemetry-exporter-otlp:{{% param vers.otel %}}` 获得，
并且在 OTLP 协议的 `http/protobuf` 和 `grpc` 版本之间，以及不同信号之间存在大量重叠。
以下部分详细说明了这些关键概念：

- [发送器（Sender）](#senders)：不同的 HTTP / gRPC 客户端库的抽象。
- OTLP 导出器的[认证](#authentication)选项。

#### 发送器 {#senders}

OTLP 导出器依赖各种客户端库来执行 HTTP 和 gRPC 请求。
Java 生态系统中没有单一的 HTTP / gRPC 客户端库能够满足所有用例：

- Java 11+ 引入了内置的 `java.net.http.HttpClient`，但 `opentelemetry-java` 需要支持 Java 8+ 用户，
  并且由于不支持尾部头（trailer headers），因此无法通过 `gRPC` 进行导出。
- [OkHttp](https://square.github.io/okhttp/) 提供了一个功能强大的 HTTP 客户端，支持尾部头（trailer headers），
  但是依赖 kotlin 标准库。
- [grpc-java](https://github.com/grpc/grpc-java) 提供了自己的 `ManagedChannel` 抽象，
  并且支持各种[传输实现](https://github.com/grpc/grpc-java#transport)，
  但是不适合 `http/protobuf`。

为了适应各种用例，`opentelemetry-exporter-otlp` 使用了一个内部的“发送器”抽象，
并有多种实现方式以应对不同的应用程序限制。
要选择其他实现，请排除 `io.opentelemetry:opentelemetry-exporter-sender-okhttp` 默认依赖，
并添加替代实现的依赖。

| Artifact                                                                                              | 描述                                                 | OTLP 协议               | 默认值 |
| ----------------------------------------------------------------------------------------------------- | ---------------------------------------------------- | ----------------------- | ------ |
| `io.opentelemetry:opentelemetry-exporter-sender-okhttp:{{% param vers.otel %}}`                       | 基于 OkHttp 的实现。                                 | `grpc`, `http/protobuf` | Yes    |
| `io.opentelemetry:opentelemetry-exporter-sender-jdk:{{% param vers.otel %}}`                          | 基于 Java 11+ 中 `java.net.http.HttpClient` 的实现。 | `http/protobuf`         | No     |
| `io.opentelemetry:opentelemetry-exporter-sender-grpc-managed-channel:{{% param vers.otel %}}` **[1]** | 基于 `grpc-java` `ManagedChannel` 的实现。           | `grpc`                  | No     |

**[1]**: 要使用 `opentelemetry-exporter-sender-grpc-managed-channel`，
您必须添加对 [gRPC 传输实现](https://github.com/grpc/grpc-java#transport) 的依赖。

#### 认证 {#authentication}

OTLP 导出器提供了基于静态和动态头部（Header）的认证机制，以及 mTLS 认证机制。

如果通过环境变量和系统属性使用[零代码 SDK 自动配置](../configuration/#zero-code-sdk-autoconfigure)，
参见[相关系统属性](../configuration/#properties-exporters)：

- `otel.exporter.otlp.headers` 用于静态头部的认证。
- `otel.exporter.otlp.client.key`、`otel.exporter.otlp.client.certificate` 用在 mTLS 认证。

以下代码片段演示了基于静态和动态头部的认证的编程式配置：

<!-- prettier-ignore-start -->
<?code-excerpt "src/main/java/otel/OtlpAuthenticationConfig.java"?>
```java
package otel;

import io.opentelemetry.exporter.otlp.http.logs.OtlpHttpLogRecordExporter;
import io.opentelemetry.exporter.otlp.http.metrics.OtlpHttpMetricExporter;
import io.opentelemetry.exporter.otlp.http.trace.OtlpHttpSpanExporter;
import java.time.Duration;
import java.time.Instant;
import java.util.Collections;
import java.util.Map;
import java.util.function.Supplier;

public class OtlpAuthenticationConfig {
  public static void staticAuthenticationHeader(String endpoint) {
    // 如果 OTLP 目标接受静态的、长期有效的认证头（如 API 密钥），将其设置为头部即可。
    // 这会从 OTLP_API_KEY 环境变量中读取 API key，以避免在源代码中硬编码密钥。
    String apiKeyHeaderName = "api-key";
    String apiKeyHeaderValue = System.getenv("OTLP_API_KEY");

    // 使用类似的模式初始化 OTLP Span、Metric 和 LogRecord 导出器（Exporter）
    OtlpHttpSpanExporter spanExporter =
        OtlpHttpSpanExporter.builder()
            .setEndpoint(endpoint)
            .addHeader(apiKeyHeaderName, apiKeyHeaderValue)
            .build();
    OtlpHttpMetricExporter metricExporter =
        OtlpHttpMetricExporter.builder()
            .setEndpoint(endpoint)
            .addHeader(apiKeyHeaderName, apiKeyHeaderValue)
            .build();
    OtlpHttpLogRecordExporter logRecordExporter =
        OtlpHttpLogRecordExporter.builder()
            .setEndpoint(endpoint)
            .addHeader(apiKeyHeaderName, apiKeyHeaderValue)
            .build();
  }

  public static void dynamicAuthenticationHeader(String endpoint) {
    // 如果 OTLP 目标需要动态认证头，例如需要定期刷新的 JWT，请使用头信息提供器（HeaderSupplier）。
    // 在此我们实现了一个简单的提供器（Supplier），它会添加格式为 “Authorization: Bearer <token>” 的头部，
    // 其中 <token> 每 10 分钟从 refreshBearerToken 获取一次。
    String username = System.getenv("OTLP_USERNAME");
    String password = System.getenv("OTLP_PASSWORD");
    Supplier<Map<String, String>> supplier =
        new AuthHeaderSupplier(() -> refreshToken(username, password), Duration.ofMinutes(10));

    // 使用类似的模式初始化 OTLP Span、Metric 和 LogRecord 导出器（Exporter）
    OtlpHttpSpanExporter spanExporter =
        OtlpHttpSpanExporter.builder().setEndpoint(endpoint).setHeaders(supplier).build();
    OtlpHttpMetricExporter metricExporter =
        OtlpHttpMetricExporter.builder().setEndpoint(endpoint).setHeaders(supplier).build();
    OtlpHttpLogRecordExporter logRecordExporter =
        OtlpHttpLogRecordExporter.builder().setEndpoint(endpoint).setHeaders(supplier).build();
  }

  private static class AuthHeaderSupplier implements Supplier<Map<String, String>> {
    private final Supplier<String> tokenRefresher;
    private final Duration tokenRefreshInterval;
    private Instant refreshedAt = Instant.ofEpochMilli(0);
    private String currentTokenValue;

    private AuthHeaderSupplier(Supplier<String> tokenRefresher, Duration tokenRefreshInterval) {
      this.tokenRefresher = tokenRefresher;
      this.tokenRefreshInterval = tokenRefreshInterval;
    }

    @Override
    public Map<String, String> get() {
      return Collections.singletonMap("Authorization", "Bearer " + getToken());
    }

    private synchronized String getToken() {
      Instant now = Instant.now();
      if (currentTokenValue == null || now.isAfter(refreshedAt.plus(tokenRefreshInterval))) {
        currentTokenValue = tokenRefresher.get();
        refreshedAt = now;
      }
      return currentTokenValue;
    }
  }

  private static String refreshToken(String username, String password) {
    // 在生产环境中，这部分会替换为通过带外请求用用户名、密码换取 Bearer 令牌的流程。
    return "abc123";
  }
}
```
<!-- prettier-ignore-end -->

### 测试 {#testing}

TODO: 可用于测试 SDK 的工具文档

[JSON 文件编码]: /docs/specs/otel/protocol/file-exporter/#json-file-serialization
