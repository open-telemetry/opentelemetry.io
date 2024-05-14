---
title: Spring Boot
linkTitle: Spring Boot
weight: 30
description: Spring Boot instrumentation for OpenTelemetry Java
# prettier-ignore
cSpell:ignore: autoconfigurations autoconfigures customizer datasource distro logback springboot webflux webmvc
---

## How to instrument Spring Boot with OpenTelemetry

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

## OpenTelemetry Spring Boot starter

### Compatibility

The OpenTelemetry Spring Boot starter works with Spring Boot 2.0 and 3.0, and
Spring Boot native image applications. The
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

### Configuration

This spring starter supports
[configuration metadata](https://docs.spring.io/spring-boot/docs/current/reference/html/configuration-metadata.html),
which means that you can see and autocomplete all available properties in your
IDE.

#### General configuration

The OpenTelemetry Starter supports all the
[SDK Autoconfiguration](/docs/languages/java/automatic/configuration/#sdk-autoconfiguration)
(since 2.2.0).

You can update the configuration with properties in the `application.properties`
or the `application.yaml` file, or with environment variables.

`application.properties` example:

```properties
otel.propagators=tracecontext,b3
otel.resource.attributes.deployment.environment=dev
otel.resource.attributes.service.name=cart
otel.resource.attributes.service.namespace=shop
```

`application.yaml` example:

```yaml
otel:
  propagators:
    - tracecontext
    - b3
  resource:
    attributes:
      deployment.environment: dev
      service:
        name: cart
        namespace: shop
```

Environment variables example:

```shell
export OTEL_PROPAGATORS="tracecontext,b3"
export OTEL_RESOURCE_ATTRIBUTES="deployment.environment=dev,service.name=cart,service.namespace=shop"
```

#### Overriding Resource Attributes

As usual in Spring Boot, you can override properties in the
`application.properties` and `application.yaml` files with environment
variables.

For example, you can set or override the `deployment.environment` resource
attribute (not changing `service.name` or `service.namespace`) by setting the
standard `OTEL_RESOURCE_ATTRIBUTES` environment variable:

```shell
export OTEL_RESOURCE_ATTRIBUTES="deployment.environment=prod"
```

Alternatively, you can use the `OTEL_RESOURCE_ATTRIBUTES_DEPLOYMENT_ENVIRONMENT`
environment variable to set or override a single resource attribute:

```shell
export OTEL_RESOURCE_ATTRIBUTES_DEPLOYMENT_ENVIRONMENT="prod"
```

The second option supports
[SpEL](https://docs.spring.io/spring-framework/docs/3.2.x/spring-framework-reference/html/expressions.html)
expressions.

Note that `DEPLOYMENT_ENVIRONMENT` gets converted to `deployment.environment` by
Spring Boot's
[Relaxed Binding](https://docs.spring.io/spring-boot/docs/current/reference/html/features.html#features.external-config.typesafe-configuration-properties.relaxed-binding.environment-variables).

#### Disable the OpenTelemetry Starter

{{% config_option name="otel.sdk.disabled" %}}

Set the value to `true` to disable the starter, e.g. for testing purposes.

{{% /config_option %}}

#### Programmatic configuration

You can use the `AutoConfigurationCustomizerProvider` for programmatic
configuration. Programmatic configuration is recommended for advanced use cases,
which are not configurable using properties.

##### Exclude actuator endpoints from tracing

As an example, you can customize the sampler to exclude health check endpoints
from tracing:

{{< tabpane text=true >}} {{% tab header="Maven (`pom.xml`)" lang=Maven %}}

```xml
<dependencies>
  <dependency>
    <groupId>io.opentelemetry.contrib</groupId>
    <artifactId>opentelemetry-samplers</artifactId>
    <version>1.33.0-alpha</version>
  </dependency>
</dependencies>
```

{{% /tab %}} {{% tab header="Gradle (`gradle.build`)" lang=Gradle %}}

```kotlin
dependencies {
  implementation("io.opentelemetry.contrib:opentelemetry-samplers:1.33.0-alpha")
}
```

{{% /tab %}} {{< /tabpane>}}

```java
import io.opentelemetry.api.trace.SpanKind;
import io.opentelemetry.contrib.sampler.RuleBasedRoutingSampler;
import io.opentelemetry.sdk.autoconfigure.spi.AutoConfigurationCustomizerProvider;
import io.opentelemetry.semconv.SemanticAttributes;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenTelemetryConfig {

  @Bean
  public AutoConfigurationCustomizerProvider otelCustomizer() {
    return p ->
        p.addSamplerCustomizer(
            (fallback, config) ->
                RuleBasedRoutingSampler.builder(SpanKind.SERVER, fallback)
                    .drop(SemanticAttributes.URL_PATH, "^/actuator")
                    .build());
  }
}
```

##### Configure the exporter programmatically

You can also configure OTLP exporters programmatically. This configuration
replaces the default OTLP exporter and adds a custom header to the requests.

```java
import io.opentelemetry.exporter.otlp.http.trace.OtlpHttpSpanExporter;
import io.opentelemetry.sdk.autoconfigure.spi.AutoConfigurationCustomizerProvider;
import java.util.Collections;
import java.util.Map;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenTelemetryConfig {

  @Bean
  public AutoConfigurationCustomizerProvider otelCustomizer() {
    return p ->
        p.addSpanExporterCustomizer(
            (exporter, config) -> {
              if (exporter instanceof OtlpHttpSpanExporter) {
                return ((OtlpHttpSpanExporter) exporter)
                    .toBuilder().setHeaders(this::headers).build();
              }
              return exporter;
            });
  }

  private Map<String, String> headers() {
    return Collections.singletonMap("Authorization", "Bearer " + refreshToken());
  }

  private String refreshToken() {
    // e.g. read the token from a kubernetes secret
    return "token";
  }
}
```

#### Resource Providers

The OpenTelemetry Starter includes the same resource providers as the Java
agent:

- [Common resource providers](https://github.com/open-telemetry/opentelemetry-java-instrumentation/tree/main/instrumentation/resources/library)
- [Resource providers that are disabled by default](/docs/languages/java/automatic/configuration/#enable-resource-providers-that-are-disabled-by-default)

In addition, the OpenTelemetry Starter includes the following Spring Boot
specific resource providers:

##### Distribution Resource Provider

FQN:
`io.opentelemetry.instrumentation.spring.autoconfigure.resources.DistroVersionResourceProvider`

| Attribute                  | Value                               |
| -------------------------- | ----------------------------------- |
| `telemetry.distro.name`    | `opentelemetry-spring-boot-starter` |
| `telemetry.distro.version` | version of the starter              |

##### Spring Resource Provider

FQN:
`io.opentelemetry.instrumentation.spring.autoconfigure.resources.SpringResourceProvider`

| Attribute         | Value                                                                                                         |
| ----------------- | ------------------------------------------------------------------------------------------------------------- |
| `service.name`    | `spring.application.name` or `build.version` from `build-info.properties` (see [Service name](#service-name)) |
| `service.version` | `build.name` from `build-info.properties`                                                                     |

#### Service name

Using these resource providers, the service name is determined by the following
precedence rules, in accordance with the OpenTelemetry
[specification](/docs/languages/sdk-configuration/general/#otel_service_name):

1. `otel.service.name` spring property or `OTEL_SERVICE_NAME` environment
   variable (highest precedence)
2. `service.name` in `otel.resource.attributes` system/spring property or
   `OTEL_RESOURCE_ATTRIBUTES` environment variable
3. `spring.application.name` spring property
4. `build-info.properties`
5. `Implementation-Title` from META-INF/MANIFEST.MF
6. The default value is `unknown_service:java` (lowest precedence)

Use the following snippet in your pom.xml file to generate the
`build-info.properties` file:

{{< tabpane text=true >}} {{% tab header="Maven (`pom.xml`)" lang=Maven %}}

```xml
<build>
    <finalName>${project.artifactId}</finalName>
    <plugins>
        <plugin>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-maven-plugin</artifactId>
            <executions>
                <execution>
                    <goals>
                        <goal>build-info</goal>
                        <goal>repackage</goal>
                    </goals>
                </execution>
            </executions>
        </plugin>
    </plugins>
</build>
```

{{% /tab %}} {{% tab header="Gradle (`gradle.build`)" lang=Gradle %}}

```kotlin
springBoot {
  buildInfo {
  }
}
```

{{% /tab %}} {{< /tabpane>}}

### Automatic instrumentation

Automatic instrumentation is available for several frameworks:

| Feature        | Property                                        | Default Value |
| -------------- | ----------------------------------------------- | ------------- |
| Logback        | `otel.instrumentation.logback-appender.enabled` | true          |
| Spring Web     | `otel.instrumentation.spring-web.enabled`       | true          |
| Spring Web MVC | `otel.instrumentation.spring-webmvc.enabled`    | true          |
| Spring WebFlux | `otel.instrumentation.spring-webflux.enabled`   | true          |

#### Logback

You can enable experimental features with system properties to capture
attributes :

| System property                                                                        | Type    | Default | Description                                                                                                                                   |
| -------------------------------------------------------------------------------------- | ------- | ------- | --------------------------------------------------------------------------------------------------------------------------------------------- | --- |
| `otel.instrumentation.logback-appender.experimental-log-attributes`                    | Boolean | false   | Enable the capture of experimental log attributes `thread.name` and `thread.id`.                                                              |     |
| `otel.instrumentation.logback-appender.experimental.capture-code-attributes`           | Boolean | false   | Enable the capture of [source code attributes]. Note that capturing source code attributes at logging sites might add a performance overhead. |
| `otel.instrumentation.logback-appender.experimental.capture-marker-attribute`          | Boolean | false   | Enable the capture of Logback markers as attributes.                                                                                          |
| `otel.instrumentation.logback-appender.experimental.capture-key-value-pair-attributes` | Boolean | false   | Enable the capture of Logback key value pairs as attributes.                                                                                  |
| `otel.instrumentation.logback-appender.experimental.capture-logger-context-attributes` | Boolean | false   | Enable the capture of Logback logger context properties as attributes.                                                                        |
| `otel.instrumentation.logback-appender.experimental.capture-mdc-attributes`            | String  |         | Comma separated list of MDC attributes to capture. Use the wildcard character `*` to capture all attributes.                                  |

[source code attributes]:
  /docs/specs/semconv/general/attributes/#source-code-attributes

Alternatively, you can enable these features by adding the OpenTelemetry Logback
appender in your `logback.xml` or `logback-spring.xml` file:

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
        <captureExperimentalAttributes>false</captureExperimentalAttributes>
        <captureCodeAttributes>true</captureCodeAttributes>
        <captureMarkerAttribute>true</captureMarkerAttribute>
        <captureKeyValuePairAttributes>true</captureKeyValuePairAttributes>
        <captureLoggerContext>true</captureLoggerContext>
        <captureMdcAttributes>*</captureMdcAttributes>
    </appender>
    <root level="INFO">
        <appender-ref ref="console"/>
        <appender-ref ref="OpenTelemetry"/>
    </root>
</configuration>
```

#### Spring Web Autoconfiguration

Provides autoconfiguration for the `RestTemplate` trace interceptor defined in
[opentelemetry-spring-web-3.1](https://github.com/open-telemetry/opentelemetry-java-instrumentation/tree/main/instrumentation/spring/spring-web/spring-web-3.1/library).
This autoconfiguration instruments all requests sent using Spring `RestTemplate`
beans by applying a `RestTemplate` bean post processor. This feature is
supported for spring web versions 3.1+. To learn more about the OpenTelemetry
`RestTemplate` interceptor, see
[opentelemetry-spring-web-3.1](https://github.com/open-telemetry/opentelemetry-java-instrumentation/tree/main/instrumentation/spring/spring-web/spring-web-3.1/library).

The following ways of creating a `RestTemplate` are supported:

```java
@Bean
public RestTemplate restTemplate() {
    return new RestTemplate();
}
```

```java
public MyService(RestTemplateBuilder restTemplateBuilder) {
    this.restTemplate = restTemplateBuilder.build();
}
```

The following ways of creating a `RestClient` are supported:

```java
@Bean
public RestClient restClient() {
    return RestClient.create();
}
```

```java
public MyService(RestClient.Builder restClientBuilder) {
    this.restClient = restClientBuilder.build();
}
```

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

The following ways of creating a `WebClient` are supported:

```java
@Bean
public WebClient webClient() {
    return WebClient.create();
}
```

```java
public MyService(WebClient.Builder webClientBuilder) {
    this.webClient = webClientBuilder.build();
}
```

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

#### Log4j2 Instrumentation

You have to add the OpenTelemetry appender to your `log4j2.xml` file:

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
[Log4j](https://github.com/open-telemetry/opentelemetry-java-instrumentation/blob/main/instrumentation/log4j/log4j-appender-2.17/library/README.md)
instrumentation library.

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
