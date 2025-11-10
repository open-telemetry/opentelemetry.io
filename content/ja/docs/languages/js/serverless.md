---
title: サーバーレス
weight: 100
description: OpenTelemetry JavaScriptでサーバーレス関数をインストルメント
default_lang_commit: 6f3712c5cda4ea79f75fb410521880396ca30c91 # patched
drifted_from_default: true
cSpell:ignore: otelwrapper
---

このガイドでは、OpenTelemetry計装ライブラリを使用してサーバーレス関数のトレーシングを開始する方法を説明します。

## AWS Lambda {#aws-lambda}

{{% alert title="注意" %}}

[コミュニティ提供のLambdaレイヤー](/docs/platforms/faas/lambda-auto-instrument/)を使用してAWS Lambda関数を自動的に計装することもできます。

{{% /alert %}}

以下では、OpenTelemetryでLambdaラッパーを使用してAWS Lambda関数を手動で計装し、設定されたバックエンドにトレースを送信する方法を示します。

プラグアンドプレイのユーザー体験に興味がある場合は、[OpenTelemetry Lambda Layers](https://github.com/open-telemetry/opentelemetry-lambda)を参照してください。

### 依存関係 {#dependencies}

まず、空の`package.json`を作成します。

```sh
npm init -y
```

次に、必要な依存関係をインストールします。

```sh
npm install \
  @opentelemetry/api \
  @opentelemetry/auto-instrumentations-node \
  @opentelemetry/exporter-trace-otlp-http \
  @opentelemetry/instrumentation \
  @opentelemetry/sdk-trace-base \
  @opentelemetry/sdk-trace-node
```

### AWS Lambdaラッパーコード {#aws-lambda-wrapper-code}

このファイルには、トレーシングを有効にするすべてのOpenTelemetryロジックが含まれています。
以下のコードを`lambda-wrapper.js`として保存してください。

```javascript
/* lambda-wrapper.js */

const api = require('@opentelemetry/api');
const { BatchSpanProcessor } = require('@opentelemetry/sdk-trace-base');
const {
  OTLPTraceExporter,
} = require('@opentelemetry/exporter-trace-otlp-http');
const { NodeTracerProvider } = require('@opentelemetry/sdk-trace-node');
const { registerInstrumentations } = require('@opentelemetry/instrumentation');
const {
  getNodeAutoInstrumentations,
} = require('@opentelemetry/auto-instrumentations-node');

api.diag.setLogger(new api.DiagConsoleLogger(), api.DiagLogLevel.ALL);

const spanProcessor = new BatchSpanProcessor(
  new OTLPTraceExporter({
    url: '<backend_url>',
  }),
);

const provider = new NodeTracerProvider({
  spanProcessors: [spanProcessor],
});

provider.register();

registerInstrumentations({
  instrumentations: [
    getNodeAutoInstrumentations({
      '@opentelemetry/instrumentation-aws-lambda': {
        disableAwsContextPropagation: true,
      },
    }),
  ],
});
```

`<backend_url>`を、すべてのトレースをエクスポートするお気に入りのバックエンドのURLに置き換えてください。
まだセットアップしていない場合は、[Jaeger](https://www.jaegertracing.io/)または[Zipkin](https://zipkin.io/)をチェックしてください。

`disableAwsContextPropagation`がtrueに設定されていることに注意してください。
これは、Lambda計装がデフォルトでX-Rayコンテキストヘッダーを使用しようとするためです。
この関数でアクティブトレーシングが有効になっていない限り、これは非サンプルコンテキストとなり、`NonRecordingSpan`を作成します。

詳細については、計装[ドキュメント](https://www.npmjs.com/package/@opentelemetry/instrumentation-aws-lambda)を参照してください。

### AWS Lambda関数ハンドラー {#aws-lambda-function-handler}

Lambdaラッパーができたので、Lambda関数として機能するシンプルなハンドラーを作成します。
以下のコードを`handler.js`として保存してください。

```javascript
/* handler.js */

'use strict';

const https = require('https');

function getRequest() {
  const url = 'https://opentelemetry.io/';

  return new Promise((resolve, reject) => {
    const req = https.get(url, (res) => {
      resolve(res.statusCode);
    });

    req.on('error', (err) => {
      reject(new Error(err));
    });
  });
}

exports.handler = async (event) => {
  try {
    const result = await getRequest();
    return {
      statusCode: result,
    };
  } catch (error) {
    return {
      statusCode: 400,
      body: error.message,
    };
  }
};
```

### デプロイメント {#deployment}

Lambda関数をデプロイする方法は複数あります。

- [AWSコンソール](https://aws.amazon.com/console/)
- [AWS CLI](https://aws.amazon.com/cli/)
- [Serverless Framework](https://github.com/serverless/serverless)
- [Terraform](https://github.com/hashicorp/terraform)

ここではServerless Frameworkを使用します。
詳細については、[Setting Up Serverless Frameworkガイド](https://www.serverless.com/framework/docs/getting-started)を参照してください。

`serverless.yml`というファイルを作成します。

```yaml
service: lambda-otel-native
frameworkVersion: '3'
provider:
  name: aws
  runtime: nodejs14.x
  region: '<your-region>'
  environment:
    NODE_OPTIONS: --require lambda-wrapper
functions:
  lambda-otel-test:
    handler: handler.hello
```

OpenTelemetryが正常に動作するためには、`lambda-wrapper.js`が他のすべてのファイルより前に含まれている必要があります。
`NODE_OPTIONS`設定がこれを保証します。

Serverless Frameworkを使用してLambda関数をデプロイしていない場合は、AWSコンソールUIを使用してこの環境変数を手動で追加する必要があることに注意してください。

最後に、以下のコマンドを実行してプロジェクトをAWSにデプロイします。

```shell
serverless deploy
```

AWSコンソールUIを使用して、新しくデプロイされたLambda関数を呼び出すことができます。
Lambda関数の呼び出しに関連するスパンが表示されることが期待されます。

### バックエンドの確認 {#visiting-the-backend}

Lambda関数からOpenTelemetryによって生成されたトレースをバックエンドで確認できるようになります。

## GCP function {#gcp-function}

以下では、Google Cloud Platform（GCP）UIを使用して[HTTPトリガー関数](https://docs.cloud.google.com/run/docs/write-functions)を計装する方法を示します。

### 関数の作成 {#creating-function}

GCPにログインして、関数を配置するプロジェクトを作成または選択します。
サイドメニューで*Serverless*に移動し、*Cloud Functions*を選択します。
次に、*Create Function*をクリックし、環境として[2nd generation](https://cloud.google.com/blog/products/serverless/cloud-functions-2nd-generation-now-generally-available)を選択し、関数名を入力してリージョンを選択します。

### otelwrapperの環境変数設定 {#setup-environment-variable-for-otelwrapper}

閉じている場合は、*Runtime, build, connections and security settings*メニューを開き、下にスクロールして環境変数`NODE_OPTIONS`を以下の値で追加します。

```shell
--require ./otelwrapper.js
```

### ランタイムの選択 {#select-runtime}

次の画面（_Code_）で、ランタイムとしてNode.jsバージョン16を選択します。

### OTelラッパーの作成 {#create-otel-wrapper}

サービスを計装するために使用される`otelwrapper.js`という新しいファイルを作成します。
`SERVICE_NAME`を提供し、`<address for your backend>`を設定してください。

```javascript
/* otelwrapper.js */

const { resourceFromAttributes } = require('@opentelemetry/resources');
const {
  SEMRESATTRS_SERVICE_NAME,
} = require('@opentelemetry/semantic-conventions');
const api = require('@opentelemetry/api');
const { BatchSpanProcessor } = require('@opentelemetry/sdk-trace-base');
const {
  OTLPTraceExporter,
} = require('@opentelemetry/exporter-trace-otlp-http');
const { NodeTracerProvider } = require('@opentelemetry/sdk-trace-node');
const { registerInstrumentations } = require('@opentelemetry/instrumentation');
const {
  getNodeAutoInstrumentations,
} = require('@opentelemetry/auto-instrumentations-node');

api.diag.setLogger(new api.DiagConsoleLogger(), api.DiagLogLevel.ALL);

const collectorOptions = {
  url: '<address for your backend>',
};

const provider = new NodeTracerProvider({
  resource: resourceFromAttributes({
    [SEMRESATTRS_SERVICE_NAME]: '<your function name>',
  }),
  spanProcessors: [
    new BatchSpanProcessor(new OTLPTraceExporter(collectorOptions)),
  ],
});

provider.register();

registerInstrumentations({
  instrumentations: [getNodeAutoInstrumentations()],
});
```

### パッケージ依存関係の追加 {#add-package-dependencies}

`package.json`に以下を追加します。

```json
{
  "dependencies": {
    "@google-cloud/functions-framework": "^3.0.0",
    "@opentelemetry/api": "^1.9.0",
    "@opentelemetry/auto-instrumentations-node": "^0.56.1",
    "@opentelemetry/exporter-trace-otlp-http": "^0.200.0",
    "@opentelemetry/instrumentation": "^0.200.0",
    "@opentelemetry/sdk-trace-base": "^2.0.0",
    "@opentelemetry/sdk-trace-node": "^2.0.0",
    "@opentelemetry/resources": "^2.0.0",
    "@opentelemetry/semantic-conventions": "^2.0.0"
  }
}
```

### 関数にHTTP呼び出しを追加 {#add-http-call-to-function}

以下のコードは、アウトバウンド呼び出しを実証するためにOpenTelemetryウェブサイトに呼び出しを行います。

```javascript
/* index.js */
const functions = require('@google-cloud/functions-framework');
const https = require('https');

functions.http('helloHttp', (req, res) => {
  let url = 'https://opentelemetry.io/';
  https
    .get(url, (response) => {
      res.send(`Response ${response.body}!`);
    })
    .on('error', (e) => {
      res.send(`Error ${e}!`);
    });
});
```

### バックエンド {#backend}

GCP VMでOTelコレクターを実行する場合、トレースを送信できるように[VPCアクセスコネクターを作成](https://cloud.google.com/vpc/docs/configure-serverless-vpc-access)する必要がある可能性があります。

### デプロイ {#deploy}

UIでDeployを選択し、デプロイメントの準備ができるまで待ちます。

### テスト {#testing}

テストタブからクラウドシェルを使用して関数をテストできます。
