---
title: Служба виявлення шахрайства
linkTitle: Виявлення шахрайства
aliases: [frauddetectionservice]
---

Ця служба аналізує замовлення та виявляє зловмисних клієнтів. Це лише імітація, і отримані замовлення виводяться на екран.

## Автоінструментування {#auto-instrumentation}

Ця служба використовує агент OpenTelemetry Java для автоматичного інструментування бібліотек, таких як Kafka, та налаштування SDK OpenTelemetry. Агент передається в процес за допомогою аргументу командного рядка `-javaagent`. Аргументи командного рядка додаються через `JAVA_TOOL_OPTIONS` у `Dockerfile` і використовуються під час автоматично згенерованого стартового скрипту Gradle.

```dockerfile
ENV JAVA_TOOL_OPTIONS=-javaagent:/app/opentelemetry-javaagent.jar
```
