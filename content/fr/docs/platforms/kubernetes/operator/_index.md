---
title: Opérateur OpenTelemetry pour Kubernetes
linkTitle: Opérateur Kubernetes
description:
  Une implémentation d'un opérateur Kubernetes, qui gère les collecteurs et
  l'auto-instrumentation de la charge de travail en utilisant les bibliothèques
  d'instrumentation OpenTelemetry.
aliases:
  - /docs/operator
  - /docs/k8s-operator
  - /docs/platforms/kubernetes-operator
redirects:
  - { from: /docs/operator/*, to: ':splat' }
  - { from: /docs/k8s-operator/*, to: ':splat' }
  - { from: /docs/platforms/kubernetes-operator/*, to: ':splat' }
default_lang_commit: 1253527a5bea528ae37339692e711925785343b1
---

## Introduction {#introduction}

L'[Opérateur OpenTelemetry](https://github.com/open-telemetry/opentelemetry-operator)
est une implémentation d'un
[Opérateur Kubernetes](https://kubernetes.io/docs/concepts/extend-kubernetes/operator/).

L'opérateur gère :

- [Collecteur OpenTelemetry](https://github.com/open-telemetry/opentelemetry-collector)
- [auto-instrumentation des charges de travail en utilisant les bibliothèques d'instrumentation OpenTelemetry](https://github.com/open-telemetry/opentelemetry-operator#opentelemetry-auto-instrumentation-injection)

## Démarrage {#getting-started}

Pour installer l'opérateur dans un cluster existant, assurez-vous que
[`cert-manager`](https://cert-manager.io/docs/installation/) est installé et
exécutez :

```bash
kubectl apply -f https://github.com/open-telemetry/opentelemetry-operator/releases/latest/download/opentelemetry-operator.yaml
```

Une fois le déploiement d'`opentelemetry-operator` prêt, créez une instance de
collecteur OpenTelemetry (otelcol) comme suit :

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
      # NOTE: Prior to v0.86.0 use `logging` instead of `debug`.
      debug: {}

    service:
      pipelines:
        traces:
          receivers: [otlp]
          processors: [memory_limiter, batch]
          exporters: [debug]
EOF
```

{{% alert title="Note" %}}

Par défaut, `opentelemetry-operator` utilise l'image
[`opentelemetry-collector`](https://github.com/open-telemetry/opentelemetry-collector-releases/pkgs/container/opentelemetry-collector-releases%2Fopentelemetry-collector).
Lorsque l'opérateur est installé en utilisant
[les charts Helm](/docs/platforms/kubernetes/helm/), l'image
[`opentelemetry-collector-k8s`](https://github.com/open-telemetry/opentelemetry-collector-releases/pkgs/container/opentelemetry-collector-releases%2Fopentelemetry-collector-k8s)
est utilisée. Si vous avez besoin d'un composant non disponible dans ces
versions, vous devrez peut-être
[construire votre propre collecteur](/docs/collector/custom-collector/).

{{% /alert %}}

Pour plus d'options de configuration et pour configurer l'injection de
l'auto-instrumentation des charges de travail via les bibliothèques
d'instrumentation OpenTelemetry, voir
[Opérateur OpenTelemetry pour Kubernetes](https://github.com/open-telemetry/opentelemetry-operator/blob/main/README.md).
