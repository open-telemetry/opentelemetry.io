---
title: Measure traffic between Cloud availability zones
linkTitle: Measure traffic between Cloud availability zones
description:
  How to measure the network traffic between different Cloud availability zones
weight: 1
---

{{% alert title="Note" %}}

This feature is currently only available in Kubernetes clusters.

{{% /alert %}}

Traffic between Cloud Availability Zones might incur additional costs. OBI is
able to measure it either by adding `src.zone` and `dst.zone` attributes to
regular network metrics, or by providing a separate
`obi.network.inter.zone.bytes` (OTel) / `obi_network_inter_zone_bytes_total`
(Prometheus) metric.

## Add `src.zone` and `dst.zone` attributes to regular network metrics

Source and destination availability zone attributes are disabled by default in
OBI. To enable it, explicitly add them to the list of included network
attributes in the OBI YAML configuration:

```yaml
attributes:
  select:
    obi_network_flow_bytes:
      include:
        - k8s.src.owner.name
        - k8s.src.namespace
        - k8s.dst.owner.name
        - k8s.dst.namespace
        - k8s.cluster.name
        - src.zone
        - dst.zone
```

This configuration makes inter-zone traffic visible for each
`obi_network_flow_bytes_total` metric with different `src_zone` and `dst_zone`
attributes.

If you require higher granularity in your inter-zone traffic measurement (for
example, source/destination pods or nodes), adding zone attributes would impact
the cardinality of the metric, even for traffic within the same availability
zone.

## Use the `obi.network.inter.zone` metric

Using a separate metric for inter-zone traffic reduces the metric cardinality
impact of collecting this data, because the `src.zone` and `dst.zone` attributes
are not added to the regular network metrics.

To enable the `obi.network.inter.zone` metric, add the `network_inter_zone`
option to the
[OTEL_EBPF_METRICS_FEATURES or OTEL_EBPF_PROMETHEUS_FEATURES](../../configure/export-data/)
configuration option, or its equivalent YAML options. For example, if OBI is
configured to export metrics via OpenTelemetry:

```yaml
otel_metrics_export:
  features:
    - network
    - network_inter_zone
```

## PromQL queries to measure inter-zone traffic

Assuming that both `network` and `network_inter_zone` metric families are
enabled, you can use the following PromQL queries to measure inter-zone traffic:

Overall inter-zone traffic throughput:

```promql
sum(rate(obi_network_inter_zone_bytes_total[$__rate_interval]))
```

Inter-zone traffic throughput, summarized by source and destination zones:

```promql
sum(rate(obi_network_inter_zone_bytes_total[$__rate_interval])) by(src_zone,dst_zone)
```

Overall same-zone traffic throughput:

```promql
sum(rate(obi_network_flow_bytes_total[$__rate_interval]))
  - sum(rate(obi_network_inter_zone_bytes_total[$__rate_interval]))
```

Percentage of inter-zone traffic from the total:

```promql
100 * sum(rate(obi_network_inter_zone_bytes_total[$__rate_interval]))
  / sum(rate(obi_network_flow_bytes_total[$__rate_interval]))
```
