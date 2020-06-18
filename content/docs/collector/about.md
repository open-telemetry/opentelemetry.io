---
title: "Getting Started"
weight: 1
---

## Introduction

The OpenTelemetry Collector offers a vendor-agnostic implementation on how to
receive, process, and export telemetry data in a seamless way. In addition,
it removes the need to run, operate, and maintain multiple agents/collectors in
order to support open-source observability data formats (e.g. Jaeger, Prometheus,
etc.) sending to multiple open-source or commercial back-ends.

Objectives:

- Usable: Reasonable default configuration, supports popular protocols, runs and collects out of the box.
- Performant: Highly stable and performant under varying loads and configurations.
- Observable: An exemplar of an observable service.
- Extensible: Customizable without touching the core code.
- Unified: Single codebase, deployable as an agent or collector with support for traces, metrics, and logs (future).

## Deployment

The OpenTelemetry Collector consists of a single binary and two deployment methods:

1. An agent running with the application or on the same host as the application
(e.g. binary, sidecar, or daemonset)
2. A collector running as a standalone service (e.g. container or deployment)

### Agent

It is recommended to deploy the Agent on every host within an environment. In
doing so, the Agent is capable of adding metadata to observability data it
receives or collects. In addition, the Agent can offload responsibilities that
client instrumentation would otherwise need to handle including batching,
retry, encryption, compression, and more.

### Collector

Optionally, a Collector can be deployed in every cluster / datacenter / region.
The Collector runs as a standalone service and can offer advanced capabilities
over the Agent including tail-based sampling. In addition, the Collectors can
limit the number of egress points required to send data. Each Collector
operates independently so it is easy to scale the architecture based on
performance needs.

## Getting Started

### Demo

Deploys a load generator, agent, and collector as well as Jaeger, Zipkin and
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
    docker run --rm -p 55678:55678 -p 55679:55679 \
        -v "${PWD}/otel-local-config.yaml":/otel-local-config.yaml \
        --name otelcol otel/opentelemetry-collector \
        --config otel-local-config.yaml; \
    kill $pid1; docker stop otelcol
```

### Kubernetes

Deploys an agent as a daemonset and a single instance of the collector.

```bash
$ kubectl apply -f https://raw.githubusercontent.com/open-telemetry/opentelemetry-collector/master/examples/k8s.yaml
```

### Local

Builds the latest version of the collector based on the local operating system,
runs the binary with all receivers enabled and exports all the data it receivers
locally to a file. Data is sent to the container and the container scrapes its own
Prometheus metrics.

```bash
$ git clone git@github.com:open-telemetry/opentelemetry-collector.git; \
    cd opentelemetry-collector; make otelcol; \
    go build examples/main.go; ./examples/main.go & pid1="$!"; \
    ./bin/$($GOOS)/otelcol --config ./examples/otel-local-config.yaml; kill $pid1
```

## Other

The OpenTelemetry collector can be extended or embedded into other applications.

The list of applications extending the collector:

* [opentelemetry-collector-contrib](https://github.com/open-telemetry/opentelemetry-collector-contrib)
* [jaeger-opentelemetry-collector](https://github.com/jaegertracing/jaeger-opentelemetry-collector)
