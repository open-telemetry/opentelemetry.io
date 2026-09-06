---
title: Android
description: >-
  Android プラットフォーム上で動作するアプリで OpenTelemetry を使う
weight: 10
vers:
  ot-android: 1.6.0
default_lang_commit: 60d50174e01d221f65af4b69ad1ae946fbc16ec8
drifted_from_default: true
cSpell:ignore: inactivity
---

OpenTelemetry Android は、ネイティブ Android アプリケーションにオブザーバビリティを提供します。
[OpenTelemetry Java](/docs/languages/java/) エコシステムの上に構築されており、モバイル環境に合わせた自動計装、リアルユーザーモニタリング（RUM）、手動計装の機能を提供します。

## 機能 {#features}

OpenTelemetry Android には以下の主要な機能があります。

- **自動計装**: 一般的な Android パターンに対応する組み込みモジュール:
  - Activity ライフサイクル
  - Fragment ライフサイクル
  - ANR（Application Not Responding）検出
  - クラッシュレポート
  - ネットワーク変更検出
  - 遅い/フリーズしたフレームの描画検出
  - 起動タイミング
  - 画面の向き
  - View クリックイベント
- **セッション管理**: 設定可能な非アクティブタイムアウトと最大セッション有効期間を使用してユーザーセッションを追跡します。
- **オフラインバッファリング**: デバイスがオフラインのときにテレメトリーデータをバッファリングするためのディスク永続化機能で、ネットワーク障害中のデータ損失を防ぎます。
- **属性のリダクション**: プライバシーコンプライアンスのため、エクスポート前にスパン属性をリダクションまたは変更する機能です。

## はじめに {#getting-started}

### 前提条件 {#prerequisites}

- Android SDK 21（Lollipop）以降
- Kotlin を使用した Gradle プロジェクト（Java でも可能な場合があります）

### Gradle のセットアップ {#gradle-setup}

アプリレベルの `build.gradle.kts` ファイルに OpenTelemetry Android Agent の依存関係を追加します。
バージョン管理には Bill of Materials（BOM）を使用します。

```kotlin
dependencies {
    implementation(platform("io.opentelemetry.android:opentelemetry-android-bom:{{% param vers.ot-android %}}"))
    implementation("io.opentelemetry.android:android-agent")
}
```

> [!NOTE]
>
> 最新バージョンについては
> [OpenTelemetry Android releases](https://github.com/open-telemetry/opentelemetry-android/releases)
> を確認してください。

### エージェントの初期化 {#initialize-the-agent}

`Application` クラスの `onCreate()` メソッドで OpenTelemetry を初期化します。

```kotlin
class MyApplication : Application() {
    lateinit var openTelemetryRum: OpenTelemetryRum

    override fun onCreate() {
        super.onCreate()
        openTelemetryRum = initializeOpenTelemetry(this)
    }
}

private fun initializeOpenTelemetry(context: Context): OpenTelemetryRum =
    OpenTelemetryRumInitializer.initialize(
        context = context,
        configuration = {
            httpExport {
                baseUrl = "https://your-collector-endpoint:4318"
                baseHeaders = mapOf("Authorization" to "Bearer <token>")
            }
            instrumentations {
                // すべての計装はデフォルトで有効になっています。
                // 必要に応じて個別に無効化できます:
                slowRendering { enabled(false) }
            }
            session {
                backgroundInactivityTimeout = 15.minutes
                maxLifetime = 4.days
            }
        }
    )
```

## 設定 {#configuration}

OpenTelemetry Android は、上記の初期化の例に示したように、設定に Kotlin DSL を使用します。
以下の表では、利用可能な設定オプションについて説明します。

### 設定オプション {#configuration-options}

| ブロック                                  | 説明                                                         |
| ----------------------------------------- | ------------------------------------------------------------ |
| `httpExport { baseUrl }`                  | テレメトリーをエクスポートするための OTLP エンドポイント URL |
| `httpExport { baseHeaders }`              | エクスポートリクエストに含めるカスタムヘッダー               |
| `globalAttributes`                        | すべてのテレメトリーに追加される属性                         |
| `session { backgroundInactivityTimeout }` | 新しいセッションを開始するまでの非アクティブタイムアウト     |
| `session { maxLifetime }`                 | セッションの最大有効期間                                     |
| `instrumentations`                        | 個別の自動計装モジュールを設定                               |

## 自動計装 {#automatic-instrumentation}

OpenTelemetry Android は、有効または無効にできる自動計装モジュールを提供します。
各計装の詳細情報（出力されるテレメトリーや設定オプションなど）については、リンク先のドキュメントを参照してください。

### Activity ライフサイクル {#activity-lifecycle}

Activity ライフサイクルイベント（`onCreate`、`onStart`、`onResume`、`onPause`、`onStop`、`onDestroy`）のスパンを自動的にキャプチャします。
[Activity instrumentation](https://github.com/open-telemetry/opentelemetry-android/blob/main/instrumentation/activity/README.md) を参照してください。

### Fragment ライフサイクル {#fragment-lifecycle}

Fragment ライフサイクルイベントのスパンをキャプチャします。
シングルアクティビティアーキテクチャでのナビゲーション追跡に役立ちます。
[Fragment instrumentation](https://github.com/open-telemetry/opentelemetry-android/blob/main/instrumentation/fragment/README.md) を参照してください。

### ANR 検出 {#anr-detection}

Application Not Responding（ANR）状態を検出し、スパンとして報告します。
UI スレッドのブロッキング問題の特定に役立ちます。
[ANR instrumentation](https://github.com/open-telemetry/opentelemetry-android/blob/main/instrumentation/anr/README.md) を参照してください。

### クラッシュレポート {#crash-reporting}

未処理の例外をキャプチャし、スタックトレースとともに報告します。
クラッシュをユーザーセッションやトレースと関連付けることができます。
[Crash instrumentation](https://github.com/open-telemetry/opentelemetry-android/blob/main/instrumentation/crash/README.md) を参照してください。

### ネットワーク監視 {#network-monitoring}

ネットワーク状態の変化を検出し、テレメトリーに接続情報を追加します。
エラー発生時のネットワーク状況を把握するのに役立ちます。
[Network instrumentation](https://github.com/open-telemetry/opentelemetry-android/blob/main/instrumentation/network/README.md) を参照してください。

### 遅いフレームとフリーズしたフレーム {#slow-and-frozen-frames}

フレーム描画のパフォーマンスを監視し、遅い描画（16ミリ秒超）やフリーズしたフレーム（700ミリ秒超）を報告して、UI パフォーマンスのボトルネックの特定に役立てます。
[Slow rendering instrumentation](https://github.com/open-telemetry/opentelemetry-android/blob/main/instrumentation/slowrendering/README.md) を参照してください。

## 手動計装 {#manual-instrumentation}

手動計装のために OpenTelemetry API にアクセスします。

```kotlin
val openTelemetry = openTelemetryRum.openTelemetry
val tracer = openTelemetry.getTracer("com.example.myapp")

val span = tracer.spanBuilder("my-operation")
    .startSpan()

try {
    span.makeCurrent().use {
        // ここにコードを記述します
    }
} finally {
    span.end()
}
```

## HTTP クライアント計装 {#http-client-instrumentation}

OkHttp クライアントを計装してネットワークリクエストをトレースします。

```kotlin
val okHttpClient = OkHttpTelemetry.builder(openTelemetryRum.openTelemetry)
    .build()
    .newCallFactory(OkHttpClient.Builder().build())
```

## ベストプラクティス {#best-practices}

### リソースの制約 {#resource-constraints}

モバイルデバイスはリソースが限られています。
以下のベストプラクティスを考慮してください。

- **バッチエクスポート**: ネットワーク呼び出しとバッテリー消費を削減するため、バッチ処理がデフォルトで有効になっています。
- **サンプリング**: 代表的なテレメトリーを維持しながらデータ量を削減するために、サンプリング戦略を実装してください。
- **オフラインバッファリング**: 断続的な接続に対応するため、ディスク永続化がデフォルトで有効になっています。

### プライバシーに関する考慮事項 {#privacy-considerations}

- 属性のリダクションを使用して、エクスポート前に機密データを削除してください。
- テレメトリーの収集に対するユーザーの同意要件を考慮してください。
- スパン名や属性に個人を特定できる情報（PII）をキャプチャしないようにしてください。

### テスト {#testing}

エミュレーターでテストする場合、ローカルマシンの Collector にアクセスするにはホストアドレスとして `10.0.2.2` を使用します。

```kotlin
httpExport {
    baseUrl = "http://10.0.2.2:4318"
}
```

## リソース {#resources}

- [OpenTelemetry Android GitHub](https://github.com/open-telemetry/opentelemetry-android)
- [OpenTelemetry Java ドキュメント](/docs/languages/java/)
- [Android セマンティック規約](/docs/specs/semconv/registry/attributes/android/)
- [サンプルアプリケーション](https://github.com/open-telemetry/opentelemetry-android/tree/main/demo-app)

## ヘルプとフィードバック {#help-and-feedback}

質問がある場合は、[GitHub Issues](https://github.com/open-telemetry/opentelemetry-android/issues) または [CNCF Slack](https://slack.cncf.io/) の [#otel-android](https://cloud-native.slack.com/archives/C05J0T9K27Q) チャンネルからお問い合わせください。
