---
title: Розгортання Docker
linkTitle: Docker
aliases: [docker_deployment]
default_lang_commit: d9d900a1c06ef7e2289f86887b68fdf6c150c52f
cSpell:ignore: Firepit otelcollector otlphttp span_metrics кастомізацій
---

<!-- markdownlint-disable code-block-style ol-prefix -->

## Попередні вимоги {#prerequisites}

- Docker
- [Docker Compose](https://docs.docker.com/compose/install/) v2.0.0+
- Make (опціонально)
- 6 ГБ оперативної памʼяті для застосунку (або ~3 ГБ у[мінімальному режимі](#deployment-modes))
- 14 ГБ дискового простору

## Отримання та запуск демо {#get-and-run-the-demo}

1.  Клонуйте репозиторій Demo:

    ```shell
    git clone https://github.com/open-telemetry/opentelemetry-demo.git
    ```

2.  Перейдіть до теки з демо:

    ```shell
    cd opentelemetry-demo/
    ```

3.  Запустіть демо[^1]:

    {{< tabpane text=true >}} {{% tab Make %}}

```shell
make start
```

    {{% /tab %}} {{% tab Docker %}}

```shell
docker compose --env-file .env --env-file .env.override \
  -f compose.yaml -f compose.full.yaml \
  -f compose.observability.yaml -f compose.extras.yaml \
  up --force-recreate --remove-orphans --detach
```

    {{% /tab %}} {{< /tabpane >}}

    ### Режими розгортання {#deployment-modes}

    Демо підтримує кілька режимів розгортання. Стандартний `make start` запускає повне демо зі всіма сервісами та стеком спостережуваності. Інші режими дозволяють зменшити використання ресурсів або виключити певні компоненти:

    | Режим         | Make target              | Опис                                                                    |
    | ------------- | ------------------------ | ----------------------------------------------------------------------- |
    | Повний        | `make start`             | Усі сервіси та бекенди спостережуваності (стандартно)             |
    | Мінімальний   | `make start-minimal`     | Виключає Kafka та її залежні сервіси (`accounting`, `fraud-detection`, `kafka`), зменшує використання памʼяті до ~3 ГБ |
    | Без o11y      | `make start-no-o11y`     | Усі сервіси без бекендів спостережуваності (Jaeger, Grafana, Prometheus, OpenSearch) |
    | Мін., без o11y | `make start-minimal-no-o11y` | Мін. сервіси без бекендів спостережуваності                      |
    | Профілювання  | `make start-profiling`   | Повний режим з eBPF профайлером та UI [Firepit](https://github.com/florianl/firepit) для даних профілювання |
    | Агентний       | `make start-agentic`     | Повний режим з AI агентом, MCP сервером та чатботом для взаємодії з демо |

    Наприклад, щоб запустити демо в мінімальному режимі:

    {{< tabpane text=true >}} {{% tab Make %}}

```shell
make start-minimal
```

    {{% /tab %}} {{% tab Docker %}}

```shell
docker compose --env-file .env --env-file .env.override \
  -f compose.yaml -f compose.observability.yaml -f compose.extras.yaml \
  up --force-recreate --remove-orphans --detach
```

    {{% /tab %}} {{< /tabpane >}}

4. (Опціонально) Запустіть тести телеметрії:

    Демо включає набір тестів перевірки телеметрії, які перевіряють, що кожен сервіс генерує траси, метрики та логи, і що вони потрапляють до очікуваних бекендів (Jaeger, Prometheus, OpenSearch). Детальніше див. [test/telemetry/README.md](https://github.com/open-telemetry/opentelemetry-demo/blob/main/test/telemetry/README.md).

    | Область тесту | Make target                        | Запускає                  |
    | ------------- | ---------------------------------- | ------------------------- |
    | Повний        | `make run-telemetry-tests`         | Повне розгортання (`make start`) |
    | Мінімальний   | `make run-telemetry-tests-minimal` | Мін. розгортання (`make start-minimal`) |
    | Агент       | `make run-telemetry-tests-agentic` | Агентне розгортання (з агентом, MCP, чатботом) |

    Кожен target збирає тестовий образ з `./test/telemetry`, запускає відповідне розгортання, виконує тести, а потім зупиняє демо.

    {{< tabpane text=true >}} {{% tab Make %}}

```shell
make run-telemetry-tests
```

    {{% /tab %}} {{% tab Docker %}}

```shell
# The demo must be running before you start the tests.
docker build -t opentelemetry-demo-telemetry-tests ./test/telemetry
docker run --rm --network opentelemetry-demo \
  --env-file .env --env-file .env.override \
  -e TEST_SCOPE=full \
  opentelemetry-demo-telemetry-tests
```

    {{% /tab %}} {{< /tabpane >}}

## Перевірка роботи вебмагазину та телеметрії {#verify-the-web-store-and-telemetry}

Після того, як образи будуть зібрані та контейнери запущені, ви можете отримати доступ до:

- Вебмагазин: <http://localhost:8080/>
- Інтерфейс конфігуратора Flagd: <http://localhost:8080/feature>
- Документація телеметрії (генерована Weaver): <http://localhost:8080/telemetry/>

Наступні доступні при запущеному стеку спостережуваності (тобто не в режимах `*-no-o11y`):

- Grafana: <http://localhost:8080/grafana/>
- Інтерфейс користувача Jaeger: <http://localhost:8080/jaeger/ui/>
- Інтерфейс користувача OpAMP: <http://localhost:8080/opamp/>

Наступні доступні лише в певних режимах розгортання:

- UI Firepit (режим профілювання): <http://localhost:8080/profiles/>
- Чатбот (агентний режим): <http://localhost:8080/chatbot/>

## Зміна номера основного порту демо {#changing-the-demos-main-port}

Стандартно, демонстраційний застосунок запустить проксі для всього трафіку з вебоглядача, привʼязаного до порту 8080. Щоб змінити номер порту, встановіть змінну середовища `ENVOY_PORT` перед запуском демо.

- Наприклад, щоб використовувати порт 8081[^1]:

  {{< tabpane text=true >}} {{% tab Make %}}

```shell
ENVOY_PORT=8081 make start
```

    {{% /tab %}} {{% tab Docker %}}

```shell
ENVOY_PORT=8081 docker compose --env-file .env --env-file .env.override \
  -f compose.yaml -f compose.full.yaml \
  -f compose.observability.yaml -f compose.extras.yaml \
  up --force-recreate --remove-orphans --detach
```

    {{% /tab %}} {{< /tabpane >}}

## Використання власного бекенду {#bring-your-own-backend}

Ймовірно, ви хочете використовувати вебмагазин як демонстраційний застосунок для наявного бекенду спостережуваності (наприклад, поточного екземпляра Jaeger, Zipkin або одного з [вибраних вами постачальників](/ecosystem/vendors/)).

OpenTelemetry Collector можна використовувати для експорту даних телеметрії до кількох бекендів. Стандартно, колектор у демонстраційному застосунку обʼєднує конфігурацію з наступних файлів (у порядку):

- `otelcol-config.yml` — базові приймачі, процесори та конвеєри
- `otelcol-config-full.yml` — приймачі метрик Kafka та PostgreSQL (повний режим)
- `otelcol-config-observability.yml` — експортери Jaeger, Prometheus та OpenSearch (при використанні стеку спостережуваності)
- `otelcol-config-extras.yml` — порожня заглушка для кастомізацій, завжди завантажується останньою

Щоб додати свій бекенд, відкрийте файл [src/otelcollector/otelcol-config-extras.yml](https://github.com/open-telemetry/opentelemetry-demo/blob/main/src/otel-collector/otelcol-config-extras.yml) за допомогою редактора.

- Почніть з додавання нового експортера. Наприклад, якщо ваш бекенд підтримує OTLP через HTTP, додайте наступне:

  ```yaml
  exporters:
    otlphttp/example:
      endpoint: <your-endpoint-url>
  ```

- Потім зробіть перевизначення `exporters` для телеметричних конвеєрів, які ви хочете використовувати для вашого бекенду.

  ```yaml
  service:
    pipelines:
      traces:
        exporters: [debug, otlp_grpc/jaeger, span_metrics, otlphttp/example]
  ```

> [!NOTE]
>
> При обʼєднанні значень YAML з Collector, обʼєкти обʼєднуються, а масиви замінюються. Конектор `span_metrics` перетворює трасування в метрики, тому він має бути у масиві `exporters` трасувань та `receivers` метрик при перевизначенні цих конвеєрів — відсутність призведе до падіння колектора. Усі інші експортери опціональні: вилучення одного просто зупинить надсилання даних до цього бекенду. Назви експортерів вище по ланцюжку:
>
> - **traces**: `debug`, `otlp_grpc/jaeger`, `span_metrics` _(обовʼязковий)_
> - **metrics**: `debug`, `otlp_http/prometheus`
> - **logs**: `debug`, `opensearch`

Бекенди постачальників можуть вимагати додавання додаткових параметрів для автентифікації, будь ласка, перевірте їх документацію. Деякі бекенди вимагають різних експортерів, ви можете знайти їх і їх документацію на [opentelemetry-collector-contrib/exporter](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/exporter).

Після оновлення `otelcol-config-extras.yml`, запустіть демо, виконавши `make start`. Через деякий час ви повинні побачити, як трасування надходять до вашого бекенду.

[^1]: {{% param notes.docker-compose-v2 %}}
