---
title: Загальна конфігурація SDK
linkTitle: Загальна
weight: 10
aliases: [general-sdk-configuration]
default_lang_commit: 5489ba34bff91356aa2c501cd55f07eeb30cc355
cSpell:ignore: ottrace
---

> [!NOTE]
>
> Підтримка змінних середовища є необовʼязковою. Для детальної інформації про те, які змінні середовища підтримує кожна реалізація мови, зверніться до [Матриці відповідності реалізації](https://github.com/open-telemetry/opentelemetry-specification/blob/main/spec-compliance-matrix.md#environment-variables).

## `OTEL_SERVICE_NAME`

Встановлює значення атрибута ресурсу [`service.name`](/docs/specs/semconv/resource/#service).

**Стандартне значення:** `unknown_service`

Якщо `service.name` також вказано в `OTEL_RESOURCE_ATTRIBUTES`, то `OTEL_SERVICE_NAME` має пріоритет.

**Приклад:**

```sh
export OTEL_SERVICE_NAME="your-service-name"
```

## `OTEL_RESOURCE_ATTRIBUTES`

Пари ключ-значення, які використовуються як атрибути ресурсу.

**Стандартне значення:** порожньо

**Приклад:**

```sh
export OTEL_RESOURCE_ATTRIBUTES="key1=value1,key2=value2"
```

**Посилання:**

- [Resource SDK](/docs/specs/otel/resource/sdk#specifying-resource-information-via-an-environment-variable)
- [Resource semantic conventions](/docs/specs/semconv/resource/#semantic-attributes-with-sdk-provided-default-value) для загальних семантичних домовленостей щодо типів ресурсів

## `OTEL_TRACES_SAMPLER`

Вказує Семплер, який використовується SDK для вибірки трейсів.

**Стандартне значення:** `parentbased_always_on`

**Приклад:**

```sh
export OTEL_TRACES_SAMPLER="traceidratio"
```

Прийняті значення для `OTEL_TRACES_SAMPLER`:

- `always_on`: `AlwaysOnSampler`
- `always_off`: `AlwaysOffSampler`
- `traceidratio`: `TraceIdRatioBased`
- `parentbased_always_on`: `ParentBased(root=AlwaysOnSampler)`
- `parentbased_always_off`: `ParentBased(root=AlwaysOffSampler)`
- `parentbased_traceidratio`: `ParentBased(root=TraceIdRatioBased)`
- `parentbased_jaeger_remote`: `ParentBased(root=JaegerRemoteSampler)`
- `jaeger_remote`: `JaegerRemoteSampler`
- `xray`: [AWS X-Ray Centralized Sampling][] (_сторонній_)

[AWS X-Ray Centralized Sampling]: https://docs.aws.amazon.com/xray/latest/devguide/xray-console-sampling.html

## `OTEL_TRACES_SAMPLER_ARG`

Вказує аргументи, якщо це застосовується, до семплера, визначеного в `OTEL_TRACES_SAMPLER`. Вказане значення буде використано лише якщо `OTEL_TRACES_SAMPLER` встановлено. Кожен тип Семплера визначає свій власний очікуваний вхід, якщо такий є. Неправильний або невпізнаний вхід реєструється як помилка.

**Стандартне значення:** порожньо

**Приклад:**

```shell
export OTEL_TRACES_SAMPLER="traceidratio"
export OTEL_TRACES_SAMPLER_ARG="0.5"
```

Залежно від значення `OTEL_TRACES_SAMPLER`, `OTEL_TRACES_SAMPLER_ARG` може бути встановлено наступним чином:

- Для семплерів `traceidratio` та `parentbased_traceidratio`: Ймовірність вибірки, число в діапазоні [0..1], наприклад "0.25". Стандартно 1.0, якщо не встановлено.
- Для `jaeger_remote` та `parentbased_jaeger_remote`: Значення є розділений комою список:
  - Приклад:
    `endpoint=http://localhost:14250,pollingIntervalMs=5000,initialSamplingRate=0.25`
  - `endpoint`: кінцева точка у формі `scheme://host:port` gRPC сервера, який обслуговує стратегію вибірки для сервісу ([sampling.proto](https://github.com/jaegertracing/jaeger-idl/blob/main/proto/api_v2/sampling.proto)).
  - `pollingIntervalMs`: у мілісекундах, що вказує, як часто семплер буде опитувати бекенд для оновлень стратегії вибірки.
  - `initialSamplingRate`: у діапазоні [0..1], який використовується як ймовірність вибірки, коли бекенд не може бути досягнутий для отримання стратегії вибірки. Це значення перестає мати ефект, як тільки стратегія вибірки успішно отримана, оскільки віддалена стратегія буде використовуватися до отримання нового оновлення.

## `OTEL_PROPAGATORS`

Вказує Поширювачі, які використовуються у списку, розділеному комами.

**Стандартне значення:** `tracecontext,baggage`

**Приклад:**

`export OTEL_PROPAGATORS="b3"`

Прийняті значення для `OTEL_PROPAGATORS`:

- `tracecontext`: [W3C Trace Context](https://www.w3.org/TR/trace-context/)
- `baggage`: [W3C Baggage](https://www.w3.org/TR/baggage/)
- `b3`: [B3 Single](/docs/specs/otel/context/api-propagators#configuration)
- `b3multi`: [B3 Multi](/docs/specs/otel/context/api-propagators#configuration)
- `jaeger`: [Jaeger](https://www.jaegertracing.io/sdk-migration/)
- `xray`: [AWS X-Ray](https://docs.aws.amazon.com/xray/latest/devguide/xray-concepts.html#xray-concepts-tracingheader) (_сторонній_)
- `ottrace`: [OT Trace](https://github.com/opentracing?q=basic&type=&language=) (_сторонній_)
- `none`: Немає автоматично налаштованого поширювача.

## `OTEL_TRACES_EXPORTER`

Вказує, який експортер використовується для трейсів. Залежно від реалізації це може бути список, розділений комами.

**Стандартне значення:** `otlp`

**Приклад:**

`export OTEL_TRACES_EXPORTER="jaeger"`

Прийняті значення для:

- `otlp`: [OTLP][]
- `jaeger`: експорт у модель даних Jaeger
- `zipkin`: [Zipkin](https://zipkin.io/zipkin-api/)
- `console`: [Стандартний вивід](/docs/specs/otel/trace/sdk_exporters/stdout/)
- `none`: Немає автоматично налаштованого експортера для трейсів.

## `OTEL_METRICS_EXPORTER`

Вказує, який експортер використовується для метрик. Залежно від реалізації це може бути список, розділений комами.

**Стандартне значення:** `otlp`

**Приклад:**

`export OTEL_METRICS_EXPORTER="prometheus"`

Прийняті значення для `OTEL_METRICS_EXPORTER`:

- `otlp`: [OTLP][]
- `prometheus`: [Prometheus](https://github.com/prometheus/docs/blob/main/docs/instrumenting/exposition_formats.md)
- `console`: [Стандартний вивід](/docs/specs/otel/metrics/sdk_exporters/stdout/)
- `none`: Немає автоматично налаштованого експортера для метрик.

## `OTEL_LOGS_EXPORTER`

Вказує, який експортер використовується для логів. Залежно від реалізації це може бути список, розділений комами.

**Стандартне значення:** `otlp`

**Приклад:**

`export OTEL_LOGS_EXPORTER="otlp"`

Прийняті значення для `OTEL_LOGS_EXPORTER`:

- `otlp`: [OTLP][]
- `console`: [Стандартний вивід](/docs/specs/otel/logs/sdk_exporters/stdout/)
- `none`: Немає автоматично налаштованого експортера для логів.

[otlp]: /docs/specs/otlp/
