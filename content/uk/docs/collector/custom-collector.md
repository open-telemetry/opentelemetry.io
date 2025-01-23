---
title: Створення власного колектора
weight: 29
# prettier-ignore
cSpell:ignore: batchprocessor chipset darwin debugexporter gomod loggingexporter otlpexporter otlpreceiver wyrtw
---

Якщо ви плануєте створювати та налагоджувати власні приймачі, процесори, розширення або експортери колектора, вам знадобиться власний екземпляр Колектора. Це дозволить вам запускати та налагоджувати компоненти OpenTelemetry Collector безпосередньо у вашому улюбленому IDE для Golang.

Інший цікавий аспект підходу до розробки компонентів таким чином полягає в тому, що ви можете використовувати всі функції налагодження вашого IDE (стандартні трейси — чудові вчителі!), щоб зрозуміти, як сам Колектор взаємодіє з вашим кодом компонентів.

Спільнота OpenTelemetry розробила інструмент з назвою [OpenTelemetry Collector builder][ocb] (або `ocb` скорочено), щоб допомогти людям збирати власні дистрибутиви, що полегшує створення дистрибутиву, який включає їхні власні компоненти разом з компонентами, що є у відкритому доступі.

У рамках процесу `ocb` згенерує вихідний код Колектора, який ви можете використовувати для створення та налагодження власних компонентів, тож почнімо.

## Крок 1. Встановлення збирача {#step-1---install-the-builder}

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

{{% /tab %}} {{% tab "MacOS (AMD 64)" %}}

```sh
curl --proto '=https' --tlsv1.2 -fL -o ocb \
https://github.com/open-telemetry/opentelemetry-collector-releases/releases/download/cmd%2Fbuilder%2F{{% version-from-registry collector-builder %}}/ocb_{{% version-from-registry collector-builder noPrefix %}}_darwin_amd64
chmod +x ocb
```

{{% /tab %}} {{% tab "MacOS (ARM 64)" %}}

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

| Теґ              | Опис                                                                                               | Необовʼязковий | Стандартне значення                                                                  |
| ---------------- | -------------------------------------------------------------------------------------------------- | -------------- | ------------------------------------------------------------------------------------ |
| module:          | Імʼя модуля для нового дистрибутиву, відповідно до домовленостей Go mod. Необовʼязковий, але рекомендований. | Так           | `go.opentelemetry.io/collector/cmd/builder`                                          |
| name:            | Імʼя бінарного файлу для вашого дистрибутиву                                                       | Так           | `otelcol-custom`                                                                     |
| description:     | Довге імʼя застосунку.                                                                             | Так           | `Custom OpenTelemetry Collector distribution`                                        |
| otelcol_version: | Версія OpenTelemetry Collector, яку слід використовувати як основу для дистрибутиву.               | Так           | `{{% version-from-registry collector-builder noPrefix %}}`                           |
| output_path:     | Шлях для запису вихідних даних (вихідні коди та бінарний файл).                                    | Так           | `/var/folders/86/s7l1czb16g124tng0d7wyrtw0000gn/T/otelcol-distribution3618633831`    |
| version:         | Версія вашого власного OpenTelemetry Collector.                                                    | Так           | `1.0.0`                                                                              |
| go:              | Який бінарний файл Go використовувати для компіляції згенерованих вихідних кодів.                  | Так           | go з PATH                                                                            |

Як ви бачите в таблиці вище, всі теги `dist` є необовʼязковими, тому ви будете додавати власні значення для них залежно від того, чи маєте намір зробити ваш власний дистрибутив Колектора доступним для використання іншими користувачами, чи просто використовуєте `ocb` для створення середовища розробки та тестування ваших компонентів.

Для цього підручника ви створюватимете дистрибутив Колектора для підтримки розробки та тестування компонентів.

Створіть файл маніфесту під назвою `builder-config.yaml` з наступним вмістом:

```yaml
dist:
  name: otelcol-dev
  description: Basic OTel Collector distribution for Developers
  output_path: ./otelcol-dev
```

Тепер вам потрібно додати модулі, що представляють компоненти, які ви хочете включити до цього власного дистрибутиву Колектора. Ознайомтеся з [документацією з налаштування ocb](https://github.com/open-telemetry/opentelemetry-collector/tree/main/cmd/builder#configuration), щоб зрозуміти різні модулі та як додати компоненти.

Ми додамо наступні компоненти до нашого дистрибутиву колектора для розробки та тестування:

- Експортери: OTLP та Debug[^1]
- Приймачі: OTLP
- Процесори: Batch

Файл маніфесту `builder-config.yaml` виглядатиме так після додавання компонентів:

<!-- prettier-ignore -->
```yaml
dist:
  name: otelcol-dev
  description: Basic OTel Collector distribution for Developers
  output_path: ./otelcol-dev
  otelcol_version: {{% version-from-registry collector-builder noPrefix %}}

exporters:
  - gomod:
      # NOTE: Prior to v0.86.0 use the `loggingexporter` instead of `debugexporter`.
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

## Крок 3. Генерація коду та створення дистрибутиву вашого Колектора {#step-3---generating-the-code-and-building-your-collectors-distribution}

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

Для подальшого ознайомлення:

- [Створення приймача трасування](/docs/collector/building/receiver)
- [Створення конектора](/docs/collector/building/connector)

[ocb]:
  https://github.com/open-telemetry/opentelemetry-collector/tree/main/cmd/builder
[tags]: https://github.com/open-telemetry/opentelemetry-collector-releases/tags

[^1]: До версії v0.86.0 використовуйте `loggingexporter` замість `debugexporter`.
