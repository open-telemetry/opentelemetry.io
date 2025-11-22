---
title: ゲートウェイ
description: シグナルを単一のOTLPエンドポイントに送信し、そこからバックエンドに送信する理由と方法
weight: 3
default_lang_commit: 548e5e29f574fddc3ca683989a458e9a6800242f
drifted_from_default: true
# prettier-ignore
cSpell:ignore: filelogreceiver hostmetricsreceiver hostnames loadbalancer loadbalancing resourcedetectionprocessor
---

コレクターのゲートウェイデプロイメントパターンは、アプリケーション（または他のコレクター）がテレメトリーシグナルを単一のOTLPエンドポイントに送信し、そのエンドポイントが実行されている1つ以上のコレクターインスタンスによって処理される構成です。
このコレクターインスタンスは、通常、クラスターごと、データセンターごと、またはリージョンごとに単独のサービス（たとえばKubernetesのデプロイメント）として実行されます。

一般的なケースでは、アウトオブボックスのロードバランサーを使用して、コレクター間で負荷を分散できます。

![ゲートウェイデプロイメント概念](../../img/otel-gateway-sdk.svg)

テレメトリーデータの処理が特定のコレクターで行われる必要があるユースケースでは、2層の設定を使用します。
1層目のコレクターは、[Trace ID/サービス名を意識したロードバランシングエクスポーター][lb-exporter]を使用して設定され、2層目ではスケールアウトを処理するコレクターが使用されます。
たとえば、[テイルサンプリングプロセッサー][tailsample-processor]を使用する場合、すべてのスパンが同じコレクターインスタンスに到達し、そこでそのサンプリングポリシーが適用されるように、ロードバランシングエクスポーターを使用する必要があります。

ロードバランシングエクスポーターを使用する場合の例を見てみましょう。

![ロードバランシングエクスポーターを使用したゲートウェイデプロイメント](../../img/otel-gateway-lb-sdk.svg)

1. アプリケーションで、SDKがOTLPデータを中央の場所に送信するように設定されます。
2. ロードバランシングエクスポーターを使用して設定されたコレクターが、シグナルを複数のコレクターに分散します。
3. コレクターはテレメトリーデータを1つ以上のバックエンドに送信するように設定されます。

## 例 {#examples}

### NGINXを「アウトオブボックス」のロードバランサーとして使用 {#nginx-as-an-out-of-the-box-load-balancer}

2つのコレクター（`collector1`と`collector2`）が設定され、NGINXを使用してその間でトラフィックをロードバランシングしたい場合、次の設定を使用できます。

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
}

upstream collector4318 {
    server collector1:4318;
    server collector2:4318;
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
  このフィールドを`traceID`（デフォルト）に設定すると、ロードバランシングエクスポーターは`traceID`に基づいてスパンをエクスポートします。
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

ロードバランシングエクスポーターは、`otelcol_loadbalancer_num_backends`や`otelcol_loadbalancer_backend_latency`などのメトリクスを出力し、これらを使用してOTLPエンドポイントコレクターのヘルスとパフォーマンスを監視できます。

## エージェントとゲートウェイのコレクターの組み合わせたデプロイメント {#combined-deployment-of-collectors-as-agents-and-gateways}

複数のOpenTelemetryコレクターをデプロイする場合、エージェントとしてもゲートウェイとしてもコレクターを実行することがよくあります。

以下の図は、このような組み合わせたデプロイメントのアーキテクチャを示しています。

- エージェントデプロイメントパターンで実行されるコレクター（各ホストで実行され、Kubernetesデーモンセットのように）を使用して、ホスト上で実行されるサービスからのテレメトリーとホストのテレメトリー（ホストメトリクスやスクラップログなど）を収集します。
- ゲートウェイデプロイメントパターンで実行されるコレクターを使用して、データの処理（たとえばフィルタリング、サンプリング、バックエンドへのエクスポートなど）を行います。

![ゲートウェイ](otel-gateway-arch.svg)

この組み合わせたデプロイメントパターンは、コレクター内でホストごとにユニークである必要があるコンポーネントや、アプリケーションが実行されている同じホストにしか利用できない情報を消費するコンポーネントを使用する場合に必要です。

- [`hostmetricsreceiver`](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/receiver/hostmetricsreceiver)や[`filelogreceiver`](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/receiver/filelogreceiver)のようなレシーバーは、ホストインスタンスごとにユニークである必要があります。
  これらのレシーバーを複数実行すると、データが重複します。

- [`resourcedetectionprocessor`](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/resourcedetectionprocessor)のようなプロセッサーは、ホスト、コレクター、アプリケーションの情報を追加するために使用されます。
  リモートマシン上のコレクター内でこれらを実行すると、不正確なデータが生成されます。

## トレードオフ {#tradeoffs}

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

- メトリクス`M1`は、13:56:04のタイムスタンプで`100`という値を持って受信された
- メトリクス`M1`は、13:56:24のタイムスタンプで`120`という値を持って受信された
- メトリクス`M1`は、13:56:04のタイムスタンプで`110`という値を持って受信された
- メトリクス`M1`は、13:56:24のタイムスタンプで`120`という値を持って受信された
- メトリクス`M1`は、13:56:04のタイムスタンプで`110`という値を持って受信された

### ベストプラクティス {#best-practices}

- [Kubernetes属性プロセッサー](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/k8sattributesprocessor)を使用して、異なるKubernetesリソースにラベルを追加します。
- [リソース検出プロセッサー](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/processor/resourcedetectionprocessor/README.md)を使用して、ホストからリソース情報を検出し、リソースメタデータを収集します。
