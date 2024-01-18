---
title: Spring Boot
linkTitle: Spring Boot
weight: 30
description: Spring Boot instrumentation for OpenTelemetry Java
cSpell:ignore: autoconfigure datasource logback springboot springframework
---

The [OpenTelemetry Java agent](..) with byte code instrumentation can cover most
of your needs when instrumenting
[Spring Boot](https://spring.io/projects/spring-boot) applications.

Alternatively, the OpenTelemetry [Spring Boot starter] can help you in the
following cases:

- with Spring Boot Native image applications for which the OpenTelemetry Java
  agent does not work
- the startup overhead of the OpenTelemetry Java agent exceeds your requirements
- the OpenTelemetry Java agent might not work if your application already uses
  another Java monitoring agent

[Spring Boot starter]:
  https://docs.spring.io/spring-boot/docs/current/reference/htmlsingle/#using.build-systems.starters

The
[opentelemetry-java-examples/spring-native](https://github.com/open-telemetry/opentelemetry-java-examples/tree/main/spring-native)
repository contains an example of a Spring Boot Native image application
instrumented using the OpenTelemetry Spring Boot starter.

The rest of this page documents the OpenTelemetry starter that works with Spring
Boot 2.0 and 3.0.

## OpenTelemetry Spring starter

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

### OTLP Exporter

This package provides auto configurations for
[OTLP](https://github.com/open-telemetry/opentelemetry-java/tree/main/exporters/otlp)
and
[Logging](https://github.com/open-telemetry/opentelemetry-java/tree/main/exporters/logging)
Span Exporters.

#### Exporter Properties

| Feature       | Property                    | Default Value    |
| ------------- | --------------------------- | ---------------- |
| Otlp Exporter | otel.exporter.otlp.endpoint | `localhost:4317` |
|               | otel.exporter.otlp.protocol | `http/protobuf`  |
|               | otel.exporter.otlp.headers  |                  |
|               | otel.exporter.otlp.timeout  | `1s`             |

The `otel.exporter.otlp.headers` property can be specified as a comma-separated
list, which is compliant with the
[specification](https://opentelemetry.io/docs/concepts/sdk-configuration/otlp-exporter-configuration/#otel_exporter_otlp_headers).
Similar to the resource attributes, the headers can be specified in
`application.properties` or `application.yaml`:

```yaml
otel:
  exporter:
    otlp:
      headers:
        - key: 'header1'
          value: 'value1'
        - key: 'header2'
          value: 'value2'
```

#### Enabling/Disabling Exporters

All exporters can be enabled or disabled as in the
[SDK auto-configuration](https://github.com/open-telemetry/opentelemetry-java/blob/main/sdk-extensions/autoconfigure/README.md#exporters).
This is the preferred way to enable/disable exporters and takes precedence over
the properties below.

| Feature               | Property                           | Default Value | ConditionalOnMissingBean                             |
| --------------------- | ---------------------------------- | ------------- | ---------------------------------------------------- |
| Otlp Exporter         | otel.exporter.otlp.enabled         | `true`        | -                                                    |
| Otlp Span Exporter    | otel.exporter.otlp.traces.enabled  | `true`        | OtlpHttpSpanExporter, OtlpGrpcSpanExporter           |
| Otlp Metrics Exporter | otel.exporter.otlp.metrics.enabled | `true`        | OtlpHttpMetricExporter, OtlpGrpcMetricExporter       |
| Otlp Logs Exporter    | otel.exporter.otlp.logs.enabled    | `true`        | OtlpHttpLogRecordExporter, OtlpGrpcLogRecordExporter |
| Logging Exporter      | otel.exporter.logging.enabled      | `false`       | LoggingSpanExporter                                  |

### Tracer Properties

| Feature | Property                        | Default Value |
| ------- | ------------------------------- | ------------- |
| Tracer  | otel.traces.sampler.probability | `1.0`         |

### Resource Properties

| Feature  | Property                                                            | Default Value |
| -------- | ------------------------------------------------------------------- | ------------- |
| Resource | otel.springboot.resource.enabled                                    | `true`        |
|          | otel.resource.attributes (old: otel.springboot.resource.attributes) | `empty map`   |

`otel.resource.attributes` supports a pattern-based resource configuration in
the application.properties like this:

```
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
[specification](https://opentelemetry.io/docs/concepts/sdk-configuration/general-sdk-configuration/#otel_resource_attributes):

```shell
export OTEL_RESOURCE_ATTRIBUTES="key1=value1,key2=value2"
```

The service name is determined by the following precedence, in accordance with
the OpenTelemetry
[specification](https://opentelemetry.io/docs/concepts/sdk-configuration/general-sdk-configuration/#otel_service_name):

1. `otel.service.name` spring property or `OTEL_SERVICE_NAME` environment
   variable (highest precedence)
2. `service.name` in `otel.resource.attributes` system/spring property or
   `OTEL_RESOURCE_ATTRIBUTES` environment variable
3. `service.name` in `otel.springboot.resource.attributes` system/spring
   property
4. `spring.application.name` spring property
5. the default value `unknown_service:java` (lowest precedence)

### Automatic instrumentation with Spring auto configurations

Auto-configures OpenTelemetry instrumentation for
[spring-web](#spring-web-auto-configuration) ,
[spring-webmvc](#spring-web-mvc-auto-configuration), and
[spring-webflux](#spring-webflux-auto-configuration). Leverages Spring Aspect
Oriented Programming, dependency injection, and bean post-processing to trace
spring applications.

| Feature        | Property                                    | Default Value | ConditionalOnClass   |
| -------------- | ------------------------------------------- | ------------- | -------------------- |
| spring-web     | otel.instrumentation.spring-webmvc.enabled  | `true`        | RestTemplate         |
| spring-webmvc  | otel.instrumentation.spring-web.enabled     | `true`        | OncePerRequestFilter |
| spring-webflux | otel.instrumentation.spring-webflux.enabled | `true`        | WebClient            |

#### Spring Web Auto Configuration

Provides auto-configuration for the OpenTelemetry RestTemplate trace interceptor
defined in
[opentelemetry-spring-web-3.1](https://github.com/open-telemetry/opentelemetry-java-instrumentation/tree/main/instrumentation/spring/spring-web/spring-web-3.1).
This auto-configuration instruments all requests sent using Spring RestTemplate
beans by applying a RestTemplate bean post processor. This feature is supported
for spring web versions 3.1+.
[Spring Web - RestTemplate Client Span](#example-trace---resttemplate-client-span)
show cases a sample client span generated by this auto-configuration. Check out
[opentelemetry-spring-web-3.1](https://github.com/open-telemetry/opentelemetry-java-instrumentation/tree/main/instrumentation/spring/spring-web/spring-web-3.1)
to learn more about the OpenTelemetry RestTemplateInterceptor.

##### Example Trace - RestTemplate Client Span

```json
{
  "traceId": "0371febbbfa76b2e285a08b53a055d17",
  "parentId": "9b782243ad7df179",
  "id": "43990118a8bdbdf5",
  "kind": "CLIENT",
  "name": "http get",
  "timestamp": 1596841405949825,
  "duration": 21288,
  "localEndpoint": {
    "serviceName": "sample_trace",
    "ipv4": "XXX.XXX.X.XXX"
  },
  "tags": {
    "http.method": "GET",
    "http.status_code": "200",
    "http.url": "/spring-web/sample/rest-template",
    "net.peer.name": "localhost",
    "net.peer.port": "8081"
  }
}
```

#### Spring Web MVC Auto Configuration

This feature autoconfigures instrumentation for Spring WebMVC controllers by
adding a
[telemetry producing servlet `Filter`](https://github.com/open-telemetry/opentelemetry-java-instrumentation/blob/main/instrumentation/spring/spring-webmvc/spring-webmvc-5.3/library/src/main/java/io/opentelemetry/instrumentation/spring/webmvc/v5_3/WebMvcTelemetryProducingFilter.java)
bean to the application context. This filter decorates the request execution
with an OpenTelemetry server span, propagating the incoming tracing context if
received in the HTTP request. Check out
[`opentelemetry-spring-webmvc-5.3` instrumentation library](https://github.com/open-telemetry/opentelemetry-java-instrumentation/tree/main/instrumentation/spring/spring-webmvc/spring-webmvc-5.3/library)
to learn more about the OpenTelemetry Spring WebMVC instrumentation.

##### Example Trace - Server Span

```json
   {
      "traceId":"0371febbbfa76b2e285a08b53a055d17",
      "id":"9b782243ad7df179",
      "kind":"SERVER",
      "name":"webmvctracingfilter.dofilterinteral",
      "timestamp":1596841405866633,
      "duration":355648,
      "localEndpoint":{
         "serviceName":"sample_trace",
         "ipv4":"XXX.XXX.X.XXX"
      },
      "tags":{
         "http.client_ip":"0:0:0:0:0:0:0:1",
         "http.flavor":"1.1",
         "http.method":"GET",
         "http.status_code":"200",
         "http.url":"/spring-webmvc/sample",
         "http.user_agent":"PostmanRuntime/7.26.2",
         "net.sock.peer.addr":"0:0:0:0:0:0:0:1",
         "net.sock.peer.port":"33916",
         "net.sock.family":"inet6"
         "sampling.probability":"1.0"
      }
   }
```

#### Spring WebFlux Auto Configuration

Provides auto-configurations for the OpenTelemetry WebClient ExchangeFilter
defined in
[opentelemetry-spring-webflux-5.3](https://github.com/open-telemetry/opentelemetry-java-instrumentation/tree/main/instrumentation/spring/spring-webflux/spring-webflux-5.3).
This auto-configuration instruments all outgoing http requests sent using
Spring's WebClient and WebClient Builder beans by applying a bean post
processor. This feature is supported for spring webflux versions 5.0+.
[Spring Web-Flux - WebClient Span](#spring-web-flux---webclient-span) showcases
a sample span generated by the WebClientFilter. Check out
[opentelemetry-spring-webflux-5.3](https://github.com/open-telemetry/opentelemetry-java-instrumentation/tree/main/instrumentation/spring/spring-webflux/spring-webflux-5.3)
to learn more about the OpenTelemetry WebClientFilter.

##### Example Trace - WebClient Span

```json
{
  "traceId": "0371febbbfa76b2e285a08b53a055d17",
  "parentId": "9b782243ad7df179",
  "id": "1b14a2fc89d7a762",
  "kind": "CLIENT",
  "name": "http post",
  "timestamp": 1596841406109125,
  "duration": 25137,
  "localEndpoint": {
    "serviceName": "sample_trace",
    "ipv4": "XXX.XXX.X.XXX"
  },
  "tags": {
    "http.method": "POST",
    "http.status_code": "200",
    "http.url": "/spring-webflux/sample/web-client",
    "net.peer.name": "localhost",
    "net.peer.port": "8082"
  }
}
```

## Other Configurations

Instead of using the OpenTelemetry Spring starter, you can use the OpenTelemetry
autoconfiguration features with an annotation or Zipkin exporters.

### Spring Autoconfiguration

Auto-configuration is natively supported by Springboot applications. To enable
these features in "vanilla" use `@EnableOpenTelemetry` to complete a component
scan of this package.

```java
import io.opentelemetry.instrumentation.spring.autoconfigure.EnableOpenTelemetry;
import org.springframework.context.annotation.Configuration;

@Configuration
@EnableOpenTelemetry
public class OpenTelemetryConfig {}
```

### OpenTelemetry Zipkin Exporter Starter

OpenTelemetry Zipkin Exporter Starter is a starter package that includes the
opentelemetry-api, opentelemetry-sdk, opentelemetry-extension-annotations,
opentelmetry-logging-exporter, opentelemetry-spring-boot-autoconfigurations and
spring framework starters required to setup distributed tracing. It also
provides the
[opentelemetry-exporters-zipkin](https://github.com/open-telemetry/opentelemetry-java/tree/main/exporters/zipkin)
artifact and corresponding exporter auto-configuration. Check out
[opentelemetry-spring-boot-autoconfigure](https://github.com/open-telemetry/opentelemetry-java-instrumentation/blob/main/instrumentation/spring/spring-boot-autoconfigure/README.md#features)
for the list of supported libraries and features.

If an exporter is present in the classpath during runtime and a spring bean of
the exporter is missing from the spring application context. An exporter bean is
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

| Property                     | Default Value | ConditionalOnClass |
| ---------------------------- | ------------- | ------------------ |
| otel.exporter.zipkin.enabled | `true`        | ZipkinSpanExporter |

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

### Logging Instrumentation

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

### Instrumentation Annotations

This feature uses spring-aop to wrap methods annotated with `@WithSpan` in a
span. The arguments to the method can be captured as attributed on the created
span by annotating the method parameters with `@SpanAttribute`.

Note - This annotation can only be applied to bean methods managed by the spring
application context. Check out
[spring-aop](https://docs.spring.io/spring/docs/current/spring-framework-reference/core.html#aop)
to learn more about aspect weaving in spring.

| Feature   | Property                                 | Default Value | ConditionalOnClass |
| --------- | ---------------------------------------- | ------------- | ------------------ |
| @WithSpan | otel.instrumentation.annotations.enabled | `true`        | WithSpan, Aspect   |

#### Dependency

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

#### Usage

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

#### Example Trace

```json
[
   {
      "traceId":"0371febbbfa76b2e285a08b53a055d17",
      "parentId":"9b782243ad7df179",
      "id":"c3ef24b9bff5901c",
      "name":"tracedclass.withspanmethod",
      "timestamp":1596841406165439,
      "duration":6912,
      "localEndpoint":{
         "serviceName":"sample_trace",
         "ipv4":"XXX.XXX.X.XXX"
      },
      "tags":{
         "test.type":"@WithSpan annotation",
         "test.case":'@WithSpan',
         "test.hasEvent":'true',
      }
   },
   {
      "traceId":"0371febbbfa76b2e285a08b53a055d17",
      "parentId":"9b782243ad7df179",
      "id":"1a6cb395a8a33cc0",
      "name":"@withspan set span name",
      "timestamp":1596841406182759,
      "duration":2187,
      "localEndpoint":{
         "serviceName":"sample_trace",
         "ipv4":"XXX.XXX.X.XXX"
      },
      "annotations":[
         {
            "timestamp":1596841406182920,
            "value":"ADD EVENT TO tracedMethodWithName SPAN"
         }
      ],
      "tags":{
         "test.type":"@WithSpan annotation",
         "test.case":'@WithSpan(value="@withspan set span name")',
         "test.hasEvent":'true',
      }
   },
   {
      "traceId":"0371febbbfa76b2e285a08b53a055d17",
      "parentId":"9b782243ad7df179",
      "id":"74dd19a8a9883f80",
      "kind":"CLIENT",
      "name":"tracedClientSpan",
      "timestamp":1596841406194210,
      "duration":130,
      "localEndpoint":{
         "serviceName":"sample_trace",
         "ipv4":"XXX.XXX.X.XXX"
      }
      "tags":{
         "test.type":"@WithSpan annotation",
         "test.case":"@WithSpan(kind=SpanKind.Client)",
      }
   },
]
```

### Other Instrumentation

You can configure other instrumentations with
[OpenTelemetry instrumentations libraries](https://github.com/open-telemetry/opentelemetry-java-instrumentation/blob/main/docs/supported-libraries.md#libraries--frameworks).
