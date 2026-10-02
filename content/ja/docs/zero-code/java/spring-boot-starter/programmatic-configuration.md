---
title: プログラムによる設定
weight: 35
vers:
  contrib: 1.54.0
default_lang_commit: 60d50174e01d221f65af4b69ad1ae946fbc16ec8
cSpell:ignore: customizer fileconfig
---

<?code-excerpt path-base="examples/java/spring-starter"?>

プログラムによる設定には `AutoConfigurationCustomizerProvider` を使用できます。
プログラムによる設定は、プロパティでは設定できない高度なユースケースに推奨されます。

> [!WARNING]
>
> `AutoConfigurationCustomizerProvider` は[宣言的設定](../declarative-configuration/)では動作しません。
> 宣言的設定では、代わりに `DeclarativeConfigurationCustomizerProvider` を使用してください。
> 詳細と例については、[エージェントの Extension API セクション](/docs/zero-code/java/agent/declarative-configuration/)を参照してください。

## アクチュエーターエンドポイントをトレースから除外する {#exclude-actuator-endpoints-from-tracing}

例として、ヘルスチェックエンドポイントをトレースから除外するようにサンプラーをカスタマイズできます。

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

## エクスポーターをプログラムで設定する {#configure-the-exporter-programmatically}

OTLP エクスポーターをプログラムで設定することもできます。
この設定はデフォルトの OTLP エクスポーターを置き換え、リクエストにカスタムヘッダーを追加します。

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
    // 例: Kubernetes シークレットからトークンを読み取る
    return "token";
  }
}
```

## 計装設定をプログラムで読み取る {#read-instrumentation-configuration-programmatically}

> [!NOTE]
>
> OpenTelemetry Spring Boot スターターバージョン 2.30.0 以降が必要です。

計装モジュールは、`application.properties` / `application.yaml` で設定した場合でも、[宣言的設定](../declarative-configuration/)で設定した場合でも、`ConfigProvider` Bean を通じて設定を読み取ります。
自分のコードから計装設定の値を読み取る必要がある場合は、`ConfigProvider` Bean を直接オートワイヤーしてください。

宣言的設定が有効な場合、`otelProperties`（`ConfigProperties`）Bean は互換性ブリッジとしてのみ提供されます。
これは非推奨であり、3.0 で削除される予定です。
かわりに `ConfigProvider` を使用してください。

<?code-excerpt path-base="content-modules/opentelemetry-java-examples/spring-declarative-configuration"?>

<?code-excerpt "src/main/java/io/opentelemetry/examples/fileconfig/ReadInstrumentationConfig.java" from="package"?>

```java
package io.opentelemetry.examples.fileconfig;

import io.opentelemetry.api.incubator.config.ConfigProvider;
import io.opentelemetry.api.incubator.config.DeclarativeConfigProperties;
import org.springframework.stereotype.Component;

/** アプリケーションコードから計装設定を読み取る例。 */
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

`getInstrumentationConfig()` 配下のキーは、値を `otel.instrumentation.*` プロパティで設定した場合でも、宣言的 YAML で設定した場合でも、[宣言的設定](../declarative-configuration/#instrumentation-configuration)で使用されるのと同じ `instrumentation/development.java.*` 構造に従います。
プロパティ名がこの構造にどのようにマッピングされるかは、[マッピングテーブル](../declarative-configuration/#instrumentation-configuration)を参照してください。
