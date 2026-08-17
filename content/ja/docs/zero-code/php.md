---
title: PHP ゼロコード計装
linkTitle: PHP
weight: 30
aliases: [/docs/languages/php/automatic]
default_lang_commit: 60d50174e01d221f65af4b69ad1ae946fbc16ec8
cSpell:ignore: centos democlass epel pecl phar remi
---

## 要件 {#requirements}

PHP の自動計装には以下が必要です。

- PHP 8.0 以上
- [OpenTelemetry PHP エクステンション](https://github.com/open-telemetry/opentelemetry-php-instrumentation)
- [Composer のオートローディング](https://getcomposer.org/doc/01-basic-usage.md#autoloading)
- [OpenTelemetry SDK](https://packagist.org/packages/open-telemetry/sdk)
- 1つ以上の[計装ライブラリ](/ecosystem/registry/?component=instrumentation&language=php)
- [設定](#configuration)

## OpenTelemetry エクステンションのインストール {#install-the-opentelemetry-extension}

> [!IMPORTANT]
>
> OpenTelemetry エクステンションをインストールするだけでは、トレースは生成されません。

エクステンションは pecl、[pickle](https://github.com/FriendsOfPHP/pickle)、[PIE](https://github.com/php/pie)、または [php-extension-installer](https://github.com/mlocati/docker-php-extension-installer)（Docker 専用）を使ってインストールできます。
一部の Linux パッケージマネージャー向けに、パッケージ化されたバージョンも提供されています。

### Linux パッケージ {#linux-packages}

RPM および APK パッケージは以下から提供されています。

- [Remi リポジトリ](https://blog.remirepo.net/pages/PECL-extensions-RPM-status) -
  RPM
- [Alpine Linux](https://pkgs.alpinelinux.org/packages?name=*pecl-opentelemetry) -
  APK（現在は
  [_testing_ ブランチ](https://wiki.alpinelinux.org/wiki/Repositories#Testing)にあります）

{{< tabpane text=true >}} {{% tab "RPM" %}}

```sh
#この例は CentOS 7 向けです。PHP バージョンは
#remi-<version> を有効にすることで変更できます（例: "yum config-manager --enable remi-php83"）
yum update -y
yum install -y epel-release yum-utils
yum install -y http://rpms.remirepo.net/enterprise/remi-release-7.rpm
yum-config-manager --enable remi-php81
yum install -y php php-pecl-opentelemetry

php --ri opentelemetry
```

{{% /tab %}} {{% tab "APK" %}}

```sh
#執筆時点では、PHP 8.1 がデフォルトの PHP バージョンでした。デフォルトが変更された場合は
#"php81" を変更する必要があるかもしれません。"apk add php<version>"（例: "apk add php83"）で
#PHP バージョンを選択することもできます。
echo "@testing https://dl-cdn.alpinelinux.org/alpine/edge/testing" >> /etc/apk/repositories
apk add php php81-pecl-opentelemetry@testing
php --ri opentelemetry
```

{{% /tab %}} {{< /tabpane >}}

### PECL {#pecl}

1. 開発環境のセットアップ。
   ソースからインストールするには、適切な開発環境といくつかの依存関係が必要です。

   {{< tabpane text=true >}} {{% tab "Linux (apt)" %}}

   ```sh
   sudo apt-get install gcc make autoconf
   ```

   {{% /tab %}} {{% tab "macOS (homebrew)" %}}

   ```sh
   brew install gcc make autoconf
   ```

   {{% /tab %}} {{< /tabpane >}}

2. エクステンションのビルド/インストール。
   環境をセットアップしたら、エクステンションをインストールできます。

   {{< tabpane text=true >}} {{% tab pecl %}}

   ```sh
   pecl install opentelemetry
   ```

   {{% /tab %}} {{% tab pickle %}}

   ```sh
   php pickle.phar install opentelemetry
   ```

   {{% /tab %}} {{% tab "php-extension-installer (docker)" %}}

   ```sh
   install-php-extensions opentelemetry
   ```

   {{% /tab %}} {{< /tabpane >}}

3. `php.ini` ファイルにエクステンションを追加します。

   ```ini
   [opentelemetry]
   extension=opentelemetry.so
   ```

4. エクステンションがインストールされ、有効になっていることを確認します。

   ```sh
   php -m | grep opentelemetry
   ```

## SDK と計装ライブラリのインストール {#install-sdk-and-instrumentation-libraries}

エクステンションがインストールできたら、OpenTelemetry SDK と1つ以上の計装ライブラリをインストールします。

自動計装は、一般的に使用される多くの PHP ライブラリに対応しています。
完全なリストについては、[packagist の計装ライブラリ](https://packagist.org/search/?query=open-telemetry&tags=instrumentation)を参照してください。

ここでは、アプリケーションが Slim Framework と PSR-18 HTTP クライアントを使用しており、OTLP プロトコルでトレースをエクスポートすると仮定します。

その場合、SDK、エクスポーター、および Slim Framework と PSR-18 の自動計装パッケージをインストールします。

```shell
composer require \
    open-telemetry/sdk \
    open-telemetry/exporter-otlp \
    open-telemetry/opentelemetry-auto-slim \
    open-telemetry/opentelemetry-auto-psr18
```

## 設定 {#configuration}

OpenTelemetry SDK と組み合わせて使用する場合、環境変数または `php.ini` ファイルで自動計装を設定できます。

### 環境変数による設定 {#environment-configuration}

```sh
OTEL_PHP_AUTOLOAD_ENABLED=true \
OTEL_SERVICE_NAME=your-service-name \
OTEL_TRACES_EXPORTER=otlp \
OTEL_EXPORTER_OTLP_PROTOCOL=http/protobuf \
OTEL_EXPORTER_OTLP_ENDPOINT=http://collector:4318 \
OTEL_PROPAGATORS=baggage,tracecontext \
php myapp.php
```

### php.ini による設定 {#phpini-configuration}

以下を `php.ini`、または PHP が処理する別の `ini` ファイルに追記します。

```ini
OTEL_PHP_AUTOLOAD_ENABLED="true"
OTEL_SERVICE_NAME=your-service-name
OTEL_TRACES_EXPORTER=otlp
OTEL_EXPORTER_OTLP_PROTOCOL=http/protobuf
OTEL_EXPORTER_OTLP_ENDPOINT=http://collector:4318
OTEL_PROPAGATORS=baggage,tracecontext
```

## アプリケーションの実行 {#run-your-application}

上記のすべてをインストールして設定したら、通常どおりアプリケーションを起動します。

OpenTelemetry Collector にエクスポートされるトレースは、インストールした計装ライブラリと、アプリケーション内で実行されたコードパスに依存します。
前の例では、Slim Framework と PSR-18 の計装ライブラリを使用しているため、以下のようなスパンが表示されるはずです。

- HTTP トランザクションを表すルートスパン
- 実行されたアクションのスパン
- PSR-18 クライアントが送信した各 HTTP トランザクションのスパン

PSR-18 クライアントの計装は、送信する HTTP リクエストに[分散トレーシング](/docs/concepts/context-propagation/#propagation)ヘッダーを付与します。

## 仕組み {#how-it-works}

> [!NOTE] Optional
>
> すぐに使い始めたいだけで、アプリケーションに適した計装ライブラリがある場合は、このセクションをスキップできます。

このエクステンションは、PHP コードとしてオブザーバー関数をクラスやメソッドに登録し、対象のメソッドの実行前後にそれらの関数を実行します。

フレームワークやアプリケーション向けの計装ライブラリがない場合は、自分で作成できます。
以下の例では、計装対象のコードを示し、OpenTelemetry エクステンションを使用してそのコードの実行をトレースする方法を説明します。

```php
<?php

use OpenTelemetry\API\Instrumentation\CachedInstrumentation;
use OpenTelemetry\API\Trace\Span;
use OpenTelemetry\API\Trace\StatusCode;
use OpenTelemetry\Context\Context;

require 'vendor/autoload.php';

/* 計装対象のクラス */
class DemoClass
{
    public function run(): void
    {
        echo 'Hello, world';
    }
}

/* 自動計装コード */
OpenTelemetry\Instrumentation\hook(
    class: DemoClass::class,
    function: 'run',
    pre: static function (DemoClass $demo, array $params, string $class, string $function, ?string $filename, ?int $lineno) {
        static $instrumentation;
        $instrumentation ??= new CachedInstrumentation('example');
        $span = $instrumentation->tracer()->spanBuilder('democlass-run')->startSpan();
        Context::storage()->attach($span->storeInContext(Context::getCurrent()));
    },
    post: static function (DemoClass $demo, array $params, $returnValue, ?Throwable $exception) {
        $scope = Context::storage()->scope();
        $scope->detach();
        $span = Span::fromContext($scope->context());
        if ($exception) {
            $span->recordException($exception);
            $span->setStatus(StatusCode::STATUS_ERROR);
        }
        $span->end();
    }
);

/* 計装済みのコードを実行し、トレースを生成する */
$demo = new DemoClass();
$demo->run();
```

この例では `DemoClass` を定義し、その `run` メソッドに `pre` と `post` のフック関数を登録しています。
フック関数は `DemoClass::run()` メソッドの各実行の前後に実行されます。
`pre` 関数はスパンを開始してアクティブにし、`post` 関数はスパンを終了します。

`DemoClass::run()` が例外をスローした場合、`post` 関数は例外の伝搬に影響を与えずに例外を記録します。

## 次のステップ {#next-steps}

アプリやサービスの自動計装を設定したら、カスタムのテレメトリーデータを収集するために[手動計装](/docs/languages/php/instrumentation)を追加することもできます。

その他の例については、[opentelemetry-php-contrib/examples](https://github.com/open-telemetry/opentelemetry-php-contrib/tree/main/examples) を参照してください。
