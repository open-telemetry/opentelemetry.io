---
title: Operador de OpenTelemetry para Kubernetes
linkTitle: Operador de Kubernetes
description:
  Una implementación de un operador de Kubernetes, que gestiona colectores y la
  auto-instrumentación de la carga de trabajo usando librerías de
  instrumentación de OpenTelemetry.
aliases:
  - /docs/operator
  - /docs/k8s-operator
  - /docs/platforms/kubernetes-operator
redirects:
  - { from: /docs/operator/*, to: ':splat' }
  - { from: /docs/k8s-operator/*, to: ':splat' }
  - { from: /docs/platforms/kubernetes-operator/*, to: ':splat' }
default_lang_commit: 5273b533bd6dcf1aa1a4b8f57295320dc001a4a4
drifted_from_default: true
---

## Introducción {#introduction}

El
[Operador de OpenTelemetry](https://github.com/open-telemetry/opentelemetry-operator)
es una implementación de un
[operador de Kubernetes](https://kubernetes.io/docs/concepts/extend-kubernetes/operator/).

El operador gestiona:

- El
  [OpenTelemetry Collector](https://github.com/open-telemetry/opentelemetry-collector)
- La
  [auto-instrumentación de las cargas de trabajo usando librerías de instrumentación de OpenTelemetry](https://github.com/open-telemetry/opentelemetry-operator#opentelemetry-auto-instrumentation-injection)

## Primeros pasos {#getting-started}

Para instalar el operador en un clúster existente, asegúrate de tener
[`cert-manager`](https://cert-manager.io/docs/installation/) instalado y
ejecuta:

```bash
kubectl apply -f https://github.com/open-telemetry/opentelemetry-operator/releases/latest/download/opentelemetry-operator.yaml
```

Cuando el deployment de `opentelemetry-operator` esté listo, en `ready`, crea
una instancia del OpenTelemetry Collector (otelcol), con el comando siguiente:

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
      batch:
        send_batch_size: 10000
        timeout: 10s

    exporters:
      # NOTA: Antes de v0.86.0 utiliza `logging` en lugar de `debug`.
      debug: {}

    service:
      pipelines:
        traces:
          receivers: [otlp]
          processors: [memory_limiter, batch]
          exporters: [debug]
EOF
```

{{% alert title="Nota" %}}

Por defecto, el `opentelemetry-operator` usa la
[imagen `opentelemetry-collector`](https://github.com/open-telemetry/opentelemetry-collector-releases/pkgs/container/opentelemetry-collector-releases%2Fopentelemetry-collector).
Cuando el operator se instala usando
[Helm charts](/docs/platforms/kubernetes/helm/), se usa la imagen
[`opentelemetry-collector-k8s`](https://github.com/open-telemetry/opentelemetry-collector-releases/pkgs/container/opentelemetry-collector-releases%2Fopentelemetry-collector-k8s).
Si necesitas un componente que no se encuentra en estas versiones, es posible
que debas [construir tu propio collector](/docs/collector/custom-collector/).

{{% /alert %}}

Para más opciones de configuración y para configurar la inyección de
auto-instrumentación de las cargas de trabajo usando librerías de
instrumentación de OpenTelemetry, consulta el
[Operador de OpenTelemetry para Kubernetes](https://github.com/open-telemetry/opentelemetry-operator/blob/main/README.md).
