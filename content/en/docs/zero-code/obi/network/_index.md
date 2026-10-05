---
title: Network metrics
linkTitle: Network
description: Configuring OBI to observe point-to-point network metrics.
weight: 8
cSpell:ignore: OpenShift replicaset statefulset
---

OpenTelemetry eBPF Instrumentation can be configured to provide network metrics
between different endpoints. For example, between physical nodes, containers,
Kubernetes pods, services, etc.

## Get started

To get started using OBI networking metrics, consult the
[quickstart setup documentation](quickstart/), and for advanced configuration,
consult the [configuration documentation](config/).

## Network metrics

OBI provides byte and packet flow metrics, plus an inter-zone byte metric:

**Flow metrics**: capture the bytes sent and received between different
endpoints, from the application point of view.

- `obi.network.flow.bytes`, if it is exported via OpenTelemetry.
- `obi_network_flow_bytes_total`, if it is exported by a Prometheus endpoint.
- To enable it, add the `network` option to the
  [OTEL_EBPF_METRICS_FEATURES](../configure/export-data/) configuration option.

**Flow packet metrics**: count the packets sent and received between endpoints.

- `obi.network.flow.packets`, if exported via OpenTelemetry.
- `obi_network_flow_packets_total`, if exported by a Prometheus endpoint.
- To enable it, add the `network_flow_packets` option to
  [OTEL_EBPF_METRICS_FEATURES](../configure/export-data/).

**Inter-zone metrics**: capture the bytes sent and received between different
availability zones, from the application point of view.

- `obi.network.inter.zone.bytes`, if it is exported via OpenTelemetry.
- `obi_network_inter_zone_bytes_total`, if it is exported by a Prometheus
  endpoint.
- To enable it, add the `network_inter_zone` option to the
  [OTEL_EBPF_METRICS_FEATURES](../configure/export-data/) configuration option.

> [!NOTE]
>
> The metrics are captured from the host perspective, so they include the
> overhead of the network stack (protocol headers, etc.).

By default, network flow bytes include `direction`. When Kubernetes metadata is
enabled, they also include `k8s.src.owner.name`, `k8s.src.owner.type`,
`k8s.src.namespace`, `k8s.dst.owner.name`, `k8s.dst.owner.type`,
`k8s.dst.namespace`, and `k8s.cluster.name`.

For the inter-zone bytes metric, the default attributes are `k8s.cluster.name`,
`src.zone`, and `dst.zone`.

## Metric attributes

Network metrics are labeled with the following attributes:

| Attribute                                         | Description                                                                                                                                                                                                  |
| ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `direction`                                       | Flow direction relative to the connection: `request`, `response`, or `unknown`                                                                                                                               |
| `iface.direction`                                 | `ingress` or `egress` relative to the observed network interface                                                                                                                                             |
| `dst.address`                                     | Destination IP address (remote for egress, local for ingress)                                                                                                                                                |
| `dst.cidr`                                        | Destination CIDR (if configured)                                                                                                                                                                             |
| `dst.name`                                        | Destination service name (resolved from service discovery)                                                                                                                                                   |
| `dst.port`                                        | Destination port (remote for egress, local for ingress)                                                                                                                                                      |
| `dst.zone` / `dst_zone`                           | Name of the destination cloud availability zone                                                                                                                                                              |
| `iface`                                           | Network interface name                                                                                                                                                                                       |
| `k8s.cluster.name` / `k8s_cluster_name`           | Name of the Kubernetes cluster. OBI checks node labels, OpenShift infrastructure metadata, Google Cloud, Microsoft Azure, and Amazon Web Services. To override detection, set `OTEL_EBPF_KUBE_CLUSTER_NAME`. |
| `k8s.dst.name` / `k8s_dst_name`                   | Destination pod name                                                                                                                                                                                         |
| `k8s.dst.namespace` / `k8s_dst_namespace`         | Destination namespace name                                                                                                                                                                                   |
| `k8s.dst.node.ip` / `k8s_dst_node_ip`             | Destination node IP address                                                                                                                                                                                  |
| `k8s.dst.node.name` / `k8s_dst_node_name`         | Destination node name                                                                                                                                                                                        |
| `k8s.dst.owner.name` / `k8s_dst_owner_name`       | Destination workload owner name                                                                                                                                                                              |
| `k8s.dst.owner.type` / `k8s_dst_owner_type`       | Destination workload owner type: `replicaset`, `deployment`, `statefulset`, `daemonset`, `job`, `cronjob`, `node`                                                                                            |
| `k8s.dst.type` / `k8s_dst_type`                   | Destination workload type: `pod`, `replicaset`, `deployment`, `statefulset`, `daemonset`, `job`, `cronjob`, `node`                                                                                           |
| `k8s.src.name` / `k8s_src_name`                   | Source pod name                                                                                                                                                                                              |
| `k8s.src.namespace` / `k8s_src_namespace`         | Source namespace name                                                                                                                                                                                        |
| `k8s.src.node.ip` / `k8s_src_node_ip`             | Source node IP address                                                                                                                                                                                       |
| `k8s.src.node.name` / `k8s_src_node_name`         | Source node name                                                                                                                                                                                             |
| `k8s.src.owner.name` / `k8s_src_owner_name`       | Source workload owner name                                                                                                                                                                                   |
| `k8s.src.owner.type` / `k8s_src_owner_type`       | Source workload owner type: `replicaset`, `deployment`, `statefulset`, `daemonset`, `job`, `cronjob`, `node`                                                                                                 |
| `k8s.src.type` / `k8s_src_type`                   | Source workload type: `pod`, `replicaset`, `deployment`, `statefulset`, `daemonset`, `job`, `cronjob`, `node`                                                                                                |
| `network.protocol.name` / `network_protocol_name` | Network protocol name (for example, `http` or `https`)                                                                                                                                                       |
| `network.type` / `network_type`                   | Network type (for example, `ipv4` or `ipv6`)                                                                                                                                                                 |
| `obi.ip` / `obi_ip`                               | Local IP address of the OBI instance that emitted the metric                                                                                                                                                 |
| `service.name`                                    | Local service name associated with the instrumented endpoint                                                                                                                                                 |
| `service.namespace`                               | Local service namespace associated with the instrumented endpoint                                                                                                                                            |
| `service.peer.name`                               | Remote peer service name associated with the destination endpoint                                                                                                                                            |
| `service.peer.namespace`                          | Remote peer service namespace associated with the destination endpoint                                                                                                                                       |
| `src.address`                                     | Source IP address (local for egress, remote for ingress)                                                                                                                                                     |
| `src.cidr`                                        | Source CIDR (if configured)                                                                                                                                                                                  |
| `src.name`                                        | Source service name (resolved from service discovery)                                                                                                                                                        |
| `src.port`                                        | Source port (local for egress, remote for ingress)                                                                                                                                                           |
| `src.zone` / `src_zone`                           | Name of the source cloud availability zone                                                                                                                                                                   |
| `transport`                                       | Transport protocol: `tcp`, `udp`                                                                                                                                                                             |

## Metric reduction

For high-cardinality reductions, the network metrics are pre-aggregated at the
process level to reduce the number of metrics sent to the metrics backend.

The metric's selected attributes determine the aggregation keys. OBI leaves many
high-cardinality attributes, including endpoint addresses and ports, out by
default. See the [exported metrics](../metrics/) page for the default selection.
Configure additional keys under `attributes.select`.

For example, to aggregate network metrics only by source and destination
Kubernetes owner name and type, you can use the following configuration. It
replaces the default attribute selection, including `direction`:

```yaml
attributes:
  select:
    obi_network_flow_bytes:
      include:
        - k8s.src.owner.name
        - k8s.dst.owner.name
        - k8s.src.owner.type
        - k8s.dst.owner.type
```

Then, the equivalent Prometheus metric would be:

```text
obi_network_flow_bytes_total:
  k8s_src_owner_name="frontend"
  k8s_src_owner_type="deployment"
  k8s_dst_owner_name="backend"
  k8s_dst_owner_type="deployment"
```

This example aggregates `obi.network.flow.bytes` by source and destination
Kubernetes owner name and type. It omits the default direction, namespace, and
cluster labels.

## CIDR-based metrics

You can configure OBI to also break down metrics by CIDR ranges. This is useful
for tracking traffic to specific network ranges, such as cloud provider IP
ranges, or internal/external traffic.

The `cidrs` YAML subsection in `network` (or the `OTEL_EBPF_NETWORK_CIDRS`
environment variable) accepts a list of CIDR ranges, and the corresponding name.
For example:

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
obi_network_flow_bytes_total:
  src_cidr="cluster-internal"
  dst_cidr="private"
```
