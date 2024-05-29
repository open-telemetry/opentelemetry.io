---
title: Agent VS starter
description:
  Comparison between OpenTelemetry Java agent and OpenTelemetry starter
weight: 10
cSpell:ignore:
---

## How to instrument Spring Boot with OpenTelemetry

The [OpenTelemetry Java agent](../..) with byte code instrumentation can cover
most of your needs when instrumenting
[Spring Boot](https://spring.io/projects/spring-boot) applications.

Alternatively, the OpenTelemetry [Spring Boot starter] can help you in the
following cases:

- Spring Boot Native image applications for which the OpenTelemetry Java agent
  does not work
- Startup overhead of the OpenTelemetry Java agent exceeds your requirements
- OpenTelemetry Java agent might not work if your application already uses
  another Java monitoring agent
- You can use the Spring Boot configuration files (`application.properties`,
  `application.yml`) to configure the OpenTelemetry Spring Boot starter which
  doesn't work with the OpenTelemetry Java agent

[Spring Boot starter]:
  https://docs.spring.io/spring-boot/docs/current/reference/htmlsingle/#using.build-systems.starters

The OpenTelemetry Java agent has more automatic instrumentation features than
the OpenTelemetry starter.

You can use
[OpenTelemetry instrumentations libraries](https://github.com/open-telemetry/opentelemetry-java-instrumentation/blob/main/docs/supported-libraries.md#libraries--frameworks)
to complete the automatic instrumentation of the Spring Boot starter.
