---
title: SDK設定
weight: 30
default_lang_commit: 276d7eb3f936deef6487cdd2b1d89822951da6c8
cSpell:ignore: customizer distro
---

<!-- markdownlint-disable blanks-around-fences -->
<?code-excerpt path-base="examples/java/spring-starter"?>

このSpringスターターは[設定メタデータ](https://docs.spring.io/spring-boot/docs/current/reference/html/configuration-metadata.html)をサポートしています。
これにより、IDEで利用可能なすべてのプロパティを確認し、自動補完することができます。

## 一般設定 {#general-configuration}

OpenTelemetryスターターは、すべての[SDK自動設定](/docs/zero-code/java/agent/configuration/#sdk-configuration)をサポートしています（2.2.0以降）。

設定は、`application.properties`または`application.yaml`ファイルのプロパティ、もしくは環境変数で更新できます。

以下は、`application.properties`の例です。

```properties
otel.propagators=tracecontext,b3
otel.resource.attributes.deployment.environment=dev
otel.resource.attributes.service.name=cart
otel.resource.attributes.service.namespace=shop
```

以下は、`application.yaml`の例です。

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

以下は、環境変数の例です。

```shell
export OTEL_PROPAGATORS="tracecontext,b3"
export OTEL_RESOURCE_ATTRIBUTES="deployment.environment=dev,service.name=cart,service.namespace=shop"
```

## リソース属性のオーバーライド {#overriding-resource-attributes}

Spring Bootでは通常通り、`application.properties`および`application.yaml`ファイルのプロパティを環境変数でオーバーライドできます。

たとえば、標準の`OTEL_RESOURCE_ATTRIBUTES`環境変数を設定することで、`deployment.environment`リソース属性を設定またはオーバーライドできます（`service.name`や`service.namespace`は変更しません）。

```shell
export OTEL_RESOURCE_ATTRIBUTES="deployment.environment=prod"
```

あるいは、`OTEL_RESOURCE_ATTRIBUTES_DEPLOYMENT_ENVIRONMENT`環境変数を使用して、単一のリソース属性を設定またはオーバーライドできます。

```shell
export OTEL_RESOURCE_ATTRIBUTES_DEPLOYMENT_ENVIRONMENT="prod"
```

2番目のオプションは[SpEL](https://docs.spring.io/spring-framework/docs/3.2.x/spring-framework-reference/html/expressions.html)式をサポートしています。

`DEPLOYMENT_ENVIRONMENT`は、Spring Bootの[Relaxed Binding](https://docs.spring.io/spring-boot/docs/current/reference/html/features.html#features.external-config.typesafe-configuration-properties.relaxed-binding.environment-variables)により`deployment.environment`に変換されることに注意してください。

## OpenTelemetryスターターを無効化 {#disable-the-opentelemetry-starter}

{{% config_option name="otel.sdk.disabled" %}}

テスト目的などで、スターターを無効にするには値を`true`に設定します。

{{% /config_option %}}

## プログラムによる設定 {#programmatic-configuration}

高度なユースケースのために、`AutoConfigurationCustomizerProvider`を使用してプログラムによる設定が可能です。
プロパティでは設定できない高度なユースケースには、プログラムによる設定が推奨されます。

### アクチュエーターエンドポイントをトレーシングから除外 {#exclude-actuator-endpoints-from-tracing}

例として、ヘルスチェックエンドポイントをトレーシングから除外するようにサンプラーをカスタマイズできます。

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

### エクスポーターをプログラムで設定 {#configure-the-exporter-programmatically}

OTLPエクスポーターをプログラムで設定することもできます。
この設定はデフォルトのOTLPエクスポーターを置き換え、リクエストにカスタムヘッダーを追加します。

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
    // 例：kubernetesシークレットからトークンを読み取る
    return "token";
  }
}
```
<!-- prettier-ignore-end -->

## リソースプロバイダー {#resource-providers}

OpenTelemetryスターターには、Javaエージェントと同じリソースプロバイダーが含まれています。

- [共通リソースプロバイダー](https://github.com/open-telemetry/opentelemetry-java-instrumentation/tree/main/instrumentation/resources/library)
- [デフォルトで無効になっているリソースプロバイダー](/docs/zero-code/java/agent/configuration/#enable-resource-providers-that-are-disabled-by-default)

さらに、OpenTelemetryスターターには次のSpring Boot固有のリソースプロバイダーが含まれています。

### ディストリビューションリソースプロバイダー {#distribution-resource-provider}

FQN： `io.opentelemetry.instrumentation.spring.autoconfigure.resources.DistroVersionResourceProvider`

| 属性                       | 値                                  |
| -------------------------- | ----------------------------------- |
| `telemetry.distro.name`    | `opentelemetry-spring-boot-starter` |
| `telemetry.distro.version` | スターターのバージョン              |

### Springリソースプロバイダー {#spring-resource-provider}

FQN： `io.opentelemetry.instrumentation.spring.autoconfigure.resources.SpringResourceProvider`

| 属性              | 値                                                                                                        |
| ----------------- | --------------------------------------------------------------------------------------------------------- |
| `service.name`    | `spring.application.name`または`build-info.properties`の`build.name`（[サービス名](#service-name)を参照） |
| `service.version` | `build-info.properties`の`build.version`                                                                  |

## サービス名 {#service-name}

これらのリソースプロバイダーを使用して、サービス名はOpenTelemetry[仕様](/docs/languages/sdk-configuration/general/#otel_service_name)に従って、次の優先順位ルールによって決定されます。

1. `otel.service.name` Springプロパティまたは`OTEL_SERVICE_NAME`環境変数（最高優先度）
2. `otel.resource.attributes`システム/Springプロパティの`service.name`または`OTEL_RESOURCE_ATTRIBUTES`環境変数
3. `spring.application.name` Springプロパティ
4. `build-info.properties`
5. META-INF/MANIFEST.MFの`Implementation-Title`
6. デフォルト値は`unknown_service:java`（最低優先度）

`build-info.properties`ファイルを生成するには、pom.xmlファイルで次のスニペットを使用してください。

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
