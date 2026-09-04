---
title: レジストリへの追加
linkTitle: 追加
description: レジストリにエントリーを追加する方法。
default_lang_commit: d18938b8ff4dfb2ed696f976815225f7ad8ed2a3
cSpell:ignore: zpages
---

{{% include freeze-notice.md %}}

OpenTelemetry のインテグレーションをメンテナンスまたはコントリビュートしていますか？
あなたのプロジェクトを[レジストリ](../)で紹介したいと考えています！

プロジェクトを追加するには、[プルリクエスト][pull request]を送信してください。
[data/registry][] にプロジェクトのデータファイルを作成する必要があります。
テンプレートとして [registry-entry.yml][] を使用してください。

プロジェクト名と説明が[マーケティングガイドライン][marketing guidelines]に準拠し、Linux Foundation のブランディングおよび[商標使用ガイドライン][trademark usage guidelines]に沿っていることを確認してください。

## レジストリタイプ {#registry-types}

プロジェクトをレジストリに追加する際、`registryType` を指定する必要があります。
このフィールドは、プロジェクトと OpenTelemetry との関係に基づいてプロジェクトを分類します。
以下に指定可能な値とその定義を示します。

### `application integration` {#application-integration}

**用途**: OpenTelemetry がネイティブに統合（組み込みサポート）されており、外部プラグインや計装ライブラリを必要としないアプリケーションまたはサービス。

**例**: ネイティブアプリケーションインテグレーションの一覧は[インテグレーション](/ecosystem/integrations/)ページを参照してください。

> [!NOTE]
>
> これは商用/プロプライエタリライセンスが許可される唯一のレジストリタイプです。

### `api` {#api}

**用途**: 言語向けの OpenTelemetry API を実装するパッケージ。
計装されたコードやライブラリが依存するインターフェイスおよび no-op 実装であり、SDK には依存しません。

**例**: Ruby の `opentelemetry-api`、`opentelemetry-metrics-api`、`opentelemetry-logs-api` gem。

### `connector` {#connector}

**用途**: OpenTelemetry Collector のコネクターコンポーネント。
一方のパイプラインのエクスポーターかつもう一方のレシーバーとして動作することで、2つのパイプラインを接続し、シグナルタイプ間の変換も可能です。

**例**: カウントコネクター、スパンからメトリクスへのコネクター、フェイルオーバーコネクター。

### `core` {#core}

**用途**: OpenTelemetry プロジェクトのコアコンポーネント専用。
サードパーティコンポーネントや OpenTelemetry プロジェクト以外のコンポーネントには適用されません。

### `exporter` {#exporter}

**用途**: OpenTelemetry Collector のエクスポーターコンポーネント、または言語固有の SDK 内のエクスポーターライブラリ。

**例**: OTLP エクスポーター、Prometheus エクスポーター、またはテレメトリーデータを外部システムに送信するコンポーネント。

**注意**: テレメトリーデータをエクスポートするサードパーティコンポーネントには適用されません。

### `extension` {#extension}

**用途**: OpenTelemetry の機能を拡張する Collector または SDK のエクステンション。

**例**: 認証、設定ソース/プロバイダー、サービスディスカバリ、ヘルスチェック/pprof/zpages、または Collector/SDK の動作を拡張するその他のコンポーネント。

### `id-generator` {#id-generator}

**用途**: トレース ID およびスパン ID の生成方法をカスタマイズする SDK コンポーネント。

**例**: AWS X-Ray 互換の ID ジェネレーター。

### `instrumentation` {#instrumentation}

**用途**: 特定のライブラリ/フレームワーク向けの計装ライブラリまたはネイティブ計装。

**例**: HTTP 計装、データベース計装、フレームワーク固有の計装、または該当する場合は自動計装エージェント。

### `log-bridge` {#log-bridge}

**用途**: 既存のロギングフレームワーク/API を OpenTelemetry のロギングに接続する言語固有のアダプター。
アプリケーションが使い慣れたロギング API を通じて OTel ログを出力できるようにします。

**例**: Java SLF4J/Log4j/Logback、Python logging、JavaScript Winston/Pino、Go log/slog/zap などのフレームワーク向けのブリッジ/ハンドラー/アペンダー。

### `metric-producer` {#metric-producer}

**用途**: サードパーティのソースからのメトリクスを SDK メトリクスリーダーにブリッジする SDK コンポーネント。

### `processor` {#processor}

**用途**: OpenTelemetry Collector のプロセッサーコンポーネント。

**例**: バッチプロセッサー、属性プロセッサー、サンプリングプロセッサー、または Collector パイプライン内でテレメトリーデータを処理するコンポーネント。

### `propagator` {#propagator}

**用途**: 特定のワイヤーフォーマットでプロセス境界を越えてトレースコンテキストとバゲージを伝搬するコンテキストプロパゲーター。

**例**: B3、Jaeger、または AWS X-Ray プロパゲーター。

### `provider` {#provider}

**用途**: OpenTelemetry Collector のプロバイダーコンポーネント。

**例**: 設定プロバイダー、クレデンシャルプロバイダー、または Collector にリソースや設定を提供するコンポーネント。

### `receiver` {#receiver}

**用途**: OpenTelemetry Collector のレシーバーコンポーネント。

**例**: OTLP レシーバー、Prometheus レシーバー、または外部ソースからテレメトリーデータを受信するコンポーネント。

> [!NOTE]
>
> OpenTelemetry のテレメトリーを受信するサードパーティコンポーネントには適用されません。

### `resource-detector` {#resource-detector}

**用途**: 言語固有の SDK 向けのリソースディテクター。

**例**: AWS リソースディテクター、GCP リソースディテクター、またはリソース情報を自動検出してテレメトリーに付与するコンポーネント。

### `sampler` {#sampler}

**用途**: どのスパンを記録・エクスポートするかを決定する SDK サンプラー。

**例**: AWS X-Ray リモートサンプラーまたはルールベースのサンプラー。

### `sdk` {#sdk}

**用途**: 言語向けの OpenTelemetry SDK を実装するパッケージ。

**例**: Ruby の `opentelemetry-sdk`、`opentelemetry-metrics-sdk`、`opentelemetry-logs-sdk` gem。

### `semantic-convention` {#semantic-convention}

**用途**: 言語向けのセマンティック規約定数を提供するパッケージ。

**例**: Ruby の `opentelemetry-semantic_conventions` gem。

### `utilities` {#utilities}

**用途**: OpenTelemetry を操作するために使用できるその他のツール。

**例**: テストユーティリティ、デバッグツール、移行ツール、または OpenTelemetry の利用を支援するヘルパーライブラリ。

[data/registry]: https://github.com/open-telemetry/opentelemetry.io/tree/main/data/registry
[pull request]: https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/creating-a-pull-request
[registry-entry.yml]: https://github.com/open-telemetry/opentelemetry.io/tree/main/templates/registry-entry.yml
[marketing guidelines]: /community/marketing-guidelines/
[trademark usage guidelines]: https://www.linuxfoundation.org/legal/trademark-usage
