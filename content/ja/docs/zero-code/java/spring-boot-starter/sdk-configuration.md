---
title: SDK 設定
weight: 30
default_lang_commit: 60d50174e01d221f65af4b69ad1ae946fbc16ec8
cSpell:ignore: distro
---

<!-- markdownlint-disable blanks-around-fences -->
<?code-excerpt path-base="examples/java/spring-starter"?>

この Spring スターターは[設定メタデータ](https://docs.spring.io/spring-boot/docs/current/reference/html/configuration-metadata.html)をサポートしており、IDE で利用可能なすべてのプロパティを確認・自動補完できます。

## 一般的な設定 {#general-configuration}

OpenTelemetry スターターは、すべての [SDK 自動設定](/docs/zero-code/java/agent/configuration/#sdk-configuration)をサポートしています（2.2.0 以降）。

`application.properties` ファイルや `application.yaml` ファイルのプロパティ、または環境変数を使用して設定を更新できます。

{{< tabpane text=true >}} {{% tab "プロパティ" %}}

`application.yaml` の例：

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

環境変数の例：

```shell
export OTEL_PROPAGATORS="tracecontext,b3"
export OTEL_RESOURCE_ATTRIBUTES="deployment.environment=dev,service.name=cart,service.namespace=shop"
```

{{% /tab %}} {{% tab "宣言的設定" %}}

SDK レベルの設定（リソース、プロパゲーター、エクスポーター）は、`application.yaml` 内で標準の[宣言的設定スキーマ](/docs/languages/sdk-configuration/declarative-configuration/)を直接使用します。
システムプロパティや環境変数でも値をオーバーライドできます。
[環境変数によるオーバーライド](../declarative-configuration/#environment-variable-overrides)を参照してください。

```yaml
otel:
  file_format: '1.0'

  resource:
    attributes:
      - name: deployment.environment
        value: dev
      - name: service.name
        value: cart
      - name: service.namespace
        value: shop

  propagator:
    composite:
      - tracecontext:
      - b3:
```

{{% /tab %}} {{< /tabpane >}}

## リソース属性のオーバーライド {#overriding-resource-attributes}

Spring Boot では通常どおり、`application.properties` ファイルや `application.yaml` ファイルのプロパティを環境変数でオーバーライドできます。

たとえば、標準の `OTEL_RESOURCE_ATTRIBUTES` 環境変数を設定することで、リソース属性 `deployment.environment` を設定またはオーバーライドできます（`service.name` や `service.namespace` は変更しません）。

```shell
export OTEL_RESOURCE_ATTRIBUTES="deployment.environment=prod"
```

また、`OTEL_RESOURCE_ATTRIBUTES_DEPLOYMENT_ENVIRONMENT` 環境変数を使用して、単一のリソース属性を設定またはオーバーライドすることもできます。

```shell
export OTEL_RESOURCE_ATTRIBUTES_DEPLOYMENT_ENVIRONMENT="prod"
```

2番目のオプションは [SpEL](https://docs.spring.io/spring-framework/docs/3.2.x/spring-framework-reference/html/expressions.html) 式をサポートしています。

`DEPLOYMENT_ENVIRONMENT` は、Spring Boot の [Relaxed Binding](https://docs.spring.io/spring-boot/docs/current/reference/html/features.html#features.external-config.typesafe-configuration-properties.relaxed-binding.environment-variables) によって `deployment.environment` に変換されることに注意してください。

## OpenTelemetry スターターの無効化 {#disable-the-opentelemetry-starter}

{{< tabpane text=true >}} {{% tab "プロパティ" %}}

テスト目的などでスターターを無効にするには、`otel.sdk.disabled` を `true` に設定します。

```yaml
otel:
  sdk:
    disabled: true
```

{{% /tab %}} {{% tab "宣言的設定" %}}

テスト目的などでスターターを無効にするには、`otel.disabled` を `true` に設定します。

注意：[宣言的設定](../declarative-configuration/)では、プロパティ名は `otel.sdk.disabled` ではなく `otel.disabled` です。

```yaml
otel:
  file_format: '1.0'
  disabled: true
```

{{% /tab %}} {{< /tabpane >}}

## プログラムによる設定 {#programmatic-configuration}

[プログラムによる設定](../programmatic-configuration/)を参照してください。

## リソースプロバイダー {#resource-providers}

{{< tabpane text=true >}} {{% tab "プロパティ" %}}

OpenTelemetry スターターには、Java エージェントと同じリソースプロバイダーが含まれています。

- [共通リソースプロバイダー](https://github.com/open-telemetry/opentelemetry-java-instrumentation/tree/main/instrumentation/resources/library)
- [デフォルトで無効になっているリソースプロバイダー](/docs/zero-code/java/agent/configuration/#enable-resource-providers-that-are-disabled-by-default)

さらに、OpenTelemetry スターターには以下の Spring Boot 固有のリソースプロバイダーが含まれています。

### ディストリビューションリソースプロバイダー {#distribution-resource-provider}

FQN:
`io.opentelemetry.instrumentation.spring.autoconfigure.resources.DistroVersionResourceProvider`

| 属性                       | 値                                  |
| -------------------------- | ----------------------------------- |
| `telemetry.distro.name`    | `opentelemetry-spring-boot-starter` |
| `telemetry.distro.version` | スターターのバージョン              |

### Spring リソースプロバイダー {#spring-resource-provider}

FQN:
`io.opentelemetry.instrumentation.spring.autoconfigure.resources.SpringResourceProvider`

| 属性              | 値                                                                                                            |
| ----------------- | ------------------------------------------------------------------------------------------------------------- |
| `service.name`    | `spring.application.name` または `build-info.properties` の `build.name`（[サービス名](#service-name)を参照） |
| `service.version` | `build-info.properties` の `build.version`                                                                    |

{{% /tab %}} {{% tab "宣言的設定" %}}

[宣言的設定](../declarative-configuration/)では、リソースプロバイダーは `resource.detection/development.detectors` 配下のディテクターとして明示的に設定します。
リストに含まれたディテクターのみが有効になり、SPI による自動検出は行われません。

```yaml
otel:
  resource:
    detection/development:
      detectors:
        - container: # container.id
        - host: # host.name, host.arch
        - host_id: # host.id
        - os: # os.type, os.description
        - process: # process.pid, process.executable.path, process.command_line
        - process_runtime: # process.runtime.name/version/description
        - service: # service.name, service.instance.id
        - spring: # service.name (from spring.application.name), service.version (from build-info)
```

属性 `telemetry.distro.name` と `telemetry.distro.version` は、トラブルシューティングのためにスターターによって常に自動的に追加されます。

{{% /tab %}} {{< /tabpane >}}

## サービス名 {#service-name}

これらのリソースプロバイダーを使用した場合、サービス名は OpenTelemetry の[仕様](/docs/languages/sdk-configuration/general/#otel_service_name)に従い、以下の優先順位ルールで決定されます。

{{< tabpane text=true >}} {{% tab "プロパティ" %}}

1. `otel.service.name` Spring プロパティまたは `OTEL_SERVICE_NAME` 環境変数（最も優先度が高い）
2. `otel.resource.attributes` システム/Spring プロパティまたは `OTEL_RESOURCE_ATTRIBUTES` 環境変数の `service.name`
3. `spring.application.name` Spring プロパティ
4. `build-info.properties`
5. META-INF/MANIFEST.MF の `Implementation-Title`
6. デフォルト値は `unknown_service:java`（最も優先度が低い）

{{% /tab %}} {{% tab "宣言的設定" %}}

サービス名は、含めるリソースディテクターによって決まります（[リソースプロバイダー](#resource-providers)を参照）。

1. `otel.resource.attributes` の `service.name`（最も優先度が高い）：

   ```yaml
   otel:
     resource:
       attributes:
         - name: service.name
           value: my-spring-app
   ```

2. `service` ディテクター — 含まれている場合、`OTEL_SERVICE_NAME` から自動検出します：

   ```yaml
   otel:
     resource:
       detection/development:
         detectors:
           - service:
   ```

3. `spring` ディテクター — 含まれている場合、`spring.application.name` と `build-info.properties` から検出します：

   ```yaml
   otel:
     resource:
       detection/development:
         detectors:
           - spring:
   ```

4. デフォルト値は `unknown_service:java`（最も優先度が低い）

{{% /tab %}} {{< /tabpane >}}

`build-info.properties` ファイルを生成するには、pom.xml ファイルで以下のスニペットを使用してください。

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
