---
title: Налаштування експорту даних OBI Prometheus та OpenTelemetry
linkTitle: Експорт даних
description: Налаштування компонентів OBI для експорту метрик Prometheus та OpenTelemetry та трейсів OpenTelemetry
weight: 10
default_lang_commit: 873e42833f8e17860becdff26de4717194eb11ca
cspell:ignore: Самопосилання
---

OBI може експортувати метрики та трейси OpenTelemetry до точки доступу OTLP.

## Компонент експорту метрик OpenTelemetry {#opentelemetry-metrics-exporter-component}

Секція YAML: `otel_metrics_export`

Увімкніть компонент експорту метрик OpenTelemetry, встановивши атрибут endpoint у вашому конфігураційному файлі або через змінну середовища, зверніться до [опцій конфігурації експорту метрик](#opentelemetry-metrics-exporter-component).

Налаштуйте компонент у секції `otel_metrics_export` вашого YAML-конфігураційного файлу або через змінні середовища.

На додачу до конфігурації, задокументованої в цій статті, компонент підтримує змінні середовища з [стандартної конфігурації експортерів OpenTelemetry](/docs/languages/sdk-configuration/otlp-exporter/).

Наприклад:

```yaml
otel_metrics_export:
  ttl: 5m
  endpoint: http://otelcol:4318
  protocol: grpc
  features: ['network', 'network_inter_zone']
  buckets:
    duration_histogram: [0, 1, 2]
  histogram_aggregation: base2_exponential_bucket_histogram
```

| YAML<br>змінна середовища                                                                | Опис                                                                                                                                                                                                                                                                                                                                      | Тип             | Стандартно                          |
| ---------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------- | ----------------------------------- |
| `endpoint`<br>`OTEL_EXPORTER_OTLP_METRICS_ENDPOINT`                                      | Точка доступу OBI яка надсилає метрики.                                                                                                                                                                                                                                                                                                   | URL             |                                     |
| `OTEL_EXPORTER_OTLP_ENDPOINT`                                                            | Спільна точка доступу для експортерів метрик і трейсів. OBI додає `/v1/metrics` до URL при надсиланні метрик, відповідно до стандарту OpenTelemetry. Щоб запобігти цій поведінці, використовуйте специфічну для метрик настройку.                                                                                                         | URL             |                                     |
| `protocol`<br>`OTEL_EXPORTER_OTLP_METRICS_PROTOCOL`                                      | Протокол транспорту/кодування точки доступу OpenTelemetry, див. [протокол експорту метрик](#metrics-export-protocol). [Прийняті значення](/docs/languages/sdk-configuration/otlp-exporter/#otel_exporter_otlp_protocol) `http/json`, `http/protobuf` і `grpc`.                                                                            | string          | Визначається за використанням порту |
| `OTEL_EXPORTER_OTLP_PROTOCOL`                                                            | Подібно до спільної точки доступу, протокол для метрик і трейсів.                                                                                                                                                                                                                                                                         | string          | Визначається за використанням порту |
| `insecure_skip_verify`<br>`OTEL_EBPF_INSECURE_SKIP_VERIFY`                               | Якщо `true`, OBI пропускає перевірку та приймає будь-який сертифікат сервера. Перевизначайте цей параметр лише для не промислових середовищ.                                                                                                                                                                                              | boolean         | `false`                             |
| `interval`<br>`OTEL_EBPF_METRICS_INTERVAL`                                               | Проміжок часу між експортуваннями.                                                                                                                                                                                                                                                                                                        | Duration        | `60s`                               |
| `features`<br>`OTEL_EBPF_METRICS_FEATURES`                                               | Перелік груп метрик, для яких OBI експортує дані, див. [особливості експорту метрик](#metrics-export-features). Прийняті значення `application`, `application_span`, `application_host`, `application_service_graph`, `application_process`, `network` і `network_inter_zone`.                                                            | list of strings | `["application"]`                   |
| `allow_service_graph_self_references`<br>`OTEL_EBPF_ALLOW_SERVICE_GRAPH_SELF_REFERENCES` | Контролює, чи включає OBI сервіси, що посилаються самі на себе, в генерацію графа сервісів, наприклад, сервіс, який викликає сам себе. Посилання на себе зменшує корисність графа сервісів і збільшує кардинальність даних.                                                                                                               | boolean         | `false`                             |
| `instrumentations`<br>`OTEL_EBPF_METRICS_INSTRUMENTATIONS`                               | Список інструментацій метрик, для яких OBI збирає дані, див. розділ [інструментація метрик](#metrics-instrumentation).                                                                                                                                                                                                                    | list of strings | `["*"]`                             |
| `buckets`                                                                                | Встановлює, як ви можете перевизначити межі сегментів різних гістограм, див. [перевизначення сегментів гістограм](../metrics-histograms/).                                                                                                                                                                                                | (n/a)           | Object                              |
| `histogram_aggregation`<br>`OTEL_EXPORTER_OTLP_METRICS_DEFAULT_HISTOGRAM_AGGREGATION`    | Встановлює стандартне значення агрегації, яке OBI використовує для інструментів гістограм. Прийняті значення [`explicit_bucket_histogram`](/docs/specs/otel/metrics/sdk/#explicit-bucket-histogram-aggregation) або [`base2_exponential_bucket_histogram`](/docs/specs/otel/metrics/sdk/#base2-exponential-bucket-histogram-aggregation). | `string`        | `explicit_bucket_histogram`         |

### Протокол експорту метрик {#metrics-export-protocol}

Якщо ви не встановите протокол, OBI встановлює протокол наступним чином:

- `grpc`: якщо порт закінчується на `4317`, наприклад `4317`, `14317` або `24317`.
- `http/protobuf`: якщо порт закінчується на `4318`, наприклад `4318`, `14318` або `24318`.

### Обʼєкти експорту метрик {#metrics-export-features}

Експортер метрик OBI може експортувати наступні групи даних метрик для процесів, що відповідають записам у конфігурації [виявлення метрик](./).

- `application`: Метрики на рівні застосунків
- `application_span`: Метрики на рівні трейсів застосунків
- `application_host`: Метрики на рівні хосту застосунку для оцінки на основі хосту
- `application_service_graph`: Метрики на рівні графа сервісів застосунку. Рекомендується використовувати DNS для виявлення сервісів і забезпечити відповідність імен DNS з іменами сервісів OpenTelemetry, які використовує OBI. У середовищах Kubernetes, найкращим вибором для метрик графа сервісів є імʼя сервісу OpenTelemetry, встановлене виявленням імені сервісу.
- `application_process`: Метрики про процеси, які виконують інструментовані застосунки
- `network`: Метрики на рівні мережі, див. документацію з конфігурації [мережевих метрик](../../network), щоб дізнатися більше
- `network_inter_zone`: Мережеві міжзонні метрики, див. документацію [мережевих метрик](../../network/), щоб дізнатися більше

### Метрики інструментації {#metrics-instrumentation}

Список областей інструментації, з яких OBI може збирати дані:

- `*`: всі інструментації, якщо `*` присутній, OBI ігнорує інші значення
- `http`: HTTP/HTTPS/HTTP/2 метрики застосунків
- `grpc`: gRPC метрики застосунків
- `sql`: SQL метрики викликів клієнтів бази даних
- `redis`: Redis метрики клієнтів/серверів бази даних
- `kafka`: Kafka метрики клієнтів/серверів черг повідомлень

Наприклад, встановлення параметра `instrumentations` на: `http,grpc` дозволяє збір метрик `HTTP/HTTPS/HTTP2` та `gRPC` застосунків і відключає інші інструментації.

## Компонент експортерів трейсів OpenTelemetry {#opentelemetry-traces-exporter-component}

Секція YAML: `otel_traces_export`

Ви можете налаштувати компонент в секції `otel_traces_export` вашої YAML конфігурації або через змінні середовища.

На додачу до конфігурації, задокументованої в цій статті, компонент підтримує змінні середовища з [стандартної конфігурації експортерів OpenTelemetry](/docs/languages/sdk-configuration/otlp-exporter/).

```yaml
otel_traces_export:
  endpoint: http://jaeger:4317
  protocol: grpc
  instrumentations: ["http, "sql"]
```

| YAML<br>змінна середовища                                                           | Опис                                                                                                                                                                                                                                                                                 | Тип             | Стандартно               |
| ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------- | ------------------------ |
| `endpoint`<br>`OTEL_EXPORTER_OTLP_TRACES_ENDPOINT`<br>`OTEL_EXPORTER_OTLP_ENDPOINT` | Точка доступу, до якої OBI надсилає трейс. Коли використовується `OTEL_EXPORTER_OTLP_ENDPOINT`, OBI дотримується стандарту OpenTelemetry і автоматично додає шлях `/v1/traces` до URL-адреси. Якщо ви не хочете, щоб це сталося, використовуйте специфічні налаштування для трейсів. | URL             |                          |
| `protocol`<br>`OTEL_EXPORTER_OTLP_TRACES_PROTOCOL`<br>`OTEL_EXPORTER_OTLP_PROTOCOL` | Протокол транспорту/кодування OpenTelemetry, зверніться до [протоколу експорту трейсів](#traces-export-protocol). [Прийняті значення](/docs/languages/sdk-configuration/otlp-exporter/#otel_exporter_otlp_protocol) `http/json`, `http/protobuf` та `grpc`.                          | string          | Inferred from port usage |
| `insecure_skip_verify`<br>`OTEL_EBPF_INSECURE_SKIP_VERIFY`                          | Якщо `true`, OBI пропускає перевірку та приймає будь-який сертифікат сервера. Цю настройку слід перевизначити лише для не виробничих середовищ.                                                                                                                                      | boolean         | `false`                  |
| `instrumentations`<br>`OTEL_EBPF_TRACES_INSTRUMENTATIONS`                           | Список інструментації, для якої OBI збирає дані, зверніться до розділу [інструментації трейсів](#traces-instrumentation).                                                                                                                                                            | list of strings | `["*"]`                  |

### Протокол експорту трейсів {#traces-export-protocol}

Якщо ви не встановите протокол, OBI встановлює протокол наступним чином:

- `grpc`: якщо порт закінчується на `4317`, наприклад `4317`, `14317` або `24317`.
- `http/protobuf`: якщо порт закінчується на `4318`, наприклад `4318`, `14318` або `24318`.

### Інструментування трейсів {#traces-instrumentation}

Список областей інструментації, з яких OBI може збирати дані:

- `*`: вся інструментація, якщо `*` присутній, OBI ігнорує інші значення
- `http`: HTTP/HTTPS/HTTP/2 трейси застосунків
- `grpc`: gRPC трейси застосунків
- `sql`: SQL трейси бази даних клієнтських викликів
- `redis`: Redis трейси клієнтів/серверів бази даних
- `kafka`: Kafka трейси клієнтів/серверів черг повідомлень

Наприклад, якщо ви встановите параметр `instrumentations` на: `http,grpc`, це дозволить збір трейсів застосунків `HTTP/HTTPS/HTTP2` та `gRPC`, а також відключить інші інструментації.

## Компонент експортера Prometheus {#prometheus-exporter-component}

Секція YAML: `prometheus_export`

Ви можете налаштувати компонент в секції `prometheus_export` вашої YAML конфігурації або через змінні середовища. Цей компонент відкриває точку доступу HTTP в інструменті автоматичного інструментування, який дозволяє будь-якому зовнішньому скреперу отримувати метрики у форматі Prometheus. Він активується, якщо встановлено властивість `port`.

```yaml
prometheus_export:
  port: 8999
  path: /metrics
  extra_resource_attributes: ["deployment_environment"]
  ttl: 1s
  buckets:
    request_size_histogram: [0, 10, 20, 22]
    response_size_histogram: [0, 10, 20, 22]
  features:
    - application
    - network
    - application_process
    - application_span
    - application_service_graph
  instrumentations: ["http, "sql"]
```

| YAML<br>змінна середовища                                                                           | Опис                                                                                                                                                                                                                                  | Тип             | Стандартно        |
| --------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------- | ----------------- |
| `port`<br>`OTEL_EBPF_PROMETHEUS_PORT`                                                               | HTTP порт для точки доступу скрепера Prometheus. Якщо не встановлено або 0, точка доступу Prometheus не відкрита.                                                                                                                     | int             |                   |
| `path`<br>`OTEL_EBPF_PROMETHEUS_PATH`                                                               | HTTP запит для отримання списку метрик Prometheus.                                                                                                                                                                                    | string          | `/metrics`        |
| `extra_resource_attributes`<br>`OTEL_EBPF_PROMETHEUS_EXTRA_RESOURCE_ATTRIBUTES`                     | Список додаткових атрибутів ресурсу, які будуть додані до метрики `target_info`. Зверніть увагу на [додаткові атрибути ресурсу](#prometheus-extra-resource-attributes) для важливих деталей про атрибути, виявлені під час виконання. | list of strings |                   |
| `ttl`<br>`OTEL_EBPF_PROMETHEUS_TTL`                                                                 | Тривалість, після якої екземпляри метрик не потрапляють у звіт, якщо вони не були оновлені. Використовується для уникнення нескінченного звітування про завершені екземпляри застосунків.                                             | Duration        | `5m`              |
| `buckets`                                                                                           | Встановлює, як ви можете перевизначити межі сегментів різних гістограм, зверніть увагу на [перевизначення сегментів гістограм](../metrics-histograms/).                                                                               | Object          |                   |
| `features`<br>`OTEL_EBPF_PROMETHEUS_FEATURES`                                                       | Список груп метрик, для яких OBI експортує дані, зверніть увагу на [функції експорту Prometheus](#prometheus-export-features).                                                                                                        | list of strings | `["application"]` |
| `allow_service_graph_self_references`<br>`OTEL_EBPF_PROMETHEUS_ALLOW_SERVICE_GRAPH_SELF_REFERENCES` | Чи OBI включає сервіси, що посилаються самі на себе, в генерацію графа сервісів. Самопосилання не є корисним для графів сервісів і збільшує кардинальність даних.                                                                     | boolean         | `false`           |
| `instrumentations`<br>`OTEL_EBPF_PROMETHEUS_INSTRUMENTATIONS`                                       | Перелік інструментацій, для яких OBI збирає дані, зверніть увагу на розділ [інструментація Prometheus](#prometheus-instrumentation).                                                                                                  | list of strings | `["*"]`           |

### Додаткові атрибути ресурсів Prometheus {#prometheus-extra-resource-attributes}

Через обмеження внутрішнього клієнта API Prometheus, OBI потрібно заздалегідь знати, які атрибути відкриті для кожної метрики. Це призведе до того, що деякі атрибути, які виявляються під час виконання, під час інструментації, не будуть стандартно видимими. Наприклад, атрибути, визначені для кожного застосунку через анотації Kubernetes або в змінній середовища `OTEL_RESOURCE_ATTRIBUTES` цільового застосунку.

Наприклад, застосунок, що визначає `OTEL_RESOURCE_ATTRIBUTES=deployment.environment=production` як змінну середовища, атрибут `target_info{deployment.environment="production"}` буде стандартно видимий, якщо метрики експортуються через OpenTelemetry, але не якщо вони експортуються через Prometheus.

Щоб зробити `deployment_environment` видимим у Prometheus, вам потрібно додати його до списку `extra_resource_attributes`.

### Обʼєкти експорту Prometheus {#prometheus-export-features}

Експортер метрик Prometheus може експортувати такі групи даних метрик:

- `application`: Метрики на рівні застосунку
- `application_span`: Метрики трасування на рівні застосунку
- `application_host`: Метрики хостів на рівні застосунку для оцінки на основі хостів
- `application_service_graph`: Метрики графа сервісів на рівні застосунку. Рекомендується використовувати DNS для виявлення сервісів і забезпечення відповідності імен DNS з іменами сервісів OpenTelemetry, які використовує OBI. У середовищах Kubernetes найкращим вибором для метрик графа сервісів є імʼя сервісу OpenTelemetry, встановлене в результаті виявлення імені сервісу.
- `application_process`: Метрики про процеси, які виконують інструментований застосунок
- `network`: Метрики на рівні мережі, зверніть увагу на [документацію з конфігурації мережевих метрик](../../network/), щоб дізнатися більше
- `network_inter_zone`: Метрики міжзональної мережі, зверніть увагу на [документацію з конфігурації мережевих метрик](../../network/), щоб дізнатися більше

### Інструментація Prometheus {#prometheus-instrumentation}

Список областей інструментування, з яких OBI може збирати дані:

- `*`: всі області інструментування, якщо `*` присутній, OBI ігнорує інші значення
- `http`: метрики застосунків HTTP/HTTPS/HTTP/2
- `grpc`: метрики застосунків gRPC
- `sql`: метрики викликів клієнтів SQL бази даних
- `redis`: метрики клієнтів/серверів Redis бази даних
- `kafka`: метрики клієнтів/серверів Kafka черг повідомлень

Наприклад, якщо встановити параметр `instrumentations` на: `http,grpc`, це дозволить збір метрик застосунків `HTTP/HTTPS/HTTP2` і `gRPC`, а також вимкне інші області інструментування.
