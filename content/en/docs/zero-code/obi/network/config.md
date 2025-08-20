---
title: OBI Network Metrics configuration options
linkTitle: Configuration
description:
  Learn about the configuration options available for OBI network metrics
weight: 3
cSpell:ignore: BEETPH
---

Network metrics are configured under the `network` property of the
[OBI Configuration YAML file](../../configure/options/) or with a set of
environment variables prefixed as `OTEL_EBPF_NETWORK_`.

Example YAML:

```yaml
network:
  enable: true
  cidrs:
    - 10.10.0.0/24
    - 10.0.0.0/8
    - 10.30.0.0/16
attributes:
  kubernetes:
    enable: true
  select:
    obi_network_flow_bytes:
      include:
        - k8s.src.owner.name
        - k8s.src.namespace
        - k8s.dst.owner.name
        - k8s.dst.namespace
        - src.cidr
        - dst.cidr
otel_metrics_export:
  endpoint: http://localhost:4318
```

In addition to the `network` YAML section, OBI configuration requires an
endpoint to export the network metrics (in the previous example,
`otel_metrics_export`, but it also accepts a
[Prometheus endpoint](../../configure/options/)).

## Network metrics configuration properties

To enable network metrics add one of the following `features` to either the
[otel_metrics_export](../../configure/export-data/)) or
[prometheus_export](../../configure/export-data/#prometheus-exporter-component))
configuration properties:

- `network` enables the `obi_network_flow_bytes` metric: the number of bytes
  between two endpoints of your cluster
- `network_inter_zone` enables `obi_network_inter_zone_bytes` metric: the number
  of bytes between different availability zones in your Cloud cluster

{{< alert type="caution" >}} The `obi_network_inter_zone_bytes` specification is
currently in experimental and only available for Kubernetes cluster. The
specification is not final and future version of OBI may introduce breaking
changes. {{< /alert >}}

| YAML     | Environment variable       | Type   | Default         |
| -------- | -------------------------- | ------ | --------------- |
| `source` | `OTEL_EBPF_NETWORK_SOURCE` | string | `socket_filter` |

Specifies the Linux Kernel feature used to source the network events OBI
reports.

The available options are: `tc` and `socket_filter`.

When `tc` is used as an event source, OBI uses the Linux Traffic Control ingress
and egress filters to capture the network events, in a direct action mode. This
event source mode assumes that no other eBPF programs are attaching to the same
Linux Traffic Control interface, in direct action mode. For example, the Cilium
Kubernetes CNI uses the same approach, therefore if you have Cilium CNI
installed in your Kubernetes cluster, configure OBI to capture the network
events with the `socket_filter` mode.

When `socket_filter` is used as an event source, OBI installs an eBPF Linux
socket filter to capture the network events. This mode doesn't conflict with
Cilium CNI or other eBPF programs, which use the Linux Traffic Control egress
and ingress filters.

| YAML    | Environment variable      | Type     | Default |
| ------- | ------------------------- | -------- | ------- |
| `cidrs` | `OTEL_EBPF_NETWORK_CIDRS` | []string | (empty) |

CIDRs list, to be set as the `src.cidr` and `dst.cidr` attribute with the entry
that matches the `src.address` and `dst.address` respectively.

The attribute as a function of the source and destination IP addresses. If an IP
address does not match any address here, the attributes won't be set. If an IP
address matches multiple CIDR definitions, the flow is decorated with the
narrowest CIDR. As a result, you can safely add a `0.0.0.0/0` entry to group all
the traffic that does not match any of the other CIDRs.

If you set this property via environment variable each entry must be separated
by a comma, for example:

```sh
OTEL_EBPF_NETWORK_CIDRS=10.0.0.0/8,192.168.0.0/16
```

| YAML       | Environment variable         | Type   | Default   |
| ---------- | ---------------------------- | ------ | --------- |
| `agent_ip` | `OTEL_EBPF_NETWORK_AGENT_IP` | string | (not set) |

Allows overriding the reported `obi.ip` attribute on each metric. If not set,
OBI automatically detects its own IP address from the specified network
interface (see next property).

| YAML             | Environment variable               | Type   | Default    |
| ---------------- | ---------------------------------- | ------ | ---------- |
| `agent_ip_iface` | `OTEL_EBPF_NETWORK_AGENT_IP_IFACE` | string | `external` |

Specifies which interface OBI should use to pick its own IP address to set the
value of the `obi.ip` attribute. Accepted values are: `external` (default),
`local`, or `name:<interface name>` (e.g. `name:eth0`).

If the `agent_ip` configuration property is set, this property has no effect.

| YAML            | Environment variable | Type   | Default |
| --------------- | -------------------- | ------ | ------- |
| `agent_ip_type` | `OTEL_EBPF`          | string | `any`   |

Specifies which type of IP address (IPv4 or IPv6 or both) OBI should report in
the `obi.ip` field of each flow. Accepted values are: `any` (default), `ipv4`,
`ipv6`. If the `agent_ip` configuration property is set, this property has no
effect.

| YAML         | Environment variable           | Type     | Default |
| ------------ | ------------------------------ | -------- | ------- |
| `interfaces` | `OTEL_EBPF_NETWORK_INTERFACES` | []string | (empty) |

The interface names where flows are collected from. If empty, OBI fetches all
the interfaces in the system, excepting the ones listed in `excluded_interfaces`
(see below). If an entry is enclosed by slashes (e.g. `/br-/`), it is matched as
regular expression, otherwise it is matched as a case-sensitive string.

If you set this property via environment variable each entry must be separated
by a comma, for example:

```sh
OTEL_EBPF_NETWORK_INTERFACES=eth0,eth1,/^veth/
```

| YAML                 | Environment variable                   | Type     | Default |
| -------------------- | -------------------------------------- | -------- | ------- |
| `exclude_interfaces` | `OTEL_EBPF_NETWORK_EXCLUDE_INTERFACES` | []string | `lo`    |

The interface names to be excluded from network flow tracing. Default: `lo`
(loop-back). If an entry is enclosed by slashes (e.g. `/br-/`), it is matched as
a regular expression, otherwise it is matched as a case-sensitive string.

If you set this property via environment variable each entry must be separated
by a comma, for example:

```sh
OTEL_BPF_NETWORK_EXCLUDE_INTERFACES=lo,/^veth/
```

| YAML        | Environment variable          | Type     | Default |
| ----------- | ----------------------------- | -------- | ------- |
| `protocols` | `OTEL_EBPF_NETWORK_PROTOCOLS` | []string | (empty) |

If set, OBI drops any network flow whose reported Internet Protocol is not in
this list.

The accepted values are defined in the Linux enumeration of
[Standard well-defined IP protocols](https://elixir.bootlin.com/linux/v6.8.7/source/include/uapi/linux/in.h#L28),
and can be: `TCP`, `UDP`, `IP`, `ICMP`, `IGMP`, `IPIP`, `EGP`, `PUP`, `IDP`,
`TP`, `DCCP`, `IPV6`, `RSVP`, `GRE`, `ESP`, `AH`, `MTP`, `BEETPH`, `ENCAP`,
`PIM`, `COMP`, `L2TP`, `SCTP`, `UDPLITE`, `MPLS`, `ETHERNET`, `RAW`

| YAML                | Environment variable                  | Type     | Default |
| ------------------- | ------------------------------------- | -------- | ------- |
| `exclude_protocols` | `OTEL_EBPF_NETWORK_EXCLUDE_PROTOCOLS` | []string | (empty) |

If set, OBI drops any network flow whose reported Internet Protocol is in this
list.

If the `protocols`/`OTEL_EBPF_NETWORK_PROTOCOLS` list is already set, this
property is ignored.

The accepted values are defined in the Linux enumeration of
[Standard well-defined IP protocols](https://elixir.bootlin.com/linux/v6.8.7/source/include/uapi/linux/in.h#L28),
and can be: `TCP`, `UDP`, `IP`, `ICMP`, `IGMP`, `IPIP`, `EGP`, `PUP`, `IDP`,
`TP`, `DCCP`, `IPV6`, `RSVP`, `GRE`, `ESP`, `AH`, `MTP`, `BEETPH`, `ENCAP`,
`PIM`, `COMP`, `L2TP`, `SCTP`, `UDPLITE`, `MPLS`, `ETHERNET`, `RAW`

| YAML              | Environment variable                | Type    | Default |
| ----------------- | ----------------------------------- | ------- | ------- |
| `cache_max_flows` | `OTEL_EBPF_NETWORK_CACHE_MAX_FLOWS` | integer | `5000`  |

Specifies how many flows can be accumulated in the accounting cache before being
flushed for its later export. Default value is 5000. Decrease it if you see the
"received message larger than max" error in OBI logs.

| YAML                   | Environment variable                     | Type     | Default |
| ---------------------- | ---------------------------------------- | -------- | ------- |
| `cache_active_timeout` | `OTEL_EBPF_NETWORK_CACHE_ACTIVE_TIMEOUT` | duration | `5s`    |

Specifies the maximum duration that flows are kept in the accounting cache
before being flushed for its later export.

| YAML        | Environment variable          | Type   | Default |
| ----------- | ----------------------------- | ------ | ------- |
| `direction` | `OTEL_EBPF_NETWORK_DIRECTION` | string | `both`  |

Allows selecting which flows to trace according to its direction in the
interface where they are captured from. Accepted values are `ingress`, `egress`,
or `both` (default).

{{% alert type="note" %}} In this context, _ingress_ or _egress_ are not related
to incoming/outgoing traffic from outside the node or the cluster, but the
network interface. This means that the same network packet could be seen as
"ingress" in a virtual network device and as "egress" in the backing physical
network interface. {{% /alert %}}

| YAML       | Environment variable         | Type    | Default        |
| ---------- | ---------------------------- | ------- | -------------- |
| `sampling` | `OTEL_EBPF_NETWORK_SAMPLING` | integer | `0` (disabled) |

The rate at which packets should be sampled and sent to the target collector.
For example, if set to 100, one out of 100 packets, on average, are sent to the
target collector.

| YAML          | Environment variable            | Type    | Default |
| ------------- | ------------------------------- | ------- | ------- |
| `print_flows` | `OTEL_EBPF_NETWORK_PRINT_FLOWS` | boolean | `false` |

If set to `true`, OBI prints each network flow to standard output. Note, this
might generate a lot of output.
