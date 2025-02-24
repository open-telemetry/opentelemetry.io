---
title: クイックスタート
description: コレクターをセットアップとテレメトリーの収集をすぐに始めてみましょう！
default_lang_commit: fd7da211d5bc37ca93112a494aaf6a94445e2e28
---

<!-- markdownlint-disable ol-prefix blanks-around-fences -->

OpenTelemetryコレクターは、[トレース](/docs/concepts/signals/traces/)、[メトリクス](/docs/concepts/signals/metrics/)、[ログ](/docs/concepts/signals/logs/)を受け取り、テレメトリーを処理し、そのコンポーネントを使用してさまざまなオブザーバビリティバックエンドにエクスポートします。
コレクターの概念的な概要については、[コレクター](/docs/collector)のページを参照してください。

本記事でたった5分で次の内容を学習できます。

- OpenTelemetryコレクターをセットアップして実行する
- テレメトリーを送信し、コレクターによって処理されるのを確認する

## 事前要件

開発環境が以下の要件を満たしていることを確認してください。
このページでは `bash` を使っていると仮定しています。
お好みのシェルに合わせて、設定やコマンドを変更してください。

- [Docker](https://www.docker.com/)、あるいは他の互換コンテナランタイム
- [Go](https://go.dev/) 1.20以上
- [`GOBIN` 環境変数][gobin]が設定されていること。もし設定されていなければ、適切に設定してください。次は一例です[^1]。
  ```sh
  export GOBIN=${GOBIN:-$(go env GOPATH)/bin}
  ```

[^1]: 詳細については、Goの公式サイトにある[Your first program](https://go.dev/doc/code#Command)のドキュメントを参照してください。

## 環境の設定

1. OpenTelemetryコレクターの Contrib Dockerイメージをプルします。

   ```sh
   docker pull otel/opentelemetry-collector-contrib:{{% param vers %}}
   ```

2. [telemetrygen]ユーティリティをインストールします。

   ```sh
   go install github.com/open-telemetry/opentelemetry-collector-contrib/cmd/telemetrygen@latest
   ```

   このユーティリティは[トレース][traces]、[メトリクス][metrics]、[ログ][logs]を生成するクライアントをシミュレートできます。

## テレメトリーの生成と収集

3. コレクターを起動します。

   ```sh
   docker run \
     -p 127.0.0.1:4317:4317 \
     -p 127.0.0.1:4318:4318 \
     -p 127.0.0.1:55679:55679 \
     otel/opentelemetry-collector-contrib:{{% param vers %}} \
     2>&1 | tee collector-output.txt # 補足的に出力をteeして後で検索しやすくする
   ```

4. 別のターミナル窓でサンプルのトレースを生成します。

   ```sh
   $GOBIN/telemetrygen traces --otlp-insecure --traces 3
   ```

   ユーティリティによって生成された出力の中に、トレースが生成されたことのログが表示されるはずです。

   ```text
   2024-01-16T14:33:15.692-0500  INFO  traces/worker.go:99  traces generated  {"worker": 0, "traces": 3}
   2024-01-16T14:33:15.692-0500  INFO  traces/traces.go:58  stop the batch span processor
   ```

   関連する出力を簡単に見るには、フィルタリングすると良いでしょう。

   ```sh
   $GOBIN/telemetrygen traces --otlp-insecure \
     --traces 3 2>&1 | grep -E 'start|traces|stop'
   ```

5. コレクターコンテナを実行しているターミナル窓に、以下の例に示すようなトレースを取り込んだ様子が表示されるはずです。

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

6. <http://localhost:55679/debug/tracez> を開いて、表中のサンプルの1つを選択すると、先ほど生成したトレースが表示されます。

7. 完了したら、たとえば<kbd>Control-C</kbd>を使用してコレクターコンテナをシャットダウンします。

## この次のステップ

このチュートリアルでは、OpenTelemetryコレクターを起動し、そこにテレメトリーを送信しました。
次のステップとして、以下のことを検討してください。

- [コレクターのインストール](../installation/)について別の方法を試す
- コレクターの[デプロイ方法](../deployment/)についてさまざまな方法を学ぶ
- コレクターの[設定](/docs/collector/configuration)ファイルとその構造を理解する
- [レジストリ](/ecosystem/registry/?language=collector)で取得できるコンポーネントを探る
- [OpenTelemetry Collector Builder (OCB)を使ってカスタムコレクターをビルド](/docs/collector/custom-collector/)する方法を学ぶ

[gobin]: https://pkg.go.dev/cmd/go#hdr-Environment_variables
[logs]: /docs/concepts/signals/logs/
[metrics]: /docs/concepts/signals/metrics/
[telemetrygen]: https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/cmd/telemetrygen
[traces]: /docs/concepts/signals/traces/
