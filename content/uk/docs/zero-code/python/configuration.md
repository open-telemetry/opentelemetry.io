---
title: Конфігурація агента
linkTitle: Конфігурація
weight: 10
aliases:
  - /docs/languages/python/automatic/configuration
  - /docs/languages/python/automatic/agent-config
default_lang_commit: 5f551752635886a0d2d6b2a83e5a36866ca1b5f1
# prettier-ignore
cSpell:ignore: gevent healthcheck instrumentor monkeypatch pyproject Starlette urllib
---

Агент має широкі можливості для налаштування, або через:

- Передачу властивостей конфігурації з CLI
- Встановлення [змінних середовища](/docs/specs/otel/configuration/sdk-environment-variables/)

## Властивості конфігурації {#configuration-properties}

Ось приклад конфігурації агента через властивості конфігурації:

```sh
opentelemetry-instrument \
    --traces_exporter console,otlp \
    --metrics_exporter console \
    --service_name your-service-name \
    --exporter_otlp_endpoint 0.0.0.0:4317 \
    python myapp.py
```

Ось пояснення, що робить кожна конфігурація:

- `traces_exporter` вказує, який експортер трейсів використовувати. У цьому випадку трасування експортується до `console` (stdout) та з `otlp`. Опція `otlp` вказує `opentelemetry-instrument` відправляти трейси до точки доступу, яка приймає OTLP через gRPC. Щоб використовувати HTTP замість gRPC, додайте `--exporter_otlp_protocol http/protobuf`. Повний список доступних опцій для traces_exporter дивіться у Python contrib [OpenTelemetry Instrumentation](https://github.com/open-telemetry/opentelemetry-python-contrib/tree/main/opentelemetry-instrumentation).
- `metrics_exporter` вказує, який експортер метрик використовувати. У цьому випадку метрики експортуються до `console` (stdout). Наразі потрібно вказати експортер метрик. Якщо ви не експортуєте метрики, вкажіть `none` як значення.
- `service_name` встановлює імʼя сервісу, повʼязаного з вашою телеметрією, і відправляється до вашого [бекенду спостереження](/ecosystem/vendors/).
- `exporter_otlp_endpoint` встановлює точку доступу, куди експортується телеметрія. Якщо пропущено, буде використано стандартну точку доступу [Collector](/docs/collector/), яка є `0.0.0.0:4317` для gRPC та `0.0.0.0:4318` для HTTP.
- `exporter_otlp_headers` потрібен залежно від обраного вами бекенду спостереження. Для отримання додаткової інформації про заголовки експортера OTLP дивіться [OTEL_EXPORTER_OTLP_HEADERS](/docs/languages/sdk-configuration/otlp-exporter/#otel_exporter_otlp_headers).

## Змінні середовища {#environment-variables}

У деяких випадках конфігурація через [змінні середовища](/docs/languages/sdk-configuration/) є більш бажаною. Будь-яке налаштування, яке можна налаштувати за допомогою аргументу командного рядка, також можна налаштувати за допомогою змінної середовища.

Ви можете застосувати наступні кроки, щоб визначити правильне імʼя для бажаної властивості конфігурації:

- Перетворіть властивість конфігурації на великі літери.
- Додайте префікс змінної середовища `OTEL_`

Наприклад, `exporter_otlp_endpoint` перетвориться на `OTEL_EXPORTER_OTLP_ENDPOINT`.

## Специфічна конфігурація для Python {#python-specific-configuration}

Існують деякі специфічні для Python параметри конфігурації, які можна встановити, додавши префікс змінних середовища `OTEL_PYTHON_`.

### Виключені URL-адреси {#excluded-urls}

Розділені комами регулярні вирази, що представляють URL-адреси, які потрібно виключити для всіх інструментів:

- `OTEL_PYTHON_EXCLUDED_URLS`

Ви також можете виключити URL-адреси для конкретних інструментів, використовуючи змінну `OTEL_PYTHON_<library>_EXCLUDED_URLS`, де library є версією у верхньому регістрі одного з наступних: Django, Falcon, FastAPI, Flask, Pyramid, Requests, Starlette, Tornado, urllib, urllib3.

Приклади:

```sh
export OTEL_PYTHON_EXCLUDED_URLS="client/.*/info,healthcheck"
export OTEL_PYTHON_URLLIB3_EXCLUDED_URLS="client/.*/info"
export OTEL_PYTHON_REQUESTS_EXCLUDED_URLS="healthcheck"
```

### Імена атрибутів запиту {#request-attribute-names}

Розділений комами список імен, які будуть витягнуті з обʼєкта запиту та встановлені як атрибути на відрізках.

- `OTEL_PYTHON_DJANGO_TRACED_REQUEST_ATTRS`
- `OTEL_PYTHON_FALCON_TRACED_REQUEST_ATTRS`
- `OTEL_PYTHON_TORNADO_TRACED_REQUEST_ATTRS`

Приклади:

```sh
export OTEL_PYTHON_DJANGO_TRACED_REQUEST_ATTRS='path_info,content_type'
export OTEL_PYTHON_FALCON_TRACED_REQUEST_ATTRS='query_string,uri_template'
export OTEL_PYTHON_TORNADO_TRACED_REQUEST_ATTRS='uri,query'
```

### Логування {#logging}

Існують деякі параметри конфігурації, які використовуються для контролю логів, що
виводяться.

- `OTEL_PYTHON_LOG_CORRELATION`: для увімкнення впровадження контексту трасування у логи (true, false)
- `OTEL_PYTHON_LOG_FORMAT`: для вказівки інструменту використовувати спеціальний формат логування
- `OTEL_PYTHON_LOG_LEVEL`: для встановлення спеціального рівня логування (info, error, debug, warning)
- `OTEL_PYTHON_LOGGING_AUTO_INSTRUMENTATION_ENABLED`: для увімкнення автоматичного інструментування логів. Приєднує OTLP обробник до кореневого логера Python. Дивіться приклад [автоінструментування логів](/docs/zero-code/python/logs-example)

Приклади:

```sh
export OTEL_PYTHON_LOG_CORRELATION=true
export OTEL_PYTHON_LOG_FORMAT="%(msg)s [span_id=%(span_id)s]"
export OTEL_PYTHON_LOG_LEVEL=debug
export OTEL_PYTHON_LOGGING_AUTO_INSTRUMENTATION_ENABLED=true
```

### Інше {#other}

Існують деякі інші параметри конфігурації, які можна встановити, що не підпадають під конкретну категорію.

- `OTEL_PYTHON_DJANGO_INSTRUMENT`: встановіть `false`, щоб вимкнути стандартний увімкнений стан для інструменту Django
- `OTEL_PYTHON_ELASTICSEARCH_NAME_PREFIX`: змінює стандартні префікси для імен операцій Elasticsearch з "Elasticsearch" на те, що використовується тут
- `OTEL_PYTHON_GRPC_EXCLUDED_SERVICES`: розділений комами список конкретних сервісів, які потрібно виключити для інструменту gRPC
- `OTEL_PYTHON_ID_GENERATOR`: для вказівки, який генератор ID використовувати для глобального постачальника трасування
- `OTEL_PYTHON_INSTRUMENTATION_SANITIZE_REDIS`: для увімкнення санітаризації запитів
- `OTEL_PYTHON_AUTO_INSTRUMENTATION_EXPERIMENTAL_GEVENT_PATCH`: встановіть значення `patch_all`, щоб викликати метод gevent monkeypatch `patch_all` перед ініціалізацією SDK.

Приклади:

```sh
export OTEL_PYTHON_DJANGO_INSTRUMENT=false
export OTEL_PYTHON_ELASTICSEARCH_NAME_PREFIX=my-custom-prefix
export OTEL_PYTHON_GRPC_EXCLUDED_SERVICES="GRPCTestServer,GRPCHealthServer"
export OTEL_PYTHON_ID_GENERATOR=xray
export OTEL_PYTHON_INSTRUMENTATION_SANITIZE_REDIS=true
export OTEL_PYTHON_AUTO_INSTRUMENTATION_EXPERIMENTAL_GEVENT_PATCH=patch_all
```

## Вимкнення конкретних інструментів {#disabling-specific-instrumentations}

Агент Python стандартно виявляє пакунки програми Python та інструментує будь-які пакунки, які він може. Це робить інструментування легким, але може призвести до надмірної або небажаної інформації.

Ви можете виключити конкретні пакунки з інструментування, використовуючи змінну середовища `OTEL_PYTHON_DISABLED_INSTRUMENTATIONS`. Змінну середовища можна встановити як розділений комами список імен точок входу інструментів, які потрібно виключити з інструментування. Більшість часу імʼя точки входу таке ж, як і імʼя пакунка, і воно встановлюється в таблиці `project.entry-points.opentelemetry_instrumentor` у файлі пакунка `pyproject.toml`.

Наприклад, якщо ваша програма Python використовує пакунки `redis`, `kafka-python` та `grpc`, стандартно агент використовуватиме пакунки `opentelemetry-instrumentation-redis`, `opentelemetry-instrumentation-kafka-python` та `opentelemetry-instrumentation-grpc` для їх інструментування. Щоб вимкнути це, ви можете встановити `OTEL_PYTHON_DISABLED_INSTRUMENTATIONS=redis,kafka,grpc_client`.
