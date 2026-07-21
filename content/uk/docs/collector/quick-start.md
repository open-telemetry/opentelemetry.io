---
title: Швидкий старт
description: Налаштуйте та збирайте телеметричні дані за лічені хвилини!
aliases: [getting-started]
weight: 1
default_lang_commit: b430165b39cfc929f23d116b193f2916778d458b
cSpell:ignore: docker dokey gobin okey telemetrygen
---

<!-- markdownlint-disable ol-prefix blanks-around-fences -->

OpenTelemetry Collector отримує телеметрію, таку як [трейси](/docs/concepts/signals/traces/), [метрики](/docs/concepts/signals/metrics/) та [логи](/docs/concepts/signals/logs/), обробляє її та надсилає до одного або кількох бекендів спостереження через свій компонентний конвеєр.

> [!NOTE]
>
> Цей швидкий старт створює базове локальне середовище. Мета полягає в тому, щоб показати, як працює Колектор, а не налаштувати готове до виробництва середовище.

У цьому посібнику ви навчитеся:

- Запускати локальний екземпляр OpenTelemetry Колектор
- Генерувати дані трейсів і надсилати їх до Колектора
- Перевіряти, що Колектор отримує та обробляє дані

Наприкінці ви матимете простий конвеєр, що працює на вашій машині, і чіткіше уявлення про те, як Колектор вписується в стек спостереження. Якщо ви хочете отримати більше контексту перед початком, див. [Колектор](/docs/collector) огляд.

## Передумови {#prerequisites}

Перед тим як почати, переконайтеся, що ваше середовище має наступні інструменти:

- [Docker](https://www.docker.com/) або будь-яке сумісне середовище запуску контейнерів — використовується для запуску Колектора
- [Go](https://go.dev/), одна з останніх двох мінорних версій — використовується для встановлення генератора телеметрії
- [`GOBIN` змінна середовища][gobin] встановлена — забезпечує доступність встановлених Go бінарних файлів у вашому PATH[^1]

Якщо `GOBIN` не встановлено, виконайте:

```sh
export GOBIN=${GOBIN:-$(go env GOPATH)/bin}
```

Цей посібник використовує команди `bash`. Якщо ви використовуєте інший shell, можливо, вам доведеться відкоригувати синтаксис команд.

[^1]: Для отримання додаткової інформації дивіться [Ваш перший застосунок](https://go.dev/doc/code#Command).

## Налаштування середовища {#set-up-the-environment}

1. Завантажте Docker-образ з базовим [дистрибутивом](/docs/collector/distributions/) OpenTelemetry Collector:

   ```sh
   docker pull otel/opentelemetry-collector:{{% param vers %}}
   ```

2. Встановіть [telemetrygen][], який ми будемо використовувати для імітації клієнта, що генерує телеметричні дані:

   ```sh
   go install github.com/open-telemetry/opentelemetry-collector-contrib/cmd/telemetrygen@latest
   ```

## Генерація та збір телеметрії {#generate-and-collect-telemetry}

3. Запустіть Collector:

   ```sh
   docker run \
      -p 127.0.0.1:4317:4317 \
      -p 127.0.0.1:4318:4318 \
      -p 127.0.0.1:55679:55679 \
      otel/opentelemetry-collector:{{% param vers %}} \
      2>&1 | tee collector-output.txt
   ```

   Команда вище запускає Collector локально та відкриває три порти:
   - `4317` — OTLP через gRPC, зазвичай для більшості SDK
   - `4318` — OTLP через HTTP, для клієнтів, які не підтримують gRPC
   - `55679` — ZPages, вбудований інтерфейс налагодження, який можна відкрити в оглядачі

4. В окремому вікні термінала згенеруйте кілька зразків трейсів:

   ```sh
   $GOBIN/telemetrygen traces --otlp-insecure --traces 3
   ```

   Ви повинні побачити вивід, що підтверджує те, що трейси були згенеровані:

   ```text
   2024-01-16T14:33:15.692-0500  INFO  traces/worker.go:99  traces generated  {"worker": 0, "traces": 3}
   2024-01-16T14:33:15.692-0500  INFO  traces/traces.go:58  stop the batch span processor
   ```

5. У вікні термінала, де запущено контейнер Collector, ви повинні побачити активність отримувача трейсів, подібну до показаної у наступному прикладі:

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

6. Для візуального перегляду трейсів відкрийте <http://localhost:55679/debug/tracez> у вашому оглядачі та виберіть один зі зразків у таблиці.

7. Натисніть <kbd>Control-C</kbd>, щоб зупинити Collector.

## Наступні кроки {#next-steps}

На цьому етапі ви запустили Collector локально та побачили, як він обробляє телеметрію від початку до кінця. Далі ви можете почати вивчати, як його використовують у реальних сценаріях:

- [Конфігурація](/docs/collector/configuration): Дізнайтеся, як працює файл конфігурації Collector і як підключити його до реального бекенду, такого як Jaeger або Prometheus.
- [Шаблони розгортання](/docs/collector/deploy/): Дізнайтеся про різницю між запуском Collector як агента або шлюзу.
- [Встановлення колектора](/docs/collector/install/): Дослідіть варіанти встановлення, крім Docker, включаючи бінарні файли та Kubernetes.
- [Реєстр компонентів](/ecosystem/registry/?language=collector): Ознайомтеся з доступними приймачами, процесорами та експортерами, щоб розширити ваш конвеєр.

[gobin]: https://pkg.go.dev/cmd/go#hdr-Environment_variables
[telemetrygen]: https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/cmd/telemetrygen
