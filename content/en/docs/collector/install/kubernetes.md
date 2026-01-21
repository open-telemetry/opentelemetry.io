---
title: Install the Collector with Kubernetes
linkTitle: Kubernetes
weight: 200
---

Use the following command to install the OpenTelemetry Collector as a DaemonSet
and a single gateway instance:

```sh
kubectl apply -f https://raw.githubusercontent.com/open-telemetry/opentelemetry-collector/v{{% param vers %}}/examples/k8s/otel-config.yaml
```

This example serves as a starting point. For production-ready customization and
installation, see [OpenTelemetry Helm Charts][].

You can also use the [OpenTelemetry Operator][] to provision and maintain an
OpenTelemetry Collector instance. The Operator includes features such as
automatic upgrade handling, `Service` configuration based on the OpenTelemetry
configuration, automatic sidecar injection into deployments, and more.

For guidance on how to use the Collector with Kubernetes, see
[Kubernetes Getting Started](/docs/platforms/kubernetes/getting-started/).

[opentelemetry helm charts]: /docs/platforms/kubernetes/helm/
[opentelemetry operator]: /docs/platforms/kubernetes/operator/
