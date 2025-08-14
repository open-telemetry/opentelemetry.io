---
title: Deploy OBI in Kubernetes with Helm
linkTitle: Helm chart
description: Learn how to deploy OBI as a Helm chart in Kubernetes.
weight: 3
build:
  list: never
draft: true
toc_hide: true
---

{{% alert title="Note" %}}

For more details about the diverse Helm configuration options, check out the
[OBI Helm chart options](https://github.com/open-telemetry/opentelemetry-helm-charts/)
document.

{{% /alert %}}

Contents:

<!-- TOC -->

- [Deploying OBI from helm](#deploying-obi-from-helm)
- [Configuring OBI](#configuring-obi)
- [Configuring OBI metadata](#configuring-obi-metadata)
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
[OBI Helm chart documentation](https://github.com/open-telemetry/opentelemetry-helm-charts/)
describes the diverse configuration options.

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
