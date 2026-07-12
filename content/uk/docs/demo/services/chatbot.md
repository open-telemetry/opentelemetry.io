---
title: Сервіс Чатбота
linkTitle: Чатбот
cSpell:ignore: gradio httpx логуються
default_lang_commit: ffef14de849130bdf9ecd9d4912e75f5a8afdbfd
---

Цей сервіс надає чат-інтерфейс для AI-асистента демо. Він обслуговує веб-UI [Gradio](https://www.gradio.app/), пересилає кожне повідомлення користувача до [сервісу Агента](../agent/) через HTTP і показує відповідь. Він доступний через фронтенд-проксі за адресою `/chatbot`.

[Джерело сервісу Чатбота](https://github.com/open-telemetry/opentelemetry-demo/blob/main/src/chatbot/)

## Бібліотеки інструментування {#instrumentation-libraries}

Цей сервіс **не** запускається через обгортку `opentelemetry-instrument`. `Dockerfile` запускає скрипт безпосередньо, а інструментування налаштовується у коді:

```dockerfile
CMD ["python", "run.py"]
```

На відміну від [сервісу Агента](../agent/) та [MCP-сервісу](../mcp/), цей сервіс використовує OpenTelemetry SDK безпосередньо, а не Traceloop SDK. Дві бібліотеки інструментування HTTP-клієнта увімкнені:

```python
RequestsInstrumentor().instrument()
HTTPXClientInstrumentor().instrument()
```

Виклик агента виконується через `requests`, тому `opentelemetry-instrumentation-requests` створює клієнтський відрізок для нього та впроваджує контекст трасування у вихідний запит. Це те, що повʼязує чат-інтерфейс з агентом, а через нього — з викликами LLM та інструментів, які робить агент.

Сам сервер Gradio не інструментований, тому вхідні браузерні запити не створюють серверні відрізки. Трейси цього сервісу починаються з вихідного виклику до агента.

## Трейси {#traces}

### Ініціалізація трейсингу {#initializing-tracing}

Трейсинг налаштовується явно у `_configure_tracing`, який `run.py` викликає при імпорті. Код створює провайдера трейсерів, додає процесор пакетних відрізків із OTLP-експортером і реєструє провайдера глобально, щоб бібліотеки інструментування його використовували:

```python
def _configure_tracing() -> None:
    provider = TracerProvider()
    provider.add_span_processor(BatchSpanProcessor(OTLPSpanExporter()))
    trace.set_tracer_provider(provider)

    RequestsInstrumentor().instrument()
    HTTPXClientInstrumentor().instrument()
```

Експортер імпортується з `opentelemetry.exporter.otlp.proto.http.trace_exporter`, тому цей сервіс експортує через OTLP/HTTP. Docker Compose встановлює `OTEL_EXPORTER_OTLP_ENDPOINT` на порт OTLP/HTTP Колектора OpenTelemetry для цього сервісу, тоді як більшість інших сервісів демо експортують через gRPC. Точка доступу експорту, атрибути ресурсу та імʼя сервісу беруться зі стандартних змінних середовища OpenTelemetry.

### Створення нових відрізків {#create-new-spans}

Цей сервіс не створює власних відрізків. Він не отримує трейсер, не викликає `start_as_current_span` і не збагачує відрізки за допомогою `set_attribute`. Усі його відрізки походять з бібліотек інструментування `requests` та HTTPX.

## Метрики {#metrics}

Провайдер метрик не налаштований. Сервіс імпортує лише трейс-експортер і ніколи не викликає `metrics.set_meter_provider`, тому метрики, які можуть надавати бібліотеки інструментування `requests` та HTTPX, не мають куди експортуватися і не експортуються. Див. [матрицю покриття метрик](../../telemetry-features/metric-coverage/).

## Логи {#logs}

Сервіс налаштовує лише стандартний логер бібліотеки Python:

```python
logging.basicConfig(level=logging.INFO)
```

Запити до агента та будь-які помилки логуються через нього у `chat_with_agent`:

```python
logging.info(f"Sending request {payload} to Agent")
```

Оскільки не налаштовано `LoggerProvider` чи `LoggingHandler`, ці записи йдуть у stdout і збираються контейнером, а не експортуються через OTLP, тому вони не корелюються з трейсами. Див. [матрицю покриття логів](../../telemetry-features/log-coverage/).

Повний список змінних середовища та кроки усунення несправностей див. у [README сервісу](https://github.com/open-telemetry/opentelemetry-demo/tree/main/src/chatbot#readme).
