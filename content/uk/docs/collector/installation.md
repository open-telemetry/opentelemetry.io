---
title: Встановлення Колектора
weight: 2
default_lang_commit: e05fefe6c9f7d8b159d9a9a95128098c646c78c4
cSpell:ignore: darwin dpkg journalctl kubectl otelcorecol pprof tlsv zpages
---

Ви можете розгорнути OpenTelemetry Collector в різних операційних системах та архітектурах. Наступні інструкції показують, як завантажити та встановити останню стабільну версію Колектора.

Якщо ви не знайомі з моделями розгортання, компонентами та репозиторіями, що застосовуються до OpenTelemetry Collector, спочатку перегляньте сторінки [Збір даних][] та [Методи розгортання][].

## Docker

Наступні команди завантажують образ Docker і запускають Колектор у контейнері. Замініть `{{% param vers %}}` на версію Колектора, яку ви хочете запустити.

{{< tabpane text=true >}} {{% tab DockerHub %}}

```sh
docker pull otel/opentelemetry-collector-contrib:{{% param vers %}}
docker run otel/opentelemetry-collector-contrib:{{% param vers %}}
```

{{% /tab %}} {{% tab ghcr.io %}}

```sh
docker pull ghcr.io/open-telemetry/opentelemetry-collector-releases/opentelemetry-collector-contrib:{{% param vers %}}
docker run ghcr.io/open-telemetry/opentelemetry-collector-releases/opentelemetry-collector-contrib:{{% param vers %}}
```

{{% /tab %}} {{< /tabpane >}}

Щоб завантажити власний файл конфігурації з вашої робочої теки, змонтуйте цей файл як том:

{{< tabpane text=true >}} {{% tab DockerHub %}}

```sh
docker run -v $(pwd)/config.yaml:/etc/otelcol-contrib/config.yaml otel/opentelemetry-collector-contrib:{{% param vers %}}
```

{{% /tab %}} {{% tab ghcr.io %}}

```sh
docker run -v $(pwd)/config.yaml:/etc/otelcol-contrib/config.yaml ghcr.io/open-telemetry/opentelemetry-collector-releases/opentelemetry-collector-contrib:{{% param vers %}}
```

{{% /tab %}} {{< /tabpane >}}

## Docker Compose

Ви можете додати OpenTelemetry Collector до вашого наявного файлу `docker-compose.yaml`, як у наступному прикладі:

```yaml
otel-collector:
  image: otel/opentelemetry-collector-contrib
  volumes:
    - ./otel-collector-config.yaml:/etc/otelcol-contrib/config.yaml
  ports:
    - 1888:1888 # розширення pprof
    - 8888:8888 # метрики Prometheus, які експортує Колектор
    - 8889:8889 # метрики експортера Prometheus
    - 13133:13133 # розширення health_check
    - 4317:4317 # OTLP gRPC приймач
    - 4318:4318 # OTLP http приймач
    - 55679:55679 # розширення zpages
```

## Kubernetes

Наступна команда розгортає агента як daemonset і один екземпляр шлюзу:

```sh
kubectl apply -f https://raw.githubusercontent.com/open-telemetry/opentelemetry-collector/v{{% param vers %}}/examples/k8s/otel-config.yaml
```

Попередній приклад призначений для використання як відправної точки, яку слід розширити та налаштувати перед фактичним використанням в операційній експлуатації. Для налаштування та встановлення, готових до експлуатації екземплярів, дивіться [OpenTelemetry Helm Charts][].

Ви також можете використовувати [OpenTelemetry Operator][] для забезпечення та підтримки екземпляра OpenTelemetry Collector з такими функціями, як автоматичне оновлення, налаштування `Service` на основі конфігурації OpenTelemetry, автоматичне впровадження sidecar у розгортання та інше.

Для отримання інструкцій щодо використання Колектора з Kubernetes дивіться [Kubernetes Getting Started](/docs/platforms/kubernetes/getting-started/).

## Nomad

Ви можете знайти референсні файли завдань для розгортання Колектора як агента, шлюзу та повної демонстрації у [Getting Started with OpenTelemetry on HashiCorp Nomad][].

## Linux

Кожен випуск Колектора включає пакунки APK, DEB та RPM для систем Linux amd64/arm64/i386. Ви можете знайти стандартну конфігурацію у `/etc/otelcol/config.yaml` після встановлення.

> Примітка: `systemd` потрібен для автоматичної конфігурації сервісу.

### Встановлення DEB {#deb-installation}

Щоб почати роботу в системах Debian, виконайте наступні команди:

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

Щоб почати роботу в системах Red Hat, виконайте наступні команди:

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

### Ручне встановлення в Linux {#manual-linux-installation}

[Випуски][] для Linux доступні для різних архітектур. Ви можете завантажити файл, що містить бінарний файл, і встановити його на свій компʼютер вручну:

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

### Автоматична конфігурація сервісу {#automatic-service-configuration}

Стандартно, сервіс `otelcol` systemd запускається з опцією `--config=/etc/otelcol/config.yaml` після встановлення.

Щоб використовувати інші налаштування, встановіть змінну `OTELCOL_OPTIONS` у системному середовищі файлу `/etc/otelcol/otelcol.conf` на відповідні параметри командного рядка. Ви можете запустити `/usr/bin/otelcol --help`, щоб побачити всі доступні параметри. Ви можете передати додаткові змінні середовища до сервісу `otelcol`, додавши їх до цього файлу.

Якщо ви зміните файл конфігурації Колектора або `/etc/otelcol/otelcol.conf`, перезапустіть сервіс `otelcol`, щоб застосувати зміни, виконавши:

```sh
sudo systemctl restart otelcol
```

Щоб перевірити вихідні дані сервісу `otelcol`, виконайте:

```sh
sudo journalctl -u otelcol
```

## macOS

[Випуски][] для macOS доступні для систем Intel та ARM. Випуски упаковані у вигляді архівів tarball (`.tar.gz`). Щоб розпакувати їх, виконайте наступні команди:

{{< tabpane text=true >}} {{% tab Intel %}}

```sh
curl --proto '=https' --tlsv1.2 -fOL https://github.com/open-telemetry/opentelemetry-collector-releases/releases/download/v{{% param vers %}}/otelcol_{{% param vers %}}_darwin_amd64.tar.gz
tar -xvf otelcol_{{% param vers %}}_darwin_amd64.tar.gz
```

{{% /tab %}} {{% tab ARM %}}

```sh
curl --proto '=https' --tlsv1.2 -fOL https://github.com/open-telemetry/opentelemetry-collector-releases/releases/download/v{{% param vers %}}/otelcol_{{% param vers %}}_darwin_arm64.tar.gz
tar -xvf otelcol_{{% param vers %}}_darwin_arm64.tar.gz
```

{{% /tab %}} {{< /tabpane >}}

Кожен випуск Колектора включає виконуваний файл `otelcol`, який ви можете запустити після розпакування.

## Windows

[Випуски][] для Windows упаковані у вигляді архівів tarball (`.tar.gz`). Кожен випуск Колектора включає виконуваний файл `otelcol.exe`, який ви можете запустити після розпакування.

## Збирання з сирців {#building-from-source}

Ви можете зібрати останню версію Колектора на основі локальної операційної системи, використовуючи наступні команди:

```sh
git clone https://github.com/open-telemetry/opentelemetry-collector.git
cd opentelemetry-collector
make install-tools
make otelcorecol
```

[збір даних]: /docs/concepts/components/#collector
[методи розгортання]: ../deployment/
[opentelemetry helm charts]: /docs/platforms/kubernetes/helm/
[opentelemetry operator]: /docs/platforms/kubernetes/operator/
[getting started with opentelemetry on hashicorp nomad]: https://github.com/hashicorp/nomad-open-telemetry-getting-started
[випуски]: https://github.com/open-telemetry/opentelemetry-collector-releases/releases
