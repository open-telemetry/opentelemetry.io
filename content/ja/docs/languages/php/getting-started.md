---
title: はじめに
description: PHP 向け OpenTelemetry を使い始めましょう。
aliases: [getting_started]
weight: 10
default_lang_commit: 1604e4a539552aea3cd5caff67e7c476d26ab7d6
cSpell:ignore: darwin pecl rolldice strval
---

PHP 向け OpenTelemetry は、[トレース][traces]、[メトリクス][metrics]、[ログ][logs]の生成とエクスポートに使用できます。

このページでは、PHP で OpenTelemetry を使い始める方法を説明します。
シンプルな「サイコロを振る」アプリケーションを作成し、ゼロコード計装とコードベースの計装の両方を適用して[トレース][traces]を生成し、コンソールに送信します。
その後、いくつかの[ログ][logs]を出力し、それらもコンソールに送信します。

## 前提条件 {#prerequisites}

OpenTelemetry のゼロコード計装には PHP 8.0以上が必要ですが、手動計装は PHP 7.4でも動作します。

以下がインストールされていることを確認してください。

- [PHP 8.0+](https://www.php.net/)
- [PECL](https://pecl.php.net/)
- [composer](https://getcomposer.org/)

始める前に、シェルで両方が利用可能であることを確認してください。

```sh
php -v
composer -v
```

## サンプルアプリケーション {#example-application}

次の例では、基本的な [Slim Framework](https://www.slimframework.com/) アプリケーションを使用します。
Slim を使用していなくても問題ありません。OpenTelemetry PHP は、WordPress、Symfony、Laravel など、他のウェブフレームワークでも使用できます。
サポートされているフレームワーク向けのライブラリの完全なリストは、[レジストリ](/ecosystem/registry/?component=instrumentation&language=php)を参照してください。

### 依存関係 {#dependencies}

空のディレクトリで、最小限の `composer.json` ファイルを初期化します。

```sh
composer init \
  --no-interaction \
  --require slim/slim:"^4" \
  --require slim/psr7:"^1"
composer update
```

### HTTP サーバーの作成と起動 {#create-and-launch-an-http-server}

同じディレクトリに、次の内容で `index.php` というファイルを作成します。

```php
<?php
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Slim\Factory\AppFactory;

require __DIR__ . '/vendor/autoload.php';

$app = AppFactory::create();

$app->get('/rolldice', function (Request $request, Response $response) {
    $result = random_int(1,6);
    $response->getBody()->write(strval($result));
    return $response;
});

$app->run();
```

PHP のビルトインウェブサーバーを使用してアプリケーションを実行します。

```shell
php -S localhost:8080
```

ウェブブラウザで <http://localhost:8080/rolldice> を開き、正しく動作していることを確認してください。

## ゼロコード計装の追加 {#add-zero-code-instrumentation}

次に、OpenTelemetry PHP エクステンションを使用して、アプリケーションを[自動的に計装](/docs/zero-code/php/)します。

1. エクステンションはソースからビルドされるため、いくつかのビルドツールをインストールする必要があります。

   {{< tabpane text=true >}} {{% tab "Linux (apt)" %}}

   ```sh
   sudo apt-get install gcc make autoconf
   ```

   {{% /tab %}} {{% tab "macOS (homebrew)" %}}

   ```sh
   brew install gcc make autoconf
   ```

   {{% /tab %}} {{< /tabpane >}}

2. `PECL` でエクステンションをビルドします。

   ```sh
   pecl install opentelemetry
   ```

   > [!NOTE]
   >
   > エクステンションのインストール方法の代替手段については、[ゼロコード計装](/docs/zero-code/php/#install-the-opentelemetry-extension)で詳しく説明しています。

3. `php.ini` ファイルにエクステンションを追加します。

   ```ini
   [opentelemetry]
   extension=opentelemetry.so
   ```

4. エクステンションがインストールされ、有効になっていることを確認します。

   ```sh
   php --ri opentelemetry
   ```

5. コードの自動計装に必要な追加の依存関係をアプリケーションに追加します。

   ```sh
   composer config allow-plugins.php-http/discovery false
   composer require \
     open-telemetry/sdk \
     open-telemetry/opentelemetry-auto-slim
   ```

OpenTelemetry PHP エクステンションのセットアップと計装ライブラリのインストールが完了したら、アプリケーションを実行してトレースを生成できます。

```sh
env OTEL_PHP_AUTOLOAD_ENABLED=true \
    OTEL_TRACES_EXPORTER=console \
    OTEL_METRICS_EXPORTER=none \
    OTEL_LOGS_EXPORTER=none \
    php -S localhost:8080
```

ウェブブラウザで <http://localhost:8080/rolldice> を開き、ページを数回リロードしてください。
しばらくすると、コンソールにスパンが出力されます。

<details>
<summary>出力例を表示</summary>

```json
[
  {
    "name": "GET /rolldice",
    "context": {
      "trace_id": "16d7c6da7c021c574205736527816eb7",
      "span_id": "268e52331de62e33",
      "trace_state": ""
    },
    "resource": {
      "service.name": "__root__",
      "service.version": "1.0.0+no-version-set",
      "telemetry.sdk.name": "opentelemetry",
      "telemetry.sdk.language": "php",
      "telemetry.sdk.version": "1.0.0beta10",
      "telemetry.auto.version": "1.0.0beta5",
      "process.runtime.name": "cli-server",
      "process.runtime.version": "8.2.6",
      "process.pid": 24435,
      "process.executable.path": "/bin/php",
      "process.owner": "php",
      "os.type": "darwin",
      "os.description": "22.4.0",
      "os.name": "Darwin",
      "os.version": "Darwin Kernel Version 22.4.0: Mon Mar  6 20:59:28 PST 2023; root:xnu-8796.101.5~3/RELEASE_ARM64_T6000",
      "host.name": "OPENTELEMETRY-PHP",
      "host.arch": "arm64"
    },
    "parent_span_id": "",
    "kind": "KIND_SERVER",
    "start": 1684749478068582482,
    "end": 1684749478072715774,
    "attributes": {
      "code.function": "handle",
      "code.namespace": "Slim\\App",
      "code.filepath": "/vendor/slim/slim/Slim/App.php",
      "code.lineno": 197,
      "http.url": "http://localhost:8080/rolldice",
      "http.method": "GET",
      "http.request_content_length": "",
      "http.scheme": "http",
      "http.status_code": 200,
      "http.flavor": "1.1",
      "http.response_content_length": ""
    },
    "status": {
      "code": "Unset",
      "description": ""
    },
    "events": [],
    "links": []
  }
]
```

</details>

## 手動計装の追加 {#add-manual-instrumentation}

### トレース {#traces}

手動トレースには `TracerProvider` が必要です。
セットアップにはいくつかの方法があります。
この例では、グローバルに利用可能なオートロードされた TracerProvider を使用します。

`index.php` を次のコードに置き換えます。

```php
<?php

use OpenTelemetry\API\Globals;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Slim\Factory\AppFactory;

require __DIR__ . '/vendor/autoload.php';

$tracer = Globals::tracerProvider()->getTracer('demo');

$app = AppFactory::create();

$app->get('/rolldice', function (Request $request, Response $response) use ($tracer) {
    $span = $tracer
        ->spanBuilder('manual-span')
        ->startSpan();
    $result = random_int(1,6);
    $response->getBody()->write(strval($result));
    $span
        ->addEvent('rolled dice', ['result' => $result])
        ->end();
    return $response;
});

$app->run();
```

ビルトインウェブサーバーを再び起動し、<http://localhost:8080/rolldice> にアクセスしてください。
同様の出力が表示されますが、`manual-span` という名前の新しいスパンが追加されています。

手動スパンの `parent_span_id` には、「{closure}」スパンの `context.span_id` と同じ値が含まれていることに注目してください。
手動計装と自動計装は、内部的に同じ API を使用しているため、うまく連携します。

### ロギング {#logging}

次に、ロギングを追加しましょう。
ここでは、人気のある `monolog` ロギングライブラリを使用します。
OpenTelemetry 形式でログを出力するハンドラーを利用します。

まず、追加の依存関係をインストールします。

```shell
composer require \
  monolog/monolog \
  open-telemetry/opentelemetry-logger-monolog
```

`index.php` ファイルを次のコードに置き換えます。

```php
<?php

use Monolog\Logger;
use OpenTelemetry\API\Globals;
use OpenTelemetry\Contrib\Logs\Monolog\Handler;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Psr\Log\LogLevel;
use Slim\Factory\AppFactory;

require __DIR__ . '/vendor/autoload.php';

$loggerProvider = Globals::loggerProvider();
$handler = new Handler(
    $loggerProvider,
    LogLevel::INFO
);
$monolog = new Logger('otel-php-monolog', [$handler]);

$app = AppFactory::create();

$app->get('/rolldice', function (Request $request, Response $response) use ($monolog) {
    $result = random_int(1,6);
    $response->getBody()->write(strval($result));
    $monolog->info('dice rolled', ['result' => $result]);
    return $response;
});

$app->run();
```

以下のコマンドでビルトインウェブサーバーを起動します（`OTEL_LOGS_EXPORTER` の変更に注意してください）。

```shell
env OTEL_PHP_AUTOLOAD_ENABLED=true \
    OTEL_TRACES_EXPORTER=console \
    OTEL_METRICS_EXPORTER=none \
    OTEL_LOGS_EXPORTER=console \
    php -S localhost:8080
```

今回 <http://localhost:8080/rolldice> にアクセスすると、以前と同じ自動計装のトレースに加えて、monolog ハンドラーから生成されたログレコードも表示されます。

`trace_id` と `span_id` がログ出力に追加されており、それらの値がログメッセージ生成時のアクティブなスパンに対応していることに注目してください。

<details>
<summary>出力例を表示</summary>

```json
[
    {
        "name": "{closure}",
        "context": {
            "trace_id": "8b046fc5d43864058b6a5a18e0dfce3f",
            "span_id": "9cf24c78c6868bfe",
            "trace_state": ""
        },
        "resource": {
            "service.name": "__root__",
            "service.version": "1.0.0+no-version-set",
            "telemetry.sdk.name": "opentelemetry",
            "telemetry.sdk.language": "php",
            "telemetry.sdk.version": "1.0.0beta11",
            "telemetry.auto.version": "1.0.0beta6",
            "process.runtime.name": "cli-server",
            "process.runtime.version": "8.0.27",
            "process.pid": 2672,
            "process.executable.path": "\/usr\/local\/bin\/php",
            "process.owner": "root",
            "os.type": "linux",
            "os.description": "5.15.0-75-generic",
            "os.name": "Linux",
            "os.version": "#82-Ubuntu SMP Tue Jun 6 23:10:23 UTC 2023",
            "host.name": "f2c0afe83ea9",
            "host.arch": "x86_64"
        },
        "parent_span_id": "df2199a615085705",
        "kind": "KIND_INTERNAL",
        "start": 1687323704059486500,
        "end": 1687323704060820769,
        "attributes": {
            "code.function": "__invoke",
            "code.namespace": "Slim\\Handlers\\Strategies\\RequestResponse",
            "code.filepath": "\/usr\/src\/myapp\/vendor\/slim\/slim\/Slim\/Handlers\/Strategies\/RequestResponse.php",
            "code.lineno": 28
        },
        "status": {
            "code": "Unset",
            "description": ""
        },
        "events": [],
        "links": []
    }
]
[
    {
        "name": "GET \/rolldice",
        "context": {
            "trace_id": "8b046fc5d43864058b6a5a18e0dfce3f",
            "span_id": "df2199a615085705",
            "trace_state": ""
        },
        "resource": {
            "service.name": "__root__",
            "service.version": "1.0.0+no-version-set",
            "telemetry.sdk.name": "opentelemetry",
            "telemetry.sdk.language": "php",
            "telemetry.sdk.version": "1.0.0beta11",
            "telemetry.auto.version": "1.0.0beta6",
            "process.runtime.name": "cli-server",
            "process.runtime.version": "8.0.27",
            "process.pid": 2672,
            "process.executable.path": "\/usr\/local\/bin\/php",
            "process.owner": "root",
            "os.type": "linux",
            "os.description": "5.15.0-75-generic",
            "os.name": "Linux",
            "os.version": "#82-Ubuntu SMP Tue Jun 6 23:10:23 UTC 2023",
            "host.name": "f2c0afe83ea9",
            "host.arch": "x86_64"
        },
        "parent_span_id": "",
        "kind": "KIND_SERVER",
        "start": 1687323704058191192,
        "end": 1687323704060981779,
        "attributes": {
            "code.function": "handle",
            "code.namespace": "Slim\\App",
            "code.filepath": "\/usr\/src\/myapp\/vendor\/slim\/slim\/Slim\/App.php",
            "code.lineno": 197,
            "http.url": "http:\/\/localhost:8080\/rolldice",
            "http.method": "GET",
            "http.request_content_length": "",
            "http.scheme": "http",
            "http.status_code": 200,
            "http.flavor": "1.1",
            "http.response_content_length": ""
        },
        "status": {
            "code": "Unset",
            "description": ""
        },
        "events": [],
        "links": []
    }
]
{
    "resource": {
        "attributes": {
            "service.name": "__root__",
            "service.version": "1.0.0+no-version-set",
            "telemetry.sdk.name": "opentelemetry",
            "telemetry.sdk.language": "php",
            "telemetry.sdk.version": "1.0.0beta11",
            "telemetry.auto.version": "1.0.0beta6",
            "process.runtime.name": "cli-server",
            "process.runtime.version": "8.0.27",
            "process.pid": 2672,
            "process.executable.path": "\/usr\/local\/bin\/php",
            "process.owner": "root",
            "os.type": "linux",
            "os.description": "5.15.0-75-generic",
            "os.name": "Linux",
            "os.version": "#82-Ubuntu SMP Tue Jun 6 23:10:23 UTC 2023",
            "host.name": "f2c0afe83ea9",
            "host.arch": "x86_64"
        },
        "dropped_attributes_count": 0
    },
    "scope": {
        "name": "monolog",
        "version": null,
        "attributes": [],
        "dropped_attributes_count": 0,
        "schema_url": null,
        "logs": [
            {
                "timestamp": 1687323704059648000,
                "observed_timestamp": 1687323704060784128,
                "severity_number": 9,
                "severity_text": "INFO",
                "body": "dice rolled",
                "trace_id": "8b046fc5d43864058b6a5a18e0dfce3f",
                "span_id": "9cf24c78c6868bfe",
                "trace_flags": 1,
                "attributes": {
                    "channel": "otel-php-monolog",
                    "context": {
                        "result": 4
                    }
                },
                "dropped_attributes_count": 0
            }
        ]
    }
}
```

</details>

## 次のステップ {#whats-next}

さらに詳しく知るには、以下を参照してください。

- この例をテレメトリーデータ用の別の[エクスポーター][exporter]で実行する。
- 自分のアプリで[ゼロコード計装](/docs/zero-code/php/)を試す。
- [手動計装][manual instrumentation]について詳しく学び、いくつかの[例](/docs/languages/php/examples/)を試す。
- PHP ベースの [Quote Service](/docs/demo/services/quote/) を含む [OpenTelemetry デモ](/docs/demo/)を確認する。

[traces]: /docs/concepts/signals/traces/
[metrics]: /docs/concepts/signals/metrics/
[logs]: /docs/concepts/signals/logs/
[exporter]: ../exporters/
[manual instrumentation]: ../instrumentation/
