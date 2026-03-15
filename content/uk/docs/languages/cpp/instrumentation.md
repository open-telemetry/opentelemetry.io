---
title: Інструментування
linkTitle: Інструментування
aliases: [manual]
weight: 30
description: Інструментування для OpenTelemetry C++
default_lang_commit: 5489ba34bff91356aa2c501cd55f07eeb30cc355
cSpell:ignore: decltype labelkv nostd nullptr
---

<!-- markdownlint-disable no-duplicate-heading -->

{{% include instrumentation-intro.md %}}

> [!NOTE]
>
> OpenTelemetry C++ не підтримує автоматичне інструментування, коли вихідний код бібліотеки, яку ви хочете інструментувати, недоступний.

## Налаштування {#setup}

Дотримуйтесь інструкцій у [Посібнику з початку роботи](/docs/languages/cpp/getting-started/), щоб зібрати OpenTelemetry C++.

## Трейси {#traces}

### Ініціалізація трасування {#initialize-tracing}

```cpp
auto provider = opentelemetry::trace::Provider::GetTracerProvider();
auto tracer = provider->GetTracer("foo_library", "1.0.0");
```

`TracerProvider`, отриманий на першому кроці, є singleton-обʼєктом, який зазвичай надається OpenTelemetry C++ SDK. Він використовується для надання конкретних реалізацій для API інтерфейсів. У разі відсутності SDK, API надає стандартну реалізацію `TracerProvider`, яка нічого не робить.

`Tracer`, отриманий на другому кроці, потрібен для створення та запуску Відрізків.

### Запуск відрізка {#start-a-span}

```cpp
auto span = tracer->StartSpan("HandleRequest");
```

Це створює відрізок, встановлює його імʼя як `"HandleRequest"` і встановлює час початку на поточний час. Зверніться до документації API для інших операцій, які доступні для збагачення відрізків додатковими даними.

### Позначення відрізка як активного {#mark-a-span-as-active}

```cpp
auto scope = tracer->WithActiveSpan(span);
```

Це позначає відрізок як активний і повертає обʼєкт `Scope`. Обʼєкт scope контролює, як довго відрізок залишається активним. Відрізок залишається активним протягом життєвого циклу обʼєкта scope.

Концепція активного відрізка важлива, оскільки будь-який відрізок, створений без явного зазначення батька, буде мати батьком поточний активний відрізок. Відрізок без батька називається кореневим відрізком.

### Створення вкладених відрізків {#create-nested-spans}

```cpp
auto outer_span = tracer->StartSpan("Outer operation");
auto outer_scope = tracer->WithActiveSpan(outer_span);
{
    auto inner_span = tracer->StartSpan("Inner operation");
    auto inner_scope = tracer->WithActiveSpan(inner_span);
    // ... виконання внутрішньої операції
    inner_span->End();
}
// ... виконання зовнішньої операції
outer_span->End();
```

Відрізки можуть бути вкладеними та мати відношення пращур-нащадок з іншими відрізками. Коли даний відрізок активний, новостворений відрізок успадковує ідентифікатор трасування активного відрізка та інші атрибути контексту.

### Поширення контексту {#context-propagation}

```cpp
// встановлення глобального пропагатора
opentelemetry::context::propagation::GlobalTextMapPropagator::SetGlobalPropagator(
    nostd::shared_ptr<opentelemetry::context::propagation::TextMapPropagator>(
        new opentelemetry::trace::propagation::HttpTraceContext()));

// отримання глобального пропагатора
HttpTextMapCarrier<opentelemetry::ext::http::client::Headers> carrier;
auto propagator =
    opentelemetry::context::propagation::GlobalTextMapPropagator::GetGlobalPropagator();

// інʼєкція контексту в заголовки
auto current_ctx = opentelemetry::context::RuntimeContext::GetCurrent();
propagator->Inject(carrier, current_ctx);

// вилучення заголовків у контекст
auto current_ctx = opentelemetry::context::RuntimeContext::GetCurrent();
auto new_context = propagator->Extract(carrier, current_ctx);
auto remote_span = opentelemetry::trace::propagation::GetSpan(new_context);
```

`Context` містить метадані поточного активного відрізка, включаючи ідентифікатор відрізка, ідентифікатор трасування та прапорці. Поширення контексту є важливим механізмом у розподіленому трасуванні для передачі цього контексту через межі сервісів, часто через HTTP заголовки. OpenTelemetry надає підхід на основі тексту для поширення контексту до віддалених сервісів за допомогою HTTP заголовків W3C Trace Context.

### Додатково {#further-reading}

- [Traces API](https://opentelemetry-cpp.readthedocs.io/en/latest/otel_docs/namespace_opentelemetry__trace.html)
- [Traces SDK](https://opentelemetry-cpp.readthedocs.io/en/latest/otel_docs/namespace_opentelemetry__sdk__trace.html)
- [Простий приклад метрик](https://github.com/open-telemetry/opentelemetry-cpp/tree/main/examples/metrics_simple)

## Метрики {#metrics}

### Ініціалізація експортера та читача {#initialize-exporter-and-reader}

Ініціалізуйте експортера та читача. У цьому випадку ви ініціалізуєте OStream Exporter, який робить вивід у stdout. Читач періодично збирає метрики з Aggregation Store та експортує їх.

```cpp
std::unique_ptr<opentelemetry::sdk::metrics::MetricExporter> exporter{new opentelemetry::exporters::OStreamMetricExporter};
std::unique_ptr<opentelemetry::sdk::metrics::MetricReader> reader{
    new opentelemetry::sdk::metrics::PeriodicExportingMetricReader(std::move(exporter), options)};
```

### Ініціалізація постачальника метрик {#initialize-a-meter-provider}

Ініціалізуйте MeterProvider та додайте читача. Використовуйте це для отримання обʼєктів Meter у майбутньому.

```cpp
auto provider = std::shared_ptr<opentelemetry::metrics::MeterProvider>(new opentelemetry::sdk::metrics::MeterProvider());
auto p = std::static_pointer_cast<opentelemetry::sdk::metrics::MeterProvider>(provider);
p->AddMetricReader(std::move(reader));
```

### Створення лічильника {#create-a-counter}

Створіть інструмент лічильника з Meter та запишіть вимірювання. Кожен вказівник Meter, повернутий MeterProvider, вказує на той самий Meter. Це означає, що Meter може обʼєднувати метрики, захоплені з різних функцій, без необхідності постійно передавати Meter по бібліотеці.

```cpp
auto meter = provider->GetMeter(name, "1.2.0");
auto double_counter = meter->CreateDoubleCounter(counter_name);
// Створення набору міток, який анотує значення метрик
std::map<std::string, std::string> labels = {{"key", "value"}};
auto labelkv = common::KeyValueIterableView<decltype(labels)>{labels};
double_counter->Add(val, labelkv);
```

### Створення гістограми {#create-a-histogram}

Створіть інструмент гістограми з Meter та запишіть вимірювання.

```cpp
auto meter = provider->GetMeter(name, "1.2.0");
auto histogram_counter = meter->CreateDoubleHistogram("histogram_name");
histogram_counter->Record(val, labelkv);
```

### Створення спостережуваного лічильника {#create-an-observable-counter}

Створіть інструмент спостережуваного лічильника з Meter та додайте зворотний виклик. Зворотний виклик використовується для запису вимірювання під час збору метрик. Переконайтеся, що обʼєкт Instrument активний протягом усього часу збору.

```cpp
auto meter = provider->GetMeter(name, "1.2.0");
auto counter = meter->CreateDoubleObservableCounter(counter_name);
counter->AddCallback(MeasurementFetcher::Fetcher, nullptr);
```

### Створення представлень {#create-views}

#### Зіставлення інструмента лічильника з агрегацією суми {#map-the-counter-instrument-to-sum-aggregation}

Створіть представлення для відображення інструменту лічильника з агрегацією суми. Додайте це представлення до постачальника. Створення представлення необовʼязкове, якщо ви не хочете додати налаштування агрегації та обробника атрибутів. SDK метрик створює відсутнє представлення з типовим відображенням між інструментом та агрегацією.

```cpp
std::unique_ptr<opentelemetry::sdk::metrics::InstrumentSelector> instrument_selector{
    new opentelemetry::sdk::metrics::InstrumentSelector(opentelemetry::sdk::metrics::InstrumentType::kCounter, "counter_name")};
std::unique_ptr<opentelemetry::sdk::metrics::MeterSelector> meter_selector{
    new opentelemetry::sdk::metrics::MeterSelector(name, version, schema)};
std::unique_ptr<opentelemetry::sdk::metrics::View> sum_view{
    new opentelemetry::sdk::metrics::View{name, "description", opentelemetry::sdk::metrics::AggregationType::kSum}};
p->AddView(std::move(instrument_selector), std::move(meter_selector), std::move(sum_view));
```

#### Зіставлення інструменту гістограми з агрегацією гістограми {#map-the-histogram-instrument-to-histogram-aggregation}

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

#### Зіставлення інструменту спостережуваного лічильника з агрегацією суми {#map-the-observable-counter-instrument-to-sum-aggregation}

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

### Додатково {#further-reading}

- [Metrics API](https://opentelemetry-cpp.readthedocs.io/en/latest/otel_docs/namespace_opentelemetry__metrics.html#)
- [Metrics SDK](https://opentelemetry-cpp.readthedocs.io/en/latest/otel_docs/namespace_opentelemetry__sdk__metrics.html)
- [Простий приклад метрик](https://github.com/open-telemetry/opentelemetry-cpp/tree/main/examples/metrics_simple)

## Логи {#logs}

Документація для API та SDK логів відсутня, ви можете допомогти зробити її доступною, [редагуючи цю сторінку](https://github.com/open-telemetry/opentelemetry.io/edit/main/content/en/docs/languages/cpp/instrumentation.md).

## Наступні кроки {#next-steps}

Вам також потрібно буде налаштувати відповідний експортер для [експорту ваших даних телеметрії](/docs/languages/cpp/exporters) до одного або кількох бекендів телеметрії.
