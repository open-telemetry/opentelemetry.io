---
title: OpenTelemetry Java 介绍
description: OpenTelemetry Java 生态系统介绍
default_lang_commit: 5472965d7714ed898b008d41fa97561591320196
weight: 8
---

OpenTelemetry Java 是为 Java 生态系统打造的一套 OpenTelemetry 可观测性工具集。
从宏观层面来看，它由 API、SDK 和插桩（instrumentation）三部分组成。

本页面将介绍该生态系统，包括概念性的[概述](#overview)、一份[文档导航](#navigating-the-docs)指南
，以及一份含发版信息和构件等关键详情的[仓库](#repositories)清单。

## 概述 {#overview}

API 是一组用于记录关键可观察性信号中的遥测数据的类和接口。它支持多种实现方式，
开箱即用地提供了低开销的极简 Noop（“no operation”的缩写，即 “无操作”，发音为“no op”）和 SDK 参考实现。
它旨在作为直接依赖项，供希望添加插桩的库、框架及应用所有者使用。
它具备强大的向后兼容性保证，零传递依赖，并且支持 Java 8 及以上版本。

SDK 是 API 的内置参考实现，用于处理和导出由插桩 API 调用生成的遥测数据。
配置 SDK 以进行适当的处理和导出是将 OpenTelemetry 集成到应用程序中的重要步骤。
SDK 提供自动配置和编程式配置选项。

插桩通过 API 记录遥测数据。插桩分为多种类型，包括：零代码 Java 代理、
零代码 Spring Boot 启动器、库（library）、原生（native）、手动（manual）和适配层（Shim）。

若需与编程语言无关的概述，请参阅 [OpenTelemetry 概念](/docs/concepts/)。

## 文档导航 {#navigating-the-docs}

OpenTelemetry Java 文档的组织结构如下：

- [通过示例快速入门](../getting-started/)：一个帮助你快速上手 OpenTelemetry Java 的示例，
  演示如何将 OpenTelemetry Java 代理集成到简单的 Web 应用中。
- [插桩生态系统](../instrumentation/)：一份关于 OpenTelemetry Java 插桩生态系统的指南。
  这是供希望将 OpenTelemetry Java 集成到应用程序中的开发者使用的核心资源。
  了解插桩的不同类型，并确定最适合你的方案。
- [使用 API 记录遥测数据](../api/)：一份关于 OpenTelemetry API 的技术参考文档，其中通过
  可运行的代码示例探讨了该 API 的所有关键方面。
  大多数用户会将本页面当作工具书使用，根据需求查阅各章节索引，而非从头至尾通读。
- [使用 SDK 管理遥测数据](../sdk/)：一份关于 OpenTelemetry SDK 的技术参考文档，其中通过
  可运行的代码示例，探讨了 SDK 的所有插件扩展点以及编程式配置 API。
  大多数用户会将本页面当作工具书使用，根据需求查阅各章节索引，而非从头至尾通读。
- [配置 SDK](../configuration/)：一份关于 SDK 配置的技术参考文档，重点介绍零代码自动配置。
  其中包含用于配置 SDK 的所有受支持环境变量和系统属性的参考说明。
  本文探讨了所有编程式自定义切入点，并提供可运行的代码示例。
  大多数用户会将本页面当作工具书使用，根据需求查阅各章节索引，而非从头至尾通读。
- **了解更多**：补充资源包括端到端
  [示例](../examples/)、 [Java 文档](../api/)、 组件[注册表](../registry/)和
  [性能参考文档](/docs/zero-code/java/agent/performance/)。

## 仓库 {#repositories}

OpenTelemetry Java 的源代码被组织在多个代码仓库中：

| 仓库                                                                                                       | 描述                                                              | Group ID                           | 当前 版本                            | 发布周期                                                                                                                                |
| ---------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- | ---------------------------------- | ------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------- |
| [opentelemetry-java](https://github.com/open-telemetry/opentelemetry-java)                                 | API 和 SDK 核心组件                                               | `io.opentelemetry`                 | `{{% param vers.otel %}}`            | [每月第一个周一之后的周五](https://github.com/open-telemetry/opentelemetry-java/blob/main/RELEASING.md#release-cadence)                 |
| [opentelemetry-java-instrumentation](https://github.com/open-telemetry/opentelemetry-java-instrumentation) | 由 OpenTelemetry 官方维护的插桩工具，包括 OpenTelemetry Java 代理 | `io.opentelemetry.instrumentation` | `{{% param vers.instrumentation %}}` | [每月第二个周一之后的周三](https://github.com/open-telemetry/opentelemetry-java-instrumentation/blob/main/RELEASING.md#release-cadence) |
| [opentelemetry-java-contrib](https://github.com/open-telemetry/opentelemetry-java-contrib)                 | 由社区维护的组件，这些组件不适合纳入其他仓库的明确范围            | `io.opentelemetry.contrib`         | `{{% param vers.contrib %}}`         | [每月第二个周一之后的周五](https://github.com/open-telemetry/opentelemetry-java-contrib/blob/main/RELEASING.md#release-cadence)         |
| [semantic-conventions-java](https://github.com/open-telemetry/semantic-conventions-java)                   | 为实现语义约定而自动生成的代码                                    | `io.opentelemetry.semconv`         | `{{% param vers.semconv %}}`         | 紧随[语义约定（semantic-conventions）](https://github.com/open-telemetry/semantic-conventions)的发布之后                                |
| [opentelemetry-proto-java](https://github.com/open-telemetry/opentelemetry-proto-java)                     | 为 OTLP 协议自动生成的绑定代码                                    | `io.opentelemetry.proto`           | `1.3.2-alpha`                        | 紧随 [OpenTelemetry 协议定义（opentelemetry-proto）](https://github.com/open-telemetry/opentelemetry-proto)的发布之后                   |
| [opentelemetry-java-examples](https://github.com/open-telemetry/opentelemetry-java-examples)               | 展示使用 API、SDK 和插装工具的多种模式的端到端代码示例            | n/a                                | n/a                                  | n/a                                                                                                                                     |

`opentelemetry-java`、`opentelemetry-java-instrumentation` 和 `opentelemetry-java-contrib` 各自均发布了大量的构件。
请查阅各代码仓库获取详细信息，或查看[物料清单](#dependencies-and-boms)表格中的“管理依赖项”列，以获取完整的管理依赖列表。

一般而言，从同一代码仓库发布的构件具有相同的版本号。
这一规则的例外是 opentelemetry-java-contrib，它可被视为一组独立项目的集合，
这些项目共处同一代码仓库是为了利用共享工具链。
目前，opentelemetry-java-contrib 的构件版本保持一致，但这只是巧合，未来这种情况将会改变。

各代码仓库的发布节奏与其高层级依赖结构相匹配，具体如下：

- `opentelemetry-java` 是核心仓库，每月最先发布。
- `opentelemetry-java-instrumentation` 依赖于 `opentelemetry-java`，随后进行发布。
- `opentelemetry-java-contrib` 依赖于 `opentelemetry-java-instrumentation`
  和 `opentelemetry-java` ，是最后发布的。
- 虽然 `semantic-conventions-java` 是 `opentelemetry-java-instrumentation` 的一个依赖,
  但是它是一个独立构件，拥有独立的发布计划。

## 依赖项与物料清单（BOM） {#dependencies-and-boms}

[物料清单](https://maven.apache.org/guides/introduction/introduction-to-dependency-mechanism.html#Bill_of_Materials_.28BOM.29_POMs)，简称 BOM，
是一种用于帮助保持相关依赖项版本一致的构件。
OpenTelemetry Java 发布了多个 BOM，以满足不同的使用场景，按范围从小到大的顺序列出如下。
我们强烈建议使用 BOM。

{{% alert %}} 由于这些 BOM 是层级化的，因此不建议依赖多个 BOM，因为这会造成冗余，还可能导致依赖版本解析出现不符合预期的结果。 {{% /alert %}}

点击 “管理依赖项” 列中的链接，即可查看该 BOM 所管理的构件列表。

| 概述                                                                  | 仓库                                 | Group ID                           | Artifact ID                               | 当前版本                                   | 管理依赖项                                              |
| --------------------------------------------------------------------- | ------------------------------------ | ---------------------------------- | ----------------------------------------- | ------------------------------------------ | ------------------------------------------------------- |
| API 和 SDK 的稳定核心构件                                             | `opentelemetry-java`                 | `io.opentelemetry`                 | `opentelemetry-bom`                       | `{{% param vers.otel %}}`                  | [最新 pom.xml][opentelemetry-bom]                       |
| API 和 SDK 的实验性核心构件, 包括 `opentelemetry-bom` 的全部内容      | `opentelemetry-java`                 | `io.opentelemetry`                 | `opentelemetry-bom-alpha`                 | `{{% param vers.otel %}}-alpha`            | [最新 pom.xml][opentelemetry-bom-alpha]                 |
| 插桩的稳定构件, 包括 `opentelemetry-bom` 的全部内容                   | `opentelemetry-java-instrumentation` | `io.opentelemetry.instrumentation` | `opentelemetry-instrumentation-bom`       | `{{% param vers.instrumentation %}}`       | [最新 pom.xml][opentelemetry-instrumentation-bom]       |
| 插桩的实验性构件, 包括 `opentelemetry-instrumentation-bom` 的全部内容 | `opentelemetry-java-instrumentation` | `io.opentelemetry.instrumentation` | `opentelemetry-instrumentation-bom-alpha` | `{{% param vers.instrumentation %}}-alpha` | [最新 pom.xml][opentelemetry-instrumentation-alpha-bom] |

以下代码片段演示了如何添加 BOM 依赖，
其中 `{{bomGroupId}}`、`{{bomArtifactId}}` 和 `{{bomVersion}}` 分别对应表格中 “Group ID”、“Artifact ID” 和“当前版本”列的值。

{{< tabpane text=true >}} {{% tab "Gradle" %}}

```kotlin
dependencies {
  implementation(platform("{{bomGroupId}}:{{bomArtifactId}}:{{bomVersion}}"))
  // 在构件上添加一个依赖，其版本由该 BOM 管理。
  implementation("io.opentelemetry:opentelemetry-api")
}
```

{{% /tab %}} {{% tab Maven %}}

```xml
<project>
  <dependencyManagement>
    <dependencies>
      <dependency>
        <groupId>{{bomGroupId}}</groupId>
        <artifactId>{{bomArtifactId}}</artifactId>
        <version>{{bomVersion}}</version>
        <type>pom</type>
        <scope>import</scope>
      </dependency>
    </dependencies>
  </dependencyManagement>
  <!-- 在构件上添加一个依赖，其版本由该 BOM 管理。 -->
  <dependencies>
    <dependency>
      <groupId>io.opentelemetry</groupId>
      <artifactId>opentelemetry-api</artifactId>
    </dependency>
  </dependencies>
</project>
```

{{% /tab %}} {{< /tabpane >}}

[opentelemetry-bom]: <https://repo1.maven.org/maven2/io/opentelemetry/opentelemetry-bom/{{% param vers.otel %}}/opentelemetry-bom-{{% param vers.otel %}}.pom>
[opentelemetry-bom-alpha]: <https://repo1.maven.org/maven2/io/opentelemetry/opentelemetry-bom-alpha/{{% param vers.otel %}}-alpha/opentelemetry-bom-alpha-{{% param vers.otel %}}-alpha.pom>
[opentelemetry-instrumentation-bom]: <https://repo1.maven.org/maven2/io/opentelemetry/instrumentation/opentelemetry-instrumentation-bom/{{% param vers.instrumentation %}}/opentelemetry-instrumentation-bom-{{% param vers.instrumentation %}}.pom>
[opentelemetry-instrumentation-alpha-bom]: <https://repo1.maven.org/maven2/io/opentelemetry/instrumentation/opentelemetry-instrumentation-bom-alpha/{{% param vers.instrumentation %}}-alpha/opentelemetry-instrumentation-bom-alpha-{{% param vers.instrumentation %}}-alpha.pom>
