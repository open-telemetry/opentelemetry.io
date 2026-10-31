---
default_lang_commit: 6ce0f45ce4b7bbb4e85bef99709711edccec8a21
---

## Prometheus

Para enviar dados de métricas para o [Prometheus](https://prometheus.io/), você
pode:

- [Ativar o OTLP Receiver do Prometheus](https://prometheus.io/docs/guides/opentelemetry/#enable-the-otlp-receiver)
  e utilizar o [exportador OTLP](#otlp) (boa prática), ou
- Utilizar o exportador do Prometheus, um `MetricReader` que inicia um servidor
  HTTP e coleta métricas, serializando para o formato de texto do Prometheus sob
  demanda.

### Configuração do _backend_ {#prometheus-setup}

Para executar um servidor Prometheus como _backend_ e começar a coletar
métricas, consulte o
[guia de primeiros passos do Prometheus](https://prometheus.io/docs/prometheus/latest/getting_started/).

Para ativar o OTLP Receiver, consulte o
[guia do Prometheus para ativar o OTLP Receiver](https://prometheus.io/docs/guides/opentelemetry/#enable-the-otlp-receiver).
