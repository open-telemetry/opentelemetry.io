---
title: "Getting Started"
weight: 1
---

The OpenTelemetry Collector consists of the following projects:

- [opentelemetry-collector](https://github.com/open-telemetry/opentelemetry-collector):
  The core repository with primary capabilities and support for major
  open-source receivers and exporters.
- [opentelemetry-collector-contrib](https://github.com/open-telemetry/opentelemetry-collector-contrib):
  The community repository which is a superset of opentelemetry-collector plus
  non-primary capabilities and support for other open-source and commercial
  receivers and exporters.

## Deployment

The OpenTelemetry Collector consists of a single binary and two deployment methods:

1. An agent running with the application or on the same host as the application
(e.g. binary, sidecar, or daemonset).
2. A gateway running as a standalone service (e.g. container or deployment)
typically per cluster, datacenter or region.

### Agent

It is recommended to deploy the Agent on every host within an environment. In
doing so, the Agent is capable of receiving telemetry data (push and pull
based) as well as enhancing telemetry data with metadata such as custom tags or
infrastructure information. In addition, the Agent can offload responsibilities
that client instrumentation would otherwise need to handle including batching,
retry, encryption, compression and more.

### Gateway

Additionally, a Gateway can be deployed in every cluster, datacenter, or region.
The Gateway runs as a standalone service and can offer advanced capabilities
over the Agent including tail-based sampling. In addition, the Gateway can
limit the number of egress points required to send data as well as consolidate
API token management. Each Collector instance operates independently so it is
easy to scale the architecture based on performance needs.

## Getting Started

### Demo

Deploys a load generator, agent and gateway as well as Jaeger, Zipkin and
Prometheus back-ends. More information can be found on the demo
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

The [OpenTelemetry
Operator](https://github.com/open-telemetry/opentelemetry-operator) can also be
used to provision and maintain an OpenTelemetry Collector instance, with
features such as automatic upgrade handling, `Service` configuration based on
the OpenTelemetry configuration, automatic sidecar injection into deployments,
among others.

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

The OpenTelemetry collector can be extended or embedded into other applications.

The list of applications extending the collector:

- [opentelemetry-collector-contrib](https://github.com/open-telemetry/opentelemetry-collector-contrib)
- [jaeger](https://github.com/jaegertracing/jaeger/tree/master/cmd/opentelemetry)

A guide on how to create your own distribution is available in this blog post:
["Building your own OpenTelemetry Collector distribution"](https://medium.com/p/42337e994b63)

If you are building your own distribution, the [OpenTelemetry Collector
Builder](https://github.com/observatorium/opentelemetry-collector-builder)
might be a good starting point.
