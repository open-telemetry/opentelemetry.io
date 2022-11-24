---
title: Getting Started
spelling: cSpell:ignore dpkg GOARCH journalctl kubectl
weight: 1
collectorVersion: 0.64.1
---

If you aren't familiar with the deployment models, components, and repositories
applicable to the OpenTelemetry Collector, first review the [Data Collection][]
and [Deployment Methods][] page.

## Demo

Deploys a load generator, agent and gateway as well as Jaeger, Zipkin and
Prometheus back-ends. More information can be found on the demo
[README.md][]

```console
$ git clone git@github.com:open-telemetry/opentelemetry-collector-contrib.git; \
    cd opentelemetry-collector-contrib/examples/demo; \
    docker-compose up -d
```

## Docker

Pull a docker image and run the collector in a container. Replace `{{% param collectorVersion %}}`
with the version of the Collector you wish to run.

{{< ot-tabs DockerHub ghcr.io >}}
{{< ot-tab lang="console">}}
$ docker pull otel/opentelemetry-collector:{{% param collectorVersion %}}
$ docker run otel/opentelemetry-collector:{{% param collectorVersion %}}
{{< /ot-tab >}}

{{< ot-tab lang="console">}}
$ docker pull ghcr.io/open-telemetry/opentelemetry-collector-releases/opentelemetry-collector-contrib:{{% param collectorVersion %}}
$ docker run ghcr.io/open-telemetry/opentelemetry-collector-releases/opentelemetry-collector-contrib:{{% param collectorVersion %}}
{{< /ot-tab >}}
{{< /ot-tabs >}}

To load your custom configuration `config.yaml` from your current working directory, mount that file as a volume:

{{< ot-tabs DockerHub ghcr.io >}}
{{< ot-tab lang="console">}}
$ docker run -v $(pwd)/config.yaml:/etc/otelcol/config.yaml otel/opentelemetry-collector:{{% param collectorVersion %}}
{{< /ot-tab >}}

{{< ot-tab lang="console">}}
$ docker run -v $(pwd)/config.yaml:/etc/otelcol-contrib/config.yaml ghcr.io/open-telemetry/opentelemetry-collector-releases/opentelemetry-collector-contrib:{{% param collectorVersion %}}
{{< /ot-tab >}}
{{< /ot-tabs >}}

## Docker Compose

You can add OpenTelemetry collector to your existing `docker-compose.yaml` like the following:

```yaml
  # Collector
  otel-collector:
    image: otel/opentelemetry-collector
    command: ["--config=/etc/otel-collector-config.yaml"]
    volumes:
      - ./otel-collector-config.yaml:/etc/otel-collector-config.yaml
    ports:
      - "1888:1888"   # pprof extension
      - "8888:8888"   # Prometheus metrics exposed by the collector
      - "8889:8889"   # Prometheus exporter metrics
      - "13133:13133" # health_check extension
      - "4317:4317"   # OTLP gRPC receiver
      - "4318:4318"   # OTLP http receiver
      - "55679:55679" # zpages extension
```

## Kubernetes

Deploys an agent as a daemonset and a single gateway instance.

```console
$ kubectl apply -f https://raw.githubusercontent.com/open-telemetry/opentelemetry-collector/main/examples/k8s/otel-config.yaml
```

The example above is meant to serve as a starting point, to be extended and
customized before actual production usage. For production-ready customization
and installation, see [OpenTelemetry Helm Charts][].

The [OpenTelemetry Operator][] can also be used to provision and maintain an
OpenTelemetry Collector instance, with features such as automatic upgrade
handling, `Service` configuration based on the OpenTelemetry configuration,
automatic sidecar injection into deployments,
among others.

## Nomad

Reference job files to deploy the Collector as an agent, gateway and in the full
demo can be found at [Getting Started with OpenTelemetry on HashiCorp Nomad][]

## Linux Packaging

Every Collector release includes APK, DEB and RPM packaging for Linux amd64/arm64/i386
systems. The packaging includes a default configuration that can be found at
`/etc/otelcol/config.yaml` post-installation.

> Please note that systemd is require for automatic service configuration

### APK Installation

To get started on alpine systems run the following replacing `v{{% param collectorVersion %}}` with the
version of the Collector you wish to run.

{{< ot-tabs AMD64 ARM64 i386 >}}
{{< ot-tab lang="console">}}
$ apk update
$ apk add wget shadow
$ wget https://github.com/open-telemetry/opentelemetry-collector-releases/releases/download/v{{% param collectorVersion %}}/otelcol_{{% param collectorVersion %}}_linux_amd64.apk
$ apk add --allow-untrusted otelcol_{{% param collectorVersion %}}_linux_amd64.apk
{{< /ot-tab >}}

{{< ot-tab lang="console">}}
$ apk update
$ apk add wget shadow
$ wget https://github.com/open-telemetry/opentelemetry-collector-releases/releases/download/v{{% param collectorVersion %}}/otelcol_{{% param collectorVersion %}}_linux_arm64.apk
$ apk add --allow-untrusted otelcol_{{% param collectorVersion %}}_linux_arm64.apk
{{< /ot-tab >}}

{{< ot-tab lang="console">}}
$ apk update
$ apk add wget shadow
$ wget https://github.com/open-telemetry/opentelemetry-collector-releases/releases/download/v{{% param collectorVersion %}}/otelcol_{{% param collectorVersion %}}_linux_386.apk
$ apk add --allow-untrusted otelcol_{{% param collectorVersion %}}_linux_386.apk
{{< /ot-tab >}}
{{< /ot-tabs >}}

### DEB Installation

To get started on Debian systems run the following replacing `v{{% param collectorVersion %}}` with the
version of the Collector you wish to run and `amd64` with the appropriate
architecture.

{{< ot-tabs AMD64 ARM64 i386 >}}
{{< ot-tab lang="console">}}
$ sudo apt-get update
$ sudo apt-get -y install wget systemctl
$ wget https://github.com/open-telemetry/opentelemetry-collector-releases/releases/download/v{{% param collectorVersion %}}/otelcol_{{% param collectorVersion %}}_linux_amd64.deb
$ sudo dpkg -i otelcol_{{% param collectorVersion %}}_linux_amd64.deb
{{< /ot-tab >}}

{{< ot-tab lang="console">}}
$ sudo apt-get update
$ sudo apt-get -y install wget systemctl
$ wget https://github.com/open-telemetry/opentelemetry-collector-releases/releases/download/v{{% param collectorVersion %}}/otelcol_{{% param collectorVersion %}}_linux_arm64.deb
$ sudo dpkg -i otelcol_{{% param collectorVersion %}}_linux_arm64.deb
{{< /ot-tab >}}

{{< ot-tab lang="console">}}
$ sudo apt-get update
$ sudo apt-get -y install wget systemctl
$ wget https://github.com/open-telemetry/opentelemetry-collector-releases/releases/download/v{{% param collectorVersion %}}/otelcol_{{% param collectorVersion %}}_linux_386.deb
$ sudo dpkg -i otelcol_{{% param collectorVersion %}}_linux_386.deb
{{< /ot-tab >}}
{{< /ot-tabs >}}

### RPM Installation

To get started on Red Hat systems run the following replacing `v{{% param collectorVersion %}}` with the
version of the Collector you wish to run and `x86_64` with the appropriate
architecture.

{{< ot-tabs AMD64 ARM64 i386 >}}
{{< ot-tab lang="console">}}
$ sudo yum update
$ sudo yum -y install wget systemctl
$ wget https://github.com/open-telemetry/opentelemetry-collector-releases/releases/download/v{{% param collectorVersion %}}/otelcol_{{% param collectorVersion %}}_linux_amd64.rpm
$ sudo rpm -ivh otelcol_{{% param collectorVersion %}}_linux_amd64.rpm
{{< /ot-tab >}}

{{< ot-tab lang="console">}}
$ sudo yum update
$ sudo yum -y install wget systemctl
$ wget https://github.com/open-telemetry/opentelemetry-collector-releases/releases/download/v{{% param collectorVersion %}}/otelcol_{{% param collectorVersion %}}_linux_arm64.rpm
$ sudo rpm -ivh otelcol_{{% param collectorVersion %}}_linux_arm64.rpm
{{< /ot-tab >}}

{{< ot-tab lang="console">}}
$ sudo yum update
$ sudo yum -y install wget systemctl
$ wget https://github.com/open-telemetry/opentelemetry-collector-releases/releases/download/v{{% param collectorVersion %}}/otelcol_{{% param collectorVersion %}}_linux_386.rpm
$ sudo rpm -ivh otelcol_{{% param collectorVersion %}}_linux_386.rpm
{{< /ot-tab >}}
{{< /ot-tabs >}}


### Automatic Service Configuration

By default, the `otelcol` systemd service will be started with the
`--config=/etc/otelcol/config.yaml` option after installation.  To
customize these options, modify the `OTELCOL_OPTIONS` variable in the
`/etc/otelcol/otelcol.conf` systemd environment file with the
appropriate command-line options (run `/usr/bin/otelcol --help` to see all
available options).  Additional environment variables can also be passed to the
`otelcol` service by adding them to this file.

If either the Collector configuration file or
`/etc/otelcol/otelcol.conf` are modified, restart the
`otelcol` service to apply the changes by running:

```console
$ sudo systemctl restart otelcol
```

To check the output from the `otelcol` service, run:

```console
$ sudo journalctl -u otelcol
```

## MacOS Packaging

[MacOS releases][] are available for Intel- & ARM-based systems.
They are packaged as gzipped tarballs (`.tar.gz`) and will need to be
unpacked with a tool that supports this compression format:

{{< ot-tabs Intel ARM >}}
{{< ot-tab lang="console">}}
$ curl -O -L https://github.com/open-telemetry/opentelemetry-collector-releases/releases/download/v{{% param collectorVersion %}}/otelcol_{{% param collectorVersion %}}_darwin_amd64.tar.gz
$ tar -xvf otelcol_{{% param collectorVersion %}}_darwin_amd64.tar.gz
{{< /ot-tab >}}

{{< ot-tab lang="console">}}
$ curl -O -L https://github.com/open-telemetry/opentelemetry-collector-releases/releases/download/v{{% param collectorVersion %}}/otelcol_{{% param collectorVersion %}}_darwin_arm64.tar.gz
$ tar -xvf otelcol_{{% param collectorVersion %}}_darwin_arm64.tar.gz
{{< /ot-tab >}}
{{< /ot-tabs >}}

Every Collector release includes an `otelcol` executable that you can run after unpacking.

## Windows Packaging

[Windows releases][] are packaged as gzipped
tarballs (`.tar.gz`) and will need to be unpacked with a tool that supports this compression format.

Every Collector release includes an `otelcol.exe` executable that you can run after unpacking.

## Local

Builds the latest version of the collector based on the local operating system,
runs the binary with all receivers enabled and exports all the data it receives
locally to a file. Data is sent to the container and the container scrapes its own
Prometheus metrics. The following example uses two terminal windows to better illustrate
the collector.   In the first terminal window run the following:

```console
$ git clone https://github.com/open-telemetry/opentelemetry-collector.git
$ cd opentelemetry-collector
$ make install-tools
$ make otelcorecol
$ ./bin/otelcorecol_* --config ./examples/local/otel-config.yaml
```

In a second terminal window, you can test the newly built collector
by doing the following:

```console
$ git clone https://github.com/open-telemetry/opentelemetry-collector-contrib.git
$ cd opentelemetry-collector-contrib/examples/demo/server
$ go build -o main main.go; ./main & pid1="$!"
$ cd ../client
$ go build -o main main.go; ./main
```

To stop the client, use the Ctrl-c command.  To stop the server, use the `kill $pid1` command.
To stop the collector, you can use Ctrl-c command in its terminal window as well.

 **Note:**  The above commands demonstrate the process in a bash shell. These commands may vary slightly
 for other shells.

[Data Collection]: /docs/concepts/data-collection
[Deployment Methods]: ../deployment
[README.md]: https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/examples/demo
[OpenTelemetry Helm Charts]: https://github.com/open-telemetry/opentelemetry-helm-charts
[OpenTelemetry Operator]: https://github.com/open-telemetry/opentelemetry-operator
[Getting Started with OpenTelemetry on HashiCorp Nomad]: https://github.com/hashicorp/nomad-open-telemetry-getting-started
[MacOS releases]: https://github.com/open-telemetry/opentelemetry-collector-releases/releases
[Windows releases]: https://github.com/open-telemetry/opentelemetry-collector-releases/releases
