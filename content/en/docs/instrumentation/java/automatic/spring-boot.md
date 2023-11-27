---
title: Spring Boot
linkTitle: Spring Boot
weight: 30
description: Spring instrumentation for OpenTelemetry Java
cSpell:ignore: autoconfigure datasource logback springboot
---

You can use the [OpenTelemetry Java agent](..) with byte code instrumentation to
automatically instrument a [Spring Boot](https://spring.io/projects/spring-boot)
application; or you can also use the OpenTelemetry [Spring Boot starter] to
instrument your application.

[Spring Boot starter]:
  https://docs.spring.io/spring-boot/docs/current/reference/htmlsingle/#using.build-systems.starters

The OpenTelemetry starter is compatible with Spring Boot 2.0 and 3.0, and Spring
native.

## Configuration

Add the dependency given below to enable the OpenTelemetry starter.

The OpenTelemetry starter uses OpenTelemetry Spring Boot [auto-configuration].
For details concerning supported libraries and features of the OpenTelemetry
auto-configuration, see the configuration [README].

[auto-configuration]:
  https://docs.spring.io/spring-boot/docs/current/reference/html/using.html#using.auto-configuration
[README]:
  https://github.com/open-telemetry/opentelemetry-java-instrumentation/blob/main/instrumentation/spring/spring-boot-autoconfigure/README.md#features

{{< tabpane text=true >}} {{% tab header="Maven (`pom.xml`)" lang=Maven %}}

```xml
<dependencies>
	<dependency>
		<groupId>io.opentelemetry.instrumentation</groupId>
		<artifactId>opentelemetry-spring-boot-starter</artifactId>
		<version>{{% param vers.instrumentation-alpha %}}</version>
	</dependency>
</dependencies>
```

{{% /tab %}} {{% tab header="Gradle (`gradle.build`)" lang=Gradle %}}

```groovy
dependencies {
	implementation('io.opentelemetry.instrumentation:opentelemetry-spring-boot-starter:{{% param vers.instrumentation-alpha %}}')
}
```

{{% /tab %}} {{< /tabpane>}}

## Additional instrumentations

### JDBC Instrumentation

You have two ways to enable the JDBC instrumentation with the OpenTelemetry
starter.

If your application does not declare `DataSource` bean, you can update your
`application.properties` file to have the data source URL starting with
`jdbc:otel:` and set the driver class to
`io.opentelemetry.instrumentation.jdbc.OpenTelemetryDriver`.

```properties
spring.datasource.url=jdbc:otel:h2:mem:db
spring.datasource.driver-class-name=io.opentelemetry.instrumentation.jdbc.OpenTelemetryDriver
```

You can also wrap the `DataSource` bean in an
`io.opentelemetry.instrumentation.jdbc.datasource.OpenTelemetryDataSource`:

```java
import io.opentelemetry.instrumentation.jdbc.datasource.JdbcTelemetry;

@Configuration
public class DataSourceConfig {

	@Bean
	public DataSource dataSource(OpenTelemetry openTelemetry) {
		DataSourceBuilder dataSourceBuilder = DataSourceBuilder.create();
		//Data source configurations
		DataSource dataSource = dataSourceBuilder.build();
		return JdbcTelemetry.create(openTelemetry).wrap(dataSource);
	}

}
```

With the datasource configuration, you need to add the following dependency:

{{< tabpane text=true >}} {{% tab header="Maven (`pom.xml`)" lang=Maven %}}

```xml
<dependencies>
	<dependency>
		<groupId>io.opentelemetry.instrumentation</groupId>
		<artifactId>opentelemetry-jdbc</artifactId>
		<version>{{% param vers.instrumentation-alpha %}}</version>
	</dependency>
</dependencies>
```

{{% /tab %}} {{% tab header="Gradle (`gradle.build`)" lang=Gradle %}}

```groovy
dependencies {
	implementation('io.opentelemetry.instrumentation:opentelemetry-jdbc:{{% param vers.instrumentation-alpha %}}')
}
```

{{% /tab %}} {{< /tabpane>}}

### Logging Instrumentation

To enable the logging instrumentation for Logback you have to add the OpenTelemetry appender in your `logback.xml` or `logback-spring.xml` file:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<configuration>
	<appender name="console" class="ch.qos.logback.core.ConsoleAppender">
		<encoder>
			<pattern>
				%d{HH:mm:ss.SSS} [%thread] %-5level %logger{36} - %msg%n
			</pattern>
		</encoder>
	</appender>
	<appender name="OpenTelemetry"
		class="io.opentelemetry.instrumentation.logback.appender.v1_0.OpenTelemetryAppender">
	</appender>
	<root level="INFO">
		<appender-ref ref="console"/>
		<appender-ref ref="OpenTelemetry"/>
	</root>
</configuration>
```

For Log4j 2, you have to add the OpenTelemetry appender to your `log4j2.xml` file:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<Configuration status="WARN" packages="io.opentelemetry.instrumentation.log4j.appender.v2_17">
	<Appenders>
		<OpenTelemetry name="OpenTelemetryAppender"/>
	</Appenders>
	<Loggers>
		<Root>
			<AppenderRef ref="OpenTelemetryAppender" level="All"/>
		</Root>
	</Loggers>
</Configuration>
```

You can find more configuration options for the OpenTelemetry appender in the documentation of the 
[Logback](https://github.com/open-telemetry/opentelemetry-java-instrumentation/blob/main/instrumentation/logback/logback-appender-1.0/library/README.md)
and
[Log4j](https://github.com/open-telemetry/opentelemetry-java-instrumentation/blob/main/instrumentation/log4j/log4j-appender-2.17/library/README.md)
instrumentation libraries.

### Other Instrumentation

You can configure other instrumentations with
[OpenTelemetry instrumentations libraries](https://github.com/open-telemetry/opentelemetry-java-instrumentation/blob/main/docs/supported-libraries.md#libraries--frameworks).
