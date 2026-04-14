---
title: Quick start
description: Set up and collect telemetry in minutes!
aliases: [getting-started]
weight: 1
cSpell:ignore: docker dokey gobin okey telemetrygen
---

<!-- markdownlint-disable ol-prefix blanks-around-fences -->

The OpenTelemetry Collector receives telemetry such as
[traces](/docs/concepts/signals/traces/),
[metrics](/docs/concepts/signals/metrics/), and
[logs](/docs/concepts/signals/logs/), processes it, and forwards it to one or
more observability backends through its component pipeline.

> [!NOTE]
>
> This quick start demo creates a basic local setup. The goal is to show
> you how the Collector works, not to set up a production-ready environment.

In this guide, you will:

- Start a local instance of the OpenTelemetry Collector
- Generate trace data and send it to the Collector
- Check that the Collector receives and processes the data

By the end, you will have a simple pipeline running on your machine and a
clearer idea of how the Collector fits into an observability stack. If you want
more context before getting started, see the [Collector](/docs/collector)
overview.

## Prerequisites

Before you begin, make sure your environment has the following tools installed:

- [Docker](https://www.docker.com/) or any compatible container runtime — used
  to run the Collector
- [Go](https://go.dev/) 1.20 or higher — used to install the telemetry generator
- [`GOBIN` environment variable][gobin] set — ensures installed Go binaries are
  available in your PATH[^1]

If `GOBIN` isn't set, run:

```sh
export GOBIN=${GOBIN:-$(go env GOPATH)/bin}
```

This guide uses `bash`. If you're using a different shell, you may need to
adjust the command syntax.

[^1]:
    For more information, see
    [Your first program](https://go.dev/doc/code#Command).

## Set up the environment

1. Pull the OpenTelemetry Collector Docker image:

```sh
   docker pull otel/opentelemetry-collector:{{% param vers %}}
```

2. Install [telemetrygen][], which we'll use to simulate a client generating telemetry:

```sh
   go install github.com/open-telemetry/opentelemetry-collector-contrib/cmd/telemetrygen@latest
```

## Generate and collect telemetry

3. Start the Collector:

```sh
   docker run \
     -p 127.0.0.1:4317:4317 \
     -p 127.0.0.1:4318:4318 \
     -p 127.0.0.1:55679:55679 \
     otel/opentelemetry-collector:{{% param vers %}} \
     2>&1 | tee collector-output.txt
```

The previous command runs the Collector locally and opens three ports:

- `4317` — OTLP over gRPC (the default for most SDKs)
- `4318` — OTLP over HTTP, for clients that don't support gRPC
- `55679` — ZPages, a built-in debug UI you can open in the browser

4. In a separate terminal, generate some traces:

```sh
   $GOBIN/telemetrygen traces --otlp-insecure --traces 3
```

You will see output confirming the traces were sent:

```text
   2024-01-16T14:33:15.692-0500  INFO  traces/worker.go:99  traces generated  {"worker": 0, "traces": 3}
   2024-01-16T14:33:15.692-0500  INFO  traces/traces.go:58  stop the batch span processor
```

5. Back in the Collector terminal, you should see trace ingest activity similar
   to the following:

```console
  $ grep -E '^Span|(ID|Name|Kind|time|Status \w+)\s+:' ./collector-output.txt
  Span #0
      Trace ID       : f30faffbde5fcf71432f89da1bf7bc14
      Parent ID      : 6f1ff7f9cf4ec1c7
      ID             : 8d1e820c1ac57337
      Name           : okey-dokey
      Kind           : Server
      Start time     : 2024-01-16 14:13:54.585877 +0000 UTC
      End time       : 2024-01-16 14:13:54.586 +0000 UTC
      Status code    : Unset
      Status message :
  Span #1
      Trace ID       : f30faffbde5fcf71432f89da1bf7bc14
      Parent ID      :
      ID             : 6f1ff7f9cf4ec1c7
      Name           : lets-go
      Kind           : Client
      Start time     : 2024-01-16 14:13:54.585877 +0000 UTC
      End time       : 2024-01-16 14:13:54.586 +0000 UTC
      Status code    : Unset
      Status message :
  ...
```

You should see span details like Trace ID, Name, Kind, and timestamps, that's
the Collector receiving and processing your data.

6. To explore the traces visually, open <http://localhost:55679/debug/tracez> in
   your browser and select one of the traces from the table.

7. Press <kbd>Control-C</kbd> to stop the Collector.

## Next steps

At this point, you've run the Collector locally and seen how it handles
telemetry end to end. From here, you can start digging into how it's used in
real setups:

- [Configuration](/docs/collector/configuration): Learn how the Collector's
  config file works and how to connect it to a real backend like Jaeger or
  Prometheus.
- [Deployment Methods](/docs/collector/deploy/): Understand the difference
  between running the Collector as an agent versus a gateway.
- [Install the Collector](/docs/collector/install/): Explore installation
  options beyond Docker, including binaries and Kubernetes.
- [Component registry](/ecosystem/registry/?language=collector): Browse
  available receivers, processors, and exporters to extend your pipeline.

[gobin]: https://pkg.go.dev/cmd/go#hdr-Environment_variables
[logs]: /docs/concepts/signals/logs/
[metrics]: /docs/concepts/signals/metrics/
[telemetrygen]:
  https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/cmd/telemetrygen
[traces]: /docs/concepts/signals/traces/
