---
title: 支払いサービス
linkTitle: 支払い
aliases: [paymentservice]
default_lang_commit: 6dae53b63ae3197dcc140fddcc867ac635541799
---

このサービスは、注文に対するクレジットカード決済を処理する役割を担います。
クレジットカードが無効であるか、決済を処理できない場合はエラーを返します。

[支払いサービスのソースコード](https://github.com/open-telemetry/opentelemetry-demo/blob/main/src/payment/)

## ゼロコード計装 {#zero-code-instrumentation}

この Node.js ベースのサービスは、OpenTelemetry Node.js ゼロコード計装を利用しており、起動時に `@opentelemetry/auto-instrumentations-node/register` モジュールを require することでセットアップされます。
エクスポートのエンドポイント、リソース属性、サービス名は環境変数に基づいて自動的に設定されます。
これはサービスの `package.json` のスタートスクリプトまたは `NODE_OPTIONS` を通じて行うことができます。

```json
"scripts": {
  "start": "node --require @opentelemetry/auto-instrumentations-node/register index.js"
}
```

## トレース {#traces}

### 自動計装されたスパンへの属性の追加 {#add-attributes-to-auto-instrumented-spans}

自動計装されたコードの実行中に、コンテキストから現在のスパンを取得できます。

```javascript
const span = opentelemetry.trace.getActiveSpan();
```

スパンへの属性の追加は、スパンオブジェクトの `setAttributes` を使用して行います。
`chargeServiceHandler` 関数では、属性キーと値のペアとして無名オブジェクト（マップ）でスパンに属性が追加されます。

```javascript
span?.setAttributes({
  'demo.payment.amount': parseFloat(`${amount.units}.${amount.nanos}`).toFixed(
    2,
  ),
});
```

### スパンの例外とステータス {#span-exceptions-and-status}

スパンオブジェクトの `recordException` 関数を使用して、処理済みエラーの完全なスタックトレースを含むスパンイベントを作成できます。
例外を記録する際は、スパンのステータスも適切に設定してください。
これは `charge.js` の `charge` 関数で確認できます。

```javascript
span.recordException(err);
span.setStatus({ code: SpanStatusCode.ERROR, message: err.message });
```

## メトリクス {#metrics}

### メーターと計装の作成 {#creating-meters-and-instruments}

メーターは `@opentelemetry/api` パッケージを使用して作成できます。
以下のようにメーターを作成し、作成したメーターを使用して計装を作成できます。

```javascript
const { metrics } = require('@opentelemetry/api');

const meter = metrics.getMeter('payment');
const transactionsCounter = meter.createCounter('demo.payment.transactions');
```

メーターと計装は永続的に保持されるべきものです。
つまり、メーターや計装は一度取得したら、可能であれば必要に応じて再利用してください。

## ログ {#logs}

TBD

## バゲージ {#baggage}

OpenTelemetry バゲージは、このサービスでリクエストが合成的なもの（負荷生成ツールからのもの）かどうかを確認するために利用されます。
合成リクエストには課金されず、そのことがスパン属性で示されます。
実際の支払い処理を行う `charge.js` ファイルには、バゲージを確認するロジックがあります。

```javascript
// バゲージの synthetic_request=true を確認し、それに応じて charged 属性を追加する
const baggage = propagation.getBaggage(context.active());
if (
  baggage &&
  baggage.getEntry('synthetic_request') &&
  baggage.getEntry('synthetic_request').value === 'true'
) {
  span.setAttribute('demo.payment.charged', false);
} else {
  span.setAttribute('demo.payment.charged', true);
}
```
