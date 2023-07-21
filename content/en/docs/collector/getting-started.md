---
title: Getting Started
spelling:
  - cSpell:ignore darwin dpkg GOARCH journalctl kubectl linux otelcorecol pprof
  - cSpell:ignore zpages tlsv
weight: 1
---

If you aren't familiar with the deployment models, components, and repositories
applicable to the OpenTelemetry Collector, first review the [Data Collection][]
and [Deployment Methods][] page.

## Demo

Deploys a load generator, agent and gateway as well as Jaeger, Zipkin and
Prometheus back-ends. More information can be found on the demo [README.md][].

```sh
git clone git@github.com:open-telemetry/opentelemetry-collector-contrib.git --depth 1; \
  cd opentelemetry-collector-contrib/examples/demo; \
  docker compose up -d
```

{{% alert title="Note" color="info" %}} {{% _param notes.docker-compose-v2 %}}
{{% /alert %}}

## Docker

Pull a docker image and run the collector in a container. Replace
`{{% param collectorVersion %}}` with the version of the Collector you wish to
run.

<!-- markdownlint-disable -->
<!-- prettier-ignore-start -->
{{< tabpane lang=shell >}}
{{< tab DockerHub >}}
docker pull otel/opentelemetry-collector-contrib:{{% param collectorVersion %}}
docker run otel/opentelemetry-collector-contrib:{{% param collectorVersion %}}
{{< /tab >}}

{{< tab ghcr.io >}}
docker pull ghcr.io/open-telemetry/opentelemetry-collector-releases/opentelemetry-collector-contrib:{{% param collectorVersion %}}
docker run ghcr.io/open-telemetry/opentelemetry-collector-releases/opentelemetry-collector-contrib:{{% param collectorVersion %}}
{{< /tab >}}
{{< /tabpane >}}
<!-- prettier-ignore-end -->
<!-- markdownlint-restore -->

To load your custom configuration `config.yaml` from your current working
directory, mount that file as a volume:

<!-- markdownlint-disable -->
<!-- prettier-ignore-start -->
{{< tabpane lang=shell >}}
{{< tab DockerHub >}}
docker run -v $(pwd)/config.yaml:/etc/otelcol-contrib/config.yaml otel/opentelemetry-collector-contrib:{{% param collectorVersion %}}
{{< /tab >}}

{{< tab ghcr.io >}}
docker run -v $(pwd)/config.yaml:/etc/otelcol-contrib/config.yaml ghcr.io/open-telemetry/opentelemetry-collector-releases/opentelemetry-collector-contrib:{{% param collectorVersion %}}
{{< /tab >}}
{{< /tabpane >}}
<!-- prettier-ignore-end -->
<!-- markdownlint-restore -->

## Docker Compose

You can add OpenTelemetry Collector to your existing `docker-compose.yaml` like
the following:

```yaml
otel-collector:
  image: otel/opentelemetry-collector-contrib
  volumes:
    - ./otel-collector-config.yaml:/etc/otelcol-contrib/config.yaml
  ports:
    - 1888:1888 # pprof extension
    - 8888:8888 # Prometheus metrics exposed by the collector
    - 8889:8889 # Prometheus exporter metrics
    - 13133:13133 # health_check extension
    - 4317:4317 # OTLP gRPC receiver
    - 4318:4318 # OTLP http receiver
    - 55679:55679 # zpages extension
```

## Kubernetes

Deploys an agent as a daemonset and a single gateway instance.

```sh
kubectl apply -f https://raw.githubusercontent.com/open-telemetry/opentelemetry-collector/main/examples/k8s/otel-config.yaml
```

The example above is meant to serve as a starting point, to be extended and
customized before actual production usage. For production-ready customization
and installation, see [OpenTelemetry Helm Charts][].

The [OpenTelemetry Operator][] can also be used to provision and maintain an
OpenTelemetry Collector instance, with features such as automatic upgrade
handling, `Service` configuration based on the OpenTelemetry configuration,
automatic sidecar injection into deployments, among others.

## Nomad

Reference job files to deploy the Collector as an agent, gateway and in the full
demo can be found at [Getting Started with OpenTelemetry on HashiCorp Nomad][].

## Linux Packaging

Every Collector release includes APK, DEB and RPM packaging for Linux
amd64/arm64/i386 systems. The packaging includes a default configuration that
can be found at `/etc/otelcol/config.yaml` post-installation.

> Note: `systemd` is required for automatic service configuration.

### APK Installation

To get started on alpine systems run the following replacing
`v{{% param collectorVersion %}}` with the version of the Collector you wish to
run.

<!-- markdownlint-disable -->
<!-- prettier-ignore-start -->
{{< tabpane lang=shell >}}
{{< tab AMD64 >}}
apk update
apk add wget shadow
wget https://github.com/open-telemetry/opentelemetry-collector-releases/releases/download/v{{% param collectorVersion %}}/otelcol_{{% param collectorVersion %}}_linux_amd64.apk
apk add --allow-untrusted otelcol_{{% param collectorVersion %}}_linux_amd64.apk
{{< /tab >}}

{{< tab ARM64 >}}
apk update
apk add wget shadow
wget https://github.com/open-telemetry/opentelemetry-collector-releases/releases/download/v{{% param collectorVersion %}}/otelcol_{{% param collectorVersion %}}_linux_arm64.apk
apk add --allow-untrusted otelcol_{{% param collectorVersion %}}_linux_arm64.apk
{{< /tab >}}

{{< tab i386 >}}
apk update
apk add wget shadow
wget https://github.com/open-telemetry/opentelemetry-collector-releases/releases/download/v{{% param collectorVersion %}}/otelcol_{{% param collectorVersion %}}_linux_386.apk
apk add --allow-untrusted otelcol_{{% param collectorVersion %}}_linux_386.apk
{{< /tab >}}
{{< /tabpane >}}
<!-- prettier-ignore-end -->
<!-- markdownlint-restore -->

### DEB Installation

To get started on Debian systems run the following replacing
`v{{% param collectorVersion %}}` with the version of the Collector you wish to
run and `amd64` with the appropriate architecture.

<!-- markdownlint-disable -->
<!-- prettier-ignore-start -->
{{< tabpane lang=shell >}}
{{< tab AMD64 >}}
sudo apt-get update
sudo apt-get -y install wget systemctl
wget https://github.com/open-telemetry/opentelemetry-collector-releases/releases/download/v{{% param collectorVersion %}}/otelcol_{{% param collectorVersion %}}_linux_amd64.deb
sudo dpkg -i otelcol_{{% param collectorVersion %}}_linux_amd64.deb
{{< /tab >}}

{{< tab ARM64 >}}
sudo apt-get update
sudo apt-get -y install wget systemctl
wget https://github.com/open-telemetry/opentelemetry-collector-releases/releases/download/v{{% param collectorVersion %}}/otelcol_{{% param collectorVersion %}}_linux_arm64.deb
sudo dpkg -i otelcol_{{% param collectorVersion %}}_linux_arm64.deb
{{< /tab >}}

{{< tab i386 >}}
sudo apt-get update
sudo apt-get -y install wget systemctl
wget https://github.com/open-telemetry/opentelemetry-collector-releases/releases/download/v{{% param collectorVersion %}}/otelcol_{{% param collectorVersion %}}_linux_386.deb
sudo dpkg -i otelcol_{{% param collectorVersion %}}_linux_386.deb
{{< /tab >}}
{{< /tabpane >}}
<!-- prettier-ignore-end -->
<!-- markdownlint-restore -->

### RPM Installation

To get started on Red Hat systems run the following replacing
`v{{% param collectorVersion %}}` with the version of the Collector you wish to
run and `x86_64` with the appropriate architecture.

<!-- markdownlint-disable -->
<!-- prettier-ignore-start -->
{{< tabpane lang=shell >}}
{{< tab AMD64 >}}
sudo yum update
sudo yum -y install wget systemctl
wget https://github.com/open-telemetry/opentelemetry-collector-releases/releases/download/v{{% param collectorVersion %}}/otelcol_{{% param collectorVersion %}}_linux_amd64.rpm
sudo rpm -ivh otelcol_{{% param collectorVersion %}}_linux_amd64.rpm
{{< /tab >}}

{{< tab ARM64 >}}
sudo yum update
sudo yum -y install wget systemctl
wget https://github.com/open-telemetry/opentelemetry-collector-releases/releases/download/v{{% param collectorVersion %}}/otelcol_{{% param collectorVersion %}}_linux_arm64.rpm
sudo rpm -ivh otelcol_{{% param collectorVersion %}}_linux_arm64.rpm
{{< /tab >}}

{{< tab i386 >}}
sudo yum update
sudo yum -y install wget systemctl
wget https://github.com/open-telemetry/opentelemetry-collector-releases/releases/download/v{{% param collectorVersion %}}/otelcol_{{% param collectorVersion %}}_linux_386.rpm
sudo rpm -ivh otelcol_{{% param collectorVersion %}}_linux_386.rpm
{{< /tab >}}
{{< /tabpane >}}
<!-- prettier-ignore-end -->
<!-- markdownlint-restore -->

### Manual Installation

Linux [releases][] are available for various architectures. It's possible to
download the archive containing the binary and install it on your machine
manually:

<!-- markdownlint-disable -->
<!-- prettier-ignore-start -->
{{< tabpane lang=shell >}}
{{< tab AMD64 >}}
curl --proto '=https' --tlsv1.2 -fOL https://github.com/open-telemetry/opentelemetry-collector-releases/releases/download/v{{% param collectorVersion %}}/otelcol_{{% param collectorVersion %}}_linux_amd64.tar.gz
tar -xvf otelcol_{{% param collectorVersion %}}_linux_amd64.tar.gz
{{< /tab >}}

{{< tab ARM64 >}}
curl --proto '=https' --tlsv1.2 -fOL https://github.com/open-telemetry/opentelemetry-collector-releases/releases/download/v{{% param collectorVersion %}}/otelcol_{{% param collectorVersion %}}_linux_arm64.tar.gz
tar -xvf otelcol_{{% param collectorVersion %}}_linux_arm64.tar.gz
{{< /tab >}}

{{< tab i386 >}}
curl --proto '=https' --tlsv1.2 -fOL https://github.com/open-telemetry/opentelemetry-collector-releases/releases/download/v{{% param collectorVersion %}}/otelcol_{{% param collectorVersion %}}_linux_386.tar.gz
tar -xvf otelcol_{{% param collectorVersion %}}_linux_386.tar.gz
{{< /tab >}}

{{< tab ppc64le >}}
curl --proto '=https' --tlsv1.2 -fOL https://github.com/open-telemetry/opentelemetry-collector-releases/releases/download/v{{% param collectorVersion %}}/otelcol_{{% param collectorVersion %}}_linux_ppc64le.tar.gz
tar -xvf otelcol_{{% param collectorVersion %}}_linux_ppc64le.tar.gz
{{< /tab >}}
{{< /tabpane >}}
<!-- prettier-ignore-end -->
<!-- markdownlint-restore -->

### Automatic Service Configuration

By default, the `otelcol` systemd service will be started with the
`--config=/etc/otelcol/config.yaml` option after installation. To customize
these options, modify the `OTELCOL_OPTIONS` variable in the
`/etc/otelcol/otelcol.conf` systemd environment file with the appropriate
command-line options (run `/usr/bin/otelcol --help` to see all available
options). Additional environment variables can also be passed to the `otelcol`
service by adding them to this file.

If either the Collector configuration file or `/etc/otelcol/otelcol.conf` are
modified, restart the `otelcol` service to apply the changes by running:

```sh
sudo systemctl restart otelcol
```

To check the output from the `otelcol` service, run:

```sh
sudo journalctl -u otelcol
```

## MacOS Packaging

MacOS [releases][] are available for Intel- & ARM-based systems. They are
packaged as gzipped tarballs (`.tar.gz`) and will need to be unpacked with a
tool that supports this compression format:

<!-- markdownlint-disable -->
<!-- prettier-ignore-start -->
{{< tabpane lang=shell >}}
{{< tab Intel >}}
curl --proto '=https' --tlsv1.2 -fOL https://github.com/open-telemetry/opentelemetry-collector-releases/releases/download/v{{% param collectorVersion %}}/otelcol_{{% param collectorVersion %}}_darwin_amd64.tar.gz
tar -xvf otelcol_{{% param collectorVersion %}}_darwin_amd64.tar.gz
{{< /tab >}}

{{< tab ARM >}}
curl --proto '=https' --tlsv1.2 -fOL https://github.com/open-telemetry/opentelemetry-collector-releases/releases/download/v{{% param collectorVersion %}}/otelcol_{{% param collectorVersion %}}_darwin_arm64.tar.gz
tar -xvf otelcol_{{% param collectorVersion %}}_darwin_arm64.tar.gz
{{< /tab >}}
{{< /tabpane >}}
<!-- prettier-ignore-end -->
<!-- markdownlint-restore -->

Every Collector release includes an `otelcol` executable that you can run after
unpacking.

## Windows Packaging

Windows [releases][] are packaged as gzipped tarballs (`.tar.gz`) and will need
to be unpacked with a tool that supports this compression format.

Every Collector release includes an `otelcol.exe` executable that you can run
after unpacking.

## Local

Builds the latest version of the collector based on the local operating system,
runs the binary with all receivers enabled and exports all the data it receives
locally to a file. Data is sent to the container and the container scrapes its
own Prometheus metrics. The following example uses two terminal windows to
better illustrate the collector. In the first terminal window run the following:

```sh
git clone https://github.com/open-telemetry/opentelemetry-collector.git
cd opentelemetry-collector
make install-tools
make otelcorecol
./bin/otelcorecol_* --config ./examples/local/otel-config.yaml
```

In a second terminal window, you can test the newly built collector by doing the
following:

```sh
git clone https://github.com/open-telemetry/opentelemetry-collector-contrib.git
cd opentelemetry-collector-contrib/examples/demo/server
go build -o main main.go; ./main & pid1="$!"
cd ../client
go build -o main main.go; ./main
```

To stop the client, use type <kbd>Ctrl-C</kbd>. To stop the server, use the
`kill $pid1` command. To stop the collector, type <kbd>Ctrl-C</kbd> in its
terminal window as well.

**Note:** The commands shown above demonstrate the process in a bash shell.
These commands may vary slightly for other shells.

[data collection]: /docs/concepts/components/#collector
[deployment methods]: ../deployment/
[readme.md]:
  https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/examples/demo
[opentelemetry helm charts]:
  https://github.com/open-telemetry/opentelemetry-helm-charts
[opentelemetry operator]:
  https://github.com/open-telemetry/opentelemetry-operator
[getting started with opentelemetry on hashicorp nomad]:
  https://github.com/hashicorp/nomad-open-telemetry-getting-started
[releases]:
  https://github.com/open-telemetry/opentelemetry-collector-releases/releases
