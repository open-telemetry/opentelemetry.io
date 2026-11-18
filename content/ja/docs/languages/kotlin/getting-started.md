---
title: はじめに
description: OpenTelemetry Kotlin SDK を使い始める
weight: 10
default_lang_commit: ead94c1362193347d11dbadf1d6a5bb570b7618a
cSpell:ignore: jetbrains
---

OpenTelemetry Kotlin は、[OpenTelemetry 仕様](/docs/specs/otel/)の [Kotlin Multiplatform](https://kotlinlang.org/multiplatform/) 実装を提供します。

## OpenTelemetry Kotlin SDK {#opentelemetry-kotlin-sdk}

### サポートされるプラットフォーム {#supported-platforms}

OpenTelemetry Kotlin は現在 Kotlin 2.0 以上が必要です。
現在サポートされているプラットフォームとその前提条件は以下のとおりです。

| プラットフォーム | 前提条件    |
| ---------------- | ----------- |
| Android          | minSdk >=21 |
| JVM              | JDK >= 11   |
| iOS              | 16.0        |
| JavaScript       | ES5         |

> [!NOTE]
>
> iOS および JavaScript ターゲットの場合、プロジェクトは OpenTelemetry Kotlin がビルドされたバージョンと同等以上の Kotlin バージョンを使用する必要があります。
> 詳細は [KT-76131](https://youtrack.jetbrains.com/issue/KT-76131) を参照してください。

### API の安定性 {#api-stability}

API は現在、予告なく破壊的変更が加えられる可能性があり、ほとんどのシンボルはオプトインが必要です。
呼び出し箇所ごとに `@OptIn(ExperimentalApi::class)` を追加することで、個別にオプトインできます。

あるいは、Kotlin のコンパイラ引数を変更することで、モジュールまたはプロジェクト全体でオプトインすることもできます。

```kotlin
kotlin.compilerOptions {
    optIn.add("io.opentelemetry.kotlin.ExperimentalApi")
}
```

### サポートされるモード {#supported-modes}

OpenTelemetry Kotlin の API は2つのモードで動作します。

- 通常モード。Kotlin Multiplatform（KMP）実装でテレメトリーを収集します。
  すべてのターゲットで利用可能です。
- 互換モード。[OpenTelemetry Java SDK](https://github.com/open-telemetry/opentelemetry-java) のファサードとして機能します。
  JVM/Android ターゲットのみで利用可能です。

## OpenTelemetry Kotlin のインストール {#install-opentelemetry-kotlin}

まず、以下の通常モードまたは互換モードのガイドのどちらに従うかを選択してください。

最新バージョンは [GitHub リリースページ](https://github.com/open-telemetry/opentelemetry-kotlin/releases)で確認できます。

### 通常モードを使用する {#use-regular-mode}

1. SDK を初期化するモジュールの `build.gradle` に以下の依存関係を追加します。

```kotlin
dependencies {
    val otelKotlinVersion = "<replace-with-latest-version>"
    implementation("io.opentelemetry.kotlin:core:$otelKotlinVersion")
    implementation("io.opentelemetry.kotlin:implementation:$otelKotlinVersion")
}
```

1. アプリケーションのライフサイクルの早い段階で SDK を初期化します。

```kotlin
val otelKotlin: OpenTelemetry = createOpenTelemetry {
    // ここで SDK を設定する
}
```

1. アプリで Kotlin API を使用します。

### 互換モードを使用する {#use-compatibility-mode}

互換モードでは、内部的に OpenTelemetry Java SDK を使用する Kotlin API を利用できます。
これは、すでに Java 実装を使用している場合や、Kotlin 実装を使用したくない場合に役立ちます。

1. SDK を初期化するモジュールの `build.gradle` に以下の依存関係を追加します。

```kotlin
dependencies {
    val otelKotlinVersion = "<replace-with-latest-version>"
    implementation("io.opentelemetry.kotlin:core:$otelKotlinVersion")
    implementation("io.opentelemetry.kotlin:compat:$otelKotlinVersion")
}
```

1. 既存の [OpenTelemetry Java](https://github.com/open-telemetry/opentelemetry-java) インスタンスをラップします。
   これには、モジュールが `io.opentelemetry:opentelemetry-sdk` に依存する必要があります。

```kotlin
val otelJava = io.opentelemetry.sdk.OpenTelemetrySdk.builder().build()
val otelKotlin: OpenTelemetry = otelJava.toOtelKotlinApi()

// あるいは、内部的に opentelemetry-java を使用するインスタンスを作成する
val otelKotlin: OpenTelemetry = createCompatOpenTelemetry {
    // ここで SDK を設定する
}
```

1. アプリで Java API のかわりに、または Java API と並行して Kotlin API を使用します。

### 他のモジュールのセットアップ {#setup-other-modules}

次に、計装したいすべてのモジュールの `build.gradle` に `api` および `noop` の依存関係を追加します。

```kotlin
dependencies {
    val otelKotlinVersion = "<replace-with-latest-version>"
    implementation("io.opentelemetry.kotlin:api:$otelKotlinVersion")
    implementation("io.opentelemetry.kotlin:noop:$otelKotlinVersion")
}
```

> [!NOTE]
>
> SDK を初期化する必要がない限り、モジュールに `core`、`compat`、または `implementation` の依存関係を追加しないでください。
> これにより、OpenTelemetry の[計装 API](/docs/specs/otel/overview/#api) のみに対して計装を記述できます。

#### アプリをどのように計装できますか？ {#how-can-i-instrument-my-app}

ログとトレースを出力する最小限の例を以下に示します。

```kotlin
fun example(otel: OpenTelemetry = NoopOpenTelemetry) {
    // ログを出力する
    val logger = otel.loggerProvider.getLogger("my_logger")
    logger.emit(body = "Hello, World!")

    // スパンを開始して終了する
    val tracer = otel.tracerProvider.getTracer("my_tracer")
    tracer.startSpan("my_span").end()
}
```

テレメトリーを出力するには、no-op ではなく `OpenTelemetry` の実インスタンスをパラメーターとして渡します。
ライブラリの作者にとって、このパターンはライブラリの利用者がライブラリからのテレメトリー収集にオプトインできるため、非常に便利です。

### 動作確認 {#check-that-it-works}

バックエンドをセットアップする前に、テレメトリーを標準出力に表示することでキャプチャされていることを確認できます。
SDK を標準出力エクスポーターで設定します。

```kotlin
val otel: OpenTelemetry = createOpenTelemetry {
    serviceName = "my-service"
    tracerProvider {
        export {
            simpleSpanProcessor(stdoutSpanExporter())
        }
    }
    loggerProvider {
        export {
            simpleLogRecordProcessor(stdoutLogRecordExporter())
        }
    }
}
example(otel)
```

プロセッサーは現在テレメトリーを非同期でエクスポートします。
`main` 関数のような短命なプロセスでは、テレメトリーが配信されるまでブロックする必要がある場合があります。

```kotlin
runBlocking {
    (otel as? OpenTelemetrySdk)?.shutdown()
}
```

すると、以下のような出力が表示されるはずです。

```text
LogRecord [UNKNOWN]
  Body: Hello, World!
  ...
Span: my_span [INTERNAL]
  TraceId: 9f2ac10dc87ab58aa6b0b5eed29af32d
  ...
```

### OpenTelemetry Collector へのエクスポート {#export-to-an-opentelemetry-collector}

最後のステップとして、[OTLP/HTTP](/docs/specs/otel/protocol/) を介して OpenTelemetry Collector、または OTLP を受け入れるバックエンドへのテレメトリーエクスポートを設定する必要があります。
SDK を初期化したモジュールに `exporters-otlp` の依存関係を追加します。

```kotlin
dependencies {
    val otelKotlinVersion = "<replace-with-latest-version>"
    implementation("io.opentelemetry.kotlin:exporters-otlp:$otelKotlinVersion")
}
```

次に、バッチプロセッサーを使用して OTLP エクスポーターを設定します。

```kotlin
val otel: OpenTelemetry = createOpenTelemetry {
    serviceName = "my-service"
    tracerProvider {
        export {
            batchSpanProcessor(
                otlpHttpSpanExporter {
                    endpoint = "http://localhost:4318"
                }
            )
        }
    }
    loggerProvider {
        export {
            batchLogRecordProcessor(
                otlpHttpLogRecordExporter {
                    endpoint = "http://localhost:4318"
                }
            )
        }
    }
}
```

`http://localhost:4318` はデフォルトのエンドポイントであるため、コレクターをローカルで実行している場合は `endpoint` を省略できます。
Android エミュレーターはホストマシンに `http://10.0.2.2:4318` で接続するため、アプリの[ネットワークセキュリティ設定](https://developer.android.com/privacy-and-security/security-config)でそのアドレスへの平文トラフィックを許可する必要があります。

---

おめでとうございます！
OpenTelemetry Kotlin SDK のインストール手順が完了しました。
