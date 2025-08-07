---
title: Instrumentation supplémentaire
weight: 60
default_lang_commit: 3d179dbe1270b83aafff0d3b6aa3311afd482649
---

Le Spring Boot starter OpenTelemetry fournit une
[instrumentation prête à l'emploi](../out-of-the-box-instrumentation) que vous
pouvez augmenter avec des instrumentations supplémentaires.

## Instrumentation Log4j2 {#log4j2-instrumentation}

Vous devez ajouter l'appender OpenTelemetry à votre fichier `log4j2.xml` :

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

Vous pouvez trouver plus d'options de configuration pour l'appender
OpenTelemetry dans la bibliothèque d'instrumentation
[Log4j](https://github.com/open-telemetry/opentelemetry-java-instrumentation/blob/main/instrumentation/log4j/log4j-appender-2.17/library/README.md).

| Propriété système                             | Type    | Défaut | Description                                                                                  |
| --------------------------------------------- | ------- | ------ | -------------------------------------------------------------------------------------------- |
| `otel.instrumentation.log4j-appender.enabled` | Boolean | true   | Active la configuration de l'appender Log4j OpenTelemetry avec une instance `OpenTelemetry`. |

## Bibliothèques d'instrumentation {#instrumentation-libraries}

Vous pouvez configurer d'autres instrumentations en utilisant les
[bibliothèques d'instrumentation OpenTelemetry](https://github.com/open-telemetry/opentelemetry-java-instrumentation/blob/main/docs/supported-libraries.md#libraries--frameworks).
