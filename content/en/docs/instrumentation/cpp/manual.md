---
title: Manual Instrumentation
linkTitle: Manual
weight: 3
---

Manual instrumentation is the process of adding observability code to your
application.

## Tracing

### Initializing tracing

```cpp
auto provider = opentelemetry::trace::Provider::GetTracerProvider();
auto tracer = provider->GetTracer("foo_library", "1.0.0");
```

The `TracerProvider` acquired in the first step is a singleton object that is
usually provided by the OpenTelemetry C++ SDK. It is used to provide specific
implementations for API interfaces. In case no SDK is used, the API provides a
default no-op implementation of a `TracerProvider`.

The `Tracer` acquired in the second step is needed to create and start Spans.

### Start a span

```cpp
auto span = tracer->StartSpan("HandleRequest");
```

This creates a span, sets its name to `"HandleRequest"`, and sets its start time
to the current time. Refer to the API documentation for other operations that
are available to enrich spans with additional data.

### Mark a span as active

```cpp
auto scope = tracer->WithActiveSpan(span);
```

This marks a span as active and returns a `Scope` object. The scope object
controls how long a span is active. The span remains active for the lifetime of
the scope object.

The concept of an active span is important, as any span that is created without
explicitly specifying a parent is parented to the currently active span. A span
without a parent is called root span.

### Create nested Spans

```cpp
auto outer_span = tracer->StartSpan("Outer operation");
auto outer_scope = tracer->WithActiveSpan(outer_span);
{
    auto inner_span = tracer->StartSpan("Inner operation");
    auto inner_scope = tracer->WithActiveSpan(inner_span);
    // ... perform inner operation
    inner_span->End();
}
// ... perform outer operation
outer_span->End();
```

Spans can be nested, and have a parent-child relationship with other spans. When
a given span is active, the newly created span inherits the active span’s trace
ID, and other context attributes.

### Context Propagation

```cpp
// set global propagator
opentelemetry::context::propagation::GlobalTextMapPropagator::SetGlobalPropagator(
    nostd::shared_ptr<opentelemetry::context::propagation::TextMapPropagator>(
        new opentelemetry::trace::propagation::HttpTraceContext()));

// get global propagator
HttpTextMapCarrier<opentelemetry::ext::http::client::Headers> carrier;
auto propagator =
    opentelemetry::context::propagation::GlobalTextMapPropagator::GetGlobalPropagator();

//inject context to headers
auto current_ctx = opentelemetry::context::RuntimeContext::GetCurrent();
propagator->Inject(carrier, current_ctx);

//Extract headers to context
auto current_ctx = opentelemetry::context::RuntimeContext::GetCurrent();
auto new_context = propagator->Extract(carrier, current_ctx);
auto remote_span = opentelemetry::trace::propagation::GetSpan(new_context);
```

`Context` contains the meta-data of the currently active Span including Span Id,
Trace Id, and flags. Context Propagation is an important mechanism in
distributed tracing to transfer this Context across service boundary often
through HTTP headers. OpenTelemetry provides a text-based approach to propagate
context to remote services using the W3C Trace Context HTTP headers.

### Further Reading

* [Traces API](https://opentelemetry-cpp.readthedocs.io/en/latest/otel_docs/namespace_opentelemetry__trace.html)
* [Traces SDK](https://opentelemetry-cpp.readthedocs.io/en/latest/otel_docs/namespace_opentelemetry__sdk__trace.html)
* [Simple Metrics Example](https://github.com/open-telemetry/opentelemetry-cpp/tree/main/examples/metrics_simple)


## Metrics

### Initialize Exporter and Reader

Initialize an exporter and a reader. In this case, we initialize an OStream Exporter which will print to stdout by default. The reader periodically collects metrics from the Aggregation Store and exports them.

```cpp
std::unique_ptr<opentelemetry::sdk::metrics::MetricExporter> exporter{new opentelemetry::exporters::OStreamMetricExporter};
std::unique_ptr<opentelemetry::sdk::metrics::MetricReader> reader{
    new opentelemetry::sdk::metrics::PeriodicExportingMetricReader(std::move(exporter), options)};
```

### Initialize Meter Provider

Initialize a MeterProvider and add the reader. We will use this to obtain Meter objects in the future.

```cpp
auto provider = std::shared_ptr<opentelemetry::metrics::MeterProvider>(new opentelemetry::sdk::metrics::MeterProvider());
auto p = std::static_pointer_cast<opentelemetry::sdk::metrics::MeterProvider>(provider);
p->AddMetricReader(std::move(reader));
```

### Create a Counter

Create a Counter instrument from the Meter, and record the measurement. Every Meter pointer returned by the MeterProvider points to the same Meter. This means that the Meter will be able to combine metrics captured from different functions without having to constantly pass the Meter around the library.

```cpp
auto meter = provider->GetMeter(name, "1.2.0");
auto double_counter = meter->CreateDoubleCounter(counter_name);
// Create a label set which annotates metric values
std::map<std::string, std::string> labels = {{"key", "value"}};
auto labelkv = common::KeyValueIterableView<decltype(labels)>{labels};
double_counter->Add(val, labelkv);
```

### Create a Histogram

Create a Histogram instrument from the Meter, and record the measurement.

```cpp
auto meter = provider->GetMeter(name, "1.2.0");
auto histogram_counter = meter->CreateDoubleHistogram("histogram_name");
histogram_counter->Record(val, labelkv);
```

### Create Observable Counter

Create a Observable Counter Instrument from the Meter, and add a callback. The callback would be used to record the measurement during metrics collection. Ensure to keep the Instrument object active for the lifetime of collection.

```cpp
auto meter = provider->GetMeter(name, "1.2.0");
auto counter = meter->CreateDoubleObservableCounter(counter_name);
counter->AddCallback(MeasurementFetcher::Fetcher, nullptr);
```

### Create Views

#### Map the Counter Instrument to Sum Aggregation

Create a view to map the Counter Instrument to Sum Aggregation. Add this view to provider. View creation is optional unless we want to add custom aggregation config, and attribute processor. Metrics SDK will implicitly create a missing view with default mapping between Instrument and Aggregation.

```cpp
std::unique_ptr<opentelemetry::sdk::metrics::InstrumentSelector> instrument_selector{
    new opentelemetry::sdk::metrics::InstrumentSelector(opentelemetry::sdk::metrics::InstrumentType::kCounter, "counter_name")};
std::unique_ptr<opentelemetry::sdk::metrics::MeterSelector> meter_selector{
    new opentelemetry::sdk::metrics::MeterSelector(name, version, schema)};
std::unique_ptr<opentelemetry::sdk::metrics::View> sum_view{
    new opentelemetry::sdk::metrics::View{name, "description", opentelemetry::sdk::metrics::AggregationType::kSum}};
p->AddView(std::move(instrument_selector), std::move(meter_selector), std::move(sum_view));
```

#### Map the Histogram Instrument to Histogram Aggregation

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

#### Map the Observable Counter Instrument to Sum Aggregation

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

### Further Reading

* [Metrics API](https://opentelemetry-cpp.readthedocs.io/en/latest/otel_docs/namespace_opentelemetry__metrics.html#)
* [Metrics SDK](https://opentelemetry-cpp.readthedocs.io/en/latest/otel_docs/namespace_opentelemetry__sdk__metrics.html)
* [Simple Metrics Example](https://github.com/open-telemetry/opentelemetry-cpp/tree/main/examples/metrics_simple)
