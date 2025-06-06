---
title: ゼロコード
description: >-
  コードを書かずにアプリケーションにオブザーバビリティを追加する方法を学ぶ
weight: 10
default_lang_commit: 548e5e29f574fddc3ca683989a458e9a6800242f
---

[運用担当者](/docs/getting-started/ops/)として、ソースを編集することなく、1つ以上のアプリケーションにオブザーバビリティを追加したいと思うかもしれません。
OpenTelemetry を使えば、[コードベースの計装](/docs/concepts/instrumentation/code-based) のための OpenTelemetry API や SDK を使わなくても、サービスのオブザーバビリティを素早く得られます。

![Zero Code](./zero-code.svg)

ゼロコード計装は、OpenTelemetry API と SDKの機能を使って、通常、エージェントあるいはそれに準ずる機能をアプリケーションに追加します。
具体的なメカニズムは言語によって異なり、バイトコード操作、モンキーパッチ、あるいは eBPF から、アプリケーションにOpenTelemetry APIとSDKへの呼び出しを注入します。

通常、ゼロコード計装は、使用しているライブラリの計装を追加します。
つまり、リクエストとレスポンス、データベース呼び出し、メッセージキュー呼び出しなどが計装の対象となります。
しかし、アプリケーションのコードは通常、計装されません。
コードを計装するには、[コードベース計装](/docs/concepts/instrumentation/code-based)を使う必要があります。

さらに、ゼロコード計装では、読み込まれた[計装ライブラリ](/docs/concepts/instrumentation/libraries)や[エクスポーター](/docs/concepts/components/#exporters)を設定を行うことができます。

環境変数や、システムプロパティや初期化メソッドに渡される引数のような他の言語固有のメカニズムを通して、ゼロコード計装を設定できます。
開始するには、選択したオブザーバビリティバックエンドでサービスを識別できるように設定されたサービス名だけが必要です。

その他、以下のような設定オプションがあります。

- データソース固有の設定
- エクスポーターの設定
- プロパゲーターの設定
- リソースの設定

ゼロコード計装は以下の言語に対応しています。

- [.NET](/docs/zero-code/dotnet/)
- [Go](/docs/zero-code/go)
- [Java](/docs/zero-code/java/)
- [JavaScript](/docs/zero-code/js/)
- [PHP](/docs/zero-code/php/)
- [Python](/docs/zero-code/python/)
