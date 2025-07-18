---
default_lang_commit: 6f3712c5cda4ea79f75fb410521880396ca30c91
---

[計装](/docs/concepts/instrumentation/)は、アプリに自分でオブザーバビリティコードを追加する行為です。

アプリを計装している場合は、その言語のOpenTelemetry SDKを使用する必要があります。
次に、SDKを使用してOpenTelemetryを初期化し、APIを使用してコードを計装します。
これにより、アプリから、および計装も付属しているインストール済みライブラリからテレメトリーが発行されます。

ライブラリを計装している場合は、その言語のOpenTelemetry APIパッケージのみをインストールしてください。
ライブラリは単独ではテレメトリーを発行しません。
OpenTelemetry SDKを使用するアプリの一部である場合にのみテレメトリーを発行します。
ライブラリの計装の詳細については、[ライブラリ](/docs/concepts/instrumentation/libraries/)を参照してください。

OpenTelemetry APIとSDKの詳細については、[仕様](/docs/specs/otel/)を参照してください。
