---
title: 通貨サービス
linkTitle: 通貨
aliases: [currencyservice]
default_lang_commit: 123ef3a30290c929afac866dae2f9ab09f3778f1
cSpell:ignore: decltype labelkv noexcept nostd
---

このサービスは、異なる通貨間で金額を変換する機能を提供します。

[Currency service のソースコード](https://github.com/open-telemetry/opentelemetry-demo/blob/main/src/currency/)

## トレース {#traces}

### トレースの初期化 {#initializing-tracing}

OpenTelemetry SDK は `main` から、`tracer_common.h` で定義された `initTracer` 関数を使用して初期化されます。

```cpp
void initTracer()
{
  auto exporter = opentelemetry::exporter::otlp::OtlpGrpcExporterFactory::Create();
  auto processor =
      opentelemetry::sdk::trace::SimpleSpanProcessorFactory::Create(std::move(exporter));
  std::vector<std::unique_ptr<opentelemetry::sdk::trace::SpanProcessor>> processors;
  processors.push_back(std::move(processor));
  std::shared_ptr<opentelemetry::sdk::trace::TracerContext> context =
      opentelemetry::sdk::trace::TracerContextFactory::Create(std::move(processors));
  std::shared_ptr<opentelemetry::trace::TracerProvider> provider =
      opentelemetry::sdk::trace::TracerProviderFactory::Create(context);
 // グローバルトレースプロバイダーを設定する
  opentelemetry::trace::Provider::SetTracerProvider(provider);

 // グローバルプロパゲーターを設定する
  opentelemetry::context::propagation::GlobalTextMapPropagator::SetGlobalPropagator(
      opentelemetry::nostd::shared_ptr<opentelemetry::context::propagation::TextMapPropagator>(
          new opentelemetry::trace::propagation::HttpTraceContext()));
}
```

### 新しいスパンの作成 {#create-new-spans}

新しいスパンは `Tracer->StartSpan("spanName", attributes, options)` を使用して作成および開始できます。
スパンを作成したら、`Tracer->WithActiveSpan(span)` を使用してアクティブなコンテキストに配置する必要があります。
`Convert` 関数にこの例があります。

```cpp
std::string span_name = "CurrencyService/Convert";
auto span =
    get_tracer("currency")->StartSpan(span_name,
                                  {{SemanticConventions::kRpcSystem, "grpc"},
                                   {SemanticConventions::kRpcService, "oteldemo.CurrencyService"},
                                   {SemanticConventions::kRpcMethod, "Convert"},
                                   {SemanticConventions::kRpcGrpcStatusCode, 0}},
                                  options);
auto scope = get_tracer("currency")->WithActiveSpan(span);
```

### スパンへの属性の追加 {#adding-attributes-to-spans}

`Span->SetAttribute(key, value)` を使用して、スパンに属性を追加できます。

```cpp
span->SetAttribute("app.currency.conversion.from", from_code);
span->SetAttribute("app.currency.conversion.to", to_code);
```

### スパンイベントの追加 {#add-span-events}

スパンイベントの追加は `Span->AddEvent(name)` を使用して行います。

```cpp
span->AddEvent("Conversion successful, response sent back");
```

### スパンステータスの設定 {#set-span-status}

スパンのステータスを適切に `Ok` または `Error` に設定してください。
これは `Span->SetStatus(status)` を使用して行えます。

```cpp
span->SetStatus(StatusCode::kOk);
```

### トレースのコンテキスト伝搬 {#tracing-context-propagation}

C++ では伝搬は自動的に処理されません。
呼び出し元からコンテキストを抽出し、後続のスパンに伝搬コンテキストを注入する必要があります。
`GrpcServerCarrier` クラスは、受信 gRPC リクエストからコンテキストを抽出するメソッドを定義しており、サービスコールの実装で利用されています。

`GrpcServerCarrier` クラスは `tracer_common.h` で次のように定義されています。

```cpp
class GrpcServerCarrier : public opentelemetry::context::propagation::TextMapCarrier
{
public:
  GrpcServerCarrier(ServerContext *context) : context_(context) {}
  GrpcServerCarrier() = default;
  virtual opentelemetry::nostd::string_view Get(
      opentelemetry::nostd::string_view key) const noexcept override
  {
    auto it = context_->client_metadata().find(key.data());
    if (it != context_->client_metadata().end())
    {
      return it->second.data();
    }
    return "";
  }

  virtual void Set(opentelemetry::nostd::string_view key,
                   opentelemetry::nostd::string_view value) noexcept override
  {
   // サーバーでは不要
  }

  ServerContext *context_;
};
```

このクラスは `Convert` メソッドで利用され、コンテキストを抽出し、新しいスパンの作成時に使用される適切なコンテキストを含む `StartSpanOptions` オブジェクトを作成します。

```cpp
StartSpanOptions options;
options.kind = SpanKind::kServer;
GrpcServerCarrier carrier(context);

auto prop        = context::propagation::GlobalTextMapPropagator::GetGlobalPropagator();
auto current_ctx = context::RuntimeContext::GetCurrent();
auto new_context = prop->Extract(carrier, current_ctx);
options.parent   = GetSpan(new_context)->GetContext();
```

## メトリクス {#metrics}

### メトリクスの初期化 {#initializing-metrics}

OpenTelemetry の `MeterProvider` は `main()` から、`meter_common.h` で定義された `initMeter()` 関数を使用して初期化されます。

```cpp
void initMeter()
{
  // MetricExporter を構築する
  otlp_exporter::OtlpGrpcMetricExporterOptions otlpOptions;
  auto exporter = otlp_exporter::OtlpGrpcMetricExporterFactory::Create(otlpOptions);

  // MeterProvider と Reader を構築する
  metric_sdk::PeriodicExportingMetricReaderOptions options;
  std::unique_ptr<metric_sdk::MetricReader> reader{
      new metric_sdk::PeriodicExportingMetricReader(std::move(exporter), options) };
  auto provider = std::shared_ptr<metrics_api::MeterProvider>(new metric_sdk::MeterProvider());
  auto p = std::static_pointer_cast<metric_sdk::MeterProvider>(provider);
  p->AddMetricReader(std::move(reader));
  metrics_api::Provider::SetMeterProvider(provider);
}
```

### IntCounter の開始 {#starting-intcounter}

グローバル変数 `currency_counter` は `main()` で `meter_common.h` に定義された `initIntCounter()` 関数を呼び出して作成されます。

```cpp
nostd::unique_ptr<metrics_api::Counter<uint64_t>> initIntCounter()
{
  std::string counter_name = name + "_counter";
  auto provider = metrics_api::Provider::GetMeterProvider();
  nostd::shared_ptr<metrics_api::Meter> meter = provider->GetMeter(name, version);
  auto int_counter = meter->CreateUInt64Counter(counter_name);
  return int_counter;
}
```

### 通貨変換リクエストのカウント {#counting-currency-conversion-requests}

`CurrencyCounter()` メソッドは次のように実装されています。

```cpp
void CurrencyCounter(const std::string& currency_code)
{
    std::map<std::string, std::string> labels = { {"currency_code", currency_code} };
    auto labelkv = common::KeyValueIterableView<decltype(labels)>{ labels };
    currency_counter->Add(1, labelkv);
}
```

`Convert()` 関数が呼び出されるたびに、`to_code` として受信した通貨コードが変換のカウントに使用されます。

```cpp
CurrencyCounter(to_code);
```

## ログ {#logs}

OpenTelemetry の `LoggerProvider` は `main()` から、`logger_common.h` で定義された `initLogger()` 関数を使用して初期化されます。

```cpp
void initLogger() {
  otlp::OtlpGrpcLogRecordExporterOptions loggerOptions;
  auto exporter  = otlp::OtlpGrpcLogRecordExporterFactory::Create(loggerOptions);
  auto processor = logs_sdk::SimpleLogRecordProcessorFactory::Create(std::move(exporter));
  std::vector<std::unique_ptr<logs_sdk::LogRecordProcessor>> processors;
  processors.push_back(std::move(processor));
  auto context = logs_sdk::LoggerContextFactory::Create(std::move(processors));
  std::shared_ptr<logs::LoggerProvider> provider = logs_sdk::LoggerProviderFactory::Create(std::move(context));
  opentelemetry::logs::Provider::SetLoggerProvider(provider);
}
```

### LoggerProvider の使用 {#using-the-loggerprovider}

初期化された Logger Provider は `server.cpp` の `main` から呼び出されます。

```cpp
logger = getLogger(name);
```

ローカル変数 `logger` に代入されます。

```cpp
nostd::shared_ptr<opentelemetry::logs::Logger> logger;
```

これはコード内でログ出力が必要なときに使用されます。

```cpp
logger->Info(std::string(__func__) + " conversion successful");
```
