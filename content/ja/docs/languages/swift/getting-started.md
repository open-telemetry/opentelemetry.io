---
title: はじめに
description: 5分以内にアプリのテレメトリーを取得しましょう！
weight: 10
default_lang_commit: 4dfe6a316054df9852167b1818ee509723046db8
cSpell:ignore: rolldice
---

このページでは、Swift で OpenTelemetry を使い始める方法を説明します。

シンプルなアプリケーションを計装し、[トレース][traces]、[メトリクス][metrics]、[ログ][logs]（イベントを含む）がコンソールに出力されるようにします。

## 前提条件 {#prerequisites}

以下がローカルにインストールされていることを確認してください。

- [Swift](https://www.swift.org/)

## サンプルアプリケーション {#example-application}

以下の例では、基本的な [Vapor](https://vapor.codes) アプリケーションを使用します。
Vapor を使用していなくても問題ありません。OpenTelemetry Swift は、サーバー上で動作するものでも iOS デバイス上で動作するものでも、あらゆる Swift アプリケーションで使用できます。

その他の例については、[サンプル](/docs/languages/swift/examples/)を参照してください。

### 依存関係 {#dependencies}

まず、新しいディレクトリに以下の内容で `Package.swift` というファイルを作成します。

```swift
// swift-tools-version:6.0
import PackageDescription

let package = Package(
    name: "dice-server",
    platforms: [
        .macOS(.v13)
    ],
    dependencies: [
        .package(url: "https://github.com/vapor/vapor.git", from: "4.99.0")
    ],
    targets: [
        .executableTarget(
            name: "DiceApp",
            dependencies: [
                .product(name: "Vapor", package: "vapor")
            ],
            path: "."
        )
    ]
)
```

### HTTP サーバーの作成と起動 {#create-and-launch-an-http-server}

同じフォルダに `main.swift` というファイルを作成し、以下のコードを追加します。

```swift
import Vapor

@main
enum Entrypoint {
    static func main() async throws {
        let app = try await Application.make(.detect())
        do {
            app.get("rolldice") { req in
                let result = Int.random(in: 1..<7)
                return String(result)
            }
            try await app.execute()
            try await app.asyncShutdown()
        } catch {
            try? await app.asyncShutdown()
            throw error
        }
    }
}
```

以下のコマンドでアプリケーションをビルドして実行し、ウェブブラウザで <http://localhost:8080/rolldice> を開いて動作を確認してください。

```sh
swift run
```

続行する前に Ctrl+C でサーバーを停止してください。

## 計装 {#instrumentation}

アプリケーションに OpenTelemetry を追加するには、`Package.swift` を以下の依存関係で更新します。
バージョン 2.6.0 は以下で使用する API を提供します。

```swift
// swift-tools-version:6.0
import PackageDescription

let package = Package(
    name: "dice-server",
    platforms: [
        .macOS(.v13)
    ],
    dependencies: [
        .package(url: "https://github.com/vapor/vapor.git", from: "4.99.0"),
        .package(url: "https://github.com/open-telemetry/opentelemetry-swift-core.git", from: "2.6.0"),
        .package(url: "https://github.com/open-telemetry/opentelemetry-swift.git", from: "2.6.0"),
    ],
    targets: [
        .executableTarget(
            name: "DiceApp",
            dependencies: [
                .product(name: "Vapor", package: "vapor"),
                .product(name: "OpenTelemetryApi", package: "opentelemetry-swift-core"),
                .product(name: "OpenTelemetrySdk", package: "opentelemetry-swift-core"),
                .product(name: "StdoutExporter", package: "opentelemetry-swift-core"),
                .product(name: "ResourceExtension", package: "opentelemetry-swift"),
            ],
            path: "."
        )
    ]
)
```

`main.swift` を更新して、3つのシグナルすべてに対して stdout エクスポーターを設定します。
各 `rolldice` リクエストはサーバースパンを作成し、カウンターをインクリメントし、ログレコードを出力し、名前付きイベントを送出します。

```swift
import Vapor
import OpenTelemetryApi
import OpenTelemetrySdk
import StdoutExporter
import ResourceExtension

@main
enum Entrypoint {
    static func main() async throws {
        let resources = DefaultResources().get()
        let instrumentationScopeName = "DiceServer"
        let instrumentationScopeVersion = "semver:0.1.0"

        let spanExporter = StdoutSpanExporter()
        let spanProcessor = SimpleSpanProcessor(spanExporter: spanExporter)
        OpenTelemetry.registerTracerProvider(tracerProvider:
            TracerProviderBuilder()
                .add(spanProcessor: spanProcessor)
                .with(resource: resources)
                .build()
        )
        let tracer = OpenTelemetry.instance.tracerProvider.get(
            instrumentationName: instrumentationScopeName,
            instrumentationVersion: instrumentationScopeVersion
        )

        let metricReader = PeriodicMetricReaderBuilder(
            exporter: StdoutMetricExporter(isDebug: false)
        ).setInterval(timeInterval: 1).build()
        let meterProvider = MeterProviderSdk.builder()
            .setResource(resource: resources)
            .registerMetricReader(reader: metricReader)
            .registerView(
                selector: InstrumentSelector.builder()
                    .setMeter(name: instrumentationScopeName)
                    .build(),
                view: View.builder().build()
            )
            .build()
        OpenTelemetry.registerMeterProvider(meterProvider: meterProvider)
        let meter = meterProvider.meterBuilder(
            name: instrumentationScopeName
        ).build()
        let diceRolls = meter.counterBuilder(name: "dice.rolls").build()

        OpenTelemetry.registerLoggerProvider(loggerProvider:
            LoggerProviderBuilder()
                .with(resource: resources)
                .with(processors: [
                    SimpleLogRecordProcessor(logRecordExporter: StdoutLogExporter())
                ])
                .build()
        )
        let logger = OpenTelemetry.instance.loggerProvider.get(
            instrumentationScopeName: instrumentationScopeName
        )

        let app = try await Application.make(.detect())
        do {
            app.get("rolldice") { req in
                tracer.spanBuilder(spanName: "GET /rolldice")
                    .setSpanKind(spanKind: .server)
                    .withActiveSpan { _ in
                        let result = Int.random(in: 1..<7)
                        diceRolls.add(value: 1)
                        logger.logRecordBuilder()
                            .setSeverity(.info)
                            .setBody(.string("Rolled a dice"))
                            .emit()
                        logger.logRecordBuilder()
                            .setEventName("dice.rolled")
                            .setAttributes(["dice.value": .int(result)])
                            .emit()
                        return String(result)
                    }
            }

            try await app.execute()
            try await app.asyncShutdown()
        } catch {
            try? await app.asyncShutdown()
            throw error
        }
    }
}
```

サーバーを再度起動し、別のターミナルからリクエストを送信します。

```sh
swift run
```

```sh
curl http://localhost:8080/rolldice
```

エクスポーターはサーバーコンソールに JSON を出力します。
以下のフィールドを確認してください（ID やサイコロの値はリクエストごとに異なります）。

| シグナル   | 出力内のフィールド                                      |
| ---------- | ------------------------------------------------------- |
| トレース   | `span` の名前が `GET /rolldice`、`spanKind` が `server` |
| メトリクス | `name` が `dice.rolls`、`dataPoints` の値               |
| ログ       | `body` に `Rolled a dice` を含む                        |
| イベント   | `eventName` が `dice.rolled`、`dice.value` 属性         |

ビューは `DiceServer` メーターから計装を選択します。
メトリクスリーダーは累積カウンターの値を1秒ごとにエクスポートします。
イベントはログ API を使用し、`eventName` を持つログレコードとして表示されます。

`withActiveSpan` はクロージャ内でリクエストスパンをアクティブにするため、ログとイベントにはそのトレース ID とスパン ID が含まれます。
クロージャが返ると、スパンは終了します。

## 次のステップ {#next-steps}

自動的に生成された計装を、コードベースの[手動計装](/docs/languages/swift/instrumentation)で強化しましょう。
カスタマイズされたオブザーバビリティデータを取得できます。

一般的なフレームワークやライブラリ向けにテレメトリーデータを生成する、利用可能な[計装ライブラリ](/docs/languages/swift/libraries/)も確認してください。

[traces]: /docs/concepts/signals/traces/
[metrics]: /docs/concepts/signals/metrics/
[logs]: /docs/concepts/signals/logs/
