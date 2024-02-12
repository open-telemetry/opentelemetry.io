---
title: Spring Boot
linkTitle: Spring Boot
weight: 30
description: Spring Boot instrumentation for OpenTelemetry Java
# prettier-ignore
cSpell:ignore: autoconfigurations autoconfigures datasource logback springboot webflux webmvc
---

## How to instrument Spring Boot with OpenTelemetry?

The [OpenTelemetry Java agent](..) with byte code instrumentation can cover most
of your needs when instrumenting
[Spring Boot](https://spring.io/projects/spring-boot) applications.

Alternatively, the OpenTelemetry [Spring Boot starter] can help you in the
following cases:

- Spring Boot Native image applications for which the OpenTelemetry Java agent
  does not work
- Startup overhead of the OpenTelemetry Java agent exceeds your requirements
- OpenTelemetry Java agent might not work if your application already uses
  another Java monitoring agent
- You can use the Spring Boot configuration files (`application.properties`,
  `application.yml`) to configure the OpenTelemetry Spring Boot starter which
  doesn't work with the OpenTelemetry Java agent

[Spring Boot starter]:
  https://docs.spring.io/spring-boot/docs/current/reference/htmlsingle/#using.build-systems.starters

The OpenTelemetry Java agent has more automatic instrumentation features than
the OpenTelemetry starter.

You can use
[OpenTelemetry instrumentations libraries](https://github.com/open-telemetry/opentelemetry-java-instrumentation/blob/main/docs/supported-libraries.md#libraries--frameworks)
to complete the automatic instrumentation of the Spring Boot starter.

## OpenTelemetry starter Spring Boot starter

### Spring Boot application type

The OpenTelemetry Spring Boot starter works with Spring Boot 2.0 and 3.0,
and Spring Boot native image applications. The
[opentelemetry-java-examples/spring-native](https://github.com/open-telemetry/opentelemetry-java-examples/tree/main/spring-native)
repository contains an example of a Spring Boot Native image application
instrumented using the OpenTelemetry Spring Boot starter.

### Dependency management

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
            <scope>import</scope>
        </dependency>
        <dependency>
            <groupId>io.opentelemetry.instrumentation</groupId>
            <artifactId>opentelemetry-instrumentation-bom-alpha</artifactId>
            <version>{{% param vers.instrumentation %}}-alpha</version>
            <type>pom</type>
            <scope>import</scope>
        </dependency>
    </dependencies>
</dependencyManagement>
```

With Gradle and Spring Boot, you have
[two ways](https://docs.spring.io/spring-boot/docs/current/gradle-plugin/reference/htmlsingle/)
to import a BOM.

You can use the Gradle’s native BOM support by adding `dependencies`:

```kotlin
import org.springframework.boot.gradle.plugin.SpringBootPlugin

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

The OpenTelemetry starter uses OpenTelemetry Spring Boot
[autoconfiguration](https://docs.spring.io/spring-boot/docs/current/reference/html/using.html#using.auto-configuration).
For details concerning supported libraries and features of the OpenTelemetry
autoconfiguration, see the configuration
[README](https://github.com/open-telemetry/opentelemetry-java-instrumentation/blob/main/instrumentation/spring/spring-boot-autoconfigure/README.md#features).

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

#### Disable data export

{{% config_option name="otel.sdk.disabled" %}}

Set the value to `true` to disable data export, e.g. for testing purposes.

{{% /config_option %}}

### OTLP Exporter

This package provides autoconfiguration for the
[OTLP](https://github.com/open-telemetry/opentelemetry-java/tree/main/exporters/otlp)
and
[Logging](https://github.com/open-telemetry/opentelemetry-java/tree/main/exporters/logging)
Span Exporters.

As of 2.0.0+ the default protocol is `http/protobuf`. For more details on
exporter configuration, see
[OTLP Exporter Configuration](/docs/languages/sdk-configuration/otlp-exporter/).

#### Enabling/Disabling Exporters

All exporters can be enabled or disabled as in the
[SDK autoconfiguration](https://github.com/open-telemetry/opentelemetry-java/blob/main/sdk-extensions/autoconfigure/README.md#exporters).
This is the preferred way to enable/disable exporters and takes precedence over
the properties below.

| Feature               | Property                             | Default Value | ConditionalOnMissingBean                                 |
| --------------------- | ------------------------------------ | ------------- | -------------------------------------------------------- |
| OTLP Exporter         | `otel.exporter.otlp.enabled`         | true          | -                                                        |
| OTLP Span Exporter    | `otel.exporter.otlp.traces.enabled`  | true          | `OtlpHttpSpanExporter`, `OtlpGrpcSpanExporter`           |
| OTLP Metrics Exporter | `otel.exporter.otlp.metrics.enabled` | true          | `OtlpHttpMetricExporter`, `OtlpGrpcMetricExporter`       |
| OTLP Logs Exporter    | `otel.exporter.otlp.logs.enabled`    | true          | `OtlpHttpLogRecordExporter`, `OtlpGrpcLogRecordExporter` |
| Logging Exporter      | `otel.exporter.logging.enabled`      | false         | `LoggingSpanExporter`                                    |

### Tracer Properties

| Feature | Property                          | Default Value |
| ------- | --------------------------------- | ------------- |
| Tracer  | `otel.traces.sampler.probability` | 1.0           |

### Resource Properties

| Feature  | Property                                                                | Default Value |
| -------- | ----------------------------------------------------------------------- | ------------- |
| Resource | `otel.springboot.resource.enabled`                                      | true          |
|          | `otel.resource.attributes` (old: `otel.springboot.resource.attributes`) | empty map     |

`otel.resource.attributes` supports a pattern-based resource configuration in
the application.properties like this:

```properties
otel.resource.attributes.environment=dev
otel.resource.attributes.xyz=foo
```

It's also possible to specify the resource attributes in `application.yaml`:

```yaml
otel:
  resource:
    attributes:
      environment: dev
      xyz: foo
```

Finally, the resource attributes can be specified as a comma-separated list, as
described in the
[specification](/docs/languages/sdk-configuration/general/#otel_resource_attributes):

```shell
export OTEL_RESOURCE_ATTRIBUTES="key1=value1,key2=value2"
```

The service name is determined by the following precedence rules, in accordance
with the OpenTelemetry
[specification](/docs/languages/sdk-configuration/general/#otel_service_name):

1. `otel.service.name` spring property or `OTEL_SERVICE_NAME` environment
   variable (highest precedence)
2. `service.name` in `otel.resource.attributes` system/spring property or
   `OTEL_RESOURCE_ATTRIBUTES` environment variable
3. `service.name` in `otel.springboot.resource.attributes` system/spring
   property
4. `spring.application.name` spring property
5. The default value is `unknown_service:java` (lowest precedence)

### Automatic instrumentation

Autoconfigures OpenTelemetry instrumentation for
[spring-web](#spring-web-autoconfiguration),
[spring-webmvc](#spring-web-mvc-autoconfiguration), and
[spring-webflux](#spring-webflux-autoconfiguration). Leverages Spring Aspect
Oriented Programming, dependency injection, and bean post-processing to trace
spring applications.

| Feature        | Property                                      | Default Value | ConditionalOnClass     |
| -------------- | --------------------------------------------- | ------------- | ---------------------- |
| spring-web     | `otel.instrumentation.spring-webmvc.enabled`  | true          | `RestTemplate`         |
| spring-webmvc  | `otel.instrumentation.spring-web.enabled`     | true          | `OncePerRequestFilter` |
| spring-webflux | `otel.instrumentation.spring-webflux.enabled` | true          | `WebClient`            |

#### Spring Web Autoconfiguration

Provides autoconfiguration for the `RestTemplate` trace interceptor defined in
[opentelemetry-spring-web-3.1](https://github.com/open-telemetry/opentelemetry-java-instrumentation/tree/main/instrumentation/spring/spring-web/spring-web-3.1/library).
This autoconfiguration instruments all requests sent using Spring `RestTemplate`
beans by applying a `RestTemplate` bean post processor. This feature is
supported for spring web versions 3.1+. To learn more about the OpenTelemetry
`RestTemplate` interceptor, see
[opentelemetry-spring-web-3.1](https://github.com/open-telemetry/opentelemetry-java-instrumentation/tree/main/instrumentation/spring/spring-web/spring-web-3.1/library).

#### Spring Web MVC Autoconfiguration

This feature autoconfigures instrumentation for Spring WebMVC controllers by
adding a
[telemetry producing servlet `Filter`](https://github.com/open-telemetry/opentelemetry-java-instrumentation/blob/main/instrumentation/spring/spring-webmvc/spring-webmvc-5.3/library/src/main/java/io/opentelemetry/instrumentation/spring/webmvc/v5_3/WebMvcTelemetryProducingFilter.java)
bean to the application context. The filter decorates the request execution with
a server span, propagating the incoming tracing context if received in the HTTP
request. To learn more about the OpenTelemetry Spring WebMVC instrumentation,
see the
[opentelemetry-spring-webmvc-5.3 instrumentation library](https://github.com/open-telemetry/opentelemetry-java-instrumentation/tree/main/instrumentation/spring/spring-webmvc/spring-webmvc-5.3/library).

#### Spring WebFlux Autoconfiguration

Provides autoconfigurations for the OpenTelemetry WebClient ExchangeFilter
defined in
[opentelemetry-spring-webflux-5.3](https://github.com/open-telemetry/opentelemetry-java-instrumentation/tree/main/instrumentation/spring/spring-webflux/spring-webflux-5.3/library).
This autoconfiguration instruments all outgoing HTTP requests sent using
Spring's WebClient and WebClient Builder beans by applying a bean post
processor. This feature is supported for spring webflux versions 5.0+. For
details, see
[opentelemetry-spring-webflux-5.3](https://github.com/open-telemetry/opentelemetry-java-instrumentation/tree/main/instrumentation/spring/spring-webflux/spring-webflux-5.3/library).

### Additional Instrumentations

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

#### Instrumentation Annotations

This feature uses spring-aop to wrap methods annotated with `@WithSpan` in a
span. The arguments to the method can be captured as attributed on the created
span by annotating the method parameters with `@SpanAttribute`.

> **Note**: this annotation can only be applied to bean methods managed by the
> spring application context. To learn more about aspect weaving in spring, see
> [spring-aop](https://docs.spring.io/spring/docs/current/spring-framework-reference/core.html#aop).

| Feature     | Property                                   | Default Value | ConditionalOnClass |
| ----------- | ------------------------------------------ | ------------- | ------------------ |
| `@WithSpan` | `otel.instrumentation.annotations.enabled` | true          | WithSpan, Aspect   |

##### Dependency

{{< tabpane text=true >}} {{% tab header="Maven (`pom.xml`)" lang=Maven %}}

```xml
<dependencies>
  <dependency>
    <groupId>org.springframework</groupId>
    <artifactId>spring-aop</artifactId>
    <version>SPRING_VERSION</version>
  </dependency>
  <dependency>
    <groupId>io.opentelemetry</groupId>
    <artifactId>opentelemetry-extension-annotations</artifactId>
    <version>{{% param vers.otel %}}</version>
  </dependency>
</dependencies>
```

{{% /tab %}} {{% tab header="Gradle (`gradle.build`)" lang=Gradle %}}

```kotlin
dependencies {
  implementation("org.springframework:spring-aop:SPRING_VERSION")
  implementation("io.opentelemetry:opentelemetry-extension-annotations:{{% param vers.otel %}}")
}
```

{{% /tab %}} {{< /tabpane>}}

##### Usage

```java
import org.springframework.stereotype.Component;

import io.opentelemetry.instrumentation.annotations.SpanAttribute;
import io.opentelemetry.instrumentation.annotations.WithSpan;
import io.opentelemetry.api.trace.Span;
import io.opentelemetry.api.trace.SpanKind;

/**
 * Test WithSpan
 */
@Component
public class TracedClass {

    @WithSpan
    public void tracedMethod() {
    }

    @WithSpan(value="span name")
    public void tracedMethodWithName() {
        Span currentSpan = Span.current();
        currentSpan.addEvent("ADD EVENT TO tracedMethodWithName SPAN");
        currentSpan.setAttribute("isTestAttribute", true);
    }

    @WithSpan(kind = SpanKind.CLIENT)
    public void tracedClientSpan() {
    }

    public void tracedMethodWithAttribute(@SpanAttribute("attributeName") String parameter) {
    }
}
```

#### OpenTelemetry instrumentations libraries

You can configure other instrumentations with
[OpenTelemetry instrumentations libraries](https://github.com/open-telemetry/opentelemetry-java-instrumentation/blob/main/docs/supported-libraries.md#libraries--frameworks).

## Other solutions

Instead of using the OpenTelemetry Spring starter, you can use the OpenTelemetry
autoconfiguration features with an annotation or the Zipkin starter.

### Spring support

Autoconfiguration is natively supported by Spring Boot applications. To enable
these features in "vanilla" use `@EnableOpenTelemetry` to complete a component
scan of this package.

```java
import io.opentelemetry.instrumentation.spring.autoconfigure.EnableOpenTelemetry;
import org.springframework.context.annotation.Configuration;

@Configuration
@EnableOpenTelemetry
public class OpenTelemetryConfig {}
```

### Zipkin starter

OpenTelemetry Zipkin Exporter Starter is a starter package that includes the
opentelemetry-api, opentelemetry-sdk, opentelemetry-extension-annotations,
opentelemetry-logging-exporter, opentelemetry-spring-boot-autoconfigurations and
spring framework starters required to setup distributed tracing. It also
provides the
[opentelemetry-exporters-zipkin](https://github.com/open-telemetry/opentelemetry-java/tree/main/exporters/zipkin)
artifact and corresponding exporter autoconfiguration. Check out
[opentelemetry-spring-boot-autoconfigure](https://github.com/open-telemetry/opentelemetry-java-instrumentation/blob/main/instrumentation/spring/spring-boot-autoconfigure/README.md#features)
for the list of supported libraries and features.

If an exporter is present in the classpath during runtime and a spring bean of
the exporter is missing from the spring application context, an exporter bean is
initialized and added to a simple span processor in the active tracer provider.
Check out the implementation
[here](https://github.com/open-telemetry/opentelemetry-java-instrumentation/blob/main/instrumentation/spring/spring-boot-autoconfigure/src/main/java/io/opentelemetry/instrumentation/spring/autoconfigure/OpenTelemetryAutoConfiguration.java).

{{< tabpane text=true >}} {{% tab header="Maven (`pom.xml`)" lang=Maven %}}

```xml
<dependencies>
  <dependency>
    <groupId>io.opentelemetry</groupId>
    <artifactId>opentelemetry-exporter-zipkin</artifactId>
    <version>{{% param vers.otel %}}</version>
  </dependency>
</dependencies>
```

{{% /tab %}} {{% tab header="Gradle (`gradle.build`)" lang=Gradle %}}

```kotlin
dependencies {
  implementation("io.opentelemetry:opentelemetry-exporter-zipkin:{{% param vers.otel %}}")
}
```

{{% /tab %}} {{< /tabpane>}}

#### Configurations

| Property                       | Default Value | ConditionalOnClass   |
| ------------------------------ | ------------- | -------------------- |
| `otel.exporter.zipkin.enabled` | true          | `ZipkinSpanExporter` |
