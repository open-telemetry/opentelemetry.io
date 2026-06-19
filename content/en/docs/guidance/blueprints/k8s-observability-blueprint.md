---
title: Kubernetes Observability
linkTitle: Kubernetes Observability
date: 2026-04-23
author: Alexandre Ferreira
---

## Summary

This blueprint outlines a strategic reference for Platform Engineering and SRE teams responsible for providing observability infrastructure in Kubernetes clusters. It covers two verticals: resource usage and operational state of workloads, and health of Kubernetes critical components (DNS, networking, ingress).

By implementing the patterns in this blueprint, organizations can expect to achieve:

- Out-of-the-box visibility into workload resource usage, OOM events, probe failures, and pod lifecycle state without application-side changes.
- Path to reliable monitoring of Kubernetes critical components (CoreDNS, CNI plugins, Ingress controllers, KEDA, etc)
- Uniform metadata enrichment using OTel semantic conventions, enabling correlated investigation across metrics, logs, and traces.
- Self-monitoring of the telemetry collection infrastructure so silent data gaps are detected before they affect incident response.
- When to use OTLP native ingestion like cluster metrics vs Prometheus ingestion for Control Plane components that doesn't offer OTLP support yet - please note that Prometheus compatibility on OTel pipelines are subject of a separate blueprint

## Background

Kubernetes clusters host two classes of observable entities. **Workloads** — application containers and the Kubernetes primitives (Statefulset, Deployment, Daemonset, ReplicaSet, etc) managing them — emit signals via OTel SDKs, but their resource utilization and operational state (CPU throttling, OOM kills, pod phase, probe results) are only visible through Kubernetes-specific APIs. **Critical infrastructure components** — CoreDNS, CNI plugins, Ingress controllers, volume subsystems, KEDA, and similar platform services — are (generally) platform-owned, expose Prometheus metrics natively, and require dedicated scrape configurations.

This blueprint focuses on *what* to collect and *how to label it*. Collector pipeline topology (gateway vs. agent, batching, retry) is documented in a separate blueprint. This blueprint assumes a set of OTel Collectors are already available in the cluster

## Common Challenges

### 1. Workload Telemetry Is Incomplete

CPU throttling, OOM kills, pod phase transitions, and probe failures are not emitted by application code. They are only accessible through the Kubernetes API server, the kubelet, and cAdvisor — sources the platform team must explicitly collect.

This leads to:

- **Invisible resource pressure**: CPU throttling at the cgroup level surfaces only as increased latency, with no infrastructure attribution.
- **OOM kills appear as application crashes**: Without a correlated OOM signal, operators cannot distinguish a memory misconfiguration from an application bug.
- **Throttled versus OOM is indistinguishable**: Both cause pod restarts. Without container restart and last-terminated-reason signals (`k8s.container.restarts` from the API server) correlated with kubelet CPU/memory metrics, there is no basis for remediation.

### 2. Critical Cluster Components Are Not Observable by Default

CoreDNS, CNI plugins, Ingress controllers, KEDA, cert-manager **and many others** each expose metrics with no standard discovery mechanism.

Some examples of what this leads to:

- **DNS latency spikes look like application problems**: CoreDNS slowdowns appear as upstream timeouts, indistinguishable from a slow downstream service without a DNS-layer metric.
- **CNI packet drops are unattributed**: Packets dropped at the network policy layer surface as intermittent pod connectivity failures with no network-layer attribution.
- **KEDA failures leave workloads silently under-provisioned**: A scaler that cannot reach its source metric stops autoscaling without producing any user-visible error.

### 3. Telemetry Collection Infrastructure Has No Self-Monitoring

The OTel Collector and its receivers are the foundation of all cluster observability. When they fail, the resulting gaps are silent — dashboards show "no data" and no alert fires on the absence of metrics.

This leads to:

- **A crashed cluster-metrics Collector removes all workload-state visibility**: The `k8s.pod.*` and `k8s.deployment.*` families disappear silently; operators may not notice until mid-incident.
- **Tainted nodes have no DaemonSet Collector coverage**: GPU or spot nodes without DaemonSet tolerations have no CPU, memory, or filesystem metrics.
- **The Collector drops data silently under backpressure**: SLO calculations based on incomplete data produce false confidence.

### 4. Metadata Is Inconsistent Across Signals and Layers

Each scraper attaches different label schemas (`pod_name`, `pod`, `kubernetes_namespace`, `namespace`). OTel semantic convention attributes (`k8s.pod.name`, `k8s.namespace.name`) are not applied automatically.

This leads to:
- **Disjointed Infra telemetry from App telemetry**: Increases cognitive load on operators to troubleshoot if a certain issue is caused by the app/container or infra/resources
- **Alert rules break silently on scraper changes**: An alert written against `pod_name` stops matching when a new scraper uses `pod`.
- **Organizational context is absent**: Team ownership, environment, and tier labels from pod annotations are rarely in telemetry, making alert routing and cost attribution manual.

## General Guidelines

### 1. Use OTel native exporters to collect Workload and Infrastructure signals
<small>Challenges Addressed: 1, 2</small>

Up until recently, teams had to use Prometheus components like kube-state-metrics and node-exporter to get telemetry from workloads and resource usage.

Now, the recommended best practice is to use Otel native receivers:

| OpenTelemetry Collector component | Helm chart preset | Analog Prometheus/Kubernetes component | What it covers                                                                                                                                   |
| --------------------------------- | ----------------- | -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| **`k8s_cluster` receiver**        | `clusterMetrics`  | **kube-state-metrics**                 | Kubernetes object/state metrics from the Kubernetes API, such as pods, nodes, namespaces, workloads, quotas, and conditions.                     |
| **`hostmetrics` receiver**        | `hostMetrics`     | **node-exporter**                      | Host/node OS metrics such as CPU, memory, filesystem, disk I/O, network, load, paging, processes, and system metrics.                            |
| **`kubeletstats` receiver**       | `kubeletMetrics`  | **cAdvisor / kubelet metrics**         | Node, pod, container, and volume resource metrics from the kubelet. This is the closest OTel-native analog for cAdvisor-style container metrics. |

For each critical component (CoreDNS, CNI, Ingress, KEDA, core-dns, cert-manager, etc), the platform team must explicitly configure these components to expose metrics and configure the Otel collectors to properly collect them, either explicitly or via annotation auto-discovery. (Refer to Prometheus blueprint)

Outcomes:
- Complete workload-level resource coverage (throttling, OOM, pod phase, probe failures) without any application code changes.
- Visibility into critical cluster subsystems through pre-configured scrape jobs and alert rules.

### 2. Use the OpenTelemetry Operator as the Control Plane for Collector Lifecycle and Distributed Prometheus Scraping
<small>Challenges Addressed: 1, 2, 3</small>

The OpenTelemetry Operator must manage all OTel Collectors in the cluster. It provides two capabilities essential for correct Kubernetes observability:

**TargetAllocator**: Without coordination, each Collector replica independently discovers and scrapes *all* Prometheus targets — N replicas produce N× the data volume, making `sum(rate(...))` aggregations incorrect. The TargetAllocator acts as a single service discovery coordinator: it builds the full target list once and distributes targets across replicas such that each target is scraped by exactly one replica.

**`OpenTelemetryCollector` CRD**: Declares Collector configuration as a Kubernetes object, enabling GitOps workflows, versioned rollouts, and per-namespace scoping. The Operator also manages Collector deployment modes — **Deployment** for cluster-scoped scraping with TargetAllocator, **DaemonSet** for node-level collection — each appropriate for different collection patterns in this blueprint.

The Operator additionally introduces the `Instrumentation` CRD for zero-code auto-instrumentation injection. While that is out of scope here, it makes the Operator the correct foundational dependency for the full cluster observability stack.

Outcomes:
- Each Prometheus target scraped exactly once regardless of Collector replica count.
- Declarative, GitOps-compatible Collector config with no drift across clusters.

### 3. Apply Uniform Metadata Enrichment Using OpenTelemetry Semantic Conventions
<small>Challenges Addressed: 4</small>

All telemetry signals, regardless of origin, must be enriched with OTel Kubernetes resource attributes before reaching the backend. This is done via the `k8sattributesprocessor` in the Collector, which resolves pod metadata from the Kubernetes API at collection time. Enrichment must cover well-known OTel attributes (`k8s.pod.name`, `k8s.namespace.name`, `k8s.node.name`, `k8s.deployment.name`, `k8s.cluster.name`) and organization-specific labels promoted from pod annotations (team, environment, tier).

Outcomes:
- Metrics, logs, and traces from any source join on consistent attributes with no per-query remapping.
- Alert rules and dashboards are portable across scraper replacements.

### 4. Instrument the Instrumentation — Self-Monitor All Telemetry Collection Components
<small>Challenges Addressed: 3</small>

The OTel Collector and its receivers must be monitored for their own internal health metrics and alerted on using the same pipeline as primary data. Self-monitoring must cover: `k8s_cluster` receiver Kubernetes API errors, DaemonSet Collector coverage versus total node count, Collector queue depth and drop rates, and `up == 0` for every remaining Prometheus scrape target (critical components).

Outcomes:
- Silent data gaps are paged before affecting incident response or SLO calculations.
- An observability coverage SLO is enforceable (e.g., "100% of nodes have an active DaemonSet Collector").

### 6. Provide Reference Deployment Architectures for Each Telemetry Component
<small>Challenges Addressed: 1, 2, 3</small>

Each telemetry component in this blueprint has a canonical deployment reference: Helm chart, RBAC requirements, resource requests, and links to sample dashboards and alerts (note that thresholds are almost always environment specific, tune it to your needs). New clusters reach full observability coverage with a repeatable playbook rather than tribal knowledge.

## Implementation

### 0. Deploy the OpenTelemetry Operator and the Collector Helm Chart
<small>Guidelines Supported: 2, 6</small>

First, deploy the OTel Operator using the `opentelemetry-operator` Helm chart. The Operator and its TargetAllocator remain responsible for distributed **Prometheus scraping of critical components** (Steps 4–7).

```bash
helm repo add open-telemetry https://open-telemetry.github.io/opentelemetry-helm-charts
helm install opentelemetry-operator open-telemetry/opentelemetry-operator \
  --namespace opentelemetry --create-namespace
```

Then deploy Collectors with the `opentelemetry-collector` Helm chart. Rather than hand-writing receiver, processor, and RBAC configuration, this blueprint enables the chart's **presets** — each preset wires the matching receiver/processor into the pipeline and generates the required RBAC, volumes, and mounts automatically. The remaining steps are `values.yaml` fragments for this chart.

Because the native receivers have different deployment requirements (see Guideline 2), install the chart as **two releases**:

- a single-replica **Deployment** for cluster-wide metrics (`clusterMetrics`, Step 1)
- a **DaemonSet** for per-node host and kubelet metrics (`hostMetrics` + `kubeletMetrics`, Step 2)

Both releases enable the `kubernetesAttributes` preset (Step 3). Use a Collector image that includes the Contrib receivers, for example:

```bash
helm install otel-cluster open-telemetry/opentelemetry-collector \
  --namespace opentelemetry --values cluster-values.yaml
helm install otel-agent open-telemetry/opentelemetry-collector \
  --namespace opentelemetry --values agent-values.yaml
```

Documentation:
- [OpenTelemetry Operator Helm chart](https://opentelemetry.io/docs/platforms/kubernetes/helm/operator/)
- [OpenTelemetry Collector Helm chart](https://opentelemetry.io/docs/platforms/kubernetes/helm/collector/)
- [TargetAllocator](https://opentelemetry.io/docs/platforms/kubernetes/operator/target-allocator/)

### 1. Collect Cluster-State Metrics with the `clusterMetrics` Preset
<small>Guidelines Supported: 1, 6</small>

The `k8s_cluster` receiver provides object state (pod phase, restart counts, replica state, node conditions) by watching the Kubernetes API — the OTel-native replacement for kube-state-metrics. It does not provide resource consumption; that comes from the kubelet (Step 2).

Because the receiver gathers cluster-wide telemetry, run it in a **single-replica Deployment** Collector. Multiple replicas produce duplicate data. Use the `opentelemetry-collector` Helm chart with the `clusterMetrics` preset, which adds the `k8s_cluster` receiver and the required RBAC automatically:

```yaml
mode: deployment
replicaCount: 1
presets:
  clusterMetrics:
    enabled: true
```

This emits OTel-native equivalents such as `k8s.pod.phase`, `k8s.container.restarts`, `k8s.deployment.available`/`k8s.deployment.desired`, `k8s.node.condition_ready`, and quota/replica state. Requires a Collector image that includes the receiver (such as the Contrib distribution).

Documentation: [Cluster Metrics preset](https://opentelemetry.io/docs/platforms/kubernetes/helm/collector/#cluster-metrics-preset), [Kubernetes Cluster Receiver](https://opentelemetry.io/docs/platforms/kubernetes/collector/components/#kubernetes-cluster-receiver)

### 2. Collect Host and Kubelet Metrics with the `hostMetrics` and `kubeletMetrics` Presets
<small>Guidelines Supported: 1, 6</small>

Host/node OS metrics (the node-exporter replacement) come from the `hostmetrics` receiver, and node/pod/container resource consumption (the cAdvisor/kubelet replacement) comes from the `kubeletstats` receiver. Both must run **once per node**, so deploy them together in a single **DaemonSet** Collector with both presets enabled:

```yaml
mode: daemonset
presets:
  hostMetrics:
    enabled: true
  kubeletMetrics:
    enabled: true
```

The `hostMetrics` preset enables the `cpu`, `load`, `memory`, `disk`, `filesystem`, and `network` scrapers and mounts the host root filesystem at `/hostfs`. The `kubeletMetrics` preset adds the `kubeletstats` receiver (with `metric_groups: [node, pod, container]`) and its RBAC. Both presets add the necessary volumes/RBAC automatically and require a Collector image that includes the receivers (such as the Contrib distribution).

To guarantee coverage on control-plane and tainted nodes (GPU, spot), add tolerations to the DaemonSet so every node is scraped — any node without a Collector pod is a coverage gap (see Step 8).

Documentation: [Host Metrics preset](https://opentelemetry.io/docs/platforms/kubernetes/helm/collector/#host-metrics-preset), [Kubelet Metrics preset](https://opentelemetry.io/docs/platforms/kubernetes/helm/collector/#kubelet-metrics-preset), [Host Metrics Receiver](https://opentelemetry.io/docs/platforms/kubernetes/collector/components/#host-metrics-receiver), [Kubeletstats Receiver](https://opentelemetry.io/docs/platforms/kubernetes/collector/components/#kubeletstats-receiver)

### 3. Apply Metadata Enrichment with the `kubernetesAttributes` Preset
<small>Guidelines Supported: 3</small>

Enable the `kubernetesAttributes` preset on every Collector to wire the `k8sattributesprocessor` into all pipelines and add the required RBAC. For full control over which attributes and labels are extracted, configure the processor explicitly in all pipelines:

```yaml
processors:
  k8sattributes:
    auth_type: serviceAccount
    extract:
      metadata:
        - k8s.pod.name
        - k8s.pod.uid
        - k8s.namespace.name
        - k8s.node.name
        - k8s.deployment.name
        - k8s.daemonset.name
        - k8s.statefulset.name
        - k8s.cluster.uid
      labels:
        - tag_name: team
          key: app.kubernetes.io/team
          from: pod
        - tag_name: environment
          key: app.kubernetes.io/part-of
          from: pod
    pod_association:
      - sources: [{from: resource_attribute, name: k8s.pod.ip}]
      - sources: [{from: resource_attribute, name: k8s.pod.uid}]
      - sources: [{from: connection}]
```

Required ClusterRole rules:
```yaml
- apiGroups: [""]
  resources: ["pods", "namespaces", "nodes", "endpoints"]
  verbs: ["get", "list", "watch"]
- apiGroups: ["apps"]
  resources: ["replicasets"]
  verbs: ["get", "list", "watch"]
```

If `k8s.cluster.name` is not resolvable from cloud metadata, inject it as a static resource attribute via the `resourceprocessor`.

Documentation: [Kubernetes Attributes preset](https://opentelemetry.io/docs/platforms/kubernetes/helm/collector/#kubernetes-attributes-preset), [k8sattributesprocessor](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/k8sattributesprocessor), [K8s semantic conventions](https://opentelemetry.io/docs/specs/semconv/resource/k8s/)


### 4. Configure CoreDNS Scraping
<small>Guidelines Supported: 1, 6</small>

CoreDNS exposes metrics on port 9153. Scrape the `kube-dns` service in `kube-system`:

```yaml
- job_name: coredns
  kubernetes_sd_configs:
    - role: endpoints
      namespaces:
        names: [kube-system]
  relabel_configs:
    - source_labels: [__meta_kubernetes_service_name]
      action: keep
      regex: kube-dns
    - source_labels: [__meta_kubernetes_endpoint_port_name]
      action: keep
      regex: metrics
```

Alert on: `coredns_dns_request_duration_seconds` p99 > 500ms, `coredns_dns_responses_total{rcode="SERVFAIL"}` rate, `coredns_panics_total` > 0, `up == 0`. Add a NetworkPolicy if the cluster enforces egress restrictions from the Collector to port 9153.

Documentation: [CoreDNS metrics](https://coredns.io/plugins/metrics/)

### 5. Configure CNI Plugin Scraping
<small>Guidelines Supported: 1, 6</small>

**Cilium** (agent port 9962, operator port 9963):
```yaml
- job_name: cilium-agent
  kubernetes_sd_configs:
    - role: pod
  relabel_configs:
    - source_labels: [__meta_kubernetes_pod_label_k8s_app]
      action: keep
      regex: cilium
    - replacement: "$1:9962"
      source_labels: [__meta_kubernetes_pod_ip]
      target_label: __address__
```
Key metrics: `cilium_drop_count_total`, `cilium_forward_count_total`, `cilium_policy_enforcement_status`.

**Calico / Felix** (port 9091):
```yaml
- job_name: calico-felix
  kubernetes_sd_configs:
    - role: pod
  relabel_configs:
    - source_labels: [__meta_kubernetes_pod_label_app]
      action: keep
      regex: calico-node
    - replacement: "$1:9091"
      source_labels: [__meta_kubernetes_pod_ip]
      target_label: __address__
```
Key metrics: `felix_active_local_policies`, `felix_ipset_errors`, `felix_route_table_sync_errors_total`.

**Flannel**: No Prometheus metrics by default — rely on `system.network.*` from the `hostmetrics` receiver (Step 2).

Documentation: [Cilium metrics](https://docs.cilium.io/en/stable/observability/metrics/), [Calico Felix](https://docs.tigera.io/calico/latest/reference/felix/configuration)

### 6. Configure Ingress Controller Scraping
<small>Guidelines Supported: 1, 6</small>

**NGINX Ingress** (port 10254):
```yaml
- job_name: nginx-ingress
  kubernetes_sd_configs:
    - role: pod
  relabel_configs:
    - source_labels: [__meta_kubernetes_pod_label_app_kubernetes_io_name]
      action: keep
      regex: ingress-nginx
    - replacement: "$1:10254"
      source_labels: [__meta_kubernetes_pod_ip]
      target_label: __address__
```

**Traefik** (port 8082):
```yaml
- job_name: traefik
  kubernetes_sd_configs:
    - role: pod
  relabel_configs:
    - source_labels: [__meta_kubernetes_pod_label_app_kubernetes_io_name]
      action: keep
      regex: traefik
    - replacement: "$1:8082"
      source_labels: [__meta_kubernetes_pod_ip]
      target_label: __address__
```

Alert on: 5xx rate > 1% over 5 minutes, TLS certificate expiry within 30 days, `up == 0`.

### 7. Configure KEDA Scraping (Conditional)
<small>Guidelines Supported: 1, 6</small>

Applies only to clusters running KEDA. KEDA exposes metrics on port 8080:

```yaml
- job_name: keda-operator
  kubernetes_sd_configs:
    - role: pod
      namespaces:
        names: [keda]
  relabel_configs:
    - source_labels: [__meta_kubernetes_pod_label_app]
      action: keep
      regex: keda-operator
    - replacement: "$1:8080"
      source_labels: [__meta_kubernetes_pod_ip]
      target_label: __address__
```

Key metrics: `keda_scaler_active`, `keda_scaler_metrics_value`, `keda_scaler_error_total`, `keda_scaled_object_paused`. Alert on `keda_scaler_error_total` rate > 0 for 5 minutes.

Documentation: [KEDA metrics](https://keda.sh/docs/latest/operate/prometheus/)

### 8. Enable and Monitor OTel Collector Internal Telemetry
<small>Guidelines Supported: 4</small>

Enable in the `OpenTelemetryCollector` CR:
```yaml
service:
  telemetry:
    metrics:
      level: detailed
    logs:
      level: warn
```

Suggested alerts:
```yaml
- alert: CollectorExporterFailures
  expr: rate(otelcol_exporter_send_failed_metric_points[5m]) > 0
  for: 2m
- alert: CollectorProcessorDrops
  expr: rate(otelcol_processor_dropped_metric_points[5m]) > 0
  for: 2m
- alert: CollectorQueueFull
  expr: otelcol_exporter_queue_size / otelcol_exporter_queue_capacity > 0.8
  for: 5m
```

Documentation: [Collector internal telemetry](https://opentelemetry.io/docs/collector/internal-telemetry/)

## Reference Architectures

The patterns described above have been successfully implemented by the following end-users:

- [OpenTelemetry Demo](https://opentelemetry.io/docs/demo/) — OTLP-instrumented workloads running alongside infrastructure scrapers in a Kubernetes cluster.
- Additional end-user reference architectures from the [OTel end-user working group](https://github.com/open-telemetry/opentelemetry-community/blob/main/working-groups/end-user.md).

## Appendix

### A. RBAC Reference — Minimum Required Permissions

The Helm chart presets (`clusterMetrics`, `hostMetrics`, `kubeletMetrics`, `kubernetesAttributes`) generate the rows below automatically. They are listed for reference and for non-preset deployments.

| Component | Resource | Verbs | Notes |
|---|---|---|---|
| Collector (`k8s_cluster`) | `pods`, `nodes`, `namespaces`, `events`, `replicationcontrollers`, `resourcequotas`, `services` (core); `daemonsets`, `deployments`, `replicasets`, `statefulsets` (apps); `jobs`, `cronjobs` (batch); `horizontalpodautoscalers` (autoscaling) | `get`, `list`, `watch` | Added by `clusterMetrics` preset |
| Collector (`hostmetrics`) | — | — | Reads from host `/proc` and `/sys` via `/hostfs` mount; no API access |
| Collector (`kubeletstats`) | `nodes/stats`, `nodes/proxy` | `get`, `list`, `watch` | Added by `kubeletMetrics` preset |
| Collector (k8sattributes) | `pods`, `namespaces`, `nodes`, `endpoints` | `get`, `list`, `watch` | Added by `kubernetesAttributes` preset |
| Collector (k8sattributes) | `replicasets` (apps) | `get`, `list`, `watch` | Owner ref resolution to Deployment |
| TargetAllocator | `services`, `endpoints`, `pods`, `nodes`, `namespaces` | `get`, `list`, `watch` | Prometheus service discovery |
| OTel Operator | `opentelemetrycollectors`, `instrumentations` | `*` | Created by Operator Helm chart |

### B. Prometheus-to-OTel Metric Name Mapping

| Prometheus metric | OTel equivalent | Notes |
|---|---|---|
| `node_cpu_seconds_total` | `system.cpu.time` | `mode` → `system.cpu.state` |
| `node_memory_MemAvailable_bytes` | `system.memory.usage` | state `free` |
| `node_filesystem_avail_bytes` | `system.filesystem.usage` | state `free` |
| `node_network_receive_bytes_total` | `system.network.io` | direction `receive` |
| `node_network_transmit_bytes_total` | `system.network.io` | direction `transmit` |
| `container_cpu_usage_seconds_total` | `container.cpu.time` | |
| `container_memory_working_set_bytes` | `container.memory.usage` | excludes inactive file cache |
| `kube_pod_status_phase` | `k8s.pod.phase` | From the `k8s_cluster` receiver |
| `kube_pod_container_status_restarts_total` | `k8s.container.restarts` | From the `k8s_cluster` receiver |
| `kube_deployment_status_replicas_available` | `k8s.deployment.available` | `k8s_cluster`; `k8s.deployment.desired` for spec |
| `coredns_*`, `nginx_*`, `keda_*`, `cilium_*` | No OTel equivalent yet | Critical components — retain Prometheus names |

### C. k8sattributesprocessor Configuration Examples

**Metrics (`k8s_cluster` / `kubeletstats`):**
```yaml
processors:
  k8sattributes:
    auth_type: serviceAccount
    extract:
      metadata: [k8s.pod.name, k8s.pod.uid, k8s.namespace.name, k8s.node.name, k8s.deployment.name]
    pod_association:
      - sources: [{from: resource_attribute, name: k8s.pod.ip}]
      - sources: [{from: resource_attribute, name: k8s.pod.uid}]
```

**Container logs:**
```yaml
processors:
  k8sattributes:
    auth_type: serviceAccount
    extract:
      metadata: [k8s.pod.name, k8s.namespace.name, k8s.node.name, k8s.container.name]
    pod_association:
      - sources: [{from: connection}]
```

**Promoting pod labels:**
```yaml
processors:
  k8sattributes:
    auth_type: serviceAccount
    extract:
      labels:
        - tag_name: k8s.app.team
          key: app.kubernetes.io/managed-by
          from: pod
        - tag_name: deployment.environment
          key: environment
          from: namespace
        - tag_name: service.tier
          key: tier
          from: pod
```

### D. Dashboard and Alert Registry

Community dashboards for cluster-state and host metrics are written against Prometheus metric names (`kube_*`, `node_*`). When collecting natively with the `k8s_cluster` and `hostmetrics` receivers, either pick a dashboard built for OTel semantic-convention metric names or adapt the queries using the mapping in Appendix B.

| Component | Dashboard | Key Alerts |
|---|---|---|
| Cluster state (`k8s_cluster`) | [Grafana community 13332](https://grafana.com/grafana/dashboards/13332) (adapt to `k8s.*` names) | Pod restarts, replica drift, node conditions |
| Host metrics (`hostmetrics`) | [Grafana community 1860](https://grafana.com/grafana/dashboards/1860) (adapt to `system.*` names) | CPU saturation, memory pressure, disk full |
| CoreDNS | [Grafana community 14981](https://grafana.com/grafana/dashboards/14981) | SERVFAIL rate, p99 latency, pod availability |
| NGINX Ingress | [Grafana community 9614](https://grafana.com/grafana/dashboards/9614) | 5xx rate, upstream latency, TLS expiry |
| Traefik | [Grafana community 17346](https://grafana.com/grafana/dashboards/17346) | Request error rate, TLS expiry |
| Cilium | [Grafana community 16611](https://grafana.com/grafana/dashboards/16611) | Drop rate, policy enforcement |
| KEDA | [Grafana community 16612](https://grafana.com/grafana/dashboards/16612) | Scaler error rate, pause state |
| OTel Collector | [Grafana community 15983](https://grafana.com/grafana/dashboards/15983) | Queue fill, exporter failures, drop rate |

### E. Troubleshooting — Common Data Gaps

**Cluster-state metrics missing (`k8s.pod.*`, `k8s.deployment.*`)**
1. Verify the `clusterMetrics` Collector pod is running and is a **single replica** (multiple replicas duplicate data)
2. `kubectl logs` the Collector for Kubernetes API permission errors; confirm the `k8s_cluster` ClusterRole is bound
3. Confirm the Collector image includes the `k8s_cluster` receiver (e.g. the Contrib distribution)

**Host metrics missing on specific nodes (`system.*`)**
1. `kubectl get ds` for the DaemonSet Collector — compare desired vs. ready count
2. `kubectl describe node <node> | grep Taint` — add matching tolerations so the DaemonSet schedules on tainted/control-plane nodes
3. Verify the `/hostfs` host mount is present and the Collector image includes the `hostmetrics` receiver

**Metadata attributes missing in backend**
1. Verify `k8sattributesprocessor` ClusterRole is bound to the Collector service account
2. Check Collector logs for Kubernetes API errors
3. Verify the Collector pod can reach pod IPs (needed for connection-based association)

**Duplicate metrics in backend**
1. Find the metric in both `prometheusreceiver` and a native receiver (`k8s_cluster`, `hostmetrics`, `kubeletstats`) — collecting the same signal twice is the usual cause
2. Choose the OTel-native receiver as the authoritative source and remove the overlapping Prometheus scrape job
3. Update dashboards and alerts to the authoritative metric name, then remove the duplicate config

**Collector silently dropping data**
1. Check `otelcol_exporter_send_failed_metric_points` and `otelcol_processor_dropped_metric_points`
2. Check queue utilization: `otelcol_exporter_queue_size / otelcol_exporter_queue_capacity`
3. If consistently > 80%: reduce scrape frequency, increase queue capacity, or scale Collector replicas (TargetAllocator rebalances automatically)
