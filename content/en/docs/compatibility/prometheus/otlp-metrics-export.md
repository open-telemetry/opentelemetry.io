---
title: OTLP metrics export to Prometheus
linkTitle: OTLP metrics export
---

## Introduction

Prometheus typically collects metrics using a pull-based model, where it scrapes
metrics endpoints exposed by services at regular intervals. This scrape-based
approach is the standard and recommended setup for production because it is
predictable, scalable, and well understood in most observability systems.

In addition to this model, Prometheus can also accept metrics using an
OpenTelemetry (OTLP) ingestion endpoint. In this setup, OpenTelemetry SDKs
export metrics using OTLP over HTTP, and Prometheus acts as an OTLP receiver
instead of scraping metrics. This approach is generally used in simpler setups,
experiments, or local development environments where a full scrape-based
infrastructure is not available or necessary.

This guide explains how to configure direct OTLP metric export from
OpenTelemetry SDKs to a Prometheus OTLP endpoint. It covers required environment
variables, exporter configuration, and key considerations such as service
identification, export intervals, and operational trade-offs.

## Prerequisite

Before you begin, make sure the following requirements are met:

- Set up Prometheus. Follow the
  [example prometheus.yml configuration in this Prometheus guide](https://prometheus.io/docs/guides/opentelemetry/#configuring-prometheus).
- [Enable the OTLP receiver](https://prometheus.io/docs/guides/opentelemetry/#enable-the-otlp-receiver)

Once you have Prometheus set up, you can move on to configure your application
to send metrics directly to a OTLP ingestion endpoint.

### Use environment variables

You can configure OpenTelemetry SDKs and instrumentation libraries with
[standard environment variables](/docs/languages/sdk-configuration/). Set the
environment variables before starting your application. The following
OpenTelemetry variables are needed to send OpenTelemetry metrics to a Prometheus
server on localhost:

```bash
export OTEL_EXPORTER_OTLP_PROTOCOL=http/protobuf
export OTEL_EXPORTER_OTLP_METRICS_ENDPOINT=http://localhost:9090/api/v1/otlp
```

The OTEL_EXPORTER_OTLP_METRICS_ENDPOINT environment variable is treated as a
base URL. The `/v1/metrics` path is appended as defined by the
[OpenTelemetry specification](https://github.com/open-telemetry/opentelemetry-specification/blob/v1.50.0/specification/protocol/exporter.md#endpoint-urls-for-otlphttp).

Turn off traces and logs when using Prometheus if you only need metrics:

```bash
export OTEL_TRACES_EXPORTER=none
export OTEL_LOGS_EXPORTER=none
```

The default push interval for OpenTelemetry metrics is 60 seconds. The following
sets a 15-second interval for more responsive monitoring and faster alerting
speed. Shorter intervals may increase network and processing overhead.

```bash
export OTEL_METRIC_EXPORT_INTERVAL=15000
```

If your instrumentation library does not provide `service.name` and
`service.instance.id` out-of-the-box, it is highly recommended to set them.
Without these attributes, it becomes difficult to reliably identify services or
distinguish between instances, making debugging and aggregation significantly
harder. The example below assumes that the `uuidgen` command is available on
your system.

```bash
export OTEL_SERVICE_NAME="my-example-service"
export OTEL_RESOURCE_ATTRIBUTES="service.instance.id=$(uuidgen)"
```

> [!NOTE]
>
> Make sure that `service.instance.id` is unique for each instance, and that a
> new `service.instance.id` is generated whenever a resource attribute changes.
> The [recommended way](/docs/specs/semconv/resource/service/#service-instance)
> is to generate a new UUID on each startup of an instance.

### Configure telemetry

Update your OpenTelemetry Configuration to use the same `exporter` and `reader`
from the [OTLP](#otlp-dependencies) setup. If the environment variables are set
up and loaded correctly, the OpenTelemetry SDK reads them automatically.
