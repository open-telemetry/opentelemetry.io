---
title: Spring Boot
linkTitle: Spring Boot
weight: 30
description: Spring instrumentation for OpenTelemetry Java
cSpell:ignore: autoconfigure springboot
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
    <version>{{% param vers.instrumentation %}}</version>
  </dependency>
</dependencies>
```

{{% /tab %}} {{% tab header="Gradle (`gradle.build`)" lang=Gradle %}}

```groovy
dependencies {
  implementation('io.opentelemetry.instrumentation:opentelemetry-spring-boot-starter:{{% param vers.instrumentation %}}')
}
```

{{% /tab %}} {{< /tabpane>}}

## Additional instrumentations


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
    //Data source configurations
    DataSource dataSource = dataSourceBuilder.build();
    return new OpenTelemetryDataSource(dataSource, openTelemetry);
  }

}
```

If your application does not declare `DataSource` bean, you can update your `application.properties` file to
have the data source URL starting with `jdbc:otel` and set the driver class to io.opentelemetry.instrumentation.jdbc.OpenTelemetryDriver

```properties
spring.datasource.url=jdbc:otel:h2:mem:db
spring.datasource.driver-class-name=io.opentelemetry.instrumentation.jdbc.OpenTelemetryDriver
```

### Logging instrumentation

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
		<version>{{% param vers.instrumentation %}}</version>
	</dependency>
</dependencies>
```

{{% /tab %}} {{% tab header="Gradle (`gradle.build`)" lang=Gradle %}}

```groovy
dependencies {
	implementation('io.opentelemetry.instrumentation:opentelemetry-spring-boot-starter:{{% param vers.instrumentation %}}')
}
```

{{% /tab %}} {{< /tabpane>}}

## Additional instrumentations


### JDBC instrumentation

To have JDBC instrumentation with the OpenTelemetry Spring start, add the follwing dependency:


{{< tabpane text=true >}} {{% tab header="Maven (`pom.xml`)" lang=Maven %}}
```xml
<dependencies>
	<dependency>
		<groupId>io.opentelemetry.instrumentation</groupId>
		<artifactId>opentelemetry-jdbc</artifactId>
		<version>{{% param vers.instrumentation %}}</version>
	</dependency>
</dependencies>
```

{{% /tab %}} {{% tab header="Gradle (`gradle.build`)" lang=Gradle %}}

```groovy
dependencies {
	implementation('io.opentelemetry.instrumentation:opentelemetry-jdbc:{{% param vers.instrumentation %}}')
}
```

{{% /tab %}} {{< /tabpane>}}

You have two ways to enable the JDBC instrumentation with the OpenTelemetry starter.

You can wrap the `DataSource` bean in an `io.opentelemetry.instrumentation.jdbc.datasource.OpenTelemetryDataSource`:

```java
import io.opentelemetry.instrumentation.jdbc.datasource.OpenTelemetryDataSource;

@Configuration
public class DataSourceConfig {

	@Bean
	public DataSource dataSource(OpenTelemetry openTelemetry) {
		DataSourceBuilder dataSourceBuilder = DataSourceBuilder.create();
		//Data source configurations
		DataSource dataSource = dataSourceBuilder.build();
		return new OpenTelemetryDataSource(dataSource, openTelemetry);
	}

}
```

If your application does not declare `DataSource` bean, you can update your `application.properties` file to
have the data source URL starting with `jdbc:otel` and set the driver class to io.opentelemetry.instrumentation.jdbc.OpenTelemetryDriver

```properties
spring.datasource.url=jdbc:otel:h2:mem:db
spring.datasource.driver-class-name=io.opentelemetry.instrumentation.jdbc.OpenTelemetryDriver
```

### Logging instrumentation

You can use the [Logback](https://github.com/open-telemetry/opentelemetry-java-instrumentation/blob/main/instrumentation/logback/logback-appender-1.0/library/README.md) and [Log4j](https://github.com/open-telemetry/opentelemetry-java-instrumentation/blob/main/instrumentation/log4j/log4j-appender-2.17/library/README.md) instrumentation libraries with the OpenTelemetry starter.

You don't have to do `OpenTelemetryAppender.install(openTelemetrySdk)` because the OpenTelemetry starter takes care of that.

### Other instrumentation

You can configure other instrumentations with [OpenTelemetry instrumentations libraries](https://github.com/open-telemetry/opentelemetry-java-instrumentation/blob/main/docs/supported-libraries.md#libraries--frameworks).
