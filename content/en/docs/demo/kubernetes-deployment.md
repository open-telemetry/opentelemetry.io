---
title: Kubernetes deployment
linkTitle: Kubernetes
aliases: [kubernetes_deployment]
cSpell:ignore: loadgen otlphttp spanmetrics
---

We provide a [OpenTelemetry Demo Helm chart](/docs/kubernetes/helm/demo/) to
help deploy the demo to an existing Kubernetes cluster.

[Helm](https://helm.sh) must be installed to use the charts. Please refer to
Helm's [documentation](https://helm.sh/docs/) to get started.

## Prerequisites

- Kubernetes 1.24+
- 6 GB of free RAM for the application
- Helm 3.14+ (for Helm installation method only)

## Install using Helm (recommended)

Add OpenTelemetry Helm repository:

```shell
helm repo add open-telemetry https://open-telemetry.github.io/opentelemetry-helm-charts
```

To install the chart with the release name my-otel-demo, run the following
command:

```shell
helm install my-otel-demo open-telemetry/opentelemetry-demo
```

{{% alert title="Note" color="info" %}}

The OpenTelemetry Demo Helm chart does not support being upgraded from one
version to another. If you need to upgrade the chart, you must first delete the
existing release and then install the new version.

{{% /alert %}}

{{% alert title="Note" color="info" %}}

The OpenTelemetry Demo Helm chart version 0.11.0 or greater is required to
perform all usage methods mentioned below.

{{% /alert %}}

## Install using kubectl

The following command will install the demo application to your Kubernetes
cluster.

```shell
kubectl apply --namespace otel-demo -f https://raw.githubusercontent.com/open-telemetry/opentelemetry-demo/main/kubernetes/opentelemetry-demo.yaml
```

{{% alert title="Note" color="info" %}}

The OpenTelemetry Demo Kubernetes manifests do not support being upgraded from
one version to another. If you need to upgrade the demo, you must first delete
the existing resources and then install the new version.

{{% /alert %}}

{{% alert title="Note" color="info" %}}

These manifests are generated from the Helm chart and are provided for
convenience. It is recommended to use the Helm chart for installation.

{{% /alert %}}

## Use the Demo

The demo application will need the services exposed outside of the Kubernetes
cluster in order to use them. You can expose the services to your local system
using the `kubectl port-forward` command or by configuring service types (ie:
LoadBalancer) with optionally deployed ingress resources.

### Expose services using kubectl port-forward

To expose the frontendproxy service use the following command (replace
`my-otel-demo` with your Helm chart release name accordingly):

```shell
kubectl port-forward svc/my-otel-demo-frontendproxy 8080:8080
```

{{% alert title="Note" color="info" %}}

`kubectl port-forward` proxies the port until the process terminates. You might
need to create separate terminal sessions for each use of
`kubectl port-forward`, and use <kbd>Ctrl-C</kbd> to terminate the process when
done.

{{% /alert %}}

With the frontendproxy port-forward set up, you can access:

- Web store: <http://localhost:8080/>
- Grafana: <http://localhost:8080/grafana/>
- Load Generator UI: <http://localhost:8080/loadgen/>
- Jaeger UI: <http://localhost:8080/jaeger/ui/>
- Flagd configurator UI: <http://localhost:8080/feature>

### Expose Demo components using service or ingress configurations

{{% alert title="Note" color="info" %}} We recommend that you use a values file
when installing the Helm chart in order to specify additional configuration
options. {{% /alert %}}

#### Configure ingress resources

{{% alert title="Note" color="info" %}}

Kubernetes clusters might not have the proper infrastructure components to
enable LoadBalancer service types or ingress resources. Verify your cluster has
the proper support before using these configuration options.

{{% /alert %}}

Each demo component (ie: frontendproxy) offers a way to have its Kubernetes
service type configured. By default, these will not be created, but you can
enable and configure them through the `ingress` property of each component.

To configure the frontendproxy component to use an ingress resource you would
specify the following in your values file:

```yaml
components:
  frontendProxy:
    ingress:
      enabled: true
      annotations: {}
      hosts:
        - host: otel-demo.my-domain.com
          paths:
            - path: /
              pathType: Prefix
              port: 8080
```

Some ingress controllers require special annotations or service types. Refer to
the documentation from your ingress controller for more information.

#### Configure service types

Each demo component (ie: frontendproxy) offers a way to have its Kubernetes
service type configured. By default, these will be `ClusterIP` but you can
change each one using the `service.type` property of each component.

To configure the frontendproxy component to use a LoadBalancer service type you
would specify the following in your values file:

```yaml
components:
  frontendProxy:
    service:
      type: LoadBalancer
```

#### Configure browser telemetry

In order for spans from the browser to be properly collected, you will also need
to specify the location where the OpenTelemetry Collector is exposed. The
frontendproxy defines a route for the collector with a path prefix of
`/otlp-http`. You can configure the collector endpoint by setting the following
environment variable on the frontend component:

```yaml
components:
  frontend:
    envOverrides:
      - name: PUBLIC_OTEL_EXPORTER_OTLP_TRACES_ENDPOINT
        value: http://otel-demo.my-domain.com/otlp-http/v1/traces
```

## Bring your own backend

Likely you want to use the web store as a demo application for an observability
backend you already have (e.g. an existing instance of Jaeger, Zipkin, or one of
the [vendor of your choice](/ecosystem/vendors/).

The OpenTelemetry Collector's configuration is exposed in the Helm chart. Any
additions you do will be merged into the default configuration. You can use this
to add your own exporters, and add them to the desired pipeline(s)

```yaml
opentelemetry-collector:
  config:
    exporters:
      otlphttp/example:
        endpoint: <your-endpoint-url>

    service:
      pipelines:
        traces:
          exporters: [spanmetrics, otlphttp/example]
```

{{% alert title="Note" color="info" %}} When merging YAML values with Helm,
objects are merged and arrays are replaced. The `spanmetrics` exporter must be
included in the array of exporters for the `traces` pipeline if overridden. Not
including this exporter will result in an error. {{% /alert %}}

Vendor backends might require you to add additional parameters for
authentication, please check their documentation. Some backends require
different exporters, you may find them and their documentation available at
[opentelemetry-collector-contrib/exporter](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/exporter).

To install the Helm chart with a custom `my-values-file.yaml` values file use:

```shell
helm install my-otel-demo open-telemetry/opentelemetry-demo --values my-values-file.yaml
```
