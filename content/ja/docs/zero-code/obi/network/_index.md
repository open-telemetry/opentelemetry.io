---
title: ネットワークメトリクス
linkTitle: ネットワーク
description: OBI をポイントツーポイントのネットワークメトリクスの観察用に設定する
weight: 8
cSpell:ignore: replicaset statefulset
default_lang_commit: dc2fb5771163265cb804a39b1dacc536b95bdb96
---

OpenTelemetry eBPF 計装は、異なるエンドポイント間のネットワークメトリクスを提供するように設定できます。
たとえば、物理ノード、コンテナー、Kubernetes Pod、サービスなどの間です。

## はじめに {#get-started}

OBI ネットワークメトリクスの使用を開始するには、[クイックスタートセットアップドキュメント](quickstart/)を参照し、高度な設定については、[設定ドキュメント](config/)を参照してください。

## ネットワークメトリクス {#network-metrics}

OBI は 2 種類のネットワークメトリクスファミリーを提供します。

**フローメトリクス**: アプリケーションの観点から、異なるエンドポイント間で送受信されたバイト数をキャプチャします。

- `obi.network.flow.bytes`（OpenTelemetry 経由でエクスポートする場合）
- `obi_network_flow_bytes_total`（Prometheus エンドポイントでエクスポートする場合）
- 有効にするには、[OTEL_EBPF_METRICS_FEATURES](../configure/export-data/) 設定オプションに `network` オプションを追加します。

**ゾーン間メトリクス**: アプリケーションの観点から、異なるアベイラビリティゾーン間で送受信されたバイト数をキャプチャします。

- `obi.network.inter.zone.bytes`（OpenTelemetry 経由でエクスポートする場合）
- `obi_network_inter_zone_bytes_total`（Prometheus エンドポイントでエクスポートする場合）
- 有効にするには、[OTEL_EBPF_METRICS_FEATURES](../configure/export-data/) 設定オプションに `network` オプションを追加します。

> [!NOTE]
>
> メトリクスはホストの視点からキャプチャされるため、ネットワークスタックのオーバーヘッド（プロトコルヘッダーなど）が含まれます。

## メトリクス属性 {#metric-attributes}

ネットワークメトリクスには、以下の属性でラベルが付けられます。

| 属性                                        | 説明                                                                                                                                                                                          |
| ------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `obi.ip` / `obi_ip`                         | メトリクスを出力した OBI インスタンスのローカル IP アドレス                                                                                                                                   |
| `direction`                                 | 受信トラフィックは `ingress`、送信トラフィックは `egress`                                                                                                                                     |
| `iface`                                     | ネットワークインターフェイス名                                                                                                                                                                |
| `src.address`                               | 送信元 IP アドレス（エグレスはローカル、イングレスはリモート）                                                                                                                                |
| `src.port`                                  | 送信元ポート（エグレスはローカル、イングレスはリモート）                                                                                                                                      |
| `src.name`                                  | 送信元サービス名（サービスディスカバリーで解決）                                                                                                                                              |
| `service.name`                              | 計装済みエンドポイントに関連付けられたローカルサービス名                                                                                                                                      |
| `service.namespace`                         | 計装済みエンドポイントに関連付けられたローカルサービス名前空間                                                                                                                                |
| `src.cidr`                                  | 送信元 CIDR（設定済みの場合）                                                                                                                                                                 |
| `dst.address`                               | 宛先 IP アドレス（エグレスはリモート、イングレスはローカル）                                                                                                                                  |
| `dst.port`                                  | 宛先ポート（エグレスはリモート、イングレスはローカル）                                                                                                                                        |
| `dst.name`                                  | 宛先サービス名（サービスディスカバリーで解決）                                                                                                                                                |
| `service.peer.name`                         | 宛先エンドポイントに関連付けられたリモートピアサービス名                                                                                                                                      |
| `service.peer.namespace`                    | 宛先エンドポイントに関連付けられたリモートピアサービス名前空間                                                                                                                                |
| `dst.cidr`                                  | 宛先 CIDR（設定済みの場合）                                                                                                                                                                   |
| `transport`                                 | トランスポートプロトコル: `tcp`、`udp`                                                                                                                                                        |
| `k8s.src.namespace` / `k8s_src_namespace`   | 送信元名前空間名                                                                                                                                                                              |
| `k8s.src.name` / `k8s_src_name`             | 送信元 Pod 名                                                                                                                                                                                 |
| `k8s.src.type` / `k8s_src_type`             | 送信元ワークロードタイプ: `pod`、`replicaset`、`deployment`、`statefulset`、`daemonset`、`job`、`cronjob`、`node`                                                                             |
| `k8s.src.owner.name` / `k8s_src_owner_name` | 送信元ワークロードオーナー名                                                                                                                                                                  |
| `k8s.src.owner.type` / `k8s_src_owner_type` | 送信元ワークロードオーナータイプ: `replicaset`、`deployment`、`statefulset`、`daemonset`、`job`、`cronjob`、`node`                                                                            |
| `k8s.src.node.ip` / `k8s_src_node_ip`       | 送信元ノード IP アドレス                                                                                                                                                                      |
| `k8s.src.node.name` / `k8s_src_node_name`   | 送信元ノード名                                                                                                                                                                                |
| `k8s.dst.namespace` / `k8s_dst_namespace`   | 宛先名前空間名                                                                                                                                                                                |
| `k8s.dst.name` / `k8s_dst_name`             | 宛先 Pod 名                                                                                                                                                                                   |
| `k8s.dst.type` / `k8s_dst_type`             | 宛先ワークロードタイプ: `pod`、`replicaset`、`deployment`、`statefulset`、`daemonset`、`job`、`cronjob`、`node`                                                                               |
| `k8s.dst.owner.name` / `k8s_dst_owner_name` | 宛先ワークロードオーナー名                                                                                                                                                                    |
| `k8s.dst.owner.type` / `k8s_dst_owner_type` | 宛先ワークロードオーナータイプ: `replicaset`、`deployment`、`statefulset`、`daemonset`、`job`、`cronjob`、`node`                                                                              |
| `k8s.dst.node.ip` / `k8s_dst_node_ip`       | 宛先ノード IP アドレス                                                                                                                                                                        |
| `k8s.dst.node.name` / `k8s_dst_node_name`   | 宛先ノード名                                                                                                                                                                                  |
| `k8s.cluster.name` / `k8s_cluster_name`     | Kubernetes クラスター名。OBI は Google Cloud、Microsoft Azure、Amazon Web Services 上で自動検出できます。その他のプロバイダーの場合は、`OTEL_EBPF_KUBE_CLUSTER_NAME` プロパティを設定します。 |

## メトリクスの削減 {#metric-reduction}

高カーディナリティ削減のために、プロセスレベルで事前集約し、ネットワークメトリクスはメトリクスバックエンドに送信されるメトリクスの数を減らします。

デフォルトでは、すべてのメトリクスは以下の属性で集約されます。

- `direction`
- `transport`
- `src.address`
- `dst.address`
- `src.port`
- `dst.port`

OBI の設定で許可する属性を指定することで、その属性によってメトリクスを集約できます。

たとえば、ネットワークメトリクスをデフォルトの個別の Pod 名のかわりに、送信元と宛先の Kubernetes オーナーによって集約するには、以下の設定を使用します。

```yaml
network:
  allowed_attributes:
    - k8s.src.owner.name
    - k8s.dst.owner.name
    - k8s.src.owner.type
    - k8s.dst.owner.type
```

次に、同等の Prometheus メトリクスは以下のようになります。

```text
obi_network_flow_bytes:
  k8s_src_owner_name="frontend"
  k8s_src_owner_type="deployment"
  k8s_dst_owner_name="backend"
  k8s_dst_owner_type="deployment"
```

前述の例では、個別の Pod 名のかわりに、送信元と宛先の Kubernetes オーナー名とタイプによって `obi.network.flow.bytes` の値を集約します。

## CIDR ベースのメトリクス {#cidr-based-metrics}

OBI を設定して、CIDR 範囲によってメトリクスをさらに分類することもできます。
これは、クラウドプロバイダーの IP 範囲や内部/外部トラフィックなど、特定のネットワーク範囲へのトラフィックを追跡するのに役立ちます。

`network` 内の `cidrs` YAML サブセクション（または `OTEL_EBPF_NETWORK_CIDRS` 環境変数）は、CIDR 範囲と対応する名前のリストを受け入れます。
たとえば、次のようになります。

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

次に、同等の Prometheus メトリクスは以下のようになります。

```text
obi_network_flow_bytes:
  src_cidr="cluster-internal"
  dst_cidr="private"
```
