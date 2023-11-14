---
title: Spring Boot
linkTitle: Spring Boot
weight: 30
description: Spring instrumentation for OpenTelemetry Java
cSpell:ignore: springboot autoconfigure 
---

You can automatically instrument a [Spring Boot](https://spring.io/projects/spring-boot) application using the [OpenTelemetry Java agent](../automatic/) that uses byte code instrumentation.

The OpenTelemetry Spring Boot Starter is another way to instrument your Spring Boot application. It is a [Spring Boot starter](https://docs.spring.io/spring-boot/docs/current/reference/htmlsingle/#using.build-systems.starters).

The OpenTelemetry starter is compatible with Spring Boot 2.0, Spring Boot 3.0 and Spring native.

## Getting Started

Add the dependency given below to enable the OpenTelemetry starter.

The OpenTelemetry starter uses OpenTelemetry [Spring Boot auto-configurations](https://docs.spring.io/spring-boot/docs/current/reference/html/using.html#using.auto-configuration).

You can look at [this](https://github.com/open-telemetry/opentelemetry-java-instrumentation/blob/main/instrumentation/spring/spring-boot-autoconfigure/README.md#features) to know the supported libraries and features of the OpenTelemetry auto-configurations.

### Maven

Add the following dependencies to your `pom.xml` file:

```xml
<dependencies>
  <dependency>
    <groupId>io.opentelemetry.instrumentation</groupId>
    <artifactId>opentelemetry-spring-boot-starter</artifactId>
    <version>{{% param vers.instrumentation %}}</version>
  </dependency>
</dependencies>
```

### Gradle

Add the following dependencies to your gradle.build file:

```groovy
implementation("io.opentelemetry.instrumentation:opentelemetry-spring-boot-starter:{{% param vers.instrumentation %}}")
```

## Additional instrumentations

You can configure additional instrumentations with [OpenTelemetry instrumentations libraries](https://github.com/open-telemetry/opentelemetry-java-instrumentation/blob/main/docs/supported-libraries.md#libraries--frameworks).
