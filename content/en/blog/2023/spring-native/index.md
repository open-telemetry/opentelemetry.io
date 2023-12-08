---
title: Observe your Spring Native Image application with OpenTelemetry
linkTitle: Observe Spring Native
date: 2023-12-07
author: >-
  [Jean Bisutti](https://github.com/jeanbisutti) (Microsoft)
cSpell:ignore: datasource logback bisutti
---

The
[OpenTelemetry Java agent](/docs/instrumentation/java/automatic)
is a convenient and well-established way to instrument Java applications.
However, as of today
[it is not possible to use it with GraalVM Native Images](https://github.com/oracle/graal/issues/1065).

To provide you with an easy and seamless way for Spring Boot Native Image
application nevertheless, the OpenTelemetry Java contributors have improved the
existing OpenTelemetry Spring Boot Starter to work well with Spring Boot Native
Image applications. Read on to learn more!

## A history of the last months

The OpenTelemetry Spring Boot Starter allows to add OpenTelemetry to your
application without byte code instrumentation.

The OpenTelemetry Java contributors have used this to instrument Spring Boot
Native Images.

By adding the starter dependency to your project, you will benefit from an OTLP
exports of logs (added the last months), spans and metrics, with an
auto-instrumentation for Spring HTTP frameworks (updated the last months to make
it work with Spring Boot 3) out of the box:

```xml
<dependencies>
  <dependency>
    <groupId>io.opentelemetry.instrumentation</groupId>
    <artifactId>opentelemetry-spring-boot-starter</artifactId>
    <version>1.32.0-alpha</version>
  </dependency>
</dependencies>
```

To get even more visibility, the Starter can be combined with
[instrumentation libraries](/docs/instrumentation/java/libraries/). For this
purpose, the OpenTelemetry Java contributors have improved the JDBC (database)
libraries and logging instrumentation libraries. For example, for the Logback
logging library, they have added GraalVM configuration to make the library work
in native mode[^1].

Furthermore, they have worked to reduce the configuration to set up the logging
and database instrumentation with the Starter. For example, if your application
does not declare a DataSource bean, you can enable the database by simply adding
two properties in the `application.properties` file:

```properties
spring.datasource.url=jdbc:otel:h2:mem:db
spring.datasource.driver-class-name=io.opentelemetry.instrumentation.jdbc.OpenTelemetryDriver
```

Read the
[documentation](https://opentelemetry.io/docs/instrumentation/java/automatic/spring-boot/)
of the OpenTelemetry Spring Boot Starter to learn more. You can use
[opentelemetry-java-examples/spring-native](https://github.com/open-telemetry/opentelemetry-java-examples/tree/main/spring-native)
to run a Spring Boot Native Image application and look at the generated logs as
well as HTTP and database telemetry data.

Finally, the OpenTelemetry Java contributors have added GraalVM Native automatic
tests to the OpenTelemetry Java project to detect regressions related to the
native mode execution.

## What’s next?

The OpenTelemetry Java contributors expect to be able to enable automatic
logging and database instrumentation configuration.

If you try out the OpenTelemetry Spring Boot Starter, share your thoughts and
experiences via
[GitHub discussions](https://github.com/open-telemetry/opentelemetry-java/discussions)
or the [#otel-java](https://cloud-native.slack.com/archives/C014L2KCTE3)
[CNCF Slack](https://slack.cncf.io) channel.

[^1]:
    Spring Boot Native Image applications
    [do not support Log4j2 logging library](https://github.com/spring-projects/spring-boot/wiki/Spring-Boot-with-GraalVM).
