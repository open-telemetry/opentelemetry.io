---
title: Розподільник Цілей
description: Інструмент для розподілу цілей PrometheusReceiver на всі розгорнуті екземпляри Колектора
weight: 20
default_lang_commit: e05fefe6c9f7d8b159d9a9a95128098c646c78c4
cSpell:ignore: labeldrop labelmap statefulset
---

Оператор OpenTelemetry постачається з додатковим компонентом, [Розподільник Цілей](https://github.com/open-telemetry/opentelemetry-operator/tree/main/cmd/otel-allocator) (Target Allocator, TA). Коротко кажучи, TA є механізмом для розʼєднання функцій виявлення сервісів та збору метрик Prometheus таким чином, щоб їх можна було масштабувати незалежно. Колектор керує метриками Prometheus без необхідності встановлювати Prometheus. TA керує конфігурацією Prometheus Receiver Колектора.

TA виконує дві функції:

1. Рівномірний розподіл цілей Prometheus серед пулу Колекторів
2. Виявлення користувацьких ресурсів Prometheus

## Початок роботи {#getting-started}

При створенні власного ресурсу OpenTelemetryCollector (CR) та встановленні TA як увімкненого, Оператор створить нове розгортання та сервіс для обслуговування конкретних директив `http_sd_config` для кожного podʼа Колектора як частини цього CR. Він також змінить конфігурацію Prometheus receiver у CR, щоб вона використовувала [http_sd_config](https://prometheus.io/docs/prometheus/latest/http_sd/) від TA. Наступний приклад показує, як почати роботу з Розподільником Цілей:

```yaml
apiVersion: opentelemetry.io/v1alpha1
kind: OpenTelemetryCollector
metadata:
  name: collector-with-ta
spec:
  mode: statefulset
  targetAllocator:
    enabled: true
  config: |
    receivers:
      prometheus:
        config:
          scrape_configs:
          - job_name: 'otel-collector'
            scrape_interval: 10s
            static_configs:
            - targets: [ '0.0.0.0:8888' ]
            metric_relabel_configs:
            - action: labeldrop
              regex: (id|name)
              replacement: $$1
            - action: labelmap
              regex: label_(.+)
              replacement: $$1

    exporters:
      # ПРИМІТКА: До v0.86.0 використовуйте `logging` замість `debug`.
      debug:

    service:
      pipelines:
        metrics:
          receivers: [prometheus]
          processors: []
          exporters: [debug]
```

За лаштунками, Оператор OpenTelemetry перетворить конфігурацію Колектора після узгодження на наступну:

```yaml
receivers:
  prometheus:
    config:
      scrape_configs:
        - job_name: otel-collector
          scrape_interval: 10s
          http_sd_configs:
            - url: http://collector-with-ta-targetallocator:80/jobs/otel-collector/targets?collector_id=$POD_NAME
          metric_relabel_configs:
            - action: labeldrop
              regex: (id|name)
              replacement: $$1
            - action: labelmap
              regex: label_(.+)
              replacement: $$1

exporters:
  debug:

service:
  pipelines:
    metrics:
      receivers: [prometheus]
      processors: []
      exporters: [debug]
```

Зверніть увагу, як Оператор видаляє будь-які наявні конфігурації виявлення сервісів (наприклад, `static_configs`, `file_sd_configs` тощо) з розділу `scrape_configs` та додає конфігурацію `http_sd_configs`, що вказує на екземпляр Розподільника Цілей, який він створив.

Для більш детальної інформації про Розподільник Цілей дивіться [TargetAllocator](https://github.com/open-telemetry/opentelemetry-operator/tree/main/cmd/otel-allocator).
