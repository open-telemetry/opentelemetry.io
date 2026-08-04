---
title: 計装
linkTitle: 計装
aliases: [manual]
weight: 30
description: OpenTelemetry C++ の計装
default_lang_commit: 8518c2b82e8a8c44062e9028348c6d2af75961a5
cSpell:ignore: decltype labelkv nostd nullptr
---

<!-- markdownlint-disable no-duplicate-heading -->

{{% include instrumentation-intro.md %}}

> [!NOTE]
>
> OpenTelemetry C++ は、計装したいライブラリのソースコードが利用できない場合、自動計装をサポートしていません。

## セットアップ {#setup}

[入門ガイド](/docs/languages/cpp/getting-started/)の手順に従って OpenTelemetry C++ をビルドしてください。

## トレース {#traces}

### トレーシングの初期化 {#initialize-tracing}

```cpp
auto provider = opentelemetry::trace::Provider::GetTracerProvider();
auto tracer = provider->GetTracer("foo_library", "1.0.0");
```

最初のステップで取得した `TracerProvider` は、通常 OpenTelemetry C++ SDK によって提供されるシングルトンオブジェクトです。
これは API インターフェイスに対する具体的な実装を提供するために使用されます。
SDK が使用されない場合、API はデフォルトの no-op 実装の `TracerProvider` を提供します。

2番目のステップで取得した `Tracer` は、スパンの作成と開始に必要です。

### スパンの開始 {#start-a-span}

```cpp
auto span = tracer->StartSpan("HandleRequest");
```

これはスパンを作成し、名前を `"HandleRequest"` に設定し、開始時間を現在の時刻に設定します。
スパンに追加データを付与するための他の操作については、API ドキュメントを参照してください。

### スパンをアクティブにする {#mark-a-span-as-active}

```cpp
auto scope = tracer->WithActiveSpan(span);
```

これはスパンをアクティブとしてマークし、`Scope` オブジェクトを返します。
スコープオブジェクトはスパンがアクティブである期間を制御します。
スパンはスコープオブジェクトの存続期間中、アクティブのままです。

アクティブスパンの概念は重要です。
親を明示的に指定せずに作成されたスパンは、現在のアクティブスパンの子となります。
親を持たないスパンはルートスパンと呼ばれます。

### ネストされたスパンの作成 {#create-nested-spans}

```cpp
auto outer_span = tracer->StartSpan("Outer operation");
auto outer_scope = tracer->WithActiveSpan(outer_span);
{
    auto inner_span = tracer->StartSpan("Inner operation");
    auto inner_scope = tracer->WithActiveSpan(inner_span);
    // ... 内部操作を実行
    inner_span->End();
}
// ... 外部操作を実行
outer_span->End();
```

スパンはネストでき、他のスパンとの親子関係を持ちます。
あるスパンがアクティブな場合、新しく作成されたスパンはアクティブスパンのトレース ID とその他のコンテキスト属性を継承します。

### コンテキスト伝搬 {#context-propagation}

```cpp
// グローバルプロパゲーターを設定
opentelemetry::context::propagation::GlobalTextMapPropagator::SetGlobalPropagator(
    nostd::shared_ptr<opentelemetry::context::propagation::TextMapPropagator>(
        new opentelemetry::trace::propagation::HttpTraceContext()));

// グローバルプロパゲーターを取得
HttpTextMapCarrier<opentelemetry::ext::http::client::Headers> carrier;
auto propagator =
    opentelemetry::context::propagation::GlobalTextMapPropagator::GetGlobalPropagator();

// ヘッダーにコンテキストを注入
auto current_ctx = opentelemetry::context::RuntimeContext::GetCurrent();
propagator->Inject(carrier, current_ctx);

// ヘッダーからコンテキストを抽出
auto current_ctx = opentelemetry::context::RuntimeContext::GetCurrent();
auto new_context = propagator->Extract(carrier, current_ctx);
auto remote_span = opentelemetry::trace::propagation::GetSpan(new_context);
```

`Context` には、スパン ID、トレース ID、フラグを含む現在アクティブなスパンのメタデータが含まれます。
コンテキスト伝搬は、分散トレーシングにおいてこのコンテキストをサービス境界を越えて転送する重要なメカニズムで、多くの場合 HTTP ヘッダーを通じて行われます。
OpenTelemetry は、W3C Trace Context HTTP ヘッダーを使用してリモートサービスにコンテキストを伝搬するためのテキストベースのアプローチを提供します。

### 参考資料 {#further-reading}

- [Traces API](https://opentelemetry-cpp.readthedocs.io/en/latest/otel_docs/namespace_opentelemetry__trace.html)
- [Traces SDK](https://opentelemetry-cpp.readthedocs.io/en/latest/otel_docs/namespace_opentelemetry__sdk__trace.html)
- [Simple Metrics Example](https://github.com/open-telemetry/opentelemetry-cpp/tree/main/examples/metrics_simple)

## メトリクス {#metrics}

### エクスポーターとリーダーの初期化 {#initialize-exporter-and-reader}

エクスポーターとリーダーを初期化します。
ここでは、デフォルトで stdout に出力する OStream エクスポーターを初期化します。
リーダーは定期的に集約ストアからメトリクスを収集し、エクスポートします。

```cpp
std::unique_ptr<opentelemetry::sdk::metrics::MetricExporter> exporter{new opentelemetry::exporters::OStreamMetricExporter};
std::unique_ptr<opentelemetry::sdk::metrics::MetricReader> reader{
    new opentelemetry::sdk::metrics::PeriodicExportingMetricReader(std::move(exporter), options)};
```

### メータープロバイダーの初期化 {#initialize-a-meter-provider}

MeterProvider を初期化し、リーダーを追加します。
将来 Meter オブジェクトを取得するためにこれを使用します。

```cpp
auto provider = std::shared_ptr<opentelemetry::metrics::MeterProvider>(new opentelemetry::sdk::metrics::MeterProvider());
auto p = std::static_pointer_cast<opentelemetry::sdk::metrics::MeterProvider>(provider);
p->AddMetricReader(std::move(reader));
```

### カウンターの作成 {#create-a-counter}

Meter からカウンター計装を作成し、計測値を記録します。
MeterProvider が返すすべての Meter ポインターは同じ Meter を指します。
これにより、ライブラリ内で Meter を常に持ち回さなくても、異なる関数からキャプチャされたメトリクスを Meter が結合できます。

```cpp
auto meter = provider->GetMeter(name, "1.2.0");
auto double_counter = meter->CreateDoubleCounter(counter_name);
// メトリクス値にアノテーションを付けるラベルセットを作成
std::map<std::string, std::string> labels = {{"key", "value"}};
auto labelkv = common::KeyValueIterableView<decltype(labels)>{labels};
double_counter->Add(val, labelkv);
```

### ヒストグラムの作成 {#create-a-histogram}

Meter からヒストグラム計装を作成し、計測値を記録します。

```cpp
auto meter = provider->GetMeter(name, "1.2.0");
auto histogram_counter = meter->CreateDoubleHistogram("histogram_name");
histogram_counter->Record(val, labelkv);
```

### オブザーバブルカウンターの作成 {#create-an-observable-counter}

Meter からオブザーバブルカウンター計装を作成し、コールバックを追加します。
コールバックはメトリクス収集時に計測値を記録するために使用されます。
収集の存続期間中、計装オブジェクトをアクティブに保つようにしてください。

```cpp
auto meter = provider->GetMeter(name, "1.2.0");
auto counter = meter->CreateDoubleObservableCounter(counter_name);
counter->AddCallback(MeasurementFetcher::Fetcher, nullptr);
```

### ビューの作成 {#create-views}

#### カウンター計装を Sum 集約にマッピング {#map-the-counter-instrument-to-sum-aggregation}

カウンター計装を Sum 集約にマッピングするビューを作成します。
このビューをプロバイダーに追加します。
ビューの作成は、カスタムの集約設定や属性プロセッサーを追加する場合を除きオプションです。
Metrics SDK は、計装と集約の間のデフォルトのマッピングで、欠落しているビューを作成します。

```cpp
std::unique_ptr<opentelemetry::sdk::metrics::InstrumentSelector> instrument_selector{
    new opentelemetry::sdk::metrics::InstrumentSelector(opentelemetry::sdk::metrics::InstrumentType::kCounter, "counter_name")};
std::unique_ptr<opentelemetry::sdk::metrics::MeterSelector> meter_selector{
    new opentelemetry::sdk::metrics::MeterSelector(name, version, schema)};
std::unique_ptr<opentelemetry::sdk::metrics::View> sum_view{
    new opentelemetry::sdk::metrics::View{name, "description", opentelemetry::sdk::metrics::AggregationType::kSum}};
p->AddView(std::move(instrument_selector), std::move(meter_selector), std::move(sum_view));
```

#### ヒストグラム計装をヒストグラム集約にマッピング {#map-the-histogram-instrument-to-histogram-aggregation}

```cpp
std::unique_ptr<opentelemetry::sdk::metrics::InstrumentSelector> histogram_instrument_selector{
    new opentelemetry::sdk::metrics::InstrumentSelector(opentelemetry::sdk::metrics::InstrumentType::kHistogram, "histogram_name")};
std::unique_ptr<opentelemetry::sdk::metrics::MeterSelector> histogram_meter_selector{
    new opentelemetry::sdk::metrics::MeterSelector(name, version, schema)};
std::unique_ptr<opentelemetry::sdk::metrics::View> histogram_view{
    new opentelemetry::sdk::metrics::View{name, "description", opentelemetry::sdk::metrics::AggregationType::kHistogram}};
p->AddView(std::move(histogram_instrument_selector), std::move(histogram_meter_selector),
    std::move(histogram_view));
```

#### オブザーバブルカウンター計装を Sum 集約にマッピング {#map-the-observable-counter-instrument-to-sum-aggregation}

```cpp
std::unique_ptr<opentelemetry::sdk::metrics::InstrumentSelector> observable_instrument_selector{
    new opentelemetry::sdk::metrics::InstrumentSelector(opentelemetry::sdk::metrics::InstrumentType::kObservableCounter,
                                     "observable_counter_name")};
std::unique_ptr<opentelemetry::sdk::metrics::MeterSelector> observable_meter_selector{
  new opentelemetry::sdk::metrics::MeterSelector(name, version, schema)};
std::unique_ptr<opentelemetry::sdk::metrics::View> observable_sum_view{
  new opentelemetry::sdk::metrics::View{name, "description", opentelemetry::sdk::metrics::AggregationType::kSum}};
p->AddView(std::move(observable_instrument_selector), std::move(observable_meter_selector),
         std::move(observable_sum_view));
```

### 参考資料 {#further-reading-1}

- [Metrics API](https://opentelemetry-cpp.readthedocs.io/en/latest/otel_docs/namespace_opentelemetry__metrics.html#)
- [Metrics SDK](https://opentelemetry-cpp.readthedocs.io/en/latest/otel_docs/namespace_opentelemetry__sdk__metrics.html)
- [Simple Metrics Example](https://github.com/open-telemetry/opentelemetry-cpp/tree/main/examples/metrics_simple)

## ログ {#logs}

### エクスポーターとプロセッサーの初期化 {#initialize-exporter-and-processor}

エクスポーターとプロセッサーを初期化します。
ここでは、デフォルトで stdout にログレコードを出力する OStream エクスポーターを初期化します。
プロセッサーは、LogRecord をエクスポーターに到達する前にエクスポート可能な表現に変換する役割を担います。

```cpp
auto exporter = opentelemetry::exporter::logs::OStreamLogRecordExporterFactory::Create();
auto processor =
    opentelemetry::sdk::logs::SimpleLogRecordProcessorFactory::Create(std::move(exporter));
```

### ロガープロバイダーの登録 {#register-a-logger-provider}

`LoggerProviderFactory` を使用して `LoggerProvider` を作成し、グローバルプロバイダーとして登録します。
ファクトリは `unique_ptr` を返しますが、`SetLoggerProvider` は `shared_ptr` を期待することに注意してください。
プロバイダーを使用して `Logger` オブジェクトを取得します。
ロガーには発信元コンポーネントを識別するために名前を付けることができます。

```cpp
// LoggerProviderFactory::Create は unique_ptr を返すため、
// SetLoggerProvider 用に shared_ptr でラップする
std::shared_ptr<opentelemetry::logs::LoggerProvider> provider(
    opentelemetry::sdk::logs::LoggerProviderFactory::Create(std::move(processor)));
opentelemetry::logs::Provider::SetLoggerProvider(provider);
auto logger = provider->GetLogger(name, "1.0.0");
```

### ログレコードの発行 {#emit-a-log-record}

取得したロガーを使用して構造化ログレコードを発行します。
サポートされる重大度の値には、`kTrace`、`kDebug`、`kInfo`、`kWarn`、`kError`、`kFatal` があります。

オプションで、スパンをスコープに**暗黙的に**追加してそのスコープ内でログを記録するか、トレース ID、スパン ID、フラグを**明示的に**渡すことで、ログレコードにトレースコンテキストを付与できます。

#### アクティブスパンスコープを使用する場合 {#with-active-span-scope}

スパンをスコープに追加して現在のアクティブランタイムコンテキストを設定すると、そのスコープ内で発行されたすべてのログレコードに自動的にスパンコンテキストのメタデータが付与されます。

```cpp
{
  auto span = get_tracer()->StartSpan("HandleRequest");
  auto scope = opentelemetry::trace::Scope{span};
  // このログレコードはアクティブスコープから
  // trace_id、span_id、trace_flags などを取得する
  logger->Info("Handling request");
}
```

#### 明示的なトレースコンテキストを使用する場合 {#with-explicit-trace-context}

トレースコンテキストを明示的に渡すこともできます。

```cpp
auto span = get_tracer()->StartSpan("HandleRequest");
auto ctx = span->GetContext();
logger->Info("Handling request", ctx.trace_id(), ctx.span_id(), ctx.trace_flags());
```

### 参考資料 {#further-reading-2}

- [Logs API](/docs/specs/otel/logs/api/)
- [Logs SDK](/docs/specs/otel/logs/sdk/)
- [Sample Logs Example](https://github.com/open-telemetry/opentelemetry-cpp/tree/main/examples/logs_simple)

## 次のステップ {#next-steps}

テレメトリーデータを1つ以上のテレメトリーバックエンドに[エクスポート](/docs/languages/cpp/exporters)するために、適切なエクスポーターを設定することも必要です。
