---
title: PHP zero-code instrumentation
linkTitle: PHP
weight: 30
aliases: [/docs/languages/php/automatic]
cSpell:ignore: centos democlass epel myapp pecl phar remi
---

## Requirements

Automatic instrumentation with PHP requires:

- PHP 8.0 or higher
- [OpenTelemetry PHP extension](https://github.com/open-telemetry/opentelemetry-php-instrumentation)
- [Composer autoloading](https://getcomposer.org/doc/01-basic-usage.md#autoloading)
- [OpenTelemetry SDK](https://packagist.org/packages/open-telemetry/sdk)
- One or more
  [instrumentation libraries](/ecosystem/registry/?component=instrumentation&language=php)
- [Configuration](#configuration)

## Install the OpenTelemetry extension

{{% alert title="Important" color="warning" %}}Installing the OpenTelemetry
extension by itself does not generate traces. {{% /alert %}}

The extension can be installed via pecl,
[pickle](https://github.com/FriendsOfPHP/pickle) or
[php-extension-installer](https://github.com/mlocati/docker-php-extension-installer)
(docker specific). There are also packaged versions of the extension available
for some Linux package managers.

### Linux packages

RPM and APK packages are provided by the following:

- [Remi repository](https://blog.remirepo.net/pages/PECL-extensions-RPM-status) -
  RPM
- [Alpine Linux](https://pkgs.alpinelinux.org/packages?name=*pecl-opentelemetry) -
  APK (currently in the
  [_testing_ branch](https://wiki.alpinelinux.org/wiki/Repositories#Testing))

{{< tabpane text=true >}} {{% tab "RPM" %}}

```sh
#this example is for CentOS 7. The PHP version can be changed by
#enabling remi-<version>, eg "yum config-manager --enable remi-php83"
yum update -y
yum install -y epel-release yum-utils
yum install -y http://rpms.remirepo.net/enterprise/remi-release-7.rpm
yum-config-manager --enable remi-php81
yum install -y php php-pecl-opentelemetry

php --ri opentelemetry
```

{{% /tab %}} {{% tab "APK" %}}

```sh
#At the time of writing, PHP 8.1 was the default PHP version. You may need to
#change "php81" if the default changes. You can alternatively choose a PHP
#version with "apk add php<version>", eg "apk add php83".
echo "@testing https://dl-cdn.alpinelinux.org/alpine/edge/testing" >> /etc/apk/repositories
apk add php php81-pecl-opentelemetry@testing
php --ri opentelemetry
```

{{% /tab %}} {{< /tabpane >}}

### PECL

1. Setup development environment. Installing from source requires proper
   development environment and some dependencies:

   {{< tabpane text=true >}} {{% tab "Linux (apt)" %}}

   ```sh
   sudo apt-get install gcc make autoconf
   ```

   {{% /tab %}} {{% tab "macOS (homebrew)" %}}

   ```sh
   brew install gcc make autoconf
   ```

   {{% /tab %}} {{< /tabpane >}}

2. Build/install the extension. With your environment set up you can install the
   extension:

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

3. Add the extension to your `php.ini` file:

   ```ini
   [opentelemetry]
   extension=opentelemetry.so
   ```

4. Verify that the extension is installed and enabled:

   ```sh
   php -m | grep opentelemetry
   ```

## Install SDK and instrumentation libraries

Now that the extension is installed, install the OpenTelemetry SDK and one or
more instrumentation libraries.

Automatic instrumentation is available for a number commonly used PHP libraries.
For the full list, see
[instrumentation libraries on packagist](https://packagist.org/search/?query=open-telemetry&tags=instrumentation).

Let's assume that your application uses Slim Framework and a PSR-18 HTTP client,
and that we will export the traces with the OTLP protocol.

You would then install the SDK, an exporter, and auto-instrumentation packages
for Slim Framework and PSR-18:

```shell
composer require \
    open-telemetry/sdk \
    open-telemetry/exporter-otlp \
    open-telemetry/opentelemetry-auto-slim \
    open-telemetry/opentelemetry-auto-psr18
```

## Configuration

When used in conjunction with the OpenTelemetry SDK, you can use environment
variables or the `php.ini` file to configure auto-instrumentation.

### Environment configuration

```sh
OTEL_PHP_AUTOLOAD_ENABLED=true \
OTEL_SERVICE_NAME=your-service-name \
OTEL_TRACES_EXPORTER=otlp \
OTEL_EXPORTER_OTLP_PROTOCOL=http/protobuf \
OTEL_EXPORTER_OTLP_ENDPOINT=http://collector:4318 \
OTEL_PROPAGATORS=baggage,tracecontext \
php myapp.php
```

### php.ini configuration

Append the following to `php.ini`, or another `ini` file that will be processed
by PHP:

```ini
OTEL_PHP_AUTOLOAD_ENABLED="true"
OTEL_SERVICE_NAME=your-service-name
OTEL_TRACES_EXPORTER=otlp
OTEL_EXPORTER_OTLP_PROTOCOL=http/protobuf
OTEL_EXPORTER_OTLP_ENDPOINT=http://collector:4318
OTEL_PROPAGATORS=baggage,tracecontext
```

## Run your application

After all of the above is installed and configured, start your application as
you normally would.

The traces you see exported to the OpenTelemetry Collector depend on the
instrumentation libraries you have installed, and the code path that was taken
inside the application. In the previous example, using Slim Framework and PSR-18
instrumentation libraries, you should expect to see spans such as:

- A root span representing the HTTP transaction
- A span for the action that was executed
- A span for each HTTP transaction that the PSR-18 client sent

Note that the PSR-18 client instrumentation appends
[distributed tracing](/docs/concepts/context-propagation/#propagation) headers
to outgoing HTTP requests.

## How it works

{{% alert title="Optional" color="info" %}} You can skip over this section if
you just want to get up and running quickly, and there are suitable
instrumentation libraries for your application. {{% /alert %}}

The extension enables registering observer functions as PHP code against classes
and methods, and executing those functions before and after the observed method
runs.

If there is not an instrumentation library for your framework or application,
you can write your own. The following example provides some code to be
instrumented, and then illustrates how to use the OpenTelemetry extension to
trace the execution of that code.

```php
<?php

use OpenTelemetry\API\Instrumentation\CachedInstrumentation;
use OpenTelemetry\API\Trace\Span;
use OpenTelemetry\API\Trace\StatusCode;
use OpenTelemetry\Context\Context;

require 'vendor/autoload.php';

/* The class to be instrumented */
class DemoClass
{
    public function run(): void
    {
        echo 'Hello, world';
    }
}

/* The auto-instrumentation code */
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

/* Run the instrumented code, which will generate a trace */
$demo = new DemoClass();
$demo->run();
```

The previous example defines `DemoClass`, then registers `pre` and `post` hook
functions on its `run` method. The hook functions run before and after each
execution of the `DemoClass::run()` method. The `pre` function starts and
activates a span, while the `post` function ends it.

If `DemoClass::run()` throws an exception, the `post` function records it
without affecting exception propagation.

## Next steps

After you have automatic instrumentation configured for your app or service, you
might want to add [manual instrumentation](/docs/languages/php/instrumentation)
to collect custom telemetry data.

For more examples, see
[opentelemetry-php-contrib/examples](https://github.com/open-telemetry/opentelemetry-php-contrib/tree/main/examples).
