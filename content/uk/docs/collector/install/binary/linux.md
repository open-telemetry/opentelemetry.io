---
title: Встановлення Collector в Linux
linkTitle: Linux
weight: 100
default_lang_commit: 9cdf79c9345a05fb82d0e67132c9f68dabddadba
---

## Linux

Кожен випуск Collector включає пакунки APK, DEB та RPM для систем Linux amd64/arm64/i386. Після встановлення ви можете знайти стандартну конфігурацію у файлі `/etc/otelcol/config.yaml`.

> Примітка: для автоматичної конфігурації служби необхідний `systemd`.

### Встановлення DEB {#deb-installation}

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

### Встановлення RPM {#rpm-installation}

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

### Встановлення вручну в Linux {#manual-linux-installation}

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

### Автоматична конфігурація служби {#automatic-service-configuration}

Стандартно служба systemd `otelcol` запускається з опцією `--config=/etc/otelcol/config.yaml` після встановлення.

Щоб використовувати інші налаштування, встановіть змінну середовища `OTELCOL_OPTIONS` для systemd `/etc/otelcol/otelcol.conf` у відповідному параметрі командного рядка. Ви можете запустити `/usr/bin/otelcol --help`, щоб переглянути всі доступні параметри. Ви можете передати додаткові змінні середовища до служби `otelcol`, додавши їх до цього файлу.

Якщо ви змінюєте файл конфігурації Collector або `/etc/otelcol/otelcol.conf`, перезапустіть службу `otelcol`, щоб застосувати зміни, виконавши:

```sh
sudo systemctl restart otelcol
```

Щоб перевірити вихідні дані служби `otelcol`, виконайте:

```sh
sudo journalctl -u otelcol
```

[releases]: https://github.com/open-telemetry/opentelemetry-collector-releases/releases
