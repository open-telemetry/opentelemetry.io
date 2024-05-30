---
title: Spring Boot starter
aliases:
  [
    /docs/languages/java/automatic/spring-boot/,
    /docs/zero-code/java/spring-boot/,
  ]
---

You can use two options to instrument
[Spring Boot](https://spring.io/projects/spring-boot) applications with
OpenTelemetry.

1. The default choice for instrumenting Spring Boot applications is the
   [_OpenTelemetry Java agent_](../agent) with byte code instrumentation:
   - _More out of the box instrumentation_ than the OpenTelemetry starter
2. The _OpenTelemetry Spring Boot starter_ can help you with:
   - _Spring Boot Native image_ applications for which the OpenTelemetry Java
     agent does not work
   - _Startup overhead_ of the OpenTelemetry Java agent exceeding your
     requirements
   - A Java monitoring agent already used because the OpenTelemetry Java agent
     might not work with the other agent
   - _Spring Boot configuration files_ (`application.properties`,
     `application.yml`) to configure the OpenTelemetry Spring Boot starter which
     doesn't work with the OpenTelemetry Java agent

## Use the OpenTelemetry starter
