---
title: Install the Collector with Kubernetes
redirect_from:
  - /docs/collector/installation/#kubernetes
---

## Kubernetes

To deploy the Collector using Kubernetes manifests:

```bash
kubectl apply -f https://raw.githubusercontent.com/open-telemetry/opentelemetry-collector/main/examples/k8s/otel-collector.yaml
```

To verify:

```bash
kubectl get pods -n default
```

To customize settings:

```bash
kubectl apply -f your-custom-config.yaml
```
