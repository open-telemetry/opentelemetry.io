---
title: Serviço de Detecção de Fraude
linkTitle: Detecção de Fraude
aliases: [frauddetectionservice]
---

Este serviço analisa pedidos recebidos e detecta clientes maliciosos. Isso é
apenas simulado e os pedidos recebidos são impressos.

[Código fonte do serviço de detecção de fraude](https://github.com/open-telemetry/opentelemetry-demo/blob/main/src/fraud-detection/)

## Auto-instrumentação

Este serviço depende do agente Java do OpenTelemetry para instrumentar automaticamente
bibliotecas como Kafka e configurar o SDK do OpenTelemetry. O agente é
passado para o processo usando o argumento de linha de comando `-javaagent`. Argumentos de
linha de comando são adicionados através do `JAVA_TOOL_OPTIONS` no `Dockerfile`,
e utilizados durante o script de inicialização do Gradle gerado automaticamente.

```dockerfile
ENV JAVA_TOOL_OPTIONS=-javaagent:/app/opentelemetry-javaagent.jar
```
