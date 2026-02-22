---
title: Шаблон розгортання — Агент
linkTitle: Шаблон Agent
description: Надсилання сигналів до колекторів і звідти до бекендів
aliases: [/docs/collector/deployment/agent]
weight: 200
default_lang_commit: 5f551752635886a0d2d6b2a83e5a36866ca1b5f1
cSpell:ignore: prometheusremotewrite
---

У моделі розгортання агентів сигнали телеметрії можуть надходити з

- Застосунків [інструментованих][instrumentation] а допомогою OpenTelemetry SDK з використанням [протоколу OpenTelemetry (OTLP)][otlp].
- Колекторів (з використанням OTLP експортера).

Сигнали надсилаються до екземпляра [Collector][collector], який працює разом із застосунком або на тому самому хості, наприклад, у вигляді sidecar або DaemonSet.

Кожен SDK на стороні клієнта або підлеглий (downstream) Колектор налаштовується з урахуванням адреси екземпляра Колектора:

![Концепція децентралізованого розгортання колектора](../../img/otel-agent-sdk.svg)

1. У застосунку SDK налаштований на надсилання даних OTLP до колектора.
2. Колектор налаштований на надсилання даних телеметрії до одного або більше бекендів.

## Приклад {#example}

У цьому прикладі шаблону розгортання агента почніть з ручного інструментування [Java-застосунку для експорту метрик][instrument-java-metrics] за допомогою OpenTelemetry Java SDK, включаючи стандартне значення `OTEL_METRICS_EXPORTER`, `otlp`. Далі налаштуйте [експортер OTLP][otlp-exporter] з адресою вашого колектора. Наприклад:

```shell
export OTEL_EXPORTER_OTLP_ENDPOINT=http://collector.example.com:4318
```

Далі налаштуйте колектор, що працює за адресою `collector.example.com:4318`, наступним чином:

{{< tabpane text=true >}} {{% tab Трейси %}}

```yaml
receivers:
  otlp: # OTLP приймач, до якого застосунок надсилає трейси
    protocols:
      http:
        endpoint: 0.0.0.0:4318

exporters:
  otlp/jaeger: # Jaeger підтримує OTLP безпосередньо
    endpoint: https://jaeger.example.com:4317
    sending_queue:
      batch:

service:
  pipelines:
    traces/dev:
      receivers: [otlp]
      exporters: [otlp/jaeger]
```

{{% /tab %}} {{% tab Метрики %}}

```yaml
receivers:
  otlp: # OTLP приймач, до якого застосунок надсилає метрики
    protocols:
      http:
        endpoint: 0.0.0.0:4318

exporters:
  prometheusremotewrite: # PRW експортер, для передачі метрик до бекенду
    endpoint: https://prw.example.com/v1/api/remote_write
    sending_queue:
      batch:

service:
  pipelines:
    metrics/prod:
      receivers: [otlp]
      exporters: [prometheusremotewrite]
```

{{% /tab %}} {{% tab Логи %}}

```yaml
receivers:
  otlp: # OTLP приймач, до якого застосунок надсилає логи
    protocols:
      http:
        endpoint: 0.0.0.0:4318

exporters:
  file: # File експортер, для передачі логів до локального файлу
    path: ./app42_example.log
    rotation:

service:
  pipelines:
    logs/dev:
      receivers: [otlp]
      exporters: [file]
```

{{% /tab %}} {{< /tabpane >}}

Щоб докладно ознайомитися з цією схемою, див. приклади [Java][java-otlp-example] або [Python][py-otlp-example].

## Компроміси {#trade-offs}

Переваги:

- Простий початок роботи
- Чітке 1:1 зіставлення між застосунком та колектором

Недоліки:

- Обмежена масштабованість для команд та інфраструктурних ресурсів
- Негнучкість для складних або мінливих розгортань

[instrumentation]: /docs/languages/
[otlp]: /docs/specs/otel/protocol/
[collector]: /docs/collector/
[instrument-java-metrics]: /docs/languages/java/api/#meterprovider
[otlp-exporter]: /docs/specs/otel/protocol/exporter/
[java-otlp-example]: https://github.com/open-telemetry/opentelemetry-java-docs/tree/main/otlp
[py-otlp-example]: https://opentelemetry-python.readthedocs.io/en/stable/examples/metrics/instruments/README.html
