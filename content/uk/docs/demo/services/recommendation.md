---
title: Сервіс рекомендацій
linkTitle: Рекомендації
aliases: [recommendationservice]
default_lang_commit: e05fefe6c9f7d8b159d9a9a95128098c646c78c4
cSpell:ignore: cpython NOTSET
---

Цей сервіс відповідає за отримання списку рекомендованих продуктів для користувача на основі наявних ідентифікаторів продуктів, які переглядає користувач.

[Сирці сервісу рекомендацій](https://github.com/open-telemetry/opentelemetry-demo/blob/main/src/recommendation/)

## Автоінструментування {#auto-instrumentation}

Цей сервіс на основі Python використовує автоінструментатор OpenTelemetry для Python, що досягається за допомогою обгортки `opentelemetry-instrument` для запуску скриптів. Це можна зробити в команді `ENTRYPOINT` для `Dockerfile` сервісу.

```dockerfile
ENTRYPOINT [ "opentelemetry-instrument", "python", "recommendation_server.py" ]
```

## Трейси {#traces}

### Ініціалізація трасування {#initializing-tracing}

SDK OpenTelemetry ініціалізується в блоці коду `__main__`. Цей код створить провайдера трасування та встановить процесор відрізків для використання. Експортні точки доступу, атрибути ресурсів та імʼя сервісу автоматично встановлюються автоінструментатором OpenTelemetry на основі змінних середовища.

```python
tracer = trace.get_tracer_provider().get_tracer("recommendation")
```

### Додавання атрибутів до автоінструментованих відрізків {#adding-attributes-to-auto-instrumented-spans}

Під час виконання автоінструментованого коду ви можете отримати поточний відрізок з контексту.

```python
span = trace.get_current_span()
```

Додавання атрибутів до відрізка здійснюється за допомогою `set_attribute` на обʼєкті відрізка. У функції `ListRecommendations` атрибут додається до відрізка.

```python
span.set_attribute("app.products_recommended.count", len(prod_list))
```

### Створення нових відрізків {#create-new-spans}

Нові відрізки можуть бути створені та поміщені в активний контекст за допомогою `start_as_current_span` з обʼєкта трасувальника OpenTelemetry. Коли використовується разом з блоком `with`, відрізок автоматично завершиться, коли блок завершить виконання. Це робиться у функції `get_product_list`.

```python
with tracer.start_as_current_span("get_product_list") as span:
```

## Метрики {#metrics}

### Ініціалізація метрик {#initializing-metrics}

SDK OpenTelemetry ініціалізується в блоці коду `__main__`. Цей код створить провайдера метрик. Експортні точки доступу, атрибути ресурсів та імʼя сервісу автоматично встановлюються автоінструментатором OpenTelemetry на основі змінних середовища.

```python
meter = metrics.get_meter_provider().get_meter("recommendation")
```

### Власні метрики {#custom-metrics}

Наразі доступні наступні користувацькі метрики:

- `app_recommendations_counter`: Кумулятивна кількість рекомендованих продуктів за
  виклик сервісу

### Автоінструментовані метрики {#auto-instrumented-metrics}

Наступні метрики доступні через автоінструментування, завдяки `opentelemetry-instrumentation-system-metrics`, який встановлюється як частина `opentelemetry-bootstrap` при побудові Docker-образу сервісу recommendation:

- `runtime.cpython.cpu_time`
- `runtime.cpython.memory`
- `runtime.cpython.gc_count`

## Логи {#logs}

### Ініціалізація логів {#initializing-logs}

SDK OpenTelemetry ініціалізується в блоці коду `__main__`. Наступний код створює провайдера логів з пакетним процесором, експортером логів OTLP та обробником логів. Нарешті, він створює логер для використання в застосунку.

```python
logger_provider = LoggerProvider(
    resource=Resource.create(
        {
            'service.name': service_name,
        }
    ),
)
set_logger_provider(logger_provider)
log_exporter = OTLPLogExporter(insecure=True)
logger_provider.add_log_record_processor(BatchLogRecordProcessor(log_exporter))
handler = LoggingHandler(level=logging.NOTSET, logger_provider=logger_provider)

logger = logging.getLogger('main')
logger.addHandler(handler)
```

### Створення записів логів {#create-log-records}

Створюйте логи за допомогою логера. Приклади можна знайти у функціях `ListRecommendations` та `get_product_list`.

```python
logger.info(f"Receive ListRecommendations for product ids:{prod_list}")
```

Як ви бачите, після ініціалізації, записи логів можуть бути створені так само як у стандартному Python. Бібліотеки OpenTelemetry автоматично додають ідентифікатор трасування та ідентифікатор відрізка для кожного запису логу, і таким чином дозволяють корелювати логи та трейси.

### Примітки {#notes}

Логи для Python все ще експериментальні, і можна очікувати деякі зміни. Реалізація в цьому сервісі слідує [прикладу логів для Python](https://github.com/open-telemetry/opentelemetry-python/blob/stable/docs/examples/logs/example.py).
