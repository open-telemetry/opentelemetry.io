---
title: Агент
description: Чому і як надсилати сигнали до колекторів і звідти до бекендів
weight: 2
default_lang_commit: e05fefe6c9f7d8b159d9a9a95128098c646c78c4
cSpell:ignore: prometheusremotewrite
---

Шаблон розгортання колектора-агента складається з застосунків, [інструментованих][instrumentation] за допомогою OpenTelemetry SDK з використанням [протоколу OpenTelemetry (OTLP)][otlp], або інших колекторів (з використанням OTLP експортера), які надсилають телеметричні сигнали до [колектора][collector], що працює з застосунком або на тому ж хості, що й застосунок (наприклад, як sidecar або daemonset).

Кожен SDK на стороні клієнта або підлеглий (downstream) колектор налаштовується з урахуванням розташування колектора:

![Концепція децентралізованого розгортання колектора](../../img/otel-agent-sdk.svg)

1. У застосунку SDK налаштований на надсилання даних OTLP до колектора.
2. Колектор налаштований на надсилання даних телеметрії до одного або більше бекендів.

## Приклад {#example}

Конкретний приклад шаблону розгортання колектора-агента може виглядати наступним чином: ви вручну інструментуєте, скажімо, [Java-застосунок для експорту метрик][instrument-java-metrics] за допомогою OpenTelemetry Java SDK. У контексті застосунку ви встановлюєте `OTEL_METRICS_EXPORTER` на `otlp` (що є стандартним значенням) і налаштовуєте [OTLP експортер][otlp-exporter] з адресою вашого колектора, наприклад (у Bash або `zsh` shell):

```shell
export OTEL_EXPORTER_OTLP_ENDPOINT=http://collector.example.com:4318
```

Колектор, що працює на `collector.example.com:4318`, буде налаштований наступним чином:

{{< tabpane text=true >}} {{% tab Трейси %}}

```yaml
receivers:
  otlp: # OTLP приймач, до якого застосунок надсилає трейси
    protocols:
      http:
        endpoint: 0.0.0.0:4318

processors:
  batch:

exporters:
  otlp/jaeger: # Jaeger підтримує OTLP безпосередньо
    endpoint: https://jaeger.example.com:4317

service:
  pipelines:
    traces/dev:
      receivers: [otlp]
      processors: [batch]
      exporters: [otlp/jaeger]
```

{{% /tab %}} {{% tab Метрики %}}

```yaml
receivers:
  otlp: # OTLP приймач, до якого застосунок надсилає метрики
    protocols:
      http:
        endpoint: 0.0.0.0:4318

processors:
  batch:

exporters:
  prometheusremotewrite: # PRW експортер, для передачі метрик до бекенду
    endpoint: https://prw.example.com/v1/api/remote_write

service:
  pipelines:
    metrics/prod:
      receivers: [otlp]
      processors: [batch]
      exporters: [prometheusremotewrite]
```

{{% /tab %}} {{% tab Логи %}}

```yaml
receivers:
  otlp: # OTLP приймач, до якого застосунок надсилає логи
    protocols:
      http:
        endpoint: 0.0.0.0:4318

processors:
  batch:

exporters:
  file: # File експортер, для передачі логів до локального файлу
    path: ./app42_example.log
    rotation:

service:
  pipelines:
    logs/dev:
      receivers: [otlp]
      processors: [batch]
      exporters: [file]
```

{{% /tab %}} {{< /tabpane >}}

Якщо ви хочете спробувати це самостійно, ви можете ознайомитися з прикладами end-to-end для [Java][java-otlp-example] або [Python][py-otlp-example].

## Компроміси {#tradeoffs}

Переваги:

- Просто почати
- Чітке 1:1 зіставлення між застосунком та колектором

Недоліки:

- Масштабованість (з погляду людських ресурсів і навантаження)
- Негнучкість

[instrumentation]: /docs/languages/
[otlp]: /docs/specs/otel/protocol/
[collector]: /docs/collector/
[instrument-java-metrics]: /docs/languages/java/api/#meterprovider
[otlp-exporter]: /docs/specs/otel/protocol/exporter/
[java-otlp-example]: https://github.com/open-telemetry/opentelemetry-java-docs/tree/main/otlp
[py-otlp-example]: https://opentelemetry-python.readthedocs.io/en/stable/examples/metrics/instruments/README.html
