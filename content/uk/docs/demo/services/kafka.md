---
title: Kafka
default_lang_commit: e05fefe6c9f7d8b159d9a9a95128098c646c78c4
cSpell:ignore: Dotel
---

Kafka використовується як служба черги повідомлень для зʼєднання служби оформлення замовлень зі службами бухгалтерського обліку та виявлення шахрайства.

[Сирці служби Kafka](https://github.com/open-telemetry/opentelemetry-demo/blob/main/src/kafka/)

## Автоінструментування {#auto-instrumentation}

Ця служба покладається на агент OpenTelemetry Java та вбудований [Модуль JMX Metric Insight](https://github.com/open-telemetry/opentelemetry-java-instrumentation/tree/main/instrumentation/jmx-metrics/javaagent) для збору [метрик брокера Kafka](https://github.com/open-telemetry/opentelemetry-java-instrumentation/blob/main/instrumentation/jmx-metrics/javaagent/kafka-broker.md) та відправлення їх до колектора через OTLP.

Агент передається в процес за допомогою аргументу командного рядка `-javaagent`. Аргументи командного рядка додаються через `KAFKA_OPTS` у `Dockerfile`.

```dockerfile
ENV KAFKA_OPTS="-javaagent:/tmp/opentelemetry-javaagent.jar -Dotel.jmx.target.system=kafka-broker"
```
