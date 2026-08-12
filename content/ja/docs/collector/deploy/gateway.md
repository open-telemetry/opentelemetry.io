---
title: ゲートウェイデプロイメントパターン
linkTitle: ゲートウェイパターン
description: シグナルをまず単一の OTLP エンドポイントに送信し、そこからバックエンドに送信する理由と方法
aliases: [/docs/collector/deployment/gateway]
weight: 300
default_lang_commit: cc127cac40d5d6aaf48e015f1cf4dbf76bff587b
cSpell:ignore: hostnames loadbalancer loadbalancing resourcedetectionprocessor
---

ゲートウェイ Collector デプロイメントパターンは、アプリケーションまたは他の Collector が単一の [OTLP](/docs/specs/otlp/) エンドポイントにテレメトリーシグナルを送信する構成です。
このエンドポイントは、スタンドアロンサービスとして動作する1つ以上の Collector インスタンスによって提供されます（たとえば Kubernetes デプロイメント）。
通常、エンドポイントはクラスター、データセンター、またはリージョンごとに提供されます。

一般的に、既製のロードバランサーを使用して Collector 間で負荷を分散できます。

![ゲートウェイデプロイメントの概念](../../img/otel-gateway-sdk.svg)

テレメトリーデータを特定の Collector で処理する必要があるユースケースでは、2層構成を使用します。
1層目の Collector には、[Trace ID/サービス名を意識したロードバランシングエクスポーター][lb-exporter]を使用したパイプラインが設定されます。
2層目では、各 Collector がそれぞれに向けられたテレメトリーを受信して処理します。
たとえば、1層目でロードバランシングエクスポーターを使用して、[テイルサンプリングプロセッサー][tailsample-processor]が設定された2層目の Collector にデータを送信すると、特定のトレースのすべてのスパンが同じ Collector インスタンスに到達し、テイルサンプリングポリシーが適用されます。

次の図は、ロードバランシングエクスポーターを使用したこの構成を示しています。

![ロードバランシングエクスポーターを使用したゲートウェイデプロイメント](../../img/otel-gateway-lb-sdk.svg)

1. アプリでは、SDK が OTLP データを中央のロケーションに送信するよう設定されます。
2. Collector はロードバランシングエクスポーターを使用して、シグナルを Collector グループに分散するよう設定されます。
3. Collector がテレメトリーデータを1つ以上のバックエンドに送信します。

## 設定例 {#examples}

以下の例は、一般的なコンポーネントを使用してゲートウェイ Collector を設定する方法を示しています。

### NGINX を「既製の」ロードバランサーとして使用する {#nginx-as-an-out-of-the-box-load-balancer}

3台の Collector（`collector1`、`collector2`、`collector3`）が設定済みで、NGINX を使用してトラフィックを負荷分散したい場合、次の設定を使用できます。

```nginx
server {
    listen 4317 http2;
    server_name _;

    location / {
            grpc_pass      grpc://collector4317;
            grpc_next_upstream     error timeout invalid_header http_500;
            grpc_connect_timeout   2;
            grpc_set_header        Host            $host;
            grpc_set_header        X-Real-IP       $remote_addr;
            grpc_set_header        X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}

server {
    listen 4318;
    server_name _;

    location / {
            proxy_pass      http://collector4318;
            proxy_redirect  off;
            proxy_next_upstream     error timeout invalid_header http_500;
            proxy_connect_timeout   2;
            proxy_set_header        Host            $host;
            proxy_set_header        X-Real-IP       $remote_addr;
            proxy_set_header        X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}

upstream collector4317 {
    server collector1:4317;
    server collector2:4317;
    server collector3:4317;
}

upstream collector4318 {
    server collector1:4318;
    server collector2:4318;
    server collector3:4318;
}
```

### ロードバランシングエクスポーター {#load-balancing-exporter}

集中型 Collector デプロイメントパターンの具体例として、まずロードバランシングエクスポーターを見てみましょう。
このエクスポーターには主に2つの設定フィールドがあります。

- `resolver` はダウンストリームの Collector またはバックエンドの場所を決定します。
  ここで `static` サブキーを使用する場合、Collector の URL を手動で列挙する必要があります。
  もう1つサポートされているリゾルバーは DNS リゾルバーで、定期的に更新を確認し IP アドレスを解決します。
  このリゾルバータイプでは、`hostname` サブキーで IP アドレスのリストを取得するためのホスト名を指定します。
- `routing_key` フィールドは、特定のダウンストリーム Collector にスパンをルーティングします。
  このフィールドを `traceID` に設定すると、ロードバランシングエクスポーターはスパンの `traceID` に基づいてエクスポートします。
  `routing_key` に `service` を使用すると、サービス名に基づいてスパンをエクスポートします。
  このルーティングは、[スパンメトリクスコネクター][spanmetrics-connector]のようなコネクターを使用する場合に有用です。
  あるサービスのすべてのスパンが同じダウンストリーム Collector に送信されてメトリクス収集が行われるため、正確な集約が保証されます。

OTLP エンドポイントを提供する1層目の Collector は次のように設定されます。

{{< tabpane text=true >}} {{% tab Static %}}

```yaml
receivers:
  otlp:
    protocols:
      grpc:
        endpoint: 0.0.0.0:4317

exporters:
  loadbalancing:
    protocol:
      otlp:
        tls:
          insecure: true
    resolver:
      static:
        hostnames:
          - collector-1.example.com:4317
          - collector-2.example.com:5317
          - collector-3.example.com

service:
  pipelines:
    traces:
      receivers: [otlp]
      exporters: [loadbalancing]
```

{{% /tab %}} {{% tab DNS %}}

```yaml
receivers:
  otlp:
    protocols:
      grpc:
        endpoint: 0.0.0.0:4317

exporters:
  loadbalancing:
    protocol:
      otlp:
        tls:
          insecure: true
    resolver:
      dns:
        hostname: collectors.example.com

service:
  pipelines:
    traces:
      receivers: [otlp]
      exporters: [loadbalancing]
```

{{% /tab %}} {{% tab "DNS with service" %}}

```yaml
receivers:
  otlp:
    protocols:
      grpc:
        endpoint: 0.0.0.0:4317

exporters:
  loadbalancing:
    routing_key: service
    protocol:
      otlp:
        tls:
          insecure: true
    resolver:
      dns:
        hostname: collectors.example.com
        port: 5317

service:
  pipelines:
    traces:
      receivers: [otlp]
      exporters: [loadbalancing]
```

{{% /tab %}} {{< /tabpane >}}

ロードバランシングエクスポーターは、`otelcol_loadbalancer_num_backends` や `otelcol_loadbalancer_backend_latency` などの[メトリクス](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/exporter/loadbalancingexporter#metrics)を出力します。
これらを使用して、OTLP エンドポイントを提供する Collector の健全性とパフォーマンスを監視できます。

## トレードオフ {#trade-offs}

長所:

- 一元管理された認証情報など、関心事の分離
- 一元化されたポリシー管理（たとえば、特定のログのフィルタリングやサンプリング）

短所:

- 保守すべきものが増え、障害ポイントになりうる（複雑性）
- カスケード接続された Collector の場合、レイテンシーが増加する
- 全体的なリソース使用量の増加（コスト）

[lb-exporter]: https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/exporter/loadbalancingexporter
[tailsample-processor]: https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/tailsamplingprocessor
[spanmetrics-connector]: https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/connector/spanmetricsconnector

## 複数の Collector とシングルライター原則 {#multiple-collectors-and-the-single-writer-principle}

OTLP 内のすべてのメトリクスデータストリームには、[シングルライター](/docs/specs/otel/metrics/data-model/#single-writer)が必要です。
ゲートウェイ構成で複数の Collector をデプロイする際は、すべてのメトリクスデータストリームがシングルライターを持ち、グローバルにユニークなアイデンティティを持つようにしてください。

### 考えられる問題 {#potential-problems}

同じデータを変更または報告する複数のアプリケーションからの同時アクセスは、データ損失やデータ品質の低下につながる可能性があります。
たとえば、同じリソースに対する複数のソースからの一貫性のないデータが表示される場合があります。
リソースが一意に識別されないため、異なるソースが互いのデータを上書きしてしまうことがあります。

これが発生しているかどうかについて、データのパターンから手がかりが得られる場合があります。
たとえば、目視で確認すると、同じ系列で説明のつかないギャップやジャンプがある場合、複数の Collector が同じサンプルを送信している兆候かもしれません。
バックエンドでエラーが表示されることもあります。
たとえば、Prometheus バックエンドの場合は次のようなエラーです。

`Error on ingesting out-of-order samples`

このエラーは、同一のターゲットが2つのジョブに存在し、タイムスタンプの順序が正しくないことを示している可能性があります。
たとえば次のような場合です。

- メトリクス `M1` がタイムスタンプ 13:56:04、値 `100` で `T1` に受信された
- メトリクス `M1` がタイムスタンプ 13:56:24、値 `120` で `T2` に受信された
- メトリクス `M1` がタイムスタンプ 13:56:04、値 `110` で `T3` に受信された
- メトリクス `M1` がタイムスタンプ 13:56:24、値 `120` で受信された
- メトリクス `M1` がタイムスタンプ 13:56:04、値 `110` で受信された

### ベストプラクティス {#best-practices}

- [Kubernetes attributes プロセッサー](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/k8sattributesprocessor)を使用して、さまざまな Kubernetes リソースにラベルを追加します。
- [resource detector プロセッサー](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/processor/resourcedetectionprocessor/README.md)を使用して、ホストからリソース情報を検出し、リソースメタデータを収集します。

## 次のステップ {#next-steps}

エージェントとゲートウェイパターンを[組み合わせて](/docs/collector/deploy/other/agent-to-gateway/)、堅牢でスケーラブルな Collector アーキテクチャを構築する方法を学びましょう。
