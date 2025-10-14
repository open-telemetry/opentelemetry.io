---
title:
  Things You Might Not Have Known About the OpenTelemetry Operator - An OTel
  Operator Q&A
linkTitle: OTel Operator Q&A
date: 2024-05-13
author: '[Adriana Villela](https://github.com/avillela) (ServiceNow)'
canonical_url: https://adri-v.medium.com/81d63addbf92
cSpell:ignore: automagically mycollector
---

![Seattle's Mount Rainier rising about the clouds, as seen from an airplane. Photo by Adriana Villela](mount-rainier.jpg)

The
[OpenTelemetry (OTel) Operator](https://github.com/open-telemetry/opentelemetry-operator)
is a
[Kubernetes Operator](https://kubernetes.io/docs/concepts/extend-kubernetes/operator/)
that manages OTel for you in your Kubernetes cluster to make life a little
easier. It does the following:

- Manages deployment of the [OpenTelemetry Collector](/docs/collector/),
  supported by the
  [`OpenTelemetryCollector`](https://github.com/open-telemetry/opentelemetry-operator?tab=readme-ov-file#getting-started)
  [custom resource (CR)](https://kubernetes.io/docs/concepts/extend-kubernetes/api-extension/custom-resources/).
- Manages the configuration of a fleet of OpenTelemetry Collectors via
  [OpAMP](/docs/specs/opamp/) integration, supported by the
  [`OpAMPBridge`](https://github.com/open-telemetry/opentelemetry-operator/blob/main/docs/api/opampbridges.md)
  custom resource.
- Provides
  [integration with the Prometheus Operator's `PodMonitor` and `ServiceMonitor` CRs](https://github.com/open-telemetry/opentelemetry-operator/tree/main/cmd/otel-allocator).
- Injects and configures
  [autoinstrumentation](https://www.honeycomb.io/blog/what-is-auto-instrumentation)
  into your pods, supported by the
  [`Instrumentation`](https://github.com/open-telemetry/opentelemetry-operator?tab=readme-ov-file#opentelemetry-auto-instrumentation-injection)
  custom resource.

I've had a chance to use the Operator in the last year, and learned some pretty
cool things, so I thought it might be helpful to share some little OTel Operator
goodies that I’ve picked up along the way, in the form of a Q&A.

Please note that this post assumes that you have some familiarity with
OpenTelemetry, the [OpenTelemetry Collector](/docs/collector/), the
[OpenTelemetry Operator](https://github.com/open-telemetry/opentelemetry-operator)
(including the
[Target Allocator](https://adri-v.medium.com/prometheus-opentelemetry-better-together-41dc637f2292)),
and [Kubernetes](https://kubernetes.io).

## Q&A

### Q1: Does the Operator support multiple Collector configuration sources?

Short answer: No.

Longer answer: OTel Collector can be fed more than one Collector config YAML
file. That way, you can keep your base configurations in, say,
`otelcol-config.yaml`, and overrides or additions to the base configuration can
go in, for example, `otelcol-config-extras.yaml`. See an example of this in the
[OTel Demo’s Docker compose file](https://github.com/open-telemetry/opentelemetry-demo/blob/06f020c97f78ae9625d3a4a5d1107c55045c567f/docker-compose.yml#L665-L668).

Unfortunately, while the OTel Collector supports multiple Collector
configuration files, the Collector managed by the OTel Operator does not.

To get around this, you could merge the multiple Collector configs through some
external tool beforehand. For example, if you
[were deploying the Operator via Helm](https://github.com/open-telemetry/opentelemetry-helm-charts/tree/main/charts/opentelemetry-operator),
you could technically
[pass it multiple Collector config files using multiple --values flags](https://stackoverflow.com/a/56653384)
and let [Helm](https://helm.sh) do the merging for you.

> **NOTE:** There are plans to offer higher-level constructs for specifying
> configurations in the future, as per
> [this PR](https://github.com/open-telemetry/opentelemetry-operator/issues/1906).

For reference,
[check out this thread in the #otel-operator CNCF Slack channel](https://cloud-native.slack.com/archives/C033BJ8BASU/p1709321896612279).

### Q2: How can I securely reference access tokens in the Collector's configuration?

In order to send OpenTelemetry data to an observability backend, you must define
at least one [exporter](/docs/collector/configuration/#exporters). Whether you
use [OTLP](/docs/specs/otel/protocol/) or
[some proprietary vendor format](/docs/specs/otel/protocol/), most exporters
typically require that you specify an endpoint and an access token when sending
data to a vendor backend.

When using the OpenTelemetry Operator to manage the OTel Collector, the OTel
Collector config YAML is defined in the
[OpenTelemetryCollector](https://github.com/open-telemetry/opentelemetry-operator?tab=readme-ov-file#getting-started)
CR. This file should be version-controlled and therefore shouldn’t contain any
sensitive data, including access tokens stored as plain text.

Fortunately, the `OpenTelemetryCollector` CR gives us a way to reference that
value as a secret. Here’s how you do it:

1- Create a Kubernetes secret for your access token. Remember to
[base-64 encode](https://www.base64encode.org/) the secret.

2-
[Expose the secret as an environment variable](https://kubernetes.io/docs/concepts/configuration/secret/#using-a-secret)
by adding it to the `OpenTelemetryCollector` CR’s
[`env` section](https://github.com/avillela/otel-target-allocator-talk/blob/21e9643e28165e39bd79f3beec7f2b1f989d87e9/src/resources/02-otel-collector-ls.yml#L16-L21).
For example:

```yaml
env:
  - name: TOKEN_VALUE
    valueFrom:
      secretKeyRef:
        key: TOKEN_VALUE
        name: otel-collector-secret
```

3- Reference the environment variable in your
[exporter definition](https://github.com/avillela/otel-target-allocator-talk/blob/21e9643e28165e39bd79f3beec7f2b1f989d87e9/src/resources/02-otel-collector-ls.yml#L43-L47):

```yaml
exporters:
  otlp:
    endpoint: '<your_backend_endpoint_here>'
    headers:
      '<token_name>': '${TOKEN_VALUE}'
```

For more info, see the
[full example](https://github.com/avillela/otel-target-allocator-talk/blob/main/src/resources/02-otel-collector-ls.yml),
along with the
[instructions](https://github.com/avillela/otel-target-allocator-talk/tree/main?tab=readme-ov-file#3b--kubernetes-deployment-servicenow-cloud-observability-backend).

### Q3: Is the Operator version at parity with the Collector version?

For every Collector release, there is an Operator release which provides support
for that Collector version. For example, at the time of this writing, the latest
Operator version is 0.98.0. Thus, the default image of the Collector used by the
Operator is version 0.98.0 of the
[core distribution](/blog/2024/otel-collector-anti-patterns/#3--not-using-the-right-collector-distribution-or-not-building-your-own-distribution)
(as opposed to the contrib distribution).

### Q4: Can I override the base OTel Collector image?

Yes! In fact,
[you probably should](https://cloud-native.slack.com/archives/C033BJ8BASU/p1713894678225579)!

As we saw earlier, the
[core distribution](https://github.com/open-telemetry/opentelemetry-collector)
is the default Collector distribution used by the `OpenTelemetryCollector` CR.
The Core distribution is a bare-bones distribution of the Collector for OTel
developers to develop and test. It contains a base set of components–i.e.
[extensions](/docs/collector/configuration/#service-extensions),
[connectors](/docs/collector/configuration/#connectors),
[receivers](/docs/collector/configuration/#receivers),
[processors](/docs/collector/configuration/#processors), and
[exporters](/docs/collector/configuration/#exporters).

If you want access to more components than the ones offered by core, you can use
the Collector's
[Kubernetes Distribution](https://github.com/open-telemetry/opentelemetry-collector-releases/tree/main/distributions/otelcol-k8s)
instead. This distribution is made specifically to be used in a Kubernetes
cluster to monitor Kubernetes and services running in Kubernetes. It contains a
subset of components from
[OpenTelemetry Collector Core](https://github.com/open-telemetry/opentelemetry-collector)
and
[OpenTelemetry Collector Contrib](https://github.com/open-telemetry/opentelemetry-collector-contrib).

If you want to use your own specific Collector components, you can build your
own distribution using the
[OpenTelemetry Collector Builder](/docs/collector/custom-collector/) (OCB), and
include only the components that you need.

Either way, the OpenTelemetryCollector CR allows you to override the default
Collector image with one that better suits your needs by `adding spec.image` to
your `OpenTelemetryCollector` YAML. In addition, you can also specify the number
of Collector replicas by adding `spec.replicas`. This is totally independent of
whether or not you override the Collector image.

Your code would look something like this:

```yaml
apiVersion: opentelemetry.io/v1alpha1
kind: OpenTelemetryCollector
metadata:
  name: otelcol
  namespace: mynamespace
spec:
  mode: statefulset
  image: <my_collector_image>
  replicas: <number_of_replicas>
```

Where:

- `<my_collector_image>` is the name of a valid Collector image from a container
  repository
- `<number_of_replicas>` is the number of pod instances for the underlying
  OpenTelemetry Collector

Keep in mind that if you're pulling a Collector image from a private container
registry, you'll need to use
[`imagePullSecrets`](https://kubernetes.io/docs/tasks/configure-pod-container/pull-image-private-registry/).
Since private container registries require authentication, this will enable you
to authenticate against that private registry. For more info on how to use
`imagePullSecrets` for your Collector image, see
[the instructions](https://github.com/open-telemetry/opentelemetry-operator?tab=readme-ov-file#using-imagepullsecrets).

For more info, check out the
[OpenTelemetryCollector CR API docs](https://github.com/open-telemetry/opentelemetry-operator/blob/main/docs/api/opentelemetrycollectors.md).

### Q5: Does the Target Allocator work for all deployment types?

No. The Target Allocator only works for
[StatefulSet](https://kubernetes.io/docs/concepts/workloads/controllers/statefulset/),
and
[DaemonSet](https://kubernetes.io/docs/concepts/workloads/controllers/daemonset/)
([newly-introduced](https://github.com/open-telemetry/opentelemetry-operator/pull/2430#discussion_r1420495631)).
For more info, see
[`collector_webhook.go`](https://github.com/open-telemetry/opentelemetry-operator/blob/aed905c2c3c0aa3fb608a79c2e4d0e7b73dff980/apis/v1beta1/collector_webhook.go#L328).

### Q6: If I enable `prometheusCR` in the Target Allocator, do I need the `PodMonitor` and `ServiceMonitor` CRs installed in my Kubernetes cluster?

Yes, you do. These CRs are bundled with the
[Prometheus Operator](https://github.com/prometheus-operator/prometheus-operator);
however, they can be installed standalone, which means that you don’t need to
install the Prometheus Operator just to use these two CRs with the Target
Allocator.

The easiest way to install the
[`PodMonitor`](https://github.com/prometheus-operator/prometheus-operator/blob/main/Documentation/api-reference/api.md#monitoring.coreos.com/v1.PodMonitor)
and
[`ServiceMonitor`](https://github.com/prometheus-operator/prometheus-operator/blob/main/Documentation/api-reference/api.md#monitoring.coreos.com/v1.ServiceMonitor)
CRs is to grab a copy of the individual
[PodMonitor YAML](https://github.com/prometheus-community/helm-charts/blob/main/charts/kube-prometheus-stack/charts/crds/crds/crd-podmonitors.yaml)
and
[ServiceMonitor YAML](https://github.com/prometheus-community/helm-charts/blob/main/charts/kube-prometheus-stack/charts/crds/crds/crd-servicemonitors.yaml)
[custom resource definitions (CRDs)](https://kubernetes.io/docs/tasks/extend-kubernetes/custom-resources/custom-resource-definitions/),
like this:

```shell
kubectl --context kind-otel-target-allocator-talk apply -f https://raw.githubusercontent.com/prometheus-operator/prometheus-operator/main/example/prometheus-operator-crd/monitoring.coreos.com_servicemonitors.yaml

kubectl --context kind-otel-target-allocator-talk apply -f https://raw.githubusercontent.com/prometheus-operator/prometheus-operator/main/example/prometheus-operator-crd/monitoring.coreos.com_podmonitors.yaml
```

See my
[example of the OpenTelemetry Operator’s Target Allocator with `ServiceMonitor`](https://github.com/avillela/otel-target-allocator-talk/tree/main?tab=readme-ov-file#3b--kubernetes-deployment-servicenow-cloud-observability-backend).

### Q7: Do I need to create a service account to use the Target Allocator?

No, but you do need to do a bit of extra work. So, here’s the deal…although you
need a
[service account](https://kubernetes.io/docs/tasks/configure-pod-container/configure-service-account/)
to use the Target Allocator, you don’t have to create your own.

If you enable the Target Allocator and don’t create a service account, one is
automagically created for you. This service account’s default name is a
concatenation of the Collector name (`metadata.name` in the
`OpenTelemetryCollector` CR) and `-collector`. For example, if your Collector is
called `mycollector`, then your service account would be called
`mycollector-collector`.

By default, this service account has no defined policy. This means that you’ll
still need to create your own
[`ClusterRole`](https://kubernetes.io/docs/reference/access-authn-authz/rbac/#role-and-clusterrole)
and
[`ClusterRoleBinding`](https://kubernetes.io/docs/reference/access-authn-authz/rbac/#rolebinding-and-clusterrolebinding),
and associate the `ClusterRole` to the `ServiceAccount` via
`ClusterRoleBinding`.

See the
[Target Allocator readme](https://github.com/open-telemetry/opentelemetry-operator/tree/main/cmd/otel-allocator#rbac)
for more on Target Allocator RBAC configuration.

> **NOTE:** This will be automated fully in the near future (see accompanying
> [PR](https://github.com/open-telemetry/opentelemetry-operator/pull/2787)), as
> part of version `0.100.0`.

### Q8: Can I override the Target Allocator base image?

Just like you can override the Collector base image in the
`OpenTelemetryCollector` CR, you can also override the Target Allocator base
image.

Please keep in mind that
[it’s usually best to keep the Target Allocator and OTel operator versions the same](https://cloud-native.slack.com/archives/C033BJ8BASU/p1709128862949249?thread_ts=1709081221.484429&cid=C033BJ8BASU),
to avoid any compatibility issues. If do you choose to override the Target
Allocator’s base image, you can do so by adding `spec.targetAllocator.image` in
the `OpenTelemetryCollector` CR. You can also specify the number of replicas by
adding `spec.targetAllocator.replicas`. This is totally independent of whether
or not you override the TA image.

Your code would look something like this:

```yaml
apiVersion: opentelemetry.io/v1alpha1
kind: OpenTelemetryCollector
metadata:
  name: otelcol
  namespace: mynamespace
spec:
  mode: statefulset
  targetAllocator:
    image: <ta_image_name>
    replicas: <number_of_replicas>
```

Where:

- `<ta_image_name>` is a valid Target Allocator image from a container
  repository.
- `<number_of_replicas>` is the number of pod instances for the underlying
  Target Allocator

### Q9: If it’s not recommended that you override the Target Allocator base image, then why would you want to?

One use case might be
[if you need to host a mirror of the Target Allocator image in your own private container registry for security purposes](https://cloud-native.slack.com/archives/C033BJ8BASU/p1713894678225579).

If you do need to reference a Target Allocator image from a private registry,
you’ll need to use `imagePullSecrets`. For details, see
[the instructions](https://github.com/open-telemetry/opentelemetry-operator?tab=readme-ov-file#using-imagepullsecrets).
Note that you don’t need to create a `serviceAccount` for the Target Allocator,
since once is already created for you automagically if you don’t create one
yourself (see
[Q7](#q7-do-i-need-to-create-a-service-account-to-use-the-target-allocator)).

For more info, check out the
[Target Allocator API docs](https://github.com/open-telemetry/opentelemetry-operator/blob/main/docs/api/targetallocators.md).

### Q10: Is there a version lag between the OTel Operator auto-instrumentation and auto-instrumentation of supported languages?

If there is a lag, it's minimal, as maintainers try to keep these up to date for
each release cycle. Keep in mind that there are breaking changes in some
semantic conventions and the team is trying to avoid breaking users' code. For
details, see this
[`#otel-operator` thread](https://cloud-native.slack.com/archives/C033BJ8BASU/p1713894678225579).

## Final thoughts

Hopefully this has helped to demystify the OTel Operator a bit more. There’s
definitely a lot going on, and the OTel Operator can certainly be a bit scary at
first, but understanding some of the basics will get you well on your way to
mastering this powerful tool.

If you have any questions about the OTel Operator, I highly recommend that you
post questions on the
[#otel-operator](https://cloud-native.slack.com/archives/C033BJ8BASU) channel on
the [CNCF Slack](https://communityinviter.com/apps/cloud-native/cncf).
Maintainers and contributors are super friendly, and have always been more than
willing to answer my questions! You can also
[hit me up](https://bento.me/adrianamvillela), and I'll try my best to answer
your questions, or to direct you to folks who have the answers!
