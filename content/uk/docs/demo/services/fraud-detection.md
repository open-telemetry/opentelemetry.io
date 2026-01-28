---
title: Служба виявлення шахрайства
linkTitle: Виявлення шахрайства
aliases: [frauddetectionservice]
default_lang_commit: e05fefe6c9f7d8b159d9a9a95128098c646c78c4
---

Ця служба аналізує замовлення та виявляє зловмисних клієнтів. Це лише імітація, і отримані замовлення виводяться на екран.

[Код сервісу Виявлення шахрайства](https://github.com/open-telemetry/opentelemetry-demo/blob/main/src/fraud-detection/)

## Автоінструментування {#auto-instrumentation}

Ця служба використовує агент OpenTelemetry Java для автоматичного інструментування бібліотек, таких як Kafka, та налаштування SDK OpenTelemetry. Агент передається в процес за допомогою аргументу командного рядка `-javaagent`. Аргументи командного рядка додаються через `JAVA_TOOL_OPTIONS` у `Dockerfile` і використовуються під час автоматично згенерованого стартового скрипту Gradle.

```dockerfile
ENV JAVA_TOOL_OPTIONS=-javaagent:/app/opentelemetry-javaagent.jar
```
