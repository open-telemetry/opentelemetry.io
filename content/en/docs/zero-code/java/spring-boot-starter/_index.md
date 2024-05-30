---
title: Spring Boot starter
description: Spring Boot instrumentation for OpenTelemetry Java
aliases:
  [
    /docs/languages/java/automatic/spring-boot/,
    /docs/zero-code/java/spring-boot/,
  ]
---

## When to use the Java agent

The default choice for instrumenting
[Spring Boot](https://spring.io/projects/spring-boot) applications is the
[OpenTelemetry Java agent](../agent) with byte code instrumentation:

- OpenTelemetry Java agent has more automatic instrumentation features than the
  OpenTelemetry starter

## When to use the Spring Boot starter

However, the OpenTelemetry Spring Boot starter]can help you in the following
cases:

- Spring Boot Native image applications for which the OpenTelemetry Java agent
  does not work
- Startup overhead of the OpenTelemetry Java agent exceeds your requirements
- OpenTelemetry Java agent might not work if your application already uses
  another Java monitoring agent
- You can use the Spring Boot configuration files (`application.properties`,
  `application.yml`) to configure the OpenTelemetry Spring Boot starter which
  doesn't work with the OpenTelemetry Java agent
