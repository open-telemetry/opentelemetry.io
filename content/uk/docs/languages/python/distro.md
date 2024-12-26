---
title: OpenTelemetry Distro
linkTitle: Distro
weight: 110
default_lang_commit: 5b55172d51fb21f69c2f4fc9eb014f72a2b1c50a
cSpell:ignore: distro
---

Для того, щоб зробити використання OpenTelemetry та автоматичну інструментацію якомога швидшою без втрати гнучкості, дистрибутиви OpenTelemetry надають механізм для автоматичної конфігурації деяких з найбільш поширених опцій для користувачів. Використовуючи їхню потужність, користувачі OpenTelemetry можуть налаштовувати компоненти відповідно до своїх потреб. Пакунок `opentelemetry-distro` надає деякі стандартні налаштування для користувачів, які хочуть розпочати роботу, він налаштовує:

- SDK TracerProvider
- BatchSpanProcessor
- OTLP `SpanExporter` для надсилання даних до OpenTelemetry Collector

Пакунок також надає стартову точку для всіх, хто зацікавлений у створенні альтернативного дистрибутиву. Інтерфейси, реалізовані пакунком, завантажуються автоматичною інструментацією через точки входу `opentelemetry_distro` та `opentelemetry_configurator` для конфігурації застосунку перед виконанням будь-якого іншого коду.

Для автоматичного експорту даних з OpenTelemetry до OpenTelemetry Collector, встановлення пакунка налаштує всі необхідні точки входу.

```sh
pip install opentelemetry-distro[otlp] opentelemetry-instrumentation
```

Запустіть Collector локально, щоб побачити експортовані дані. Створіть наступний файл:

```yaml
# /tmp/otel-collector-config.yaml
receivers:
  otlp:
    protocols:
      grpc:
        endpoint: 0.0.0.0:4317
      http:
        endpoint: 0.0.0.0:4318
exporters:
  # ПРИМІТКА: До v0.86.0 використовуйте `logging` замість `debug`.
  debug:
    verbosity: detailed
service:
  pipelines:
    traces:
      receivers: [otlp]
      exporters: [debug]
```

Потім запустіть Docker контейнер:

```sh
docker run -p 4317:4317 \
    -v /tmp/otel-collector-config.yaml:/etc/otel-collector-config.yaml \
    otel/opentelemetry-collector:latest \
    --config=/etc/otel-collector-config.yaml
```

Наступний код створить відрізок без конфігурації.

```python
# no_configuration.py
from opentelemetry import trace

with trace.get_tracer("my.tracer").start_as_current_span("foo"):
    with trace.get_tracer("my.tracer").start_as_current_span("bar"):
        print("baz")
```

Нарешті, запустіть `no_configuration.py` з автоматичною інструментацією:

```sh
opentelemetry-instrument python no_configuration.py
```

Отриманий відрізок зʼявиться у виводі з collector і виглядатиме приблизно так:

```nocode
Resource labels:
     -> telemetry.sdk.language: STRING(python)
     -> telemetry.sdk.name: STRING(opentelemetry)
     -> telemetry.sdk.version: STRING(1.1.0)
     -> service.name: STRING(unknown_service)
InstrumentationLibrarySpans #0
InstrumentationLibrary __main__
Span #0
    Trace ID       : db3c99e5bfc50ef8be1773c3765e8845
    Parent ID      : 0677126a4d110cb8
    ID             : 3163b3022808ed1b
    Name           : bar
    Kind           : SPAN_KIND_INTERNAL
    Start time     : 2021-05-06 22:54:51.23063 +0000 UTC
    End time       : 2021-05-06 22:54:51.230684 +0000 UTC
    Status code    : STATUS_CODE_UNSET
    Status message :
Span #1
    Trace ID       : db3c99e5bfc50ef8be1773c3765e8845
    Parent ID      :
    ID             : 0677126a4d110cb8
    Name           : foo
    Kind           : SPAN_KIND_INTERNAL
    Start time     : 2021-05-06 22:54:51.230549 +0000 UTC
    End time       : 2021-05-06 22:54:51.230706 +0000 UTC
    Status code    : STATUS_CODE_UNSET
    Status message :
```
