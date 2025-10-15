---
title: 快速开始
default_lang_commit: f49ec57e5a0ec766b07c7c8e8974c83531620af3
weight: 20
cSpell:ignore: springboot
---

{{% alert title="Note" %}}

你也可以使用 [Java 代理](../../agent)为你的 Spring Boot 应用程序配置插桩。
有关优缺点，请参见 [Java 零代码插桩](..).

{{% /alert %}}

## 兼容性 {#compatibility}

OpenTelemetry Spring Boot 启动器适用于 Spring Boot 2.6+ 和 3.1+ 版本，以及 Spring Boot Native image 应用程序。
[opentelemetry-java-examples/spring-native](https://github.com/open-telemetry/opentelemetry-java-examples/tree/main/spring-native)仓库包含了一个使用 OpenTelemetry Spring Boot 启动器配置插桩的 Spring Boot Native image 应用程序的示例。

## 依赖管理 {#dependency-management}

物料清单（[BOM](https://maven.apache.org/guides/introduction/introduction-to-dependency-mechanism.html#bill-of-materials-bom-poms)） 确保依赖（含传递性依赖）版本一致性

{{% alert title="注意" %}}

使用 Maven 时，请在项目中的任何其他 BOM 之前导入 OpenTelemetry BOM。
例如，如果您导入 `spring-boot-dependencies` BOM，则必须在 OpenTelemetry BOM 之后声明它。

使用 Gradle 时，当存在多个 BOM（物料清单）时，对于同一依赖，Gradle 会选择[最新版本](https://docs.gradle.org/current/userguide/dependency_resolution.html#2_perform_conflict_resolution)，因此 BOM 的声明顺序并不重要。

{{% /alert %}}

下面的示例展示了如何使用 Maven 导入 OpenTelemetry BOM:

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

使用 Gradle 和 Spring Boot 时，有两种方式可以导入 BOM。

你可以通过在 `dependencies` 中添加 BOM 来使用 Gradle 的原生 BOM 支持：

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

使用 Gradle 时，另一种方式是使用 `io.spring.dependency-management` 插件并在 `dependencyManagement` 中导入 BOM：

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

{{% alert title="注意" %}}

在使用 Gradle 进行配置时，请注意不要混淆不同的配置方式。
例如，不要在 `dependencies` 中使用 `implementation(platform("io.opentelemetry.instrumentation:opentelemetry-instrumentation-bom:{{% param vers.instrumentation %}}"))` 与 `io.spring.dependency-management` 插件。

{{% /alert %}}

### OpenTelemetry 启动器依赖 {#opentelemetry-starter-dependency}

添加以下依赖以启用 OpenTelemetry 启动器。

OpenTelemetry 启动器使用 OpenTelemetry Spring Boot 的[自动配置](https://docs.spring.io/spring-boot/reference/using/auto-configuration.html)。

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
