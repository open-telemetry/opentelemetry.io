---
title: テレメトリー機能
linkTitle: テレメトリー機能
aliases: [demo_features, features]
default_lang_commit: 3560c03d5cbe845c6189e6e30441434c7760eca0
drifted_from_default: true
---

## OpenTelemetry {#opentelemetry}

- **[OpenTelemetry トレース](/docs/concepts/signals/traces/)**：すべてのサービスは、OpenTelemetry が提供する計装ライブラリを使用して計装されています。
- **[OpenTelemetry メトリクス](/docs/concepts/signals/metrics/)**：一部のサービスは、OpenTelemetry が提供する計装ライブラリを使用して計装されています。
  関連する SDK がリリースされ次第、さらに追加される予定です。
- **[OpenTelemetry ログ](/docs/concepts/signals/logs/)**：一部のサービスは、OpenTelemetry が提供する計装ライブラリを使用して計装されています。
  関連する SDK がリリースされ次第、さらに追加される予定です。
- **[OpenTelemetry Collector](/docs/collector/)**：すべてのサービスは計装され、生成されたトレースとメトリクスを gRPC 経由で OpenTelemetry Collector に送信します。
  受信したトレースはログと Jaeger にエクスポートされ、受信したメトリクスとエグザンプラーはログと Prometheus にエクスポートされます。
- **[OpAMP](/docs/specs/opamp/)**：OpenTelemetry Collector は、正常性、バージョン、属性、有効な設定をデモの OpAMP サーバーに報告します。
  報告されたステータスは OpAMP UI（<http://localhost:8080/opamp/>）で確認できます。
- **SDK 自己オブザーバビリティ**：一部のサービスは、OpenTelemetry SDK 自体が出力する実験的な `otel.sdk.*` 内部メトリクスをオプトインしており、[自己オブザーバビリティダッシュボード](/docs/demo/self-observability-dashboard/)で可視化されます。

## オブザーバビリティソリューション {#observability-solutions}

- **[Grafana](https://github.com/grafana/grafana)**：すべてのメトリクスダッシュボードは Grafana に保存されています。
- **[Jaeger](https://www.jaegertracing.io/)**：生成されたすべてのトレースは Jaeger に送信されています。
- **[OpenSearch](https://opensearch.org/)**：生成されたすべてのログは Data Prepper に送信されます。
  OpenSearch はサービスからのログデータを集約するために使用されます。
- **[Prometheus](https://prometheus.io/)**：生成されたすべてのメトリクスとエグザンプラーは Prometheus によって収集されます。

## 環境 {#environments}

- **[Docker](https://docs.docker.com)**：このフォークされたサンプルは Docker で実行できます。
- **[Kubernetes](https://kubernetes.io/)**：このアプリケーションは Helm チャートを使用して Kubernetes 上で実行するように設計されています（ローカルおよびクラウドの両方）。

## プロトコル {#protocols}

- **[gRPC](https://grpc.io/)**：マイクロサービスは互いに通信するために大量の gRPC 呼び出しを使用します。
- **[HTTP](https://www.rfc-editor.org/rfc/rfc9110.html)**：マイクロサービスは gRPC が利用できないか十分にサポートされていない場合に HTTP を使用します。

## その他のコンポーネント {#other-components}

- **[Envoy](https://www.envoyproxy.io/)**：Envoy は、フロントエンドやフィーチャーフラグサービスなどのユーザー向け Web インターフェイスのリバースプロキシとして使用されます。
- **[k6](https://k6.io)**：合成負荷生成ツールを使用してウェブサイト上で現実的な使用パターンを作成するバックグラウンドジョブです。
- **[OpenFeature](https://openfeature.dev)**：アプリケーション内の機能の有効化と無効化を可能にするフィーチャーフラグ API および SDK です。
- **[flagd](https://flagd.dev)**：デモアプリケーション内のフィーチャーフラグを管理するために使用されるフィーチャーフラグデーモンです。
