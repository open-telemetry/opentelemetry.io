---
title: Усунення проблем з автоматичним інструментуванням в Python
linkTitle: Усунення несправностей
weight: 40
default_lang_commit: 0da44011230e4781fdf6209ac27e0ccc59fa38b2
cSpell:ignore: ASGI gunicorn uvicorn uvicornworker
---

## Проблеми з установкою {#installation-issues}

### Проблеми встановлення пакунків Python {#python-package-installation-failure}

Встановлення пакунків Python вимагає наявності `gcc` та `gcc-c++`, які можливо потрібно встановити, якщо ви використовуєте спрощену версію Linux, таку як CentOS.

<!-- markdownlint-disable blanks-around-fences -->

{{< tabpane text=true >}} {{% tab "CentOS" %}}

```sh
yum -y install python3-devel
yum -y install gcc-c++
```

{{% /tab %}} {{% tab "Debian/Ubuntu" %}}

```sh
apt install -y python3-dev
apt install -y build-essential
```

{{% /tab %}} {{% tab "Alpine" %}}

```sh
apk add python3-dev
apk add build-base
```

{{% /tab %}} {{< /tabpane >}}

{#bootstrap-using-uv}

### Bootstrap з використанням uv {#bootstrap-using-uv}

При використанні менеджера пакунків [uv](https://docs.astral.sh/uv/), ви можете поставати перед труднощами при виконанні `opentelemetry-bootstrap -a install`.

Замість цього ви можете згенерувати вимоги OpenTelemetry динамічно і встановити їх за допомогою їх за допомогою `uv`.

Спочатку встановіть відповідні пакунки (або додайте їх до файлу проєкту та виконайте `uv sync`):

```sh
uv pip install opentelemetry-distro opentelemetry-exporter-otlp
```

Тепер ви можете встановити автоматичне інструментування:

```sh
uv run opentelemetry-bootstrap -a requirements | uv pip install --requirement -
```

Нарешті, використовуйте `uv run` для запуску вашого застосунку (дивіться [Налаштування агента](/docs/zero-code/python/#configuring-the-agent)):

```sh
uv run opentelemetry-instrument python myapp.py
```

Зверніть увагу, що вам потрібно перевстановлювати автоматичне інструментування кожного разу, коли ви виконуєте `uv sync` або оновлюєте наявні пакунки. Тому рекомендується зробити встановлення частиною вашого процесу збірки.

## Проблеми інструментування {#instrumentation-issues}

### Режим налагодження Flask з перезавантажувачем ламає інструментування {#flask-debug-mode-with-reloader-breaks-instrumentation}

Режим налагодження можна увімкнути в застосунку Flask ось так:

```python
if __name__ == "__main__":
    app.run(port=8082, debug=True)
```

Режим налагодження може зламати інструментування, оскільки він вмикає перезавантажувач. Щоб запустити інструментування під час увімкненого режиму налагодження, встановіть параметр `use_reloader` в `False`:

```python
if __name__ == "__main__":
    app.run(port=8082, debug=True, use_reloader=False)
```

### Проблеми з сервером попереднього розгалуження (pre-fork server){#pre-fork-server-issues}

Сервер попереднього розгалуження, такий як Gunicorn з кількома виконавцями, може бути запущений так:

```sh
gunicorn myapp.main:app --workers 4
```

Однак вказання більше ніж одного `--workers` може порушити генерацію метрик, коли застосовується автоматичне інструментування. Це повʼязано з тим, що розгалуження, створення робочих/дочірніх процесів, створює несумісності між кожною дитиною в фонових потоках і блокуваннями, які передбачаються ключовими компонентами SDK OpenTelemetry. Зокрема, `PeriodicExportingMetricReader` створює свій власний потік для періодичного скидання даних експортеру. Дивіться також тікети [#2767](https://github.com/open-telemetry/opentelemetry-python/issues/2767) та [#3307](https://github.com/open-telemetry/opentelemetry-python/issues/3307#issuecomment-1579101152). Після розгалуження кожен дочірній процес шукає обʼєкт потоку в памʼяті, який насправді не виконується, і будь-які оригінальні блокування можуть не розблокуватися для кожного нащадка. Дивіться також, розгалуження та блокування, описані в [Python issue 6721](https://bugs.python.org/issue6721).

#### Способи вирішення проблеми {#workarounds}

Існують деякі способи вирішення проблеми для серверів попереднього розгалуження з OpenTelemetry. У наступній таблиці наведено підсумок поточної підтримки експорту сигналів різними стеками шлюзів вебсерверів з автоматичною інструментацією, які були попередньо розгалужені з декількома робочими процесами. Дивіться нижче для отримання додаткової інформації та варіантів:

| Стек з декількома виконавцями | Трейси | Метрики | Логи |
| ----------------------------- | ------ | ------- | ---- |
| Uvicorn                       | x      |         | x    |
| Gunicorn                      | x      |         | x    |
| Gunicorn + UvicornWorker      | x      | x       | x    |

##### Розгортання з Gunicorn та UvicornWorker {#deploy-with-gunicorn-and-uvicornworker}

Щоб автоматично інструментувати сервер з декількома робочими процесами, рекомендується робити розгортання використовуючи Gunicorn з `uvicorn.workers.UvicornWorker`, якщо це застосунок Asynchronous Server Gateway Interface (ASGI) (FastAPI, Starlette тощо). Клас UvicornWorker спеціально створений для обробки розгалужень зі збереженням фонових процесів і потоків. Наприклад:

```sh
opentelemetry-instrument gunicorn \
  --workers 4 \
  --worker-class uvicorn.workers.UvicornWorker \
  --bind 0.0.0.0:8000 \
  myapp.main:app
```

##### Використовуйте програмне автоінструментування {#use-programmatic-auto-instrumentation}

Ініціалізуйте OpenTelemetry всередині процесу робочого потоку з [програмним автоінструментуванням](https://github.com/open-telemetry/opentelemetry-python-contrib/blob/main/opentelemetry-instrumentation/README.rst#programmatic-auto-instrumentation) після розгалуження сервера, замість використання `opentelemetry-instrument`. Наприклад:

```python
from opentelemetry.instrumentation.auto_instrumentation import initialize
initialize()

from your_app import app
```

Якщо ви використовуєте FastAPI, зверніть увагу, що `initialize()` необхідно викликати перед імпортом `FastAPI` через особливості латок інструментування. Наприклад:

```python
from opentelemetry.instrumentation.auto_instrumentation import initialize
initialize()

from fastapi import FastAPI

app = FastAPI()

@app.get("/")
async def root():
    return {"message": "Hello World"}
```

Потім запустіть сервер за допомогою:

```sh
uvicorn main:app --workers 2
```

##### Використовуйте Prometheus безпосередньо з OTLP {#use-prometheus-with-direct-otlp}

Розгляньте можливість використання останньої версії [Prometheus](/docs/languages/python/exporters/#prometheus-setup) для отримання OTLP метрик безпосередньо. Налаштуйте `PeriodicExportingMetricReader` і одного OTLP виконавця на процес, щоб надсилати дані на сервер Prometheus. Ми рекомендуємо _не_ використовувати `PrometheusMetricReader` з розгалуженнями — див. тікет [#3747](https://github.com/open-telemetry/opentelemetry-python/issues/3747).

##### Використовуйте одного виконавця {#use-a-single-worker}

Альтернативно, використовуйте одного виконавця в режимі попереднього розгалуження з інструментуванням без коду:

```sh
opentelemetry-instrument gunicorn your_app:app --workers 1
```

## Проблеми з підключенням {#connectivity-issues}

### Підключення gRPC {#grpc-connectivity}

Щоб відстежити проблеми підключення Python gRPC, встановіть наступні змінні середовища налагодження gRPC:

```sh
export GRPC_VERBOSITY=debug
export GRPC_TRACE=http,call_error,connectivity_state
opentelemetry-instrument python YOUR_APP.py
```
