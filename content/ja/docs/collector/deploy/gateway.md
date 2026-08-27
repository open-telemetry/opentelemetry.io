---
title: ゲートウェイデプロイメントパターン
linkTitle: ゲートウェイパターン
description: シグナルを単一のOTLPエンドポイントに送信し、そこからバックエンドに送信する理由と方法
aliases: [/docs/collector/deployment/gateway]
weight: 300
default_lang_commit: bdfe463187e63311ab3e137f1e314acfb877fd8b
cSpell:ignore: hostnames loadbalancer loadbalancing resourcedetectionprocessor
---

コレクターのゲートウェイデプロイメントパターンは、アプリケーションまたは他のコレクターが、テレメトリーシグナルを単一の[OTLP](/docs/specs/otlp/)エンドポイントに送信する構成です。
このエンドポイントは、単独のサービス（たとえばKubernetesのデプロイメント）として実行される1つ以上のコレクターインスタンスによって提供されます。
通常、エンドポイントはクラスターごと、データセンターごと、またはリージョンごとに提供されます。

一般的なケースでは、アウトオブボックスのロードバランサーを使用して、コレクター間で負荷を分散できます。

![ゲートウェイデプロイメント概念](../../img/otel-gateway-sdk.svg)

テレメトリーデータの処理が特定のコレクターで行われる必要があるユースケースでは、2層の設定を使用します。
1層目のコレクターには、[Trace ID/サービス名を意識したロードバランシングエクスポーター][lb-exporter]を使用したパイプラインを設定します。
2層目では、各コレクターが自分に向けられたテレメトリーを受信して処理します。
たとえば、1層目でロードバランシングエクスポーターを使用して、[テイルサンプリングプロセッサー][tailsample-processor]を設定した2層目のコレクターにデータを送信すると、あるトレースのすべてのスパンが同じコレクターインスタンスに到達し、そこでテイルサンプリングポリシーが適用されます。

次の図は、ロードバランシングエクスポーターを使用したこの構成を示しています。

![ロードバランシングエクスポーターを使用したゲートウェイデプロイメント](../../img/otel-gateway-lb-sdk.svg)

1. アプリケーションで、SDKがOTLPデータを中央の場所に送信するように設定されます。
2. ロードバランシングエクスポーターを使用して設定されたコレクターが、シグナルを複数のコレクターに分散します。
3. コレクターがテレメトリーデータを1つ以上のバックエンドに送信します。

## 例 {#examples}

以下の例では、一般的なコンポーネントを使用してゲートウェイコレクターを設定する方法を示します。

### NGINXを「アウトオブボックス」のロードバランサーとして使用 {#nginx-as-an-out-of-the-box-load-balancer}

3つのコレクター（`collector1`、`collector2`、`collector3`）が設定されており、NGINXを使用してそれらの間でトラフィックをロードバランシングしたい場合、次の設定を使用できます。

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

コレクターの中央集権型デプロイメントパターンの具体的な例として、まずロードバランシングエクスポーターについて詳しく見ていきましょう。
これには2つの主な設定項目があります：

- `resolver`は、下流のコレクター（またはバックエンド）をどこで見つけるかを決定します。
  ここで`static`サブキーを使用すると、コレクターのURLを手動で列挙する必要があります。
  他のサポートされているリゾルバーはDNSリゾルバーで、定期的に更新を確認し、IPアドレスを解決します。
  このリゾルバータイプでは、`hostname`サブキーがIPアドレスのリストを取得するために問い合わせるホスト名を指定します。
- `routing_key`フィールドを使用するとロードバランシングエクスポーターがスパンを特定の下流のコレクターにルーティングするように指示します。
  このフィールドを`traceID`に設定すると、ロードバランシングエクスポーターは`traceID`に基づいてスパンをエクスポートします。
  その他の場合、`routing_key`に`service`を設定すると、サービス名に基づいてスパンをエクスポートします。
  これは、[スパンメトリクスコネクター][spanmetrics-connector]のようなコネクターを使用する際に有用で、サービスのすべてのスパンが同じ下流のコレクターに送信され、メトリクス収集が行われ、正確な集約が保証されます。

OTLPエンドポイントを提供する最初の層のコレクターは次のように設定されます。

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

ロードバランシングエクスポーターは、`otelcol_loadbalancer_num_backends`や`otelcol_loadbalancer_backend_latency`などの[メトリクス](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/exporter/loadbalancingexporter#metrics)を出力し、これらを使用してOTLPエンドポイントを提供するコレクターのヘルスとパフォーマンスを監視できます。

## トレードオフ {#trade-offs}

長所：

- 中央で管理された認証情報などの関心事を分離できる
- 中央集権型でポリシー（たとえば、特定のログのフィルタリングやサンプリング）を管理できる

短所：

- 維持管理と障害の可能性がある追加のコンポーネント（複雑性）
- カスケードされたコレクターの場合のレイテンシーの増加
- 全体的なリソース使用量の増加（コスト）

[lb-exporter]: https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/exporter/loadbalancingexporter
[tailsample-processor]: https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/tailsamplingprocessor
[spanmetrics-connector]: https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/connector/spanmetricsconnector

## 複数のコレクターとシングルライター原則 {#multiple-collectors-and-the-single-writer-principle}

OTLP内のすべてのメトリクスデータストリームには、[シングルライター](/docs/specs/otel/metrics/data-model/#single-writer)が必要です。
ゲートウェイ構成で複数のコレクターをデプロイする際は、すべてのメトリクスデータストリームに対してシングルライターとグローバルにユニークなIDを確保することが重要です。

### 潜在的な問題 {#potential-problems}

複数のアプリケーションが同じデータを変更または報告する並列アクセスは、データ損失やデータ品質の劣化を引き起こす可能性があります。
たとえば、リソース上で複数のソースから一貫性のないデータを確認する場合があります。
異なるソースがリソースをユニークに識別できないため、上書きされることがあります。

データにパターンがあれば、これが発生しているかどうかを確認できます。
たとえば、同じシリーズにおいて説明のつかないギャップやジャンプがある場合、複数のコレクターが同じサンプルを送信している可能性があります。
また、バックエンドでエラーを見つけることもあります。
たとえば、Prometheusバックエンドでは次のようなエラーが表示されることがあります。

`Error on ingesting out-of-order samples`

このエラーは、2つのジョブに同じターゲットが存在し、タイムスタンプの順序が間違っていることを示唆している可能性があります。
たとえば：

- メトリクス`M1`は、`T1`に13:56:04のタイムスタンプで`100`という値を持って受信された
- メトリクス`M1`は、`T2`に13:56:24のタイムスタンプで`120`という値を持って受信された
- メトリクス`M1`は、`T3`に13:56:04のタイムスタンプで`110`という値を持って受信された
- メトリクス`M1`は、13:56:24のタイムスタンプで`120`という値を持って受信された
- メトリクス`M1`は、13:56:04のタイムスタンプで`110`という値を持って受信された

### ベストプラクティス {#best-practices}

- [Kubernetes属性プロセッサー](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/k8sattributesprocessor)を使用して、異なるKubernetesリソースにラベルを追加します。
- [リソース検出プロセッサー](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/processor/resourcedetectionprocessor/README.md)を使用して、ホストからリソース情報を検出し、リソースメタデータを収集します。

## 次のステップ {#next-steps}

エージェントパターンとゲートウェイパターンを[組み合わせて](/docs/collector/deploy/other/agent-to-gateway/)、堅牢でスケーラブルなコレクターアーキテクチャを構築する方法を学びましょう。
