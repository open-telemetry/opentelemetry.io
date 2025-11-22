---
title: JavaScriptのゼロコード計装
linkTitle: JavaScript
description: ソースコードの変更なしでアプリケーションからテレメトリーをキャプチャする
aliases: [/docs/languages/js/automatic]
default_lang_commit: 55f8de69ad3cf54f24243c200f70cd0b3a608ad4
---

JavaScriptのゼロコード計装は、コードを変更することなく、任意のNode.jsアプリケーションを計装し、多くの人気のあるライブラリやフレームワークからテレメトリーデータをキャプチャする方法を提供します。

## セットアップ {#setup}

次のコマンドを実行して、適切なパッケージをインストールします。

```shell
npm install --save @opentelemetry/api
npm install --save @opentelemetry/auto-instrumentations-node
```

`@opentelemetry/api` および `@opentelemetry/auto-instrumentations-node` パッケージは、API、SDK、および計装ツールをインストールします。

## モジュール構成 {#configuring-the-module}

モジュールは高度に構成可能です。

まず、CLIから環境変数を設定するために `env` を使用してモジュールを構成するオプションがあります。

```shell
env OTEL_TRACES_EXPORTER=otlp OTEL_EXPORTER_OTLP_TRACES_ENDPOINT=your-endpoint \
node --require @opentelemetry/auto-instrumentations-node/register app.js
```

あるいは、 `export` を使用して環境変数を設定することもできます。

```shell
export OTEL_TRACES_EXPORTER="otlp"
export OTEL_EXPORTER_OTLP_ENDPOINT="your-endpoint"
export OTEL_NODE_RESOURCE_DETECTORS="env,host,os"
export OTEL_SERVICE_NAME="your-service-name"
export NODE_OPTIONS="--require @opentelemetry/auto-instrumentations-node/register"
node app.js
```

デフォルトでは、すべてのSDK[リソース検出器](/docs/languages/js/resources/)が使用されます。
環境変数 `OTEL_NODE_RESOURCE_DETECTORS` を使用して、特定の検出器のみを有効にしたり、完全に無効にしたりできます

構成オプションのすべての範囲を確認するには、[モジュール構成](configuration)を参照してください。

## サポートされているライブラリとフレームワーク {#supported-libraries-and-frameworks}

人気のあるNode.jsライブラリの多くが自動計装されています。
完全なリストについては、[サポートされている計装](https://github.com/open-telemetry/opentelemetry-js-contrib/tree/main/packages/auto-instrumentations-node#supported-instrumentations)をご覧ください。

## トラブルシューティング {#troubleshooting}

`OTEL_LOG_LEVEL` 環境変数を以下のいずれかに設定して、ログレベルを設定できます。

- `none`
- `error`
- `warn`
- `info`
- `debug`
- `verbose`
- `all`

デフォルトのレベルは `info` です。

{{% alert title="Notes" %}}

- 本番環境では、 `OTEL_LOG_LEVEL` を `info` に設定することを推奨します。
- ログは常に `console` に送信され、環境やデバッグレベルに関係なく送信されます。
- デバッグログは、非常に冗長でありアプリケーションのパフォーマンスに悪影響を与える可能性があります。
  必要な場合にのみデバッグログを有効にしてください。

{{% /alert %}}
