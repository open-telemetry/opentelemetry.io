---
title: 仕様ステータスの概要
linkTitle: ステータス
aliases: [otel/status]
default_lang_commit: 9a2a3eb28eab41ee55ec9c95255db86beab61f6c
weight: -10
---

OpenTelemetryは、シグナルごとに開発されています。
シグナルの例として、トレース、メトリクス、バゲージ、ロギングがあります。
シグナルは、分散システム全体でデータを相関させるための共有メカニズムであるコンテキスト伝搬に基づいて構築されています。

各シグナルは、4つの[コアコンポーネント](/docs/concepts/components/)で構成されています。

- API
- SDK
- [OpenTelemetryプロトコル](/docs/specs/otlp/) (OTLP)
- [コレクター](/docs/collector/)

シグナルには、プラグインと計装のエコスステムであるcontribコンポーネントも存在します。
すべての計装は同じセマンティック規則を共有しており、HTTPリクエストなどの一般的な操作を監視する際に同じデータを生成することを保証しています。

シグナルとコンポーネントの詳細については、OTel仕様の[概要](/docs/specs/otel/overview/)を参照してください。

## コンポーネントのライフサイクル {#component-lifecycle}

コンポーネントは、Draft、Experimental、Stable、Deprecated、Removedの開発サイクルに従います。

- **Draft** コンポーネントは設計中であり、仕様には追加されていません。
- **Experimental** コンポーネントはリリースされており、ベータテストが可能です。
- **Stable** コンポーネントは後方互換性があり、長期サポートの対象となります。
- **Deprecated** コンポーネントは安定していますが、最終的には削除される可能性があります。

ライフサイクルと長期サポートの完全な定義については、[バージョニングと安定性](/docs/specs/otel/versioning-and-stability/)を参照してください。

## 現在のステータス {#current-status}

以下は、現在利用可能なシグナルの高レベルなステータスレポートです。
OpenTelemetryクライアントは共通の仕様に準拠していますが、それぞれ独立して開発されている点に注意してください。

各クライアントの現在のステータスは、[GitHubリポジトリ](https://github.com/open-telemetry)のREADMEで確認することをお勧めします。
特定の機能に対するクライアントのサポート状況は、[仕様準拠の表](https://github.com/open-telemetry/opentelemetry-specification/blob/main/spec-compliance-matrix.md)で確認できます。

次の各セクションでは、**コレクター**のステータスは**プロトコル**のステータスと同じであることに注意してください。

### トレーシング {#tracing}

- [仕様][tracing]
- {{% spec_status "API" "otel/trace/api" %}}
- {{% spec_status "SDK" "otel/trace/sdk" %}}
- {{% spec_status "プロトコル" "otlp" "/document-status.*for.*trace" %}}
- 注意事項:
  - トレーシングの仕様は現在完全に安定しており、長期サポートの対象となっています。
  - トレーシングの仕様は拡張可能ですが、後方互換性のある方法のみです。
  - OpenTelemetryクライアントは、トレーシングの実装が完了するとv1.0にバージョニングされます。

### メトリクス {#metrics}

- [仕様][metrics]
- {{% spec_status "API" "otel/metrics/api" %}}
- {{% spec_status "SDK" "otel/metrics/sdk" %}}
- {{% spec_status "プロトコル" "otlp" "/document-status.*for.*metric" %}}
- 注意事項:
  - OpenTelemetryのメトリクスは現在アクティブに開発中です。
  - データモデルはOTLPプロトコルの一部として安定してリリースされています。
  - 実験的なメトリクスパイプラインのサポートがコレクターで利用可能です。
  - PrometheusのCollectorサポートは、Prometheusコミュニティと協力して開発中です。

### バゲージ {#baggage}

- [仕様][baggage]
- {{% spec_status "API" "otel/baggage/api" %}}
- **SDK:** stable
- **プロトコル:** N/A
- 注意事項:
  - OpenTelemetryのバゲージは現在完全に安定しています。
  - バゲージはオブザーバビリティツールではなく、トランザクションに任意のキーと値を付与し、ダウンストリームのサービスがそれらにアクセスできるようにするシステムです。
    そのため、バゲージにはOTLPやコレクターのコンポーネントは存在しません。

### ロギング {#logging}

- [仕様][logging]
- {{% spec_status "Bridge API" "otel/logs/api" %}}
- {{% spec_status "SDK" "otel/logs/sdk" %}}
- {{% spec_status "プロトコル" "otlp" "/document-status.*for.*log" %}}
- 注意事項:
  - [ログデータモデル][logs data model]は、OpenTelemetryプロトコルの一部としてリリースされています。
  - StanzaのOpenTelemetryプロジェクトへの寄贈により、多くのデータ形式のログ処理がコレクターに追加されました。
  - OpenTelemetry Log Bridge APIを使用して、既存のログフレームワークからOpenTelemetryにログをブリッジするアペンダーの作成できます。
    Log Bridge APIは、エンドユーザーが直接呼び出すことを想定していません。
    ログアペンダーは現在多くの言語で開発中です。
  - OpenTelemetry Log SDKは、Log Bridge APIの標準的な実装です。
    アプリケーションはSDKを構成して、ログの処理とエクスポート方法（例、OTLPの使用）を指定します。
  - OpenTelemetry Log Bridge APIは、[イベントセマンティック規約][event semantic conventions]に準拠したログレコードを発行するための実験的なサポートを含んでいます。

### プロファイル {#profiles}

- [仕様][profiles]
- {{% spec_status "プロトコル" "otlp" "/document-status.*for.*profiles" %}}

[baggage]: /docs/specs/otel/baggage/
[event semantic conventions]: /docs/specs/semconv/general/events/
[logging]: /docs/specs/otel/logs/
[logs data model]: /docs/specs/otel/logs/data-model/
[metrics]: /docs/specs/otel/metrics/
[profiles]: /docs/specs/otel/profiles/
[tracing]: /docs/specs/otel/trace/
