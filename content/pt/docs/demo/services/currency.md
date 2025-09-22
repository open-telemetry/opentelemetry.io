---
title: Serviço de Moeda
linkTitle: Moeda
aliases: [currencyservice]
cSpell:ignore: decltype labelkv noexcept nostd
---

Este serviço fornece funcionalidade para converter valores entre diferentes
moedas.

[Código fonte do serviço de moeda](https://github.com/open-telemetry/opentelemetry-demo/blob/main/src/currency/)

## Rastreamentos

### Inicializando Rastreamento

O SDK do OpenTelemetry é inicializado a partir de `main` usando a função `initTracer`
definida em `tracer_common.h`

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

### Criar novos spans

Novos spans podem ser criados e iniciados usando
`Tracer->StartSpan("spanName", attributes, options)`. Após um span ser criado
você precisa iniciá-lo e colocá-lo no contexto ativo usando
`Tracer->WithActiveSpan(span)`. Você pode encontrar um exemplo disso na função `Convert`.

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

### Adicionando atributos a spans

Você pode adicionar um atributo a um span usando `Span->SetAttribute(key, value)`.

```cpp
span->SetAttribute("app.currency.conversion.from", from_code);
span->SetAttribute("app.currency.conversion.to", to_code);
```

### Adicionar eventos de span

Adicionar eventos de span é realizado usando `Span->AddEvent(name)`.

```cpp
span->AddEvent("Conversion successful, response sent back");
```

### Definir status do span

Certifique-se de definir o status do seu span para `Ok`, ou `Error` adequadamente. Você pode fazer
isso usando `Span->SetStatus(status)`

```cpp
span->SetStatus(StatusCode::kOk);
```

### Propagação de contexto de rastreamento

Em C++ a propagação não é tratada automaticamente. Você precisa extraí-la do
chamador e injetar o contexto de propagação em spans subsequentes. A
classe `GrpcServerCarrier` define um método para extrair contexto de requisições gRPC
de entrada que é utilizada nas implementações de chamada do serviço.

A classe `GrpcServerCarrier` é definida em `tracer_common.h` da seguinte forma:

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

Esta classe é utilizada no método `Convert` para extrair contexto e criar um
objeto `StartSpanOptions` para conter o contexto correto que é usado quando
criando novos spans.

```cpp
StartSpanOptions options;
options.kind = SpanKind::kServer;
GrpcServerCarrier carrier(context);

auto prop        = context::propagation::GlobalTextMapPropagator::GetGlobalPropagator();
auto current_ctx = context::RuntimeContext::GetCurrent();
auto new_context = prop->Extract(carrier, current_ctx);
options.parent   = GetSpan(new_context)->GetContext();
```

## Métricas

### Inicializando Métricas

O `MeterProvider` do OpenTelemetry é inicializado a partir de `main()` usando a
função `initMeter()` definida em `meter_common.h`.

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

### Iniciando IntCounter

Uma variável global `currency_counter` é criada em `main()` chamando a função
`initIntCounter()` definida em `meter_common.h`.

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

### Contando requisições de conversão de moeda

O método `CurrencyCounter()` é implementado da seguinte forma:

```cpp
void CurrencyCounter(const std::string& currency_code)
{
    std::map<std::string, std::string> labels = { {"currency_code", currency_code} };
    auto labelkv = common::KeyValueIterableView<decltype(labels)>{ labels };
    currency_counter->Add(1, labelkv);
}
```

Toda vez que a função `Convert()` é chamada, o código de moeda recebido como
`to_code` é usado para contar as conversões.

```cpp
CurrencyCounter(to_code);
```

## Logs

O `LoggerProvider` do OpenTelemetry é inicializado a partir de `main()` usando a
função `initLogger()` definida em `logger_common.h`.

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

### Usando o LoggerProvider

O Logger Provider inicializado é chamado de `main` em `server.cpp`:

```cpp
logger = getLogger(name);
```

Ele atribui o logger a uma variável local chamada `logger`:

```cpp
nostd::shared_ptr<opentelemetry::logs::Logger> logger;
```

Que é então usado em todo o código sempre que precisamos registrar uma linha:

```cpp
logger->Info(std::string(__func__) + " conversion successful");
```
