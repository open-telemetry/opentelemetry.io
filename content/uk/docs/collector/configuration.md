---
title: Конфігурація
weight: 20
description: Дізнайтеся, як налаштувати Collector відповідно до ваших потреб
default_lang_commit: 5f551752635886a0d2d6b2a83e5a36866ca1b5f1
# prettier-ignore
cSpell:ignore: cfssl cfssljson configtls fluentforward gencert genkey hostmetrics initca oidc pprof prodevent prometheusremotewrite spanevents unredacted upsert zpages напр невалідну
---

<!-- markdownlint-disable link-fragments -->

Ви можете налаштувати OpenTelemetry Collector відповідно до ваших потреб в спостережуваності. Перед тим, як дізнатися, як працює конфігурація Collector, ознайомтеся з наступним матеріалом:

- [Концепції збору даних][dcc], щоб зрозуміти репозиторії, які застосовуються до
  OpenTelemetry Collector.
- [Рекомендації з безпеки для кінцевих користувачів](/docs/security/config-best-practices/)
- [Рекомендації з безпеки для розробників компонентів](https://github.com/open-telemetry/opentelemetry-collector/blob/main/docs/security-best-practices.md)

## Розташування {#location}

Стандартно конфігурація Collector знаходиться в `/etc/<otel-directory>/config.yaml`, де `<otel-directory>` може бути `otelcol`, `otelcol-contrib` або інше значення, залежно від версії Collector або дистрибутиву Collector, який ви використовуєте.

Ви можете надати одну або кілька конфігурацій за допомогою опції `--config`. Наприклад:

```shell
otelcol --config=customconfig.yaml
```

Прапорець `--config` приймає як шлях до файлу так і значення у вигляді URI `"<scheme>:<opaque_data>"`. Наразі OpenTelemetry Collector підтримує наступних провайдері для `scheme`:

- **file** — Зчитує конфігурацію з файлу, напр. `file:path/to/config.yaml`.
- **env** — Зчитує конфігурацію зі змінної середовища, напр. `env:MY_CONFIG_IN_AN_ENVVAR`.
- **yaml** — Зчитує конфігурацію з рядка YAML, з `::` що є роздільником в шляху, напр. `yaml:exporters::debug::verbosity: detailed`.
<!-- prettier-ignore-start -->
- **http** — Зчитує конфігурацію з HTTP URI, напр. `http://www.example.com`
- **https** — Зчитує конфігурацію з HTTPS URI, напр. `https://www.example.com`
<!-- prettier-ignore-end -->

Ви також можете створити кілька конфігурацій, використовуючи кілька файлів за різними шляхами. Кожен файл може бути повною або частковою конфігурацією, і файли можуть посилатися на компоненти один одного. Якщо обʼєднання файлів не є повною конфігурацією, користувач отримає помилку, оскільки стандартно не буде додано необхідних компонентів. У командному рядку можна вказати декілька шляхів до файлів наступним чином:

```shell
otelcol --config=file:/path/to/first/file --config=file:/path/to/second/file
```

Ви також можете надати конфігурації за допомогою змінних середовища, HTTP URI або шляхів YAML. Наприклад:

```shell
otelcol --config=env:MY_CONFIG_IN_AN_ENVVAR --config=https://server/config.yaml
otelcol --config="yaml:exporters::debug::verbosity: normal"
```

> [!TIP]
>
> При посиланні на вкладені ключі в шляхах YAML, обовʼязково використовуйте подвійні двокрапки (`::`), щоб уникнути плутанини з просторами імен, які містять крапки. Наприклад: `receivers::docker_stats::metrics::container.cpu.utilization::enabled: false`.

Щоб перевірити файл конфігурації, використовуйте команду `validate`. Наприклад:

```shell
otelcol validate --config=customconfig.yaml
```

## Структура конфігурації {#basics}

Структура будь-якого файлу конфігурації Collector складається з чотирьох класів
компонентів конвеєра, які отримують телеметричні дані:

- [Приймачі](#receivers)
  <img width="32" alt="" class="img-initial otel-icon" src="/img/logos/32x32/Receivers.svg">
- [Процесори](#processors)
  <img width="32" alt="" class="img-initial otel-icon" src="/img/logos/32x32/Processors.svg">
- [Експортери](#exporters)
  <img width="32" alt="" class="img-initial otel-icon" src="/img/logos/32x32/Exporters.svg">
- [Конектори](#connectors)
  <img width="32" alt="" class="img-initial otel-icon" src="/img/logos/32x32/Load_Balancer.svg">

Після налаштування кожного компонента конвеєра ви повинні увімкнути його за допомогою конвеєрів у розділі [service](#service) файлу конфігурації.

Крім компонентів конвеєра, ви також можете налаштувати [розширення](#extensions), які надають можливості, які можна додати до Collector, такі як діагностичні інструменти. Розширення не потребують прямого доступу до телеметричних даних і вмикаються через розділ [service](#service).

<a id="endpoint-0.0.0.0-warning"></a> Нижче наведено приклад конфігурації Collector з приймачем, процесором, експортером і трьома розширеннями.

> [!WARNING]
>
> Хоча зазвичай краще привʼязувати точки доступу до `localhost`, коли всі клієнти локальні, наші приклади конфігурацій використовують "невизначену" адресу `0.0.0.0` для зручності. Collector наразі стандартно використовує `0.0.0.0`, але це значення буде змінено на `localhost` найближчим часом. Для отримання деталей щодо будь-якого з цих виборів як значення конфігурації кінцевої точки, див. [Захист від атак на відмову в обслуговуванні][Safeguards against denial of service attacks].

[Safeguards against denial of service attacks]: https://github.com/open-telemetry/opentelemetry-collector/blob/main/docs/security-best-practices.md#safeguards-against-denial-of-service-attacks

```yaml
receivers:
  otlp:
    protocols:
      grpc:
        endpoint: 0.0.0.0:4317
      http:
        endpoint: 0.0.0.0:4318

exporters:
  otlp_grpc:
    endpoint: otelcol:4317
    sending_queue:
      batch:

extensions:
  health_check:
    endpoint: 0.0.0.0:13133
  pprof:
    endpoint: 0.0.0.0:1777
  zpages:
    endpoint: 0.0.0.0:55679

service:
  extensions: [health_check, pprof, zpages]
  pipelines:
    traces:
      receivers: [otlp]
      exporters: [otlp_grpc]
    metrics:
      receivers: [otlp]
      exporters: [otlp_grpc]
    logs:
      receivers: [otlp]
      exporters: [otlp_grpc]
```

Зверніть увагу, що приймачі, процесори, експортери та конвеєри визначаються через ідентифікатори компонентів у форматі `type[/name]`, наприклад `otlp` або `otlp/2`. Ви можете визначити компоненти певного типу більше одного разу, якщо ідентифікатори унікальні. Наприклад:

```yaml
receivers:
  otlp:
    protocols:
      grpc:
        endpoint: 0.0.0.0:4317
      http:
        endpoint: 0.0.0.0:4318
  otlp/2:
    protocols:
      grpc:
        endpoint: 0.0.0.0:55690

exporters:
  otlp_grpc:
    endpoint: otelcol:4317
    sending_queue:
      batch:
  otlp_grpc/2:
    endpoint: otelcol2:4317
    sending_queue:
      batch:

extensions:
  health_check:
    endpoint: 0.0.0.0:13133
  pprof:
    endpoint: 0.0.0.0:1777
  zpages:
    endpoint: 0.0.0.0:55679

service:
  extensions: [health_check, pprof, zpages]
  pipelines:
    traces:
      receivers: [otlp]
      exporters: [otlp_grpc]
    traces/2:
      receivers: [otlp/2]
      exporters: [otlp_grpc/2]
    metrics:
      receivers: [otlp]
      exporters: [otlp_grpc]
    logs:
      receivers: [otlp]
      exporters: [otlp_grpc]
```

Конфігурація також може включати інші файли, змушуючи Collector обʼєднувати їх в єдине уявлення конфігурації YAML в памʼяті:

```yaml
receivers:
  otlp:
    protocols:
      grpc:
        endpoint: 0.0.0.0:4317

exporters: ${file:exporters.yaml}

service:
  extensions: []
  pipelines:
    traces:
      receivers: [otlp]
      processors: []
      exporters: [otlp_grpc]
```

Файл `exporters.yaml` виглядає так:

```yaml
otlp_grpc:
  endpoint: otelcol.observability.svc.cluster.local:443
```

Кінцевий результат в памʼяті буде таким:

```yaml
receivers:
  otlp:
    protocols:
      grpc:
        endpoint: 0.0.0.0:4317

exporters:
  otlp_grpc:
    endpoint: otelcol.observability.svc.cluster.local:443

service:
  extensions: []
  pipelines:
    traces:
      receivers: [otlp]
      processors: []
      exporters: [otlp_grpc]
```

## Приймачі <img width="35" class="img-initial otel-icon" alt="" src="/img/logos/32x32/Receivers.svg"> {#receivers}

Приймачі збирають телеметрію з одного або кількох джерел. Вони можуть бути засновані на запиті або на надсиланні, і можуть підтримувати одне або кілька [джерел даних](/docs/concepts/signals/).

Приймачі налаштовуються в розділі `receivers`. Багато приймачів мають стандартні налаштування, тому вказівка імені приймача достатня для його налаштування. Якщо вам потрібно налаштувати приймач або ви хочете змінити стандартні налаштування, ви можете зробити це в цьому розділі. Будь-яке налаштування, яке ви вказуєте, замінює стандартні значення, якщо вони є.

> Налаштування приймача не означає його увімкнення. Приймачі вмикаються шляхом їх додавання до відповідних конвеєрів у розділі [service](#service).

Collector вимагає одного або кількох приймачів. Наступний приклад показує різні приймачі в одному файлі конфігурації:

```yaml
receivers:
  # Джерела даних: логи
  fluentforward:
    endpoint: 0.0.0.0:8006

  # Джерела даних: метрики
  hostmetrics:
    scrapers:
      cpu:
      disk:
      filesystem:
      load:
      memory:
      network:
      process:
      processes:
      paging:

  # Джерела даних: трасування
  jaeger:
    protocols:
      grpc:
        endpoint: 0.0.0.0:4317
      thrift_binary:
      thrift_compact:
      thrift_http:

  # Джерела даних: трасування, метрики, логи
  kafka:
    protocol_version: 2.0.0

  # Джерела даних: трасування, метрики
  opencensus:

  # Джерела даних: трасування, метрики, логи
  otlp:
    protocols:
      grpc:
        endpoint: 0.0.0.0:4317
        tls:
          cert_file: cert.pem
          key_file: cert-key.pem
      http:
        endpoint: 0.0.0.0:4318

  # Джерела даних: метрики
  prometheus:
    config:
      scrape_configs:
        - job_name: otel-collector
          scrape_interval: 5s
          static_configs:
            - targets: [localhost:8888]

  # Джерела даних: трасування
  zipkin:
```

> Для детальної конфігурації приймачів див. [README приймача](https://github.com/open-telemetry/opentelemetry-collector/blob/main/receiver/README.md).

## Процесори <img width="35" class="img-initial otel-icon" alt="" src="/img/logos/32x32/Processors.svg"> {#processors}

Процесори беруть дані, зібрані приймачами, і змінюють або перетворюють їх перед надсиланням до експортерів. Обробка даних відбувається відповідно до правил або налаштувань, визначених для кожного процесора, які можуть включати фільтрацію, видалення, перейменування або перерахунок телеметрії, серед інших операцій. Порядок процесорів у конвеєрі визначає порядок обробки операцій, які Collector застосовує до сигналу.

Процесори є необовʼязковими, хоча деякі [рекомендуються](https://github.com/open-telemetry/opentelemetry-collector/tree/main/processor#recommended-processors).

Ви можете налаштувати процесори за допомогою розділу `processors` файлу конфігурації Collector. Будь-яке налаштування, яке ви вказуєте, замінює стандартне значення, якщо вони є.

> Налаштування процесора не означає його увімкнення. Процесори вмикаються шляхом їх додавання до відповідних конвеєрів у розділі [service](#service).

Наступний приклад показує кілька стандартних процесорів в одному файлі конфігурації. Ви можете знайти повний список процесорів, обʼєднавши список з [opentelemetry-collector-contrib](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor) і список з [opentelemetry-collector](https://github.com/open-telemetry/opentelemetry-collector/tree/main/processor).

```yaml
processors:
  # Джерела даних: трасування
  attributes:
    actions:
      - key: environment
        value: production
        action: insert
      - key: db.statement
        action: delete
      - key: email
        action: hash

  # Джерела даних: метрики, метрики, логи
  filter:
    error_mode: ignore
    traces:
      span:
        - 'attributes["container.name"] == "app_container_1"'
        - 'resource.attributes["host.name"] == "localhost"'
        - 'name == "app_3"'
      spanevent:
        - 'attributes["grpc"] == true'
        - 'IsMatch(name, ".*grpc.*")'
    metrics:
      metric:
        - 'name == "my.metric" and resource.attributes["my_label"] == "abc123"'
        - 'type == METRIC_DATA_TYPE_HISTOGRAM'
      datapoint:
        - 'metric.type == METRIC_DATA_TYPE_SUMMARY'
        - 'resource.attributes["service.name"] == "my_service_name"'
    logs:
      log_record:
        - 'IsMatch(body, ".*password.*")'
        - 'severity_number < SEVERITY_NUMBER_WARN'

  # Джерела даних: трасування, метрики, логи
  memory_limiter:
    check_interval: 5s
    limit_mib: 4000
    spike_limit_mib: 500

  # Джерела даних: трасування
  resource:
    attributes:
      - key: cloud.zone
        value: zone-1
        action: upsert
      - key: k8s.cluster.name
        from_attribute: k8s-cluster
        action: insert
      - key: redundant-attribute
        action: delete

  # Джерела даних: трасування
  probabilistic_sampler:
    hash_seed: 22
    sampling_percentage: 15

  # Джерела даних: трасування
  span:
    name:
      to_attributes:
        rules:
          - ^\/api\/v1\/document\/(?P<documentId>.*)\/update$
      from_attributes: [db.svc, operation]
      separator: '::'
```

> Для детальної конфігурації процесорів див. [README процесора](https://github.com/open-telemetry/opentelemetry-collector/blob/main/processor/README.md).

## Експортери <img width="35" class="img-initial otel-icon" alt="" src="/img/logos/32x32/Exporters.svg"> {#exporters}

Експортери надсилають дані до одного або кількох бекендів або призначень. Експортери можуть бути засновані на запиті або на надсиланні, і можуть підтримувати одне або кілька [джерел даних](/docs/concepts/signals/).

Кожен ключ у розділі `exporters` визначає екземпляр експортера. Ключ слідує формату `type/name`, де `type` вказує тип експортера (наприклад, `otlp`, `kafka`, `prometheus`), а `name` (необовʼязково) може бути додано для надання унікального імені для кількох екземплярів одного типу.

Більшість експортерів вимагають налаштування для вказівки принаймні призначення, а також налаштувань безпеки, таких як автентифікаційні токени або сертифікати TLS. Будь-яке налаштування, яке ви вказуєте, замінює стандартні значення, якщо вони є.

> Налаштування експортера не означає його увімкнення. Експортери вмикаються шляхом їх додавання до відповідних конвеєрів у розділі [service](#service).

Collector вимагає одного або кількох експортерів. Наступний приклад показує різні експортери в одному файлі конфігурації:

```yaml
exporters:
  # Джерела даних: трасування, метрики, логи
  file:
    path: ./filename.json

  # Джерела даних: трасування
  otlp_grpc/jaeger:
    endpoint: jaeger-server:4317
    tls:
      cert_file: cert.pem
      key_file: cert-key.pem

  # Джерела даних: трасування, метрики, логи
  kafka:
    protocol_version: 2.0.0

  # Джерела даних: трасування, метрики, логи
  # ПРИМІТКА: До v0.86.0 використовуйте `logging` замість `debug`
  debug:
    verbosity: detailed

  # Джерела даних: трасування, метрики
  opencensus:
    endpoint: otelcol2:55678

  # Джерела даних: трасування, метрики, логи
  otlp_grpc:
    endpoint: otelcol2:4317
    tls:
      cert_file: cert.pem
      key_file: cert-key.pem

  # Джерела даних: трасування, метрики
  otlp_http:
    endpoint: https://otlp.example.com:4318

  # Джерела даних: метрики
  prometheus:
    endpoint: 0.0.0.0:8889
    namespace: default

  # Джерела даних: метрики
  prometheusremotewrite:
    endpoint: http://prometheus.example.com:9411/api/prom/push
    # При використанні офіційного Prometheus (запущеного через Docker)
    # endpoint: 'http://prometheus:9090/api/v1/write', додайте:
    # tls:
    #   insecure: true

  # Джерела даних: трасування
  zipkin:
    endpoint: http://zipkin.example.com:9411/api/v2/spans
```

Зверніть увагу, що деякі експортери вимагають сертифікати x.509 для встановлення захищених зʼєднань, як описано в [налаштуваннях сертифікатів](#setting-up-certificates).

> Для отримання додаткової інформації про конфігурацію експортера див. [README експортера](https://github.com/open-telemetry/opentelemetry-collector/blob/main/exporter/README.md).

## Конектори <img width="32" class="img-initial otel-icon" alt="" src="/img/logos/32x32/Load_Balancer.svg"> {#connectors}

Конектори зʼєднують два конвеєри, діючи як експортер і приймач. Конектор споживає дані як експортер в кінці одного конвеєра і випромінює дані як приймач на початку іншого конвеєра. Дані, що споживаються і випромінюються, можуть бути одного типу або різних типів даних. Ви можете використовувати конектори для узагальнення спожитих даних, їх реплікації або маршрутизації.

Ви можете налаштувати один або кілька конекторів за допомогою розділу `connectors` файлу конфігурації Collector. Стандартно конектори не налаштовані. Кожен тип конектора призначений для роботи з однією або кількома парами типів даних і може використовуватися лише для зʼєднання конвеєрів відповідно.

> Налаштування конектора не означає його увімкнення. Конектори вмикаються через конвеєри у розділі [service](#service).

Наступний приклад показує конектор `count` і як він налаштований у розділі `pipelines`. Зверніть увагу, що конектор діє як експортер для трасування і як приймач для метрик, зʼєднуючи обидва конвеєри:

```yaml
receivers:
  foo:

exporters:
  bar:

connectors:
  count:
    spanevents:
      my.prod.event.count:
        description: Кількість подій відрізку з мого продуктового середовища.
        conditions:
          - 'attributes["env"] == "prod"'
          - 'name == "prodevent"'

service:
  pipelines:
    traces:
      receivers: [foo]
      exporters: [count]
    metrics:
      receivers: [count]
      exporters: [bar]
```

> Для детальної конфігурації конекторів див. [README конектора](https://github.com/open-telemetry/opentelemetry-collector/blob/main/connector/README.md).

## Розширення <img width="32" class="img-initial otel-icon" alt="" src="/img/logos/32x32/Extensions.svg"> {#extensions}

Розширення є необовʼязковими компонентами, які розширюють можливості Collector для виконання завдань, не повʼязаних безпосередньо з обробкою телеметричних даних. Наприклад, ви можете додати розширення для моніторингу справності Collector, виявлення сервісів або пересилання даних, серед інших.

Ви можете налаштувати розширення через розділ `extensions` файлу конфігурації Collector. Більшість розширень мають стандартні налаштування, тому ви можете налаштувати їх, вказавши лише імʼя розширення. Будь-яке налаштування, яке ви вказуєте, замінює стандартні значення, якщо вони є.

> Налаштування розширення не означає його увімкнення. Розширення вмикаються у розділі [service](#service).

Стандартно жодні розширення не налаштовані. Наступний приклад показує кілька розширень, налаштованих в одному файлі:

```yaml
extensions:
  health_check:
    endpoint: 0.0.0.0:13133
  pprof:
    endpoint: 0.0.0.0:1777
  zpages:
    endpoint: 0.0.0.0:55679
```

> Для детальної конфігурації розширень див. [README розширення](https://github.com/open-telemetry/opentelemetry-collector/blob/main/extension/README.md).

## Розділ service {#service}

Розділ `service` використовується для налаштування того, які компоненти увімкнені в Collector на основі конфігурації, знайденої в розділах приймачів, процесорів, експортерів і розширень. Якщо компонент налаштований, але не визначений у розділі `service`, то він не увімкнений.

Розділ service складається з трьох підрозділів:

- Розширення
- Конвеєри
- Телеметрія

### Розширення {#service-extensions}

Підрозділ `extensions` складається зі списку бажаних розширень, які потрібно увімкнути. Наприклад:

```yaml
service:
  extensions: [health_check, pprof, zpages]
```

### Конвеєри {#pipelines}

Підрозділ `pipelines` — це місце, де налаштовуються конвеєри, які можуть бути наступних типів:

- `traces` збирають та обробляють дані трасування.
- `metrics` збирають та обробляють дані метрик.
- `logs` збирають і обробляють дані логів.

Конвеєр складається з набору приймачів, процесорів і експортерів. Перед включенням приймача, процесора або експортера в конвеєр, переконайтеся, що визначили його конфігурацію у відповідному розділі.

Ви можете використовувати один і той самий приймач, процесор або експортер у більше ніж одному конвеєрі. Коли процесор використовується в кількох конвеєрах, кожен конвеєр отримує окремий екземпляр процесора.

Наступний приклад показує конфігурацію конвеєра. Зверніть увагу, що порядок процесорів визначає порядок обробки даних:

```yaml
service:
  pipelines:
    metrics:
      receivers: [opencensus, prometheus]
      exporters: [opencensus, prometheus]
    traces:
      receivers: [opencensus, jaeger]
      processors: [memory_limiter]
      exporters: [opencensus, zipkin]
```

Як і у випадку з компонентами, використовуйте синтаксис `type[/name]` для створення додаткових конвеєрів для заданого типу. Ось приклад розширення попередньої конфігурації:

```yaml
service:
  pipelines:
    # ...
    traces:
      # ...
    traces/2:
      receivers: [opencensus]
      exporters: [zipkin]
```

### Телеметрія {#telemetry}

Розділ конфігурації `telemetry` — це місце, де ви можете налаштувати спостережуваність для самого Collector. Він складається з двох підрозділів: `logs` і `metrics`. Щоб дізнатися, як налаштувати ці сигнали, див. [Активуйте внутрішню телеметрію в Collector](/docs/collector/internal-telemetry#activate-internal-telemetry-in-the-collector).

## Інша інформація {#other-information}

### Змінні середовища {#environment-variables}

Використання та розширення змінних середовища підтримується в конфігурації Collector. Наприклад, щоб використовувати значення, збережені в змінних середовища `DB_KEY` і `OPERATION`, ви можете написати наступне:

```yaml
processors:
  attributes/example:
    actions:
      - key: ${env:DB_KEY}
        action: ${env:OPERATION}
```

Ви можете передати стандартне значення до змінної оточення за допомогою синтаксису bash: `${env:DB_KEY:-some-default-var}`

```yaml
processors:
  attributes/example:
    actions:
      - key: ${env:DB_KEY:-mydefault}
        action: ${env:OPERATION:-}
```

Використовуйте `$$`, щоб вказати буквальний символ `$`. Наприклад, представлення `$DataVisualization` виглядатиме наступним чином:

```yaml
exporters:
  prometheus:
    endpoint: prometheus:8889
    namespace: $$DataVisualization
```

### Підтримка проксі {#proxy-support}

Експортери, які використовують пакет [`net/http`](https://pkg.go.dev/net/http), враховують наступні змінні середовища проксі:

- `HTTP_PROXY`: Адреса HTTP проксі
- `HTTPS_PROXY`: Адреса HTTPS проксі
- `NO_PROXY`: Адреси, які не повинні використовувати проксі

Якщо встановлено під час запуску Collector, експортери, незалежно від протоколу, пропускають трафік або обходять проксі, як визначено цими змінними середовища.

### Автентифікація {#authentication}

Більшість приймачів, що експонують порт HTTP або gRPC, можуть бути захищені за допомогою механізму автентифікації Collector. Аналогічно, більшість експортерів, що використовують HTTP або gRPC клієнти, можуть додавати автентифікацію до вихідних запитів.

Механізм автентифікації в Collector використовує механізм розширень, дозволяючи підключати власні автентифікатори до дистрибутивів Collector. Кожне розширення автентифікації має два можливих використання:

- Як клієнтський автентифікатор для експортерів, додаючи дані автентифікації до вихідних запитів
- Як серверний автентифікатор для приймачів, автентифікуючи вхідні зʼєднання.

Для списку відомих автентифікаторів див. [Реєстр](/ecosystem/registry/?s=authenticator&component=extension). Якщо вас цікавить розробка власного автентифікатора, див. [Створення розширення автентифікатора](/docs/collector/extend/custom-component/extension/authenticator).

Щоб додати серверний автентифікатор до приймача в Collector, виконайте наступні кроки:

1. Додайте розширення автентифікатора та його конфігурацію під `.extensions`.
2. Додайте посилання на автентифікатор до `.services.extensions`, щоб його завантажив Collector.
3. Додайте посилання на автентифікатор у `.receivers.<your-receiver>.<http-or-grpc-config>.auth`.

Наступний приклад використовує автентифікатор OIDC на стороні приймача, роблячи це пригідним для віддаленого Collector, який отримує дані від OpenTelemetry Collector, що діє як агент:

```yaml
extensions:
  oidc:
    issuer_url: http://localhost:8080/auth/realms/opentelemetry
    audience: collector

receivers:
  otlp/auth:
    protocols:
      grpc:
        endpoint: 0.0.0.0:4317
        auth:
          authenticator: oidc

processors:

exporters:
  # ПРИМІТКА: До v0.86.0 використовуйте `logging` замість `debug`.
  debug:

service:
  extensions:
    - oidc
  pipelines:
    traces:
      receivers:
        - otlp/auth
      processors: []
      exporters:
        - debug
```

На стороні агента це приклад, який змушує експортер OTLP отримувати токени OIDC, додаючи їх до кожного RPC, що надсилається до віддаленого колектора:

```yaml
extensions:
  oauth2client:
    client_id: agent
    client_secret: some-secret
    token_url: http://localhost:8080/auth/realms/opentelemetry/protocol/openid-connect/token

receivers:
  otlp:
    protocols:
      grpc:
        endpoint: 0.0.0.0:4317

processors:

exporters:
  otlp_grpc/auth:
    endpoint: remote-collector:4317
    auth:
      authenticator: oauth2client

service:
  extensions:
    - oauth2client
  pipelines:
    traces:
      receivers:
        - otlp
      processors: []
      exporters:
        - otlp_grpc/auth
```

### Налаштування сертифікатів {#setting-up-certificates}

У промисловому середовищі використовуйте сертифікати TLS для захищеного звʼязку або mTLS для взаємної автентифікації. Виконайте наступні кроки, щоб створити самопідписні сертифікати, як у цьому прикладі. Ви можете використовувати ваші поточні процедури надання сертифікатів для отримання сертифіката для промислового використання.

Встановіть [`cfssl`](https://github.com/cloudflare/cfssl) і створіть наступний файл `csr.json`:

```json
{
  "hosts": ["localhost", "127.0.0.1"],
  "key": {
    "algo": "rsa",
    "size": 2048
  },
  "names": [
    {
      "O": "OpenTelemetry Example"
    }
  ]
}
```

Потім виконайте наступні команди:

```sh
cfssl genkey -initca csr.json | cfssljson -bare ca
cfssl gencert -ca ca.pem -ca-key ca-key.pem csr.json | cfssljson -bare cert
```

Це створює два сертифікати:

- Центр сертифікації (CA) "OpenTelemetry Example" в `ca.pem`, з відповідним ключем у `ca-key.pem`
- Клієнтський сертифікат у `cert.pem`, підписаний CA "OpenTelemetry Example", з відповідним ключем у `cert-key.pem`.

#### Використання сертифікатів у Collector {#using-certificates-in-the-collector}

Отримавши сертифікати, налаштуйте Collector для їх використання.

##### Конфігурація TLS для приймачів (на стороні сервера) {#tls-configuration-for-receivers-server-side}

Налаштуйте TLS на приймачі для шифрування вхідних зʼєднань. Використовуйте `cert_file` та `key_file` для вказання сертифіката сервера:

```yaml
receivers:
  otlp_grpc:
    protocols:
      grpc:
        endpoint: 0.0.0.0:4317
        tls:
          cert_file: /path/to/cert.pem
          key_file: /path/to/cert-key.pem
      http:
        endpoint: 0.0.0.0:4318
        tls:
          cert_file: /path/to/cert.pem
          key_file: /path/to/cert-key.pem
```

##### Конфігурація TLS для експортерів (на стороні клієнта) {#tls-configuration-for-exporters-client-side}

Налаштуйте TLS на експортері для шифрування вихідних зʼєднань. Використовуйте `ca_file` для перевірки сертифіката сервера:

```yaml
exporters:
  otlp_grpc:
    endpoint: otelcol2:4317
    tls:
      ca_file: /path/to/ca.pem
```

Якщо вам також потрібно предʼявити клієнтський сертифікат серверу:

```yaml
exporters:
  otlp_grpc:
    endpoint: otelcol2:4317
    tls:
      ca_file: /path/to/ca.pem
      cert_file: /path/to/cert.pem
      key_file: /path/to/cert-key.pem
```

##### Конфігурація mTLS (взаємний TLS) {#mtls-configuration-mutual-tls}

Для mTLS як приймач, так і експортер перевіряють сертифікати один одного. На приймачі додайте `client_ca_file` для перевірки сертифікатів клієнта:

```yaml
receivers:
  otlp:
    protocols:
      grpc:
        endpoint: 0.0.0.0:4317
        tls:
          cert_file: /path/to/server-cert.pem
          key_file: /path/to/server-key.pem
          client_ca_file: /path/to/ca.pem
```

На експортері вкажіть як CA для перевірки сервера, так і сертифікат клієнта:

```yaml
exporters:
  otlp:
    endpoint: remote-collector:4317
    tls:
      ca_file: /path/to/ca.pem
      cert_file: /path/to/client-cert.pem
      key_file: /path/to/client-key.pem
```

##### Загальні налаштування TLS {#common-tls-settings}

Для конфігурації TLS доступні наступні налаштування:

| Параметр               | Опис                                                                    |
| ---------------------- | ----------------------------------------------------------------------- |
| `ca_file`              | Шлях до сертифіката CA для перевірки сертифіката партнера               |
| `cert_file`            | Шлях до сертифіката TLS                                                 |
| `key_file`             | Шлях до приватного ключа TLS                                            |
| `client_ca_file`       | Шлях до сертифіката CA для перевірки клієнтських сертифікатів           |
| `insecure`             | Вимкнути перевірку TLS (не рекомендується для промислової експлуатації) |
| `insecure_skip_verify` | Пропустити перевірку сертифіката сервера (не рекомендується)            |
| `min_version`          | Мінімальна версія TLS (наприклад, `1.2` або `1.3`)                      |
| `max_version`          | Максимальна версія TLS                                                  |
| `reload_interval`      | Проміжок часу після якого сертифікат перезавантажується                 |

<!-- prettier-ignore-start -->
<!-- markdownlint-disable MD034 -->
> Більш детальну інформацію про параметри конфігурації TLS див. у [документації configtls](https://github.com/open-telemetry/opentelemetry-collector/blob/v{{% param vers %}}/config/configtls/README.md).
<!-- markdownlint-enable MD034 -->
<!-- prettier-ignore-end -->

[dcc]: /docs/concepts/components/#collector

## Перевизначення налаштувань {#overriding-settings}

Ви можете перевизначити налаштування Collector за допомогою опції `--set`. Налаштування, які ви визначаєте за допомогою цього методу, обʼєднуються в кінцеву конфігурацію після того, як всі джерела `--config` будуть визначені та обʼєднані.

Наступні приклади показують, як перевизначити налаштування всередині вкладених розділів:

### Проста властивість {#simple-property}

Параметр `--set` завжди приймає одну пару ключ/значення, і використовується наступним чином: `--set key=value`. Відповідний YAML виглядає так:

```yaml
key: value
```

### Вкладені ключі {#complex-nested-keys}

Використовуйте дві двокрапки (`::`) в назві пари як роздільник ключів для посилання на вкладені значення мапи. Наприклад, `--set outer::inner=value` перетворюється на:

```yaml
outer:
  inner: value
```

### Кілька значень {#multiple-values}

Для встановлення кількох значень вкажіть кілька прапорців `--set`, тож `--set a=b --set c=d` перетворюється на:

```yaml
a: b
c: d
```

### Масив значень {#array-values}

Масиви можуть бути представлені, використовуючи `[]`. Наприклад, `--set "key=[a, b, c]"` перетворюється на:

```yaml
key:
  - a
  - b
  - c
```

Якщо вам потрібно представити більш складні структури даних, рекомендується використовувати YAML.

> [!CAUTION]
>
> Параметр `--set` має наступні обмеження:
>
> 1. Не підтримує встановлення ключа, що містить крапку `.`.
> 2. Не підтримує встановлення ключа, що містить знак рівності `=`.
> 3. Роздільник ключів у частині значення властивості — `::`. Наприклад, `--set "name={a::b: c}"` перетворюється на `--set name::a::b=c`.

## Вбудовування інших постачальників конфігурації {#embedding-other-configuration-providers}

Один постачальник конфігурації може посилатись на іншого, як в прикладі:

```yaml
receivers:
  otlp:
    protocols:
      grpc:

exporters: ${file:otlp-exporter.yaml}

service:
  extensions: []
  pipelines:
    traces:
      receivers: [otlp]
      processors: []
      exporters: [otlp_grpc]
```

## Як перевірити компоненти, доступні в дистрибутиві {#how-to-check-components-available-in-a-distribution}

Використовуйте підкоманду `build-info`. Нижче наведено приклад:

```bash
otelcol components
```

Простий вивід:

```yaml
buildinfo:
  command: otelcol
  description: OpenTelemetry Collector
  version: 0.143.0
receivers:
  - otlp
processors:
  - memory_limiter
exporters:
  - otlp_grpc
  - otlp_http
  - debug
extensions:
  - zpages
```

## Як перевірити кінцеву конфігурацію {#how-to-examine-final-configuration}

> [!CAUTION]
>
> Ця команда є експериментальною функціональністю. Її поведінка може змінюватись без попередження.

Використовуйте `print-config` в стандартному режимі (`--mode=redacted`) та `--feature-gates=otelcol.printInitialConfig`:

```bash
otelcol print-config --config=file:examples/local/otel-config.yaml
```

Зауважте, що стандартно конфігурація буде виводитись лише тоді, коли вона є валідною, і конфіденційна інформація буде прихована. Щоб вивести потенційно невалідну конфігурацію, використайте `--validate=false`.

### Як переглянути поля з конфіденційною інформацією {#how-to-view-sensitive-fields}

Використовуйте `print-config` з `--mode=unredacted` та `--feature-gates=otelcol.printInitialConfig`:

```bash
otelcol print-config --mode=unredacted --config=file:examples/local/otel-config.yaml
```

### Як вивести кінцеву конфігурацію у форматі JSON {#how-to-print-the-final-configuration-in-json-format}

> [!CAUTION]
>
> Ця команда є експериментальною функціональністю. Її поведінка може змінюватись без попередження.

Використовуйте `print-config` з `--format=json` та
`--feature-gates=otelcol.printInitialConfig`. Зауважте, що формат JSON вважається нестабільним.

```bash
otelcol print-config --format=json --config=file:examples/local/otel-config.yaml
```
