---
title: OBI ネットワークメトリクスの設定オプション
linkTitle: 設定
description: OBI ネットワークメトリクスで利用可能な設定オプションについて学びます
weight: 3
default_lang_commit: fc509b751d6882b99824ea78a1dd8e638dd9055a
cSpell:ignore: BEETPH UDPLITE
---

ネットワークメトリクスは、[OBI 設定 YAML ファイル](../../configure/options/) の `network` プロパティ、または `OTEL_EBPF_NETWORK_` を接頭辞とする環境変数のセットで設定します。

YAML の例:

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

`network` YAML セクションに加えて、OBI の設定にはネットワークメトリクスをエクスポートするためのエンドポイントが必要です（前述の例では `otel_metrics_export` ですが、[Prometheus エンドポイント](../../configure/options/) も受け付けます）。

## ネットワークメトリクスの設定プロパティ {#network-metrics-configuration-properties}

ネットワークメトリクスを有効化するには、第一階層の [メトリクスセクション](../../configure/export-data/#metrics-export-features) の `features` に次のいずれかを追加します。

- `network` は `obi_network_flow_bytes` メトリクスを有効化します。これは、クラスター内の 2 つのエンドポイント間のバイト数です
- `network_inter_zone` は `obi_network_inter_zone_bytes` メトリクスを有効化します。これは、クラウドクラスター内の異なるアベイラビリティゾーン間のバイト数です

> [!CAUTION]
>
> `obi_network_inter_zone_bytes` 仕様は現在実験的であり、Kubernetes クラスターでのみ利用可能です。
> 仕様は最終的なものではなく、将来のバージョンの OBI で破壊的変更が導入される可能性があります。

| YAML     | 環境変数                   | 型     | デフォルト      |
| -------- | -------------------------- | ------ | --------------- |
| `source` | `OTEL_EBPF_NETWORK_SOURCE` | string | `socket_filter` |

OBI が報告するネットワークイベントのソースとして使用する Linux カーネル機能を指定します。

利用可能なオプションは `tc` と `socket_filter` です。

`tc` をイベントソースとして使用すると、OBI は Linux Traffic Control の ingress および egress フィルターを direct action モードで使用してネットワークイベントをキャプチャします。
このイベントソースモードは、direct action モードで同じ Linux Traffic Control インターフェイスにアタッチする他の eBPF プログラムが存在しないことを前提としています。
たとえば、Cilium Kubernetes CNI は同じアプローチを使用するため、Kubernetes クラスターに Cilium CNI がインストールされている場合は、`socket_filter` モードでネットワークイベントをキャプチャするように OBI を設定してください。

`socket_filter` をイベントソースとして使用すると、OBI はネットワークイベントをキャプチャするために eBPF Linux ソケットフィルターをインストールします。
このモードは、Linux Traffic Control の egress および ingress フィルターを使用する Cilium CNI やその他の eBPF プログラムと競合しません。

| YAML    | 環境変数                  | 型                  | デフォルト |
| ------- | ------------------------- | ------------------- | ---------- |
| `cidrs` | `OTEL_EBPF_NETWORK_CIDRS` | CIDR 文字列のリスト | （空）     |

`src.address` と `dst.address` にマッチするエントリで `src.cidr` および `dst.cidr` 属性として設定する CIDR のリスト。

属性は送信元と送信先の IP アドレスの関数です。
IP アドレスがここのどのアドレスにもマッチしない場合、属性は設定されません。
IP アドレスが複数の CIDR 定義にマッチする場合、フローは最も狭い CIDR で装飾されます。
結果として、他のどの CIDR にもマッチしないすべてのトラフィックをグループ化するために、安全に `0.0.0.0/0` エントリを追加できます。

YAML では、各エントリは単純な CIDR 文字列、または `cidr` と `name` フィールドを持つオブジェクトのいずれかにできます。
環境変数 `OTEL_EBPF_NETWORK_CIDRS` は CIDR 文字列のカンマ区切りリストのみを受け付けます。
たとえば次のとおりです。

```yaml
network:
  cidrs:
    - cidr: 10.0.0.0/8
      name: cluster-internal
    - 192.168.0.0/16
```

```sh
OTEL_EBPF_NETWORK_CIDRS=10.0.0.0/8,192.168.0.0/16
```

| YAML       | 環境変数                     | 型     | デフォルト |
| ---------- | ---------------------------- | ------ | ---------- |
| `agent_ip` | `OTEL_EBPF_NETWORK_AGENT_IP` | string | （未設定） |

各メトリクスで報告される `obi.ip` 属性を上書きできます。
設定されていない場合、OBI は指定されたネットワークインターフェイス（次のプロパティを参照）から自身の IP アドレスを自動的に検出します。

| YAML             | 環境変数                           | 型     | デフォルト |
| ---------------- | ---------------------------------- | ------ | ---------- |
| `agent_ip_iface` | `OTEL_EBPF_NETWORK_AGENT_IP_IFACE` | string | `external` |

`obi.ip` 属性の値を設定するために、OBI が自身の IP アドレスを選択するために使用するインターフェイスを指定します。
受け付ける値は `external`（デフォルト）、`local`、または `name:<interface name>`（例: `name:eth0`）です。

`agent_ip` 設定プロパティが設定されている場合、このプロパティは効果がありません。

| YAML            | 環境変数    | 型     | デフォルト |
| --------------- | ----------- | ------ | ---------- |
| `agent_ip_type` | `OTEL_EBPF` | string | `any`      |

各フローの `obi.ip` フィールドに OBI が報告する IP アドレスの種類（IPv4、IPv6、またはその両方）を指定します。
受け付ける値は `any`（デフォルト）、`ipv4`、`ipv6` です。
`agent_ip` 設定プロパティが設定されている場合、このプロパティは効果がありません。

| YAML         | 環境変数                       | 型       | デフォルト |
| ------------ | ------------------------------ | -------- | ---------- |
| `interfaces` | `OTEL_EBPF_NETWORK_INTERFACES` | []string | （空）     |

フローを収集するインターフェイス名です。
空の場合、OBI は `excluded_interfaces`（後述）にリストされているものを除く、システム内のすべてのインターフェイスを取得します。
エントリがスラッシュで囲まれている場合（例: `/br-/`）は正規表現としてマッチし、そうでなければ大文字小文字を区別する文字列としてマッチします。

このプロパティを環境変数で設定する場合、各エントリはカンマで区切る必要があります。
たとえば次のとおりです。

```sh
OTEL_EBPF_NETWORK_INTERFACES=eth0,eth1,/^veth/
```

| YAML                 | 環境変数                               | 型       | デフォルト |
| -------------------- | -------------------------------------- | -------- | ---------- |
| `exclude_interfaces` | `OTEL_EBPF_NETWORK_EXCLUDE_INTERFACES` | []string | `lo`       |

ネットワークフローのトレースから除外するインターフェイス名です。
デフォルト: `lo`（ループバック）。
エントリがスラッシュで囲まれている場合（例: `/br-/`）は正規表現としてマッチし、そうでなければ大文字小文字を区別する文字列としてマッチします。

このプロパティを環境変数で設定する場合、各エントリはカンマで区切る必要があります。
たとえば次のとおりです。

```sh
OTEL_BPF_NETWORK_EXCLUDE_INTERFACES=lo,/^veth/
```

| YAML        | 環境変数                      | 型       | デフォルト |
| ----------- | ----------------------------- | -------- | ---------- |
| `protocols` | `OTEL_EBPF_NETWORK_PROTOCOLS` | []string | （空）     |

設定すると、OBI は報告されるインターネットプロトコルがこのリストにないネットワークフローをすべてドロップします。

受け付ける値は Linux の [Standard well-defined IP protocols](https://elixir.bootlin.com/linux/v6.8.7/source/include/uapi/linux/in.h#L28) の列挙で定義されており、`TCP`、`UDP`、`IP`、`ICMP`、`IGMP`、`IPIP`、`EGP`、`PUP`、`IDP`、`TP`、`DCCP`、`IPV6`、`RSVP`、`GRE`、`ESP`、`AH`、`MTP`、`BEETPH`、`ENCAP`、`PIM`、`COMP`、`L2TP`、`SCTP`、`UDPLITE`、`MPLS`、`ETHERNET`、`RAW` です。

| YAML                | 環境変数                              | 型       | デフォルト |
| ------------------- | ------------------------------------- | -------- | ---------- |
| `exclude_protocols` | `OTEL_EBPF_NETWORK_EXCLUDE_PROTOCOLS` | []string | （空）     |

設定すると、OBI は報告されるインターネットプロトコルがこのリストにあるネットワークフローをすべてドロップします。

`protocols` / `OTEL_EBPF_NETWORK_PROTOCOLS` リストがすでに設定されている場合、このプロパティは無視されます。

受け付ける値は Linux の [Standard well-defined IP protocols](https://elixir.bootlin.com/linux/v6.8.7/source/include/uapi/linux/in.h#L28) の列挙で定義されており、`TCP`、`UDP`、`IP`、`ICMP`、`IGMP`、`IPIP`、`EGP`、`PUP`、`IDP`、`TP`、`DCCP`、`IPV6`、`RSVP`、`GRE`、`ESP`、`AH`、`MTP`、`BEETPH`、`ENCAP`、`PIM`、`COMP`、`L2TP`、`SCTP`、`UDPLITE`、`MPLS`、`ETHERNET`、`RAW` です。

| YAML              | 環境変数                            | 型      | デフォルト |
| ----------------- | ----------------------------------- | ------- | ---------- |
| `cache_max_flows` | `OTEL_EBPF_NETWORK_CACHE_MAX_FLOWS` | integer | `5000`     |

その後のエクスポートのためにフラッシュされる前に、アカウンティングキャッシュに蓄積できるフロー数を指定します。
デフォルト値は 5000 です。
OBI のログに "received message larger than max" エラーが表示される場合は、値を小さくしてください。

| YAML                   | 環境変数                                 | 型       | デフォルト |
| ---------------------- | ---------------------------------------- | -------- | ---------- |
| `cache_active_timeout` | `OTEL_EBPF_NETWORK_CACHE_ACTIVE_TIMEOUT` | duration | `5s`       |

その後のエクスポートのためにフラッシュされる前に、フローがアカウンティングキャッシュに保持される最大期間を指定します。

| YAML        | 環境変数                      | 型     | デフォルト |
| ----------- | ----------------------------- | ------ | ---------- |
| `direction` | `OTEL_EBPF_NETWORK_DIRECTION` | string | `both`     |

フローがキャプチャされるインターフェイスでの方向に応じて、どのフローをトレースするかを選択できます。
受け付ける値は `ingress`、`egress`、`both`（デフォルト）です。

> [!NOTE]
>
> ここでの _ingress_ または _egress_ は、ノードやクラスターの外からの送受信トラフィックではなく、ネットワークインターフェイスに関するものです。
> つまり、同じネットワークパケットが、仮想ネットワークデバイスでは「ingress」として、その背後の物理ネットワークインターフェイスでは「egress」として見えることがあります。

| YAML       | 環境変数                     | 型      | デフォルト  |
| ---------- | ---------------------------- | ------- | ----------- |
| `sampling` | `OTEL_EBPF_NETWORK_SAMPLING` | integer | `0`（無効） |

ターゲットコレクターにパケットをサンプリングして送信するレートです。
たとえば、100 に設定すると、平均して 100 パケットのうち 1 つがターゲットコレクターに送信されます。

| YAML          | 環境変数                        | 型      | デフォルト |
| ------------- | ------------------------------- | ------- | ---------- |
| `print_flows` | `OTEL_EBPF_NETWORK_PRINT_FLOWS` | boolean | `false`    |

`true` に設定すると、OBI は各ネットワークフローを標準出力に出力します。
これは大量の出力を生成する可能性があることに注意してください。

| YAML          | 環境変数                        | 型     | デフォルト |
| ------------- | ------------------------------- | ------ | ---------- |
| `guess_ports` | `OTEL_EBPF_NETWORK_GUESS_PORTS` | string | `disable`  |

> [!IMPORTANT]
>
> v0.7.0 では、ネットワークポートの推測が**デフォルトで無効**になりました。
> これは v0.6.0 以前のバージョンからの破壊的変更です。
> OBI が起点を判別できないフローについて推測されたクライアント/サーバーポートに依存している場合、明示的に序数推測にオプトインし直さない限り、`client.port` と `server.port` が空になる可能性があります。

フローのメタデータから起点を判別できない場合に、OBI が序数のヒューリスティクスに基づいてクライアントとサーバーのポートを推測しようとするかを指定します。
これは、ポートだけがサービスを識別するのに役立つかもしれない未知のサービスへの接続を追跡するのに便利です。

受け付ける値は `disable`（デフォルト）、`ordinal` です。

序数のヒューリスティクスに基づくポート推測を再度有効にするには、次のようにします。

```yaml
network:
  guess_ports: ordinal
```

または環境変数で次のようにします。

```sh
OTEL_EBPF_NETWORK_GUESS_PORTS=ordinal
```
