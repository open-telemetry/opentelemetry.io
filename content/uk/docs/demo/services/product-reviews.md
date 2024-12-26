---
title: Сервіс відгуків про товари
linkTitle: Відгуки про товари
aliases: [productreviewsservice]
default_lang_commit: 9cdf79c9345a05fb82d0e67132c9f68dabddadba
# prettier-ignore
cSpell:ignore: cpython NOTSET productreviewsservice логгер логгера
---

Цей сервіс відповідає за видачу відгуків про товари та відповіді на запитання про конкретний товар на основі опису товару та відгуків.

Він використовує LLM, сумісний з OpenAI, для відповіді на запитання користувачів про конкретний товар.

Відгуки про товари зберігаються в базі даних (PostgreSQL).

[Сирці сервісу відгуків про товари](https://github.com/open-telemetry/opentelemetry-demo/blob/main/src/product-reviews/)

## Конфігурація LLM {#llm-configuration}

Стандартно цей сервіс використовує імітацію LLM, яка відповідає формату API OpenAI. Її можна замінити на справжній OpenAI LLM, заповнивши наступні змінні середовища у файлі `.env.override`:

```text
LLM_BASE_URL=https://api.openai.com/v1
LLM_MODEL=gpt-4o-mini
OPENAI_API_KEY=<replace with API key>
```

## Автоматичне інструментування {#auto-instrumentation}

Цей сервіс на базі Python використовує автоматичне інструментування OpenTelemetry для Python, що здійснюється за допомогою Python-обгортки `opentelemetry-instrument` для запуску скриптів. Це можна зробити в команді `ENTRYPOINT` для `Dockerfile` сервісу.

```dockerfile
ENTRYPOINT [ "opentelemetry-instrument", "python", "product_reviews_server.py" ]
```

## Трейси {#traces}

### Ініціалізація трасування {#initializing-tracing}

SDK OpenTelemetry ініціалізується в блоці коду `__main__`. Цей код створить провайдера трасування та встановить процесор Span для використання. Експортування точок доступу виходу, атрибутів ресурсів та назви сервісу автоматично встановлюються за допомогою автоматичного інструментування OpenTelemetry на основі змінних середовища.

```python
tracer = trace.get_tracer_provider().get_tracer("product-reviews")
```

### Додавання атрибутів до автоматично інструментованих відрізків {#add-attributes-to-auto-instrumented-spans}

Під час виконання автоматично інструментованого коду ви можете отримати поточний відрізок з контексту.

```python
span = trace.get_current_span()
```

Додавання атрибутів до відрізка здійснюється за допомогою функції `set_attribute` обʼєкта відрізка. У функції `get_product_reviews` до відрізка додається атрибут для фіксації ідентифікатора товару, який був переданий у запиті:

```python
span.set_attribute("app.product.id", request_product_id)
```

### Створення нових відрізків {#create-new-spans}

Нові відрізки можна створювати та розміщувати в активному контексті за допомогою `start_as_current_span` обʼєкта OpenTelemetry Tracer. При використанні разом із блоком `with` відрізок автоматично закінчується, коли блок завершує виконання. Це робиться у функції `get_product_reviews`.

```python
with tracer.start_as_current_span("get_product_reviews") as span:
```

## Метрики {#metrics}

### Ініціалізація метрик {#initializing-metrics}

SDK OpenTelemetry ініціалізується в блоці коду `__main__`. Цей код створить провайдера вимірювання. Експорт точок доступу, атрибути ресурсів та назва сервісу автоматично встановлюються за допомогою інструменту автоматичного інструментування OpenTelemetry на основі змінних середовища.

```python
meter = metrics.get_meter_provider().get_meter("product-reviews")
```

### Власні метрики {#custom-metrics}

Наразі доступні такі власні метрики:

- `app_product_review_counter`: сукупна кількість відгуків про товар, повернута сервісом
- `app_ai_assistant_counter`: сукупна кількість запитань, надісланих до AI-асистента товару

### Автоматично інструментовані метрики {#auto-instrumented-metrics}

Наступні метрики доступні завдяки автоматичній інструментації, наданій `opentelemetry-instrumentation-system-metrics`, яка встановлюється як частина `opentelemetry-bootstrap` під час створення образу Docker для сервісу оглядів товарів:

- `runtime.cpython.cpu_time`
- `runtime.cpython.memory`
- `runtime.cpython.gc_count`

## Логи {#logs}

### Ініціалізація логів {#initializing-logs}

SDK OpenTelemetry ініціалізується в блоці коду `__main__`. Наступний код створює провайдера логів із пакетним процесором, експортером логів OTLP та обробником логів. Насамкінець він створює логгер для використання в усьому застосунку.

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

Створіть логи за допомогою логгера. Приклади можна знайти у функції `get_ai_assistant_response`.

```python
logger.info(f"Model wants to call {len(tool_calls)} tool(s)")
```

Як бачите, після ініціалізації записи логів можна створювати так само, як і в стандартному Python. Бібліотеки OpenTelemetry автоматично додають ідентифікатор трасування та ідентифікатор відрізка для кожного запису логу, що дозволяє виконувати зіставлення логів і трасувань.

### Примітки {#notes}

Логи для Python все ще перебувають в експериментальному стані, тому можливі деякі зміни. Реалізація в цьому сервісі відповідає [прикладу логу Python](https://github.com/open-telemetry/opentelemetry-python/blob/stable/docs/examples/logs/example.py).
