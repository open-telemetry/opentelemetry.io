---
title: "Exporter Selection Configuration"
description: >-
 Environment Variables for configuring which exporter to use.
weight: 10
---

The following environment variables let you configure one or more exporters when set.

## `OTEL_TRACES_EXPORTER`

Specifies which exporter is used for traces.

**Default value:** `"otlp"`

**Example:**

`export OTEL_TRACES_EXPORTER="jaeger"`

Accepted values for are:

- `"otlp"`: [OTLP](./protocol/otlp.md)
- `"jaeger"`: export in Jaeger data model
- `"zipkin"`: [Zipkin](https://zipkin.io/zipkin-api/) (Defaults to [protobuf](https://github.com/openzipkin/zipkin-api/blob/master/zipkin.proto) format)
- `"none"`: No automatically configured exporter for traces.

## `OTEL_METRICS_EXPORTER`

Specifies which exporter is used for metrics.

**Default value:** `"otlp"`

**Example:**

`export OTEL_TRACES_EXPORTER="prometheus"`

Accepted values for `OTEL_METRICS_EXPORTER` are:

- `"otlp"`: [OTLP](./protocol/otlp.md)
- `"prometheus"`: [Prometheus](https://github.com/prometheus/docs/blob/master/content/docs/instrumenting/exposition_formats.md)
- `"none"`: No automatically configured exporter for metrics.

## `OTEL_LOGS_EXPORTER`

Specifies which exporter is used for logs.

**Default value:** `"otlp"`

**Example:**

`export OTEL_TRACES_EXPORTER="otlp"`

Accepted values for `OTEL_LOGS_EXPORTER` are:

- `"otlp"`: [OTLP](./protocol/otlp.md)
- `"none"`: No automatically configured exporter for logs.