---
title: Declarative configuration
weight: 25
cSpell:ignore: Customizer Dotel
---

Declarative configuration uses the
[OpenTelemetry declarative configuration schema](/docs/languages/sdk-configuration/declarative-configuration/)
inside your `application.yaml`.

This approach is useful when:

- You have many configuration options to set
- You want to use configuration options that are not available with
  `application.properties` or `application.yaml`
- You want to use the same configuration format as the
  [Java agent](/docs/zero-code/java/agent/declarative-configuration/)

> [!WARNING]
>
> Declarative configuration is experimental.

## Supported versions

Declarative configuration is supported in the **OpenTelemetry Spring Boot
starter version 2.26.0 and later**.

## Getting started

Add `otel.file_format: "1.0"` (or the current or desired version) to your `application.yaml` to opt in to
declarative configuration:

```yaml
otel:
  file_format: '1.0'

  resource:
    detection/development:
      detectors:
        - service:
    attributes:
      - name: service.name
        value: my-spring-app

  propagator:
    composite:
      - tracecontext:
      - baggage:

  tracer_provider:
    processors:
      - batch:
          exporter:
            otlp_http:
              endpoint: ${OTEL_EXPORTER_OTLP_TRACES_ENDPOINT:http://localhost:4318/v1/traces}

  meter_provider:
    readers:
      - periodic:
          exporter:
            otlp_http:
              endpoint: ${OTEL_EXPORTER_OTLP_METRICS_ENDPOINT:http://localhost:4318/v1/metrics}

  logger_provider:
    processors:
      - batch:
          exporter:
            otlp_http:
              endpoint: ${OTEL_EXPORTER_OTLP_LOGS_ENDPOINT:http://localhost:4318/v1/logs}
```

Note that `${VAR:default}` uses a single colon (Spring syntax), not the
`${VAR:-default}` syntax used in the agent's standalone YAML file.

## Mapping of configuration options

The following rules describe how `application.properties` / `application.yaml`
configuration options map to their declarative configuration equivalents:

### Instrumentation enable/disable

In declarative configuration, instrumentation enable/disable uses centralized
lists instead of individual properties. The instrumentation name uses `_`
(snake_case), not `-` (kebab-case).

| Non-DC configuration                                  | Declarative Configuration                                                       |
| ----------------------------------------------------- | ------------------------------------------------------------------------------- |
| `otel.instrumentation.jdbc.enabled=true`              | `otel.distribution.spring_starter.instrumentation.enabled: [jdbc]`              |
| `otel.instrumentation.logback-appender.enabled=false` | `otel.distribution.spring_starter.instrumentation.disabled: [logback_appender]` |
| `otel.instrumentation.common.default-enabled=false`   | `otel.distribution.spring_starter.instrumentation.default_enabled: false`       |

Example:

```yaml
otel:
  distribution:
    spring_starter:
      instrumentation:
        default_enabled: false
        enabled:
          - jdbc
          - spring_web
        disabled:
          - logback_appender
```

### Instrumentation configuration

Configuration options under `otel.instrumentation.*` (other than enable/disable)
map to `otel.instrumentation/development.java.*`:

1. Strip the `otel.instrumentation.` prefix
2. Per segment: replace `-` with `_`
3. Place under `otel.instrumentation/development.java.`
4. A `/development` suffix on a key indicates an experimental feature (see the
   `translateName` method in `ConfigPropertiesBackedDeclarativeConfigProperties`
   for the reverse mapping)

For example:

| Non-DC configuration                                                | Declarative Configuration                                                                        |
| ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| `otel.instrumentation.logback-appender.experimental-log-attributes` | `otel.instrumentation/development.java.logback_appender.experimental_log_attributes/development` |

Some options have special mappings that don't follow the default algorithm:

| Non-DC configuration                                                    | Declarative Configuration                                                                          |
| ----------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| `otel.instrumentation.common.db-statement-sanitizer.enabled`            | `otel.instrumentation/development.java.common.database.statement_sanitizer.enabled`                |
| `otel.instrumentation.http.client.capture-request-headers`              | `otel.instrumentation/development.general.http.client.request_captured_headers`                    |
| `otel.instrumentation.http.client.capture-response-headers`             | `otel.instrumentation/development.general.http.client.response_captured_headers`                   |
| `otel.instrumentation.http.server.capture-request-headers`              | `otel.instrumentation/development.general.http.server.request_captured_headers`                    |
| `otel.instrumentation.http.server.capture-response-headers`             | `otel.instrumentation/development.general.http.server.response_captured_headers`                   |
| `otel.instrumentation.http.client.emit-experimental-telemetry`          | `otel.instrumentation/development.java.common.http.client.emit_experimental_telemetry/development` |
| `otel.instrumentation.http.server.emit-experimental-telemetry`          | `otel.instrumentation/development.java.common.http.server.emit_experimental_telemetry/development` |
| `otel.instrumentation.http.known-methods`                               | `otel.instrumentation/development.java.common.http.known_methods`                                  |
| `otel.instrumentation.messaging.experimental.receive-telemetry.enabled` | `otel.instrumentation/development.java.common.messaging.receive_telemetry/development.enabled`     |
| `otel.jmx.enabled`                                                      | `otel.instrumentation/development.java.jmx.enabled`                                                |

The `instrumentation/development` section has two top-level groups:

- `general.*` — Cross-language configuration (HTTP headers, semantic convention
  stability)
- `java.*` — Java-specific instrumentation configuration

### Disable the SDK

| Non-DC configuration     | Declarative Configuration |
| ------------------------ | ------------------------- |
| `otel.sdk.disabled=true` | `otel.disabled: true`     |

### SDK configuration

SDK-level configuration (exporters, propagators, resources) follows the standard
[declarative configuration schema](/docs/languages/sdk-configuration/declarative-configuration/)
directly under `otel:`, as shown in the [Getting started](#getting-started)
example.

## Differences from agent declarative configuration

| Aspect          | Agent                                                    | Spring Boot starter                                           |
| --------------- | -------------------------------------------------------- | ------------------------------------------------------------- |
| Config location | Separate file (`-Dotel.config.file=...`)                 | Inside `application.yaml`                                     |
| Variable syntax | `${VAR:-default}` (double-colon)                         | `${VAR:default}` (single colon, Spring)                       |
| Profiles        | Not supported                                            | Spring profiles work normally                                 |
| Enable/disable  | `distribution.javaagent.instrumentation.*`               | `distribution.spring_starter.instrumentation.*`               |
| Default-enabled | `distribution.javaagent.instrumentation.default_enabled` | `distribution.spring_starter.instrumentation.default_enabled` |

## Environment variable overrides

Spring's relaxed binding lets you override any part of the declarative
configuration YAML via environment variables:

```shell
# Override a scalar under instrumentation/development
OTEL_INSTRUMENTATION/DEVELOPMENT_JAVA_FOO_STRING_KEY=new_value

# Override an indexed list element (e.g. exporter endpoint)
OTEL_TRACER_PROVIDER_PROCESSORS_0_BATCH_EXPORTER_OTLP_HTTP_ENDPOINT=http://custom:4318/v1/traces
```

Rules: uppercase, replace `.` with `_`, keep `/` as-is (e.g.
`INSTRUMENTATION/DEVELOPMENT`), use `_0_`, `_1_` for list indices.

This is a standard Spring feature — it works for any key in `application.yaml`.

## Duration format

Declarative configuration **only supports durations in milliseconds** (e.g.
`5000` for 5 seconds). You will get an error if you use a duration string like
`5s`.

## Programmatic configuration

With declarative configuration, `AutoConfigurationCustomizerProvider` (see
[Programmatic configuration](../programmatic-configuration/)) is replaced by
`DeclarativeConfigurationCustomizerProvider`. Components such as span exporters
use the `ComponentProvider` API. See the
[agent Extension API section](/docs/zero-code/java/agent/declarative-configuration/)
for details and examples — the same APIs apply to the Spring Boot starter.
