---
title: Інші автоконфігурації Spring
weight: 70
default_lang_commit: 311e7819e9eacf9d8b6d250bbdee98c018ea232e
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

{{% /tab %}} {{< /tabpane >}}

{{< tabpane text=true >}} {{% tab "Властивості" %}}

Вмикає експортер Zipkin (потребує `ZipkinSpanExporter` у classpath):

```yaml
otel:
  exporter:
    zipkin:
      enabled: true # стандартно: true
```

{{% /tab %}} {{% tab "Декларативна конфігурація" %}}

З [декларативною конфігурацією](../declarative-configuration/), експортер Zipkin налаштовується як частина стандартної [схеми декларативної конфігурації](/docs/languages/sdk-configuration/declarative-configuration/) в `tracer_provider.processors`:

```yaml
otel:
  tracer_provider:
    processors:
      - batch:
          exporter:
            zipkin:
              endpoint: http://localhost:9411/api/v2/spans
```

{{% /tab %}} {{< /tabpane >}}
