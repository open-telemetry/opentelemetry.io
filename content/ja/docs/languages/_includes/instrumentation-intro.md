---
default_lang_commit: 1ececa0615b64c5dfd93fd6393f3e4052e0cc496
---

[計装](/docs/concepts/instrumentation/)とは、あなた自身がアプリにオブザーバビリティコードを追加する行為です。

アプリを計装する場合、あなたが使用する言語に対応したOpenTelemetry SDKを使用する必要があります。
次に、SDKを使用してOpenTelemetryを初期化し、APIを使用してコードを計装します。
これにより、アプリ本体だけでなく、計装が含まれるライブラリからもテレメトリーが出力されるようになります。

ライブラリを計装する場合、使用する言語に対応したOpenTelemetry APIパッケージのみをインストールしてます。
ライブラリ自体はテレメトリーを出力しません。
ライブラリの計装についての詳細は、[ライブラリ](/docs/concepts/instrumentation/libraries/)を参照してください。

OpenTelemetry APIとSDKについての詳細は、[仕様](/docs/specs/otel/)を参照してください。
