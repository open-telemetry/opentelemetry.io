---
title: Початок роботи
description: Отримайте телеметрію для вашого застосунку менш ніж за 5 хвилин!
weight: 10
default_lang_commit: 5f551752635886a0d2d6b2a83e5a36866ca1b5f1
# prettier-ignore
cSpell:ignore: debugexporter diceroller distro maxlen randint rolldice rollspan venv
---

Ця сторінка покаже вам, як почати роботу з OpenTelemetry у Python.

Ви дізнаєтесь, як можна автоматично інструментувати простий застосунок так, щоб [трейси][], [метрики][] та [логи][] виводилися в консоль.

## Передумови {#prerequisites}

Переконайтеся, що у вас встановлено наступне:

- [Python 3](https://www.python.org/)

> [!NOTE]
>
> У Windows, Python зазвичай викликається за допомогою `python` замість `python3`. Наступні приклади показують правильні команди для вашої операційної системи.

## Приклад застосунку {#example-application}

Наступний приклад використовує базовий застосунок [Flask](https://flask.palletsprojects.com/). Якщо ви не використовуєте Flask, це не проблема, ви можете використовувати OpenTelemetry Python з іншими веб-фреймворками, такими як Django та FastAPI. Для повного списку бібліотек для підтримуваних фреймворків дивіться [реєстр](/ecosystem/registry/?component=instrumentation&language=python).

Для складніших прикладів дивіться [приклади](/docs/languages/python/examples/).

## Встановлення {#installation}

Для початку створіть середовище в новій теці:

{{< tabpane text=true >}} {{% tab "Linux/macOS" %}}

```shell
mkdir otel-getting-started
cd otel-getting-started
python3 -m venv venv
source ./venv/bin/activate
```

{{% /tab %}} {{% tab "Windows (PowerShell)" %}}

```powershell
mkdir otel-getting-started
cd otel-getting-started
python -m venv venv
.\venv\Scripts\Activate.ps1
```

{{% /tab %}} {{< /tabpane >}}

Тепер встановіть Flask:

```shell
pip install flask
```

### Створення та запуск HTTP сервера {#create-and-launch-an-http-server}

Створіть файл `app.py` та додайте до нього наступний код:

```python
from random import randint
from flask import Flask, request
import logging

app = Flask(__name__)
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@app.route("/rolldice")
def roll_dice():
    player = request.args.get('гравець', default=None, type=str)
    result = str(roll())
    if player:
        logger.warning("%s кидає кубик: %s", player, result)
    else:
        logger.warning("Анонімний гравець кидає кубик: %s", result)
    return result


def roll():
    return randint(1, 6)
```

Запустіть застосунок за допомогою наступної команди та відкрийте <http://localhost:8080/rolldice> у вашому вебоглядачі, щоб переконатися, що він працює.

```sh
flask run -p 8080
```

## Інструментування {#instrumentation}

Інструментування без коду буде генерувати телеметричні дані від вашого імені. Є кілька варіантів, які ви можете використовувати, детальніше описані в [Інструментування без коду](/docs/zero-code/python/). Тут ми будемо використовувати агент `opentelemetry-instrument`.

Встановіть пакунок `opentelemetry-distro`, який містить API OpenTelemetry, SDK, а також інструменти `opentelemetry-bootstrap` та `opentelemetry-instrument`, які ви будете використовувати нижче.

```shell
pip install opentelemetry-distro
```

Запустіть команду `opentelemetry-bootstrap`:

```shell
opentelemetry-bootstrap -a install
```

Це встановить інструментування Flask.

## Запуск інструментованого застосунку {#running-instrumented-application}

Тепер ви можете запустити ваш інструментований застосунок за допомогою `opentelemetry-instrument` і вивести його в консоль:

{{< tabpane text=true >}} {{% tab "Linux/macOS" %}}

```shell
export OTEL_PYTHON_LOGGING_AUTO_INSTRUMENTATION_ENABLED=true
opentelemetry-instrument \
    --traces_exporter console \
    --metrics_exporter console \
    --logs_exporter console \
    --service_name dice-server \
    flask run -p 8080
```

{{% /tab %}} {{% tab "Windows (PowerShell)" %}}

```powershell
$env:OTEL_PYTHON_LOGGING_AUTO_INSTRUMENTATION_ENABLED="true"
opentelemetry-instrument `
    --traces_exporter console `
    --metrics_exporter console `
    --logs_exporter console `
    --service_name dice-server `
    flask run -p 8080
```

{{% /tab %}} {{< /tabpane >}}

Відкрийте <http://localhost:8080/rolldice> у вашому вебоглядачі та перезавантажте сторінку кілька разів. Через деякий час ви побачите, що відрізки виводяться в консоль, наприклад:

<details>
<summary>Переглянути приклад виводу</summary>

```json
{
    "name": "/rolldice",
    "context": {
        "trace_id": "0xdb1fc322141e64eb84f5bd8a8b1c6d1f",
        "span_id": "0x5c2b0f851030d17d",
        "trace_state": "[]"
    },
    "kind": "SpanKind.SERVER",
    "parent_id": null,
    "start_time": "2023-10-10T08:14:32.630332Z",
    "end_time": "2023-10-10T08:14:32.631523Z",
    "status": {
        "status_code": "UNSET"
    },
    "attributes": {
        "http.method": "GET",
        "http.server_name": "127.0.0.1",
        "http.scheme": "http",
        "net.host.port": 8080,
        "http.host": "localhost:8080",
        "http.target": "/rolldice?rolls=12",
        "net.peer.ip": "127.0.0.1",
        "http.user_agent": "curl/8.1.2",
        "net.peer.port": 58419,
        "http.flavor": "1.1",
        "http.route": "/rolldice",
        "http.status_code": 200
    },
    "events": [],
    "links": [],
    "resource": {
        "attributes": {
            "telemetry.sdk.language": "python",
            "telemetry.sdk.name": "opentelemetry",
            "telemetry.sdk.version": "1.17.0",
            "service.name": "dice-server",
            "telemetry.auto.version": "0.38b0"
        },
        "schema_url": ""
    }
}
{
    "body": "Анонімний гравець кидає кубик: 3",
    "severity_number": "<SeverityNumber.WARN: 13>",
    "severity_text": "WARNING",
    "attributes": {
        "otelSpanID": "5c2b0f851030d17d",
        "otelTraceID": "db1fc322141e64eb84f5bd8a8b1c6d1f",
        "otelServiceName": "dice-server"
    },
    "timestamp": "2023-10-10T08:14:32.631195Z",
    "trace_id": "0xdb1fc322141e64eb84f5bd8a8b1c6d1f",
    "span_id": "0x5c2b0f851030d17d",
    "trace_flags": 1,
    "resource": "BoundedAttributes({'telemetry.sdk.language': 'python', 'telemetry.sdk.name': 'opentelemetry', 'telemetry.sdk.version': '1.17.0', 'service.name': 'dice-server', 'telemetry.auto.version': '0.38b0'}, maxlen=None)"
}
```

</details>

Згенерований відрізок відстежує тривалість запиту до маршруту `/rolldice`.

Рядок журналу, що виводиться під час запиту, містить той самий ідентифікатор трейсу та відрізка і експортується в консоль через експортер журналів.

Надішліть ще кілька запитів до точки доступу, а потім або зачекайте трохи, або завершіть роботу застосунку, і ви побачите метрики у виводі консолі, наприклад:

<details>
<summary>Переглянути приклад виводу</summary>

```json
{
  "resource_metrics": [
    {
      "resource": {
        "attributes": {
          "service.name": "unknown_service",
          "telemetry.auto.version": "0.34b0",
          "telemetry.sdk.language": "python",
          "telemetry.sdk.name": "opentelemetry",
          "telemetry.sdk.version": "1.13.0"
        },
        "schema_url": ""
      },
      "schema_url": "",
      "scope_metrics": [
        {
          "metrics": [
            {
              "data": {
                "aggregation_temporality": 2,
                "data_points": [
                  {
                    "attributes": {
                      "http.flavor": "1.1",
                      "http.host": "localhost:5000",
                      "http.method": "GET",
                      "http.scheme": "http",
                      "http.server_name": "127.0.0.1"
                    },
                    "start_time_unix_nano": 1666077040061693305,
                    "time_unix_nano": 1666077098181107419,
                    "value": 0
                  }
                ],
                "is_monotonic": false
              },
              "description": "вимірює кількість одночасних HTTP-запитів, які зараз виконуються",
              "name": "http.server.active_requests",
              "unit": "requests"
            },
            {
              "data": {
                "aggregation_temporality": 2,
                "data_points": [
                  {
                    "attributes": {
                      "http.flavor": "1.1",
                      "http.host": "localhost:5000",
                      "http.method": "GET",
                      "http.scheme": "http",
                      "http.server_name": "127.0.0.1",
                      "http.status_code": 200,
                      "net.host.port": 5000
                    },
                    "bucket_counts": [0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                    "count": 1,
                    "explicit_bounds": [
                      0, 5, 10, 25, 50, 75, 100, 250, 500, 1000
                    ],
                    "max": 1,
                    "min": 1,
                    "start_time_unix_nano": 1666077040063027610,
                    "sum": 1,
                    "time_unix_nano": 1666077098181107419
                  }
                ]
              },
              "description": "вимірює тривалість вхідного HTTP-запиту",
              "name": "http.server.duration",
              "unit": "ms"
            }
          ],
          "schema_url": "",
          "scope": {
            "name": "opentelemetry.instrumentation.flask",
            "schema_url": "",
            "version": "0.34b0"
          }
        }
      ]
    }
  ]
}
```

</details>

## Додайте ручне інструментування до автоматичного інструментування {#add-manual-instrumentation-to-automatic-instrumentation}

Автоматичне інструментування захоплює телеметрію на краях ваших систем, таких як вхідні та вихідні HTTP-запити, але не захоплює те, що відбувається у вашому застосунку. Для цього вам потрібно написати деяке [ручне інструментування](../instrumentation/). Ось як ви можете легко звʼязати ручне інструментування з автоматичним інструментуванням.

### Трейси {#traces}

Спочатку змініть `app.py`, щоб включити код, який ініціалізує трасувальник і використовує його для створення трейсу, який є дочірнім до автоматично згенерованого:

```python
from random import randint
from flask import Flask

from opentelemetry import trace

# Отримайте трасувальник
tracer = trace.get_tracer("diceroller.tracer")

app = Flask(__name__)

@app.route("/rolldice")
def roll_dice():
    return str(roll())

def roll():
    # Це створює новий відрізок, який є дочірнім до поточного
    with tracer.start_as_current_span("roll") as rollspan:
        res = randint(1, 6)
        rollspan.set_attribute("roll.value", res)
        return res
```

Тепер знову запустіть застосунок:

{{< tabpane text=true >}} {{% tab "Linux/macOS" %}}

```shell
export OTEL_PYTHON_LOGGING_AUTO_INSTRUMENTATION_ENABLED=true
opentelemetry-instrument \
    --traces_exporter console \
    --metrics_exporter console \
    --logs_exporter console \
    --service_name dice-server \
    flask run -p 8080
```

{{% /tab %}} {{% tab "Windows (PowerShell)" %}}

```powershell
$env:OTEL_PYTHON_LOGGING_AUTO_INSTRUMENTATION_ENABLED="true"
opentelemetry-instrument `
    --traces_exporter console `
    --metrics_exporter console `
    --logs_exporter console `
    --service_name dice-server `
    flask run -p 8080
```

{{% /tab %}} {{< /tabpane >}}

Коли ви надішлете запит до сервера, ви побачите два відрізки у трейсі, що виводиться в консоль, і той, що називається `roll`, реєструє свого батька як автоматично створеного:

<details>
<summary>Переглянути приклад виводу</summary>

```json
{
    "name": "roll",
    "context": {
        "trace_id": "0x6f781c83394ed2f33120370a11fced47",
        "span_id": "0x623321c35b8fa837",
        "trace_state": "[]"
    },
    "kind": "SpanKind.INTERNAL",
    "parent_id": "0x09abe52faf1d80d5",
    "start_time": "2023-10-10T08:18:28.679261Z",
    "end_time": "2023-10-10T08:18:28.679560Z",
    "status": {
        "status_code": "UNSET"
    },
    "attributes": {
        "roll.value": "6"
    },
    "events": [],
    "links": [],
    "resource": {
        "attributes": {
            "telemetry.sdk.language": "python",
            "telemetry.sdk.name": "opentelemetry",
            "telemetry.sdk.version": "1.17.0",
            "service.name": "dice-server",
            "telemetry.auto.version": "0.38b0"
        },
        "schema_url": ""
    }
}
{
    "name": "/rolldice",
    "context": {
        "trace_id": "0x6f781c83394ed2f33120370a11fced47",
        "span_id": "0x09abe52faf1d80d5",
        "trace_state": "[]"
    },
    "kind": "SpanKind.SERVER",
    "parent_id": null,
    "start_time": "2023-10-10T08:18:28.678348Z",
    "end_time": "2023-10-10T08:18:28.679677Z",
    "status": {
        "status_code": "UNSET"
    },
    "attributes": {
        "http.method": "GET",
        "http.server_name": "127.0.0.1",
        "http.scheme": "http",
        "net.host.port": 8080,
        "http.host": "localhost:8080",
        "http.target": "/rolldice?rolls=12",
        "net.peer.ip": "127.0.0.1",
        "http.user_agent": "curl/8.1.2",
        "net.peer.port": 58485,
        "http.flavor": "1.1",
        "http.route": "/rolldice",
        "http.status_code": 200
    },
    "events": [],
    "links": [],
    "resource": {
        "attributes": {
            "telemetry.sdk.language": "python",
            "telemetry.sdk.name": "opentelemetry",
            "telemetry.sdk.version": "1.17.0",
            "service.name": "dice-server",
            "telemetry.auto.version": "0.38b0"
        },
        "schema_url": ""
    }
}
```

</details>

`parent_id` для `roll` збігається з `span_id` для `/rolldice`, що вказує на відношення пращур-нащадок!

### Метрики {#metrics}

Тепер змініть `app.py`, щоб включити код, який ініціалізує вимірювач і використовує його для створення лічильника, який рахує кількість кидків для кожного можливого значення кидка:

```python
# Це необхідні імпортні декларації
from opentelemetry import trace
from opentelemetry import metrics

from random import randint
from flask import Flask, request
import logging

# Отримайте трасувальник
tracer = trace.get_tracer("diceroller.tracer")
# Отримайте вимірювача
meter = metrics.get_meter("diceroller.meter")

# Тепер створіть лічильник для вимірювань
roll_counter = meter.create_counter(
    "dice.rolls",
    description="Кількість кидків за значенням кидка",
)

app = Flask(__name__)
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@app.route("/rolldice")
def roll_dice():
    # Це створює новий відрізок, який є дочірнім до поточного
    with tracer.start_as_current_span("roll") as roll_span:
        player = request.args.get('гравець', default = None, type = str)
        result = str(roll())
        roll_span.set_attribute("roll.value", result)
        # Це додає 1 до лічильника для даного значення кидка
        roll_counter.add(1, {"roll.value": result})
        if player:
            logger.warn("%s кидає кубик: %s", player, result)
        else:
            logger.warn("Анонімний гравець кидає кубик: %s", result)
        return result

def roll():
    return randint(1, 6)
```

Тепер знову запустіть застосунок:

{{< tabpane text=true >}} {{% tab "Linux/macOS" %}}

```shell
export OTEL_PYTHON_LOGGING_AUTO_INSTRUMENTATION_ENABLED=true
opentelemetry-instrument \
    --traces_exporter console \
    --metrics_exporter console \
    --logs_exporter console \
    --service_name dice-server \
    flask run -p 8080
```

{{% /tab %}} {{% tab "Windows (PowerShell)" %}}

```powershell
$env:OTEL_PYTHON_LOGGING_AUTO_INSTRUMENTATION_ENABLED="true"
opentelemetry-instrument `
    --traces_exporter console `
    --metrics_exporter console `
    --logs_exporter console `
    --service_name dice-server `
    flask run -p 8080
```

{{% /tab %}} {{< /tabpane >}}

Коли ви надішлете запит до сервера, ви побачите лічильник метрик кидків, що виводиться в консоль, з окремими підрахунками для кожного значення кидка:

<details>
<summary>Переглянути приклад виводу</summary>

```json
{
  "resource_metrics": [
    {
      "resource": {
        "attributes": {
          "telemetry.sdk.language": "python",
          "telemetry.sdk.name": "opentelemetry",
          "telemetry.sdk.version": "1.17.0",
          "service.name": "dice-server",
          "telemetry.auto.version": "0.38b0"
        },
        "schema_url": ""
      },
      "scope_metrics": [
        {
          "scope": {
            "name": "opentelemetry.instrumentation.flask",
            "version": "0.38b0",
            "schema_url": ""
          },
          "metrics": [
            {
              "name": "http.server.active_requests",
              "description": "вимірює кількість одночасних HTTP-запитів, які зараз виконуються",
              "unit": "requests",
              "data": {
                "data_points": [
                  {
                    "attributes": {
                      "http.method": "GET",
                      "http.host": "localhost:8080",
                      "http.scheme": "http",
                      "http.flavor": "1.1",
                      "http.server_name": "127.0.0.1"
                    },
                    "start_time_unix_nano": 1696926005694857000,
                    "time_unix_nano": 1696926063549782000,
                    "value": 0
                  }
                ],
                "aggregation_temporality": 2,
                "is_monotonic": false
              }
            },
            {
              "name": "http.server.duration",
              "description": "вимірює тривалість вхідного HTTP-запиту",
              "unit": "ms",
              "data": {
                "data_points": [
                  {
                    "attributes": {
                      "http.method": "GET",
                      "http.host": "localhost:8080",
                      "http.scheme": "http",
                      "http.flavor": "1.1",
                      "http.server_name": "127.0.0.1",
                      "net.host.port": 8080,
                      "http.status_code": 200
                    },
                    "start_time_unix_nano": 1696926005695798000,
                    "time_unix_nano": 1696926063549782000,
                    "count": 7,
                    "sum": 6,
                    "bucket_counts": [
                      1, 6, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
                    ],
                    "explicit_bounds": [
                      0.0, 5.0, 10.0, 25.0, 50.0, 75.0, 100.0, 250.0, 500.0,
                      750.0, 1000.0, 2500.0, 5000.0, 7500.0, 10000.0
                    ],
                    "min": 0,
                    "max": 1
                  }
                ],
                "aggregation_temporality": 2
              }
            }
          ],
          "schema_url": ""
        },
        {
          "scope": {
            "name": "diceroller.meter",
            "version": "",
            "schema_url": ""
          },
          "metrics": [
            {
              "name": "dice.rolls",
              "description": "Кількість кидків за значенням кидка",
              "unit": "",
              "data": {
                "data_points": [
                  {
                    "attributes": {
                      "roll.value": "5"
                    },
                    "start_time_unix_nano": 1696926005695491000,
                    "time_unix_nano": 1696926063549782000,
                    "value": 3
                  },
                  {
                    "attributes": {
                      "roll.value": "6"
                    },
                    "start_time_unix_nano": 1696926005695491000,
                    "time_unix_nano": 1696926063549782000,
                    "value": 1
                  },
                  {
                    "attributes": {
                      "roll.value": "1"
                    },
                    "start_time_unix_nano": 1696926005695491000,
                    "time_unix_nano": 1696926063549782000,
                    "value": 1
                  },
                  {
                    "attributes": {
                      "roll.value": "3"
                    },
                    "start_time_unix_nano": 1696926005695491000,
                    "time_unix_nano": 1696926063549782000,
                    "value": 1
                  },
                  {
                    "attributes": {
                      "roll.value": "4"
                    },
                    "start_time_unix_nano": 1696926005695491000,
                    "time_unix_nano": 1696926063549782000,
                    "value": 1
                  }
                ],
                "aggregation_temporality": 2,
                "is_monotonic": true
              }
            }
          ],
          "schema_url": ""
        }
      ],
      "schema_url": ""
    }
  ]
}
```

</details>

## Надсилання телеметрії до OpenTelemetry Collector {#send-telemetry-to-an-opentelemetry-collector}

[OpenTelemetry Collector](/docs/collector/) є критичним компонентом більшості промислових розгортань. Ось деякі приклади, коли корисно використовувати колектор:

- Єдиний приймач телеметрії, який використовується кількома сервісами, щоб зменшити накладні витрати на перемикання експортерів
- Агрегація трейсів між кількома сервісами, що працюють на кількох хостах
- Центральне місце для обробки трейсів перед їх експортом до бекенду

Якщо у вас є лише один сервіс або ви експериментуєте, вам знадобиться колектор у промислових розгортаннях.

### Налаштування та запуск локального колектора {#configure-and-run-a-local-collector}

Спочатку збережіть наступний конфігураційний код колектора у файл. У Linux/macOS збережіть його у `/tmp/otel-collector-config.yaml`. У Windows збережіть його у `$env:TEMP\otel-collector-config.yaml`.

```yaml
# otel-collector-config.yaml
receivers:
  otlp:
    protocols:
      grpc:
        endpoint: 0.0.0.0:4317
      http:
        endpoint: 0.0.0.0:4318
exporters:
  # NOTE: Prior to v0.86.0 use `logging` instead of `debug`.
  debug:
    verbosity: detailed
service:
  pipelines:
    traces:
      receivers: [otlp]
      exporters: [debug]
    metrics:
      receivers: [otlp]
      exporters: [debug]
    logs:
      receivers: [otlp]
      exporters: [debug]
```

Потім запустіть команду docker, щоб отримати та запустити колектор на основі цієї конфігурації:

{{< tabpane text=true >}} {{% tab "Linux/macOS" %}}

```shell
docker run -p 4317:4317 \
    -v /tmp/otel-collector-config.yaml:/etc/otel-collector-config.yaml \
    otel/opentelemetry-collector:latest \
    --config=/etc/otel-collector-config.yaml
```

{{% /tab %}} {{% tab "Windows (PowerShell)" %}}

```powershell
docker run -p 4317:4317 `
    -v "${env:TEMP}\otel-collector-config.yaml:/etc/otel-collector-config.yaml" `
    otel/opentelemetry-collector:latest `
    --config=/etc/otel-collector-config.yaml
```

{{% /tab %}} {{< /tabpane >}}

Тепер у вас буде запущено локальний екземпляр колектора, який слухає на порту 4317.

### Змініть команду для експорту відрізків та метрик через OTLP {#modify-the-command-to-export-spans-and-metrics-via-otlp}

Наступний крок — змінити команду для надсилання відрізків та метрик до колектора через OTLP замість консолі.

Для цього встановіть пакунок експортера OTLP:

```shell
pip install opentelemetry-exporter-otlp
```

Агент `opentelemetry-instrument` виявить пакунок, який ви щойно встановили, і використовуватиме OTLP експортер при наступному запуску.

### Запуск застосунку {#run-the-application}

Запустіть застосунок, як раніше, але не експортуйте до консолі:

{{< tabpane text=true >}} {{% tab "Linux/macOS" %}}

```shell
export OTEL_PYTHON_LOGGING_AUTO_INSTRUMENTATION_ENABLED=true
opentelemetry-instrument --logs_exporter otlp flask run -p 8080
```

{{% /tab %}} {{% tab "Windows (PowerShell)" %}}

```powershell
$env:OTEL_PYTHON_LOGGING_AUTO_INSTRUMENTATION_ENABLED="true"
opentelemetry-instrument --logs_exporter otlp flask run -p 8080
```

{{% /tab %}} {{< /tabpane >}}

Стандартно `opentelemetry-instrument` експортує трейси та метрики через OTLP/gRPC і надсилатиме їх на `localhost:4317`, саме туди де слухає колектор.

Коли ви зараз звертаєтесь до маршруту `/rolldice`, ви побачите вивід у процесі колектора замість процесу flask, який виглядатиме приблизно так:

<details>
<summary>Переглянути приклад виводу</summary>

```text
2022-06-09T20:43:39.915Z        DEBUG   debugexporter/debug_exporter.go:51  ResourceSpans #0
Resource labels:
     -> telemetry.sdk.language: STRING(python)
     -> telemetry.sdk.name: STRING(opentelemetry)
     -> telemetry.sdk.version: STRING(1.12.0rc1)
     -> telemetry.auto.version: STRING(0.31b0)
     -> service.name: STRING(unknown_service)
InstrumentationLibrarySpans #0
InstrumentationLibrary app
Span #0
    Trace ID       : 7d4047189ac3d5f96d590f974bbec20a
    Parent ID      : 0b21630539446c31
    ID             : 4d18cee9463a79ba
    Name           : roll
    Kind           : SPAN_KIND_INTERNAL
    Start time     : 2022-06-09 20:43:37.390134089 +0000 UTC
    End time       : 2022-06-09 20:43:37.390327687 +0000 UTC
    Status code    : STATUS_CODE_UNSET
    Status message :
Attributes:
     -> roll.value: INT(5)
InstrumentationLibrarySpans #1
InstrumentationLibrary opentelemetry.instrumentation.flask 0.31b0
Span #0
    Trace ID       : 7d4047189ac3d5f96d590f974bbec20a
    Parent ID      :
    ID             : 0b21630539446c31
    Name           : /rolldice
    Kind           : SPAN_KIND_SERVER
    Start time     : 2022-06-09 20:43:37.388733595 +0000 UTC
    End time       : 2022-06-09 20:43:37.390723792 +0000 UTC
    Status code    : STATUS_CODE_UNSET
    Status message :
Attributes:
     -> http.method: STRING(GET)
     -> http.server_name: STRING(127.0.0.1)
     -> http.scheme: STRING(http)
     -> net.host.port: INT(5000)
     -> http.host: STRING(localhost:5000)
     -> http.target: STRING(/rolldice)
     -> net.peer.ip: STRING(127.0.0.1)
     -> http.user_agent: STRING(curl/7.82.0)
     -> net.peer.port: INT(53878)
     -> http.flavor: STRING(1.1)
     -> http.route: STRING(/rolldice)
     -> http.status_code: INT(200)

2022-06-09T20:43:40.025Z        INFO    debugexporter/debug_exporter.go:56  MetricsExporter {"#metrics": 1}
2022-06-09T20:43:40.025Z        DEBUG   debugexporter/debug_exporter.go:66  ResourceMetrics #0
Resource labels:
     -> telemetry.sdk.language: STRING(python)
     -> telemetry.sdk.name: STRING(opentelemetry)
     -> telemetry.sdk.version: STRING(1.12.0rc1)
     -> telemetry.auto.version: STRING(0.31b0)
     -> service.name: STRING(unknown_service)
InstrumentationLibraryMetrics #0
InstrumentationLibrary app
Metric #0
Descriptor:
     -> Name: roll_counter
     -> Description: The number of rolls by roll value
     -> Unit:
     -> DataType: Sum
     -> IsMonotonic: true
     -> AggregationTemporality: AGGREGATION_TEMPORALITY_CUMULATIVE
NumberDataPoints #0
Data point attributes:
     -> roll.value: INT(5)
StartTimestamp: 2022-06-09 20:43:37.390226915 +0000 UTC
Timestamp: 2022-06-09 20:43:39.848587966 +0000 UTC
Value: 1
```

</details>

## Наступні кроки {#next-steps}

Є кілька варіантів для автоматичного інструментування та Python. Дивіться [Інструментування без коду](/docs/zero-code/python/), щоб дізнатися про них та як їх налаштувати.

Є багато більше до ручного інструментування, ніж просто створення дочірнього відрізку. Щоб дізнатися деталі про ініціалізацію ручного інструментування та багато інших частин API OpenTelemetry, які ви можете використовувати, дивіться [Ручне інструментування](../instrumentation/).

Є кілька варіантів для експорту ваших телеметричних даних з OpenTelemetry. Щоб дізнатися, як експортувати ваші дані до бажаного бекенду, дивіться [Експортери](../exporters/).

Якщо ви хочете дослідити складніший приклад, подивіться на [Демо OpenTelemetry](/docs/demo/), яке включає основані на Python [Сервіс рекомендацій](/docs/demo/services/recommendation/) та [Генератор навантаження](/docs/demo/services/load-generator/).

[трейси]: /docs/concepts/signals/traces/
[метрики]: /docs/concepts/signals/metrics/
[логи]: /docs/concepts/signals/logs/
