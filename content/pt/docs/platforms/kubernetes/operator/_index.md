---
title: OpenTelemetry Operator para Kubernetes
linkTitle: Operador Kubernetes
description:
  Uma implementação de um operador Kubernetes que gerencia Collectors e
  auto-instrumentação de cargas de trabalho usando bibliotecas de instrumentação
  do OpenTelemetry.
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
[operador Kubernetes](https://kubernetes.io/docs/concepts/extend-kubernetes/operator/).

O operador gerencia:

- [OpenTelemetry Collector](https://github.com/open-telemetry/opentelemetry-collector)
- [auto-instrumentação de cargas de trabalho com bibliotecas de instrumentação do OpenTelemetry](https://github.com/open-telemetry/opentelemetry-operator/blob/main/docs/auto-instrumentation/README.md)

## Primeiros passos {#getting-started}

Para instalar o operador em um cluster existente, certifique-se que você tem o
[`cert-manager`](https://cert-manager.io/docs/installation/) instalado e
execute:

```bash
kubectl apply -f https://github.com/open-telemetry/opentelemetry-operator/releases/latest/download/opentelemetry-operator.yaml
```

Quando o Deployment do `opentelemetry-operator` estiver pronto, crie uma
instância do OpenTelemetry Collector (`otelcol`), por exemplo:

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
      # OBSERVAÇÃO: antes da v0.86.0, use `logging` em vez de `debug`.
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
> Por padrão, o `opentelemetry-operator` usa a imagem
> [`opentelemetry-collector`](https://github.com/open-telemetry/opentelemetry-collector-releases/pkgs/container/opentelemetry-collector-releases%2Fopentelemetry-collector).
> Quando o operador é instalado usando
> [Helm charts](/docs/platforms/kubernetes/helm/), é usada a imagem
> [`opentelemetry-collector-k8s`](https://github.com/open-telemetry/opentelemetry-collector-releases/pkgs/container/opentelemetry-collector-releases%2Fopentelemetry-collector-k8s).
> Se precisar de um componente que não esteja disponível nessas versões, talvez
> seja necessário [compilar seu próprio Collector](/docs/collector/extend/ocb/).

Para ver mais opções de configuração e saber como configurar a injeção da
auto-instrumentação de cargas de trabalho usando as bibliotecas de
instrumentação do OpenTelemetry, consulte o
[OpenTelemetry Operator para Kubernetes](https://github.com/open-telemetry/opentelemetry-operator/blob/main/README.md).
