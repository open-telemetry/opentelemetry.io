---
title: Additional instrumentation
weight: 60
---

The OpenTelemetry Spring Boot starter provides
[out of the box instrumentation](../out-of-the-box-instrumentation) that you can
augment with additional instrumentations.

## Log4j2 Instrumentation

You have to add the OpenTelemetry appender to your `log4j2.xml` file:

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

You can find more configuration options for the OpenTelemetry appender in the
[Log4j](https://github.com/open-telemetry/opentelemetry-java-instrumentation/blob/main/instrumentation/log4j/log4j-appender-2.17/library/README.md)
instrumentation library.

{{< tabpane text=true >}} {{% tab "Properties" %}}

Enables the configuration of the Log4j OpenTelemetry appender with an
`OpenTelemetry` instance:

```yaml
otel:
  instrumentation:
    log4j-appender:
      enabled: true # default: true
```

{{% /tab %}} {{% tab "Declarative Configuration" %}}

In [declarative configuration](../declarative-configuration/), use the
centralized instrumentation lists to enable or disable Log4j:

```yaml
otel:
  distribution:
    spring_starter:
      instrumentation:
        disabled:
          - log4j_appender
```

{{% /tab %}} {{< /tabpane >}}

## Instrumentation libraries

You can configure other instrumentations using
[OpenTelemetry instrumentation libraries](https://github.com/open-telemetry/opentelemetry-java-instrumentation/blob/main/docs/supported-libraries.md#libraries--frameworks).
