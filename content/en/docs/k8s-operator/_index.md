---
title: OpenTelemetry Operator for Kubernetes
linkTitle: K8s Operator
weight: 11
description:
  An implementation of a Kubernetes Operator, that
  manages collectors and auto-instrumentation of the workload using OpenTelemetry
  instrumentation libraries.
spelling: cSpell:ignore Otel
aliases: [/docs/operator]
---

## Introduction

The OpenTelemetry Operator is an implementation of a [Kubernetes Operator](https://coreos.com/operators/).

The operator manages:

- OpenTelemetry Collector
- [auto-instrumentation of the workloads using OpenTelemetry instrumentation libraries](https://github.com/open-telemetry/opentelemetry-operator#opentelemetry-auto-instrumentation-injection)

## Getting started

To install the operator in an existing cluster, make sure you have cert-manager 
installed and run:

```bash
$ kubectl apply -f https://github.com/open-telemetry/opentelemetry-operator/releases/latest/download/opentelemetry-operator.yaml
```

Once the `opentelemetry-operator` deployment is ready, create an OpenTelemetry
 Collector (otelcol) instance, like:

```bash
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
          http:
    processors:

    exporters:
      logging:

    service:
      pipelines:
        traces:
          receivers: [otlp]
          processors: []
          exporters: [logging]
EOF
```

For more configuration options and for setting up the injetion of
auto-instrumentation of the workloads using OpenTelemetry instrumentation
libraries, continue reading [here](https://github.com/open-telemetry/opentelemetry-operator/blob/main/README.md).

## Helm Chart

You can install the OpenTelemetry Operator into a Kubernetes cluster with
the [OpenTelemetry Operator Helm Chart](https://github.com/open-telemetry/opentelemetry-helm-charts/tree/main/charts/opentelemetry-operator)
