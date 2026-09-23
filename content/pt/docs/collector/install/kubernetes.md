---
title: Instalar o Collector com Kubernetes
linkTitle: Kubernetes
weight: 200
default_lang_commit: 9f912d59a165ded5dec82d0e1a94c2aef54e5c57
---

Use o seguinte comando para instalar o OpenTelemetry Collector como um DaemonSet
e uma única instância de gateway:

```sh
kubectl apply -f https://raw.githubusercontent.com/open-telemetry/opentelemetry-collector/v{{% param vers %}}/examples/k8s/otel-config.yaml
```

Este exemplo serve como ponto de partida. Para personalização e instalação
prontas para produção, consulte os [OpenTelemetry Helm Charts][].

Também é possível usar o [OpenTelemetry Operator][] para provisionar e manter
uma instância do OpenTelemetry Collector. O Operator inclui recursos como
gerenciamento automático de atualizações, configuração de `Service` baseada na
configuração do OpenTelemetry, injeção automática de _sidecar_ em implantações e
mais.

Para orientações sobre como usar o Collector com Kubernetes, consulte os
[Primeiros passos com Kubernetes](/docs/platforms/kubernetes/getting-started/).

[opentelemetry helm charts]: /docs/platforms/kubernetes/helm/
[opentelemetry operator]: /docs/platforms/kubernetes/operator/
