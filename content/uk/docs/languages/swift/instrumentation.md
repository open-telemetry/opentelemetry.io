---
title: Інструментування
weight: 30
aliases: [manual]
description: Інструментування для OpenTelemetry Swift
default_lang_commit: edc67aafea1ead97b94ed4054d2c3248a34b0389
---

{{% include instrumentation-intro %}}

## Налаштування {#setup}

[OpenTelemetry Swift](https://github.com/open-telemetry/opentelemetry-swift/blob/cc8fff2d3e72171d559f1d9a4a13d87b0f55427f/Sources/OpenTelemetryApi/OpenTelemetry.swift) надає обмежену функціональність у своїй стандартній конфігурації. Для більш корисної функціональності потрібні деякі налаштування.

Стандартний зареєстрований `TracerProvider` та `MetricProvider` не налаштовані з експортером. Існує кілька [експортерів](https://github.com/open-telemetry/opentelemetry-swift/tree/main/Sources/Exporters) доступних залежно від ваших потреб. Нижче ми розглянемо налаштування OTLP експортера, який можна використовувати для надсилання даних до [колектора](/docs/collector/).

```swift
import GRPC
import OpenTelemetryApi
import OpenTelemetrySdk
import OpenTelemetryProtocolExporter

// ініціалізація OtlpTraceExporter
let otlpConfiguration = OtlpConfiguration(timeout: OtlpConfiguration.DefaultTimeoutInterval)

let grpcChannel = ClientConnection.usingPlatformAppropriateTLS(for: MultiThreadedEventLoopGroup(numberOfThreads:1))
                                                  .connect(host: <collector host>, port: <collector port>)

let traceExporter = OtlpTraceExporter(channel: grpcChannel,
                                      config: otlpConfiguration)

// створення та реєстрація Tracer Provider з використанням створеного otlp trace exporter
OpenTelemetry.registerTracerProvider(tracerProvider: TracerProviderBuilder()
                                                      .add(spanProcessor:SimpleSpanProcessor(spanExporter: traceExporter))
                                                      .with(resource: Resource())
                                                      .build())
```

Схожий шаблон використовується для OtlpMetricExporter:

```swift
// otlpConfiguration та grpcChannel можна використовувати повторно
OpenTelemetry.registerMeterProvider(meterProvider: MeterProviderBuilder()
            .with(processor: MetricProcessorSdk())
            .with(exporter: OtlpMetricExporter(channel: channel, config: otlpConfiguration))
            .with(resource: Resource())
            .build())
```

Після налаштування MeterProvider та TracerProvider всі наступні ініціалізовані інструменти будуть експортувати дані за допомогою цього OTLP експортера.

## Трейси {#traces}

### Отримання Tracer {#acquiring-a-tracer}

Для виконання трасування вам потрібен трасувальник. Трасувальник отримується через провайдера трасувальників і відповідає за створення відрізків. OpenTelemetry керує провайдером трасувальників, як ми визначили та зареєстрували вище. Для створення трасувальника потрібна назва інструменту та необовʼязкова версія:

```swift
let  tracer = OpenTelemetry.instance.tracerProvider.get(instrumentationName: "instrumentation-library-name", instrumentationVersion: "1.0.0")
```

### Створення Відрізків {#creating-spans}

[Відрізок](/docs/concepts/signals/traces/#spans) представляє одиницю роботи або операцію. Відрізки є будівельними блоками Трейсів. Для створення відрізка використовуйте будівельник відрізків, повʼязаний з трасувальником:

```swift
let span = tracer.spanBuilder(spanName: "\(name)").startSpan()
...
span.end()
```

Необхідно викликати `end()`, щоб завершити відрізок.

### Створення вкладених відрізків {#creating-nested-spans}

Відрізки використовуються для побудови відносин між операціями. Нижче наведено приклад як ми можемо вручну побудувати відносини між відрізками.

Нижче у нас є `parent()`, що викликає `child()`, і як вручну повʼязати відрізки кожного з цих методів.

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
  // виконання роботи
  childSpan.end()
}
```

Відносини пращур-нащадок будуть автоматично повʼязані, якщо використовується `activeSpan`:

```swift
func parent() {
  let parentSpan = someTracer.spanBuilder(spanName: "parent span")
                      .setActive(true) // автоматично встановлює контекст
                      .startSpan()
  child()
  parentSpan.end()
}

func child() {
  let childSpan = someTracer.spanBuilder(spanName: "child span")
                             .startSpan() // автоматично захоплює `active span` як батько
  // виконання роботи
  childSpan.end()
}
```

### Отримання поточного відрізка {#getting-the-current-span}

Іноді корисно зробити щось з поточним/активним відрізком. Ось як отримати доступ до поточного відрізка з будь-якої точки вашого коду.

```swift
let currentSpan = OpenTelemetry.instance.contextProvider.activeSpan
```

### Атрибути відрізків {#span-attributes}

Відрізки також можуть бути анотовані додатковими атрибутами. Всі відрізки будуть автоматично анотовані атрибутами `Resource`, прикріпленими до провайдера трасувальників. SDK Opentelemetry-swift вже надає інструментування загальних атрибутів у інструментуванні `SDKResourceExtension`. У цьому прикладі відрізок для мережевого запиту захоплює деталі про цей запит, використовуючи наявні [семантичні домовленості](/docs/specs/semconv/general/trace/).

```swift
let span = tracer.spanBuilder("/resource/path").startSpan()
span.setAttribute("http.method", "GET");
span.setAttribute("http.url", url.toString());
```

### Створення подій відрізка {#creating-span-events}

Подія Відрізка може бути розглянута як структуроване повідомлення логу (або анотація) на відрізку, зазвичай використовується для позначення значущої, одиничної точки в часі під час тривалості відрізка.

```swift
let attributes = [
    "key" : AttributeValue.string("value"),
    "result" : AttributeValue.int(100)
]
span.addEvent(name: "computation complete", attributes: attributes)
```

### Встановлення статусу відрізка {#setting-span-status}

{{% include "span-status-preamble" %}}

```swift
func myFunction() {
  let span = someTracer.spanBuilder(spanName: "my span").startSpan()
  defer {
    span.end()
  }
  guard let criticalData = get() else {
      span.status = .error(description: "щось пішло не так")
      return
  }
  // виконання чогось
}
```

### Запис помилок у відрізки {#recording-exceptions-in-spans}

Семантичні конвенції надають спеціальне позначення для подій, що записують помилки:

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

## Метрики {#metrics}

Документація для API та SDK метрик відсутня, ви можете допомогти зробити її доступною, [редагуючи цю сторінку](https://github.com/open-telemetry/opentelemetry.io/edit/main/content/en/docs/languages/swift/instrumentation.md).

## Логи {#logs}

API та SDK логів наразі розробляються.

## Конфігурація SDK {#sdk-configuration}

### Процесори {#processors}

OpenTelemetry-swift пропонує різні процесори Відрізків. `SimpleSpanProcessor` негайно пересилає завершені відрізки до експортера, тоді як `BatchSpanProcessor` групує їх і відправляє гуртом. Можна налаштувати кілька процесорів відрізків, щоб вони були активні одночасно, використовуючи `MultiSpanProcessor`. Наприклад, ви можете створити `SimpleSpanProcessor`, який експортує до логера, та `BatchSpanProcessor`, який експортує до OpenTelemetry Collector:

```swift
let otlpConfiguration = OtlpConfiguration(timeout: OtlpConfiguration.DefaultTimeoutInterval)

let grpcChannel = ClientConnection.usingPlatformAppropriateTLS(for: MultiThreadedEventLoopGroup(numberOfThreads:1))
                                                  .connect(host: <collector host>, port: <collector port>)

let traceExporter = OtlpTraceExporter(channel: grpcChannel
                                      config: otlpConfiguration)

// створення та реєстрація Tracer Provider з використанням створеного otlp trace exporter
OpenTelemetry.registerTracerProvider(tracerProvider: TracerProviderBuilder()
                                                      .add(spanProcessor:BatchSpanProcessor(spanExporter: traceExporter))
                                                      .add(spanProcessor:SimpleSpanProcessor(spanExporter: StdoutExporter))
                                                      .with(resource: Resource())
                                                      .build())
```

Процесор групових відрізків дозволяє налаштовувати різні параметри.

### Експортери {#exporters}

OpenTelemetry-Swift надає наступні експортери:

- `InMemoryExporter`: Зберігає дані відрізків у памʼяті. Це корисно для тестування та налагодження.
- `DatadogExporter`: Конвертує дані відрізків OpenTelemetry у трасування Datadog та події відрізків у логи Datadog.
- `JaegerExporter`: Конвертує дані відрізків OpenTelemetry у формат Jaeger та експортує до точки доступу Jaeger.
- Persistence exporter: Декоратор експортера, який надає збереження даних для наявних експортерів метрик та відрізків.
- `PrometheusExporter`: Конвертує дані метрик у формат Prometheus та експортує до точки доступу Prometheus.
- `StdoutExporter`: Експортує дані відрізків до Stdout. Корисно для налагодження.
- `ZipkinTraceExporter`: Експортує дані відрізків у формат Zipkin до точки доступу Zipkin.
