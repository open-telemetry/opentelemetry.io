---
title: Створення власного колектора за допомогою OpenTelemetry Collector Builder
linkTitle: Створення власного колектора
description: Створіть власний дистрибутив OpenTelemetry Collector
weight: 200
aliases: [/docs/collector/custom-collector]
params:
  providers-vers: v1.48.0
default_lang_commit: 5f551752635886a0d2d6b2a83e5a36866ca1b5f1
# prettier-ignore
cSpell:ignore: darwin debugexporter gomod otlpexporter otlpreceiver wyrtw відлагодження відлагоджувати результуючому
---

Колектор OpenTelemetry має пʼять офіційних [дистрибутивів](/docs/collector/distributions/), як постачаються з певними попередньо налаштованими компонентами. Якщо ви потребуєте більшої гнучкості, ви можете скористатись [OpenTelemetry Collector Builder][ocb] (або `ocb`) для створення двійкового коду вашого власного дистрибутиву, який міститиме власні компоненти, компоненти проєкту та інші широкодоступні компоненти.

Наступне керівництва показує з чого потрібно почати, щоб створити власний колектор за допомогою `ocb`. В цьому прикладі ви створите дистрибутив колектора для підтримки розробки та тестування власних компонентів. Ви зможете запускати та відлагоджувати компоненти вашого колектора безпосередньо у вашому оточенні розробки, яке ви використовуєте для мови Go. Використовуйте всі наявні у вашому IDE можливості для відлагодження (трасування стеків є чудовим вчителем!) щоб зрозуміти як колектор взаємодіє з компонентами вашого коду.

## Передумови {#prerequisites}

`ocb` вимагає наявності Go для збирання дистрибутиву колектора. Переконайтесь що у вас [встановлено](https://go.dev/doc/install) [сумісну версію](https://github.com/open-telemetry/opentelemetry-collector/blob/main/README.md#compatibility) Go перед тим як розпочати.

## Встановлення OpenTelemetry Collector Builder {#install-the-opentelemetry-collector-builder}

Бінарний файл `ocb` доступний для завантаження з випусків OpenTelemetry Collector з [теґами `cmd/builder`][tags]. Відшукайте та завантажте потрібний для вашої операційної системи та архітектури процесора елемент:

{{< tabpane text=true >}}

{{% tab "Linux (AMD 64)" %}}

```sh
curl --proto '=https' --tlsv1.2 -fL -o ocb \
https://github.com/open-telemetry/opentelemetry-collector-releases/releases/download/cmd%2Fbuilder%2F{{% version-from-registry collector-builder %}}/ocb_{{% version-from-registry collector-builder noPrefix %}}_linux_amd64
chmod +x ocb
```

{{% /tab %}} {{% tab "Linux (ARM 64)" %}}

```sh
curl --proto '=https' --tlsv1.2 -fL -o ocb \
https://github.com/open-telemetry/opentelemetry-collector-releases/releases/download/cmd%2Fbuilder%2F{{% version-from-registry collector-builder %}}/ocb_{{% version-from-registry collector-builder noPrefix %}}_linux_arm64
chmod +x ocb
```

{{% /tab %}} {{% tab "Linux (ppc64le) "%}}

```sh
curl --proto '=https' --tlsv1.2 -fL -o ocb \
https://github.com/open-telemetry/opentelemetry-collector-releases/releases/download/cmd%2Fbuilder%2F{{% version-from-registry collector-builder %}}/ocb_{{% version-from-registry collector-builder noPrefix %}}_linux_ppc64le
chmod +x ocb
```

{{% /tab %}} {{% tab "macOS (AMD 64)" %}}

```sh
curl --proto '=https' --tlsv1.2 -fL -o ocb \
https://github.com/open-telemetry/opentelemetry-collector-releases/releases/download/cmd%2Fbuilder%2F{{% version-from-registry collector-builder %}}/ocb_{{% version-from-registry collector-builder noPrefix %}}_darwin_amd64
chmod +x ocb
```

{{% /tab %}} {{% tab "macOS (ARM 64)" %}}

```sh
curl --proto '=https' --tlsv1.2 -fL -o ocb \
https://github.com/open-telemetry/opentelemetry-collector-releases/releases/download/cmd%2Fbuilder%2F{{% version-from-registry collector-builder %}}/ocb_{{% version-from-registry collector-builder noPrefix %}}_darwin_arm64
chmod +x ocb
```

{{% /tab %}} {{% tab "Windows (AMD 64)" %}}

```sh
Invoke-WebRequest -Uri "https://github.com/open-telemetry/opentelemetry-collector-releases/releases/download/cmd%2Fbuilder%2F{{% version-from-registry collector-builder %}}/ocb_{{% version-from-registry collector-builder noPrefix %}}_windows_amd64.exe" -OutFile "ocb.exe"
Unblock-File -Path "ocb.exe"
```

{{% /tab %}} {{< /tabpane >}}

Щоб переконатися, що `ocb` встановлено коректно, перейдіть до вашого термінала та введіть `./ocb help`. Ви повинні побачити вивід команди `help` у вашій консолі.

## Налаштуйте OpenTelemetry Collector Builder {#configure-the-opentelemetry-collector-builder}

Налаштуйте `ocb` за допомогою YAML-файлу маніфесту. Маніфест містить два основних розділи. Перший — `dist`, містить параметри для налаштування генерування коду та процесів компіляції. Другий розділ містить типи модулів верхнього рівня, такі як: `extensions`, `exporters`, `receivers` та `processors`. Кожен тип модуля приймає перелік компонентів. Розділ маніфесту `dist` містить теґи, які є еквівалентами прапорців `flags` командного рядка `ocb`. В наступній таблиці містяться параметри для налаштування розділу `dist`.

| Теґ                | Опис                                                                        | Опціонально     | Стандартне значення                                                               |
| ------------------ | --------------------------------------------------------------------------- | --------------- | --------------------------------------------------------------------------------- |
| module:            | Назва модуля для нового дистрибутиву, згідно з домовленостями Go mod        | Так, але бажано | `go.opentelemetry.io/collector/cmd/builder`                                       |
| name:              | Назва двійкового файлу вашого дистрибутиву                                  | Так             | `otelcol-custom`                                                                  |
| description:       | Повна назва вашого застосунку                                               | Так             | `Custom OpenTelemetry Collector distribution`                                     |
| output_path:       | Шлях для запису виводу (сирці та бінарний файл)                             | Так             | `/var/folders/86/s7l1czb16g124tng0d7wyrtw0000gn/T/otelcol-distribution3618633831` |
| version:           | Версія вашого OpenTelemetry Collector                                       | Так             | `1.0.0`                                                                           |
| go:                | Двійковий файл Go, що використовується для компілювання згенерованих сирців | Так             | go зі змінної PATH                                                                |
| debug_compilation: | Зберегти символи налагодження в результуючому двійковому файлі              | Так             | False                                                                             |

Всі теґи `dist` є опціональними. Ви можете додавати власні значення залежно від того чи бажаєте поділитись власним колектором з іншими, чи ви будете використовувати `ocb` для початкового розгортання ваших компонентів та тестування оточення.

Для налаштування `ocb`, виконайте наступні кроки:

1. Створіть файл маніфесту з назвою `builder-config.yaml` з наступним вмістом:

   ```yaml
   dist:
     name: otelcol-dev
     description: Basic OTel Collector distribution for Developers
     output_path: ./otelcol-dev
   ```

2. Додайте модулі для компонентів, які ви хочете включити до власного дистрибутиву колектора. Дивіться [документацію з налаштування `ocb`](https://github.com/open-telemetry/opentelemetry-collector/tree/main/cmd/builder#configuration) щоб зрозуміти як працюють різні модулі та як додавати компоненти.

   Додамо наступні компоненти до нашого дистрибутиву колектора:
   - Експортери: OTLP та Debug
   - Приймачі: OTLP
   - Процесори: Batch

   Файл маніфесту `builder-config.yaml` має виглядатиме так:

   ```yaml
   dist:
     name: otelcol-dev
     description: Basic OTel Collector distribution for Developers
     output_path: ./otelcol-dev

   exporters:
     - gomod: go.opentelemetry.io/collector/exporter/debugexporter {{%
         version-from-registry collector-exporter-debug %}}
     - gomod: go.opentelemetry.io/collector/exporter/otlpexporter {{%
         version-from-registry collector-exporter-otlp %}}

   processors:
     - gomod: go.opentelemetry.io/collector/processor/batchprocessor {{%
         version-from-registry collector-processor-batch %}}

   receivers:
     - gomod: go.opentelemetry.io/collector/receiver/otlpreceiver {{%
         version-from-registry collector-receiver-otlp %}}

   providers:
     - gomod:
         go.opentelemetry.io/collector/confmap/provider/envprovider {{% param
         providers-vers %}}
     - gomod:
         go.opentelemetry.io/collector/confmap/provider/fileprovider {{% param
         providers-vers %}}
     - gomod:
         go.opentelemetry.io/collector/confmap/provider/httpprovider {{% param
         providers-vers %}}
     - gomod:
         go.opentelemetry.io/collector/confmap/provider/httpsprovider {{% param
         providers-vers %}}
     - gomod:
         go.opentelemetry.io/collector/confmap/provider/yamlprovider {{% param
         providers-vers %}}
   ```

> [!TIP]
>
> Для списку компонентів, які ви можете додати до вашого власного колектора, дивіться [Реєстр OpenTelemetry](/ecosystem/registry/?language=collector). Записи реєстру надають повне імʼя та версію, які вам потрібно додати до вашого `builder-config.yaml`.

## Згенеруйте код та створіть свій дистрибутив колектора {#generate-the-code-and-build-your-collector-distribution}

> [!NOTE]
>
> Цей розділ надає інструкції, які допоможуть зібрати ваш власний дистрибутив колектора за допомогою двійкового файлу `ocb`. Якщо ви бажаєте зібрати і розгорнути ваш власний дистрибутив колектора у середовищі оркестрування контейнерів такому як Kubernetes — пропустіть цей розділ та перейдіть до розділу [Контейнеризуйте дистрибутив вашого колектора](#containerize-your-collector-distribution).

Зі встановленим та налаштованим `ocb` ви тепер готові створити свій дистрибутив.

```sh
./ocb --config builder-config.yaml
```

Вивід виглядатиме схожим на це :

```text
2025-06-13T14:25:03.037-0500	INFO	internal/command.go:85	OpenTelemetry Collector distribution builder	{"version": "{{% version-from-registry collector-builder noPrefix %}}", "date": "2025-06-03T15:05:37Z"}
2025-06-13T14:25:03.039-0500	INFO	internal/command.go:108	Using config file	{"path": "builder-config.yaml"}
2025-06-13T14:25:03.040-0500	INFO	builder/config.go:99	Using go	{"go-executable": "/usr/local/go/bin/go"}
2025-06-13T14:25:03.041-0500	INFO	builder/main.go:76	Sources created	{"path": "./otelcol-dev"}
2025-06-13T14:25:03.445-0500	INFO	builder/main.go:108	Getting go modules
2025-06-13T14:25:04.675-0500	INFO	builder/main.go:87	Compiling
2025-06-13T14:25:17.259-0500	INFO	builder/main.go:94	Compiled	{"binary": "./otelcol-dev/otelcol-dev"}
```

Як визначено в розділі `dist` вашого маніфесту, тепер у вас є тека з назвою `otelcol-dev`, що містить весь вихідний код та бінарний файл для вашого дистрибутиву Колектора.

Структура теки виглядає так:

```text
.
├── builder-config.yaml
├── ocb
└── otelcol-dev
    ├── components.go
    ├── components_test.go
    ├── go.mod
    ├── go.sum
    ├── main.go
    ├── main_others.go
    ├── main_windows.go
    └── otelcol-dev
```

Ви можете використовувати згенерований код для створення проєктів розробки компонентів та створювати і розповсюджувати власний дистрибутив колектора з вашими компонентами.

## Контейнеризуйте дистрибутив вашого колектора {#containerize-your-collector-distribution}

> [!NOTE]
>
> Цей розділ розповідає як створити дистрибутив колектора у `Dockerfile`. Слідуйте цим інструкціям, якщо вам потрібно розгорнути дистрибутив колектора в системі оркестрування контейнерів такій як Kubernetes. Якщо ви бажаєте лише зібрати дистрибутив колекторів без контейнеризації, дивіться розділ [Згенеруйте код та створіть свій дистрибутив колектора](#generate-the-code-and-build-your-collector-distribution).

Виконайте наступні кроки для контейнеризації вашого колектора:

1. Додайте два нових фали до вашого проєкту:
   - `Dockerfile` — визначення образу контейнера вашого дистрибутиву Collector
   - `collector-config.yaml` — Мінімалістична конфігурація колектора YAML для тестування нашого дистрибутиву

   Після додавання цих файлів ваша файлова структура матиме такий вигляд:

   ```text
   .
   ├── builder-config.yaml
   ├── collector-config.yaml
   └── Dockerfile
   ```

2. Додайте наступне до вашого `Dockerfile`. Це визначення збирає ваш дистрибутив Collector на місці, гарантуючи, що отриманий дистрибутив Collector відповідає цільовій архітектурі контейнера (наприклад, `linux/arm64`, `linux/amd64`):

   ```dockerfile
   FROM alpine:3.19 AS certs
   RUN apk --update add ca-certificates

   FROM golang:1.25.0 AS build-stage
   WORKDIR /build

   COPY ./builder-config.yaml builder-config.yaml

   RUN --mount=type=cache,target=/root/.cache/go-build GO111MODULE=on go install go.opentelemetry.io/collector/cmd/builder@{{% version-from-registry collector-builder %}}
   RUN --mount=type=cache,target=/root/.cache/go-build builder --config builder-config.yaml

   FROM gcr.io/distroless/base:latest

   ARG USER_UID=10001
   USER ${USER_UID}

   COPY ./collector-config.yaml /otelcol/collector-config.yaml
   COPY --from=certs /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/ca-certificates.crt
   COPY --chmod=755 --from=build-stage /build/otelcol-dev /otelcol

   ENTRYPOINT ["/otelcol/otelcol-dev"]
   CMD ["--config", "/otelcol/collector-config.yaml"]

   EXPOSE 4317 4318 12001
   ```

3. Додайте наступні визначення до `collector-config.yaml`:

   ```yaml
   receivers:
     otlp:
       protocols:
         grpc:
           endpoint: 0.0.0.0:4317
         http:
           endpoint: 0.0.0.0:4318

   exporters:
     debug:
       verbosity: detailed

   service:
     pipelines:
       traces:
         receivers: [otlp]
         exporters: [debug]
       metrics:
         receivers: [otlp]
         exporters: [debug]
       logs:
         receivers: [otlp]
         exporters: [debug]
   ```

4. Скористайтеся наведеними нижче командами для створення багатоархітектурного Docker-образу `ocb` з використанням `linux/amd64` і `linux/arm64` як цільових архітектур збірки. Щоб дізнатися більше, перегляньте цей [допис у блозі](https://blog.jaimyn.dev/how-to-build-multi-architecture-docker-images-on-an-m1-mac/) про багатоархітектурні збірки.

   ```sh
   # Увімкнення багатоархітектурних збірок Docker
   docker run --rm --privileged tonistiigi/binfmt --install all
   docker buildx create --name mybuilder --use

   # Зібрка Docker-образу як Linux AMD та ARM,
   # і завантажує результат збірки до "docker images".
   docker buildx build --load \
     -t <collector_distribution_image_name>:<version> \
     --platform=linux/amd64,linux/arm64 .

   # Тестування створеного образу
   docker run -it --rm -p 4317:4317 -p 4318:4318 \
       --name otelcol <collector_distribution_image_name>:<version>
   ```

## Для подальшого ознайомлення {#further-reading}

- [Створення приймача](/docs/collector/extend/custom-component/receiver)
- [Створення конектора](/docs/collector/extend/custom-component/connector)

[ocb]: https://github.com/open-telemetry/opentelemetry-collector/tree/main/cmd/builder
[tags]: https://github.com/open-telemetry/opentelemetry-collector-releases/tags
