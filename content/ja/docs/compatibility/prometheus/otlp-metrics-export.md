---
title: Prometheus への OTLP メトリクスエクスポート
linkTitle: OTLP メトリクスエクスポート
default_lang_commit: 2b0cbe123f65c6d3d6271fa5c0692fc45c574597
cSpell:ignore: uuidgen
---

## はじめに {#introduction}

Prometheus はプルベースの監視向けに設計・最適化されており、ターゲットを検出し、メトリクスエンドポイントを定期的にスクレイプします。
このモデルはアーキテクチャの中核であり、サービスディスカバリや一貫したターゲットベースの収集などの機能をサポートしています。

OpenTelemetry の普及に伴い、新しいバージョンの Prometheus では OTLP によるプッシュベースのメトリクス受信がサポートされるようになりました。
このセットアップでは、OpenTelemetry SDK が OTLP over HTTP を使用してメトリクスをエクスポートし、Prometheus はメトリクスをスクレイプするかわりに OTLP レシーバーとして動作します。
このアプローチは、シンプルなセットアップ、実験、またはローカル開発環境で使用できます。
ただし、OpenTelemetry を使用した本番デプロイメントでは、仲介として [OpenTelemetry Collector](/docs/collector/#when-to-use-a-collector) を使用することを強く推奨します。

このガイドでは、OpenTelemetry SDK から Prometheus の OTLP エンドポイントへの直接的な OTLP メトリクスエクスポートの設定方法を説明します。
必要な環境変数、エクスポーターの設定、およびサービスの識別、エクスポート間隔、運用上のトレードオフなどの重要な考慮事項について説明します。

## 前提条件 {#prerequisite}

始める前に、以下の要件を満たしていることを確認してください。

- Prometheus をセットアップします。
  [この Prometheus ガイドの prometheus.yml 設定例](https://prometheus.io/docs/guides/opentelemetry/#configuring-prometheus)に従ってください。
- [OTLP レシーバーを有効にする](https://prometheus.io/docs/guides/opentelemetry/#enable-the-otlp-receiver)

Prometheus のセットアップが完了したら、アプリケーションが OTLP インジェスションエンドポイントに直接メトリクスを送信するよう設定できます。

### 環境変数を使用する {#use-environment-variables}

OpenTelemetry SDK と計装ライブラリは、[標準の環境変数](/docs/languages/sdk-configuration/)で設定できます。
アプリケーションを起動する前に環境変数を設定してください。
以下の OpenTelemetry 変数は、localhost 上の Prometheus サーバーに OpenTelemetry メトリクスを送信するために必要です。

```bash
export OTEL_EXPORTER_OTLP_PROTOCOL=http/protobuf
export OTEL_EXPORTER_OTLP_METRICS_ENDPOINT=http://localhost:9090/api/v1/otlp
```

メトリクスのみが必要な場合は、Prometheus を使用する際にトレースとログをオフにします。

```bash
export OTEL_TRACES_EXPORTER=none
export OTEL_LOGS_EXPORTER=none
```

OpenTelemetry メトリクスのデフォルトのプッシュ間隔は60秒です。
これは監視要件に応じて調整できます。
たとえば、15秒の間隔は、ネットワークと処理のオーバーヘッドが増加するかわりに、より応答性の高いメトリクスとより迅速なアラートを提供します。

```bash
export OTEL_METRIC_EXPORT_INTERVAL=15000
```

計装ライブラリが `service.name` と `service.instance.id` をすぐに提供しない場合は、これらを設定することを強く推奨します。
これらの属性がないと、サービスの確実な識別やインスタンスの区別が困難になり、デバッグや集約が大幅に難しくなります。
以下の例は、`uuidgen` コマンドがシステムで利用可能であることを前提としています。

```bash
export OTEL_SERVICE_NAME="my-example-service"
export OTEL_RESOURCE_ATTRIBUTES="service.instance.id=$(uuidgen)"
```

> [!NOTE]
>
> `service.instance.id` は各インスタンスで一意であり、リソース属性が変更されるたびに新しい `service.instance.id` が生成されるようにしてください。
> [推奨される方法](/docs/specs/semconv/resource/service/#service-instance)は、インスタンスの起動ごとに新しい UUID を生成することです。

### テレメトリーを設定する {#configure-telemetry}

[言語 SDK のドキュメント](/docs/languages/_index.md)の OTLP セットアップと同じ `exporter` と `reader` を使用するように OpenTelemetry の設定を更新します。
環境変数が正しくセットアップされロードされていれば、OpenTelemetry SDK はそれらを自動的に読み取ります。
