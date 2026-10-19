---
title: Knative における分散トレーシング
linkTitle: Knative におけるトレーシング
date: 2022-04-12
author: '[Pavol Loffay](https://github.com/pavolloffay)'
default_lang_commit: b18eb4d01fab9be2c5c22b1aaafdeb23ba97e3d4
# prettier-ignore
cSpell:ignore: apng Cloudevents datacontenttype httpbody khtml knativearrivaltime pavolloffay spanid specversion traceid webp
---

この記事では、Knative における分散トレーシングの仕組みを学び、OpenTelemetry プロジェクトがこの環境でのトレーシングサポートをどのように容易にできるかを探ります。
Knative の内部構造を探り、すぐに利用できる分散トレーシング機能と、追加の計装が必要なシステムの部分を理解します。

## Knative について {#about-knative}

Knative は `CustomResourceDefinitions`（CRD）のセットとして Kubernetes 上に構築されたサーバーレスプラットフォームです。
プロジェクトは2つの論理的な部分に分かれています。

- serving - ワークロード/サービスの作成、デプロイ、スケーリングを容易にする
- eventing - ワークロード間のイベント駆動型通信を容易にし、疎結合アーキテクチャを実現する

この記事では Knative の基本については取り上げません。
プロジェクトの詳細については [Knative のドキュメント](https://knative.dev/docs/)を参照してください。

### Knative のデータフロー {#knative-data-flow}

トレーシングの詳細に入る前に、データフローの例を見てみましょう。
これにより Knative のアーキテクチャと、リクエストやトランザクションのタイミング特性を理解するためにシステムのどの部分を計装する必要があるかがわかります。
以下の図には2つのユーザーワークロード（first と second）があり、(1. HTTP) としてマークされた受信リクエストがユーザーワークロード first を経由し、次にクラウドイベントメッセージとしてワークロード second に到達します。

![Knative のデータフロー：受信 HTTP リクエストは Knative サービスと queue-proxy サイドカーコンテナを経由してワークロードに到達する](knative-data-flow.jpg)

この図には2つの重要な事実があります。

1. すべてのトラフィックは queue-proxy サイドカーを経由する
2. すべてのトラフィックは Knative コンポーネントを経由する。
   図中の Knative コンポーネントは抽象的なものです。
   Knative activator サービス、Knative event broker、dispatcher などがこれに該当します。

テレメトリーの観点では、queue-proxy の目的は Istio サービスメッシュの istio-proxy と似ています。
ワークロードへのすべてのトラフィックを傍受するプロキシであり、ワークロードへの通信やワークロードからの通信に対してテレメトリーデータを生成します。

## Knative における分散トレーシング {#distributed-tracing-in-knative}

Knative プロジェクトには、堅実な分散トレーシング統合が備わっています。
システムの主要な部分はすでに計装されており、ユーザーワークロードに到達するトランザクション/リクエストに対してトレースデータを生成します。

現時点では、Knative は内部的に OpenCensus 計装ライブラリを使用しており、Zipkin 形式でデータをエクスポートしています。
プロセス間のコンテキスト伝搬には [Zipkin B3](https://github.com/openzipkin/b3-propagation) と [W3C Trace-Context](https://www.w3.org/TR/trace-context/) 標準を使用しています。
Zipkin B3 伝搬形式は、おそらく古い技術で計装された古いワークロードとのトレースコンテキスト伝搬を可能にするために、レガシーな理由で使用されています。
ベストプラクティスとして、OpenTelemetry プロジェクトでネイティブに使用されている標準の W3C Trace-Context を使用してください。

次に、2つのワークロード（first と second）を使ったトレースの例を見てみましょう。
ワークフローは前のセクションの図と似ています。
first サービスが HTTP 呼び出しを受信し、second サービスにクラウドイベントを送信します。
完全なデモソースコードは [pavolloffay/knative-tracing](https://github.com/pavolloffay/knative-tracing) にあります。

![Knative トレースを表示する Jaeger のスクリーンショット](jaeger-knative-trace.jpg)

トレースには、activator、first ワークロード、broker-ingress、imc-dispatcher、broker-filter、activator、second ワークロードの各サービスが相互作用していることが示されています。
多くのサービスがありますね。
2つのワークロードの単純なやり取りが、多くの Knative 内部コンポーネントを示すトレースになりました。
オブザーバビリティの観点からは、インフラストラクチャの問題を示し、さらに Knative のリクエスト処理に関連するコストを示すことができるため、これは素晴らしいことです。

データフローを簡単に確認しましょう。
受信 HTTP リクエストはまずワークロードのスケールアップを担当する activator サービスを通過し、次に first ワークロードに到達します。
first ワークロードはクラウドイベントを送信し、それが broker と dispatcher を経由して最終的に second ワークロードに到達します。

次に、ユーザーワークロードを詳しく見てみましょう。
first サービスは単一の REST API エンドポイントを持つ Golang サービスです。
エンドポイントの実装はクラウドイベントを作成し、broker に送信します。
オブザーバビリティの観点から重要な事実を見てみましょう。

- REST API は OpenTelemetry で計装されています。
  これにより、Knative activator サービスで開始されたトレースをワークロードで作成されたスパンとリンクし、さらに送信スパン（たとえば second サービスへの呼び出し）とリンクできます。
- ワークロードは計装された [Cloudevents クライアント/SDK](https://github.com/cloudevents/sdk-go/tree/15a1151928556770f2a76faa5547278545fce8cb/observability/opentelemetry/v2?from_branch=main) を使用しています。
  前述と同様に、送信リクエストでトレースを継続できます（このシナリオでは second サービスへ）。

サンプルアプリケーションでは、トレースコンテキスト（`traceId`、`spanId`、`sampled` フラグ）はどのように伝搬されるのでしょうか。
トレースコンテキストは、first サービスへの受信 HTTP リクエストと、second サービスに送信されるクラウドイベントの両方で HTTP ヘッダーに伝搬されます。
トレースコンテキストはイベントの拡張/属性に直接付与されません。

以下は first サービスのリクエストヘッダーのログ出力です。

```nocode
2022/02/17 12:53:48 Request headers:
2022/02/17 12:53:48 	X-B3-Sampled: [1]
2022/02/17 12:53:48 	X-B3-Spanid: [af6c239eb7b39349]
2022/02/17 12:53:48 	X-B3-Traceid: [5f2c4775e0e36efc1d554a0b6c456cc1]
2022/02/17 12:53:48 	X-Forwarded-For: [10.244.0.12, 10.244.0.5]
2022/02/17 12:53:48 	Accept-Language: [en,fr;q=0.9,de;q=0.8,sk;q=0.7]
2022/02/17 12:53:48 	Cookie: [_ga=GA1.2.260863911.1644918876]
2022/02/17 12:53:48 	Accept: [text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9]
2022/02/17 12:53:48 	K-Proxy-Request: [activator]
2022/02/17 12:53:48 	Upgrade-Insecure-Requests: [1]
2022/02/17 12:53:48 	User-Agent: [Mozilla/5.0 (X11; Fedora; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4758.80 Safari/537.36]
2022/02/17 12:53:48 	X-Request-Id: [ee2797b5-1ee9-408e-b1ff-d5e5431977e6]
2022/02/17 12:53:48 	Cache-Control: [max-age=0]
2022/02/17 12:53:48 	X-Forwarded-Proto: [http]
2022/02/17 12:53:48 	Traceparent: [00-5f2c4775e0e36efc1d554a0b6c456cc1-af6c239eb7b39349-01]
2022/02/17 12:53:48 	Accept-Encoding: [gzip, deflate]
2022/02/17 12:53:48 	Forwarded: [for=10.244.0.12;proto=http]
2022/02/17 12:53:48 Response headers:
2022/02/17 12:53:48 	Traceparent: [00-5f2c4775e0e36efc1d554a0b6c456cc1-1cf3f827eba96bf2-01]
2022/02/17 12:53:48
```

次に、Knative イベントを消費するための API を公開している second サービスのログを見てみましょう。
この場合のイベント API は単なる HTTP エンドポイントであり、これはクラウドイベントの実装の詳細です。

```nocode
2022/02/17 13:39:36 Event received: Context Attributes,
  specversion: 1.0
  type: httpbody
  source: github/com/pavolloffay
  id: fad4139c-b3fb-48b2-b0f4-fee44addc5f1
  time: 2022-02-17T13:39:34.426355726Z
  datacontenttype: text/plain
Extensions,
  knativearrivaltime: 2022-02-17T13:39:34.491325425Z
Data,
  hello from first, traceid=5f2c4775e0e36efc1d554a0b6c456cc1
```

トレースコンテキストはイベントオブジェクトに直接含まれていないことがわかります。
ただし、受信トランスポートメッセージ（HTTP ヘッダー）にエンコードされています。

### 今後の改善 {#future-improvements}

前のセクションでは、Knative の serving と eventing コンポーネントが OpenCensus SDK で計装されていることを述べました。
計装は将来的に OpenTelemetry に変更される予定であり、[knative/eventing/#3126](https://github.com/knative/eventing/issues/3126) と [knative/pkg#855](https://github.com/knative/pkg/issues/855) で追跡されています。
SDK の変更はユーザーに即座に影響を与えない可能性がありますが、ユーザーが OpenTelemetry 形式（OTLP）でネイティブにデータをレポートし始めることを可能にします。

もう1つの最近マージされた変更は、[OpenTelemetry 仕様への Cloudevents セマンティック属性の追加](/docs/specs/semconv/cloudevents/cloudevents-spans/)です。
このドキュメントは CloudEvents に関連する属性を標準化しています。
以下のスクリーンショットは、まだ標準化された属性名を使用していないデモアプリケーションのものです。

![Knative の属性を表示する Jaeger のスクリーンショット](jaeger-knative-attributes.jpg)

### 設定 {#configuration}

Knative でのトレーシングは簡単に有効化できます。
ステップバイステップのガイドについては[公式ドキュメント](https://knative.dev/docs/)を参照してください。
ここでは簡単にプロセスを説明します。

1. Zipkin 形式のトレーシングデータを取り込めるトレーシングシステムをデプロイする（Zipkin、Jaeger、または OpenTelemetry Collector）
2. [Knative eventing](https://knative.dev/docs/eventing/accessing-traces/) でトレーシングを有効化する
3. [Knative serving](https://knative.dev/docs/serving/accessing-traces/) でトレーシングを有効化する

最初に、クラスター内のすべてのトラフィックのトレースデータをキャプチャするために、100% のサンプリングレート設定を使用することをお勧めします。
これによりサンプリングに関する問題を回避できますが、本番環境に移行する際にはこの設定を変更することを忘れないでください。

## まとめ {#conclusion}

Knative プロジェクトがすぐに利用できる分散トレーシング機能と、ユーザーからの追加作業が必要な部分について学びました。
一般的に、Knative はリッチなトレーシングデータを生成しますが、ワークロードの計装とトレースコンテキストが受信リクエストから送信リクエストやイベントに正しく伝搬されることを保証するのは、いつものようにユーザーの責任です。
これは、サービスメッシュで分散トレーシングを実装する場合とまったく同じ状況です。

OpenTelemetry はユーザーワークロードの計装とトレースコンテキストの正しい伝搬を支援します。
言語によっては、ユーザーはコード内で計装ライブラリを明示的に初期化するか、[ワークロードに OpenTelemetry 自動計装を動的に注入する](https://medium.com/opentelemetry/using-opentelemetry-auto-instrumentation-agents-in-kubernetes-869ec0f42377)こともできます。

## 参考文献 {#references}

- [Knative ドキュメント](https://knative.dev/docs/)
  - [Knative serving トレーシング設定](https://knative.dev/docs/serving/accessing-traces/)
  - [Knative eventing トレーシング設定](https://knative.dev/docs/eventing/accessing-traces/)
- [Cloud events](https://cloudevents.io)
- [Zipkin B3](https://github.com/openzipkin/b3-propagation)
- [W3C Trace-Context](https://www.w3.org/TR/trace-context/)
- [Cloudevents Golang SDK 用 OpenTelemetry 計装](https://github.com/cloudevents/sdk-go/tree/15a1151928556770f2a76faa5547278545fce8cb/observability/opentelemetry/v2?from_branch=main)
- [Cloudevents OpenTelemetry 属性](/docs/specs/semconv/cloudevents/cloudevents-spans/)
- [Knative トレーシングデモ](https://github.com/pavolloffay/knative-tracing)
