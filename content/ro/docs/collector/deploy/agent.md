---
title: Model de implementare agent
linkTitle:  Model agent
description: Trimite semnale către Colector și apoi exportă-le către backend
aliases: [/docs/collector/deployment/agent]
weight: 200
default_lang_commit: ea312f6d603e787a71e181b38df625a7079577a0
---

În modelul de implementare agent, semnalele de telemetrie pot proveni din:

- Aplicații [instrumentate][instrumentation] cu un OpenTelemetry SDK folosind
[OpenTelemetry Protocol (OTLP)][otlp].
- Instanțe Colector care folosesc exportatorul OTLP.

Semnalele sunt trimise către o instanță [Colector][collector] care rulează simultan cu
aplicația sau pe același host, cum ar fi sidecar sau DaemonSet.

Fiecare SDK din partea de client sau Colector este configurat cu adresa unei
instanțe Colector:

![Conceptul de implementare descentralizată a Colector-ului](../../img/otel-agent-sdk.svg)

1. În aplicație, SDK-ul este configurat să trimită date OTLP către un Colector.
1. Colector-ul este configurat să trimită datele de telemetrie către unul sau mai multe backend-uri.

## Exemplu { #example }

În acest exemplu al modelului de implementare agent, începe prin a instrumenta manual
o [aplicație Java pentru a exporta metrici][instrument-java-metrics] folosind
OpenTelemetry Java SDK, incluzând valoarea implicită pentru `OTEL_METRICS_EXPORTER`,
`otlp`. Apoi, configurează [exportatorul OTLP][otlp-exporter] cu adresa instanței tale Colector. De exemplu:

```shell
export OTEL_EXPORTER_OTLP_ENDPOINT=http://collector.example.com:4318
```

Apoi, configurează Colector-ul care rulează la `collector.example.com:4318`
astfel:

{{< tabpane text=true >}} {{% tab Traces %}}

```yaml
receivers:
  otlp: # the OTLP receiver the app is sending traces to
    protocols:
      http:
        endpoint: 0.0.0.0:4318

exporters:
  otlp/jaeger: # Jaeger supports OTLP directly
    endpoint: https://jaeger.example.com:4317
    sending_queue:
      batch:

service:
  pipelines:
    traces/dev:
      receivers: [otlp]
      exporters: [otlp/jaeger]
```

{{% /tab %}} {{% tab Metrics %}}

```yaml
receivers:
  otlp: # the OTLP receiver the app is sending metrics to
    protocols:
      http:
        endpoint: 0.0.0.0:4318

exporters:
  prometheus_remote_write: # the PRW exporter, to ingest metrics to backend
    endpoint: https://prw.example.com/v1/api/remote_write
    sending_queue:
      batch:

service:
  pipelines:
    metrics/prod:
      receivers: [otlp]
      exporters: [prometheus_remote_write]
```

{{% /tab %}} {{% tab Logs %}}

```yaml
receivers:
  otlp: # the OTLP receiver the app is sending logs to
    protocols:
      http:
        endpoint: 0.0.0.0:4318

exporters:
  file: # the File Exporter, to ingest logs to local file
    path: ./app42_example.log
    rotation:

service:
  pipelines:
    logs/dev:
      receivers: [otlp]
      exporters: [file]
```

{{% /tab %}} {{< /tabpane >}}

Pentru a explora acest model de la un capăt la altul, consultă exemplele pentru [Java][java-otlp-example] sau
[Python][py-otlp-example].

## Compromisuri { #trade-offs }

Acestea sunt principalele avantaje și dezavantaje ale utilizării unui Colector de tip agent:

Avantaje:

- Ușor de început și configurat
- Mapare clară unu-la-unu între aplicație și Colector

Dezavantaje:

- Scalabilitate limitată pentru echipe și resurse de infrastructură
- Lipsă de flexibilitate pentru implementări complexe sau aflate în evoluție

[instrumentation]: /docs/languages/
[otlp]: /docs/specs/otel/protocol/
[collector]: /docs/collector/
[instrument-java-metrics]: /docs/languages/java/api/#meterprovider
[otlp-exporter]: /docs/specs/otel/protocol/exporter/
[java-otlp-example]:
  https://github.com/open-telemetry/opentelemetry-java-docs/tree/main/otlp
[py-otlp-example]:
  https://opentelemetry-python.readthedocs.io/en/stable/examples/metrics/instruments/README.html
