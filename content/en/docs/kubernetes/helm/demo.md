---
title: OpenTelemetry Demo Chart
linkTitle: Demo Chart
---

## Introduction

The [OpenTelemetry Demo](/docs/demo) is a microservice-based distributed system
intended to illustrate the implementation of OpenTelemetry in a near real-world
environment. As part of that effort, the OpenTelemetry community create the
[OpenTelemetry Demo Helm Chart](https://github.com/open-telemetry/opentelemetry-helm-charts/tree/main/charts/opentelemetry-demo)
so that it can be easily installed in Kubernetes.

### Installing the Chart

To install the chart with the release name `my-otel-demo`, run the following
command:

```sh
helm install my-otel-demo open-telemetry/opentelemetry-demo
```

Once installed, all services are made available via the Frontend proxy
(`http://localhost:8080`) by running these commands:

```sh
kubectl port-forward svc/my-otel-demo-frontendproxy 8080:8080
```

Once the proxy is exposed, you can also visit the following paths

| Component         | Path                             |
| ----------------- | -------------------------------- |
| Web store         | http://localhost:8080/           |
| Grafana           | http://localhost:8080/grafana/   |
| Feature Flags UI  | http://localhost:8080/feature/   |
| Load Generator UI | http://localhost:8080/loadgen/   |
| Jaeger UI         | http://localhost:8080/jaeger/ui/ |

In order for spans from the Web store to be collected you must expose the
OpenTelemetry Collector OTLP/HTTP receiver:

```sh
kubectl port-forward svc/my-otel-demo-otelcol 4318:4318
```

For more details on using the demo in Kubernetes see the
[Demo documentation](/docs/demo/kubernetes-deployment/).

### Configuration

The Demo helm chart's default `values.yaml` is ready to be installed. All
components have had their memory limits tuned to optimize performance, which may
cause issues if your cluster is not large enough. The entire installation is
restricted to ~3.5 Gigabytes of memory, but may use less.

All the configuration options (with comments) available in the chart can be
viewed in its
[values.yaml file](https://github.com/open-telemetry/opentelemetry-helm-charts/blob/main/charts/opentelemetry-operator/values.yaml),
and detailed descriptions can be found in the
[chart's README](https://github.com/open-telemetry/opentelemetry-helm-charts/tree/main/charts/opentelemetry-demo#chart-parameters).
