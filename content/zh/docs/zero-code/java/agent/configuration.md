---
title: 配置
weight: 10
default_lang_commit: 4a613ef41a86ffa53495e951fdff53de43ba11df
aliases: [agent-config]
cSpell:ignore: customizer logback
---

{{% alert title="了解更多信息" %}}
本页介绍了向 Java 代理提供配置的多种方式。有关配置选项本身的信息，请参阅[配置 SDK](/docs/languages/java/configuration)。
{{% /alert %}}

## 代理配置 {#agent-configuration}

代理可以从以下一个或多个来源（按优先级从高到低排序）获取配置：

- 系统属性
- [环境变量](#configuring-with-environment-variables)
- [配置文件](#configuration-file)
- [`AutoConfigurationCustomizer#addPropertiesSupplier()`](https://github.com/open-telemetry/opentelemetry-java/blob/f92e02e4caffab0d964c02a32fe305d6d6ba372e/sdk-extensions/autoconfigure-spi/src/main/java/io/opentelemetry/sdk/autoconfigure/spi/AutoConfigurationCustomizer.java#L73)
  函数提供的属性；使用
  [`AutoConfigurationCustomizerProvider`](https://github.com/open-telemetry/opentelemetry-java/blob/main/sdk-extensions/autoconfigure-spi/src/main/java/io/opentelemetry/sdk/autoconfigure/spi/AutoConfigurationCustomizerProvider.java)
  SPI

## 使用环境变量进行配置 {#configuring-with-environment-variables}

在某些环境中，通常更喜欢通过环境变量来配置设置。
任何可以使用系统属性配置的设置也可以使用环境变量进行设置。
虽然下面的许多设置都提供了两种格式的示例，但对于那些没有提供的设置，
请使用以下步骤来确定所需系统属性的正确名称映射：

- 将系统属性名称转换为大写。
- 用下划线（`_`）替换所有点（`.`）和短横线（`-`）字符。

例如，`otel.instrumentation.common.default-enabled` 将转换为 `OTEL_INSTRUMENTATION_COMMON_DEFAULT_ENABLED`。

## 配置文件 {#configuration-file}

你可以通过设置以下属性来提供代理配置文件的路径：

{{% config_option name="otel.javaagent.configuration-file" %}} 指向包含代理配置的有效 Java 属性文件的路径。
{{% /config_option %}}

## 扩展 {#extensions}

你可以通过设置以下属性来启用[扩展][extensions]：

{{% config_option name="otel.javaagent.extensions" %}}

指向扩展 jar 文件或文件夹的路径，包含 jar 文件。
如果指向文件夹，则该文件夹中的每个 jar 文件都将被视为单独的、独立的扩展。

{{% /config_option %}} -->

## Java 代理日志输出 {#java-agent-logging-output}

可通过设置以下属性配置代理的日志输出：

{{% config_option name="otel.javaagent.logging" %}}

Java 代理日志记录模式。支持以下 3 种模式：

- `simple`：代理将使用标准错误流打印其日志。只会打印 `INFO` 或更高级别的日志。这是默认的 Java 代理日志记录模式。
- `none`：代理不会记录任何内容，甚至不会记录其自身版本。
- `application`：代理将尝试将其自身的日志重定向到已插桩应用程序的 slf4j 记录器。
  这对于不使用多个类加载器的简单 one-jar 应用程序中效果最好；
  Spring Boot 应用程序也受支持。
  Java 代理的输出日志可以使用被插桩应用程序的日志配置（例如 logback.xml 或 log4j2.xml）进一步配置。
  **确保在将此模式用于生产环境之前测试其是否适用于应用程序。**

{{% /config_option %}}

## SDK 配置 {#sdk-configuration}

SDK 的自动配置模块用于代理的基本配置。
阅读[文档](/docs/languages/java/configuration)以查找诸如配置导出或采样等设置。

{{% alert title="重要" color="warning" %}}

与 SDK 自动配置不同，Java 代理和 OpenTelemetry Spring Boot 启动器的 2.0+ 版本使用 `http/protobuf` 作为默认协议，而不是 `grpc`。

{{% /alert %}}

## 启用默认禁用的资源提供程序 {#enable-resource-providers-that-are-disabled-by-default}

除了来自 SDK 自动配置的资源配置外，您还可以启用默认处于禁用状态的额外资源提供程序：

{{% config_option
name="otel.resource.providers.aws.enabled"
default=false
%}} 启用 [AWS 资源提供程序](https://github.com/open-telemetry/opentelemetry-java-contrib/tree/main/aws-resources)。
{{% /config_option %}}

{{% config_option
name="otel.resource.providers.gcp.enabled"
default=false
%}} 启用 [GCP 资源提供程序](https://github.com/open-telemetry/opentelemetry-java-contrib/tree/main/gcp-resources)。
{{% /config_option %}}

{{% config_option
name="otel.resource.providers.azure.enabled"
default=false
%}} 启用 [Azure 资源提供程序](https://github.com/open-telemetry/opentelemetry-java-contrib/tree/main/azure-resources)。
{{% /config_option %}}

[extensions]: https://github.com/open-telemetry/opentelemetry-java-instrumentation/tree/main/examples/extension#readme
