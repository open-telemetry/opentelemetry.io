---
Title: "Getting Started"
Weight: 1
---

## Introduction

The OpenTelemetry Collector offers a vendor-agnostic way to
receive, process, and export telemetry data. It removes the need to run,
operate, and maintain multiple agents or collectors in order to support
open-source observability data formats (e.g. Jaeger, Prometheus, etc.) sending
to one or more open source or commercial backends.

Objectives:

- **Usable**: Reasonable default configuration. Supports popular protocols, runs and collects out-of-the-box.
- **Performant**: Highly stable and performant under varying loads and configurations.
- **Observable**: An exemplar of an observable service.
- **Extensible**: Customizable without touching the core code.
- **Unified**: Single codebase. Deployable as an agent or collector with support for traces, metrics, and logs (future).

Projects:

- [opentelemetry-collector](https://github.com/open-telemetry/opentelemetry-collector):
  The core repository with primary capabilities and support for major
  open-source receivers and exporters.
- [opentelemetry-collector-contrib](https://github.com/open-telemetry/opentelemetry-collector-contrib):
  The community repository which is a superset of opentelemetry-collector plus
  non-primary capabilities and support for other open-source and commercial
  receivers and exporters.

## Deployment

The OpenTelemetry Collector consists of a single binary and the following deployment methods:

1. An agent running with the application or on the same host as the application
(e.g. binary, sidecar, or daemonset).
2. A gateway running as a standalone service (e.g. container or deployment)
typically per cluster, datacenter, or region.

### Agent

It's recommended that you deploy the Agent on every host within an environment. In
doing so, the Agent is capable of receiving telemetry data (push and pull-based)
as well as enhancing telemetry data with metadata such as custom tags or
infrastructure information. In addition, the Agent can offload responsibilities
that client instrumentation would otherwise need to handle including batching,
retry, encryption, compression, and more.

### Gateway

You can deploy a Gateway in every cluster, datacenter, or region.
The Gateway runs as a standalone service and offers advanced capabilities
over the Agent including tail-based sampling. The Gateway can also
limit the number of egress points required to send data as well as consolidate
API token management. Each Collector instance operates independently so it's
easy to scale the architecture based on performance needs.

## Getting Started

### Demo

Deploys a load generator, agent, and gateway as well as Jaeger, Zipkin, and
Prometheus backends. For more information, see the demo
[README.md](https://github.com/open-telemetry/opentelemetry-collector/tree/master/examples/demo)

```bash
$ git clone git@github.com:open-telemetry/opentelemetry-collector.git; \
    cd opentelemetry-collector/examples/demo; \
    docker-compose up -d
```

### Docker

Starts a Docker container of the
[core](https://github.com/open-telemetry/opentelemetry-collector)
version of the Collector with all receivers enabled and exports all the data it
receives locally to a file. Data is sent to the container and the container
scrapes its own Prometheus metrics.

```bash
$ git clone git@github.com:open-telemetry/opentelemetry-collector.git; \
    cd opentelemetry-collector/examples; \
    go build main.go; ./main & pid1="$!";
    docker run --rm -p 13133:13133 -p 14250:14250 -p 14268:14268 \
      -p 55678-55680:55678-55680 -p 6060:6060 -p 7276:7276 -p 8888:8888 \
      -p 9411:9411 -p 9943:9943 \
      -v "${PWD}/otel-local-config.yaml":/otel-local-config.yaml \
      --name otelcol otel/opentelemetry-collector \
      --config otel-local-config.yaml; \
    kill $pid1; docker stop otelcol
```

### Kubernetes

Deploys an agent as a daemonset and a single gateway instance.

```bash
$ kubectl apply -f https://raw.githubusercontent.com/open-telemetry/opentelemetry-collector/master/examples/k8s/otel-config.yaml
```

The example above is meant to serve as a starting point, to be extended and
customized before actual production usage.

You can also use the [OpenTelemetry
Operator](https://github.com/open-telemetry/opentelemetry-operator) to provision and maintain
an OpenTelemetry Collector instance. The Operator includes
features such as automatic upgrade handling, `Service` configuration based on
the OpenTelemetry configuration, automatic sidecar injection into deployments,
and more.

### Local

Builds the latest version of the collector based on the local operating system,
runs the binary with all receivers enabled and exports all the data it receives
locally to a file. Data is sent to the container and the container scrapes its own
Prometheus metrics.

```bash
$ git clone git@github.com:open-telemetry/opentelemetry-collector.git; \
    cd opentelemetry-collector; make otelcol; \
    go build examples/demo/app/main.go; ./main & pid1="$!"; \
    ./bin/otelcol_$(go env GOOS)_$(go env GOARCH) --config ./examples/local/otel-config.yaml; kill $pid1
```

## Other

You can extend the OpenTelemetry collector or embedded it into other applications.

The following applications extend the collector:

- [opentelemetry-collector-contrib](https://github.com/open-telemetry/opentelemetry-collector-contrib)
- [jaeger](https://github.com/jaegertracing/jaeger/tree/master/cmd/opentelemetry)

For a guide on how to create your own distribution, see the following blog post:
["Building your own OpenTelemetry Collector distribution"](https://medium.com/p/42337e994b63)

If you're building your own distribution, the [OpenTelemetry Collector
Builder](https://github.com/observatorium/opentelemetry-collector-builder)
might be a good starting point.
