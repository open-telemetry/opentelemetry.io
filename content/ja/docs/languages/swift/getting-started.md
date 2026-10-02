---
title: はじめに
description: 5分以内にアプリのテレメトリーを取得しましょう！
weight: 10
default_lang_commit: f8e6af4e73e9d550e8aeb582392458c77f93d440
cSpell:ignore: rolldice
---

このページでは、Swift で OpenTelemetry を使い始める方法を説明します。

シンプルなアプリケーションを計装し、[トレース][traces]がコンソールに出力されるようにする方法を学びます。

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
// swift-tools-version:5.9
import PackageDescription

let package = Package(
    name: "dice-server",
    platforms: [
       .macOS(.v13)
    ],
    dependencies: [
        .package(url: "https://github.com/vapor/vapor.git", from: "4.83.1")
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
        let app = try Application(.detect())
        defer { app.shutdown() }
        app.get("rolldice") { req in
            let result = Int.random(in: 1..<7)
            return result
        }
        try app.run()
    }
}
```

以下のコマンドでアプリケーションをビルドして実行し、ウェブブラウザで <http://localhost:8080/rolldice> を開いて動作を確認してください。

```console
$ swift run
Building for debugging...
Build complete! (0.31s)
2023-10-04T17:16:13+0200 notice codes.vapor.application : [Vapor] Server starting on http://127.0.0.1:8080
```

## 計装 {#instrumentation}

アプリケーションに OpenTelemetry を追加するには、`Package.swift` を以下の依存関係で更新します。

```swift
// swift-tools-version:5.9
import PackageDescription


let package = Package(
    name: "dice-server",
    platforms: [
       .macOS(.v13)
    ],
    dependencies: [
        .package(url: "https://github.com/vapor/vapor.git", from: "4.83.1"),
        .package(url: "https://github.com/open-telemetry/opentelemetry-swift", from: "1.0.0"),
    ],
    targets: [
        .executableTarget(
            name: "DiceApp",
            dependencies: [
                .product(name: "Vapor", package: "vapor"),
                .product(name: "OpenTelemetryApi", package: "opentelemetry-swift"),
                .product(name: "OpenTelemetrySdk", package: "opentelemetry-swift"),
                .product(name: "StdoutExporter", package: "opentelemetry-swift"),
                .product(name: "ResourceExtension", package: "opentelemetry-swift"),
            ],
            path: "."
        )
    ]
)
```

`main.swift` ファイルを更新して、トレーサーを初期化し、`rolldice` リクエストハンドラーが呼ばれたときにスパンを出力するようにします。

```swift
import Vapor
import OpenTelemetryApi
import OpenTelemetrySdk
import StdoutExporter
import ResourceExtension

@main
enum Entrypoint {
    static func main() async throws {

        let spanExporter = StdoutExporter();
        let spanProcessor = SimpleSpanProcessor(spanExporter: spanExporter)
        let resources = DefaultResources().get()

        let instrumentationScopeName = "DiceServer"
        let instrumentationScopeVersion = "semver:0.1.0"

        OpenTelemetry.registerTracerProvider(tracerProvider:
            TracerProviderBuilder()
                .add(spanProcessor: spanProcessor)
                .with(resource: resources)
                .build()
        )
        let tracer = OpenTelemetry.instance.tracerProvider.get(instrumentationName: instrumentationScopeName, instrumentationVersion: instrumentationScopeVersion) as! TracerSdk


        let app = try Application(.detect())
        defer { app.shutdown() }

        app.get("rolldice") { req in
            let span = tracer.spanBuilder(spanName: "GET /rolldice").setSpanKind(spanKind: .client).startSpan()
            let result = Int.random(in: 1..<7)
            span.end();
            return result
        }

        try app.run()
    }
}
```

サーバーを再度起動します。

```sh
swift run
```

<http://localhost:8080/rolldice> にリクエストを送ると、コンソールにスパンが出力されます（見やすさのために整形しています）。

```json
{
  "attributes": {},
  "duration": 2.70605087280273e-5,
  "parentSpanId": "0000000000000000",
  "span": "GET /rolldice",
  "spanId": "635455eb236a1592",
  "spanKind": "client",
  "start": 718126321.210727,
  "traceFlags": {
    "sampled": true
  },
  "traceId": "c751f7af0586dac8ef3607c6fc128884",
  "traceState": {
    "entries": []
  }
}
```

## 次のステップ {#next-steps}

自動的に生成された計装を、コードベースの[手動計装](/docs/languages/swift/instrumentation)で強化しましょう。
カスタマイズされたオブザーバビリティデータを取得できます。

一般的なフレームワークやライブラリ向けにテレメトリーデータを生成する、利用可能な[計装ライブラリ](/docs/languages/swift/libraries/)も確認してください。

[traces]: /docs/concepts/signals/traces/
