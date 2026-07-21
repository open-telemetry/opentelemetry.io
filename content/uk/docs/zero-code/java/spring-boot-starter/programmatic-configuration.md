---
title: Програмна конфігурація
weight: 35
vers:
  contrib: 1.54.0
default_lang_commit: 311e7819e9eacf9d8b6d250bbdee98c018ea232e
cSpell:ignore: customizer
---

<?code-excerpt path-base="examples/java/spring-starter"?>

Ви можете використовувати `AutoConfigurationCustomizerProvider` для програмної конфігурації. Програмна конфігурація рекомендується для розширених випадків використання, які не можна налаштувати за допомогою властивостей.

> [!WARNING]
>
> `AutoConfigurationCustomizerProvider` не працює з [декларативною конфігурацією](../declarative-configuration/). Для декларативної конфігурації використовуйте `DeclarativeConfigurationCustomizerProvider` — див. розділ [Розширення API](/docs/zero-code/java/agent/declarative-configuration/) для агента для деталей та прикладів.

## Виключення точок доступу actuator з трасування {#exclude-actuator-endpoints-from-tracing}

Як приклад, ви можете налаштувати механізм вибірки, щоб виключити точки перевірки стану з трасування:

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

{{% /tab %}} {{< /tabpane >}}

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

## Програмна конфігурація експортера {#configure-the-exporter-programmatically}

Ви також можете налаштувати експортери OTLP програмно. Ця конфігурація замінює стандартний експортер OTLP та додає користувацький заголовок до запитів.

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
    // наприклад, прочитати токен з секрету Kubernetes
    return "token";
  }
}
```
