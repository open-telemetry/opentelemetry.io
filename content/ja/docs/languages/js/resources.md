---
title: リソース
weight: 70
description: アプリケーションの環境に関する詳細情報をテレメトリに追加する
default_lang_commit: 68e94a4555606e74c27182b79789d46faf84ec25
cSpell:ignore: myhost SIGINT uuidgen WORKDIR
---

{{% docs/languages/resources-intro %}}

以下では、Node.js SDKでリソース検出を設定する方法について説明します。

## セットアップ {#setup}

[Getting Started - Node.js][]の手順に従って、`package.json`、`app.js`、`tracing.js`ファイルを用意してください。

## プロセスおよび環境リソースの検出 {#process--environment-resource-detection}

Node.js SDKは、初期設定で[プロセスとプロセスランタイムリソース][process and process runtime resources]を検出し、環境変数`OTEL_RESOURCE_ATTRIBUTES`から属性を取得します。
`tracing.js`で診断ログを有効にすることで、何が検出されているかを確認できます。

```javascript
// トラブルシューティングのため、ログレベルをDiagLogLevel.DEBUGに設定
diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.DEBUG);
```

`OTEL_RESOURCE_ATTRIBUTES`にいくつかの値を設定してアプリケーションを実行します。
たとえば、[Host][]を識別するために`host.name`を設定します。

```console
$ env OTEL_RESOURCE_ATTRIBUTES="host.name=localhost" \
  node --require ./tracing.js app.js
@opentelemetry/api: Registered a global for diag v1.2.0.
...
Listening for requests on http://localhost:8080
EnvDetector found resource. Resource { attributes: { 'host.name': 'localhost' } }
ProcessDetector found resource. Resource {
  attributes: {
    'process.pid': 12345,
    'process.executable.name': 'node',
    'process.command': '/app.js',
    'process.command_line': '/bin/node /app.js',
    'process.runtime.version': '16.17.0',
    'process.runtime.name': 'nodejs',
    'process.runtime.description': 'Node.js'
  }
}
...
```

## 環境変数でリソースを追加 {#adding-resources-with-environment-variables}

上記の例では、SDKがプロセスを検出し、環境変数で設定された`host.name=localhost`属性も自動的に追加されています。

以下では、リソースを自動検出する手順を説明します。
ただし、必要なリソースに対応する検出器が存在しない場合があります。
その場合は、環境変数`OTEL_RESOURCE_ATTRIBUTES`を使用して必要な情報を追加してください。
また、環境変数`OTEL_SERVICE_NAME`を使用して`service.name`リソース属性の値を設定することもできます。
たとえば、以下のスクリプトは[Service][]、[Host][]、[OS][]リソース属性を追加します。

```console
$ env OTEL_SERVICE_NAME="app.js" OTEL_RESOURCE_ATTRIBUTES="service.namespace=tutorial,service.version=1.0,service.instance.id=`uuidgen`,host.name=${HOSTNAME},host.type=`uname -m`,os.name=`uname -s`,os.version=`uname -r`" \
  node --require ./tracing.js app.js
...
EnvDetector found resource. Resource {
  attributes: {
    'service.name': 'app.js',
    'service.namespace': 'tutorial',
    'service.version': '1.0',
    'service.instance.id': '46D99F44-27AB-4006-9F57-3B7C9032827B',
    'host.name': 'myhost',
    'host.type': 'arm64',
    'os.name': 'linux',
    'os.version': '6.0'
  }
}
...
```

## コードでリソースを追加 {#adding-resources-in-code}

カスタムリソースはコードでも設定できます。
`NodeSDK`では設定オプションが提供されており、ここでリソースを設定できます。
たとえば、以下のように`tracing.js`を更新して`service.*`属性を設定できます。

```javascript
...
const { resourceFromAttributes } = require('@opentelemetry/resources');
const { ATTR_SERVICE_NAME, ATTR_SERVICE_VERSION } = require('@opentelemetry/semantic-conventions');
...
const sdk = new opentelemetry.NodeSDK({
  ...
  resource: resourceFromAttributes({
    [ ATTR_SERVICE_NAME ]: "yourServiceName",
    [ ATTR_SERVICE_VERSION ]: "1.0",
  })
  ...
});
...
```

{{% alert title="注意" class="info" %}}

環境変数とコードの両方でリソース属性を設定した場合、環境変数で設定された値が優先されます。

{{% /alert %}}

## コンテナリソースの検出 {#container-resource-detection}

同じセットアップ（`package.json`、`app.js`、デバッグを有効にした`tracing.js`）を使用し、同じディレクトリに以下の内容の`Dockerfile`を作成します。

```Dockerfile
FROM node:latest
WORKDIR /usr/src/app
COPY package.json ./
RUN npm install
COPY . .
EXPOSE 8080
CMD [ "node", "--require", "./tracing.js", "app.js" ]
```

<kbd>Ctrl + C</kbd>（`SIGINT`）でDockerコンテナを停止できるようにするため、`app.js`の最後に以下を追加します。

```javascript
process.on('SIGINT', function () {
  process.exit();
});
```

コンテナのIDを自動検出するため、以下の追加依存関係をインストールします。

```sh
npm install @opentelemetry/resource-detector-container
```

次に、`tracing.js`を以下のように更新します。

```javascript
const opentelemetry = require('@opentelemetry/sdk-node');
const {
  getNodeAutoInstrumentations,
} = require('@opentelemetry/auto-instrumentations-node');
const { diag, DiagConsoleLogger, DiagLogLevel } = require('@opentelemetry/api');
const {
  containerDetector,
} = require('@opentelemetry/resource-detector-container');

// トラブルシューティングのため、ログレベルをDiagLogLevel.DEBUGに設定
diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.DEBUG);

const sdk = new opentelemetry.NodeSDK({
  traceExporter: new opentelemetry.tracing.ConsoleSpanExporter(),
  instrumentations: [getNodeAutoInstrumentations()],
  resourceDetectors: [containerDetector],
});

sdk.start();
```

Dockerイメージをビルドします。

```sh
docker build . -t nodejs-otel-getting-started
```

Dockerコンテナを実行します。

```sh
$ docker run --rm -p 8080:8080 nodejs-otel-getting-started
@opentelemetry/api: Registered a global for diag v1.2.0.
...
Listening for requests on http://localhost:8080
DockerCGroupV1Detector found resource. Resource {
  attributes: {
    'container.id': 'fffbeaf682f32ef86916f306ff9a7f88cc58048ab78f7de464da3c3201db5c54'
  }
}
```

検出器が`container.id`を抽出しました。
ただし、この例ではプロセス属性と環境変数で設定された属性が不足していることに気づくでしょう。
これを解決するには、`resourceDetectors`リストを設定する際に`envDetector`と`processDetector`検出器も指定する必要があります。

```javascript
const opentelemetry = require('@opentelemetry/sdk-node');
const {
  getNodeAutoInstrumentations,
} = require('@opentelemetry/auto-instrumentations-node');
const { diag, DiagConsoleLogger, DiagLogLevel } = require('@opentelemetry/api');
const {
  containerDetector,
} = require('@opentelemetry/resource-detector-container');
const { envDetector, processDetector } = require('@opentelemetry/resources');

// トラブルシューティングのため、ログレベルをDiagLogLevel.DEBUGに設定
diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.DEBUG);

const sdk = new opentelemetry.NodeSDK({
  traceExporter: new opentelemetry.tracing.ConsoleSpanExporter(),
  instrumentations: [getNodeAutoInstrumentations()],
  // 必要なすべての検出器をここに追加してください！
  resourceDetectors: [envDetector, processDetector, containerDetector],
});

sdk.start();
```

イメージを再ビルドして、コンテナを再度実行します。

```shell
docker run --rm -p 8080:8080 nodejs-otel-getting-started
@opentelemetry/api: Registered a global for diag v1.2.0.
...
Listening for requests on http://localhost:8080
EnvDetector found resource. Resource { attributes: {} }
ProcessDetector found resource. Resource {
  attributes: {
    'process.pid': 1,
    'process.executable.name': 'node',
    'process.command': '/usr/src/app/app.js',
    'process.command_line': '/usr/local/bin/node /usr/src/app/app.js',
    'process.runtime.version': '18.9.0',
    'process.runtime.name': 'nodejs',
    'process.runtime.description': 'Node.js'
  }
}
DockerCGroupV1Detector found resource. Resource {
  attributes: {
    'container.id': '654d0670317b9a2d3fc70cbe021c80ea15339c4711fb8e8b3aa674143148d84e'
  }
}
...
```

## 次のステップ {#next-steps}

設定に追加できるリソース検出器は他にもあります。
たとえば、[Cloud]環境や[Deployment]の詳細を取得するものがあります。
詳細については、[opentelemetry-js-contribリポジトリの`resource-detector-*`という名前のパッケージ](https://github.com/open-telemetry/opentelemetry-js-contrib/tree/main/packages)を参照してください。

[getting started - node.js]: /docs/languages/js/getting-started/nodejs/
[process and process runtime resources]: /docs/specs/semconv/resource/process/
[host]: /docs/specs/semconv/resource/host/
[cloud]: /docs/specs/semconv/resource/cloud/
[deployment]: /docs/specs/semconv/resource/deployment-environment/
[service]: /docs/specs/semconv/resource/#service
[os]: /docs/specs/semconv/resource/os/
