---
title: Padrão de implantação de agente
linkTitle: Padrão de agente
description: Envie sinais para Collectors e, em seguida, exporte para backends
aliases: [/docs/collector/deployment/agent]
weight: 200
default_lang_commit: 6cebc46de450dd44481a8a6f17c9b3d6f04aa0f2
---

No padrão de implantação de agente, os sinais de telemetria podem vir de:

- Aplicações [instrumentadas][instrumentation] com um SDK do OpenTelemetry
  usando o [OpenTelemetry Protocol (OTLP)][otlp].
- Collectors usando o exportador OTLP.

Os sinais são enviados para uma instância do [Collector][collector] que executa
ao lado da aplicação ou no mesmo _host_, como um _sidecar_ ou DaemonSet.

Cada SDK do lado do cliente ou Collector _downstream_ é configurado com o
endereço de uma instância do Collector:

![Conceito de implantação descentralizada do collector](../../img/otel-agent-sdk.svg)

1. Na aplicação, o SDK é configurado para enviar dados OTLP para um Collector.
1. O Collector é configurado para enviar dados de telemetria para um ou mais
   _backends_.

## Exemplo {#example}

Neste exemplo do padrão de implantação de agente, comece instrumentando
manualmente uma [aplicação Java para exportar métricas][instrument-java-metrics]
usando o SDK Java do OpenTelemetry, incluindo o valor padrão de
`OTEL_METRICS_EXPORTER`, `otlp`. Em seguida, configure o [exportador
OTLP][otlp-exporter] com o endereço do seu Collector. Por exemplo:

```shell
export OTEL_EXPORTER_OTLP_ENDPOINT=http://collector.example.com:4318
```

Em seguida, configure o Collector executando em `collector.example.com:4318` da
seguinte forma:

{{< tabpane text=true >}} {{% tab Rastros %}}

```yaml
receivers:
  otlp: # o receptor OTLP para o qual a aplicação envia rastros
    protocols:
      http:
        endpoint: 0.0.0.0:4318

exporters:
  otlp/jaeger: # o Jaeger suporta OTLP diretamente
    endpoint: https://jaeger.example.com:4317
    sending_queue:
      batch:

service:
  pipelines:
    traces/dev:
      receivers: [otlp]
      exporters: [otlp/jaeger]
```

{{% /tab %}} {{% tab Métricas %}}

```yaml
receivers:
  otlp: # o receptor OTLP para o qual a aplicação envia métricas
    protocols:
      http:
        endpoint: 0.0.0.0:4318

exporters:
  prometheusremotewrite: # o exportador PRW, para ingestão de métricas no backend
    endpoint: https://prw.example.com/v1/api/remote_write
    sending_queue:
      batch:

service:
  pipelines:
    metrics/prod:
      receivers: [otlp]
      exporters: [prometheusremotewrite]
```

{{% /tab %}} {{% tab Logs %}}

```yaml
receivers:
  otlp: # o receptor OTLP para o qual a aplicação envia logs
    protocols:
      http:
        endpoint: 0.0.0.0:4318

exporters:
  file: # o File Exporter, para gravar logs em um arquivo local
    path: ./app42_example.log
    rotation:

service:
  pipelines:
    logs/dev:
      receivers: [otlp]
      exporters: [file]
```

{{% /tab %}} {{< /tabpane >}}

Para explorar esse padrão de ponta a ponta, veja os exemplos em
[Java][java-otlp-example] ou [Python][py-otlp-example].

## Vantagens e desvantagens {#trade-offs}

A seguir estão os principais prós e contras de uso de um Collector em modo
agente:

Prós:

- Fácil de começar a usar
- Mapeamento claro um-para-um entre aplicação e Collector

Contras:

- Escalabilidade limitada para equipes e recursos de infraestrutura
- Pouco flexível para implantações complexas ou em evolução

[instrumentation]: /docs/languages/
[otlp]: /docs/specs/otel/protocol/
[collector]: /docs/collector/
[instrument-java-metrics]: /docs/languages/java/api/#meterprovider
[otlp-exporter]: /docs/specs/otel/protocol/exporter/
[java-otlp-example]:
  https://github.com/open-telemetry/opentelemetry-java-docs/tree/main/otlp
[py-otlp-example]:
  https://opentelemetry-python.readthedocs.io/en/stable/examples/metrics/instruments/README.html
