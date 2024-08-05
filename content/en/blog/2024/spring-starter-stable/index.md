---
title: The OpenTelemetry Spring Boot starter is now stable
linkTitle: Spring Starter GA
date: 2024-
author: [Gregor Zeitlinger](https://github.com/zeitlinger) (Grafana Labs)
issue: https://github.com/open-telemetry/opentelemetry-java-instrumentation/issues/11581
sig: Java
---

We're proud to announce that the OpenTelemetry Spring Boot starter is now
generally available.

The [Spring Boot](https://spring.io/projects/spring-boot) starter is a powerful
tool that simplifies the process of instrumenting Spring Boot applications with
OpenTelemetry. It provides a lightweight, flexible alternative to the
OpenTelemetry Java agent, making it easier than ever to monitor your Spring Boot
applications.

In this blog post, we'll explain when you should use the Spring Starter, what it
actually means to be stable, and what we learned along the way.

If you just want to get started, check out the
[Spring Starter documentation](/docs/zero-code/java/spring-boot-starter).

## Why is the Spring Starter Important?

Spring users have come to expect starters as a standard method for addressing
various aspects of application development. Unlike other configurations, a
Spring starter simplifies the setup process without the need for additional JVM
options or Docker files. This ease of use and integration is what makes the
Spring starter an essential tool in the Spring ecosystem.

## When to use the Spring Starter?

It may be a bit surprising, but our default recommendation for Spring Boot apps
is still to use the [**OpenTelemetry Java agent**](/docs/zero-code/java/agent)
with bytecode instrumentation, as it provides more out-of-the-box
instrumentation than the Spring Starter (some things are only possible with
bytecode instrumentation).

So here are some scenarios where you might want to use the Spring Starter
instead:

- **Spring Boot Native image** applications for which the OpenTelemetry Java
  agent does not work
- **Startup overhead** of the OpenTelemetry Java agent exceeding your
  requirements
- A Java monitoring agent already used because the OpenTelemetry Java agent
  might not work with the other agent
- **Spring Boot configuration files** (`application.properties`,
  `application.yml`) to configure the OpenTelemetry Spring Boot starter which
  doesn't work with the OpenTelemetry Java agent
- **Programmatic configuration** of the OpenTelemetry Spring Boot starter, such
  as
  [dynamic auth headers](https://opentelemetry.io/docs/zero-code/java/spring-boot-starter/sdk-configuration/#configure-the-exporter-programmatically),
  using Spring beans (the OpenTelemetry Java agent requires an
  [extension](https://opentelemetry.io/docs/zero-code/java/agent/extensions/)
  for this)

## What does it mean to be stable?

The Spring Starter is now stable, which means that it is ready for production
use.

- **Support for GraalVM**: The Spring Starter is fully compatible with GraalVM
  native compilation.
- **Logs, metrics, and traces** are stable and will not change in a way that
  breaks existing users.
- **Stable API**: The API is stable and will not change in a way that breaks
  existing users.
- **Stable Configuration**: The configuration options are stable and will not
  change in a way that breaks existing users.
- **Compatible Configuration**: The configuration is compatible with the
  OpenTelemetry Java agent - so you can switch between the two without any
  issues.
- **Mature Documentation**: The
  [documentation](https://opentelemetry.io/docs/zero-code/java/spring-boot-starter/)
  is mature and covers all aspects of the Spring Starter.
- **Community Support**: The Spring Starter has a
  [community](https://opentelemetry.io/community/) (`otel-java` Slack channel)
  of users who can help you with any issues you might encounter.
- **Regular Updates**: The Spring Starter is actively maintained and updated
  with new features and bug fixes.

A notable exemption are semantic conventions, which are still evolving and may
change in the future. Some of the conventions are still in the experimental
phase and may change in the future.
[HTTP semantic conventions](https://opentelemetry.io/docs/specs/semconv/http/http-metrics/)
are stable and will not change.

## What did we learn along the way?

Testing across different versions of Spring Boot is no easy task, especially
when you add GraalVM to the mix.

But maybe more interesting is the fact that we learned how to create interfaces
that bridge the Spring Boot configuration with the OpenTelemetry SDK
configuration. In the beginning, the OpenTelemetry SDK was only able to read
configuration from system properties and environment variables.

It was relatively easy to add support for Spring Boot configuration files by
implementing the
[ConfigProperties](https://github.com/open-telemetry/opentelemetry-java/blob/main/sdk-extensions/autoconfigure-spi/src/main/java/io/opentelemetry/sdk/autoconfigure/spi/ConfigProperties.java)
interface - you just have to write a `@ConfigurationProperties` class for
[lists](https://github.com/open-telemetry/opentelemetry-java-instrumentation/blob/release/v2.6.x/instrumentation/spring/spring-boot-autoconfigure/src/main/java/io/opentelemetry/instrumentation/spring/autoconfigure/internal/properties/SpringConfigProperties.java#L104-L106)
and
[maps](https://github.com/open-telemetry/opentelemetry-java-instrumentation/blob/release/v2.6.x/instrumentation/spring/spring-boot-autoconfigure/src/main/java/io/opentelemetry/instrumentation/spring/autoconfigure/internal/properties/SpringConfigProperties.java#L126-L140),
because the Spring Boot Environment can't handle them directly. Luckily, Spring
Boot has a way to convert Strings to lists and
[maps](https://github.com/open-telemetry/opentelemetry-java-instrumentation/blob/release/v2.6.x/instrumentation/spring/spring-boot-autoconfigure/src/main/java/io/opentelemetry/instrumentation/spring/autoconfigure/internal/MapConverter.java),
so users can pass resource attributes both in a single environment variable (as
per
[spec](https://opentelemetry.io/docs/languages/sdk-configuration/general/#otel_resource_attributes))
or in a
[Spring Boot configuration file](https://opentelemetry.io/docs/zero-code/java/spring-boot-starter/sdk-configuration/#general-configuration).

Allowing users to use Spring beans for configuration was a bit more challenging.
We came up with a new interface,
[ComponentLoader](https://github.com/open-telemetry/opentelemetry-java/blob/release/v1.40.x/sdk-extensions/autoconfigure/src/main/java/io/opentelemetry/sdk/autoconfigure/internal/ComponentLoader.java),
that allows users to register Spring beans that will be loaded by the
OpenTelemetry SDK, which can be used for advanced configuration like
[dynamic auth headers](https://opentelemetry.io/docs/zero-code/java/spring-boot-starter/sdk-configuration/#configure-the-exporter-programmatically).
