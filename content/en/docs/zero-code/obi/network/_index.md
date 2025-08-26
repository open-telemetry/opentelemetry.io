---
title: Network metrics
linkTitle: Network
description: Configuring OBI to observe point-to-point network metrics.
weight: 8
cSpell:ignore: replicaset statefulset
---

OpenTelemetry eBPF Instrumentation can be configured to provide network metrics
between different endpoints. For example, between physical nodes, containers,
Kubernetes pods, services, etc.

## Get started

To get started using OBI networking metrics, consult the
[quickstart setup documentation](quickstart/), and for advanced configuration,
consult the [configuration documentation](config/).

## Network metrics

OBI provides two families of network metrics:

**Flow metrics**: capture the bytes sent and received between different
endpoints, from the application point of view.

- `obi.network.flow.bytes`, if it is exported via OpenTelemetry.
- `obi_network_flow_bytes_total`, if it is exported by a Prometheus endpoint.
- To enable it, add the `network` option to the
  [OBI_OTEL_METRICS_FEATURES or OBI_PROMETHEUS_FEATURES](../configure/export-data/)
  configuration option.

**Inter-zone metrics**: capture the bytes sent and received between different
availability zones, from the application point of view.

- `obi.network.inter.zone.bytes`, if it is exported via OpenTelemetry.
- `obi_network_inter_zone_bytes_total`, if it is exported by a Prometheus
  endpoint.
- To enable it, add the `network` option to the
  [OBI_OTEL_METRICS_FEATURES or OBI_PROMETHEUS_FEATURES](../configure/export-data/)
  configuration option.

{{< alert type="note" >}} The metrics are captured from the host perspective, so
they include the overhead of the network stack (protocol headers, etc.).
{{< /alert >}}

## Metric attributes

Network metrics are labeled with the following attributes:

| Attribute                                   | Description                                                                                                                                                                     |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `obi.ip` / `obi_ip`                         | Local IP address of the OBI instance that emitted the metric                                                                                                                    |
| `direction`                                 | `ingress` for incoming traffic, `egress` for outgoing traffic                                                                                                                   |
| `iface`                                     | Network interface name                                                                                                                                                          |
| `src.address`                               | Source IP address (local for egress, remote for ingress)                                                                                                                        |
| `src.port`                                  | Source port (local for egress, remote for ingress)                                                                                                                              |
| `src.cidr`                                  | Source CIDR (if configured)                                                                                                                                                     |
| `dst.address`                               | Destination IP address (remote for egress, local for ingress)                                                                                                                   |
| `dst.port`                                  | Destination port (remote for egress, local for ingress)                                                                                                                         |
| `dst.cidr`                                  | Destination CIDR (if configured)                                                                                                                                                |
| `transport`                                 | Transport protocol: `tcp`, `udp`                                                                                                                                                |
| `k8s.src.namespace` / `k8s_src_namespace`   | Source namespace name                                                                                                                                                           |
| `k8s.src.name` / `k8s_src_name`             | Source pod name                                                                                                                                                                 |
| `k8s.src.type` / `k8s_src_type`             | Source workload type: `pod`, `replicaset`, `deployment`, `statefulset`, `daemonset`, `job`, `cronjob`, `node`                                                                   |
| `k8s.src.owner.name` / `k8s_src_owner_name` | Source workload owner name                                                                                                                                                      |
| `k8s.src.owner.type` / `k8s_src_owner_type` | Source workload owner type: `replicaset`, `deployment`, `statefulset`, `daemonset`, `job`, `cronjob`, `node`                                                                    |
| `k8s.src.node.ip` / `k8s_src_node_ip`       | Source node IP address                                                                                                                                                          |
| `k8s.src.node.name` / `k8s_src_node_name`   | Source node name                                                                                                                                                                |
| `k8s.dst.namespace` / `k8s_dst_namespace`   | Destination namespace name                                                                                                                                                      |
| `k8s.dst.name` / `k8s_dst_name`             | Destination pod name                                                                                                                                                            |
| `k8s.dst.type` / `k8s_dst_type`             | Destination workload type: `pod`, `replicaset`, `deployment`, `statefulset`, `daemonset`, `job`, `cronjob`, `node`                                                              |
| `k8s.dst.owner.name` / `k8s_dst_owner_name` | Destination workload owner name                                                                                                                                                 |
| `k8s.dst.owner.type` / `k8s_dst_owner_type` | Destination workload owner type: `replicaset`, `deployment`, `statefulset`, `daemonset`, `job`, `cronjob`, `node`                                                               |
| `k8s.dst.node.ip` / `k8s_dst_node_ip`       | Destination node IP address                                                                                                                                                     |
| `k8s.dst.node.name` / `k8s_dst_node_name`   | Destination node name                                                                                                                                                           |
| `k8s.cluster.name` / `k8s_cluster_name`     | Name of the Kubernetes cluster. OBI can auto-detect it on Google Cloud, Microsoft Azure, and Amazon Web Services. For other providers, set the `OBI_KUBE_CLUSTER_NAME` property |

## Metric reduction

For high-cardinality reductions, the network metrics are pre-aggregated at the
process level to reduce the number of metrics sent to the metrics backend.

By default, all metrics are aggregated by the following attributes:

- `direction`
- `transport`
- `src.address`
- `dst.address`
- `src.port`
- `dst.port`

You can specify which attributes are allowed in the OBI configuration, to
aggregate the metric by them.

For example, to aggregate network metrics by source and destination Kubernetes
owner (instead of the default individual pod names), you can use the following
configuration:

```yaml
network:
  allowed_attributes:
    - k8s.src.owner.name
    - k8s.dst.owner.name
    - k8s.src.owner.type
    - k8s.dst.owner.type
```

Then, the equivalent Prometheus metric would be:

```text
obi_network_flow_bytes:
  k8s_src_owner_name="frontend"
  k8s_src_owner_type="deployment"
  k8s_dst_owner_name="backend"
  k8s_dst_owner_type="deployment"
```

The previous example would aggregate the `obi.network.flow.bytes` value by
source and destination Kubernetes owner name and type, instead of individual pod
names.

## CIDR-based metrics

You can configure OBI to also break down metrics by CIDR ranges. This is useful
for tracking traffic to specific network ranges, such as cloud provider IP
ranges, or internal/external traffic.

The `cidrs` YAML subsection in `network` (or the `OBI_NETWORK_CIDRS` environment
variable) accepts a list of CIDR ranges, and the corresponding name. For
example:

```yaml
network:
  cidrs:
    - cidr: 10.0.0.0/8
      name: 'cluster-internal'
    - cidr: 192.168.0.0/16
      name: 'private'
    - cidr: 172.16.0.0/12
      name: 'container-internal'
```

Then, the equivalent Prometheus metric would be:

```text
obi_network_flow_bytes:
  src_cidr="cluster-internal"
  dst_cidr="private"
```
