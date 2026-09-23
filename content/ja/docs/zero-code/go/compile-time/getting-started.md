---
title: はじめに
description: 計装コードを書かずに Go アプリケーションからテレメトリーをキャプチャします。
weight: 5
default_lang_commit: c9a73abce6f8c4b1ee1bdb244ed1ce6ce7192f04
cSpell:ignore: GOFLAGS otelc toolexec
---

このページでは、コンパイル時計装を使用して Go アプリケーションをビルドし、生成されるテレメトリーを確認する方法を説明します。

## 前提条件 {#prerequisites}

- [Go](https://go.dev/) 1.25 以降

## otelc のインストール {#install-otelc}

このプロジェクトは、標準の Go ツールチェーンをラップする `otelc` というコマンドラインツールを提供します。
`go install` でインストールしてください。

```sh
go install go.opentelemetry.io/otelc/tool/cmd/otelc@latest
```

これにより、`otelc` バイナリが Go の bin ディレクトリ（デフォルトでは `$(go env GOPATH)/bin`）に配置されます。
以降の手順では、`otelc` が `PATH` に含まれていることを前提としています。

あるいは、未リリースの変更を試す場合など、ソースからツールをビルドすることもできます。
これには `git` と `make` が必要です。

```sh
git clone https://github.com/open-telemetry/opentelemetry-go-compile-instrumentation.git
cd opentelemetry-go-compile-instrumentation
make build
```

これにより、リポジトリのルートに `otelc` バイナリが生成されます。
`PATH` に追加できます。

```sh
export PATH=$PATH:$(pwd)
```

## アプリケーションの計装 {#instrument-your-application}

ビルドへの変更は1行だけです。
これまで `go build` を実行していた場所で `otelc go build` を実行します。
アプリケーションのモジュールディレクトリから実行してください。

```sh
otelc go build -o myapp .
```

`go` の後に続くすべての引数はツールチェーンに転送されるため、ビルドの残りの部分は変わりません。
このツールはビルドをインターセプトし、アプリケーションとその依存関係にマッチする計装ルールを適用して、計装済みバイナリを生成します。
フラグ、パッケージ引数、出力パスなど、ビルドのその他すべては通常の `go build` とまったく同じように動作します。

デフォルトでは、`otelc` はモジュール内のサポートされているライブラリを検出し、設定やコード変更なしで自動的に計装します。

### go build をそのまま使い続ける {#keep-using-go-build}

ビルドコマンドを変更したくない場合は、`otelc setup` を一度実行してモジュールを準備し、`GOFLAGS` を通じて Go ツールチェーンに `otelc` を指定すれば、通常どおり `go build` を実行し続けることができます。

```sh
otelc setup
export GOFLAGS="${GOFLAGS} '-toolexec=otelc toolexec'"
go build -o myapp .
```

これは、既存のビルドシステムやスクリプトによって `go build` コマンドが固定されており、変更したくない場合に適しています。

## コンテナビルドでの計装 {#instrument-a-container-build}

コンテナビルドでも同じ置き換えが使えます。
ビルドステージで `otelc` をインストールし、`Dockerfile` の `go build` 行を `otelc go build` に置き換えます。

```dockerfile
# ビルドステージ
FROM golang:1.25 AS build
WORKDIR /src
COPY . .
RUN go install go.opentelemetry.io/otelc/tool/cmd/otelc@latest
RUN otelc go build -o /out/myapp .

# ランタイムステージ
FROM gcr.io/distroless/base-debian12
COPY --from=build /out/myapp /myapp
ENTRYPOINT ["/myapp"]
```

計装はバイナリにコンパイルされるため、ランタイムステージでは追加のものは不要です。
アタッチするエージェントも、追加の起動ステップもありません。

## アプリケーションの実行とテレメトリーのエクスポート {#run-the-application-and-export-telemetry}

計装されたアプリケーションは、標準の OpenTelemetry 環境変数で設定します。
たとえば、OTLP を使用してローカルの [Collector](/docs/collector/) にテレメトリーを送信するには、次のようにします。

```sh
export OTEL_SERVICE_NAME=myapp
export OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4317
./myapp
```

計装が認識する環境変数の完全なリストは[設定](../configuration)を参照してください。

## デモを試す {#try-the-demo}

リポジトリにはデモアプリケーションと完全なオブザーバビリティスタック（Collector、Jaeger、Prometheus、Grafana）が含まれており、生成されるテレメトリーをエンドツーエンドで確認できます。
このスタックは [Docker](https://www.docker.com/) 上で動作するため、まず Docker が利用可能であることを確認してください。
リポジトリのルートから以下を実行します。

```sh
cd demo/infrastructure/docker-compose
make start
```

デモアプリケーションとインフラストラクチャの詳細については、[demo ディレクトリ](https://github.com/open-telemetry/opentelemetry-go-compile-instrumentation/tree/main/demo)を参照してください。

## 次のステップ {#next-steps}

- すぐに使える[計装済みライブラリ](../supported-libraries)を確認してください。
- ツールと生成されるテレメトリーの[設定](../configuration)方法を学びましょう。
