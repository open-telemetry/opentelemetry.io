---
title: Getting started
description:
  Capture telemetry from a Go application without writing any instrumentation
  code.
weight: 5
cSpell:ignore: otelc
---

This page shows you how to build a Go application with compile-time
instrumentation and see the telemetry it produces.

## Prerequisites

- [Go](https://go.dev/) 1.25 or newer
- `git` and `make`

## Build the tool

The `otelc` tool is built from the project repository:

```sh
git clone https://github.com/open-telemetry/opentelemetry-go-compile-instrumentation.git
cd opentelemetry-go-compile-instrumentation
make build
```

This produces an `otelc` binary in the repository root. Add it to your `PATH`,
or note its location — the following steps assume `otelc` is on your `PATH`:

```sh
export PATH=$PATH:$(pwd)
```

## Instrument your application

From your application's module directory, prefix your usual `go build` command
with `otelc`:

```sh
otelc go build -o myapp .
```

The tool intercepts the build, applies the instrumentation rules that match your
application and its dependencies, and produces an instrumented binary.
Everything else about the build — flags, package arguments, output paths — works
exactly as it does with plain `go build`.

## Run the application and export telemetry

Instrumented applications are configured through the standard OpenTelemetry
environment variables. For example, to send telemetry to a local
[Collector](/docs/collector/) over OTLP:

```sh
export OTEL_SERVICE_NAME=myapp
export OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4317
./myapp
```

See [Configuration](../configuration) for the full list of environment variables
the instrumentation recognizes.

## Try the demo

The repository ships demo applications and a complete observability stack
(Collector, Jaeger, Prometheus, and Grafana) so you can see the produced
telemetry end to end. The stack runs on [Docker](https://www.docker.com/), so
make sure Docker is available first. From the repository root, run:

```sh
cd demo/infrastructure/docker-compose
make start
```

See the
[demo directory](https://github.com/open-telemetry/opentelemetry-go-compile-instrumentation/tree/main/demo)
for details on the demo applications and infrastructure.

## Next steps

- Check which [libraries are instrumented](../supported-libraries) out of the
  box.
- Learn how to [configure](../configuration) the tool and the telemetry it
  produces.
