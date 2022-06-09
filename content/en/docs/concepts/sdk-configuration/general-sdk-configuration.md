---
title: "General SDK Configuration"
description: >-
 General-purpose environment variables for configuring an OpenTelemetry SDK.
weight: 1
---

The following environment variables are respected by every OpenTelemetry SDK,
regardless of language.

## `OTEL_SERVICE_NAME`

Sets the value of the
[`service.name`](/docs/reference/specification/resource/semantic_conventions/#service) resource
attribute.

**Default value:** `"unknown_service"`

If `service.name` is also provided in `OTEL_RESOURCE_ATTRIBUTES`, then
`OTEL_SERVICE_NAME` takes precedence.

**Example:**

`export OTEL_SERVICE_NAME="your-service-name"`

## `OTEL_RESOURCE_ATTRIBUTES`

Key-value pairs to be used as resource attributes. See [Resource
SDK](/docs/reference/specification/resource/sdk#specifying-resource-information-via-an-environment-variable)
for more details.

**Default value:** Empty.

See [Resource semantic
conventions](/docs/reference/specification/resource/semantic_conventions/#semantic-attributes-with-sdk-provided-default-value)
for semantic conventions to follow for common resource types.

**Example:**

`export OTEL_RESOURCE_ATTRIBUTES="key1=value1,key2=value2"`

## `OTEL_TRACES_SAMPLER`

Specifies the Sampler used to sample traces by the SDK.

**Default value:** `"parentbased_always_on"`

**Example:**

`export OTEL_TRACES_SAMPLER="traceidratio"`

Accepted values for `OTEL_TRACES_SAMPLER` are:

- `"always_on"`: `AlwaysOnSampler`
- `"always_off"`: `AlwaysOffSampler`
- `"traceidratio"`: `TraceIdRatioBased`
- `"parentbased_always_on"`: `ParentBased(root=AlwaysOnSampler)`
- `"parentbased_always_off"`: `ParentBased(root=AlwaysOffSampler)`
- `"parentbased_traceidratio"`: `ParentBased(root=TraceIdRatioBased)`
- `"parentbased_jaeger_remote"`: `ParentBased(root=JaegerRemoteSampler)`
- `"jaeger_remote"`: `JaegerRemoteSampler`
- `"xray"`: [AWS X-Ray Centralized
  Sampling](https://docs.aws.amazon.com/xray/latest/devguide/xray-console-sampling.html)
  (_third party_)

## `OTEL_TRACES_SAMPLER_ARG`

Specifies arguments, if applicable, to the sampler defined in by
`OTEL_TRACES_SAMPLER`. The specified value will only be used if
`OTEL_TRACES_SAMPLER` is set. Each Sampler type defines its own expected input,
if any. Invalid or unrecognized input is logged as an error.

**Default value:** Empty.

**Example:**

```shell
export OTEL_TRACES_SAMPLER="traceidratio"
export OTEL_TRACES_SAMPLER_ARG="0.5"
```

Depending on the value of `OTEL_TRACES_SAMPLER`, `OTEL_TRACES_SAMPLER_ARG` may
be set as follows:

- For `traceidratio` and `parentbased_traceidratio` samplers: Sampling
  probability, a number in the [0..1] range, e.g. "0.25". Default is 1.0 if
  unset.
- For `jaeger_remote` and `parentbased_jaeger_remote`: The value is a comma
  separated list:
  - Example:
    `"endpoint=http://localhost:14250,pollingIntervalMs=5000,initialSamplingRate=0.25"`
  - `endpoint`: the endpoint in form of `scheme://host:port` of gRPC server that
    serves the sampling strategy for the service
    ([sampling.proto](https://github.com/jaegertracing/jaeger-idl/blob/master/proto/api_v2/sampling.proto)).
  - `pollingIntervalMs`:  in milliseconds indicating how often the sampler will
    poll the backend for updates to sampling strategy.
  - `initialSamplingRate`:  in the [0..1] range, which is used as the sampling
    probability when the backend cannot be reached to retrieve a sampling
    strategy. This value stops having an effect once a sampling strategy is
    retrieved successfully, as the remote strategy will be used until a new
    update is retrieved.

## `OTEL_PROPAGATORS`

Specifies Propagators to be used in a comma-separated list.

**Default value:** `"tracecontext,baggage"

**Example:**

`export OTEL_PROPAGATORS="b3"`

Accepted values for `OTEL_PROPAGATORS` are:

- `"tracecontext"`: [W3C Trace Context](https://www.w3.org/TR/trace-context/)
- `"baggage"`: [W3C Baggage](https://www.w3.org/TR/baggage/)
- `"b3"`: [B3 Single](/docs/reference/specification/context/api-propagators#configuration)
- `"b3multi"`: [B3 Multi](/docs/reference/specification/context/api-propagators#configuration)
- `"jaeger"`:
  [Jaeger](https://www.jaegertracing.io/docs/1.21/client-libraries/#propagation-format)
- `"xray"`: [AWS
  X-Ray](https://docs.aws.amazon.com/xray/latest/devguide/xray-concepts.html#xray-concepts-tracingheader)
  (_third party_)
- `"ottrace"`: [OT
  Trace](https://github.com/opentracing?q=basic&type=&language=) (_third party_)
- `"none"`: No automatically configured propagator.

## Endpoint Configuration

The following environment variables let you configure an OTLP/gRPC or OTLP/HTTP
endpoint for your traces, metrics, and logs.

### `OTEL_EXPORTER_OTLP_ENDPOINT`

A base endpoint URL for any signal type, with an optionall-specified port
number. Helpful for when you're sending more than one signal to the same
endpoint and want one environment variable to control the endpoint.

**Default value:**

* gRPC: `"http://localhost:4317"`
* HTTP: `"http://localhost:4318"`

**Example:**

* gRPC: `export OTEL_EXPORTER_OTLP_ENDPOINT="my-api-endpoint:443"`
* HTTP: `export OTEL_EXPORTER_OTLP_ENDPOINT="https://my-api-endpoint/"`

For OTLP/HTTP, exporters in the SDK construct signal-specific URLs when this
environment variable is set. This means that if you're sending traces, metrics,
and logs, the following URLS are constructed from the example above:

* Traces: `"https://my-api-endpoint/v1/traces"`
* Metrics: `"https://my-api-endpoint/v1/metrics"`
* Logs: `"https://my-api-endpoint/v1/logs"`

### `OTEL_EXPORTER_OTLP_TRACES_ENDPOINT`

Endpoint URL for trace data only, with an optionall-specified port number. Must
end with `v1/traces` if using OTLP/HTTP.

**Default value:**

* gRPC: `"http://localhost:4317"`
* HTTP: `"http://localhost:4318/v1/traces"`

**Example:**

* gRPC: `export OTEL_EXPORTER_OTLP_TRACES_ENDPOINT="my-api-endpoint:443"`
* HTTP:`export OTEL_EXPORTER_OTLP_TRACES_ENDPOINT="https://my-api-endpoint/v1/traces"`

### `OTEL_EXPORTER_OTLP_METRICS_ENDPOINT`

Endpoint URL for trace data only, with an optionall-specified port number. Must
end with `v1/metrics` if using OTLP/HTTP.

**Default value:**

* gRPC: `"http://localhost:4317"`
* HTTP: `"http://localhost:4318/v1/metrics"`

**Example:**

* gRPC: `export OTEL_EXPORTER_OTLP_METRICS_ENDPOINT="my-api-endpoint:443"`
* HTTP:`export OTEL_EXPORTER_OTLP_METRICS_ENDPOINT="https://my-api-endpoint/v1/metrics"`

### `OTEL_EXPORTER_OTLP_LOGS_ENDPOINT`

Endpoint URL for trace data only, with an optionall-specified port number. Must
end with `v1/logs` if using OTLP/HTTP.

**Default value:**

* gRPC: `"http://localhost:4317"`
* HTTP: `"http://localhost:4318/v1/logs"`

**Example:**

* gRPC: `export OTEL_EXPORTER_OTLP_LOGS_ENDPOINT="my-api-endpoint:443"`
* HTTP:`export OTEL_EXPORTER_OTLP_LOGS_ENDPOINT="https://my-api-endpoint/v1/logs"`

## Header configuration

The following environment variables let you configure additional headers as a
list of key-value pairs to add in outgoing gRPC or HTTP requests

### `OTEL_EXPORTER_OTLP_HEADERS`

A list of headers to apply to all outgoing data (traces, metrics, and logs).

**Default value:** N/A

**Example:**

`export OTEL_EXPORTER_OTLP_HEADERS="api-key=key,other-config-value=value"`

### `OTEL_EXPORTER_OTLP_TRACES_HEADERS`

A list of headers to apply to all outgoing traces.

**Default value:** N/A

**Example:**

`export
OTEL_EXPORTER_OTLP_TRACES_HEADERS="api-key=key,other-config-value=value"`

### `OTEL_EXPORTER_OTLP_METRICS_HEADERS`

A list of headers to apply to all outgoing metrics.

**Default value:** N/A

**Example:**

`export
OTEL_EXPORTER_OTLP_METRICS_HEADERS="api-key=key,other-config-value=value"`

### `OTEL_EXPORTER_OTLP_LOGS_HEADERS`

A list of headers to apply to all outgoing logs.

**Default value:** N/A

**Example:**

`export OTEL_EXPORTER_OTLP_LOGS_HEADERS="api-key=key,other-config-value=value"`

## Timeout Configuration

The following environment variables configure the maximum time (in milliseconds)
an OTLP Exporter will wait before transmitting the net batch of data.

### `OTEL_EXPORTER_OTLP_TIMEOUT`

The timeout value for all outgoing data (traces, metrics, and logs) in milliseconds.

**Default value:** `10000` (10s)

**Example:**

`export OTEL_EXPORTER_OTLP_TIMEOUT=500`

### `OTEL_EXPORTER_OTLP_TRACES_TIMEOUT`

The timeout value for all outgoing traces in milliseconds.

**Default value:** 10000 (10s)

**Example:**

`export OTEL_EXPORTER_OTLP_TRACES_TIMEOUT=500`

### `OTEL_EXPORTER_OTLP_METRICS_TIMEOUT`

The timeout value for all outgoing metrics in milliseconds.

**Default value:** 10000 (10s)

**Example:**

`export OTEL_EXPORTER_OTLP_METRICS_TIMEOUT=500`

### `OTEL_EXPORTER_OTLP_LOGS_TIMEOUT`

The timeout value for all outgoing logs in milliseconds.

**Default value:** 10000 (10s)

**Example:**

`export OTEL_EXPORTER_OTLP_LOGS_TIMEOUT=500`
