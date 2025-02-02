---
title: Target Allocator
cSpell:ignore: bleh targetallocator
---

If you’ve enabled
[Target Allocator](/docs/kubernetes/operator/target-allocator/) service
discovery on the [OpenTelemetry Operator](/docs/kubernetes/operator/), and the
Target Allocator is failing to discover scrape targets, there are a few
troubleshooting steps that you can take to help you understand what’s going on
and restore normal operation.

## Troubleshooting steps

### Did you deploy all of your resources to Kubernetes?

As a first step, make sure that you have deployed all relevant resources to your
Kubernetes cluster.

### Do you know if metrics are actually being scraped?

After you’ve deployed all of your resources to Kubernetes, make sure that the
Target Allocator is discovering scrape targets from your
[`ServiceMonitor`](https://prometheus-operator.dev/docs/getting-started/design/#servicemonitor)(s)
or [PodMonitor]s.

Suppose that you have this `ServiceMonitor` definition:

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

this `Service` definition:

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

and this `OpenTelemetryCollector` definition:

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
      podMonitorSelector: {}
      serviceMonitorSelector: {}
  config:
    receivers:
      otlp:
        protocols:
          grpc: {}
          http: {}
      prometheus:
        config:
          scrape_configs:
            - job_name: 'otel-collector'
              scrape_interval: 10s
              static_configs:
                - targets: ['0.0.0.0:8888']

    processors:
      batch: {}

    exporters:
      debug:
        verbosity: detailed

    service:
      pipelines:
        traces:
          receivers: [otlp]
          processors: [batch]
          exporters: [debug]
        metrics:
          receivers: [otlp, prometheus]
          processors: []
          exporters: [debug]
        logs:
          receivers: [otlp]
          processors: [batch]
          exporters: [debug]
```

First, set up a `port-forward` in Kubernetes, so that you can expose the Target
Allocator service:

```shell
kubectl port-forward svc/otelcol-targetallocator -n opentelemetry 8080:80
```

Where `otelcol-targetallocator` is the value of `metadata.name` in your
`OpenTelemetryCollector` CR concatenated with the `-targetallocator` suffix, and
`opentelemetry` is the namespace to which the `OpenTelemetryCollector` CR is
deployed.

{{% alert title="Tip" %}}

You can also get the service name by running

```shell
kubectl get svc -l app.kubernetes.io/component=opentelemetry-targetallocator -n <namespace>
```

{{% /alert %}}

Next, get a list of jobs registered with the Target Allocator:

```shell
curl localhost:8080/jobs | jq
```

Your sample output should look like this:

```json
{
  "serviceMonitor/opentelemetry/sm-example/1": {
    "_link": "/jobs/serviceMonitor%2Fopentelemetry%2Fsm-example%2F1/targets"
  },
  "serviceMonitor/opentelemetry/sm-example/2": {
    "_link": "/jobs/serviceMonitor%2Fopentelemetry%2Fsm-example%2F2/targets"
  },
  "otel-collector": {
    "_link": "/jobs/otel-collector/targets"
  },
  "serviceMonitor/opentelemetry/sm-example/0": {
    "_link": "/jobs/serviceMonitor%2Fopentelemetry%2Fsm-example%2F0/targets"
  },
  "podMonitor/opentelemetry/pm-example/0": {
    "_link": "/jobs/podMonitor%2Fopentelemetry%2Fpm-example%2F0/targets"
  }
}
```

Where `serviceMonitor/opentelemetry/sm-example/0` represents one of the
`Service` ports that the `ServiceMonitor`picked up:

- `opentelemetry` is the namespace in which the `ServiceMonitor` resource
  resides.
- `sm-example` is the name of the `ServiceMonitor`.
- `0` is one of the port endpoints matched between the `ServiceMonitor` and the
  `Service`.

Similarly, the `PodMonitor`, shows up as `podMonitor/opentelemetry/pm-example/0`
in the `curl` output.

This is good news, because it tells us that the scrape config discovery is
working!

You might also be wondering about the `otel-collector` entry. This is happening
because `spec.config.receivers.prometheusReceiver` in the
`OpenTelemetryCollector` resource (named `otel-collector`) has self-scrape
enabled:

```yaml
prometheus:
  config:
    scrape_configs:
      - job_name: 'otel-collector'
        scrape_interval: 10s
        static_configs:
          - targets: ['0.0.0.0:8888']
```

We can take a deeper look into `serviceMonitor/opentelemetry/sm-example/0`, to
see what scrape targets are getting picked up by running `curl` against the
value of the `_link` output above:

```shell
curl localhost:8080/jobs/serviceMonitor%2Fopentelemetry%2Fsm-example%2F0/targets | jq
```

Sample output:

```json
{
  "otelcol-collector-0": {
    "_link": "/jobs/serviceMonitor%2Fopentelemetry%2Fsm-example%2F0/targets?collector_id=otelcol-collector-0",
    "targets": [
      {
        "targets": ["10.244.0.11:8080"],
        "labels": {
          "__meta_kubernetes_endpointslice_port_name": "prom",
          "__meta_kubernetes_pod_labelpresent_app_kubernetes_io_name": "true",
          "__meta_kubernetes_endpointslice_port_protocol": "TCP",
          "__meta_kubernetes_endpointslice_address_target_name": "py-prometheus-app-575cfdd46-nfttj",
          "__meta_kubernetes_endpointslice_annotation_endpoints_kubernetes_io_last_change_trigger_time": "2024-06-21T20:01:37Z",
          "__meta_kubernetes_endpointslice_labelpresent_app_kubernetes_io_name": "true",
          "__meta_kubernetes_pod_name": "py-prometheus-app-575cfdd46-nfttj",
          "__meta_kubernetes_pod_controller_name": "py-prometheus-app-575cfdd46",
          "__meta_kubernetes_pod_label_app_kubernetes_io_name": "py-prometheus-app",
          "__meta_kubernetes_endpointslice_address_target_kind": "Pod",
          "__meta_kubernetes_pod_node_name": "otel-target-allocator-talk-control-plane",
          "__meta_kubernetes_pod_labelpresent_pod_template_hash": "true",
          "__meta_kubernetes_endpointslice_label_kubernetes_io_service_name": "py-prometheus-app",
          "__meta_kubernetes_endpointslice_annotationpresent_endpoints_kubernetes_io_last_change_trigger_time": "true",
          "__meta_kubernetes_service_name": "py-prometheus-app",
          "__meta_kubernetes_pod_ready": "true",
          "__meta_kubernetes_pod_labelpresent_app": "true",
          "__meta_kubernetes_pod_controller_kind": "ReplicaSet",
          "__meta_kubernetes_endpointslice_labelpresent_app": "true",
          "__meta_kubernetes_pod_container_image": "otel-target-allocator-talk:0.1.0-py-prometheus-app",
          "__address__": "10.244.0.11:8080",
          "__meta_kubernetes_service_label_app_kubernetes_io_name": "py-prometheus-app",
          "__meta_kubernetes_pod_uid": "495d47ee-9a0e-49df-9b41-fe9e6f70090b",
          "__meta_kubernetes_endpointslice_port": "8080",
          "__meta_kubernetes_endpointslice_label_endpointslice_kubernetes_io_managed_by": "endpointslice-controller.k8s.io",
          "__meta_kubernetes_endpointslice_label_app": "my-app",
          "__meta_kubernetes_service_labelpresent_app_kubernetes_io_name": "true",
          "__meta_kubernetes_pod_host_ip": "172.24.0.2",
          "__meta_kubernetes_namespace": "opentelemetry",
          "__meta_kubernetes_endpointslice_endpoint_conditions_serving": "true",
          "__meta_kubernetes_endpointslice_labelpresent_kubernetes_io_service_name": "true",
          "__meta_kubernetes_endpointslice_endpoint_conditions_ready": "true",
          "__meta_kubernetes_service_annotation_kubectl_kubernetes_io_last_applied_configuration": "{\"apiVersion\":\"v1\",\"kind\":\"Service\",\"metadata\":{\"annotations\":{},\"labels\":{\"app\":\"my-app\",\"app.kubernetes.io/name\":\"py-prometheus-app\"},\"name\":\"py-prometheus-app\",\"namespace\":\"opentelemetry\"},\"spec\":{\"ports\":[{\"name\":\"prom\",\"port\":8080}],\"selector\":{\"app\":\"my-app\",\"app.kubernetes.io/name\":\"py-prometheus-app\"}}}\n",
          "__meta_kubernetes_endpointslice_endpoint_conditions_terminating": "false",
          "__meta_kubernetes_pod_container_port_protocol": "TCP",
          "__meta_kubernetes_pod_phase": "Running",
          "__meta_kubernetes_pod_container_name": "my-app",
          "__meta_kubernetes_pod_container_port_name": "prom",
          "__meta_kubernetes_pod_ip": "10.244.0.11",
          "__meta_kubernetes_service_annotationpresent_kubectl_kubernetes_io_last_applied_configuration": "true",
          "__meta_kubernetes_service_labelpresent_app": "true",
          "__meta_kubernetes_endpointslice_address_type": "IPv4",
          "__meta_kubernetes_service_label_app": "my-app",
          "__meta_kubernetes_pod_label_app": "my-app",
          "__meta_kubernetes_pod_container_port_number": "8080",
          "__meta_kubernetes_endpointslice_name": "py-prometheus-app-bwbvn",
          "__meta_kubernetes_pod_label_pod_template_hash": "575cfdd46",
          "__meta_kubernetes_endpointslice_endpoint_node_name": "otel-target-allocator-talk-control-plane",
          "__meta_kubernetes_endpointslice_labelpresent_endpointslice_kubernetes_io_managed_by": "true",
          "__meta_kubernetes_endpointslice_label_app_kubernetes_io_name": "py-prometheus-app"
        }
      }
    ]
  }
}
```

The query parameter `collector_id` in the `_link` field of the above output
states that these are the targets pertain to `otelcol-collector-0` (the name of
the `StatefulSet` created for the `OpenTelemetryCollector` resource).

{{% alert title="Note" %}}

See the
[Target Allocator readme](https://github.com/open-telemetry/opentelemetry-operator/blob/main/cmd/otel-allocator/README.md?plain=1#L128-L134)
for more information on the `/jobs` endpoint.

{{% /alert %}}

### Is the Target Allocator enabled? Is Prometheus service discovery enabled?

If the `curl` commands above don’t show a list of expected `ServiceMonitor`s and
`PodMonitor`s, you need to check whether the features that populate those values
are turned on.

One thing to remember is that just because you include the `targetAllocator`
section in the `OpenTelemetryCollector` CR doesn’t mean that it’s enabled. You
need to explicitly enable it. Furthermore, if you want to use
[Prometheus service discovery](https://github.com/open-telemetry/opentelemetry-operator/blob/main/cmd/otel-allocator/README.md#discovery-of-prometheus-custom-resources),
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

See the full `OpenTelemetryCollector`
[resource definition in "Do you know if metrics are actually being scraped?"](#do-you-know-if-metrics-are-actually-beingscraped).

### Did you configure a ServiceMonitor (or PodMonitor) selector?

If you configured a
[`ServiceMonitor`](https://observability.thomasriley.co.uk/prometheus/configuring-prometheus/using-service-monitors/#:~:text=The%20ServiceMonitor%20is%20used%20to,build%20the%20required%20Prometheus%20configuration.)
selector, it means that the Target Allocator only looks for `ServiceMonitors`
having a `metadata.label` that matches the value in
[`serviceMonitorSelector`](https://github.com/open-telemetry/opentelemetry-operator/blob/main/docs/api.md#opentelemetrycollectorspectargetallocatorprometheuscr-1).

Suppose that you configured a
[`serviceMonitorSelector`](https://github.com/open-telemetry/opentelemetry-operator/blob/main/docs/api.md#opentelemetrycollectorspectargetallocatorprometheuscr-1)
for your Target Allocator, like in the following example:

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
        matchLabels:
          app: my-app
```

By setting the value of
`spec.targetAllocator.prometheusCR.serviceMonitorSelector.matchLabels` to
`app: my-app`, it means that your `ServiceMonitor` resource must in turn have
that same value in `metadata.labels`:

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

See the full `ServiceMonitor`
[resource definition in "Do you know if metrics are actually being scraped?"](#do-you-know-if-metrics-are-actually-beingscraped).

In this case, the `OpenTelemetryCollector` resource's
`prometheusCR.serviceMonitorSelector.matchLabels` is looking only for
`ServiceMonitors` having the label `app: my-app`, which we see in the previous
example.

If your `ServiceMonitor` resource is missing that label, then the Target
Allocator will fail to discover scrape targets from that `ServiceMonitor`.

{{% alert title="Tip" %}}

The same applies if you’re using a [PodMonitor]. In that case, you would use a
[`podMonitorSelector`](https://github.com/open-telemetry/opentelemetry-operator/blob/main/docs/api.md#opentelemetrycollectorspectargetallocatorprometheuscr)
instead of a `serviceMonitorSelector`.

{{% /alert %}}

### Did you leave out the serviceMonitorSelector and/or podMonitorSelector configuration altogether?

As mentioned in
["Did you configure a ServiceMonitor or PodMonitor selector"](#did-you-configure-a-servicemonitor-or-podmonitor-selector),
setting mismatched values for `serviceMonitorSelector` and `podMonitorSelector`
results in the Target Allocator failing to discover scrape targets from your
`ServiceMonitors` and `PodMonitors`, respectively.

Similarly, in
[`v1beta1`](https://github.com/open-telemetry/opentelemetry-operator/blob/main/docs/api.md#opentelemetrycollector-1)
of the `OpenTelemetryCollector` CR, leaving out this configuration altogether
also results in the Target Allocator failing to discover scrape targets from
your `ServiceMonitors` and `PodMonitors`.

As of `v1beta1` of the `OpenTelemetryOperator`, a `serviceMonitorSelector` and
`podMonitorSelector` must be included, even if you don’t intend to use it, like
this:

```yaml
prometheusCR:
  enabled: true
  podMonitorSelector: {}
  serviceMonitorSelector: {}
```

This configuration means that it will match on all `PodMonitor` and
`ServiceMonitor` resources. See the
[full OpenTelemetryCollector definition in "Do you know if metrics are actually being scraped?"](#do-you-know-if-metrics-are-actually-beingscraped).

### Do your labels, namespaces, and ports match for your ServiceMonitor and your Service (or PodMonitor and your Pod)?

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

The previous `ServiceMonitor` is looking for any services that have:

- the label `app: my-app`
- reside in a namespace called `opentelemetry`
- a port named `prom`, `py-client-port`, _or_ `py-server-port`

For example, the following `Service` resource would get picked up by the
`ServiceMonitor`, because it matches the previous criteria:

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

The following `Service` resource would not be picked up, because the
`ServiceMonitor` is looking for ports named `prom`, `py-client-port`, _or_
`py-server-port`, and this service’s port is called `bleh`.

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

{{% alert title="Tip" %}}

If you’re using `PodMonitor`, the same applies, except that it picks up
Kubernetes pods that match on labels, namespaces, and named ports.

{{% /alert %}}

[PodMonitor]:
  https://prometheus-operator.dev/docs/developer/getting-started/#using-podmonitors
