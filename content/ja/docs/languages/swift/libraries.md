---
title: 計装ライブラリ
linkTitle: ライブラリ
weight: 40
default_lang_commit: ec870712704ae037419e4e420b7fa3be04e10297
cSpell:ignore: darwin inout iphone NSURL Signposter wifi
---

<!-- markdownlint-disable no-duplicate-heading -->

{{% docs/languages/libraries-intro "swift" %}}

## 計装ライブラリの使用 {#use-instrumentation-libraries}

OpenTelemetry-Swift は、インストールして初期化すると計装を自動的に生成する[計装ライブラリ](/docs/specs/otel/glossary/#instrumentation-library)をいくつか提供しています。

たとえば、[NSURLSession の計装](https://github.com/open-telemetry/opentelemetry-swift/tree/main/Sources/Instrumentation/URLSession)は、NSURLSession で行われるすべてのネットワークリクエストに対して自動的に[スパン](/docs/concepts/signals/traces/#spans)を作成します。

## セットアップ {#setup}

すべての計装ライブラリは OpenTelemetry Swift で利用可能です。
計装を有効にするには、各計装の手順に従ってください。

## `SDKResourceExtension` {#sdkresourceextension}

`SDKResourceExtension` はデバイスの詳細をリソースとして提供します。

### 使い方 {#usage}

`DefaultResource.get()` を使用して、オールインワンのリソースオブジェクトを生成します。
このリソースは `TracerProvider` または `MetricProvider` に追加できます。

```swift
OpenTelemetry.registerTracerProvider(tracerProvider: TracerProviderBuilder()
            .with(resource: DefaultResource.get())
            .build())
```

### 詳細 {#details}

`SDKResourceExtension` は、iOS デバイス、OS の詳細、アプリケーションの詳細を含むリソースオブジェクトの属性を提供します。
これらの値は適切な[セマンティック属性](/docs/specs/semconv/resource/#semantic-attributes-with-sdk-provided-default-value)に適用されます。

#### アプリケーション情報 {#application-info}

| 属性                | 値の例                        | 説明                                                                                                       |
| ------------------- | ----------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `service.name`      | `MyApplication`               | `CFBundleName`。アプリの info.plist で定義されたアプリケーション名。                                       |
| `service.version`   | `1.0 (1234)`                  | `CFBundleShortVersion` と（`CFBundleVersion`）。アプリの info.plist で定義されたアプリケーションバージョン |
| `service.namespace` | `com.myCompany.myApplication` | `CFBundleIdentifier`                                                                                       |

#### デバイス情報 {#device-info}

| 属性                      | 値の例                  | 説明                                           |
| ------------------------- | ----------------------- | ---------------------------------------------- |
| `device.model.identifier` | `iphone13,3`            | デバイスタイプに応じて `sysctl` から取得される |
| `device.id`               | `00000000-0000-0000000` | `identifierForVendor` の UUID 文字列           |

#### オペレーティングシステム情報 {#operating-system-info}

| 属性             | 値の例                            | 説明                                                       |
| ---------------- | --------------------------------- | ---------------------------------------------------------- |
| `os.type`        | `darwin`                          | `ResourceAttributes` で事前定義                            |
| `os.name`        | `iOS`, `watchOS`, `macOS`         | `UIDevice.current.systemName` またはプラットフォームに依存 |
| `os.version`     | `15.4.0`                          | `ProcessInfo.processInfo.operatingSystemVersion`           |
| `os.description` | `iOS Version 15.4 (Build 19E240)` | OS 名、バージョン、ビルドの組み合わせ                      |

## `NSURLSession` の計装 {#nsurlsession-instrumentation}

この計装は、NSURLSession で行われるすべてのネットワークリクエストに対してスパンを作成します。
また、計装されたネットワークリクエストに分散トレーシングヘッダーを注入します。
`NetworkStatus` はこのパッケージの依存関係であり、ネットワークスパンにネットワーク状態の属性を提供します。

注意: NSURLSession の計装は、OpenTelemetry オブジェクトのグローバルトレーサープロバイダーに依存しています。
カスタムトレーサープロバイダーは、この計装の前に設定し、グローバルプロバイダーとして設定する必要があります。

### 使い方 {#usage-1}

`URLSessionInstrumentation(configuration: URLSessionInstrumentationConfiguration())` でクラスを初期化すると、すべてのネットワーク呼び出しが自動的にキャプチャされます。

この動作は、`URLSessionInstrumentationConfiguration` で定義されているオプションのコールバックを使用して変更または拡張できます。

- `shouldInstrument: ((URLRequest) -> (Bool)?)?`

  計装するリクエストをフィルタリングします。
  デフォルトではすべてのリクエストが対象です。

- `shouldRecordPayload: ((URLSession) -> (Bool)?)?`

  セッションにペイロードデータを記録させたい場合に実装します。
  デフォルトは false です。

- `shouldInjectTracingHeaders: ((URLRequest) -> (Bool)?)?`

  トレースを追跡するためにヘッダーを注入するリクエストをフィルタリングできます。
  デフォルトは true です。
  カスタムヘッダーを注入したい場合も true を返す必要があります。

- `injectCustomHeaders: ((inout URLRequest, Span?) -> Void)?`

  カスタムヘッダーを注入したり、リクエストを他の方法で変更するためにこのコールバックを実装します。

- `nameSpan: ((URLRequest) -> (String)?)?`

  標準の OpenTelemetry 名のかわりに、指定されたリクエストの名前を変更します。

- `createdRequest: ((URLRequest, Span) -> Void)?`

  リクエストが作成された後に呼び出され、スパンに追加情報を付与できます。

- `receivedResponse: ((URLResponse, DataOrFile?, Span) -> Void)?`

  レスポンスが受信された後に呼び出され、スパンに追加情報を付与できます。

- `receivedError: ((Error, DataOrFile?, HTTPStatus, Span) -> Void)?`

  エラーが受信された後に呼び出され、スパンに追加情報を付与できます。

以下は初期化の例です。
`URLSessionInstrumentationConfiguration` のコンストラクタには、アプリケーションのニーズに合わせて上で定義したパラメーターを渡すことができます。

```swift
let sessionInstrumentation = URLSessionInstrumentation(configuration: URLSessionInstrumentationConfiguration())
```

### 詳細 {#details-1}

`NSURLSession` の計装は、ネットワークリクエスト時のデバイスのネットワーク状態に関する詳細を提供する追加の属性も提供します。

| 属性                          | 値の例                        | 説明                                                                                |
| ----------------------------- | ----------------------------- | ----------------------------------------------------------------------------------- |
| `net.host.connection.type`    | `wifi`, `cell`, `unavailable` | リクエスト時にデバイスが使用していた接続の種類。                                    |
| `net.host.connection.subtype` | `EDGE` `LTE` など             | セルラー接続の種類。接続タイプが `cell` の場合のみ設定されます。                    |
| `net.host.carrier.name`       | `T-Mobile`, `Verizon` など    | セルラーキャリア名。セルラー接続タイプの場合のみ設定されます。                      |
| `net.host.carrier.icc`        | `DE`                          | モバイルキャリアネットワークに関連付けられた ISO 3166-1 alpha-2 の2文字の国コード。 |
| `net.host.carrier.mcc`        | `310`                         | モバイル国コード                                                                    |
| `net.host.carrier.mnc`        | `001`                         | モバイルネットワークコード                                                          |

## `SignpostIntegration` {#signpostintegration}

このパッケージは、スパンが開始または終了されたときに `os_signpost` の `begin` および `end` 呼び出しを作成します。
OpenTelemetry で計装されたアプリケーションが `Instruments` のようなプロファイリングアプリでスパンを表示できるよう、自動的に統合します。
また、ユーザーが追加のシグナルポストイベントを追加できるように、投稿に使用する `OSLog` もエクスポートします。
この機能は `Simple Exporter` の例で示されています。

### バージョンに関する注意 {#version-notice}

- **iOS 15以上、macOS 12以上、tvOS 15以上、watchOS 8以上**: 効率性と互換性が向上したモダンな `OSSignposter` API を利用する **`OSSignposterIntegration`** を使用してください。
- **古いシステム**: 従来の `os_signpost` API に依存する **`SignPostIntegration`** を使用してください。

### 使い方 {#usage-2}

デプロイメントターゲットに基づいて適切なスパンプロセッサーを追加してください（プロバイダーの設定の詳細については[手動計装](../instrumentation/)のドキュメントを参照してください）。

#### iOS 15以上、macOS 12以上、tvOS 15以上、watchOS 8以上の場合: {#for-ios-15-macos-12-tvos-15-watchos-8}

```swift
OpenTelemetry.instance.tracerProvider.addSpanProcessor(OSSignposterIntegration())
```

#### 古いシステムの場合 {#for-older-systems}

```swift
OpenTelemetry.instance.tracerProvider.addSpanProcessor(SignPostIntegration())
```

#### 実行時に自動的に選択する場合: {#or-to-select-automatically-at-runtime}

```swift
if #available(iOS 15, macOS 12, tvOS 15, watchOS 8, *) {
    OpenTelemetry.instance.tracerProvider.addSpanProcessor(OSSignposterIntegration())
} else {
    OpenTelemetry.instance.tracerProvider.addSpanProcessor(SignPostIntegration())
}
```

## 利用可能な計装ライブラリ {#available-instrumentation-libraries}

OpenTelemetry が提供する計装ライブラリの完全なリストは、[opentelemetry-swift](https://github.com/open-telemetry/opentelemetry-swift/tree/main/Sources/Instrumentation) リポジトリから入手できます。

[レジストリ](/ecosystem/registry/?language=swift&component=instrumentation)でもさらに多くの計装を見つけることができます。

## 次のステップ {#next-steps}

計装ライブラリをセットアップした後は、カスタムテレメトリーデータを収集するために、コードに独自の[計装](/docs/languages/swift/instrumentation)を追加することを検討してください。
