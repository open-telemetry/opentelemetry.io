---
title: Управління
description: Як керувати розгортанням OpenTelemetry Collector у масштабі
weight: 23
cSpell:ignore: AFVGQT backpressure distro GRRKNBJE hostmetrics loglevel
---

Цей документ описує, як ви можете керувати розгортанням OpenTelemetry Collector у масштабі.

Щоб отримати максимальну користь з цієї сторінки, ви повинні знати, як встановити та налаштувати колектор. Ці теми розглядаються в інших місцях:

- [Швидкий старт](/docs/collector/quick-start/), щоб зрозуміти, як встановити OpenTelemetry Collector.
- [Конфігурація][otel-collector-configuration] для налаштування OpenTelemetry Collector, налаштування конвеєрів телеметрії.

## Основи {#basics}

Збір телеметрії у масштабі вимагає структурованого підходу до управління агентами. Типові завдання управління агентами включають:

1. Запит інформації та конфігурації агента. Інформація про агента може включати його версію, інформацію, повʼязану з операційною системою, або можливості. Конфігурація агента стосується його налаштування збору телеметрії, наприклад, [конфігурації][otel-collector-configuration] OpenTelemetry Collector.
2. Оновлення/пониження версій агентів та управління пакетами, специфічними для агентів, включаючи базову функціональність агента та втулки.
3. Застосування нових конфігурацій до агентів. Це може бути необхідно через зміни в середовищі або через зміни в політиці.
4. Моніторинг справності та продуктивності агентів, зазвичай використання ЦП та памʼяті, а також специфічні для агентів метрики, наприклад, швидкість обробки або інформація, повʼязана зі зворотним тиском.
5. Управління зʼєднанням між панеллю управління та агентом, наприклад, обробка сертифікатів TLS (відкликання та ротація).

Не кожен випадок використання вимагає підтримки всіх вищезазначених завдань управління агентами. У контексті OpenTelemetry завдання _4. Моніторинг справності та продуктивності_ ідеально виконується за допомогою OpenTelemetry.

## OpAMP

Постачальники рішень для спостережуваності та хмарні провайдери пропонують власні рішення для управління агентами. У просторі відкритого коду для спостережуваності існує новий стандарт, який ви можете використовувати для управління агентами: Відкритий протокол управління агентами (Open Agent Management Protocol, OpAMP).

[Специфікація OpAMP][opamp-spec] визначає, як керувати флотом агентів збору телеметричних даних. Ці агенти можуть бути [OpenTelemetry collectors][otel-collector], Fluent Bit або іншими агентами в будь-якій довільній комбінації.

> **Примітка** Термін "агент" тут використовується як загальний термін для компонентів OpenTelemetry, які відповідають OpAMP, це може бути колектор, але також і компоненти SDK.

OpAMP — це клієнт/серверний протокол, який підтримує звʼязок через HTTP та WebSockets:

- **OpAMP сервер** є частиною панелі управління та діє як оркестратор, керуючи флотом агентів телеметрії.
- **OpAMP клієнт** є частиною панелі даних. Клієнтська сторона OpAMP може бути реалізована в процесі, наприклад, як у випадку [підтримки OpAMP в OpenTelemetry Collector][opamp-in-otel-collector]. Клієнтська сторона OpAMP може бути реалізована поза процесом. Для цього останнього варіанту ви можете використовувати супервізор, який займається специфічним для OpAMP звʼязком з OpAMP сервером і одночасно контролює агента телеметрії, наприклад, для застосування конфігурації або оновлення. Зверніть увагу, що звʼязок супервізора/телеметрії не є частиною OpAMP.

Розгляньмо конкретне встановлення:

![Приклад налаштування OpAMP](../img/opamp.svg)

1. OpenTelemetry Collector, налаштований з конвеєрами для:
   - (A) отримання сигналів від низхідних джерел
   - (B) експорту сигналів до висхідних пунктів призначення, потенційно включаючи телеметрію про сам колектор (представлену налаштуваннями зʼєднання OpAMP `own_xxx`).
2. Двосторонній потік керування OpAMP між панеллю управління, що реалізує серверну частину OpAMP, та колектором (або супервізором, що контролює колектор), що реалізує клієнтську частину OpAMP.

Ви можете спробувати просте встановлення OpAMP самостійно, використовуючи [реалізацію протоколу OpAMP на Go][opamp-go]. Для наступного покрокового керівництва вам потрібно мати Go версії 1.19 або вище.

Ми налаштуємо просту панель управління OpAMP, що складається з прикладного OpAMP сервера, і дозволимо OpenTelemetry Collector приєднатися до неї через прикладного OpAMP супервізора.

Спочатку склонуйте репозиторій `open-telemetry/opamp-go`:

```sh
git clone https://github.com/open-telemetry/opamp-go.git
```

Далі нам потрібен бінарний файл OpenTelemetry Collector, яким може керувати OpAMP супервізор. Для цього встановіть дистрибутив [OpenTelemetry Collector Contrib][otelcolcontrib]. Шлях до бінарного файлу колектора (де ви його встановили) далі позначається як `$OTEL_COLLECTOR_BINARY`.

У теці `./opamp-go/internal/examples/server` запустіть OpAMP сервер:

```console
$ go run .
2023/02/08 13:31:32.004501 [MAIN] OpAMP Server starting...
2023/02/08 13:31:32.004815 [MAIN] OpAMP Server running...
```

У теці `./opamp-go/internal/examples/supervisor` створіть файл з назвою `supervisor.yaml` з наступним вмістом (вказуючи супервізору, де знайти сервер і яким бінарним файлом OpenTelemetry Collector керувати):

```yaml
server:
  endpoint: ws://127.0.0.1:4320/v1/opamp

agent:
  executable: $OTEL_COLLECTOR_BINARY
```

> **Примітка** Переконайтеся, що замінили `$OTEL_COLLECTOR_BINARY` на фактичний шлях до файлу. Наприклад, у Linux або macOS, якщо ви встановили колектор у `/usr/local/bin/`, то замініть `$OTEL_COLLECTOR_BINARY` на `/usr/local/bin/otelcol`.

Далі створіть конфігурацію колектора наступним чином (збережіть її у файлі з назвою `effective.yaml` у теці `./opamp-go/internal/examples/supervisor`):

```yaml
receivers:
  prometheus/own_metrics:
    config:
      scrape_configs:
        - job_name: otel-collector
          scrape_interval: 10s
          static_configs:
            - targets: [0.0.0.0:8888]
  hostmetrics:
    collection_interval: 10s
    scrapers:
      load:
      filesystem:
      memory:
      network:

exporters:
  # ПРИМІТКА: До версії v0.86.0 використовуйте `logging` замість `debug`.
  debug:
    verbosity: detailed

service:
  pipelines:
    metrics:
      receivers: [hostmetrics, prometheus/own_metrics]
      exporters: [debug]
```

Тепер настав час запустити супервізора (який, своєю чергою, запустить ваш OpenTelemetry Collector):

```console
$ go run .
2023/02/08 13:32:54 Supervisor starting, id=01GRRKNBJE06AFVGQT5ZYC0GEK, type=io.opentelemetry.collector, version=1.0.0.
2023/02/08 13:32:54 Starting OpAMP client...
2023/02/08 13:32:54 OpAMP Client started.
2023/02/08 13:32:54 Starting agent /usr/local/bin/otelcol
2023/02/08 13:32:54 Connected to the server.
2023/02/08 13:32:54 Received remote config from server, hash=e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855.
2023/02/08 13:32:54 Agent process started, PID=13553
2023/02/08 13:32:54 Effective config changed.
2023/02/08 13:32:54 Enabling own metrics pipeline in the config<F11>
2023/02/08 13:32:54 Effective config changed.
2023/02/08 13:32:54 Config is changed. Signal to restart the agent.
2023/02/08 13:32:54 Agent is not healthy: Get "http://localhost:13133": dial tcp [::1]:13133: connect: connection refused
2023/02/08 13:32:54 Stopping the agent to apply new config.
2023/02/08 13:32:54 Stopping agent process, PID=13553
2023/02/08 13:32:54 Agent process PID=13553 successfully stopped.
2023/02/08 13:32:54 Starting agent /usr/local/bin/otelcol
2023/02/08 13:32:54 Agent process started, PID=13554
2023/02/08 13:32:54 Agent is not healthy: Get "http://localhost:13133": dial tcp [::1]:13133: connect: connection refused
2023/02/08 13:32:55 Agent is not healthy: health check on http://localhost:13133 returned 503
2023/02/08 13:32:55 Agent is not healthy: health check on http://localhost:13133 returned 503
2023/02/08 13:32:56 Agent is not healthy: health check on http://localhost:13133 returned 503
2023/02/08 13:32:57 Agent is healthy.
```

Якщо все спрацювало, ви тепер повинні мати можливість перейти на [http://localhost:4321/](http://localhost:4321/) і отримати доступ до інтерфейсу OpAMP сервера, де ви повинні побачити свій колектор, керований супервізором:

![Приклад налаштування OpAMP](../img/opamp-server-ui.png)

Ви також можете запитати колектор про експортовані метрики (зверніть увагу на значення міток):

```console
$ curl localhost:8888/metrics
...
# HELP otelcol_receiver_accepted_metric_points Number of metric points successfully pushed into the pipeline.
# TYPE otelcol_receiver_accepted_metric_points counter
otelcol_receiver_accepted_metric_points{receiver="prometheus/own_metrics",service_instance_id="01GRRKNBJE06AFVGQT5ZYC0GEK",service_name="io.opentelemetry.collector",service_version="1.0.0",transport="http"} 322
# HELP otelcol_receiver_refused_metric_points Number of metric points that could not be pushed into the pipeline.
# TYPE otelcol_receiver_refused_metric_points counter
otelcol_receiver_refused_metric_points{receiver="prometheus/own_metrics",service_instance_id="01GRRKNBJE06AFVGQT5ZYC0GEK",service_name="io.opentelemetry.collector",service_version="1.0.0",transport="http"} 0
```

## Інша інформація {#other-information}

- Блог пост [Використання OpenTelemetry OpAMP для зміни телеметрії сервісу на ходу][blog-opamp-service-telemetry]
- Відео на YouTube:
  - [Коротка доповідь: Управління OpenTelemetry через протокол OpAMP][opamp-lt]
  - [Що таке OpAMP і що таке BindPlane][opamp-bindplane]

[otel-collector]: /docs/collector/
[otel-collector-configuration]: /docs/collector/configuration/
[opamp-spec]:
  https://github.com/open-telemetry/opamp-spec/blob/main/specification.md
[opamp-in-otel-collector]:
  https://docs.google.com/document/d/1KtH5atZQUs9Achbce6LiOaJxLbksNJenvgvyKLsJrkc/edit#heading=h.ioikt02qpy5f
[opamp-go]: https://github.com/open-telemetry/opamp-go
[otelcolcontrib]:
  https://github.com/open-telemetry/opentelemetry-collector-releases/releases
[blog-opamp-service-telemetry]: /blog/2022/opamp/
[opamp-lt]: https://www.youtube.com/watch?v=LUsfZFRM4yo
[opamp-bindplane]: https://www.youtube.com/watch?v=N18z2dOJSd8
