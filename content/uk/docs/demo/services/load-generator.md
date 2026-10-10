---
title: Генератор навантаження
aliases: [loadgenerator]
default_lang_commit: 4309389695c38fee3cb6e68bf1186e4a99d5da4c
# prettier-ignore
cSpell:ignore: gevent instrumentor loadgenerator locustfile urllib інструментатори
---

Генератор навантаження базується на фреймворку тестування навантаження на Python [Locust](https://locust.io). Стандартно він буде імітувати користувачів, які запитують різні маршрути з фронтенду.

[Сирці генератора навантаження](https://github.com/open-telemetry/opentelemetry-demo/blob/main/src/load-generator/)

## Трейси {#traces}

### Ініціалізація трасування {#initializing-tracing}

Оскільки ця служба є [locustfile](https://docs.locust.io/en/stable/writing-a-locustfile.html), OpenTelemetry SDK ініціалізується після операторів імпорту. Цей код створить провайдера трейсерів і налаштує процесор відрізків для використання. Точки доступу експорту, атрибути ресурсів та імʼя сервісу автоматично встановлюються за допомогою [змінних середовища OpenTelemetry](/docs/specs/otel/configuration/sdk-environment-variables/).

```python
tracer_provider = TracerProvider()
trace.set_tracer_provider(tracer_provider)
tracer_provider.add_span_processor(BatchSpanProcessor(OTLPSpanExporter(insecure=True)))
```

### Додавання бібліотек інструментування {#adding-instrumentation-libraries}

Щоб додати бібліотеки інструментування, потрібно імпортувати інструментатори для кожної бібліотеки у вашому коді Python. Locust використовує бібліотеки `Requests`, `URLLib3` та `Jinja2`, тому ми імпортуємо їхні інструментатори.

```python
from opentelemetry.instrumentation.jinja2 import Jinja2Instrumentor
from opentelemetry.instrumentation.requests import RequestsInstrumentor
from opentelemetry.instrumentation.urllib3 import URLLib3Instrumentor
```

Інструментатори ініціалізуються шляхом прямого виклику `instrument()`, а не через `opentelemetry-instrument`, щоб уникнути помилок, спричинених використанням Locust gevent monkey-patching.

```python
Jinja2Instrumentor().instrument()
RequestsInstrumentor().instrument()
URLLib3Instrumentor().instrument()
```

Після ініціалізації кожен запит Locust, зроблений цим генератором навантаження, матиме власний трейс з відрізком для кожної з бібліотек `Requests` та `URLLib3`.

### Ручні відрізки {#manual-spans}

Кожна симульована дія користувача (перегляд товару, перегляд кошика, оформлення замовлення тощо) також отримує власний ручний відрізок, створений за допомогою `tracer.start_as_current_span`. Атрибути, такі як `demo.product.id`, `demo.ad.category` та `demo.cart.items.count`, додаються там, де це доречно. Ці атрибути оголошені для `service.load_generator` у [схемі телеметрії](https://github.com/open-telemetry/opentelemetry-demo/blob/main/telemetry-schema/services/load_generator.yaml).

## Метрики {#metrics}

`MeterProvider` налаштовується з `PeriodicExportingMetricReader` та експортером OTLP. `SystemMetricsInstrumentor` використовує його для звітування про системні метрики рівня процесу (CPU, памʼять тощо) для самого генератора навантаження.

## Логи {#logs}

`LoggerProvider` групує та експортує записи логів через OTLP. Стандартний модуль `logging` підключається до нього через `LoggingHandler`, а `LoggingInstrumentor` додає ідентифікатори активного трейсу та відрізка до кожного запису логу, тому виклики на кшталт `logging.info(...)` у всьому locustfile відображаються корельованими зі своїм відрізком.

## Baggage

OpenTelemetry Baggage використовується генератором навантаження для позначення того, що його трейси синтетично згенеровані. Це робиться у функції `on_start` шляхом створення обʼєкта контексту, що містить елементи baggage, і приєднання цього контексту для всіх завдань, які виконує симульований користувач.

```python
ctx = baggage.set_baggage("session.id", session_id)
ctx = baggage.set_baggage("synthetic_request", "true", context=ctx)
context.attach(ctx)
```

Контекст приєднується поза блоком `with` будь-якого відрізка: приєднання його всередині менеджера контексту відрізка призвело б до того, що вихід з відрізка відʼєднав би baggage, мовчки відкидаючи його на решту сесії користувача.

Baggage сам по собі не позначає телеметрію. Кожен сервіс бекенду зчитує запис `synthetic_request` з отриманого baggage і копіює його у власні відрізки та записи логів як атрибут, і саме цей атрибут визначає, чи надійшла телеметрія від синтетичного потоку. Фронтенд встановлює `demo.synthetic_request`, а служби оформлення замовлення та платежів встановлюють `user_agent.synthetic.type` в `test`. Оскільки маркер потрапляє на саму телеметрію, ви можете фільтрувати трафік генератора навантаження в будь-якому запиті у вашій системі спостереження.
