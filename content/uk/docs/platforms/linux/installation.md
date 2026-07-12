---
title: Встановлення
weight: 10
description: Додайте репозиторій пакунків OpenTelemetry та встановіть системні пакунки в Debian, Ubuntu, Fedora, або RHEL та похідні дистрибутиви.
cSpell:ignore: metapackage метапакунка
default_lang_commit: edb244ceebdcbbb33c640eaac8d218dbc480e4c0
---

Системні пакунки OpenTelemetry публікуються в APT репозиторії для Debian-подібних дистрибутивів та YUM репозиторії для RPM-подібних дистрибутивів. Ця сторінка охоплює додавання репозиторію та встановлення метапакунка `opentelemetry`, що включає [OpenTelemetry Injector](https://github.com/open-telemetry/opentelemetry-injector) та автоінструментування для Java, .NET, Node.js та Python.

> [!WARNING]
>
> Ці пакунки перебувають на початковій стадії і ще не призначені для операційних навантажень. Репозиторії розміщені на GitHub Pages і пакунки ще не підписані, тому інструкції нижче вимикають перевірку підпису. Див. [Статус та обмеження](../#status-and-limitations).

## Debian, Ubuntu та похідні {#apt}

Додайте APT репозиторій та встановіть пакунок:

```sh
echo "deb [trusted=yes] https://open-telemetry.github.io/opentelemetry-packaging/debian stable main" |
  sudo tee /etc/apt/sources.list.d/opentelemetry.list
sudo apt update
sudo apt install opentelemetry
```

## Fedora, RHEL та похідні {#yum}

Додайте YUM репозиторій та встановіть пакунок:

```sh
cat <<EOF | sudo tee /etc/yum.repos.d/opentelemetry.repo
[opentelemetry]
name=OpenTelemetry Auto-Instrumentation System Packages
baseurl=https://open-telemetry.github.io/opentelemetry-packaging/rpm/packages
enabled=1
gpgcheck=0
EOF
sudo dnf install opentelemetry
```

## Перевірка встановлення {#verify-the-installation}

Перезапустіть застосунок, написаний на підтримуваній мові, або запустіть новий, і підтвердіть, що він надає телеметрію до вашого налаштованого призначення. Доки ви не [налаштували призначення](../configuration/), телеметрія відправляється через OTLP на `localhost` портах `4317` (gRPC) та `4318` (HTTP), тому вам потрібен [Collector](/docs/collector/) або інший OTLP приймач, що слухає там, щоб бачити дані.

## Встановлення окремих мов {#install-individual-languages}

Метапакунок `opentelemetry` встановлює інжектор разом з автоінструментуванням для всіх підтримуваних мов. Якщо вам потрібна лише підмножина, ви можете встановити мовно-специфічні пакунки самостійно:

- `opentelemetry-java`
- `opentelemetry-nodejs`
- `opentelemetry-dotnet`
- `opentelemetry-python`

## Наступні кроки {#next-steps}

- [Конфігурація](../configuration/): надсилайте телеметрію до вашого Collector або бекенду і керуйте тим, що інструментується.
