---
title: Створення власного колектора
weight: 29
default_lang_commit: 5b55172d51fb21f69c2f4fc9eb014f72a2b1c50a
cSpell:ignore: darwin debugexporter gomod otlpexporter otlpreceiver wyrtw
---

Якщо ви плануєте створювати та налагоджувати власні приймачі, процесори, розширення або експортери колектора, вам знадобиться власний екземпляр Колектора. Це дозволить вам запускати та налагоджувати компоненти OpenTelemetry Collector безпосередньо у вашому улюбленому IDE для Golang.

Інший цікавий аспект підходу до розробки компонентів таким чином полягає в тому, що ви можете використовувати всі функції налагодження вашого IDE (стандартні трейси — чудові вчителі!), щоб зрозуміти, як сам Колектор взаємодіє з вашим кодом компонентів.

Спільнота OpenTelemetry розробила інструмент з назвою [OpenTelemetry Collector builder][ocb] (або `ocb` скорочено), щоб допомогти людям збирати власні дистрибутиви, що полегшує створення дистрибутиву, який включає їхні власні компоненти разом з компонентами, що є у відкритому доступі.

У рамках процесу `ocb` згенерує вихідний код Колектора, який ви можете використовувати для створення та налагодження власних компонентів, тож почнімо.

## Крок 1. Встановлення збирача {#step-1---install-the-builder}

{{% alert color="primary" title="Примітка" %}}

Для збирання дистрибутиву колектора інструменту `ocb` потрібен Go. [Встановіть Go](https://go.dev/doc/install) на вашому компʼютері, якщо ви цього ще не зробили.

{{% /alert %}}

Бінарний файл `ocb` доступний як завантажуваний актив з [релізів OpenTelemetry Collector з теґами `cmd/builder`][tags]. Ви знайдете список активів, названих відповідно до ОС та чипсету, тому завантажте той, який підходить для вашої конфігурації:

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

Щоб переконатися, що `ocb` готовий до використання, перейдіть до вашого термінала та введіть `./ocb help`, і після натискання Enter ви повинні побачити вивід команди `help` у вашій консолі.

## Крок 2. Створення файлу маніфесту збирача {#step-2---create-a-builder-manifest-file}

Файл `manifest` збирача — це `yaml`, де ви передаєте інформацію про генерацію коду та процес компіляції разом з компонентами, які ви хочете додати до дистрибутиву вашого Колектора.

`manifest` починається з map з назвою `dist`, яка містить теґи для налаштування генерації коду та процесу компіляції. Насправді, всі теґи для `dist` еквівалентні командним прапорцям `ocb`.

Ось теґи для мапи `dist`:

| Теґ          | Опис                                                                                                         | Необовʼязковий | Стандартне значення                                                               |
| ------------ | ------------------------------------------------------------------------------------------------------------ | -------------- | --------------------------------------------------------------------------------- |
| module:      | Імʼя модуля для нового дистрибутиву, відповідно до домовленостей Go mod. Необовʼязковий, але рекомендований. | Так            | `go.opentelemetry.io/collector/cmd/builder`                                       |
| name:        | Імʼя бінарного файлу для вашого дистрибутиву                                                                 | Так            | `otelcol-custom`                                                                  |
| description: | Довге імʼя застосунку.                                                                                       | Так            | `Custom OpenTelemetry Collector distribution`                                     |
| output_path: | Шлях для запису вихідних даних (вихідні коди та бінарний файл).                                              | Так            | `/var/folders/86/s7l1czb16g124tng0d7wyrtw0000gn/T/otelcol-distribution3618633831` |
| version:     | Версія вашого власного OpenTelemetry Collector.                                                              | Так            | `1.0.0`                                                                           |
| go:          | Який бінарний файл Go використовувати для компіляції згенерованих вихідних кодів.                            | Так            | go з PATH                                                                         |

Як ви бачите в таблиці вище, всі теґи `dist` є необовʼязковими, тому ви будете додавати власні значення для них залежно від того, чи маєте намір зробити ваш власний дистрибутив Колектора доступним для використання іншими користувачами, чи просто використовуєте `ocb` для створення середовища розробки та тестування ваших компонентів.

В цьому керівництві ви створюватимете дистрибутив Колектора для підтримки розробки та тестування компонентів.

Створіть файл маніфесту з назвою `builder-config.yaml` з наступним вмістом:

```yaml
dist:
  name: otelcol-dev
  description: Basic OTel Collector distribution for Developers
  output_path: ./otelcol-dev
```

Тепер вам потрібно додати модулі, що представляють компоненти, які ви хочете включити до цього власного дистрибутиву Колектора. Ознайомтеся з [документацією з налаштування ocb](https://github.com/open-telemetry/opentelemetry-collector/tree/main/cmd/builder#configuration), щоб зрозуміти різні модулі та як додати компоненти.

Ми додамо наступні компоненти до нашого дистрибутиву колектора для розробки та тестування:

- Експортери: OTLP та Debug
- Приймачі: OTLP
- Процесори: Batch

Файл маніфесту `builder-config.yaml` виглядатиме так після додавання компонентів:

<!-- prettier-ignore -->
```yaml
dist:
  name: otelcol-dev
  description: Basic OTel Collector distribution for Developers
  output_path: ./otelcol-dev

exporters:
  - gomod:
      go.opentelemetry.io/collector/exporter/debugexporter {{% version-from-registry collector-exporter-debug %}}
  - gomod:
      go.opentelemetry.io/collector/exporter/otlpexporter {{% version-from-registry collector-exporter-otlp %}}

processors:
  - gomod:
      go.opentelemetry.io/collector/processor/batchprocessor {{% version-from-registry collector-processor-batch %}}

receivers:
  - gomod:
      go.opentelemetry.io/collector/receiver/otlpreceiver {{% version-from-registry collector-receiver-otlp %}}

providers:
  - gomod: go.opentelemetry.io/collector/confmap/provider/envprovider v1.18.0
  - gomod: go.opentelemetry.io/collector/confmap/provider/fileprovider v1.18.0
  - gomod: go.opentelemetry.io/collector/confmap/provider/httpprovider v1.18.0
  - gomod: go.opentelemetry.io/collector/confmap/provider/httpsprovider v1.18.0
  - gomod: go.opentelemetry.io/collector/confmap/provider/yamlprovider v1.18.0
```

{{% alert color="primary" title="Порада" %}}

Для списку компонентів, які ви можете додати до вашого власного колектора, дивіться [Реєстр OpenTelemetry](/ecosystem/registry/?language=collector). Зверніть увагу, що записи реєстру надають повне імʼя та версію, які вам потрібно додати до вашого `builder-config.yaml`.

{{% /alert %}}

## Крок 3a. Створення коду та збірка дистрибутиву колектора {#step-3a---generate-the-code-and-build-your-collectors-distribution}

{{% alert color="primary" title="Примітка" %}}

На цьому кроці буде зібрано ваш власний дистрибутив колектора за допомогою двійкового файлу `ocb`. Якщо ви бажаєте зібрати і розгорнути ваш власний дистрибутив колекторів у середовищі оркестрування контейнерів (наприклад, Kubernetes), пропустіть цей крок і перейдіть до [Кроку 3b](#step-3b---containerize-your-collectors-distribution).

{{% /alert %}}

Все, що вам потрібно зараз, це дозволити `ocb` виконати свою роботу, тому перейдіть до вашого термінала та введіть наступну команду:

```cmd
./ocb --config builder-config.yaml
```

Якщо все пройшло добре, ось як виглядатиме вивід команди:

```nocode
2022-06-13T14:25:03.037-0500	INFO	internal/command.go:85	OpenTelemetry Collector distribution builder	{"version": "{{% version-from-registry collector-builder noPrefix %}}", "date": "2023-01-03T15:05:37Z"}
2022-06-13T14:25:03.039-0500	INFO	internal/command.go:108	Using config file	{"path": "builder-config.yaml"}
2022-06-13T14:25:03.040-0500	INFO	builder/config.go:99	Using go	{"go-executable": "/usr/local/go/bin/go"}
2022-06-13T14:25:03.041-0500	INFO	builder/main.go:76	Sources created	{"path": "./otelcol-dev"}
2022-06-13T14:25:03.445-0500	INFO	builder/main.go:108	Getting go modules
2022-06-13T14:25:04.675-0500	INFO	builder/main.go:87	Compiling
2022-06-13T14:25:17.259-0500	INFO	builder/main.go:94	Compiled	{"binary": "./otelcol-dev/otelcol-dev"}
```

Як визначено в розділі `dist` вашого конфігураційного файлу, тепер у вас є тека з назвою `otelcol-dev`, що містить весь вихідний код та бінарний файл для вашого дистрибутиву Колектора.

Структура теки повинна виглядати так:

```console
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

Тепер ви можете використовувати згенерований код для створення проєктів розробки компонентів та легко створювати та розповсюджувати власний дистрибутив колектора з вашими компонентами.

## Крок 3b. Контейнеризуйте дистрибутив вашого колектора {#step-3b---containerize-your-collectors-distribution}

{{% alert color="primary" title="Примітка" %}}

На цьому кроці дистрибутив колектора буде створено у `Docker-файлі`. Виконайте цей крок, якщо вам потрібно розгорнути дистрибутив колектора до оркестрування контейнерів (наприклад, Kubernetes). Якщо ви бажаєте лише зібрати дистрибутив колекторів без контейнеризації, перейдіть до [Кроку 3a](#step-3a---generate-the-code-and-build-your-collectors-distribution).

{{% /alert %}}

Вам потрібно додати два нових файли до вашого проєкту:

- `Dockerfile` — визначення образу контейнера вашого дистрибутиву Collector
- `collector-config.yaml` — Мінімалістична конфігурація колектора YAML для тестування нашого дистрибутиву

Після додавання цих файлів ваша файлова структура матиме такий вигляд:

```console
.
├── builder-config.yaml
├── collector-config.yaml
└── Dockerfile
```

Наступний `Dockerfile` збирає ваш дистрибутив Collector на місці, гарантуючи, що отриманий двійковий дистрибутив Collector відповідає цільовій архітектурі контейнера (наприклад, `linux/arm64`, `linux/amd64`):

<!-- prettier-ignore-start -->
```yaml
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
<!-- prettier-ignore-end -->

Нижче наведено мінімалістичне визначення `collector-config.yaml`:

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

Скористайтеся наведеними нижче командами для створення багатоархітектурного Docker-образу OCB з використанням `linux/amd64` і `linux/arm64` як цільових архітектур збірки. Щоб дізнатися більше, перегляньте цей [допис у блозі](https://blog.jaimyn.dev/how-to-build-multi-architecture-docker-images-on-an-m1-mac/) про багатоархітектурні збірки.

```bash
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

- [Створення приймача трасування](/docs/collector/building/receiver)
- [Створення конектора](/docs/collector/building/connector)

[ocb]: https://github.com/open-telemetry/opentelemetry-collector/tree/main/cmd/builder
[tags]: https://github.com/open-telemetry/opentelemetry-collector-releases/tags
