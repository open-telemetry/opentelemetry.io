---
title: 伝搬
description: JS SDKのコンテキスト伝搬
weight: 65
default_lang_commit: 276d7eb3f936deef6487cdd2b1d89822951da6c8
cSpell:ignore: rolldice
---

{{% docs/languages/propagation %}}

## 自動コンテキスト伝搬 {#automatic-context-propagation}

[`@opentelemetry/instrumentation-http`](https://www.npmjs.com/package/@opentelemetry/instrumentation-http)や[`@opentelemetry/instrumentation-express`](https://www.npmjs.com/package/@opentelemetry/instrumentation-express)などの[計装ライブラリ](../libraries/)は、サービス間でのコンテキストの伝搬を自動的に行います。

[Getting Startedガイド](../getting-started/nodejs)に従った場合、`/rolldice`エンドポイントにクエリを送信するクライアントアプリケーションを作成できます。

{{% alert title="注意" %}}

この例は、他の言語のGetting Startedガイドのサンプルアプリケーションと組み合わせることもできます。相関は異なる言語で書かれたアプリケーション間でも違いなく動作します。

{{% /alert %}}

まず、`dice-client`という新しいフォルダを作成し、必要な依存関係をインストールします。

{{< tabpane text=true >}} {{% tab TypeScript %}}

```sh
npm init -y
npm install undici \
  @opentelemetry/instrumentation-undici \
  @opentelemetry/sdk-node
npm install -D tsx  # TypeScript (.ts)ファイルをnodeで直接実行するためのツール
```

{{% /tab %}} {{% tab JavaScript %}}

```sh
npm init -y
npm install undici \
  @opentelemetry/instrumentation-undici \
  @opentelemetry/sdk-node
```

{{% /tab %}} {{< /tabpane >}}

次に、`client.ts`（または`client.js`）という新しいファイルを以下の内容で作成します。

{{< tabpane text=true >}} {{% tab TypeScript %}}

```ts
/* client.ts */
import { NodeSDK } from '@opentelemetry/sdk-node';
import {
  SimpleSpanProcessor,
  ConsoleSpanExporter,
} from '@opentelemetry/sdk-trace-node';
import { UndiciInstrumentation } from '@opentelemetry/instrumentation-undici';

const sdk = new NodeSDK({
  spanProcessors: [new SimpleSpanProcessor(new ConsoleSpanExporter())],
  instrumentations: [new UndiciInstrumentation()],
});
sdk.start();

import { request } from 'undici';

request('http://localhost:8080/rolldice').then((response) => {
  response.body.json().then((json: any) => console.log(json));
});
```

{{% /tab %}} {{% tab JavaScript %}}

```js
/* instrumentation.mjs */
import { NodeSDK } from '@opentelemetry/sdk-node';
import {
  SimpleSpanProcessor,
  ConsoleSpanExporter,
} from '@opentelemetry/sdk-trace-node';
import { UndiciInstrumentation } from '@opentelemetry/instrumentation-undici';

const sdk = new NodeSDK({
  spanProcessors: [new SimpleSpanProcessor(new ConsoleSpanExporter())],
  instrumentations: [new UndiciInstrumentation()],
});
sdk.start();

const { request } = require('undici');

request('http://localhost:8080/rolldice').then((response) => {
  response.body.json().then((json) => console.log(json));
});
```

{{% /tab %}} {{< /tabpane >}}

[Getting Started](../getting-started/nodejs)の計装された`app.ts`（または`app.js`）が一つのシェルで実行されていることを確認してください。

{{< tabpane text=true >}} {{% tab TypeScript %}}

```console
$ npx tsx --import ./instrumentation.ts app.ts
Listening for requests on http://localhost:8080
```

{{% /tab %}} {{% tab JavaScript %}}

```console
$ node --import ./instrumentation.mjs app.js
Listening for requests on http://localhost:8080
```

{{% /tab %}} {{< /tabpane >}}

二つ目のシェルを開始し、`client.ts`（または`client.js`）を実行します。

{{< tabpane text=true >}} {{% tab TypeScript %}}

```shell
npx tsx client.ts
```

{{% /tab %}} {{% tab JavaScript %}}

```shell
node client.js
```

{{% /tab %}} {{< /tabpane >}}

両方のシェルはスパンの詳細をコンソールに出力するはずです。
クライアントの出力は以下のようになります。

```javascript {hl_lines=[7,11]}
{
  resource: {
    attributes: {
      // ...
    }
  },
  traceId: 'cccd19c3a2d10e589f01bfe2dc896dc2',
  parentSpanContext: undefined,
  traceState: undefined,
  name: 'GET',
  id: '6f64ce484217a7bf',
  kind: 2,
  timestamp: 1718875320295000,
  duration: 19836.833,
  attributes: {
    'url.full': 'http://localhost:8080/rolldice',
    // ...
  },
  status: { code: 0 },
  events: [],
  links: []
}
```

traceId（`cccd19c3a2d10e589f01bfe2dc896dc2`）とID（`6f64ce484217a7bf`）をメモしてください。
両方はクライアントの出力でも見つけることができます。

```javascript {hl_lines=[6,9]}
{
  resource: {
    attributes: {
      // ...
  },
  traceId: 'cccd19c3a2d10e589f01bfe2dc896dc2',
  parentSpanContext: {
    traceId: 'cccd19c3a2d10e589f01bfe2dc896dc2',
    spanId: '6f64ce484217a7bf',
    traceFlags: 1,
    isRemote: true
  },
  traceState: undefined,
  name: 'GET /rolldice',
  id: '027c5c8b916d29da',
  kind: 1,
  timestamp: 1718875320310000,
  duration: 3894.792,
  attributes: {
    'http.url': 'http://localhost:8080/rolldice',
    // ...
  },
  status: { code: 0 },
  events: [],
  links: []
}
```

クライアントとサーバーアプリケーションは接続されたスパンを正常に報告します。これらを今バックエンドに送信すると、視覚化でこの依存関係が表示されます。

## 手動コンテキスト伝搬 {#manual-context-propagation}

前のセクションで説明したように、コンテキストを自動的に伝搬できない場合があります。
サービス間の通信に使用するライブラリに対応する計装ライブラリが存在しない場合があります。
または、そのようなライブラリが存在していても満たせない要件がある場合があります。

コンテキストを手動で伝搬する必要がある場合は、[コンテキストAPI](/docs/languages/js/context)を使用できます。

### 汎用例 {#generic-example}

以下の汎用例では、トレースコンテキストを手動で伝搬する方法を示します。

まず、送信側のサービスで、現在の`context`を注入する必要があります。

{{< tabpane text=true >}} {{% tab TypeScript %}}

```typescript
// 送信側サービス
import { context, propagation, trace } from '@opentelemetry/api';

// トレース情報を保持する出力オブジェクトのインターフェースを定義
interface Carrier {
  traceparent?: string;
  tracestate?: string;
}

// そのインターフェースに準拠する出力オブジェクトを作成
const output: Carrier = {};

// traceparentとtracestateをコンテキストから出力オブジェクトに
// シリアライズ
//
// この例ではアクティブなトレースコンテキストを使用していますが、
// シナリオに適したコンテキストを使用できます
propagation.inject(context.active(), output);

// 出力オブジェクトからtraceparentとtracestate値を抽出
const { traceparent, tracestate } = output;

// その後、traceparentとtracestateデータを
// サービス間でプロパゲートするために使用する
// メカニズムに渡すことができます
```

{{% /tab %}} {{% tab JavaScript %}}

```js
// 送信側サービス
const { context, propagation } = require('@opentelemetry/api');
const output = {};

// traceparentとtracestateをコンテキストから出力オブジェクトに
// シリアライズ
//
// この例ではアクティブなトレースコンテキストを使用していますが、
// シナリオに適したコンテキストを使用できます
propagation.inject(context.active(), output);

const { traceparent, tracestate } = output;
// その後、traceparentとtracestateデータを
// サービス間でプロパゲートするために使用する
// メカニズムに渡すことができます
```

{{% /tab %}} {{< /tabpane >}}

受信側のサービスでは、`context`を（たとえば、解析されたHTTPヘッダーから）抽出し、それらを現在のトレースコンテキストとして設定する必要があります。

{{< tabpane text=true >}} {{% tab TypeScript %}}

```typescript
// 受信側サービス
import {
  type Context,
  propagation,
  trace,
  Span,
  context,
} from '@opentelemetry/api';

// 'traceparent'と'tracestate'を含む入力オブジェクトのインターフェースを定義
interface Carrier {
  traceparent?: string;
  tracestate?: string;
}

// "input"が'traceparent'と'tracestate'キーを持つオブジェクトと仮定
const input: Carrier = {};

// 'traceparent'と'tracestate'データをコンテキストオブジェクトに抽出
//
// その後、このコンテキストをトレースのアクティブコンテキストとして
// 扱うことができます
let activeContext: Context = propagation.extract(context.active(), input);

let tracer = trace.getTracer('app-name');

let span: Span = tracer.startSpan(
  spanName,
  {
    attributes: {},
  },
  activeContext,
);

// 作成されたスパンを逆シリアル化されたコンテキストでアクティブに設定
trace.setSpan(activeContext, span);
```

{{% /tab %}} {{% tab JavaScript %}}

```js
// 受信側サービス
import { context, propagation, trace } from '@opentelemetry/api';

// "input"が'traceparent'と'tracestate'キーを持つオブジェクトと仮定
const input = {};

// 'traceparent'と'tracestate'データをコンテキストオブジェクトに抽出
//
// その後、このコンテキストをトレースのアクティブコンテキストとして
// 扱うことができます
let activeContext = propagation.extract(context.active(), input);

let tracer = trace.getTracer('app-name');

let span = tracer.startSpan(
  spanName,
  {
    attributes: {},
  },
  activeContext,
);

// 作成されたスパンを逆シリアル化されたコンテキストでアクティブに設定
trace.setSpan(activeContext, span);
```

{{% /tab %}} {{< /tabpane >}}

そこから、逆シリアル化されたアクティブコンテキストがある場合、他のサービスからの同じトレースの一部となるスパンを作成できます。

[Context](/docs/languages/js/context) APIを使用して、逆シリアル化されたコンテキストを他の方法で変更または設定することもできます。

### カスタムプロトコルの例 {#custom-protocol-example}

コンテキストを手動で伝搬する必要がある一般的なユースケースは、サービス間の通信にカスタムプロトコルを使用する場合です。
以下の例では、基本的なテキストベースのTCPプロトコルを使用して、あるサービスから別のサービスにシリアライズされたオブジェクトを送信します。

まず、`propagation-example`という新しいフォルダを作成し、以下のように依存関係で初期化します。

```shell
npm init -y
npm install @opentelemetry/api @opentelemetry/sdk-node
```

次に、以下の内容で`client.js`と`server.js`ファイルを作成します。

```javascript
// client.js
const net = require('net');
const { context, propagation, trace } = require('@opentelemetry/api');

let tracer = trace.getTracer('client');

// サーバーに接続
const client = net.createConnection({ port: 8124 }, () => {
  // シリアライズされたオブジェクトをサーバーに送信
  let span = tracer.startActiveSpan('send', { kind: 1 }, (span) => {
    const output = {};
    propagation.inject(context.active(), output);
    const { traceparent, tracestate } = output;

    const objToSend = { key: 'value' };

    if (traceparent) {
      objToSend._meta = { traceparent, tracestate };
    }

    client.write(JSON.stringify(objToSend), () => {
      client.end();
      span.end();
    });
  });
});
```

```javascript
// server.js
const net = require('net');
const { context, propagation, trace } = require('@opentelemetry/api');

let tracer = trace.getTracer('server');

const server = net.createServer((socket) => {
  socket.on('data', (data) => {
    const message = data.toString();
    // クライアントから受信したJSONオブジェクトを解析
    try {
      const json = JSON.parse(message);
      let activeContext = context.active();
      if (json._meta) {
        activeContext = propagation.extract(context.active(), json._meta);
        delete json._meta;
      }
      span = tracer.startSpan('receive', { kind: 1 }, activeContext);
      trace.setSpan(activeContext, span);
      console.log('Parsed JSON:', json);
    } catch (e) {
      console.error('Error parsing JSON:', e.message);
    } finally {
      span.end();
    }
  });
});

// ポート8124でリッスン
server.listen(8124, () => {
  console.log('Server listening on port 8124');
});
```

最初のシェルでサーバーを実行します。

```console
$ node server.js
Server listening on port 8124
```

次に、二つ目のシェルでクライアントを実行します。

```shell
node client.js
```

クライアントはすぐに終了し、サーバーは以下を出力するはずです。

```text
Parsed JSON: { key: 'value' }
```

この例はこれまでOpenTelemetry APIにのみ依存していたため、すべての呼び出しは[no-op命令](<https://en.wikipedia.org/wiki/NOP_(code)>)であり、クライアントとサーバーはOpenTelemetryが使用されていないかのように動作します。

{{% alert title="注意" color="warning" %}}

これは、サーバーとクライアントコードがライブラリである場合に特に重要です。
ライブラリはOpenTelemetry APIのみを使用するべきだからです。
その理由を理解するには、[ライブラリに計装を追加する方法のコンセプトページ](/docs/concepts/instrumentation/libraries/)を確認してください。

{{% /alert %}}

OpenTelemetryを有効にし、実際のコンテキスト伝搬を確認するために、以下の内容で`instrumentation.js`という追加ファイルを作成します。

```javascript
// instrumentation.mjs
import { NodeSDK } from '@opentelemetry/sdk-node';
import {
  ConsoleSpanExporter,
  SimpleSpanProcessor,
} from '@opentelemetry/sdk-trace-node';

const sdk = new NodeSDK({
  spanProcessors: [new SimpleSpanProcessor(new ConsoleSpanExporter())],
});

sdk.start();
```

このファイルを使用して、計装を有効にしてサーバーとクライアントの両方を実行します。

```console
$ node --import ./instrumentation.mjs server.js
Server listening on port 8124
```

および

```shell
node --import ./instrumentation.mjs client.js
```

クライアントがサーバーにデータを送信して終了した後、両方のシェルのコンソール出力にスパンが表示されるはずです。

クライアントの出力は以下のようになります。

```javascript {hl_lines=[7,11]}
{
  resource: {
    attributes: {
      // ...
    }
  },
  traceId: '4b5367d540726a70afdbaf49240e6597',
  parentId: undefined,
  traceState: undefined,
  name: 'send',
  id: '92f125fa335505ec',
  kind: 1,
  timestamp: 1718879823424000,
  duration: 1054.583,
  // ...
}
```

サーバーの出力は以下のようになります。

```javascript {hl_lines=[7,8]}
{
  resource: {
    attributes: {
      // ...
    }
  },
  traceId: '4b5367d540726a70afdbaf49240e6597',
  parentId: '92f125fa335505ec',
  traceState: undefined,
  name: 'receive',
  id: '53da0c5f03cb36e5',
  kind: 1,
  timestamp: 1718879823426000,
  duration: 959.541,
  // ...
}
```

[手動例](#manual-context-propagation)と同様に、スパンは`traceId`と`id`/`parentId`を使用して接続されています。

## 次のステップ {#next-steps}

伝搬についてさらに学ぶには、[Propagators API仕様](/docs/specs/otel/context/api-propagators/)を確認してください。
