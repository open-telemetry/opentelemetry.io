---
title: Розгортання Docker
linkTitle: Docker
aliases: [docker_deployment]
default_lang_commit: 5489ba34bff91356aa2c501cd55f07eeb30cc355
cSpell:ignore: otelcollector otlphttp spanmetrics tracetest tracetesting
---

<!-- markdownlint-disable code-block-style ol-prefix -->

## Попередні вимоги {#prerequisites}

- Docker
- [Docker Compose](https://docs.docker.com/compose/install/)
  v2.0.0+
- Make (опціонально)
- 6 ГБ оперативної памʼяті для застосунку
- 16 ГБ дискового простору

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
docker compose up --force-recreate --remove-orphans --detach
```

    {{% /tab %}} {{< /tabpane >}}

4.  (Опціонально) Увімкніть тестування на основі спостережуваності API[^1]:

    {{< tabpane text=true >}} {{% tab Make %}}

```shell
make run-tracetesting
```

    {{% /tab %}} {{% tab Docker %}}

```shell
docker compose -f docker-compose-tests.yml run traceBasedTests
```

    {{% /tab %}} {{< /tabpane >}}

## Перевірка роботи вебмагазину та телеметрії {#verify-the-web-store-and-telemetry}

Після того, як образи будуть зібрані та контейнери запущені, ви можете отримати доступ до:

- Вебмагазин: <http://localhost:8080/>
- Grafana: <http://localhost:8080/grafana/>
- Інтерфейс користувача генератора навантаження: <http://localhost:8080/loadgen/>
- Інтерфейс користувача Jaeger: <http://localhost:8080/jaeger/ui/>
- Інтерфейс користувача Tracetest: <http://localhost:11633/>, тільки при використанні
  `make run-tracetesting`
- Інтерфейс користувача конфігуратора Flagd: <http://localhost:8080/feature>

## Зміна номера основного порту демо {#changing-the-demos-main-port}

Стандартно, демонстраційний застосунок запустить проксі для всього трафіку з вебоглядача, привʼязаного до порту 8080. Щоб змінити номер порту, встановіть змінну середовища `ENVOY_PORT` перед запуском демо.

- Наприклад, щоб використовувати порт 8081[^1]:

  {{< tabpane text=true >}} {{% tab Make %}}

```shell
ENVOY_PORT=8081 make start
```

    {{% /tab %}} {{% tab Docker %}}

```shell
ENVOY_PORT=8081 docker compose up --force-recreate --remove-orphans --detach
```

    {{% /tab %}} {{< /tabpane >}}

## Використання власного бекенду {#bring-your-own-backend}

Ймовірно, ви хочете використовувати вебмагазин як демонстраційний застосунок для наявного бекенду спостережуваності (наприклад, поточного екземпляра Jaeger, Zipkin або одного з [вибраних вами постачальників](/ecosystem/vendors/)).

OpenTelemetry Collector можна використовувати для експорту даних телеметрії до кількох бекендів. Стандартно, колектор у демонстраційного застосунку обʼєднає конфігурацію з двох файлів:

- `otelcol-config.yml`
- `otelcol-config-extras.yml`

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
        exporters: [spanmetrics, otlphttp/example]
  ```

> [!NOTE]
>
> При обʼєднанні значень YAML з Collector, обʼєкти обʼєднуються, а масиви замінюються. Експортер `spanmetrics` повинен бути включений у масив експортерів для конвеєра `traces`, якщо він перевизначений. Не додавання цього експортера призведе до помилки.

Бекенди постачальників можуть вимагати додавання додаткових параметрів для автентифікації, будь ласка, перевірте їх документацію. Деякі бекенди вимагають різних експортерів, ви можете знайти їх і їх документацію на [opentelemetry-collector-contrib/exporter](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/exporter).

Після оновлення `otelcol-config-extras.yml`, запустіть демо, виконавши `make start`. Через деякий час ви повинні побачити, як трасування надходять до вашого бекенду.

[^1]: {{% param notes.docker-compose-v2 %}}
