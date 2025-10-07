---
title: Node.js
description: 5分未満でアプリのテレメトリーを取得しましょう！
aliases: [/docs/js/getting_started/nodejs]
weight: 10
default_lang_commit: 276d7eb3f936deef6487cdd2b1d89822951da6c8
cSpell:ignore: autoinstrumentations rolldice
---

このページでは、Node.jsでOpenTelemetryを開始する方法を説明します。

[トレース][traces]と[メトリクス][metrics]の両方を計装し、コンソールにログ出力する方法を学びます。

{{% alert title="注意" %}}

Node.js用のOpenTelemetryのロギングライブラリはまだ開発中のため、以下では例を提供していません。
ステータスの詳細については、[ステータスとリリース](/docs/languages/js/#status-and-releases)を参照してください。

{{% /alert %}}

## 前提条件 {#prerequisites}

以下がローカルにインストールされていることを確認してください。

- [Node.js](https://nodejs.org/en/download/)
- [TypeScript](https://www.typescriptlang.org/download)（TypeScriptを使用する場合）。

## サンプルアプリケーション {#example-application}

以下の例では、基本的な[Express](https://expressjs.com/)アプリケーションを使用します。
Expressを使用していない場合でも問題ありません。
OpenTelemetry JavaScriptは、KoaやNest.JSなどの他のWebフレームワークでも使用できます。
サポートされているフレームワークのライブラリの完全なリストについては、[レジストリ](/ecosystem/registry/?component=instrumentation&language=js)を参照してください。

より詳細な例については、[例](/docs/languages/js/examples/)を参照してください。

### 依存関係 {#dependencies}

まず、新しいディレクトリに空の`package.json`を設定します。

```shell
npm init -y
```

次に、Expressの依存関係をインストールします。

{{< tabpane text=true >}} {{% tab TypeScript %}}

```sh
npm install express @types/express
npm install -D tsx  # TypeScript (.ts)ファイルをnodeで直接実行するためのツール
```

{{% /tab %}} {{% tab JavaScript %}}

```sh
npm install express
```

{{% /tab %}} {{< /tabpane >}}

### HTTPサーバーの作成と起動 {#create-and-launch-an-http-server}

`app.ts`（TypeScriptを使用しない場合は`app.js`）という名前のファイルを作成し、以下のコードを追加します。

{{% tabpane text=true %}} {{% tab TypeScript %}}

```ts
/*app.ts*/
import express, { Express } from 'express';

const PORT: number = parseInt(process.env.PORT || '8080');
const app: Express = express();

function getRandomNumber(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

app.get('/rolldice', (req, res) => {
  res.send(getRandomNumber(1, 6).toString());
});

app.listen(PORT, () => {
  console.log(`Listening for requests on http://localhost:${PORT}`);
});
```

{{% /tab %}} {{% tab JavaScript %}}

```js
/*app.js*/
const express = require('express');

const PORT = parseInt(process.env.PORT || '8080');
const app = express();

function getRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

app.get('/rolldice', (req, res) => {
  res.send(getRandomNumber(1, 6).toString());
});

app.listen(PORT, () => {
  console.log(`Listening for requests on http://localhost:${PORT}`);
});
```

{{% /tab %}} {{% /tabpane %}}

以下のコマンドでアプリケーションを実行し、Webブラウザで<http://localhost:8080/rolldice>を開いて動作を確認します。

{{< tabpane text=true >}} {{% tab TypeScript %}}

```console
$ npx tsx app.ts
Listening for requests on http://localhost:8080
```

{{% /tab %}} {{% tab JavaScript %}}

```console
$ node app.js
Listening for requests on http://localhost:8080
```

{{% /tab %}} {{< /tabpane >}}

## 計装 {#instrumentation}

以下では、OpenTelemetryで計装されたアプリケーションのインストール、初期化、実行方法を示します。

### 追加の依存関係 {#more-dependencies}

まず、Node SDKと自動計装パッケージをインストールします。

Node SDKを使用すると、多くのユースケースで正しいいくつかの設定デフォルトでOpenTelemetryを初期化できます。

`auto-instrumentations-node`パッケージは、ライブラリで呼び出されたコードに対応するスパンを自動的に作成する計装ライブラリをインストールします。
この場合、Expressの計装を提供し、サンプルアプリが各受信リクエストに対して自動的にスパンを作成可能にします。

```shell
npm install @opentelemetry/sdk-node \
  @opentelemetry/api \
  @opentelemetry/auto-instrumentations-node \
  @opentelemetry/sdk-metrics \
  @opentelemetry/sdk-trace-node
```

すべての自動計装モジュールを見つけるには、[レジストリ](/ecosystem/registry/?language=js&component=instrumentation)を参照してください。

### セットアップ {#setup}

計装のセットアップと構成は、アプリケーションコードの _前に_ 実行する必要があります。
このタスクによく使用されるツールの1つは、[--import](https://nodejs.org/api/cli.html#--importmodule)フラグです。

計装セットアップコードを含む`instrumentation.ts`（TypeScriptを使用しない場合は`instrumentation.mjs`）という名前のファイルを作成します。

{{% alert title="注意" %}}
以下の`--import instrumentation.ts`（TypeScript）を使用した例は、Node.js v.20以降が必要です。
Node.js v.18を使用している場合は、JavaScriptの例を使用してください。
{{% /alert %}}

{{< tabpane text=true >}} {{% tab TypeScript %}}

```ts
/*instrumentation.ts*/
import { NodeSDK } from '@opentelemetry/sdk-node';
import { ConsoleSpanExporter } from '@opentelemetry/sdk-trace-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import {
  PeriodicExportingMetricReader,
  ConsoleMetricExporter,
} from '@opentelemetry/sdk-metrics';

const sdk = new NodeSDK({
  traceExporter: new ConsoleSpanExporter(),
  metricReader: new PeriodicExportingMetricReader({
    exporter: new ConsoleMetricExporter(),
  }),
  instrumentations: [getNodeAutoInstrumentations()],
});

sdk.start();
```

{{% /tab %}} {{% tab JavaScript %}}

```js
/*instrumentation.mjs*/
import { NodeSDK } from '@opentelemetry/sdk-node';
import { ConsoleSpanExporter } from '@opentelemetry/sdk-trace-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import {
  PeriodicExportingMetricReader,
  ConsoleMetricExporter,
} from '@opentelemetry/sdk-metrics';

const sdk = new NodeSDK({
  traceExporter: new ConsoleSpanExporter(),
  metricReader: new PeriodicExportingMetricReader({
    exporter: new ConsoleMetricExporter(),
  }),
  instrumentations: [getNodeAutoInstrumentations()],
});

sdk.start();
```

{{% /tab %}} {{< /tabpane >}}

## 計装されたアプリを実行 {#run-the-instrumented-app}

これで、通常どおりアプリケーションを実行できますが、`--import`フラグを使用してアプリケーションコードの前に計装をロードできます。
`NODE_OPTIONS`環境変数に`--require @opentelemetry/auto-instrumentations-node/register`などの競合する`--import`または`--require`フラグがないことを確認してください。

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

Webブラウザで<http://localhost:8080/rolldice>を開き、ページを数回リロードします。
しばらくすると、`ConsoleSpanExporter`によってコンソールにスパンが出力されるのが表示されるはずです。

<details>
<summary>出力例を表示</summary>

```js
{
  resource: {
    attributes: {
      'host.arch': 'arm64',
      'host.id': '8FEBBC33-D6DA-57FC-8EF0-1A9C14B919F8',
      'process.pid': 12460,
      // ... 一部のリソース属性は省略 ...
      'process.runtime.version': '22.17.1',
      'process.runtime.name': 'nodejs',
      'process.runtime.description': 'Node.js',
      'telemetry.sdk.language': 'nodejs',
      'telemetry.sdk.name': 'opentelemetry',
      'telemetry.sdk.version': '2.0.1'
    }
  },
  instrumentationScope: {
    name: '@opentelemetry/instrumentation-express',
    version: '0.52.0',
    schemaUrl: undefined
  },
  traceId: '61e8960c349ca2a3a51289e050fd3b82',
  parentSpanContext: {
    traceId: '61e8960c349ca2a3a51289e050fd3b82',
    spanId: '631b666604f933bc',
    traceFlags: 1,
    traceState: undefined
  },
  traceState: undefined,
  name: 'request handler - /rolldice',
  id: 'd8fcc05ac4f60c99',
  kind: 0,
  timestamp: 1755719307779000,
  duration: 2801.5,
  attributes: {
    'http.route': '/rolldice',
    'express.name': '/rolldice',
    'express.type': 'request_handler'
  },
  status: { code: 0 },
  events: [],
  links: []
}
{
  resource: {
    attributes: {
      'host.arch': 'arm64',
      'host.id': '8FEBBC33-D6DA-57FC-8EF0-1A9C14B919F8',
      'process.pid': 12460,
      // ... 一部のリソース属性は省略 ...
      'process.runtime.version': '22.17.1',
      'process.runtime.name': 'nodejs',
      'process.runtime.description': 'Node.js',
      'telemetry.sdk.language': 'nodejs',
      'telemetry.sdk.name': 'opentelemetry',
      'telemetry.sdk.version': '2.0.1'
    }
  },
  instrumentationScope: {
    name: '@opentelemetry/instrumentation-http',
    version: '0.203.0',
    schemaUrl: undefined
  },
  traceId: '61e8960c349ca2a3a51289e050fd3b82',
  parentSpanContext: undefined,
  traceState: undefined,
  name: 'GET /rolldice',
  id: '631b666604f933bc',
  kind: 1,
  timestamp: 1755719307777000,
  duration: 4705.75,
  attributes: {
    'http.url': 'http://localhost:8080/rolldice',
    'http.host': 'localhost:8080',
    'net.host.name': 'localhost',
    'http.method': 'GET',
    'http.scheme': 'http',
    'http.target': '/rolldice',
    'http.user_agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:141.0) Gecko/20100101 Firefox/141.0',
    'http.flavor': '1.1',
    'net.transport': 'ip_tcp',
    'net.host.ip': '::ffff:127.0.0.1',
    'net.host.port': 8080,
    'net.peer.ip': '::ffff:127.0.0.1',
    'net.peer.port': 63067,
    'http.status_code': 200,
    'http.status_text': 'OK',
    'http.route': '/rolldice'
  },
  status: { code: 0 },
  events: [],
  links: []
}
```

</details>

生成されたスパンは、`/rolldice`ルートへのリクエストの有効期間を追跡します。

エンドポイントにさらにいくつかリクエストを送信します。
しばらくすると、以下のようなメトリクスがコンソール出力に表示されます。

<details>
<summary>出力例を表示</summary>

```js
{
  descriptor: {
    name: 'http.server.duration',
    type: 'HISTOGRAM',
    description: 'Measures the duration of inbound HTTP requests.',
    unit: 'ms',
    valueType: 1,
    advice: {}
  },
  dataPointType: 0,
  dataPoints: [
    {
      attributes: {
        'http.scheme': 'http',
        'http.method': 'GET',
        'net.host.name': 'localhost',
        'http.flavor': '1.1',
        'http.status_code': 200,
        'net.host.port': 8080,
        'http.route': '/rolldice'
      },
      startTime: [ 1755719307, 782000000 ],
      endTime: [ 1755719482, 940000000 ],
      value: {
        min: 1.439792,
        max: 5.775,
        sum: 15.370167,
        buckets: {
          boundaries: [
               0,    5,    10,   25,
              50,   75,   100,  250,
             500,  750,  1000, 2500,
            5000, 7500, 10000
          ],
          counts: [
            0, 5, 1, 0, 0, 0,
            0, 0, 0, 0, 0, 0,
            0, 0, 0, 0
          ]
        },
        count: 6
      }
    },
    {
      attributes: {
        'http.scheme': 'http',
        'http.method': 'GET',
        'net.host.name': 'localhost',
        'http.flavor': '1.1',
        'http.status_code': 304,
        'net.host.port': 8080,
        'http.route': '/rolldice'
      },
      startTime: [ 1755719433, 609000000 ],
      endTime: [ 1755719482, 940000000 ],
      value: {
        min: 1.39575,
        max: 1.39575,
        sum: 1.39575,
        buckets: {
          boundaries: [
               0,    5,    10,   25,
              50,   75,   100,  250,
             500,  750,  1000, 2500,
            5000, 7500, 10000
          ],
          counts: [
            0, 1, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0,
            0, 0, 0, 0
          ]
        },
        count: 1
      }
    }
  ]
}
{
  descriptor: {
    name: 'nodejs.eventloop.utilization',
    type: 'OBSERVABLE_GAUGE',
    description: 'Event loop utilization',
    unit: '1',
    valueType: 1,
    advice: {}
  },
  dataPointType: 2,
  dataPoints: [
    {
      attributes: {},
      startTime: [ 1755719362, 939000000 ],
      endTime: [ 1755719482, 940000000 ],
      value: 0.00843049454565211
    }
  ]
}
{
  descriptor: {
    name: 'v8js.gc.duration',
    type: 'HISTOGRAM',
    description: 'Garbage collection duration by kind, one of major, minor, incremental or weakcb.',
    unit: 's',
    valueType: 1,
    advice: { explicitBucketBoundaries: [ 0.01, 0.1, 1, 10 ] }
  },
  dataPointType: 0,
  dataPoints: [
    {
      attributes: { 'v8js.gc.type': 'minor' },
      startTime: [ 1755719303, 5000000 ],
      endTime: [ 1755719482, 940000000 ],
      value: {
        min: 0.0005120840072631835,
        max: 0.0022552499771118163,
        sum: 0.006526499509811401,
        buckets: { boundaries: [ 0.01, 0.1, 1, 10 ], counts: [ 6, 0, 0, 0, 0 ] },
        count: 6
      }
    },
    {
      attributes: { 'v8js.gc.type': 'incremental' },
      startTime: [ 1755719310, 812000000 ],
      endTime: [ 1755719482, 940000000 ],
      value: {
        min: 0.0003403329849243164,
        max: 0.0012867081165313721,
        sum: 0.0016270411014556885,
        buckets: { boundaries: [ 0.01, 0.1, 1, 10 ], counts: [ 2, 0, 0, 0, 0 ] },
        count: 2
      }
    },
    {
      attributes: { 'v8js.gc.type': 'major' },
      startTime: [ 1755719310, 830000000 ],
      endTime: [ 1755719482, 940000000 ],
      value: {
        min: 0.0025888750553131105,
        max: 0.005744750022888183,
        sum: 0.008333625078201293,
        buckets: { boundaries: [ 0.01, 0.1, 1, 10 ], counts: [ 2, 0, 0, 0, 0 ] },
        count: 2
      }
    }
  ]
}
```

</details>

## 次のステップ {#next-steps}

自動的に生成された計装を、独自のコードベースの[手動計装](/docs/languages/js/instrumentation)で充実させます。
これにより、カスタマイズされたオブザーバビリティデータが得られます。

また、[テレメトリーデータをエクスポート](/docs/languages/js/exporters)するために、1つ以上のテレメトリーバックエンドに適切なエクスポーターを設定する必要があります。

より複雑な例を探索したい場合は、JavaScriptベースの[支払いサービス](/docs/demo/services/payment/)とTypeScriptベースの[フロントエンドサービス](/docs/demo/services/frontend/)を含む[OpenTelemetryデモ](/docs/demo/)をご覧ください。

## トラブルシューティング {#troubleshooting}

何か問題が発生しましたか？
診断ログを有効にして、OpenTelemetryが正しく初期化されているかを確認できます。

{{< tabpane text=true >}} {{% tab TypeScript %}}

```ts
/*instrumentation.ts*/
import { diag, DiagConsoleLogger, DiagLogLevel } from '@opentelemetry/api';

// トラブルシューティングのために、ログレベルをDiagLogLevel.DEBUGに設定
diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.INFO);

// const sdk = new NodeSDK({...
```

{{% /tab %}} {{% tab JavaScript %}}

```js
/*instrumentation.mjs*/
import { diag, DiagConsoleLogger, DiagLogLevel } from '@opentelemetry/api';

// トラブルシューティングのために、ログレベルをDiagLogLevel.DEBUGに設定
diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.INFO);

// const sdk = new NodeSDK({...
```

{{% /tab %}} {{< /tabpane >}}

[traces]: /docs/concepts/signals/traces/
[metrics]: /docs/concepts/signals/metrics/
