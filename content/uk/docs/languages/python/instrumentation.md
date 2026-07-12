---
title: Інструментування
aliases: [manual]
weight: 20
description: Ручне інструментування для OpenTelemetry Python
default_lang_commit: 5489ba34bff91356aa2c501cd55f07eeb30cc355
cSpell:ignore: millis ottrace textmap
---

<!-- markdownlint-disable no-duplicate-heading -->

{{% include instrumentation-intro %}}

## Налаштування {#setup}

Спочатку переконайтеся, що у вас встановлені пакунки API та SDK:

```shell
pip install opentelemetry-api
pip install opentelemetry-sdk
```

## Трейси {#traces}

### Отримання Tracer {#acquire-tracer}

Щоб почати трасування, вам потрібно ініціалізувати [`TracerProvider`](/docs/concepts/signals/traces/#tracer-provider) і за бажанням стандартно встановити його як глобальний.

```python
from opentelemetry import trace
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import (
    BatchSpanProcessor,
    ConsoleSpanExporter,
)

provider = TracerProvider()
processor = BatchSpanProcessor(ConsoleSpanExporter())
provider.add_span_processor(processor)

# Sets the global default tracer provider
trace.set_tracer_provider(provider)

# Creates a tracer from the global tracer provider
tracer = trace.get_tracer("my.tracer.name")
```

### Створення відрізків {#create-spans-with-decorators}

Щоб створити [відрізок](/docs/concepts/signals/traces/#spans), зазвичай потрібно почати його як поточний відрізок.

```python
def do_work():
    with tracer.start_as_current_span("span-name") as span:
        # do some work that 'span' will track
        print("doing some work...")
        # When the 'with' block goes out of scope, 'span' is closed for you
```

Ви також можете використовувати `start_span` для створення відрізка без його встановлення як поточного. Це зазвичай робиться для відстеження паралельних або асинхронних операцій.

### Створення вкладених відрізків {#create-nested-spans}

Якщо у вас є окрема під-операція, яку ви хочете відстежити як частину іншої, ви можете створити [відрізки](/docs/concepts/signals/traces/#spans) для представлення відносин:

```python
def do_work():
    with tracer.start_as_current_span("parent") as parent:
        # do some work that 'parent' tracks
        print("doing some work...")
        # Create a nested span to track nested work
        with tracer.start_as_current_span("child") as child:
            # do some work that 'child' tracks
            print("doing some nested work...")
            # the nested span is closed when it's out of scope

        # This span is also closed when it goes out of scope
```

Коли ви переглядаєте відрізки в інструменті візуалізації трейсів, `child` буде відстежуватися як
вкладений відрізок у `parent`.

### Створення відрізків з декораторами {#create-spans-with-decorators}

Зазвичай один [відрізок](/docs/concepts/signals/traces/#spans) відстежує виконання всієї функції. У такому випадку можна використовувати декоратор для зменшення коду:

```python
@tracer.start_as_current_span("do_work")
def do_work():
    print("doing some work...")
```

Використання декоратора еквівалентне створенню відрізка всередині `do_work()` і його завершенню після завершення `do_work()`.

Щоб використовувати декоратор, у вас повинен бути екземпляр `tracer`, доступний глобально для вашої
функції.

### Отримання поточного відрізка {#get-the-current-span}

Іноді корисно отримати поточний [відрізок](/docs/concepts/signals/traces/#spans) у певний момент часу, щоб ви могли додати до нього більше інформації.

```python
from opentelemetry import trace

current_span = trace.get_current_span()
# enrich 'current_span' with some information
```

### Додавання атрибутів до відрізка {#add-attributes-to-a-span}

[Атрибути](/docs/concepts/signals/traces/#attributes) дозволяють прикріплювати пари ключ/значення до [відрізка](/docs/concepts/signals/traces/#spans), щоб він містив більше інформації про поточну операцію, яку він відстежує.

```python
from opentelemetry import trace

current_span = trace.get_current_span()

current_span.set_attribute("operation.value", 1)
current_span.set_attribute("operation.name", "Saying hello!")
current_span.set_attribute("operation.other-stuff", [1, 2, 3])
```

### Додавання семантичних атрибутів {#add-semantic-attributes}

[Семантичні атрибути](/docs/specs/semconv/general/trace/) є попередньо визначеними [атрибутами](/docs/concepts/signals/traces/#attributes), які є загальновідомими іменами для поширених типів даних. Використання семантичних атрибутів дозволяє нормалізувати цю інформацію у ваших системах.

Щоб використовувати семантичні атрибути в Python, переконайтеся, що у вас встановлений пакунок семантичних домовленостей:

```shell
pip install opentelemetry-semantic-conventions
```

Потім ви можете використовувати його в коді:

```python
from opentelemetry import trace
from opentelemetry.semconv.trace import SpanAttributes

// ...

current_span = trace.get_current_span()
current_span.set_attribute(SpanAttributes.HTTP_METHOD, "GET")
current_span.set_attribute(SpanAttributes.HTTP_URL, "https://opentelemetry.io/")
```

### Додавання подій {#adding-events}

[Подія](/docs/concepts/signals/traces/#span-events) — це повідомлення, яке може прочитати людина, на [відрізку](/docs/concepts/signals/traces/#spans), що представляє "щось, що відбувається" під час його життя. Ви можете думати про це як про примітивний журнал.

```python
from opentelemetry import trace

current_span = trace.get_current_span()

current_span.add_event("Gonna try it!")

# Do the thing

current_span.add_event("Did it!")
```

### Додавання посилань {#adding-links}

[Відрізок](/docs/concepts/signals/traces/#spans) може бути створений з нульовою або більшою кількістю посилань [відрізків](/docs/concepts/signals/traces/#span-links), які повʼязують його з іншим відрізком. Для створення посилання потрібен контекст відрізка.

```python
from opentelemetry import trace

tracer = trace.get_tracer(__name__)

with tracer.start_as_current_span("span-1"):
    # Do something that 'span-1' tracks.
    ctx = trace.get_current_span().get_span_context()
    link_from_span_1 = trace.Link(ctx)

with tracer.start_as_current_span("span-2", links=[link_from_span_1]):
    # Do something that 'span-2' tracks.
    # The link in 'span-2' is causally associated it with the 'span-1',
    # but it is not a child span.
    pass
```

### Встановлення статусу відрізка {#set-span-status}

{{% include "span-status-preamble" %}}

```python
from opentelemetry import trace
from opentelemetry.trace import Status, StatusCode

current_span = trace.get_current_span()

try:
    # something that might fail
except:
    current_span.set_status(Status(StatusCode.ERROR))
```

### Запис помилок у відрізки {#record-exceptions-in-spans}

Доброю ідеєю може бути запис помилок, коли вони трапляються. Рекомендується робити це разом з встановленням [статусу відрізка](#set-span-status).

```python
from opentelemetry import trace
from opentelemetry.trace import Status, StatusCode

current_span = trace.get_current_span()

try:
    # something that might fail

# Consider catching a more specific exception in your code
except Exception as ex:
    current_span.set_status(Status(StatusCode.ERROR))
    current_span.record_exception(ex)
```

### Зміна стандартного формату розповсюдження {#change-the-default-propagation-format}

Стандартно OpenTelemetry Python використовуватиме такі формати розповсюдження:

- W3C Trace Context
- W3C Baggage

Якщо вам потрібно змінити стандартні налаштування, ви можете зробити це або через змінні середовища, або в коді:

#### Використання змінних середовища {#using-environment-variables}

Ви можете встановити змінну середовища `OTEL_PROPAGATORS` зі списком, розділеним комами. Прийняті значення:

- `"tracecontext"`: W3C Trace Context
- `"baggage"`: W3C Baggage
- `"b3"`: B3 Single
- `"b3multi"`: B3 Multi
- `"jaeger"`: Jaeger
- `"xray"`: AWS X-Ray (сторонній)
- `"ottrace"`: OT Trace (сторонній)
- `"none"`: Немає автоматично налаштованого розповсюджувача.

Стандартна конфігурація еквівалентна до `OTEL_PROPAGATORS="tracecontext,baggage"`.

#### Використання SDK API {#using-sdk-apis}

Альтернативно, ви можете змінити формат у коді.

Наприклад, якщо вам потрібно використовувати формат розповсюдження Zipkin B3, ви можете встановити пакунок B3:

```shell
pip install opentelemetry-propagator-b3
```

А потім встановити розповсюджувач B3 у вашому коді ініціалізації трасування:

```python
from opentelemetry.propagate import set_global_textmap
from opentelemetry.propagators.b3 import B3Format

set_global_textmap(B3Format())
```

Зверніть увагу, що змінні середовища переважатимуть над тим, що налаштовано в коді.

### Додатково {#further-reading}

- [Концепції трасування](/docs/concepts/signals/traces/)
- [Специфікація трасування](/docs/specs/otel/overview/#tracing-signal)
- [Документація API трасування Python](https://opentelemetry-python.readthedocs.io/en/latest/api/trace.html)
- [Документація SDK трасування Python](https://opentelemetry-python.readthedocs.io/en/latest/sdk/trace.html)

## Метрики {#metrics}

Щоб почати збирати метрики, вам потрібно ініціалізувати [`MeterProvider`](/docs/specs/otel/metrics/api/#meterprovider) і за бажанням стандартно встановити його як глобальний.

```python
from opentelemetry import metrics
from opentelemetry.sdk.metrics import MeterProvider
from opentelemetry.sdk.metrics.export import (
    ConsoleMetricExporter,
    PeriodicExportingMetricReader,
)

metric_reader = PeriodicExportingMetricReader(ConsoleMetricExporter())
provider = MeterProvider(metric_readers=[metric_reader])

# Sets the global default meter provider
metrics.set_meter_provider(provider)

# Creates a meter from the global meter provider
meter = metrics.get_meter("my.meter.name")
```

### Створення та використання синхронних інструментів {#creating-and-using-synchronous-instruments}

Інструменти використовуються для отримання вимірювань вашої програми. [Синхронні інструменти](/docs/specs/otel/metrics/api/#synchronous-and-asynchronous-instruments) використовуються разом з логікою обробки застосунків, наприклад, при обробці запиту або виклику іншої служби.

Спочатку створіть свій інструмент. Інструменти зазвичай створюються один раз на рівні модуля або класу, а потім використовуються разом з бізнес-логікою. Цей приклад використовує інструмент [Counter](/docs/specs/otel/metrics/api/#counter) для підрахунку кількості виконаних робіт:

```python
work_counter = meter.create_counter(
    "work.counter", unit="1", description="Counts the amount of work done"
)
```

Використовуючи [операцію додавання](/docs/specs/otel/metrics/api/#add) лічильника, наведений нижче код збільшує кількість на один, використовуючи тип робочого елемента як атрибут.

```python
def do_work(work_item):
    # count the work being doing
    work_counter.add(1, {"work.type": work_item.work_type})
    print("doing some work...")
```

### Створення та використання асинхронних інструментів {#creating-and-using-asynchronous-instruments}

[Асинхронні інструменти](/docs/specs/otel/metrics/api/#synchronous-and-asynchronous-instruments) дають користувачеві можливість реєструвати функції зворотного виклику, які викликаються за запитом для вимірювання. Це корисно для періодичного вимірювання значення, яке не можна інструментувати безпосередньо. Асинхронні інструменти створюються з нульовою або більшою кількістю зворотних викликів, які будуть викликані під час збору метрик. Кожен зворотний виклик приймає опції від SDK і повертає свої спостереження.

Цей приклад використовує [Asynchronous Gauge](/docs/specs/otel/metrics/api/#asynchronous-gauge) для звітування про поточну версію конфігурації, надану сервером конфігурації, шляхом сканування HTTP-точки доступу. Спочатку напишіть зворотний виклик для створення спостережень:

```python
from typing import Iterable
from opentelemetry.metrics import CallbackOptions, Observation


def scrape_config_versions(options: CallbackOptions) -> Iterable[Observation]:
    r = requests.get(
        "http://configserver/version_metadata", timeout=options.timeout_millis / 10**3
    )
    for metadata in r.json():
        yield Observation(
            metadata["version_num"], {"config.name": metadata["version_num"]}
        )
```

Зверніть увагу, що OpenTelemetry передасть опції вашому зворотному виклику, що містять тайм-аут. Зворотні виклики повинні поважати цей тайм-аут, щоб уникнути блокування на невизначений час. Нарешті, створіть інструмент зі зворотним викликом для його реєстрації:

```python
meter.create_observable_gauge(
    "config.version",
    callbacks=[scrape_config_versions],
    description="The active config version for each configuration",
)
```

### Додатково {#further-reading-1}

- [Концепції метрик](/docs/concepts/signals/metrics/)
- [Специфікація метрик](/docs/specs/otel/metrics/)
- [Документація API метрик Python](https://opentelemetry-python.readthedocs.io/en/latest/api/metrics.html)
- [Документація SDK метрик Python](https://opentelemetry-python.readthedocs.io/en/latest/sdk/metrics.html)

## Логи {#logs}

API та SDK для логів наразі розробляються. Щоб почати збір логів, вам потрібно ініціалізувати [`LoggerProvider`](/docs/specs/otel/logs/api/#loggerprovider) і за бажанням встановити його стандартно як глобальний. Потім використовуйте вбудований модуль ведення логів Python для створення записів журналу, які OpenTelemetry може обробити.

```python
import logging
from opentelemetry.sdk._logs import LoggerProvider, LoggingHandler
from opentelemetry.sdk._logs.export import BatchLogRecordProcessor, ConsoleLogRecordExporter # ConsoleLogExporter on versions earlier than 1.39.0
from opentelemetry._logs import set_logger_provider

provider = LoggerProvider()
processor = BatchLogRecordProcessor(ConsoleLogRecordExporter())
provider.add_log_record_processor(processor)
# Sets the global default logger provider
set_logger_provider(provider)

handler = LoggingHandler(level=logging.INFO, logger_provider=provider)
logging.basicConfig(handlers=[handler], level=logging.INFO)

logging.getLogger(__name__).info("This is an OpenTelemetry log record!")
```

### Додатково {#further-reading-2}

- [Концепції Логів](/docs/concepts/signals/logs/)
- [Специфікація Логів](/docs/specs/otel/logs/)
- [Документація API Logs Python](https://opentelemetry-python.readthedocs.io/en/latest/api/_logs.html)
- [Документація SDK Logs Python](https://opentelemetry-python.readthedocs.io/en/latest/sdk/_logs.html)

## Наступні кроки {#next-steps}

Вам також потрібно буде налаштувати відповідний експортер для [експорту ваших телеметричних даних](/docs/languages/python/exporters) до одного або більше бекендів телеметрії.
