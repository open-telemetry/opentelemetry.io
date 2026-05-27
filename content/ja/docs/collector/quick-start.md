---
title: クイックスタート
description: コレクターをセットアップとテレメトリーの収集をすぐに始めてみましょう！
default_lang_commit: 813498074d85258c7180d137ace9e272d0149353
---

<!-- markdownlint-disable ol-prefix blanks-around-fences -->

OpenTelemetryコレクターは、[トレース](/docs/concepts/signals/traces/)、[メトリクス](/docs/concepts/signals/metrics/)、[ログ](/docs/concepts/signals/logs/)などのテレメトリーを受け取り、それらを処理し、コンポーネントのパイプラインを通じて1つ以上のオブザーバビリティバックエンドへ転送します。

> [!NOTE]
>
> このクイックスタートのデモは、基本的なローカルセットアップを構築します。
> 目的はコレクターがどのように動作するかを示すことであり、本番環境向けのセットアップを構築するためのものではありません。

本ガイドでは、次のことを行います。

- OpenTelemetryコレクターのローカルインスタンスを起動する
- トレースデータを生成してコレクターに送信する
- コレクターがデータを受信して処理することを確認する

最後には、シンプルなパイプラインがマシン上で動作するようになり、オブザーバビリティスタックの中でコレクターがどのような位置にあるのかをはっきり理解できるようになります。
始める前にもう少し背景情報が必要であれば、[コレクター](/docs/collector)の概要を参照してください。

## 事前要件

始める前に、以下のツールが環境にインストールされていることを確認してください。

- [Docker](https://www.docker.com/) または互換性のあるコンテナランタイム — コレクターの実行に使用します
- [Go](https://go.dev/) の最新2つのマイナーバージョンのいずれか — テレメトリージェネレーターのインストールに使用します
- [`GOBIN` 環境変数][gobin] が設定されていること — インストールした Go のバイナリが PATH から参照できるようになります[^1]

`GOBIN` が設定されていない場合は、次のコマンドを実行します。

```sh
export GOBIN=${GOBIN:-$(go env GOPATH)/bin}
```

本ガイドでは `bash` のコマンドを使用しています。
別のシェルを使っている場合は、必要に応じてコマンドの構文を読み替えてください。

[^1]: 詳細については、[Your first program](https://go.dev/doc/code#Command) を参照してください。

## 環境の設定

1. OpenTelemetryコレクターのコア[ディストリビューション](/docs/collector/distributions/)の Docker イメージをプルします。

   ```sh
   docker pull otel/opentelemetry-collector:{{% param vers %}}
   ```

2. テレメトリーを生成するクライアントをシミュレートするために使う [telemetrygen][] をインストールします。

   ```sh
   go install github.com/open-telemetry/opentelemetry-collector-contrib/cmd/telemetrygen@latest
   ```

## テレメトリーの生成と収集

3. コレクターを起動します。

   ```sh
   docker run \
     -p 127.0.0.1:4317:4317 \
     -p 127.0.0.1:4318:4318 \
     -p 127.0.0.1:55679:55679 \
     otel/opentelemetry-collector:{{% param vers %}} \
     2>&1 | tee collector-output.txt
   ```

   上記のコマンドは、コレクターをローカルで実行し、3つのポートを公開します。
   - `4317` — OTLP over gRPC。ほとんどの SDK がデフォルトで使うポート
   - `4318` — OTLP over HTTP。gRPC に対応していないクライアント向け
   - `55679` — ZPages。ブラウザで開ける組み込みのデバッグ UI

4. 別のターミナルで、いくつかのトレースを生成します。

   ```sh
   $GOBIN/telemetrygen traces --otlp-insecure --traces 3
   ```

   トレースが送信されたことを確認できる出力が表示されます。

   ```text
   2024-01-16T14:33:15.692-0500  INFO  traces/worker.go:99  traces generated  {"worker": 0, "traces": 3}
   2024-01-16T14:33:15.692-0500  INFO  traces/traces.go:58  stop the batch span processor
   ```

5. コレクターを実行しているターミナルに戻ると、以下の例のようなトレースの取り込み状況が表示されるはずです。

   ```console
   $ grep -E '^Span|(ID|Name|Kind|time|Status \w+)\s+:' ./collector-output.txt
   Span #0
       Trace ID       : f30faffbde5fcf71432f89da1bf7bc14
       Parent ID      : 6f1ff7f9cf4ec1c7
       ID             : 8d1e820c1ac57337
       Name           : okey-dokey
       Kind           : Server
       Start time     : 2024-01-16 14:13:54.585877 +0000 UTC
       End time       : 2024-01-16 14:13:54.586 +0000 UTC
       Status code    : Unset
       Status message :
   Span #1
       Trace ID       : f30faffbde5fcf71432f89da1bf7bc14
       Parent ID      :
       ID             : 6f1ff7f9cf4ec1c7
       Name           : lets-go
       Kind           : Client
       Start time     : 2024-01-16 14:13:54.585877 +0000 UTC
       End time       : 2024-01-16 14:13:54.586 +0000 UTC
       Status code    : Unset
       Status message :
   ...
   ```

6. トレースを視覚的に確認するには、ブラウザで <http://localhost:55679/debug/tracez> を開き、表の中から1つトレースを選択してください。

7. <kbd>Control-C</kbd> を押してコレクターを停止します。

## この次のステップ

ここまでで、コレクターをローカルで実行し、テレメトリーが端から端まで処理される様子を見てきました。
ここからは、実際のセットアップでどのように使われるかを学んでいきましょう。

- [設定](/docs/collector/configuration): コレクターの設定ファイルがどのように動作し、Jaeger や Prometheus のような実際のバックエンドにどう接続するかを学びます。
- [デプロイメントパターン](/docs/collector/deploy/): コレクターをエージェントとして実行する場合とゲートウェイとして実行する場合の違いを理解します。
- [コレクターのインストール](/docs/collector/install/): バイナリや Kubernetes など、Docker 以外のインストール方法を探します。
- [コンポーネントレジストリ](/ecosystem/registry/?language=collector): パイプラインを拡張するために利用できるレシーバー、プロセッサー、エクスポーターを閲覧します。

[gobin]: https://pkg.go.dev/cmd/go#hdr-Environment_variables
[telemetrygen]: https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/cmd/telemetrygen
