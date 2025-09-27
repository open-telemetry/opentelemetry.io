---
title: 計装ライブラリの使用
linkTitle: ライブラリ
weight: 40
description: アプリが依存するライブラリをインストルメントする方法
default_lang_commit: 276d7eb3f936deef6487cdd2b1d89822951da6c8
---

{{% docs/languages/libraries-intro "js" %}}

## 計装ライブラリの使用 {#use-natively-instrumented-libraries}

ライブラリがOpenTelemetryを最初から組み込んでいない場合、ライブラリやフレームワークのテレメトリーデータを生成するために[計装ライブラリ](/docs/specs/otel/glossary/#instrumentation-library)を使用できます。

たとえば、[Expressの計装ライブラリ](https://www.npmjs.com/package/@opentelemetry/instrumentation-express)は、インバウンドHTTPリクエストに基づいて自動的に[スパン](/docs/concepts/signals/traces/#spans)を作成します。

### セットアップ {#setup}

各計装ライブラリはNPMパッケージです。
たとえば、インバウンドとアウトバウンドのHTTPトラフィックを計装するために[instrumentation-express](https://www.npmjs.com/package/@opentelemetry/instrumentation-express)と[instrumentation-http](https://www.npmjs.com/package/@opentelemetry/instrumentation-http)計装ライブラリをインストールする方法は以下の通りです。

```sh
npm install --save @opentelemetry/instrumentation-http @opentelemetry/instrumentation-express
```

OpenTelemetry JavaScriptでは、[auto-instrumentation-node](https://www.npmjs.com/package/@opentelemetry/auto-instrumentations-node)と[auto-instrumentation-web](https://www.npmjs.com/package/@opentelemetry/auto-instrumentations-web)のメタパッケージも定義されており、すべてのNode.jsまたはWebベースの計装ライブラリを単一のパッケージにバンドルしています。
これは、最小限の労力ですべてのライブラリに自動生成されたテレメトリーを追加する便利な方法です。

{{< tabpane text=true >}}

{{% tab Node.js %}}

```shell
npm install --save @opentelemetry/auto-instrumentations-node
```

{{% /tab %}}

{{% tab Browser %}}

```shell
npm install --save @opentelemetry/auto-instrumentations-web
```

{{% /tab %}} {{< /tabpane >}}

これらのメタパッケージを使用すると、依存関係グラフのサイズが増加することに注意してください。必要な計装ライブラリが正確にわかっている場合は、個別の計装ライブラリを使用してください。

### 登録 {#registration}

必要な計装ライブラリをインストールした後、OpenTelemetry SDK for Node.jsに登録します。
[Getting Started](/docs/languages/js/getting-started/nodejs/)に従った場合、すでにメタパッケージを使用しています。[手動計装用にSDKを初期化する](/docs/languages/js/instrumentation/#initialize-tracing)手順に従った場合は、`instrumentation.ts`（または`instrumentation.js`）を以下のように更新してください。

{{< tabpane text=true >}}

{{% tab TypeScript %}}

```typescript
/*instrumentation.ts*/
...
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';

const sdk = new NodeSDK({
  ...
  // これによりすべての計装パッケージが登録される
  instrumentations: [getNodeAutoInstrumentations()]
});

sdk.start()
```

{{% /tab %}}

{{% tab JavaScript %}}

```javascript
/*instrumentation.js*/
const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node');

const sdk = new NodeSDK({
  ...
  // これによりすべての計装パッケージが登録される
  instrumentations: [getNodeAutoInstrumentations()]
});
```

{{% /tab %}}

{{< /tabpane >}}

個別の計装ライブラリを無効にするには、以下の変更を適用できます。

{{< tabpane text=true >}}

{{% tab TypeScript %}}

```typescript
/*instrumentation.ts*/
...
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';

const sdk = new NodeSDK({
  ...
  // これによりすべての計装パッケージが登録される
  instrumentations: [
    getNodeAutoInstrumentations({
      '@opentelemetry/instrumentation-fs': {
        enabled: false,
      },
    }),
  ],
});

sdk.start()
```

{{% /tab %}}

{{% tab JavaScript %}}

```javascript
/*instrumentation.js*/
const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node');

const sdk = new NodeSDK({
  ...
  // これによりすべての計装パッケージが登録される
  instrumentations: [
    getNodeAutoInstrumentations({
      '@opentelemetry/instrumentation-fs': {
        enabled: false,
      },
    }),
  ],
});
```

{{% /tab %}}

{{< /tabpane >}}

個別の計装ライブラリのみをロードするには、`[getNodeAutoInstrumentations()]`を必要なもののリストに置き換えます。

{{< tabpane text=true >}}

{{% tab TypeScript %}}

```typescript
/*instrumentation.ts*/
...
import { HttpInstrumentation } from "@opentelemetry/instrumentation-http";
import { ExpressInstrumentation } from "@opentelemetry/instrumentation-express";

const sdk = new NodeSDK({
  ...
  instrumentations: [
    // Express計装はHTTPレイヤーがインストルメントされることを期待している
    new HttpInstrumentation(),
    new ExpressInstrumentation(),
  ]
});

sdk.start()
```

{{% /tab %}} {{% tab JavaScript %}}

```javascript
/*instrumentation.js*/
const { HttpInstrumentation } = require("@opentelemetry/instrumentation-http");
const { ExpressInstrumentation } = require("@opentelemetry/instrumentation-express");

const sdk = new NodeSDK({
  ...
  instrumentations: [
    // Express計装はHTTPレイヤーがインストルメントされることを期待している
    new HttpInstrumentation(),
    new ExpressInstrumentation(),
  ]
});
```

{{% /tab %}}

{{< /tabpane >}}

### 設定 {#configuration}

一部の計装ライブラリは追加の設定オプションを提供しています。

たとえば、[Express計装](https://github.com/open-telemetry/opentelemetry-js-contrib/tree/main/packages/instrumentation-express#express-instrumentation-options)は、指定されたミドルウェアを無視したり、リクエストフックで自動的に作成されるスパンを強化したりする方法を提供しています。

{{< tabpane text=true >}}

{{% tab TypeScript %}}

```typescript
import { Span } from '@opentelemetry/api';
import {
  SEMATTRS_HTTP_METHOD,
  SEMATTRS_HTTP_URL,
} from '@opentelemetry/semantic-conventions';
import {
  ExpressInstrumentation,
  ExpressLayerType,
  ExpressRequestInfo,
} from '@opentelemetry/instrumentation-express';

const expressInstrumentation = new ExpressInstrumentation({
  requestHook: function (span: Span, info: ExpressRequestInfo) {
    if (info.layerType === ExpressLayerType.REQUEST_HANDLER) {
      span.setAttribute(SEMATTRS_HTTP_METHOD, info.request.method);
      span.setAttribute(SEMATTRS_HTTP_URL, info.request.baseUrl);
    }
  },
});
```

{{% /tab %}}

{{% tab JavaScript %}}

```javascript
/*instrumentation.js*/
const {
  SEMATTRS_HTTP_METHOD,
  SEMATTRS_HTTP_URL,
} = require('@opentelemetry/semantic-conventions');
const {
  ExpressInstrumentation,
  ExpressLayerType,
} = require('@opentelemetry/instrumentation-express');

const expressInstrumentation = new ExpressInstrumentation({
  requestHook: function (span, info) {
    if (info.layerType === ExpressLayerType.REQUEST_HANDLER) {
      span.setAttribute(SEMATTRS_HTTP_METHOD, info.request.method);
      span.setAttribute(SEMATTRS_HTTP_URL, info.request.baseUrl);
    }
  },
});
```

{{% /tab %}}

{{< /tabpane >}}

高度な設定については、各計装ライブラリのドキュメントを参照する必要があります。

### 利用可能な計装ライブラリ {#available-instrumentation-libraries}

利用可能な計装のリストは[レジストリ](/ecosystem/registry/?language=js&component=instrumentation)で確認できます。

## ライブラリをネイティブに計装 {#instrument-a-library-natively}

ライブラリにネイティブ計装を追加したい場合は、以下のドキュメントを確認してください。

- コンセプトページ[Libraries](/docs/concepts/instrumentation/libraries/)では、いつ計装するか、何を計装するかについての洞察を提供します
- [手動計装](/docs/languages/js/instrumentation/)では、ライブラリのトレース、メトリクス、ログを作成するために必要なコード例を提供します
- Node.jsとブラウザ向けの[Instrumentation Implementation Guide](https://github.com/open-telemetry/opentelemetry-js-contrib/blob/main/GUIDELINES.md)には、ライブラリ計装を作成するためのJavaScript固有のベストプラクティスが含まれています

## 計装ライブラリの作成 {#create-an-instrumentation-library}

アプリケーションのための最初から最後までのオブザーバビリティを持つことが望ましい方法ですが、これが常に可能または望ましいとは限りません。
そのような場合は、インターフェースのラッピング、ライブラリ固有のコールバックの購読、既存のテレメトリーのOpenTelemetryモデルへの変換などのメカニズムを使用して計装呼び出しを注入する計装ライブラリを作成できます。

そのようなライブラリを作成するには、Node.jsとブラウザ向けの[Instrumentation Implementation Guide](https://github.com/open-telemetry/opentelemetry-js-contrib/blob/main/GUIDELINES.md)に従ってください。
