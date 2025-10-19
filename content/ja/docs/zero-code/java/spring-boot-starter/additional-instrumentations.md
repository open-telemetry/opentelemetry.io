---
title: 追加の計装
weight: 60
default_lang_commit: 276d7eb3f936deef6487cdd2b1d89822951da6c8
---

OpenTelemetry Spring Bootスターターは、追加の計装で拡張できる[すぐに使える計装](../out-of-the-box-instrumentation)を提供します。

## Log4j2計装 {#log4j2-instrumentation}

`log4j2.xml` ファイルにOpenTelemetryアペンダーを追加する必要があります。

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

OpenTelemetryアペンダーのその他の設定オプションは、[Log4j](https://github.com/open-telemetry/opentelemetry-java-instrumentation/blob/main/instrumentation/log4j/log4j-appender-2.17/library/README.md)計装ライブラリで確認できます。

| システムプロパティ                            | 型      | デフォルト | 説明                                                                              |
| --------------------------------------------- | ------- | ---------- | --------------------------------------------------------------------------------- |
| `otel.instrumentation.log4j-appender.enabled` | Boolean | true       | `OpenTelemetry` インスタンスでLog4j OpenTelemetryアペンダーの設定を有効にします。 |

## 計装ライブラリ {#instrumentation-libraries}

[OpenTelemetry計装ライブラリ](https://github.com/open-telemetry/opentelemetry-java-instrumentation/blob/main/docs/supported-libraries.md#libraries--frameworks)を使用して、その他の計装を設定できます。
