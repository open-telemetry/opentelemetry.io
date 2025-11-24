---
title: エクスポーター
weight: 50
description: テレメトリデータの処理とエクスポート
default_lang_commit: 68e94a4555606e74c27182b79789d46faf84ec25
---

{{% docs/languages/exporters/intro %}}

## 依存関係 {#otlp-dependencies}

テレメトリーデータをOTLPエンドポイント（[OpenTelemetry Collector](#collector-setup)、[Jaeger](#jaeger)、[Prometheus](#prometheus)など）に送信したい場合、データを転送するために3つの異なるプロトコルから選択できます。

- [HTTP/protobuf](https://www.npmjs.com/package/@opentelemetry/exporter-trace-otlp-proto)
- [HTTP/JSON](https://www.npmjs.com/package/@opentelemetry/exporter-trace-otlp-http)
- [gRPC](https://www.npmjs.com/package/@opentelemetry/exporter-trace-otlp-grpc)

まず、プロジェクトの依存関係として対応するエクスポーターパッケージをインストールします。

{{< tabpane text=true >}} {{% tab "HTTP/Proto" %}}

```shell
npm install --save @opentelemetry/exporter-trace-otlp-proto \
  @opentelemetry/exporter-metrics-otlp-proto
```

{{% /tab %}} {{% tab "HTTP/JSON" %}}

```shell
npm install --save @opentelemetry/exporter-trace-otlp-http \
  @opentelemetry/exporter-metrics-otlp-http
```

{{% /tab %}} {{% tab gRPC %}}

```shell
npm install --save @opentelemetry/exporter-trace-otlp-grpc \
  @opentelemetry/exporter-metrics-otlp-grpc
```

{{% /tab %}} {{< /tabpane >}}

## Node.jsでの使用法 {#usage-with-nodejs}

次に、OTLPエンドポイントを指すようにエクスポーターを設定します。
たとえば、[Getting Started](/docs/languages/js/getting-started/nodejs/)の`instrumentation.ts`（またはJavaScriptを使用する場合は`instrumentation.js`）ファイルを以下のように更新して、OTLP（`http/protobuf`）経由でトレースとメトリクスをエクスポートできます。

{{< tabpane text=true >}} {{% tab TypeScript %}}

```ts
/*instrumentation.ts*/
import * as opentelemetry from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-proto';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-proto';
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';

const sdk = new opentelemetry.NodeSDK({
  traceExporter: new OTLPTraceExporter({
    // オプション - デフォルトのURLはhttp://localhost:4318/v1/traces
    url: '<your-otlp-endpoint>/v1/traces',
    // オプション - 各リクエストで送信されるカスタムヘッダーのコレクション、デフォルトは空
    headers: {},
  }),
  metricReader: new PeriodicExportingMetricReader({
    exporter: new OTLPMetricExporter({
      url: '<your-otlp-endpoint>/v1/metrics', // urlはオプションで省略可能 - デフォルトはhttp://localhost:4318/v1/metrics
      headers: {}, // 各リクエストで送信されるカスタムヘッダーを含むオプションのオブジェクト
    }),
  }),
  instrumentations: [getNodeAutoInstrumentations()],
});
sdk.start();
```

{{% /tab %}} {{% tab JavaScript %}}

```js
/*instrumentation.js*/
const opentelemetry = require('@opentelemetry/sdk-node');
const {
  getNodeAutoInstrumentations,
} = require('@opentelemetry/auto-instrumentations-node');
const {
  OTLPTraceExporter,
} = require('@opentelemetry/exporter-trace-otlp-proto');
const {
  OTLPMetricExporter,
} = require('@opentelemetry/exporter-metrics-otlp-proto');
const { PeriodicExportingMetricReader } = require('@opentelemetry/sdk-metrics');

const sdk = new opentelemetry.NodeSDK({
  traceExporter: new OTLPTraceExporter({
    // オプション - デフォルトのURLはhttp://localhost:4318/v1/traces
    url: '<your-otlp-endpoint>/v1/traces',
    // オプション - 各リクエストで送信されるカスタムヘッダーのコレクション、デフォルトは空
    headers: {},
  }),
  metricReader: new PeriodicExportingMetricReader({
    exporter: new OTLPMetricExporter({
      url: '<your-otlp-endpoint>/v1/metrics', // urlはオプションで省略可能 - デフォルトはhttp://localhost:4318/v1/metrics
      headers: {}, // 各リクエストで送信されるカスタムヘッダーを含むオプションのオブジェクト
      concurrencyLimit: 1, // 保留中のリクエストのオプション制限
    }),
  }),
  instrumentations: [getNodeAutoInstrumentations()],
});
sdk.start();
```

{{% /tab %}} {{< /tabpane >}}

## ブラウザでの使用法 {#usage-in-the-browser}

ブラウザベースのアプリケーションでOTLPエクスポーターを使用する場合、以下の点に注意する必要があります。

1. エクスポートにgRPCを使用することはサポートされていません
2. Webサイトの[Content Security Policies][]（CSP）がエクスポートをブロックする可能性があります
3. [Cross-Origin Resource Sharing][]（CORS）ヘッダーがエクスポートの送信を許可しない可能性があります
4. コレクターをパブリックインターネットに公開する必要がある場合があります

以下では、適切なエクスポーターの使用、CSPとCORSヘッダーの設定、およびコレクターを公開する際に取るべき予防措置について説明します。

### HTTP/JSONまたはHTTP/protobufでOTLPエクスポーターを使用 {#use-otlp-exporter-with-httpjson-or-httpprotobuf}

[OpenTelemetry Collector Exporter with gRPC][]はNode.jsでのみ動作するため、[OpenTelemetry Collector Exporter with HTTP/JSON][]または[OpenTelemetry Collector Exporter with HTTP/protobuf][]の使用に制限されます。

[OpenTelemetry Collector Exporter with HTTP/JSON][]を使用している場合は、エクスポーターの受信側（コレクターまたはオブザーバビリティバックエンド）が`http/json`を受け入れることを確認し、ポートを4318に設定して適切なエンドポイントにデータをエクスポートしていることを確認してください。

### CSPの設定 {#configure-csps}

WebサイトでContent Security Policies（CSP）を使用している場合は、OTLPエンドポイントのドメインが含まれていることを確認してください。
コレクターエンドポイントが`https://collector.example.com:4318/v1/traces`の場合、以下のディレクティブを追加します。

```text
connect-src collector.example.com:4318/v1/traces
```

CSPがOTLPエンドポイントを含んでいない場合、エンドポイントへのリクエストがCSPディレクティブに違反していることを示すエラーメッセージが表示されます。

### CORSヘッダーの設定 {#configure-cors-headers}

Webサイトとコレクターが異なるオリジンでホストされている場合、ブラウザがコレクターへのリクエストをブロックする可能性があります。
Cross-Origin Resource Sharing（CORS）のための特別なヘッダーを設定する必要があります。

OpenTelemetry Collectorは、httpベースのレシーバーがWebブラウザからのトレースを受け入れるために必要なヘッダーを追加する[機能][a feature]を提供しています。

```yaml
receivers:
  otlp:
    protocols:
      http:
        include_metadata: true
        cors:
          allowed_origins:
            - https://foo.bar.com
            - https://*.test.com
          allowed_headers:
            - Example-Header
          max_age: 7200
```

### コレクターの安全な公開 {#securely-expose-your-collector}

Webアプリケーションからテレメトリーを受信するには、エンドユーザーのブラウザがコレクターにデータを送信できるようにする必要があります。
Webアプリケーションがパブリックインターネットからアクセス可能な場合、コレクターもすべての人がアクセス可能にする必要があります。

コレクターを直接公開するのではなく、その前にリバースプロキシ（NGINX、Apache HTTP Server、...）を配置することをお勧めします。
リバースプロキシは、SSL オフロード、適切なCORSヘッダーの設定、およびWebアプリケーション固有の多くの機能を処理できます。

以下では、人気のあるNGINX Webサーバーの設定例を示します。

```nginx
server {
    listen 80 default_server;
    server_name _;
    location / {
        # プリフライトリクエストの処理
        if ($request_method = 'OPTIONS') {
             add_header 'Access-Control-Max-Age' 1728000;
             add_header 'Access-Control-Allow-Origin' 'name.of.your.website.example.com' always;
             add_header 'Access-Control-Allow-Headers' 'Accept,Accept-Language,Content-Language,Content-Type' always;
             add_header 'Access-Control-Allow-Credentials' 'true' always;
             add_header 'Content-Type' 'text/plain charset=UTF-8';
             add_header 'Content-Length' 0;
             return 204;
        }

        add_header 'Access-Control-Allow-Origin' 'name.of.your.website.example.com' always;
        add_header 'Access-Control-Allow-Credentials' 'true' always;
        add_header 'Access-Control-Allow-Headers' 'Accept,Accept-Language,Content-Language,Content-Type' always;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_pass http://collector:4318;
    }
}
```

## コンソール {#console}

計装をデバッグしたり、開発環境でローカルに値を確認したりするために、テレメトリーデータをコンソール（標準出力）に書き込むエクスポーターを使用できます。

[Getting Started の Node.js](/docs/languages/js/getting-started/nodejs/)または[手動計装](/docs/languages/js/instrumentation)ガイドに従った場合、コンソールエクスポーターはすでにインストールされています。

`ConsoleSpanExporter`は[`@opentelemetry/sdk-trace-node`](https://www.npmjs.com/package/@opentelemetry/sdk-trace-node)パッケージに含まれており、`ConsoleMetricExporter`は[`@opentelemetry/sdk-metrics`](https://www.npmjs.com/package/@opentelemetry/sdk-metrics)パッケージに含まれています。

{{% include "exporters/jaeger.md" %}}

{{% include "exporters/prometheus-setup.md" %}}

## 依存関係 {#prometheus-dependencies}

アプリケーションの依存関係として[エクスポーターパッケージ](https://www.npmjs.com/package/@opentelemetry/exporter-prometheus)をインストールします。

```shell
npm install --save @opentelemetry/exporter-prometheus
```

エクスポーターを使用し、Prometheusバックエンドにデータを送信するようにOpenTelemetry設定を更新します。

{{< tabpane text=true >}} {{% tab TypeScript %}}

```ts
import * as opentelemetry from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { PrometheusExporter } from '@opentelemetry/exporter-prometheus';

const sdk = new opentelemetry.NodeSDK({
  metricReader: new PrometheusExporter({
    port: 9464, // オプション - デフォルトは9464
  }),
  instrumentations: [getNodeAutoInstrumentations()],
});
sdk.start();
```

{{% /tab %}} {{% tab JavaScript %}}

```js
const opentelemetry = require('@opentelemetry/sdk-node');
const {
  getNodeAutoInstrumentations,
} = require('@opentelemetry/auto-instrumentations-node');
const { PrometheusExporter } = require('@opentelemetry/exporter-prometheus');
const { PeriodicExportingMetricReader } = require('@opentelemetry/sdk-metrics');
const sdk = new opentelemetry.NodeSDK({
  metricReader: new PrometheusExporter({
    port: 9464, // オプション - デフォルトは9464
  }),
  instrumentations: [getNodeAutoInstrumentations()],
});
sdk.start();
```

{{% /tab %}} {{< /tabpane >}}

上記の設定により、<http://localhost:9464/metrics>でメトリクスにアクセスできます。
PrometheusまたはPrometheusレシーバーを持つOpenTelemetry Collectorが、このエンドポイントからメトリクスをスクレイプできます。

{{% include "exporters/zipkin-setup.md" %}}

## 依存関係 {#zipkin-dependencies}

トレースデータを[Zipkin](https://zipkin.io/)に送信するには、`ZipkinExporter`を使用できます。

アプリケーションの依存関係として[エクスポーターパッケージ](https://www.npmjs.com/package/@opentelemetry/exporter-zipkin)をインストールします。

```shell
npm install --save @opentelemetry/exporter-zipkin
```

エクスポーターを使用し、Zipkinバックエンドにデータを送信するようにOpenTelemetry設定を更新します。

{{< tabpane text=true >}} {{% tab TypeScript %}}

```ts
import * as opentelemetry from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { ZipkinExporter } from '@opentelemetry/exporter-zipkin';

const sdk = new opentelemetry.NodeSDK({
  traceExporter: new ZipkinExporter({}),
  instrumentations: [getNodeAutoInstrumentations()],
});
sdk.start();
```

{{% /tab %}} {{% tab JavaScript %}}

```js
const opentelemetry = require('@opentelemetry/sdk-node');
const {
  getNodeAutoInstrumentations,
} = require('@opentelemetry/auto-instrumentations-node');
const { ZipkinExporter } = require('@opentelemetry/exporter-zipkin');

const sdk = new opentelemetry.NodeSDK({
  traceExporter: new ZipkinExporter({}),
  instrumentations: [getNodeAutoInstrumentations()],
});
```

{{% /tab %}} {{< /tabpane >}}

{{% include "exporters/outro.md" `https://open-telemetry.github.io/opentelemetry-js/interfaces/_opentelemetry_sdk-trace-base.SpanExporter.html` %}}

{{< tabpane text=true >}} {{% tab TypeScript %}}

```ts
/*instrumentation.ts*/
import * as opentelemetry from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';

const sdk = new NodeSDK({
  spanProcessors: [new SimpleSpanProcessor(exporter)],
  instrumentations: [getNodeAutoInstrumentations()],
});
sdk.start();
```

{{% /tab %}} {{% tab JavaScript %}}

```js
/*instrumentation.js*/
const opentelemetry = require('@opentelemetry/sdk-node');
const {
  getNodeAutoInstrumentations,
} = require('@opentelemetry/auto-instrumentations-node');

const sdk = new opentelemetry.NodeSDK({
  spanProcessors: [new SimpleSpanProcessor(exporter)],
  instrumentations: [getNodeAutoInstrumentations()],
});
sdk.start();
```

{{% /tab %}} {{< /tabpane >}}

[content security policies]: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/
[cross-origin resource sharing]: https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
[opentelemetry collector exporter with grpc]: https://www.npmjs.com/package/@opentelemetry/exporter-trace-otlp-grpc
[opentelemetry collector exporter with http/protobuf]: https://www.npmjs.com/package/@opentelemetry/exporter-trace-otlp-proto
[opentelemetry collector exporter with http/json]: https://www.npmjs.com/package/@opentelemetry/exporter-trace-otlp-http
[a feature]: https://github.com/open-telemetry/opentelemetry-collector/blob/main/config/confighttp/README.md
