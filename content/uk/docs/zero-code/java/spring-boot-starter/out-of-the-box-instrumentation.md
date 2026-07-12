---
title: Інструментування з коробки
weight: 40
default_lang_commit: 311e7819e9eacf9d8b6d250bbdee98c018ea232e
cSpell:ignore: webflux webmvc бінів
---

<!-- markdownlint-disable blanks-around-fences -->
<?code-excerpt path-base="examples/java/spring-starter"?>

Інструментування з коробки доступне для кількох фреймворків:

{{< tabpane text=true >}} {{% tab "Властивості" %}}

| Функція               | Властивість                                     | Стандартно |
| --------------------- | ----------------------------------------------- | ---------- |
| JDBC                  | `otel.instrumentation.jdbc.enabled`             | true       |
| Logback               | `otel.instrumentation.logback-appender.enabled` | true       |
| Logback MDC           | `otel.instrumentation.logback-mdc.enabled`      | true       |
| Spring Web            | `otel.instrumentation.spring-web.enabled`       | true       |
| Spring Web MVC        | `otel.instrumentation.spring-webmvc.enabled`    | true       |
| Spring WebFlux        | `otel.instrumentation.spring-webflux.enabled`   | true       |
| Kafka                 | `otel.instrumentation.kafka.enabled`            | true       |
| MongoDB               | `otel.instrumentation.mongo.enabled`            | true       |
| Micrometer            | `otel.instrumentation.micrometer.enabled`       | false      |
| R2DBC (reactive JDBC) | `otel.instrumentation.r2dbc.enabled`            | true       |

Щоб вимкнути конкретне інструментування:

```yaml
otel:
  instrumentation:
    logback-appender:
      enabled: false
```

{{% /tab %}} {{% tab "Декларативна конфігурація" %}}

У [декларативній конфігурації](../declarative-configuration/), увімкнення/вимкнення інструментування
використовує централізовані списки в `otel.distribution.spring_starter.instrumentation`. Назва інструментування
використовує `_` (snake_case), а не `-` (kebab-case).

| Функція               | Назва              | Стандартно |
| --------------------- | ------------------ | ---------- |
| JDBC                  | `jdbc`             | увімкнено  |
| Logback               | `logback_appender` | увімкнено  |
| Logback MDC           | `logback_mdc`      | увімкнено  |
| Spring Web            | `spring_web`       | увімкнено  |
| Spring Web MVC        | `spring_webmvc`    | увімкнено  |
| Spring WebFlux        | `spring_webflux`   | увімкнено  |
| Kafka                 | `kafka`            | увімкнено  |
| MongoDB               | `mongo`            | увімкнено  |
| Micrometer            | `micrometer`       | вимкнено   |
| R2DBC (reactive JDBC) | `r2dbc`            | увімкнено  |

Для вимкнення конкретного інструментування:

```yaml
otel:
  distribution:
    spring_starter:
      instrumentation:
        disabled:
          - logback_appender
```

{{% /tab %}} {{< /tabpane >}}

## Вибіркове увімкнення інструментувань {#turn-on-instrumentations-selectively}

{{< tabpane text=true >}} {{% tab "Властивості" %}}

Щоб використовувати лише певні інструментування, спочатку вимкніть усі інструментування, а потім увімкніть інструментування одне за одним:

```yaml
otel:
  instrumentation:
    common:
      default-enabled: false
    jdbc:
      enabled: true
```

{{% /tab %}} {{% tab "Декларативна конфігурація" %}}

У [декларативній конфігурації](../declarative-configuration/), встановіть `default_enabled` у значення `false` та перелічіть інструментування, які ви хочете увімкнути, у `enabled`:

```yaml
otel:
  distribution:
    spring_starter:
      instrumentation:
        default_enabled: false
        enabled:
          - jdbc
```

{{% /tab %}} {{< /tabpane >}}

## Загальна конфігурація інструментування {#common-instrumentation-configuration}

Загальні властивості для всіх інструментувань баз даних:

{{< tabpane text=true >}} {{% tab "Властивості" %}}

Увімкнення санітизації запитів до БД для всіх інструментувань баз даних:

```yaml
otel:
  instrumentation:
    common:
      db-statement-sanitizer:
        enabled: true # стандартно: true
```

{{% /tab %}} {{% tab "Декларативна конфігурація" %}}

Увімкнення санітизації запитів до БД для всіх інструментувань баз даних:

```yaml
otel:
  instrumentation/development:
    java:
      common:
        database:
          statement_sanitizer:
            enabled: true
```

{{% /tab %}} {{< /tabpane >}}

## Інструментування JDBC {#jdbc-instrumentation}

{{< tabpane text=true >}} {{% tab "Властивості" %}}

Увімкнення санітизації запитів до БД для JDBC:

```yaml
otel:
  instrumentation:
    jdbc:
      statement-sanitizer:
        enabled: true # стандартно: true
```

{{% /tab %}} {{% tab "Декларативна конфігурація" %}}

Увімкнення санітизації запитів до БД для JDBC:

```yaml
otel:
  instrumentation/development:
    java:
      jdbc:
        statement_sanitizer:
          enabled: true
```

{{% /tab %}} {{< /tabpane >}}

## Logback

Ви можете увімкнути експериментальні функції за допомогою системних властивостей для захоплення атрибутів:

{{< tabpane text=true >}} {{% tab "Властивості" %}}

| Властивість                                      | Тип     | Значення за замовчуванням | Опис                                                                                                                                                                                                                                            |
| ------------------------------------------------ | ------- | ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `experimental-log-attributes`                    | Boolean | false                     | Увімкнення захоплення експериментальних атрибутів журналу `thread.name` та `thread.id`.                                                                                                                                                         |
| `experimental.capture-code-attributes`           | Boolean | false                     | Увімкнення захоплення [атрибутів вихідного коду](/docs/specs/semconv/general/attributes/#source-code-attributes). Зверніть увагу, що захоплення атрибутів вихідного коду на місцях журналювання може додати накладні витрати на продуктивність. |
| `experimental.capture-marker-attribute`          | Boolean | false                     | Увімкнення захоплення маркерів Logback як атрибутів.                                                                                                                                                                                            |
| `experimental.capture-key-value-pair-attributes` | Boolean | false                     | Увімкнення захоплення пар ключ-значення Logback як атрибутів.                                                                                                                                                                                   |
| `experimental.capture-logger-context-attributes` | Boolean | false                     | Увімкнення захоплення властивостей контексту логера Logback як атрибутів.                                                                                                                                                                       |
| `experimental.capture-mdc-attributes`            | String  |                           | Список атрибутів MDC для захоплення, розділених комами. Використовуйте символ підстановки `*`, щоб захопити всі атрибути.                                                                                                                       |

```yaml
otel:
  instrumentation:
    logback-appender:
      experimental-log-attributes: false
      experimental:
        capture-code-attributes: false
        capture-marker-attribute: false
        capture-key-value-pair-attributes: false
        capture-logger-context-attributes: false
        capture-mdc-attributes: '*'
```

{{% /tab %}} {{% tab "Декларативна конфігурація" %}}

| Property                                        | Type    | Default | Description                                                                                                                                                                                                                                     |
| ----------------------------------------------- | ------- | ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `experimental_log_attributes/development`       | Boolean | false   | Увімкнення захоплення експериментальних атрибутів журналу `thread.name` та `thread.id`.                                                                                                                                                         |
| `capture_code_attributes/development`           | Boolean | false   | Увімкнення захоплення [атрибутів вихідного коду](/docs/specs/semconv/general/attributes/#source-code-attributes). Зверніть увагу, що захоплення атрибутів вихідного коду на місцях журналювання може додати накладні витрати на продуктивність. |
| `capture_marker_attribute/development`          | Boolean | false   | Увімкнення захоплення маркерів Logback як атрибутів.                                                                                                                                                                                            |
| `capture_key_value_pair_attributes/development` | Boolean | false   | Увімкнення захоплення пар ключ-значення Logback як атрибутів.                                                                                                                                                                                   |
| `capture_logger_context_attributes/development` | Boolean | false   | Увімкнення захоплення властивостей контексту логера Logback як атрибутів.                                                                                                                                                                       |
| `capture_mdc_attributes/development`            | String  |         | Список атрибутів MDC для захоплення, розділених комами. Використовуйте символ підстановки `*`, щоб захопити всі атрибути.                                                                                                                       |

```yaml
otel:
  instrumentation/development:
    java:
      logback_appender:
        experimental_log_attributes/development: false
        capture_code_attributes/development: false
        capture_marker_attribute/development: false
        capture_key_value_pair_attributes/development: false
        capture_logger_context_attributes/development: false
        capture_mdc_attributes/development: '*'
```

<!-- [source_code_attributes]: /docs/specs/semconv/general/attributes/#source-code-attributes -->

{{% /tab %}} {{< /tabpane >}}

Альтернативно, ви можете увімкнути ці функції, додавши доповнювач OpenTelemetry Logback у ваш файл `logback.xml` або `logback-spring.xml`:

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

## Автоконфігурація Spring Web {#spring-web-autoconfiguration}

Забезпечує автоконфігурацію для перехоплювача трасування `RestTemplate`, визначеного в [opentelemetry-spring-web-3.1](https://github.com/open-telemetry/opentelemetry-java-instrumentation/tree/main/instrumentation/spring/spring-web/spring-web-3.1/library). Ця автоконфігурація інструментує всі запити, що надсилаються за допомогою Spring `RestTemplate` бінів, застосовуючи постпроцесор бінів `RestTemplate`. Ця функція підтримується для версій spring web 3.1+. Щоб дізнатися більше про перехоплювач `RestTemplate` OpenTelemetry, дивіться [opentelemetry-spring-web-3.1](https://github.com/open-telemetry/opentelemetry-java-instrumentation/tree/main/instrumentation/spring/spring-web/spring-web-3.1/library).

Підтримуються наступні способи створення `RestTemplate`:

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

Підтримуються наступні способи створення `RestClient`:

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

Як і у випадку з Java агентом, ви можете налаштувати захоплення наступних сутностей:

- [Заголовки HTTP запитів та відповідей](/docs/zero-code/java/agent/instrumentation/http/#capturing-http-request-and-response-headers)
- [Відомі методи HTTP](/docs/zero-code/java/agent/instrumentation/http/#configuring-known-http-methods)
- [Експериментальна телеметрія HTTP](/docs/zero-code/java/agent/instrumentation/http/#enabling-experimental-http-telemetry)

## Автоконфігурація Spring Web MVC {#spring-web-mvc-autoconfiguration}

Ця функція автоматично конфігурує інструментування для контролерів Spring WebMVC, додаючи [фільтр, що створює телеметрію](https://github.com/open-telemetry/opentelemetry-java-instrumentation/blob/main/instrumentation/spring/spring-webmvc/spring-webmvc-5.3/library/src/main/java/io/opentelemetry/instrumentation/spring/webmvc/v5_3/WebMvcTelemetryProducingFilter.java) бін до контексту застосунку. Фільтр декорує виконання запиту відрізком сервера, передаючи вхідний контекст трасування, якщо він отриманий у HTTP запиті. Щоб дізнатися більше про інструментування Spring WebMVC OpenTelemetry, дивіться [бібліотеку інструментування opentelemetry-spring-webmvc-5.3](https://github.com/open-telemetry/opentelemetry-java-instrumentation/tree/main/instrumentation/spring/spring-webmvc/spring-webmvc-5.3/library).

Як і у випадку з Java агентом, ви можете налаштувати захоплення наступних сутностей:

- [Заголовки HTTP запитів та відповідей](/docs/zero-code/java/agent/instrumentation/http/#capturing-http-request-and-response-headers)
- [Відомі методи HTTP](/docs/zero-code/java/agent/instrumentation/http/#configuring-known-http-methods)
- [Експериментальна телеметрія HTTP](/docs/zero-code/java/agent/instrumentation/http/#enabling-experimental-http-telemetry)

## Автоконфігурація Spring WebFlux {#spring-webflux-autoconfiguration}

Забезпечує автоконфігурації для фільтра обміну WebClient OpenTelemetry, визначеного в [opentelemetry-spring-webflux-5.3](https://github.com/open-telemetry/opentelemetry-java-instrumentation/tree/main/instrumentation/spring/spring-webflux/spring-webflux-5.3/library).
Ця автоконфігурація інструментує всі вихідні HTTP запити, що надсилаються за допомогою бінів WebClient та WebClient Builder Spring, застосовуючи постпроцесор бінів. Ця функція підтримується для версій spring webflux 5.0+. Для деталей дивіться [opentelemetry-spring-webflux-5.3](https://github.com/open-telemetry/opentelemetry-java-instrumentation/tree/main/instrumentation/spring/spring-webflux/spring-webflux-5.3/library).

Підтримуються наступні способи створення `WebClient`:

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

## Інструментування Kafka {#kafka-instrumentation}

Забезпечує автоконфігурацію для інструментування клієнта Kafka.

{{< tabpane text=true >}} {{% tab "Властивості" %}}

Вмикає захоплення експериментальних атрибутів відрізків для Kafka:

```yaml
otel:
  instrumentation:
    kafka:
      experimental-span-attributes: false # стандартно: false
```

{{% /tab %}} {{% tab "Декларативна конфігурація" %}}

Вмикає захоплення експериментальних атрибутів відрізків для Kafka:

```yaml
otel:
  instrumentation/development:
    java:
      kafka:
        experimental_span_attributes/development: false
```

{{% /tab %}} {{< /tabpane >}}

## Інструментування Micrometer {#micrometer-instrumentation}

Забезпечує автоконфігурацію для мосту Micrometer до OpenTelemetry.

## Інструментування MongoDB {#mongodb-instrumentation}

Забезпечує автоконфігурацію для інструментування клієнта MongoDB.

{{< tabpane text=true >}} {{% tab "Властивості" %}}

Вмикає санітизацію запитів до БД для MongoDB:

```yaml
otel:
  instrumentation:
    mongo:
      statement-sanitizer:
        enabled: true # стандартно: true
```

{{% /tab %}} {{% tab "Декларативна конфігурація" %}}

Вмикає санітизацію запитів до БД для MongoDB:

```yaml
otel:
  instrumentation/development:
    java:
      mongo:
        statement_sanitizer:
          enabled: true
```

{{% /tab %}} {{< /tabpane >}}

## Інструментування R2DBC {#r2dbc-instrumentation}

Забезпечує автоконфігурацію для інструментування OpenTelemetry R2DBC.

{{< tabpane text=true >}} {{% tab "Властивості" %}}

Вмикає санітизацію запитів до БД для R2DBC:

```yaml
otel:
  instrumentation:
    r2dbc:
      statement-sanitizer:
        enabled: true # стандартно: true
```

{{% /tab %}} {{% tab "Декларативна конфігурація" %}}

Вмикає санітизацію запитів до БД для R2DBC:

```yaml
otel:
  instrumentation/development:
    java:
      r2dbc:
        statement_sanitizer:
          enabled: true
```

{{% /tab %}} {{< /tabpane >}}
