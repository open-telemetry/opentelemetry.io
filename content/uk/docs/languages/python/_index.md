---
title: Python
description: >-
  <img width="35" class="img-initial otel-icon" src="/img/logos/32x32/Python_SDK.svg" alt="Python"> Реалізація OpenTelemetry для Python.
aliases: [/python, /python/metrics, /python/tracing]
weight: 190
default_lang_commit: 5f551752635886a0d2d6b2a83e5a36866ca1b5f1
---

{{% docs/languages/index-intro python /%}}

## Підтримка версій {#version-support}

OpenTelemetry-Python підтримує Python 3.9 і вище.

## Встановлення {#installation}

Пакунки API та SDK доступні на PyPI та можуть бути встановлені за допомогою pip:

```sh
pip install opentelemetry-api
pip install opentelemetry-sdk
```

Крім того, є кілька додаткових пакунків, які можна встановити окремо:

```sh
pip install opentelemetry-exporter-{exporter}
pip install opentelemetry-instrumentation-{instrumentation}
```

Це для бібліотек експортерів та інструментів відповідно. Експортери Jaeger, Zipkin, Prometheus, OTLP та OpenCensus можна знайти в теці [exporter](https://github.com/open-telemetry/opentelemetry-python/blob/main/exporter/) репозиторію. Інструменти та додаткові експортери можна знайти в репозиторії contrib в теках [instrumentation](https://github.com/open-telemetry/opentelemetry-python-contrib/tree/main/instrumentation) та [exporter](https://github.com/open-telemetry/opentelemetry-python-contrib/tree/main/exporter).

## Розширення {#extensions}

Щоб знайти повʼязані проєкти, такі як експортери, бібліотеки інструментів, реалізації трасувальників тощо, відвідайте [Реєстр](/ecosystem/registry/?s=python).

### Встановлення новітніх пакунків {#installing-cutting-edge-packages}

Є деяка функціональність, яка ще не була випущена на PyPI. У такій ситуації ви можете встановити пакунки безпосередньо з репозиторію. Це можна зробити, клонуючи репозиторій та виконуючи [редаговане встановлення](https://pip.pypa.io/en/stable/reference/pip_install/#editable-installs):

```sh
git clone https://github.com/open-telemetry/opentelemetry-python.git
cd opentelemetry-python
pip install -e ./opentelemetry-api -e ./opentelemetry-sdk -e ./opentelemetry-semantic-conventions
```

## Репозиторії та бенчмарки {#repositories-and-benchmarks}

- Основний репозиторій: [opentelemetry-python][]
- Репозиторій contrib: [opentelemetry-python-contrib][]

[opentelemetry-python]: https://github.com/open-telemetry/opentelemetry-python
[opentelemetry-python-contrib]: https://github.com/open-telemetry/opentelemetry-python-contrib
