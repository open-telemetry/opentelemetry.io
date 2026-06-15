---
title: Рецепти
weight: 100
default_lang_commit: e05fefe6c9f7d8b159d9a9a95128098c646c78c4
---

Ця сторінка містить рецепти для поширених сценаріїв.

## Створення нового відрізка {#create-a-new-span}

```python
from opentelemetry import trace

tracer = trace.get_tracer("my.tracer")
with tracer.start_as_current_span("print") as span:
    print("foo")
    span.set_attribute("printed_string", "foo")
```

## Отримання та модифікація відрізка {#getting-and-modifying-a-span}

```python
from opentelemetry import trace

current_span = trace.get_current_span()
current_span.set_attribute("hometown", "Seattle")
```

## Створення вкладеного відрізка {#create-a-nested-span}

```python
from opentelemetry import trace
import time

tracer = trace.get_tracer("my.tracer")

# Створіть новий відрізок для відстеження деякої роботи
with tracer.start_as_current_span("parent"):
    time.sleep(1)

    # Створіть вкладений відрізок для відстеження вкладеної роботи
    with tracer.start_as_current_span("child"):
        time.sleep(2)
        # вкладений відрізок закривається, коли він виходить за межі області видимості

    # Тепер відрізок батька знову є поточним відрізком
    time.sleep(1)

    # Цей відрізок також закривається, коли він виходить за межі області видимості
```

## Захоплення baggage в різних контекстах {#capturing-baggage-at-different-contexts}

```python
from opentelemetry import trace, baggage

tracer = trace.get_tracer("my.tracer")
with tracer.start_as_current_span(name="root span") as root_span:
    parent_ctx = baggage.set_baggage("context", "parent")
    with tracer.start_as_current_span(
        name="child span", context=parent_ctx
    ) as child_span:
        child_ctx = baggage.set_baggage("context", "child")

print(baggage.get_baggage("context", parent_ctx))
print(baggage.get_baggage("context", child_ctx))
```

## Ручне встановлення контексту відрізка {#manually-setting-span-context}

Зазвичай ваш застосунок або фреймворк обслуговування подбає про поширення вашого контексту трасування за вас. Але в деяких випадках вам може знадобитися зберегти ваш контекст трасування (за допомогою `.inject`) і відновити його в іншому місці (за допомогою `.extract`) самостійно.

```python
from opentelemetry import trace, context
from opentelemetry.trace import NonRecordingSpan, SpanContext, TraceFlags
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import ConsoleSpanExporter, BatchSpanProcessor
from opentelemetry.trace.propagation.tracecontext import TraceContextTextMapPropagator

# Налаштуйте простий процесор для запису відрізків у консоль, щоб ми могли бачити, що відбувається.
trace.set_tracer_provider(TracerProvider())
trace.get_tracer_provider().add_span_processor(BatchSpanProcessor(ConsoleSpanExporter()))

tracer = trace.get_tracer("my.tracer")

# TextMapPropagator стандартно працює з будь-яким обʼєктом, подібним до словника, як його носій. Ви також можете реалізувати власні геттери та сеттери.
with tracer.start_as_current_span('first-trace'):
    carrier = {}
    # Запишіть поточний контекст у носій.
    TraceContextTextMapPropagator().inject(carrier)

# Далі може бути в іншому потоці, на іншій машині тощо.
# Як типовий приклад, це було б в іншому мікросервісі, і носій був би переданий через HTTP заголовки.

# Витягніть контекст трасування з носія.
# Ось як може виглядати типовий носій, як би було зроблено його інʼєкцію вище.
carrier = {'traceparent': '00-a9c3b99a95cc045e573e163c3ac80a77-d99d251a8caecd06-01'}
# Потім ми використовуємо поширювач, щоб отримати контекст з нього.
ctx = TraceContextTextMapPropagator().extract(carrier=carrier)

# Замість вилучення контексту трасування з носія, якщо у вас вже є обʼєкт SpanContext, ви можете отримати контекст трасування з нього таким чином.
span_context = SpanContext(
    trace_id=2604504634922341076776623263868986797,
    span_id=5213367945872657620,
    is_remote=True,
    trace_flags=TraceFlags(0x01)
)
ctx = trace.set_span_in_context(NonRecordingSpan(span_context))

# Тепер є кілька способів використання контексту трасування.

# Ви можете передати обʼєкт контексту при початку відрізка.
with tracer.start_as_current_span('child', context=ctx) as span:
    span.set_attribute('primes', [2, 3, 5, 7])

# Або ви можете зробити його поточним контекстом, і тоді наступний відрізок підхопить його.
# Повернутий токен дозволяє вам відновити попередній контекст.
token = context.attach(ctx)
try:
    with tracer.start_as_current_span('child') as span:
        span.set_attribute('evens', [2, 4, 6, 8])
finally:
    context.detach(token)
```

## Використання декількох провайдерів трасування з різними ресурсами {#using-multiple-tracer-providers-with-different-resources}

```python
from opentelemetry import trace
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.resources import Resource
from opentelemetry.sdk.trace.export import ConsoleSpanExporter, BatchSpanProcessor

# Глобальний провайдер трасування, який можна встановити лише один раз
trace.set_tracer_provider(
    TracerProvider(resource=Resource.create({"service.name": "service1"}))
)
trace.get_tracer_provider().add_span_processor(BatchSpanProcessor(ConsoleSpanExporter()))

tracer = trace.get_tracer("tracer.one")
with tracer.start_as_current_span("some-name") as span:
    span.set_attribute("key", "value")



another_tracer_provider = TracerProvider(
    resource=Resource.create({"service.name": "service2"})
)
another_tracer_provider.add_span_processor(BatchSpanProcessor(ConsoleSpanExporter()))

another_tracer = trace.get_tracer("tracer.two", tracer_provider=another_tracer_provider)
with another_tracer.start_as_current_span("name-here") as span:
    span.set_attribute("another-key", "another-value")
```
