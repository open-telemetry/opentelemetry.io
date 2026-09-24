---
title: リソース
weight: 70
default_lang_commit: b446ce1563113af06c623eb5bba283c499b6060f
---

{{% docs/languages/resources-intro %}}

## リソース検出 {#resource-detection}

PHP SDKはさまざまなソースからリソースを検出し、デフォルトでは利用可能なすべてのリソース検出器を使用します。

- 環境変数（`OTEL_RESOURCE_ATTRIBUTES`、`OTEL_SERVICE_NAME`）
- ホスト情報
- ホストオペレーティングシステム
- 現在のプロセス
- ランタイム

## リソース検出の無効化 {#disabling-resource-detection}

デフォルトではすべてのSDKリソース検出器が使用されますが、環境変数 `OTEL_PHP_DETECTORS` を使用して特定の検出器のみを有効にしたり、完全に無効にしたりできます。

- `env`
- `host`
- `os`
- `process`
- `process_runtime`
- `sdk`
- `sdk_provided`
- `all` - すべてのリソース検出器を有効にする
- `none` - リソース検出を無効にする

たとえば、`env`、`host`、`sdk` 検出器のみを有効にするには次のようにします。

```shell
env OTEL_PHP_DETECTORS=env,host,sdk \
php example.php
```

## カスタムリソース検出器 {#custom-resource-detectors}

汎用プラットフォームやベンダー固有の環境向けのリソース検出器は、composerパッケージとしてインストールできます。

たとえば、`container` リソース検出器をインストールして有効にするには次のようにします。

```shell
composer require open-telemetry/detector-container
env OTEL_PHP_RESOURCE_DETECTORS=container \
php example.php
```

インストールされた検出器は、デフォルトの `all` リソース検出器リストに自動的に含まれることに注意してください。

## 環境変数によるリソースの追加 {#adding-resources-with-environment-variables}

必要なリソースに対応するSDK検出器がない場合、`env` 検出器が解釈する `OTEL_RESOURCE_ATTRIBUTES` 環境変数を使用して任意のリソースを追加できます。
この変数はカンマ区切りのキー=値ペアのリストを受け取ります。
たとえば次のようにします。

```shell
env OTEL_RESOURCE_ATTRIBUTES="service.name=my_service,service.namespace=demo,service.version=1.0,deployment.environment=development" \
php example.php
```

## コードでのリソースの追加 {#adding-resources-in-code}

カスタムリソースはコード内でも設定できます。
ここでは、デフォルトのリソース（前述のとおり検出されたもの）がカスタムリソースとマージされます。
リソースはトレーサープロバイダーに渡され、生成されたすべてのスパンに関連付けられます。

```php
$resource = ResourceInfoFactory::defaultResource()->merge(ResourceInfo::create(Attributes::create([
    ResourceAttributes::SERVICE_NAMESPACE => 'foo',
    ResourceAttributes::SERVICE_NAME => 'bar',
    ResourceAttributes::SERVICE_INSTANCE_ID => 1,
    ResourceAttributes::SERVICE_VERSION => '0.1',
    ResourceAttributes::DEPLOYMENT_ENVIRONMENT_NAME => 'development',
])));

$tracerProvider =  new TracerProvider(
    new SimpleSpanProcessor(
        (new ConsoleSpanExporterFactory())->create()
    ),
    null,
    $resource
);
```
