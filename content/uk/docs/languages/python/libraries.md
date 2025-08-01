---
title: Використання бібліотек інструментування
linkTitle: Бібліотеки
weight: 40
default_lang_commit: e05fefe6c9f7d8b159d9a9a95128098c646c78c4
cSpell:ignore: httpx instrumentor uninstrument
---

{{% docs/languages/libraries-intro "python" %}}

## Використання бібліотек інструментування {#use-instrumentation-libraries}

Якщо бібліотека не підтримує OpenTelemetry нативно, ви можете використовувати [бібліотеки інструментування](/docs/specs/otel/glossary/#instrumentation-library) для генерації даних телеметрії для бібліотеки або фреймворку.

Наприклад, [бібліотека інструментування для HTTPX](https://pypi.org/project/opentelemetry-instrumentation-httpx/) автоматично створює [відрізки](/docs/concepts/signals/traces/#spans) на основі HTTP-запитів.

## Налаштування {#setup}

Ви можете встановити кожну бібліотеку інструментування окремо за допомогою pip. Наприклад:

```sh
pip install opentelemetry-instrumentation-{instrumented-library}
```

У попередньому прикладі, `{instrumented-library}` — це назва бібліотеки інструментування.

Щоб встановити версію для розробки, клонувати або зробити форк репозиторію `opentelemetry-python-contrib` і виконати наступну команду для редагованої установки:

```sh
pip install -e ./instrumentation/opentelemetry-instrumentation-{integration}
```

Після встановлення, вам потрібно ініціалізувати бібліотеку інструментування. Кожна бібліотека зазвичай має свій спосіб ініціалізації.

## Приклад з інструментуванням HTTPX {#example-with-httpx-instrumentation}

Ось як ви можете інструментувати HTTP-запити, зроблені за допомогою бібліотеки `httpx`.

Спочатку встановіть бібліотеку інструментування за допомогою pip:

```sh
pip install opentelemetry-instrumentation-httpx
```

Далі, використовуйте інструментування для автоматичного трасування запитів від усіх клієнтів:

```python
import httpx
from opentelemetry.instrumentation.httpx import HTTPXClientInstrumentor

url = "https://some.url/get"
HTTPXClientInstrumentor().instrument()

with httpx.Client() as client:
     response = client.get(url)

async with httpx.AsyncClient() as client:
     response = await client.get(url)
```

### Вимкнення інструментування {#turn-off-instrumentations}

Якщо потрібно, ви можете відключити інструментування для конкретних клієнтів або всіх клієнтів за допомогою методу `uninstrument_client`. Наприклад:

```python
import httpx
from opentelemetry.instrumentation.httpx import HTTPXClientInstrumentor

HTTPXClientInstrumentor().instrument()
client = httpx.Client()

# Відключити інструментування для конкретного клієнта
HTTPXClientInstrumentor.uninstrument_client(client)

# Відключити інструментування для всіх клієнтів
HTTPXClientInstrumentor().uninstrument()
```

## Доступні бібліотеки інструментування {#available-instrumentation-libraries}

Повний список бібліотек інструментування, створених OpenTelemetry, доступний у репозиторії [opentelemetry-python-contrib][].

Ви також можете знайти більше інструментів у [реєстрі](/ecosystem/registry/?language=python&component=instrumentation).

## Наступні кроки {#next-steps}

Після налаштування бібліотек інструментування, ви можете додати власне [інструментування](/docs/languages/python/instrumentation) до вашого коду, щоб збирати власні дані телеметрії.

Ви також можете налаштувати відповідний експортер для [експорту ваших даних телеметрії](/docs/languages/python/exporters) до одного або більше бекендів телеметрії.

Ви також можете перевірити [Інструментування для Python без коду](/docs/zero-code/python/).

[opentelemetry-python-contrib]: https://github.com/open-telemetry/opentelemetry-python-contrib/tree/main/instrumentation#readme
