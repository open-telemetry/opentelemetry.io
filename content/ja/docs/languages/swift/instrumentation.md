---
title: 計装
weight: 30
aliases: [manual]
description: OpenTelemetry Swift の計装
default_lang_commit: 2562c07f50da1830c78862c5055361038d9b5928
---

{{% include instrumentation-intro.md %}}

## セットアップ {#setup}

[OpenTelemetry Swift](https://github.com/open-telemetry/opentelemetry-swift/blob/cc8fff2d3e72171d559f1d9a4a13d87b0f55427f/Sources/OpenTelemetryApi/OpenTelemetry.swift) は、デフォルトの設定では限定的な機能のみを提供します。
より実用的な機能を利用するには、いくつかの設定が必要です。

デフォルトで登録されている `TracerProvider` と `MetricProvider` にはエクスポーターが設定されていません。
ニーズに応じて利用可能な[エクスポーター](https://github.com/open-telemetry/opentelemetry-swift/tree/main/Sources/Exporters)がいくつかあります。
以下では、[Collector](/docs/collector/) にデータを送信するために使用できる OTLP エクスポーターの設定について説明します。

```swift
import GRPC
import OpenTelemetryApi
import OpenTelemetrySdk
import OpenTelemetryProtocolExporter


// OtlpTraceExporter を初期化する
let otlpConfiguration = OtlpConfiguration(timeout: OtlpConfiguration.DefaultTimeoutInterval)

let grpcChannel = ClientConnection.usingPlatformAppropriateTLS(for: MultiThreadedEventLoopGroup(numberOfThreads:1))
                                                  .connect(host: <collector host>, port: <collector port>)

let traceExporter = OtlpTraceExporter(channel: grpcChannel,
                                      config: otlpConfiguration)

// ビルドした OTLP トレースエクスポーターを使用してトレーサープロバイダーをビルド・登録する
OpenTelemetry.registerTracerProvider(tracerProvider: TracerProviderBuilder()
                                                      .add(spanProcessor:SimpleSpanProcessor(spanExporter: traceExporter))
                                                      .with(resource: Resource())
                                                      .build())
```

OtlpMetricExporter でも同様のパターンを使用します。

```swift
// otlpConfiguration と grpcChannel は再利用可能
OpenTelemetry.registerMeterProvider(meterProvider: MeterProviderBuilder()
            .with(processor: MetricProcessorSdk())
            .with(exporter: OtlpMetricExporter(channel: channel, config: otlpConfiguration))
            .with(resource: Resource())
            .build())
```

MeterProvider と TracerProvider を設定すると、以降に初期化されるすべての計装は、この OTLP エクスポーターを使用してエクスポートされます。

## トレース {#traces}

### トレーサーの取得 {#acquiring-a-tracer}

トレーシングを行うにはトレーサーが必要です。
トレーサーはトレーサープロバイダーを通じて取得され、スパンの作成を担当します。
上記で定義・登録したように、OpenTelemetry がトレーサープロバイダーを管理します。
トレーサーの作成には、計装名と任意のバージョンが必要です。

```swift
let  tracer = OpenTelemetry.instance.tracerProvider.get(instrumentationName: "instrumentation-library-name", instrumentationVersion: "1.0.0")
```

### スパンの作成 {#creating-spans}

[スパン](/docs/concepts/signals/traces/#spans)は作業または操作の単位を表します。
スパンはトレースの構成要素です。
スパンを作成するには、トレーサーに関連付けられたスパンビルダーを使用します。

```swift
let span = tracer.spanBuilder(spanName: "\(name)").startSpan()
...
span.end()
```

スパンを終了するには `end()` を呼び出す必要があります。

### ネストしたスパンの作成 {#creating-nested-spans}

スパンは操作間の関係を構築するために使用されます。
以下は、スパン間の関係を手動で構築する方法の例です。

以下では `parent()` が `child()` を呼び出しており、各メソッドのスパンを手動でリンクする方法を示しています。

```swift
func parent() {
  let parentSpan = someTracer.spanBuilder(spanName: "parent span").startSpan()
  child(span: parentSpan)
  parentSpan.end()
}

func child(parentSpan: Span) {
let childSpan = someTracer.spanBuilder(spanName: "child span")
                             .setParent(parentSpan)
                             .startSpan()
  // 何らかの処理を行う
  childSpan.end()
}
```

`activeSpan` を使用すると、親子関係は自動的にリンクされます。

```swift
func parent() {
  let parentSpan = someTracer.spanBuilder(spanName: "parent span")
                      .setActive(true) // コンテキストを自動的に設定する
                      .startSpan()
  child()
  parentSpan.end()
}

func child() {
  let childSpan = someTracer.spanBuilder(spanName: "child span")
                             .startSpan() // 自動的に `active span` を親としてキャプチャする
  // 何らかの処理を行う
  childSpan.end()
}
```

### 現在のスパンの取得 {#getting-the-current-span}

現在のアクティブなスパンに対して何らかの操作を行うと便利な場合があります。
以下は、コードの任意の場所から現在のスパンにアクセスする方法です。

```swift
let currentSpan = OpenTelemetry.instance.contextProvider.activeSpan
```

### スパンの属性 {#span-attributes}

スパンには追加の属性でアノテーションを付けることもできます。
すべてのスパンには、トレーサープロバイダーに付与された `Resource` 属性が自動的にアノテーションとして付けられます。
OpenTelemetry Swift SDK は、`SDKResourceExtension` 計装で一般的な属性の計装を提供しています。
この例では、ネットワークリクエストのスパンに対して、既存の[セマンティック規約](/docs/specs/semconv/general/trace/)を使用してリクエストの詳細をキャプチャしています。

```swift
let span = tracer.spanBuilder("/resource/path").startSpan()
span.setAttribute("http.method", "GET");
span.setAttribute("http.url", url.toString());
```

### スパンイベントの作成 {#creating-span-events}

スパンイベントは、スパン上の構造化されたログメッセージ（またはアノテーション）と考えることができ、通常はスパンの期間中の意味のある単一の時点を示すために使用されます。

```swift
let attributes = [
    "key" : AttributeValue.string("value"),
    "result" : AttributeValue.int(100)
]
span.addEvent(name: "computation complete", attributes: attributes)
```

### スパンステータスの設定 {#setting-span-status}

{{% include "span-status-preamble.md" %}}

```swift
func myFunction() {
  let span = someTracer.spanBuilder(spanName: "my span").startSpan()
  defer {
    span.end()
  }
  guard let criticalData = get() else {
      span.status = .error(description: "something bad happened")
      return
  }
  // 何らかの処理を行う
}
```

### スパンでの例外の記録 {#recording-exceptions-in-spans}

セマンティック規約は、例外を記録するイベントに対して特別な区分を提供しています。

```swift
let span = someTracer.spanBuilder(spanName: "my span").startSpan()
do {
  try throwingFunction()
} catch {
  span.addEvent(name: SemanticAttributes.exception.rawValue,
    attributes: [SemanticAttributes.exceptionType.rawValue: AttributeValue.string(String(describing: type(of: error))),
                 SemanticAttributes.exceptionEscaped.rawValue: AttributeValue.bool(false),
                 SemanticAttributes.exceptionMessage.rawValue: AttributeValue.string(error.localizedDescription)])
  })
  span.status = .error(description: error.localizedDescription)
}
span.end()
```

## メトリクス {#metrics}

メトリクス API と SDK のドキュメントはまだありません。
[このページを編集](https://github.com/open-telemetry/opentelemetry.io/edit/main/content/en/docs/languages/swift/instrumentation.md)することで、ドキュメントの作成に貢献できます。

## ログ {#logs}

ログ API と SDK は現在開発中です。

## SDK の設定 {#sdk-configuration}

### プロセッサー {#processors}

OpenTelemetry Swift では、さまざまなスパンプロセッサーが提供されています。
`SimpleSpanProcessor` は終了したスパンを即座にエクスポーターに転送し、`BatchSpanProcessor` はスパンをバッチ処理してまとめて送信します。
`MultiSpanProcessor` を使用すると、複数のスパンプロセッサーを同時にアクティブに設定できます。
たとえば、ロガーにエクスポートする `SimpleSpanProcessor` と、OpenTelemetry Collector にエクスポートする `BatchSpanProcessor` を作成できます。

```swift
let otlpConfiguration = OtlpConfiguration(timeout: OtlpConfiguration.DefaultTimeoutInterval)

let grpcChannel = ClientConnection.usingPlatformAppropriateTLS(for: MultiThreadedEventLoopGroup(numberOfThreads:1))
                                                  .connect(host: <collector host>, port: <collector port>)

let traceExporter = OtlpTraceExporter(channel: grpcChannel
                                      config: otlpConfiguration)

// ビルドした OTLP トレースエクスポーターを使用してトレーサープロバイダーをビルド・登録する
OpenTelemetry.registerTracerProvider(tracerProvider: TracerProviderBuilder()
                                                      .add(spanProcessor:BatchSpanProcessor(spanExporter: traceExporter))
                                                      .add(spanProcessor:SimpleSpanProcessor(spanExporter: StdoutExporter))
                                                      .with(resource: Resource())
                                                      .build())
```

バッチスパンプロセッサーは、カスタマイズのためのさまざまなパラメーターを設定できます。

### エクスポーター {#exporters}

OpenTelemetry Swift では以下のエクスポーターが提供されています。

- `InMemoryExporter`: スパンデータをメモリに保持します。
  テストやデバッグに便利です。
- `DatadogExporter`: OpenTelemetry のスパンデータを Datadog のトレースに変換し、スパンイベントを Datadog のログに変換します。
- `JaegerExporter`: OpenTelemetry のスパンデータを Jaeger 形式に変換し、Jaeger のエンドポイントにエクスポートします。
- Persistence exporter: 既存のメトリクスおよびトレースエクスポーターにデータ永続化機能を提供するエクスポーターデコレーターです。
- `PrometheusExporter`: メトリクスデータを Prometheus 形式に変換し、Prometheus のエンドポイントにエクスポートします。
- `StdoutExporter`: スパンデータを標準出力にエクスポートします。
  デバッグに便利です。
- `ZipkinTraceExporter`: スパンデータを Zipkin 形式で Zipkin のエンドポイントにエクスポートします。
