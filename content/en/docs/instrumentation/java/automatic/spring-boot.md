---
title: Spring Boot
linkTitle: Spring Boot
weight: 30
description: Spring instrumentation for OpenTelemetry Java
cSpell:ignore: springboot autoconfigure
---

You can use the [OpenTelemetry Java agent](..) with byte code instrumentation to
automatically instrument a [Spring Boot](https://spring.io/projects/spring-boot)
application; or you can also use the OpenTelemetry [Spring Boot starter] to
instrument your application.

[Spring Boot starter]:
  https://docs.spring.io/spring-boot/docs/current/reference/htmlsingle/#using.build-systems.starters

The OpenTelemetry starter is compatible with Spring Boot 2.0 and 3.0, and Spring
native.

## Getting Started

Add the dependency given below to enable the OpenTelemetry starter.

The OpenTelemetry starter uses OpenTelemetry Spring Boot [auto-configuration].
For details concerning supported libraries and features of the OpenTelemetry
auto-configuration, see the configuration [README].

[auto-configuration]:
  https://docs.spring.io/spring-boot/docs/current/reference/html/using.html#using.auto-configuration
[README]:
  https://github.com/open-telemetry/opentelemetry-java-instrumentation/blob/main/instrumentation/spring/spring-boot-autoconfigure/README.md#features

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
dependencies {
	implementation('io.opentelemetry.instrumentation:opentelemetry-spring-boot-starter:{{% param vers.instrumentation %}}')
}
```

## Additional instrumentations

You can configure additional instrumentations with
[OpenTelemetry instrumentations libraries](https://github.com/open-telemetry/opentelemetry-java-instrumentation/blob/main/docs/supported-libraries.md#libraries--frameworks).
