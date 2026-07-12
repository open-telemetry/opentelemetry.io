---
title: MCP-сервіс
linkTitle: MCP
cSpell:ignore: fastmcp httpx необгорнутими
default_lang_commit: ffef14de849130bdf9ecd9d4912e75f5a8afdbfd
---

Цей сервіс експонує операції магазину як інструменти через [Model Context Protocol](https://modelcontextprotocol.io/), щоб [сервіс Агента](../agent/) та інші MCP-сумісні клієнти могли їх викликати. Кожен інструмент — це тонка обгортка, що викликає API фронтенду через HTTP.

[Джерело MCP-сервісу](https://github.com/open-telemetry/opentelemetry-demo/blob/main/src/mcp/)

## Бібліотеки інструментування {#instrumentation-libraries}

Цей сервіс **не** запускається через обгортку `opentelemetry-instrument`. `Dockerfile` запускає скрипт безпосередньо, а інструментування налаштовується у коді:

```dockerfile
CMD ["python", "run.py"]
```

У `run.py` [Traceloop SDK](https://www.traceloop.com/) ініціалізує OpenTelemetry SDK та вмикає свій пакунок бібліотек інструментування, включаючи `opentelemetry-instrumentation-mcp`. Інструментування HTTPX потім вмикається явно:

```python
Traceloop.init(
    app_name=os.getenv("OTEL_SERVICE_NAME", "mcp"),
)

HTTPXClientInstrumentor().instrument()
```

Це поєднання охоплює обидві сторони сервісу без будь-якого ручного створення відрізків:

- `opentelemetry-instrumentation-mcp` — відрізки для вхідних викликів MCP-інструментів, оброблених FastMCP-сервером.
- `opentelemetry-instrumentation-httpx` — клієнтські відрізки для вихідних HTTP-викликів, які кожен інструмент робить до API фронтенду.

Оскільки агент і цей сервіс інструментовані однаковим MCP-інструментуванням, контекст поширюється через MCP-транспорт, і виклик інструменту, зроблений агентом, з'являється в тому самому трейсі, що й робота, яку виконує цей сервіс.

## Трейси {#traces}

### Ініціалізація трейсингу {#initializing-tracing}

`Traceloop.init()` створює провайдера трейсерів із процесором пакетних відрізків та OTLP-експортером, і реєструє його як глобального провайдера трейсерів, тому бібліотеки інструментування вище ділять єдиний конвеєр експорту.

Точка доступу експорту береться з `TRACELOOP_BASE_URL`, а не з `OTEL_EXPORTER_OTLP_ENDPOINT`, і Traceloop дописує до неї `/v1/traces`. У Docker Compose це вказує на порт OTLP/HTTP Колектора OpenTelemetry. Аргумент `app_name` стає атрибутом ресурсу `service.name`, а додаткові атрибути ресурсу зчитуються з `OTEL_RESOURCE_ATTRIBUTES`.

### Створення нових відрізків {#create-new-spans}

Цей сервіс не створює власних відрізків. Інструменти реєструються на FastMCP сервері і залишаються необгорнутими, тому всі відрізки приходять з бібліотек інструментування:

```python
self.mcp.tool("add_to_cart")(tools.add_to_cart)
```

Сервіс не використовує OpenTelemetry Tracing API безпосередньо: він не викликає `start_as_current_span` і не збагачує відрізки за допомогою `set_attribute`.

## Метрики {#metrics}

### Ініціалізація метрик {#initializing-metrics}

`Traceloop.init()` також налаштовує метрики, якщо не встановлено `TRACELOOP_METRICS_ENABLED=false`. Він створює провайдера метрів із періодичним експортером метрик для читання і реєструє його глобально, щоб метрики, випромінювані бібліотекою інструментування HTTPX, експортувалися.

### Користувацькі метрики {#custom-metrics}

Цей сервіс не визначає користувацьких метрик. Він не отримує метр і не створює власних інструментів.

## Логи {#logs}

Сервіс налаштовує лише стандартний логер бібліотеки Python:

```python
logging.basicConfig(level=logging.INFO)
```

Експорт логів Traceloop стандартно вимкнено, а сервіс не налаштовує `LoggerProvider` чи `LoggingHandler`. Записи логів записуються у stdout і збираються контейнером, а не експортуються через OTLP, тому вони не корелюються з трейсами. Див. [матрицю покриття логів](../../telemetry-features/log-coverage/).

Повний список змінних середовища та кроки усунення несправностей див. у [README сервісу](https://github.com/open-telemetry/opentelemetry-demo/tree/main/src/mcp#readme).
