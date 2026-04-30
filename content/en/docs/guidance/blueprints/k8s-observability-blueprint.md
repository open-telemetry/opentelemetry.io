---
title: Centralized Observability Platform on Kubernetes
linkTitle: Centralized Observability Platform on Kubernetes
date: 2026-04-23
author: Alexandre Ferreira
---

## Summary

This blueprint outlines a strategic reference for Platform Engineering and SRE teams responsible for providing observability infrastructure in Kubernetes clusters. It covers two verticals: resource usage and operational state of workloads, and health of Kubernetes critical components (DNS, networking, ingress).

By implementing the patterns in this blueprint, organizations can expect to achieve:

- Out-of-the-box visibility into workload resource usage, OOM events, probe failures, and pod lifecycle state without application-side changes.
- Reliable monitoring of Kubernetes critical components (CoreDNS, CNI plugins, Ingress controllers, KEDA) with known-good dashboards and alerts.
- Uniform metadata enrichment using OTel semantic conventions, enabling correlated investigation across metrics, logs, and traces.
- Self-monitoring of the telemetry collection infrastructure so silent data gaps are detected before they affect incident response.
- A clear decision framework for Prometheus format versus OTLP, preventing duplicate collection and inconsistent naming.

## Background

Kubernetes clusters host two classes of observable entities. **Workloads** — application containers and the Kubernetes primitives managing them — emit signals via OTel SDKs, but their resource utilization and operational state (CPU throttling, OOM kills, pod phase, probe results) are only visible through Kubernetes-specific APIs. **Critical infrastructure components** — CoreDNS, CNI plugins, Ingress controllers, volume subsystems, KEDA — are platform-owned, expose Prometheus metrics natively, and require dedicated scrape configurations.

This blueprint focuses on *what* to collect and *how to label it*. Collector pipeline topology (gateway vs. agent, batching, retry) is documented in a separate blueprint. This blueprint assumes an OTel Collector is already available in the cluster.

## Common Challenges

### 1. Workload Telemetry Is Incomplete Without Dedicated Scrapers

CPU throttling, OOM kills, pod phase transitions, and probe failures are not emitted by application code. They are only accessible through the kubelet API, cAdvisor, and kube-state-metrics — separate workloads the platform team must explicitly deploy and scrape.

This leads to:

- **Invisible resource pressure**: CPU throttling at the cgroup level surfaces only as increased latency, with no infrastructure attribution.
- **OOM kills appear as application crashes**: Without a correlated OOM signal, operators cannot distinguish a memory misconfiguration from an application bug.
- **Throttled versus OOM is indistinguishable**: Both cause pod restarts. Without `kube_pod_container_status_last_terminated_reason` and `container_cpu_cfs_throttled_periods_total`, there is no basis for remediation.

### 2. Critical Cluster Components Are Not Observable by Default

CoreDNS, CNI plugins, Ingress controllers, and KEDA each expose metrics from different endpoints with different access requirements and no standard discovery mechanism.

This leads to:

- **DNS latency spikes look like application problems**: CoreDNS slowdowns appear as upstream timeouts, indistinguishable from a slow downstream service without a DNS-layer metric.
- **CNI packet drops are unattributed**: Packets dropped at the network policy layer surface as intermittent pod connectivity failures with no network-layer attribution.
- **KEDA failures leave workloads silently under-provisioned**: A scaler that cannot reach its source metric stops autoscaling without producing any user-visible error.

### 3. Telemetry Collection Infrastructure Has No Self-Monitoring

KSM, node-exporter, and the OTel Collector are the foundation of all cluster observability. When they fail, the resulting gaps are silent — dashboards show "no data" and no alert fires on the absence of metrics.

This leads to:

- **A crashed KSM removes all workload-state visibility**: The `kube_pod_*` and `kube_deployment_*` families disappear silently; operators may not notice until mid-incident.
- **Tainted nodes have no node-exporter coverage**: GPU or spot nodes without DaemonSet tolerations have no CPU, memory, or filesystem metrics.
- **The Collector drops data silently under backpressure**: SLO calculations based on incomplete data produce false confidence.

### 4. Metadata Is Inconsistent Across Signals

Each scraper attaches different label schemas (`pod_name`, `pod`, `kubernetes_namespace`, `namespace`). OTel semantic convention attributes (`k8s.pod.name`, `k8s.namespace.name`) are not applied automatically.

This leads to:

- **Cross-signal joins require per-query remapping**: Correlating a KSM metric with an OTel trace requires knowing the label mismatch and applying a transform in every query.
- **Alert rules break silently on scraper changes**: An alert written against `pod_name` stops matching when a new scraper uses `pod`.
- **Organizational context is absent**: Team ownership, environment, and tier labels from pod annotations are rarely in telemetry, making alert routing and cost attribution manual.

### 5. There Is No Decision Framework for Prometheus Format Versus OTLP

The Kubernetes ecosystem exposes metrics in Prometheus format; OTel SDKs emit OTLP. Without an explicit policy, teams collect both for the same signals, creating duplicates.

This leads to:

- **Duplicate signals and doubled storage costs**: Two time series for the same signal, each with different label schemas and timestamp granularity.
- **Naming conflicts that break alert rules**: `http_requests_total` and `http.server.request.count` represent the same signal; an alert on one does not fire when the pipeline switches to the other.

## General Guidelines

### 1. Deploy Dedicated Scrapers for Workload and Infrastructure Signals
<small>Challenges Addressed: 1, 2</small>

Platform teams must deploy kube-state-metrics and node-exporter as cluster-managed workloads and configure the OTel Collector to scrape the kubelet and cAdvisor APIs. For each critical component (CoreDNS, CNI, Ingress, KEDA), the platform team must explicitly declare a scrape job — there is no auto-discovery.

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

KSM, node-exporter, and the OTel Collector must each be scraped for their own internal health metrics and alerted on using the same pipeline as primary data. Self-monitoring must cover: KSM API list/watch errors, node-exporter DaemonSet coverage versus total node count, Collector queue depth and drop rates, and `up == 0` for every configured scrape target.

Outcomes:
- Silent data gaps are paged before affecting incident response or SLO calculations.
- An observability coverage SLO is enforceable (e.g., "100% of nodes have active node-exporter scrapes").

### 5. Establish a Signal-Format Decision Framework: Prometheus Versus OTLP
<small>Challenges Addressed: 5</small>

An unambiguous rule governs which format to use at each collection point:

- **Prometheus + `prometheusreceiver`**: for Kubernetes infrastructure components (KSM, node-exporter, CoreDNS, CNI, Ingress, KEDA) that expose Prometheus natively and have no OTLP support.
- **OTLP**: for applications instrumented with an OTel SDK, or any component with native OTLP support.
- **Never collect the same signal in both formats.** When onboarding a new component, check for OTLP support first; fall back to Prometheus only if unavailable. Apply naming normalization via `metricstransformprocessor` for Prometheus-scraped metrics that have a canonical OTel equivalent.

Outcomes:
- Storage costs are predictable; no signal is double-counted.
- Alert rules reference a single authoritative metric name per signal.

### 6. Provide Reference Deployment Architectures for Each Telemetry Component
<small>Challenges Addressed: 1, 2, 3</small>

Each telemetry component in this blueprint has a canonical deployment reference: Helm chart, RBAC requirements, resource requests, and links to known-good dashboards and alerts. New clusters reach full observability coverage with a repeatable playbook rather than tribal knowledge.

## Implementation

### 0. Deploy the OpenTelemetry Operator and Bootstrap the Collector
<small>Guidelines Supported: 2, 6</small>

Deploy the OTel Operator using the `opentelemetry-operator` Helm chart. cert-manager is required for webhook TLS; install it first if not already present.

```bash
helm repo add open-telemetry https://open-telemetry.github.io/opentelemetry-helm-charts
helm install opentelemetry-operator open-telemetry/opentelemetry-operator \
  --namespace opentelemetry-operator-system \
  --create-namespace \
  --set admissionWebhooks.certManager.enabled=true
```

Once running, declare an `OpenTelemetryCollector` CR in Deployment mode with `targetAllocator.enabled: true`. The TargetAllocator needs a ClusterRole to list/watch `Services`, `Endpoints`, `Pods`, `Nodes`, and `Namespaces`. The Collector service account needs separate ClusterRole rules for kubelet access (Action 3) and `k8sattributesprocessor` (Action 4).

Documentation:
- [OpenTelemetry Operator Helm chart](https://opentelemetry.io/docs/platforms/kubernetes/helm/operator/)
- [OpenTelemetryCollector CRD](https://opentelemetry.io/docs/platforms/kubernetes/operator/collector/)
- [TargetAllocator](https://opentelemetry.io/docs/platforms/kubernetes/operator/target-allocator/)

### 1. Deploy kube-state-metrics
<small>Guidelines Supported: 1, 6</small>

KSM provides object state (pod phase, restart counts, replica state, node conditions, PVC binding) by watching the Kubernetes API. It does not provide resource consumption — that comes from the kubelet (Action 3).

```bash
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm install kube-state-metrics prometheus-community/kube-state-metrics \
  --namespace monitoring --create-namespace
```

Register KSM (port 8080) as a TargetAllocator scrape target. Enable at minimum: `kube_pod_*`, `kube_deployment_*`, `kube_daemonset_*`, `kube_statefulset_*`, `kube_node_*`, `kube_persistentvolumeclaim_*`, `kube_job_*`. Start with `memory: 256Mi/1Gi` and tune after 24 hours.

Documentation: [kube-state-metrics Helm chart](https://github.com/prometheus-community/helm-charts/tree/main/charts/kube-state-metrics), [exposed metrics](https://github.com/kubernetes/kube-state-metrics/tree/main/docs)

### 2. Deploy node-exporter
<small>Guidelines Supported: 1, 6</small>

node-exporter exposes hardware and OS-level metrics from `/proc` and `/sys`. It must run on every node, including control plane and tainted nodes.

```bash
helm install prometheus-node-exporter prometheus-community/prometheus-node-exporter \
  --namespace monitoring \
  --set tolerations[0].operator=Exists
```

After installation, verify DaemonSet desired count equals total node count — any mismatch is a coverage gap. Enable: `filesystem`, `meminfo`, `diskstats`, `netstat`, `cpu`, `loadavg`. Disable `hwmon` and `ipvs` unless the cluster uses IPVS kube-proxy. Register as a TargetAllocator scrape target on port 9100.

Documentation: [prometheus-node-exporter Helm chart](https://github.com/prometheus-community/helm-charts/tree/main/charts/prometheus-node-exporter)

### 3. Configure the Collector to Scrape Kubelet and cAdvisor
<small>Guidelines Supported: 1</small>

KSM provides state; the kubelet APIs provide consumption. Use the `kubeletstatsreceiver` in a DaemonSet-mode `OpenTelemetryCollector` CR (separate from the Deployment-mode CR used for cluster-scoped scraping):

```yaml
receivers:
  kubeletstats:
    collection_interval: 20s
    auth_type: serviceAccount
    endpoint: "https://${env:K8S_NODE_NAME}:10250"
    insecure_skip_verify: true
    metric_groups: [node, pod, container]
```

Required ClusterRole rules:
```yaml
- apiGroups: [""]
  resources: ["nodes/metrics", "nodes/stats", "nodes/proxy"]
  verbs: ["get"]
```

Documentation: [kubeletstats receiver](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/receiver/kubeletstatsreceiver)

### 4. Configure the `k8sattributesprocessor` for Metadata Enrichment
<small>Guidelines Supported: 3</small>

Add to all pipelines in every `OpenTelemetryCollector` CR:

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

Documentation: [k8sattributesprocessor](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/k8sattributesprocessor), [K8s semantic conventions](https://opentelemetry.io/docs/specs/semconv/resource/k8s/)

### 5. Normalize Prometheus Metric Names to OTel Convention
<small>Guidelines Supported: 5</small>

The `prometheusreceiver` already normalizes `_total` counters. For metrics with a canonical OTel semantic convention equivalent, apply explicit renames via `metricstransformprocessor`:

```yaml
processors:
  metricstransform:
    transforms:
      - include: node_cpu_seconds_total
        action: update
        new_name: system.cpu.time
      - include: node_memory_MemAvailable_bytes
        action: update
        new_name: system.memory.usage
```

For metrics without a published OTel equivalent (most KSM metrics), retain the Prometheus name. Do not invent OTel-style names — it creates maintenance burden when conventions are eventually published.

Document the authoritative pipeline per signal family. This is the enforcing mechanism against future duplicate collection.

Documentation: [metricstransformprocessor](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/metricstransformprocessor), [OTel metric conventions](https://opentelemetry.io/docs/specs/semconv/system/)

### 6. Configure CoreDNS Scraping
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

### 7. Configure CNI Plugin Scraping
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

**Flannel**: No Prometheus metrics by default — rely on `node_network_*` from node-exporter.

Documentation: [Cilium metrics](https://docs.cilium.io/en/stable/observability/metrics/), [Calico Felix](https://docs.tigera.io/calico/latest/reference/felix/configuration)

### 8. Configure Ingress Controller Scraping
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

### 9. Configure KEDA Scraping (Conditional)
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

### 10. Configure Meta-Monitoring for KSM and node-exporter
<small>Guidelines Supported: 4, 6</small>

**KSM alerts:**
```yaml
- alert: KubeStateMetricsListErrors
  expr: rate(kube_state_metrics_list_errors_total[5m]) > 0
  for: 5m
- alert: KubeStateMetricsDown
  expr: up{job="kube-state-metrics"} == 0
  for: 1m
```

**node-exporter coverage (absence detection):**
```yaml
- alert: NodeExporterCoverageGap
  expr: count(up{job="node-exporter"} == 1) < count(kube_node_info)
  for: 5m
  annotations:
    summary: "node-exporter not running on all nodes"
```

### 11. Enable and Monitor OTel Collector Internal Telemetry
<small>Guidelines Supported: 4</small>

Enable in the `OpenTelemetryCollector` CR:
```yaml
service:
  telemetry:
    metrics:
      level: detailed
      address: 0.0.0.0:8888
    logs:
      level: warn
```

Scrape port 8888 and alert on:
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

| Component | Resource | Verbs | Notes |
|---|---|---|---|
| kube-state-metrics | `*` (core + apps) | `list`, `watch` | Created by Helm chart |
| node-exporter | — | — | Reads from host `/proc` and `/sys`; no API access |
| Collector (kubelet) | `nodes/metrics`, `nodes/stats`, `nodes/proxy` | `get` | Required for `kubeletstatsreceiver` |
| Collector (k8sattributes) | `pods`, `namespaces`, `nodes`, `endpoints` | `get`, `list`, `watch` | |
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
| `kube_pod_*`, `kube_deployment_*`, `coredns_*` | No OTel equivalent yet | Retain Prometheus names |

### C. k8sattributesprocessor Configuration Examples

**Metrics (KSM / cAdvisor):**
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

| Component | Dashboard | Key Alerts |
|---|---|---|
| kube-state-metrics | [Grafana community 13332](https://grafana.com/grafana/dashboards/13332) | Pod restarts, replica drift, node conditions |
| node-exporter | [Grafana community 1860](https://grafana.com/grafana/dashboards/1860) | CPU saturation, memory pressure, disk full |
| CoreDNS | [Grafana community 14981](https://grafana.com/grafana/dashboards/14981) | SERVFAIL rate, p99 latency, pod availability |
| NGINX Ingress | [Grafana community 9614](https://grafana.com/grafana/dashboards/9614) | 5xx rate, upstream latency, TLS expiry |
| Traefik | [Grafana community 17346](https://grafana.com/grafana/dashboards/17346) | Request error rate, TLS expiry |
| Cilium | [Grafana community 16611](https://grafana.com/grafana/dashboards/16611) | Drop rate, policy enforcement |
| KEDA | [Grafana community 16612](https://grafana.com/grafana/dashboards/16612) | Scaler error rate, pause state |
| OTel Collector | [Grafana community 15983](https://grafana.com/grafana/dashboards/15983) | Queue fill, exporter failures, drop rate |

### E. Troubleshooting — Common Data Gaps

**KSM metrics missing**
1. `kubectl get pod -n monitoring -l app.kubernetes.io/name=kube-state-metrics`
2. `kubectl logs` for API errors; verify `ClusterRoleBinding` exists
3. Check TargetAllocator has assigned the KSM target to a replica

**node-exporter missing on specific nodes**
1. `kubectl get ds -n monitoring prometheus-node-exporter` — desired vs. ready count
2. `kubectl describe node <node> | grep Taint` — check for unhandled taints
3. `helm upgrade ... --set tolerations[0].operator=Exists`

**Metadata attributes missing in backend**
1. Verify `k8sattributesprocessor` ClusterRole is bound to the Collector service account
2. Check Collector logs for Kubernetes API errors
3. Verify the Collector pod can reach pod IPs (needed for connection-based association)

**Duplicate metrics in backend**
1. Find the metric in both `prometheusreceiver` and `otlpreceiver` configs
2. Apply the signal-format rule (Action 5) to identify the authoritative pipeline
3. Update dashboards and alerts to the authoritative name, then remove the duplicate config

**Collector silently dropping data**
1. Check `otelcol_exporter_send_failed_metric_points` and `otelcol_processor_dropped_metric_points`
2. Check queue utilization: `otelcol_exporter_queue_size / otelcol_exporter_queue_capacity`
3. If consistently > 80%: reduce scrape frequency, increase queue capacity, or scale Collector replicas (TargetAllocator rebalances automatically)
