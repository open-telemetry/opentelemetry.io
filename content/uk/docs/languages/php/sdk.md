---
title: SDK
weight: 100
default_lang_commit: 5489ba34bff91356aa2c501cd55f07eeb30cc355
cSpell:ignore: healthcheck
---

SDK OpenTelemetry надає робочу реалізацію API, яку можна налаштувати різними способами.

## Ручне налаштування {#manual-setup}

Ручне налаштування SDK дає вам найбільший контроль над конфігурацією SDK:

```php
<?php
$exporter = new InMemoryExporter();
$meterProvider = new NoopMeterProvider();
$tracerProvider =  new TracerProvider(
    new BatchSpanProcessor(
        $exporter,
        Clock::getDefault(),
        2048, //максимальний розмір черги
        5000, //запланована затримка в мілісекундах
        5000, //тайм-аут експорту
        1024, //максимальний розмір пакету
        true, //автоматичне очищення
        $meterProvider
    )
);
```

## SDK Builder

SDK Builder надає зручний інтерфейс для налаштування частин SDK. Однак він не підтримує всі функції, які доступні при ручному налаштуванні.

```php
<?php

$spanExporter = new InMemoryExporter(); //демо експортер для демонстраційних цілей

$meterProvider = MeterProvider::builder()
    ->addReader(
        new ExportingReader(new MetricExporter((new StreamTransportFactory())->create(STDOUT, 'application/x-ndjson'), /*Temporality::CUMULATIVE*/))
    )
    ->build();

$tracerProvider = TracerProvider::builder()
    ->addSpanProcessor(
        (new BatchSpanProcessorBuilder($spanExporter))
            ->setMeterProvider($meterProvider)
            ->build()
    )
    ->build();

$loggerProvider = LoggerProvider::builder()
    ->addLogRecordProcessor(
        new SimpleLogsProcessor(
            (new ConsoleExporterFactory())->create()
        )
    )
    ->setResource(ResourceInfo::create(Attributes::create(['foo' => 'bar'])))
    ->build();

Sdk::builder()
    ->setTracerProvider($tracerProvider)
    ->setLoggerProvider($loggerProvider)
    ->setMeterProvider($meterProvider)
    ->setPropagator(TraceContextPropagator::getInstance())
    ->setAutoShutdown(true)
    ->buildAndRegisterGlobal();
```

## Автозавантаження {#autoloading}

SDK можна автоматично налаштувати та глобально зареєструвати як частину автозавантаження композитора. Єдина вимога для цього — встановити `OTEL_PHP_AUTOLOAD_ENABLED=true`. Конфігурація може бути надана різними способами:

### Конфігурація середовища {#environment-configuration}

Змінні середовища (або відповідні налаштування `php.ini`) можуть надати будь-яку необхідну/нестандартну конфігурацію, як зазначено в [конфігурації SDK](/docs/languages/sdk-configuration/).

Наприклад:

```shell
OTEL_PHP_AUTOLOAD_ENABLED=true \
OTEL_EXPORTER_OTLP_PROTOCOL=grpc \
OTEL_EXPORTER_OTLP_ENDPOINT=http://collector:4317 \
php example.php
```

```php
<?php
require 'vendor/autoload.php'; //автозавантаження sdk відбувається як частина ініціалізації composer

$tracer = OpenTelemetry\API\Globals::tracerProvider()->getTracer('name', 'version', 'schema.url', [/*атрибути*/]);
$meter = OpenTelemetry\API\Globals::meterProvider()->getMeter('name', 'version', 'schema.url', [/*атрибути*/]);
```

### Декларативна конфігурація {#declarative-configuration}

PHP підтримує експериментальну [Декларативну конфігурацію OpenTelemetry](/docs/specs/otel/configuration/#declarative-configuration), де SDK можна налаштувати за допомогою YAML-файлу.

Щоб увімкнути це, встановіть `OTEL_EXPERIMENTAL_CONFIG_FILE=/path/to/config.yaml`, де `config.yaml` — це файл, який відповідає схемі декларативної конфігурації, наприклад:

`config.yaml`:

```yaml
file_format: '0.4'
tracer_provider:
  processors:
    - batch:
        exporter:
          otlp_http:
            endpoint: http://localhost:4318/v1/traces
resource:
  attributes:
    - name: service.name
      value: ${OTEL_SERVICE_NAME}
    - name: service.namespace
      value: my_service_namespace
```

```shell
OTEL_PHP_AUTOLOAD_ENABLED=true \
OTEL_EXPERIMENTAL_CONFIG_FILE=/path/to/config.yaml
php example.php
```

Наявність `OTEL_EXPERIMENTAL_CONFIG_FILE` призведе до того, що автозавантажувач спробує налаштуватись за допомогою наданого конфігураційного файлу, а інші змінні оточення буде проігноровано.

### Виключені URL {#excluded-urls}

Ви можете вимкнути автозавантаження SDK, якщо URL запиту відповідає регулярному виразу. Відповідність виключеному URL запобігає генерації або експорту будь-якої телеметрії. Ви можете використовувати цю функцію в середовищі PHP з розподіленою памʼяттю, як-от Apache або NGINX, для запитів, таких як перевірка стану.

Наприклад, наступна конфігурація вимикає телеметрію для запитів, таких як `https://site/client/123/info` і `https://site/xyz/healthcheck`:

```shell
OTEL_PHP_EXCLUDED_URLS="client/.*/info,healthcheck"
```

## Конфігурація {#configuration}

PHP SDK підтримує більшість доступних [опцій конфігурації](/docs/languages/sdk-configuration/). Для деталей відповідності дивіться [матрицю відповідності](https://github.com/open-telemetry/opentelemetry-specification/blob/main/spec-compliance-matrix.md).

Існує також ряд специфічних для PHP конфігурацій:

| Назва                                  | Стандартні значення | Значення                                                                              | Приклад                      | Опис                                                                                      |
| -------------------------------------- | ------------------- | ------------------------------------------------------------------------------------- | ---------------------------- | ----------------------------------------------------------------------------------------- |
| `OTEL_PHP_TRACES_PROCESSOR`            | `batch`             | `batch`, `simple`                                                                     | `simple`                     | Вибір процесора трасування                                                                |
| `OTEL_PHP_DETECTORS`                   | `all`               | `env`, `host`, `os`, `process`, `process_runtime`, `sdk`, `sdk_provided`, `container` | `env,os,process`             | Вибір детектора ресурсів                                                                  |
| `OTEL_PHP_AUTOLOAD_ENABLED`            | `false`             | `true`, `false`                                                                       | `true`                       | Увімкнути/вимкнути автозавантаження SDK                                                   |
| `OTEL_PHP_LOG_DESTINATION`             | `default`           | `error_log`, `stderr`, `stdout`, `psr3`, `none`                                       | `stderr`                     | Куди будуть надсилатися внутрішні помилки та попередження                                 |
| `OTEL_PHP_INTERNAL_METRICS_ENABLED`    | `false`             | `true`, `false`                                                                       | `true`                       | Чи повинен SDK генерувати метрики про свій внутрішній стан (наприклад, процесори пакетів) |
| `OTEL_PHP_DISABLED_INSTRUMENTATIONS`   | `[]`                | Імена інструментів або `all`                                                          | `psr15,psr18`                | Вимкнути один або кілька встановлених автоінструментів                                    |
| `OTEL_PHP_EXCLUDED_URLS`               | ``                  | Розділені комами шаблони регулярних виразів                                           | `client/.*/info,healthcheck` | Не завантажувати SDK, якщо URL запиту відповідає одному з наданих регулярних виразів      |
| `OTEL_PHP_DEBUG_SCOPES_DISABLED`       | `false`             | `true`, `false`                                                                       | `true`                       | Увімкнути або вимкнути налагодження відʼєднання областей дії.                             |
| `OTEL_PHP_EXPERIMENTAL_AUTO_ROOT_SPAN` | `false`             | `true`, `false`                                                                       | `true`                       | Запустити кореневий відрізок під час автозавантаження композитора.                        |

Конфігурації можуть бути надані як змінні середовища або через `php.ini` (або файл, включений у `php.ini`)

> [!NOTE] Boolean values in `php.ini`
>
> Булеві значення в `php.ini` повинні бути захищені подвійними лапками, наприклад `"true"` або `"false"`, щоб PHP не перетворював їх на числа

```ini
OTEL_PHP_AUTOLOAD_ENABLED="true"
OTEL_EXPORTER_OTLP_PROTOCOL=grpc
OTEL_EXPORTER_OTLP_ENDPOINT=http://collector:4317
```
