---
title: OpenTelemetry Collector Chart
linkTitle: Collector Chart
spelling:
  cSpell:ignore statefulset kuberenetes filelogreceiver loggingexporter
  cSpell:ignore filelogreceiver otlphttp sattributesprocessor kubelet
  cSpell:ignore kubeletstatsreceiver sclusterreceiver sobjectsreceiver
  cSpell:ignore hostmetricsreceiver
---

## Introduction

The [OpenTelemetry Collector](/docs/collector) is an important tool for
monitoring a Kubernetes cluster and all the services that in within. To
facilitate installation and management of a Collector deployment in a Kubernetes
the OpenTelemetry community created the
[OpenTelemetry Collector Helm Chart](https://github.com/open-telemetry/opentelemetry-helm-charts/tree/main/charts/opentelemetry-collector).
This helm chart can be used to install a Collector as a Deployment, Daemonset,
or Statefulset.

### Installing the Chart

To install the chart with the release name `my-opentelemetry-collector``, run
the following commands:

```console
helm repo add open-telemetry https://open-telemetry.github.io/opentelemetry-helm-charts
helm install my-opentelemetry-collector open-telemetry/opentelemetry-collector --set mode=<daemonset|deployment|statefulset>
```

### Configuration

The Collector chart requires that `mode` be set. `mode` can be either
`daemonset`, `deployment`, or `statefulset` depending on which kind of
Kubernetes deployment your use case requires.

When installed, the chart provides a few default collector components to get
your started. By default, the collector's config will look like:

```yaml
exporters:
  logging: {}
extensions:
  health_check: {}
  memory_ballast:
    size_in_percentage: 40
processors:
  batch: {}
  memory_limiter:
    check_interval: 5s
    limit_percentage: 80
    spike_limit_percentage: 25
receivers:
  jaeger:
    protocols:
      grpc:
        endpoint: ${env:MY_POD_IP}:14250
      thrift_compact:
        endpoint: ${env:MY_POD_IP}:6831
      thrift_http:
        endpoint: ${env:MY_POD_IP}:14268
  otlp:
    protocols:
      grpc:
        endpoint: ${env:MY_POD_IP}:4317
      http:
        endpoint: ${env:MY_POD_IP}:4318
  prometheus:
    config:
      scrape_configs:
        - job_name: opentelemetry-collector
          scrape_interval: 10s
          static_configs:
            - targets:
                - ${env:MY_POD_IP}:8888
  zipkin:
    endpoint: ${env:MY_POD_IP}:9411
service:
  extensions:
    - health_check
    - memory_ballast
  pipelines:
    logs:
      exporters:
        - logging
      processors:
        - memory_limiter
        - batch
      receivers:
        - otlp
    metrics:
      exporters:
        - logging
      processors:
        - memory_limiter
        - batch
      receivers:
        - otlp
        - prometheus
    traces:
      exporters:
        - logging
      processors:
        - memory_limiter
        - batch
      receivers:
        - otlp
        - jaeger
        - zipkin
  telemetry:
    metrics:
      address: ${env:MY_POD_IP}:8888
```

The chart will also enable ports based on the default receivers. Default
configuration can be removed by setting the value to `null` in your
`values.yaml`. Ports can be disabled in the `values.yaml` as well.

You can add/modify any part of the configuration using the `config` section in
your `values.yaml`. When changing a pipeline, you must explicitly list all the
components that are in the pipeline, including any default components.

For example, to disable metrics and logging pipelines and non-otlp receivers:

```yaml
config:
  receivers:
    jaeger: null
    prometheus: null
    zipkin: null
  service:
    pipelines:
      traces:
        receivers:
          - otlp
      metrics: null
      logs: null
ports:
  jaeger-compact:
    enabled: false
  jaeger-thrift:
    enabled: false
  jaeger-grpc:
    enabled: false
  zipkin:
    enabled: false
```

All the configuration options (with comments) available in the chart can be view
in its
[values.yaml file](https://github.com/open-telemetry/opentelemetry-helm-charts/blob/main/charts/opentelemetry-collector/values.yaml).

### Presets

Many of the important components the Collector uses to monitor Kubernetes
require special setup in the Collector's own Kuberenetes deployment. In order to
make using these components easier, the Collector chart comes with some presets
that, when enabled, handle the complex setup for these important components.

Presets should be used as a starting point. They configure basic, but rich,
functionality for their related components. If your use case requires extra
configuration of these components it is recommend to NOT use the preset and
instead manually configure the component and anything it requires (volumes,
RBAC, etc.).

#### Logs Collection Preset

The collector can be used to collect logs sent to standard output by Kubernetes
containers.

This feature is disabled by default. It has the following requirements in order
to be safely enabled:

- It requires the
  [`filelogreceiver`](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/receiver/filelogreceiver)
  be included in the Collector image, such as the
  [Contrib distribution of the Collector](https://github.com/open-telemetry/opentelemetry-collector-releases/pkgs/container/opentelemetry-collector-releases%2Fopentelemetry-collector-contrib).
- Although not a strict requirement, it is recommended this preset be used with
  `mode=daemonset`. The `filelogreceiver` will only be able to collect logs on
  the node the Collector is running and multiple configured Collectors on the
  same node will produce duplicate data.

To enable this feature, set the `presets.logsCollection.enabled` property to
`true`. When enabled, the chart will add a `filelogreceiver` to the `logs`
pipeline. This receiver is configured to read the files where Kubernetes
container runtime writes all containers' console output
(`/var/log/pods/*/*/*.log`).

Here is an example `values.yaml`:

```yaml
mode: daemonset
presets:
  logsCollection:
    enabled: true
```

The chart's default logs pipeline uses the `loggingexporter`. Paired with the
`logsCollection` preset's `filelogreceiver` it is easy to accidentally feed the
exported logs back into the Collector, which can cause a "log explosion".

To prevent the looping, the default configuration of the receiver excludes the
Collector's own logs. If you want to include the collector's logs, make sure to
replace the `logging` exporter with an exporter that does not send logs to
collector's standard output.

Here's an example `values.yaml` that replaces the default `logging` exporter on
the `logs` pipeline with an `otlphttp` exporter that sends the container logs to
`https://example.com:55681` endpoint. It also uses
`presets.logsCollection.includeCollectorLogs` to tell the preset to enable
collection of the Collector's logs.

```yaml
mode: daemonset

presets:
  logsCollection:
    enabled: true
    includeCollectorLogs: true

config:
  exporters:
    otlphttp:
      endpoint: https://example.com:55681
  service:
    pipelines:
      logs:
        exporters:
          - otlphttp
```

#### Kubernetes Attributes Preset

The collector can be configured to add Kubernetes metadata, such as
k8s.pod.name, k8s,namespace.name, and k8s.node.name, to logs, metrics and
traces. It is highly recommended to use the preset, or enable the
k8sattributesprocessor manually.

Due to RBAC considerations, this feature is disabled by default. It has the
following requirements:

- It requires the
  [`k8sattributesprocessor`](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/k8sattributesprocessor)
  be included in the Collector image, such as the
  [Contrib distribution of the Collector](https://github.com/open-telemetry/opentelemetry-collector-releases/pkgs/container/opentelemetry-collector-releases%2Fopentelemetry-collector-contrib).

To enable this feature, set the `presets.kubernetesAttributes.enabled` property
to `true`. When enabled, the chart will add the necessary RBAC roles to the
ClusterRole and will add a `k8sattributesprocessor` to each enabled pipeline.

Here is an example `values.yaml`:

```yaml
mode: daemonset
presets:
  kubernetesAttributes:
    enabled: true
```

#### Kubelet Metrics Preset

The Collector can be configured to collect Kubelet metrics.

This feature is disabled by default. It has the following requirements:

- It requires the
  [`kubeletstatsreceiver`](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/receiver/kubeletstatsreceiver)
  be included in the Collector image, such as the
  [Contrib distribution of the Collector](https://github.com/open-telemetry/opentelemetry-collector-releases/pkgs/container/opentelemetry-collector-releases%2Fopentelemetry-collector-contrib).
- Although not a strict requirement, it is recommended this preset be used with
  `mode=daemonset`. The `kubeletstatsreceiver` will only be able to collect
  metrics on the node the Collector is running and multiple configured
  Collectors on the same node will produce duplicate data.

To enable this feature, set the `presets.kubeletMetrics.enabled` property to
`true`. When enabled, the chart will add the necessary RBAC roles to the
ClusterRole and will add a `kubeletstatsreceiver` to the metrics pipeline.

Here is an example `values.yaml`:

```yaml
mode: daemonset
presets:
  kubeletMetrics:
    enabled: true
```

#### Cluster Metrics Preset

The collector can be configured to collect cluster-level metrics from the
Kubernetes API server. These metrics include many of the metrics collected by
Kube State Metrics.

This feature is disabled by default. It has the following requirements:

- It requires the
  [`k8sclusterreceiver`](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/receiver/k8sclusterreceiver)
  be included in the Collector image, such as the
  [Contrib distribution of the Collector](https://github.com/open-telemetry/opentelemetry-collector-releases/pkgs/container/opentelemetry-collector-releases%2Fopentelemetry-collector-contrib).
- Although not a strict requirement, it is recommended this preset be used with
  `mode=deployment` or `mode=statefulset` with a single replica. Running
  `k8sclusterreceiver` on multiple Collectors will produce duplicate data.

To enable this feature, set the `presets.clusterMetrics.enabled` property to
`true`. When enabled, the chart will add the necessary RBAC roles to the
ClusterRole and will add a `k8sclusterreceiver` to the metrics pipeline.

Here is an example `values.yaml`:

```yaml
mode: deployment
replicaCount: 1
presets:
  clusterMetrics:
    enabled: true
```

#### Kubernetes Events Preset

The collector can be configured to collect Kubernetes events.

This feature is disabled by default. It has the following requirements:

- It requires the
  [`k8sobjectsreceiver`](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/receiver/k8sobjectsreceiver)
  be included in the Collector image, such as the
  [Contrib distribution of the Collector](https://github.com/open-telemetry/opentelemetry-collector-releases/pkgs/container/opentelemetry-collector-releases%2Fopentelemetry-collector-contrib).
- Although not a strict requirement, it is recommended this preset be used with
  `mode=deployment` or `mode=statefulset` with a single replica. Running
  `k8sclusterreceiver` on multiple Collectors will produce duplicate data.

To enable this feature, set the `presets.kubernetesEvents.enabled` property to
`true`. When enabled, the chart will add the necessary RBAC roles to the
ClusterRole and will add a `k8sobjectsreceiver` to the logs pipeline configure
to only collector events.

Here is an example `values.yaml`:

```yaml
mode: deployment
replicaCount: 1
presets:
  kubernetesEvents:
    enabled: true
```

#### Host Metrics Preset

The collector can be configured to collect host metrics from Kubernetes nodes.

This feature is disabled by default. It has the following requirements:

- It requires the
  [`hostmetricsreceiver`](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/receiver/hostmetricsreceiver)
  be included in the Collector image, such as the
  [Contrib distribution of the Collector](https://github.com/open-telemetry/opentelemetry-collector-releases/pkgs/container/opentelemetry-collector-releases%2Fopentelemetry-collector-contrib).
- Although not a strict requirement, it is recommended this preset be used with
  `mode=daemonset`. The `hostmetricsreceiver` will only be able to collect
  metrics on the node the Collector is running and multiple configured
  Collectors on the same node will produce duplicate data.

To enable this feature, set the `presets.hostMetrics.enabled` property to
`true`. When enabled, the chart will add the necessary volumes and volumeMounts
and will add a `hostmetricsreceiver` to the metrics pipeline. By default metrics
will be scrapped every 10 seconds and the following scrappers are enabled:

- cpu
- load:
- memory:
- disk:
- filesystem\*
- network

\*due to some overlap with the kubeletMetrics preset some filesystem types and
mount points are excluded by default.

Here is an example `values.yaml`:

```yaml
mode: daemonset
presets:
  hostMetrics:
    enabled: true
```
