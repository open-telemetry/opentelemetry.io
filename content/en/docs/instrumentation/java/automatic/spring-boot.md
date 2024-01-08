---
title: Spring Boot
linkTitle: Spring Boot
weight: 30
description: Spring instrumentation for OpenTelemetry Java
cSpell:ignore: autoconfigure datasource logback springboot springframework
---

## How to instrument a Spring Boot application

The [OpenTelemetry Java agent](..) with byte code instrumentation should cover
most of your needs to instrument your [Spring Boot](https://spring.io/projects/spring-boot)
application.

You can't use the OpenTelemetry Java agent with a Spring Boot Native image application, but the
OpenTelemetry [Spring Boot starter] allows you to instrument your code.

[Spring Boot starter]:
https://docs.spring.io/spring-boot/docs/current/reference/htmlsingle/#using.build-systems.starters

[opentelemetry-java-examples/spring-native](https://github.com/open-telemetry/opentelemetry-java-examples/tree/main/spring-native gives an example of a Spring Boot Native image application with the OpenTelemetry
Spring Boot starter.

If your application already uses a Java agent, the OpenTelemetry Java agent may not work, and you can also use the OpenTelemetry starter.

A third situation in which the OpenTelemetry starter can help you is when the start-up overhead of the OpenTelemetry Java agent is too important for you.

The rest of this page documents the OpenTelemetry starter that works with Spring Boot 2.0 and 3.0.

## OpenTelemetry Spring starter

### Configuration

#### Dependency management

A Bill of Material
([BOM](https://maven.apache.org/guides/introduction/introduction-to-dependency-mechanism.html#bill-of-materials-bom-poms))
ensures that versions of dependencies (including transitive ones) are aligned.

Importing the `opentelemetry-bom` and `opentelemetry-instrumentation-bom-alpha`
BOMs when using the OpenTelemetry starter is important to ensure version
alignment across all OpenTelemetry dependencies.

The following example shows how to import both BOMs using Maven:

```xml
<dependencyManagement>
    <dependencies>
        <dependency>
            <groupId>io.opentelemetry</groupId>
            <artifactId>opentelemetry-bom</artifactId>
            <version>{{% param vers.otel %}}</version>
            <type>pom</type>
        </dependency>
        <dependency>
            <groupId>io.opentelemetry.instrumentation</groupId>
            <artifactId>opentelemetry-instrumentation-bom-alpha</artifactId>
            <version>{{% param vers.instrumentation %}}-alpha</version>
            <type>pom</type>
        </dependency>
    </dependencies>
</dependencyManagement>
```

With Gradle and Spring Boot, you have
[two ways](https://docs.spring.io/spring-boot/docs/current/gradle-plugin/reference/htmlsingle/)
to import a BOM.

You can use the Gradle’s native BOM support by adding dependencies:

```kotlin
plugins {
  id("java")
  id("org.springframework.boot") version "3.2.O"
}

dependencies {
  implementation(platform(SpringBootPlugin.BOM_COORDINATES))
  implementation(platform("io.opentelemetry:opentelemetry-bom:{{% param vers.otel %}}"))
  implementation(platform("io.opentelemetry.instrumentation:opentelemetry-instrumentation-bom-alpha:{{% param vers.instrumentation %}}-alpha"))
}
```

The other way with Gradle is to use the `io.spring.dependency-management` plugin
and to import the BOMs in `dependencyManagement`:

```kotlin
plugins {
  id("java")
  id("org.springframework.boot") version "3.2.O"
  id("io.spring.dependency-management") version "1.1.0"
}

dependencyManagement {
  imports {
    mavenBom("io.opentelemetry:opentelemetry-bom:{{% param vers.otel %}}")
    mavenBom("io.opentelemetry.instrumentation:opentelemetry-instrumentation-bom-alpha:{{% param vers.instrumentation %}}-alpha")
  }
}
```

{{% alert title="Note" color="info" %}}

Be careful not to mix up the different ways of configuring things with Gradle.
For example, don't use
`implementation(platform("io.opentelemetry:opentelemetry-bom:{{% param vers.otel %}}"))`
with the `io.spring.dependency-management` plugin.

{{% /alert %}}

#### OpenTelemetry Starter dependency

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
	</dependency>
</dependencies>
```

{{% /tab %}} {{% tab header="Gradle (`gradle.build`)" lang=Gradle %}}

```kotlin
dependencies {
	implementation("io.opentelemetry.instrumentation:opentelemetry-spring-boot-starter")
}
```

{{% /tab %}} {{< /tabpane>}}

### Additional instrumentations

#### JDBC Instrumentation

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
	</dependency>
</dependencies>
```

{{% /tab %}} {{% tab header="Gradle (`gradle.build`)" lang=Gradle %}}

```kotlin
dependencies {
	implementation("io.opentelemetry.instrumentation:opentelemetry-jdbc")
}
```

{{% /tab %}} {{< /tabpane>}}

#### Logging Instrumentation

To enable the logging instrumentation for Logback you have to add the
OpenTelemetry appender in your `logback.xml` or `logback-spring.xml` file:

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

For Log4j 2, you have to add the OpenTelemetry appender to your `log4j2.xml`
file:

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

You can find more configuration options for the OpenTelemetry appender in the
documentation of the
[Logback](https://github.com/open-telemetry/opentelemetry-java-instrumentation/blob/main/instrumentation/logback/logback-appender-1.0/library/README.md)
and
[Log4j](https://github.com/open-telemetry/opentelemetry-java-instrumentation/blob/main/instrumentation/log4j/log4j-appender-2.17/library/README.md)
instrumentation libraries.

#### Other Instrumentation

You can configure other instrumentations with
[OpenTelemetry instrumentations libraries](https://github.com/open-telemetry/opentelemetry-java-instrumentation/blob/main/docs/supported-libraries.md#libraries--frameworks).
