---
title: Встановлення Collector в Linux
linkTitle: Linux
weight: 100
default_lang_commit: 5489ba34bff91356aa2c501cd55f07eeb30cc355
---

Кожен випуск Collector включає пакунки APK, DEB та RPM для систем Linux amd64/arm64/i386. Після встановлення ви можете знайти стандартну конфігурацію у файлі `/etc/otelcol/config.yaml`.

> Примітка: для автоматичної конфігурації служби необхідний `systemd`.

## Встановлення DEB {#deb-installation}

Щоб розпочати роботу в системах Debian, виконайте наступні команди:

{{< tabpane text=true >}} {{% tab AMD64 %}}

```sh
sudo apt-get update
sudo apt-get -y install wget
wget https://github.com/open-telemetry/opentelemetry-collector-releases/releases/download/v{{% param vers %}}/otelcol_{{% param vers %}}_linux_amd64.deb
sudo dpkg -i otelcol_{{% param vers %}}_linux_amd64.deb
```

{{% /tab %}} {{% tab ARM64 %}}

```sh
sudo apt-get update
sudo apt-get -y install wget
wget https://github.com/open-telemetry/opentelemetry-collector-releases/releases/download/v{{% param vers %}}/otelcol_{{% param vers %}}_linux_arm64.deb
sudo dpkg -i otelcol_{{% param vers %}}_linux_arm64.deb
```

{{% /tab %}} {{% tab i386 %}}

```sh
sudo apt-get update
sudo apt-get -y install wget
wget https://github.com/open-telemetry/opentelemetry-collector-releases/releases/download/v{{% param vers %}}/otelcol_{{% param vers %}}_linux_386.deb
sudo dpkg -i otelcol_{{% param vers %}}_linux_386.deb
```

{{% /tab %}} {{< /tabpane >}}

## Встановлення RPM {#rpm-installation}

Щоб розпочати роботу в системах Red Hat, виконайте наступні команди:

{{< tabpane text=true >}} {{% tab AMD64 %}}

```sh
sudo yum update
sudo yum -y install wget systemctl
wget https://github.com/open-telemetry/opentelemetry-collector-releases/releases/download/v{{% param vers %}}/otelcol_{{% param vers %}}_linux_amd64.rpm
sudo rpm -ivh otelcol_{{% param vers %}}_linux_amd64.rpm
```

{{% /tab %}} {{% tab ARM64 %}}

```sh
sudo yum update
sudo yum -y install wget systemctl
wget https://github.com/open-telemetry/opentelemetry-collector-releases/releases/download/v{{% param vers %}}/otelcol_{{% param vers %}}_linux_arm64.rpm
sudo rpm -ivh otelcol_{{% param vers %}}_linux_arm64.rpm
```

{{% /tab %}} {{% tab i386 %}}

```sh
sudo yum update
sudo yum -y install wget systemctl
wget https://github.com/open-telemetry/opentelemetry-collector-releases/releases/download/v{{% param vers %}}/otelcol_{{% param vers %}}_linux_386.rpm
sudo rpm -ivh otelcol_{{% param vers %}}_linux_386.rpm
```

{{% /tab %}} {{< /tabpane >}}

## Встановлення вручну {#manual-installation}

[Випуски Linux][releases] доступні для різних архітектур. Ви можете завантажити файл, що містить бінарний код, і встановити його на свій компʼютер вручну:

{{< tabpane text=true >}} {{% tab AMD64 %}}

```sh
curl --proto '=https' --tlsv1.2 -fOL https://github.com/open-telemetry/opentelemetry-collector-releases/releases/download/v{{% param vers %}}/otelcol_{{% param vers %}}_linux_amd64.tar.gz
tar -xvf otelcol_{{% param vers %}}_linux_amd64.tar.gz
```

{{% /tab %}} {{% tab ARM64 %}}

```sh
curl --proto '=https' --tlsv1.2 -fOL https://github.com/open-telemetry/opentelemetry-collector-releases/releases/download/v{{% param vers %}}/otelcol_{{% param vers %}}_linux_arm64.tar.gz
tar -xvf otelcol_{{% param vers %}}_linux_arm64.tar.gz
```

{{% /tab %}} {{% tab i386 %}}

```sh
curl --proto '=https' --tlsv1.2 -fOL https://github.com/open-telemetry/opentelemetry-collector-releases/releases/download/v{{% param vers %}}/otelcol_{{% param vers %}}_linux_386.tar.gz
tar -xvf otelcol_{{% param vers %}}_linux_386.tar.gz
```

{{% /tab %}} {{% tab ppc64le %}}

```sh
curl --proto '=https' --tlsv1.2 -fOL https://github.com/open-telemetry/opentelemetry-collector-releases/releases/download/v{{% param vers %}}/otelcol_{{% param vers %}}_linux_ppc64le.tar.gz
tar -xvf otelcol_{{% param vers %}}_linux_ppc64le.tar.gz
```

{{% /tab %}} {{< /tabpane >}}

## Автоматична конфігурація служби {#automatic-service-configuration}

Коли Стандартно OpenTelemetry Collector запущено як службу systemd, він запускається з опцією `--config=/etc/otelcol/config.yaml`, стандартним файлом налаштувань.

Якщо ви хочете змінити ці налаштування, вам треба змінити значення у змінній середовища `OTELCOL_OPTIONS` у файлі для `systemd` `/etc/otelcol/otelcol.conf`. Ви також можете визначити додаткові змінні середовища для `otelcol` в тому ж файлі. Для отримання повного переліку підтримуваних параметрів виконайте команду:

```sh
/usr/bin/otelcol --help
```

Якщо ви змінюєте файл конфігурації Collector (`config.yaml`) або файл зі змінними оточення (`otelcol.conf`), перезапустіть службу `otelcol`, вам треба перезапустити службу для застосування змін:

```sh
sudo systemctl restart otelcol
```

Щоб перевірити лог служби `otelcol`, виконайте:

```sh
sudo journalctl -u otelcol
```

[releases]: https://github.com/open-telemetry/opentelemetry-collector-releases/releases
