---
title: Node.js
description: 5分未満でアプリのテレメトリーを取得しましょう！
aliases: [/docs/js/getting_started/nodejs]
weight: 10
default_lang_commit: 6f3712c5cda4ea79f75fb410521880396ca30c91
cSpell:ignore: autoinstrumentations KHTML rolldice
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
npm install typescript \
  ts-node \
  @types/node \
  express \
  @types/express

# TypeScriptを初期化
npx tsc --init
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
$ npx ts-node app.ts
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
このタスクによく使用されるツールの1つは、[--require](https://nodejs.org/api/cli.html#-r---require-module)フラグです。

計装セットアップコードを含む`instrumentation.ts`（TypeScriptを使用しない場合は`instrumentation.js`）という名前のファイルを作成します。

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
/*instrumentation.js*/
// 依存関係をrequire
const { NodeSDK } = require('@opentelemetry/sdk-node');
const { ConsoleSpanExporter } = require('@opentelemetry/sdk-trace-node');
const {
  getNodeAutoInstrumentations,
} = require('@opentelemetry/auto-instrumentations-node');
const {
  PeriodicExportingMetricReader,
  ConsoleMetricExporter,
} = require('@opentelemetry/sdk-metrics');

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

これで、通常どおりアプリケーションを実行できますが、`--require`フラグを使用してアプリケーションコードの前に計装をロードできます。
`NODE_OPTIONS`環境変数に`--require @opentelemetry/auto-instrumentations-node/register`などの競合する`--require`フラグがないことを確認してください。

{{< tabpane text=true >}} {{% tab TypeScript %}}

```console
$ npx ts-node --require ./instrumentation.ts app.ts
Listening for requests on http://localhost:8080
```

{{% /tab %}} {{% tab JavaScript %}}

```console
$ node --require ./instrumentation.js app.js
Listening for requests on http://localhost:8080
```

{{% /tab %}} {{< /tabpane >}}

Webブラウザで<http://localhost:8080/rolldice>を開き、ページを数回リロードします。
しばらくすると、`ConsoleSpanExporter`によってコンソールにスパンが出力されるのが表示されるはずです。

<details>
<summary>出力例を表示</summary>

```json
{
  "traceId": "3f1fe6256ea46d19ec3ca97b3409ad6d",
  "parentId": "f0b7b340dd6e08a7",
  "name": "middleware - query",
  "id": "41a27f331c7bfed3",
  "kind": 0,
  "timestamp": 1624982589722992,
  "duration": 417,
  "attributes": {
    "http.route": "/",
    "express.name": "query",
    "express.type": "middleware"
  },
  "status": { "code": 0 },
  "events": []
}
{
  "traceId": "3f1fe6256ea46d19ec3ca97b3409ad6d",
  "parentId": "f0b7b340dd6e08a7",
  "name": "middleware - expressInit",
  "id": "e0ed537a699f652a",
  "kind": 0,
  "timestamp": 1624982589725778,
  "duration": 673,
  "attributes": {
    "http.route": "/",
    "express.name": "expressInit",
    "express.type": "middleware"
  },
  "status": { code: 0 },
  "events": []
}
{
  "traceId": "3f1fe6256ea46d19ec3ca97b3409ad6d",
  "parentId": "f0b7b340dd6e08a7",
  "name": "request handler - /",
  "id": "8614a81e1847b7ef",
  "kind": 0,
  "timestamp": 1624982589726941,
  "duration": 21,
  "attributes": {
    "http.route": "/",
    "express.name": "/",
    "express.type": "request_handler"
  },
  "status": { code: 0 },
  "events": []
}
{
  "traceId": "3f1fe6256ea46d19ec3ca97b3409ad6d",
  "parentId": undefined,
  "name": "GET /",
  "id": "f0b7b340dd6e08a7",
  "kind": 1,
  "timestamp": 1624982589720260,
  "duration": 11380,
  "attributes": {
    "http.url": "http://localhost:8080/",
    "http.host": "localhost:8080",
    "net.host.name": "localhost",
    "http.method": "GET",
    "http.route": "",
    "http.target": "/",
    "http.user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36",
    "http.flavor": "1.1",
    "net.transport": "ip_tcp",
    "net.host.ip": "::1",
    "net.host.port": 8080,
    "net.peer.ip": "::1",
    "net.peer.port": 61520,
    "http.status_code": 304,
    "http.status_text": "NOT MODIFIED"
  },
  "status": { "code": 1 },
  "events": []
}
```

</details>

生成されたスパンは、`/rolldice`ルートへのリクエストの有効期間を追跡します。

エンドポイントにさらにいくつかリクエストを送信します。
しばらくすると、以下のようなメトリクスがコンソール出力に表示されます。

<details>
<summary>出力例を表示</summary>

```yaml
{
  descriptor: {
    name: 'http.server.duration',
    type: 'HISTOGRAM',
    description: 'measures the duration of the inbound HTTP requests',
    unit: 'ms',
    valueType: 1
  },
  dataPointType: 0,
  dataPoints: [
    {
      attributes: [Object],
      startTime: [Array],
      endTime: [Array],
      value: [Object]
    }
  ]
}
{
  descriptor: {
    name: 'http.client.duration',
    type: 'HISTOGRAM',
    description: 'measures the duration of the outbound HTTP requests',
    unit: 'ms',
    valueType: 1
  },
  dataPointType: 0,
  dataPoints: []
}
{
  descriptor: {
    name: 'db.client.connections.usage',
    type: 'UP_DOWN_COUNTER',
    description: 'The number of connections that are currently in the state referenced by the attribute "state".',
    unit: '{connections}',
    valueType: 1
  },
  dataPointType: 3,
  dataPoints: []
}
{
  descriptor: {
    name: 'http.server.duration',
    type: 'HISTOGRAM',
    description: 'measures the duration of the inbound HTTP requests',
    unit: 'ms',
    valueType: 1
  },
  dataPointType: 0,
  dataPoints: [
    {
      attributes: [Object],
      startTime: [Array],
      endTime: [Array],
      value: [Object]
    }
  ]
}
{
  descriptor: {
    name: 'http.client.duration',
    type: 'HISTOGRAM',
    description: 'measures the duration of the outbound HTTP requests',
    unit: 'ms',
    valueType: 1
  },
  dataPointType: 0,
  dataPoints: []
}
{
  descriptor: {
    name: 'db.client.connections.usage',
    type: 'UP_DOWN_COUNTER',
    description: 'The number of connections that are currently in the state referenced by the attribute "state".',
    unit: '{connections}',
    valueType: 1
  },
  dataPointType: 3,
  dataPoints: []
}
{
  descriptor: {
    name: 'http.server.duration',
    type: 'HISTOGRAM',
    description: 'measures the duration of the inbound HTTP requests',
    unit: 'ms',
    valueType: 1
  },
  dataPointType: 0,
  dataPoints: [
    {
      attributes: [Object],
      startTime: [Array],
      endTime: [Array],
      value: [Object]
    }
  ]
}
{
  descriptor: {
    name: 'http.client.duration',
    type: 'HISTOGRAM',
    description: 'measures the duration of the outbound HTTP requests',
    unit: 'ms',
    valueType: 1
  },
  dataPointType: 0,
  dataPoints: []
}
{
  descriptor: {
    name: 'db.client.connections.usage',
    type: 'UP_DOWN_COUNTER',
    description: 'The number of connections that are currently in the state referenced by the attribute "state".',
    unit: '{connections}',
    valueType: 1
  },
  dataPointType: 3,
  dataPoints: []
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
/*instrumentation.js*/
// 依存関係をrequire
const { diag, DiagConsoleLogger, DiagLogLevel } = require('@opentelemetry/api');

// トラブルシューティングのために、ログレベルをDiagLogLevel.DEBUGに設定
diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.INFO);

// const sdk = new NodeSDK({...
```

{{% /tab %}} {{< /tabpane >}}

[traces]: /docs/concepts/signals/traces/
[metrics]: /docs/concepts/signals/metrics/
