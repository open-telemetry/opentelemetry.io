---
title: Приклад автоматичного інструментування
linkTitle: Приклад
weight: 20
aliases: [/docs/languages/python/automatic/example]
default_lang_commit: 5489ba34bff91356aa2c501cd55f07eeb30cc355
# prettier-ignore
cSpell:ignore: Aiohttp ASGI distro instrumentor mkdir MSIE Referer Starlette venv
---

Ця сторінка демонструє, як використовувати автоматичне інструментування Python в OpenTelemetry. Приклад базується на [прикладі OpenTracing][opentracing example]. Ви можете завантажити або переглянути [файли сирців][source files], використані на цій сторінці, з репозиторію `opentelemetry-python`.

Цей приклад використовує три різні скрипти. Основна відмінність між ними полягає в тому, як вони інструментовані:

1. `server_manual.py` інструментований _вручну_.
2. `server_automatic.py` інструментований _автоматично_.
3. `server_programmatic.py` інструментований _програмно_.

[_Програмне_ інструментування](#execute-the-programmatically-instrumented-server) це вид інструментування, який вимагає мінімального коду інструментування, доданого до застосунку. Лише деякі бібліотеки інструментування пропонують додаткові можливості, які надають вам більший контроль над процесом інструментування при використанні програмно.

Запустіть перший скрипт без агента автоматичного інструментування, а другий — з агентом. Вони обидва повинні давати однакові результати, демонструючи, що агент автоматичного інструментування робить те ж саме, що і ручне інструментування.

Автоматичне інструментування використовує [monkey-patching][], щоб динамічно переписувати методи та класи під час виконання через [бібліотеки інструментування][instrumentation]. Це зменшує обсяг роботи, необхідної для інтеграції OpenTelemetry у ваш код застосунку. Нижче ви побачите різницю між маршрутом Flask, інструментованим вручну, автоматично та програмно.

## Сервер інструментований вручну {#manually-instrumented-server}

`server_manual.py`

```python
@app.route("/server_request")
def server_request():
    with tracer.start_as_current_span(
        "server_request",
        context=extract(request.headers),
        kind=trace.SpanKind.SERVER,
        attributes=collect_request_attributes(request.environ),
    ):
        print(request.args.get("param"))
        return "served"
```

## Сервер інструментований автоматично {#automatically-instrumented-server}

`server_automatic.py`

```python
@app.route("/server_request")
def server_request():
    print(request.args.get("param"))
    return "served"
```

## Сервер інструментований програмно {#programmatically-instrumented-server}

`server_programmatic.py`

```python
instrumentor = FlaskInstrumentor()

app = Flask(__name__)

instrumentor.instrument_app(app)
# instrumentor.instrument_app(app, excluded_urls="/server_request")
@app.route("/server_request")
def server_request():
    print(request.args.get("param"))
    return "served"
```

## Підготовка {#prepare}

Виконайте наступний приклад в окремому віртуальному середовищі. Виконайте наступні команди для підготовки до автоматичного інструментування:

```sh
mkdir auto_instrumentation
cd auto_instrumentation
python -m venv venv
source ./venv/bin/activate
```

## Встановлення {#install}

Виконайте наступні команди для встановлення відповідних пакунків. Пакунок `opentelemetry-distro` залежить від кількох інших, таких як `opentelemetry-sdk` для власного інструментування вашого коду та `opentelemetry-instrumentation`, який надає кілька команд, що допомагають автоматично інструментувати програму.

```sh
pip install opentelemetry-distro
pip install flask requests
```

Виконайте команду `opentelemetry-bootstrap`:

```shell
opentelemetry-bootstrap -a install
```

Приклади, що слідують, надсилають результати інструментування до консолі. Дізнайтеся більше про встановлення та налаштування [OpenTelemetry Distro](/docs/languages/python/distro) для надсилання телеметрії до інших місць призначення, таких як OpenTelemetry Collector.

> **Примітка**: Щоб використовувати автоматичне інструментування через `opentelemetry-instrument`, ви повинні налаштувати його через змінні середовища або командний рядок. Агент створює конвеєр телеметрії, який не можна змінити іншим способом, окрім цих засобів. Якщо вам потрібна більша гнучкість для ваших конвеєрів телеметрії, тоді вам потрібно відмовитися від агента та імпортувати OpenTelemetry SDK та бібліотеки інструментування у ваш код і налаштувати їх там. Ви також можете розширити автоматичне інструментування, імпортуючи OpenTelemetry API. Для отримання додаткової інформації дивіться [API reference][].

## Виконання {#execute}

Цей розділ проведе вас через процес ручного інструментування сервера, а також процес виконання автоматично інструментованого сервера.

## Виконання вручну інструментованого сервера {#execute-the-manually-instrumented-server}

Виконайте сервер у двох окремих консолях, одну для запуску кожного з скриптів, що складають цей приклад:

```sh
source ./venv/bin/activate
python server_manual.py
```

```sh
source ./venv/bin/activate
python client.py
```

Консоль, що виконує `server_manual.py`, відобразить відрізки, згенеровані інструментуванням у форматі JSON. Відрізки повинні виглядати подібно до наступного прикладу:

```json
{
  "name": "server_request",
  "context": {
    "trace_id": "0xfa002aad260b5f7110db674a9ddfcd23",
    "span_id": "0x8b8bbaf3ca9c5131",
    "trace_state": "{}"
  },
  "kind": "SpanKind.SERVER",
  "parent_id": null,
  "start_time": "2020-04-30T17:28:57.886397Z",
  "end_time": "2020-04-30T17:28:57.886490Z",
  "status": {
    "status_code": "OK"
  },
  "attributes": {
    "http.method": "GET",
    "http.server_name": "127.0.0.1",
    "http.scheme": "http",
    "host.port": 8082,
    "http.host": "localhost:8082",
    "http.target": "/server_request?param=testing",
    "net.peer.ip": "127.0.0.1",
    "net.peer.port": 52872,
    "http.flavor": "1.1"
  },
  "events": [],
  "links": [],
  "resource": {
    "telemetry.sdk.language": "python",
    "telemetry.sdk.name": "opentelemetry",
    "telemetry.sdk.version": "0.16b1"
  }
}
```

## Виконання автоматично інструментованого сервера {#execute-the-automatically-instrumented-server}

Зупиніть виконання `server_manual.py`, натиснувши <kbd>Control+C</kbd> і виконайте наступну команду:

```sh
opentelemetry-instrument --traces_exporter console --metrics_exporter none --logs_exporter none python server_automatic.py
```

У консолі, де ви раніше виконували `client.py`, знову виконайте наступну команду:

```sh
python client.py
```

Консоль, що виконує `server_automatic.py`, відобразить відрізки, згенеровані інструментуванням у форматі JSON. Відрізки повинні виглядати подібно до наступного прикладу:

```json
{
  "name": "server_request",
  "context": {
    "trace_id": "0x9f528e0b76189f539d9c21b1a7a2fc24",
    "span_id": "0xd79760685cd4c269",
    "trace_state": "{}"
  },
  "kind": "SpanKind.SERVER",
  "parent_id": "0xb4fb7eee22ef78e4",
  "start_time": "2020-04-30T17:10:02.400604Z",
  "end_time": "2020-04-30T17:10:02.401858Z",
  "status": {
    "status_code": "OK"
  },
  "attributes": {
    "http.method": "GET",
    "http.server_name": "127.0.0.1",
    "http.scheme": "http",
    "host.port": 8082,
    "http.host": "localhost:8082",
    "http.target": "/server_request?param=testing",
    "net.peer.ip": "127.0.0.1",
    "net.peer.port": 48240,
    "http.flavor": "1.1",
    "http.route": "/server_request",
    "http.status_text": "OK",
    "http.status_code": 200
  },
  "events": [],
  "links": [],
  "resource": {
    "telemetry.sdk.language": "python",
    "telemetry.sdk.name": "opentelemetry",
    "telemetry.sdk.version": "0.16b1",
    "service.name": ""
  }
}
```

Ви можете побачити, що обидва виводи однакові, оскільки автоматичне інструментування робить те ж саме, що і ручне інструментування.

## Виконання програмно інструментованого сервера {#execute-the-programmatically-instrumented-server}

Також можливо використовувати бібліотеки інструментування (такі як `opentelemetry-instrumentation-flask`) самостійно, що може мати перевагу налаштування опцій. Однак, вибираючи це, ви відмовляєтеся від використання автоматичного інструментування, запускаючи ваш застосунок з `opentelemetry-instrument`, оскільки це взаємозаперечним.

Виконайте сервер так само як ви б робили для ручного інструментування, у двох окремих консолях, одну для запуску кожного з скриптів, що складають цей приклад:

```sh
source ./venv/bin/activate
python server_programmatic.py
```

```sh
source ./venv/bin/activate
python client.py
```

Результати повинні бути такими ж, як при запуску з ручним інструментуванням.

### Використання функцій програмного інструментування {#using-programmatic-instrumentation-features}

Деякі бібліотеки інструментування включають функції, які дозволяють більш точно контролювати інструментування програмно, бібліотека інструментування для Flask є однією з них.

Цей приклад має закоментований рядок, змініть його так:

```python
# instrumentor.instrument_app(app)
instrumentor.instrument_app(app, excluded_urls="/server_request")
```

Після повторного запуску прикладу, інструментування не повинно зʼявлятися на стороні сервера. Це через опцію `excluded_urls`, передану до `instrument_app`, яка ефективно зупиняє функцію `server_request` від інструментування, оскільки її URL відповідає регулярному виразу, переданому до `excluded_urls`.

## Інструментування під час налагодження {#instrumentation-while-debugging}

Режим налагодження можна увімкнути у застосунку Flask так:

```python
if __name__ == "__main__":
    app.run(port=8082, debug=True)
```

Режим налагодження може перешкоджати інструментуванню, оскільки він увімкне перезавантажувач. Щоб виконувати інструментування під час увімкненого режиму налагодження, встановіть опцію `use_reloader` у `False`:

```python
if __name__ == "__main__":
    app.run(port=8082, debug=True, use_reloader=False)
```

## Налаштування {#configure}

Автоматичне інструментування може споживати налаштування зі змінних середовища.

## Захоплення заголовків HTTP запитів та відповідей {#capture-http-request-and-response-headers}

Ви можете захоплювати попередньо визначені заголовки HTTP як атрибути відрізків, відповідно до [семантичної домовленості][semantic convention].

Щоб визначити, які заголовки HTTP ви хочете захоплювати, надайте список заголовків HTTP, розділених комами, через змінні середовища `OTEL_INSTRUMENTATION_HTTP_CAPTURE_HEADERS_SERVER_REQUEST` та `OTEL_INSTRUMENTATION_HTTP_CAPTURE_HEADERS_SERVER_RESPONSE`, наприклад:

```sh
export OTEL_INSTRUMENTATION_HTTP_CAPTURE_HEADERS_SERVER_REQUEST="Accept-Encoding,User-Agent,Referer"
export OTEL_INSTRUMENTATION_HTTP_CAPTURE_HEADERS_SERVER_RESPONSE="Last-Modified,Content-Type"
opentelemetry-instrument --traces_exporter console --metrics_exporter none --logs_exporter none python app.py
```

Ці опції налаштування підтримуються наступними інструментами HTTP:

- Aiohttp-server
- ASGI
- Django
- Falcon
- FastAPI
- Flask
- Pyramid
- Starlette
- Tornado
- WSGI

Якщо ці заголовки доступні, вони будуть включені у ваш відрізок:

```json
{
  "attributes": {
    "http.request.header.user-agent": [
      "Mozilla/4.0 (compatible; MSIE 8.0; Windows NT 5.1; Trident/4.0)"
    ],
    "http.request.header.accept_encoding": ["gzip, deflate, br"],
    "http.response.header.last_modified": ["2022-04-20 17:07:13.075765"],
    "http.response.header.content_type": ["text/html; charset=utf-8"]
  }
}
```

### Очищення захоплених заголовків {#sanitization-of-captured-headers}

Щоб запобігти зберіганню конфіденційних даних, таких як інформація, що дозволяє ідентифікувати особу (PII), ключі сеансу, паролі тощо, встановіть змінну середовища `OTEL_INSTRUMENTATION_HTTP_CAPTURE_HEADERS_SANITIZE_FIELDS` як список імен заголовків HTTP, що підлягають очищенню, розділених комами. Можна використовувати регулярні вирази, і всі імена заголовків будуть порівнюватися без урахування регістру.

Наприклад,

```sh
export OTEL_INSTRUMENTATION_HTTP_CAPTURE_HEADERS_SANITIZE_FIELDS=".*session.*,set-cookie"
```

замінить значення заголовків, таких як `session-id` та `set-cookie`, на `[REDACTED]` у відрізку.

[semantic convention]: /docs/specs/semconv/http/http-spans/
[api reference]: https://opentelemetry-python.readthedocs.io/en/latest/index.html
[instrumentation]: https://github.com/open-telemetry/opentelemetry-python-contrib/tree/main/opentelemetry-instrumentation
[monkey-patching]: https://stackoverflow.com/questions/5626193/what-is-monkey-patching
[opentracing example]: https://github.com/yurishkuro/opentracing-tutorial/tree/master/python
[source files]: https://github.com/open-telemetry/opentelemetry-python/tree/main/docs/examples/auto-instrumentation
