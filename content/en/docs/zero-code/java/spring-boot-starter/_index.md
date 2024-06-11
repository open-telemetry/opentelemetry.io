---
title: Spring Boot starter
aliases:
  - /docs/languages/java/automatic/spring-boot
  - /docs/zero-code/java/agent/spring-boot
  - /docs/zero-code/java/spring-boot
---

## Java agent vs Spring Boot starter

You can use two options to instrument
[Spring Boot](https://spring.io/projects/spring-boot) applications with
OpenTelemetry.

1. The default choice for instrumenting Spring Boot applications is the
   [**OpenTelemetry Java agent**](../agent) with bytecode instrumentation:
   - **More out of the box instrumentation** than the OpenTelemetry starter
2. The **OpenTelemetry Spring Boot starter** can help you with:
   - **Spring Boot Native image** applications for which the OpenTelemetry Java
     agent does not work
   - **Startup overhead** of the OpenTelemetry Java agent exceeding your
     requirements
   - A Java monitoring agent already used because the OpenTelemetry Java agent
     might not work with the other agent
   - **Spring Boot configuration files** (`application.properties`,
     `application.yml`) to configure the OpenTelemetry Spring Boot starter which
     doesn't work with the OpenTelemetry Java agent

## Comparison to Micrometer

At a high level, this section compares OpenTelemetry Spring Boot starter and
Micrometer.

OpenTelemetry Spring Boot starter:

- Natively uses the OpenTelemetry API, OpenTelemetry SDK and the OpenTelemetry
  semantic conventions
- Supported by the OpenTelemetry community (governed by the CNCF / Linux
  Foundation)

Micrometer [^1][^2]:

- An independent standalone observability system
- Offers optional bridges into parts of the OpenTelemetry ecosystem
- Supported by the Micrometer community (governed by Broadcom Inc)

As the authors of the OpenTelemetry Spring Boot starter, we recommend using the
OpenTelemetry Spring Boot starter. We have a great community behind it, and are
continuously making improvements. If you try it out and have any problems or
suggestions, please open an
[issue](https://github.com/open-telemetry/opentelemetry-java-instrumentation/issues)
in our repository.

[^1]: https://docs.micrometer.io/micrometer/reference/implementations/otlp.html

[^2]: https://docs.micrometer.io/tracing/reference/tracers.html
