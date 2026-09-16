---
title: フロントエンド
default_lang_commit: f60f406894f94169947ecbd236b933ee4008354c
cSpell:ignore: typeof
---

フロントエンドは、ユーザーに UI を提供するとともに、UI やその他のクライアントが利用する API を提供する役割を担います。
このアプリケーションは [Next.JS](https://nextjs.org/) をベースにしており、React ベースのウェブ UI と API ルートを提供します。

[フロントエンドのソースコード](https://github.com/open-telemetry/opentelemetry-demo/blob/main/src/frontend/)

## サーバー計装 {#server-instrumentation}

Node.js アプリケーションの起動時に Node の required モジュールを使って SDK と自動計装を初期化することが推奨されます。
OpenTelemetry Node.js SDK を初期化する際に、利用する自動計装ライブラリをオプションで指定するか、主要なフレームワークを網羅する `getNodeAutoInstrumentations()` 関数を使用できます。
`utils/telemetry/Instrumentation.js` ファイルには、OTLP エクスポート、リソース属性、サービス名に関する標準の [OpenTelemetry 環境変数](/docs/specs/otel/configuration/sdk-environment-variables/)に基づいて SDK と自動計装を初期化するために必要なすべてのコードが含まれています。

```javascript
const FrontendTracer = async () => {
  const { ZoneContextManager } = await import('@opentelemetry/context-zone');

  let resource = resourceFromAttributes({
    [ATTR_SERVICE_NAME]: NEXT_PUBLIC_OTEL_SERVICE_NAME,
  });
  const detectedResources = detectResources({ detectors: [browserDetector] });
  resource = resource.merge(detectedResources);

  const provider = new WebTracerProvider({
    resource,
    spanProcessors: [
      new SessionIdProcessor(),
      new BatchSpanProcessor(
        new OTLPTraceExporter({
          url:
            NEXT_PUBLIC_OTEL_EXPORTER_OTLP_TRACES_ENDPOINT ||
            'http://localhost:4318/v1/traces',
        }),
        {
          scheduledDelayMillis: 500,
        },
      ),
    ],
  });

  const contextManager = new ZoneContextManager();

  provider.register({
    contextManager,
    propagator: new CompositePropagator({
      propagators: [
        new W3CBaggagePropagator(),
        new W3CTraceContextPropagator(),
      ],
    }),
  });

  registerInstrumentations({
    tracerProvider: provider,
    instrumentations: [
      getWebAutoInstrumentations({
        '@opentelemetry/instrumentation-fetch': {
          propagateTraceHeaderCorsUrls: /.*/,
          clearTimingResources: true,
          applyCustomAttributesOnSpan(span) {
            span.setAttribute('app.synthetic_request', IS_SYNTHETIC_REQUEST);
          },
        },
      }),
    ],
  });
};
```

Node の required モジュールは `--require` コマンドライン引数を使って読み込まれます。
これは `package.json` の `scripts.start` セクションで設定し、`npm start` でアプリケーションを起動することで実現できます。

```json
"scripts": {
  "start": "node --require ./Instrumentation.js server.js",
},
```

## トレース {#traces}

### スパンの例外とステータス {#span-exceptions-and-status}

スパンオブジェクトの `recordException` 関数を使用して、処理済みのエラーの完全なスタックトレースを含むスパンイベントを作成できます。
例外を記録する際は、スパンのステータスも適切に設定するようにしてください。
これは `utils/telemetry/InstrumentationMiddleware.ts` ファイルの `NextApiHandler` 関数の catch ブロックで確認できます。

```typescript
span.recordException(error as Exception);
span.setStatus({ code: SpanStatusCode.ERROR });
```

### 新しいスパンの作成 {#create-new-spans}

新しいスパンは `Tracer.startSpan("spanName", options)` を使って作成・開始できます。
スパンの作成方法を指定するために、いくつかのオプションが使用できます。

- `root: true` は新しいトレースを作成し、このスパンをルートとして設定します。
- `links` は参照すべき他のスパン（別のトレース内のものも含む）へのリンクを指定するために使用します。
- `attributes` はスパンに追加されるキー/バリューのペアで、通常はアプリケーションのコンテキストに使用します。

```typescript
span = tracer.startSpan(`${method}`, {
  root: true,
  kind: SpanKind.SERVER,
  links: [{ context: syntheticSpan.spanContext() }],
  attributes: {
    'app.synthetic_request': true,
    [ATTR_HTTP_RESPONSE_STATUS_CODE]: response.statusCode,
    [ATTR_HTTP_REQUEST_METHOD]: method,
    [ATTR_USER_AGENT_ORIGINAL]: headers['user-agent'] || '',
    [ATTR_URL_PATH]: target,
    [ATTR_URL_FULL]: `${headers.host}${url}`,
    [ATTR_NETWORK_PROTOCOL_VERSION]: httpVersion,
  },
});
```

## ブラウザー計装 {#browser-instrumentation}

フロントエンドが提供するウェブベースの UI も、ウェブブラウザー向けに計装されています。
OpenTelemetry の計装は `pages/_app.tsx` の Next.js App コンポーネントの一部として含まれています。
ここで計装がインポートされ、初期化されます。

```typescript
import FrontendTracer from '../utils/telemetry/FrontendTracer';

if (typeof window !== 'undefined') FrontendTracer();
```

`utils/telemetry/FrontendTracer.ts` ファイルには、TracerProvider の初期化、OTLP エクスポートの確立、トレースコンテキストプロパゲーターの登録、ウェブ固有の自動計装ライブラリの登録を行うコードが含まれています。
ブラウザーは別のドメインにある可能性が高い OpenTelemetry Collector にデータを送信するため、CORS ヘッダーも適切に設定されています。

バックエンドサービスに `synthetic_request` 属性フラグを引き継ぐための変更の一環として、`applyCustomAttributesOnSpan` 設定関数が `instrumentation-fetch` ライブラリのカスタムスパン属性ロジックに追加されており、これによりすべてのブラウザー側のスパンにこの属性が含まれます。

```typescript
import {
  CompositePropagator,
  W3CBaggagePropagator,
  W3CTraceContextPropagator,
} from '@opentelemetry/core';
import { WebTracerProvider } from '@opentelemetry/sdk-trace-web';
import { SimpleSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { getWebAutoInstrumentations } from '@opentelemetry/auto-instrumentations-web';
import { resourceFromAttributes } from '@opentelemetry/resources';
import { ATTR_SERVICE_NAME } from '@opentelemetry/semantic-conventions';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';

const FrontendTracer = async () => {
  const { ZoneContextManager } = await import('@opentelemetry/context-zone');

  const provider = new WebTracerProvider({
    resource: resourceFromAttributes({
      [ATTR_SERVICE_NAME]: process.env.NEXT_PUBLIC_OTEL_SERVICE_NAME,
    }),
    spanProcessors: [new SimpleSpanProcessor(new OTLPTraceExporter())],
  });

  const contextManager = new ZoneContextManager();

  provider.register({
    contextManager,
    propagator: new CompositePropagator({
      propagators: [
        new W3CBaggagePropagator(),
        new W3CTraceContextPropagator(),
      ],
    }),
  });

  registerInstrumentations({
    tracerProvider: provider,
    instrumentations: [
      getWebAutoInstrumentations({
        '@opentelemetry/instrumentation-fetch': {
          propagateTraceHeaderCorsUrls: /.*/,
          clearTimingResources: true,
          applyCustomAttributesOnSpan(span) {
            span.setAttribute('app.synthetic_request', 'false');
          },
        },
      }),
    ],
  });
};

export default FrontendTracer;
```

## メトリクス {#metrics}

TBD

## ログ {#logs}

TBD

## バゲージ {#baggage}

OpenTelemetry のバゲージは、リクエストがシンセティック（負荷生成ツールからのもの）かどうかを確認するためにフロントエンドで活用されています。
シンセティックリクエストは新しいトレースの作成を強制します。
新しいトレースのルートスパンには、HTTP リクエストの計装スパンと同じ属性の多くが含まれます。

バゲージアイテムが設定されているかどうかを判定するには、`propagation` API を使ってバゲージヘッダーを解析し、`baggage` API を使ってエントリーを取得または設定します。

```typescript
const baggage = propagation.getBaggage(context.active());
if (baggage?.getEntry("synthetic_request")?.value == "true") {...}
```
