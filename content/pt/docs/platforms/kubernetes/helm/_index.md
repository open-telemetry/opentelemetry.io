---
title: OpenTelemetry Helm Charts
linkTitle: Helm Charts
default_lang_commit: 99a39c5e4e51daba968bfbb3eb078be4a14ad363
---

## Introdução

[Helm](https://helm.sh/) é uma solução de CLI para gerenciar aplicações
Kubernetes.

Para usar o
Helm, é possível utilizar os
[Helm Charts do OpenTelemetry](https://github.com/open-telemetry/opentelemetry-helm-charts)
para gerenciar instalações do [OpenTelemetry Collector](/docs/collector),
[OpenTelemetry Operator](/docs/platforms/kubernetes/operator) e da
[Demo do OpenTelemetry](/docs/demo).

Adicione o repositório Helm do OpenTelemetry com:

```sh
helm repo add open-telemetry https://open-telemetry.github.io/opentelemetry-helm-charts
```
