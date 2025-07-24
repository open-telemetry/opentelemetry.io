---
title: PHP 零代码插桩
linkTitle: PHP
weight: 30
aliases: [/docs/languages/php/automatic]
default_lang_commit: 179f03bf118e1e8a3cc195ab56fc09d85c476394
cSpell:ignore: centos democlass epel myapp pecl phar remi
---

## 前置条件 {#requirements}

使用 PHP 进行自动插桩需要满足以下条件：

- PHP 8.0 或更高版本
- [OpenTelemetry PHP 扩展](https://github.com/open-telemetry/opentelemetry-php-instrumentation)
- [Composer 自动加载](https://getcomposer.org/doc/01-basic-usage.md#autoloading)
- [OpenTelemetry SDK](https://packagist.org/packages/open-telemetry/sdk)
- 一个或多个[插桩库](/ecosystem/registry/?component=instrumentation&language=php)
- [配置方法](#configuration)

## 安装 OpenTelemetry 扩展 {#install-the-opentelemetry-extension}

{{% alert title="重要" color="warning" %}}仅安装 OpenTelemetry 扩展本身不会生成链路数据。{{% /alert %}}

该扩展可以通过 pecl、[pickle](https://github.com/FriendsOfPHP/pickle)、
[PIE](https://github.com/php/pie) 或
[php-extension-installer](https://github.com/mlocati/docker-php-extension-installer)
（Docker 专用）进行安装。一些 Linux 软件包管理器也提供了预构建版本。

### Linux 软件包 {#linux-packages}

以下渠道提供 RPM 和 APK 包：

- [Remi 仓库](https://blog.remirepo.net/pages/PECL-extensions-RPM-status) - RPM 包
- [Alpine Linux](https://pkgs.alpinelinux.org/packages?name=*pecl-opentelemetry) - APK
  包（目前在 [_testing_ 分支](https://wiki.alpinelinux.org/wiki/Repositories#Testing)）

{{< tabpane text=true >}} {{% tab "RPM" %}}

```sh
# 以下示例基于 CentOS 7。PHP 版本可通过启用 remi-<version> 来切换，例如：
# "yum config-manager --enable remi-php83"
yum update -y
yum install -y epel-release yum-utils
yum install -y http://rpms.remirepo.net/enterprise/remi-release-7.rpm
yum-config-manager --enable remi-php81
yum install -y php php-pecl-opentelemetry

php --ri opentelemetry
```

{{% /tab %}} {{% tab "APK" %}}

```sh
# 截至撰写时，默认 PHP 版本为 8.1。如默认版本变更，可自行替换 php81；
# 也可以使用 "apk add php<version>" 选择其他版本，例如 "apk add php83"。
echo "@testing https://dl-cdn.alpinelinux.org/alpine/edge/testing" >> /etc/apk/repositories
apk add php php81-pecl-opentelemetry@testing
php --ri opentelemetry
```

{{% /tab %}} {{< /tabpane >}}

### PECL

1. 设置开发环境。源码安装需要配置好开发环境并安装依赖项：

   {{< tabpane text=true >}} {{% tab "Linux (apt)" %}}

   ```sh
   sudo apt-get install gcc make autoconf
   ```

   {{% /tab %}} {{% tab "macOS (homebrew)" %}}

   ```sh
   brew install gcc make autoconf
   ```

   {{% /tab %}} {{< /tabpane >}}

2. 构建并安装扩展。在准备好开发环境后，使用以下命令安装扩展：

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

3. 将扩展添加到 `php.ini` 文件中：

   ```ini
   [opentelemetry]
   extension=opentelemetry.so
   ```

4. 验证扩展是否安装成功并已启用：

   ```sh
   php -m | grep opentelemetry
   ```

## 安装 SDK 和插桩库 {#install-sdk-and-instrumentation-libraries}

在安装完扩展后，你需要安装 OpenTelemetry SDK 和一个或多个插桩库。

PHP 常用库的自动插桩已被支持。完整列表请查阅
[packagist 网站上的插桩库](https://packagist.org/search/?query=open-telemetry&tags=instrumentation)。

假设你的应用使用 Slim Framework 和 PSR-18 HTTP 客户端，并希望使用 OTLP 协议导出链路数据。

你可以安装以下软件包：

```shell
composer require \
    open-telemetry/sdk \
    open-telemetry/exporter-otlp \
    open-telemetry/opentelemetry-auto-slim \
    open-telemetry/opentelemetry-auto-psr18
```

## 配置 {#configuration}

配合 OpenTelemetry SDK 使用时，你可以通过环境变量或 `php.ini` 文件来配置自动插桩行为。

### 环境配置 {#environment-configuration}

```sh
OTEL_PHP_AUTOLOAD_ENABLED=true \
OTEL_SERVICE_NAME=your-service-name \
OTEL_TRACES_EXPORTER=otlp \
OTEL_EXPORTER_OTLP_PROTOCOL=http/protobuf \
OTEL_EXPORTER_OTLP_ENDPOINT=http://collector:4318 \
OTEL_PROPAGATORS=baggage,tracecontext \
php myapp.php
```

### php.ini 配置 {#phpini-configuration}

将以下内容追加到 `php.ini` 或其他会被 PHP 处理的 ini 文件中：

```ini
OTEL_PHP_AUTOLOAD_ENABLED="true"
OTEL_SERVICE_NAME=your-service-name
OTEL_TRACES_EXPORTER=otlp
OTEL_EXPORTER_OTLP_PROTOCOL=http/protobuf
OTEL_EXPORTER_OTLP_ENDPOINT=http://collector:4318
OTEL_PROPAGATORS=baggage,tracecontext
```

## 运行你的应用 {#run-your-application}

在完成上述安装和配置后，像往常一样运行你的应用即可。

你看到的链路数据取决于你安装的插桩库以及程序运行时的代码路径。以
Slim Framework 和 PSR-18 插桩库为例，你应能看到如下 Span：

- 表示 HTTP 事务的根 Span
- 表示执行操作的 Span
- 每个 PSR-18 客户端发出的 HTTP 请求的 Span

请注意，PSR-18 客户端的插桩会自动为出站 HTTP
请求添加[分布式追踪](/docs/concepts/context-propagation/#propagation)相关的标头。

## 工作原理 {#how-it-works}

{{% alert title="可选" %}}如果你只想快速开始，并且已有合适的插桩库可用，可以跳过本节。{{% /alert %}}

该扩展支持注册观察函数，用于观察某些类和方法，并在方法执行前后运行这些函数。

如果你的框架或应用没有可用的插桩库，也可以自定义编写。以下是一个示例，
包括待插桩代码，以及如何使用 OpenTelemetry 扩展对其进行追踪：

```php
<?php

use OpenTelemetry\API\Instrumentation\CachedInstrumentation;
use OpenTelemetry\API\Trace\Span;
use OpenTelemetry\API\Trace\StatusCode;
use OpenTelemetry\Context\Context;

require 'vendor/autoload.php';

/* 待插桩类 */
class DemoClass
{
    public function run(): void
    {
        echo 'Hello, world';
    }
}

/* 自动插桩逻辑 */
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

/* 运行已插桩代码，生成链路*/
$demo = new DemoClass();
$demo->run();
```

上述示例定义了 `DemoClass`，并为其 `run` 方法注册了 `pre` 和 `post` 钩子。
钩子会在每次方法执行前后运行，`pre` 函数启动 Span，`post` 函数结束 Span。

如果 `DemoClass::run()` 抛出异常，`post` 函数会记录异常，但不会干扰异常传播机制。

## 后续步骤 {#next-steps}

完成应用或服务的自动插桩后，
你可能还希望引入[手动插桩](/docs/languages/php/instrumentation)以收集自定义遥测数据。

更多示例可参考
[opentelemetry-php-contrib/examples](https://github.com/open-telemetry/opentelemetry-php-contrib/tree/main/examples)。
