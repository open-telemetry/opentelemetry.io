---
title: Programmatic configuration
weight: 35
vers:
  contrib: 1.54.0
cSpell:ignore: customizer fileconfig
---

<?code-excerpt path-base="examples/java/spring-starter"?>

You can use the `AutoConfigurationCustomizerProvider` for programmatic
configuration. Programmatic configuration is recommended for advanced use cases,
which are not configurable using properties.

> [!WARNING]
>
> `AutoConfigurationCustomizerProvider` does not work with
> [declarative configuration](../declarative-configuration/). With declarative
> configuration, use `DeclarativeConfigurationCustomizerProvider` instead — see
> the
> [agent Extension API section](/docs/zero-code/java/agent/declarative-configuration/)
> for details and examples.

## Exclude actuator endpoints from tracing

As an example, you can customize the sampler to exclude health check endpoints
from tracing:

{{< tabpane text=true >}} {{% tab header="Maven (`pom.xml`)" lang=Maven %}}

```xml
<dependencies>
  <dependency>
    <groupId>io.opentelemetry.contrib</groupId>
    <artifactId>opentelemetry-samplers</artifactId>
    <version>{{% param vers.contrib %}}-alpha</version>
  </dependency>
</dependencies>
```

{{% /tab %}} {{% tab header="Gradle (`build.gradle`)" lang=Gradle %}}

```kotlin
dependencies {
  implementation("io.opentelemetry.contrib:opentelemetry-samplers:{{% param vers.contrib %}}-alpha")
}
```

{{% /tab %}} {{< /tabpane>}}

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

## Configure the exporter programmatically

You can also configure OTLP exporters programmatically. This configuration
replaces the default OTLP exporter and adds a custom header to the requests.

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

## Read instrumentation configuration programmatically

> [!NOTE]
>
> Requires the OpenTelemetry Spring Boot starter version 2.30.0 or later.

Instrumentation modules read their configuration through a `ConfigProvider`
bean, whether you configured it via `application.properties` /
`application.yaml` or via
[declarative configuration](../declarative-configuration/). Autowire the
`ConfigProvider` bean directly if you need to read an instrumentation
configuration value from your own code:

When declarative configuration is enabled, the `otelProperties`
(`ConfigProperties`) bean is provided only as a compatibility bridge. It is
deprecated and will be removed in 3.0; use `ConfigProvider` instead.

<?code-excerpt path-base="content-modules/opentelemetry-java-examples/spring-declarative-configuration"?>

<?code-excerpt "src/main/java/io/opentelemetry/examples/fileconfig/ReadInstrumentationConfig.java" from="package"?>

```java
package io.opentelemetry.examples.fileconfig;

import io.opentelemetry.api.incubator.config.ConfigProvider;
import io.opentelemetry.api.incubator.config.DeclarativeConfigProperties;
import org.springframework.stereotype.Component;

/** Example of reading instrumentation configuration from application code. */
@Component
public class ReadInstrumentationConfig {

  private final ConfigProvider configProvider;

  public ReadInstrumentationConfig(ConfigProvider configProvider) {
    this.configProvider = configProvider;
  }

  public boolean isDbQuerySanitizationEnabled() {
    DeclarativeConfigProperties dbConfig =
        configProvider
            .getInstrumentationConfig()
            .get("java")
            .get("common")
            .get("db")
            .get("query_sanitization");
    return dbConfig.getBoolean("enabled", true);
  }
}
```

The keys under `getInstrumentationConfig()` follow the same
`instrumentation/development.java.*` structure used by
[declarative configuration](../declarative-configuration/#instrumentation-configuration),
regardless of whether you set the value via an `otel.instrumentation.*` property
or declarative YAML — see the
[mapping table](../declarative-configuration/#instrumentation-configuration) for
how property names translate to this structure.
