---
title: レジストリへの追加
linkTitle: 追加
description: レジストリにエントリーを追加する方法。
default_lang_commit: bf0881aa9c57519b487bf6b5c469ca7f188dceed
cSpell:ignore: zpages
---

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

### `instrumentation` {#instrumentation}

**用途**: 特定のライブラリ/フレームワーク向けの計装ライブラリまたはネイティブ計装。

**例**: HTTP 計装、データベース計装、フレームワーク固有の計装、または該当する場合は自動計装エージェント。

### `log-bridge` {#log-bridge}

**用途**: 既存のロギングフレームワーク/API を OpenTelemetry のロギングに接続する言語固有のアダプター。
アプリケーションが使い慣れたロギング API を通じて OTel ログを出力できるようにします。

**例**: Java SLF4J/Log4j/Logback、Python logging、JavaScript Winston/Pino、Go log/slog/zap などのフレームワーク向けのブリッジ/ハンドラー/アペンダー。

### `processor` {#processor}

**用途**: OpenTelemetry Collector のプロセッサーコンポーネント。

**例**: バッチプロセッサー、属性プロセッサー、サンプリングプロセッサー、または Collector パイプライン内でテレメトリーデータを処理するコンポーネント。

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

### `utilities` {#utilities}

**用途**: OpenTelemetry を操作するために使用できるその他のツール。

**例**: テストユーティリティ、デバッグツール、移行ツール、または OpenTelemetry の利用を支援するヘルパーライブラリ。

[data/registry]: https://github.com/open-telemetry/opentelemetry.io/tree/main/data/registry
[pull request]: https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/creating-a-pull-request
[registry-entry.yml]: https://github.com/open-telemetry/opentelemetry.io/tree/main/templates/registry-entry.yml
[marketing guidelines]: /community/marketing-guidelines/
[trademark usage guidelines]: https://www.linuxfoundation.org/legal/trademark-usage
