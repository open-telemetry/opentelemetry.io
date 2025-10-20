---
title: 計装
aliases:
  - /docs/languages/js/api/tracing
  - manual
weight: 30
description: OpenTelemetry JavaScript の計装
default_lang_commit: 68e94a4555606e74c27182b79789d46faf84ec25
cSpell:ignore: dicelib Millis rolldice
---

{{% include instrumentation-intro.md %}}

{{% alert title="注意" %}}

このページでは、コードに _手動で_ トレース、メトリクス、ログを追加する方法を学びます。
ただし、1種類の計装のみを使用することに制限されているわけではありません。
[自動計装](/docs/zero-code/js/)を使用して開始し、必要に応じて手動計装でコードを充実させることができます。

また、コードが依存するライブラリについては、自分で計装コードを書く必要はありません。
OpenTelemetryが _ネイティブに_ 組み込まれている場合があるか、[計装ライブラリ](/docs/languages/js/libraries/)を利用できる場合があります。

{{% /alert %}}

## サンプルアプリケーションの準備 {#example-app}

このページでは、[はじめに](/docs/languages/js/getting-started/nodejs/)のサンプルアプリケーションの修正版を使用して、手動計装について学習します。

サンプルアプリケーションを使用する必要はありません。
独自のアプリケーションやライブラリを計装したい場合は、ここでの指示に従って、プロセスを独自のコードに適応させてください。

### 依存関係 {#example-app-dependencies}

新しいディレクトリに空のNPM `package.json`ファイルを作成します。

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

_ライブラリ_ とスタンドアロン _アプリケーション_ の計装の違いを強調するために、
サイコロを振る処理を _ライブラリファイル_ に分割し、それを _アプリケーションファイル_ で依存関係としてインポートします。

`dice.ts`（TypeScriptを使用していない場合は`dice.js`）という名前の _ライブラリファイル_ を作成し、次のコードを追加します。

{{< tabpane text=true >}} {{% tab TypeScript %}}

```ts
/*dice.ts*/
function rollOnce(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

export function rollTheDice(rolls: number, min: number, max: number) {
  const result: number[] = [];
  for (let i = 0; i < rolls; i++) {
    result.push(rollOnce(min, max));
  }
  return result;
}
```

{{% /tab %}} {{% tab JavaScript %}}

```js
/*dice.js*/
function rollOnce(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function rollTheDice(rolls, min, max) {
  const result = [];
  for (let i = 0; i < rolls; i++) {
    result.push(rollOnce(min, max));
  }
  return result;
}

module.exports = { rollTheDice };
```

{{% /tab %}} {{< /tabpane >}}

`app.ts`（TypeScriptを使用していない場合は`app.js`）という名前の _アプリケーションファイル_ を作成し、次のコードを追加します。

{{< tabpane text=true >}} {{% tab TypeScript %}}

```ts
/*app.ts*/
import express, { type Express } from 'express';
import { rollTheDice } from './dice';

const PORT: number = parseInt(process.env.PORT || '8080');
const app: Express = express();

app.get('/rolldice', (req, res) => {
  const rolls = req.query.rolls ? parseInt(req.query.rolls.toString()) : NaN;
  if (isNaN(rolls)) {
    res
      .status(400)
      .send("Request parameter 'rolls' is missing or not a number.");
    return;
  }
  res.send(JSON.stringify(rollTheDice(rolls, 1, 6)));
});

app.listen(PORT, () => {
  console.log(`Listening for requests on http://localhost:${PORT}`);
});
```

{{% /tab %}} {{% tab JavaScript %}}

```js
/*app.js*/
const express = require('express');
const { rollTheDice } = require('./dice.js');

const PORT = parseInt(process.env.PORT || '8080');
const app = express();

app.get('/rolldice', (req, res) => {
  const rolls = req.query.rolls ? parseInt(req.query.rolls.toString()) : NaN;
  if (isNaN(rolls)) {
    res
      .status(400)
      .send("Request parameter 'rolls' is missing or not a number.");
    return;
  }
  res.send(JSON.stringify(rollTheDice(rolls, 1, 6)));
});

app.listen(PORT, () => {
  console.log(`Listening for requests on http://localhost:${PORT}`);
});
```

{{% /tab %}} {{< /tabpane >}}

動作することを確認するには、次のコマンドでアプリケーションケーションを実行し、Webブラウザで<http://localhost:8080/rolldice?rolls=12>を開きます。

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

## 手動計装のセットアップ {#manual-instrumentation-setup}

### 依存関係 {#dependencies}

OpenTelemetry APIパッケージをインストールします。

```shell
npm install @opentelemetry/api @opentelemetry/resources @opentelemetry/semantic-conventions
```

### SDKの初期化 {#initialize-the-sdk}

{{% alert title="注意" %}}

ライブラリを計装している場合は、**このステップをスキップしてください**。

{{% /alert %}}

Node.jsアプリケーションケーションを計装する場合は、[Node.js用OpenTelemetry SDK](https://www.npmjs.com/package/@opentelemetry/sdk-node)をインストールします。

```shell
npm install @opentelemetry/sdk-node
```

アプリケーションケーション内の他のモジュールがロードされる前に、SDKを初期化する必要があります。
SDKの初期化に失敗した場合、または遅すぎる場合、APIからトレーサーまたはメーターを取得するライブラリにはno-op実装が提供されます。

{{< tabpane text=true >}} {{% tab TypeScript %}}

```ts
/*instrumentation.ts*/
import { NodeSDK } from '@opentelemetry/sdk-node';
import { ConsoleSpanExporter } from '@opentelemetry/sdk-trace-node';
import {
  PeriodicExportingMetricReader,
  ConsoleMetricExporter,
} from '@opentelemetry/sdk-metrics';
import { resourceFromAttributes } from '@opentelemetry/resources';
import {
  ATTR_SERVICE_NAME,
  ATTR_SERVICE_VERSION,
} from '@opentelemetry/semantic-conventions';

const sdk = new NodeSDK({
  resource: resourceFromAttributes({
    [ATTR_SERVICE_NAME]: 'yourServiceName',
    [ATTR_SERVICE_VERSION]: '1.0',
  }),
  traceExporter: new ConsoleSpanExporter(),
  metricReader: new PeriodicExportingMetricReader({
    exporter: new ConsoleMetricExporter(),
  }),
});

sdk.start();
```

{{% /tab %}} {{% tab JavaScript %}}

```js
/*instrumentation.mjs*/
import { NodeSDK } from '@opentelemetry/sdk-node';
import { ConsoleSpanExporter } from '@opentelemetry/sdk-trace-node';
import {
  PeriodicExportingMetricReader,
  ConsoleMetricExporter,
} from '@opentelemetry/sdk-metrics';
import { resourceFromAttributes } from '@opentelemetry/resources';
import {
  ATTR_SERVICE_NAME,
  ATTR_SERVICE_VERSION,
} from '@opentelemetry/semantic-conventions';

const sdk = new NodeSDK({
  resource: resourceFromAttributes({
    [ATTR_SERVICE_NAME]: 'dice-server',
    [ATTR_SERVICE_VERSION]: '0.1.0',
  }),
  traceExporter: new ConsoleSpanExporter(),
  metricReader: new PeriodicExportingMetricReader({
    exporter: new ConsoleMetricExporter(),
  }),
});

sdk.start();
```

{{% /tab %}} {{< /tabpane >}}

デバッグとローカル開発のために、次の例ではテレメトリーをコンソールにエクスポートします。
手動計装の設定が完了したら、[アプリケーションのテレメトリーデータをエクスポート](/docs/languages/js/exporters/)するために、1つ以上のテレメトリーバックエンドに適切なエクスポーターを構成する必要があります。

この例では、必須のSDKデフォルト属性`service.name`（サービスの論理名を保持）と、オプション（ただし強く推奨される！）属性`service.version`（サービスAPIまたは実装のバージョンを保持）も設定します。

リソース属性を設定する代替方法があります。詳細については、[リソース](/docs/languages/js/resources/)を参照してください。

コードを確認するには、ライブラリを要求してアプリケーションを実行します。

{{% alert title="注意" %}}

以下の`--import instrumentation.ts`（TypeScript）を使用した例は、Node.js v20以降が必要です。
Node.js v18を使用している場合は、JavaScriptの例を使用してください。

{{% /alert %}}

{{< tabpane text=true >}} {{% tab TypeScript %}}

```sh
npx tsx --import ./instrumentation.ts app.ts
```

{{% /tab %}} {{% tab JavaScript %}}

```sh
node --import ./instrumentation.mjs app.js
```

{{% /tab %}} {{< /tabpane >}}

この基本的なセットアップは、まだアプリケーションに影響を与えません。
[トレース](#traces)、[メトリクス](#metrics)、および/または[ログ](#logs)のコードを追加する必要があります。

依存関係のテレメトリーデータを生成するために、計装ライブラリをNode.js用OpenTelemetry SDKに登録できます。
詳細については、[ライブラリ](/docs/languages/js/libraries/)を参照してください。

## トレース {#traces}

### トレーシングの初期化 {#initialize-tracing}

{{% alert title="注意" %}}

ライブラリを計装している場合は、**このステップをスキップしてください**。

{{% /alert %}}

アプリケーションで[トレーシング](/docs/concepts/signals/traces/)を有効にするには、[`Tracer`](/docs/concepts/signals/traces/#tracer)を作成できる初期化された[`TracerProvider`](/docs/concepts/signals/traces/#tracer-provider)が必要です。

`TracerProvider`が作成されない場合、トレーシング用のOpenTelemetry APIはno-op実装を使用し、データの生成に失敗します。
次に説明するように、NodeとブラウザですべてのSDK初期化コードを含めるように`instrumentation.ts`（または`instrumentation.js`）ファイルを変更します。

#### Node.js {#nodejs}

上記の[SDKの初期化](#initialize-the-sdk)の指示に従った場合、すでに`TracerProvider`がセットアップされています。
[トレーサーの取得](#acquiring-a-tracer)に進むことができます。

#### ブラウザ {#browser}

{{% include browser-instrumentation-warning.md %}}

まず、適切なパッケージがあることを確認します。

```shell
npm install @opentelemetry/sdk-trace-web
```

次に、`instrumentation.ts`（または`instrumentation.js`）を更新して、すべてのSDK初期化コードを含めます。

{{< tabpane text=true >}} {{% tab TypeScript %}}

```ts
import {
  defaultResource,
  resourceFromAttributes,
} from '@opentelemetry/resources';
import {
  ATTR_SERVICE_NAME,
  ATTR_SERVICE_VERSION,
} from '@opentelemetry/semantic-conventions';
import { WebTracerProvider } from '@opentelemetry/sdk-trace-web';
import {
  BatchSpanProcessor,
  ConsoleSpanExporter,
} from '@opentelemetry/sdk-trace-base';

const resource = defaultResource().merge(
  resourceFromAttributes({
    [ATTR_SERVICE_NAME]: 'service-name-here',
    [ATTR_SERVICE_VERSION]: '0.1.0',
  }),
);

const exporter = new ConsoleSpanExporter();
const processor = new BatchSpanProcessor(exporter);

const provider = new WebTracerProvider({
  resource: resource,
  spanProcessors: [processor],
});

provider.register();
```

{{% /tab %}} {{% tab JavaScript %}}

```js
const opentelemetry = require('@opentelemetry/api');
const {
  defaultResource,
  resourceFromAttributes,
} = require('@opentelemetry/resources');
const {
  ATTR_SERVICE_NAME,
  ATTR_SERVICE_VERSION,
} = require('@opentelemetry/semantic-conventions');
const { WebTracerProvider } = require('@opentelemetry/sdk-trace-web');
const {
  ConsoleSpanExporter,
  BatchSpanProcessor,
} = require('@opentelemetry/sdk-trace-base');

const resource = defaultResource().merge(
  resourceFromAttributes({
    [ATTR_SERVICE_NAME]: 'service-name-here',
    [ATTR_SERVICE_VERSION]: '0.1.0',
  }),
);

const exporter = new ConsoleSpanExporter();
const processor = new BatchSpanProcessor(exporter);

const provider = new WebTracerProvider({
  resource: resource,
  spanProcessors: [processor],
});

provider.register();
```

{{% /tab %}} {{< /tabpane >}}

このファイルをWebアプリケーションケーションにバンドルして、Webアプリケーションケーションの残りの部分でトレーシングを使用できるようにする必要があります。

これはまだアプリケーションに影響を与えません。アプリケーションからテレメトリーを発行するには、[スパンを作成](#create-spans)する必要があります。

#### 適切なスパンプロセッサーの選択 {#picking-the-right-span-processor}

デフォルトでは、Node SDKは`BatchSpanProcessor`を使用し、Web SDKの例でもこのスパンプロセッサーが選択されています。
`BatchSpanProcessor`は、エクスポートされる前にスパンをバッチで処理します。
これは通常、アプリケーションケーションに使用する適切なプロセッサーです。

対照的に、`SimpleSpanProcessor`はスパンが作成されると処理します。
つまり、5つのスパンを作成した場合、それぞれがコードで次のスパンが作成される前に処理およびエクスポートされます。
これは、バッチを失うリスクを冒したくないシナリオや、開発中にOpenTelemetryを試している場合に役立ちます。
ただし、特にスパンがネットワーク経由でエクスポートされている場合、潜在的に大きなオーバーヘッドが発生します。
スパンを作成する呼び出しが行われるたびに、アプリケーションの実行が続行される前に処理され、ネットワーク経由で送信されます。

ほとんどの場合、`SimpleSpanProcessor`よりも`BatchSpanProcessor`を使用してください。

### トレーサーの取得 {#acquiring-a-tracer}

手動トレーシングコードを記述するアプリケーションケーション内のどこでも、`getTracer`を呼び出してトレーサーを取得する必要があります。
例を挙げましょう。

{{< tabpane text=true >}} {{% tab TypeScript %}}

```ts
import opentelemetry from '@opentelemetry/api';
//...

const tracer = opentelemetry.trace.getTracer(
  'instrumentation-scope-name',
  'instrumentation-scope-version',
);

// これで'tracer'を使用してトレーシングができます！
```

{{% /tab %}} {{% tab JavaScript %}}

```js
const opentelemetry = require('@opentelemetry/api');
//...

const tracer = opentelemetry.trace.getTracer(
  'instrumentation-scope-name',
  'instrumentation-scope-version',
);

// これで'tracer'を使用してトレーシングができます！
```

{{% /tab %}} {{< /tabpane >}}

`instrumentation-scope-name`と`instrumentation-scope-version`の値は、パッケージ、モジュール、またはクラス名など、[計装スコープ](/docs/concepts/instrumentation-scope/)を一意に識別する必要があります。
名前は必須ですが、バージョンはオプションであるにもかかわらず推奨されます。

アプリケーションで必要なときに`getTracer`を呼び出すことが、`tracer`インスタンスをアプリケーションの残りの部分にエクスポートするよりも一般的に推奨されます。
これは、他の必要な依存関係が関与している場合のより複雑なアプリケーションケーションロードの問題を回避するのに役立ちます。

[サンプルアプリケーション](#example-app)の場合、適切な計装スコープでトレーサーを取得できる場所が2つあります。

まず、_アプリケーションケーションファイル_ `app.ts`（または`app.js`）で下記を実装します。

{{< tabpane text=true >}} {{% tab TypeScript %}}

```ts {hl_lines=[6]}
/*app.ts*/
import { trace } from '@opentelemetry/api';
import express, { type Express } from 'express';
import { rollTheDice } from './dice';

const tracer = trace.getTracer('dice-server', '0.1.0');

const PORT: number = parseInt(process.env.PORT || '8080');
const app: Express = express();

app.get('/rolldice', (req, res) => {
  const rolls = req.query.rolls ? parseInt(req.query.rolls.toString()) : NaN;
  if (isNaN(rolls)) {
    res
      .status(400)
      .send("Request parameter 'rolls' is missing or not a number.");
    return;
  }
  res.send(JSON.stringify(rollTheDice(rolls, 1, 6)));
});

app.listen(PORT, () => {
  console.log(`Listening for requests on http://localhost:${PORT}`);
});
```

{{% /tab %}} {{% tab JavaScript %}}

```js {hl_lines=[6]}
/*app.js*/
const { trace } = require('@opentelemetry/api');
const express = require('express');
const { rollTheDice } = require('./dice.js');

const tracer = trace.getTracer('dice-server', '0.1.0');

const PORT = parseInt(process.env.PORT || '8080');
const app = express();

app.get('/rolldice', (req, res) => {
  const rolls = req.query.rolls ? parseInt(req.query.rolls.toString()) : NaN;
  if (isNaN(rolls)) {
    res
      .status(400)
      .send("Request parameter 'rolls' is missing or not a number.");
    return;
  }
  res.send(JSON.stringify(rollTheDice(rolls, 1, 6)));
});

app.listen(PORT, () => {
  console.log(`Listening for requests on http://localhost:${PORT}`);
});
```

{{% /tab %}} {{< /tabpane >}}

そして2番目に、_ライブラリファイル_ `dice.ts`（または`dice.js`）で、以下を実装します。

{{< tabpane text=true >}} {{% tab TypeScript %}}

```ts {hl_lines=[4]}
/*dice.ts*/
import { trace } from '@opentelemetry/api';

const tracer = trace.getTracer('dice-lib');

function rollOnce(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

export function rollTheDice(rolls: number, min: number, max: number) {
  const result: number[] = [];
  for (let i = 0; i < rolls; i++) {
    result.push(rollOnce(min, max));
  }
  return result;
}
```

{{% /tab %}} {{% tab JavaScript %}}

```js {hl_lines=[4]}
/*dice.js*/
const { trace } = require('@opentelemetry/api');

const tracer = trace.getTracer('dice-lib');

function rollOnce(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function rollTheDice(rolls, min, max) {
  const result = [];
  for (let i = 0; i < rolls; i++) {
    result.push(rollOnce(min, max));
  }
  return result;
}

module.exports = { rollTheDice };
```

{{% /tab %}} {{< /tabpane >}}

### スパンの作成 {#create-spans}

[トレーサー](/docs/concepts/signals/traces/#tracer)を初期化したので、[スパン](/docs/concepts/signals/traces/#spans)を作成できます。

OpenTelemetry JavaScript APIは、スパンを作成できる2つのメソッドを公開しています。

- [`tracer.startSpan`](https://open-telemetry.github.io/opentelemetry-js/interfaces/_opentelemetry_api._opentelemetry_api.Tracer.html#startspan)：コンテキストに設定せずに新しいスパンを開始します。
- [`tracer.startActiveSpan`](https://open-telemetry.github.io/opentelemetry-js/interfaces/_opentelemetry_api._opentelemetry_api.Tracer.html#startactivespan)：新しいスパンを開始し、作成されたスパンを最初の引数として渡す特定のコールバック関数を呼び出します。新しいスパンはコンテキストに設定され、このコンテキストは関数呼び出しの期間中アクティブになります。

ほとんどの場合、スパンとそのコンテキストをアクティブに設定するため、後者（`tracer.startActiveSpan`）を使用することをお勧めします。

以下のコードは、アクティブなスパンを作成する方法を示しています。

{{< tabpane text=true >}} {{% tab TypeScript %}}

```ts
import { trace, type Span } from '@opentelemetry/api';

/* ... */

export function rollTheDice(rolls: number, min: number, max: number) {
  // スパンを作成します。スパンは閉じる必要があります。
  return tracer.startActiveSpan('rollTheDice', (span: Span) => {
    const result: number[] = [];
    for (let i = 0; i < rolls; i++) {
      result.push(rollOnce(min, max));
    }
    // 必ずスパンを終了してください！
    span.end();
    return result;
  });
}
```

{{% /tab %}} {{% tab JavaScript %}}

```js
function rollTheDice(rolls, min, max) {
  // スパンを作成します。スパンは閉じる必要があります。
  return tracer.startActiveSpan('rollTheDice', (span) => {
    const result = [];
    for (let i = 0; i < rolls; i++) {
      result.push(rollOnce(min, max));
    }
    // 必ずスパンを終了してください！
    span.end();
    return result;
  });
}
```

{{% /tab %}} {{< /tabpane >}}

ここまでの[サンプルアプリケーション](#example-app)を使用して指示に従った場合、上記のコードをライブラリファイル`dice.ts`（または`dice.js`）にコピーできます。
これで、アプリケーションから発行されるスパンを確認できるはずです。

次のようにアプリケーションを開始し、ブラウザまたは`curl`で<http://localhost:8080/rolldice?rolls=12>にアクセスしてリクエストを送信します。

{{< tabpane text=true >}} {{% tab TypeScript %}}

```sh
npx tsx --import ./instrumentation.ts app.ts
```

{{% /tab %}} {{% tab JavaScript %}}

```sh
node --import ./instrumentation.mjs app.js
```

{{% /tab %}} {{< /tabpane >}}

しばらくすると、`ConsoleSpanExporter`によってコンソールにスパンが出力されるのが表示されるはずです。
次のようなものです。

```js
{
  resource: {
    attributes: {
      'service.name': 'dice-server',
      'service.version': '0.1.0',
      // ...
    }
  },
  instrumentationScope: { name: 'dice-lib', version: undefined, schemaUrl: undefined },
  traceId: '30d32251088ba9d9bca67b09c43dace0',
  parentSpanContext: undefined,
  traceState: undefined,
  name: 'rollTheDice',
  id: 'cc8a67c2d4840402',
  kind: 0,
  timestamp: 1756165206470000,
  duration: 35.584,
  attributes: {},
  status: { code: 0 },
  events: [],
  links: []
}
```

### ネストされたスパンの作成 {#create-nested-spans}

ネストされた[スパン](/docs/concepts/signals/traces/#spans)を使用すると、ネストされた性質の作業を追跡できます。
たとえば、以下の`rollOnce()`関数はネストされた操作を表します。次のサンプルは、`rollOnce()`を追跡する
ネストされたスパンを作成します。

{{< tabpane text=true >}} {{% tab TypeScript %}}

```ts
function rollOnce(i: number, min: number, max: number) {
  return tracer.startActiveSpan(`rollOnce:${i}`, (span: Span) => {
    const result = Math.floor(Math.random() * (max - min + 1) + min);
    span.end();
    return result;
  });
}

export function rollTheDice(rolls: number, min: number, max: number) {
  // スパンを作成します。スパンは閉じる必要があります。
  return tracer.startActiveSpan('rollTheDice', (parentSpan: Span) => {
    const result: number[] = [];
    for (let i = 0; i < rolls; i++) {
      result.push(rollOnce(i, min, max));
    }
    // 必ずスパンを終了してください！
    parentSpan.end();
    return result;
  });
}
```

{{% /tab %}} {{% tab JavaScript %}}

```js
function rollOnce(i, min, max) {
  return tracer.startActiveSpan(`rollOnce:${i}`, (span) => {
    const result = Math.floor(Math.random() * (max - min + 1) + min);
    span.end();
    return result;
  });
}

function rollTheDice(rolls, min, max) {
  // スパンを作成します。スパンは閉じる必要があります。
  return tracer.startActiveSpan('rollTheDice', (parentSpan) => {
    const result = [];
    for (let i = 0; i < rolls; i++) {
      result.push(rollOnce(i, min, max));
    }
    // 必ずスパンを終了してください！
    parentSpan.end();
    return result;
  });
}
```

{{% /tab %}} {{< /tabpane >}}

このコードは、各 _ロール_ に対して、`parentSpan`のIDを親IDとして持つ子スパンを作成します。

```js
{
  traceId: '6469e115dc1562dd768c999da0509615',
  parentSpanContext: {
    traceId: '6469e115dc1562dd768c999da0509615',
    spanId: '38691692d6bc3395',
    // ...
  },
  name: 'rollOnce:0',
  id: '36423bc1ce7532b0',
  timestamp: 1756165362215000,
  duration: 85.667,
  // ...
}
{
  traceId: '6469e115dc1562dd768c999da0509615',
  parentSpanContext: {
    traceId: '6469e115dc1562dd768c999da0509615',
    spanId: '38691692d6bc3395',
    // ...
  },
  name: 'rollOnce:1',
  id: 'ed9bbba2264d6872',
  timestamp: 1756165362215000,
  duration: 16.834,
  // ...
}
{
  traceId: '6469e115dc1562dd768c999da0509615',
  parentSpanContext: undefined,
  name: 'rollTheDice',
  id: '38691692d6bc3395',
  timestamp: 1756165362214000,
  duration: 1022.209,
  // ...
}
```

### 独立したスパンの作成 {#create-independent-spans}

前の例では、アクティブなスパンを作成する方法を示しました。
場合によっては、ネストされているのではなく、互いに兄弟である非アクティブなスパンを作成したいことがあります。

```js
const doWork = () => {
  const span1 = tracer.startSpan('work-1');
  // 何かの作業
  const span2 = tracer.startSpan('work-2');
  // さらに何かの作業
  const span3 = tracer.startSpan('work-3');
  // さらにもっと作業

  span1.end();
  span2.end();
  span3.end();
};
```

この例では、`span1`、`span2`、および`span3`は兄弟スパンであり、どれも現在アクティブなスパンとは見なされません。
それらは互いの下にネストされるのではなく、同じ親を共有します。

この配置は、一緒にグループ化されているが、概念的に互いに独立している作業単位がある場合に役立ちます。

### 現在のスパンの取得 {#get-the-current-span}

プログラム実行の特定の時点で、現在の/アクティブな[スパン](/docs/concepts/signals/traces/#spans)で何かを行うと便利な場合があります。

```js
const activeSpan = opentelemetry.trace.getActiveSpan();

// アクティブなスパンで何かを行い、ユースケースに適している場合は、オプションで終了します。
```

### コンテキストからスパンを取得 {#get-a-span-from-context}

必ずしもアクティブなスパンではない、特定のコンテキストから[スパン](/docs/concepts/signals/traces/#spans)を取得することも便利な場合があります。

```js
const ctx = getContextFromSomewhere();
const span = opentelemetry.trace.getSpan(ctx);

// 取得したスパンで何かを行い、ユースケースに適している場合は、オプションで終了します。
```

### 属性 {#attributes}

[属性](/docs/concepts/signals/traces/#attributes)を使用すると、[`Span`](/docs/concepts/signals/traces/#spans)にキー/値ペアを添付して、追跡している現在の操作に関する詳細情報を伝えることができます。

{{< tabpane text=true >}} {{% tab TypeScript %}}

```ts
function rollOnce(i: number, min: number, max: number) {
  return tracer.startActiveSpan(`rollOnce:${i}`, (span: Span) => {
    const result = Math.floor(Math.random() * (max - min + 1) + min);

    // スパンに属性を追加
    span.setAttribute('dicelib.rolled', result.toString());

    span.end();
    return result;
  });
}
```

{{% /tab %}} {{% tab JavaScript %}}

```js
function rollOnce(i, min, max) {
  return tracer.startActiveSpan(`rollOnce:${i}`, (span) => {
    const result = Math.floor(Math.random() * (max - min + 1) + min);

    // スパンに属性を追加
    span.setAttribute('dicelib.rolled', result.toString());

    span.end();
    return result;
  });
}
```

{{% /tab %}} {{< /tabpane >}}

スパンの作成時に属性を追加することもできます。

```javascript
tracer.startActiveSpan(
  'app.new-span',
  { attributes: { attribute1: 'value1' } },
  (span) => {
    // 何かの作業...

    span.end();
  },
);
```

{{< tabpane text=true >}} {{% tab TypeScript %}}

```ts
function rollTheDice(rolls: number, min: number, max: number) {
  return tracer.startActiveSpan(
    'rollTheDice',
    { attributes: { 'dicelib.rolls': rolls.toString() } },
    (span: Span) => {
      /* ... */
    },
  );
}
```

{{% /tab %}} {{% tab JavaScript %}}

```js
function rollTheDice(rolls, min, max) {
  return tracer.startActiveSpan(
    'rollTheDice',
    { attributes: { 'dicelib.rolls': rolls.toString() } },
    (span) => {
      /* ... */
    },
  );
}
```

{{% /tab %}} {{< /tabpane >}}

#### セマンティック属性 {#semantic-attributes}

HTTPやデータベース呼び出しなどの既知のプロトコルでの操作を表すスパンには、セマンティック規約があります。これらのスパンのセマンティック規約は、[トレースセマンティック規約](/docs/specs/semconv/general/trace/)の仕様で定義されています。
このガイドのシンプルな例では、ソースコード属性を使用できます。

まず、依存関係としてセマンティック規約をアプリケーションケーションに追加します。

```shell
npm install --save @opentelemetry/semantic-conventions
```

アプリケーションケーションファイルの先頭に次を追加します。

{{< tabpane text=true >}} {{% tab TypeScript %}}

```ts
import {
  ATTR_CODE_FUNCTION_NAME,
  ATTR_CODE_FILE_PATH,
} from '@opentelemetry/semantic-conventions';
```

{{% /tab %}} {{% tab JavaScript %}}

```js
const {
  ATTR_CODE_FUNCTION_NAME,
  ATTR_CODE_FILE_PATH,
} = require('@opentelemetry/semantic-conventions');
```

{{% /tab %}} {{< /tabpane >}}

最後に、セマンティック属性を含めるようにファイルを更新できます。

```js
const doWork = () => {
  tracer.startActiveSpan('app.doWork', (span) => {
    span.setAttribute(ATTR_CODE_FUNCTION_NAME, 'doWork');
    span.setAttribute(ATTR_CODE_FILE_PATH, __filename);

    // 何かの作業を行う...

    span.end();
  });
};
```

### スパンイベント {#span-events}

[スパンイベント](/docs/concepts/signals/traces/#span-events)は、[スパン](/docs/concepts/signals/traces/#spans)上の人間が読める形式のメッセージで、単一のタイムスタンプで追跡できる期間のない離散イベントを表します。
プリミティブログのようなものと考えることができます。

```js
span.addEvent('Doing something');

const result = doWork();
```

追加の[属性](/docs/concepts/signals/traces/#attributes)を持つスパンイベントを作成することもできます。

```js
span.addEvent('some log', {
  'log.severity': 'error',
  'log.message': 'Data not found',
  'request.id': requestId,
});
```

### スパンリンク {#span-links}

[`Span`](/docs/concepts/signals/traces/#spans)は、因果関係がある他のスパンへのゼロ個以上の[`Link`](/docs/concepts/signals/traces/#span-links)を使用して作成できます。
一般的なシナリオは、1つ以上のトレースを現在のスパンと相関させることです。

```js
const someFunction = (spanToLinkFrom) => {
  const options = {
    links: [
      {
        context: spanToLinkFrom.spanContext(),
      },
    ],
  };

  tracer.startActiveSpan('app.someFunction', options, (span) => {
    // 何かの作業を行う...

    span.end();
  });
};
```

### スパンステータス {#span-status}

{{% include "span-status-preamble.md" %}}

{{< tabpane text=true >}} {{% tab TypeScript %}}

```ts
import opentelemetry, { SpanStatusCode } from '@opentelemetry/api';

// ...

tracer.startActiveSpan('app.doWork', (span) => {
  for (let i = 0; i <= Math.floor(Math.random() * 40000000); i += 1) {
    if (i > 10000) {
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: 'Error',
      });
    }
  }

  span.end();
});
```

{{% /tab %}} {{% tab JavaScript %}}

```js
const opentelemetry = require('@opentelemetry/api');

// ...

tracer.startActiveSpan('app.doWork', (span) => {
  for (let i = 0; i <= Math.floor(Math.random() * 40000000); i += 1) {
    if (i > 10000) {
      span.setStatus({
        code: opentelemetry.SpanStatusCode.ERROR,
        message: 'Error',
      });
    }
  }

  span.end();
});
```

{{% /tab %}} {{< /tabpane >}}

### 例外の記録 {#recording-exceptions}

例外が発生したときに記録することは良いアイデアです。
[スパンステータス](#span-status)の設定と組み合わせて行うことをお勧めします。

{{< tabpane text=true >}} {{% tab TypeScript %}}

```ts
import opentelemetry, { SpanStatusCode } from '@opentelemetry/api';

// ...

try {
  doWork();
} catch (ex) {
  if (ex instanceof Error) {
    span.recordException(ex);
  }
  span.setStatus({ code: SpanStatusCode.ERROR });
}
```

{{% /tab %}} {{% tab JavaScript %}}

```js
const opentelemetry = require('@opentelemetry/api');

// ...

try {
  doWork();
} catch (ex) {
  if (ex instanceof Error) {
    span.recordException(ex);
  }
  span.setStatus({ code: opentelemetry.SpanStatusCode.ERROR });
}
```

{{% /tab %}} {{< /tabpane >}}

### `sdk-trace-base`の使用と手動でのスパンコンテキストの伝搬 {#using-sdk-trace-base-and-manually-propagating-span-context}

場合によっては、Node.js SDKもWeb SDKも使用できない場合があります。
初期化コード以外の最大の違いは、ネストされたスパンを作成できるように、現在のコンテキストでスパンを手動でアクティブに設定する必要があることです。

#### `sdk-trace-base`でトレーシングを初期化 {#initializing-tracing-with-sdk-trace-base}

トレーシングの初期化は、Node.jsまたはWeb SDKで行う方法と似ています。

{{< tabpane text=true >}} {{% tab TypeScript %}}

```ts
import opentelemetry from '@opentelemetry/api';
import {
  CompositePropagator,
  W3CTraceContextPropagator,
  W3CBaggagePropagator,
} from '@opentelemetry/core';
import {
  BasicTracerProvider,
  BatchSpanProcessor,
  ConsoleSpanExporter,
} from '@opentelemetry/sdk-trace-base';

opentelemetry.trace.setGlobalTracerProvider(
  new BasicTracerProvider({
    // エクスポーターにスパンを送信するようにスパンプロセッサーを構成
    spanProcessors: [new BatchSpanProcessor(new ConsoleSpanExporter())],
  }),
);

opentelemetry.propagation.setGlobalPropagator(
  new CompositePropagator({
    propagators: [new W3CTraceContextPropagator(), new W3CBaggagePropagator()],
  }),
);

// これはすべての計装コードでアクセスするものです
const tracer = opentelemetry.trace.getTracer('example-basic-tracer-node');
```

{{% /tab %}} {{% tab JavaScript %}}

```js
const opentelemetry = require('@opentelemetry/api');
const {
  CompositePropagator,
  W3CTraceContextPropagator,
  W3CBaggagePropagator,
} = require('@opentelemetry/core');
const {
  BasicTracerProvider,
  ConsoleSpanExporter,
  BatchSpanProcessor,
} = require('@opentelemetry/sdk-trace-base');

opentelemetry.trace.setGlobalTracerProvider(
  new BasicTracerProvider({
    // エクスポーターにスパンを送信するようにスパンプロセッサーを構成
    spanProcessors: [new BatchSpanProcessor(new ConsoleSpanExporter())],
  }),
);

opentelemetry.propagation.setGlobalPropagator(
  new CompositePropagator({
    propagators: [new W3CTraceContextPropagator(), new W3CBaggagePropagator()],
  }),
);

// これはすべての計装コードでアクセスするものです
const tracer = opentelemetry.trace.getTracer('example-basic-tracer-node');
```

{{% /tab %}} {{< /tabpane >}}

このドキュメントの他の例と同様に、これによりアプリケーション全体で使用できるトレーサーがエクスポートされます。

#### `sdk-trace-base`でネストされたスパンを作成 {#creating-nested-spans-with-sdk-trace-base}

ネストされたスパンを作成するには、現在作成されているスパンを現在のコンテキストでアクティブなスパンとして設定する必要があります。
`startActiveSpan`を使用しても、これを行ってくれないので、使用しないでください。

```javascript
const mainWork = () => {
  const parentSpan = tracer.startSpan('main');

  for (let i = 0; i < 3; i += 1) {
    doWork(parentSpan, i);
  }

  // 必ず親スパンを終了してください！
  parentSpan.end();
};

const doWork = (parent, i) => {
  // 子スパンを作成するには、現在の（親）スパンをコンテキストでアクティブなスパンとしてマークし、
  // 結果のコンテキストを使用して子スパンを作成する必要があります。
  const ctx = opentelemetry.trace.setSpan(
    opentelemetry.context.active(),
    parent,
  );
  const span = tracer.startSpan(`doWork:${i}`, undefined, ctx);

  // ランダムな作業をシミュレートします。
  for (let i = 0; i <= Math.floor(Math.random() * 40000000); i += 1) {
    // 空
  }

  // 必ずこの子スパンを終了してください！そうしないと、
  // 'doWork'を超えて作業を追跡し続けます！
  span.end();
};
```

`sdk-trace-base`を使用する場合、他のすべてのAPIは、Node.jsまたはWeb SDKと比較して
同じように動作します。

## メトリクス {#metrics}

[メトリクス](/docs/concepts/signals/metrics)は、個々の測定値を集計に結合し、システム負荷の関数として一定のデータを生成します。
集計には、低レベルの問題を診断するために必要な詳細が欠けていますが、傾向を特定し、アプリケーションケーションランタイムのテレメトリーを提供することでスパンを補完します。

### メトリクスの初期化 {#initialize-metrics}

{{% alert %}}

ライブラリを計装している場合は、このステップをスキップしてください。

{{% /alert %}}

アプリケーションで[メトリクス](/docs/concepts/signals/metrics/)を有効にするには、[`Meter`](/docs/concepts/signals/metrics/#meter)を作成できる初期化された[`MeterProvider`](/docs/concepts/signals/metrics/#meter-provider)が必要です。

`MeterProvider`が作成されない場合、メトリクス用のOpenTelemetry APIはno-op実装を使用し、データの生成に失敗します。次に説明するように、NodeとブラウザですべてのSDK初期化コードを含めるように`instrumentation.ts`（または`instrumentation.js`）ファイルを変更します。

#### Node.js {#initialize-metrics-nodejs}

上記の[SDKの初期化](#initialize-the-sdk)の指示に従った場合、すでに`MeterProvider`がセットアップされています。
[メーターの取得](#acquiring-a-meter)に進むことができます。

##### `sdk-metrics`でメトリクスを初期化 {#initializing-metrics-with-sdk-metrics}

場合によっては、[Node.js用の完全なOpenTelemetry SDK](https://www.npmjs.com/package/@opentelemetry/sdk-node)を使用できないか、使用したくない場合があります。
ブラウザでOpenTelemetry JavaScriptを使用する場合も同様です。

その場合は、`@opentelemetry/sdk-metrics`パッケージでメトリクスを初期化できます。

```shell
npm install @opentelemetry/sdk-metrics
```

トレーシング用にまだ作成していない場合は、すべてのSDK初期化コードを含む別の`instrumentation.ts`（または`instrumentation.js`）ファイルを作成します。

{{< tabpane text=true >}} {{% tab TypeScript %}}

```ts
import opentelemetry from '@opentelemetry/api';
import {
  ConsoleMetricExporter,
  MeterProvider,
  PeriodicExportingMetricReader,
} from '@opentelemetry/sdk-metrics';
import {
  defaultResource,
  resourceFromAttributes,
} from '@opentelemetry/resources';
import {
  ATTR_SERVICE_NAME,
  ATTR_SERVICE_VERSION,
} from '@opentelemetry/semantic-conventions';

const resource = defaultResource().merge(
  resourceFromAttributes({
    [ATTR_SERVICE_NAME]: 'dice-server',
    [ATTR_SERVICE_VERSION]: '0.1.0',
  }),
);

const metricReader = new PeriodicExportingMetricReader({
  exporter: new ConsoleMetricExporter(),
  // デフォルトは60000ms（60秒）。デモンストレーション目的でのみ10秒に設定。
  exportIntervalMillis: 10000,
});

const myServiceMeterProvider = new MeterProvider({
  resource: resource,
  readers: [metricReader],
});

// このMeterProviderを計装されるアプリケーションにグローバルに設定します。
opentelemetry.metrics.setGlobalMeterProvider(myServiceMeterProvider);
```

{{% /tab %}} {{% tab JavaScript %}}

```js
const opentelemetry = require('@opentelemetry/api');
const {
  MeterProvider,
  PeriodicExportingMetricReader,
  ConsoleMetricExporter,
} = require('@opentelemetry/sdk-metrics');
const {
  defaultResource,
  resourceFromAttributes,
} = require('@opentelemetry/resources');
const {
  ATTR_SERVICE_NAME,
  ATTR_SERVICE_VERSION,
} = require('@opentelemetry/semantic-conventions');

const resource = defaultResource().merge(
  resourceFromAttributes({
    [ATTR_SERVICE_NAME]: 'service-name-here',
    [ATTR_SERVICE_VERSION]: '0.1.0',
  }),
);

const metricReader = new PeriodicExportingMetricReader({
  exporter: new ConsoleMetricExporter(),

  // デフォルトは60000ms（60秒）。デモンストレーション目的でのみ10秒に設定。
  exportIntervalMillis: 10000,
});

const myServiceMeterProvider = new MeterProvider({
  resource: resource,
  readers: [metricReader],
});

// このMeterProviderを計装されるアプリケーションにグローバルに設定します。
opentelemetry.metrics.setGlobalMeterProvider(myServiceMeterProvider);
```

{{% /tab %}} {{< /tabpane >}}

アプリケーションを実行するときに、このファイルを`--import`する必要があります。

{{< tabpane text=true >}} {{% tab TypeScript %}}

```sh
npx tsx --import ./instrumentation.ts app.ts
```

{{% /tab %}} {{% tab JavaScript %}}

```sh
node --import ./instrumentation.mjs app.js
```

{{% /tab %}} {{< /tabpane >}}

`MeterProvider`が構成されたので、`Meter`を取得できます。

### メーターの取得 {#acquiring-a-meter}

手動で計装されたコードがあるアプリケーションケーションのどこでも、`getMeter`を呼び出してメーターを取得できます。
例を挙げましょう。

{{< tabpane text=true >}} {{% tab TypeScript %}}

```ts
import opentelemetry from '@opentelemetry/api';

const myMeter = opentelemetry.metrics.getMeter(
  'instrumentation-scope-name',
  'instrumentation-scope-version',
);

// これで'meter'を使用してインストルメントを作成できます！
```

{{% /tab %}} {{% tab JavaScript %}}

```js
const opentelemetry = require('@opentelemetry/api');

const myMeter = opentelemetry.metrics.getMeter(
  'instrumentation-scope-name',
  'instrumentation-scope-version',
);

// これで'meter'を使用してインストルメントを作成できます！
```

{{% /tab %}} {{< /tabpane >}}

`instrumentation-scope-name`と`instrumentation-scope-version`の値は、パッケージ、モジュール、またはクラス名など、[計装スコープ](/docs/concepts/instrumentation-scope/)を一意に識別する必要があります。
名前は必須ですが、バージョンはオプションであるにもかかわらず推奨されます。

アプリケーションで必要なときに`getMeter`を呼び出すことが、メーターインスタンスアプリケーションの残りの部分にエクスポートするよりも一般的に推奨されます。
これは、他の必要な依存関係が関与している場合のより複雑なアプリケーションケーションロードの問題を回避するのに役立ちます。

[サンプルアプリケーション](#example-app)の場合、適切な計装スコープでトレーサーを取得できる場所が2つあります。

まず、_アプリケーションケーションファイル_ `app.ts`（または`app.js`）を以下のように実装します。

{{< tabpane text=true >}} {{% tab TypeScript %}}

```ts
/*app.ts*/
import { metrics, trace } from '@opentelemetry/api';
import express, { type Express } from 'express';
import { rollTheDice } from './dice';

const tracer = trace.getTracer('dice-server', '0.1.0');
const meter = metrics.getMeter('dice-server', '0.1.0');

const PORT: number = parseInt(process.env.PORT || '8080');
const app: Express = express();

app.get('/rolldice', (req, res) => {
  const rolls = req.query.rolls ? parseInt(req.query.rolls.toString()) : NaN;
  if (isNaN(rolls)) {
    res
      .status(400)
      .send("Request parameter 'rolls' is missing or not a number.");
    return;
  }
  res.send(JSON.stringify(rollTheDice(rolls, 1, 6)));
});

app.listen(PORT, () => {
  console.log(`Listening for requests on http://localhost:${PORT}`);
});
```

{{% /tab %}} {{% tab JavaScript %}}

```js
/*app.js*/
const { trace, metrics } = require('@opentelemetry/api');
const express = require('express');
const { rollTheDice } = require('./dice.js');

const tracer = trace.getTracer('dice-server', '0.1.0');
const meter = metrics.getMeter('dice-server', '0.1.0');

const PORT = parseInt(process.env.PORT || '8080');
const app = express();

app.get('/rolldice', (req, res) => {
  const rolls = req.query.rolls ? parseInt(req.query.rolls.toString()) : NaN;
  if (isNaN(rolls)) {
    res
      .status(400)
      .send("Request parameter 'rolls' is missing or not a number.");
    return;
  }
  res.send(JSON.stringify(rollTheDice(rolls, 1, 6)));
});

app.listen(PORT, () => {
  console.log(`Listening for requests on http://localhost:${PORT}`);
});
```

{{% /tab %}} {{< /tabpane >}}

そして2番目に、_ライブラリファイル_ `dice.ts`（または`dice.js`）で、以下のように実装します。

{{< tabpane text=true >}} {{% tab TypeScript %}}

```ts
/*dice.ts*/
import { trace, metrics } from '@opentelemetry/api';

const tracer = trace.getTracer('dice-lib');
const meter = metrics.getMeter('dice-lib');

function rollOnce(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

export function rollTheDice(rolls: number, min: number, max: number) {
  const result: number[] = [];
  for (let i = 0; i < rolls; i++) {
    result.push(rollOnce(min, max));
  }
  return result;
}
```

{{% /tab %}} {{% tab JavaScript %}}

```js
/*dice.js*/
const { trace, metrics } = require('@opentelemetry/api');

const tracer = trace.getTracer('dice-lib');
const meter = metrics.getMeter('dice-lib');

function rollOnce(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function rollTheDice(rolls, min, max) {
  const result = [];
  for (let i = 0; i < rolls; i++) {
    result.push(rollOnce(min, max));
  }
  return result;
}

module.exports = { rollTheDice };
```

{{% /tab %}} {{< /tabpane >}}

[メーター](/docs/concepts/signals/metrics/#meter)を初期化したので、[メトリクス計装](/docs/concepts/signals/metrics/#metric-instruments)を作成できます。

### カウンターの使用 {#using-counters}

カウンターは、非負の増加する値を測定するために使用できます。

[サンプルアプリケーション](#example-app)の場合、これを使用してサイコロが振られた回数をカウントできます。

{{< tabpane text=true >}} {{% tab TypeScript %}}

```ts
/*dice.ts*/
const counter = meter.createCounter('dice-lib.rolls.counter');

function rollOnce(min: number, max: number) {
  counter.add(1);
  return Math.floor(Math.random() * (max - min + 1) + min);
}
```

{{% /tab %}} {{% tab JavaScript %}}

```js
/*dice.js*/
const counter = meter.createCounter('dice-lib.rolls.counter');

function rollOnce(min, max) {
  counter.add(1);
  return Math.floor(Math.random() * (max - min + 1) + min);
}
```

{{% /tab %}} {{< /tabpane >}}

### UpDownカウンターの使用 {#using-updown-counters}

UpDownカウンターは増減できるため、上下する累積値を観察できます。

```js
const counter = myMeter.createUpDownCounter('events.counter');

//...

counter.add(1);

//...

counter.add(-1);
```

### ヒストグラムの使用 {#using-histograms}

ヒストグラムは、時間経過に伴う値の分布を測定するために使用されます。

たとえば、Expressを使用してAPIルートの応答時間の分布を報告する方法は次のとおりです。

{{< tabpane text=true >}} {{% tab TypeScript %}}

```ts
import express from 'express';

const app = express();

app.get('/', (_req, _res) => {
  const histogram = myMeter.createHistogram('task.duration');
  const startTime = new Date().getTime();

  // API呼び出しで何かの作業を行う

  const endTime = new Date().getTime();
  const executionTime = endTime - startTime;

  // タスク操作の期間を記録
  histogram.record(executionTime);
});
```

{{% /tab %}} {{% tab JavaScript %}}

```js
const express = require('express');

const app = express();

app.get('/', (_req, _res) => {
  const histogram = myMeter.createHistogram('task.duration');
  const startTime = new Date().getTime();

  // API呼び出しで何かの作業を行う

  const endTime = new Date().getTime();
  const executionTime = endTime - startTime;

  // タスク操作の期間を記録
  histogram.record(executionTime);
});
```

{{% /tab %}} {{< /tabpane >}}

### Observable（非同期）カウンターの使用 {#using-observable-async-counters}

Observableカウンターは、加法的、非負、単調増加する値を測定するために使用できます。

```js
const events = [];

const addEvent = (name) => {
  events.push(name);
};

const counter = myMeter.createObservableCounter('events.counter');

counter.addCallback((result) => {
  result.observe(events.length);
});

//... addEventへの呼び出し
```

### Observable（非同期）UpDownカウンターの使用 {#using-observable-async-updown-counters}

Observable UpDownカウンターは増減できるため、加算的、非負、非単調増加の累積値を測定できます。

```js
const events = [];

const addEvent = (name) => {
  events.push(name);
};

const removeEvent = () => {
  events.pop();
};

const counter = myMeter.createObservableUpDownCounter('events.counter');

counter.addCallback((result) => {
  result.observe(events.length);
});

//... addEventとremoveEventへの呼び出し
```

### Observable（非同期）ゲージの使用 {#using-observable-async-gauges}

Observableゲージは、非加算的な値を測定するために使用する必要があります。

```js
let temperature = 32;

const gauge = myMeter.createObservableGauge('temperature.gauge');

gauge.addCallback((result) => {
  result.observe(temperature);
});

//... temperature変数はセンサーによって変更されます
```

### 計装の説明 {#describing-instruments}

カウンター、ヒストグラムなどの計装を作成するときに、説明を付けることができます。

```js
const httpServerResponseDuration = myMeter.createHistogram(
  'http.server.duration',
  {
    description: 'HTTPサーバー応答時間の分布',
    unit: 'milliseconds',
    valueType: ValueType.INT,
  },
);
```

JavaScriptでは、各構成タイプは次のことを意味します。

- `description` - 計装の人間が読める説明
- `unit` - 値が表すことを意図している測定単位の説明。たとえば、期間を測定するための`milliseconds`、バイト数をカウントするための`bytes`。
- `valueType` - 測定で使用される数値の種類。

作成する各計装を説明することを一般的にお勧めします。

### 属性の追加 {#adding-attributes}

メトリクスが生成されるときに属性を追加できます。

```js
const counter = myMeter.createCounter('my.counter');

counter.add(1, { 'some.optional.attribute': 'some value' });
```

### メトリクスビューの構成 {#configure-metric-views}

メトリクスビューは、開発者にメトリクスSDKによって公開されるメトリクスをカスタマイズする機能を提供します。

#### セレクター {#selectors}

ビューをインスタンス化するには、まずターゲット計装を選択する必要があります。
以下は、メトリクスの有効なセレクターです。

- `instrumentType`
- `instrumentName`
- `meterName`
- `meterVersion`
- `meterSchemaUrl`

`instrumentName`（string型）による選択はワイルドカードをサポートしているため、`*`を使用してすべての計装を選択したり、`http*`を使用して名前が`http`で始まるすべての計装を選択したりできます。

#### 例 {#examples}

すべてのメトリクスタイプで属性をフィルタリング場合。

```js
const limitAttributesView = {
  // 属性'environment'のみをエクスポート
  attributeKeys: ['environment'],
  // すべてのインストルメントにビューを適用
  instrumentName: '*',
};
```

メーター名`pubsub`を持つすべての計装をドロップする場合。

```js
const dropView = {
  aggregation: { type: AggrgationType.DROP },
  meterName: 'pubsub',
};
```

`http.server.duration`という名前のヒストグラムに明示的なバケットサイズを定義する場合。

```js
const histogramView = {
  aggregation: {
    type: AggregationType.EXPLICIT_BUCKET_HISTOGRAM,
    options: { boundaries: [0, 1, 5, 10, 15, 20, 25, 30] },
  },
  instrumentName: 'http.server.duration',
  instrumentType: InstrumentType.HISTOGRAM,
};
```

#### メータープロバイダーにアタッチ {#attach-to-meter-provider}

ビューが構成されたら、対応するメータープロバイダーにアタッチします。

```js
const meterProvider = new MeterProvider({
  views: [limitAttributesView, dropView, histogramView],
});
```

## ログ {#logs}

ログAPIとSDKは現在開発中です。

## 次のステップ {#next-steps}

また、[テレメトリーデータをエクスポート](/docs/languages/js/exporters)するために、1つ以上のテレメトリーバックエンドに適切なエクスポーターを設定する必要があります。
