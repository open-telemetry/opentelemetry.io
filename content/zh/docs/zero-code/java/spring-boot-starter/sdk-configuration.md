---
title: SDK 配置
default_lang_commit: 1e69c8f94a605ce5624c6b6657080d98f633ac7b
weight: 30
cSpell:ignore: customizer distro
---

<!-- markdownlint-disable blanks-around-fences -->
<?code-excerpt path-base="examples/java/spring-starter"?>

此 Spring 启动器支持[配置元数据](https://docs.spring.io/spring-boot/docs/current/reference/html/configuration-metadata.html)，
这意味着您可以在 IDE 中查看和自动完成所有可用属性。

## 通用配置 {#general-configuration}

OpenTelemetry 启动器支持所有的 [SDK 自动配置](/docs/zero-code/java/agent/configuration/#sdk-configuration)（自 2.2.0 版本起）。

你可以在 `application.properties` 或 `application.yaml` 文件中通过属性来更新配置，也可以通过环境变量进行配置。

`application.properties` 示例：

```properties
otel.propagators=tracecontext,b3
otel.resource.attributes.deployment.environment=dev
otel.resource.attributes.service.name=cart
otel.resource.attributes.service.namespace=shop
```

`application.yaml` 示例：

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

环境变量示例：

```shell
export OTEL_PROPAGATORS="tracecontext,b3"
export OTEL_RESOURCE_ATTRIBUTES="deployment.environment=dev,service.name=cart,service.namespace=shop"
```

## 覆盖资源属性 {#overriding-resource-attributes}

如同在 Spring Boot 中一样，您可以使用环境变量覆盖 `application.properties` 和 `application.yaml` 文件中的属性。

例如，您可以通过设置标准的 `OTEL_RESOURCE_ATTRIBUTES` 环境变量来配置或覆盖 `deployment.environment` 资源属性。

```shell
export OTEL_RESOURCE_ATTRIBUTES="deployment.environment=prod"
```

或者，你可以使用 `OTEL_RESOURCE_ATTRIBUTES_DEPLOYMENT_ENVIRONMENT` 这个环境变量，
来设置或覆盖单个资源属性：

```shell
export OTEL_RESOURCE_ATTRIBUTES_DEPLOYMENT_ENVIRONMENT="prod"
```

第二个选项支持 [SpEL](https://docs.spring.io/spring-framework/docs/3.2.x/spring-framework-reference/html/expressions.html) 表达式。

请注意，`DEPLOYMENT_ENVIRONMENT` 会被 Spring Boot 的[宽松绑定](https://docs.spring.io/spring-boot/docs/current/reference/html/features.html#features.external-config.typesafe-configuration-properties.relaxed-binding.environment-variables)转换为 `deployment.environment`。

## 禁用 OpenTelemetry 启动器 {#disable-the-opentelemetry-starter}

{{% config_option name="otel.sdk.disabled" %}}

将值设置为 `true` 以禁用启动器，例如用于测试目的。

{{% /config_option %}}

## 编程式配置 {#programmatic-configuration}

你可以使用 `AutoConfigurationCustomizerProvider` 进行编程式配置。
对于无法通过配置属性实现的高级用例，建议使用编程方式进行配置。

### 从追踪中排除 Actuator 端点 {#exclude-actuator-endpoints-from-tracing}

例如，你可以自定义采样器，将健康检查端点从追踪中排除：

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

### 编程式配置导出器 {#configure-the-exporter-programmatically}

你还可以通过编程方式配置 OTLP 导出器。
此配置替换了默认的 OTLP 导出器，并向请求添加了自定义标头。

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
    // 例如，从 kubernetes 密钥中读取令牌
    return "token";
  }
}
```
<!-- prettier-ignore-end -->

## 资源提供器 {#resource-providers}

OpenTelemetry 启动器包含与 Java 代理相同的资源提供器：

- [通用资源提供器](https://github.com/open-telemetry/opentelemetry-java-instrumentation/tree/main/instrumentation/resources/library)
- [默认禁用的资源提供器](/docs/zero-code/java/agent/configuration/#enable-resource-providers-that-are-disabled-by-default)

此外，OpenTelemetry 启动器还包括以下特定于 Spring Boot 的资源提供器：

### 分发资源启动器 {#distribution-resource-provider}

FQN（完全限定名） :
`io.opentelemetry.instrumentation.spring.autoconfigure.resources.DistroVersionResourceProvider`

| 属性                       | 值                                  |
| -------------------------- | ----------------------------------- |
| `telemetry.distro.name`    | `opentelemetry-spring-boot-starter` |
| `telemetry.distro.version` | 启动器版本                          |

### Spring 资源启动器 {#spring-resource-provider}

FQN（完全限定名）:
`io.opentelemetry.instrumentation.spring.autoconfigure.resources.SpringResourceProvider`

| 属性              | 值                                                                                                       |
| ----------------- | -------------------------------------------------------------------------------------------------------- |
| `service.name`    | `spring.application.name` 或 `build.name` 来自 `build-info.properties` (请参阅[服务名称](#service-name)) |
| `service.version` | `build.version` 来自 `build-info.properties`                                                             |

## 服务名称 {#service-name}

使用这些资源提供器，服务名称由以下优先级规则确定，
符合 OpenTelemetry 的[规范](/docs/languages/sdk-configuration/general/#otel_service_name)：

1. `otel.service.name` Spring 属性或 `OTEL_SERVICE_NAME` 环境变量（优先级最高）
2. `service.name` 可配置于 `otel.resource.attributes` 系统属性、Spring 属性或 `OTEL_RESOURCE_ATTRIBUTES` 环境变量
3. `spring.application.name` Spring 属性
4. `build-info.properties`
5. 来自 META-INF、MANIFEST.MF 的 `Implementation-Title`
6. 默认值为 `unknown_service:java`（优先级最低）

在你的 pom.xml 文件中使用以下代码段来生成 `build-info.properties` 文件：

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
