---
title: Використання OpenTelemetry Operator для впровадження автоматичної інструментації
linkTitle: Оператор
aliases: [/docs/languages/python/automatic/operator]
weight: 30
default_lang_commit: 5f551752635886a0d2d6b2a83e5a36866ca1b5f1
cSpell:ignore: django gevent grpcio monkeypatch psutil PYTHONPATH
---

Якщо ви запускаєте свій Python сервіс у Kubernetes, ви можете скористатися [OpenTelemetry Operator](https://github.com/open-telemetry/opentelemetry-operator) для впровадження автоматичної інструментації без необхідності змінювати кожен з ваших сервісів
безпосередньо. [Дивіться документацію OpenTelemetry Operator Auto-instrumentation для отримання додаткової інформації.](/docs/platforms/kubernetes/operator/automatic/)

## Теми, специфічні для Python {#python-specific-topics}

### Бібліотеки з бінарними wheels {#libraries-with-binary-wheels}

Деякі пакунки Python, які ми інструментуємо або які потрібні в наших бібліотеках інструментації, можуть постачатися з деяким бінарним кодом. Це стосується, наприклад, `grpcio` та `psutil` (використовується в `opentelemetry-instrumentation-system-metrics`).

Бінарний код привʼязаний до конкретної версії C бібліотеки (glibc або musl) та до конкретної версії Python. [OpenTelemetry Operator](https://github.com/open-telemetry/opentelemetry-operator) надає образи для однієї версії Python на основі бібліотеки glibc C. Якщо ви хочете використовувати його, можливо, вам доведеться створити власний образ оператора Docker для автоматичної інструментації Python.

З версії оператора v0.113.0 можливо створити образ з автоматичною інструментацією на основі як glibc, так і musl та [налаштувати його під час виконання](/docs/platforms/kubernetes/operator/automatic/#annotations-python-musl).

### Django застосунки {#django-applications}

Застосунки, які запускаються з власного виконуваного файлу, як-от Django, вимагають встановлення у вашому файлі розгортання двох змінних середовища:

- `PYTHONPATH`, зі шляхом до кореневої теки застосунку Django, наприклад "/app"
- `DJANGO_SETTINGS_MODULE`, з назвою модуля налаштувань Django, наприклад "myapp.settings"

### gevent застосунки {#gevent-application}

Починаючи з випуску OpenTelemetry Python 1.37.0/0.58b0, якщо ви встановите у файлі розгортання змінну середовища `OTEL_PYTHON_AUTO_INSTRUMENTATION_EXPERIMENTAL_GEVENT_PATCH` на значення `patch_all`, код автоматичної інструментації перед ініціалізацією викличе метод gevent monkeypatch з такою ж назвою.
