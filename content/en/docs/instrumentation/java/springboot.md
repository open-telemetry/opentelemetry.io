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

You can instrument a Spring Boot application with the [OpenTelemetry java agent](automatic/_index).

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

### JDBC instrumentation

To have JDBC instrumentation with the OpenTelemetry Spring start, add the dependency given on [this page](https://github.com/open-telemetry/opentelemetry-java-instrumentation/tree/main/instrumentation/jdbc/library).

You have two ways to enable the JDBC instrumentation with the OpenTelemetry starter.

You can wrap the `DataSource` bean in an `io.opentelemetry.instrumentation.jdbc.datasource.OpenTelemetryDataSource`:

```java
import io.opentelemetry.instrumentation.jdbc.datasource.OpenTelemetryDataSource;

@Configuration
public class DataSourceConfig {

  @Bean
  public DataSource dataSource(OpenTelemetry openTelemetry) {
    DataSourceBuilder dataSourceBuilder = DataSourceBuilder.create();
    // Data source configurations
    DataSource dataSource = dataSourceBuilder.build();
    return new OpenTelemetryDataSource(dataSource, openTelemetry);
  }

}
```

If your application does not declare `DataSource` bean, you can update your `application.properties` file to
have the datasource url starting with `jdbc:otel` and set the driver class to io.opentelemetry.instrumentation.jdbc.OpenTelemetryDriver

```properties
spring.datasource.url=jdbc:otel:h2:mem:db
spring.datasource.driver-class-name=io.opentelemetry.instrumentation.jdbc.OpenTelemetryDriver
```
