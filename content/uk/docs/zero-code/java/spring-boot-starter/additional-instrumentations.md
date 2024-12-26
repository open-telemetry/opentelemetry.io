---
title: Додаткова інструменталізація
weight: 60
default_lang_commit: e05fefe6c9f7d8b159d9a9a95128098c646c78c4
---

Стартер OpenTelemetry Spring Boot надає [інструменталізацію з коробки](../out-of-the-box-instrumentation), яку ви можете доповнити додатковими інструментами.

## Інструменталізація Log4j2 {#log4j2-instrumentation}

Ви повинні додати доповнювач OpenTelemetry до вашого файлу `log4j2.xml`:

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

Ви можете знайти більше варіантів конфігурації для доповнювача OpenTelemetry в [документації Log4j](https://github.com/open-telemetry/opentelemetry-java-instrumentation/blob/main/instrumentation/log4j/log4j-appender-2.17/library/README.md) інструментальної бібліотеки.

| Системна властивість                          | Тип     | Стандартно | Опис                                                                               |
| --------------------------------------------- | ------- | ---------- | ---------------------------------------------------------------------------------- |
| `otel.instrumentation.log4j-appender.enabled` | Boolean | true       | Вмикає конфігурацію доповнювача Log4j OpenTelemetry з екземпляром `OpenTelemetry`. |

## Інструментальні бібліотеки {#instrumentation-libraries}

Ви можете налаштувати інші інструменти, використовуючи [інструментальні бібліотеки OpenTelemetry](https://github.com/open-telemetry/opentelemetry-java-instrumentation/blob/main/docs/supported-libraries.md#libraries--frameworks).
