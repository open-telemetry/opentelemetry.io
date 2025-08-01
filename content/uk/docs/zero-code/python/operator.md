---
title: Використання OpenTelemetry Operator для впровадження автоматичної інструментації
linkTitle: Оператор
aliases: [/docs/languages/python/automatic/operator]
weight: 30
default_lang_commit: e05fefe6c9f7d8b159d9a9a95128098c646c78c4
cSpell:ignore: django grpcio myapp psutil PYTHONPATH
---

Якщо ви запускаєте свій Python сервіс у Kubernetes, ви можете скористатися [OpenTelemetry Operator](https://github.com/open-telemetry/opentelemetry-operator) для впровадження автоматичної інструментації без необхідності змінювати кожен з ваших сервісів
безпосередньо. [Дивіться документацію OpenTelemetry Operator Auto-instrumentation для отримання додаткової інформації.](/docs/platforms/kubernetes/operator/automatic/)

### Теми, специфічні для Python {#python-specific-topics}

#### Бібліотеки з бінарними wheels {#libraries-with-binary-wheels}

Деякі пакунки Python, які ми інструментуємо або які потрібні в наших бібліотеках інструментації, можуть постачатися з деяким бінарним кодом. Це стосується, наприклад, `grpcio` та `psutil` (використовується в `opentelemetry-instrumentation-system-metrics`).

Бінарний код привʼязаний до конкретної версії C бібліотеки (glibc або musl) та до конкретної версії Python. [OpenTelemetry Operator](https://github.com/open-telemetry/opentelemetry-operator) надає образи для однієї версії Python на основі бібліотеки glibc C. Якщо ви хочете використовувати його, можливо, вам доведеться створити власний образ оператора Docker для автоматичної інструментації Python.

З версії оператора v0.113.0 можливо створити образ з автоматичною інструментацією на основі як glibc, так і musl та [налаштувати його під час виконання](/docs/platforms/kubernetes/operator/automatic/#annotations-python-musl).

#### Django застосунки {#django-applications}

Застосунки, які запускаються з власного виконуваного файлу, як-от Django, вимагають встановлення у вашому файлі розгортання двох змінних середовища:

- `PYTHONPATH`, зі шляхом до кореневої теки застосунку Django, наприклад "/app"
- `DJANGO_SETTINGS_MODULE`, з назвою модуля налаштувань Django, наприклад "myapp.settings"
