---
title: Currency Service
linkTitle: Currency
aliases: [/docs/demo/services/currencyservice]
spelling: cSpell:ignore nostd noexcept millis chrono labelkv decltype
---

This service provides functionality to convert amounts between different
currencies.

[Currency service source](https://github.com/open-telemetry/opentelemetry-demo/blob/main/src/currencyservice/)

## Traces

### Initializing Tracing

The OpenTelemetry SDK is initialized from `main` using the `initTracer` function
defined in `tracer_common.h`

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

### Create new spans

New spans can be created and started using
`Tracer->StartSpan("spanName", attributes, options)`. After a span is created
you need to start and put it into active context using
`Tracer->WithActiveSpan(span)`. You can find an example of this in the `Convert`
function.

```cpp
    std::string span_name = "CurrencyService/Convert";
    auto span =
        get_tracer("currencyservice")->StartSpan(span_name,
                                      {{SemanticConventions::kRpcSystem, "grpc"},
                                       {SemanticConventions::kRpcService, "CurrencyService"},
                                       {SemanticConventions::kRpcMethod, "Convert"},
                                       {SemanticConventions::kRpcGrpcStatusCode, 0}},
                                      options);
    auto scope = get_tracer("currencyservice")->WithActiveSpan(span);
```

### Adding attributes to spans

You can add an attribute to a span using `Span->SetAttribute(key, value)`.

```cpp
    span->SetAttribute("app.currency.conversion.from", from_code);
    span->SetAttribute("app.currency.conversion.to", to_code);
```

### Add span events

Adding span events is accomplished using `Span->AddEvent(name)`.

```cpp
    span->AddEvent("Conversion successful, response sent back");
```

### Set span status

Make sure to set your span status to OK, or Error accordingly. You can do this
using `Span->SetStatus(status)`

```cpp
    span->SetStatus(StatusCode::kOk);
```

### Tracing context propagation

In C++ propagation is not automatically handled. You need to extract it from the
caller and inject the propagation context into subsequent spans. The
`GrpcServerCarrier` class defines a method to extract context from inbound gRPC
requests which is leveraged in the service call implementations.

The `GrpcServerCarrier` class is defined in `tracer_common.h` as follows:

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

This class is leveraged in the `Convert` method to extract context and create a
`StartSpanOptions` object to contain the right context which is used when
creating new spans.

```cpp
    StartSpanOptions options;
    options.kind = SpanKind::kServer;
    GrpcServerCarrier carrier(context);

    auto prop        = context::propagation::GlobalTextMapPropagator::GetGlobalPropagator();
    auto current_ctx = context::RuntimeContext::GetCurrent();
    auto new_context = prop->Extract(carrier, current_ctx);
    options.parent   = GetSpan(new_context)->GetContext();
```

## Metrics

### Initializing Metrics

The OpenTelemetry `MeterProvider` is initialized from `main()` using the
`initMeter()` function defined in `meter_common.h`.

```cpp
void initMeter()
{
  // Build MetricExporter
  otlp_exporter::OtlpGrpcMetricExporterOptions otlpOptions;

  // Configuration via environment variable not supported yet
  otlpOptions.endpoint = "otelcol:4317";
  otlpOptions.aggregation_temporality = metric_sdk::AggregationTemporality::kDelta;
  auto exporter = otlp_exporter::OtlpGrpcMetricExporterFactory::Create(otlpOptions);

  // Build MeterProvider and Reader
  metric_sdk::PeriodicExportingMetricReaderOptions options;
  options.export_interval_millis = std::chrono::milliseconds(1000);
  options.export_timeout_millis = std::chrono::milliseconds(500);
  std::unique_ptr<metric_sdk::MetricReader> reader{
      new metric_sdk::PeriodicExportingMetricReader(std::move(exporter), options) };
  auto provider = std::shared_ptr<metrics_api::MeterProvider>(new metric_sdk::MeterProvider());
  auto p = std::static_pointer_cast<metric_sdk::MeterProvider>(provider);
  p->AddMetricReader(std::move(reader));
  metrics_api::Provider::SetMeterProvider(provider);
}
```

### Starting IntCounter

A global `currency_counter` variable is created at `main()` calling the function
`initIntCounter()` defined in `meter_common.h`.

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

### Counting currency conversion requests

The method `CurrencyCounter()` is implemented as follows:

```cpp
void CurrencyCounter(const std::string& currency_code)
{
    std::map<std::string, std::string> labels = { {"currency_code", currency_code} };
    auto labelkv = common::KeyValueIterableView<decltype(labels)>{ labels };
    currency_counter->Add(1, labelkv);
}
```

Every time the function `Convert()` is called, the currency code received as
`to_code` is used to count the conversions.

```cpp
CurrencyCounter(to_code);
```

## Logs

TBD
