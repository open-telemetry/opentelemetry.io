---
title: General SDK Configuration
description: >-
  General-purpose environment variables for configuring an OpenTelemetry SDK.
weight: 1
cSpell:ignore: ottrace
---

## `OTEL_SERVICE_NAME`

Sets the value of the [`service.name`](/docs/specs/semconv/resource/#service)
resource attribute.

**Default value:** `"unknown_service"`

If `service.name` is also provided in `OTEL_RESOURCE_ATTRIBUTES`, then
`OTEL_SERVICE_NAME` takes precedence.

**Example:**

`export OTEL_SERVICE_NAME="your-service-name"`

## `OTEL_RESOURCE_ATTRIBUTES`

Key-value pairs to be used as resource attributes. See
[Resource SDK](/docs/specs/otel/resource/sdk#specifying-resource-information-via-an-environment-variable)
for more details.

**Default value:** Empty.

See
[Resource semantic conventions](/docs/specs/semconv/resource/#semantic-attributes-with-sdk-provided-default-value)
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
- `"xray"`:
  [AWS X-Ray Centralized Sampling](https://docs.aws.amazon.com/xray/latest/devguide/xray-console-sampling.html)
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
    ([sampling.proto](https://github.com/jaegertracing/jaeger-idl/blob/main/proto/api_v2/sampling.proto)).
  - `pollingIntervalMs`: in milliseconds indicating how often the sampler will
    poll the backend for updates to sampling strategy.
  - `initialSamplingRate`: in the [0..1] range, which is used as the sampling
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
- `"b3"`: [B3 Single](/docs/specs/otel/context/api-propagators#configuration)
- `"b3multi"`:
  [B3 Multi](/docs/specs/otel/context/api-propagators#configuration)
- `"jaeger"`:
  [Jaeger](https://www.jaegertracing.io/docs/1.21/client-libraries/#propagation-format)
- `"xray"`:
  [AWS X-Ray](https://docs.aws.amazon.com/xray/latest/devguide/xray-concepts.html#xray-concepts-tracingheader)
  (_third party_)
- `"ottrace"`:
  [OT Trace](https://github.com/opentracing?q=basic&type=&language=) (_third
  party_)
- `"none"`: No automatically configured propagator.

## `OTEL_TRACES_EXPORTER`

Specifies which exporter is used for traces.

**Default value:** `"otlp"`

**Example:**

`export OTEL_TRACES_EXPORTER="jaeger"`

Accepted values for are:

- `"otlp"`: [OTLP][]
- `"jaeger"`: export in Jaeger data model
- `"zipkin"`: [Zipkin](https://zipkin.io/zipkin-api/)
- `"none"`: No automatically configured exporter for traces.

## `OTEL_METRICS_EXPORTER`

Specifies which exporter is used for metrics.

**Default value:** `"otlp"`

**Example:**

`export OTEL_METRICS_EXPORTER="prometheus"`

Accepted values for `OTEL_METRICS_EXPORTER` are:

- `"otlp"`: [OTLP][]
- `"prometheus"`:
  [Prometheus](https://github.com/prometheus/docs/blob/main/content/docs/instrumenting/exposition_formats.md)
- `"none"`: No automatically configured exporter for metrics.

## `OTEL_LOGS_EXPORTER`

Specifies which exporter is used for logs.

**Default value:** `"otlp"`

**Example:**

`export OTEL_LOGS_EXPORTER="otlp"`

Accepted values for `OTEL_LOGS_EXPORTER` are:

- `"otlp"`: [OTLP][]
- `"none"`: No automatically configured exporter for logs.

[otlp]: /docs/specs/otlp/
