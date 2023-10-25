---
title: Install the Collector
# prettier-ignore
cSpell:ignore: darwin dpkg GOARCH journalctl kubectl otelcorecol pprof tlsv zpages
weight: 18
---

You can deploy the OpenTelemetry Collector on a wide variety of operating
systems and architectures. The following instructions show how to download and
install the latest stable version of the Collector.

If you aren't familiar with the deployment models, components, and repositories
applicable to the OpenTelemetry Collector, first review the [Data Collection][]
and [Deployment Methods][] page.

## Docker

The following commands pull a Docker image and run the Collector in a container.
Replace `{{% param collectorVersion %}}` with the version of the Collector you
want to run.

{{< tabpane text=true >}} {{% tab DockerHub %}}

```sh
docker pull otel/opentelemetry-collector-contrib:{{% param collectorVersion %}}
docker run otel/opentelemetry-collector-contrib:{{% param collectorVersion %}}
```

{{% /tab %}} {{% tab ghcr.io %}}

```sh
docker pull ghcr.io/open-telemetry/opentelemetry-collector-releases/opentelemetry-collector-contrib:{{% param collectorVersion %}}
docker run ghcr.io/open-telemetry/opentelemetry-collector-releases/opentelemetry-collector-contrib:{{% param collectorVersion %}}
```

{{% /tab %}} {{< /tabpane >}}

To load a custom configuration file from your working directory, mount that file
as a volume:

{{< tabpane text=true >}} {{% tab DockerHub %}}

```sh
docker run -v $(pwd)/config.yaml:/etc/otelcol-contrib/config.yaml otel/opentelemetry-collector-contrib:{{% param collectorVersion %}}
```

{{% /tab %}} {{% tab ghcr.io %}}

```sh
docker run -v $(pwd)/config.yaml:/etc/otelcol-contrib/config.yaml ghcr.io/open-telemetry/opentelemetry-collector-releases/opentelemetry-collector-contrib:{{% param collectorVersion %}}
```

{{% /tab %}} {{< /tabpane >}}

## Docker Compose

You can add OpenTelemetry Collector to your existing `docker-compose.yaml` file
as in the following example:

```yaml
otel-collector:
  image: otel/opentelemetry-collector-contrib
  volumes:
    - ./otel-collector-config.yaml:/etc/otelcol-contrib/config.yaml
  ports:
    - 1888:1888 # pprof extension
    - 8888:8888 # Prometheus metrics exposed by the Collector
    - 8889:8889 # Prometheus exporter metrics
    - 13133:13133 # health_check extension
    - 4317:4317 # OTLP gRPC receiver
    - 4318:4318 # OTLP http receiver
    - 55679:55679 # zpages extension
```

## Kubernetes

The following command deploys an agent as a daemonset and a single gateway
instance:

```sh
kubectl apply -f https://raw.githubusercontent.com/open-telemetry/opentelemetry-collector/main/examples/k8s/otel-config.yaml
```

The previous example is meant to serve as a starting point, to be extended and
customized before actual production usage. For production-ready customization
and installation, see [OpenTelemetry Helm Charts][].

You can also use the [OpenTelemetry Operator][] to provision and maintain an
OpenTelemetry Collector instance, with features such as automatic upgrade
handling, `Service` configuration based on the OpenTelemetry configuration,
automatic sidecar injection into deployments, and more.

For guidance on how to use the Collector with Kubernetes, see
[Kubernetes Getting Started](/docs/kubernetes/getting-started/).

## Nomad

You can find reference job files to deploy the Collector as an agent, gateway,
and as full demo in [Getting Started with OpenTelemetry on HashiCorp Nomad][].

## Linux

Every Collector release includes APK, DEB and RPM packaging for Linux
amd64/arm64/i386 systems. You can find the default configuration in
`/etc/otelcol/config.yaml` after installation.

> Note: `systemd` is required for automatic service configuration.

### APK Installation

To get started on Alpine systems run the following commands:

{{< tabpane text=true >}} {{% tab AMD64 %}}

```sh
apk update
apk add wget shadow
wget https://github.com/open-telemetry/opentelemetry-collector-releases/releases/download/v{{% param collectorVersion %}}/otelcol_{{% param collectorVersion %}}_linux_amd64.apk
apk add --allow-untrusted otelcol_{{% param collectorVersion %}}_linux_amd64.apk
```

{{% /tab %}} {{% tab ARM64 %}}

```sh
apk update
apk add wget shadow
wget https://github.com/open-telemetry/opentelemetry-collector-releases/releases/download/v{{% param collectorVersion %}}/otelcol_{{% param collectorVersion %}}_linux_arm64.apk
apk add --allow-untrusted otelcol_{{% param collectorVersion %}}_linux_arm64.apk
```

{{% /tab %}} {{% tab i386 %}}

```sh
apk update
apk add wget shadow
wget https://github.com/open-telemetry/opentelemetry-collector-releases/releases/download/v{{% param collectorVersion %}}/otelcol_{{% param collectorVersion %}}_linux_386.apk
apk add --allow-untrusted otelcol_{{% param collectorVersion %}}_linux_386.apk
```

{{% /tab %}} {{< /tabpane >}}

### DEB Installation

To get started on Debian systems run the following commands:

{{< tabpane text=true >}} {{% tab AMD64 %}}

```sh
sudo apt-get update
sudo apt-get -y install wget systemctl
wget https://github.com/open-telemetry/opentelemetry-collector-releases/releases/download/v{{% param collectorVersion %}}/otelcol_{{% param collectorVersion %}}_linux_amd64.deb
sudo dpkg -i otelcol_{{% param collectorVersion %}}_linux_amd64.deb
```

{{% /tab %}} {{% tab ARM64 %}}

```sh
sudo apt-get update
sudo apt-get -y install wget systemctl
wget https://github.com/open-telemetry/opentelemetry-collector-releases/releases/download/v{{% param collectorVersion %}}/otelcol_{{% param collectorVersion %}}_linux_arm64.deb
sudo dpkg -i otelcol_{{% param collectorVersion %}}_linux_arm64.deb
```

{{% /tab %}} {{% tab i386 %}}

```sh
sudo apt-get update
sudo apt-get -y install wget systemctl
wget https://github.com/open-telemetry/opentelemetry-collector-releases/releases/download/v{{% param collectorVersion %}}/otelcol_{{% param collectorVersion %}}_linux_386.deb
sudo dpkg -i otelcol_{{% param collectorVersion %}}_linux_386.deb
```

{{% /tab %}} {{< /tabpane >}}

### RPM Installation

To get started on Red Hat systems run the following commands:

{{< tabpane text=true >}} {{% tab AMD64 %}}

```sh
sudo yum update
sudo yum -y install wget systemctl
wget https://github.com/open-telemetry/opentelemetry-collector-releases/releases/download/v{{% param collectorVersion %}}/otelcol_{{% param collectorVersion %}}_linux_amd64.rpm
sudo rpm -ivh otelcol_{{% param collectorVersion %}}_linux_amd64.rpm
```

{{% /tab %}} {{% tab ARM64 %}}

```sh
sudo yum update
sudo yum -y install wget systemctl
wget https://github.com/open-telemetry/opentelemetry-collector-releases/releases/download/v{{% param collectorVersion %}}/otelcol_{{% param collectorVersion %}}_linux_arm64.rpm
sudo rpm -ivh otelcol_{{% param collectorVersion %}}_linux_arm64.rpm
```

{{% /tab %}} {{% tab i386 %}}

```sh
sudo yum update
sudo yum -y install wget systemctl
wget https://github.com/open-telemetry/opentelemetry-collector-releases/releases/download/v{{% param collectorVersion %}}/otelcol_{{% param collectorVersion %}}_linux_386.rpm
sudo rpm -ivh otelcol_{{% param collectorVersion %}}_linux_386.rpm
```

{{% /tab %}} {{< /tabpane >}}

### Manual Linux installation

Linux [releases][] are available for various architectures. You can download the
file containing the binary and install it on your machine manually:

{{< tabpane text=true >}} {{% tab AMD64 %}}

```sh
curl --proto '=https' --tlsv1.2 -fOL https://github.com/open-telemetry/opentelemetry-collector-releases/releases/download/v{{% param collectorVersion %}}/otelcol_{{% param collectorVersion %}}_linux_amd64.tar.gz
tar -xvf otelcol_{{% param collectorVersion %}}_linux_amd64.tar.gz
```

{{% /tab %}} {{% tab ARM64 %}}

```sh
curl --proto '=https' --tlsv1.2 -fOL https://github.com/open-telemetry/opentelemetry-collector-releases/releases/download/v{{% param collectorVersion %}}/otelcol_{{% param collectorVersion %}}_linux_arm64.tar.gz
tar -xvf otelcol_{{% param collectorVersion %}}_linux_arm64.tar.gz
```

{{% /tab %}} {{% tab i386 %}}

```sh
curl --proto '=https' --tlsv1.2 -fOL https://github.com/open-telemetry/opentelemetry-collector-releases/releases/download/v{{% param collectorVersion %}}/otelcol_{{% param collectorVersion %}}_linux_386.tar.gz
tar -xvf otelcol_{{% param collectorVersion %}}_linux_386.tar.gz
```

{{% /tab %}} {{% tab ppc64le %}}

```sh
curl --proto '=https' --tlsv1.2 -fOL https://github.com/open-telemetry/opentelemetry-collector-releases/releases/download/v{{% param collectorVersion %}}/otelcol_{{% param collectorVersion %}}_linux_ppc64le.tar.gz
tar -xvf otelcol_{{% param collectorVersion %}}_linux_ppc64le.tar.gz
```

{{% /tab %}} {{< /tabpane >}}

### Automatic service configuration

By default, the `otelcol` systemd service starts with the
`--config=/etc/otelcol/config.yaml` option after installation.

To use a different settings, set the `OTELCOL_OPTIONS` variable in the
`/etc/otelcol/otelcol.conf` systemd environment file to the appropriate
command-line options. You can run `/usr/bin/otelcol --help` to see all available
options. You can pass additional environment variables to the `otelcol` service
by adding them to this file.

If you modify the Collector configuration file or `/etc/otelcol/otelcol.conf`,
restart the `otelcol` service to apply the changes by running:

```sh
sudo systemctl restart otelcol
```

To check the output from the `otelcol` service, run:

```sh
sudo journalctl -u otelcol
```

## macOS

macOS [releases][] are available for Intel and ARM systems. The releases are
packaged as gzipped tarballs (`.tar.gz`). To unpack them, run the following
commands:

{{< tabpane text=true >}} {{% tab Intel %}}

```sh
curl --proto '=https' --tlsv1.2 -fOL https://github.com/open-telemetry/opentelemetry-collector-releases/releases/download/v{{% param collectorVersion %}}/otelcol_{{% param collectorVersion %}}_darwin_amd64.tar.gz
tar -xvf otelcol_{{% param collectorVersion %}}_darwin_amd64.tar.gz
```

{{% /tab %}} {{% tab ARM %}}

```sh
curl --proto '=https' --tlsv1.2 -fOL https://github.com/open-telemetry/opentelemetry-collector-releases/releases/download/v{{% param collectorVersion %}}/otelcol_{{% param collectorVersion %}}_darwin_arm64.tar.gz
tar -xvf otelcol_{{% param collectorVersion %}}_darwin_arm64.tar.gz
```

{{% /tab %}} {{< /tabpane >}}

Every Collector release includes an `otelcol` executable that you can run after
unpacking.

## Windows

Windows [releases][] are packaged as gzipped tarballs (`.tar.gz`). Every
Collector release includes an `otelcol.exe` executable that you can run after
unpacking.

## Build from source

You can build the latest version of the Collector based on the local operating
system using the following commands:

```sh
git clone https://github.com/open-telemetry/opentelemetry-collector.git
cd opentelemetry-collector
make install-tools
make otelcorecol
```

[data collection]: /docs/concepts/components/#collector
[deployment methods]: ../deployment/
[opentelemetry helm charts]: /docs/kubernetes/helm/
[opentelemetry operator]: /docs/kubernetes/operator/
[getting started with opentelemetry on hashicorp nomad]:
  https://github.com/hashicorp/nomad-open-telemetry-getting-started
[releases]:
  https://github.com/open-telemetry/opentelemetry-collector-releases/releases
