---
title: Налаштування експорту даних OBI Prometheus та OpenTelemetry
linkTitle: Експорт даних
description: Налаштування компонентів OBI для експорту метрик Prometheus та OpenTelemetry та трейсів OpenTelemetry
weight: 10
default_lang_commit: 5f551752635886a0d2d6b2a83e5a36866ca1b5f1
cspell:ignore: AsterixDB couchbase jackc memcached pgxpool pyserver spanmetrics Самопосилання
---

OBI може експортувати метрики та трейси OpenTelemetry до точки доступу OTLP.

## Загальна конфігурація метрик {#common-metrics-configuration}

Розділ YAML: `metrics`.

Розділ `metrics` містить загальну конфігурацію для експортерів метрик та трасування OpenTelemetry.

Наразі він підтримує вибір різних наборів метрик для експорту.

Приклад:

```yaml
metrics:
  features: ['network', 'network_inter_zone']
```

| YAML<br>змінна середовища                  | Опис                                                                                                                                                                                                                                                  | Тип           | Стандартно        |
| ------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------- | ----------------- |
| `features`<br>`OTEL_EBPF_METRICS_FEATURES` | Список груп метрик, для яких OBI експортує дані, див. [функції експорту метрик](#metrics-export-features). Прийнятні значення: `application`, `application_span`, `application_host`, `application_service_graph`, `network` та `network_inter_zone`. | список рядків | `["application"]` |

### Обʼєкти експорту метрик {#metrics-export-features}

Експортер метрик OBI може експортувати наступні групи даних метрик для процесів, що відповідають записам у конфігурації [metrics discovery](./).

- `application`: Метрики на рівні застосунку.
- `application_host`: Метрики хосту на рівні застосунку для тарифікації на основі хосту.
- `application_span`: метрики відрізків трасування на рівні застосунку в застарілому форматі (наприклад, `traces_spanmetrics_latency`); `spanmetrics` не є окремим.
- `application_span_otel`: метрики відрізків трасування на рівні застосунку в форматі OpenTelemetry (наприклад, `traces_span_metrics_calls_total`); `span_metrics` є окремим.
- `application_span_sizes`: метрики відрізків трасування на рівні застосунку, що повідомляють інформацію про розміри запитів і відповідей.
- `application_service_graph`: метрики графіків сервісів на рівні застосунку. Рекомендується використовувати DNS для виявлення сервісів і переконатися, що імена DNS відповідають іменам сервісів OpenTelemetry, які використовує OBI. У середовищах Kubernetes найкращим вибором для метрик графіків сервісів є імʼя сервісу OpenTelemetry, встановлене виявленням імені сервісу.
- `network`: Метрики на рівні мережі. Для отримання додаткової інформації див. документацію з конфігурації [мережевих метрик](../../network).
- `network_inter_zone`: Метрики міжзональних мереж. Для отримання додаткової інформації див. документацію з конфігурації [мережевих метрик](../../network/).

### Функції експорту метрик для кожного застосунку {#per-application-metrics-export-features}

Крім того, OBI дозволяє перевизначити глобальні функції експорту метрик на рівні кожного застосунку, додавши `metrics > features` як властивість до кожного запису `discovery > instrument`.

Наприклад, у наступній конфігурації:

- Екземпляри сервісів `apache`, `nginx` і `tomcat` експортуватимуть лише метрики `application_service_graph` (як визначено у глобальній конфігурації `metrics > features`).

- Сервіс `pyserver` експортуватиме лише групу метрик `application`.

- Сервіси, що прослуховують порти 3030 або 3040, експортуватимуть групи метрик `application`, `application_span` і `application_service_graph`.

```yaml
metrics:
  features: ['application_service_graph']
discovery:
  instrument:
    - open_ports: 3030,3040
      metrics:
        features:
          - 'application'
          - 'application_span'
          - 'application_service_graph'
    - name: pyserver
      open_ports: 7773
      metrics:
        features:
          - 'application'
    - name: apache
      open_ports: 8080
    - name: nginx
      open_ports: 8085
    - name: tomcat
      open_ports: 8090
```

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
| `allow_service_graph_self_references`<br>`OTEL_EBPF_ALLOW_SERVICE_GRAPH_SELF_REFERENCES` | Контролює, чи включає OBI сервіси, що посилаються самі на себе, в генерацію графа сервісів, наприклад, сервіс, який викликає сам себе. Посилання на себе зменшує корисність графа сервісів і збільшує кардинальність даних.                                                                                                               | boolean         | `false`                             |
| `instrumentations`<br>`OTEL_EBPF_METRICS_INSTRUMENTATIONS`                               | Список інструментацій метрик, для яких OBI збирає дані, див. розділ [інструментація метрик](#metrics-instrumentation).                                                                                                                                                                                                                    | list of strings | `["*"]`                             |
| `buckets`                                                                                | Встановлює, як ви можете перевизначити межі сегментів різних гістограм, див. [перевизначення сегментів гістограм](../metrics-histograms/).                                                                                                                                                                                                | (n/a)           | Object                              |
| `histogram_aggregation`<br>`OTEL_EXPORTER_OTLP_METRICS_DEFAULT_HISTOGRAM_AGGREGATION`    | Встановлює стандартне значення агрегації, яке OBI використовує для інструментів гістограм. Прийняті значення [`explicit_bucket_histogram`](/docs/specs/otel/metrics/sdk/#explicit-bucket-histogram-aggregation) або [`base2_exponential_bucket_histogram`](/docs/specs/otel/metrics/sdk/#base2-exponential-bucket-histogram-aggregation). | `string`        | `explicit_bucket_histogram`         |

### Протокол експорту метрик {#metrics-export-protocol}

Якщо ви не встановите протокол, OBI встановлює протокол наступним чином:

- `grpc`: якщо порт закінчується на `4317`, наприклад `4317`, `14317` або `24317`.
- `http/protobuf`: якщо порт закінчується на `4318`, наприклад `4318`, `14318` або `24318`.

### Метрики інструментації {#metrics-instrumentation}

Список областей інструментації, з яких OBI може збирати дані:

- `*`: всі інструментації, якщо `*` присутній, OBI ігнорує інші значення
- `http`: HTTP/HTTPS/HTTP/2 метрики застосунків
- `grpc`: gRPC метрики застосунків
- `sql`: SQL метрики викликів клієнтів бази даних (включаючи PostgreSQL, MySQL та драйвери Go `database/sql` такі як pgx)
- `redis`: Redis метрики клієнтів/серверів бази даних
- `kafka`: Kafka метрики клієнтів/серверів черг повідомлень
- `mqtt`: MQTT метрики повідомлень publish/subscribe (MQTT 3.1.1 та 5.0)
- `couchbase`: Метрики запитів Couchbase N1QL/SQL++ та протоколу метрик KV (Key-Value), що базується на протоколі memcached
- `gpu`: метрики продуктивності GPU
- `mongo`: метрики викликів клієнтів MongoDB
- `dns`: метрики DNS-запитів

Наприклад, встановлення параметра `instrumentations` на: `http,grpc` дозволяє збір метрик `HTTP/HTTPS/HTTP2` та `gRPC` застосунків і відключає інші інструментації.

| YAML<br>змінні середовища                                  | Опис                                                                                                                | Тип           | Стандартно |
| ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- | ------------- | ---------- |
| `instrumentations`<br>`OTEL_EBPF_METRICS_INSTRUMENTATIONS` | Перелік інструментування OBI, що збирає, відповідно до розділу [інструментування метрик](#metrics-instrumentation). | список рядків | `["*"]`    |

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
- `sql`: SQL метрики бази даних клієнтських викликів (включаючи PostgreSQL, MySQL та драйвери Go `database/sql` такі як pgx)
- `redis`: Redis трейси клієнтів/серверів бази даних
- `kafka`: Kafka трейси клієнтів/серверів черг повідомлень
- `mqtt`: MQTT трейси повідомлень publish/subscribe (MQTT 3.1.1 та 5.0)
- `couchbase`: Трейси запитів Couchbase N1QL/SQL та трейси протоколу KV (Key-Value), з текстом запиту та деталями операцій
- `gpu`: метрики продуктивності GPU
- `mongo`: метрики викликів клієнтів MongoDB
- `dns`: метрики DNS-запитів

Наприклад, якщо ви встановите параметр `instrumentations` на: `http,grpc`, це дозволить збір трейсів застосунків `HTTP/HTTPS/HTTP2` та `gRPC`, а також відключить інші інструментації.

#### Інструментування MQTT {#mqtt-instrumentation}

OBI автоматично інструментує MQTT-комунікації, полегшений протокол повідомлень, який зазвичай використовується в IoT та embedded-системах.

**Підтримувані операції**:

- `publish`: повідомлення додається до теми
- `subscribe`: запити на підписку на теми

**Версії протоколу**:

- MQTT 3.1.1
- MQTT 5.0

**Що відстежується**:

- Назви тем (обмежуються першим фільтром тем для операцій subscribe)
- Затримка операцій
- Патерни взаємодії клієнт-сервер

**Обмеження**:

- Для операцій subscribe, використовується тільки перший фільтр тем
- Вміст повідомлень не аналізується, щоб не збільшувати накладні витрати

**Приклад використання**: Моніторинг публікування даних датчиків шлюзу IoT до брокера MQTT, відстеження швидкості доставки повідомлень та виявлення проблем зі звʼязком.

#### Інструментування драйвера PostgreSQL pgx {#postgresql-pgx-driver-instrumentation}

OBI надає спеціалізоване інструментування для pgx, високопродуктивного нативного драйвера Go баз даних PostgreSQL.

**Що робить pgx особливим**: інструментування pgx підключається безпосередньо до драйвера Go за допомогою специфічного для Go трасування eBPF, забезпечуючи спостережуваність для бази даних без накладних витрат, повʼязаних з загальним інструментуванням SQL мережевого рівня.

**Підтримувані операції**:

- `Query`: виконання SQL-запиту з результатами
- Пул зʼєднань (через pgxpool)
- Як нативний pgx API так й інтерфейс обгортка database/SQL

**Що відстежується**:

- Текст SQL-запиту
- Імʼя хосту сервера PostgreSQL (отримане з конфігурації зʼєднання pgx)
- Тривалість операції та деталі помилок
- Всі стандартні мітки метрик database/SQL

**Підтримувані версії pgx**: pgx v5.0.0 та новіші (перевірено до версії v5.8.0). Також підтримується через обгортку database/SQL: `github.com/jackc/pgx/v5/stdlib`

#### Інструментування Couchbase {#couchbase-instrumentation}

Couchbase — це NoSQL база даних документів, що підтримує як безпосередній доступ до ключів-значень так і SQL-подібні запити через SQL++, що широко використовується для застосунків з гнучкими схемами та вимогами до високої доступності. OBI інструментує операції Couchbase через два протоколи:

- **Протокол KV (Key-Value)**: бінарний протокол для безпосереднього доступу через порт 11210, заснований на розширенні [Memcached Binary Protocol](https://github.com/couchbase/memcached/blob/master/docs/BinaryProtocol.md).
- **SQL++ (N1QL)**: протокол запитів на базі HTTP через порт 8093 до точки доступу `/query/service`.

##### KV (Key-Value) protocol {#kv-key-value-protocol}

**Що відстежується**:

| Атрибут                   | Джерело                | Приклад             |
| ------------------------- | ---------------------- | ------------------- |
| `db.system.name`          | Constant               | `couchbase`         |
| `db.operation.name`       | Opcode                 | `GET`, `SET`        |
| `db.namespace`            | Bucket                 | `travel-sample`     |
| `db.collection.name`      | Scope + Collection     | `inventory.airline` |
| `db.collection.name`      | Collection             | `airline`           |
| `db.response.status_code` | Status code (on error) | `1`                 |
| `server.address`          | Connection info        | Server hostname     |
| `server.port`             | Connection info        | `11210`             |

**Відстеження bucket, scope та collection**: Couchbase використовує ієрархічний простір імен: Bucket → Scope → Collection. На відміну від протоколів де простір імен встановлюється для запитів, тут простір імен встановлюється на рівні зʼєднання:

- `SELECT_BUCKET` (не відстежується): Встановлює активний кошик для всіх наступних операцій для зʼєднання. Подібно до `USE database` в MySQL чи `SELECT db_number` в Redis.
- `GET_COLLECTION_ID` (не відстежується): Перетворює шлях `scope.collection` в числовий ідентифікатор колекції. OBI використовує його для збагачення атрибутів відрізків областю дії та назвами колекцій.

OBI підтримує кеш імен кошиків, областей дії та колекцій для кожного зʼєднання і використовує його для анотування кожного наступного відрізка.

**Обмеження**:

- Якщо `SELECT_BUCKET` відбувається до запуску OBI, ім'я кошика для цього зʼєднання невідоме
- Якщо `GET_COLLECTION_ID` відбувається до запуску OBI, імʼя колекції недоступне
- Операції автентифікації та метаданих не фіксуються
- Ці обмеження впливають лише на зʼєднання, встановлені до ініціалізації OBI

##### Операції SQL++ (N1QL) operations {#sql-n1ql-operations}

Запити SQL++ (сучасна назва для мови запитів N1QL) визначаються автоматично через порт сервісу HTTP запитів Couchbase 8093 у точці доступу `/query/service`.

**Підтримувані операції**:

- Усі типи запитів SQL++: SELECT, INSERT, UPDATE, DELETE, UPSERT
- Операції з кошиками та колекціями, доступ до яких здійснюється через шляхи SQL (наприклад, `bucket.scope.collection`)
- Запити між колекціями та кошиками

**Що відстежується**:

| Атрибут                   | Джерело                      | Приклад                      |
| ------------------------- | ---------------------------- | ---------------------------- |
| `db.system.name`          | N1QL version header          | `couchbase` or `other_sql`   |
| `db.operation.name`       | SQL parser                   | `SELECT`, `INSERT`, `UPDATE` |
| `db.namespace`            | Table path / `query_context` | `travel-sample`              |
| `db.collection.name`      | Table path                   | `inventory.airline`          |
| `db.query.text`           | Request body                 | Full SQL++ query text        |
| `db.response.status_code` | Error code (on error)        | `12003`                      |
| `error.type`              | Error message (on error)     | Error message from Couchbase |

**Підтримувані бази даних**:

- **Couchbase Server**: виявляється через заголовок версії N1QL у відповіді
- **Інші реалізації SQL++**: Apache AsterixDB та сумісні бази даних також підтримуються з загальним позначенням `other_sql`

**Формати запитів**: SQL++ запити приймаються як JSON body так і form-encoded POST до `/query/service`:

{{< tabpane text=true >}} {{% tab "JSON Body" %}}

```json
{
  "statement": "SELECT * FROM `bucket`.`scope`.`collection` WHERE id = $1",
  "query_context": "default:`bucket`.`scope`"
}
```

{{% /tab %}} {{% tab "Form Encoded" %}}

```text
statement=SELECT+*+FROM+users&query_context=default:`travel-sample`.`inventory`
```

{{% /tab %}} {{< /tabpane >}}

**Визначення простору імен**: Парсер видобуває bucket і collection з:

1. Шляху до таблиці в операторі SQL: `` `bucket`.`scope`.`collection` ``
2. Поля `query_context`, якщо воно присутнє
3. Одного ідентифікатора: розглядається як ім'я колекції (з `query_context`) або ім'я bucket (без `query_context`, у старій версії)

**Конфігурація**: Інструментування SQL++ вимагає явного ввімкнення:

```bash
export OTEL_EBPF_HTTP_SQLPP_ENABLED=true
export OTEL_EBPF_BPF_BUFFER_SIZE_HTTP=2048  # Більше за стандартне значення; потрібно для захоплення тіла запиту/відповіді
```

**Обмеження**:

- Для виявлення кошиків і колекцій у запиті необхідна нотація шляху SQL (наприклад, `bucket.scope.collection`) або поле `query_context` у запиті
- Відповіді без заголовка версії Couchbase позначаються як загальні операції `other_sql`

**Приклад використання**: Моніторинг вебзастосунку з високим трафіком, що використовує Couchbase для зберігання сесій та управління контентом, відстеження продуктивності запитів та виявлення неефективних запитів N1QL.

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
  instrumentations: ["http, "sql"]
```

| YAML<br>змінна середовища                                                                           | Опис                                                                                                                                                                                                                                  | Тип             | Стандартно |
| --------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------- | ---------- |
| `port`<br>`OTEL_EBPF_PROMETHEUS_PORT`                                                               | HTTP порт для точки доступу скрепера Prometheus. Якщо не встановлено або 0, точка доступу Prometheus не відкрита.                                                                                                                     | int             |            |
| `path`<br>`OTEL_EBPF_PROMETHEUS_PATH`                                                               | HTTP запит для отримання списку метрик Prometheus.                                                                                                                                                                                    | string          | `/metrics` |
| `extra_resource_attributes`<br>`OTEL_EBPF_PROMETHEUS_EXTRA_RESOURCE_ATTRIBUTES`                     | Список додаткових атрибутів ресурсу, які будуть додані до метрики `target_info`. Зверніть увагу на [додаткові атрибути ресурсу](#prometheus-extra-resource-attributes) для важливих деталей про атрибути, виявлені під час виконання. | list of strings |            |
| `ttl`<br>`OTEL_EBPF_PROMETHEUS_TTL`                                                                 | Тривалість, після якої екземпляри метрик не потрапляють у звіт, якщо вони не були оновлені. Використовується для уникнення нескінченного звітування про завершені екземпляри застосунків.                                             | Duration        | `5m`       |
| `buckets`                                                                                           | Встановлює, як ви можете перевизначити межі сегментів різних гістограм, зверніть увагу на [перевизначення сегментів гістограм](../metrics-histograms/).                                                                               | Object          |            |
| `allow_service_graph_self_references`<br>`OTEL_EBPF_PROMETHEUS_ALLOW_SERVICE_GRAPH_SELF_REFERENCES` | Чи OBI включає сервіси, що посилаються самі на себе, в генерацію графа сервісів. Самопосилання не є корисним для графів сервісів і збільшує кардинальність даних.                                                                     | boolean         | `false`    |
| `instrumentations`<br>`OTEL_EBPF_PROMETHEUS_INSTRUMENTATIONS`                                       | Перелік інструментацій, для яких OBI збирає дані, зверніть увагу на розділ [інструментація Prometheus](#prometheus-instrumentation).                                                                                                  | list of strings | `["*"]`    |

### Додаткові атрибути ресурсів Prometheus {#prometheus-extra-resource-attributes}

Через обмеження внутрішнього клієнта API Prometheus, OBI потрібно заздалегідь знати, які атрибути відкриті для кожної метрики. Це призведе до того, що деякі атрибути, які виявляються під час виконання, під час інструментації, не будуть стандартно видимими. Наприклад, атрибути, визначені для кожного застосунку через анотації Kubernetes або в змінній середовища `OTEL_RESOURCE_ATTRIBUTES` цільового застосунку.

Наприклад, застосунок, що визначає `OTEL_RESOURCE_ATTRIBUTES=deployment.environment=production` як змінну середовища, атрибут `target_info{deployment.environment="production"}` буде стандартно видимий, якщо метрики експортуються через OpenTelemetry, але не якщо вони експортуються через Prometheus.

Щоб зробити `deployment_environment` видимим у Prometheus, вам потрібно додати його до списку `extra_resource_attributes`.

### Інструментація Prometheus {#prometheus-instrumentation}

Список областей інструментування, з яких OBI може збирати дані:

- `*`: всі області інструментування, якщо `*` присутній, OBI ігнорує інші значення
- `http`: метрики застосунків HTTP/HTTPS/HTTP/2
- `grpc`: метрики застосунків gRPC
- `sql`: метрики викликів клієнтів SQL бази даних (включаючи PostgreSQL, MySQL та драйвери Go `database/sql` такі як pgx)
- `redis`: метрики клієнтів/серверів Redis бази даних
- `kafka`: метрики клієнтів/серверів Kafka черг повідомлень
- `mqtt`: метрики повідомлень publish/subscribe
- `couchbase`: Метрики запитів Couchbase N1QL/SQL++ та протоколу метрик KV (Key-Value)

Наприклад, якщо встановити параметр `instrumentations` на: `http,grpc`, це дозволить збір метрик застосунків `HTTP/HTTPS/HTTP2` і `gRPC`, а також вимкне інші області інструментування.
