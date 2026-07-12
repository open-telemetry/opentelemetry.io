---
title: Поширення
description: Поширення контексту для Python SDK
weight: 65
default_lang_commit: 5489ba34bff91356aa2c501cd55f07eeb30cc355
cSpell:ignore: sqlcommenter
---

Поширення — це механізм, який переміщує дані між сервісами та процесами. Хоча це не обмежується трасуванням, саме це дозволяє трейсам будувати причинно-наслідкову інформацію про систему крізь сервіси, які довільно розподілені через межі процесів та мережі.

OpenTelemetry надає текстовий підхід для поширення контексту до віддалених сервісів, використовуючи HTTP заголовки [W3C Trace Context](https://www.w3.org/TR/trace-context/).

## Автоматичне поширення контексту {#automatic-context-propagation}

Бібліотеки інструментування для популярних Python фреймворків та бібліотек, таких як Jinja2, Flask, Django та Celery, пропагують контекст між сервісами за вас.

> [!NOTE]
>
> Використовуйте бібліотеки інструментування для поширення контексту. Хоча можливо поширювати контекст вручну, автоматичне інструментування Python та бібліотеки інструментування добре протестовані та легші у використанні.

## Ручне поширення контексту {#manual-context-propagation}

Наступний загальний приклад показує, як ви можете вручну поширювати контекст трасування.

Спочатку, на сервісі, що надсилає, зробіть інʼєкцію поточного `context`:

```python
from flask import Flask
import requests
from opentelemetry import trace, baggage
from opentelemetry.trace.propagation.tracecontext import TraceContextTextMapPropagator
from opentelemetry.baggage.propagation import W3CBaggagePropagator
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import ConsoleSpanExporter, BatchSpanProcessor

app = Flask(__name__)

trace.set_tracer_provider(TracerProvider())
trace.get_tracer_provider().add_span_processor(BatchSpanProcessor(ConsoleSpanExporter()))

tracer = trace.get_tracer(__name__)

@app.route('/')
def hello():
    with tracer.start_as_current_span("api1_span") as span:
        ctx = baggage.set_baggage("hello", "world")

        headers = {}
        W3CBaggagePropagator().inject(headers, ctx)
        TraceContextTextMapPropagator().inject(headers, ctx)
        print(headers)

        response = requests.get('http://127.0.0.1:5001/', headers=headers)
        return f"Hello from API 1! Response from API 2: {response.text}"

if __name__ == '__main__':
    app.run(port=5002)
```

На сервісі, що приймає, витягніть `context`, наприклад, з розібраних HTTP заголовків, а потім встановіть їх як поточний контекст трасування.

```python
from flask import Flask, request
from opentelemetry import trace, baggage
from opentelemetry.trace.propagation.tracecontext import TraceContextTextMapPropagator
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import ConsoleSpanExporter, BatchSpanProcessor
from opentelemetry.baggage.propagation import W3CBaggagePropagator

app = Flask(__name__)

trace.set_tracer_provider(TracerProvider())
trace.get_tracer_provider().add_span_processor(BatchSpanProcessor(ConsoleSpanExporter()))

tracer = trace.get_tracer(__name__)

@app.route('/')
def hello():
    # Example: Log headers received in the request in API 2
    headers = dict(request.headers)
    print(f"Received headers: {headers}")
    carrier ={'traceparent': headers['Traceparent']}
    ctx = TraceContextTextMapPropagator().extract(carrier=carrier)
    print(f"Received context: {ctx}")

    b2 ={'baggage': headers['Baggage']}
    ctx2 = W3CBaggagePropagator().extract(b2, context=ctx)
    print(f"Received context2: {ctx2}")

    # Start a new span
    with tracer.start_span("api2_span", context=ctx2):
       # Use propagated context
        print(baggage.get_baggage('hello', ctx2))
        return "Hello from API 2!"

if __name__ == '__main__':
    app.run(port=5001)
```

Звідти, коли у вас є десеріалізований активний контекст, ви можете створювати відрізки, які є частиною того ж самого трейсу з іншого сервісу.

### sqlcommenter

Деякі інструменти Python підтримують sqlcommenter, який збагачує запити до бази даних контекстною інформацією. До запитів, виконаних з увімкненим sqlcommenter, додаються настроювані пари ключ-значення. Наприклад:

```sql
"select * from auth_users; /*traceparent=00-01234567-abcd-01*/"
```

Це підтримує поширення контексту між клієнтом і сервером бази даних, коли увімкнено записи логів бази даних. Для отримання додаткової інформації див.:

- [Приклад sqlcommenter для Python від OpenTelemetry](https://github.com/open-telemetry/opentelemetry-python/tree/main/docs/examples/sqlcommenter/)
- [Семантичні домовленості — відрізки бази даних](/docs/specs/semconv/db/database-spans/#sql-commenter))
- [sqlcommenter](https://google.github.io/sqlcommenter/)

## Наступні кроки {#next-steps}

Щоб дізнатися більше про поширення, дивіться [API Поширювачів](/docs/specs/otel/context/api-propagators/).
