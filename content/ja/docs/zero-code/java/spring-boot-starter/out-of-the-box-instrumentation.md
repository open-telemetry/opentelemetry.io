---
title: すぐに使える計装
weight: 40
default_lang_commit: 276d7eb3f936deef6487cdd2b1d89822951da6c8
cSpell:ignore: logback webflux webmvc
---

<!-- markdownlint-disable blanks-around-fences -->
<?code-excerpt path-base="examples/java/spring-starter"?>

いくつかのフレームワークに対して、すぐに使える計装が利用可能です。

| 機能                     | プロパティ                                      | デフォルト値 |
| ------------------------ | ----------------------------------------------- | ------------ |
| JDBC                     | `otel.instrumentation.jdbc.enabled`             | true         |
| Logback                  | `otel.instrumentation.logback-appender.enabled` | true         |
| Logback MDC              | `otel.instrumentation.logback-mdc.enabled`      | true         |
| Spring Web               | `otel.instrumentation.spring-web.enabled`       | true         |
| Spring Web MVC           | `otel.instrumentation.spring-webmvc.enabled`    | true         |
| Spring WebFlux           | `otel.instrumentation.spring-webflux.enabled`   | true         |
| Kafka                    | `otel.instrumentation.kafka.enabled`            | true         |
| MongoDB                  | `otel.instrumentation.mongo.enabled`            | true         |
| Micrometer               | `otel.instrumentation.micrometer.enabled`       | false        |
| R2DBC (リアクティブJDBC) | `otel.instrumentation.r2dbc.enabled`            | true         |

## 計装を選択的に有効化する {#turn-on-instrumentations-selectively}

特定の計装のみを使用するには、まず`otel.instrumentation.common.default-enabled`プロパティを`false`に設定してすべての計装をオフにします。
その後、計装を1つずつ有効にします。

たとえば、JDBC計装のみを有効にしたい場合は、`otel.instrumentation.jdbc.enabled`を`true`に設定します。

## 共通計装設定 {#common-instrumentation-configuration}

すべてのデータベース計装に共通のプロパティ。

| システムプロパティ                                           | 型      | デフォルト | 説明                                         |
| ------------------------------------------------------------ | ------- | ---------- | -------------------------------------------- |
| `otel.instrumentation.common.db-statement-sanitizer.enabled` | Boolean | true       | DBステートメントのサニタイズを有効にします。 |

## JDBC計装 {#jdbc-instrumentation}

| システムプロパティ                                      | 型      | デフォルト | 説明                                         |
| ------------------------------------------------------- | ------- | ---------- | -------------------------------------------- |
| `otel.instrumentation.jdbc.statement-sanitizer.enabled` | Boolean | true       | DBステートメントのサニタイズを有効にします。 |

## Logback {#logback}

システムプロパティで実験的機能を有効にして、属性をキャプチャできます。

| システムプロパティ                                                                     | 型      | デフォルト | 説明                                                                                                                                                                                               |
| -------------------------------------------------------------------------------------- | ------- | ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `otel.instrumentation.logback-appender.experimental-log-attributes`                    | Boolean | false      | 実験的なログ属性`thread.name`と`thread.id`のキャプチャを有効にします。                                                                                                                             |
| `otel.instrumentation.logback-appender.experimental.capture-code-attributes`           | Boolean | false      | [ソースコード属性][source code attributes]のキャプチャを有効にします。ログサイトでソースコード属性をキャプチャすると、パフォーマンスのオーバーヘッドが発生する可能性があることに注意してください。 |
| `otel.instrumentation.logback-appender.experimental.capture-marker-attribute`          | Boolean | false      | Logbackマーカーを属性としてキャプチャすることを有効にします。                                                                                                                                      |
| `otel.instrumentation.logback-appender.experimental.capture-key-value-pair-attributes` | Boolean | false      | Logbackキーバリューペアを属性としてキャプチャすることを有効にします。                                                                                                                              |
| `otel.instrumentation.logback-appender.experimental.capture-logger-context-attributes` | Boolean | false      | Logbackロガーコンテキストプロパティを属性としてキャプチャすることを有効にします。                                                                                                                  |
| `otel.instrumentation.logback-appender.experimental.capture-mdc-attributes`            | String  |            | キャプチャするMDC属性のカンマ区切りリスト。すべての属性をキャプチャするにはワイルドカード文字`*`を使用します。                                                                                     |

[source code attributes]: /docs/specs/semconv/general/attributes/#source-code-attributes

または、`logback.xml`または`logback-spring.xml`ファイルにOpenTelemetry Logbackアペンダーを追加することで、これらの機能を有効にできます。

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

## Spring Web自動設定 {#spring-web-autoconfiguration}

[opentelemetry-spring-web-3.1](https://github.com/open-telemetry/opentelemetry-java-instrumentation/tree/main/instrumentation/spring/spring-web/spring-web-3.1/library)で定義された`RestTemplate`トレースインターセプターの自動設定を提供します。
この自動設定は、`RestTemplate`ビーンポストプロセッサーを適用することで、Spring `RestTemplate`ビーンを使用して送信されるすべてのリクエストを計装します。
この機能はSpring Webバージョン3.1以降でサポートされています。
OpenTelemetry`RestTemplate`インターセプターの詳細については、[opentelemetry-spring-web-3.1](https://github.com/open-telemetry/opentelemetry-java-instrumentation/tree/main/instrumentation/spring/spring-web/spring-web-3.1/library)を参照してください。

以下の`RestTemplate`の作成方法がサポートされています。

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

以下の`RestClient`の作成方法がサポートされています。

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

Javaエージェントと同様に、以下のエンティティのキャプチャを設定できます。

- [HTTPリクエストおよびレスポンスヘッダー](/docs/zero-code/java/agent/instrumentation/http/#capturing-http-request-and-response-headers)
- [既知のHTTPメソッド](/docs/zero-code/java/agent/instrumentation/http/#configuring-known-http-methods)
- [実験的HTTPテレメトリ](/docs/zero-code/java/agent/instrumentation/http/#enabling-experimental-http-telemetry)

## Spring Web MVC自動設定 {#spring-web-mvc-autoconfiguration}

この機能は、アプリケーションコンテキストに[テレメトリ生成サーブレット`Filter`](https://github.com/open-telemetry/opentelemetry-java-instrumentation/blob/main/instrumentation/spring/spring-webmvc/spring-webmvc-5.3/library/src/main/java/io/opentelemetry/instrumentation/spring/webmvc/v5_3/WebMvcTelemetryProducingFilter.java)ビーンを追加することで、Spring WebMVCコントローラーの計装を自動設定します。
フィルターは、リクエストの実行をサーバースパンでデコレートし、HTTPリクエストで受信した場合は受信トレーシングコンテキストを伝搬します。
OpenTelemetry Spring WebMVC計装の詳細については、[opentelemetry-spring-webmvc-5.3計装ライブラリ](https://github.com/open-telemetry/opentelemetry-java-instrumentation/tree/main/instrumentation/spring/spring-webmvc/spring-webmvc-5.3/library)を参照してください。

Javaエージェントと同様に、以下のエンティティのキャプチャを設定できます。

- [HTTPリクエストおよびレスポンスヘッダー](/docs/zero-code/java/agent/instrumentation/http/#capturing-http-request-and-response-headers)
- [既知のHTTPメソッド](/docs/zero-code/java/agent/instrumentation/http/#configuring-known-http-methods)
- [実験的HTTPテレメトリ](/docs/zero-code/java/agent/instrumentation/http/#enabling-experimental-http-telemetry)

## Spring WebFlux自動設定 {#spring-webflux-autoconfiguration}

[opentelemetry-spring-webflux-5.3](https://github.com/open-telemetry/opentelemetry-java-instrumentation/tree/main/instrumentation/spring/spring-webflux/spring-webflux-5.3/library)で定義されたOpenTelemetry WebClient ExchangeFilterの自動設定を提供します。
この自動設定は、ビーンポストプロセッサーを適用することで、SpringのWebClientとWebClient Builderビーンを使用して送信されるすべての送信HTTPリクエストを計装します。
この機能は、Spring WebFluxバージョン5.0以降でサポートされています。詳細については、[opentelemetry-spring-webflux-5.3](https://github.com/open-telemetry/opentelemetry-java-instrumentation/tree/main/instrumentation/spring/spring-webflux/spring-webflux-5.3/library)を参照してください。

以下の`WebClient`の作成方法がサポートされています。

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

## Kafka計装 {#kafka-instrumentation}

Kafkaクライアント計装の自動設定を提供します。

| システムプロパティ                                        | 型      | デフォルト | 説明                                           |
| --------------------------------------------------------- | ------- | ---------- | ---------------------------------------------- |
| `otel.instrumentation.kafka.experimental-span-attributes` | Boolean | false      | 実験的なスパン属性のキャプチャを有効にします。 |

## Micrometer計装 {#micrometer-instrumentation}

MicrometerからOpenTelemetryへのブリッジの自動設定を提供します。

## MongoDB計装 {#mongodb-instrumentation}

MongoDBクライアント計装の自動設定を提供します。

| システムプロパティ                                       | 型      | デフォルト | 説明                                         |
| -------------------------------------------------------- | ------- | ---------- | -------------------------------------------- |
| `otel.instrumentation.mongo.statement-sanitizer.enabled` | Boolean | true       | DBステートメントのサニタイズを有効にします。 |

## R2DBC計装 {#r2dbc-instrumentation}

OpenTelemetry R2DBC計装の自動設定を提供します。

| システムプロパティ                                       | 型      | デフォルト | 説明                                         |
| -------------------------------------------------------- | ------- | ---------- | -------------------------------------------- |
| `otel.instrumentation.r2dbc.statement-sanitizer.enabled` | Boolean | true       | DBステートメントのサニタイズを有効にします。 |
