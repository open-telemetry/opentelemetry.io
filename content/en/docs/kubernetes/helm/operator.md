---
title: OpenTelemetry Operator Chart
linkTitle: Operator Chart
---

## Introduction

The [OpenTelemetry Operator](/docs/kubernetes/operator) is a Kubernetes operator
that manages [OpenTelemetry Collectors](/docs/collector) and
auto-instrumentation of workloads. One of the ways to install the OpenTelemetry
Operator is via the
[OpenTelemetry Operator Helm Chart](https://github.com/open-telemetry/opentelemetry-helm-charts/tree/main/charts/opentelemetry-operator).

For detailed use of the OpenTelemetry Operator visit its
[docs](/docs/kubernetes/operator).

### Installing the Chart

To install the chart with the release name `my-opentelemetry-operator`, run the
following commands:

```console
helm repo add open-telemetry https://open-telemetry.github.io/opentelemetry-helm-charts
helm install my-opentelemetry-operator open-telemetry/opentelemetry-operator \
  --set admissionWebhooks.certManager.enabled=false \
  --set admissionWebhooks.certManager.autoGenerateCert=true
```

This will install an OpenTelemetry Operator with a self-signed certificate and
secret.

### Configuration

The Operator helm chart's default `values.yaml` is ready to be installed, but it
expects that Cert Manager is already present on the Cluster.

In Kubernetes, in order for the API server to communicate with the webhook
component, the webhook requires a TLS certificate that the API server is
configured to trust. There are a few different ways you can use to
generate/configure the required TLS certificate.

- The easiest and default method is to install the
  [cert-manager](https://cert-manager.io/docs/) and set
  `admissionWebhooks.certManager.create` to `true`. In this way, cert-manager
  will generate a self-signed certificate. See
  [cert-manager installation](https://cert-manager.io/docs/installation/kubernetes/)
  for more details.
- You can provide your own Issuer by configuring the
  `admissionWebhooks.certManager.issuerRef` value. You will need to specify the
  `kind` (Issuer or ClusterIssuer) and the `name`. Note that this method also
  requires the installation of cert-manager.
- You can use an automatically generated self-signed certificate by setting
  `admissionWebhooks.certManager.enabled` to `false` and
  `admissionWebhooks.autoGenerateCert` to `true`. Helm will create a self-signed
  cert and a secret for you.
- You can use your own generated self-signed certificate by setting both
  `admissionWebhooks.certManager.enabled` and
  `admissionWebhooks.autoGenerateCert` to `false`. You should provide the
  necessary values to `admissionWebhooks.cert_file`,
  `admissionWebhooks.key_file`, and `admissionWebhooks.ca_file`.
- You can side-load custom webhooks and certificate by disabling
  `.Values.admissionWebhooks.create` and `admissionWebhooks.certManager.enabled`
  while setting your custom cert secret name in `admissionWebhooks.secretName`
- You can disable webhooks all together by disabling
  `.Values.admissionWebhooks.create` and setting env var to
  `ENABLE_WEBHOOKS: "false"`

All the configuration options (with comments) available in the chart can be
viewed in its
[values.yaml file](https://github.com/open-telemetry/opentelemetry-helm-charts/blob/main/charts/opentelemetry-operator/values.yaml).
