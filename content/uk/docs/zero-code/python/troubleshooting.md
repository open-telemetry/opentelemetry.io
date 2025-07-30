---
title: Усунення проблем з автоматичним інструментуванням в Python
linkTitle: Усунення несправностей
weight: 40
default_lang_commit: 6f3712c5cda4ea79f75fb410521880396ca30c91
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

## Проблеми з підключенням {#connectivity-issues}

### Підключення gRPC {#grpc-connectivity}

Щоб відстежити проблеми підключення Python gRPC, встановіть наступні змінні середовища налагодження gRPC:

```sh
export GRPC_VERBOSITY=debug
export GRPC_TRACE=http,call_error,connectivity_state
opentelemetry-instrument python YOUR_APP.py
```
