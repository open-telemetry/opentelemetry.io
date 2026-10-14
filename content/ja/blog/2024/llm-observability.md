---
title: OpenTelemetry を使った LLM ベースアプリケーションのオブザーバビリティ入門
linkTitle: LLM オブザーバビリティ
date: 2024-06-04
author: '[Ishan Jain](https://github.com/ishanjainn) (Grafana)'
default_lang_commit: 86176b5ce89da875add2a77296131397f7a7ca31
cSpell:ignore: Ishan ishan_jainn ishanjainn Jain llm
---

大規模言語モデル（LLM）は、シンプルなチャットボットからソフトウェアエンジニアのコード記述を支援する Copilot ボットまで、幅広いアプリケーションを持つことから、現在非常に人気があります。
本番環境での LLM の利用が拡大していることを踏まえ、ユーザーがこれらのモデルの動作を理解し監視する方法を学ぶことが重要です。

以下の例では、自動計装 LLM 監視ライブラリ [OpenLIT](https://github.com/openlit/openlit) が生成するメトリクスとトレースのターゲットバックエンドとして、[Prometheus](https://prometheus.io/) と [Jaeger](https://www.jaegertracing.io/) を使用します。
LLM 監視データの可視化ツールとして [Grafana](https://grafana.com/oss/grafana/) を使用します。
OTel メトリクスとトレースの保存には、お好みのバックエンドを選択できます。

## LLM アプリケーションにオブザーバビリティが重要な理由 {#why-observability-matters-for-llm-applications}

LLM アプリケーションの監視は、いくつかの理由から非常に重要です。

1. 使用量やコストを追跡するために、LLM がどの程度使用されているかを把握することが不可欠です。
2. LLM に渡される入力によってモデルの応答時間が変動する可能性があるため、レイテンシーの追跡が重要です。
3. レート制限は、特に外部 LLM で一般的な課題です。
   アプリケーションがこれらの外部 API 呼び出しにより強く依存するためです。
   レート制限に達すると、LLM を使用した重要な機能の実行が妨げられる可能性があります。

これらの側面を注意深く監視することで、コストを削減できるだけでなく、リクエスト制限への到達を回避し、LLM アプリケーションが最適に動作するようにできます。

## 注目すべきシグナルとは {#what-are-the-signals-that-you-should-be-looking-at}

アプリケーションで大規模言語モデル（LLM）を使用することは、従来の機械学習（ML）モデルとは異なります。
主な違いとして、LLM はローカルやオンプレミスで実行するのではなく、外部 API 呼び出しを通じてアクセスされることが多いです。
特に RAG ベースのアプリケーションでは、LLM の使用前後にイベントが発生する可能性があるため、イベントのシーケンスを（トレースを使用して）キャプチャすることが重要です。
また、集約データの分析（メトリクスを通じて）により、リクエスト、トークン、コストなどの概要を素早く把握でき、パフォーマンスの最適化とコスト管理に重要です。
以下は監視すべき主要なシグナルです。

### トレース {#traces}

- **リクエストメタデータ**: `temperature` や `top_p` など、応答品質とコストの両方に大きく影響するさまざまなパラメーターがあることから、LLM のコンテキストにおいて重要です。
  監視すべき具体的な側面は次のとおりです。
  - **Temperature**: モデルの出力に求める創造性やランダム性のレベルを示します。
    このパラメーターを変えることで、生成されるコンテンツの性質に大きな影響を与える可能性があります。

  - **top_p**: 最も可能性の高い単語の一定の割合から選択することで、モデルの選択性を決定します。
    `top_p` の値が高いと、モデルはより広い範囲の単語を考慮するため、テキストがより多様になります。

  - **モデル名またはバージョン**: LLM の更新がパフォーマンスや応答特性に影響を与える可能性があるため、経時的な追跡に不可欠です。

  - **プロンプトの詳細**: LLM に送信される正確な入力です。
    入力がより制御され均一である可能性があるオンプレミスの ML モデルとは異なり、大きく異なる可能性があり、出力の複雑さやコストへの影響に関わります。

- **レスポンスメタデータ**: LLM との API ベースのやり取りを考慮すると、レスポンスの詳細を追跡することがコスト管理と品質評価の鍵となります。
  - **トークン**: コストに直接影響し、レスポンスの長さと複雑さの指標となります。

  - **コスト**: API ベースのコストはリクエスト数と各リクエストの複雑さに応じてスケールする可能性があるため、予算管理に不可欠です。

  - **レスポンスの詳細**: プロンプトの詳細と同様ですがレスポンスの観点からのもので、モデルの出力特性や、非効率性または予想外のコストが発生する可能性のある領域についてのインサイトを提供します。

> [!NOTE]
>
> LLM ワーキンググループは、多くのバックエンドシステムがしばしば大きなペイロードの処理に苦慮するため、これらの詳細をスパン属性ではなくイベントでキャプチャすることを推奨しています。

### メトリクス {#metrics}

- **リクエスト量**: LLM サービスへのリクエスト総数です。
  需要パターンの把握や、突然のスパイクやドロップなどの使用量の異常の特定に役立ちます。
- **リクエスト時間**: リクエストが処理され、LLM からレスポンスを受信するまでにかかる時間です。
  ネットワークレイテンシーと LLM がレスポンスを生成するのにかかる時間を含み、LLM サービスのパフォーマンスと信頼性についてのインサイトを提供します。
- **コストとトークンのカウンター**: 経時的に発生した総コストと消費されたトークンを追跡することは、予算管理とコスト最適化戦略に不可欠です。
  これらのメトリクスを監視することで、LLM の非効率な使用や最適化の必要性を示す予想外の増加を警告できます。

## セットアップ例 {#an-example-setup}

### 前提条件 {#prerequisites}

始める前に、以下が環境で実行されていることを確認してください。

- Prometheus
- Jaeger
- Grafana

### OpenTelemetry Collector のセットアップ {#setting-up-the-opentelemetry-collector}

まず、[OpenTelemetry Collector をインストール](/docs/collector/install/)します。

### Collector の設定 {#configuring-the-collector}

次に、データの送信先を Collector に伝える必要があります。
以下は、メトリクスを **Prometheus** に、トレースを **Jaeger** に送信するためのシンプルな設定です。

```yaml
receivers:
  otlp:
    protocols:
      grpc:
        endpoint: 0.0.0.0:4317
      http:
        endpoint: 0.0.0.0:4318

processors:
  batch:
  memory_limiter:
    # 最大メモリの80%、最大2G
    limit_mib: 1500
    # 制限の25%、最大2G
    spike_limit_mib: 512
    check_interval: 5s

exporters:
  prometheusremotewrite:
    endpoint: 'YOUR_PROMETHEUS_REMOTE_WRITE_URL'
    add_metric_suffixes: false
  otlp:
    endpoint: 'YOUR_JAEGER_URL'

service:
  pipelines:
    traces:
      receivers: [otlp]
      processors: [memory_limiter, batch]
      exporters: [otlp]
    metrics:
      receivers: [otlp]
      processors: [memory_limiter, batch]
      exporters: [prometheusremotewrite]
```

### OpenLIT で LLM アプリケーションを計装する {#instrument-your-llm-application-with-openlit}

OpenLIT は、さまざまな大規模言語モデルと VectorDB の自動計装を提供することで、LLM ベースのアプリケーションの監視を効率化するように設計された OpenTelemetry ベースのライブラリです。

OpenTelemetry コミュニティが策定した GenAI セマンティック規約に準拠しており、OTLP エンドポイント設定にベンダー固有のスパンやイベント属性、環境変数に依存しないことで、スムーズな統合プロセスと標準的なソリューションを提供します。

#### ライブラリのインストール {#install-the-library}

OpenLIT Python ライブラリをインストールするには、次のコマンドを実行します。

```shell
pip install openlit
```

次に、LLM アプリケーションに以下の行を追加します。

```python
import openlit

openlit.init(
  otlp_endpoint="YOUR_OTELCOL_URL:4318",
)
```

かわりに `OTEL_EXPORTER_OTLP_ENDPOINT` を使用して OpenTelemetry Collector の URL を渡すこともできます。

```python
import openlit

openlit.init()
```

```shell
export OTEL_EXPORTER_OTLP_ENDPOINT = "YOUR_OTELCOL_URL:4318"
```

### メトリクスとトレースの可視化 {#visualize-the-metrics-and-traces}

OpenTelemetry Collector が Prometheus へのメトリクスと Jaeger へのトレースの送信を開始したら、以下の手順に従って Grafana で可視化します。
このデータの可視化には、お好みのツールを使用できます。

#### データソースとして Prometheus を追加する {#add-prometheus-as-a-data-source}

1. Grafana で、**Connections** > **Data Sources** に移動します。
2. **Add data source** をクリックし、**Prometheus** を選択します。
3. 設定画面で、Prometheus の URL（例: `http://<your_prometheus_host>`）とその他の必要な詳細情報を入力します。
4. **Save & Test** を選択します。

#### データソースとして Jaeger を追加する {#add-jaeger-as-a-data-source}

1. Grafana で、**Connections** > **Data Sources** に移動します。
2. **Add data source** をクリックし、**Jaeger** を選択します。
3. 設定画面で、Jaeger の URL（例: `http://<your_jaeger_host>`）とその他の必要な詳細情報を入力します。
4. **Save & Test** を選択します。

#### ダッシュボードの追加 {#add-the-dashboard}

簡単にするために、[OpenLIT のダッシュボード](https://docs.openlit.io/latest/sdk/destinations/prometheus-jaeger#prometheus-jaeger)を使用できます。

このガイドでは、OpenTelemetry、Prometheus、Jaeger、Grafana を使用して LLM アプリケーションを監視する方法を紹介しました。

ご質問がある場合は、GitHub [@ishanjainn](https://github.com/ishanjainn) または Twitter [@ishan_jainn](https://twitter.com/ishan_jainn) でお気軽にお問い合わせください。
