---
title: SDKによるテレメトリーの管理
weight: 12
aliases: [exporters]
default_lang_commit: 276d7eb3f936deef6487cdd2b1d89822951da6c8
drifted_from_default: true
cSpell:ignore: Interceptable Logback okhttp
---

<!-- markdownlint-disable blanks-around-fences -->
<?code-excerpt path-base="examples/java/configuration"?>

SDKは、計装API呼び出しによって生成されたテレメトリーを処理およびエクスポートする[API](../api/)の組み込み参照実装です。
このページは、説明、関連するJavadocへのリンク、アーティファクト座標、サンプルプログラム設定などを含むSDKの概念的な概要です。
[ゼロコードSDK自動設定](../configuration/#zero-code-sdk-autoconfigure)を含むSDK設定の詳細については、**[SDKの設定](../configuration/)**を参照してください。

SDKは以下のトップレベルコンポーネントで構成されています。

- [SdkTracerProvider](#sdktracerprovider)：`TracerProvider`のSDK実装で、スパンのサンプリング、処理、エクスポートのためのツールを含みます
- [SdkMeterProvider](#sdkmeterprovider)：`MeterProvider`のSDK実装で、メトリクスストリームの設定とメトリクスの読み取り/エクスポートのためのツールを含みます
- [SdkLoggerProvider](#sdkloggerprovider)：`LoggerProvider`のSDK実装で、ログの処理とエクスポートのためのツールを含みます
- [TextMapPropagator](#textmappropagator)：プロセス境界を越えてコンテキストを伝搬します

これらは[OpenTelemetrySdk](#opentelemetrysdk)に結合され、完全に設定された[SDKコンポーネント](#sdk-components)を計装に渡すのに便利なキャリアオブジェクトです。

SDKには多くの使用例に十分な様々な組み込みコンポーネントがパッケージ化されており、拡張性のための[プラグインインターフェース](#sdk-plugin-extension-interfaces)をサポートしています。

## SDKプラグイン拡張インターフェース {#sdk-plugin-extension-interfaces}

組み込みコンポーネントが不十分な場合、さまざまなプラグイン拡張インターフェースを実装することでSDKを拡張できます。

- [Sampler](#sampler)：記録およびサンプリングされるスパンを設定します
- [SpanProcessor](#spanprocessor)：スパンの開始時と終了時に処理します
- [SpanExporter](#spanexporter)：スパンをプロセス外にエクスポートします
- [MetricReader](#metricreader)：集約されたメトリクスを読み取ります
- [MetricExporter](#metricexporter)：メトリクスをプロセス外にエクスポートします
- [LogRecordProcessor](#logrecordprocessor)：ログレコードの発行時に処理します
- [LogRecordExporter](#logrecordexporter)：ログレコードをプロセス外にエクスポートします
- [TextMapPropagator](#textmappropagator)：プロセス境界を越えてコンテキストを伝搬します

## SDKコンポーネント {#sdk-components}

`io.opentelemetry:opentelemetry-sdk:{{% param vers.otel %}}` アーティファクトにはOpenTelemetry SDKが含まれています。

以下のセクションでは、SDKのコアユーザー向けコンポーネントについて説明します。各コンポーネントセクションには以下が含まれます。

- Javadoc型リファレンスへのリンクを含む簡潔な説明
- コンポーネントが[プラグイン拡張インターフェース](#sdk-plugin-extension-interfaces)の場合、利用可能な組み込みおよび`opentelemetry-java-contrib`実装のテーブル
- [プログラマティック設定](../configuration/#programmatic-configuration)の簡単なデモンストレーション
- コンポーネントが[プラグイン拡張インターフェース](#sdk-plugin-extension-interfaces)の場合、カスタム実装の簡単なデモンストレーション

### OpenTelemetrySdk {#opentelemetrysdk}

[OpenTelemetrySdk](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-sdk/latest/io/opentelemetry/sdk/OpenTelemetrySdk.html)は[OpenTelemetry](../api/#opentelemetry)のSDK実装です。
これは、完全に設定されたSDKコンポーネントを計装に渡すのに便利なトップレベルSDKコンポーネントのホルダーです。

`OpenTelemetrySdk`はアプリケーション所有者によって設定され、以下で構成されています。

- [SdkTracerProvider](#sdktracerprovider)：`TracerProvider`のSDK実装
- [SdkMeterProvider](#sdkmeterprovider)：`MeterProvider`のSDK実装
- [SdkLoggerProvider](#sdkloggerprovider)：`LoggerProvider`のSDK実装
- [ContextPropagators](#textmappropagator)：プロセス境界を越えてコンテキストを伝搬します

以下のコードスニペットは`OpenTelemetrySdk`のプログラム設定を示します。

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

[Resource](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-sdk-common/latest/io/opentelemetry/sdk/resources/Resource.html)は、テレメトリーソースを定義する属性のセットです。
アプリケーションは、[SdkTracerProvider](#sdktracerprovider)、[SdkMeterProvider](#sdkmeterprovider)、[SdkLoggerProvider](#sdkloggerprovider)と同じリソースを関連付ける必要があります。

{{% alert %}}

[ResourceProviders](../configuration/#resourceprovider)は、環境に基づいて[自動設定された](../configuration/#zero-code-sdk-autoconfigure)リソースにコンテキスト情報を提供します。
利用可能な`ResourceProvider`のリストについてはドキュメントを参照してください。

{{% /alert %}}

以下のコードスニペットは`Resource`のプログラム設定を示します。

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

[SdkTracerProvider](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-sdk-trace/latest/io/opentelemetry/sdk/trace/SdkTracerProvider.html)は[TracerProvider](../api/#tracerprovider)のSDK実装で、APIによって生成されたトレーステレメトリーの処理を担当します。

`SdkTracerProvider`はアプリケーション所有者によって設定され、以下で構成されています。

- [Resource](#resource)：スパンが関連付けられるリソース
- [Sampler](#sampler)：記録およびサンプリングされるスパンを設定します
- [SpanProcessors](#spanprocessor)：スパンの開始時と終了時に処理します
- [SpanExporters](#spanexporter)：スパンをプロセス外にエクスポートします（関連する`SpanProcessor`と連携して）
- [SpanLimits](#spanlimits)：スパンに関連付けられるデータの制限を制御します

以下のコードスニペットは`SdkTracerProvider`のプログラム設定を示します。

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

[Sampler](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-sdk-trace/latest/io/opentelemetry/sdk/trace/samplers/Sampler.html)は、記録およびサンプリングされるスパンを決定する責任を持つ[プラグイン拡張インターフェース](#sdk-plugin-extension-interfaces)です。

{{% alert %}}

デフォルトで`SdkTracerProvider`は`ParentBased(root=AlwaysOn)`サンプラーで設定されています。
これにより、呼び出し元アプリケーションがサンプリングを実行しない限り、100%のスパンがサンプリングされます。これが過度にノイジー/高コストの場合は、サンプラーを変更してください。

{{% /alert %}}

SDKに組み込まれ、`opentelemetry-java-contrib`でコミュニティによって維持されているサンプラー。

| クラス                    | アーティファクト                                                                              | 説明                                                                                                                          |
| ------------------------- | --------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `ParentBased`             | `io.opentelemetry:opentelemetry-sdk:{{% param vers.otel %}}`                                  | スパンの親のサンプリングステータスに基づいてスパンをサンプリングします。                                                      |
| `AlwaysOn`                | `io.opentelemetry:opentelemetry-sdk:{{% param vers.otel %}}`                                  | すべてのスパンをサンプリングします。                                                                                          |
| `AlwaysOff`               | `io.opentelemetry:opentelemetry-sdk:{{% param vers.otel %}}`                                  | すべてのスパンをドロップします。                                                                                              |
| `TraceIdRatioBased`       | `io.opentelemetry:opentelemetry-sdk:{{% param vers.otel %}}`                                  | 設定可能な比率に基づいてスパンをサンプリングします。                                                                          |
| `JaegerRemoteSampler`     | `io.opentelemetry:opentelemetry-sdk-extension-jaeger-remote-sampler:{{% param vers.otel %}}`  | リモートサーバーからの設定に基づいてスパンをサンプリングします。                                                              |
| `LinksBasedSampler`       | `io.opentelemetry.contrib:opentelemetry-samplers:{{% param vers.contrib %}}-alpha`            | スパンのリンクのサンプリングステータスに基づいてスパンをサンプリングします。                                                  |
| `RuleBasedRoutingSampler` | `io.opentelemetry.contrib:opentelemetry-samplers:{{% param vers.contrib %}}-alpha`            | 設定可能なルールに基づいてスパンをサンプリングします。                                                                        |
| `ConsistentSamplers`      | `io.opentelemetry.contrib:opentelemetry-consistent-sampling:{{% param vers.contrib %}}-alpha` | [確率サンプリング](/docs/specs/otel/trace/tracestate-probability-sampling/)で定義されたさまざまな一貫性のあるサンプラー実装。 |

以下のコードスニペットは`Sampler`のプログラム設定を示します。

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

独自のカスタムサンプリングロジックを提供するには、`Sampler`インターフェースを実装してください。
例を挙げましょう。

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
    // スパンが開始されたときに呼び出されるコールバック（SpanProcessorが呼び出される前）。
    // SamplingDecisionが:
    // - DROP: スパンがドロップされます。有効なスパンコンテキストが作成され、SpanProcessor#onStartは
    // まだ呼び出されますが、データは記録されず、SpanProcessor#onEndは呼び出されません。
    // - RECORD_ONLY: スパンは記録されますがサンプリングされません。データはスパンに記録され、
    // SpanProcessor#onStartとSpanProcessor#onEndが呼び出されますが、スパンのサンプリングステータスは
    // プロセス外にエクスポートされるべきではないことを示します。
    // - RECORD_AND_SAMPLE: スパンは記録およびサンプリングされます。データはスパンに記録され、
    // SpanProcessor#onStartとSpanProcessor#onEndが呼び出され、スパンのサンプリングステータスは
    // プロセス外にエクスポートされるべきであることを示します。
    return SpanKind.SERVER == spanKind ? SamplingResult.recordAndSample() : SamplingResult.drop();
  }

  @Override
  public String getDescription() {
    // サンプラーの説明を返します。
    return this.getClass().getSimpleName();
  }
}
```
<!-- prettier-ignore-end -->

#### SpanProcessor {#spanprocessor}

[SpanProcessor](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-sdk-trace/latest/io/opentelemetry/sdk/trace/SpanProcessor.html)は、スパンが開始および終了されたときに呼び出されるコールバックを持つ[プラグイン拡張インターフェース](#sdk-plugin-extension-interfaces)です。
これらはしばしば[SpanExporters](#spanexporter)と組み合わせてスパンをプロセス外にエクスポートしますが、データエンリッチメントなどの他の用途もあります。

SDKに組み込まれ、`opentelemetry-java-contrib`でコミュニティによって維持されているスパンプロセッサー。

| クラス                    | アーティファクト                                                                            | 説明                                                                                         |
| ------------------------- | ------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| `BatchSpanProcessor`      | `io.opentelemetry:opentelemetry-sdk:{{% param vers.otel %}}`                                | サンプリングされたスパンをバッチ処理し、設定可能な`SpanExporter`を介してエクスポートします。 |
| `SimpleSpanProcessor`     | `io.opentelemetry:opentelemetry-sdk:{{% param vers.otel %}}`                                | 各サンプリングされたスパンを設定可能な`SpanExporter`を介してエクスポートします。             |
| `BaggageSpanProcessor`    | `io.opentelemetry.contrib:opentelemetry-baggage-processor:{{% param vers.contrib %}}-alpha` | スパンをバゲージでエンリッチします。                                                         |
| `JfrSpanProcessor`        | `io.opentelemetry.contrib:opentelemetry-jfr-events:{{% param vers.contrib %}}-alpha`        | スパンからJFRイベントを作成します。                                                          |
| `StackTraceSpanProcessor` | `io.opentelemetry.contrib:opentelemetry-span-stacktrace:{{% param vers.contrib %}}-alpha`   | 選択されたスパンをスタックトレースデータでエンリッチします。                                 |
| `InferredSpansProcessor`  | `io.opentelemetry.contrib:opentelemetry-inferred-spans:{{% param vers.contrib %}}-alpha`    | 計装ではなく非同期プロファイラーからスパンを生成します。                                     |

以下のコードスニペットは`SpanProcessor`のプログラム設定を示します。

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

独自のカスタムスパン処理ロジックを提供するには、`SpanProcessor`インターフェースを実装してください。
例を挙げましょう。

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
    // スパンが開始されたときに呼び出されるコールバック。
    // カスタム属性でレコードをエンリッチします。
    span.setAttribute("my.custom.attribute", "hello world");
  }

  @Override
  public boolean isStartRequired() {
    // onStartが呼び出されるべきかどうかを示します。
    return true;
  }

  @Override
  public void onEnd(ReadableSpan span) {
    // スパンが終了されたときに呼び出されるコールバック。
  }

  @Override
  public boolean isEndRequired() {
    // onEndが呼び出されるべきかどうかを示します。
    return false;
  }

  @Override
  public CompletableResultCode shutdown() {
    // オプションでプロセッサーをシャットダウンし、リソースをクリーンアップします。
    return CompletableResultCode.ofSuccess();
  }

  @Override
  public CompletableResultCode forceFlush() {
    // オプションでキューに入れられているがまだ処理されていないレコードを処理します。
    return CompletableResultCode.ofSuccess();
  }
}
```
<!-- prettier-ignore-end -->

#### SpanExporter {#spanexporter}

[SpanExporter](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-sdk-trace/latest/io/opentelemetry/sdk/trace/export/SpanExporter.html)は、スパンをプロセス外にエクスポートする責任を持つ[プラグイン拡張インターフェース](#sdk-plugin-extension-interfaces)です。
`SdkTracerProvider`に直接登録するのではなく、[SpanProcessors](#spanprocessor)（通常は`BatchSpanProcessor`）と組み合わせます。

SDKに組み込まれ、`opentelemetry-java-contrib`でコミュニティによって維持されているスパンエクスポーター。

| クラス                         | アーティファクト                                                                         | 説明                                                                                    |
| ------------------------------ | ---------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| `OtlpHttpSpanExporter` **[1]** | `io.opentelemetry:opentelemetry-exporter-otlp:{{% param vers.otel %}}`                   | OTLP `http/protobuf`を介してスパンをエクスポートします。                                |
| `OtlpGrpcSpanExporter` **[1]** | `io.opentelemetry:opentelemetry-exporter-otlp:{{% param vers.otel %}}`                   | OTLP `grpc`を介してスパンをエクスポートします。                                         |
| `LoggingSpanExporter`          | `io.opentelemetry:opentelemetry-exporter-logging:{{% param vers.otel %}}`                | スパンをデバッグ形式でJULにログ出力します。                                             |
| `OtlpJsonLoggingSpanExporter`  | `io.opentelemetry:opentelemetry-exporter-logging-otlp:{{% param vers.otel %}}`           | スパンをOTLP JSONエンコーディングでJULにログ出力します。                                |
| `OtlpStdoutSpanExporter`       | `io.opentelemetry:opentelemetry-exporter-logging-otlp:{{% param vers.otel %}}`           | スパンをOTLP [JSONファイルエンコーディング][]（実験的）で`System.out`にログ出力します。 |
| `ZipkinSpanExporter`           | `io.opentelemetry:opentelemetry-exporter-zipkin:{{% param vers.otel %}}`                 | スパンをZipkinにエクスポートします。                                                    |
| `InterceptableSpanExporter`    | `io.opentelemetry.contrib:opentelemetry-processors:{{% param vers.contrib %}}-alpha`     | エクスポート前にスパンを柔軟なインターセプターに渡します。                              |
| `KafkaSpanExporter`            | `io.opentelemetry.contrib:opentelemetry-kafka-exporter:{{% param vers.contrib %}}-alpha` | Kafkaトピックに書き込むことでスパンをエクスポートします。                               |

**[1]**: 実装の詳細については[OTLPエクスポーター](#otlp-exporters)を参照してください。

以下のコードスニペットは`SpanExporter`のプログラム設定を示します。

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

独自のカスタムスパンエクスポートロジックを提供するには、`SpanExporter`インターフェースを実装してください。
例を挙げましょう。

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
    // レコードをエクスポートします。通常、レコードは何らかのネットワークプロトコルを介してプロセス外に送信されますが、
    // 説明のためにここでは単にログ出力します。
    logger.log(Level.INFO, "Exporting spans");
    spans.forEach(span -> logger.log(Level.INFO, "Span: " + span));
    return CompletableResultCode.ofSuccess();
  }

  @Override
  public CompletableResultCode flush() {
    // キューに入れられているがまだエクスポートされていないレコードをエクスポートします。
    logger.log(Level.INFO, "flushing");
    return CompletableResultCode.ofSuccess();
  }

  @Override
  public CompletableResultCode shutdown() {
    // エクスポーターをシャットダウンし、リソースをクリーンアップします。
    logger.log(Level.INFO, "shutting down");
    return CompletableResultCode.ofSuccess();
  }
}
```
<!-- prettier-ignore-end -->

#### SpanLimits {#spanlimits}

[SpanLimits](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-sdk-trace/latest/io/opentelemetry/sdk/trace/SpanLimits.html)は、最大属性長、最大属性数などを含む、スパンによってキャプチャされるデータの制約を定義します。

以下のコードスニペットは`SpanLimits`のプログラム設定を示します。

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

[SdkMeterProvider](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-sdk-metrics/latest/io/opentelemetry/sdk/metrics/SdkMeterProvider.html)は[MeterProvider](../api/#meterprovider)のSDK実装で、APIによって生成されたメトリクステレメトリーの処理を担当します。

`SdkMeterProvider`はアプリケーション所有者によって設定され、以下で構成されています。

- [Resource](#resource)：メトリクスが関連付けられるリソース
- [MetricReader](#metricreader)：メトリクスの集約状態を読み取ります
  - オプションで、計装種別ごとのカーディナリティ制限をオーバーライドするための[CardinalityLimitSelector](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-sdk-metrics/latest/io/opentelemetry/sdk/metrics/export/CardinalityLimitSelector.html)。設定されていない場合、各計装は収集サイクルごとに2000の一意の属性組み合わせに制限されます。カーディナリティ制限は[ビュー](#views)を介して個々の計装でも設定可能です。詳細については[カーディナリティ制限](/docs/specs/otel/metrics/sdk/#cardinality-limits)を参照してください
- [MetricExporter](#metricexporter)：メトリクスをプロセス外にエクスポートします（関連する`MetricReader`と連携して）
- [Views](#views)：未使用メトリクスのドロップを含む、メトリクスストリームを設定します

以下のコードスニペットは`SdkMeterProvider`のプログラム設定を示します。

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
    // カーディナリティ制限付きでメトリクスリーダーを登録するオプションのコメントアウト解除
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

[MetricReader](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-sdk-metrics/latest/io/opentelemetry/sdk/metrics/export/MetricReader.html)は、集約されたメトリクスを読み取る責任を持つ[プラグイン拡張インターフェース](#sdk-plugin-extension-interfaces)です。
これらはしばしば[MetricExporters](#metricexporter)と組み合わせてメトリクスをプロセス外にエクスポートしますが、プルベースプロトコルで外部スクレイパーにメトリクスを提供するためにも使用される場合があります。

下表は、SDKに組み込まれ、`opentelemetry-java-contrib`でコミュニティによって維持されているメトリクスリーダーです。

| クラス                 | アーティファクト                                                                   | 説明                                                                                 |
| ---------------------- | ---------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| `PeriodicMetricReader` | `io.opentelemetry:opentelemetry-sdk:{{% param vers.otel %}}`                       | 定期的にメトリクスを読み取り、設定可能な`MetricExporter`を介してエクスポートします。 |
| `PrometheusHttpServer` | `io.opentelemetry:opentelemetry-exporter-prometheus:{{% param vers.otel %}}-alpha` | さまざまなprometheus形式でHTTPサーバー上でメトリクスを提供します。                   |

以下のコードスニペットは`MetricReader`のプログラム設定を示します。

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

独自のカスタムメトリクスリーダーロジックを提供するには、`MetricReader`インターフェースを実装してください。
例を挙げましょう。

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
    // SdkMeterProviderが初期化されたときに呼び出されるコールバックで、メトリクスを収集するハンドルを提供します。
    collectionRef.set(collectionRegistration);
    executorService.scheduleWithFixedDelay(this::collectMetrics, 0, 60, TimeUnit.SECONDS);
  }

  private void collectMetrics() {
    // メトリクスを収集します。通常、レコードは何らかのネットワークプロトコルを介してプロセス外に送信されますが、
    // 説明のためにここでは単にログ出力します。
    logger.log(Level.INFO, "Collecting metrics");
    collectionRef
        .get()
        .collectAllMetrics()
        .forEach(metric -> logger.log(Level.INFO, "Metric: " + metric));
  }

  @Override
  public CompletableResultCode forceFlush() {
    // キューに入れられているがまだエクスポートされていないレコードをエクスポートします。
    logger.log(Level.INFO, "flushing");
    return CompletableResultCode.ofSuccess();
  }

  @Override
  public CompletableResultCode shutdown() {
    // エクスポーターをシャットダウンし、リソースをクリーンアップします。
    logger.log(Level.INFO, "shutting down");
    return CompletableResultCode.ofSuccess();
  }

  @Override
  public AggregationTemporality getAggregationTemporality(InstrumentType instrumentType) {
    // InstrumentTypeの関数として必要な集約時間性を指定
    return AggregationTemporalitySelector.deltaPreferred()
        .getAggregationTemporality(instrumentType);
  }

  @Override
  public MemoryMode getMemoryMode() {
    // オプションでメモリモードを指定し、メトリクスレコードが再利用可能か不変である必要があるかを示します
    return MemoryMode.REUSABLE_DATA;
  }

  @Override
  public Aggregation getDefaultAggregation(InstrumentType instrumentType) {
    // オプションで計装種別の関数としてデフォルト集約を指定
    return Aggregation.defaultAggregation();
  }
}
```
<!-- prettier-ignore-end -->

#### MetricExporter {#metricexporter}

[MetricExporter](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-sdk-metrics/latest/io/opentelemetry/sdk/metrics/export/MetricExporter.html)は、メトリクスをプロセス外にエクスポートする責任を持つ[プラグイン拡張インターフェース](#sdk-plugin-extension-interfaces)です。
`SdkMeterProvider`に直接登録するのではなく、[PeriodicMetricReader](#metricreader)と組み合わせます。

SDKに組み込まれ、`opentelemetry-java-contrib`でコミュニティによって維持されているメトリクスエクスポーター。

| クラス                           | アーティファクト                                                                     | 説明                                                                                        |
| -------------------------------- | ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------- |
| `OtlpHttpMetricExporter` **[1]** | `io.opentelemetry:opentelemetry-exporter-otlp:{{% param vers.otel %}}`               | OTLP `http/protobuf`を介してメトリクスをエクスポートします。                                |
| `OtlpGrpcMetricExporter` **[1]** | `io.opentelemetry:opentelemetry-exporter-otlp:{{% param vers.otel %}}`               | OTLP `grpc`を介してメトリクスをエクスポートします。                                         |
| `LoggingMetricExporter`          | `io.opentelemetry:opentelemetry-exporter-logging:{{% param vers.otel %}}`            | メトリクスをデバッグ形式でJULにログ出力します。                                             |
| `OtlpJsonLoggingMetricExporter`  | `io.opentelemetry:opentelemetry-exporter-logging-otlp:{{% param vers.otel %}}`       | メトリクスをOTLP JSONエンコーディングでJULにログ出力します。                                |
| `OtlpStdoutMetricExporter`       | `io.opentelemetry:opentelemetry-exporter-logging-otlp:{{% param vers.otel %}}`       | メトリクスをOTLP [JSONファイルエンコーディング][]（実験的）で`System.out`にログ出力します。 |
| `InterceptableMetricExporter`    | `io.opentelemetry.contrib:opentelemetry-processors:{{% param vers.contrib %}}-alpha` | エクスポート前にメトリクスを柔軟なインターセプターに渡します。                              |

**[1]**: 実装の詳細については[OTLPエクスポーター](#otlp-exporters)を参照してください。

以下のコードスニペットは`MetricExporter`のプログラム設定を示します。

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

独自のカスタムメトリクスエクスポートロジックを提供するには、`MetricExporter`インターフェースを実装してください。
例を挙げましょう。

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
    // レコードをエクスポートします。通常、レコードは何らかのネットワークプロトコルを介してプロセス外に送信されますが、
    // 説明のためにここでは単にログ出力します。
    logger.log(Level.INFO, "Exporting metrics");
    metrics.forEach(metric -> logger.log(Level.INFO, "Metric: " + metric));
    return CompletableResultCode.ofSuccess();
  }

  @Override
  public CompletableResultCode flush() {
    // キューに入れられているがまだエクスポートされていないレコードをエクスポートします。
    logger.log(Level.INFO, "flushing");
    return CompletableResultCode.ofSuccess();
  }

  @Override
  public CompletableResultCode shutdown() {
    // エクスポーターをシャットダウンし、リソースをクリーンアップします。
    logger.log(Level.INFO, "shutting down");
    return CompletableResultCode.ofSuccess();
  }

  @Override
  public AggregationTemporality getAggregationTemporality(InstrumentType instrumentType) {
    // 計装種別の関数として必要な集約時間性を指定
    return AggregationTemporalitySelector.deltaPreferred()
        .getAggregationTemporality(instrumentType);
  }

  @Override
  public MemoryMode getMemoryMode() {
    // オプションでメモリモードを指定し、メトリクスレコードが再利用可能か不変である必要があるかを示します
    return MemoryMode.REUSABLE_DATA;
  }

  @Override
  public Aggregation getDefaultAggregation(InstrumentType instrumentType) {
    // オプションで計装種別の関数としてデフォルト集約を指定
    return Aggregation.defaultAggregation();
  }
}
```
<!-- prettier-ignore-end -->

#### Views {#views}

[Views](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-sdk-metrics/latest/io/opentelemetry/sdk/metrics/View.html)は、メトリクス名の変更、メトリクス説明、メトリクス集約（ヒストグラムバケット境界など）、保持する属性キーのセット、カーディナリティ制限などを含む、メトリクスストリームのカスタマイズを可能にします。

{{% alert %}}

ビューは、特定の計装に複数がマッチした場合、やや直感的でない動作をします。
マッチするビューの一つがメトリクス名を変更し、別のビューがメトリクス集約を変更する場合、名前と集約の両方が変更されることを期待するかもしれませんが、
そうではありません。かわりに、2つのメトリクスストリームが生成されます。一つは設定されたメトリクス名とデフォルト集約、もう一つは元のメトリクス名と設定された集約です。
言い換えると、マッチするビューは _マージされません_。
最良の結果を得るために、狭い選択基準（特定の単一計装を選択するなど）でビューを設定してください。

{{% /alert %}}

以下のコードスニペットは`View`のプログラム設定を示します。

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

[SdkLoggerProvider](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-sdk-logs/latest/io/opentelemetry/sdk/logs/SdkLoggerProvider.html)は[LoggerProvider](../api/#loggerprovider)のSDK実装で、ログブリッジAPIによって生成されたログテレメトリーの処理を担当します。

`SdkLoggerProvider`はアプリケーション所有者によって設定され、以下で構成されています。

- [Resource](#resource)：ログが関連付けられるリソース
- [LogRecordProcessor](#logrecordprocessor)：ログの発行時に処理します
- [LogRecordExporter](#logrecordexporter)：ログをプロセス外にエクスポートします（関連する`LogRecordProcessor`と連携して）
- [LogLimits](#loglimits)：ログに関連付けられるデータの制限を制御します

以下のコードスニペットは`SdkLoggerProvider`のプログラム設定を示します。

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

[LogRecordProcessor](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-sdk-logs/latest/io/opentelemetry/sdk/logs/LogRecordProcessor.html)は、ログが発行されたときに呼び出されるコールバックを持つ[プラグイン拡張インターフェース](#sdk-plugin-extension-interfaces)です。
これらはしばしば[LogRecordExporters](#logrecordexporter)と組み合わせてログをプロセス外にエクスポートしますが、データエンリッチメントなどの他の用途もあります。

下表は、SDKに組み込まれ、`opentelemetry-java-contrib`でコミュニティによって維持されているログレコードプロセッサーです。

| クラス                     | アーティファクト                                                                     | 説明                                                                                  |
| -------------------------- | ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------- |
| `BatchLogRecordProcessor`  | `io.opentelemetry:opentelemetry-sdk:{{% param vers.otel %}}`                         | ログレコードをバッチ処理し、設定可能な`LogRecordExporter`を介してエクスポートします。 |
| `SimpleLogRecordProcessor` | `io.opentelemetry:opentelemetry-sdk:{{% param vers.otel %}}`                         | 各ログレコードを設定可能な`LogRecordExporter`を介してエクスポートします。             |
| `EventToSpanEventBridge`   | `io.opentelemetry.contrib:opentelemetry-processors:{{% param vers.contrib %}}-alpha` | イベントログレコードを現在のスパンのスパンイベントとして記録します。                  |

以下のコードスニペットは`LogRecordProcessor`のプログラム設定を示します。

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

独自のカスタムログ処理ロジックを提供するには、`LogRecordProcessor`インターフェースを実装してください。
例を挙げましょう。

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
    // ログレコードが発行されたときに呼び出されるコールバック。
    // カスタム属性でレコードをエンリッチします。
    logRecord.setAttribute(AttributeKey.stringKey("my.custom.attribute"), "hello world");
  }

  @Override
  public CompletableResultCode shutdown() {
    // オプションでプロセッサーをシャットダウンし、リソースをクリーンアップします。
    return CompletableResultCode.ofSuccess();
  }

  @Override
  public CompletableResultCode forceFlush() {
    // オプションでキューに入れられているがまだ処理されていないレコードを処理します。
    return CompletableResultCode.ofSuccess();
  }
}
```
<!-- prettier-ignore-end -->

#### LogRecordExporter {#logrecordexporter}

[LogRecordExporter](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-sdk-logs/latest/io/opentelemetry/sdk/logs/export/LogRecordExporter.html)は、ログレコードをプロセス外にエクスポートする責任を持つ[プラグイン拡張インターフェース](#sdk-plugin-extension-interfaces)です。
`SdkLoggerProvider`に直接登録するのではなく、[LogRecordProcessors](#logrecordprocessor)（通常は`BatchLogRecordProcessor`）と組み合わせます。

下表は、SDKに組み込まれ、`opentelemetry-java-contrib`でコミュニティによって維持されているログレコードエクスポーターです。

| クラス                                     | アーティファクト                                                                     | 説明                                                                                          |
| ------------------------------------------ | ------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------- |
| `OtlpHttpLogRecordExporter` **[1]**        | `io.opentelemetry:opentelemetry-exporter-otlp:{{% param vers.otel %}}`               | OTLP `http/protobuf`を介してログレコードをエクスポートします。                                |
| `OtlpGrpcLogRecordExporter` **[1]**        | `io.opentelemetry:opentelemetry-exporter-otlp:{{% param vers.otel %}}`               | OTLP `grpc`を介してログレコードをエクスポートします。                                         |
| `SystemOutLogRecordExporter`               | `io.opentelemetry:opentelemetry-exporter-logging:{{% param vers.otel %}}`            | ログレコードをデバッグ形式でsystem outにログ出力します。                                      |
| `OtlpJsonLoggingLogRecordExporter` **[2]** | `io.opentelemetry:opentelemetry-exporter-logging-otlp:{{% param vers.otel %}}`       | ログレコードをOTLP JSONエンコーディングでJULにログ出力します。                                |
| `OtlpStdoutLogRecordExporter`              | `io.opentelemetry:opentelemetry-exporter-logging-otlp:{{% param vers.otel %}}`       | ログレコードをOTLP [JSONファイルエンコーディング][]（実験的）で`System.out`にログ出力します。 |
| `InterceptableLogRecordExporter`           | `io.opentelemetry.contrib:opentelemetry-processors:{{% param vers.contrib %}}-alpha` | エクスポート前にログレコードを柔軟なインターセプターに渡します。                              |

**[1]**: 実装の詳細については[OTLPエクスポーター](#otlp-exporters)を参照してください。

**[2]**: `OtlpJsonLoggingLogRecordExporter`はJULにログ出力し、適切に設定されていない場合、無限ループ（JUL -> SLF4J -> Logback -> OpenTelemetry Appender -> OpenTelemetry Log SDK -> JUL）を引き起こす可能性があります。

以下のコードスニペットは`LogRecordExporter`のプログラム設定を示します。

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

独自のカスタムログレコードエクスポートロジックを提供するには、`LogRecordExporter`インターフェースを実装してください。
例を挙げましょう。

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
    // レコードをエクスポートします。通常、レコードは何らかのネットワークプロトコルを介してプロセス外に送信されますが、
    // 説明のためにここでは単にログ出力します。
    System.out.println("Exporting logs");
    logs.forEach(log -> System.out.println("log record: " + log));
    return CompletableResultCode.ofSuccess();
  }

  @Override
  public CompletableResultCode flush() {
    // キューに入れられているがまだエクスポートされていないレコードをエクスポートします。
    logger.log(Level.INFO, "flushing");
    return CompletableResultCode.ofSuccess();
  }

  @Override
  public CompletableResultCode shutdown() {
    // エクスポーターをシャットダウンし、リソースをクリーンアップします。
    logger.log(Level.INFO, "shutting down");
    return CompletableResultCode.ofSuccess();
  }
}
```
<!-- prettier-ignore-end -->

#### LogLimits {#loglimits}

[LogLimits](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-sdk-logs/latest/io/opentelemetry/sdk/logs/LogLimits.html)は、最大属性長や最大属性数を含む、ログレコードによってキャプチャされるデータの制約を定義します。

以下のコードスニペットは`LogLimits`のプログラム設定を示します。

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

[TextMapPropagator](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-context/latest/io/opentelemetry/context/propagation/TextMapPropagator.html)は、テキスト形式でプロセス境界を越えてコンテキストを伝搬する責任を持つ[プラグイン拡張インターフェース](#sdk-plugin-extension-interfaces)です。

SDKに組み込まれ、`opentelemetry-java-contrib`でコミュニティによって維持されているTextMapPropagators。

| クラス                      | アーティファクト                                                                              | 説明                                                                              |
| --------------------------- | --------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| `W3CTraceContextPropagator` | `io.opentelemetry:opentelemetry-api:{{% param vers.otel %}}`                                  | W3Cトレースコンテキスト伝搬プロトコルを使用してトレースコンテキストを伝搬します。 |
| `W3CBaggagePropagator`      | `io.opentelemetry:opentelemetry-api:{{% param vers.otel %}}`                                  | W3Cバゲージ伝搬プロトコルを使用してバゲージを伝搬します。                         |
| `MultiTextMapPropagator`    | `io.opentelemetry:opentelemetry-context:{{% param vers.otel %}}`                              | 複数のプロパゲーターを構成します。                                                |
| `JaegerPropagator`          | `io.opentelemetry:opentelemetry-extension-trace-propagators:{{% param vers.otel %}}`          | Jaeger伝搬プロトコルを使用してトレースコンテキストを伝搬します。                  |
| `B3Propagator`              | `io.opentelemetry:opentelemetry-extension-trace-propagators:{{% param vers.otel %}}`          | B3伝搬プロトコルを使用してトレースコンテキストを伝搬します。                      |
| `OtTracePropagator`         | `io.opentelemetry:opentelemetry-extension-trace-propagators:{{% param vers.otel %}}`          | OpenTracing伝搬プロトコルを使用してトレースコンテキストを伝搬します。             |
| `PassThroughPropagator`     | `io.opentelemetry:opentelemetry-api-incubator:{{% param vers.otel %}}-alpha`                  | テレメトリーに参加することなく、設定可能なフィールドセットを伝搬します。          |
| `AwsXrayPropagator`         | `io.opentelemetry.contrib:opentelemetry-aws-xray-propagator:{{% param vers.contrib %}}-alpha` | AWS X-Ray伝搬プロトコルを使用してトレースコンテキストを伝搬します。               |
| `AwsXrayLambdaPropagator`   | `io.opentelemetry.contrib:opentelemetry-aws-xray-propagator:{{% param vers.contrib %}}-alpha` | 環境変数とAWS X-Ray伝搬プロトコルを使用してトレースコンテキストを伝搬します。     |

以下のコードスニペットは`TextMapPropagator`のプログラム設定を示します。

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

独自のカスタムプロパゲーターロジックを提供するには、`TextMapPropagator`インターフェースを実装してください。
例を挙げましょう。

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
    // 伝播に使用されるフィールドを返します。参照実装については W3CTraceContextPropagator を参照してください。
    return Collections.emptyList();
  }

  @Override
  public <C> void inject(Context context, C carrier, TextMapSetter<C> setter) {
    // コンテキストを注入します。参照実装については W3CTraceContextPropagator を参照してください。
  }

  @Override
  public <C> Context extract(Context context, C carrier, TextMapGetter<C> getter) {
    // コンテキストを抽出します。参照実装については W3CTraceContextPropagator を参照してください。
    return context;
  }
}
```
<!-- prettier-ignore-end -->

## 付録 {#appendix}

### 内部ログ {#internal-logging}

SDKコンポーネントは、関連するコンポーネントの完全修飾クラス名に基づくロガー名を使用して、さまざまなログレベルで[java.util.logging](https://docs.oracle.com/javase/7/docs/api/java/util/logging/package-summary.html)にさまざまな情報をログ出力します。

デフォルトでは、ログメッセージはアプリケーションのルートハンドラーによって処理されます。
アプリケーション用にカスタムルートハンドラーをインストールしていない場合、デフォルトで`INFO`レベル以上のログがコンソールに送信されます。

OpenTelemetryのロガーの動作を変更したい場合があります。
たとえば、デバッグ時に追加情報を出力するためにログレベルを下げたり、特定のクラスからのエラーを無視するために特定のクラスのレベルを上げたり、OpenTelemetryが特定のメッセージをログ出力するたびにカスタムコードを実行するためにカスタムハンドラーまたはフィルターをインストールしたりできます。
ロガー名とログ情報の詳細なリストは維持されていません。
ただし、すべてのOpenTelemetry API、SDK、contrib、および計装コンポーネントは同じ`io.opentelemetry.*`パッケージ接頭辞を共有しています。
すべての`io.opentelemetry.*`に対してより細かいログを有効にし、出力を検査し、興味のあるパッケージやFQCNに絞り込むことが有用です。

例を挙げましょう。

```properties
## すべてのOpenTelemetryログを無効にする
io.opentelemetry.level = OFF
```

```properties
## BatchSpanProcessorのログのみを無効にする
io.opentelemetry.sdk.trace.export.BatchSpanProcessor.level = OFF
```

```properties
## デバッグに役立つ「FINE」メッセージをログ出力
io.opentelemetry.level = FINE

## デフォルトのConsoleHandlerのロガーのレベルを設定
## これはOpenTelemetry以外のログにも影響することに注意
java.util.logging.ConsoleHandler.level = FINE
```

より細かい制御と特殊ケースの処理のために、カスタムハンドラーとフィルターをコードで指定できます。

```java
// エクスポートからのエラーをログ出力しないカスタムフィルター
public class IgnoreExportErrorsFilter implements java.util.logging.Filter {

 public boolean isLoggable(LogRecord record) {
    return !record.getMessage().contains("Exception thrown by the export");
 }
}
```

```properties
## BatchSpanProcessorにカスタムフィルターを登録
io.opentelemetry.sdk.trace.export.BatchSpanProcessor = io.opentelemetry.extension.logging.IgnoreExportErrorsFilter
```

### OTLPエクスポーター {#otlp-exporters}

[スパンエクスポーター](#spanexporter)、[メトリクスエクスポーター](#metricexporter)、[ログエクスポーター](#logrecordexporter)セクションでは、以下の形式のOTLPエクスポーターについて説明しています。

- `OtlpHttp{Signal}Exporter`は、OTLP `http/protobuf`を介してデータをエクスポートします
- `OtlpGrpc{Signal}Exporter`は、OTLP `grpc`を介してデータをエクスポートします

すべてのシグナルのエクスポーターは`io.opentelemetry:opentelemetry-exporter-otlp:{{% param vers.otel %}}`を介して利用可能で、OTLPプロトコルの`grpc`と`http/protobuf`バージョン間、およびシグナル間で大幅に重複しています。
以下のセクションでは、これらの重要な概念について詳しく説明します。

- [センダー](#senders)：異なるHTTP / gRPCクライアントライブラリの抽象化
- OTLPエクスポーターの[認証](#authentication)オプション

#### Senders {#senders}

OTLPエクスポーターは、HTTPおよびgRPCリクエストを実行するためにさまざまなクライアントライブラリに依存しています。
Javaエコシステムのすべての使用例を満たす単一のHTTP / gRPCクライアントライブラリはありません。

- Java 11+は組み込みの`java.net.http.HttpClient`を提供しますが、`opentelemetry-java`はJava 8+ユーザーをサポートする必要があり、トレーラーヘッダーのサポートがないため`gRPC`経由でエクスポートするために使用できません
- [OkHttp](https://square.github.io/okhttp/)はトレーラーヘッダーをサポートする強力なHTTPクライアントを提供しますが、kotlin標準ライブラリに依存しています
- [grpc-java](https://github.com/grpc/grpc-java)は、さまざまな[トランスポート実装](https://github.com/grpc/grpc-java#transport)を持つ独自の`ManagedChannel`抽象化を提供しますが、`http/protobuf`には適していません

さまざまな使用例に対応するため、`opentelemetry-exporter-otlp`は内部の「sender」抽象化を使用し、アプリケーションの制約を反映するさまざまな実装を提供しています。
別の実装を選択するには、デフォルトの`io.opentelemetry:opentelemetry-exporter-sender-okhttp`依存関係を除外し、代替に依存関係を追加してください。

| アーティファクト                                                                                      | 説明                                              | OTLPプロトコル          | デフォルト |
| ----------------------------------------------------------------------------------------------------- | ------------------------------------------------- | ----------------------- | ---------- |
| `io.opentelemetry:opentelemetry-exporter-sender-okhttp:{{% param vers.otel %}}`                       | OkHttpベースの実装。                              | `grpc`, `http/protobuf` | はい       |
| `io.opentelemetry:opentelemetry-exporter-sender-jdk:{{% param vers.otel %}}`                          | Java 11+ `java.net.http.HttpClient`ベースの実装。 | `http/protobuf`         | いいえ     |
| `io.opentelemetry:opentelemetry-exporter-sender-grpc-managed-channel:{{% param vers.otel %}}` **[1]** | `grpc-java` `ManagedChannel`ベースの実装。        | `grpc`                  | いいえ     |

**[1]**: `opentelemetry-exporter-sender-grpc-managed-channel`を使用するには、[gRPCトランスポート実装](https://github.com/grpc/grpc-java#transport)への依存関係も追加する必要があります。

#### 認証 {#authentication}

OTLPエクスポーターは、静的および動的ヘッダーベース認証、およびmTLSのメカニズムを提供します。

環境変数とシステムプロパティで[ゼロコードSDK自動設定](../configuration/#zero-code-sdk-autoconfigure)を使用している場合は、[関連するシステムプロパティ](../configuration/#properties-exporters)を参照してください。

- 静的ヘッダーベース認証には`otel.exporter.otlp.headers`
- mTLS認証には`otel.exporter.otlp.client.key`、`otel.exporter.otlp.client.certificate`

以下のコードスニペットは、静的および動的ヘッダーベース認証のプログラム設定を示します。

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
    // OTLP宛先がAPIキーのような静的で長期間有効な認証ヘッダーを受け入れる場合、
    // それをヘッダーとして設定します。
    // これは、ソースコードにシークレットをハードコードすることを避けるため、
    // OTLP_API_KEY環境変数からAPIキーを読み取ります。
    String apiKeyHeaderName = "api-key";
    String apiKeyHeaderValue = System.getenv("OTLP_API_KEY");

    // 類似のパターンを使用してOTLP Span、Metric、LogRecordエクスポーターを初期化
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
    // OTLP宛先が定期的に更新が必要なJWTなどの動的認証ヘッダーを要求する場合、
    // ヘッダーサプライヤーを使用します。
    // ここでは「Authorization: Bearer <token>」形式のヘッダーを追加するシンプルなサプライヤーを実装し、
    // <token>は10分ごとにrefreshBearerTokenから取得されます。
    String username = System.getenv("OTLP_USERNAME");
    String password = System.getenv("OTLP_PASSWORD");
    Supplier<Map<String, String>> supplier =
        new AuthHeaderSupplier(() -> refreshToken(username, password), Duration.ofMinutes(10));

    // 類似のパターンを使用してOTLP Span、Metric、LogRecordエクスポーターを初期化
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
    // 本番シナリオでは、これはユーザー名/パスワードをベアラートークンに交換するための
    // アウトオブバンドリクエストに置き換えられます。
    return "abc123";
  }
}
```
<!-- prettier-ignore-end -->

### テスト {#testing}

TODO: SDKのテストに利用可能なツールをドキュメント化

[JSONファイルエンコーディング]: /docs/specs/otel/protocol/file-exporter/#json-file-serialization
