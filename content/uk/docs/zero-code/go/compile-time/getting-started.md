---
title: Початок роботи
description: Отримуйте телеметрію з Go застосунку без написання коду інструментування.
weight: 5
default_lang_commit: 5234e6b790d14d8db1a3c75e70ac64417fbfe531
cSpell:ignore: GOFLAGS otelc toolexec
---

На цій сторінці показано, як зібрати Go застосунок із compile-time інструментуванням та побачити телеметрію, яку він продукує.

## Передумови {#prerequisites}

- [Go](https://go.dev/) 1.25 або новіший

## Встановлення otelc {#install-otelc}

Проєкт постачає інструмент командного рядка `otelc`, який обгортає стандартний інструментарій Go. Встановіть його за допомогою `go install`:

```sh
go install go.opentelemetry.io/otelc/tool/cmd/otelc@latest
```

Ця команда розміщує бінарний файл `otelc` у вашій стандартній теці Go bin (`$(go env GOPATH)/bin`). Наступні кроки припускають, що `otelc` знаходиться у вашому `PATH`.

Крім того, ви можете зібрати інструмент з вихідного коду, наприклад, щоб спробувати ще невипущені зміни. Для цього потрібні `git` та `make`:

```sh
git clone https://github.com/open-telemetry/opentelemetry-go-compile-instrumentation.git
cd opentelemetry-go-compile-instrumentation
make build
```

У корені репозиторію створюється бінарний файл `otelc`, який ви можете додати до свого `PATH`:

```sh
export PATH=$PATH:$(pwd)
```

## Інструментування вашого застосунку {#instrument-your-application}

Зміна у вашій збірці — один рядок: запустіть `otelc go build` там, де ви раніше запускали `go build`. З кореневої теки модуля вашого застосунку:

```sh
otelc go build -o myapp .
```

Усе після `go` передається інструментарію, тому решта вашої збірки залишається без змін. Інструмент перехоплює збірку, застосовує правила інструментування, які відповідають вашому застосунку та його залежностям, і створює інструментований бінарний файл. Все інше про збірку: прапорці, аргументи пакунків, шляхи виведення — працює так само, як і зі звичайним `go build`.

Стандартно `otelc` виявляє підтримувані бібліотеки у вашому модулі та інструментує їх автоматично, без конфігурації та змін коду.

### Продовжуйте використовувати go build {#keep-using-go-build}

Якщо ви не хочете змінювати команду збірки, запустіть `otelc setup` один раз, щоб підготувати модуль, а потім вкажіть інструментарію Go на `otelc` через `GOFLAGS` і продовжуйте запускати `go build` як зазвичай:

```sh
otelc setup
export GOFLAGS="${GOFLAGS} '-toolexec=otelc toolexec'"
go build -o myapp .
```

Це добре підходить, коли команда `go build` зафіксована наявною системою збірки або скриптом, який ви не хочете змінювати.

## Інструментування контейнерної збірки {#instrument-a-container-build}

Та ж сама заміна працює в контейнерній збірці: встановіть `otelc` у вашому етапі збірки та замініть рядок `go build` у вашому `Dockerfile` на `otelc go build`:

```dockerfile
# Етап збірки
FROM golang:1.25 AS build
WORKDIR /src
COPY . .
RUN go install go.opentelemetry.io/otelc/tool/cmd/otelc@latest
RUN otelc go build -o /out/myapp .

# Етап виконання
FROM gcr.io/distroless/base-debian12
COPY --from=build /out/myapp /myapp
ENTRYPOINT ["/myapp"]
```

Інструментування компілюється в бінарний файл, тому етапу виконання нічого додаткового не потрібно — немає агента для приєднання та додаткових кроків запуску.

## Запуск застосунку та експорт телеметрії {#run-the-application-and-export-telemetry}

Інструментовані застосунки налаштовуються через стандартні змінні середовища OpenTelemetry. Наприклад, щоб надсилати телеметрію до локального [Collector](/docs/collector/) через OTLP:

```sh
export OTEL_SERVICE_NAME=myapp
export OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4317
./myapp
```

Дивіться розділ [Конфігурація](../configuration) для повного списку змінних середовища, які розпізнає інструментування.

## Спробуйте демо {#try-the-demo}

Репозиторій містить демонстраційні застосунки та повний стек спостережуваності (Collector, Jaeger, Prometheus та Grafana), щоб ви могли побачити телеметрію від початку до кінця. Стек працює на [Docker](https://www.docker.com/), тому переконайтеся, що Docker доступний. З кореня репозиторію виконайте:

```sh
cd demo/infrastructure/docker-compose
make start
```

Дивіться [теку demo](https://github.com/open-telemetry/opentelemetry-go-compile-instrumentation/tree/main/demo) для деталей про демонстраційні застосунки та інфраструктуру.

## Наступні кроки {#next-steps}

- Перевірте, які [бібліотеки інструментуються](../supported-libraries) з коробки.
- Дізнайтеся, як [налаштовувати](../configuration) інструмент і телеметрію, яку він продукує.
