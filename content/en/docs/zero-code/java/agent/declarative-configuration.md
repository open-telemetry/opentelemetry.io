---
title: Java Agent Declarative configuration
linkTitle: Declarative configuration
weight: 11
cSpell:ignore: Customizer Dotel genai
---

Declarative configuration uses a YAML file instead of environment variables or
system properties.

This approach is useful when:

- You have many configuration options to set
- You want to use configuration options that are not available as environment
  variables or system properties

Just like environment variables, the configuration syntax is language-agnostic
and works for all OpenTelemetry Java SDKs that support declarative
configuration, including the OpenTelemetry Java agent.

{{% alert title="Warning" %}} Declarative configuration is experimental.
{{% /alert %}}

## Supported versions

Declarative configuration is supported in the **OpenTelemetry Java agent version
2.20.0 and later**.

## Getting started

1. Save the configuration file below as `otel-config.yaml`.
2. Add the following to your JVM startup arguments:<br>
   `-Dotel.experimental.config.file=/path/to/otel-config.yaml`

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
            endpoint: ${OTEL_EXPORTER_OTLP_TRACES_ENDPOINT:-http://localhost:4318/v1/traces}

meter_provider:
  readers:
    - periodic:
        exporter:
          otlp_http:
            endpoint: ${OTEL_EXPORTER_OTLP_METRICS_ENDPOINT:-http://localhost:4318/v1/metrics}

logger_provider:
  processors:
    - batch:
        exporter:
          otlp_http:
            endpoint: ${OTEL_EXPORTER_OTLP_LOGS_ENDPOINT:-http://localhost:4318/v1/logs}
```

Reference the [SDK Declarative configuration][] documentation for a more general
getting started guide for declarative configuration.

This page focuses on specifics for the
[OpenTelemetry Java agent](https://github.com/open-telemetry/opentelemetry-java-instrumentation).

## Mapping of configuration options

When you want to map your existing environment variables or system properties
configuration to declarative configuration, use the following rules:

1. If the configuration option starts with `otel.javaagent.` (e.g.
   `otel.javaagent.logging`), then it's most likely a property that can only be
   set via environment variable or system property (see the
   [Environment variables and system properties only options](#environment-variables-and-system-properties-only-options)
   section below for details). Otherwise, strip the `otel.javaagent.` prefix and
   place it under the `agent` section below.
2. If the configuration option starts with `otel.instrumentation.` (e.g.
   `otel.instrumentation.spring-batch.experimental.chunk.new-trace`), then strip
   the `otel.instrumentation.` prefix and place it under the `instrumentation`
   section below.
3. Otherwise, the option most likely belongs to the SDK configuration. Find the
   right section in the
   [migration config](https://github.com/open-telemetry/opentelemetry-configuration/blob/main/examples/sdk-migration-config.yaml).
   If you have a system property like `otel.bsp.schedule.delay`, then look for
   the corresponding environment variable `OTEL_BSP_SCHEDULE_DELAY` in the
   migration config.
4. Use `.` to create an indentation level.
5. Convert `-` to `_`.
6. Use YAML boolean and integer types where appropriate (e.g. `true` instead of
   `"true"`, `5000` instead of `"5000"`).
7. Options that have special mapping are called out below.

```yaml
instrumentation/development:
  general:
    peer:
      service_mapping: # was "otel.instrumentation.common.peer-service-mapping"
        - peer: 1.2.3.4
          service: FooService
        - peer: 2.3.4.5
          service: BarService
    http:
      client:
        request_captured_headers: # was otel.instrumentation.http.client.capture-request-headers
          - Content-Type
          - Accept
        response_captured_headers: # was otel.instrumentation.http.client.capture-response-headers
          - Content-Type
          - Content-Encoding
      server:
        request_captured_headers: # was otel.instrumentation.http.server.capture-request-headers
          - Content-Type
          - Accept
        response_captured_headers: # was otel.instrumentation.http.server.capture-response-headers
          - Content-Type
          - Content-Encoding
  java:
    agent:
      # was otel.instrumentation.common.default-enabled
      # instrumentation_mode: none  # was false
      instrumentation_mode: default # was true
    spring_batch:
      experimental:
        chunk:
          new_trace: true
```

## Environment variables and system properties only options

The following configuration options are supported by declarative configuration,
but only available via environment variables or system properties:

- `otel.javaagent.configuration-file` (but that should not be needed with
  declarative configuration)
- `otel.javaagent.debug`
- `otel.javaagent.enabled`
- `otel.javaagent.experimental.field-injection.enabled`
- `otel.javaagent.experimental.security-manager-support.enabled`
- `otel.javaagent.extensions`
- `otel.javaagent.logging.application.logs-buffer-max-records`
- `otel.javaagent.logging`

These options are needed at agent startup, before the declarative configuration
file is read.

## Duration format

- Declarative configuration **only supports durations in milliseconds** (e.g.
  `5000` for 5 seconds).
- You will get an error if you use `OTEL_BSP_SCHEDULE_DELAY=5s` (valid for
  environment variables, but not for declarative configuration).

Example:

```yaml
tracer_provider:
  processors:
    - batch:
        schedule_delay: ${OTEL_BSP_SCHEDULE_DELAY:-5000}
```

## Behavior differences

- The resource attribute `telemetry.distro.name` (that is added by default by
  the Java agent) has the value `opentelemetry-javaagent` instead of
  `opentelemetry-java-instrumentation` (will be aligned again with 3.0 release).

## Not yet supported features

### Features that still need environment variables or system properties

Some features that are supported by environment variables and system properties
are not yet supported by declarative configuration:

The following settings still need to be set via environment variables or system
properties:

- `otel.experimental.javascript-snippet`
- `otel.instrumentation.aws-sdk.experimental-record-individual-http-error`
- `otel.instrumentation.aws-sdk.experimental-span-attributes`
- `otel.instrumentation.aws-sdk.experimental-use-propagator-for-messaging`
- `otel.instrumentation.common.db-statement-sanitizer.enabled`
- `otel.instrumentation.common.logging.span-id`
- `otel.instrumentation.common.logging.trace-flags`
- `otel.instrumentation.common.logging.trace-id`
- `otel.instrumentation.experimental.span-suppression-strategy`
- `otel.instrumentation.genai.capture-message-content`
- `otel.instrumentation.jdbc.experimental.capture-query-parameters`
- `otel.instrumentation.jdbc.experimental.transaction.enabled`
- `otel.instrumentation.log4j-context-data.add-baggage`
- `otel.instrumentation.messaging.experimental.capture-headers`
- `otel.instrumentation.messaging.experimental.receive-telemetry.enabled`
- `otel.javaagent.experimental.thread-propagation-debugger.enabled`
- `otel.semconv-stability.opt-in`

### Features not yet supported at all

Java agent features that are not yet supported by declarative configuration:

- `otel.instrumentation.common.mdc.resource-attributes`
- `otel.javaagent.add-thread-details`
- adding console logger for spans when `otel.javaagent.debug=true`
  - can be worked around by adding a console span exporter in the configuration
    file
- using `GlobalConfigProvider` to access declarative configuration values in
  custom code (by casting `GlobalOpenTelemetry.get()` to
  `ExtendedOpenTelemetry`)

Contrib features that are not yet supported by declarative configuration:

- [AWS X-Ray](https://github.com/open-telemetry/opentelemetry-java-contrib/tree/main/aws-xray)
- [GCP authentication](https://github.com/open-telemetry/opentelemetry-java-contrib/tree/main/gcp-auth-extension)
- [Inferred Spans](https://github.com/open-telemetry/opentelemetry-java-contrib/blob/main/inferred-spans)

### Spring Boot starter limitations

Lastly, the [Spring Boot starter](/docs/zero-code/java/spring-boot-starter) does
not yet support declarative configuration:

- however, you can already use `application.yaml` to configure the OpenTelemetry
  Spring Boot starter

## Extension API

Extensions use a new declarative configuration API.

- Extensions that use `AutoConfigurationCustomizerProvider` will need to migrate
  to the new `DeclarativeConfigurationCustomizerProvider` API. Check out how the
  old
  [AgentTracerProviderConfigurer](https://github.com/open-telemetry/opentelemetry-java-instrumentation/blob/main/javaagent-tooling/src/main/java/io/opentelemetry/javaagent/tooling/AgentTracerProviderConfigurer.java)
  maps to the new
  [SpanLoggingCustomizerProvider](https://github.com/open-telemetry/opentelemetry-java-instrumentation/blob/main/javaagent-tooling/src/main/java/io/opentelemetry/javaagent/tooling/SpanLoggingCustomizerProvider.java).
- Components, such as span exporters, need to use the `ComponentProvider` API
  now. Check out the
  [Baggage Processor](https://github.com/open-telemetry/opentelemetry-java-contrib/tree/main/baggage-processor),
  which supports both the old and new APIs, as an example.

[SDK Declarative configuration]:
  /docs/languages/sdk-configuration/declarative-configuration
