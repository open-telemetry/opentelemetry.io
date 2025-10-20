---
title: 开箱即用的插桩
default_lang_commit: 0b22ed7b760c66407308d5a59053b620ac06a1fa
weight: 40
cSpell:ignore: logback webflux webmvc
---

<!-- markdownlint-disable blanks-around-fences -->
<?code-excerpt path-base="examples/java/spring-starter"?>

多种框架都提供开箱即用的插桩功能：

| 框架                  | 特性                                            | 默认值 |
| --------------------- | ----------------------------------------------- | ------ |
| JDBC                  | `otel.instrumentation.jdbc.enabled`             | true   |
| Logback               | `otel.instrumentation.logback-appender.enabled` | true   |
| Logback MDC           | `otel.instrumentation.logback-mdc.enabled`      | true   |
| Spring Web            | `otel.instrumentation.spring-web.enabled`       | true   |
| Spring Web MVC        | `otel.instrumentation.spring-webmvc.enabled`    | true   |
| Spring WebFlux        | `otel.instrumentation.spring-webflux.enabled`   | true   |
| Kafka                 | `otel.instrumentation.kafka.enabled`            | true   |
| MongoDB               | `otel.instrumentation.mongo.enabled`            | true   |
| Micrometer            | `otel.instrumentation.micrometer.enabled`       | false  |
| R2DBC (reactive JDBC) | `otel.instrumentation.r2dbc.enabled`            | true   |

## 选择性的打开插桩 {#turn-on-instrumentations-selectively}

要仅使用特定的插桩，首先通过将 `otel.instrumentation.common.default-enabled` 属性设置为 `false` 来关闭所有插桩。
然后，逐个启用插桩。

例如，如果你只想启用 JDBC 插桩，请将 `otel.instrumentation.jdbc.enabled` 设置为 `true`。

## 通用插桩配置 {#common-instrumentation-configuration}

所有数据库插桩的通用属性：

| 系统特性                                                     | 类型    | 默认值 | 描述                   |
| ------------------------------------------------------------ | ------- | ------ | ---------------------- |
| `otel.instrumentation.common.db-statement-sanitizer.enabled` | Boolean | true   | 启用数据库语句的清理。 |

## JDBC 插桩 {#jdbc-instrumentation}

| 系统特性                                                | 类型    | 默认值 | 描述                   |
| ------------------------------------------------------- | ------- | ------ | ---------------------- |
| `otel.instrumentation.jdbc.statement-sanitizer.enabled` | Boolean | true   | 启用数据库语句的清理。 |

## Logback {#logback}

你可以使用系统特性启用实验性功能以捕获属性：

| 系统特性                                                                               | 类型    | 默认值 | 描述                                                                                                     |
| -------------------------------------------------------------------------------------- | ------- | ------ | -------------------------------------------------------------------------------------------------------- |
| `otel.instrumentation.logback-appender.experimental-log-attributes`                    | Boolean | false  | 启用实验性日志属性 `thread.name` 和 `thread.id` 的捕获。                                                 |
| `otel.instrumentation.logback-appender.experimental.capture-code-attributes`           | Boolean | false  | 启用[源代码属性][source code attributes]的捕获。请注意，在日志记录位置捕获源代码属性可能会增加性能开销。 |
| `otel.instrumentation.logback-appender.experimental.capture-marker-attribute`          | Boolean | false  | 启用将 Logback 标记作为属性捕获。                                                                        |
| `otel.instrumentation.logback-appender.experimental.capture-key-value-pair-attributes` | Boolean | false  | 启用将 Logback 键值对作为属性捕获。                                                                      |
| `otel.instrumentation.logback-appender.experimental.capture-logger-context-attributes` | Boolean | false  | 启用将 Logback 日志上下文属性作为属性捕获。                                                              |
| `otel.instrumentation.logback-appender.experimental.capture-mdc-attributes`            | String  |        | 以逗号分隔的要捕获的 MDC 属性列表。使用通配符 `*` 可捕获所有属性。                                       |

[source code attributes]: /docs/specs/semconv/general/attributes/#source-code-attributes

或者，你可以通过在 `logback.xml` 或 `logback-spring.xml` 文件中添加 OpenTelemetry Logback appender 来启用这些功能：

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

## Spring Web 自动配置 {#spring-web-autoconfiguration}

为 [opentelemetry-spring-web-3.1](https://github.com/open-telemetry/opentelemetry-java-instrumentation/tree/main/instrumentation/spring/spring-web/spring-web-3.1/library) 中定义的 `RestTemplate` 跟踪拦截器提供自动配置。
此自动配置通过应用 `RestTemplate` Bean 后置处理器，对所有使用 Spring `RestTemplate` Bean 发送的请求进行插桩。
此功能支持 spring web 版本 3.1+。
要了解有关 OpenTelemetry `RestTemplate` 拦截器的更多信息，请参见
[opentelemetry-spring-web-3.1](https://github.com/open-telemetry/opentelemetry-java-instrumentation/tree/main/instrumentation/spring/spring-web/spring-web-3.1/library)。

支持以下几种创建 `RestTemplate` 的方式：

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

支持以下几种创建 `RestClient` 的方式：

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

正如使用 Java 代理一样，你可以配置捕获以下实体：

- [HTTP 请求和响应头](/docs/zero-code/java/agent/instrumentation/http/#capturing-http-request-and-response-headers)
- [已知的 HTTP 方法](/docs/zero-code/java/agent/instrumentation/http/#configuring-known-http-methods)
- [实验性的 HTTP 遥测](/docs/zero-code/java/agent/instrumentation/http/#enabling-experimental-http-telemetry)

## Spring Web MVC 自动配置 {#spring-web-mvc-autoconfiguration}

此功能通过向应用程序上下文添加一个 [生成遥测数据的 Servlet `Filter`](https://github.com/open-telemetry/opentelemetry-java-instrumentation/blob/main/instrumentation/spring/spring-webmvc/spring-webmvc-5.3/library/src/main/java/io/opentelemetry/instrumentation/spring/webmvc/v5_3/WebMvcTelemetryProducingFilter.java) Bean，为 Spring WebMVC 控制器自动配置插桩。
该过滤器使用服务器 Span 装饰请求执行，如果在 HTTP 请求中接收到传入的跟踪上下文，则会传播该上下文。
要了解更多关于 OpenTelemetry Spring WebMVC 插桩的信息，请参阅
[opentelemetry-spring-webmvc-5.3 插桩库](https://github.com/open-telemetry/opentelemetry-java-instrumentation/tree/main/instrumentation/spring/spring-webmvc/spring-webmvc-5.3/library)。

正如使用 Java 代理一样，你可以配置捕获以下实体：

- [HTTP 请求和响应头](/docs/zero-code/java/agent/instrumentation/http/#capturing-http-request-and-response-headers)
- [已知的 HTTP 方法](/docs/zero-code/java/agent/instrumentation/http/#configuring-known-http-methods)
- [实验性的 HTTP 遥测](/docs/zero-code/java/agent/instrumentation/http/#enabling-experimental-http-telemetry)

## Spring WebFlux 自动配置 {#spring-webflux-autoconfiguration}

为 [opentelemetry-spring-webflux-5.3](https://github.com/open-telemetry/opentelemetry-java-instrumentation/tree/main/instrumentation/spring/spring-webflux/spring-webflux-5.3/library) 提供自动配置。
此自动配置通过应用 Bean 后置处理器，对所有使用 Spring 的 WebClient 和 WebClient Builder Bean 发送的出站 HTTP 请求进行插桩。
此功能支持 Spring WebFlux 版本 5.0+。
有关详细信息，请参阅 [opentelemetry-spring-webflux-5.3](https://github.com/open-telemetry/opentelemetry-java-instrumentation/tree/main/instrumentation/spring/spring-webflux/spring-webflux-5.3/library)。

以下是创建 `WebClient` 的支持方式：

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

## Kafka 插桩 {#kafka-instrumentation}

为 Kafka 客户端插桩提供自动配置。

| 系统特性                                                  | 类型    | 默认值 | 描述                       |
| --------------------------------------------------------- | ------- | ------ | -------------------------- |
| `otel.instrumentation.kafka.experimental-span-attributes` | Boolean | false  | 启用实验性跨度属性的捕获。 |

## Micrometer 插桩 {#micrometer-instrumentation}

为 Micrometer 到 OpenTelemetry 的桥接提供自动配置。

## MongoDB 插桩 {#mongodb-instrumentation}

为 MongoDB 客户端插桩提供自动配置。

| 系统特性                                                 | 类型    | 默认值 | 描述                       |
| -------------------------------------------------------- | ------- | ------ | -------------------------- |
| `otel.instrumentation.mongo.statement-sanitizer.enabled` | Boolean | true   | 启用数据库语句的清洗处理。 |

## R2DBC 插桩 {#r2dbc-instrumentation}

为 OpenTelemetry R2DBC 插桩提供自动配置。

| 系统特性                                                 | 类型    | 默认值 | 描述                       |
| -------------------------------------------------------- | ------- | ------ | -------------------------- |
| `otel.instrumentation.r2dbc.statement-sanitizer.enabled` | Boolean | true   | 启用数据库语句的清洗处理。 |
