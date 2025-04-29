---
title: OpenTelemetry Operator for Kubernetes
linkTitle: Kubernetes Operator
description:
  An implementation of a Kubernetes Operator, that manages collectors and
  auto-instrumentation of the workload using OpenTelemetry instrumentation
  libraries.
aliases:
  - /docs/operator
  - /docs/k8s-operator
  - /docs/platforms/kubernetes-operator
redirects:
  - { from: /docs/operator/*, to: ':splat' }
  - { from: /docs/k8s-operator/*, to: ':splat' }
  - { from: /docs/platforms/kubernetes-operator/*, to: ':splat' }
---

## Introduction

The
[OpenTelemetry Operator](https://github.com/open-telemetry/opentelemetry-operator)
is an implementation of a
[Kubernetes Operator](https://kubernetes.io/docs/concepts/extend-kubernetes/operator/).

The operator manages:

- [OpenTelemetry Collector](https://github.com/open-telemetry/opentelemetry-collector)
- [auto-instrumentation of the workloads using OpenTelemetry instrumentation libraries](https://github.com/open-telemetry/opentelemetry-operator#opentelemetry-auto-instrumentation-injection)

## Getting started

To install the operator in an existing cluster, make sure you have cert-manager
installed and run:

```bash
kubectl apply -f https://github.com/open-telemetry/opentelemetry-operator/releases/latest/download/opentelemetry-operator.yaml
```

Once the `opentelemetry-operator` deployment is ready, create an OpenTelemetry
Collector (otelcol) instance, like:

```console
$ kubectl apply -f - <<EOF
apiVersion: opentelemetry.io/v1alpha1
kind: OpenTelemetryCollector
metadata:
  name: simplest
spec:
  config: |
    receivers:
      otlp:
        protocols:
          grpc:
            endpoint: 0.0.0.0:4317
          http:
            endpoint: 0.0.0.0:4318
    processors:

    exporters:
      # NOTE: Prior to v0.86.0 use `logging` instead of `debug`.
      debug:

    service:
      pipelines:
        traces:
          receivers: [otlp]
          processors: []
          exporters: [debug]
EOF
```

{{% alert color="primary" title="NOTE" %}}
By default the opentelemetry-operator uses the
[opentelemetry-collector](https://github.com/open-telemetry/opentelemetry-collector-releases/pkgs/container/opentelemetry-collector-releases%2Fopentelemetry-collector)
image. If the operator is installed using
[the Helm chart](https://github.com/open-telemetry/opentelemetry-helm-charts/tree/main/charts/opentelemetry-operator),
the default image is
[opentelemetry-collector-k8s](https://github.com/open-telemetry/opentelemetry-collector-releases/pkgs/container/opentelemetry-collector-releases%2Fopentelemetry-collector-k8s).
If you need a component not found in those releases, it's recommended to build
your own collector. See [Building a custom collector](https://opentelemetry.io/docs/collector/custom-collector/).
{{% /alert %}}
For more configuration options and for setting up the injection of
auto-instrumentation of the workloads using OpenTelemetry instrumentation
libraries, continue reading
[here](https://github.com/open-telemetry/opentelemetry-operator/blob/main/README.md).
