---
title: OpenTelemetry Collector エクステンションレイヤーを使った Lambda のオブザーバビリティ
author: '[Dominik Süß](https://github.com/theSuess) (Grafana)'
linkTitle: Lambda のオブザーバビリティ
date: 2025-02-05
sig: FaaS
issue: 5961
default_lang_commit: b1022e17c3cfc0bc9073de8568eeae063f41d4f2
cSpell:ignore: Dominik
---

モダンなアプリケーションからテレメトリーデータを取り出すのは非常に簡単です（少なくともそうあるべきです）。
Collector をセットアップして、アプリケーションからデータを受信するか、各種カウンターの最新状態を提供するよう問い合わせます。
これはおよそ1分ごとに行われ、1秒遅れたり早まったりしても誰も気にしません。
しかし、アプリケーションが長時間存在しない場合はどうでしょうか。
データの収集を待つ1秒ごとに課金される場合はどうでしょうか。
それはおそらく Function-as-a-Service（FaaS）環境のことを考えているでしょう。
最もよく知られているのが AWS Lambda です。

この実行モデルでは、関数は直接呼び出され、実行後に環境がフリーズされます。
課金は実際の実行時間に対してのみ発生し、受信リクエストを待つためのサーバーを用意する必要がなくなります。
これがサーバーレスという用語の由来でもあります。
メトリクスを収集できるまで関数を存続させ続けるのは現実的な選択肢ではなく、たとえその費用を支払うつもりがあっても、異なる呼び出しは完全に別のコンテキストを持ち、同時に実行されている他のすべての実行について必ずしも把握しているわけではありません。
ここで「実行の最後にすべてのデータをプッシュすればいい、問題ないでしょう！」と思うかもしれませんが、それでは問題は解決しません。
データ送信にかかる時間分の料金を支払わなければならず、呼び出し回数が多いと積み重なっていきます。

しかし、別の方法があります！
Lambda エクステンションレイヤーを使えば、コードと並行して任意のプロセスを実行でき、実行ランタイムを共有して追加のサービスを提供します。
[opentelemetry-lambda](https://github.com/open-telemetry/opentelemetry-lambda/blob/653874a89dc684e2408f5eb397e41dd98c56ba83/collector/README.md?from_branch=main) エクステンションレイヤーを使うと、データ送信用のローカルエンドポイントを利用できるようになり、Lambda のライフサイクルを追跡してテレメトリーがストレージレイヤーに確実に届くようにします。

## どのように動作するのか {#how-does-it-work}

関数が初めて呼び出されると、エクステンションレイヤーが OpenTelemetry Collector のインスタンスを起動します。
この Collector ビルドは簡素化されたバージョンで、Lambda のコンテキストで必要なコンポーネントのみを提供します。
Lambda の [Extensions API](https://docs.aws.amazon.com/lambda/latest/dg/runtimes-extensions-api.html) と [Telemetry API](https://docs.aws.amazon.com/lambda/latest/dg/telemetry-api.html) に登録します。
これにより、関数が実行されるたび、ログ行が出力されるたび、または実行コンテキストがシャットダウンされようとするたびに通知を受け取ります。

### ここからが本領発揮 {#this-is-where-the-magic-happens}

ここまでの説明では、余計な作業が増えただけに思えるかもしれません。
結局 Collector がデータをエクスポートするのを待たなければならないのでは？
ここで特別な `decouple` プロセッサーが登場します。
このプロセッサーは、受信コンポーネントとエクスポートコンポーネントを分離しつつ、Lambda のライフサイクルとインターフェイスします。
これにより、すべてのデータが送信されていなくても Lambda がレスポンスを返すことが可能になります。
次の呼び出し時（またはシャットダウン時）に、Collector は関数が処理を行っている間もデータのエクスポートを継続します。

{{< figure src="diagram-execution-timing.svg" caption="Diagram showcasing how execution timing differs with and without a Collector">}}

## どうすれば使えるのか {#how-can-i-use-it}

2024年11月時点で、opentelemetry-lambda プロジェクトは [Collector エクステンションレイヤーのリリース](https://github.com/open-telemetry/opentelemetry-lambda/releases/tag/layer-collector%2F0.12.0)を公開しています。
S3 バケットまたは任意の HTTP サーバーでホストされた設定ファイルを通じて構成できます。
Lambda コードに設定ファイルをバンドルすることも可能です。
どちらの場合も、考慮すべきトレードオフがあります。
リモートの設定ファイルは追加のリクエストが必要になるためコールドスタートの時間が長くなり、一方で設定をバンドルすると複数の Lambda の設定を管理する際のオーバーヘッドが増加します。

最も簡単に始める方法は、埋め込み設定を使うことです。
関数に `collector.yaml` というファイルを追加してください。
これは通常の Collector 設定ファイルです。
Lambda 固有のエクステンションを活用するには、それらを設定する必要があります。
たとえば、次に示す設定は Telemetry API からトレースとログを受信し、別のエンドポイントに送信します。

```yaml
receivers:
  telemetryapi:
exporters:
  otlphttp/external:
    endpoint: 'external-collector:4318'
processors:
  batch:
  decouple:
service:
  pipelines:
    traces:
      receivers: [telemetryapi]
      processors: [batch, decouple]
      exporters: [otlphttp/external]
    logs:
      receivers: [telemetryapi]
      processors: [batch, decouple]
      exporters: [otlphttp/external]
```

`decouple` プロセッサーは省略した場合にデフォルトで設定されます。
この例ではパイプライン全体を示すために明示的に追加しています。
詳細については [Autoconfiguration](https://github.com/open-telemetry/opentelemetry-lambda/tree/dd62a87dcef7c1a94a02739a2425a1af3770313e/collector?from_branch=main#auto-configuration) を参照してください。

その後、`OPENTELEMETRY_COLLECTOR_CONFIG_URI` 環境変数を `/var/task/collector.yaml` に設定します。
関数を再デプロイすると、関数のログが表示されるようになります！
以下の動画でその動作を確認できます。

<p>
  <video controls style="width: 100%">
    <source src="/blog/2025/observing-lambdas/video-lambda-real-time.webm" />
  </video>
</p>

Lambda が生成するすべてのログ行は、指定した `external-collector` エンドポイントに送信されます。
コードを一切変更する必要はありません！
そこからテレメトリーデータは通常どおりバックエンドに流れます。
Lambda がアクティブでないときにテレメトリーデータの送信がフリーズされる可能性があるため、ログが遅延して到着することがあります。
ログは次の実行時またはシャットダウン時に届きます。

アプリケーションのさらなる洞察を得たい場合は、[言語固有の自動計装レイヤー](https://github.com/open-telemetry/opentelemetry-lambda/?tab=readme-ov-file#extension-layer-language-support)も参照してください。
