---
title: Сервіс Валют
linkTitle: Валюта
aliases: [currencyservice]
default_lang_commit: e05fefe6c9f7d8b159d9a9a95128098c646c78c4
cSpell:ignore: decltype labelkv loggerprovider noexcept nostd
---

Цей сервіс надає функціональність для конвертації сум між різними валютами.

[Сирці сервісу Валют](https://github.com/open-telemetry/opentelemetry-demo/blob/main/src/currency/)

## Трейси {#traces}

### Ініціалізація Трейсингу {#initializing-tracing}

SDK OpenTelemetry ініціалізується з `main` за допомогою функції `initTracer`, визначеної в `tracer_common.h`

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
 // Set the global trace provider
  opentelemetry::trace::Provider::SetTracerProvider(provider);

 // set global propagator
  opentelemetry::context::propagation::GlobalTextMapPropagator::SetGlobalPropagator(
      opentelemetry::nostd::shared_ptr<opentelemetry::context::propagation::TextMapPropagator>(
          new opentelemetry::trace::propagation::HttpTraceContext()));
}
```

### Створення нових відрізків {#create-new-spans}

Нові відрізки можуть бути створені та запущені за допомогою `Tracer->StartSpan("spanName", attributes, options)`. Після створення відрізку його потрібно запустити та помістити в активний контекст за допомогою `Tracer->WithActiveSpan(span)`. Ви можете знайти приклад цього у функції `Convert`.

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

### Додавання атрибутів до відрізків {#add-attributes-to-spans}

Ви можете додати атрибут до відрізка за допомогою `Span->SetAttribute(key, value)`.

```cpp
span->SetAttribute("app.currency.conversion.from", from_code);
span->SetAttribute("app.currency.conversion.to", to_code);
```

### Додавання подій до відрізків {#add-span-events}

Додавання подій до відрізків здійснюється за допомогою `Span->AddEvent(name)`.

```cpp
span->AddEvent("Conversion successful, response sent back");
```

### Встановлення статусу відрізка {#set-span-status}

Переконайтеся, що ви встановили статус вашого відрізка на `Ok` або `Error` відповідно. Ви можете зробити це за допомогою `Span->SetStatus(status)`

```cpp
span->SetStatus(StatusCode::kOk);
```

### Поширення контексту трейсингу {#trace-context-propagation}

У C++ поширення не обробляється автоматично. Вам потрібно витягти її з абонента та ввести поширення контексту в наступні відрізки. Клас `GrpcServerCarrier` визначає метод для витягування контексту з вхідних gRPC запитів, який використовується в реалізаціях викликів сервісу.

Клас `GrpcServerCarrier` визначений у `tracer_common.h` наступним чином:

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
   // Not required for server
  }

  ServerContext *context_;
};
```

Цей клас використовується в методі `Convert` для витягування контексту та створення
обʼєкта `StartSpanOptions` для збереження правильного контексту, який використовується при
створенні нових відрізків.

```cpp
StartSpanOptions options;
options.kind = SpanKind::kServer;
GrpcServerCarrier carrier(context);

auto prop        = context::propagation::GlobalTextMapPropagator::GetGlobalPropagator();
auto current_ctx = context::RuntimeContext::GetCurrent();
auto new_context = prop->Extract(carrier, current_ctx);
options.parent   = GetSpan(new_context)->GetContext();
```

## Метрики {#metrics}

### Ініціалізація Метрик {#initializing-metrics}

Постачальник метрик OpenTelemetry ініціалізується з `main()` за допомогою функції `initMeter()`, визначеної в `meter_common.h`.

```cpp
void initMeter()
{
  // Build MetricExporter
  otlp_exporter::OtlpGrpcMetricExporterOptions otlpOptions;
  auto exporter = otlp_exporter::OtlpGrpcMetricExporterFactory::Create(otlpOptions);

  // Build MeterProvider and Reader
  metric_sdk::PeriodicExportingMetricReaderOptions options;
  std::unique_ptr<metric_sdk::MetricReader> reader{
      new metric_sdk::PeriodicExportingMetricReader(std::move(exporter), options) };
  auto provider = std::shared_ptr<metrics_api::MeterProvider>(new metric_sdk::MeterProvider());
  auto p = std::static_pointer_cast<metric_sdk::MeterProvider>(provider);
  p->AddMetricReader(std::move(reader));
  metrics_api::Provider::SetMeterProvider(provider);
}
```

### Запуск IntCounter {#starting-intcounter}

Глобальна змінна `currency_counter` створюється в `main()`, викликаючи функцію `initIntCounter()`, визначену в `meter_common.h`.

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

### Підрахунок запитів на конвертацію валюти {#counting-currency-conversions-requests}

Метод `CurrencyCounter()` реалізований наступним чином:

```cpp
void CurrencyCounter(const std::string& currency_code)
{
    std::map<std::string, std::string> labels = { {"currency_code", currency_code} };
    auto labelkv = common::KeyValueIterableView<decltype(labels)>{ labels };
    currency_counter->Add(1, labelkv);
}
```

Кожного разу, коли викликається функція `Convert()`, код валюти, отриманий як `to_code`, використовується для підрахунку конвертацій.

```cpp
CurrencyCounter(to_code);
```

## Логи {#logs}

Постачальник логів OpenTelemetry ініціалізується з `main()` за допомогою функції `initLogger()`, визначеної в `logger_common.h`.

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

### Використання LoggerProvider {#using-the-loggerprovider}

Ініціалізований постачальник логів викликається з `main` у `server.cpp`:

```cpp
logger = getLogger(name);
```

Він призначає логер локальній змінній під назвою `logger`:

```cpp
nostd::shared_ptr<opentelemetry::logs::Logger> logger;
```

Яка потім використовується в коді, коли потрібно записати рядок:

```cpp
logger->Info(std::string(__func__) + " conversion successful");
```
