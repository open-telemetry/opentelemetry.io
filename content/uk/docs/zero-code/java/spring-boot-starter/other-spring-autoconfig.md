---
title: Інші автоконфігурації Spring
weight: 70
default_lang_commit: e05fefe6c9f7d8b159d9a9a95128098c646c78c4
cSpell:ignore: autoconfigurations
---

<!-- markdownlint-disable blanks-around-fences -->
<?code-excerpt path-base="examples/java/spring-starter"?>

Замість використання стартера OpenTelemetry Spring, ви можете використовувати стартер OpenTelemetry Zipkin.

## Стартер Zipkin {#zipkin-starter}

OpenTelemetry Zipkin Exporter Starter — це стартовий пакунок, який включає `opentelemetry-api`, `opentelemetry-sdk`, `opentelemetry-extension-annotations`, `opentelemetry-logging-exporter`, `opentelemetry-spring-boot-autoconfigurations` та стартери фреймворку spring, необхідні для налаштування розподіленого трасування. Він також надає артефакт [opentelemetry-exporters-zipkin](https://github.com/open-telemetry/opentelemetry-java/tree/main/exporters/zipkin) та відповідну автоконфігурацію експортера.

Якщо експортер присутній у classpath під час виконання і spring bean експортера відсутній у контексті застосунку spring, bean експортера ініціалізується та додається до простого процесора span в активному провайдері трасування. Для більш детальної інформації дивіться
[реалізацію (OpenTelemetryAutoConfiguration.java)](https://github.com/open-telemetry/opentelemetry-java-instrumentation/blob/main/instrumentation/spring/spring-boot-autoconfigure/src/main/java/io/opentelemetry/instrumentation/spring/autoconfigure/OpenTelemetryAutoConfiguration.java).

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

### Конфігурації {#configurations}

| Властивість                    | Стандартне значення | ConditionalOnClass   |
| ------------------------------ | ------------------- | -------------------- |
| `otel.exporter.zipkin.enabled` | true                | `ZipkinSpanExporter` |
