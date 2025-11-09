---
title: Install the Collector with Kubernetes
aliases: [/docs/collector/install/#kubernetes]
---

## Kubernetes

The following command deploys an agent as a daemonset and a single gateway
instance:

```sh
kubectl apply -f https://raw.githubusercontent.com/open-telemetry/opentelemetry-collector/v{{% param vers %}}/examples/k8s/otel-config.yaml
```

The previous example is meant to serve as a starting point, to be extended and
customized before actual production usage. For production-ready customization
and installation, see [OpenTelemetry Helm Charts][].

You can also use the [OpenTelemetry Operator][] to provision and maintain an
OpenTelemetry Collector instance, with features such as automatic upgrade
handling, `Service` configuration based on the OpenTelemetry configuration,
automatic sidecar injection into deployments, and more.

For guidance on how to use the Collector with Kubernetes, see
[Kubernetes Getting Started](/docs/platforms/kubernetes/getting-started/).

[opentelemetry helm charts]: /docs/platforms/kubernetes/helm/
[opentelemetry operator]: /docs/platforms/kubernetes/operator/
