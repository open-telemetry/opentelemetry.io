---
title: Приклад автоматичної інструменталізації логів
linkTitle: Приклад логів
weight: 20
aliases: [/docs/languages/python/automatic/logs-example]
default_lang_commit: 5489ba34bff91356aa2c501cd55f07eeb30cc355
cSpell:ignore: distro mkdir virtualenv
---

Ця сторінка демонструє, як використовувати автоматичну інструменталізацію логів у Python в OpenTelemetry.

На відміну від трасування та метрик, для логів немає еквівалентного API. Є лише SDK. Для Python ви використовуєте бібліотеку `logger`, а потім SDK OTel додає обробник OTLP до кореневого логера, перетворюючи логер Python на логер OTLP. Один зі способів досягти цього задокументовано в прикладі логів у [репозиторії OpenTelemetry Python][репозиторій OpenTelemetry Python].

Інший спосіб досягти цього — через підтримку автоматичної інструменталізації логів у Python. Приклад нижче базується на прикладі логів у [репозиторії OpenTelemetry Python][репозиторій OpenTelemetry Python].

> Існує API мосту логів; однак, він відрізняється від API трасування та метрик, оскільки його не використовують розробники застосунків для створення логів. Натомість вони використовували б цей API мосту для налаштування доповнювачів логів у стандартних бібліотеках логування для конкретної мови. Більше інформації можна знайти в [Logs API](/docs/specs/otel/logs/api/).

Почніть зі створення теки прикладів та файлу прикладу Python:

```sh
mkdir python-logs-example
cd python-logs-example
touch example.py
```

Вставте наступний вміст у `example.py`:

```python
import logging

from opentelemetry import trace

tracer = trace.get_tracer_provider().get_tracer(__name__)

# Кореляція контексту трасування
with tracer.start_as_current_span("foo"):
    # Виконати щось
    current_span = trace.get_current_span()
    current_span.add_event("Це подія відрізку")
    logging.getLogger().error("Це повідомлення лога")
```

Відкрийте та скопіюйте приклад [otel-collector-config.yaml](https://github.com/open-telemetry/opentelemetry-python/blob/main/docs/examples/logs/otel-collector-config.yaml) і збережіть його у файлі `python-logs-example/otel-collector-config.yaml`.

## Підготовка {#prepare}

Виконайте наступний приклад, ми рекомендуємо використовувати віртуальне середовище для цього. Виконайте наступні команди для підготовки до автоматичної інструменталізації логів:

```sh
mkdir python_logs_example
virtualenv python_logs_example
source python_logs_example/bin/activate
```

## Встановлення {#install}

Наступні команди встановлюють відповідні пакунки. Пакунок `opentelemetry-distro` залежить від кількох інших, таких як `opentelemetry-sdk` для власної інструменталізації вашого коду та `opentelemetry-instrumentation`, який надає кілька команд, що допомагають автоматично інструментувати програму.

```sh
pip install opentelemetry-distro
pip install opentelemetry-exporter-otlp
```

Приклади, що слідують, надсилають результати інструменталізації до консолі. Дізнайтеся більше про встановлення та налаштування [OpenTelemetry Distro](/docs/languages/python/distro) для надсилання телеметрії до інших місць призначення, таких як OpenTelemetry Collector.

> **Примітка**: Щоб використовувати автоматичну інструменталізацію через `opentelemetry-instrument`, ви повинні налаштувати її через змінні середовища або командний рядок. Агент створює конвеєр телеметрії, який не можна змінити іншим способом, окрім цих засобів. Якщо вам потрібна більша гнучкість для ваших конвеєрів телеметрії, тоді вам потрібно відмовитися від агента та імпортувати SDK OpenTelemetry та бібліотеки інструменталізації у ваш код і налаштувати їх там. Ви також можете розширити автоматичну інструменталізацію, імпортуючи API OpenTelemetry. Для отримання додаткової інформації дивіться [API reference][].

## Виконання {#execute}

Цей розділ проведе вас через процес виконання автоматично інструментованих логів.

Відкрийте нове вікно термінала та запустіть OTel Collector:

```sh
docker run -it --rm -p 4317:4317 -p 4318:4318 \
  -v $(pwd)/otel-collector-config.yaml:/etc/otelcol-config.yml \
  --name otelcol \
  otel/opentelemetry-collector:{{% param collector_vers %}} \
  "--config=/etc/otelcol-config.yml"
```

Відкрийте інший термінал і запустіть програму Python:

```sh
source python_logs_example/bin/activate

export OTEL_PYTHON_LOGGING_AUTO_INSTRUMENTATION_ENABLED=true
opentelemetry-instrument \
  --traces_exporter console,otlp \
  --metrics_exporter console,otlp \
  --logs_exporter console,otlp \
  --service_name python-logs-example \
  python $(pwd)/example.py
```

Приклад виводу:

```text
...
ScopeSpans #0
ScopeSpans SchemaURL:
InstrumentationScope __main__
Span #0
    Trace ID       : 389d4ac130a390d3d99036f9cd1db75e
    Parent ID      :
    ID             : f318281c4654edc5
    Name           : foo
    Kind           : Internal
    Start time     : 2023-08-18 17:04:05.982564 +0000 UTC
    End time       : 2023-08-18 17:04:05.982667 +0000 UTC
    Status code    : Unset
    Status message :
Events:
SpanEvent #0
     -> Name: Це подія відрізку
     -> Timestamp: 2023-08-18 17:04:05.982586 +0000 UTC

...

ScopeLogs #0
ScopeLogs SchemaURL:
InstrumentationScope opentelemetry.sdk._logs._internal
LogRecord #0
ObservedTimestamp: 1970-01-01 00:00:00 +0000 UTC
Timestamp: 2023-08-18 17:04:05.982605056 +0000 UTC
SeverityText: ERROR
SeverityNumber: Error(17)
Body: Str(Це повідомлення лога)
Attributes:
     -> otelSpanID: Str(f318281c4654edc5)
     -> otelTraceID: Str(389d4ac130a390d3d99036f9cd1db75e)
     -> otelTraceSampled: Bool(true)
     -> otelServiceName: Str(python-logs-example)
Trace ID: 389d4ac130a390d3d99036f9cd1db75e
Span ID: f318281c4654edc5
...
```

Зверніть увагу, що подія відрізка та лог мають однаковий SpanID (`f318281c4654edc5`). SDK логування додає SpanID поточного відрізка до будь-яких зареєстрованих подій для покращення можливості кореляції телеметрії.

[api reference]: https://opentelemetry-python.readthedocs.io/en/latest/index.html
[репозиторій OpenTelemetry Python]: https://github.com/open-telemetry/opentelemetry-python/tree/main/docs/examples/logs
