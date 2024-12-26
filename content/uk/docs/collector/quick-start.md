---
title: Швидкий старт
description: Налаштуйте та збирайте телеметричні дані за лічені хвилини!
aliases: [getting-started]
weight: 1
default_lang_commit: 5489ba34bff91356aa2c501cd55f07eeb30cc355
cSpell:ignore: docker dokey gobin okey telemetrygen
---

<!-- markdownlint-disable ol-prefix blanks-around-fences -->

OpenTelemetry Collector отримує [трейси](/docs/concepts/signals/traces/), [метрики](/docs/concepts/signals/metrics/) та [логи](/docs/concepts/signals/logs/), обробляє телеметрію та експортує її до широкого спектру бекендів спостереження за допомогою своїх компонентів. Концептуальний огляд Collector дивіться у розділі [Collector](/docs/collector).

Ви навчитеся робити наступне менш ніж за пʼять хвилин:

- Налаштовувати та запускати OpenTelemetry Collector.
- Надсилати телеметрію та побачити її обробку Collector.

## Передумови {#prerequisites}

Переконайтеся, що ваше середовище розробника має наступне. Ця сторінка передбачає, що ви використовуєте `bash`. Адаптуйте конфігурацію та команди відповідно до вашої улюбленої оболонки.

- [Docker](https://www.docker.com/) або будь-яке сумісне середовище виконання контейнерів.
- [Go](https://go.dev/) 1.20 або вище
- [`GOBIN` змінна середовища][gobin] встановлена; якщо не встановлена, ініціалізуйте її відповідним чином, наприклад[^1]:

  ```sh
  export GOBIN=${GOBIN:-$(go env GOPATH)/bin}
  ```

[^1]: Для отримання додаткової інформації дивіться [Ваш перший застосунок](https://go.dev/doc/code#Command).

## Налаштування середовища {#set-up-the-environment}

1. Завантажте базовий Docker-образ OpenTelemetry Collector:

   ```sh
   docker pull otel/opentelemetry-collector:{{% param vers %}}
   ```

2. Встановіть утиліту [telemetrygen]:

   ```sh
   go install github.com/open-telemetry/opentelemetry-collector-contrib/cmd/telemetrygen@latest
   ```

   Ця утиліта може імітувати клієнта, що генерує [трейси][traces], [метрики][metrics] та [логи][logs].

## Генерація та збір телеметрії {#generate-and-collect-telemetry}

3. Запустіть Collector, який слухає на портах 4317 (для OTLP gRPC), 4318 (для OTLP
   HTTP) та 55679 (для ZPages):

   ```sh
   docker run \
     -p 127.0.0.1:4317:4317 \
     -p 127.0.0.1:4318:4318 \
     -p 127.0.0.1:55679:55679 \
     otel/opentelemetry-collector:{{% param vers %}} \
     2>&1 | tee collector-output.txt # Опціонально tee вивід для полегшення пошуку пізніше
   ```

4. В окремому вікні термінала згенеруйте кілька зразків трейсів:

   ```sh
   $GOBIN/telemetrygen traces --otlp-insecure --traces 3
   ```

   Серед виводу, згенерованого утилітою, ви повинні побачити підтвердження, що трейси були згенеровані:

   ```text
   2024-01-16T14:33:15.692-0500  INFO  traces/worker.go:99  traces generated  {"worker": 0, "traces": 3}
   2024-01-16T14:33:15.692-0500  INFO  traces/traces.go:58  stop the batch span processor
   ```

   Для полегшення перегляду відповідного виводу ви можете відфільтрувати його:

   ```sh
   $GOBIN/telemetrygen traces --otlp-insecure \
     --traces 3 2>&1 | grep -E 'start|traces|stop'
   ```

5. У вікні термінала, де запущено контейнер Collector, ви повинні побачити активність
   отримувача трейсів, подібну до показаної у наступному прикладі:

   ```console
   $ grep -E '^Span|(ID|Name|Kind|time|Status \w+)\s+:' ./collector-output.txt
   Span #0
       Trace ID       : f30faffbde5fcf71432f89da1bf7bc14
       Parent ID      : 6f1ff7f9cf4ec1c7
       ID             : 8d1e820c1ac57337
       Name           : okey-dokey
       Kind           : Server
       Start time     : 2024-01-16 14:13:54.585877 +0000 UTC
       End time       : 2024-01-16 14:13:54.586 +0000 UTC
       Status code    : Unset
       Status message :
   Span #1
       Trace ID       : f30faffbde5fcf71432f89da1bf7bc14
       Parent ID      :
       ID             : 6f1ff7f9cf4ec1c7
       Name           : lets-go
       Kind           : Client
       Start time     : 2024-01-16 14:13:54.585877 +0000 UTC
       End time       : 2024-01-16 14:13:54.586 +0000 UTC
       Status code    : Unset
       Status message :
   ...
   ```

6. Відкрийте <http://localhost:55679/debug/tracez> та виберіть один зі зразків в таблиці, щоб побачити згенеровані трейси.

7. Після завершення роботи вимкніть контейнер Collector, наприклад, використовуючи <kbd>Control-C</kbd>.

## Наступні кроки {#next-steps}

У цьому навчальному посібнику ви запустили OpenTelemetry Collector та надіслали телеметрію до нього. Як наступні кроки, розгляньте можливість зробити наступне:

- Досліджуйте різні способи [встановлення Collector](/docs/collector/install/).
- Дізнайтеся про різні режими Collector у [Методах розгортання](/docs/collector/deploy/).
- Ознайомтеся з файлами та структурою [конфігурації Collector](/docs/collector/configuration).
- Дивіться доступні компоненти у [реєстрі](/ecosystem/registry/?language=collector).
- Дізнайтеся, як [створити власний Collector за допомогою OpenTelemetry Collector Builder (OCB)](/docs/collector/extend/ocb/).

[gobin]: https://pkg.go.dev/cmd/go#hdr-Environment_variables
[logs]: /docs/concepts/signals/logs/
[metrics]: /docs/concepts/signals/metrics/
[telemetrygen]: https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/cmd/telemetrygen
[traces]: /docs/concepts/signals/traces/
