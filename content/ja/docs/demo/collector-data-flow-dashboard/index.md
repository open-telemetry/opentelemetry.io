---
title: コレクターデータフローダッシュボード
default_lang_commit: fd7da211d5bc37ca93112a494aaf6a94445e2e28
---

OpenTelemetryコレクターを通じてデータフローを監視することは、いくつかの重要な理由があります。サンプル数やカーディナリティなど、入力されるデータのマクロレベルの視点を得ることは、コレクターの内部動作を理解する上で不可欠です。しかし、詳細に踏み込むと、相互接続が複雑になる可能性があります。コレクターデータフローダッシュボードは、OpenTelemetryデモアプリケーションの機能を示すことを目的としており、ユーザーが構築するための基盤を提供します。

コレクターデータフローダッシュボードは、監視すべきメトリクスについて重要なガイダンスを提供します。ユーザーは、memory_delimiterプロセッサーやその他のデータフロー指標など、自身のユースケースに合わせた必要なメトリクスを追加することで、独自のダッシュボードバリエーションを作成できます。デモダッシュボードは出発点として機能し、ユーザーが多様な利用シナリオを探索し、独自の監視ニーズに合わせてツールを適応させることを可能にします。

## データフローの概要

以下の図は、システムコンポーネントの概要を示しており、OpenTelemetryデモアプリケーションで使用されているOpenTelemetryコレクター（otelcol）設定ファイルから導き出された構成を示しています。さらに、システム内のオブザーバビリティデータ（トレースとメトリクス）の流れを強調しています。

![OpenTelemetry Collector Data Flow Overview](otelcol-data-flow-overview.png)

## 入力と出力のメトリクス

以下の図に示されているメトリクスは、入力と出力の両方のデータフローを監視するために使用されています。これらのメトリクスはotelcolプロセスによって生成され、ポート8888でエクスポートされ、その後Prometheusによってスクレイピングされます。これらのメトリクスに関連するネームスペースは "otelcol" であり、ジョブ名は `otel` とラベル付けされています。

![OpenTelemetry Collector Ingress and Egress Metrics](otelcol-data-flow-metrics.png)

ラベルは、特定のメトリクスセット（エクスポーター、レシーバー、またはジョブなど）を識別するための有用なツールとして機能し、ネームスペース全体の中からメトリクスセットを区別できるようにします。重要な点として、memory_delimiterプロセッサーで定義されているメモリ制限を超えた場合にのみ、拒否された(refused)メトリクスに遭遇することになります。

### トレースパイプラインの入力に関するメトリクス

- `otelcol_receiver_accepted_spans`
- `otelcol_receiver_refused_spans`
- `by (receiver,transport)`

### メトリクスパイプラインの入力に関するメトリクス

- `otelcol_receiver_accepted_metric_points`
- `otelcol_receiver_refused_metric_points`
- `by (receiver,transport)`

### プロセッサーに関するメトリクス

現在、デモアプリケーションに存在する唯一のプロセッサーはバッチプロセッサーであり、これはトレースとメトリクスの両方のパイプラインで使用されています。

- `otelcol_processor_batch_batch_send_size_sum`

### トレースパイプラインの出力に関するメトリクス

- `otelcol_exporter_sent_spans`
- `otelcol_exporter_send_failed_spans`
- `by (exporter)`

### メトリクスパイプラインの出力に関するメトリクス

- `otelcol_exporter_sent_metric_points`
- `otelcol_exporter_send_failed_metric_points`
- `by (exporter)`

### Prometheusのスクレイピングに関するメトリクス

- `scrape_samples_scraped`
- `by (job)`

## ダッシュボード

Grafana UIにアクセスし、画面左側のブラウズアイコンから**OpenTelemetry Collector Data Flow** ダッシュボードを選択することで、ダッシュボードにアクセスできます。

![OpenTelemetry Collector Data Flow dashboard](otelcol-data-flow-dashboard.png)

ダッシュボードは4つのセクションから構成されています。

1. プロセスメトリクス
2. トレースパイプライン
3. メトリクスパイプライン
4. Prometheusスクレイピング

セクション 2, 3, 4 は上述のメトリクスを使用してデータフロー全体を示しています。さらに、データフローを理解するために、各パイプラインのエクスポート比率が計算されています。

### エクスポート比率

エクスポート比率は、基本的にレシーバーメトリクスとエクスポーターメトリクスの比率です。上記のダッシュボードのスクリーンショットで、メトリクスのエクスポート比率が受信したメトリクスよりもはるかに高いことに気づくでしょう。これは、デモアプリケーションがスパンメトリクスを生成するように設定されているためです。スパンメトリクスは、概要図に示されているように、コレクター内のスパンからメトリクスを生成するプロセッサーです。

### プロセスメトリクス

非常に限定的ではありますが、有益なプロセスメトリクスがダッシュボードに追加されています。たとえば、再起動時やそれに類似した状況で、システム上で1を超える数のotelcolインスタンスが実行されているのを観測することがあるかもしれません。これは、データフローのスパイクを理解する際に役立つ可能性があります。

![OpenTelemetry Collector Process Metrics](otelcol-dashboard-process-metrics.png)
