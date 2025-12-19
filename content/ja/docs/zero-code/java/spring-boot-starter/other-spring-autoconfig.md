---
title: その他のSpring自動設定
weight: 70
default_lang_commit: 276d7eb3f936deef6487cdd2b1d89822951da6c8
cSpell:ignore: autoconfigurations
---

<!-- markdownlint-disable blanks-around-fences -->
<?code-excerpt path-base="examples/java/spring-starter"?>

OpenTelemetry Spring スターターを使用するかわりに、OpenTelemetry Zipkin スターターを使用することもできます。

## Zipkin スターター {#zipkin-starter}

OpenTelemetry Zipkin Exporter スターターは、分散トレーシングの設定に必要な `opentelemetry-api`、`opentelemetry-sdk`、`opentelemetry-extension-annotations`、`opentelemetry-logging-exporter`、`opentelemetry-spring-boot-autoconfigurations` および Spring フレームワークスターターを含むスターターパッケージです。
また、[opentelemetry-exporters-zipkin](https://github.com/open-telemetry/opentelemetry-java/tree/main/exporters/zipkin)アーティファクトと対応するエクスポーター自動設定も提供します。

実行時にクラスパスにエクスポーターが存在し、Spring アプリケーションコンテキストにエクスポーターの Spring Bean が存在しない場合、エクスポーター Bean が初期化され、アクティブなトレーサープロバイダー内のシンプルスパンプロセッサーに追加されます。
詳細については、[実装 (OpenTelemetryAutoConfiguration.java)](https://github.com/open-telemetry/opentelemetry-java-instrumentation/blob/main/instrumentation/spring/spring-boot-autoconfigure/src/main/java/io/opentelemetry/instrumentation/spring/autoconfigure/OpenTelemetryAutoConfiguration.java)を参照してください。

{{< tabpane text=true >}} {{% tab header="Maven (`pom.xml`)" lang=Maven %}}

```xml
<dependencies>
  <dependency>
    <groupId>io.opentelemetry</groupId>
    <artifactId>opentelemetry-exporter-zipkin</artifactId>
    <version>{{% param vers.otel %}}</version>
  </dependency>
</dependencies>
```

{{% /tab %}} {{% tab header="Gradle (`build.gradle`)" lang=Gradle %}}

```kotlin
dependencies {
  implementation("io.opentelemetry:opentelemetry-exporter-zipkin:{{% param vers.otel %}}")
}
```

{{% /tab %}} {{< /tabpane>}}

### 設定 {#configurations}

| プロパティ                     | デフォルト値 | ConditionalOnClass   |
| ------------------------------ | ------------ | -------------------- |
| `otel.exporter.zipkin.enabled` | true         | `ZipkinSpanExporter` |
