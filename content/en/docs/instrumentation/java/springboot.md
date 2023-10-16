---
title: Spring Boot
linkTitle: Spring Boot
aliases:
  - /docs/java/getting_started
  - /docs/java/springboot
  - /docs/instrumentation/java/springboot
weight: 30
description: Spring instrumentation for OpenTelemetry Java
# prettier-ignore
---

You can instrument a Spring Boot application with the [OpenTelemetry Java agent](automatic/_index).

Another option is to use the OpenTelemetry Spring Boot starter. The rest of this page document it.

## Getting Started

OpenTelemetry Spring Starter is a starter package that allow you to setup distributed tracing.

Check out [opentelemetry-spring-boot-autoconfigure](https://github.com/open-telemetry/opentelemetry-java-instrumentation/blob/main/instrumentation/spring/spring-boot-autoconfigure/README.md#features) for the full list of supported libraries and features.

It is compatible with Spring Boot 2.0, Spring Boot 3.0 and Spring native.

Add the dependency given below in your project to enable the OpenTelemetry Spring Starter.

You have to replace`OPENTELEMETRY_VERSION` with the latest stable [release](https://search.maven.org/search?q=g:io.opentelemetry).

### Maven

Add the following dependencies to your `pom.xml` file:

```xml
<dependencies>
  <dependency>
    <groupId>io.opentelemetry.instrumentation</groupId>
    <artifactId>opentelemetry-spring-boot-starter</artifactId>
    <version>OPENTELEMETRY_VERSION</version>
  </dependency>
</dependencies>
```

### Gradle

Add the following dependencies to your gradle.build file:

```groovy
implementation("io.opentelemetry.instrumentation:opentelemetry-spring-boot-starter:OPENTELEMETRY_VERSION")
```

## Additional instrumentations

You can configure additional instrumentations with [OpenTelemetry instrumentations libraries](https://github.com/open-telemetry/opentelemetry-java-instrumentation/blob/main/docs/supported-libraries.md#libraries--frameworks).
