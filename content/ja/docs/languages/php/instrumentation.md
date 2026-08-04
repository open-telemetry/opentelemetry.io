---
title: 計装
weight: 20
aliases: [manual]
description: OpenTelemetry PHP の手動計装
default_lang_commit: 9229908e7b567bc9c3f6352a5a8922caf5c1ac1c
cSpell:ignore: guzzlehttp
---

<!-- markdownlint-disable no-duplicate-heading -->

{{% include instrumentation-intro.md %}}

## サンプルアプリの準備 {#example-app}

この手順では、PHP コードの計装方法を学ぶために、[はじめに](/docs/languages/php/getting-started/)のサンプルアプリを修正したバージョンを使用します。

自分のアプリやライブラリを計装したい場合は、手順を自分のコードに適応させてください。

### 依存関係 {#example-app-dependencies}

空のディレクトリで、以下の内容を含む最小限の `composer.json` ファイルを初期化します。

```shell
composer init \
  --no-interaction \
  --require slim/slim:"^4" \
  --require slim/psr7:"^1" \
  --require monolog/monolog:"^3"
composer update
```

### HTTP サーバーの作成と起動 {#create-and-launch-an-http-server}

ライブラリとスタンドアロンアプリの計装の違いを明確にするために、サイコロの出目の処理をライブラリファイルに分離し、アプリファイルから依存関係としてインポートします。

`dice.php` という名前のライブラリファイルを作成し、以下のコードを追加します。

```php
<?php
class Dice {

    private $tracer;

    function __construct() {
    }

    public function roll($rolls) {
        $result = [];
        for ($i = 0; $i < $rolls; $i++) {
            $result[] = $this->rollOnce();
        }
        return $result;
    }

    private function rollOnce() {
      $result = random_int(1, 6);
      return $result;
    }
}
```

`index.php` という名前のアプリファイルを作成し、以下のコードを追加します。

```php
<?php
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Psr\Log\LogLevel;
use Slim\Factory\AppFactory;
use Monolog\Logger;
use Monolog\Level;
use Monolog\Handler\StreamHandler;

require __DIR__ . '/vendor/autoload.php';

require('dice.php');

$logger = new Logger('dice-server');
$logger->pushHandler(new StreamHandler('php://stdout', Level::INFO));

$app = AppFactory::create();

$dice = new Dice();

$app->get('/rolldice', function (Request $request, Response $response) use ($logger, $dice) {
    $params = $request->getQueryParams();
    if(isset($params['rolls'])) {
        $result = $dice->roll($params['rolls']);
        if (isset($params['player'])) {
          $logger->info("A player is rolling the dice.", ['player' => $params['player'], 'result' => $result]);
        } else {
          $logger->info("Anonymous player is rolling the dice.", ['result' => $result]);
        }
        $response->getBody()->write(json_encode($result));
    } else {
        $response->withStatus(400)->getBody()->write("Please enter a number of rolls");
    }
    return $response;
});

$app->run();
```

動作を確認するために、以下のコマンドでアプリケーションを実行し、ウェブブラウザで <http://localhost:8080/rolldice?rolls=12> を開きます。

```shell
php -S localhost:8080
```

## 計装のセットアップ {#instrumentation-setup}

### 依存関係 {#dependencies}

OpenTelemetry API パッケージをインストールします。

```shell
composer require open-telemetry/api open-telemetry/sem-conv
```

### SDK の初期化 {#initialize-the-sdk}

> [!NB] ライブラリを計装する場合は、**このステップをスキップしてください**。

PHP 用の OpenTelemetry SDK を使用するには、`psr/http-client-implementation` と `psr/http-factory-implementation` の依存関係を満たすパッケージが必要です。
ここでは、両方を提供する Guzzle を使用します。

```sh
composer require guzzlehttp/guzzle
```

次に、OpenTelemetry SDK と OTLP エクスポーターをインストールします。

```sh
composer require \
  open-telemetry/sdk \
  open-telemetry/exporter-otlp
```

アプリケーション開発者の場合、アプリケーションのできるだけ早い段階で `OpenTelemetry SDK` のインスタンスを設定する必要があります。
ここでは `Sdk::builder()` メソッドを使用し、プロバイダーをグローバルに登録します。

`TracerProvider::builder()`、`LoggerProvider::builder()`、`MeterProvider::builder()` メソッドを使用してプロバイダーを構築できます。

[サンプルアプリ](#example-app)の場合、`instrumentation.php` という名前のファイルを作成し、以下の内容を記述します。

```php
<?php

use OpenTelemetry\API\Globals;
use OpenTelemetry\API\Logs\EventLogger;
use OpenTelemetry\API\Logs\LogRecord;
use OpenTelemetry\API\Trace\Propagation\TraceContextPropagator;
use OpenTelemetry\Contrib\Otlp\LogsExporter;
use OpenTelemetry\Contrib\Otlp\MetricExporter;
use OpenTelemetry\Contrib\Otlp\SpanExporter;
use OpenTelemetry\SDK\Common\Attribute\Attributes;
use OpenTelemetry\SDK\Common\Export\Stream\StreamTransportFactory;
use OpenTelemetry\SDK\Logs\LoggerProvider;
use OpenTelemetry\SDK\Logs\Processor\SimpleLogRecordProcessor;
use OpenTelemetry\SDK\Metrics\MeterProvider;
use OpenTelemetry\SDK\Metrics\MetricReader\ExportingReader;
use OpenTelemetry\SDK\Resource\ResourceInfo;
use OpenTelemetry\SDK\Resource\ResourceInfoFactory;
use OpenTelemetry\SDK\Sdk;
use OpenTelemetry\SDK\Trace\Sampler\AlwaysOnSampler;
use OpenTelemetry\SDK\Trace\Sampler\ParentBased;
use OpenTelemetry\SDK\Trace\SpanProcessor\SimpleSpanProcessor;
use OpenTelemetry\SDK\Trace\TracerProvider;
use OpenTelemetry\SemConv\Attributes\ServiceAttributes;
use OpenTelemetry\SemConv\Incubating\Attributes\DeploymentIncubatingAttributes;
use OpenTelemetry\SemConv\Incubating\Attributes\ServiceIncubatingAttributes;

require 'vendor/autoload.php';

$resource = ResourceInfoFactory::emptyResource()->merge(ResourceInfo::create(Attributes::create([
    ServiceIncubatingAttributes::SERVICE_NAMESPACE => 'demo',
    ServiceAttributes::SERVICE_NAME => 'test-application',
    ServiceAttributes::SERVICE_VERSION => '0.1',
    DeploymentIncubatingAttributes::DEPLOYMENT_ENVIRONMENT_NAME => 'development',
])));
$spanExporter = new SpanExporter(
    (new StreamTransportFactory())->create('php://stdout', 'application/json')
);

$logExporter = new LogsExporter(
    (new StreamTransportFactory())->create('php://stdout', 'application/json')
);

$reader = new ExportingReader(
    new MetricExporter(
        (new StreamTransportFactory())->create('php://stdout', 'application/json')
    )
);

$meterProvider = MeterProvider::builder()
    ->setResource($resource)
    ->addReader($reader)
    ->build();

$tracerProvider = TracerProvider::builder()
    ->addSpanProcessor(
        new SimpleSpanProcessor($spanExporter)
    )
    ->setResource($resource)
    ->setSampler(new ParentBased(new AlwaysOnSampler()))
    ->build();

$loggerProvider = LoggerProvider::builder()
    ->setResource($resource)
    ->addLogRecordProcessor(
        new SimpleLogRecordProcessor($logExporter)
    )
    ->build();

Sdk::builder()
    ->setTracerProvider($tracerProvider)
    ->setMeterProvider($meterProvider)
    ->setLoggerProvider($loggerProvider)
    ->setPropagator(TraceContextPropagator::getInstance())
    ->setAutoShutdown(true)
    ->buildAndRegisterGlobal();
```

このコードをアプリケーションファイル `index.php` の先頭にインクルードします。

```php
<?php
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Psr\Log\LogLevel;
use Slim\Factory\AppFactory;
use Monolog\Logger;
use Monolog\Handler\StreamHandler;

require __DIR__ . '/vendor/autoload.php';

require('dice.php');
require('instrumentation.php');

// ...
```

デバッグやローカル開発の目的で、この例ではテレメトリーをコンソールにエクスポートします。
手動計装の設定が完了したら、アプリのテレメトリーデータを 1 つ以上のテレメトリーバックエンドに[エクスポート](/docs/languages/php/exporters/)するための適切なエクスポーターを設定する必要があります。

この例では、サービスの論理名を保持する必須の SDK デフォルト属性 `service.name` と、オプションではあるが強く推奨される属性 `service.version`（サービスの API または実装のバージョンを保持）も設定しています。

リソース属性の設定には他の方法もあります。
詳細については、[リソース](/docs/languages/php/resources/)を参照してください。

#### グローバルプロバイダー {#global-providers}

以下の例では、通常 `OpenTelemetry\API\Globals` を介してグローバルに登録されたプロバイダーを取得します。

```php
$tracerProvider = \OpenTelemetry\API\Globals::tracerProvider();
$meterProvider = \OpenTelemetry\API\Globals::meterProvider();
$loggerProvider = \OpenTelemetry\API\Globals::loggerProvider();
```

#### シャットダウン {#shutdown}

PHP プロセスが終了する際に、キューに入れられたテレメトリーのフラッシュを有効にするために、各プロバイダーの `shutdown()` メソッドを実行することが重要です。
上記の例では、`setAutoShutdown(true)` でこれが処理されています。

また、`ShutdownHandler` を使用して、各プロバイダーのシャットダウン関数を PHP のシャットダウンプロセスの一部として登録することもできます。

```php
\OpenTelemetry\SDK\Common\Util\ShutdownHandler::register([$tracerProvider, 'shutdown']);
\OpenTelemetry\SDK\Common\Util\ShutdownHandler::register([$meterProvider, 'shutdown']);
\OpenTelemetry\SDK\Common\Util\ShutdownHandler::register([$loggerProvider, 'shutdown']);
```

## トレース {#traces}

### トレースの初期化 {#initialize-tracing}

> [!NB] ライブラリを計装する場合は、**このステップをスキップしてください**。

アプリで[トレース](/docs/concepts/signals/traces/)を有効にするには、[`Tracer`](/docs/concepts/signals/traces/#tracer) を作成するための、初期化済みの [`TracerProvider`](/docs/concepts/signals/traces/#tracer-provider) が必要です。

`TracerProvider` が作成されていない場合、トレース用の OpenTelemetry API はノーオプ実装を使用し、データを生成できません。

上記の [SDK の初期化](#initialize-the-sdk)手順に従った場合、`TracerProvider` はすでにセットアップされています。
[トレーサーの取得](#acquiring-a-tracer)に進むことができます。

### トレーサーの取得 {#acquiring-a-tracer}

手動トレースコードを記述するアプリケーションのどこからでも、`getTracer` を呼び出してトレーサーを取得できます。
例:

```php
$tracerProvider = Globals::tracerProvider();
$tracer = $tracerProvider->getTracer(
  'instrumentation-scope-name', // 名前（必須）
  'instrumentation-scope-version', // バージョン
  'http://example.com/my-schema', // スキーマ URL
  ['foo' => 'bar'] // 属性
);
```

`instrumentation-scope-name` と `instrumentation-scope-version` の値は、パッケージ、モジュール、クラス名など、[計装スコープ](/docs/concepts/instrumentation-scope/)を一意に識別する必要があります。
名前は必須ですが、バージョンはオプションでありながらも推奨されます。

一般的に、アプリで必要な時に `getTracer` を呼び出すことが推奨されます。
`tracer` インスタンスをアプリの他の部分にエクスポートするよりも、他の必要な依存関係が関わる場合のアプリケーション読み込みの問題を回避できます。

[サンプルアプリ](#example-app)の場合、適切な計装スコープでトレーサーを取得できる場所が 2 つあります。

まず、_アプリケーションファイル_ `index.php` で:

```php
<?php
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Psr\Log\LogLevel;
use Slim\Factory\AppFactory;
use Monolog\Logger;
use Monolog\Handler\StreamHandler;
use OpenTelemetry\API\Globals;

require __DIR__ . '/vendor/autoload.php';

require('dice.php');
require('instrumentation.php');

$tracerProvider = Globals::tracerProvider();
$tracer = $tracerProvider->getTracer(
  'dice-server',
  '0.1.0',
  'https://opentelemetry.io/schemas/1.24.0'
);

$logger = new Logger('dice-server');
$logger->pushHandler(new StreamHandler('php://stdout', Logger::INFO));

$app = AppFactory::create();

$dice = new Dice();

$app->get('/rolldice', function (Request $request, Response $response) use ($logger, $dice, $tracer) {
// ...
}
```

次に、_ライブラリファイル_ `dice.php` で:

```php
<?php
use OpenTelemetry\API\Globals;
use OpenTelemetry\SemConv\TraceAttributes;

class Dice {

    private $tracer;

    function __construct() {
        $tracerProvider = Globals::tracerProvider();
        $this->tracer = $tracerProvider->getTracer(
          'dice-lib',
          '0.1.0',
          'https://opentelemetry.io/schemas/1.24.0'
        );
    }

    public function roll($rolls) {
        $result = [];
        for ($i = 0; $i < $rolls; $i++) {
            $result[] = $this->rollOnce();
        }
        return $result;
    }

    private function rollOnce() {
      $result = random_int(1, 6);
      return $result;
    }
}
```

### スパンの作成 {#create-spans}

[トレーサー](/docs/concepts/signals/traces/#tracer)が初期化されたので、[スパン](/docs/concepts/signals/traces/#spans)を作成できます。

以下のコードは、スパンの作成方法を示しています。

```php
<?php
public function roll($rolls) {
    $span = $this->tracer->spanBuilder("rollTheDice")->startSpan();
    $result = [];
    for ($i = 0; $i < $rolls; $i++) {
        $result[] = $this->rollOnce();
    }
    $span->end();
    return $result;
}
```

スパンを `end()` することが必須であることに注意してください。
そうしないと、スパンはエクスポートされません。

[サンプルアプリ](#example-app)の手順にここまで従った場合、上記のコードをライブラリファイル `dice.php` にコピーできます。
これで、アプリから出力されるスパンを確認できるようになります。

以下のようにアプリを起動し、ブラウザまたは `curl` で <http://localhost:8080/rolldice?rolls=12> にリクエストを送信します。

```sh
php -S 8080 localhost
```

しばらくすると、`SpanExporter` によってコンソールにスパンが出力されるのが確認できます。
以下のようなものです。

```json
{
  "resourceSpans": [
    {
      "resource": {
        "attributes": [
          {
            "key": "service.namespace",
            "value": {
              "stringValue": "demo"
            }
          },
          {
            "key": "service.name",
            "value": {
              "stringValue": "test-application"
            }
          },
          {
            "key": "service.version",
            "value": {
              "stringValue": "0.1"
            }
          },
          {
            "key": "deployment.environment",
            "value": {
              "stringValue": "development"
            }
          }
        ]
      },
      "scopeSpans": [
        {
          "scope": {
            "name": "dice-lib",
            "version": "0.1.0"
          },
          "spans": [
            {
              "traceId": "007a1e7a89f21f98b600d288b7d65390",
              "spanId": "c32797fc72c252d2",
              "flags": 1,
              "name": "rollTheDice",
              "kind": 1,
              "startTimeUnixNano": "1706111239077485365",
              "endTimeUnixNano": "1706111239077735657",
              "status": {}
            }
          ],
          "schemaUrl": "https://opentelemetry.io/schemas/1.24.0"
        }
      ]
    }
  ]
}
```

### ネストされたスパンの作成 {#create-nested-spans}

ネストされた[スパン](/docs/concepts/signals/traces/#spans)を使用すると、ネストされた性質の作業を追跡できます。
たとえば、以下の `rollOnce()` 関数はネストされた操作を表します。
以下のサンプルは、`rollOnce()` を追跡するネストされたスパンを作成します。

```php
private function rollOnce() {
    $parent = OpenTelemetry\API\Trace\Span::getCurrent();
    $scope = $parent->activate();
    try {
        $span = $this->tracer->spanBuilder("rollTheDice")->startSpan();
        $result = random_int(1, 6);
        $span->end();
    } finally {
        $scope->detach();
    }
    return $result;
}
```

アクティブスコープをアクティベートした場合は、必ず `detach` する必要があります。

### 現在のスパンの取得 {#get-the-current-span}

上記の例では、以下のメソッドを使用して現在のスパンを取得しました。

```php
$span = OpenTelemetry\API\Trace\Span::getCurrent();
```

### コンテキストからスパンを取得する {#get-a-span-from-context}

必ずしもアクティブなスパンではない、特定のコンテキストから[スパン](/docs/concepts/signals/traces/#spans)を取得することも有用です。

```php
$span = OpenTelemetry\API\Trace\Span::fromContext($context);
```

### スパン属性 {#span-attributes}

[属性](/docs/concepts/signals/traces/#attributes)を使用すると、[`スパン`](/docs/concepts/signals/traces/#spans)にキー/値ペアをアタッチして、追跡中の現在の操作に関する詳細情報を含めることができます。

```php
private function rollOnce() {
    $parent = OpenTelemetry\API\Trace\Span::getCurrent();
    $scope = $parent->activate();
    try {
        $span = $this->tracer->spanBuilder("rollTheDice")->startSpan();
        $result = random_int(1, 6);
        $span->setAttribute('dicelib.rolled', $result);
        $span->end();
    } finally {
        $scope->detach();
    }
    return $result;
}
```

#### セマンティック属性 {#semantic-attributes}

HTTP やデータベース呼び出しなど、よく知られたプロトコルの操作を表すスパンにはセマンティック規約があります。
これらのスパンのセマンティック規約は、仕様の[トレースセマンティック規約](/docs/specs/semconv/general/trace/)で定義されています。
このガイドの簡単な例では、ソースコード属性を使用できます。

まず、セマンティック規約を依存関係としてアプリケーションに追加します。

```shell
composer require open-telemetry/sem-conv
```

ファイルの先頭に以下を追加します。

```php
use OpenTelemetry\SemConv\Attributes\CodeAttributes;
```

最後に、セマンティック属性を含むようにファイルを更新します。

```php
$span->setAttribute(CodeAttributes::CODE_FUNCTION_NAME, 'rollOnce');
$span->setAttribute(CodeAttributes::CODE_FILE_PATH, __FILE__);
```

### イベント付きスパンの作成 {#create-spans-with-events}

[スパン](/docs/concepts/signals/traces/#spans)には、0 個以上の[スパン属性](#span-attributes)を持つ名前付きイベント（[スパンイベント](/docs/concepts/signals/traces/#span-events)と呼ばれる）でアノテーションを付けることができます。
各属性はキー:値のマップであり、自動的にタイムスタンプと紐づけられます。

```php
$span->addEvent("Init");
...
$span->addEvent("End");
```

```php
$eventAttributes = Attributes::create([
    "operation" => "calculate-pi",
    "result" => 3.14159,
]);
$span->addEvent("End Computation", $eventAttributes);
```

### リンク付きスパンの作成 {#create-spans-with-links}

[スパン](/docs/concepts/signals/traces/#spans)は、因果関係のある 0 個以上の他のスパンと[スパンリンク](/docs/concepts/signals/traces/#span-links)を介してリンクできます。
リンクは、バッチ処理において、スパンが複数の開始スパンによって開始された場合に使用でき、各開始スパンはバッチで処理される個々の受信アイテムを表します。

```php
$span = $tracer->spanBuilder("span-with-links")
    ->addLink($parentSpan1->getContext())
    ->addLink($parentSpan2->getContext())
    ->addLink($parentSpan3->getContext())
    ->addLink($remoteSpanContext)
    ->startSpan();
```

リモートプロセスからコンテキストを読み取る方法の詳細については、[コンテキスト伝搬](../propagation/)を参照してください。

### スパンステータスの設定と例外の記録 {#set-span-status-and-record-exceptions}

{{% include "span-status-preamble.md" %}}

例外が発生した時に記録することは良い考えです。
[スパンステータスの設定](/docs/specs/otel/trace/api/#set-status)と併せて行うことが推奨されます。

ステータスはスパンが終了する前であればいつでも設定できます。

```php
$span = $tracer->spanBuilder("my-span")->startSpan();
try {
  // 失敗する可能性のある処理
  throw new \Exception('uh-oh');
} catch (\Throwable $t) {
  $span->setStatus(\OpenTelemetry\API\Trace\StatusCode::STATUS_ERROR, "Something bad happened!");
  // これにより、現在のスタックトレースなどがスパンにキャプチャされます。
  $span->recordException($t, ['exception.escaped' => true]);
  throw $t;
} finally {
  $span->end();
}
```

### スパンプロセッサー {#span-processor}

OpenTelemetry にはさまざまなスパンプロセッサーが用意されています。
`SimpleSpanProcessor` は終了したスパンを即座にエクスポーターに転送し、`BatchSpanProcessor` はバッチ処理を行い定期的に送信します。

```php
$tracerProvider = TracerProvider::builder()
  ->addSpanProcessor(new SimpleSpanProcessor(new ConsoleSpanExporterFactory()->create()))
  ->build();
```

### トランスポート {#transports}

すべてのエクスポーターには、テレメトリーデータの送信を担当する `Transport` が必要です。

- `PsrTransport` - PSR-18 クライアントを使用して HTTP 経由でデータを送信
- `StreamTransport` - ストリームを使用してデータを送信（例: ファイルや `stdout` へ）
- `GrpcTransport` - gRPC を使用して protobuf エンコードされたデータを送信

### エクスポーター {#exporter}

[エクスポーター](/docs/languages/php/exporters)を参照してください。

## メトリクス {#metrics}

OpenTelemetry を使用して、アプリケーションからさまざまな種類のメトリクスを測定・記録し、OpenTelemetry Collector などのメトリクスサービスに[プッシュ](/docs/specs/otel/metrics/sdk/#push-metric-exporter)できます。

- counter
- async counter
- histogram
- async gauge
- up/down counter
- async up/down counter

メーターの種類と使い方については、[メトリクスの概念](/docs/concepts/signals/metrics/)のドキュメントで説明されています。

### セットアップ {#setup}

まず、`MeterProvider` を作成します。

```php
<?php

use OpenTelemetry\SDK\Metrics\MetricExporter\ConsoleMetricExporterFactory;
use OpenTelemetry\SDK\Metrics\MeterProvider;
use OpenTelemetry\SDK\Metrics\MetricReader\ExportingReader;

require 'vendor/autoload.php';

$reader = new ExportingReader((new ConsoleMetricExporterFactory())->create());

$meterProvider = MeterProvider::builder()
    ->addReader($reader)
    ->build();
```

### 同期メーター {#synchronous-meters}

同期メーターは、データが変化するたびに手動で調整する必要があります。

```php
$up_down = $meterProvider
    ->getMeter('demo_meter')
    ->createUpDownCounter('queued', 'jobs', 'The number of jobs enqueued');
// ジョブが入る
$up_down->add(5);
// ジョブが完了
$up_down->add(-1);
// さらにジョブが入る
$up_down->add(2);

$meterProvider->forceFlush();
```

同期メトリクスは、メータープロバイダーで `forceFlush()` または `shutdown()` が呼び出された時にエクスポートされます。

<details>
<summary>出力を表示</summary>

```json
{
  "resourceMetrics": [
    {
      "resource": {},
      "scopeMetrics": [
        {
          "scope": { "name": "demo_meter" },
          "metrics": [
            {
              "name": "queued",
              "description": "The number of jobs enqueued",
              "unit": "jobs",
              "sum": {
                "dataPoints": [
                  {
                    "startTimeUnixNano": "1687332126443709851",
                    "timeUnixNano": "1687332126445544432",
                    "asInt": "6"
                  }
                ],
                "aggregationTemporality": "AGGREGATION_TEMPORALITY_DELTA"
              }
            }
          ]
        }
      ]
    }
  ]
}
```

</details>

### 非同期メーター {#asynchronous-meters}

非同期メーターは `observable`、たとえば `ObservableGauge` です。
observable/非同期メーターを登録する際に、1 つ以上のコールバック関数を提供します。
コールバック関数は、[定期エクスポートメトリクスリーダー](/docs/specs/otel/metrics/sdk/#periodic-exporting-metricreader)の `collect()` メソッドが呼び出されるたびに呼び出されます（たとえば、イベントループタイマーに基づいて）。
コールバックはメーターの現在のデータを返す責任があります。

この例では、`$reader->collect()` が実行されるたびにコールバックが実行されます。

```php
$queue = [
    'job1',
    'job2',
    'job3',
];
$meterProvider
    ->getMeter('demo_meter')
    ->createObservableGauge('queued', 'jobs', 'The number of jobs enqueued')
    ->observe(static function (ObserverInterface $observer) use (&$queue): void {
        $observer->observe(count($queue));
    });
$reader->collect();
array_pop($queue);
$reader->collect();
```

<details>
<summary>出力を表示</summary>

```json
{"resourceMetrics":[{"resource":{},"scopeMetrics":[{"scope":{"name":"demo_meter"},"metrics":[{"name":"queued","description":"The number of jobs enqueued","unit":"jobs","gauge":{"dataPoints":[{"startTimeUnixNano":"1687331630161510994","timeUnixNano":"1687331630162989144","asInt":"3"}]}}]}]}]}
{"resourceMetrics":[{"resource":{},"scopeMetrics":[{"scope":{"name":"demo_meter"},"metrics":[{"name":"queued","description":"The number of jobs enqueued","unit":"jobs","gauge":{"dataPoints":[{"startTimeUnixNano":"1687331630161510994","timeUnixNano":"1687331631164759171","asInt":"2"}]}}]}]}]}
```

</details>

## ログ {#logs}

ログは成熟した確立された機能であるため、このシグナルに対する [OpenTelemetry のアプローチ](/docs/concepts/signals/logs/)は少し異なります。

OpenTelemetry のロガーは直接使用するためではなく、既存のログライブラリに統合するために設計されています。
この方法により、アプリケーションログの一部またはすべてを [Collector](/docs/collector/) などの OpenTelemetry 対応サービスに送信することを選択できます。

### セットアップ {#setup-1}

まず、`LoggerProvider` を作成します。

```php
<?php

use OpenTelemetry\API\Logs\EventLogger;
use OpenTelemetry\API\Logs\LogRecord;
use OpenTelemetry\Contrib\Otlp\LogsExporter;
use OpenTelemetry\SDK\Common\Export\Stream\StreamTransportFactory;
use OpenTelemetry\SDK\Logs\LoggerProvider;
use OpenTelemetry\SDK\Logs\Processor\SimpleLogRecordProcessor;
use OpenTelemetry\SDK\Resource\ResourceInfoFactory;

require 'vendor/autoload.php';

$exporter = new LogsExporter(
    (new StreamTransportFactory())->create('php://stdout', 'application/json')
);

$loggerProvider = LoggerProvider::builder()
    ->addLogRecordProcessor(new SimpleLogRecordProcessor($exporter))
    ->setResource(ResourceInfoFactory::emptyResource())
    ->build();
```

### ログイベント {#logging-events}

`EventLogger` は `Logger` を使用してログイベントを発行できます。

```php
$logger = $loggerProvider->getLogger('demo', '1.0', 'http://schema.url', [/*attributes*/]);
$eventLogger = new EventLogger($logger, 'my-domain');
$record = (new LogRecord('hello world'))
    ->setSeverityText('INFO')
    ->setAttributes([/*attributes*/]);

$eventLogger->logEvent('foo', $record);
```

<details>
<summary>サンプル出力を表示</summary>

```json
{
  "resourceLogs": [
    {
      "resource": {},
      "scopeLogs": [
        {
          "scope": {
            "name": "demo",
            "version": "1.0"
          },
          "logRecords": [
            {
              "observedTimeUnixNano": "1687496730010009088",
              "severityText": "INFO",
              "body": {
                "stringValue": "hello world"
              },
              "attributes": [
                {
                  "key": "event.name",
                  "value": {
                    "stringValue": "foo"
                  }
                },
                {
                  "key": "event.domain",
                  "value": {
                    "stringValue": "my-domain"
                  }
                }
              ]
            }
          ]
        }
      ]
    }
  ]
}
```

</details>

### サードパーティログライブラリとの統合 {#integrations-for-third-party-logging-libraries}

#### Monolog {#monolog}

[monolog ハンドラー](https://packagist.org/packages/open-telemetry/opentelemetry-logger-monolog)を使用して、monolog のログを OpenTelemetry 対応のレシーバーに送信できます。
まず、monolog ライブラリとハンドラーをインストールします。

```shell
composer require \
  monolog/monolog \
  open-telemetry/opentelemetry-logger-monolog
```

上記のログの例に続いて:

```php
$handler = new \OpenTelemetry\Contrib\Logs\Monolog\Handler(
    $loggerProvider,
    \Psr\Log\LogLevel::ERROR,
);
$monolog = new \Monolog\Logger('example', [$handler]);

$monolog->info('hello, world');
$monolog->error('oh no', [
    'foo' => 'bar',
    'exception' => new \Exception('something went wrong'),
]);
```

<details>
<summary>サンプル出力を表示</summary>

```json
{
  "resourceLogs": [
    {
      "resource": {},
      "scopeLogs": [
        {
          "scope": {
            "name": "monolog"
          },
          "logRecords": [
            {
              "timeUnixNano": "1687496945597429000",
              "observedTimeUnixNano": "1687496945598242048",
              "severityNumber": "SEVERITY_NUMBER_ERROR",
              "severityText": "ERROR",
              "body": {
                "stringValue": "oh no"
              },
              "attributes": [
                {
                  "key": "channel",
                  "value": {
                    "stringValue": "example"
                  }
                },
                {
                  "key": "context",
                  "value": {
                    "arrayValue": {
                      "values": [
                        {
                          "stringValue": "bar"
                        },
                        {
                          "arrayValue": {
                            "values": [
                              {
                                "stringValue": "Exception"
                              },
                              {
                                "stringValue": "something went wrong"
                              },
                              {
                                "intValue": "0"
                              },
                              {
                                "stringValue": "/usr/src/myapp/logging.php:31"
                              }
                            ]
                          }
                        }
                      ]
                    }
                  }
                }
              ]
            }
          ]
        }
      ]
    }
  ]
}
```

</details>

## エラーハンドリング {#error-handling}

デフォルトでは、OpenTelemetry は PHP の [`error_log`](https://www.php.net/manual/en/function.error-log.php) 関数を介してエラーと警告をログに記録します。
冗長さは `OTEL_LOG_LEVEL` 設定で制御または無効にできます。

`OTEL_PHP_LOG_DESTINATION` 変数を使用して、ログの出力先を制御したり、エラーログを完全に無効にしたりできます。
有効な値は `default`、`error_log`、`stderr`、`stdout`、`psr3`、または `none` です。
`default`（または変数が設定されていない場合）は、PSR-3 ロガーが設定されていない限り `error_log` を使用します。

```php
$logger = new \Example\Psr3Logger(LogLevel::INFO);
\OpenTelemetry\API\LoggerHolder::set($logger);
```

より細かい制御や特殊なケースの処理には、PSR-3 ロガーにカスタムハンドラーとフィルターを適用できます（ロガーがこの機能を提供している場合）。

## 次のステップ {#next-steps}

アプリのテレメトリーデータを 1 つ以上のテレメトリーバックエンドに[エクスポート](/docs/languages/php/exporters)するための適切なエクスポーターも設定する必要があります。
