---
title: Керування телеметрією за допомогою SDK
weight: 12
aliases: [exporters]
default_lang_commit: 5489ba34bff91356aa2c501cd55f07eeb30cc355
cSpell:ignore: FQCNs Interceptable Logback okhttp
---

<!-- markdownlint-disable blanks-around-fences -->
<?code-excerpt path-base="examples/java/configuration"?>

SDK є вбудованою референсною реалізацією [API](../api/), яка обробляє та експортує телеметрію, створену викликами API інструментування. Ця сторінка є концептуальним оглядом SDK, включаючи описи, посилання на відповідні Javadocs, координати артефактів, приклади програмної конфігурації та інше. Дивіться **[Конфігурація SDK](../configuration/)** для деталей щодо конфігурації SDK, включаючи [автоконфігурацію SDK без коду](../configuration/#zero-code-sdk-autoconfigure).

SDK складається з наступних основних компонентів:

- [SdkTracerProvider](#sdktracerprovider): Реалізація SDK для `TracerProvider`, включаючи інструменти для семплінгу, обробки та експортування відрізків.
- [SdkMeterProvider](#sdkmeterprovider): Реалізація SDK для `MeterProvider`, включаючи інструменти для конфігурації потоків метрик та читання/експорту метрик.
- [SdkLoggerProvider](#sdkloggerprovider): Реалізація SDK для `LoggerProvider`, включаючи інструменти для обробки та експортування логів.
- [TextMapPropagator](#textmappropagator): Пропагує контекст через межі процесів.

Ці компоненти обʼєднані в [OpenTelemetrySdk](#opentelemetrysdk), обʼєкт-носій, який робить зручним передавати повністю налаштовані [компоненти SDK](#sdk-components) для інструментування.

SDK постачається з різноманітними вбудованими компонентами, які достатні для багатьох випадків використання, і підтримує [інтерфейси плагінів](#sdk-plugin-extension-interfaces) для розширюваності.

## Інтерфейси розширення втулків SDK {#sdk-plugin-extension-interfaces}

Коли вбудовані компоненти недостатні, SDK можна розширити, реалізуючи різні інтерфейси розширення втулків:

- [Sampler](#sampler): Налаштовує, які відрізки записуються та семплюються.
- [SpanProcessor](#spanprocessor): Обробляє відрізки, коли вони починаються та закінчуються.
- [SpanExporter](#spanexporter): Експортує відрізки за межі процесу.
- [MetricReader](#metricreader): Читає агреговані метрики.
- [MetricExporter](#metricexporter): Експортує метрики за межі процесу.
- [LogRecordProcessor](#logrecordprocessor): Обробляє записи логів, коли вони створюються.
- [LogRecordExporter](#logrecordexporter): Експортує записи логів за межі процесу.
- [TextMapPropagator](#textmappropagator): Пропагує контекст через межі процесів.

## Компоненти SDK {#sdk-components}

Артефакт `io.opentelemetry:opentelemetry-sdk:{{% param vers.otel %}}` містить SDK OpenTelemetry.

Наступні розділи описують основні компоненти SDK, з якими працює користувач. Кожен розділ компонентів включає:

- Короткий опис, включаючи посилання на тип Javadoc.
- Якщо компонент є [інтерфейсом розширення втулків](#sdk-plugin-extension-interfaces), таблицю доступних вбудованих та `opentelemetry-java-contrib` реалізацій.
- Просту демонстрацію [програмної конфігурації](../configuration/#programmatic-configuration).
- Якщо компонент є [інтерфейсом розширення втулків](#sdk-plugin-extension-interfaces), просту демонстрацію користувацької реалізації.

### OpenTelemetrySdk

[OpenTelemetrySdk](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-sdk/latest/io/opentelemetry/sdk/OpenTelemetrySdk.html) є реалізацією SDK для [OpenTelemetry](../api/#opentelemetry). Це контейнер для основних компонентів SDK, який робить зручним передавання повністю налаштованих компонентів SDK для інструментування.

`OpenTelemetrySdk` налаштовується власником застосунку і складається з:

- [SdkTracerProvider](#sdktracerprovider): Реалізація SDK для `TracerProvider`.
- [SdkMeterProvider](#sdkmeterprovider): Реалізація SDK для `MeterProvider`.
- [SdkLoggerProvider](#sdkloggerprovider): Реалізація SDK для `LoggerProvider`.
- [ContextPropagators](#textmappropagator): Пропагує контекст через межі процесів.

Наступний фрагмент коду демонструє програмну конфігурацію `OpenTelemetrySdk`:

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

### Resource

[Resource](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-sdk-common/latest/io/opentelemetry/sdk/resources/Resource.html) є набором атрибутів, що визначають джерело телеметрії. Застосунок повинен асоціювати той самий ресурс з [SdkTracerProvider](#sdktracerprovider), [SdkMeterProvider](#sdkmeterprovider), [SdkLoggerProvider](#sdkloggerprovider).

> [!NOTE]
>
> [ResourceProviders](../configuration/#resourceprovider) додають контекстну інформацію до [автоконфігурованого](../configuration/#zero-code-sdk-autoconfigure) ресурсу на основі середовища. Дивіться документацію для списку доступних `ResourceProvider`.

Наступний фрагмент коду демонструє програмну конфігурацію `Resource`:

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

### SdkTracerProvider

[SdkTracerProvider](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-sdk-trace/latest/io/opentelemetry/sdk/trace/SdkTracerProvider.html) є реалізацією SDK для [TracerProvider](../api/#tracerprovider) і відповідає за обробку трасувальної телеметрії, створеної API.

`SdkTracerProvider` налаштовується власником застосунку і складається з:

- [Resource](#resource): Ресурс, з яким асоціюються відрізки.
- [Sampler](#sampler): Налаштовує, які відрізки записуються та семплюються.
- [SpanProcessors](#spanprocessor): Обробляє відрізки, коли вони починаються та закінчуються.
- [SpanExporters](#spanexporter): Експортує відрізки за межі процесу (у поєднанні з відповідними `SpanProcessor`).
- [SpanLimits](#spanlimits): Контролює обмеження даних, повʼязаних з відрізками.

Наступний фрагмент коду демонструє програмну конфігурацію `SdkTracerProvider`:

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

#### Sampler

[Sampler](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-sdk-trace/latest/io/opentelemetry/sdk/trace/samplers/Sampler.html) є [інтерфейсом розширення плагінів](#sdk-plugin-extension-interfaces), відповідальним за визначення, які відрізки записуються та семплюються.

> [!NOTE]
>
> Стандартно `SdkTracerProvider` налаштований з семплером `ParentBased(root=AlwaysOn)`. Це призводить до того, що 100% відрізків семплюються, якщо застосунок, що викликає, не виконує семплінг. Якщо це занадто шумно/дорого, змініть семплер.

Семплери, вбудовані в SDK та підтримувані спільнотою в `opentelemetry-java-contrib`:

| Клас                      | Артефакт                                                                                      | Опис                                                                                                                                          |
| ------------------------- | --------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `ParentBased`             | `io.opentelemetry:opentelemetry-sdk:{{% param vers.otel %}}`                                  | Семплює відрізки на основі статусу семплінгу батьківського відрізка.                                                                          |
| `AlwaysOn`                | `io.opentelemetry:opentelemetry-sdk:{{% param vers.otel %}}`                                  | Семплює всі відрізки.                                                                                                                         |
| `AlwaysOff`               | `io.opentelemetry:opentelemetry-sdk:{{% param vers.otel %}}`                                  | Відкидає всі відрізки.                                                                                                                        |
| `TraceIdRatioBased`       | `io.opentelemetry:opentelemetry-sdk:{{% param vers.otel %}}`                                  | Семплює відрізки на основі конфігурованого співвідношення.                                                                                    |
| `JaegerRemoteSampler`     | `io.opentelemetry:opentelemetry-sdk-extension-jaeger-remote-sampler:{{% param vers.otel %}}`  | Семплює відрізки на основі конфігурації з віддаленого сервера.                                                                                |
| `LinksBasedSampler`       | `io.opentelemetry.contrib:opentelemetry-samplers:{{% param vers.contrib %}}-alpha`            | Семплює відрізки на основі статусу семплінгу посилань відрізка.                                                                               |
| `RuleBasedRoutingSampler` | `io.opentelemetry.contrib:opentelemetry-samplers:{{% param vers.contrib %}}-alpha`            | Семплює відрізки на основі конфігурованих правил.                                                                                             |
| `ConsistentSamplers`      | `io.opentelemetry.contrib:opentelemetry-consistent-sampling:{{% param vers.contrib %}}-alpha` | Різні реалізації консистентного семплінгу, як визначено в [ймовірнісному семплінгу](/docs/specs/otel/trace/tracestate-probability-sampling/). |

Наступний фрагмент коду демонструє програмну конфігурацію `Sampler`:

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

Реалізуйте інтерфейс `Sampler`, щоб надати власну логіку семплінгу. Наприклад:

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
    // Викликається, коли відрізко починається, перед тим як будь-який SpanProcessor буде викликаний.
    // Якщо SamplingDecision є:
    // - DROP: відрізок відкидається. Створюється дійсний контекст відрізка, і SpanProcessor#onStart все ще викликається, але дані не записуються, і SpanProcessor#onEnd не викликається.
    // - RECORD_ONLY: відрізок записується, але не семплюється. Дані записуються у відрізок, викликаються SpanProcessor#onStart і SpanProcessor#onEnd, але статус семплінгу відрізка вказує, що він не повинен експортуватися за межі процесу.
    // - RECORD_AND_SAMPLE: відрізок записується і семплюється. Дані записуються у відрізок, викликаються SpanProcessor#onStart і SpanProcessor#onEnd, і статус семплінгу відрізка вказує, що він повинен експортуватися за межі процесу.
    return SpanKind.SERVER == spanKind ? SamplingResult.recordAndSample() : SamplingResult.drop();
  }

  @Override
  public String getDescription() {
    // Повертає опис семплера.
    return this.getClass().getSimpleName();
  }
}
```
<!-- prettier-ignore-end -->

#### SpanProcessor

[SpanProcessor](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-sdk-trace/latest/io/opentelemetry/sdk/trace/SpanProcessor.html) є [інтерфейсом розширення втулків](#sdk-plugin-extension-interfaces) зі зворотними викликами, які викликаються, коли відрізок починається і закінчується. Вони часто поєднуються з [SpanExporters](#spanexporter) для експорту відрізків за межі процесу, але мають інші застосування, такі як збагачення даних.

Процесори відрізків, вбудовані в SDK та підтримувані спільнотою в `opentelemetry-java-contrib`:

| Клас                      | Артефакт                                                                                    | Опис                                                                            |
| ------------------------- | ------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| `BatchSpanProcessor`      | `io.opentelemetry:opentelemetry-sdk:{{% param vers.otel %}}`                                | Пакує семпльовані відрізки та експортує їх через конфігурований `SpanExporter`. |
| `SimpleSpanProcessor`     | `io.opentelemetry:opentelemetry-sdk:{{% param vers.otel %}}`                                | Експортує кожен семпльований відрізок через конфігурований `SpanExporter`.      |
| `BaggageSpanProcessor`    | `io.opentelemetry.contrib:opentelemetry-baggage-processor:{{% param vers.contrib %}}-alpha` | Збагачує відрізки багажем.                                                      |
| `JfrSpanProcessor`        | `io.opentelemetry.contrib:opentelemetry-jfr-events:{{% param vers.contrib %}}-alpha`        | Створює події JFR зі відрізків.                                                 |
| `StackTraceSpanProcessor` | `io.opentelemetry.contrib:opentelemetry-span-stacktrace:{{% param vers.contrib %}}-alpha`   | Збагачує вибрані відрізки даними стеку викликів.                                |
| `InferredSpansProcessor`  | `io.opentelemetry.contrib:opentelemetry-inferred-spans:{{% param vers.contrib %}}-alpha`    | Генерує відрізки з async profiler замість інструментування.                     |

Наступний фрагмент коду демонструє програмну конфігурацію `SpanProcessor`:

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

Реалізуйте інтерфейс `SpanProcessor`, щоб надати власну логіку обробки відрізків. Наприклад:

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
    // Викликається, коли відрізок починається.
    // Збагачує запис користувацьким атрибутом.
    span.setAttribute("my.custom.attribute", "hello world");
  }

  @Override
  public boolean isStartRequired() {
    // Вказує, чи слід викликати onStart.
    return true;
  }

  @Override
  public void onEnd(ReadableSpan span) {
    // Викликається, коли спан закінчується.
  }

  @Override
  public boolean isEndRequired() {
    // Вказує, чи слід викликати onEnd.
    return false;
  }

  @Override
  public CompletableResultCode shutdown() {
    // Опціонально завершує роботу процесора та очищає будь-які ресурси.
    return CompletableResultCode.ofSuccess();
  }

  @Override
  public CompletableResultCode forceFlush() {
    // Опціонально обробляє будь-які записи, які були поставлені в чергу, але ще не оброблені.
    return CompletableResultCode.ofSuccess();
  }
}
```
<!-- prettier-ignore-end -->

#### SpanExporter

[SpanExporter](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-sdk-trace/latest/io/opentelemetry/sdk/trace/export/SpanExporter.html) є [інтерфейсом розширення втуліків](#sdk-plugin-extension-interfaces), відповідальним за експорт відрізків за межі процесу. Замість безпосередньої реєстрації з `SdkTracerProvider`, вони поєднуються з [SpanProcessors](#spanprocessor) (зазвичай `BatchSpanProcessor`).

Експортери відрізків, вбудовані в SDK та підтримувані спільнотою в `opentelemetry-java-contrib`:

| Клас                           | Артефакт                                                                                 | Опис                                                                             |
| ------------------------------ | ---------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| `OtlpHttpSpanExporter` **[1]** | `io.opentelemetry:opentelemetry-exporter-otlp:{{% param vers.otel %}}`                   | Експортує відрізки через OTLP `http/protobuf`.                                   |
| `OtlpGrpcSpanExporter` **[1]** | `io.opentelemetry:opentelemetry-exporter-otlp:{{% param vers.otel %}}`                   | Експортує відрізки через OTLP `grpc`.                                            |
| `LoggingSpanExporter`          | `io.opentelemetry:opentelemetry-exporter-logging:{{% param vers.otel %}}`                | Логує відрізки до JUL у форматі налагодження.                                    |
| `OtlpJsonLoggingSpanExporter`  | `io.opentelemetry:opentelemetry-exporter-logging-otlp:{{% param vers.otel %}}`           | Логує відрізки до JUL у кодуванні OTLP JSON.                                     |
| `OtlpStdoutSpanExporter`       | `io.opentelemetry:opentelemetry-exporter-logging-otlp:{{% param vers.otel %}}`           | Логує відрізки до `System.out` у OTLP [JSON file encoding][] (експериментально). |
| `ZipkinSpanExporter`           | `io.opentelemetry:opentelemetry-exporter-zipkin:{{% param vers.otel %}}`                 | Експортує відрізки до Zipkin.                                                    |
| `InterceptableSpanExporter`    | `io.opentelemetry.contrib:opentelemetry-processors:{{% param vers.contrib %}}-alpha`     | Передає відрізки до гнучкого перехоплювача перед експортом.                      |
| `KafkaSpanExporter`            | `io.opentelemetry.contrib:opentelemetry-kafka-exporter:{{% param vers.contrib %}}-alpha` | Експортує відрізки, записуючи їх до теми Kafka.                                  |

**[1]**: Дивіться [OTLP exporters](#otlp-exporters) для деталей реалізації.

Наступний фрагмент коду демонструє програмну конфігурацію `SpanExporter`:

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

Реалізуйте інтерфейс `SpanExporter`, щоб надати власну логіку експорту відрізків. Наприклад:

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
    // Експортує записи. Зазвичай записи надсилаються за межі процесу через якийсь мережевий протокол, але
    // ми просто логуватимемо для ілюстрації.
    logger.log(Level.INFO, "Експортування відрізків");
    spans.forEach(span -> logger.log(Level.INFO, "Відрізок: " + span));
    return CompletableResultCode.ofSuccess();
  }

  @Override
  public CompletableResultCode flush() {
    // Експортує будь-які записи, які були поставлені в чергу, але ще не експортовані.
    logger.log(Level.INFO, "очищення");
    return CompletableResultCode.ofSuccess();
  }

  @Override
  public CompletableResultCode shutdown() {
    // Завершує роботу експортера та очищає будь-які ресурси.
    logger.log(Level.INFO, "завершення роботи");
    return CompletableResultCode.ofSuccess();
  }
}
```
<!-- prettier-ignore-end -->

#### SpanLimits

[SpanLimits](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-sdk-trace/latest/io/opentelemetry/sdk/trace/SpanLimits.html) визначає обмеження для даних, захоплених відрізками, включаючи максимальну довжину атрибутів, максимальну кількість атрибутів та інше.

Наступний фрагмент коду демонструє програмну конфігурацію `SpanLimits`:

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

### SdkMeterProvider

[SdkMeterProvider](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-sdk-metrics/latest/io/opentelemetry/sdk/metrics/SdkMeterProvider.html) є реалізацією SDK для [MeterProvider](../api/#meterprovider) і відповідає за обробку метрик, створених API.

`SdkMeterProvider` налаштовується власником застосунку і складається з:

- [Resource](#resource): Ресурс, з яким асоціюються метрики.
- [MetricReader](#metricreader): Читає агрегований стан метрик.
  - Опціонально, з [CardinalityLimitSelector](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-sdk-metrics/latest/io/opentelemetry/sdk/metrics/export/CardinalityLimitSelector.html) для перевизначення обмеження кардинальності за типом інструменту. Якщо не встановлено, кожен інструмент обмежується 2000 унікальними комбінаціями атрибутів за цикл збору. Обмеження кардинальності також налаштовуються для окремих інструментів через [views](#views). Дивіться [обмеження кардинальності](/docs/specs/otel/metrics/sdk/#cardinality-limits) для деталей.
- [MetricExporter](#metricexporter): Експортує метрики за межі процесу (у поєднанні з відповідним `MetricReader`).
- [Views](#views): Налаштовує потоки метрик, включаючи відкидання невикористаних метрик.

Наступний фрагмент коду демонструє програмну конфігурацію `SdkMeterProvider`:

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
    // Розкоментуйте, щоб опціонально зареєструвати читач метрик з обмеженнями кардинальності
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

#### MetricReader

[MetricReader](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-sdk-metrics/latest/io/opentelemetry/sdk/metrics/export/MetricReader.html) є [інтерфейсом розширення втулків](#sdk-plugin-extension-interfaces), який відповідає за читання агрегованих метрик. Вони часто поєднуються з [MetricExporters](#metricexporter) для експорту метрик за межі процесу, але можуть також використовуватися для обслуговування метрик зовнішнім скреперам у протоколах на основі запитів.

Читачі метрик, вбудовані в SDK та підтримувані спільнотою в `opentelemetry-java-contrib`:

| Клас                   | Артефакт                                                                           | Опис                                                                                       |
| ---------------------- | ---------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| `PeriodicMetricReader` | `io.opentelemetry:opentelemetry-sdk:{{% param vers.otel %}}`                       | Читає метрики на періодичній основі та експортує їх через конфігурований `MetricExporter`. |
| `PrometheusHttpServer` | `io.opentelemetry:opentelemetry-exporter-prometheus:{{% param vers.otel %}}-alpha` | Обслуговує метрики на HTTP-сервері у різних форматах prometheus.                           |

Наступний фрагмент коду демонструє програмну конфігурацію `MetricReader`:

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

Реалізуйте інтерфейс `MetricReader`, щоб надати власну логіку читання метрик. Наприклад:

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
    // Викликається, коли SdkMeterProvider ініціалізується, надаючи обробника для збору метрик.
    collectionRef.set(collectionRegistration);
    executorService.scheduleWithFixedDelay(this::collectMetrics, 0, 60, TimeUnit.SECONDS);
  }

  private void collectMetrics() {
    // Збирає метрики. Зазвичай записи надсилаються за межі процесу через якийсь мережевий протокол, але ми
    // просто логуватимемо для ілюстрації.
    logger.log(Level.INFO, "Збір метрик");
    collectionRef
        .get()
        .collectAllMetrics()
        .forEach(metric -> logger.log(Level.INFO, "Метрика: " + metric));
  }

  @Override
  public CompletableResultCode forceFlush() {
    // Експортує будь-які записи, які були поставлені в чергу, але ще не експортовані.
    logger.log(Level.INFO, "очищення");
    return CompletableResultCode.ofSuccess();
  }

  @Override
  public CompletableResultCode shutdown() {
    // Завершує роботу експортера та очищає будь-які ресурси.
    logger.log(Level.INFO, "завершення роботи");
    return CompletableResultCode.ofSuccess();
  }

  @Override
  public AggregationTemporality getAggregationTemporality(InstrumentType instrumentType) {
    // Вказує необхідну агрегаційну тимчасовість як функцію типу інструменту
    return AggregationTemporalitySelector.deltaPreferred()
        .getAggregationTemporality(instrumentType);
  }

  @Override
  public MemoryMode getMemoryMode() {
    // Опціонально вказує режим памʼяті, вказуючи, чи можуть записи метрик бути повторно використані або повинні
    // бути незмінними
    return MemoryMode.REUSABLE_DATA;
  }

  @Override
  public Aggregation getDefaultAggregation(InstrumentType instrumentType) {
    // Опціонально вказує стандартну агрегацію як функцію типу інструменту
    return Aggregation.defaultAggregation();
  }
}
```
<!-- prettier-ignore-end -->

#### MetricExporter

[MetricExporter](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-sdk-metrics/latest/io/opentelemetry/sdk/metrics/export/MetricExporter.html) є [інтерфейсом розширення плагінів](#sdk-plugin-extension-interfaces), відповідальним за експорт метрик за межі процесу. Замість безпосередньої реєстрації з `SdkMeterProvider`, вони поєднуються з [PeriodicMetricReader](#metricreader).

Експортери метрик, вбудовані в SDK та підтримувані спільнотою в `opentelemetry-java-contrib`:

| Клас                             | Артефакт                                                                             | Опис                                                                            |
| -------------------------------- | ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------- |
| `OtlpHttpMetricExporter` **[1]** | `io.opentelemetry:opentelemetry-exporter-otlp:{{% param vers.otel %}}`               | Експортує метрики через OTLP `http/protobuf`.                                   |
| `OtlpGrpcMetricExporter` **[1]** | `io.opentelemetry:opentelemetry-exporter-otlp:{{% param vers.otel %}}`               | Експортує метрики через OTLP `grpc`.                                            |
| `LoggingMetricExporter`          | `io.opentelemetry:opentelemetry-exporter-logging:{{% param vers.otel %}}`            | Логує метрики до JUL у форматі налагодження.                                    |
| `OtlpJsonLoggingMetricExporter`  | `io.opentelemetry:opentelemetry-exporter-logging-otlp:{{% param vers.otel %}}`       | Логує метрики до JUL у кодуванні OTLP JSON.                                     |
| `OtlpStdoutMetricExporter`       | `io.opentelemetry:opentelemetry-exporter-logging-otlp:{{% param vers.otel %}}`       | Логує метрики до `System.out` у OTLP [JSON file encoding][] (експериментально). |
| `InterceptableMetricExporter`    | `io.opentelemetry.contrib:opentelemetry-processors:{{% param vers.contrib %}}-alpha` | Передає метрики до гнучкого перехоплювача перед експортом.                      |

**[1]**: Дивіться [OTLP exporters](#otlp-exporters) для деталей реалізації.

Наступний фрагмент коду демонструє програмну конфігурацію `MetricExporter`:

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

Реалізуйте інтерфейс `MetricExporter`, щоб надати власну логіку експорту метрик. Наприклад:

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
    // Експортує записи. Зазвичай записи надсилаються за межі процесу через якийсь мережевий протокол, але
    // ми просто логуватимемо для ілюстрації.
    logger.log(Level.INFO, "Експортування метрик");
    metrics.forEach(metric -> logger.log(Level.INFO, "Метрика: " + metric));
    return CompletableResultCode.ofSuccess();
  }

  @Override
  public CompletableResultCode flush() {
    // Експортує будь-які записи, які були поставлені в чергу, але ще не експортовані.
    logger.log(Level.INFO, "очищення");
    return CompletableResultCode.ofSuccess();
  }

  @Override
  public CompletableResultCode shutdown() {
    // Завершує роботу експортера та очищає будь-які ресурси.
    logger.log(Level.INFO, "завершення роботи");
    return CompletableResultCode.ofSuccess();
  }

  @Override
  public AggregationTemporality getAggregationTemporality(InstrumentType instrumentType) {
    // Вказує необхідну агрегаційну тимчасовість як функцію типу інструменту
    return AggregationTemporalitySelector.deltaPreferred()
        .getAggregationTemporality(instrumentType);
  }

  @Override
  public MemoryMode getMemoryMode() {
    // Опціонально вказує режим памʼяті, вказуючи, чи можуть записи метрик бути повторно використані або повинні
    // бути незмінними
    return MemoryMode.REUSABLE_DATA;
  }

  @Override
  public Aggregation getDefaultAggregation(InstrumentType instrumentType) {
    // Опціонально вказує стандартну агрегацію як функцію типу інструменту
    return Aggregation.defaultAggregation();
  }
}
```
<!-- prettier-ignore-end -->

#### Views

[Views](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-sdk-metrics/latest/io/opentelemetry/sdk/metrics/View.html) дозволяють налаштовувати потоки метрик, включаючи зміну імен метрик, описів метрик, агрегацій метрик (тобто межі кошиків гістограми), набір ключів атрибутів для збереження, обмеження кардинальності тощо.

> [!NOTE]
>
> Види мають дещо неінтуїтивну поведінку, коли кілька з них відповідають певному інструменту. Якщо один відповідний вид змінює імʼя метрики, а інший змінює агрегацію метрики, ви можете очікувати, що імʼя та агрегація зміняться, але це не так. Натомість створюються два потоки метрик: один з налаштованим імʼям метрики та стандартною агрегацією, а інший з оригінальним імʼям метрики та налаштованою агрегацією. Іншими словами, відповідні види _не обʼєднуються_. Для найкращих результатів налаштовуйте види з вузькими критеріями вибору (тобто вибирайте один конкретний інструмент).

Наступний фрагмент коду демонструє програмну конфігурацію `View`:

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

### SdkLoggerProvider

[SdkLoggerProvider](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-sdk-logs/latest/io/opentelemetry/sdk/logs/SdkLoggerProvider.html) є реалізацією SDK для [LoggerProvider](../api/#loggerprovider) і відповідає за обробку логів, створених API логів.

`SdkLoggerProvider` налаштовується власником застосунку і складається з:

- [Resource](#resource): Ресурс, з яким асоціюються логи.
- [LogRecordProcessor](#logrecordprocessor): Обробляє логи, коли вони створюються.
- [LogRecordExporter](#logrecordexporter): Експортує логи за межі процесу (у поєднанні з відповідним `LogRecordProcessor`).
- [LogLimits](#loglimits): Контролює обмеження даних, повʼязаних з логами.

Наступний фрагмент коду демонструє програмну конфігурацію `SdkLoggerProvider`:

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

#### LogRecordProcessor

[LogRecordProcessor](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-sdk-logs/latest/io/opentelemetry/sdk/logs/LogRecordProcessor.html) є [інтерфейсом розширення плагінів](#sdk-plugin-extension-interfaces) з зворотним викликом, який викликається, коли лог створюється. Вони часто поєднуються з [LogRecordExporters](#logrecordexporter) для експорту логів за межі процесу, але мають інші застосування, такі як збагачення даних.

Процесори логів, вбудовані в SDK та підтримувані спільнотою в `opentelemetry-java-contrib`:

| Клас                       | Артефакт                                                                             | Опис                                                                 |
| -------------------------- | ------------------------------------------------------------------------------------ | -------------------------------------------------------------------- |
| `BatchLogRecordProcessor`  | `io.opentelemetry:opentelemetry-sdk:{{% param vers.otel %}}`                         | Пакує логи та експортує їх через конфігурований `LogRecordExporter`. |
| `SimpleLogRecordProcessor` | `io.opentelemetry:opentelemetry-sdk:{{% param vers.otel %}}`                         | Експортує кожен лог через конфігурований `LogRecordExporter`.        |
| `EventToSpanEventBridge`   | `io.opentelemetry.contrib:opentelemetry-processors:{{% param vers.contrib %}}-alpha` | Записує події логів як події відрізків на поточному відрізку.        |

Наступний фрагмент коду демонструє програмну конфігурацію `LogRecordProcessor`:

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

Реалізуйте інтерфейс `LogRecordProcessor`, щоб надати власну логіку обробки логів. Наприклад:

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
    // Викликається, коли лог створюється.
    // Збагачує запис користувацьким атрибутом.
    logRecord.setAttribute(AttributeKey.stringKey("my.custom.attribute"), "hello world");
  }

  @Override
  public CompletableResultCode shutdown() {
    // Опціонально завершує роботу процесора та очищає будь-які ресурси.
    return CompletableResultCode.ofSuccess();
  }

  @Override
  public CompletableResultCode forceFlush() {
    // Опціонально обробляє будь-які записи, які були поставлені в чергу, але ще не оброблені.
    return CompletableResultCode.ofSuccess();
  }
}
```
<!-- prettier-ignore-end -->

#### LogRecordExporter

[LogRecordExporter](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-sdk-logs/latest/io/opentelemetry/sdk/logs/export/LogRecordExporter.html) є [інтерфейсом розширення плагінів](#sdk-plugin-extension-interfaces), відповідальним за експорт логів за межі процесу. Замість безпосередньої реєстрації з `SdkLoggerProvider`, вони поєднуються з [LogRecordProcessors](#logrecordprocessor) (зазвичай `BatchLogRecordProcessor`).

Експортери логів, вбудовані в SDK та підтримувані спільнотою в `opentelemetry-java-contrib`:

| Клас                                       | Артефакт                                                                             | Опис                                                                         |
| ------------------------------------------ | ------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------- |
| `OtlpHttpLogRecordExporter` **[1]**        | `io.opentelemetry:opentelemetry-exporter-otlp:{{% param vers.otel %}}`               | Експортує логи через OTLP `http/protobuf`.                                   |
| `OtlpGrpcLogRecordExporter` **[1]**        | `io.opentelemetry:opentelemetry-exporter-otlp:{{% param vers.otel %}}`               | Експортує логи через OTLP `grpc`.                                            |
| `SystemOutLogRecordExporter`               | `io.opentelemetry:opentelemetry-exporter-logging:{{% param vers.otel %}}`            | Логує логи до system out у форматі налагодження.                             |
| `OtlpJsonLoggingLogRecordExporter` **[2]** | `io.opentelemetry:opentelemetry-exporter-logging-otlp:{{% param vers.otel %}}`       | Логує логи до JUL у кодуванні OTLP JSON.                                     |
| `OtlpStdoutLogRecordExporter`              | `io.opentelemetry:opentelemetry-exporter-logging-otlp:{{% param vers.otel %}}`       | Логує логи до `System.out` у OTLP [JSON file encoding][] (експериментально). |
| `InterceptableLogRecordExporter`           | `io.opentelemetry.contrib:opentelemetry-processors:{{% param vers.contrib %}}-alpha` | Передає логи до гнучкого перехоплювача перед експортом.                      |

**[1]**: Дивіться [OTLP exporters](#otlp-exporters) для деталей реалізації.

**[2]**: `OtlpJsonLoggingLogRecordExporter` логує до JUL і може викликати нескінченні цикли (тобто JUL -> SLF4J -> Logback -> OpenTelemetry Appender -> OpenTelemetry Log SDK -> JUL), якщо не налаштований обережно.

Наступний фрагмент коду демонструє програмну конфігурацію `LogRecordExporter`:

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

Реалізуйте інтерфейс `LogRecordExporter`, щоб надати власну логіку експорту логів. Наприклад:

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
    // Експортує записи. Зазвичай записи надсилаються за межі процесу через якийсь мережевий протокол, але
    // ми просто логуватимемо для ілюстрації.
    System.out.println("Експортування логів");
    logs.forEach(log -> System.out.println("лог запис: " + log));
    return CompletableResultCode.ofSuccess();
  }

  @Override
  public CompletableResultCode flush() {
    // Експортує будь-які записи, які були поставлені в чергу, але ще не експортовані.
    logger.log(Level.INFO, "очищення");
    return CompletableResultCode.ofSuccess();
  }

  @Override
  public CompletableResultCode shutdown() {
    // Завершує роботу експортера та очищає будь-які ресурси.
    logger.log(Level.INFO, "завершення роботи");
    return CompletableResultCode.ofSuccess();
  }
}
```
<!-- prettier-ignore-end -->

#### LogLimits

[LogLimits](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-sdk-logs/latest/io/opentelemetry/sdk/logs/LogLimits.html) визначає обмеження для даних, захоплених логами, включаючи максимальну довжину атрибутів та максимальну кількість атрибутів.

Наступний фрагмент коду демонструє програмну конфігурацію `LogLimits`:

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

### TextMapPropagator

[TextMapPropagator](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-context/latest/io/opentelemetry/context/propagation/TextMapPropagator.html) є [інтерфейсом розширення плагінів](#sdk-plugin-extension-interfaces), відповідальним за пропагування контексту через межі процесів у текстовому форматі.

TextMapPropagators, вбудовані в SDK та підтримувані спільнотою в `opentelemetry-java-contrib`:

| Клас                        | Артефакт                                                                                      | Опис                                                                                          |
| --------------------------- | --------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| `W3CTraceContextPropagator` | `io.opentelemetry:opentelemetry-api:{{% param vers.otel %}}`                                  | Поширює контекст трасування за допомогою протоколу поширення W3C trace context.               |
| `W3CBaggagePropagator`      | `io.opentelemetry:opentelemetry-api:{{% param vers.otel %}}`                                  | Поширює багаж за допомогою протоколу поширення W3C baggage.                                   |
| `MultiTextMapPropagator`    | `io.opentelemetry:opentelemetry-context:{{% param vers.otel %}}`                              | Компонує кілька поширювачів.                                                                  |
| `JaegerPropagator`          | `io.opentelemetry:opentelemetry-extension-trace-propagators:{{% param vers.otel %}}`          | Поширює контекст трасування за допомогою протоколу поширення Jaeger.                          |
| `B3Propagator`              | `io.opentelemetry:opentelemetry-extension-trace-propagators:{{% param vers.otel %}}`          | Поширює контекст трасування за допомогою протоколу поширення B3.                              |
| `OtTracePropagator`         | `io.opentelemetry:opentelemetry-extension-trace-propagators:{{% param vers.otel %}}`          | Поширює контекст трасування за допомогою протоколу поширення OpenTracing.                     |
| `PassThroughPropagator`     | `io.opentelemetry:opentelemetry-api-incubator:{{% param vers.otel %}}-alpha`                  | Поширює конфігурований набір полів без участі в телеметрії.                                   |
| `AwsXrayPropagator`         | `io.opentelemetry.contrib:opentelemetry-aws-xray-propagator:{{% param vers.contrib %}}-alpha` | Поширює контекст трасування за допомогою протоколу поширення AWS X-Ray.                       |
| `AwsXrayLambdaPropagator`   | `io.opentelemetry.contrib:opentelemetry-aws-xray-propagator:{{% param vers.contrib %}}-alpha` | Поширює контекст трасування за допомогою змінних середовища та протоколу поширення AWS X-Ray. |

Наступний фрагмент коду демонструє програмну конфігурацію `TextMapPropagator`:

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

Реалізуйте інтерфейс `TextMapPropagator`, щоб надати власну логіку пропагування. Наприклад:

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
    // Повертає поля, які використовуються для пропагування. Дивіться W3CTraceContextPropagator для референсної реалізації.
    return Collections.emptyList();
  }

  @Override
  public <C> void inject(Context context, C carrier, TextMapSetter<C> setter) {
    // Впроваджує контекст. Дивіться W3CTraceContextPropagator для референсної реалізації.
  }

  @Override
  public <C> Context extract(Context context, C carrier, TextMapGetter<C> getter) {
    // Витягує контекст. Дивіться W3CTraceContextPropagator для референсної реалізації.
    return context;
  }
}
```
<!-- prettier-ignore-end -->

## Додаток {#appendix}

### Внутрішнє логування {#internal-logging}

Компоненти SDK логують різноманітну інформацію до [java.util.logging](https://docs.oracle.com/javase/7/docs/api/java/util/logging/package-summary.html), на різних рівнях логування та використовуючи імена логерів на основі повністю кваліфікованого імені класу відповідного компонента.

Стандартно, повідомлення логів обробляються кореневим обробником у вашому застосунку. Якщо ви не встановили користувацький кореневий обробник для вашого застосунку, логи рівня `INFO` або вище стандартно надсилаються до консолі.

Ви можете змінити поведінку логера для OpenTelemetry. Наприклад, ви можете зменшити рівень логування, щоб вивести додаткову інформацію під час налагодження, збільшити рівень для конкретного класу, щоб ігнорувати помилки, що надходять від цього класу, або встановити користувацький обробник або фільтр, щоб виконувати користувацький код щоразу, коли OpenTelemetry логує певне повідомлення. Детальний список імен логерів та інформації про логування не підтримується. Однак усі компоненти OpenTelemetry API, SDK, contrib та інструментування мають однаковий префікс пакунка `io.opentelemetry.*`. Може бути корисно увімкнути більш детальне логування для всіх `io.opentelemetry.*`, переглянути вивід та звузити до пакунків або FQCNs, що вас цікавлять.

Наприклад:

```properties
## Вимкнути все логування OpenTelemetry
io.opentelemetry.level = OFF
```

```properties
## Вимкнути логування лише для BatchSpanProcessor
io.opentelemetry.sdk.trace.export.BatchSpanProcessor.level = OFF
```

```properties
## Логувати повідомлення "FINE" для допомоги у налагодженні
io.opentelemetry.level = FINE

## Встановлює рівень стандартного логера для ConsoleHandler
## Зверніть увагу, що це впливає на логування поза OpenTelemetry також
java.util.logging.ConsoleHandler.level = FINE
```

Для більш детального контролю та спеціального оброблення можна вказати користувацькі обробники та фільтри за допомогою коду.

```java
// Користувацький фільтр, який не логує помилки, що надходять від експорту
public class IgnoreExportErrorsFilter implements java.util.logging.Filter {

 public boolean isLoggable(LogRecord record) {
    return !record.getMessage().contains("Exception thrown by the export");
 }
}
```

```properties
## Реєстрація користувацького фільтра на BatchSpanProcessor
io.opentelemetry.sdk.trace.export.BatchSpanProcessor = io.opentelemetry.extension.logging.IgnoreExportErrorsFilter
```

### Відправники OTLP експортерів {#otlp-exporters}

Розділи: [експортер відрізків](#spanexporter), [експортер метрик](#metricexporter) та [експортер логів](#logrecordexporter) описують OTLP експортери у формі:

- `OtlpHttp{Signal}Exporter` експортує дані через OTLP `http/protobuf`.
- `OtlpGrpc{Signal}Exporter` експортує дані через OTLP `grpc`.

Експортери для всіх сигналів доступні через `io.opentelemetry:opentelemetry-exporter-otlp:{{% param vers.otel %}}` і мають значний збіг між версіями `grpc` та `http/protobuf` протоколу OTLP протоколу OTLP, а також між сигналами. У наступних розділах детально розглянуто ці ключові поняття:

- [Відправники](#senders): абстракція для різних клієнтських бібліотек HTTP / gRPC.
- [Автентифікація](#authentication): опції для експортерів OTLP.

#### Відправники {#senders}

Експортери залежать від різних клієнтських бібліотек для виконання HTTP та gRPC запитів. Немає єдиної клієнтської бібліотеки HTTP / gRPC, яка задовольняє всі випадки використання в екосистемі Java:

- Java 11+ приносить вбудований `java.net.http.HttpClient`, але `opentelemetry-java` потрібно підтримувати користувачів Java 8+, і це не можна використовувати для експорту через `gRPC`, оскільки немає підтримки trailer header.
- [OkHttp](https://square.github.io/okhttp/) надає потужний HTTP клієнт з підтримкою trailer header, але залежить від стандартної бібліотеки kotlin.
- [grpc-java](https://github.com/grpc/grpc-java) надає власну абстракцію `ManagedChannel` з різними [реалізаціями транспорту](https://github.com/grpc/grpc-java#transport), але не підходить для `http/protobuf`.

Щоб задовольнити різні випадки використання, `opentelemetry-exporter-otlp` використовує внутрішню абстракцію "відправника" з різними реалізаціями, щоб відобразити обмеження застосунку. Щоб вибрати іншу реалізацію, виключіть стандартну залежність `io.opentelemetry:opentelemetry-exporter-sender-okhttp` та додайте залежність від альтернативи.

| Артефакт                                                                                              | Опис                                                      | Протоколи OTLP          | Стандартно |
| ----------------------------------------------------------------------------------------------------- | --------------------------------------------------------- | ----------------------- | ---------- |
| `io.opentelemetry:opentelemetry-exporter-sender-okhttp:{{% param vers.otel %}}`                       | Реалізація на основі OkHttp.                              | `grpc`, `http/protobuf` | Так        |
| `io.opentelemetry:opentelemetry-exporter-sender-jdk:{{% param vers.otel %}}`                          | Реалізація на основі `java.net.http.HttpClient` Java 11+. | `http/protobuf`         | Ні         |
| `io.opentelemetry:opentelemetry-exporter-sender-grpc-managed-channel:{{% param vers.otel %}}` **[1]** | Реалізація на основі `ManagedChannel` `grpc-java`.        | `grpc`                  | Ні         |

**[1]**: Щоб використовувати `opentelemetry-exporter-sender-grpc-managed-channel`, ви також повинні додати залежність від [реалізацій транспорту gRPC](https://github.com/grpc/grpc-java#transport).

#### Автентифікація {#authentication}

Експортери OTLP надають механізми для статичної та динамічної автентифікації на основі заголовків, а також для mTLS.

Якщо ви використовуєте [zero-code SDK autoconfigure](../configuration/#zero-code-sdk-autoconfigure) зі змінними середовища та системними властивостями, див. [відповідні системні властивості](../configuration/#properties-exporters):

- `otel.exporter.otlp.headers` для статичної автентифікації на основі заголовків.
- `otel.exporter.otlp.client.key`, `otel.exporter.otlp.client.certificate` для mTLS-автентифікації.

Наступний фрагмент коду демонструє програмне налаштування статичної та динамічної автентифікації на основі заголовків:

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
    // Якщо адресат OTLP приймає статичний, довгоживучий заголовок автентифікації, наприклад, ключ API,
    // встановіть його як заголовок.
    // Це зчитує ключ API зі змінної env var OTLP_API_KEY, щоб уникнути жорсткого кодування секрету у
    // вихідному коді.
    String apiKeyHeaderName = "api-key";
    String apiKeyHeaderValue = System.getenv("OTLP_API_KEY");

    // Ініціалізуйте експортери OTLP Span, Metric та LogRecord за аналогічним шаблоном
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
    // Якщо адресат OTLP вимагає динамічного заголовка автентифікації, наприклад, JWT, який потрібно
    // періодично оновлюватися, скористайтеся постачальником заголовків.
    // Тут ми реалізуємо простий постачальник, який додає заголовок виду "Authorization: Bearer
    // <token", де <token> зчитується з refreshBearerToken кожні 10 хвилин.
    String username = System.getenv("OTLP_USERNAME");
    String password = System.getenv("OTLP_PASSWORD");
    Supplier<Map<String, String>> supplier =
        new AuthHeaderSupplier(() -> refreshToken(username, password), Duration.ofMinutes(10));

    // Ініціалізуйте експортери OTLP Span, Metric та LogRecord за аналогічним шаблоном
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
    // Для сценарію промислового використання це буде замінено на позасмуговий запит на обмін
    // імʼя користувача / пароль для токена на предʼявника.
    return "abc123";
  }
}
```
<!-- prettier-ignore-end -->

### Тестування {#testing}

TODO: документувати інструменти, доступні для тестування SDK

[JSON file encoding]: /docs/specs/otel/protocol/file-exporter/#json-file-serialization
