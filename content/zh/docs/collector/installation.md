---
title: 安装 Collector
weight: 2
default_lang_commit: 5fdcac03a4be4f063089a72a82348ec90cce9874
drifted_from_default: true
cSpell:ignore: darwin dpkg journalctl kubectl otelcorecol pprof tlsv zpages
---

你可以在多种操作系统和多种架构上部署 OpenTelemetry Collector。
以下说明展示了如何下载并安装 Collector 的最新稳定版本。

如果你还不熟悉 OpenTelemetry Collector 的部署模型、组件和相关代码库，
请先查阅[数据收集][Data Collection]和[部署方法][Deployment Methods]页面。

## Docker

以下命令会拉取一个 Docker 镜像，并在容器中运行 Collector。
将 `{{% param vers %}}` 替换为你想要运行的 Collector 版本。

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

要从你的工作目录加载一个自定义配置文件，将该文件挂载为卷：

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

你可以像以下示例那样，将 OpenTelemetry Collector 添加到你现有的 `docker-compose.yaml` 文件中：

```yaml
otel-collector:
  image: otel/opentelemetry-collector-contrib
  volumes:
    - ./otel-collector-config.yaml:/etc/otelcol-contrib/config.yaml
  ports:
    - 1888:1888 # pprof 扩展
    - 8888:8888 # Collector 暴露的 Prometheus 指标
    - 8889:8889 # Prometheus 导出器指标
    - 13133:13133 # health_check 扩展
    - 4317:4317 # OTLP gRPC 接收器
    - 4318:4318 # OTLP HTTP 接收器
    - 55679:55679 # zpages 扩展
```

## Kubernetes

以下命令将部署一个以 DaemonSet 形式运行的代理和一个网关实例：

```sh
kubectl apply -f https://raw.githubusercontent.com/open-telemetry/opentelemetry-collector/v{{% param vers %}}/examples/k8s/otel-config.yaml
```

上述示例旨在作为起点，在实际生产使用前需要进行扩展和定制。
有关生产环境的定制和安装，请参阅 [OpenTelemetry Helm Chart][OpenTelemetry Helm Charts]。

你也可以使用 [OpenTelemetry Operator][] 来配置和维护一个 OpenTelemetry Collector 实例，
其功能包括自动升级处理、基于 OpenTelemetry 配置的 `Service` 配置、自动将边车注入 Deployment 等。

有关如何在 Kubernetes 中使用 Collector 的指南，请参阅
[Kubernetes 入门指南](/docs/platforms/kubernetes/getting-started/)。

## Nomad

你可以[在 HashiCorp Nomad 上开始使用 OpenTelemetry][Getting Started with OpenTelemetry on HashiCorp Nomad]中找到将
Collector 作为代理、网关以及完整演示部署的参考作业文件。

## Linux

每个 Collector 发布版本都包含适用于 Linux amd64/arm64/i386 系统的 APK、DEB 和
RPM 安装包。安装后你可以在 `/etc/otelcol/config.yaml` 中找到默认配置。

> 注意：需要 `systemd` 才能进行自动服务配置。

### DEB 安装 {#deb-installation}

要在 Debian 系统上开始使用，请运行以下命令：

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

### RPM 安装 {#rpm-installation}

要在 Red Hat 系统上开始使用，请运行以下命令：

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

### Linux 手动安装 {#manual-linux-installation}

Linux [版本][releases]提供了多种架构版本供下载。你可以下载包含可执行文件的压缩包并手动安装：

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

### 自动服务配置 {#automatic-service-configuration}

默认情况下，`otelcol` systemd 服务在安装后会以 `--config=/etc/otelcol/config.yaml` 选项启动。

要使用不同的设置，请在 `/etc/otelcol/otelcol.conf` systemd 环境文件中设置 `OTELCOL_OPTIONS`
变量为相应的命令行选项。你可以运行 `/usr/bin/otelcol --help` 来查看所有可用选项。
你还可以通过将其他环境变量添加到该文件中来传递给 `otelcol` 服务。

如果你修改了 Collector 的配置文件或 `/etc/otelcol/otelcol.conf`，请通过以下命令重启 `otelcol` 服务以应用更改：

```sh
sudo systemctl restart otelcol
```

要查看 `otelcol` 服务的输出，请运行：

```sh
sudo journalctl -u otelcol
```

## macOS

macOS [发布版本][releases] 适用于 Intel 和 ARM 系统。发布包为
gzip 压缩的 tarball（`.tar.gz`）。要解压它们，请运行以下命令：

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

每个 Collector 发布版本都包含一个解压后可运行的 `otelcol` 可执行文件。

## Windows

Windows [发布版本][releases]被打包为 gzip 压缩的 tarball（`.tar.gz`）。每个
Collector 发布版本都包含一个可运行的 `otelcol.exe` 可执行文件。

## 从源码构建 {#build-from-source}

你可以使用以下命令基于本地操作系统构建最新版本的 Collector：

```sh
git clone https://github.com/open-telemetry/opentelemetry-collector.git
cd opentelemetry-collector
make install-tools
make otelcorecol
```

[data collection]: /docs/concepts/components/#collector
[deployment methods]: ../deployment/
[opentelemetry helm charts]: /docs/platforms/kubernetes/helm/
[opentelemetry operator]: /docs/platforms/kubernetes/operator/
[getting started with opentelemetry on hashicorp nomad]: https://github.com/hashicorp/nomad-open-telemetry-getting-started
[releases]: https://github.com/open-telemetry/opentelemetry-collector-releases/releases
