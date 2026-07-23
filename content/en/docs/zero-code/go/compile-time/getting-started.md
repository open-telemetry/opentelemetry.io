---
title: Getting started
description:
  Capture telemetry from a Go application without writing any instrumentation
  code.
weight: 5
cSpell:ignore: GOFLAGS otelc toolexec
---

This page shows you how to build a Go application with compile-time
instrumentation and see the telemetry it produces.

## Prerequisites

- [Go](https://go.dev/) 1.25 or newer

## Install otelc

The project ships a command-line tool called `otelc` that wraps the standard Go
toolchain. Install it with `go install`:

```sh
go install go.opentelemetry.io/otelc/tool/cmd/otelc@latest
```

This places the `otelc` binary in your Go bin directory (`$(go env GOPATH)/bin`
by default). The following steps assume `otelc` is on your `PATH`.

Alternatively, you can build the tool from source, for example to try unreleased
changes. This requires `git` and `make`:

```sh
git clone https://github.com/open-telemetry/opentelemetry-go-compile-instrumentation.git
cd opentelemetry-go-compile-instrumentation
make build
```

This produces an `otelc` binary in the repository root, which you can add to
your `PATH`:

```sh
export PATH=$PATH:$(pwd)
```

## Instrument your application

The change to your build is a single line: run `otelc go build` where you used
to run `go build`. From your application's module directory:

```sh
otelc go build -o myapp .
```

Everything after `go` is forwarded to the toolchain, so the rest of your build
stays the same. The tool intercepts the build, applies the instrumentation rules
that match your application and its dependencies, and produces an instrumented
binary. Everything else about the build — flags, package arguments, output paths
— works exactly as it does with plain `go build`.

By default, `otelc` discovers the supported libraries in your module and
instruments them automatically, with no configuration and no code changes.

### Keep using go build

If you'd rather not change your build command, run `otelc setup` once to prepare
the module, then point the Go toolchain at `otelc` through `GOFLAGS` and keep
running `go build` as usual:

```sh
otelc setup
export GOFLAGS="${GOFLAGS} '-toolexec=otelc toolexec'"
go build -o myapp .
```

This is a good fit when the `go build` command is fixed by an existing build
system or script that you don't want to change.

## Instrument a container build

The same swap works in a container build: install `otelc` in your build stage
and replace the `go build` line in your `Dockerfile` with `otelc go build`:

```dockerfile
# Build stage
FROM golang:1.25 AS build
WORKDIR /src
COPY . .
RUN go install go.opentelemetry.io/otelc/tool/cmd/otelc@latest
RUN otelc go build -o /out/myapp .

# Runtime stage
FROM gcr.io/distroless/base-debian12
COPY --from=build /out/myapp /myapp
ENTRYPOINT ["/myapp"]
```

The instrumentation is compiled into the binary, so the runtime stage needs
nothing extra — no agent to attach and no additional startup steps.

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
