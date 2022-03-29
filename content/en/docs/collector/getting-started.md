---
title: Getting Started
spelling: cSpell:ignore dpkg GOARCH journalctl kubectl
weight: 1
---

If you aren't familiar with the deployment models, components, and repositories
applicable to the OpenTelemetry Collector, first review the [Data Collection
documentation](../../concepts/data-collection).

## Deployment

The OpenTelemetry Collector consists of a single binary and two primary deployment methods:

- **Agent:** A Collector instance running with the application or on the same
  host as the application (e.g. binary, sidecar, or daemonset).
- **Gateway:** One or more Collector instances running as a standalone service
  (e.g. container or deployment) typically per cluster, data center or region.

### Agent

It is recommended to deploy the Agent on every host within an environment. In
doing so, the Agent is capable of receiving telemetry data (push and pull
based) as well as enhancing telemetry data with metadata such as custom tags or
infrastructure information. In addition, the Agent can offload responsibilities
that client instrumentation would otherwise need to handle including batching,
retry, encryption, compression and more. OpenTelemetry instrumentation
libraries by default export their data assuming a locally running Collector is
available.

### Gateway

Additionally, a Gateway cluster can be deployed in every cluster, data center,
or region. A Gateway cluster runs as a standalone service and can offer
advanced capabilities over the Agent including tail-based sampling. In
addition, a Gateway cluster can limit the number of egress points required to
send data as well as consolidate API token management. Each Collector instance
in a Gateway cluster operates independently so it is easy to scale the
architecture based on performance needs with a simple load balancer. If a
gateway cluster is deployed, it usually receives data from Agents deployed
within an environment.

## Getting Started

### Demo

Deploys a load generator, agent and gateway as well as Jaeger, Zipkin and
Prometheus back-ends. More information can be found on the demo
[README.md](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/examples/demo)

```console
$ git clone git@github.com:open-telemetry/opentelemetry-collector-contrib.git; \
    cd opentelemetry-collector-contrib/examples/demo; \
    docker-compose up -d
```

### Kubernetes

Deploys an agent as a daemonset and a single gateway instance.

```console
$ kubectl apply -f https://raw.githubusercontent.com/open-telemetry/opentelemetry-collector/main/examples/k8s/otel-config.yaml
```

The example above is meant to serve as a starting point, to be extended and
customized before actual production usage. For production-ready customization and installation, see [OpenTelemetry Helm Charts](https://github.com/open-telemetry/opentelemetry-helm-charts).

The [OpenTelemetry
Operator](https://github.com/open-telemetry/opentelemetry-operator) can also be
used to provision and maintain an OpenTelemetry Collector instance, with
features such as automatic upgrade handling, `Service` configuration based on
the OpenTelemetry configuration, automatic sidecar injection into deployments,
among others.

### Nomad

Reference job files to deploy the Collector as an agent, gateway and in the
full demo can be found at
[https://github.com/hashicorp/nomad-open-telemetry-getting-started](https://github.com/hashicorp/nomad-open-telemetry-getting-started).

### Linux Packaging

Every Collector release includes DEB and RPM packaging for Linux amd64/arm64
systems. The packaging includes a default configuration that can be found at
`/etc/otelcol/config.yaml` post-installation.

> Please note that systemd is require for automatic service configuration

To get started on Debian systems run the following replacing `v0.44.0` with the
version of the Collector you wish to run and `amd64` with the appropriate
architecture.

```console
$ sudo apt-get update
$ sudo apt-get -y install wget systemctl
$ wget https://github.com/open-telemetry/opentelemetry-collector-releases/releases/download/v0.44.0/otelcol_0.44.0_linux_amd64.deb
$ dpkg -i otelcol_0.44.0_linux_amd64.deb
```

To get started on Red Hat systems run the following replacing `v0.44.0` with the
version of the Collector you wish to run and `x86_64` with the appropriate
architecture.

```console
$ sudo yum update
$ sudo yum -y install wget systemctl
$ wget https://github.com/open-telemetry/opentelemetry-collector-releases/releases/download/v0.44.0/otelcol_0.44.0_linux_amd64.rpm
$ rpm -ivh otelcol_0.44.0_linux_amd64.rpm
```

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

### Windows Packaging

Windows [releases](https://github.com/open-telemetry/opentelemetry-collector-releases/releases) are packaged as gzipped tarballs (`.tar.gz`) and will need to be unpacked with a tool that supports this compression format.

Every Collector release includes an `otelcol.exe` executable that you can run after unpacking.

### Local

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
