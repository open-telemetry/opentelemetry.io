---
title: 見積もりサービス
linkTitle: 見積もり
aliases: [quoteservice]
default_lang_commit: c8967d335d0f4cef827a920bcd229ad797c65a35
cSpell:ignore: getquote
---

このサービスは、発送される商品の点数に基づいて送料を計算する役割を担います。
見積もりサービスは、配送サービスから HTTP 経由で呼び出されます。

見積もりサービスは、Slim フレームワークと依存性注入を管理するための php-di を使用して実装されています。

PHP の計装は、使用するフレームワークによって異なる場合があります。

[見積もりサービスのソースコード](https://github.com/open-telemetry/opentelemetry-demo/blob/main/src/quote/)

## トレース {#traces}

### トレーシングの初期化 {#initializing-tracing}

このデモでは、OpenTelemetry SDK は SDK の自動読み込みの一部として自動的に作成されます。
これは Composer の自動読み込みの一環として行われます。

これは、環境変数 `OTEL_PHP_AUTOLOAD_ENABLED=true` を設定することで有効になります。

```php
require __DIR__ . '/../vendor/autoload.php';
```

`Tracer` を作成または取得する方法は複数あります。
この例では、上記の SDK の自動読み込みの一部として初期化されたグローバルトレーサープロバイダーから取得しています。

```php
$tracer = Globals::tracerProvider()->getTracer('manual-instrumentation');
```

### スパンの手動作成 {#manually-creating-spans}

スパンは `Tracer` を使用して手動で作成できます。
スパンは、デフォルトで現在の実行コンテキストにおけるアクティブなスパンの子になります。

```php
$span = Globals::tracerProvider()
    ->getTracer('manual-instrumentation')
    ->spanBuilder('calculate-quote')
    ->setSpanKind(SpanKind::KIND_INTERNAL)
    ->startSpan();
/* 見積もりを計算 */
$span->end();
```

### スパン属性の追加 {#add-span-attributes}

`OpenTelemetry\API\Trace\Span` を使用して現在のスパンを取得できます。

```php
$span = Span::getCurrent();
```

スパンへの属性の追加は、スパンオブジェクトの `setAttribute` を使用して行います。
`calculateQuote` 関数では、`childSpan` に2つの属性が追加されます。

```php
$childSpan->setAttribute('app.quote.items.count', $numberOfItems);
$childSpan->setAttribute('app.quote.cost.total', $quote);
```

### スパンイベントの追加 {#add-span-events}

スパンイベントの追加は、スパンオブジェクトの `addEvent` を使用して行います。
`getquote` ルートではスパンイベントが追加されます。
一部のイベントには追加の属性があり、その他にはありません。

属性なしのスパンイベントの追加:

```php
$span->addEvent('Received get quote request, processing it');
```

追加の属性を持つスパンイベントの追加:

```php
$span->addEvent('Quote processed, response sent back', [
    'app.quote.cost.total' => $payload
]);
```

## メトリクス {#metrics}

このデモでは、メトリクスはバッチトレースプロセッサーとバッチログプロセッサーによって出力されます。
メトリクスは、エクスポートされたスパンやログの数、キューの制限、キューの使用状況など、プロセッサーの内部状態を表します。

メトリクスは、環境変数 `OTEL_PHP_INTERNAL_METRICS_ENABLED` を `true` に設定することで有効にできます。

手動メトリクスも出力されます。
これは生成された見積もりの数をカウントし、商品数の属性を含みます。

カウンターはグローバルに設定されたメータープロバイダーから作成され、見積もりが生成されるたびにインクリメントされます。

```php
static $counter;
$counter ??= Globals::meterProvider()
    ->getMeter('quotes')
    ->createCounter('quotes', 'quotes', 'number of quotes calculated');
$counter->add(1, ['number_of_items' => $numberOfItems]);
```

メトリクスは蓄積され、`OTEL_METRIC_EXPORT_INTERVAL` に設定された値に基づいて定期的にエクスポートされます。

## ログ {#logs}

見積もりサービスは、見積もりが計算された後にログメッセージを出力します。
Monolog ログパッケージは、Monolog のログを OpenTelemetry 形式に変換する[ログブリッジ](/docs/concepts/signals/logs/#log-appender--bridge)で設定されています。
このロガーに送信されたログは、グローバルに設定された OpenTelemetry ロガーを介してエクスポートされます。
