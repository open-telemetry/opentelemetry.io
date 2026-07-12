---
title: Сервіс Агента
linkTitle: Агент
cSpell:ignore: fastapi httpx langchain langgraph openai промпту промпти
default_lang_commit: ffef14de849130bdf9ecd9d4912e75f5a8afdbfd
---

Цей сервіс надає AI-асистента для демо. Він експонує точку доступу FastAPI, що приймає запит користувача, спрямовує його через LangGraph ReAct агента та викликає API магазину через вбудовані інструменти або через інструменти, завантажені з [MCP-сервісу](../mcp/).

[Джерело сервісу Агента](https://github.com/open-telemetry/opentelemetry-demo/blob/main/src/agent/)

## Налаштування LLM {#llm-configuration}

Зазвичай цей сервіс відтворює записані відповіді LLM, щоб демо працювало без живої моделі. Щоб використовувати справжній OpenAI-сумісний LLM, заповніть наступні змінні середовища у файлі `.env.override`:

```text
LLM_BASE_URL=https://api.openai.com/v1
LLM_MODEL=gpt-4o-mini
API_KEY=<замініть на API ключ>
USE_VCR=False
```

## Бібліотеки інструментування {#instrumentation-libraries}

Цей сервіс **не** запускається через обгортку `opentelemetry-instrument`. `Dockerfile` запускає скрипт безпосередньо, а інструментування налаштовується у коді:

```dockerfile
CMD ["python", "run.py"]
```

У `run.py` [Traceloop SDK](https://www.traceloop.com/) ініціалізує OpenTelemetry SDK та вмикає свій пакунок бібліотек інструментування для генеративного AI. Інструментування HTTPX потім вмикається явно:

```python
Traceloop.init(
    app_name=os.getenv("OTEL_SERVICE_NAME", "agent"),
)

HTTPXClientInstrumentor().instrument()
```

Інструментування FastAPI застосовується після створення обʼєкта застосунку, у `start_servers`:

```python
FastAPIInstrumentor.instrument_app(agent.app)
```

Разом ці бібліотеки створюють відрізки без будь-якого ручного створення відрізків:

- `opentelemetry-instrumentation-fastapi` — серверні відрізки для запитів до `POST /prompt`.
- `opentelemetry-instrumentation-httpx` — клієнтські відрізки для вихідних викликів, як до LLM API, так і до API фронтенду, що використовується інструментами магазину.
- Пакети Traceloop, зокрема `opentelemetry-instrumentation-langchain`, `opentelemetry-instrumentation-openai` та `opentelemetry-instrumentation-mcp` — відрізки для кроків LangChain та LangGraph, викликів LLM та MCP-інструментів при `MCP_ENABLED=True`.

## Трейси {#traces}

### Ініціалізація трейсингу {#initializing-tracing}

`Traceloop.init()` створює провайдера трейсерів із процесором пакетних відрізків та OTLP-експортером, і реєструє його як глобального провайдера трейсерів. Тому бібліотеки інструментування вище ділять єдиний конвеєр експорту.

Точка доступу експорту береться з `TRACELOOP_BASE_URL`, а не з `OTEL_EXPORTER_OTLP_ENDPOINT`, і Traceloop дописує до неї `/v1/traces`. У Docker Compose це вказує на порт OTLP/HTTP Колектора OpenTelemetry. Аргумент `app_name` стає атрибутом ресурсу `service.name`, а додаткові атрибути ресурсу зчитуються з `OTEL_RESOURCE_ATTRIBUTES`.

### Створення нових відрізків {#create-new-spans}

Метод `run_agent` обгорнутий у декоратор `@workflow` Traceloop, який запускає відрізок для всього запуску агента. Відрізки LLM та інструментів, створені бібліотеками інструментування, стають його нащадками:

```python
@workflow(name="astronomy_shop_agent_workflow")
async def run_agent(self, input_prompt, history: List[Dict] | None = None):
```

Це створює відрізок з імʼям `astronomy_shop_agent_workflow`. Оскільки одне запитання може спричинити кілька ходів міркування та виклику інструментів, саме цей проміжок часу обʼєднує один цикл роботи агента «від початку до кінця».

Поза цим декоратором, сервіс не використовує OpenTelemetry Tracing API безпосередньо: він не створює відрізки через `start_as_current_span` і не збагачує їх за допомогою `set_attribute`.

### Вміст промпту та завершення {#prompt-and-completion-content}

Комплексні інструментування генеративного AI дотримуються OpenTelemetry [семантичних угод для генеративного AI](/docs/specs/semconv/gen-ai/) і записують промпти та завершення як атрибути відрізків, `gen_ai.input.messages` та `gen_ai.output.messages`. Встановіть `TRACELOOP_TRACE_CONTENT=false`, щоб не поміщати вміст промпту та завершення до експортованих відрізків.

## Метрики {#metrics}

### Ініціалізація метрик {#initializing-metrics}

`Traceloop.init()` також налаштовує метрики, якщо не встановлено `TRACELOOP_METRICS_ENABLED=false`. Він створює провайдера вимірювань із періодичним експортером метрик для читання і реєструє його глобально, тому метрики, випромінювані бібліотеками інструментування FastAPI та HTTPX, експортуються.

### Користувацькі метрики {#custom-metrics}

Цей сервіс не визначає користувацьких метрик. Він не отримує метрики і не створює власних інструментів.

## Логи {#logs}

Сервіс налаштовує лише стандартний логер бібліотеки Python:

```python
logging.basicConfig(level=logging.INFO)
```

Експорт логів Traceloop стандартно вимкнено, а сервіс не налаштовує `LoggerProvider` чи `LoggingHandler`. Записи логів записуються у stdout і збираються контейнером, а не експортуються через OTLP, тому вони не корелюються з трейсами. Див. [матрицю покриття логів](../../telemetry-features/log-coverage/).

Повний список змінних середовища та кроки усунення несправностей див. у [README сервісу](https://github.com/open-telemetry/opentelemetry-demo/tree/main/src/agent#readme).
