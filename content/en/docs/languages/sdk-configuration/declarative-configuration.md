---
title: Declarative configuration
linkTitle: Declarative configuration
weight: 30
---

Declarative configuration uses a YAML file instead of environment variables.

This approach is useful when:

- You have many configuration options to set.
- You want to use configuration options that are not available as environment
  variables.

{{% alert title="Warning" %}} Declarative configuration is experimental.
{{% /alert %}}

## Supported languages

The following OpenTelemetry SDKs support declarative configuration:

- [Java](/docs/zero-code/java/agent/declarative-configuration/)

For details, refer to the
[Compliance Matrix](https://github.com/open-telemetry/opentelemetry-specification/blob/main/spec-compliance-matrix.md#declarative-configuration)

## Getting started

1. Save the following configuration file as `otel-config.yaml`.
2. Set the environment variable
   `OTEL_EXPERIMENTAL_CONFIG_FILE=/path/to/otel-config.yaml`

Recommended configuration file:

```yaml
file_format: '1.0-rc.1'

resource:
  attributes_list: ${OTEL_RESOURCE_ATTRIBUTES}
  detection/development:
    detectors:
      - service: # will add "service.instance.id" and "service.name" from OTEL_SERVICE_NAME

propagator:
  composite:
    - tracecontext:
    - baggage:

tracer_provider:
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

{{% alert title="Warning" %}} All environment variables are ignored unless you
explicitly add them to the config file. {{% /alert %}}

## Migration configuration

If your existing configuration relies on environment variables, you can use the
[migration configuration](https://github.com/open-telemetry/opentelemetry-configuration/blob/main/examples/sdk-migration-config.yaml)
as a starting point to migrate to declarative configuration.

## Available config options

A complete list of config options can be found in the
[kitchen sink example](https://github.com/open-telemetry/opentelemetry-configuration/blob/main/examples/kitchen-sink.yaml).

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
