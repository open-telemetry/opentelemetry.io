---
title: Конфігурація
weight: 20
description: Вкажіть OpenTelemetry Injector на ваш Collector або бекенд і керуйте тим, що інструментується на Linux-хості.
cSpell:ignore: metapackage метапакунка
default_lang_commit: edb244ceebdcbbb33c640eaac8d218dbc480e4c0
---

Після [встановлення](../installation/) системних пакунків, [OpenTelemetry Injector](https://github.com/open-telemetry/opentelemetry-injector) інструментує підтримувані застосунки та стандартно експортує телеметрію через OTLP на `localhost` портах `4317` (gRPC) та `4318` (HTTP). Ця сторінка описує, як змінити куди відправляється телеметрія та як налаштувати інжектовану конфігурацію.

## Встановлення призначення експорту {#set-the-export-destination}

Рекомендоване налаштування — запустити локальний [OpenTelemetry Collector](/docs/collector/) на хості, що приймає цю телеметрію та пересилає її до вашого бекенду.

Щоб відправити телеметрію кудись інше, рекомендований спосіб — використати файл конфігурації. Вам рідко потрібно писати його з нуля: кожен мовний пакунок поставляє готовий до використання референсний файл за адресою `/etc/opentelemetry/<language>/otel-config.yaml`, який підключає точку доступу експортера, заголовки та ім'я сервісу через інтерполяцію змінних середовища. Скопіюйте або адаптуйте один з цих файлів з вашою [декларативною конфігурацією](/docs/languages/sdk-configuration/declarative-configuration/), потім активуйте його, встановивши `OTEL_CONFIG_FILE` у файлі середовища інжектора за адресою `/etc/opentelemetry/injector/default_env.conf`:

```conf
OTEL_CONFIG_FILE=/etc/opentelemetry/config.yaml
```

> [!NOTE]
>
> Для .NET, файлова конфігурація також вимагає `OTEL_EXPERIMENTAL_FILE_BASED_CONFIGURATION_ENABLED=true`. Без цього файл конфігурації мовчки ігнорується.

Перезапустіть ваші застосунки, щоб зміни конфігурації набрали силу.

## Конфігурація через змінні середовища {#configure-with-environment-variables}

Якщо ви не хочете використовувати файл конфігурації, ви можете встановити стандартні змінні середовища OpenTelemetry безпосередньо у файлі середовища інжектора за адресою `/etc/opentelemetry/injector/default_env.conf`. Будь-яка змінна, встановлена там, застосовується до кожного інструментованого процесу. Наприклад, щоб експортувати безпосередньо до точки доступу OTLP, що вимагає API ключ:

```conf
OTEL_EXPORTER_OTLP_ENDPOINT=https://otlp.example.com
OTEL_EXPORTER_OTLP_HEADERS=api-key=REPLACE_ME
```

Оскільки `default_env.conf` використовує стандартні змінні середовища OpenTelemetry, ви можете налаштувати будь-яку поведінку SDK так само, як `OTEL_SERVICE_NAME`, `OTEL_RESOURCE_ATTRIBUTES`, або різні налаштування семплера та експортера. Повний список див. у [SDK змінні середовища](/docs/languages/sdk-configuration/).

Перезапустіть ваші застосунки, щоб зміни конфігурації набрали силу.

## Запуск локального Collector {#run-a-local-collector}

Запуск [Collector](/docs/collector/) на хості дозволяє спростити конфігурацію експорту ваших застосунків: вони надсилають OTLP на `localhost`, а Collector забезпечує об’єднання даних у пакети, повторні спроби та маршрутизацію до одного або кількох бекендів. Наразі встановіть та запустіть Collector окремо; він ще не входить до базового метапакунка `opentelemetry`.

## Наступні кроки {#next-steps}

- Дізнайтеся більше про [OpenTelemetry Collector](/docs/collector/).
- Перегляньте доступні [SDK змінні середовища](/docs/languages/sdk-configuration/).
