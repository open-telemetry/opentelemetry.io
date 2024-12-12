---
title: OpenTelemetry Operator para Kubernetes
linkTitle: Operador de Kubernetes
description:
 Una implementación de un Operador de Kubernetes, que gestiona coleccionistas y la auto-instrumentación de la carga de trabajo utilizando las bibliotecas de instrumentación de OpenTelemetry.
aliases:
  - /docs/operator
  - /docs/k8s-operator
  - /docs/kubernetes-operator
redirects:
  - { from: /docs/operator/*, to: ':splat' }
  - { from: /docs/k8s-operator/*, to: ':splat' }
  - { from: /docs/kubernetes-operator/*, to: ':splat' }
default_lang_commit: f9893e13ba9ea10f1b5bcecb52cdd3d907bf0fd9
---

## Introducción

El OpenTelemetry Operator es una implementación de un
[Kubernetes Operator](https://kubernetes.io/docs/concepts/extend-kubernetes/operator/).

El operador gestiona:

- OpenTelemetry Collector
- [auto-instrumentation of the workloads using OpenTelemetry instrumentation libraries](https://github.com/open-telemetry/opentelemetry-operator#opentelemetry-auto-instrumentation-injection)

## Empezando

Para instalar el operador en un clúster existente, asegúrate de tener cert-manager
instalado y ejecuta:

```bash
kubectl apply -f https://github.com/open-telemetry/opentelemetry-operator/releases/latest/download/opentelemetry-operator.yaml
```

Una vez que el despliegue `opentelemetry-operator` esté listo, crea una instancia de OpenTelemetry Collector (otelcol), como:

```console
$ kubectl apply -f - <<EOF
apiVersion: opentelemetry.io/v1alpha1
kind: OpenTelemetryCollector
metadata:
  name: simplest
spec:
  config: |
    receivers:
      otlp:
        protocols:
          grpc:
            endpoint: 0.0.0.0:4317
          http:
            endpoint: 0.0.0.0:4318
    processors:

    exporters:
      # NOTE: Prior to v0.86.0 use `logging` instead of `debug`.
      debug:

    service:
      pipelines:
        traces:
          receivers: [otlp]
          processors: []
          exporters: [debug]
EOF
```

Para más opciones de configuración y para configurar la inyección de auto-instrumentation de las cargas de trabajo usando las librerías de instrumentación de OpenTelemetry, sigue leyendo
[here](https://github.com/open-telemetry/opentelemetry-operator/blob/main/README.md).
