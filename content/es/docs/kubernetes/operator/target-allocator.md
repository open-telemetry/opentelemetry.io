---
title: Asignador de Objetivos
description:
  Una herramienta para distribuir los objetivos del PrometheusReceiver en todas las instancias de Collector desplegadas
cSpell:ignore: labeldrop labelmap statefulset
default_lang_commit: f9893e13ba9ea10f1b5bcecb52cdd3d907bf0fd9
---

El OpenTelemetry Operator viene con un componente opcional, el
[Target Allocator](https://github.com/open-telemetry/opentelemetry-operator/tree/main/cmd/otel-allocator)
(TA). En resumen, el TA es un mecanismo para desacoplar las funciones de descubrimiento de servicios y de recopilación de métricas de Prometheus, de modo que puedan escalarse independientemente. El Collector gestiona las métricas de Prometheus sin necesidad de instalar Prometheus. El TA gestiona la configuración del receptor de Prometheus del Collector.

El TA cumple dos funciones:

1. Distribución equitativa de los objetivos de Prometheus entre un grupo de Collectors
2. Descubrimiento de Recursos Personalizados de Prometheus

## Empezando

Al crear un Recurso Personalizado (CR) de OpenTelemetryCollector y activar el TA,
el Operator creará un nuevo despliegue y un servicio para servir directivas específicas de `http_sd_config` para cada pod de Collector como parte de ese CR. También cambiará la configuración del receptor de Prometheus en el CR, para que utilice el [http_sd_config](https://prometheus.io/docs/prometheus/latest/http_sd/) del TA. El siguiente ejemplo muestra cómo empezar con el Target Allocator:

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
      # NOTE: Prior to v0.86.0 use `logging` instead of `debug`.
      debug:

    service:
      pipelines:
        metrics:
          receivers: [prometheus]
          processors: []
          exporters: [debug]
```

Detrás de las escenas, el OpenTelemetry Operator convertirá la configuración del Collector después de la reconciliación en lo siguiente:

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

Nota cómo el Operator elimina cualquier configuración de descubrimiento de servicios existente (p.ej., `static_configs`, `file_sd_configs`, etc.) de la sección `scrape_configs` y añade una configuración `http_sd_configs` apuntando a una instancia de Target Allocator que él mismo aprovisionó.

Para obtener información más detallada sobre el TargetAllocator, consulta
[TargetAllocator](https://github.com/open-telemetry/opentelemetry-operator/tree/main/cmd/otel-allocator).
