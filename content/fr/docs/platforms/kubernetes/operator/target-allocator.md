---
title: Allocateur de cibles
description:
  Un outil pour distribuer les cibles du PrometheusReceiver sur toutes les
  instances de collecteur déployées
cSpell:ignore: labeldrop labelmap statefulset
default_lang_commit: 1253527a5bea528ae37339692e711925785343b1
---

L'opérateur OpenTelemetry est livré avec un composant optionnel, l'
[Allocateur de cibles](https://github.com/open-telemetry/opentelemetry-operator/tree/main/cmd/otel-allocator)
(TA). En résumé, le TA est un mécanisme pour découpler les fonctions de
découverte de service et de collecte de métriques Prometheus afin qu'elles
puissent être mises à l'échelle indépendamment. Le collecteur gère les métriques
Prometheus sans avoir besoin d'installer Prometheus. Le TA gère la configuration
du récepteur Prometheus du collecteur.

Le TA sert deux fonctions :

1. Distribution uniforme des cibles Prometheus parmi un pool de collecteurs
2. Découverte des ressources personnalisées Prometheus

## Démarrage

Lors de la création d'une ressource personnalisée (CR) OpenTelemetryCollector et
de l'activation du TA, l'opérateur créera un nouveau déploiement et service pour
servir des directives `http_sd_config` spécifiques pour chaque pod de collecteur
dans le cadre de cette CR. Il modifiera également la configuration du récepteur
Prometheus dans la CR, afin qu'elle utilise le
[http_sd_config](https://prometheus.io/docs/prometheus/latest/http_sd/) du TA.
L'exemple suivant montre comment commencer avec l'allocateur de cibles :

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

En coulisses, l'opérateur OpenTelemetry convertira la configuration du
collecteur après la réconciliation en ce qui suit :

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

Notez comment l'opérateur supprime toutes les configurations de découverte de
service existantes (par exemple, `static_configs`, `file_sd_configs`, etc.) de
la section `scrape_configs` et ajoute une configuration `http_sd_configs`
pointant vers une instance d'allocateur de cibles qu'il a provisionnée.

Pour plus d'informations détaillées sur l'allocateur de cibles, voir
[Allocateur de cibles](https://github.com/open-telemetry/opentelemetry-operator/tree/main/cmd/otel-allocator).
