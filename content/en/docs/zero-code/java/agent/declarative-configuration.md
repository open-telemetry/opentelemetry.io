---
title: Declarative configuration
linkTitle: Declarative configuration
weight: 11
---

Declarative configuration uses a YAML file instead of environment variables or system properties.

This approach is useful when:
- You have many configuration options to set
- You want to use configuration options that are not available as environment variables or system properties

Just like environment variables, the configuration syntax is language-agnostic and works for all
OpenTelemetry Java SDKs that support declarative configuration, including the OpenTelemetry Java agent.

## Supported Versions

Declarative configuration is supported in **OpenTelemetry Java agent version 2.20.0 and later**.

## Getting Started

Use [Declarative configuration](/docs/languages/sdk-configuration/declarative-configuration)
as a getting started guide for declarative configuration.

This page focuses on specifics for the OpenTelemetry Java agent.

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
- do as separate pages

## Differences from Other Configuration Methods

- Distro name is `opentelemetry-javaagent` (instead of `opentelemetry-java-instrumentation`; will be aligned again with 3.0 release)
- Common-enabled syntax is different

## Missing Features

- Resource attributes for MDC
- Thread details processor
- https://github.com/open-telemetry/opentelemetry-java-instrumentation/pull/14591
