---
title: OpenTelemetry Node.js トレーシングの問題をトラブルシューティングするためのチェックリスト
linkTitle: Node.js トレーシングの問題のトラブルシューティング
date: 2022-02-22
canonical_url: https://www.aspecto.io/blog/checklist-for-troubleshooting-opentelemetry-nodejs-tracing-issues
author: '[Amir Blum](https://github.com/blumamir) (Aspecto)'
default_lang_commit: e5be8d8d487dcaa1e3962964536084b9438db5fd
cSpell:ignore: bootcamp Parentfor
---

この記事は短く要点をまとめたいと思います。
おそらくあなたは、Node.js アプリケーションに OpenTelemetry をインストールしたものの、トレースが表示されない、または期待するスパンが欠落しているためにここにたどり着いたのでしょう。

原因はさまざまですが、よくある原因がいくつかあります。
この記事では、よくある原因をいくつかの診断方法やヒントとともに紹介します。

## 前提条件 {#requirements}

OpenTelemetry の基本的な知識とその仕組みを理解しており、Node.js アプリケーションにセットアップを試みたことがあることを前提としています。

### ロギングの有効化 {#enable-logging}

OpenTelemetry JS はデフォルトでは診断ロガーに何もログを出力しません。
以下に記載する SDK の問題の多くは、ロガーを有効にすると簡単に検出できます。

サービス内のできるだけ早い段階で次のコードを追加することで、すべてのログをコンソールに出力できます。

```js
// tracing.ts または main の index.ts
import { diag, DiagConsoleLogger, DiagLogLevel } from '@opentelemetry/api';
diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.DEBUG);
// 残りの OTel 初期化コード
```

これはデバッグに役立ちます。
本番環境ですべてをコンソールに出力するのはよくないため、問題が解決したら削除するか無効にしてください。

ヒント: `OTEL_LOG_LEVEL` 環境変数を使って `DiagLogLevel` を設定すると、簡単にオン・オフを切り替えられます。

## 自動計装ライブラリ {#auto-instrumentation-libraries}

多くのユーザーは自動計装ライブラリを使用しています。
これは、広く使われているパッケージ（DB ドライバー、HTTP フレームワーク、クラウドサービス SDK など）の重要な操作に対して自動的にスパンを作成します。

一部の初期化パターンや設定オプションによって、サービスがスパンを作成できなくなることがあります。

自動計装ライブラリの問題を切り分けるために、まず手動でスパンを作成してみてください。
手動のスパンは表示されるが、インストールした自動計装ライブラリからのスパンが表示されない場合は、このセクションを読み進めてください。

```js
import { trace } from '@opentelemetry/api';
trace
  .getTracerProvider()
  .getTracer('debug')
  .startSpan('test manual span')
  .end();
```

### インストールと有効化 {#install-and-enable}

サービスで自動計装ライブラリを使用するには、次の手順が必要です。

1. インストール: `npm install @opentelemetry/instrumentation-foo`。
   利用可能な計装は OpenTelemetry Registry で検索できます。
2. 計装オブジェクトの作成: `new FooInstrumentation(config)`
3. 計装が有効であることの確認: `registerInstrumentations(...)` を呼び出す
4. 正しい TracerProvider を使用していることの確認

ほとんどのユーザーにとっては、次のコードで十分です。

```js
// 最初に実行: npm install @opentelemetry/instrumentation-foo @opentelemetry/instrumentation-bar
// foo と bar を実際に計装が必要なパッケージに置き換えてください（HTTP/mySQL/Redis など）
import { FooInstrumentation } from '@opentelemetry/instrumentation-foo';
import { BarInstrumentation } from '@opentelemetry/instrumentation-bar';
import { registerInstrumentations } from '@opentelemetry/instrumentation';
// TracerProvider、SpanProcessor、SpanExporter を作成
registerInstrumentations({
  instrumentations: [new FooInstrumentation(), new BarInstrumentation()],
});
```

`registerInstrumentations` のかわりに低レベル API を使用する上級ユーザーは、計装が正しいトレーサープロバイダーを使用するように設定されていること、そして必要に応じて `enable()` を呼び出していることを確認してください。

### 有効化してから require する {#enable-before-require}

すべての計装は、まず有効化してから計装対象のパッケージを require する必要があるように設計されています。
**よくある間違いは、計装ライブラリを有効にする前にパッケージを require してしまうことです**。

以下は**悪い**例です。

```js
import { NodeTracerProvider } from '@opentelemetry/sdk-trace-node';
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import {
  SimpleSpanProcessor,
  ConsoleSpanExporter,
} from '@opentelemetry/sdk-trace-base';
import http from 'http'; // ⇐ 悪い例 - この時点では計装はまだ登録されていない
const provider = new NodeTracerProvider();
provider.addSpanProcessor(new SimpleSpanProcessor(new ConsoleSpanExporter()));
provider.register();
registerInstrumentations({ instrumentations: [new HttpInstrumentation()] });
// http を使用するアプリケーションコード
```

ほとんどの場合、計装コードはアプリケーションコードとは別のファイルやパッケージに存在するため、発見が難しくなります。
サーバーレスなどのフレームワークでは、計装コードが実行される前にパッケージをインポートしてしまうことがあります。
これは見落としやすい問題です。

この問題を診断するには、ロギングを有効にして、計装ライブラリがロードされていることを確認してください。
たとえば以下のようなログが出力されます。

```nocode
@opentelemetry/instrumentation-http Applying patch for https@12.22.9
```

このログが出力されない場合、自動計装ライブラリが適用されていない可能性があります。

### ライブラリの設定 {#library-configuration}

一部の自動計装ライブラリには、**計装をスキップするタイミング**を制御するカスタム設定があります。
たとえば、HTTP 計装には `ignoreIncomingRequestHook` や `requireParentforOutgoingSpans` などのオプションがあります。

特定のケースでは、一部のライブラリは**デフォルトでは計装を行わず**、スパンを取得するには明示的にオプトインする必要があります。
たとえば、`ioredis` 計装では、親スパンのない内部操作に対してスパンを作成するために `requireParentSpan = true` を設定する必要があります。

ライブラリのスパンが表示されない場合は、設定を調整してスパンが表示されるようにする必要があるかもしれません。

### 計装対象ライブラリのバージョン {#instrumented-library-version}

自動計装ライブラリは、通常、計装対象のライブラリのすべてのバージョンをサポートしているわけではありません。
使用しているバージョンが古すぎる場合や非常に新しい場合、サポートされていない可能性があり、スパンが作成されません。

使用しているライブラリのドキュメントを参照して、バージョンが互換性があるか確認してください。
この情報は通常、計装の README に記載されています。
たとえば、[Redis README][] を参照してください。

[Redis readme]: https://www.npmjs.com/package/@opentelemetry/instrumentation-redis

## 記録なしスパンと非サンプリングスパン {#no-recording-and-non-sampled-spans}

アプリケーションで作成されたすべてのスパンがエクスポートされるわけではありません。
スパンは「サンプリングされない」または「記録されない」とマークされることがあり、その場合はバックエンドに表示されません。

これらの問題を切り分けるために、サンプリングの判定のみを出力する「デバッグスパンプロセッサー」を組み込むことができます。
「span sampled: false」がコンソールに出力された場合は、このセクションを読み進めてください。

```js
import { NodeTracerProvider } from '@opentelemetry/sdk-trace-node';
import { ReadableSpan } from '@opentelemetry/sdk-trace-base';
import { trace, Span, Context, TraceFlags } from '@opentelemetry/api';
const provider = new NodeTracerProvider();
provider.addSpanProcessor({
  forceFlush: async () => {},
  onStart: (_span: Span, _parentContext: Context) => {},
  onEnd: (span: ReadableSpan) => {
    const sampled = !!(span.spanContext().traceFlags & TraceFlags.SAMPLED);
    console.log(`span sampled: ${sampled}`);
  },
  shutdown: async () => {},
});
provider.register();
```

### NoopTracerProvider {#nooptracerprovider}

有効な TracerProvider を作成して登録しないと、アプリケーションはデフォルトの TracerProvider で実行され、すべてのスパンが NonRecordingSpan として開始されます。

アプリケーションのできるだけ早い段階で、次のようなコードが必要です。

```js
import { NodeTracerProvider } from '@opentelemetry/sdk-trace-node';
import {
  ConsoleSpanExporter,
  SimpleSpanProcessor,
} from '@opentelemetry/sdk-trace-base';
const provider = new NodeTracerProvider();
provider.addSpanProcessor(new SimpleSpanProcessor(new ConsoleSpanExporter()));
provider.register();
```

### リモートサンプリングの判定 {#remote-sampling-decision}

デフォルトのサンプリング動作（非常に一般的な動作）は、各スパンが親からサンプリングの判定を継承することです。
サービスを呼び出したコンポーネントが**サンプリングしないように設定されている**場合、そのサービスからの**スパンも表示されません**。

例としては、次のようなケースがあります。

- API ゲートウェイがサンプリングロジックで設定されている、またはトレースがオフになっている場合、すべてのダウンストリームのトレースに影響を与える可能性があります（サンプリングが必要な無関係なサービスも含む）。
- サービスを呼び出す外部ユーザーも計装されている可能性があり、独自のサンプリングの判定を行います（これは制御できません）。
  これらのサンプリングの判定はサービスに伝搬され、影響を与えます。
- システム内の他のサービスが、ローカルのニーズや視点に基づいてサンプリングの判定を行うことがあります。
  上流のサービスエンドポイントで重要でないエンドポイントをサンプリングしないように設定するのは簡単ですが、そのエンドポイントが下流の非常に重要なエンドポイント（サンプリングしたいもの）を呼び出していることに気づかない場合があります。

### ローカルサンプラー {#local-sampler}

ローカルサンプラーを設定して、一部のスパンをサンプリングするか、まったくサンプリングしないようにできます。
設定が別の人によってかなり前に書かれたものであったり、複雑でわかりにくい場合、スパンが正当にサンプリングされずエクスポートもされないことがあり、見落としやすくなります。

## エクスポートの問題 {#exporting-issues}

サービスがスパンを生成しているにもかかわらず、バックエンドに正しくエクスポートされていない、または Collector で何らかの理由で破棄されている可能性があります。

エクスポートの問題を切り分けるために、「ConsoleExporter」を追加してみてください。
スパンがコンソールにはエクスポートされるが、エクスポート先のバックエンドには表示されない場合は、このセクションを読み進めてください。

```js
import { NodeTracerProvider } from '@opentelemetry/sdk-trace-node';
import {
  ConsoleSpanExporter,
  SimpleSpanProcessor,
} from '@opentelemetry/sdk-trace-base';
const provider = new NodeTracerProvider();
provider.addSpanProcessor(new SimpleSpanProcessor(new ConsoleSpanExporter()));
provider.register();
```

### エクスポーターの設定 {#configuring-an-exporter}

サービスには次のようなスパンエクスポートコードが必要です。

```js
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-proto';
// TracerProvider を作成
const exporter = new OTLPTraceExporter();
provider.addSpanProcessor(new BatchSpanProcessor(exporter));
```

この例では `@opentelemetry/exporter-trace-otlp-proto` を使用していますが、他にも選択できるエクスポーターがあり、それぞれにいくつかの設定オプションがあります。
これらのオプションのいずれかにエラーがあるとエクスポートが失敗しますが、デフォルトではこの失敗はサイレントに無視されます。

よくある設定エラーのいくつかを以下のサブセクションで説明します。

### OTLP エクスポーター {#otlp-exporters}

- **フォーマット** — OTLP は `http/json`、`http/proto`、`grpc` フォーマットをサポートしています。
  OTLP Collector がサポートするフォーマットに合ったエクスポーターパッケージを選択する必要があります。
- **パス** — HTTP の Collector エンドポイントを設定する場合（コード内の設定または環境変数で）、**パスも設定する必要があります**。
  `http://my-collector-host:4318/v1/traces` のように指定します。
  パスを忘れると、エクスポートが失敗します。
  gRPC では、パスを追加してはいけません: "grpc://localhost:4317"。
  最初は混乱しやすいかもしれません。
- **セキュア接続** — Collector がセキュアな接続を期待するか、インセキュアな接続を期待するか確認してください。
  HTTP では、URL スキーム（`http:` / `https:`）で決まります。
  gRPC では、スキームは影響せず、接続のセキュリティは credentials パラメーターによってのみ設定されます: `grpc.credentials.createSsl()`、`grpc.credentials.createInsecure()` など。
  HTTP と gRPC の両方のデフォルトのセキュリティは**インセキュア**です。

### Jaeger エクスポーター {#jaeger-exporter}

Jaeger エクスポーターは「エージェント」モード（UDP 経由）と「コレクター」モード（TCP 経由）で動作できます。
どちらを使用するかを決めるロジックはやや混乱しやすく、ドキュメントが不足しています。
エクスポーター設定で `endpoint` パラメーターを渡すか、`OTEL_EXPORTER_JAEGER_ENDPOINT` 環境変数を設定すると、エクスポーターは「コレクター」HTTP センダーを使用します。
そうでなければ、`param` で設定された `host`、`OTEL_EXPORTER_JAEGER_AGENT_HOST`、または `localhost:6832` に対して UDP センダーで「エージェント」モードでエクスポートします。

### ベンダーのクレデンシャル設定 {#setting-vendor-credentials}

トレーシングバックエンドとしてベンダーを使用している場合、認証ヘッダーなどの追加情報を設定する必要があるかもしれません。
たとえば、Aspecto にトレースを送信する場合、次のように Aspecto トークンを Authorization ヘッダーとして追加する必要があります。

```js
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-proto';
// TracerProvider を作成
const exporter = new OTLPTraceExporter({
  url: 'https://otelcol.aspecto.io/v1/trace',
  headers: {
    Authorization: 'YOUR_API_KEY_HERE',
  },
});
provider.addSpanProcessor(new BatchSpanProcessor(exporter));
```

設定しない場合、ベンダーのアカウントでデータを確認できません。

### フラッシュとシャットダウン {#flush-and-shutdown}

サービスが停止したり Lambda 関数が終了したりするとき、すべてのスパンがまだ Collector に正常にエクスポートされていない可能性があります。
トレーサープロバイダーの shutdown 関数を呼び出し、返された Promise を await して、すべてのデータが送信されたことを確認する必要があります。

```js
import { NodeTracerProvider } from '@opentelemetry/sdk-trace-node';
const provider = new NodeTracerProvider();
provider.register();
// サービスを終了するとき、provider の shutdown を呼び出す:
provider.shutdown();
```

## パッケージバージョンの互換性 {#package-versions-compatibility}

SDK と計装ライブラリの互換性がないバージョンや古いバージョンが原因で問題が発生することがあります。

### SDK バージョン {#sdk-versions}

SDK と API パッケージが古くなく、互いに互換性があることを確認することをお勧めします。
npm install 時にピア依存関係の警告が表示されないことを確認してください。

### 他の APM ライブラリ {#other-apm-libraries}

OpenTelemetry は、モンキーパッチを使用する他の APM ライブラリとの互換性が保証されていません。
そのようなパッケージがインストールされている場合は、それを削除するか無効にして、問題が解消されるか確認してください。

## 次のステップ {#whats-next}

### ヘルプを得る場所 {#where-to-get-help}

上記のいずれの方法でも問題が解決しない場合は、次のチャンネルで助けを求めることができます。

- [CNCF `#otel-js`](https://cloud-native.slack.com/archives/C01NL1GRPQR) Slack チャンネル
- [CNCF `#opentelemetry-bootcamp`](https://cloud-native.slack.com/messages/opentelemetry-bootcamp) Slack チャンネル
- GitHub [ディスカッションページ](https://github.com/open-telemetry/opentelemetry-js/discussions)

### リソース {#resources}

- [Opentelemetry-js GitHub リポジトリ](https://github.com/open-telemetry/opentelemetry-js)
- [The OpenTelemetry Bootcamp](https://www.aspecto.io/opentelemetry-bootcamp/)
- [OpenTelemetry ドキュメント](/docs/)

### ベンダーを使うべきか {#should-i-use-a-vendor}

もう一つの選択肢として、ベンダーが提供する OpenTelemetry のディストリビューションを使用する方法があります。
これらのディストリビューションは時間と労力を節約できます。

- テクニカルサポート
- 一般的なユーザーと上級ユーザー向けに人気の機能が事前設定済み
- 最新の OpenTelemetry バージョンに対応
- ベストプラクティスの実装と上記の落とし穴の回避

OpenTelemetry ベンダーの一覧は、[ベンダー](/ecosystem/vendors/)を参照してください。

_この記事のオリジナル版は Aspecto ブログに[掲載されました][originally posted]。_

[originally posted]: <{{% param canonical_url %}}>
