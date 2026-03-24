---
title: Operador de OpenTelemetry para Kubernetes
linkTitle: Operador de Kubernetes
description:
  Una implementación de un operador de Kubernetes que gestiona Collectors y la
  auto-instrumentación de cargas de trabajo mediante las bibliotecas de
  instrumentación de OpenTelemetry.
aliases:
  - /docs/operator
  - /docs/k8s-operator
  - /docs/platforms/kubernetes-operator
redirects:
  - { from: /docs/operator/*, to: ':splat' }
  - { from: /docs/k8s-operator/*, to: ':splat' }
  - { from: /docs/platforms/kubernetes-operator/*, to: ':splat' }
default_lang_commit: 4e426662aa975d6b3d5c2c2fe450f160415d1a3a
---

## Introducción {#introduction}

El
[Operador de OpenTelemetry](https://github.com/open-telemetry/opentelemetry-operator)
es una implementación de un
[operador de Kubernetes](https://kubernetes.io/docs/concepts/extend-kubernetes/operator/).

El operador gestiona:

- [OpenTelemetry Collector](https://github.com/open-telemetry/opentelemetry-collector)
- [auto-instrumentación de cargas de trabajo mediante las bibliotecas de instrumentación de OpenTelemetry](https://github.com/open-telemetry/opentelemetry-operator#opentelemetry-auto-instrumentation-injection)

## Primeros pasos {#getting-started}

Para instalar el operador en un clúster existente, asegúrate de tener
[`cert-manager`](https://cert-manager.io/docs/installation/) instalado y
ejecuta:

```bash
kubectl apply -f https://github.com/open-telemetry/opentelemetry-operator/releases/latest/download/opentelemetry-operator.yaml
```

Cuando el despliegue de `opentelemetry-operator` esté listo, crea una instancia
de OpenTelemetry Collector (otelcol), por ejemplo:

```console
$ kubectl apply -f - <<EOF
apiVersion: opentelemetry.io/v1beta1
kind: OpenTelemetryCollector
metadata:
  name: simplest
spec:
  config:
    receivers:
      otlp:
        protocols:
          grpc:
            endpoint: 0.0.0.0:4317
          http:
            endpoint: 0.0.0.0:4318
    processors:
      memory_limiter:
        check_interval: 1s
        limit_percentage: 75
        spike_limit_percentage: 15

    exporters:
      # NOTE: Prior to v0.86.0 use `logging` instead of `debug`.
      debug: {}

    service:
      pipelines:
        traces:
          receivers: [otlp]
          processors: [memory_limiter]
          exporters: [debug]
EOF
```

> [!NOTE]
>
> Por defecto, `opentelemetry-operator` usa la
> [imagen `opentelemetry-collector`](https://github.com/open-telemetry/opentelemetry-collector-releases/pkgs/container/opentelemetry-collector-releases%2Fopentelemetry-collector).
> Cuando el operador se instala con
> [Helm charts](/docs/platforms/kubernetes/helm/), se usa la imagen
> [`opentelemetry-collector-k8s`](https://github.com/open-telemetry/opentelemetry-collector-releases/pkgs/container/opentelemetry-collector-releases%2Fopentelemetry-collector-k8s).
> Si necesitas un componente que no esté en estos releases, puede que tengas que
> [construir tu propio Collector](/docs/collector/extend/ocb/).

Para más opciones de configuración y para configurar la inyección de
auto-instrumentación de cargas de trabajo mediante las bibliotecas de
instrumentación de OpenTelemetry, consulta el
[Operador de OpenTelemetry para Kubernetes](https://github.com/open-telemetry/opentelemetry-operator/blob/main/README.md).
