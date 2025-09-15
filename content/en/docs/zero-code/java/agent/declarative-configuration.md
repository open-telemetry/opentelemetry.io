---
title: Declarative configuration
linkTitle: Declarative configuration
weight: 11
---

Declarative configuration uses a YAML file instead of environment variables or system
properties. This is useful when you have many configuration options to set, or if you
want to use configuration options that are not available as environment variables or system
properties.

## Getting started

1. save the configuration file below as `otel-config.yaml`
2. add `-Dotel.experimental.config.file=/path/to/file.yaml` to your JVM startup arguments

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

### Environment variables and system properties

Declarative configuration supports syntax to read environment variables, but not system properties.

If you set `OTEL_RESOURCE_ATTRIBUTES=service.version=1.1,deployment.environment.name=staging`,
the following config would create a resource with `service.version=1.1` and
`deployment.environment.name=staging` - the same way it works without declarative config.

```yaml
resource:
  attributes_list: ${OTEL_RESOURCE_ATTRIBUTES}
```

{{% alert title="Alert" %}}

All environment variables are ignored unless you explicitly add them to the config file.

{{% /alert %}}

### Migration configuration

If you have an existing configuration via environment variables, you can use the
[migration configuration](https://github.com/open-telemetry/opentelemetry-configuration/blob/main/examples/sdk-migration-config.yaml)
as a starting point to migrate to declarative configuration.

### Available config options

A complete list of config options can be found in the
[kitchen sink example](https://github.com/open-telemetry/opentelemetry-configuration/blob/main/examples/kitchen-sink.yaml).

### Endpoint per signal

If you have different endpoints for traces, metrics, and logs, use the following config:

| OTLP HTTP Exporter | Endpoint value                                                             |
|--------------------|----------------------------------------------------------------------------|
| Traces             | `${OTEL_EXPORTER_OTLP_TRACES_ENDPOINT:-http://localhost:4318/v1/traces}`   |
| Metrics            | `${OTEL_EXPORTER_OTLP_METRICS_ENDPOINT:-http://localhost:4318/v1/metrics}` |
| Logs               | `${OTEL_EXPORTER_OTLP_LOGS_ENDPOINT:-http://localhost:4318/v1/logs}`       |

### GRPC exporter

Instead of `otlp_http`, you can also use `otlp_grpc` to export via gRPC:

```yaml
otlp_grpc:
  endpoint: ${OTEL_EXPORTER_OTLP_ENDPOINT:-http://localhost:4317}
```

### Duration format

Declarative configuration only supports durations in milliseconds, e.g. `5000` for 5 seconds.

You will get an error if `OTEL_BSP_SCHEDULE_DELAY=5s` - which is valid for environment variables
without declarative configuration.

```yaml
tracer_provider:
  processors:
    - batch:
        schedule_delay: ${OTEL_BSP_SCHEDULE_DELAY:-5000}
```

## Features only possible with declarative configuration

- method call instrumentation (setting span type)
- todo

## Differences from other configuration methods

- distro name is `opentelemetry-javaagent` (instead of `opentelemetry-java-instrumentation`, will be aligned again with 3.0 release)
- common-enabled syntax is different

## Missing features

- resource attributes for MDC
- thread details processor
