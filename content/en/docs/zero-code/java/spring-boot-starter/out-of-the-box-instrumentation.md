---
title: Out of the box instrumentation
weight: 40
cSpell:ignore: autoconfigurations autoconfigures logback webflux webmvc
---

<!-- markdownlint-disable blanks-around-fences -->
<?code-excerpt path-base="examples/java/spring-starter"?>

Out of the box instrumentation is available for several frameworks:

| Feature               | Property                                        | Default Value |
| --------------------- | ----------------------------------------------- | ------------- |
| JDBC                  | `otel.instrumentation.jdbc.enabled`             | true          |
| Logback               | `otel.instrumentation.logback-appender.enabled` | true          |
| Logback MDC           | `otel.instrumentation.logback-mdc.enabled`      | true          |
| Spring Web            | `otel.instrumentation.spring-web.enabled`       | true          |
| Spring Web MVC        | `otel.instrumentation.spring-webmvc.enabled`    | true          |
| Spring WebFlux        | `otel.instrumentation.spring-webflux.enabled`   | true          |
| Kafka                 | `otel.instrumentation.kafka.enabled`            | true          |
| MongoDB               | `otel.instrumentation.mongo.enabled`            | true          |
| Micrometer            | `otel.instrumentation.micrometer.enabled`       | false         |
| R2DBC (reactive JDBC) | `otel.instrumentation.r2dbc.enabled`            | true          |

## Turn on instrumentations selectively

To use only specific instrumentations, turn off all the instrumentations first
by setting the `otel.instrumentation.common.default-enabled` property to
`false`. Then, turn on instrumentations one by one.

For example, if you want to only enable the JDBC instrumentation, set
`otel.instrumentation.jdbc.enabled` to `true`.

## Common instrumentation configuration

Common properties for all database instrumentations:

| System property                                              | Type    | Default | Description                            |
| ------------------------------------------------------------ | ------- | ------- | -------------------------------------- |
| `otel.instrumentation.common.db-statement-sanitizer.enabled` | Boolean | true    | Enables the DB statement sanitization. |

## JDBC Instrumentation

| System property                                         | Type    | Default | Description                            |
| ------------------------------------------------------- | ------- | ------- | -------------------------------------- |
| `otel.instrumentation.jdbc.statement-sanitizer.enabled` | Boolean | true    | Enables the DB statement sanitization. |

## Logback

You can enable experimental features with system properties to capture
attributes :

| System property                                                                        | Type    | Default | Description                                                                                                                                   |
| -------------------------------------------------------------------------------------- | ------- | ------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `otel.instrumentation.logback-appender.experimental-log-attributes`                    | Boolean | false   | Enable the capture of experimental log attributes `thread.name` and `thread.id`.                                                              |
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

## Spring Web Autoconfiguration

Provides autoconfiguration for the `RestTemplate` trace interceptor defined in
[opentelemetry-spring-web-3.1](https://github.com/open-telemetry/opentelemetry-java-instrumentation/tree/main/instrumentation/spring/spring-web/spring-web-3.1/library).
This autoconfiguration instruments all requests sent using Spring `RestTemplate`
beans by applying a `RestTemplate` bean post processor. This feature is
supported for spring web versions 3.1+. To learn more about the OpenTelemetry
`RestTemplate` interceptor, see
[opentelemetry-spring-web-3.1](https://github.com/open-telemetry/opentelemetry-java-instrumentation/tree/main/instrumentation/spring/spring-web/spring-web-3.1/library).

The following ways of creating a `RestTemplate` are supported:

<!-- prettier-ignore-start -->
<?code-excerpt "src/main/java/otel/RestTemplateConfig.java"?>
```java
package otel;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

@Configuration
public class RestTemplateConfig {

  @Bean
  public RestTemplate restTemplate() {
    return new RestTemplate();
  }
}
```

<?code-excerpt "src/main/java/otel/RestTemplateController.java"?>
```java
package otel;

import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

@RestController
public class RestTemplateController {

  private final RestTemplate restTemplate;

  public RestTemplateController(RestTemplateBuilder restTemplateBuilder) {
    restTemplate = restTemplateBuilder.rootUri("http://localhost:8080").build();
  }
}
```
<!-- prettier-ignore-end -->

The following ways of creating a `RestClient` are supported:

<!-- prettier-ignore-start -->
<?code-excerpt "src/main/java/otel/RestClientConfig.java"?>
```java
package otel;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestClient;

@Configuration
public class RestClientConfig {

  @Bean
  public RestClient restClient() {
    return RestClient.create();
  }
}
```

<?code-excerpt "src/main/java/otel/RestClientController.java"?>
```java
package otel;

import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestClient;

@RestController
public class RestClientController {

  private final RestClient restClient;

  public RestClientController(RestClient.Builder restClientBuilder) {
    restClient = restClientBuilder.baseUrl("http://localhost:8080").build();
  }
}
```
<!-- prettier-ignore-end -->

As it's possible with the Java agent, you can configure the capture of the
following entities:

- [HTTP request and response headers](/docs/zero-code/java/agent/instrumentation/http/#capturing-http-request-and-response-headers)
- [Known HTTP methods](/docs/zero-code/java/agent/instrumentation/http/#configuring-known-http-methods)
- [Experimental HTTP telemetry](/docs/zero-code/java/agent/instrumentation/http/#enabling-experimental-http-telemetry)

## Spring Web MVC Autoconfiguration

This feature autoconfigures instrumentation for Spring WebMVC controllers by
adding a
[telemetry producing servlet `Filter`](https://github.com/open-telemetry/opentelemetry-java-instrumentation/blob/main/instrumentation/spring/spring-webmvc/spring-webmvc-5.3/library/src/main/java/io/opentelemetry/instrumentation/spring/webmvc/v5_3/WebMvcTelemetryProducingFilter.java)
bean to the application context. The filter decorates the request execution with
a server span, propagating the incoming tracing context if received in the HTTP
request. To learn more about the OpenTelemetry Spring WebMVC instrumentation,
see the
[opentelemetry-spring-webmvc-5.3 instrumentation library](https://github.com/open-telemetry/opentelemetry-java-instrumentation/tree/main/instrumentation/spring/spring-webmvc/spring-webmvc-5.3/library).

As it's possible with the Java agent, you can configure the capture of the
following entities:

- [HTTP request and response headers](/docs/zero-code/java/agent/instrumentation/http/#capturing-http-request-and-response-headers)
- [Known HTTP methods](/docs/zero-code/java/agent/instrumentation/http/#configuring-known-http-methods)
- [Experimental HTTP telemetry](/docs/zero-code/java/agent/instrumentation/http/#enabling-experimental-http-telemetry)

## Spring WebFlux Autoconfiguration

Provides autoconfigurations for the OpenTelemetry WebClient ExchangeFilter
defined in
[opentelemetry-spring-webflux-5.3](https://github.com/open-telemetry/opentelemetry-java-instrumentation/tree/main/instrumentation/spring/spring-webflux/spring-webflux-5.3/library).
This autoconfiguration instruments all outgoing HTTP requests sent using
Spring's WebClient and WebClient Builder beans by applying a bean post
processor. This feature is supported for spring webflux versions 5.0+. For
details, see
[opentelemetry-spring-webflux-5.3](https://github.com/open-telemetry/opentelemetry-java-instrumentation/tree/main/instrumentation/spring/spring-webflux/spring-webflux-5.3/library).

The following ways of creating a `WebClient` are supported:

<!-- prettier-ignore-start -->
<?code-excerpt "src/main/java/otel/WebClientConfig.java"?>
```java
package otel;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.WebClient;

@Configuration
public class WebClientConfig {

  @Bean
  public WebClient webClient() {
    return WebClient.create();
  }
}
```

<?code-excerpt "src/main/java/otel/WebClientController.java"?>
```java
package otel;

import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.reactive.function.client.WebClient;

@RestController
public class WebClientController {

  private final WebClient webClient;

  public WebClientController(WebClient.Builder webClientBuilder) {
    webClient = webClientBuilder.baseUrl("http://localhost:8080").build();
  }
}
```
<!-- prettier-ignore-end -->

## Kafka Instrumentation

Provides autoconfiguration for the Kafka client instrumentation.

| System property                                           | Type    | Default | Description                                          |
| --------------------------------------------------------- | ------- | ------- | ---------------------------------------------------- |
| `otel.instrumentation.kafka.experimental-span-attributes` | Boolean | false   | Enables the capture of experimental span attributes. |

## Micrometer Instrumentation

Provides autoconfiguration for the Micrometer to OpenTelemetry bridge.

## MongoDB Instrumentation

Provides autoconfiguration for the MongoDB client instrumentation.

| System property                                          | Type    | Default | Description                            |
| -------------------------------------------------------- | ------- | ------- | -------------------------------------- |
| `otel.instrumentation.mongo.statement-sanitizer.enabled` | Boolean | true    | Enables the DB statement sanitization. |

## R2DBC Instrumentation

Provides autoconfiguration for the OpenTelemetry R2DBC instrumentation.

| System property                                          | Type    | Default | Description                            |
| -------------------------------------------------------- | ------- | ------- | -------------------------------------- |
| `otel.instrumentation.r2dbc.statement-sanitizer.enabled` | Boolean | true    | Enables the DB statement sanitization. |
