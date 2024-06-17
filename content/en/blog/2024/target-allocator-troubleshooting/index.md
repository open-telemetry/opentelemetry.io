---
title: Tips for Troubleshooting the Target Allocator
linkTitle: Target Allocator Troubleshooting
date: 2024-06-17
author: '[Adriana Villela](https://github.com/avillela) (ServiceNow)'
canonical_url: https://adri-v.medium.com/de9eca2b78b4
issue: 4699
sig: OTel Operator
cSpell:ignore: automagically bleh
---

![Looking up at the glass pyramid at the Louvre, as seen from the inside. Photo by Adriana Villela](louvre-pyramid.jpg)

If you’ve enabled
[Target Allocator](https://adri-v.medium.com/lets-learn-about-the-otel-operator-s-target-allocator-47a2b1f07562)
service discovery on the
[OTel Operator](https://adri-v.medium.com/list/opentelemetry-operator-0ee6378d630a),
and your metrics aren’t getting picked up, then there are a few troubleshooting
steps that you can take to help you understand what’s going on and to get things
back on track. I put these together based on some of my own experience. May
these help you on your own journey!

## Troubleshooting Steps

Before we start, be sure to check out
[this repo](https://github.com/avillela/otel-target-allocator-talk), which,
among other things, includes examples of configuring the
`OpenTelemetryCollector` custom resource (CR) to use the Target Allocator’s
service discovery functionality, along with examples of
[`ServiceMonitor`](https://observability.thomasriley.co.uk/prometheus/configuring-prometheus/using-service-monitors/#:~:text=The%20ServiceMonitor%20is%20used%20to,build%20the%20required%20Prometheus%20configuration.)
and
[`PodMonitor`](https://prometheus-operator.dev/docs/user-guides/getting-started/#using-podmonitors)
resource definitions.

### 1- Did you actually deploy all of your resources to Kubernetes?

Okay…you may be laughing at me for how obvious this sounds, but it totally
happened to me. In fact, it happened while I was adding the
[`PodMonitor`](https://github.com/avillela/otel-target-allocator-talk/blob/main/src/resources/04a-pod-monitor.yml)
example to the
[my repo](https://github.com/avillela/otel-target-allocator-talk).

After checking to see if the service discovery was working per step 2 below
(spoiler: it wasn’t), I went through all of the other troubleshooting steps.
Except for this one, of course. 🤬 According to the
[API documentation](https://github.com/prometheus-operator/prometheus-operator/blob/main/Documentation/api.md#monitoring.coreos.com/v1.PodMonitor),
all of my configurations _looked_ correct. Yeah…too bad the resource wasn’t
actually deployed.

In a flash of inspiration, I decided to check to make sure that the `PodMonitor`
was _actually deployed to my Kubernetes cluster_, and lo and behold…it was
missing. After I deployed the `PodMonitor` (for real, this time), it worked. At
least I take comfort in the fact that my configurations were correct the whole
time! 🫠

So yeah…moral of the story: make sure you actually deploy your resources.

### 2- Is this thing even on?

After you’ve deployed all of your resources to Kubernetes, check to make sure
that the Target Allocator is actually picking up your
[`ServiceMonitor`](https://observability.thomasriley.co.uk/prometheus/configuring-prometheus/using-service-monitors/#:~:text=The%20ServiceMonitor%20is%20used%20to,build%20the%20required%20Prometheus%20configuration.)(s)
and/or
[`PodMonitor`](https://prometheus-operator.dev/docs/user-guides/getting-started/#using-podmonitors)(s).
Fortunately, we can check this pretty easily.

Let’s suppose that we have this `ServiceMonitor` definition:

```yaml
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: sm-example
  namespace: opentelemetry
  labels:
    app.kubernetes.io/name: py-prometheus-app
    release: prometheus
spec:
  selector:
    matchLabels:
      app: my-app
  namespaceSelector:
    matchNames:
      - opentelemetry
  endpoints:
    - port: prom
      path: /metrics
    - port: py-client-port
      interval: 15s
    - port: py-server-port
```

and this `Service` definition:

```yaml
apiVersion: v1
kind: Service
metadata:
  name: py-prometheus-app
  namespace: opentelemetry
  labels:
    app: my-app
    app.kubernetes.io/name: py-prometheus-app
spec:
  selector:
    app: my-app
    app.kubernetes.io/name: py-prometheus-app
  ports:
    - name: prom
      port: 8080
```

First, set up a `port-forward` in Kubernetes, so that you can expose the Target
Allocator service:

```shell
kubectl port-forward svc/<otel_collector_resource_name>-targetallocator -n <namespace> 8080:80
```

Where `<otel_collector_resource_name>` is the value of `metadata.name` in your
`OpenTelemetryCollector` CR, and `<namespace>` is the namespace to which the
`OpenTelemetryCollector` CR is deployed.

Following the example from our
[example repo](https://github.com/avillela/otel-target-allocator-talk), ours
would look like this:

```shell
kubectl port-forward svc/otelcol-targetallocator -n opentelemetry 8080:80
```

Next, get a list of jobs registered with the Target Allocator:

```shell
curl localhost:8080/jobs | jq
```

Your sample output should look something like this:

```json
{
  "serviceMonitor/opentelemetry/sm-example/1": {
    "_link": "/jobs/serviceMonitor%2Fopentelemetry%2Fsm-example%2F1/targets"
  },
  "otel-collector": {
    "_link": "/jobs/otel-collector/targets"
  },
  "serviceMonitor/opentelemetry/sm-example/0": {
    "_link": "/jobs/serviceMonitor%2Fopentelemetry%2Fsm-example%2F0/targets"
  },
  "serviceMonitor/opentelemetry/sm-example/2": {
    "_link": "/jobs/serviceMonitor%2Fopentelemetry%2Fsm-example%2F2/targets"
  },
  "podMonitor/opentelemetry/pm-example/0": {
    "_link": "/jobs/podMonitor%2Fopentelemetry%2Fpm-example%2F0/targets"
  }
}
```

Where `serviceMonitor/opentelemetry/sm-example/0` represents one of the
`Service` ports that the `ServiceMonitor`picked up:

- `opentelemetry` is the namespace in which the `ServiceMonitor` resource
  resides
- `sm-example` is the name of the `ServiceMonitor`
- `0` is one of the port endpoints matched between the `ServiceMonitor` and the
  `Service`

We see a similar story with the port monitor, which shows up as
`podMonitor/opentelemetry/pm-example/0` in the `curl` output.

This is good news, because it tells us that the service discovery is working!

You might also be wondering about the `otel-collector` entry. The Target
Allocator automagically picks up metrics from the OTel Collector as well.

We can take a deeper look into `serviceMonitor/opentelemetry/sm-example/0`, to
see what metrics are getting picked up by running `curl` against the value of
the `_link` output above:

```shell
curl localhost:8080/jobs/serviceMonitor%2Fdefault%2Fmy-app%2F0/targets | jq
```

Sample output:

```json
{
  "otelcol-collector-0": {
    "_link": "/jobs/serviceMonitor%2Fopentelemetry%2Fsm-example%2F1/targets?collector_id=otelcol-collector-0",
    "targets": [
      {
        "targets": ["10.244.0.11:8082"],
        "labels": {
          "__meta_kubernetes_endpointslice_name": "py-otel-client-svc-znvrz",
          "__meta_kubernetes_pod_label_app": "my-app",
          "__meta_kubernetes_pod_node_name": "otel-target-allocator-talk-control-plane",
          "__meta_kubernetes_endpointslice_label_endpointslice_kubernetes_io_managed_by": "endpointslice-controller.k8s.io",
          "__meta_kubernetes_service_labelpresent_app": "true",
          "__meta_kubernetes_endpointslice_address_target_kind": "Pod",
          "__meta_kubernetes_endpointslice_endpoint_conditions_terminating": "false",
          "__meta_kubernetes_pod_container_port_number": "8082",
          "__meta_kubernetes_endpointslice_labelpresent_app": "true",
          "__meta_kubernetes_pod_label_pod_template_hash": "776d6686bb",
          "__meta_kubernetes_pod_container_image": "otel-target-allocator-talk:0.1.0-py-otel-client",
          "__meta_kubernetes_pod_ip": "10.244.0.11",
          "__meta_kubernetes_pod_controller_name": "py-otel-client-776d6686bb",
          "__meta_kubernetes_pod_controller_kind": "ReplicaSet",
          "__meta_kubernetes_pod_label_app_kubernetes_io_name": "py-otel-client",
          "__meta_kubernetes_endpointslice_annotationpresent_endpoints_kubernetes_io_last_change_trigger_time": "true",
          "__meta_kubernetes_service_annotationpresent_kubectl_kubernetes_io_last_applied_configuration": "true",
          "__meta_kubernetes_pod_ready": "true",
          "__meta_kubernetes_endpointslice_endpoint_conditions_serving": "true",
          "__meta_kubernetes_pod_annotation_instrumentation_opentelemetry_io_inject_python": "true",
          "__meta_kubernetes_endpointslice_port_protocol": "TCP",
          "__meta_kubernetes_endpointslice_label_app": "my-app",
          "__meta_kubernetes_pod_name": "py-otel-client-776d6686bb-7mchc",
          "__meta_kubernetes_pod_annotationpresent_instrumentation_opentelemetry_io_inject_python": "true",
          "__meta_kubernetes_endpointslice_endpoint_conditions_ready": "true",
          "__meta_kubernetes_pod_host_ip": "172.24.0.2",
          "__meta_kubernetes_namespace": "opentelemetry",
          "__meta_kubernetes_pod_labelpresent_pod_template_hash": "true",
          "__meta_kubernetes_endpointslice_port_name": "py-client-port",
          "__meta_kubernetes_pod_phase": "Running",
          "__meta_kubernetes_endpointslice_label_app_kubernetes_io_name": "py-otel-client",
          "__meta_kubernetes_endpointslice_port": "8082",
          "__meta_kubernetes_endpointslice_address_target_name": "py-otel-client-776d6686bb-7mchc",
          "__meta_kubernetes_pod_container_name": "py-otel-client",
          "__meta_kubernetes_pod_container_port_name": "py-client-port",
          "__meta_kubernetes_endpointslice_address_type": "IPv4",
          "__meta_kubernetes_pod_uid": "bd68fa78-13f6-4377-bcfd-9bb95553f1f4",
          "__meta_kubernetes_service_name": "py-otel-client-svc",
          "__meta_kubernetes_service_label_app_kubernetes_io_name": "py-otel-client",
          "__meta_kubernetes_pod_labelpresent_app": "true",
          "__meta_kubernetes_service_labelpresent_app_kubernetes_io_name": "true",
          "__meta_kubernetes_endpointslice_label_kubernetes_io_service_name": "py-otel-client-svc",
          "__meta_kubernetes_endpointslice_annotation_endpoints_kubernetes_io_last_change_trigger_time": "2024-06-14T21:04:36Z",
          "__address__": "10.244.0.11:8082",
          "__meta_kubernetes_endpointslice_labelpresent_kubernetes_io_service_name": "true",
          "__meta_kubernetes_endpointslice_labelpresent_endpointslice_kubernetes_io_managed_by": "true",
          "__meta_kubernetes_service_annotation_kubectl_kubernetes_io_last_applied_configuration": "{\"apiVersion\":\"v1\",\"kind\":\"Service\",\"metadata\":{\"annotations\":{},\"labels\":{\"app\":\"my-app\",\"app.kubernetes.io/name\":\"py-otel-client\"},\"name\":\"py-otel-client-svc\",\"namespace\":\"opentelemetry\"},\"spec\":{\"ports\":[{\"name\":\"py-client-port\",\"port\":8082,\"protocol\":\"TCP\",\"targetPort\":\"py-client-port\"}],\"selector\":{\"app.kubernetes.io/name\":\"py-otel-client\"}}}\n",
          "__meta_kubernetes_pod_labelpresent_app_kubernetes_io_name": "true",
          "__meta_kubernetes_pod_container_port_protocol": "TCP",
          "__meta_kubernetes_service_label_app": "my-app",
          "__meta_kubernetes_endpointslice_labelpresent_app_kubernetes_io_name": "true"
        }
      }
    ]
  }
}
```

> **PS:** Shout out to
> [this blog post](https://trstringer.com/opentelemetry-target-allocator-troubleshooting/)
> for educating me about this troubleshooting technique

### 3- Is the Target Allocator enabled? Is Prometheus service discovery enabled?

If the `curl` commands above don’t show a list of expected `ServiceMonitor`s and
`PodMonitor`s, then it’s time to dig a bit deeper.

One thing to remember is that just because you include the `targetAllocator`
section in the `OpenTelemetryCollector` CR doesn’t mean that it’s enabled. You
need to explicitly enable it. Furthermore, if you want to use
[Prometheus service discovery](https://adri-v.medium.com/prometheus-opentelemetry-better-together-41dc637f2292),
you must explicitly enable it:

- Set `spec.targetAllocator.enabled` to `true`
- Set `spec.targetAllocator.prometheusCR.enabled` to `true`

So that your `OpenTelemetryCollector` resource looks like this:

```yaml
apiVersion: opentelemetry.io/v1beta1
kind: OpenTelemetryCollector
metadata:
  name: otelcol
  namespace: opentelemetry
spec:
  mode: statefulset
  targetAllocator:
    enabled: true
    serviceAccount: opentelemetry-targetallocator-sa
    prometheusCR:
      enabled: true
```

📝 You can see the full `OpenTelemetryCollector` resource definition
[here](https://github.com/avillela/otel-target-allocator-talk/blob/main/src/resources/02-otel-collector.yml).

### 4- Did you configure a ServiceMonitor (or PodMonitor) selector?

If you configured a
[`ServiceMonitor`](https://observability.thomasriley.co.uk/prometheus/configuring-prometheus/using-service-monitors/#:~:text=The%20ServiceMonitor%20is%20used%20to,build%20the%20required%20Prometheus%20configuration.)
selector, it means that the Target Allocator will only look for
`ServiceMonitors` having a `metadata.label` that matches the value in
[`serviceMonitorSelector`](https://github.com/open-telemetry/opentelemetry-operator/blob/main/docs/api.md#opentelemetrycollectorspectargetallocatorprometheuscr).

Suppose that you configured a
[`serviceMonitorSelector`](https://github.com/open-telemetry/opentelemetry-operator/blob/main/docs/api.md#opentelemetrycollectorspectargetallocatorprometheuscr)
for your Target Allocator, like in the example below:

```yaml
apiVersion: opentelemetry.io/v1beta1
kind: OpenTelemetryCollector
metadata:
  name: otelcol
  namespace: opentelemetry
spec:
  mode: statefulset
  targetAllocator:
    enabled: true
    serviceAccount: opentelemetry-targetallocator-sa
    prometheusCR:
      enabled: true
      serviceMonitorSelector:
        app: my-app
```

It means that your `ServiceMonitor` resource must in turn have that same value
in `metadata.spec.label`:

```yaml
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: sm-example
  labels:
    app: my-app
    release: prometheus
spec:
```

📝 You can see the full `ServiceMonitor` resource definition
[here](https://github.com/avillela/otel-target-allocator-talk/blob/main/src/resources/04-service-monitor.yml).

In this case, the `OpenTelemetryCollector` resource's
`prometheusCR.serviceMonitorSelector` is looking only for `ServiceMonitors`
having the label `app: my-app`, which we see in the above example.

**_If your ServiceMonitor resource is missing that label, then the Target
Allocator won’t pick up that ServiceMonitor._**

> **NOTE:** The same applies if you’re using a
> [PodMonitor](https://prometheus-operator.dev/docs/user-guides/getting-started/#using-podmonitors).
> In that case, if your `OpenTelemetryCollector`resource defined a
> [`podMonitorSelector`](https://github.com/open-telemetry/opentelemetry-operator/blob/main/docs/api.md#opentelemetrycollectorspectargetallocatorprometheuscr),
> then any `PodMonitors` you wish to be picked up by the TargetAllocator would
> need to have that same label.

### 5- Did you leave out the serviceMonitorSelector and/or podMonitorSelector configuration altogether?

As we learned above, setting mismatched values for `serviceMonitorSelector` and
`podMonitorSelector` will result in your `ServiceMonitors` and `PodMonitors`,
respectively, not getting picked up.

But did you know that in
[`v1beta1`](https://github.com/open-telemetry/opentelemetry-operator/blob/main/docs/api.md#opentelemetrycollector-1)
of the `OpenTelemetryCollector` CR, if you leave out this configuration
altogether, your `PodMonitors` and `ServiceMonitors` may also not get picked up?

As of `v1beta1` of the `OpenTelemetryOperator`, you must include a
`serviceMonitorSelector`, and `podMonitorSelector`, even if you don’t intend to
use it, like this:

```yaml
---
prometheusCR:
  enabled: true
  podMonitorSelector: {}
  serviceMonitorSelector: {}
```

See full example
[here](https://github.com/avillela/otel-target-allocator-talk/blob/4c0eb425c90187d584c9d03b51ad918b377014a3/src/resources/02-otel-collector.yml#L15-L17).

I just learned this today, as I was updating my `OpenTelemetryCollector` YAML
from
[`v1alpha1`](https://github.com/open-telemetry/opentelemetry-operator/blob/main/docs/api.md#opentelemetrycollector)
to
[`v1beta1`](https://github.com/open-telemetry/opentelemetry-operator/blob/main/docs/api.md#opentelemetrycollector-1).

### 6- Do your labels, namespaces, and ports match for your ServiceMonitor and your Service (or PodMonitor and your Pod)?

The `ServiceMonitor` is configured to pick up Kubernetes
[Services](https://kubernetes.io/docs/concepts/services-networking/service/)
that match on:

- Labels
- Namespaces (optional)
- Ports (endpoints)

Suppose that you have this `ServiceMonitor`:

```yaml
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: sm-example
  labels:
    app: my-app
    release: prometheus
spec:
  selector:
    matchLabels:
      app: my-app
  namespaceSelector:
    matchNames:
      - opentelemetry
  endpoints:
    - port: prom
      path: /metrics
    - port: py-client-port
      interval: 15s
    - port: py-server-port
```

The above`ServiceMonitor` is looking for any services that have:

- the label `app: my-app`
- reside in a namespace called `opentelemetry`
- a port named `prom`, `py-client-port`, _or_ `py-server-port`

So for example, the `Service` resource below would get picked up by the
`ServiceMonitor`, because it matches the above criteria:

```yaml
apiVersion: v1
kind: Service
metadata:
  name: py-prometheus-app
  namespace: opentelemetry
  labels:
    app: my-app
    app.kubernetes.io/name: py-prometheus-app
spec:
  selector:
    app: my-app
    app.kubernetes.io/name: py-prometheus-app
  ports:
    - name: prom
      port: 8080
```

Conversely, the `Service` resource below would NOT, because the `ServiceMonitor`
is looking for ports named `prom`, `py-client-port`, _or_ `py-server-port`, and
this service’s port is called `bleh`.

```yaml
apiVersion: v1
kind: Service
metadata:
  name: py-prometheus-app
  namespace: opentelemetry
  labels:
    app: my-app
    app.kubernetes.io/name: py-prometheus-app
spec:
  selector:
    app: my-app
    app.kubernetes.io/name: py-prometheus-app
  ports:
    - name: bleh
      port: 8080
```

> **NOTE:** If you’re using `PodMonitor`, the same applies, except that it picks
> up Kubernetes _pods_ that match on labels, namespaces, and named ports. You
> can see an example `PodMonitor` resource definition
> [here](https://github.com/avillela/otel-target-allocator-talk/blob/main/src/resources/04a-pod-monitor.yml).

## Final Thoughts

With a little know-how, troubleshooting Target Allocator issues goes from scary
to manageable. And don’t forget to actually deploy your resources first, to save
yourself a lot of heartache and embarrassment. 🫥

If you’d like to dig into other aspects of the OpenTelemetry Operator, such as
OTel Operator’s auto-instrumentation capability, along with some troubleshooting
tips, be sure to
[check out my post on this topic](https://blog.devgenius.io/lets-learn-about-auto-instrumentation-with-the-otel-operator-2cdc8a532514).
