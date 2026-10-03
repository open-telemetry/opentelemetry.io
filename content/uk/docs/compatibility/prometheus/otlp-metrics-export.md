---
title: Експорт метрик OTLP до Prometheus
linkTitle: Експорт метрик OTLP
default_lang_commit: 311e7819e9eacf9d8b6d250bbdee98c018ea232e
cSpell:ignore: uuidgen
---

## Вступ {#introduction}

Prometheus був спроєктований та оптимізований для моніторингу на основі pull-моделі, де він виявляє цілі та збирає метрики з точок доступу на регулярній основі. Ця модель є центральною для його архітектури, підтримуючи такі функції, як виявлення сервісів та послідовний збір метрик за цілями.

Зі зростанням впровадження OpenTelemetry, новіші версії Prometheus додали підтримку отримання метрик на основі push-моделі через OTLP. У цій конфігурації SDK OpenTelemetry експортує метрики за допомогою OTLP через HTTP, а Prometheus виступає як приймач OTLP замість збору метрик. Цей підхід можна використовувати в простіших налаштуваннях, експериментах або локальних середовищах розробки. Однак для промислових розгортань з використанням OpenTelemetry наполегливо рекомендується використовувати [OpenTelemetry Collector](/docs/collector/#when-to-use-a-collector) як проміжний компонент.

Цей посібник пояснює, як налаштувати прямий експорт метрик OTLP з SDK OpenTelemetry до точки доступу OTLP Prometheus. Він охоплює необхідні змінні середовища, конфігурацію експортера та ключові аспекти, такі як ідентифікація сервісу, інтервали експорту та операційні компроміси.

## Попередні вимоги {#prerequisites}

Перед початком переконайтеся, що виконані наступні вимоги:

- Налаштуйте Prometheus. Дотримуйтесь [прикладу конфігурації prometheus.yml у цьому посібнику Prometheus](https://prometheus.io/docs/guides/opentelemetry/#configuring-prometheus).
- [Увімкніть приймач OTLP](https://prometheus.io/docs/guides/opentelemetry/#enable-the-otlp-receiver)

Після налаштування Prometheus можна перейти до конфігурації вашого застосунку для прямого надсилання метрик до точки збору OTLP.

### Використання змінних середовища {#use-environment-variables}

Ви можете налаштувати SDK OpenTelemetry та бібліотеки інструментування за допомогою [стандартних змінних середовища](/docs/languages/sdk-configuration/). Встановіть змінні середовища перед запуском вашого застосунку. Наступні змінні OpenTelemetry потрібні для прямого надсилання метрик OpenTelemetry на сервер Prometheus на localhost:

```bash
export OTEL_EXPORTER_OTLP_PROTOCOL=http/protobuf
export OTEL_EXPORTER_OTLP_METRICS_ENDPOINT=http://localhost:9090/api/v1/otlp
```

Вимкніть трасування та журнали при використанні Prometheus, якщо вам потрібні лише метрики:

```bash
export OTEL_TRACES_EXPORTER=none
export OTEL_LOGS_EXPORTER=none
```

Стандартний інтервал надсилання метрик OpenTelemetry становить 60 секунд. Його можна налаштувати залежно від вимог до моніторингу. Наприклад, інтервал у 15 секунд забезпечує більш оперативні метрики та швидше сповіщення, але за рахунок більшого навантаження на мережу та обробку.

```bash
export OTEL_METRIC_EXPORT_INTERVAL=15000
```

Якщо ваша бібліотека інструментування стандартно не надає `service.name` та `service.instance.id`, наполегливо рекомендується їх встановити. Без цих атрибутів важко надійно ідентифікувати сервіси або відрізняти екземпляри, що значно ускладнює налагодження та агрегацію. Наведений нижче приклад передбачає, що команда `uuidgen` доступна у вашій системі.

```bash
export OTEL_SERVICE_NAME="my-example-service"
export OTEL_RESOURCE_ATTRIBUTES="service.instance.id=$(uuidgen)"
```

> [!NOTE]
>
> Переконайтеся, що `service.instance.id` унікальний для кожного екземпляра, і що новий `service.instance.id` генерується щоразу, коли змінюється атрибут ресурсу. [Рекомендований спосіб](/docs/specs/semconv/resource/service/#service-instance) полягає в генерації нового UUID при кожному запуску екземпляра.

### Налаштування телеметрії {#configure-telemetry}

Оновіть конфігурацію OpenTelemetry, щоб використовувати той самий `exporter` та `reader` з налаштування OTLP у вашій [документації SDK для мови](/docs/languages/). Якщо змінні середовища налаштовані та завантажені правильно, SDK OpenTelemetry читає їх автоматично.
