---
Title: Helm charts de OpenTelemetry
linkTitle: Helm charts
default_lang_commit: 68e94a4555606e74c27182b79789d46faf84ec25
---

## Introducción

[Helm](https://helm.sh/) es una solución en línea de comandos para administrar
aplicaciones de Kubernetes.

Si eliges usar Helm, puedes usar
[las charts de Helm para OpenTelemetry](https://github.com/open-telemetry/opentelemetry-helm-charts)
para gestionar las instalaciones del [OpenTelemetry Collector](/docs/collector),
[OpenTelemetry Operator](/docs/platforms/kubernetes/operator), y
[OpenTelemetry Demo](/docs/demo).

Agrega el repositorio Helm de OpenTelemetry con:

```sh
helm repo add open-telemetry https://open-telemetry.github.io/opentelemetry-helm-charts
```
