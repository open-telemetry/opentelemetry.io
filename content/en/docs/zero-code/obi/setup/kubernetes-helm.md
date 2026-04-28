---
title: Deploy OBI in Kubernetes with Helm
linkTitle: Helm chart
description: Learn how to deploy OBI as a Helm chart in Kubernetes.
weight: 2
---

> [!NOTE]
>
> For more details about the diverse Helm configuration options, check out the
> [OBI Helm chart documentation](https://github.com/open-telemetry/opentelemetry-helm-charts/tree/main/charts/opentelemetry-ebpf-instrumentation)
> or browse the chart on
> [Artifact Hub](https://artifacthub.io/packages/helm/opentelemetry-helm/opentelemetry-ebpf-instrumentation).
> For detailed configuration parameters, see the
> [values.yaml](https://github.com/open-telemetry/opentelemetry-helm-charts/blob/main/charts/opentelemetry-ebpf-instrumentation/values.yaml)
> file.

Contents:

<!-- TOC -->

- [Deploying OBI from helm](#deploying-obi-from-helm)
- [Configuring OBI](#configuring-obi)
- [Configuring OBI metadata](#configuring-obi-metadata)
- [Centralizing Kubernetes metadata with k8s-cache](#centralizing-kubernetes-metadata-with-k8s-cache)
- [Providing secrets to the Helm configuration](#providing-secrets-to-the-helm-configuration)
<!-- TOC -->

## Deploying OBI from helm

First, you need to add the OpenTelemetry helm repository to Helm:

```sh
helm repo add open-telemetry https://open-telemetry.github.io/opentelemetry-helm-charts
```

The following command deploys a OBI DaemonSet with a default configuration in
the `obi` namespace:

```sh
helm install obi -n obi --create-namespace open-telemetry/opentelemetry-ebpf-instrumentation
```

The default OBI configuration:

- exports the metrics as Prometheus metrics in the Pod HTTP port `9090`,
  `/metrics` path.
- tries to instrument all the applications in your cluster.
- only provides application-level metrics and excludes
  [network-level metrics](../../network/) by default
- configures OBI to decorate the metrics with Kubernetes metadata labels, for
  example `k8s.namespace.name` or `k8s.pod.name`

## Configuring OBI

You might want to override the default configuration of OBI. For example, to
export the metrics and/or spans as OpenTelemetry instead of Prometheus, or to
restrict the number of services to instrument.

You can override the default [OBI configuration options](../../configure/) with
your own values.

For example, create a `helm-obi.yml` file with a custom configuration:

```yaml
config:
  data:
    # Contents of the actual OBI configuration file
    discovery:
      instrument:
        - k8s_namespace: demo
        - k8s_namespace: blog
    routes:
      unmatched: heuristic
```

The `config.data` section contains a OBI configuration file, documented in the
[OBI configuration options documentation](../../configure/options/).

Then pass the overridden configuration to the `helm` command with the `-f` flag.
For example:

```sh
helm install obi open-telemetry/opentelemetry-ebpf-instrumentation -f helm-obi.yml
```

or, if the OBI chart was previously deployed:

```sh
helm upgrade obi open-telemetry/opentelemetry-ebpf-instrumentation -f helm-obi.yml
```

## Configuring OBI metadata

If OBI exports the data using the Prometheus exporter, you might need to
override the OBI Pod annotations to let it be discoverable by your Prometheus
scraper. You can add the following section to the example `helm-obi.yml` file:

```yaml
podAnnotations:
  prometheus.io/scrape: 'true'
  prometheus.io/path: '/metrics'
  prometheus.io/port: '9090'
```

Analogously, the Helm chart allows overriding names, labels, and annotations for
multiple resources involved in the deployment of OBI, such as service accounts,
cluster roles, security contexts, etc. The
[OBI Helm chart documentation](https://github.com/open-telemetry/opentelemetry-helm-charts/tree/main/charts/opentelemetry-ebpf-instrumentation)
describes the diverse configuration options.

## Centralizing Kubernetes metadata with k8s-cache

By default each OBI Pod opens its own connections to the Kubernetes API server
to watch Pod, Node, and Service metadata, not only from its local node, but from
the entire K8S cluster. This is done in order to enrich not only the source of
the request, but the destination info (for example, getting the service name for
an outbound HTTP request to add
[peer](/docs/specs/semconv/registry/attributes/service/#service-attributes-for-peer-services)
attributes, or for
[service graph](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/connector/servicegraphconnector)
metric destination). Querying the full K8S cluster metadata on large clusters
from each OBI pod can overload the API server and affect the whole cluster.

To avoid that, the OBI Helm chart can deploy a small companion service called
`k8s-cache`. The cache watches the Kubernetes API once on behalf of all OBI Pods
and streams metadata to them over gRPC, which removes OBI's per-Pod informer
traffic to the API server and substantially reduces API load. For more
background on what `k8s-cache` is and when to use it, see the
[Kubernetes setup guide](../kubernetes/#centralizing-kubernetes-metadata-with-k8s-cache).

To enable it, set `k8sCache.replicas` to a non-zero value in your
`helm-obi.yml`:

```yaml
k8sCache:
  replicas: 1
```

A single replica is usually enough. For high availability or very large
clusters, increase the replica count — OBI Pods will load-balance across them
through the cache `Service` and reconnect to a healthy replica on failure.

When `k8sCache.replicas` is `0` (the default), the cache is not deployed and
each OBI Pod uses its own local informers.

## Providing secrets to the Helm configuration

If you are submitting directly the metrics and traces to your observability
backend via the OpenTelemetry Endpoint, you might need to provide credentials
via the `OTEL_EXPORTER_OTLP_HEADERS` environment variable.

The recommended way is to store such value in a Kubernetes Secret and then
specify the environment variable referring to it from the Helm configuration.

For example, deploy the following secret:

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: obi-secret
type: Opaque
stringData:
  otlp-headers: 'Authorization=Basic ....'
```

Then refer to it from the `helm-config.yml` file via the `envValueFrom` section:

```yaml
env:
  OTEL_EXPORTER_OTLP_ENDPOINT: '<...your OTLP endpoint URL...>'
envValueFrom:
  OTEL_EXPORTER_OTLP_HEADERS:
    secretKeyRef:
      key: otlp-headers
      name: obi-secret
```
