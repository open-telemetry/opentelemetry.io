---
title: Kafka
cSpell:ignore: Dotel
---

Este é usado como um serviço de fila de mensagens para conectar o serviço de checkout com os
serviços de contabilidade e detecção de fraude.

[Código fonte do serviço Kafka](https://github.com/open-telemetry/opentelemetry-demo/blob/main/src/kafka/)

## Auto-instrumentação

Este serviço depende do agente Java do OpenTelemetry e do
[Módulo de Insight de Métricas JMX integrado](https://github.com/open-telemetry/opentelemetry-java-instrumentation/tree/main/instrumentation/jmx-metrics/javaagent)
para capturar
[métricas do broker Kafka](https://github.com/open-telemetry/opentelemetry-java-instrumentation/blob/main/instrumentation/jmx-metrics/javaagent/kafka-broker.md)
e enviá-las para o coletor via OTLP.

O agente é passado para o processo usando o argumento de linha de comando `-javaagent`.
Argumentos de linha de comando são adicionados através do `KAFKA_OPTS` no
`Dockerfile`.

```dockerfile
ENV KAFKA_OPTS="-javaagent:/tmp/opentelemetry-javaagent.jar -Dotel.jmx.target.system=kafka-broker"
```
