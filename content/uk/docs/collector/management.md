---
title: Управління
description: Як керувати розгортанням OpenTelemetry Collector у масштабі
weight: 23
default_lang_commit: 5489ba34bff91356aa2c501cd55f07eeb30cc355
cSpell:ignore: hostmetrics opampsupervisor
---

Цей документ описує, як ви можете керувати розгортанням OpenTelemetry Collector у масштабі.

Щоб отримати максимальну користь з цієї сторінки, ви повинні знати, як встановити та налаштувати колектор. Ці теми розглядаються в інших місцях:

- [Швидкий старт](/docs/collector/quick-start/), щоб зрозуміти, як встановити OpenTelemetry Collector.
- [Конфігурація][configuration] для налаштування OpenTelemetry Collector, налаштування конвеєрів телеметрії.

## Основи {#basics}

Збір телеметрії у масштабі вимагає структурованого підходу до управління агентами. Типові завдання управління агентами включають:

1. Запит інформації та конфігурації агента. Інформація про агента може включати його версію, інформацію, повʼязану з операційною системою, або можливості. Конфігурація агента стосується його налаштування збору телеметрії, наприклад, [конфігурації][configuration] OpenTelemetry Collector.
2. Оновлення/пониження версій агентів та управління пакетами, специфічними для агентів, включаючи базову функціональність агента та втулки.
3. Застосування нових конфігурацій до агентів. Це може бути необхідно через зміни в середовищі або через зміни в політиці.
4. Моніторинг справності та продуктивності агентів, зазвичай використання ЦП та памʼяті, а також специфічні для агентів метрики, наприклад, швидкість обробки або інформація, повʼязана зі зворотним тиском.
5. Управління зʼєднанням між панеллю управління та агентом, наприклад, обробка сертифікатів TLS (відкликання та ротація).

Не кожен випадок використання вимагає підтримки всіх вищезазначених завдань управління агентами. У контексті OpenTelemetry завдання _4. Моніторинг справності та продуктивності_ ідеально виконується за допомогою OpenTelemetry.

## OpAMP

Постачальники рішень для спостережуваності та хмарні провайдери пропонують власні рішення для управління агентами. У просторі відкритого коду для спостережуваності існує новий стандарт, який ви можете використовувати для управління агентами: Відкритий протокол управління агентами ([Open Agent Management Protocol], OpAMP).

[Специфікація OpAMP][OpAMP specification] визначає, як керувати флотом агентів збору телеметричних даних. Ці агенти можуть бути [OpenTelemetry collectors](/docs/collector/), Fluent Bit або іншими агентами в будь-якій довільній комбінації.

> [!NOTE]
>
> Термін "агент" тут використовується як загальний термін для компонентів OpenTelemetry, які відповідають OpAMP, це може бути колектор, але також і компоненти SDK.

OpAMP — це клієнт/серверний протокол, який підтримує звʼязок через HTTP та WebSockets:

- **OpAMP сервер** є частиною панелі управління та діє як оркестратор, керуючи флотом агентів телеметрії.
- **OpAMP клієнт** є частиною панелі даних. Клієнтська сторона OpAMP може бути реалізована в процесі, наприклад, як у випадку [підтримки OpAMP в OpenTelemetry Collector][opamp-in-otel-collector]. Клієнтська сторона OpAMP може бути реалізована поза процесом. Для цього останнього варіанту ви можете використовувати супервізор, який займається специфічним для OpAMP звʼязком з OpAMP сервером і одночасно контролює агента телеметрії, наприклад, для застосування конфігурації або оновлення. Зверніть увагу, що звʼязок супервізора/телеметрії не є частиною OpAMP.

Розгляньмо конкретне встановлення:

![Приклад налаштування OpAMP](../img/opamp.svg)

1. OpenTelemetry Collector, налаштований з конвеєрами для:
   - (A) отримання сигналів від низхідних джерел
   - (B) експорту сигналів до висхідних пунктів призначення, потенційно включаючи телеметрію про сам колектор (представлену налаштуваннями зʼєднання OpAMP `own_xxx`).
2. Двосторонній потік керування OpAMP між панеллю управління, що реалізує серверну частину OpAMP, та колектором (або супервізором, що контролює колектор), що реалізує клієнтську частину OpAMP.

### Спробуйте {#try-it-out}

Ви можете спробувати просте встановлення OpAMP самостійно, використовуючи [реалізацію протоколу OpAMP на Go][opamp-go]. Для наступного покрокового керівництва вам потрібно мати Go версії 1.22 або вище.

Ми налаштуємо просту панель управління OpAMP, що складається з прикладного OpAMP сервера, і дозволимо OpenTelemetry Collector приєднатися до неї через прикладного [OpAMP супервізора][opamp-supervisor].

#### Крок 1. Запустіть сервер OpAMP {#step-1---start-the-opamp-server}

Склонуйте репозиторій `open-telemetry/opamp-go`:

```sh
git clone https://github.com/open-telemetry/opamp-go.git
```

У теці `./opamp-go/internal/examples/server` запустіть OpAMP сервер:

```console
$ go run .
2025/04/20 15:10:35.307207 [MAIN] OpAMP Server starting...
2025/04/20 15:10:35.308201 [MAIN] OpAMP Server running...
```

#### Крок 2. Встановіть OpenTelemetry Collector {#step-2---install-the-opentelemetry-collector}

Нам потрібен бінарник OpenTelemetry Collector, яким зможе керувати OpAMP Supervisor. Для цього встановіть дистрибутив [OpenTelemetry Collector Contrib][otelcolcontrib]. Шлях, куди ви встановили двійковий файл колектора, позначається як `$OTEL_COLLECTOR_BINARY` у наступній конфігурації.

#### Крок 3. Встановіть OpAMP Supervisor {#step-3---install-the-opamp-supervisor}

Двійковий файл `opampsupervisor` доступний для завантаження з OpenTelemetry Collector [випусків з теґами `cmd/opampsupervisor`][tags]. Ви знайдете список ресурсів, названих на основі ОС і чіпсету, тому завантажте той, який відповідає вашій конфігурації:

{{< tabpane text=true >}}

{{% tab "Linux (AMD 64)" %}}

```sh
curl --proto '=https' --tlsv1.2 -fL -o opampsupervisor \
"https://github.com/open-telemetry/opentelemetry-collector-releases/releases/download/cmd%2Fopampsupervisor%2F{{% version-from-registry collector-cmd-opampsupervisor %}}/opampsupervisor_{{% version-from-registry collector-cmd-opampsupervisor noPrefix %}}_linux_amd64"
chmod +x opampsupervisor
```

{{% /tab %}} {{% tab "Linux (ARM 64)" %}}

```sh
curl --proto '=https' --tlsv1.2 -fL -o opampsupervisor \
"https://github.com/open-telemetry/opentelemetry-collector-releases/releases/download/cmd%2Fopampsupervisor%2F{{% version-from-registry collector-cmd-opampsupervisor %}}/opampsupervisor_{{% version-from-registry collector-cmd-opampsupervisor noPrefix %}}_linux_arm64"
chmod +x opampsupervisor
```

{{% /tab %}} {{% tab "Linux (ppc64le) "%}}

```sh
curl --proto '=https' --tlsv1.2 -fL -o opampsupervisor \
"https://github.com/open-telemetry/opentelemetry-collector-releases/releases/download/cmd%2Fopampsupervisor%2F{{% version-from-registry collector-cmd-opampsupervisor %}}/opampsupervisor_{{% version-from-registry collector-cmd-opampsupervisor noPrefix %}}_linux_ppc64le"
chmod +x opampsupervisor
```

{{% /tab %}} {{% tab "macOS (AMD 64)" %}}

```sh
curl --proto '=https' --tlsv1.2 -fL -o opampsupervisor \
"https://github.com/open-telemetry/opentelemetry-collector-releases/releases/download/cmd%2Fopampsupervisor%2F{{% version-from-registry collector-cmd-opampsupervisor %}}/opampsupervisor_{{% version-from-registry collector-cmd-opampsupervisor noPrefix %}}_darwin_amd64"
chmod +x opampsupervisor
```

{{% /tab %}} {{% tab "macOS (ARM 64)" %}}

```sh
curl --proto '=https' --tlsv1.2 -fL -o opampsupervisor \
"https://github.com/open-telemetry/opentelemetry-collector-releases/releases/download/cmd%2Fopampsupervisor%2F{{% version-from-registry collector-cmd-opampsupervisor %}}/opampsupervisor_{{% version-from-registry collector-cmd-opampsupervisor noPrefix %}}_darwin_arm64"
chmod +x opampsupervisor
```

{{% /tab %}} {{% tab "Windows (AMD 64)" %}}

```sh
Invoke-WebRequest -Uri "https://github.com/open-telemetry/opentelemetry-collector-releases/releases/download/cmd%2Fopampsupervisor%2F{{% version-from-registry collector-cmd-opampsupervisor %}}/opampsupervisor_{{% version-from-registry collector-cmd-opampsupervisor noPrefix %}}_windows_amd64.exe" -OutFile "opampsupervisor.exe"
Unblock-File -Path "opampsupervisor.exe"
```

{{% /tab %}} {{< /tabpane >}}

#### Крок 4. Створіть конфігураційний файл OpAMP Supervisor {#step-4---create-an-opamp-supervisor-configuration-file}

Створіть файл `supervisor.yaml` з наступним вмістом:

```yaml
server:
  endpoint: wss://127.0.0.1:4320/v1/opamp
  tls:
    insecure_skip_verify: true

capabilities:
  accepts_remote_config: true
  reports_effective_config: true
  reports_own_metrics: false
  reports_own_logs: true
  reports_own_traces: false
  reports_health: true
  reports_remote_config: true

agent:
  executable: $OTEL_COLLECTOR_BINARY

storage:
  directory: ./storage
```

> [!NOTE]
>
> Переконайтеся, що ви замінили `$OTEL_COLLECTOR_BINARY` на справжній шлях до файлу. Наприклад, у Linux або macOS, якщо ви встановили колектор у `/usr/local/bin/`, вам слід замінити значення `$OTEL_COLLECTOR_BINARY` на `/usr/local/bin/otelcol`.

#### Крок 5. Запуск OpAMP Supervisor {#step-5---run-the-opamp-supervisor}

Тепер настав час запустити супервізор, який, своєю чергою, запустить ваш OpenTelemetry Collector:

```console
$ ./opampsupervisor --config=./supervisor.yaml
{"level":"info","ts":1745154644.746028,"logger":"supervisor","caller":"supervisor/supervisor.go:340","msg":"Supervisor starting","id":"01965352-9958-72da-905c-e40329c32c64"}
{"level":"info","ts":1745154644.74608,"logger":"supervisor","caller":"supervisor/supervisor.go:1086","msg":"No last received remote config found"}
```

Якщо все спрацювало, ви зможете перейти на [http://localhost:4321/](http://localhost:4321/) і отримати доступ до інтерфейсу сервера OpAMP. Ви маєте побачити свій колектор у списку агентів, якими керує супервізор:

![OpAMP example setup](../img/opamp-server-ui.png)

#### Крок 6. Налаштуйте OpenTelemetry Collector віддалено{#step-6---configure-the-opentelemetry-collector-remotely}

Натисніть на Collector в інтерфейсі сервера і вставте наступний вміст у поле `Додаткова конфігурація`:

```yaml
receivers:
  hostmetrics:
    collection_interval: 10s
    scrapers:
      cpu:

exporters:
  # ПРИМІТКА: До версії v0.86.0 використовуйте `logging` замість `debug`.
  debug:
    verbosity: detailed

service:
  pipelines:
    metrics:
      receivers: [hostmetrics]
      exporters: [debug]
```

Натисніть `Save and Send to Agent`:

![Додаткова конфігурація OpAMP](../img/opamp-server-additional-config.png)

Перезавантажте сторінку і переконайтеся, що статус агента показує `Up: true`:

![Агент OpAMP](../img/opamp-server-agent.png)

Ви можете запитати Колектор для отримання експортованих метрик (зверніть увагу на значення міток):

```console
$ curl localhost:8888/metrics
# HELP otelcol_exporter_send_failed_metric_points Number of metric points in failed attempts to send to destination. [alpha]
# TYPE otelcol_exporter_send_failed_metric_points counter
otelcol_exporter_send_failed_metric_points{exporter="debug",service_instance_id="01965352-9958-72da-905c-e40329c32c64",service_name="otelcol-contrib",service_version="0.124.1"} 0
# HELP otelcol_exporter_sent_metric_points Number of metric points successfully sent to destination. [alpha]
# TYPE otelcol_exporter_sent_metric_points counter
otelcol_exporter_sent_metric_points{exporter="debug",service_instance_id="01965352-9958-72da-905c-e40329c32c64",service_name="otelcol-contrib",service_version="0.124.1"} 132
# HELP otelcol_process_cpu_seconds Total CPU user and system time in seconds [alpha]
# TYPE otelcol_process_cpu_seconds counter
otelcol_process_cpu_seconds{service_instance_id="01965352-9958-72da-905c-e40329c32c64",service_name="otelcol-contrib",service_version="0.124.1"} 0.127965
...
```

Ви також можете переглянути журнали Колектора:

```console
$ cat ./storage/agent.log
{"level":"info","ts":"2025-04-20T15:11:12.996+0200","caller":"service@v0.124.0/service.go:199","msg":"Setting up own telemetry..."}
{"level":"info","ts":"2025-04-20T15:11:12.996+0200","caller":"builders/builders.go:26","msg":"Development component. May change in the future."}
{"level":"info","ts":"2025-04-20T15:11:12.997+0200","caller":"service@v0.124.0/service.go:266","msg":"Starting otelcol-contrib...","Version":"0.124.1","NumCPU":11}
{"level":"info","ts":"2025-04-20T15:11:12.997+0200","caller":"extensions/extensions.go:41","msg":"Starting extensions..."}
{"level":"info","ts":"2025-04-20T15:11:12.997+0200","caller":"extensions/extensions.go:45","msg":"Extension is starting..."}
{"level":"info","ts":"2025-04-20T15:11:13.022+0200","caller":"extensions/extensions.go:62","msg":"Extension started."}
{"level":"info","ts":"2025-04-20T15:11:13.022+0200","caller":"extensions/extensions.go:45","msg":"Extension is starting..."}
{"level":"info","ts":"2025-04-20T15:11:13.022+0200","caller":"healthcheckextension@v0.124.1/healthcheckextension.go:32","msg":"Starting health_check extension","config":{"Endpoint":"localhost:58760","TLSSetting":null,"CORS":null,"Auth":null,"MaxRequestBodySize":0,"IncludeMetadata":false,"ResponseHeaders":null,"CompressionAlgorithms":null,"ReadTimeout":0,"ReadHeaderTimeout":0,"WriteTimeout":0,"IdleTimeout":0,"Path":"/","ResponseBody":null,"CheckCollectorPipeline":{"Enabled":false,"Interval":"5m","ExporterFailureThreshold":5}}}
{"level":"info","ts":"2025-04-20T15:11:13.022+0200","caller":"extensions/extensions.go:62","msg":"Extension started."}
{"level":"info","ts":"2025-04-20T15:11:13.024+0200","caller":"healthcheck/handler.go:132","msg":"Health Check state change","status":"ready"}
{"level":"info","ts":"2025-04-20T15:11:13.024+0200","caller":"service@v0.124.0/service.go:289","msg":"Everything is ready. Begin running and processing data."}
{"level":"info","ts":"2025-04-20T15:11:14.025+0200","msg":"Metrics","resource metrics":1,"metrics":1,"data points":44}
```

## Інша інформація {#other-information}

- Дописи в блозі:
  - [Open Agent Management Protocol (OpAMP) State of the Nation 2023][blog-opamp-status]
  - [Using OpenTelemetry OpAMP to modify service telemetry on the go][blog-opamp-service-telemetry]
- Відео на YouTube:
  - [Smooth Scaling With the OpAMP Supervisor: Managing Thousands of OpenTelemetry Collectors][video-opamp-smooth-scaling]
  - [Remote Control for Observability Using the Open Agent Management Protocol][video-opamp-remote-control]
  - [What is OpAMP & What is BindPlane][video-opamp-bindplane]
  - [Lightning Talk: Managing OpenTelemetry Through the OpAMP Protocol][video-opamp-lt]

[configuration]: /docs/collector/configuration/
[Open Agent Management Protocol]: https://github.com/open-telemetry/opamp-spec
[OpAMP specification]: /docs/specs/opamp/
[opamp-in-otel-collector]: https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/cmd/opampsupervisor/specification/README.md
[opamp-go]: https://github.com/open-telemetry/opamp-go
[opamp-supervisor]: https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/cmd/opampsupervisor
[otelcolcontrib]: https://github.com/open-telemetry/opentelemetry-collector-releases/releases
[tags]: https://github.com/open-telemetry/opentelemetry-collector-releases/tags
[blog-opamp-status]: /blog/2023/opamp-status/
[blog-opamp-service-telemetry]: /blog/2022/opamp/
[video-opamp-smooth-scaling]: https://www.youtube.com/watch?v=g8rtqqNTL9Q
[video-opamp-remote-control]: https://www.youtube.com/watch?v=t550FzDi054
[video-opamp-bindplane]: https://www.youtube.com/watch?v=N18z2dOJSd8
[video-opamp-lt]: https://www.youtube.com/watch?v=LUsfZFRM4yo
