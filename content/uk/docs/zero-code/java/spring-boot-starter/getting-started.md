---
title: Початок роботи
weight: 20
default_lang_commit: 5489ba34bff91356aa2c501cd55f07eeb30cc355
cSpell:ignore: springboot
---

> [!NOTE]
>
> Ви також можете використовувати [Java агент](../../agent) для інструментування вашого Spring Boot застосунку. Для переваг та недоліків дивіться [інструментування Java без коду](..).

## Сумісність {#compatibility}

Завантажувач OpenTelemetry Spring Boot працює з Spring Boot 2.6+ та 3.1+, а також з нативними застосунками-образами Spring Boot. Репозиторій [opentelemetry-java-examples/spring-native](https://github.com/open-telemetry/opentelemetry-java-examples/tree/main/spring-native) містить приклад застосунку з нативним образом Spring Boot, інструментованого за допомогою OpenTelemetry Spring Boot стартера.

## Управління залежностями {#dependency-management}

Bill of Material ([BOM](https://maven.apache.org/guides/introduction/introduction-to-dependency-mechanism.html#bill-of-materials-bom-poms)) гарантує, що версії залежностей (включаючи транзитивні) узгоджені.

Щоб забезпечити узгодження версій усіх залежностей OpenTelemetry, ви повинні імпортувати BOM `opentelemetry-instrumentation-bom` при використанні OpenTelemetry стартера.

> [!NOTE]
>
> При використанні Maven, імпортуйте BOM OpenTelemetry перед будь-якими іншими BOM у вашому проєкті. Наприклад, якщо ви імпортуєте BOM `spring-boot-dependencies`, ви повинні оголосити його після BOM OpenTelemetry.
>
> Gradle вибирає [останні версії](https://docs.gradle.org/current/userguide/dependency_resolution.html#2_perform_conflict_resolution) залежностей при використанні декількох BOM, тому порядок BOM не важливий.

Наступний приклад показує, як імпортувати BOM OpenTelemetry за допомогою Maven:

```xml
<dependencyManagement>
    <dependencies>
        <dependency>
            <groupId>io.opentelemetry.instrumentation</groupId>
            <artifactId>opentelemetry-instrumentation-bom</artifactId>
            <version>{{% param vers.instrumentation %}}</version>
            <type>pom</type>
            <scope>import</scope>
        </dependency>
    </dependencies>
</dependencyManagement>
```

З Gradle та Spring Boot, ви маєте два способи імпортувати BOM.

Ви можете використовувати нативну підтримку BOM Gradle, додавши `dependencies`:

```kotlin
import org.springframework.boot.gradle.plugin.SpringBootPlugin

plugins {
  id("java")
  id("org.springframework.boot") version "3.2.O"
}

dependencies {
  implementation(platform(SpringBootPlugin.BOM_COORDINATES))
  implementation(platform("io.opentelemetry.instrumentation:opentelemetry-instrumentation-bom:{{% param vers.instrumentation %}}"))
}
```

Інший спосіб з Gradle — використовувати втулок `io.spring.dependency-management` та імпортувати BOM у `dependencyManagement`:

```kotlin
plugins {
  id("java")
  id("org.springframework.boot") version "3.2.O"
  id("io.spring.dependency-management") version "1.1.0"
}

dependencyManagement {
  imports {
    mavenBom("io.opentelemetry.instrumentation:opentelemetry-instrumentation-bom:{{% param vers.instrumentation %}}")
  }
}
```

> [!NOTE]
>
> Будьте обережні, щоб не змішувати різні способи конфігурації з Gradle. Наприклад, не використовуйте `implementation(platform("io.opentelemetry.instrumentation:opentelemetry-instrumentation-bom:{{% param vers.instrumentation %}}"))` з втулком `io.spring.dependency-management`.

### Залежність OpenTelemetry Starter {#opentelemetry-starter-dependency}

Додайте залежність, наведену нижче, щоб увімкнути OpenTelemetry стартер.

OpenTelemetry стартер використовує OpenTelemetry Spring Boot [автоконфігурацію](https://docs.spring.io/spring-boot/reference/using/auto-configuration.html).

{{< tabpane text=true >}} {{% tab header="Maven (`pom.xml`)" lang=Maven %}}

```xml
<dependency>
    <groupId>io.opentelemetry.instrumentation</groupId>
    <artifactId>opentelemetry-spring-boot-starter</artifactId>
</dependency>
```

{{% /tab %}} {{% tab header="Gradle (`build.gradle`)" lang=Gradle %}}

```kotlin
implementation("io.opentelemetry.instrumentation:opentelemetry-spring-boot-starter")
```

{{% /tab %}} {{< /tabpane>}}
