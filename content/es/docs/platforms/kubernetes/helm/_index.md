---
Title: Helm Charts de OpenTelemetry
linkTitle: Helm Charts
default_lang_commit: 68e94a4555606e74c27182b79789d46faf84ec25
---

## Introducción

[Helm](https://helm.sh/) es una solución CLI para administrar aplicaciones de
Kubernetes.

Si eliges usar Helm, puedes usar [OpenTelemetry Helm Charts]
(https://github.com/open-telemetry/opentelemetry-helm-charts) para gestionar las
instalaciones del [OpenTelemetry Collector](/docs/collector),
[OpenTelemetry Operator](/docs/kubernetes/operator), y
[OpenTelemetry Demo](/docs/demo).

Agrega el repositorio Helm de OpenTelemetry con:

```sh
helm repo add open-telemetry https://open-telemetry.github.io/opentelemetry-helm-charts
```
