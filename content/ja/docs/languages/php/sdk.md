---
title: SDK
weight: 100
default_lang_commit: 60d50174e01d221f65af4b69ad1ae946fbc16ec8
cSpell:ignore: healthcheck
---

OpenTelemetry SDK は API の実用的な実装を提供し、さまざまな方法でセットアップおよび設定できます。

## 手動セットアップ {#manual-setup}

SDK を手動でセットアップすると、SDK の設定を最も細かく制御できます。

```php
<?php
$exporter = new InMemoryExporter();
$meterProvider = new NoopMeterProvider();
$tracerProvider =  new TracerProvider(
    new BatchSpanProcessor(
        $exporter,
        Clock::getDefault(),
        2048, //最大キューサイズ
        5000, //スケジュールされた遅延（ミリ秒）
        5000, //エクスポートタイムアウト
        1024, //最大バッチサイズ
        true, //自動フラッシュ
        $meterProvider
    )
);
```

## SDK ビルダー {#sdk-builder}

SDK ビルダーは SDK の各部分を設定するための便利なインターフェイスを提供します。
ただし、手動セットアップがサポートするすべての機能をサポートしているわけではありません。

```php
<?php

$spanExporter = new InMemoryExporter(); //デモ用のモックエクスポーター

$meterProvider = MeterProvider::builder()
    ->addReader(
        new ExportingReader(new MetricExporter((new StreamTransportFactory())->create(STDOUT, 'application/x-ndjson'), /*Temporality::CUMULATIVE*/))
    )
    ->build();

$tracerProvider = TracerProvider::builder()
    ->addSpanProcessor(
        (new BatchSpanProcessorBuilder($spanExporter))
            ->setMeterProvider($meterProvider)
            ->build()
    )
    ->build();

$loggerProvider = LoggerProvider::builder()
    ->addLogRecordProcessor(
        new SimpleLogsProcessor(
            (new ConsoleExporterFactory())->create()
        )
    )
    ->setResource(ResourceInfo::create(Attributes::create(['foo' => 'bar'])))
    ->build();

Sdk::builder()
    ->setTracerProvider($tracerProvider)
    ->setLoggerProvider($loggerProvider)
    ->setMeterProvider($meterProvider)
    ->setPropagator(TraceContextPropagator::getInstance())
    ->setAutoShutdown(true)
    ->buildAndRegisterGlobal();
```

## オートローディング {#autoloading}

SDK は composer のオートローディングの一部として自動的に設定し、グローバルに登録できます。
唯一の要件は `OTEL_PHP_AUTOLOAD_ENABLED=true` を設定することです。
設定はさまざまな方法で提供できます。

### 環境設定 {#environment-configuration}

環境変数（または対応する `php.ini` 設定）で、[SDK の設定](/docs/languages/sdk-configuration/)に記載されている必要な設定や標準外の設定を提供できます。

たとえば、以下のように設定します。

```shell
OTEL_PHP_AUTOLOAD_ENABLED=true \
OTEL_EXPORTER_OTLP_PROTOCOL=grpc \
OTEL_EXPORTER_OTLP_ENDPOINT=http://collector:4317 \
php example.php
```

```php
<?php
require 'vendor/autoload.php'; //SDKのオートローディングはcomposerの初期化の一部として実行される

$tracer = OpenTelemetry\API\Globals::tracerProvider()->getTracer('name', 'version', 'schema.url', [/*attributes*/]);
$meter = OpenTelemetry\API\Globals::meterProvider()->getMeter('name', 'version', 'schema.url', [/*attributes*/]);
```

### 宣言的設定 {#declarative-configuration}

PHP は OpenTelemetry の実験的な[宣言的設定](/docs/specs/otel/configuration/#declarative-configuration)をサポートしており、YAML ファイルを通じて SDK を設定できます。

これを有効にするには、`OTEL_CONFIG_FILE=/path/to/config.yaml` を設定します。
`config.yaml` は宣言的設定スキーマに準拠するファイルです。
たとえば、以下のようになります。

`config.yaml`:

```yaml
file_format: '0.4'
tracer_provider:
  processors:
    - batch:
        exporter:
          otlp_http:
            endpoint: http://localhost:4318/v1/traces
resource:
  attributes:
    - name: service.name
      value: ${OTEL_SERVICE_NAME}
    - name: service.namespace
      value: my_service_namespace
```

```shell
OTEL_PHP_AUTOLOAD_ENABLED=true \
OTEL_CONFIG_FILE=/path/to/config.yaml
php example.php
```

`OTEL_CONFIG_FILE` が存在する場合、オートローダーは提供された設定ファイルで設定を試み、他の環境変数は無視されます。

### 除外 URL {#excluded-urls}

リクエスト URL が正規表現に一致する場合、SDK のオートローディングを無効にできます。
除外 URL に一致すると、テレメトリーの生成やエクスポートが行われなくなります。
この機能は、Apache や NGINX のようなシェアードナッシング PHP ランタイムで、ヘルスチェックなどのリクエストに対して使用できます。

たとえば、以下の設定は `https://site/client/123/info` や `https://site/xyz/healthcheck` などのリクエストに対してテレメトリーを無効にします。

```shell
OTEL_PHP_EXCLUDED_URLS="client/.*/info,healthcheck"
```

## 設定 {#configuration}

PHP SDK は利用可能な[設定オプション](/docs/languages/sdk-configuration/)のほとんどをサポートしています。
準拠の詳細については、[準拠マトリクス](https://github.com/open-telemetry/opentelemetry-specification/blob/main/spec-compliance-matrix.md)を参照してください。

PHP 固有の設定もいくつかあります。

| 名前                                   | デフォルト値 | 値                                                                                    | 例                           | 説明                                                                               |
| -------------------------------------- | ------------ | ------------------------------------------------------------------------------------- | ---------------------------- | ---------------------------------------------------------------------------------- |
| `OTEL_PHP_TRACES_PROCESSOR`            | `batch`      | `batch`, `simple`                                                                     | `simple`                     | スパンプロセッサーの選択                                                           |
| `OTEL_PHP_DETECTORS`                   | `all`        | `env`, `host`, `os`, `process`, `process_runtime`, `sdk`, `sdk_provided`, `container` | `env,os,process`             | リソースディテクターの選択                                                         |
| `OTEL_PHP_AUTOLOAD_ENABLED`            | `false`      | `true`, `false`                                                                       | `true`                       | SDK オートローディングの有効化/無効化                                              |
| `OTEL_PHP_LOG_DESTINATION`             | `default`    | `error_log`, `trigger_error`, `stderr`, `stdout`, `psr3`, `none`                      | `stderr`                     | 内部エラーと警告の送信先。`error_log` と `trigger_error` は同名の PHP 関数に対応   |
| `OTEL_PHP_INTERNAL_METRICS_ENABLED`    | `false`      | `true`, `false`                                                                       | `true`                       | SDK が内部状態に関するメトリクスを出力するかどうか（たとえば、バッチプロセッサー） |
| `OTEL_PHP_DISABLED_INSTRUMENTATIONS`   | `[]`         | 計装名、または `all`                                                                  | `psr15,psr18`                | インストールされた自動計装を1つ以上無効にする                                      |
| `OTEL_PHP_EXCLUDED_URLS`               | ``           | カンマ区切りの正規表現パターン                                                        | `client/.*/info,healthcheck` | リクエスト URL が指定された正規表現のいずれかに一致する場合、SDK を読み込まない    |
| `OTEL_PHP_DEBUG_SCOPES_DISABLED`       | `false`      | `true`, `false`                                                                       | `true`                       | スコープのデタッチデバッグの有効化/無効化                                          |
| `OTEL_PHP_EXPERIMENTAL_AUTO_ROOT_SPAN` | `false`      | `true`, `false`                                                                       | `true`                       | composer のオートローディング中にルートスパンを開始する                            |

設定は環境変数、または `php.ini`（もしくは `php.ini` にインクルードされるファイル）で提供できます。

> [!NOTE] `php.ini` でのブール値
>
> `php.ini` でのブール値は、`"true"` や `"false"` のようにダブルクォートで囲んで保護する必要があります。
> これは PHP が値を数値に変換するのを防ぐためです。

```ini
OTEL_PHP_AUTOLOAD_ENABLED="true"
OTEL_EXPORTER_OTLP_PROTOCOL=grpc
OTEL_EXPORTER_OTLP_ENDPOINT=http://collector:4317
```
