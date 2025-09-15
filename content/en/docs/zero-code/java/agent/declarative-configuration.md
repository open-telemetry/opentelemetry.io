---
title: Declarative configuration
linkTitle: Declarative configuration
weight: 11
---

Declarative configuration uses a YAML file instead of environment variables or system properties.

This approach is useful when:
- You have many configuration options to set
- You want to use configuration options that are not available as environment variables or system properties

## Supported Versions

Declarative configuration is supported in **OpenTelemetry Java agent version 2.20.0 and later**.

## Getting Started

1. Save the configuration file below as `otel-config.yaml`.
2. Add the following to your JVM startup arguments:

   ```shell
   -Dotel.experimental.config.file=/path/to/file.yaml
   ```

Example configuration file:

```yaml
file_format: "1.0-rc.1"

resource:
  attributes_list: ${OTEL_RESOURCE_ATTRIBUTES}
  detection/development:
    detectors:
      - service: # will add "service.instance.id" and "service.name" from OTEL_SERVICE_NAME

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

## Environment Variables and System Properties

- Declarative configuration supports syntax to read **environment variables**, but not system properties.
- All environment variables are **ignored unless you explicitly add them to the config file**.

For example, if you set:

```shell
OTEL_RESOURCE_ATTRIBUTES=service.version=1.1,deployment.environment.name=staging
```

The following config will create a resource with `service.version=1.1` and `deployment.environment.name=staging`:

```yaml
resource:
  attributes_list: ${OTEL_RESOURCE_ATTRIBUTES}
```

{{% alert title="Alert" %}}
All environment variables are ignored unless you explicitly add them to the config file.
{{% /alert %}}

## Migration Configuration

If you have an existing configuration via environment variables, you can use the [migration configuration](https://github.com/open-telemetry/opentelemetry-configuration/blob/main/examples/sdk-migration-config.yaml) as a starting point to migrate to declarative configuration.

## Available Config Options

A complete list of config options can be found in the [kitchen sink example](https://github.com/open-telemetry/opentelemetry-configuration/blob/main/examples/kitchen-sink.yaml).

## Endpoint Per Signal

If you have different endpoints for traces, metrics, and logs, use the following config:

| OTLP HTTP Exporter | Endpoint value                                                             |
|--------------------|----------------------------------------------------------------------------|
| Traces             | `${OTEL_EXPORTER_OTLP_TRACES_ENDPOINT:-http://localhost:4318/v1/traces}`   |
| Metrics            | `${OTEL_EXPORTER_OTLP_METRICS_ENDPOINT:-http://localhost:4318/v1/metrics}` |
| Logs               | `${OTEL_EXPORTER_OTLP_LOGS_ENDPOINT:-http://localhost:4318/v1/logs}`       |

## GRPC Exporter

Instead of `otlp_http`, you can also use `otlp_grpc` to export via gRPC:

```yaml
otlp_grpc:
  endpoint: ${OTEL_EXPORTER_OTLP_ENDPOINT:-http://localhost:4317}
```

## Duration Format

- Declarative configuration **only supports durations in milliseconds** (e.g. `5000` for 5 seconds).
- You will get an error if you use `OTEL_BSP_SCHEDULE_DELAY=5s` (valid for environment variables, but not for declarative configuration).

Example:

```yaml
tracer_provider:
  processors:
    - batch:
        schedule_delay: ${OTEL_BSP_SCHEDULE_DELAY:-5000}
```

## Features Only Possible with Declarative Configuration

- Method call instrumentation (setting span type)
- (todo)

## Differences from Other Configuration Methods

- Distro name is `opentelemetry-javaagent` (instead of `opentelemetry-java-instrumentation`; will be aligned again with 3.0 release)
- Common-enabled syntax is different

## Missing Features

- Resource attributes for MDC
- Thread details processor
