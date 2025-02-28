---
title: SDK configuration
weight: 30
cSpell:ignore: customizer distro
---

<!-- markdownlint-disable blanks-around-fences -->
<?code-excerpt path-base="examples/java/spring-starter"?>

This spring starter supports
[configuration metadata](https://docs.spring.io/spring-boot/docs/current/reference/html/configuration-metadata.html),
which means that you can see and autocomplete all available properties in your
IDE.

## General configuration

The OpenTelemetry Starter supports all the
[SDK Autoconfiguration](/docs/zero-code/java/agent/configuration/#sdk-configuration)
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

## Overriding Resource Attributes

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

## Disable the OpenTelemetry Starter

{{% config_option name="otel.sdk.disabled" %}}

Set the value to `true` to disable the starter, e.g. for testing purposes.

{{% /config_option %}}

## Programmatic configuration

You can use the `AutoConfigurationCustomizerProvider` for programmatic
configuration. Programmatic configuration is recommended for advanced use cases,
which are not configurable using properties.

### Exclude actuator endpoints from tracing

As an example, you can customize the sampler to exclude health check endpoints
from tracing:

{{% tabpane text=true %}} {{% tab header="Maven (`pom.xml`)" lang=Maven %}}

```xml
<dependencies>
  <dependency>
    <groupId>io.opentelemetry.contrib</groupId>
    <artifactId>opentelemetry-samplers</artifactId>
    <version>1.33.0-alpha</version>
  </dependency>
</dependencies>
```

{{% /tab %}} {{% tab header="Gradle (`build.gradle`)" lang=Gradle %}}

```kotlin
dependencies {
  implementation("io.opentelemetry.contrib:opentelemetry-samplers:1.33.0-alpha")
}
```

{{% /tab %}} {{% /tabpane%}}

<!-- prettier-ignore-start -->
<?code-excerpt "src/main/java/otel/FilterPaths.java"?>
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

### Configure the exporter programmatically

You can also configure OTLP exporters programmatically. This configuration
replaces the default OTLP exporter and adds a custom header to the requests.

<!-- prettier-ignore-start -->
<?code-excerpt "src/main/java/otel/CustomAuth.java"?>
```java
package otel;

import io.opentelemetry.exporter.otlp.http.trace.OtlpHttpSpanExporter;
import io.opentelemetry.sdk.autoconfigure.spi.AutoConfigurationCustomizerProvider;
import java.util.Collections;
import java.util.Map;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class CustomAuth {
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
<!-- prettier-ignore-end -->

## Resource Providers

The OpenTelemetry Starter includes the same resource providers as the Java
agent:

- [Common resource providers](https://github.com/open-telemetry/opentelemetry-java-instrumentation/tree/main/instrumentation/resources/library)
- [Resource providers that are disabled by default](/docs/zero-code/java/agent/configuration/#enable-resource-providers-that-are-disabled-by-default)

In addition, the OpenTelemetry Starter includes the following Spring Boot
specific resource providers:

### Distribution Resource Provider

FQN:
`io.opentelemetry.instrumentation.spring.autoconfigure.resources.DistroVersionResourceProvider`

| Attribute                  | Value                               |
| -------------------------- | ----------------------------------- |
| `telemetry.distro.name`    | `opentelemetry-spring-boot-starter` |
| `telemetry.distro.version` | version of the starter              |

### Spring Resource Provider

FQN:
`io.opentelemetry.instrumentation.spring.autoconfigure.resources.SpringResourceProvider`

| Attribute         | Value                                                                                                      |
| ----------------- | ---------------------------------------------------------------------------------------------------------- |
| `service.name`    | `spring.application.name` or `build.name` from `build-info.properties` (see [Service name](#service-name)) |
| `service.version` | `build.version` from `build-info.properties`                                                               |

## Service name

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

{{% tabpane text=true %}} {{% tab header="Maven (`pom.xml`)" lang=Maven %}}

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

{{% /tab %}} {{% tab header="Gradle (`build.gradle`)" lang=Gradle %}}

```kotlin
springBoot {
  buildInfo {
  }
}
```

{{% /tab %}} {{% /tabpane%}}
