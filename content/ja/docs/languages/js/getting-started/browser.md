---
title: ブラウザ
aliases: [/docs/js/getting_started/browser]
description: ブラウザアプリにOpenTelemetryを追加する方法を学ぶ
weight: 20
default_lang_commit: 6f3712c5cda4ea79f75fb410521880396ca30c91
drifted_from_default: true
---

{{% include browser-instrumentation-warning.md %}}

このガイドでは以下に示すサンプルアプリケーションを使用しますが、独自のアプリケーションを計装する手順も同様のはずです。

## 前提条件 {#prerequisites}

以下がローカルにインストールされていることを確認してください。

- [Node.js](https://nodejs.org/en/download/)
- [TypeScript](https://www.typescriptlang.org/download)（TypeScriptを使用する場合）。

## サンプルアプリケーション {#example-application}

これは非常にシンプルなガイドです。
より複雑な例を見たい場合は、[examples/opentelemetry-web](https://github.com/open-telemetry/opentelemetry-js/tree/main/examples/opentelemetry-web)を参照してください。

以下のファイルを空のディレクトリにコピーし、`index.html`という名前を付けます。

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Document Load Instrumentation Example</title>
    <base href="/" />
    <!--
      https://www.w3.org/TR/trace-context/
      サーバーのHTMLテンプレートコードで`traceparent`を設定します。これは、
      サーバーのリクエストトレースID、サーバーのリクエストスパンに設定された
      親スパンID、およびサーバーのサンプリング決定を示すトレースフラグ
      （01 = サンプリング済み、00 = サンプリングなし）を持つように、
      サーバー側で動的に生成される必要があります。
      '{version}-{traceId}-{spanId}-{sampleDecision}'
    -->
    <meta
      name="traceparent"
      content="00-ab42124a3c573678d4d8b21ba52df3bf-d21f7bc17caa5aba-01"
    />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
  </head>
  <body>
    コンソールエクスポーターとコレクターエクスポーターを使用した、
    ドキュメントロード計装を持つWebトレーサーの使用例
  </body>
</html>
```

### インストール {#installation}

ブラウザでトレースを作成するには、`@opentelemetry/sdk-trace-web`と計装 `@opentelemetry/instrumentation-document-load`が必要です。

```shell
npm init -y
npm install @opentelemetry/api \
  @opentelemetry/sdk-trace-web \
  @opentelemetry/instrumentation-document-load \
  @opentelemetry/context-zone
```

### 初期化と構成 {#initialization-and-configuration}

TypeScriptでコーディングしている場合は、次のコマンドを実行します。

```shell
tsc --init
```

次に、[parcel](https://parceljs.org/)を取得します。
これにより、（他の機能の中でも）TypeScriptで作業できるようになります。

```shell
npm install --save-dev parcel
```

選択した言語に応じて、`.ts`または`.js`拡張子を持つ`document-load`という名前の空のコードファイルを作成します。
HTMLの`</body>`閉じタグの直前に次のコードを追加します。

{{< tabpane text=true >}} {{% tab TypeScript %}}

```html
<script type="module" src="document-load.ts"></script>
```

{{% /tab %}} {{% tab JavaScript %}}

```html
<script type="module" src="document-load.js"></script>
```

{{% /tab %}} {{< /tabpane >}}

ドキュメントのロードタイミングをトレースし、それらをOpenTelemetryスパンとして出力するコードを追加します。

### トレーサープロバイダーの作成 {#creating-a-tracer-provider}

`document-load.ts|js`に次のコードを追加して、ドキュメントロードをトレースするための計装をもたらすトレーサープロバイダーを作成します。

```js
/* document-load.ts|jsファイル - 両方の言語で同じコードスニペット */
import { WebTracerProvider } from '@opentelemetry/sdk-trace-web';
import { DocumentLoadInstrumentation } from '@opentelemetry/instrumentation-document-load';
import { ZoneContextManager } from '@opentelemetry/context-zone';
import { registerInstrumentations } from '@opentelemetry/instrumentation';

const provider = new WebTracerProvider();

provider.register({
  // デフォルトのcontextManagerをZoneContextManagerに変更 - 非同期操作をサポート - オプション
  contextManager: new ZoneContextManager(),
});

// 計装の登録
registerInstrumentations({
  instrumentations: [new DocumentLoadInstrumentation()],
});
```

parcelでアプリをビルドします。

```shell
npx parcel index.html
```

開発Webサーバー（例：`http://localhost:1234`）を開いて、コードが動作するか確認します。

まだトレースの出力はありません。これにはエクスポーターを追加する必要があります。

### エクスポーターの作成 {#creating-an-exporter}

次の例では、すべてのスパンをコンソールに出力する`ConsoleSpanExporter`を使用します。

トレースを視覚化して分析するには、トレーシングバックエンドにエクスポートする必要があります。
バックエンドとエクスポーターの設定については、[これらの手順](../../exporters)に従ってください。

また、リソースをより効率的に使用するために、`BatchSpanProcessor`を使用してスパンをバッチでエクスポートすることもできます。

トレースをコンソールにエクスポートするには、`document-load.ts|js`を次のコードスニペットに一致するように変更します。

```js
/* document-load.ts|jsファイル - 両方の言語で同じコード */
import {
  ConsoleSpanExporter,
  SimpleSpanProcessor,
} from '@opentelemetry/sdk-trace-base';
import { WebTracerProvider } from '@opentelemetry/sdk-trace-web';
import { DocumentLoadInstrumentation } from '@opentelemetry/instrumentation-document-load';
import { ZoneContextManager } from '@opentelemetry/context-zone';
import { registerInstrumentations } from '@opentelemetry/instrumentation';

const provider = new WebTracerProvider({
  spanProcessors: [new SimpleSpanProcessor(new ConsoleSpanExporter())],
});

provider.register({
  // デフォルトのcontextManagerをZoneContextManagerに変更 - 非同期操作をサポート - オプション
  contextManager: new ZoneContextManager(),
});

// 計装の登録
registerInstrumentations({
  instrumentations: [new DocumentLoadInstrumentation()],
});
```

アプリケーションを再ビルドし、ブラウザを再度開きます。
開発者ツールバーのコンソールに、いくつかのトレースがエクスポートされているのが表示されるはずです。

```json
{
  "traceId": "ab42124a3c573678d4d8b21ba52df3bf",
  "parentId": "cfb565047957cb0d",
  "name": "documentFetch",
  "id": "5123fc802ffb5255",
  "kind": 0,
  "timestamp": 1606814247811266,
  "duration": 9390,
  "attributes": {
    "component": "document-load",
    "http.response_content_length": 905
  },
  "status": {
    "code": 0
  },
  "events": [
    {
      "name": "fetchStart",
      "time": [1606814247, 811266158]
    },
    {
      "name": "domainLookupStart",
      "time": [1606814247, 811266158]
    },
    {
      "name": "domainLookupEnd",
      "time": [1606814247, 811266158]
    },
    {
      "name": "connectStart",
      "time": [1606814247, 811266158]
    },
    {
      "name": "connectEnd",
      "time": [1606814247, 811266158]
    },
    {
      "name": "requestStart",
      "time": [1606814247, 819101158]
    },
    {
      "name": "responseStart",
      "time": [1606814247, 819791158]
    },
    {
      "name": "responseEnd",
      "time": [1606814247, 820656158]
    }
  ]
}
```

### 計装の追加 {#add-instrumentations}

Ajaxリクエスト、ユーザーインタラクションなどを計装したい場合は、それらのための追加の計装を登録できます。

```javascript
registerInstrumentations({
  instrumentations: [
    new UserInteractionInstrumentation(),
    new XMLHttpRequestInstrumentation(),
  ],
});
```

## Web用メタパッケージ {#meta-packages-for-web}

最も一般的な計装をすべて1つにまとめて活用するには、単純に[OpenTelemetry Meta Packages for Web](https://www.npmjs.com/package/@opentelemetry/auto-instrumentations-web)を使用できます。
