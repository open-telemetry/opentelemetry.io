---
title: Налаштування SDK
weight: 30
default_lang_commit: e05fefe6c9f7d8b159d9a9a95128098c646c78c4
cSpell:ignore: customizer distro
---

<!-- markdownlint-disable blanks-around-fences -->
<?code-excerpt path-base="examples/java/spring-starter"?>

Цей стартер Spring підтримує [метадані конфігурації](https://docs.spring.io/spring-boot/docs/current/reference/html/configuration-metadata.html), що означає, що ви можете бачити та автоматично заповнювати всі доступні властивості у вашому IDE.

## Загальна конфігурація {#general-configuration}

OpenTelemetry Starter підтримує всі [Автоконфігурації SDK](/docs/zero-code/java/agent/configuration/#sdk-configuration) (з версії 2.2.0).

Ви можете оновити конфігурацію за допомогою властивостей у файлі `application.properties` або `application.yaml`, або за допомогою змінних середовища.

Приклад `application.properties`:

```properties
otel.propagators=tracecontext,b3
otel.resource.attributes.deployment.environment=dev
otel.resource.attributes.service.name=cart
otel.resource.attributes.service.namespace=shop
```

Приклад `application.yaml`:

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

Приклад змінних середовища:

```shell
export OTEL_PROPAGATORS="tracecontext,b3"
export OTEL_RESOURCE_ATTRIBUTES="deployment.environment=dev,service.name=cart,service.namespace=shop"
```

## Перевизначення атрибутів ресурсу {#overriding-resource-attributes}

Як зазвичай у Spring Boot, ви можете перевизначити властивості у файлах `application.properties` та `application.yaml` за допомогою змінних середовища.

Наприклад, ви можете встановити або перевизначити атрибут ресурсу `deployment.environment` (не змінюючи `service.name` або `service.namespace`) шляхом встановлення стандартної змінної середовища `OTEL_RESOURCE_ATTRIBUTES`:

```shell
export OTEL_RESOURCE_ATTRIBUTES="deployment.environment=prod"
```

Альтернативно, ви можете використовувати змінну середовища `OTEL_RESOURCE_ATTRIBUTES_DEPLOYMENT_ENVIRONMENT` для встановлення або перевизначення одного атрибуту ресурсу:

```shell
export OTEL_RESOURCE_ATTRIBUTES_DEPLOYMENT_ENVIRONMENT="prod"
```

Другий варіант підтримує [SpEL](https://docs.spring.io/spring-framework/docs/3.2.x/spring-framework-reference/html/expressions.html) вирази.

Зверніть увагу, що `DEPLOYMENT_ENVIRONMENT` перетворюється на `deployment.environment` за допомогою [Relaxed Binding](https://docs.spring.io/spring-boot/docs/current/reference/html/features.html#features.external-config.typesafe-configuration-properties.relaxed-binding.environment-variables) Spring Boot.

## Вимкнення OpenTelemetry Starter {#disable-the-opentelemetry-starter}

{{% config_option name="otel.sdk.disabled" %}}

Встановіть значення `true`, щоб вимкнути стартер, наприклад, для тестування.

{{% /config_option %}}

## Програмна конфігурація {#programmatic-configuration}

Ви можете використовувати `AutoConfigurationCustomizerProvider` для програмної конфігурації. Програмна конфігурація рекомендується для складних випадків, які не можна налаштувати за допомогою властивостей.

### Виключення точок доступу актуатора з трасування {#exclude-actuator-endpoints-from-tracing}

Наприклад, ви можете налаштувати семплер для виключення точок доступу перевірки справності з трасування:

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

### Програмна конфігурація експортера {#configure-the-exporter-programmatically}

Ви також можете програмно налаштувати експортери OTLP. Ця конфігурація замінює стандартний експортер OTLP та додає спеціальний заголовок до запитів.

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
    // наприклад, зчитування токену з секрету kubernetes
    return "token";
  }
}
```
<!-- prettier-ignore-end -->

## Провайдери ресурсів {#resource-providers}

OpenTelemetry Starter включає ті ж провайдери ресурсів, що і Java агент:

- [Загальні провайдери ресурсів](https://github.com/open-telemetry/opentelemetry-java-instrumentation/tree/main/instrumentation/resources/library)
- [Провайдери ресурсів, які стандартно вимкнені](/docs/zero-code/java/agent/configuration/#enable-resource-providers-that-are-disabled-by-default)

Крім того, OpenTelemetry Starter включає наступні специфічні для Spring Boot провайдери ресурсів:

### Провайдер ресурсів дистрибуції {#distribution-resource-provider}

FQN: `io.opentelemetry.instrumentation.spring.autoconfigure.resources.DistroVersionResourceProvider`

| Атрибут                    | Значення                            |
| -------------------------- | ----------------------------------- |
| `telemetry.distro.name`    | `opentelemetry-spring-boot-starter` |
| `telemetry.distro.version` | версія стартера                     |

### Провайдер ресурсів Spring {#spring-resource-provider}

FQN: `io.opentelemetry.instrumentation.spring.autoconfigure.resources.SpringResourceProvider`

| Атрибут           | Значення                                                                                                   |
| ----------------- | ---------------------------------------------------------------------------------------------------------- |
| `service.name`    | `spring.application.name` або `build.name` з `build-info.properties` (див. [Назва сервісу](#service-name)) |
| `service.version` | `build.version` з `build-info.properties`                                                                  |

## Назва сервісу {#service-name}

Використовуючи ці провайдери ресурсів, назва сервісу визначається за наступними правилами пріоритету, відповідно [специфікації](/docs/languages/sdk-configuration/general/#otel_service_name) OpenTelemetry:

1. Властивість spring `otel.service.name` або змінна середовища `OTEL_SERVICE_NAME` (найвищий пріоритет)
2. `service.name` у системній/властивості spring `otel.resource.attributes` або змінна середовища `OTEL_RESOURCE_ATTRIBUTES`
3. Властивість spring `spring.application.name`
4. `build-info.properties`
5. `Implementation-Title` з META-INF/MANIFEST.MF
6. Стандартне значення — `unknown_service:java` (найнижчий пріоритет)

Використовуйте наступний фрагмент у вашому файлі pom.xml для генерації файлу `build-info.properties`:

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

{{% /tab %}} {{% tab header="Gradle (`build.gradle`)" lang=Gradle %}}

```kotlin
springBoot {
  buildInfo {
  }
}
```

{{% /tab %}} {{< /tabpane>}}
