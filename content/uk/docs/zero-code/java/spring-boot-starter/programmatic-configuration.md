---
title: Програмна конфігурація
weight: 35
vers:
  contrib: 1.54.0
default_lang_commit: d30d20ea078abf2b4a9aa270aa01042efa91dc99
cSpell:ignore: customizer fileconfig
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

## Читання конфігурації інструментування програмним способом {#read-instrumentation-configuration-programmatically}

> [!NOTE]
>
> Потребує OpenTelemetry Spring Boot стартера версії 2.30.0 або новішої.

Модулі інструментування читають свою конфігурацію через bean `ConfigProvider`, незалежно від того, чи налаштували ви її через `application.properties` / `application.yaml`, чи через [декларативну конфігурацію](../declarative-configuration/). Автоматично підключає bean `ConfigProvider` напряму, якщо вам потрібно прочитати значення конфігурації інструментування з власного коду:

Коли увімкнено декларативну конфігурацію, bean `otelProperties` (`ConfigProperties`) надається лише як сумісний міст. Він застарілий і буде видалений у версії 3.0; натомість використовуйте `ConfigProvider`.

<?code-excerpt path-base="content-modules/opentelemetry-java-examples/spring-declarative-configuration"?>

<?code-excerpt "src/main/java/io/opentelemetry/examples/fileconfig/ReadInstrumentationConfig.java" from="package"?>

```java
package io.opentelemetry.examples.fileconfig;

import io.opentelemetry.api.incubator.config.ConfigProvider;
import io.opentelemetry.api.incubator.config.DeclarativeConfigProperties;
import org.springframework.stereotype.Component;

/** Приклад читання конфігурації інструментування з коду застосунку. */
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

Ключі в `getInstrumentationConfig()` відповідають тій самій структурі `instrumentation/development.java.*`, яку використовує [декларативна конфігурація](../declarative-configuration/#instrumentation-configuration), незалежно від того, чи задали ви значення через властивість `otel.instrumentation.*`, чи через декларативний YAML — див. [таблицю відповідності](../declarative-configuration/#instrumentation-configuration) про те, як назви властивостей перетворюються на цю структуру.
