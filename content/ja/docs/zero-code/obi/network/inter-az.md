---
title: クラウドアベイラビリティゾーン間のトラフィックを測定する
linkTitle: クラウドアベイラビリティゾーン間のトラフィックを測定する
description: 異なるクラウドアベイラビリティゾーン間のネットワークトラフィックを測定する方法
weight: 1
default_lang_commit: fc509b751d6882b99824ea78a1dd8e638dd9055a
---

> [!NOTE]
>
> この機能は現在 Kubernetes クラスターでのみ利用可能です。

クラウドアベイラビリティゾーン間のトラフィックには追加コストがかかる場合があります。
OBI は、通常のネットワークメトリクスに `src.zone` および `dst.zone` 属性を追加するか、または別のメトリクス `obi.network.inter.zone.bytes`（OTel）/ `obi_network_inter_zone_bytes_total`（Prometheus）を提供することで、これを測定できます。

## 通常のネットワークメトリクスに `src.zone` と `dst.zone` 属性を追加する {#add-srczone-and-dstzone-attributes-to-regular-network-metrics}

送信元と送信先のアベイラビリティゾーン属性は、OBI ではデフォルトで無効化されています。
有効化するには、OBI の YAML 設定で含めるネットワーク属性のリストに明示的に追加します。

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

この設定により、異なる `src_zone` および `dst_zone` 属性を持つ `obi_network_flow_bytes_total` メトリクスごとにゾーン間トラフィックが可視化されます。

ゾーン間トラフィック測定でより高い粒度（たとえば、送信元/送信先の Pod やノード）が必要な場合、ゾーン属性の追加は、同じアベイラビリティゾーン内のトラフィックに対してもメトリクスのカーディナリティに影響します。

## `obi.network.inter.zone` メトリクスを使用する {#use-the-obinetworkinterzone-metric}

ゾーン間トラフィック用に別のメトリクスを使用すると、通常のネットワークメトリクスに `src.zone` および `dst.zone` 属性が追加されないため、データ収集によるメトリクスのカーディナリティへの影響を低減できます。

`obi.network.inter.zone` メトリクスを有効化するには、`network_inter_zone` オプションを [OTEL_EBPF_METRICS_FEATURES](../../configure/export-data/) 設定オプション、またはそれに対応する YAML オプションに追加します。
たとえば、OBI が OpenTelemetry 経由でメトリクスをエクスポートするように設定されている場合は次のとおりです。

```yaml
metrics:
  features:
    - network
    - network_inter_zone
```

## ゾーン間トラフィックを測定するための PromQL クエリ {#promql-queries-to-measure-inter-zone-traffic}

`network` と `network_inter_zone` の両方のメトリクスファミリーが有効化されていることを前提として、次の PromQL クエリを使用してゾーン間トラフィックを測定できます。

全体のゾーン間トラフィックスループット:

```promql
sum(rate(obi_network_inter_zone_bytes_total[$__rate_interval]))
```

送信元と送信先のゾーンごとに集計したゾーン間トラフィックスループット:

```promql
sum(rate(obi_network_inter_zone_bytes_total[$__rate_interval])) by(src_zone,dst_zone)
```

全体の同一ゾーン内トラフィックスループット:

```promql
sum(rate(obi_network_flow_bytes_total[$__rate_interval]))
  - sum(rate(obi_network_inter_zone_bytes_total[$__rate_interval]))
```

全トラフィックに占めるゾーン間トラフィックの割合:

```promql
100 * sum(rate(obi_network_inter_zone_bytes_total[$__rate_interval]))
  / sum(rate(obi_network_flow_bytes_total[$__rate_interval]))
```
