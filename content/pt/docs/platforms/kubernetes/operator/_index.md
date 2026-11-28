---
title: OpenTelemetry Operator para Kubernetes
linkTitle: Kubernetes Operator
description:
  Uma implementação de um Kubernetes Operator, que gerencia Collectors e a
  instrumentação automática das cargas de trabalho usando bibliotecas de
  instrumentação do OpenTelemetry.
aliases:
  - /docs/operator
  - /docs/k8s-operator
  - /docs/platforms/kubernetes-operator
redirects:
  - { from: /docs/operator/*, to: ':splat' }
  - { from: /docs/k8s-operator/*, to: ':splat' }
  - { from: /docs/platforms/kubernetes-operator/*, to: ':splat' }
default_lang_commit: 48d3ff356dc39a3b1323637f3163d435dc751228
---

## Introdução {#introduction}

O
[OpenTelemetry Operator](https://github.com/open-telemetry/opentelemetry-operator)
é uma implementação de um
[Kubernetes Operator](https://kubernetes.io/docs/concepts/extend-kubernetes/operator/).

O operador gerencia:

- [OpenTelemetry Collector](https://github.com/open-telemetry/opentelemetry-collector)
- [instrumentação automática das cargas de trabalho usando bibliotecas de instrumentação do OpenTelemetry](https://github.com/open-telemetry/opentelemetry-operator/blob/main/docs/auto-instrumentation/README.md)

## Primeiros passos {#getting-started}

Para instalar o operador em um cluster existente, certifique-se de que o
[`cert-manager`](https://cert-manager.io/docs/installation/) está instalado e
execute:

```bash
kubectl apply -f https://github.com/open-telemetry/opentelemetry-operator/releases/latest/download/opentelemetry-operator.yaml
```

Assim que o _deployment_ `opentelemetry-operator` estiver pronto, crie uma
instância do OpenTelemetry Collector (otelcol), como:

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
> Por padrão, o `opentelemetry-operator` utiliza a
> [imagem `opentelemetry-collector`](https://github.com/open-telemetry/opentelemetry-collector-releases/pkgs/container/opentelemetry-collector-releases%2Fopentelemetry-collector).
> Quando o operador é instalado usando
> [Helm charts](/docs/platforms/kubernetes/helm/), a
> [imagem `opentelemetry-collector-k8s`](https://github.com/open-telemetry/opentelemetry-collector-releases/pkgs/container/opentelemetry-collector-releases%2Fopentelemetry-collector-k8s)
> é utilizada. Se você precisar de um componente que não esteja presente nessas
> versões, talvez seja necessário
> [construir o seu próprio Collector](/docs/collector/extend/ocb/).

Para mais opções de configuração e para configurar a injeção de instrumentação
automática nas cargas de trabalho usando bibliotecas de instrumentação do
OpenTelemetry, consulte
[OpenTelemetry Operator para Kubernetes](https://github.com/open-telemetry/opentelemetry-operator/blob/main/README.md).
