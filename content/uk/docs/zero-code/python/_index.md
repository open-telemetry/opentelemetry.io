---
title: Інструментування Python без коду
linkTitle: Python
weight: 30
aliases: [/docs/languages/python/automatic]
# prettier-ignore
cSpell:ignore: devel distro myapp
---

Автоматичне інструментування з Python використовує агент Python, який можна підʼєднати до будь-якого застосунку Python. Цей агент в основному використовує [monkey patching](https://en.wikipedia.org/wiki/Monkey_patch), щоб змінювати функції бібліотек під час виконання, дозволяючи захоплювати телеметричні дані з багатьох популярних бібліотек та фреймворків.

## Налаштування {#setup}

Виконайте наступні команди, щоб встановити відповідні пакунки.

```sh
pip install opentelemetry-distro opentelemetry-exporter-otlp
opentelemetry-bootstrap -a install
```

Пакунок `opentelemetry-distro` встановлює API, SDK та інструменти `opentelemetry-bootstrap` та `opentelemetry-instrument`.

{{% alert title="Примітка" color="info" %}}

Ви повинні встановити пакунок дистрибутиву, щоб автоматичне інструментування працювало. Пакунок `opentelemetry-distro` містить стандартний дистрибутив для автоматичної конфігурації деяких загальних параметрів для користувачів. Для отримання додаткової інформації дивіться [Дистрибутив OpenTelemetry](/docs/languages/python/distro/).

{{% /alert %}}

Команда `opentelemetry-bootstrap -a install` переглядає список пакунків, встановлених у вашій активній теці `site-packages`, і встановлює відповідні бібліотеки інструментування для цих пакунків, якщо це можливо. Наприклад, якщо ви вже встановили пакунок `flask`, виконання `opentelemetry-bootstrap -a install` встановить `opentelemetry-instrumentation-flask` для вас. Агент OpenTelemetry Python використовуватиме monkey patching для зміни функцій у цих бібліотеках під час виконання.

Виконання `opentelemetry-bootstrap` без аргументів виводить список рекомендованих бібліотек інструментування для встановлення. Для отримання додаткової інформації дивіться [`opentelemetry-bootstrap`](https://github.com/open-telemetry/opentelemetry-python-contrib/tree/main/opentelemetry-instrumentation#opentelemetry-bootstrap).

## Налаштування агента {#configuring-the-agent}

Агент має широкі можливості для налаштування.

Один з варіантів — налаштувати агента за допомогою властивостей конфігурації з CLI:

```sh
opentelemetry-instrument \
    --traces_exporter console,otlp \
    --metrics_exporter console \
    --service_name your-service-name \
    --exporter_otlp_endpoint 0.0.0.0:4317 \
    python myapp.py
```

Альтернативно, ви можете використовувати змінні середовища для налаштування агента:

```sh
OTEL_SERVICE_NAME=your-service-name \
OTEL_TRACES_EXPORTER=console,otlp \
OTEL_METRICS_EXPORTER=console \
OTEL_EXPORTER_OTLP_TRACES_ENDPOINT=0.0.0.0:4317
opentelemetry-instrument \
    python myapp.py
```

Щоб побачити повний спектр параметрів конфігурації, дивіться [Налаштування агента](configuration).

## Підтримувані бібліотеки та фреймворки {#supported-libraries-and-frameworks}

Автоматично інструментуються ряд популярних бібліотек Python, включаючи [Flask](https://github.com/open-telemetry/opentelemetry-python-contrib/tree/main/instrumentation/opentelemetry-instrumentation-flask) та [Django](https://github.com/open-telemetry/opentelemetry-python-contrib/tree/main/instrumentation/opentelemetry-instrumentation-django). Для повного списку дивіться [Реєстр](/ecosystem/registry/?language=python&component=instrumentation).

## Розвʼязання проблем {#troubleshooting}

### Помилка встановлення пакунка Python {#python-package-installation-failure}

Для встановлення пакунків Python потрібні `gcc` та `gcc-c++`, які можливо потрібно встановити, якщо ви використовуєте спрощену версію Linux, таку як CentOS.

<!-- markdownlint-disable blanks-around-fences -->

- CentOS
  ```sh
  yum -y install python3-devel
  yum -y install gcc-c++
  ```
- Debian/Ubuntu
  ```sh
  apt install -y python3-dev
  apt install -y build-essential
  ```
- Alpine
  ```sh
  apk add python3-dev
  apk add build-base
  ```

### Підключення gRPC {#grpc-connectivity}

Щоб відстежити проблеми підключення Python gRPC, встановіть наступні змінні середовища налагодження gRPC:

```sh
export GRPC_VERBOSITY=debug
export GRPC_TRACE=http,call_error,connectivity_state
opentelemetry-instrument python YOUR_APP.py
```

### Bootstrap з використанням uv {#bootstrap-using-uv}

При використанні менеджера пакунків [uv](https://docs.astral.sh/uv/), ви можете поставати перед труднощами при виконанні `opentelemetry-bootstrap -a install`.

Замість цього, ви можете динамічно згенерувати вимоги та встановити їх за допомогою `uv`.

Спочатку встановіть відповідні пакунки (або додайте їх до файлу проєкту та виконайте `uv sync`):

```sh
uv pip install opentelemetry-distro opentelemetry-exporter-otlp
```

Тепер ви можете встановити автоматичне інструментування:

```sh
uv run opentelemetry-bootstrap -a requirements | uv pip install --requirement -
```

Нарешті, використовуйте `uv run` для запуску вашого застосунку (дивіться [Налаштування агента](#configuring-the-agent)):

```sh
uv run opentelemetry-instrument python myapp.py
```

Зверніть увагу, що вам потрібно перевстановлювати автоматичне інструментування кожного разу, коли ви виконуєте `uv sync` або оновлюєте наявні пакунки. Тому рекомендується зробити встановлення частиною вашого процесу збірки.
