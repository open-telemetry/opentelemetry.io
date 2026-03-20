---
title: Declarative configuration
linkTitle: Declarative configuration
weight: 30
---

<?code-excerpt path-base="examples/otel-config"?>

Declarative configuration uses a YAML file instead of environment variables.

This approach is useful when:

- You have many configuration options to set.
- You want to use configuration options that are not available as environment
  variables.

> [!WARNING]
>
> The declarative configuration schema is stable. The parts of it that are still
> experimental are suffixed with `/development`. Support for declarative
> configuration in various implementations is still experimental.

## Supported languages

The following OpenTelemetry SDKs support declarative configuration:

- [Java](/docs/zero-code/java/agent/declarative-configuration/)

For details, refer to the
[Compliance Matrix](https://github.com/open-telemetry/opentelemetry-specification/blob/main/spec-compliance-matrix.md#declarative-configuration)

## Getting started

1. Save the following configuration file as `otel-config.yaml`.
2. Set the environment variable `OTEL_CONFIG_FILE=/path/to/otel-config.yaml`

Recommended configuration file:

<!-- prettier-ignore-start -->
<?code-excerpt "examples/otel-getting-started.yaml"?>
```yaml
# otel-getting-started.yaml is a good starting point for configuring the SDK, including exporting to
# localhost via OTLP.
#
# NOTE: With the exception of env var substitution syntax (i.e. ${MY_ENV}), SDKs ignore
# environment variables when interpreting config files. This including ignoring all env
# vars defined in https://opentelemetry.io/docs/specs/otel/configuration/sdk-environment-variables/.
#
# For schema documentation, including required properties, semantics, default behavior, etc,
# see: https://github.com/open-telemetry/opentelemetry-configuration/blob/main/schema-docs.md

file_format: "1.0"

resource:
  # Read resource attributes from the OTEL_RESOURCE_ATTRIBUTES environment variable.
  # This aligns well with the OpenTelemetry Operator and other deployment methods.
  attributes_list: ${OTEL_RESOURCE_ATTRIBUTES}
  detection/development: # /development properties may not be supported in all SDKs
    detectors:
      - service: # will add "service.instance.id" and "service.name" from the OTEL_SERVICE_NAME env var
      - host:
      - process:
      - container:

propagator:
  composite:
    - tracecontext:
    - baggage:

# Read backend endpoint from the OTEL_EXPORTER_OTLP_ENDPOINT environment variable.
# This aligns well with the OpenTelemetry Operator and other deployment methods.

tracer_provider:
  sampler:
    parent_based:
      root:
        always_on:
  processors:
    - batch:
        exporter:
          otlp_http:
            endpoint: ${OTEL_EXPORTER_OTLP_ENDPOINT:-http://localhost:4318}/v1/traces

meter_provider:
  readers:
    - periodic:
        exporter:
          otlp_http:
            endpoint: ${OTEL_EXPORTER_OTLP_ENDPOINT:-http://localhost:4318}/v1/metrics

logger_provider:
  processors:
    - batch:
        exporter:
          otlp_http:
            endpoint: ${OTEL_EXPORTER_OTLP_ENDPOINT:-http://localhost:4318}/v1/logs
```
<!-- prettier-ignore-end -->

## Environment variables

- Declarative configuration supports syntax to read **environment variables**.
- All environment variables are **ignored unless you explicitly add them to the
  config file**.

For example, if you set:

```shell
OTEL_RESOURCE_ATTRIBUTES=service.version=1.1,deployment.environment.name=staging
```

The following config will create a resource with `service.version=1.1` and
`deployment.environment.name=staging`:

```yaml
resource:
  attributes_list: ${OTEL_RESOURCE_ATTRIBUTES}
```

> [!WARNING]
>
> All environment variables are ignored unless you explicitly add them to the
> config file.

## Migration configuration

If your existing configuration relies on environment variables, you can use the
[migration configuration](https://github.com/open-telemetry/opentelemetry-configuration/blob/main/examples/otel-sdk-migration-config.yaml)
as a starting point to migrate to declarative configuration.

## Available config options

A complete list of config options can be found in the [configuration
example][otel-sdk-config.yaml].

[otel-sdk-config.yaml]:
  https://github.com/open-telemetry/opentelemetry-configuration/blob/v1.0.0-rc.1/examples/kitchen-sink.yaml

## Endpoint per signal

If you have different endpoints for traces, metrics, and logs, use the following
config when using `otlp_http`:

| OTLP HTTP Exporter | Endpoint value                                                             |
| ------------------ | -------------------------------------------------------------------------- |
| Traces             | `${OTEL_EXPORTER_OTLP_TRACES_ENDPOINT:-http://localhost:4318/v1/traces}`   |
| Metrics            | `${OTEL_EXPORTER_OTLP_METRICS_ENDPOINT:-http://localhost:4318/v1/metrics}` |
| Logs               | `${OTEL_EXPORTER_OTLP_LOGS_ENDPOINT:-http://localhost:4318/v1/logs}`       |

## gRPC Exporter

Instead of `otlp_http`, you can also use `otlp_grpc` to export via gRPC:

```yaml
otlp_grpc:
  endpoint: ${OTEL_EXPORTER_OTLP_ENDPOINT:-http://localhost:4317}
```

## Resource Attributes

The recommended approach to set resource attributes is via environment
variables, because it works well with tools that set environment variables, such
as
[OpenTelemetry Operator for Kubernetes](/docs/platforms/kubernetes/operator/).

However, you can also set resource attributes directly in the config file:

```yaml
resource:
  attributes:
    - name: service.name
      value: shopping_cart
    - name: deployment.environment.name
      value: staging
```
