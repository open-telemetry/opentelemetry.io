---
title: OBI がエクスポートするメトリクス
linkTitle: エクスポートされるメトリクス
description: OBI がエクスポートできる HTTP/gRPC メトリクスについて学びます。
weight: 21
default_lang_commit: b51a1db58883aa963c461d34356aa86ac18d94b7
cSpell:ignore: replicaset statefulset
---

次の表では、OpenTelemetry 形式と Prometheus 形式の両方でエクスポートされるメトリクスについて説明します。

| ファミリー       | 名前（OTel）                       | 名前（Prometheus）                         | 型        | 単位    | 説明                                                                                              |
| ---------------- | ---------------------------------- | ------------------------------------------ | --------- | ------- | ------------------------------------------------------------------------------------------------- |
| アプリケーション | `http.client.request.duration`     | `http_client_request_duration_seconds`     | Histogram | seconds | クライアント側からの HTTP サービス呼び出しの期間                                                  |
| アプリケーション | `http.client.request.body.size`    | `http_client_request_body_size_bytes`      | Histogram | bytes   | クライアントによって送信された HTTP リクエストボディのサイズ                                      |
| アプリケーション | `http.client.response.body.size`   | `http_client_response_body_size_bytes`     | Histogram | bytes   | クライアントによって送信された HTTP レスポンスボディのサイズ                                      |
| アプリケーション | `http.server.request.duration`     | `http_server_request_duration_seconds`     | Histogram | seconds | サーバー側からの HTTP サービス呼び出しの期間                                                      |
| アプリケーション | `http.server.request.body.size`    | `http_server_request_body_size_bytes`      | Histogram | bytes   | サーバー側で受信された HTTP リクエストボディのサイズ                                              |
| アプリケーション | `http.server.response.body.size`   | `http_server_response_body_size_bytes`     | Histogram | bytes   | サーバー側で受信された HTTP レスポンスボディのサイズ                                              |
| アプリケーション | `rpc.client.duration`              | `rpc_client_duration_seconds`              | Histogram | seconds | クライアント側からの gRPC サービス呼び出しの期間                                                  |
| アプリケーション | `rpc.server.duration`              | `rpc_server_duration_seconds`              | Histogram | seconds | サーバー側からの RPC サービス呼び出しの期間                                                       |
| アプリケーション | `sql.client.duration`              | `sql_client_duration_seconds`              | Histogram | seconds | SQL クライアント操作の期間（実験的）                                                              |
| アプリケーション | `redis.client.duration`            | `redis_client_duration_seconds`            | Histogram | seconds | Redis クライアント操作の期間（実験的）                                                            |
| アプリケーション | `messaging.publish.duration`       | `messaging_publish_duration`               | Histogram | seconds | Messaging（Kafka）の publish 操作の期間（実験的）                                                 |
| アプリケーション | `messaging.process.duration`       | `messaging_process_duration`               | Histogram | seconds | Messaging（Kafka）の process 操作の期間（実験的）                                                 |
| アプリケーション | `gen_ai.client.operation.duration` | `gen_ai_client_operation_duration_seconds` | Histogram | seconds | GenAI クライアント操作の期間（実験的）                                                            |
| アプリケーション | `gen_ai.client.token.usage`        | `gen_ai_client_token_usage`                | Histogram | 1       | 消費された GenAI 入力/出力トークンの数。トークンタイプでラベル付けされます（実験的）              |
| ネットワーク     | `obi.network.flow.bytes`           | `obi_network_flow_bytes_total`             | Counter   | bytes   | 送信元ネットワークエンドポイントから宛先ネットワークエンドポイントへ送信されたバイト数            |
| ネットワーク     | `obi.network.inter.zone.bytes`     | `obi_network_inter_zone_bytes_total`       | Counter   | bytes   | クラスター内のクラウド可用性ゾーン間を流れるバイト数（実験的、現在は Kubernetes でのみ利用可能）  |
| ネットワーク     | `obi.stat.tcp.rtt`                 | `obi_stat_tcp_rtt_seconds`                 | Histogram | seconds | ネットワークエンドポイント間で観測された TCP ラウンドトリップ時間（RTT）レイテンシー（StatsO11y） |

OBI は[スパンメトリクス](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/connector/spanmetricsconnector)と[サービスグラフメトリクス](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/connector/servicegraphconnector)もエクスポートできます。
これらは[機能](../configure/options/)構成オプションで有効にできます。

## OBI メトリクスの属性 {#attributes-of-obi-metrics}

簡潔にするため、このリスト内のメトリクスと属性では、OTel の `dot.notation` を使用します。
Prometheus エクスポーターを使用する場合、メトリクスは `underscore_notation` を使用します。

表示する属性または非表示にする属性を設定するには、[構成ドキュメント](../configure/options/)の `attributes`->`select` セクションを確認してください。

| メトリクス                       | 名前                         | デフォルト                                        |
| -------------------------------- | ---------------------------- | ------------------------------------------------- |
| アプリケーション（すべて）       | `http.request.method`        | 表示                                              |
| アプリケーション（すべて）       | `http.response.status_code`  | 表示                                              |
| アプリケーション（すべて）       | `http.route`                 | `routes` 構成セクションが存在する場合に表示       |
| アプリケーション（すべて）       | `k8s.daemonset.name`         | Kubernetes メタデータが有効な場合に表示           |
| アプリケーション（すべて）       | `k8s.deployment.name`        | Kubernetes メタデータが有効な場合に表示           |
| アプリケーション（すべて）       | `k8s.namespace.name`         | Kubernetes メタデータが有効な場合に表示           |
| アプリケーション（すべて）       | `k8s.node.name`              | Kubernetes メタデータが有効な場合に表示           |
| アプリケーション（すべて）       | `k8s.owner.name`             | Kubernetes メタデータが有効な場合に表示           |
| アプリケーション（すべて）       | `k8s.pod.name`               | Kubernetes メタデータが有効な場合に表示           |
| アプリケーション（すべて）       | `k8s.container.name`         | Kubernetes メタデータが有効な場合に表示           |
| アプリケーション（すべて）       | `k8s.pod.start_time`         | Kubernetes メタデータが有効な場合に表示           |
| アプリケーション（すべて）       | `k8s.pod.uid`                | Kubernetes メタデータが有効な場合に表示           |
| アプリケーション（すべて）       | `k8s.replicaset.name`        | Kubernetes メタデータが有効な場合に表示           |
| アプリケーション（すべて）       | `k8s.statefulset.name`       | Kubernetes メタデータが有効な場合に表示           |
| アプリケーション（すべて）       | `k8s.cluster.name`           | Kubernetes メタデータが有効な場合に表示           |
| アプリケーション（すべて）       | `container.id`               | Docker メタデータが有効な場合に表示               |
| アプリケーション（すべて）       | `container.name`             | Docker メタデータが有効な場合に表示               |
| アプリケーション（すべて）       | `cloud.provider`             | クラウドメタデータが有効な場合に表示              |
| アプリケーション（すべて）       | `cloud.platform`             | クラウドメタデータが有効な場合に表示              |
| アプリケーション（すべて）       | `cloud.region`               | クラウドメタデータが有効な場合に表示              |
| アプリケーション（すべて）       | `cloud.account.id`           | クラウドメタデータが有効な場合に表示              |
| アプリケーション（すべて）       | `cloud.availability_zone`    | クラウドメタデータが有効な場合に表示              |
| アプリケーション（すべて）       | `cloud.resource_id`          | クラウドメタデータが有効な場合に表示（Azureのみ） |
| アプリケーション（すべて）       | `host.id`                    | クラウドメタデータが有効な場合に表示              |
| アプリケーション（すべて）       | `host.type`                  | クラウドメタデータが有効な場合に表示              |
| アプリケーション（すべて）       | `host.image.id`              | クラウドメタデータが有効な場合に表示（AWS のみ）  |
| アプリケーション（すべて）       | `gcp.gce.instance.name`      | クラウドメタデータが有効な場合に表示（GCP のみ）  |
| アプリケーション（すべて）       | `gcp.gce.instance.hostname`  | クラウドメタデータが有効な場合に表示（GCP のみ）  |
| アプリケーション（すべて）       | `service.name`               | 表示                                              |
| アプリケーション（すべて）       | `service.namespace`          | 表示                                              |
| アプリケーション（すべて）       | `target.instance`            | 表示                                              |
| アプリケーション（すべて）       | `url.path`                   | 非表示                                            |
| アプリケーション（クライアント） | `server.address`             | 非表示                                            |
| アプリケーション（クライアント） | `server.port`                | 非表示                                            |
| アプリケーション `rpc.*`         | `rpc.grpc.status_code`       | 表示                                              |
| アプリケーション `rpc.*`         | `rpc.method`                 | 表示                                              |
| アプリケーション `rpc.*`         | `rpc.system`                 | 表示                                              |
| アプリケーション（サーバー）     | `client.address`             | 非表示                                            |
| `obi.network.flow.bytes`         | `obi.ip`                     | 非表示                                            |
| `db.client.operation.duration`   | `db.operation.name`          | 表示                                              |
| `db.client.operation.duration`   | `db.collection.name`         | 非表示                                            |
| `messaging.publish.duration`     | `messaging.system`           | 表示                                              |
| `messaging.publish.duration`     | `messaging.destination.name` | 表示                                              |
| `messaging.process.duration`     | `messaging.system`           | 表示                                              |
| `messaging.process.duration`     | `messaging.destination.name` | 表示                                              |
| `obi.network.flow.bytes`         | `client.port`                | 非表示                                            |
| `obi.network.flow.bytes`         | `direction`                  | 非表示                                            |
| `obi.network.flow.bytes`         | `dst.address`                | 非表示                                            |
| `obi.network.flow.bytes`         | `dst.cidr`                   | `cidrs` 構成セクションが存在する場合に表示        |
| `obi.network.flow.bytes`         | `dst.name`                   | 非表示                                            |
| `obi.network.flow.bytes`         | `dst.port`                   | 非表示                                            |
| `obi.network.flow.bytes`         | `dst.zone`（Kubernetesのみ） | 非表示                                            |
| `obi.network.flow.bytes`         | `iface`                      | 非表示                                            |
| `obi.network.flow.bytes`         | `k8s.cluster.name`           | Kubernetes が有効な場合に表示                     |
| `obi.network.flow.bytes`         | `k8s.dst.name`               | 非表示                                            |
| `obi.network.flow.bytes`         | `k8s.dst.namespace`          | Kubernetes が有効な場合に表示                     |
| `obi.network.flow.bytes`         | `k8s.dst.node.ip`            | 非表示                                            |
| `obi.network.flow.bytes`         | `k8s.dst.node.name`          | 非表示                                            |
| `obi.network.flow.bytes`         | `k8s.dst.owner.type`         | 非表示                                            |
| `obi.network.flow.bytes`         | `k8s.dst.type`               | 非表示                                            |
| `obi.network.flow.bytes`         | `k8s.dst.owner.name`         | Kubernetes が有効な場合に表示                     |
| `obi.network.flow.bytes`         | `k8s.src.name`               | 非表示                                            |
| `obi.network.flow.bytes`         | `k8s.src.namespace`          | Kubernetes が有効な場合に表示                     |
| `obi.network.flow.bytes`         | `k8s.src.node.ip`            | 非表示                                            |
| `obi.network.flow.bytes`         | `k8s.src.owner.name`         | Kubernetes が有効な場合に表示                     |
| `obi.network.flow.bytes`         | `k8s.src.owner.type`         | 非表示                                            |
| `obi.network.flow.bytes`         | `k8s.src.type`               | 非表示                                            |
| `obi.network.flow.bytes`         | `server.port`                | 非表示                                            |
| `obi.network.flow.bytes`         | `src.address`                | 非表示                                            |
| `obi.network.flow.bytes`         | `src.cidr`                   | `cidrs` 構成セクションが存在する場合に表示        |
| `obi.network.flow.bytes`         | `src.name`                   | 非表示                                            |
| `obi.network.flow.bytes`         | `src.port`                   | 非表示                                            |
| `obi.network.flow.bytes`         | `src.zone`（Kubernetesのみ） | 非表示                                            |
| `obi.network.flow.bytes`         | `transport`                  | 非表示                                            |
| `obi.network.flow.bytes`         | `network.type`               | 非表示                                            |
| `obi.network.flow.bytes`         | `network.protocol.name`      | 非表示                                            |
| `obi.network.flow.bytes`         | `src.country`                | `geoip` 構成セクションが存在する場合に表示        |
| `obi.network.flow.bytes`         | `src.asn`                    | `geoip` 構成セクションが存在する場合に表示        |
| `obi.network.flow.bytes`         | `dst.country`                | `geoip` 構成セクションが存在する場合に表示        |
| `obi.network.flow.bytes`         | `dst.asn`                    | `geoip` 構成セクションが存在する場合に表示        |
| トレース（SQL、Redis）           | `db.query.text`              | 非表示                                            |

> [!NOTE]
>
> `obi.network.inter.zone.bytes` メトリクスは `obi.network.flow.bytes` と同じ属性セットをサポートしますが、`k8s.cluster.name`、`src.zone`、`dst.zone` を除き、すべてデフォルトで非表示です。

## 内部メトリクス {#internal-metrics}

OBI は、Prometheus 形式で[内部メトリクスを報告するように構成](../configure/internal-metrics-reporter/)できます。

| 名前                                    | 型         | 説明                                                                                |
| --------------------------------------- | ---------- | ----------------------------------------------------------------------------------- |
| `obi_ebpf_tracer_flushes`               | Histogram  | eBPF トレーサーから次のパイプラインステージへフラッシュされたトレースグループの長さ |
| `obi_metric_exports_total`              | Counter    | リモート OTel コレクターへ送信されたメトリクスバッチの長さ                          |
| `obi_metric_export_errors_total`        | CounterVec | 失敗した各 OTel メトリクスエクスポートのエラー数。エラータイプ別                    |
| `obi_trace_exports_total`               | Counter    | リモート OTel コレクターへ送信されたトレースバッチの長さ                            |
| `obi_trace_export_errors_total`         | CounterVec | 失敗した各 OTel トレースエクスポートのエラー数。エラータイプ別                      |
| `obi_prometheus_http_requests_total`    | CounterVec | Prometheus スクレイプエンドポイントへのリクエスト数。HTTP ポートとパスで分類        |
| `obi_bpf_network_ignored_packets_total` | Counter    | フロー集計前に OBI ネットワークフィルターによって破棄されたネットワークパケットの数 |
| `obi_instrumented_processes`            | GaugeVec   | OBI によって計装されたプロセス。プロセス名付き                                      |
| `obi_internal_build_info`               | GaugeVec   | OBI バイナリのバージョン情報。ビルド時間とコミットハッシュを含む                    |
