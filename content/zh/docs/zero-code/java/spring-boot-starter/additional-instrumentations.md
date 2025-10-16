---
title: 额外的插桩
default_lang_commit: 2faf0ea68ab12d5fc5423fc98031a3d287b3f88e
weight: 60
---

OpenTelemetry Spring Boot 启动器提供了[开箱即用的插桩](../out-of-the-box-instrumentation)，你可以使用额外的插桩来增强它。

## Log4j2 插桩 {#log4j2-instrumentation}

你必须将 OpenTelemetry appender 添加到你的 `log4j2.xml` 文件中：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<Configuration status="WARN" packages="io.opentelemetry.instrumentation.log4j.appender.v2_17">
    <Appenders>
        <OpenTelemetry name="OpenTelemetryAppender"/>
    </Appenders>
    <Loggers>
        <Root>
            <AppenderRef ref="OpenTelemetryAppender" level="All"/>
        </Root>
    </Loggers>
</Configuration>
```

你可以在 [Log4j](https://github.com/open-telemetry/opentelemetry-java-instrumentation/blob/main/instrumentation/log4j/log4j-appender-2.17/library/README.md) 插桩库中找到 OpenTelemetry appender的更多配置选项。

| 系统属性                                      | 类型    | 默认值 | 描述                                                           |
| --------------------------------------------- | ------- | ------ | -------------------------------------------------------------- |
| `otel.instrumentation.log4j-appender.enabled` | Boolean | true   | 启用使用 `OpenTelemetry` 实例配置 Log4j OpenTelemetry 附加器。 |

## 插桩库 {#instrumentation-libraries}

你可以使用 [OpenTelemetry 插桩库](https://github.com/open-telemetry/opentelemetry-java-instrumentation/blob/main/docs/supported-libraries.md#libraries--frameworks) 配置其他插桩。
