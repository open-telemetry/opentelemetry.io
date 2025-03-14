---
title: The OpenTelemetry Spring Boot starter is now stable
linkTitle: Spring Starter stable
date: 2024-09-30
author: >
  [Gregor Zeitlinger](https://github.com/zeitlinger) (Grafana Labs), [Jean
  Bisutti](https://github.com/jeanbisutti) (Microsoft)
issue: https://github.com/open-telemetry/opentelemetry-java-instrumentation/issues/11581
sig: Java
# prettier-ignore
cSpell:ignore: Bisutti Customizer customizers Gregor logback petclinic Zeitlinger
---

We're proud to announce that the OpenTelemetry Spring Boot starter is now
stable.

The [Spring Boot](https://spring.io/projects/spring-boot) starter is a powerful
tool that simplifies the process of instrumenting Spring Boot applications with
OpenTelemetry. It provides a lightweight, flexible alternative to the
OpenTelemetry Java agent, making it easier than ever to observe your Spring Boot
applications.

In this blog post, we will explain when you should use the Spring Starter, what
it actually means to be stable, what are the main features, and which challenges
we faced. In the last part, we will demonstrate some of the starter's features
using a
[GraalVM native image](https://www.graalvm.org/latest/reference-manual/native-image/)
application.

If you just want to get started, check out the
[Spring Starter documentation](/docs/zero-code/java/spring-boot-starter).

## When to use the Spring Starter?

Here are some scenarios where you might want to use the Spring Starter:

- **Spring Boot Native image** applications for which the OpenTelemetry Java
  agent does not work
- **Startup overhead** of the OpenTelemetry Java agent exceeds your requirements
- Another monitoring Java agent is already used and it is causing compatibility
  issues with the OpenTelemetry Java agent
- **Spring Boot configuration files** (`application.properties`,
  `application.yml`) to configure the OpenTelemetry Spring Boot starter which
  doesn't work with the OpenTelemetry Java agent
- **Programmatic configuration** of the OpenTelemetry Spring Boot starter, such
  as
  [dynamic auth headers](/docs/zero-code/java/spring-boot-starter/sdk-configuration/#configure-the-exporter-programmatically),
  using Spring beans (the OpenTelemetry Java agent requires an
  [extension](/docs/zero-code/java/agent/extensions/) for this)
- **Uses code dependencies**: You don't need to add any JVM options (e.g. in
  your Docker file) - just add a dependency and a BOM to your `pom.xml` or
  `build.gradle` file

It may be a bit surprising, but if you don't build a Spring native image
application our default recommendation is to use the
[**OpenTelemetry Java agent**](/docs/zero-code/java/agent) with bytecode
instrumentation, as it provides more out of the box instrumentation than the
Spring Starter instrumentations - as we will see later.

## What does it mean to be stable?

The Spring Starter is now stable, which means that it is ready for production
use.

- **Stable API**: The API is stable and will not change in a way that breaks
  users.
- **Stable Configuration**: The configuration options are stable and will not
  change in a way that breaks users.
- **Mature Documentation**: The
  [documentation](/docs/zero-code/java/spring-boot-starter/) is mature and
  covers all aspects of the Spring Starter.
- **Community Support**: The Spring Starter has a [community](/community/)
  (`otel-java` Slack channel) of users who can help you with any issues you
  might encounter.
- **Regular Updates**: The Spring Starter is actively maintained and updated
  with new features and bug fixes.

Note that the Spring Starter uses some semantic conventions that are not stable,
which are still evolving and may change in the future.
[HTTP semantic conventions](/docs/specs/semconv/http/http-metrics/) are stable
and will not change.
[Database semantic conventions](/docs/specs/semconv/database/database-metrics/)
are still experimental and may change. However, they are expected to become
stable at the end of 2024.

## Main features of the Spring Starter stable release

When we started the Spring Boot starter stable project in February 2024, we
defined the main features we wanted to achieve, which we will explain in the
following sections.

### Out of the box instrumentation

The OpenTelemetry starter provides
[out of the box instrumentations for most popular usages](/docs/zero-code/java/spring-boot-starter/out-of-the-box-instrumentation/).
The OpenTelemetry Java agent includes many more
[out of the box instrumentations](/docs/zero-code/java/agent/disable/#suppressing-specific-agent-instrumentation),
but you can opt-in to additional instrumentations in the Spring Starter by
[adding a bit of configuration](/docs/zero-code/java/spring-boot-starter/additional-instrumentations/).

One example we heavily improved is the Logback instrumentation.

In the beginning it was not possible to ship all log lines to the OpenTelemetry
Collector, because the OpenTelemetry bean was not available at the time when the
first log lines were emitted. So, we had to cache the logs and send them to the
OpenTelemetry Collector after the OpenTelemetry bean was created.

In the past, you had to add the OpenTelemetry Logback appender to your
`logback-spring.xml` file. Now, the Spring Boot starter adds the appender
automatically if you have not defined one in a Logback file, after Spring Boot
has
[initialized the logging system](https://github.com/open-telemetry/opentelemetry-java-instrumentation/blob/a3f8b1082d8835a81dffd834ec28decca066a3f2/instrumentation/spring/spring-boot-autoconfigure/src/main/java/io/opentelemetry/instrumentation/spring/autoconfigure/internal/instrumentation/logging/LogbackAppenderApplicationListener.java#L64).

### Declarative SDK autoconfiguration setup

The Spring Boot starter allows you to set all
[SDK autoconfiguration](/docs/languages/java/configuration/) properties - as the
OpenTelemetry Java agent.

In the beginning, however, the Spring Boot starter only supported some
configuration properties in the Spring Boot configuration files - some
properties were compatible with the OpenTelemetry Java agent, but some were not.
Other properties were not supported at all, making it very difficult to switch
between the OpenTelemetry Java agent and the Spring Boot starter.

As a first step, we made the Spring Boot starter use the same
[SDK autoconfiguration](/docs/languages/java/configuration/) as the
OpenTelemetry Java agent, so that the same properties could be used for both.

The SDK autoconfiguration did not support Spring Boot configuration files,
however, so we had implement the
[ConfigProperties](https://github.com/open-telemetry/opentelemetry-java/blob/main/sdk-extensions/autoconfigure-spi/src/main/java/io/opentelemetry/sdk/autoconfigure/spi/ConfigProperties.java)
interface with the logic to look up Spring configuration values from a Spring
[Environment](https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/core/env/Environment.html).

Special consideration was needed for lists and maps - you have to write a
`@ConfigurationProperties` class for
[lists](https://github.com/open-telemetry/opentelemetry-java-instrumentation/blob/release/v2.6.x/instrumentation/spring/spring-boot-autoconfigure/src/main/java/io/opentelemetry/instrumentation/spring/autoconfigure/internal/properties/SpringConfigProperties.java#L104-L106)
and
[maps](https://github.com/open-telemetry/opentelemetry-java-instrumentation/blob/release/v2.6.x/instrumentation/spring/spring-boot-autoconfigure/src/main/java/io/opentelemetry/instrumentation/spring/autoconfigure/internal/properties/SpringConfigProperties.java#L126-L140),
because the Spring Boot Environment can't handle them directly. Luckily, Spring
Boot has a way to convert Strings to lists and
[maps](https://github.com/open-telemetry/opentelemetry-java-instrumentation/blob/release/v2.6.x/instrumentation/spring/spring-boot-autoconfigure/src/main/java/io/opentelemetry/instrumentation/spring/autoconfigure/internal/MapConverter.java),
so you can pass resource attributes both in a single environment variable (as
per [spec](/docs/languages/sdk-configuration/general/#otel_resource_attributes))
or in a
[Spring Boot configuration file](/docs/zero-code/java/spring-boot-starter/sdk-configuration/#general-configuration).

### Programmatic SDK autoconfiguration setup

Spring Boot users also expect to be able to use Spring beans for advanced
configuration. The SDK autoconfiguration did not know about Spring beans, so we
came up with a new interface,
[ComponentLoader](https://github.com/open-telemetry/opentelemetry-java/blob/release/v1.40.x/sdk-extensions/autoconfigure/src/main/java/io/opentelemetry/sdk/autoconfigure/internal/ComponentLoader.java),
that allows you to register Spring beans that will be loaded by the
OpenTelemetry SDK autoconfiguration.

The
[Spring Starter implementation of the ComponentLoader interface](https://github.com/open-telemetry/opentelemetry-java-instrumentation/blob/main/instrumentation/spring/spring-boot-autoconfigure/src/main/java/io/opentelemetry/instrumentation/spring/autoconfigure/OpenTelemetryAutoConfiguration.java#L162-L181)
uses Spring's `ApplicationContext` to find all beans of a certain type.

This allows you to register your own customizers, and other SDK components as
Spring beans. You can find the available SPI interfaces implementable as Spring
beans in the
[OpenTelemetry SDK autoconfiguration SPI documentation](/docs/languages/java/configuration/#spi-service-provider-interface).

You should be able to customize most aspects of the OpenTelemetry SDK by
implementing a bean that returns an
[`AutoConfigurationCustomizerProvider`](/docs/languages/java/configuration/#autoconfigurationcustomizerprovider)
instance - an idiomatic Spring Boot approach to customization.

This example shows how to create a bean that customizes the sampler to drop
spans for paths starting with `/actuator`:

<!-- prettier-ignore-start -->
```java
package otel;

import io.opentelemetry.api.trace.SpanKind;
import io.opentelemetry.contrib.sampler.RuleBasedRoutingSampler;
import io.opentelemetry.sdk.autoconfigure.spi.AutoConfigurationCustomizerProvider;
import io.opentelemetry.semconv.UrlAttributes;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class FilterPaths {

  @Bean
  public AutoConfigurationCustomizerProvider otelCustomizer() {
    return p ->
        p.addSamplerCustomizer(
            (fallback, config) ->
                RuleBasedRoutingSampler.builder(SpanKind.SERVER, fallback)
                    .drop(UrlAttributes.URL_PATH, "^/actuator")
                    .build());
  }
}
```
<!-- prettier-ignore-end -->

## The OpenTelemetry Spring Boot starter in action

We will demonstrate some features of the OpenTelemetry Spring Boot starter for
OpenTelemetry with the popular Spring PetClinic application.

First, we clone the Spring PetClinic application from GitHub:

```bash
git clone https://github.com/spring-projects/spring-petclinic.git
```

In the `pom.xml` file, let's add the OpenTelemetry instrumentation BOM:

```xml
<dependencyManagement>
    <dependencies>
        <dependency>
            <groupId>io.opentelemetry.instrumentation</groupId>
            <artifactId>opentelemetry-instrumentation-bom</artifactId>
            <version>2.8.0</version>
            <type>pom</type>
            <scope>import</scope>
        </dependency>
    </dependencies>
</dependencyManagement>
```

Now, we can include the OpenTelemetry Spring Boot starter dependency to the
Spring PetClinic application:

```xml
<dependency>
  <groupId>io.opentelemetry.instrumentation</groupId>
  <artifactId>opentelemetry-spring-boot-starter</artifactId>
</dependency>
```

Navigate to the project directory and build a Spring Boot native image
application:

```bash
cd spring-petclinic
mvn -Pnative spring-boot:build-image -Dspring-boot.build-image.imageName=spring-petclinic-native
```

You may have to disable the `PostgresIntegrationTests` test class to get this
command line working
([see](https://github.com/spring-projects/spring-petclinic/issues/1522)):

```java
@Disabled
public class PostgresIntegrationTests
```

The OpenTelemetry Spring Boot starter sends the telemetry data with the
[OpenTelemetry Protocol](/docs/specs/otlp/) (OTLP). By default, it sends the
data over HTTP. You can also
[switch to gRPC](/docs/languages/java/configuration/#properties-exporters).

We are going to add an [OpenTelemetry Collector](/docs/collector/) and display
the telemetry data in the Collector logs.

You can also use your favorite OTLP-compatible backend - we use Collector logs
for simplicity here.

To do this, let's begin with adding the following `docker-compose-otel.yml` file
in the `spring-petclinic` directory:

```yaml
version: '3.8'
services:
  app:
    image: spring-petclinic-native
    environment:
      OTEL_SERVICE_NAME: 'graal-native-example-app'
      OTEL_EXPORTER_OTLP_ENDPOINT: 'http://collector:4318'
    ports:
      - '8080:8080'
    depends_on:
      - collector
  collector:
    image: otel/opentelemetry-collector-contrib:0.109.0
    volumes:
      - ./collector-spring-native-config.yaml:/collector-spring-native-config.yaml
    command: ['--config=/collector-spring-native-config.yaml']
    expose:
      - '4317'
    ports:
      - '4317:4317'
```

Next, also add a file called `collector-spring-native-config.yaml`:

```yaml
receivers:
  otlp:
    protocols:
      http:
        endpoint: '0.0.0.0:4318'
exporters:
  debug:
    verbosity: detailed
service:
  pipelines:
    metrics:
      receivers: [otlp]
      exporters: [debug]
    traces:
      receivers: [otlp]
      exporters: [debug]
    logs:
      receivers: [otlp]
      exporters: [debug]
```

Now, we can run the Spring PetClinic application and the OpenTelemetry
Collector:

```bash
docker-compose -f docker-compose-otel.yml up
```

Let's check the Collector logs to see the telemetry data.

We can spot one log record about the Spring PetClinic application startup:

```ignorelang
2024-09-16 14:19:11 collector-1  | LogRecord #2
2024-09-16 14:19:11 collector-1  | ObservedTimestamp: 2024-09-16 12:19:10.38137 +0000 UTC
2024-09-16 14:19:11 collector-1  | Timestamp: 2024-09-16 12:19:10.379 +0000 UTC
2024-09-16 14:19:11 collector-1  | SeverityText: INFO
2024-09-16 14:19:11 collector-1  | SeverityNumber: Info(9)
2024-09-16 14:19:11 collector-1  | Body: Str(Started PetClinicApplication in 0.489 seconds (process running for 0.493))
```

The OpenTelemetry Spring Boot starter has instrumented Logback and has sent the
'Started PetClinicApplication in 0.489 seconds (process running for 0.493)'
telemetry log record to the OpenTelemetry Collector.

Let's open the <http://localhost:8080/vets.html> in our web browser or execute
the following curl command:

```shell
curl http://localhost:8080/vets.html
```

If we look at the Collector logs, we can see that one span has been created for
the HTTP request with the Trace ID `16a0a5be5127309858c7c63a76b3f471` (it will
be a different Trace ID in your case):

```ignorelang
collector-1  | InstrumentationScope io.opentelemetry.spring-webmvc-6.0 2.8.0-alpha
collector-1  | Span #0
collector-1  |     Trace ID       : 16a0a5be5127309858c7c63a76b3f471
collector-1  |     Parent ID      :
collector-1  |     ID             : 280f551fe70df80b
collector-1  |     Name           : GET /vets.html
collector-1  |     Kind           : Server
collector-1  |     Start time     : 2024-09-16 12:39:41.590128 +0000 UTC
collector-1  |     End time       : 2024-09-16 12:39:41.62597148 +0000 UTC
collector-1  |     Status code    : Unset
collector-1  |     Status message :
collector-1  | Attributes:
collector-1  |      -> url.path: Str(/vets.html)
collector-1  |      -> http.response.status_code: Int(200)
collector-1  |      -> network.peer.address: Str(172.19.0.1)
collector-1  |      -> server.address: Str(localhost)
collector-1  |      -> client.address: Str(172.19.0.1)
collector-1  |      -> user_agent.original: Str(curl/8.0.1)
collector-1  |      -> server.port: Int(8080)
collector-1  |      -> network.peer.port: Int(58886)
collector-1  |      -> http.route: Str(/vets.html)
collector-1  |      -> network.protocol.version: Str(1.1)
collector-1  |      -> http.request.method: Str(GET)
collector-1  |      -> url.scheme: Str(http)
```

For the same Trace ID, we can notice telemetry data emitted by the database
instrumentation:

```ignorelang
collector-1  | ScopeSpans #1
collector-1  | ScopeSpans SchemaURL:
collector-1  | InstrumentationScope io.opentelemetry.jdbc 2.8.0-alpha
collector-1  | Span #0
collector-1  |     Trace ID       : 16a0a5be5127309858c7c63a76b3f471
collector-1  |     Parent ID      : 280f551fe70df80b
collector-1  |     ID             : fce3cd6376917d72
collector-1  |     Name           : HikariDataSource.getConnection
collector-1  |     Kind           : Internal
collector-1  |     Start time     : 2024-09-16 12:39:41.592567294 +0000 UTC
collector-1  |     End time       : 2024-09-16 12:39:41.592584795 +0000 UTC
collector-1  |     Status code    : Unset
collector-1  |     Status message :
collector-1  | Attributes:
collector-1  |      -> code.namespace: Str(com.zaxxer.hikari.HikariDataSource)
collector-1  |      -> db.connection_string: Str(h2:mem:)
collector-1  |      -> db.system: Str(h2)
collector-1  |      -> code.function: Str(getConnection)
collector-1  |      -> db.name: Str(cb22066d-b4b2-4891-ae1e-242db88156e7)
collector-1  | Span #1
collector-1  |     Trace ID       : 16a0a5be5127309858c7c63a76b3f471
collector-1  |     Parent ID      : 280f551fe70df80b
collector-1  |     ID             : bb91ebc65166b20f
collector-1  |     Name           : SELECT cb22066d-b4b2-4891-ae1e-242db88156e7.vets
collector-1  |     Kind           : Client
collector-1  |     Start time     : 2024-09-16 12:39:41.593514131 +0000 UTC
collector-1  |     End time       : 2024-09-16 12:39:41.593552132 +0000 UTC
collector-1  |     Status code    : Unset
collector-1  |     Status message :
collector-1  | Attributes:
collector-1  |      -> db.connection_string: Str(h2:mem:)
collector-1  |      -> db.system: Str(h2)
collector-1  |      -> db.statement: Str(select v1_0.id,v1_0.first_name,v1_0.last_name from vets v1_0 offset ? rows fetch first ? rows only)
collector-1  |      -> db.operation: Str(SELECT)
collector-1  |      -> db.sql.table: Str(vets)
collector-1  |      -> db.name: Str(cb22066d-b4b2-4891-ae1e-242db88156e7)
collector-1  | Span #2
collector-1  |     Trace ID       : 16a0a5be5127309858c7c63a76b3f471
collector-1  |     Parent ID      : 280f551fe70df80b
collector-1  |     ID             : f500cd435ab4be5c
collector-1  |     Name           : SELECT cb22066d-b4b2-4891-ae1e-242db88156e7
collector-1  |     Kind           : Client
collector-1  |     Start time     : 2024-09-16 12:39:41.594189757 +0000 UTC
collector-1  |     End time       : 2024-09-16 12:39:41.594210057 +0000 UTC
collector-1  |     Status code    : Unset
collector-1  |     Status message :
collector-1  | Attributes:
collector-1  |      -> db.connection_string: Str(h2:mem:)
collector-1  |      -> db.system: Str(h2)
collector-1  |      -> db.statement: Str(select s1_0.vet_id,s1_1.id,s1_1.name from vet_specialties s1_0 join specialties s1_1 on s1_1.id=s1_0.specialty_id where s1_0.vet_id=?)
collector-1  |      -> db.operation: Str(SELECT)
collector-1  |      -> db.name: Str(cb22066d-b4b2-4891-ae1e-242db88156e7)
collector-1  | Span #3
collector-1  |     Trace ID       : 16a0a5be5127309858c7c63a76b3f471
collector-1  |     Parent ID      : 280f551fe70df80b
collector-1  |     ID             : 22325f527effe3a6
collector-1  |     Name           : SELECT cb22066d-b4b2-4891-ae1e-242db88156e7
collector-1  |     Kind           : Client
collector-1  |     Start time     : 2024-09-16 12:39:41.594255259 +0000 UTC
collector-1  |     End time       : 2024-09-16 12:39:41.594265959 +0000 UTC
collector-1  |     Status code    : Unset
collector-1  |     Status message :
collector-1  | Attributes:
collector-1  |      -> db.connection_string: Str(h2:mem:)
collector-1  |      -> db.system: Str(h2)
collector-1  |      -> db.statement: Str(select s1_0.vet_id,s1_1.id,s1_1.name from vet_specialties s1_0 join specialties s1_1 on s1_1.id=s1_0.specialty_id where s1_0.vet_id=?)
collector-1  |      -> db.operation: Str(SELECT)
collector-1  |      -> db.name: Str(cb22066d-b4b2-4891-ae1e-242db88156e7)
collector-1  | Span #4
collector-1  |     Trace ID       : 16a0a5be5127309858c7c63a76b3f471
collector-1  |     Parent ID      : 280f551fe70df80b
collector-1  |     ID             : 55ce3fc09a9a6b0d
collector-1  |     Name           : SELECT cb22066d-b4b2-4891-ae1e-242db88156e7
collector-1  |     Kind           : Client
collector-1  |     Start time     : 2024-09-16 12:39:41.59428666 +0000 UTC
collector-1  |     End time       : 2024-09-16 12:39:41.594294761 +0000 UTC
collector-1  |     Status code    : Unset
collector-1  |     Status message :
collector-1  | Attributes:
collector-1  |      -> db.connection_string: Str(h2:mem:)
collector-1  |      -> db.system: Str(h2)
collector-1  |      -> db.statement: Str(select s1_0.vet_id,s1_1.id,s1_1.name from vet_specialties s1_0 join specialties s1_1 on s1_1.id=s1_0.specialty_id where s1_0.vet_id=?)
collector-1  |      -> db.operation: Str(SELECT)
collector-1  |      -> db.name: Str(cb22066d-b4b2-4891-ae1e-242db88156e7)
collector-1  | Span #5
collector-1  |     Trace ID       : 16a0a5be5127309858c7c63a76b3f471
collector-1  |     Parent ID      : 280f551fe70df80b
collector-1  |     ID             : 46b12a2018717141
collector-1  |     Name           : SELECT cb22066d-b4b2-4891-ae1e-242db88156e7
collector-1  |     Kind           : Client
collector-1  |     Start time     : 2024-09-16 12:39:41.594316061 +0000 UTC
collector-1  |     End time       : 2024-09-16 12:39:41.594322562 +0000 UTC
collector-1  |     Status code    : Unset
collector-1  |     Status message :
collector-1  | Attributes:
collector-1  |      -> db.connection_string: Str(h2:mem:)
collector-1  |      -> db.system: Str(h2)
collector-1  |      -> db.statement: Str(select s1_0.vet_id,s1_1.id,s1_1.name from vet_specialties s1_0 join specialties s1_1 on s1_1.id=s1_0.specialty_id where s1_0.vet_id=?)
collector-1  |      -> db.operation: Str(SELECT)
collector-1  |      -> db.name: Str(cb22066d-b4b2-4891-ae1e-242db88156e7)
collector-1  | Span #6
collector-1  |     Trace ID       : 16a0a5be5127309858c7c63a76b3f471
collector-1  |     Parent ID      : 280f551fe70df80b
collector-1  |     ID             : 8e0f9f438e25cfe7
collector-1  |     Name           : SELECT cb22066d-b4b2-4891-ae1e-242db88156e7
collector-1  |     Kind           : Client
collector-1  |     Start time     : 2024-09-16 12:39:41.594338262 +0000 UTC
collector-1  |     End time       : 2024-09-16 12:39:41.594343162 +0000 UTC
collector-1  |     Status code    : Unset
collector-1  |     Status message :
collector-1  | Attributes:
collector-1  |      -> db.connection_string: Str(h2:mem:)
collector-1  |      -> db.system: Str(h2)
collector-1  |      -> db.statement: Str(select s1_0.vet_id,s1_1.id,s1_1.name from vet_specialties s1_0 join specialties s1_1 on s1_1.id=s1_0.specialty_id where s1_0.vet_id=?)
collector-1  |      -> db.operation: Str(SELECT)
collector-1  |      -> db.name: Str(cb22066d-b4b2-4891-ae1e-242db88156e7)
collector-1  | Span #7
collector-1  |     Trace ID       : 16a0a5be5127309858c7c63a76b3f471
collector-1  |     Parent ID      : 280f551fe70df80b
collector-1  |     ID             : 1a985d47f225eb05
collector-1  |     Name           : SELECT cb22066d-b4b2-4891-ae1e-242db88156e7.vets
collector-1  |     Kind           : Client
collector-1  |     Start time     : 2024-09-16 12:39:41.594446766 +0000 UTC
collector-1  |     End time       : 2024-09-16 12:39:41.594455267 +0000 UTC
collector-1  |     Status code    : Unset
collector-1  |     Status message :
collector-1  | Attributes:
collector-1  |      -> db.connection_string: Str(h2:mem:)
collector-1  |      -> db.system: Str(h2)
collector-1  |      -> db.statement: Str(select count(v1_0.id) from vets v1_0)
collector-1  |      -> db.operation: Str(SELECT)
collector-1  |      -> db.sql.table: Str(vets)
collector-1  |      -> db.name: Str(cb22066d-b4b2-4891-ae1e-242db88156e7)
collector-1  |  {"kind": "exporter", "data_type": "traces", "name": "logging"}
```

Now, let's see what happens if we select the <http://localhost:8080/oups> URL in
our web browser or execute the following curl command:

```shell
curl http://localhost:8080/oups
```

We can see a span related to the HTTP call, but also an `exception` span event
attached to this span:

```ignorelang
collector-1  | InstrumentationScope io.opentelemetry.spring-webmvc-6.0 2.8.0-alpha
collector-1  | Span #0
collector-1  |     Trace ID       : 9e2b052cb84907fc3f648a4131638138
collector-1  |     Parent ID      :
collector-1  |     ID             : 1bf80d8299e87e7f
collector-1  |     Name           : GET /oups
collector-1  |     Kind           : Server
collector-1  |     Start time     : 2024-09-16 12:53:55.078094 +0000 UTC
collector-1  |     End time       : 2024-09-16 12:53:55.07876653 +0000 UTC
collector-1  |     Status code    : Error
collector-1  |     Status message :
collector-1  | Attributes:
collector-1  |      -> url.path: Str(/oups)
collector-1  |      -> error.type: Str(500)
collector-1  |      -> network.peer.address: Str(172.19.0.1)
collector-1  |      -> server.address: Str(localhost)
collector-1  |      -> client.address: Str(172.19.0.1)
collector-1  |      -> network.peer.port: Int(53732)
collector-1  |      -> http.route: Str(/oups)
collector-1  |      -> http.request.method: Str(GET)
collector-1  |      -> http.response.status_code: Int(500)
collector-1  |      -> user_agent.original: Str(Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36 Edg/128.0.0.0)
collector-1  |      -> server.port: Int(8080)
collector-1  |      -> network.protocol.version: Str(1.1)
collector-1  |      -> url.scheme: Str(http)
collector-1  | Events:
collector-1  | SpanEvent #0
collector-1  |      -> Name: exception
collector-1  |      -> Timestamp: 2024-09-16 12:53:55.078702027 +0000 UTC
collector-1  |      -> DroppedAttributesCount: 0
collector-1  |      -> Attributes::
collector-1  |           -> exception.message: Str(Request processing failed: java.lang.RuntimeException: Expected: controller used to showcase what happens when an exception is thrown)
collector-1  |           -> exception.stacktrace: Str(jakarta.servlet.ServletException: Request processing failed: java.lang.RuntimeException: Expected: controller used to showcase what happens when an exception is thrown
collector-1  |  at org.springframework.web.servlet.FrameworkServlet.processRequest(FrameworkServlet.java:1019)
collector-1  |  at org.springframework.web.servlet.FrameworkServlet.doGet(FrameworkServlet.java:903)
collector-1  |  at jakarta.servlet.http.HttpServlet.service(HttpServlet.java:564)
collector-1  |  at org.springframework.web.servlet.FrameworkServlet.service(FrameworkServlet.java:885)
collector-1  |  at jakarta.servlet.http.HttpServlet.service(HttpServlet.java:658)
collector-1  |  at org.apache.catalina.core.ApplicationFilterChain.internalDoFilter(ApplicationFilterChain.java:205)
collector-1  |  at org.apache.catalina.core.ApplicationFilterChain.doFilter(ApplicationFilterChain.java:149)
collector-1  |  at org.apache.tomcat.websocket.server.WsFilter.doFilter(WsFilter.java:51)
collector-1  |  at org.apache.catalina.core.ApplicationFilterChain.internalDoFilter(ApplicationFilterChain.java:174)
collector-1  |  at org.apache.catalina.core.ApplicationFilterChain.doFilter(ApplicationFilterChain.java:149)
collector-1  |  at org.springframework.web.filter.RequestContextFilter.doFilterInternal(RequestContextFilter.java:100)
collector-1  |  at org.springframework.web.filter.OncePerRequestFilter.doFilter(OncePerRequestFilter.java:116)
collector-1  |  at org.apache.catalina.core.ApplicationFilterChain.internalDoFilter(ApplicationFilterChain.java:174)
collector-1  |  at org.apache.catalina.core.ApplicationFilterChain.doFilter(ApplicationFilterChain.java:149)
collector-1  |  at org.springframework.web.filter.FormContentFilter.doFilterInternal(FormContentFilter.java:93)
collector-1  |  at org.springframework.web.filter.OncePerRequestFilter.doFilter(OncePerRequestFilter.java:116)
collector-1  |  at org.apache.catalina.core.ApplicationFilterChain.internalDoFilter(ApplicationFilterChain.java:174)
collector-1  |  at org.apache.catalina.core.ApplicationFilterChain.doFilter(ApplicationFilterChain.java:149)
collector-1  |  at io.opentelemetry.instrumentation.spring.webmvc.v6_0.WebMvcTelemetryProducingFilter.doFilterInternal(WebMvcTelemetryProducingFilter.java:67)
collector-1  |  at org.springframework.web.filter.OncePerRequestFilter.doFilter(OncePerRequestFilter.java:116)
collector-1  |  at org.apache.catalina.core.ApplicationFilterChain.internalDoFilter(ApplicationFilterChain.java:174)
collector-1  |  at org.apache.catalina.core.ApplicationFilterChain.doFilter(ApplicationFilterChain.java:149)
collector-1  |  at org.springframework.web.filter.ServerHttpObservationFilter.doFilterInternal(ServerHttpObservationFilter.java:109)
collector-1  |  at org.springframework.web.filter.OncePerRequestFilter.doFilter(OncePerRequestFilter.java:116)
collector-1  |  at org.apache.catalina.core.ApplicationFilterChain.internalDoFilter(ApplicationFilterChain.java:174)
collector-1  |  at org.apache.catalina.core.ApplicationFilterChain.doFilter(ApplicationFilterChain.java:149)
collector-1  |  at org.springframework.web.filter.CharacterEncodingFilter.doFilterInternal(CharacterEncodingFilter.java:201)
collector-1  |  at org.springframework.web.filter.OncePerRequestFilter.doFilter(OncePerRequestFilter.java:116)
collector-1  |  at org.apache.catalina.core.ApplicationFilterChain.internalDoFilter(ApplicationFilterChain.java:174)
collector-1  |  at org.apache.catalina.core.ApplicationFilterChain.doFilter(ApplicationFilterChain.java:149)
collector-1  |  at org.apache.catalina.core.StandardWrapperValve.invoke(StandardWrapperValve.java:166)
collector-1  |  at org.apache.catalina.core.StandardContextValve.invoke(StandardContextValve.java:90)
collector-1  |  at org.apache.catalina.authenticator.AuthenticatorBase.invoke(AuthenticatorBase.java:482)
collector-1  |  at org.apache.catalina.core.StandardHostValve.invoke(StandardHostValve.java:115)
collector-1  |  at org.apache.catalina.valves.ErrorReportValve.invoke(ErrorReportValve.java:93)
collector-1  |  at org.apache.catalina.core.StandardEngineValve.invoke(StandardEngineValve.java:74)
collector-1  |  at org.apache.catalina.connector.CoyoteAdapter.service(CoyoteAdapter.java:341)
collector-1  |  at org.apache.coyote.http11.Http11Processor.service(Http11Processor.java:391)
collector-1  |  at org.apache.coyote.AbstractProcessorLight.process(AbstractProcessorLight.java:63)
collector-1  |  at org.apache.coyote.AbstractProtocol$ConnectionHandler.process(AbstractProtocol.java:894)
collector-1  |  at org.apache.tomcat.util.net.NioEndpoint$SocketProcessor.doRun(NioEndpoint.java:1741)
collector-1  |  at org.apache.tomcat.util.net.SocketProcessorBase.run(SocketProcessorBase.java:52)
collector-1  |  at org.apache.tomcat.util.threads.ThreadPoolExecutor.runWorker(ThreadPoolExecutor.java:1191)
collector-1  |  at org.apache.tomcat.util.threads.ThreadPoolExecutor$Worker.run(ThreadPoolExecutor.java:659)
collector-1  |  at org.apache.tomcat.util.threads.TaskThread$WrappingRunnable.run(TaskThread.java:61)
collector-1  |  at java.base@17.0.7/java.lang.Thread.run(Thread.java:833)
collector-1  |  at com.oracle.svm.core.thread.PlatformThreads.threadStartRoutine(PlatformThreads.java:838)
collector-1  |  at com.oracle.svm.core.posix.thread.PosixPlatformThreads.pthreadStartRoutine(PosixPlatformThreads.java:211)
collector-1  | Caused by: java.lang.RuntimeException: Expected: controller used to showcase what happens when an exception is thrown
collector-1  |  at org.springframework.samples.petclinic.system.CrashController.triggerException(CrashController.java:33)
collector-1  |  at java.base@17.0.7/java.lang.reflect.Method.invoke(Method.java:568)
collector-1  |  at org.springframework.web.method.support.InvocableHandlerMethod.doInvoke(InvocableHandlerMethod.java:207)
collector-1  |  at org.springframework.web.method.support.InvocableHandlerMethod.invokeForRequest(InvocableHandlerMethod.java:152)
collector-1  |  at org.springframework.web.servlet.mvc.method.annotation.ServletInvocableHandlerMethod.invokeAndHandle(ServletInvocableHandlerMethod.java:118)
collector-1  |  at org.springframework.web.servlet.mvc.method.annotation.RequestMappingHandlerAdapter.invokeHandlerMethod(RequestMappingHandlerAdapter.java:884)
collector-1  |  at org.springframework.web.servlet.mvc.method.annotation.RequestMappingHandlerAdapter.handleInternal(RequestMappingHandlerAdapter.java:797)
collector-1  |  at org.springframework.web.servlet.mvc.method.AbstractHandlerMethodAdapter.handle(AbstractHandlerMethodAdapter.java:87)
collector-1  |  at org.springframework.web.servlet.DispatcherServlet.doDispatch(DispatcherServlet.java:1081)
collector-1  |  at org.springframework.web.servlet.DispatcherServlet.doService(DispatcherServlet.java:974)
collector-1  |  at org.springframework.web.servlet.FrameworkServlet.processRequest(FrameworkServlet.java:1011)
collector-1  |  ... 47 more
collector-1  | )
collector-1  |           -> exception.type: Str(jakarta.servlet.ServletException)
collector-1  |  {"kind": "exporter", "data_type": "traces", "name": "logging"}
```

This span event has `exception.message` and `exception.stacktrace` attributes
that contain the exception message and the stack trace.

The OpenTelemetry starter also creates metrics every minute. We can see below a
metric on the HTTP request duration:

```ignorelang
collector-1  | Metric #0
collector-1  | Descriptor:
collector-1  |      -> Name: http.server.request.duration
collector-1  |      -> Description: Duration of HTTP server requests.
collector-1  |      -> Unit: s
collector-1  |      -> DataType: Histogram
collector-1  |      -> AggregationTemporality: Cumulative
collector-1  | HistogramDataPoints #0
collector-1  | Data point attributes:
collector-1  |      -> http.request.method: Str(GET)
collector-1  |      -> http.response.status_code: Int(200)
collector-1  |      -> http.route: Str(/vets.html)
collector-1  |      -> network.protocol.version: Str(1.1)
collector-1  |      -> url.scheme: Str(http)
collector-1  | StartTimestamp: 2024-09-16 12:39:20.97871 +0000 UTC
collector-1  | Timestamp: 2024-09-16 13:10:20.892779 +0000 UTC
collector-1  | Count: 1
collector-1  | Sum: 0.035795
collector-1  | Min: 0.035795
collector-1  | Max: 0.035795
collector-1  | ExplicitBounds #0: 0.005000
collector-1  | ExplicitBounds #1: 0.010000
collector-1  | ExplicitBounds #2: 0.025000
collector-1  | ExplicitBounds #3: 0.050000
collector-1  | ExplicitBounds #4: 0.075000
collector-1  | ExplicitBounds #5: 0.100000
collector-1  | ExplicitBounds #6: 0.250000
collector-1  | ExplicitBounds #7: 0.500000
collector-1  | ExplicitBounds #8: 0.750000
collector-1  | ExplicitBounds #9: 1.000000
collector-1  | ExplicitBounds #10: 2.500000
collector-1  | ExplicitBounds #11: 5.000000
collector-1  | ExplicitBounds #12: 7.500000
collector-1  | ExplicitBounds #13: 10.000000
collector-1  | Buckets #0, Count: 0
collector-1  | Buckets #1, Count: 0
collector-1  | Buckets #2, Count: 0
collector-1  | Buckets #3, Count: 1
collector-1  | Buckets #4, Count: 0
collector-1  | Buckets #5, Count: 0
collector-1  | Buckets #6, Count: 0
collector-1  | Buckets #7, Count: 0
collector-1  | Buckets #8, Count: 0
collector-1  | Buckets #9, Count: 0
collector-1  | Buckets #10, Count: 0
collector-1  | Buckets #11, Count: 0
collector-1  | Buckets #12, Count: 0
collector-1  | Buckets #13, Count: 0
collector-1  | Buckets #14, Count: 0
collector-1  | HistogramDataPoints #1
collector-1  | Data point attributes:
collector-1  |      -> error.type: Str(500)
collector-1  |      -> http.request.method: Str(GET)
collector-1  |      -> http.response.status_code: Int(500)
collector-1  |      -> http.route: Str(/oups)
collector-1  |      -> network.protocol.version: Str(1.1)
collector-1  |      -> url.scheme: Str(http)
collector-1  | StartTimestamp: 2024-09-16 12:39:20.97871 +0000 UTC
collector-1  | Timestamp: 2024-09-16 13:10:20.892779 +0000 UTC
collector-1  | Count: 1
collector-1  | Sum: 0.000644
collector-1  | Min: 0.000644
collector-1  | Max: 0.000644
collector-1  | ExplicitBounds #0: 0.005000
collector-1  | ExplicitBounds #1: 0.010000
collector-1  | ExplicitBounds #2: 0.025000
collector-1  | ExplicitBounds #3: 0.050000
collector-1  | ExplicitBounds #4: 0.075000
collector-1  | ExplicitBounds #5: 0.100000
collector-1  | ExplicitBounds #6: 0.250000
collector-1  | ExplicitBounds #7: 0.500000
collector-1  | ExplicitBounds #8: 0.750000
collector-1  | ExplicitBounds #9: 1.000000
collector-1  | ExplicitBounds #10: 2.500000
collector-1  | ExplicitBounds #11: 5.000000
collector-1  | ExplicitBounds #12: 7.500000
collector-1  | ExplicitBounds #13: 10.000000
collector-1  | Buckets #0, Count: 1
collector-1  | Buckets #1, Count: 0
collector-1  | Buckets #2, Count: 0
collector-1  | Buckets #3, Count: 0
collector-1  | Buckets #4, Count: 0
collector-1  | Buckets #5, Count: 0
collector-1  | Buckets #6, Count: 0
collector-1  | Buckets #7, Count: 0
collector-1  | Buckets #8, Count: 0
collector-1  | Buckets #9, Count: 0
collector-1  | Buckets #10, Count: 0
collector-1  | Buckets #11, Count: 0
collector-1  | Buckets #12, Count: 0
collector-1  | Buckets #13, Count: 0
collector-1  | Buckets #14, Count: 0
```

Thanks to the Spring PetClinic application, we have shown some features of the
OpenTelemetry Spring Boot starter.

To know more about other features, don't hesitate to have a look at the
[OpenTelemetry Spring Boot starter documentation](/docs/zero-code/java/spring-boot-starter)
and ask questions on [slack](/community/).
