---
title: はじめに
weight: 20
default_lang_commit: 276d7eb3f936deef6487cdd2b1d89822951da6c8 # patched
drifted_from_default: true
cSpell:ignore: springboot
---

{{% alert title="注意" %}}

Spring Bootアプリケーションを計装するために、[Javaエージェント](../../agent)を使用することもできます。
長所と短所については、[Javaゼロコード計装](..)を参照してください。

{{% /alert %}}

## 互換性 {#compatibility}

OpenTelemetry Spring Bootスターターは、Spring Boot 2.6+および3.1+、そしてSpring Bootネイティブイメージアプリケーションで動作します。
[opentelemetry-java-examples/spring-native](https://github.com/open-telemetry/opentelemetry-java-examples/tree/main/spring-native)リポジトリには、OpenTelemetry Spring Bootスターターを使用して計装されたSpring Bootネイティブイメージアプリケーションの例が含まれています。

## 依存関係の管理 {#dependency-management}

Bill of Material（[BOM](https://maven.apache.org/guides/introduction/introduction-to-dependency-mechanism.html#bill-of-materials-bom-poms)）は、依存関係（推移的なものを含む）のバージョンが整合していることを保証します。

OpenTelemetryスターターを使用する際は、すべてのOpenTelemetry依存関係のバージョン整合性を確保するために、`opentelemetry-instrumentation-bom` BOMをインポートする必要があります。

{{% alert title="注意" %}}

Mavenを使用する場合は、プロジェクト内の他のBOMよりも前にOpenTelemetry BOMをインポートしてください。
たとえば、`spring-boot-dependencies` BOMをインポートする場合は、OpenTelemetry BOMの後に宣言する必要があります。

Gradleは依存関係の[最新バージョン](https://docs.gradle.org/current/userguide/dependency_resolution.html#2_perform_conflict_resolution)を選択するため、BOMの順序は重要ではありません。

{{% /alert %}}

以下の例は、Mavenを使用してOpenTelemetry BOMをインポートする方法を示しています。

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

GradleとSpring Bootでは、BOMをインポートする方法が2つあります。

GradleのネイティブなBOMサポートを使用して`dependencies`を追加できます。

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

Gradleでのもう一つの方法は、`io.spring.dependency-management`プラグインを使用し、`dependencyManagement`でBOMをインポートすることです。

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

Gradleで異なる設定方法を混在させないよう注意してください。
たとえば、`io.spring.dependency-management`プラグインと一緒に`implementation(platform("io.opentelemetry.instrumentation:opentelemetry-instrumentation-bom:{{% param vers.instrumentation %}}"))`を使用しないでください。

{{% /alert %}}

### OpenTelemetryスターターの依存関係 {#opentelemetry-starter-dependency}

OpenTelemetryスターターを有効にするには、以下の依存関係を追加します。

OpenTelemetryスターターは、OpenTelemetry Spring Boot[自動構成](https://docs.spring.io/spring-boot/reference/using/auto-configuration.html)を使用します。

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
