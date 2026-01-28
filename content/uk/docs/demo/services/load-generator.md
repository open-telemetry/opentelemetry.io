---
title: Генератор навантаження
aliases: [loadgenerator]
default_lang_commit: 5489ba34bff91356aa2c501cd55f07eeb30cc355
cSpell:ignore: instrumentor loadgenerator locustfile urllib
---

Генератор навантаження базується на фреймворку для тестування навантаження [Locust](https://locust.io). Стандартно він буде імітувати користувачів, які запитують різні маршрути з фронтенду.

[Сирці генератора навантаження](https://github.com/open-telemetry/opentelemetry-demo/blob/main/src/load-generator/)

## Трейси {#traces}

### Ініціалізація Трейсінгу {#initializing-tracing}

Оскільки цей сервіс є [locustfile](https://docs.locust.io/en/stable/writing-a-locustfile.html), SDK OpenTelemetry ініціалізується після виразів імпорту. Цей код створить постачальника трейсерів та встановить процесор відрізків для використання. Експортні точки доступу, атрибути ресурсів та імʼя сервісу автоматично встановлюються за допомогою [змінних середовища OpenTelemetry](/docs/specs/otel/configuration/sdk-environment-variables/).

```python
tracer_provider = TracerProvider()
trace.set_tracer_provider(tracer_provider)
tracer_provider.add_span_processor(BatchSpanProcessor(OTLPSpanExporter()))
```

### Додавання бібліотек інструментування {#adding-instrumentation-libraries}

Щоб додати бібліотеки інструментування, потрібно імпортувати Instrumentor для кожної бібліотеки у вашому Python коді. Locust використовує бібліотеки `Requests` та `URLLib3`, тому ми імпортуємо їх Instrumentorʼи.

```python
from opentelemetry.instrumentation.requests import RequestsInstrumentor
from opentelemetry.instrumentation.urllib3 import URLLib3Instrumentor
```

У вашому коді перед використанням бібліотеки Instrumentor потрібно ініціалізувати, викликавши `instrument()`.

```python
RequestsInstrumentor().instrument()
URLLib3Instrumentor().instrument()
```

Після ініціалізації кожен запит Locust для цього генератора навантаження матиме свій власний трейс з відрізком для кожної з бібліотек `Requests` та `URLLib3`.

## Метрики {#metrics}

TBD

## Логи {#logs}

TBD

## Baggage

OpenTelemetry Baggage використовується генератором навантаження для позначення того, що трейси синтетично згенеровані. Це робиться у функції `on_start` шляхом створення обʼєкта контексту, що містить елемент baggage, та асоціювання цього контексту для всіх завдань генератора навантаження.

```python
ctx = baggage.set_baggage("synthetic_request", "true")
context.attach(ctx)
```
