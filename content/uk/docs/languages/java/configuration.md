---
title: Налаштування SDK
linkTitle: Налаштування SDK
weight: 13
aliases: [config]
default_lang_commit: 5489ba34bff91356aa2c501cd55f07eeb30cc355
# prettier-ignore
cSpell:ignore: autoconfigured blrp Customizer Dotel ignore LOWMEMORY ottrace PKCS
---

<!-- markdownlint-disable blanks-around-fences -->
<?code-excerpt path-base="examples/java/configuration"?>

[SDK](../sdk/) є вбудованою референсною реалізацією [API](../api/), яка обробляє та експортує телеметрію, створену викликами API інструментування. Налаштування SDK для належної обробки та експорту є важливим кроком для інтеграції OpenTelemetry в застосунок.

Усі компоненти SDK мають [програмні інтерфейси налаштування](#programmatic-configuration). Це найгнучкіший і найвиразніший спосіб налаштування SDK. Однак зміна налаштувань вимагає коригування коду та перекомпіляції застосунку, і немає міжмовної сумісності, оскільки API написано на Java.

Модуль [автоконфігурації SDK без коду](#zero-code-sdk-autoconfigure) налаштовує компоненти SDK через системні властивості або змінні середовища з різними точками розширення для випадків, коли властивостей недостатньо.

> [!NOTE] **Примітки**
>
> - Ми рекомендуємо використовувати модуль [автоконфігурації SDK без коду](#zero-code-sdk-autoconfigure), оскільки він зменшує кількість шаблонного коду, дозволяє робити переналаштовування без переписування коду або перекомпіляції застосунку та має міжмовну сумісність.
> - [Java агент](/docs/zero-code/java/agent/) та [Spring starter](/docs/zero-code/java/spring-boot-starter/) автоматично налаштовують SDK за допомогою модуля автоконфігурації SDK без коду та встановлюють інструментування з ним. Усі матеріали автоконфігурації застосовні до користувачів Java агента та Spring starter.

## Програмне налаштування {#programmatic-configuration}

Інтерфейс програмного налаштування — це набір API для створення компонентів [SDK](../sdk/). Усі компоненти SDK мають програмний інтерфейс налаштування, і всі інші механізми налаштування побудовані на основі цього API. Наприклад, інтерфейс налаштування [змінних середовища та системних властивостей](#environment-variables-and-system-properties) інтерпретує відомі змінні середовища та системні властивості в серію викликів до програмного інтерфейсу налаштування.

Хоча інші механізми налаштування пропонують більше зручності, жоден з них не пропонує такої гнучкості, як написання коду, що виражає точні налаштування. Коли певна можливість не підтримується механізмом налаштування вищого рівня, у вас може не залишитися іншого вибору, окрім як використовувати програмне налаштування.

Розділи [компонентів SDK](../sdk/#sdk-components) демонструють простий програмний інтерфейс налаштування для ключових областей SDK, з якими стикаються користувачі. Зверніться до коду для повної довідки по API.

## Автоконфігурація SDK без коду {#zero-code-sdk-autoconfigure}

Модуль автоконфігурації (артефакт `io.opentelemetry:opentelemetry-sdk-extension-autoconfigure:{{% param vers.otel %}}`) є інтерфейсом налаштування, побудованим на основі [інтерфейсу програмного налаштування](#programmatic-configuration), який налаштовує [компоненти SDK](../sdk/#sdk-components) без коду. Існує два різних робочих процеси автоконфігурації:

- [Змінні середовища та системні властивості](#environment-variables-and-system-properties) інтерпретують змінні середовища та системні властивості для створення компонентів SDK, включаючи різні точки налаштування для накладання програмного налаштування.
- [Декларативне налаштування](#declarative-configuration) (**наразі в розробці**) інтерпретує модель налаштування для створення компонентів SDK, яка зазвичай кодується у YAML файлі налаштування.

Автоматично налаштуйте компоненти SDK за допомогою автоконфігурації наступним чином:

<!-- prettier-ignore-start -->
<?code-excerpt "src/main/java/otel/AutoConfiguredSdk.java"?>
```java
package otel;

import io.opentelemetry.sdk.OpenTelemetrySdk;
import io.opentelemetry.sdk.autoconfigure.AutoConfiguredOpenTelemetrySdk;

public class AutoConfiguredSdk {
  public static OpenTelemetrySdk autoconfiguredSdk() {
    return AutoConfiguredOpenTelemetrySdk.initialize().getOpenTelemetrySdk();
  }
}
```
<!-- prettier-ignore-end -->

> [!NOTE] **Примітки**
>
> - [Java агент](/docs/zero-code/java/agent/) та [Spring starter](/docs/zero-code/java/spring-boot-starter/) автоматично налаштовують SDK за допомогою модуля автоконфігурації SDK без коду та встановлюють інструментування з ним. Усі матеріали автоконфігурації застосовуються до користувачів Java агента та Spring starter.
> - Модуль автоконфігурації реєструє Java хуки завершення роботи для завершення роботи SDK у відповідний час. Оскільки OpenTelemetry Java [використовує `java.util.logging` для внутрішнього логування](../sdk/#internal-logging), деякі логи можуть бути придушені під час виконання хуків завершення роботи. Це помилка в самому JDK, а не щось під контролем OpenTelemetry Java. Якщо вам потрібне логування під час виконання хуків завершення роботи, розгляньте можливість використання `System.out` замість фреймворку логування, який може завершити свою роботу під час роботи хука завершення роботи, таким чином придушуючи ваші повідомлення журналу. Для отримання додаткової інформації дивіться цю [помилку JDK](https://bugs.openjdk.java.net/browse/JDK-8161253).

### Змінні середовища та системні властивості {#environment-variables-and-system-properties}

Модуль автоконфігурації підтримує властивості, перелічені в [специфікації налаштування змінних середовища](/docs/specs/otel/configuration/sdk-environment-variables/), з періодичними експериментальними та специфічними для Java доповненнями.

Наступні властивості перелічені як системні властивості, але також можуть бути встановлені за допомогою змінних середовища. Виконайте наступні кроки, щоб перетворити системну властивість на змінну середовища:

- Перетворіть імʼя на великі літери.
- Замініть усі символи `.` та `-` на `_`.

Наприклад, системна властивість `otel.sdk.disabled` еквівалентна змінній середовища `OTEL_SDK_DISABLED`.

Якщо властивість визначена як системна властивість і змінна середовища, пріоритет має системна властивість.

#### Властивості: загальні {#properties-general}

Властивості для відключення [SDK](../sdk/#opentelemetrysdk):

| Системна властивість | Опис                                               | Стандартно |
| -------------------- | -------------------------------------------------- | ---------- |
| `otel.sdk.disabled`  | Якщо `true`, відключити OpenTelemetry SDK. **[1]** | `false`    |

**[1]**: Якщо відключено, `AutoConfiguredOpenTelemetrySdk#getOpenTelemetrySdk()` повертає мінімально налаштований екземпляр (наприклад, `OpenTelemetrySdk.builder().build()`).

Властивості для обмежень атрибутів (див. [обмеження відрізків](../sdk/#spanlimits), [обмеження логів](../sdk/#loglimits)):

| Системна властивість                | Опис                                                                                                                                                                       | Стандартно   |
| ----------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------ |
| `otel.attribute.value.length.limit` | Максимальна довжина значень атрибутів. Застосовується до відрізків та логів. Перевизначається `otel.span.attribute.value.length.limit`, `otel.span.attribute.count.limit`. | Без обмежень |
| `otel.attribute.count.limit`        | Максимальна кількість атрибутів. Застосовується до відрізків, подій відрізків, посилань відрізків та логів.                                                                | `128`        |

Властивості для [поширення контексту](../sdk/#textmappropagator):

| Системна властивість | Опис                                                                                                                                                     | Стандартно                   |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------- |
| `otel.propagators`   | Список поширювачів через кому. Відомі значення включають `tracecontext`, `baggage`, `b3`, `b3multi`, `jaeger`, `ottrace`, `xray`, `xray-lambda`. **[1]** | `tracecontext,baggage` (W3C) |

**[1]**: Відомі поширювачі та артефакти (див. [text map propagator](../sdk/#textmappropagator) для координат артефакту):

- `tracecontext` налаштовує `W3CTraceContextPropagator`.
- `baggage` налаштовує `W3CBaggagePropagator`.
- `b3`, `b3multi` налаштовує `B3Propagator`.
- `jaeger` налаштовує `JaegerPropagator`.
- `ottrace` налаштовує `OtTracePropagator`.
- `xray` налаштовує `AwsXrayPropagator`.
- `xray-lambda` налаштовує `AwsXrayLambdaPropagator`.

#### Властивості: ресурс {#properties-resource}

Властивості для налаштування [ресурсу](../sdk/#resource):

| Системна властивість                    | Опис                                                                                                                                 | Стандартно             |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ | ---------------------- |
| `otel.service.name`                     | Вкажіть логічне імʼя сервісу. Має пріоритет над `service.name`, визначеним за допомогою `otel.resource.attributes`.                  | `unknown_service:java` |
| `otel.resource.attributes`              | Вкажіть атрибути ресурсу у наступному форматі: `key1=val1,key2=val2,key3=val3`.                                                      |                        |
| `otel.resource.disabled-keys`           | Вкажіть ключі атрибутів ресурсу для фільтрації.                                                                                      |                        |
| `otel.java.enabled.resource.providers`  | Список класів `ResourceProvider` через кому, які потрібно увімкнути. **[1]** Якщо не встановлено, увімкнено всі провайдери ресурсів. |                        |
| `otel.java.disabled.resource.providers` | Список класів `ResourceProvider` через кому, які потрібно відключити. **[1]**                                                        |                        |

**[1]**: Наприклад, щоб відключити [провайдера ресурсу ОС](https://github.com/open-telemetry/opentelemetry-java-instrumentation/blob/main/instrumentation/resources/library/src/main/java/io/opentelemetry/instrumentation/resources/OsResourceProvider.java),
встановіть `-Dotel.java.disabled.resource.providers=io.opentelemetry.instrumentation.resources.OsResourceProvider`. Дивіться [ResourceProvider](#resourceprovider) для координат артефакту провайдера ресурсів.

**ПРИМІТКА**: Системні властивості/змінні оточення `otel.service.name` та `otel.resource.attributes` інтерпретуються у постачальнику ресурсів `io.opentelemetry.sdk.autoconfigure.EnvironmentResourceProvider`. Якщо ви вирішили вказати постачальників ресурсів за допомогою `otel.java.enabled.resource-providers`, ви, ймовірно, захочете включити цей параметр, щоб уникнути несподіванок. Координати артефакту постачальника ресурсів наведено у [ResourceProvider](#resourceprovider).

#### Властивості: трейсинг {#properties-tracing}

Властивості для [пакетного процесора відрізків](../sdk/#spanprocessor), повʼязаного з експортерами, зазначеними через `otel.traces.exporter`:

| Системна властивість             | Опис                                                                                    | Стандартно |
| -------------------------------- | --------------------------------------------------------------------------------------- | ---------- |
| `otel.bsp.schedule.delay`        | Інтервал, у мілісекундах, між двома послідовними експортами.                            | `5000`     |
| `otel.bsp.max.queue.size`        | Максимальна кількість відрізків, які можна поставити в чергу перед надсиланням пакетів. | `2048`     |
| `otel.bsp.max.export.batch.size` | Максимальна кількість відрізків для експорту в одній партії.                            | `512`      |
| `otel.bsp.export.timeout`        | Максимальний дозволений час, у мілісекундах, для експорту даних.                        | `30000`    |

Властивості для [семплера](../sdk/#sampler):

| Системна властивість      | Опис                                                                                                                                                                                                                 | Стандартно              |
| ------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------- |
| `otel.traces.sampler`     | Семплер, який потрібно використовувати. Відомі значення включають `always_on`, `always_off`, `traceidratio`, `parentbased_always_on`, `parentbased_always_off`, `parentbased_traceidratio`, `jaeger_remote`. **[1]** | `parentbased_always_on` |
| `otel.traces.sampler.arg` | Аргумент для налаштованого трейсера, якщо підтримується, наприклад, коефіцієнт.                                                                                                                                      |                         |

**[1]**: Відомі семплери та артефакти (див. [sampler](../sdk/#sampler) для координат артефакту):

- `always_on` налаштовує `AlwaysOnSampler`.
- `always_off` налаштовує `AlwaysOffSampler`.
- `traceidratio` налаштовує `TraceIdRatioBased`. `otel.traces.sampler.arg` встановлює коефіцієнт.
- `parentbased_always_on` налаштовує `ParentBased(root=AlwaysOnSampler)`.
- `parentbased_always_off` налаштовує `ParentBased(root=AlwaysOffSampler)`.
- `parentbased_traceidratio` налаштовує `ParentBased(root=TraceIdRatioBased)`.
  `otel.traces.sampler.arg` встановлює коефіцієнт.
- `jaeger_remote` налаштовує `JaegerRemoteSampler`. `otel.traces.sampler.arg` є списком аргументів через кому, як описано в [специфікації](/docs/specs/otel/configuration/sdk-environment-variables/#general-sdk-configuration).

Властивості для [обмежень відрізків](../sdk/#spanlimits):

| Системна властивість                     | Опис                                                                                                    | Стандартно   |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------- | ------------ |
| `otel.span.attribute.value.length.limit` | Максимальна довжина значень атрибутів відрізків. Має пріоритет над `otel.attribute.value.length.limit`. | Без обмежень |
| `otel.span.attribute.count.limit`        | Максимальна кількість атрибутів на відрізок. Має пріоритет над `otel.attribute.count.limit`.            | `128`        |
| `otel.span.event.count.limit`            | Максимальна кількість подій на відрізок.                                                                | `128`        |
| `otel.span.link.count.limit`             | Максимальна кількість посилань на відрізок.                                                             | `128`        |

#### Властивості: метрики {#properties-metrics}

Властивості для [періодичного читача метрик](../sdk/#metricreader):

| Системна властивість          | Опис                                                        | Стандартно |
| ----------------------------- | ----------------------------------------------------------- | ---------- |
| `otel.metric.export.interval` | Інтервал, у мілісекундах, між початком двох спроб експорту. | `60000`    |

Властивості для екземплярів:

| Системна властивість           | Опис                                                                                   | Стандартно    |
| ------------------------------ | -------------------------------------------------------------------------------------- | ------------- |
| `otel.metrics.exemplar.filter` | Фільтр для вибірки екземплярів. Може бути `ALWAYS_OFF`, `ALWAYS_ON` або `TRACE_BASED`. | `TRACE_BASED` |

Властивості для обмежень кардинальності:

| Системна властивість                  | Опис                                                                                                                    | Стандартно |
| ------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- | ---------- |
| `otel.java.metrics.cardinality.limit` | Якщо встановлено, налаштуйте обмеження кардинальності. Значення визначає максимальну кількість різних точок на метрику. | `2000`     |

#### Властивості: логи {#properties-logs}

Властивості для [процесора записів логів](../sdk/#logrecordprocessor), повʼязаного з експортерами через `otel.logs.exporter`:

| Системна властивість              | Опис                                                                                       | Стандартно |
| --------------------------------- | ------------------------------------------------------------------------------------------ | ---------- |
| `otel.blrp.schedule.delay`        | Інтервал, у мілісекундах, між двома послідовними експортами.                               | `1000`     |
| `otel.blrp.max.queue.size`        | Максимальна кількість записів журналу, яка може бути поставлена в чергу перед надсиланням. | `2048`     |
| `otel.blrp.max.export.batch.size` | Максимальна кількість записів журналу для експорту в одному пакеті.                        | `512`      |
| `otel.blrp.export.timeout`        | Максимальний дозволений час, у мілісекундах, для експорту даних.                           | `30000`    |

#### Властивості: експортери {#properties-exporters}

Властивості для налаштування експортерів:

| Системна властивість             | Призначення                                                                                                                                                                                               | Стандартно      |
| -------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------- |
| `otel.traces.exporter`           | Список експортерів відрізків через кому. Відомі значення включають `otlp`, `zipkin`, `console`, `logging-otlp`, `none`. **[1]**                                                                           | `otlp`          |
| `otel.metrics.exporter`          | Список експортерів метрик через кому. Відомі значення включають `otlp`, `prometheus`, `none`. **[1]**                                                                                                     | `otlp`          |
| `otel.logs.exporter`             | Список експортерів записів логів через кому. Відомі значення включають `otlp`, `console`, `logging-otlp`, `none`. **[1]**                                                                                 | `otlp`          |
| `otel.java.exporter.memory_mode` | Якщо `reusable_data`, увімкніть режим повторного використання памʼяті (на експортерах, які його підтримують) для зменшення виділень. Відомі значення включають `reusable_data`, `immutable_data`. **[2]** | `reusable_data` |

**[1]**: Відомі експортери та артефакти (див. [span exporter](../sdk/#spanexporter),
[metric exporter](../sdk/#metricexporter), [log exporter](../sdk/#logrecordexporter) для координат артефакту експортера):

- `otlp` налаштовує `OtlpHttp{Signal}Exporter` / `OtlpGrpc{Signal}Exporter`.
- `zipkin` налаштовує `ZipkinSpanExporter`.
- `console` налаштовує `LoggingSpanExporter`, `LoggingMetricExporter`, `SystemOutLogRecordExporter`.
- `logging-otlp` налаштовує `OtlpJsonLogging{Signal}Exporter`.
- `experimental-otlp/stdout` налаштовує `OtlpStdout{Signal}Exporter` (ця опція є експериментальною і може бути змінена або видалена).

**[2]**: Експортери, які дотримуються `otel.java.exporter.memory_mode=reusable_data` включають `OtlpGrpc{Signal}Exporter`, `OtlpHttp{Signal}Exporter`, `OtlpStdout{Signal}Exporter`, та `PrometheusHttpServer`.

Властивості для `otlp` експортерів відрізків, метрик та логів:

| Системна властивість                                       | Опис                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | Стандартно                                                                                                          |
| ---------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| `otel.{signal}.exporter=otlp`                              | Виберіть експортер OpenTelemetry для {signal}.                                                                                                                                                                                                                                                                                                                                                                                                                                                             |                                                                                                                     |
| `otel.exporter.otlp.protocol`                              | Транспортний протокол для використання в запитах OTLP трасування, метрик та логів. Опції включають `grpc` та `http/protobuf`.                                                                                                                                                                                                                                                                                                                                                                              | `grpc` **[1]**                                                                                                      |
| `otel.exporter.otlp.{signal}.protocol`                     | Транспортний протокол для використання в запитах OTLP {signal}. Опції включають `grpc` та `http/protobuf`.                                                                                                                                                                                                                                                                                                                                                                                                 | `grpc` **[1]**                                                                                                      |
| `otel.exporter.otlp.endpoint`                              | Точка доступу для надсилання всіх OTLP трасувань, метрик та логів. Часто це адреса OpenTelemetry Collector. Повинна бути URL з схемою `http` або `https` в залежності від використання TLS.                                                                                                                                                                                                                                                                                                                | `http://localhost:4317` коли протокол `grpc`, та `http://localhost:4318` коли протокол `http/protobuf`.             |
| `otel.exporter.otlp.{signal}.endpoint`                     | Точка доступу для надсилання OTLP {signal}. Часто це адреса OpenTelemetry Collector. Повинна бути URL з схемою `http` або `https` в залежності від використання TLS. Якщо протокол `http/protobuf`, версія та сигнал повинні бути додані до шляху (наприклад, `v1/traces`, `v1/metrics`, або `v1/logs`)                                                                                                                                                                                                    | `http://localhost:4317` коли протокол `grpc`, та `http://localhost:4318/v1/{signal}` коли протокол `http/protobuf`. |
| `otel.exporter.otlp.certificate`                           | Шлях до файлу, що містить довірені сертифікати для використання при перевірці TLS сертифікатів сервера OTLP трасування, метрик або логів. Файл повинен містити один або більше X.509 сертифікатів у форматі PEM.                                                                                                                                                                                                                                                                                           | Використовуються довірені кореневі сертифікати хост-платформи.                                                      |
| `otel.exporter.otlp.{signal}.certificate`                  | Шлях до файлу, що містить довірені сертифікати для використання при перевірці TLS сертифікатів сервера OTLP {signal}. Файл повинен містити один або більше X.509 сертифікатів у форматі PEM.                                                                                                                                                                                                                                                                                                               | Використовуються довірені кореневі сертифікати хост-платформи.                                                      |
| `otel.exporter.otlp.client.key`                            | Шлях до файлу, що містить приватний клієнтський ключ для використання при перевірці TLS сертифікатів клієнта OTLP трасування, метрик або логів. Файл повинен містити один приватний ключ у форматі PKCS8 PEM.                                                                                                                                                                                                                                                                                              | Не використовується жоден файл клієнтського ключа.                                                                  |
| `otel.exporter.otlp.{signal}.client.key`                   | Шлях до файлу, що містить приватний клієнтський ключ для використання при перевірці TLS сертифікатів клієнта OTLP {signal}. Файл повинен містити один приватний ключ у форматі PKCS8 PEM.                                                                                                                                                                                                                                                                                                                  | Не використовується жоден файл клієнтського ключа.                                                                  |
| `otel.exporter.otlp.client.certificate`                    | Шлях до файлу, що містить довірені сертифікати для використання при перевірці TLS сертифікатів клієнта OTLP трасування, метрик або логів. Файл повинен містити один або більше X.509 сертифікатів у форматі PEM.                                                                                                                                                                                                                                                                                           | Не використовується жоден файл ланцюга.                                                                             |
| `otel.exporter.otlp.{signal}.client.certificate`           | Шлях до файлу, що містить довірені сертифікати для використання при перевірці TLS сертифікатів клієнта OTLP {signal}. Файл повинен містити один або більше X.509 сертифікатів у форматі PEM.                                                                                                                                                                                                                                                                                                               | Не використовується жоден файл ланцюга.                                                                             |
| `otel.exporter.otlp.headers`                               | Пари ключ-значення, розділені комами, для передачі як заголовки запитів на запити OTLP трасування, метрик та логів.                                                                                                                                                                                                                                                                                                                                                                                        |                                                                                                                     |
| `otel.exporter.otlp.{signal}.headers`                      | Пари ключ-значення, розділені комами, для передачі як заголовки запитів на запити OTLP {signal}.                                                                                                                                                                                                                                                                                                                                                                                                           |                                                                                                                     |
| `otel.exporter.otlp.compression`                           | Тип стиснення для використання в запитах OTLP трасування, метрик та логів. Опції включають `gzip`.                                                                                                                                                                                                                                                                                                                                                                                                         | Стиснення не буде використовуватися.                                                                                |
| `otel.exporter.otlp.{signal}.compression`                  | Тип стиснення для використання в запитах OTLP {signal}. Опції включають `gzip`.                                                                                                                                                                                                                                                                                                                                                                                                                            | Стиснення не буде використовуватися.                                                                                |
| `otel.exporter.otlp.timeout`                               | Максимальний час очікування, у мілісекундах, дозволений для надсилання кожного пакету OTLP трасування, метрик та логів.                                                                                                                                                                                                                                                                                                                                                                                    | `10000`                                                                                                             |
| `otel.exporter.otlp.{signal}.timeout`                      | Максимальний час очікування, у мілісекундах, дозволений для надсилання кожного пакету OTLP {signal}.                                                                                                                                                                                                                                                                                                                                                                                                       | `10000`                                                                                                             |
| `otel.exporter.otlp.metrics.temporality.preference`        | Бажана вихідна агрегаційна темпоральність. Опції включають `DELTA`, `LOWMEMORY`, та `CUMULATIVE`. Якщо `CUMULATIVE`, всі інструменти матимуть кумулятивну темпоральність. Якщо `DELTA`, лічильники (синхронні та асинхронні) та гістограми будуть дельтовими, лічильники вгору-вниз (синхронні та асинхронні) будуть кумулятивними. Якщо `LOWMEMORY`, синхронні лічильники та гістограми будуть дельтовими, асинхронні лічильники та лічильники вгору-вниз (синхронні та асинхронні) будуть кумулятивними. | `CUMULATIVE`                                                                                                        |
| `otel.exporter.otlp.metrics.default.histogram.aggregation` | Бажана стандартна агрегація гістограм. Опції включають `BASE2_EXPONENTIAL_BUCKET_HISTOGRAM` та `EXPLICIT_BUCKET_HISTOGRAM`.                                                                                                                                                                                                                                                                                                                                                                                | `EXPLICIT_BUCKET_HISTOGRAM`                                                                                         |
| `otel.java.exporter.otlp.retry.disabled`                   | Якщо `false`, повторіть спробу при виникненні тимчасових помилок. **[2]**                                                                                                                                                                                                                                                                                                                                                                                                                                  | `false`                                                                                                             |

**ПРИМІТКА:** Текстовий заповнювач `{signal}` відноситься до підтримуваного [OpenTelemetry Signal](/docs/concepts/signals/). Дійсні значення включають `traces`, `metrics`, та `logs`. Конфігурації, специфічні для сигналу, мають пріоритет над загальними версіями. Наприклад, якщо ви встановите як `otel.exporter.otlp.endpoint`, так і `otel.exporter.otlp.traces.endpoint`, останній матиме пріоритет.

**[1]**: OpenTelemetry Java агент 2.x та OpenTelemetry Spring Boot starter
використовують стандартно `http/protobuf`.

**[2]**: [OTLP](/docs/specs/otlp/#otlpgrpc-response) вимагає щоб [тимчасові](/docs/specs/otel/protocol/exporter/#retry) помилки оброблялись зі стратегією повторної спроби. Коли повторна спроба увімкнена, повторювані коди стану gRPC повторюються використовуючи алгоритм експоненційного зворотного відліку з джитером. Конкретні опції `RetryPolicy` можна налаштувати лише через [програмну налаштування](#programmatic-customization).

Властивості для `zipkin` експортера відрізків:

| Системна властивість            | Опис                                                           | Стандартно                           |
| ------------------------------- | -------------------------------------------------------------- | ------------------------------------ |
| `otel.traces.exporter=zipkin`   | Виберіть експортер Zipkin                                      |                                      |
| `otel.exporter.zipkin.endpoint` | Точка доступу Zipkin для підключення. Підтримується лише HTTP. | `http://localhost:9411/api/v2/spans` |

Властивості для `prometheus` експортера метрик.

| Системна властивість               | Опис                                                                          | Стандартно |
| ---------------------------------- | ----------------------------------------------------------------------------- | ---------- |
| `otel.metrics.exporter=prometheus` | Виберіть експортер Prometheus                                                 |            |
| `otel.exporter.prometheus.port`    | Локальний порт, що використовується для привʼязки сервера метрик Prometheus.  | `9464`     |
| `otel.exporter.prometheus.host`    | Локальна адреса, що використовується для привʼязки сервера метрик Prometheus. | `0.0.0.0`  |

#### Програмне налаштування {#programmatic-customization}

Програмне налаштування надає хуки для доповнення [підтримуваних властивостей](#environment-variables-and-system-properties) з [програмним налаштуванням](#programmatic-configuration).

Якщо ви використовуєте [Spring starter](/docs/zero-code/java/spring-boot-starter/), дивіться також [spring starter програмне налаштування](/docs/zero-code/java/spring-boot-starter/sdk-configuration/#programmatic-configuration).

<!-- prettier-ignore-start -->
<?code-excerpt "src/main/java/otel/CustomizedAutoConfiguredSdk.java"?>
```java
package otel;

import io.opentelemetry.sdk.OpenTelemetrySdk;
import io.opentelemetry.sdk.autoconfigure.AutoConfiguredOpenTelemetrySdk;
import java.util.Collections;

public class CustomizedAutoConfiguredSdk {
  public static OpenTelemetrySdk autoconfiguredSdk() {
    return AutoConfiguredOpenTelemetrySdk.builder()
        // Опціонально налаштуйте TextMapPropagator.
        .addPropagatorCustomizer((textMapPropagator, configProperties) -> textMapPropagator)
        // Опціонально налаштуйте Resource.
        .addResourceCustomizer((resource, configProperties) -> resource)
        // Опціонально налаштуйте Sampler.
        .addSamplerCustomizer((sampler, configProperties) -> sampler)
        // Опціонально налаштуйте SpanExporter.
        .addSpanExporterCustomizer((spanExporter, configProperties) -> spanExporter)
        // Опціонально налаштуйте SpanProcessor.
        .addSpanProcessorCustomizer((spanProcessor, configProperties) -> spanProcessor)
        // Опціонально надайте додаткові властивості.
        .addPropertiesSupplier(Collections::emptyMap)
        // Опціонально налаштуйте ConfigProperties.
        .addPropertiesCustomizer(configProperties -> Collections.emptyMap())
        // Опціонально налаштуйте SdkTracerProviderBuilder.
        .addTracerProviderCustomizer((builder, configProperties) -> builder)
        // Опціонально налаштуйте SdkMeterProviderBuilder.
        .addMeterProviderCustomizer((builder, configProperties) -> builder)
        // Опціонально налаштуйте MetricExporter.
        .addMetricExporterCustomizer((metricExporter, configProperties) -> metricExporter)
        // Опціонально налаштуйте MetricReader.
        .addMetricReaderCustomizer((metricReader, configProperties) -> metricReader)
        // Опціонально налаштуйте SdkLoggerProviderBuilder.
        .addLoggerProviderCustomizer((builder, configProperties) -> builder)
        // Опціонально налаштуйте LogRecordExporter.
        .addLogRecordExporterCustomizer((logRecordExporter, configProperties) -> logRecordExporter)
        // Опціонально налаштуйте LogRecordProcessor.
        .addLogRecordProcessorCustomizer((processor, configProperties) -> processor)
        .build()
        .getOpenTelemetrySdk();
  }
}
```
<!-- prettier-ignore-end -->

#### SPI (Service provider interface)

[SPIs](https://docs.oracle.com/javase/tutorial/sound/SPI-intro.html) (артефакт `io.opentelemetry:opentelemetry-sdk-extension-autoconfigure-spi:{{% param vers.otel %}}`) розширюють автоконфігурацію SDK за межі компонентів, вбудованих у SDK.

Наступні розділи описують доступні SPIs. Кожен розділ SPI включає:

- Короткий опис, включаючи посилання на тип довідки Javadoc.
- Таблицю доступних вбудованих та `opentelemetry-java-contrib` реалізацій.
- Просту демонстрацію користувацької реалізації.

##### ResourceProvider

[ResourceProvider](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-sdk-extension-autoconfigure-spi/latest/io/opentelemetry/sdk/autoconfigure/spi/ResourceProvider.html) додають до автоконфігурованого [ресурсу](../sdk/#resource).

`ResourceProvider`, вбудовані в SDK та підтримувані спільнотою в `opentelemetry-java-contrib`:

| Клас                                                                        | Артефакт                                                                                            | Опис                                                                                            |
| --------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| `io.opentelemetry.sdk.autoconfigure.internal.EnvironmentResourceProvider`   | `io.opentelemetry:opentelemetry-sdk-extension-autoconfigure:{{% param vers.otel %}}`                | Надає атрибути ресурсу на основі змінних `OTEL_SERVICE_NAME` та `OTEL_RESOURCE_ATTRIBUTES` env. |
| `io.opentelemetry.instrumentation.resources.ContainerResourceProvider`      | `io.opentelemetry.instrumentation:opentelemetry-resources:{{% param vers.instrumentation %}}-alpha` | Надає атрибути ресурсу контейнера.                                                              |
| `io.opentelemetry.instrumentation.resources.HostResourceProvider`           | `io.opentelemetry.instrumentation:opentelemetry-resources:{{% param vers.instrumentation %}}-alpha` | Надає атрибути ресурсу хосту.                                                                   |
| `io.opentelemetry.instrumentation.resources.HostIdResourceProvider`         | `io.opentelemetry.instrumentation:opentelemetry-resources:{{% param vers.instrumentation %}}-alpha` | Надає атрибут ідентифікатора хосту.                                                             |
| `io.opentelemetry.instrumentation.resources.ManifestResourceProvider`       | `io.opentelemetry.instrumentation:opentelemetry-resources:{{% param vers.instrumentation %}}-alpha` | Надає атрибути ресурсу сервісу на основі маніфесту jar.                                         |
| `io.opentelemetry.instrumentation.resources.OsResourceProvider`             | `io.opentelemetry.instrumentation:opentelemetry-resources:{{% param vers.instrumentation %}}-alpha` | Надає атрибути ресурсу ОС.                                                                      |
| `io.opentelemetry.instrumentation.resources.ProcessResourceProvider`        | `io.opentelemetry.instrumentation:opentelemetry-resources:{{% param vers.instrumentation %}}-alpha` | Надає атрибути ресурсу процесу.                                                                 |
| `io.opentelemetry.instrumentation.resources.ProcessRuntimeResourceProvider` | `io.opentelemetry.instrumentation:opentelemetry-resources:{{% param vers.instrumentation %}}-alpha` | Надає атрибути ресурсу середовища виконання процесу.                                            |
| `io.opentelemetry.contrib.gcp.resource.GCPResourceProvider`                 | `io.opentelemetry.contrib:opentelemetry-gcp-resources:{{% param vers.contrib %}}-alpha`             | Надає атрибути ресурсу середовища виконання GCP.                                                |
| `io.opentelemetry.contrib.aws.resource.BeanstalkResourceProvider`           | `io.opentelemetry.contrib:opentelemetry-aws-resources:{{% param vers.contrib %}}-alpha`             | Надає атрибути ресурсу середовища виконання AWS beanstalk.                                      |
| `io.opentelemetry.contrib.aws.resource.Ec2ResourceProvider`                 | `io.opentelemetry.contrib:opentelemetry-aws-resources:{{% param vers.contrib %}}-alpha`             | Надає атрибути ресурсу середовища виконання AWS ec2.                                            |
| `io.opentelemetry.contrib.aws.resource.EcsResourceProvider`                 | `io.opentelemetry.contrib:opentelemetry-aws-resources:{{% param vers.contrib %}}-alpha`             | Надає атрибути ресурсу середовища виконання AWS ecs.                                            |
| `io.opentelemetry.contrib.aws.resource.EksResourceProvider`                 | `io.opentelemetry.contrib:opentelemetry-aws-resources:{{% param vers.contrib %}}-alpha`             | Надає атрибути ресурсу середовища виконання AWS eks.                                            |
| `io.opentelemetry.contrib.aws.resource.LambdaResourceProvider`              | `io.opentelemetry.contrib:opentelemetry-aws-resources:{{% param vers.contrib %}}-alpha`             | Надає атрибути ресурсу середовища виконання AWS lambda.                                         |

Реалізуйте інтерфейс `ResourceProvider`, щоб брати участь у автоконфігурації ресурсів. Наприклад:

<!-- prettier-ignore-start -->
<?code-excerpt "src/main/java/otel/CustomResourceProvider.java"?>
```java
package otel;

import io.opentelemetry.sdk.autoconfigure.spi.ConfigProperties;
import io.opentelemetry.sdk.autoconfigure.spi.ResourceProvider;
import io.opentelemetry.sdk.resources.Resource;

public class CustomResourceProvider implements ResourceProvider {

  @Override
  public Resource createResource(ConfigProperties config) {
    // Виклик зворотного виклику для додавання до ресурсу.
    return Resource.builder().put("my.custom.resource.attribute", "abc123").build();
  }

  @Override
  public int order() {
    // Опціонально впливайте на порядок викликів.
    return 0;
  }
}
```
<!-- prettier-ignore-end -->

##### AutoConfigurationCustomizerProvider

Реалізуйте інтерфейс [AutoConfigurationCustomizerProvider](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-sdk-extension-autoconfigure-spi/latest/io/opentelemetry/sdk/autoconfigure/spi/AutoConfigurationCustomizerProvider.html) для налаштування різних автоконфігурованих компонентів SDK. Наприклад:

<!-- prettier-ignore-start -->
<?code-excerpt "src/main/java/otel/CustomizerProvider.java"?>
```java
package otel;

import io.opentelemetry.sdk.autoconfigure.spi.AutoConfigurationCustomizer;
import io.opentelemetry.sdk.autoconfigure.spi.AutoConfigurationCustomizerProvider;
import java.util.Collections;

public class CustomizerProvider implements AutoConfigurationCustomizerProvider {

  @Override
  public void customize(AutoConfigurationCustomizer customizer) {
    // Опціонально налаштуйте TextMapPropagator.
    customizer.addPropagatorCustomizer((textMapPropagator, configProperties) -> textMapPropagator);
    // Опціонально налаштуйте Resource.
    customizer.addResourceCustomizer((resource, configProperties) -> resource);
    // Опціонально налаштуйте Sampler.
    customizer.addSamplerCustomizer((sampler, configProperties) -> sampler);
    // Опціонально налаштуйте SpanExporter.
    customizer.addSpanExporterCustomizer((spanExporter, configProperties) -> spanExporter);
    // Опціонально налаштуйте SpanProcessor.
    customizer.addSpanProcessorCustomizer((spanProcessor, configProperties) -> spanProcessor);
    // Опціонально надайте додаткові властивості.
    customizer.addPropertiesSupplier(Collections::emptyMap);
    // Опціонально налаштуйте ConfigProperties.
    customizer.addPropertiesCustomizer(configProperties -> Collections.emptyMap());
    // Опціонально налаштуйте SdkTracerProviderBuilder.
    customizer.addTracerProviderCustomizer((builder, configProperties) -> builder);
    // Опціонально налаштуйте SdkMeterProviderBuilder.
    customizer.addMeterProviderCustomizer((builder, configProperties) -> builder);
    // Опціонально налаштуйте MetricExporter.
    customizer.addMetricExporterCustomizer((metricExporter, configProperties) -> metricExporter);
    // Опціонально налаштуйте MetricReader.
    customizer.addMetricReaderCustomizer((metricReader, configProperties) -> metricReader);
    // Опціонально налаштуйте SdkLoggerProviderBuilder.
    customizer.addLoggerProviderCustomizer((builder, configProperties) -> builder);
    // Опціонально налаштуйте LogRecordExporter.
    customizer.addLogRecordExporterCustomizer((exporter, configProperties) -> exporter);
    // Опціонально налаштуйте LogRecordProcessor.
    customizer.addLogRecordProcessorCustomizer((processor, configProperties) -> processor);
  }

  @Override
  public int order() {
    // Опціонально впливайте на порядок викликів.
    return 0;
  }
}
```
<!-- prettier-ignore-end -->

##### ConfigurableSpanExporterProvider

Реалізуйте інтерфейс [ConfigurableSpanExporterProvider](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-sdk-extension-autoconfigure-spi/latest/io/opentelemetry/sdk/autoconfigure/spi/traces/ConfigurableSpanExporterProvider.html) для дозволу користувацького експортера відрізків брати участь у автоконфігурації. Наприклад:

<!-- prettier-ignore-start -->
<?code-excerpt "src/main/java/otel/CustomSpanExporterProvider.java"?>
```java
package otel;

import io.opentelemetry.sdk.autoconfigure.spi.ConfigProperties;
import io.opentelemetry.sdk.autoconfigure.spi.traces.ConfigurableSpanExporterProvider;
import io.opentelemetry.sdk.trace.export.SpanExporter;

public class CustomSpanExporterProvider implements ConfigurableSpanExporterProvider {

  @Override
  public SpanExporter createExporter(ConfigProperties config) {
    // Виклик зворотного виклику, коли OTEL_TRACES_EXPORTER включає значення з getName().
    return new CustomSpanExporter();
  }

  @Override
  public String getName() {
    return "custom-exporter";
  }
}
```
<!-- prettier-ignore-end -->

##### ConfigurableMetricExporterProvider

Реалізуйте інтерфейс [ConfigurableMetricExporterProvider](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-sdk-extension-autoconfigure-spi/latest/io/opentelemetry/sdk/autoconfigure/spi/metrics/ConfigurableMetricExporterProvider.html) для дозволу користувацького експортера метрик брати участь у автоконфігурації. Наприклад:

<!-- prettier-ignore-start -->
<?code-excerpt "src/main/java/otel/CustomMetricExporterProvider.java"?>
```java
package otel;

import io.opentelemetry.sdk.autoconfigure.spi.ConfigProperties;
import io.opentelemetry.sdk.autoconfigure.spi.metrics.ConfigurableMetricExporterProvider;
import io.opentelemetry.sdk.metrics.export.MetricExporter;

public class CustomMetricExporterProvider implements ConfigurableMetricExporterProvider {

  @Override
  public MetricExporter createExporter(ConfigProperties config) {
    // Виклик зворотного виклику, коли OTEL_METRICS_EXPORTER включає значення з getName().
    return new CustomMetricExporter();
  }

  @Override
  public String getName() {
    return "custom-exporter";
  }
}
```
<!-- prettier-ignore-end -->

##### ConfigurableLogRecordExporterProvider

Реалізуйте інтерфейс [ConfigurableLogRecordExporterProvider](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-sdk-extension-autoconfigure-spi/latest/io/opentelemetry/sdk/autoconfigure/spi/logs/ConfigurableLogRecordExporterProvider.html) для дозволу користувацького експортера записів логів брати участь у автоконфігурації. Наприклад:

<!-- prettier-ignore-start -->
<?code-excerpt "src/main/java/otel/CustomLogRecordExporterProvider.java"?>
```java
package otel;

import io.opentelemetry.sdk.autoconfigure.spi.ConfigProperties;
import io.opentelemetry.sdk.autoconfigure.spi.logs.ConfigurableLogRecordExporterProvider;
import io.opentelemetry.sdk.logs.export.LogRecordExporter;

public class CustomLogRecordExporterProvider implements ConfigurableLogRecordExporterProvider {

  @Override
  public LogRecordExporter createExporter(ConfigProperties config) {
    // Виклик зворотного виклику, коли OTEL_LOGS_EXPORTER включає значення з getName().
    return new CustomLogRecordExporter();
  }

  @Override
  public String getName() {
    return "custom-exporter";
  }
}
```
<!-- prettier-ignore-end -->

##### ConfigurableSamplerProvider

Реалізуйте інтерфейс [ConfigurableSamplerProvider](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-sdk-extension-autoconfigure-spi/latest/io/opentelemetry/sdk/autoconfigure/spi/traces/ConfigurableSamplerProvider.html) для дозволу користувацького семплера брати участь у автоконфігурації. Наприклад:

<!-- prettier-ignore-start -->
<?code-excerpt "src/main/java/otel/CustomSamplerProvider.java"?>
```java
package otel;

import io.opentelemetry.sdk.autoconfigure.spi.ConfigProperties;
import io.opentelemetry.sdk.autoconfigure.spi.traces.ConfigurableSamplerProvider;
import io.opentelemetry.sdk.trace.samplers.Sampler;

public class CustomSamplerProvider implements ConfigurableSamplerProvider {

  @Override
  public Sampler createSampler(ConfigProperties config) {
    // Виклик зворотного виклику, коли OTEL_TRACES_SAMPLER встановлено на значення з getName().
    return new CustomSampler();
  }

  @Override
  public String getName() {
    return "custom-sampler";
  }
}
```
<!-- prettier-ignore-end -->

##### ConfigurablePropagatorProvider

Реалізуйте інтерфейс [ConfigurablePropagatorProvider](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-sdk-extension-autoconfigure-spi/latest/io/opentelemetry/sdk/autoconfigure/spi/ConfigurablePropagatorProvider.html) для дозволу користувацького поширювача брати участь у автоконфігурації. Наприклад:

<!-- prettier-ignore-start -->
<?code-excerpt "src/main/java/otel/CustomTextMapPropagatorProvider.java"?>
```java
package otel;

import io.opentelemetry.context.propagation.TextMapPropagator;
import io.opentelemetry.sdk.autoconfigure.spi.ConfigProperties;
import io.opentelemetry.sdk.autoconfigure.spi.ConfigurablePropagatorProvider;

public class CustomTextMapPropagatorProvider implements ConfigurablePropagatorProvider {
  @Override
  public TextMapPropagator getPropagator(ConfigProperties config) {
    // Виклик зворотного виклику, коли OTEL_PROPAGATORS включає значення з getName().
    return new CustomTextMapPropagator();
  }

  @Override
  public String getName() {
    return "custom-propagator";
  }
}
```
<!-- prettier-ignore-end -->

### Декларативне налаштування {#declarative-configuration}

Декларативне налаштування наразі в розробці. Воно дозволяє налаштування на основі YAML
файлу, як описано в [opentelemetry-configuration](https://github.com/open-telemetry/opentelemetry-configuration) та [декларативне налаштування](/docs/specs/otel/configuration/#declarative-configuration).

Для використання, включіть `io.opentelemetry:opentelemetry-sdk-extension-incubator:{{% param vers.otel %}}-alpha` та вкажіть шлях до файлу налаштувань, як описано в таблиці нижче.

| Системна властивість            | Призначення                    | Стандартно     |
| ------------------------------- | ------------------------------ | -------------- |
| `otel.experimental.config.file` | Шлях до файлу налаштувань SDK. | Не встановлено |

> [!WARNING]
>
> Коли вказано файл налаштувань, [змінні середовища та системні властивості](#environment-variables-and-system-properties) ігноруються, [програмне налаштування](#programmatic-customization) та [SPIs](#spi-service-provider-interface) пропускаються. Вміст файлу самостійно визначає налаштування SDK.

Для отримання додаткової інформації зверніться до наступних ресурсів:

- [Документація з використання](https://github.com/open-telemetry/opentelemetry-java/tree/main/sdk-extensions/incubator#declarative-configuration)
- [Приклад з Java агентом](https://github.com/open-telemetry/opentelemetry-java-examples/tree/main/javaagent#declarative-configuration)
- [Приклад без Java агента](https://github.com/open-telemetry/opentelemetry-java-examples/tree/main/declarative-configuration)
