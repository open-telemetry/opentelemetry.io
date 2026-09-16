---
title: エクスポーター
weight: 50
default_lang_commit: ca42643453f70a901336aa8f1582d298cc15f289
cSpell:ignore: fastcgi pecl
---

{{% docs/languages/exporters/intro %}}

> [!NOTE]
>
> [ゼロコード計装](/docs/zero-code/php/)を使用している場合は、
> [ゼロコード設定でエクスポーターをセットアップ](/docs/zero-code/php/auto/#configuration)できます。

## OTLP {#otlp}

トレースデータを OTLP エンドポイント（[Collector](/docs/collector) や Jaeger など）に送信するには、`open-telemetry/exporter-otlp` パッケージと `psr/http-client-implementation` を満たす HTTP クライアントが必要です。

```shell
composer require \
  open-telemetry/exporter-otlp \
  php-http/guzzle7-adapter
```

[gRPC](https://grpc.io/) エクスポーターを使用するには、`open-telemetry/transport-grpc` パッケージと `grpc` エクステンションもインストールする必要があります。

```shell
pecl install grpc
composer require open-telemetry/transport-grpc
```

次に、OTLP エンドポイントを指定してエクスポーターを設定します。
例:

{{< tabpane text=true >}} {{% tab gRPC %}}

```php
<?php

require __DIR__ . '/vendor/autoload.php';

use OpenTelemetry\API\Signals;
use OpenTelemetry\Contrib\Grpc\GrpcTransportFactory;
use OpenTelemetry\Contrib\Otlp\OtlpUtil;
use OpenTelemetry\Contrib\Otlp\SpanExporter;
use OpenTelemetry\SDK\Trace\SpanProcessor\SimpleSpanProcessor;
use OpenTelemetry\SDK\Trace\TracerProvider;

$transport = (new GrpcTransportFactory())->create('http://jaeger:4317' . OtlpUtil::method(Signals::TRACE));
$exporter = new SpanExporter($transport);

$tracerProvider =  new TracerProvider(
    new SimpleSpanProcessor($exporter)
);
```

{{% /tab %}} {{% tab protobuf %}}

```php
<?php

require __DIR__ . '/vendor/autoload.php';

use OpenTelemetry\Contrib\Otlp\OtlpHttpTransportFactory;
use OpenTelemetry\Contrib\Otlp\SpanExporter;
use OpenTelemetry\SDK\Trace\SpanProcessor\SimpleSpanProcessor;
use OpenTelemetry\SDK\Trace\TracerProvider;

$transport = (new OtlpHttpTransportFactory())->create('http://jaeger:4318/v1/traces', 'application/x-protobuf');
$exporter = new SpanExporter($transport);

$tracerProvider =  new TracerProvider(
    new SimpleSpanProcessor($exporter)
);
```

{{% /tab %}} {{% tab JSON %}}

```php
<?php

require __DIR__ . '/vendor/autoload.php';

use OpenTelemetry\Contrib\Otlp\OtlpHttpTransportFactory;
use OpenTelemetry\Contrib\Otlp\SpanExporter;
use OpenTelemetry\SDK\Trace\SpanProcessor\SimpleSpanProcessor;
use OpenTelemetry\SDK\Trace\TracerProvider;

$transport = (new OtlpHttpTransportFactory())->create('http://jaeger:4318/v1/traces', 'application/json');
$exporter = new SpanExporter($transport);

$tracerProvider =  new TracerProvider(
    new SimpleSpanProcessor($exporter)
);
$tracer = $tracerProvider->getTracer('io.opentelemetry.contrib.php');
$tracer->spanBuilder('example')->startSpan()->end();
```

{{% /tab %}} {{% tab NDJSON %}}

```php
<?php

require __DIR__ . '/vendor/autoload.php';

use OpenTelemetry\Contrib\Otlp\OtlpHttpTransportFactory;
use OpenTelemetry\Contrib\Otlp\SpanExporter;
use OpenTelemetry\SDK\Trace\SpanProcessor\SimpleSpanProcessor;
use OpenTelemetry\SDK\Trace\TracerProvider;

$transport = (new OtlpHttpTransportFactory())->create('http://jaeger:4318/v1/traces', 'application/x-ndjson');
$exporter = new SpanExporter($transport);

$tracerProvider =  new TracerProvider(
    new SimpleSpanProcessor($exporter)
);
$tracer = $tracerProvider->getTracer('io.opentelemetry.contrib.php');
$tracer->spanBuilder('example')->startSpan()->end();
```

{{% /tab %}} {{< /tabpane >}}

次に、スパンを生成するために以下のコードを追加します。

```php
$tracer = $tracerProvider->getTracer('io.opentelemetry.contrib.php');
$tracer
  ->spanBuilder('example')
  ->startSpan()
  ->end();
```

上記の例を試すには、Docker コンテナで [Jaeger](https://www.jaegertracing.io/) を実行します。

```shell
docker run -d --name jaeger \
  -p 5778:5778 \
  -p 16686:16686 \
  -p 4317:4317 \
  -p 4318:4318 \
  -p 9411:9411 \
  jaegertracing/jaeger:latest
```

## Zipkin {#zipkin}

トレースの可視化に [Zipkin](https://zipkin.io/) を使用する場合は、まず Zipkin をセットアップする必要があります。
以下は、ローカルで Docker コンテナとして実行する方法です。

```shell
docker run --rm -d -p 9411:9411 --name zipkin openzipkin/zipkin
```

エクスポーターパッケージをアプリケーションの依存関係としてインストールします。

```shell
composer require open-telemetry/exporter-zipkin
```

Zipkin エクスポーターを使用し、Zipkin バックエンドにデータを送信するように例を更新します。

```php
$transport = \OpenTelemetry\SDK\Common\Export\Http\PsrTransportFactory::discover()
    ->create('http://zipkin:9411/api/v2/spans', 'application/json');
$zipkinExporter = new ZipkinExporter($transport);
$tracerProvider =  new TracerProvider(
    new SimpleSpanProcessor($zipkinExporter)
);
$tracer = $tracerProvider->getTracer('io.opentelemetry.contrib.php');
```

## エクスポートの遅延を最小限にする {#minimizing-export-delays}

ほとんどの PHP ランタイムは同期実行であり、処理をブロックします。
テレメトリーデータの送信は HTTP レスポンスがユーザーに届くまでの時間を[遅延させる可能性があります](/docs/specs/otel/performance/#shutdown-and-explicit-flushing-could-block)。

`fastcgi` を使用している場合は、ユーザーへのレスポンス送信後に `fastcgi_finish_request()` を呼び出すことで、テレメトリーデータの送信による遅延がリクエスト処理を妨げないようにできます。

テレメトリーデータの転送が遅い場合（特に外部やクラウドベースのバックエンド向け）の影響を最小限に抑えるには、[OpenTelemetry Collector](/docs/collector/) を[エージェント](/docs/collector/deploy/agent/)として使用することを検討してください。
エージェントはテレメトリーデータを素早く受け取り、バッチ処理してバックエンドに送信できます。
