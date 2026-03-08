---
title: Інструментування Python без коду
linkTitle: Python
weight: 30
aliases: [/docs/languages/python/automatic]
cascade:
  collector_vers: 0.146.1
default_lang_commit: 5f551752635886a0d2d6b2a83e5a36866ca1b5f1
cSpell:ignore: distro
---

Автоматичне інструментування з Python використовує агент Python, який можна підʼєднати до будь-якого застосунку Python. Цей агент в основному використовує [monkey patching](https://en.wikipedia.org/wiki/Monkey_patch), щоб змінювати функції бібліотек під час виконання, дозволяючи захоплювати телеметричні дані з багатьох популярних бібліотек та фреймворків.

## Налаштування {#setup}

Виконайте наступні команди, щоб встановити відповідні пакунки.

```sh
pip install opentelemetry-distro opentelemetry-exporter-otlp
opentelemetry-bootstrap -a install
```

Пакунок `opentelemetry-distro` встановлює API, SDK та інструменти `opentelemetry-bootstrap` та `opentelemetry-instrument`.

> [!NOTE]
>
> Ви повинні встановити пакунок дистрибутиву, щоб автоматичне інструментування працювало. Пакунок `opentelemetry-distro` містить стандартний дистрибутив для автоматичної конфігурації деяких загальних параметрів для користувачів. Для отримання додаткової інформації дивіться [Дистрибутив OpenTelemetry](/docs/languages/python/distro/).

Команда `opentelemetry-bootstrap -a install` переглядає список пакунків, встановлених у вашій активній теці `site-packages`, і встановлює відповідні бібліотеки інструментування для цих пакунків, якщо це можливо. Наприклад, якщо ви вже встановили пакунок `flask`, виконання `opentelemetry-bootstrap -a install` встановить `opentelemetry-instrumentation-flask` для вас. Агент OpenTelemetry Python використовуватиме monkey patching для зміни функцій у цих бібліотеках під час виконання.

Виконання `opentelemetry-bootstrap` без аргументів виводить список рекомендованих бібліотек інструментування для встановлення. Для отримання додаткової інформації дивіться [`opentelemetry-bootstrap`](https://github.com/open-telemetry/opentelemetry-python-contrib/tree/main/opentelemetry-instrumentation#opentelemetry-bootstrap).

> [!WARNING] Використовуєте `uv`?
>
> Якщо ви використовуєте пакетний менеджер [uv](https://docs.astral.sh/uv/), ви можете зіткнутися з деякими проблемами під час виконання `opentelemetry-bootstrap -a install`. Для отримання деталей дивіться [Bootstrap з використанням uv](troubleshooting/#bootstrap-using-uv).

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

Для загальних кроків усунення неполадок та рішень конкретних проблем дивіться [Усунення неполадок](./troubleshooting/).
