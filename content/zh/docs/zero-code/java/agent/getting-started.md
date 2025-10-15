---
title: 快速开始
weight: 1
default_lang_commit: 2cb66a7e093114cfe06eb70dbca46abbbee45ef2
cSpell:ignore: Dotel myapp
---

## 安装 {#setup}

1.  从 `opentelemetry-java-instrumentation` 仓库的 [Releases][] 下载
    [opentelemetry-javaagent.jar][] 并将 JAR 放在您偏好的目录中。
    JAR 文件包含代理和插桩库。
2.  添加 `-javaagent:path/to/opentelemetry-javaagent.jar` 和其他配置到
    你的 JVM 启动参数并启动您的应用程序：
    - 直接在启动命令上：

      ```shell
      java -javaagent:path/to/opentelemetry-javaagent.jar -Dotel.service.name=your-service-name -jar myapp.jar
      ```

    - 通过 `JAVA_TOOL_OPTIONS` 和其他环境变量：

      ```shell
      export JAVA_TOOL_OPTIONS="-javaagent:path/to/opentelemetry-javaagent.jar"
      export OTEL_SERVICE_NAME="your-service-name"
      java -jar myapp.jar
      ```

## 声明式配置 {#declarative-configuration}

声明式配置使用 YAML 文件，而非环境变量或系统属性。
当你需要设置许多配置选项，或者想要使用那些无法通过环境变量或系统属性来配置的选项时，这种方式会非常有用。

有关更多详细信息，请参阅[声明式配置](../declarative-configuration)页面。

## 配置代理 {#configuring-the-agent}

代理高度可配置。

一种选择是通过 `-D` 标志传递配置属性。
在本示例中，配置了服务名称和用于追踪的 Zipkin 导出器：

```sh
java -javaagent:path/to/opentelemetry-javaagent.jar \
     -Dotel.service.name=your-service-name \
     -Dotel.traces.exporter=zipkin \
     -jar myapp.jar
```

你也可以使用环境变量来配置代理：

```sh
OTEL_SERVICE_NAME=your-service-name \
OTEL_TRACES_EXPORTER=zipkin \
java -javaagent:path/to/opentelemetry-javaagent.jar \
     -jar myapp.jar
```

你也可以提供一个 Java 属性文件并从中加载配置值：

```sh
java -javaagent:path/to/opentelemetry-javaagent.jar \
     -Dotel.javaagent.configuration-file=path/to/properties/file.properties \
     -jar myapp.jar
```

或者

```sh
OTEL_JAVAAGENT_CONFIGURATION_FILE=path/to/properties/file.properties \
java -javaagent:path/to/opentelemetry-javaagent.jar \
     -jar myapp.jar
```

要查看完整的配置选项，请参阅[代理配置](../configuration)。

## 支持的库、框架、应用服务和 JVM {#supported-libraries-frameworks-application-services-and-jvms}

Java 代理附带许多流行组件的插桩库。
要查看完整的支持列表，请参阅[支持的库、框架、应用服务和 JVM][support]。

## Troubleshooting {#troubleshooting}

{{% config_option name="otel.javaagent.debug" %}}

设置为 `true` 以查看调试日志。请注意，这些日志非常详细。

{{% /config_option %}}

## 下一步操作 {#next-steps}

在为应用程序或服务配置好自动插桩后，你可能需要为选定的方法添加[注解](../annotations)，
或通过[手动插桩](/docs/languages/java/instrumentation/)来收集自定义遥测数据。

[opentelemetry-javaagent.jar]: https://github.com/open-telemetry/opentelemetry-java-instrumentation/releases/latest/download/opentelemetry-javaagent.jar
[releases]: https://github.com/open-telemetry/opentelemetry-java-instrumentation/releases
[support]: https://github.com/open-telemetry/opentelemetry-java-instrumentation/blob/main/docs/supported-libraries.md
