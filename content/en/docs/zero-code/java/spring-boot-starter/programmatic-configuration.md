---
title: Programmatic configuration
weight: 35
cSpell:ignore: customizer
---

<!-- markdownlint-disable blanks-around-fences -->
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
> [agent Extension API](/docs/zero-code/java/agent/declarative-configuration/#extension-api)
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

{{% /tab %}} {{< /tabpane>}}

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

## Configure the exporter programmatically

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
