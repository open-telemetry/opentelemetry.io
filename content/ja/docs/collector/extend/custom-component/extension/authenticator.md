---
title: 認証機能拡張の構築
linkTitle: 認証
weight: 100
aliases:
  - /docs/collector/custom-auth
  - /docs/collector/building/authenticator-extension/
default_lang_commit: 6a7f17450ce3edc2e4363013551ee93ba7934a5d
cSpell:ignore: configauth oidc
---

OpenTelemetryコレクターを使用すると、レシーバーとエクスポーターを認証機能に接続できるため、レシーバー側での受信接続の認証や、エクスポーター側での送信リクエストへの認証データの追加が可能になります。

認証機能は[拡張機能][extensions]を通じて実装されます。
このドキュメントでは、独自の認証機能を実装する方法について説明します。
既存の認証機能の使用方法を学びたい場合は、その特定の認証機能のドキュメントを参照してください。
このウェブサイトの[レジストリ](/ecosystem/registry/)で、既存の認証機能のリストを見つけることができます。

カスタム認証機能の構築方法に関する一般的な手順についてはこのガイドを使用し、各タイプと関数のセマンティクスについては[APIリファレンスガイド](https://pkg.go.dev/go.opentelemetry.io/collector/config/configauth)を参照してください

ヘルプが必要な場合は、[CNCFのSlackワークスペース](https://slack.cncf.io)の[#opentelemetry-collector-dev](https://cloud-native.slack.com/archives/C07CCCMRXBK)チャンネルに参加してください。

## アーキテクチャ {#architecture}

OpenTelemetryにおける[拡張機能][Authenticators]は、ほかの拡張機能と同様ですが、認証がどのように実行されるか（たとえば、HTTPまたはgRPCリクエストの認証など）を定義する1つ以上の特定のインターフェイスも実装する必要があります。
レーシーバーを備えた[サーバー認証機能][sa]を使用して、HTTPおよびgRPCリクエストをインターセプトします。
エクスポーターを備えたクライアント認証機能を使用して、HTTPおよびgRPCリクエストに認証データを追加します。
認証機能は両方のインターフェイスに同時に実装することも可能であり、拡張機能の単一インスタンスが受信および送信両方のリクエストを処理できるようにします。

拡張機能がコレクターのディストリビューションで利用可能になると、ほかの拡張機能と同様に構成ファイルで参照できます。
しかし、認証機能は消費者コンポーネントによって参照される場合にのみ有効です。
次の構成は、`oidc`認証の拡張機能を使用する`otlp/auth`という名前のレシーバーを示しています。

```yaml
extensions:
  oidc:

receivers:
  otlp/auth:
    protocols:
      grpc:
        endpoint: 0.0.0.0:4317
        auth:
          authenticator: oidc

processors:
exporters:

service:
  extensions:
    - oidc
  pipelines:
    traces:
      receivers:
        - otlp/auth
      processors: []
      exporters: []
```

認証機能のインスタンスが複数必要な場合は、異なる名前を付けてください。

```yaml
extensions:
  oidc/some-provider:
  oidc/another-provider:

receivers:
  otlp/auth:
    protocols:
      grpc:
        endpoint: 0.0.0.0:4317
        auth:
          authenticator: oidc/some-provider

processors:
exporters:

service:
  extensions:
    - oidc/some-provider
    - oidc/another-provider
  pipelines:
    traces:
      receivers:
        - otlp/auth
      processors: []
      exporters: []
```

### サーバー認証機能 {#server-authenticators}

[サーバー認証機能][sa]は、`Authenticate`メソッドを持つ拡張機能です。
この関数はリクエストを受信するたびに呼び出され、リクエストのヘッダーをチェックしてリクエストを認証します。
認証機能はリクエストが有効であると判断した場合、`nil`エラーを返します。
リクエストが無効な場合は、その理由を説明するエラーを返します。

拡張機能であるため、認証機能は[`Start`](https://pkg.go.dev/go.opentelemetry.io/collector/component#Component)で必要なリソース（キー、クライアント、キャッシュなど）を設定し、`Shutdown`でそれらをすべてクリーンアップする必要があります。

`Authenticate`関数は、受信するすべてのリクエストに対して実行され、パイプラインはこの関数が終了するまで先に進むことができません。
そのため、認証機能は遅い、または不必要なブロッキング作業を避ける必要があります。
`context`が期限を設定している場合、パイプラインが遅延したりハングアップしないように、コードがその設定に従うことを確認してください。

認証機能には、特にメトリクスとトレースなどの優れたオブザーバビリティを追加する必要があります。
これにより、ユーザーはエラーが増加し始めた場合にアラートを設定でき、認証の問題のトラブルシューティングが容易になります。

### クライアント認証機能 {#client-authenticators}

[クライアント認証機能][Client authenticators]は、1つ以上の定義されたインターフェイスを実装する追加の関数を持つ拡張機能です。
各認証機能は、認証データを注入できるオブジェクトを受け取ります。
たとえば、HTTPクライアント認証機能は[`http.RoundTripper`](https://pkg.go.dev/net/http#RoundTripper)を提供し、一方でgRPCクライアント認証機能は[`credentials.PerRPCCredentials`](https://pkg.go.dev/google.golang.org/grpc/credentials#PerRPCCredentials)を生成します。

## カスタム認証機能をディストリビューションに追加する {#add-your-custom-authenticator-to-a-distribution}

カスタム認証機能は、コレクター自体と同じバイナリの一部でなければなりません。
独自の認証機能を構築する場合、2つのオプションがあります。

- [OpenTelemetry Collector Builder][builder]を使用してカスタムコレクターのディストリビューションを構築できます
- Goモジュールを公開するなど、ユーザーが独自のディストリビューションに拡張機能を追加する方法を提供できます。

[authenticators]: https://pkg.go.dev/go.opentelemetry.io/collector/config/configauth
[builder]: https://github.com/open-telemetry/opentelemetry-collector/tree/main/cmd/builder
[client authenticators]: https://pkg.go.dev/go.opentelemetry.io/collector/config/configauth#client-authenticators
[extensions]: /docs/collector/configuration/#extensions
[sa]: https://pkg.go.dev/go.opentelemetry.io/collector/config/configauth#server-authenticators
