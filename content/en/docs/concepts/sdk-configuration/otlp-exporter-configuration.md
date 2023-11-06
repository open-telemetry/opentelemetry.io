---
title: OTLP Exporter Configuration
description: Environment variables for configuring your OTLP Exporter.
weight: 2
---

## Endpoint Configuration

The following environment variables let you configure an OTLP/gRPC or OTLP/HTTP
endpoint for your traces, metrics, and logs.

### `OTEL_EXPORTER_OTLP_ENDPOINT`

A base endpoint URL for any signal type, with an optionally-specified port
number. Helpful for when you're sending more than one signal to the same
endpoint and want one environment variable to control the endpoint.

**Default value:**

- gRPC: `"http://localhost:4317"`
- HTTP: `"http://localhost:4318"`

**Example:**

- gRPC: `export OTEL_EXPORTER_OTLP_ENDPOINT="https://my-api-endpoint:443"`
- HTTP: `export OTEL_EXPORTER_OTLP_ENDPOINT="http://my-api-endpoint/"`

For OTLP/HTTP, exporters in the SDK construct signal-specific URLs when this
environment variable is set. This means that if you're sending traces, metrics,
and logs, the following URLs are constructed from the example above:

- Traces: `"http://my-api-endpoint/v1/traces"`
- Metrics: `"http://my-api-endpoint/v1/metrics"`
- Logs: `"http://my-api-endpoint/v1/logs"`

### `OTEL_EXPORTER_OTLP_TRACES_ENDPOINT`

Endpoint URL for trace data only, with an optionally-specified port number.
Typically ends with `v1/traces` when using OTLP/HTTP.

**Default value:**

- gRPC: `"http://localhost:4317"`
- HTTP: `"http://localhost:4318/v1/traces"`

**Example:**

- gRPC:
  `export OTEL_EXPORTER_OTLP_TRACES_ENDPOINT="https://my-api-endpoint:443"`
- HTTP:
  `export OTEL_EXPORTER_OTLP_TRACES_ENDPOINT="http://my-api-endpoint/v1/traces"`

### `OTEL_EXPORTER_OTLP_METRICS_ENDPOINT`

Endpoint URL for metric data only, with an optionally-specified port number.
Typically ends with `v1/metrics` when using OTLP/HTTP.

**Default value:**

- gRPC: `"http://localhost:4317"`
- HTTP: `"http://localhost:4318/v1/metrics"`

**Example:**

- gRPC:
  `export OTEL_EXPORTER_OTLP_METRICS_ENDPOINT="https://my-api-endpoint:443"`
- HTTP:
  `export OTEL_EXPORTER_OTLP_METRICS_ENDPOINT="http://my-api-endpoint/v1/metrics"`

### `OTEL_EXPORTER_OTLP_LOGS_ENDPOINT`

Endpoint URL for log data only, with an optionally-specified port number.
Typically ends with `v1/logs` when using OTLP/HTTP.

**Default value:**

- gRPC: `"http://localhost:4317"`
- HTTP: `"http://localhost:4318/v1/logs"`

**Example:**

- gRPC: `export OTEL_EXPORTER_OTLP_LOGS_ENDPOINT="https://my-api-endpoint:443"`
- HTTP:
  `export OTEL_EXPORTER_OTLP_LOGS_ENDPOINT="http://my-api-endpoint/v1/logs"`

## Header configuration

The following environment variables let you configure additional headers as a
list of key-value pairs to add in outgoing gRPC or HTTP requests.

### `OTEL_EXPORTER_OTLP_HEADERS`

A list of headers to apply to all outgoing data (traces, metrics, and logs).

**Default value:** N/A

**Example:**
`export OTEL_EXPORTER_OTLP_HEADERS="api-key=key,other-config-value=value"`

### `OTEL_EXPORTER_OTLP_TRACES_HEADERS`

A list of headers to apply to all outgoing traces.

**Default value:** N/A

**Example:**
`export OTEL_EXPORTER_OTLP_TRACES_HEADERS="api-key=key,other-config-value=value"`

### `OTEL_EXPORTER_OTLP_METRICS_HEADERS`

A list of headers to apply to all outgoing metrics.

**Default value:** N/A

**Example:**
`export OTEL_EXPORTER_OTLP_METRICS_HEADERS="api-key=key,other-config-value=value"`

### `OTEL_EXPORTER_OTLP_LOGS_HEADERS`

A list of headers to apply to all outgoing logs.

**Default value:** N/A

**Example:**
`export OTEL_EXPORTER_OTLP_LOGS_HEADERS="api-key=key,other-config-value=value"`

## Timeout Configuration

The following environment variables configure the maximum time (in milliseconds)
an OTLP Exporter will wait before transmitting the net batch of data.

### `OTEL_EXPORTER_OTLP_TIMEOUT`

The timeout value for all outgoing data (traces, metrics, and logs) in
milliseconds.

**Default value:** `10000` (10s)

**Example:** `export OTEL_EXPORTER_OTLP_TIMEOUT=500`

### `OTEL_EXPORTER_OTLP_TRACES_TIMEOUT`

The timeout value for all outgoing traces in milliseconds.

**Default value:** 10000 (10s)

**Example:** `export OTEL_EXPORTER_OTLP_TRACES_TIMEOUT=500`

### `OTEL_EXPORTER_OTLP_METRICS_TIMEOUT`

The timeout value for all outgoing metrics in milliseconds.

**Default value:** 10000 (10s)

**Example:** `export OTEL_EXPORTER_OTLP_METRICS_TIMEOUT=500`

### `OTEL_EXPORTER_OTLP_LOGS_TIMEOUT`

The timeout value for all outgoing logs in milliseconds.

**Default value:** 10000 (10s)

**Example:** `export OTEL_EXPORTER_OTLP_LOGS_TIMEOUT=500`

### `OTEL_EXPORTER_OTLP_PROTOCOL`

Specifies the OTLP transport protocol to be used for all telemetry data.

**Default value:** SDK-dependent, but will typically be either `http/protobuf`
or `grpc`.

**Example:** `export OTEL_EXPORTER_OTLP_PROTOCOL=grpc`

Valid values are:

- `grpc` to use OTLP/gRPC
- `http/protobuf` to use OTLP/HTTP + protobuf
- `http/json` to use OTLP/HTTP + JSON

### `OTEL_EXPORTER_OTLP_TRACES_PROTOCOL`

Specifies the OTLP transport protocol to be used for trace data.

**Default value:** SDK-dependent, but will typically be either `http/protobuf`
or `grpc`.

**Example:** `export OTEL_EXPORTER_OTLP_TRACES_PROTOCOL=grpc`

Valid values are:

- `grpc` to use OTLP/gRPC
- `http/protobuf` to use OTLP/HTTP + protobuf
- `http/json` to use OTLP/HTTP + JSON

### `OTEL_EXPORTER_OTLP_METRICS_PROTOCOL`

Specifies the OTLP transport protocol to be used for metrics data.

**Default value:** SDK-dependent, but will typically be either `http/protobuf`
or `grpc`.

**Example:** `export OTEL_EXPORTER_OTLP_METRICS_PROTOCOL=grpc`

Valid values are:

- `grpc` to use OTLP/gRPC
- `http/protobuf` to use OTLP/HTTP + protobuf
- `http/json` to use OTLP/HTTP + JSON
