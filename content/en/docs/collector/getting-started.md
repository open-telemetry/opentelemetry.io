---
title: Getting Started
spelling: cSpell:ignore dpkg GOARCH journalctl kubectl
weight: 1
---

If you aren't familiar with the deployment models, components, and repositories
applicable to the OpenTelemetry Collector, first review the [Data Collection](../../concepts/data-collection)
and [Deployment Methods](./deployment_methods) documentation

## Demo

Deploys a load generator, agent and gateway as well as Jaeger, Zipkin and
Prometheus back-ends. More information can be found on the demo
[README.md](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/examples/demo)

```console
git clone git@github.com:open-telemetry/opentelemetry-collector-contrib.git; \
    cd opentelemetry-collector-contrib/examples/demo; \
    docker-compose up -d
```

## Docker

Pull a docker image and run the collector in a container. Replace `0.49.0`
with the version of the Collector you wish to run.

```console
docker docker pull ghcr.io/open-telemetry/opentelemetry-collector-releases/opentelemetry-collector-contrib:0.49.0
docker run ghcr.io/open-telemetry/opentelemetry-collector-releases/opentelemetry-collector-contrib:0.49.0
```

## Kubernetes

Deploys an agent as a daemonset and a single gateway instance.

```console
kubectl apply -f https://raw.githubusercontent.com/open-telemetry/opentelemetry-collector/main/examples/k8s/otel-config.yaml
```

The example above is meant to serve as a starting point, to be extended and
customized before actual production usage. For production-ready customization and installation, see
[OpenTelemetry Helm Charts](https://github.com/open-telemetry/opentelemetry-helm-charts).

The [OpenTelemetry
Operator](https://github.com/open-telemetry/opentelemetry-operator) can also be
used to provision and maintain an OpenTelemetry Collector instance, with
features such as automatic upgrade handling, `Service` configuration based on
the OpenTelemetry configuration, automatic sidecar injection into deployments,
among others.

## Nomad

Reference job files to deploy the Collector as an agent, gateway and in the
full demo can be found at
[https://github.com/hashicorp/nomad-open-telemetry-getting-started](https://github.com/hashicorp/nomad-open-telemetry-getting-started).

## Linux Packaging

Every Collector release includes APK, DEB and RPM packaging for Linux amd64/arm64
systems. The packaging includes a default configuration that can be found at
`/etc/otelcol/config.yaml` post-installation.

> Please note that systemd is require for automatic service configuration

### Installation

#### APK

To get started on alpine systems run the following replacing `v0.49.0` with the
version of the Collector you wish to run.

```console
apk update
apk add wget shadow
wget https://github.com/open-telemetry/opentelemetry-collector-releases/releases/download/v0.49.0/otelcol-contrib_0.49.0_linux_amd64.apk
apk add --allow-untrusted otelcol-contrib_0.49.0_linux_amd64.apk
```

#### DEB

To get started on Debian systems run the following replacing `v0.49.0` with the
version of the Collector you wish to run and `amd64` with the appropriate
architecture.

```console
sudo apt-get update
sudo apt-get -y install wget systemctl
wget https://github.com/open-telemetry/opentelemetry-collector-releases/releases/download/v0.49.0/otelcol_0.49.0_linux_amd64.deb
sudo dpkg -i otelcol_0.49.0_linux_amd64.deb
```

#### RPM

To get started on Red Hat systems run the following replacing `v0.49.0` with the
version of the Collector you wish to run and `x86_64` with the appropriate
architecture.

```console
sudo yum update
sudo yum -y install wget systemctl
wget https://github.com/open-telemetry/opentelemetry-collector-releases/releases/download/v0.49.0/otelcol_0.49.0_linux_amd64.rpm
sudo rpm -ivh otelcol_0.49.0_linux_amd64.rpm
```

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
sudo systemctl restart otelcol
```

To check the output from the `otelcol` service, run:

```console
sudo journalctl -u otelcol
```

## MacOS Packaging

MacOS [releases](https://github.com/open-telemetry/opentelemetry-collector-releases/releases)
are available for Intel & ARM based systems.
They are packaged as gzipped tarballs (`.tar.gz`) and will need to be unpacked with a tool
that supports this compression format.

Every Collector release includes an `otelcol` executable that you can run after unpacking.

## Windows Packaging

Windows [releases](https://github.com/open-telemetry/opentelemetry-collector-releases/releases) are packaged as gzipped
tarballs (`.tar.gz`) and will need to be unpacked with a tool that supports this compression format.

Every Collector release includes an `otelcol.exe` executable that you can run after unpacking.

## Local

Builds the latest version of the collector based on the local operating system,
runs the binary with all receivers enabled and exports all the data it receives
locally to a file. Data is sent to the container and the container scrapes its own
Prometheus metrics. The following example uses two terminal windows to better illustrate
the collector.   In the first terminal window run the following:

```console
git clone https://github.com/open-telemetry/opentelemetry-collector.git
cd opentelemetry-collector
make install-tools
make otelcorecol
./bin/otelcorecol_* --config ./examples/local/otel-config.yaml
```

In a second terminal window, you can test the newly built collector
by doing the following:

```console
git clone https://github.com/open-telemetry/opentelemetry-collector-contrib.git
cd opentelemetry-collector-contrib/examples/demo/server
go build -o main main.go; ./main & pid1="$!"
cd ../client
go build -o main main.go; ./main
```

To stop the client, use the Ctrl-c command.  To stop the server, use the `kill $pid1` command.
To stop the collector, you can use Ctrl-c command in its terminal window as well.

 **Note:**  The above commands demonstrate the process in a bash shell. These commands may vary slightly
 for other shells.
