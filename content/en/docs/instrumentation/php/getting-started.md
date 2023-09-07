---
title: Getting Started
description: Get up and running with OpenTelemetry for PHP.
aliases: [/docs/instrumentation/php/getting_started]
weight: 10
# prettier-ignore
cSpell:ignore: darwin Laravel myapp PECL pecl rolldice strval Symfony Wordpress
---

OpenTelemetry for PHP can be used to generate and export [traces][], [metrics][]
and [logs][].

This page will show you how to get started with OpenTelemetry in PHP. We will
create a simple "roll the dice" application, then apply both automatic and
manual instrumentation to generate [traces][] and export them to the console. We
will then emit some [logs][] which will also be sent to the console.

## Prerequisites

OpenTelemetry requires PHP 8.0+ for automatic instrumentation, however manual
instrumentation will work with PHP 7.4

Ensure that you have the following installed:

- [PHP 8.0+](https://www.php.net/)
- [PECL](https://pecl.php.net/)
- [composer](https://getcomposer.org/)

Before you get started make sure that you have both available in your shell:

```sh
php -v
composer -v
```

{{% alert title="Important" color="warning" %}}While OpenTelemetry PHP is in a
pre-GA state, please ensure you set `minimum-stability` to `RC` in
`composer.json`, otherwise you will get the early `0.x` versions of many of our
packages.{{% /alert %}}

## Example Application

The following example uses a basic
[Slim Framework](https://www.slimframework.com/) application. If you are not
using Slim, that's OK — you can use OpenTelemetry PHP with other web frameworks
as well, such as WordPress, Symfony and Laravel. For a complete list of
libraries for supported frameworks, see the
[registry](/ecosystem/registry/?component=instrumentation&language=php).

### Dependencies

In an empty directory initialize a minimal `composer.json` file:

```sh
composer init \
  --no-interaction \
  --stability beta \
  --require slim/slim:"^4" \
  --require slim/psr7:"^1"
composer update
```

### Create and launch an HTTP Server

In that same directory, create a file called `index.php` with the following
content:

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

Run the application using the PHP built-in web server:

```shell
php -S localhost:8080
```

Open <http://localhost:8080/rolldice> in your web browser to ensure it is
working.

## Add automatic instrumentation

Next, you’ll use the OpenTelemetry PHP extension to
[automatically instrument](../automatic/) the application.

1. Since the extension is built from source, you need to install some build
   tools

   {{< tabpane text=true >}} {{% tab "Linux (apt)" %}}

   ```sh
   sudo apt-get install gcc make autoconf
   ```

   {{% /tab %}} {{% tab "macOS (homebrew)" %}}

   ```sh
   brew install gcc make autoconf
   ```

   {{% /tab %}} {{< /tabpane >}}

2. Build the extension with `PECL`:

   ```sh
   pecl install opentelemetry-rc
   ```

   {{% alert title="Note" color="warning" %}}Alternative methods of installing
   the extension are detailed in
   [automatic instrumentation](../automatic/#installation). {{% /alert %}}

3. Add the extension to your `php.ini` file:

   ```ini
   [opentelemetry]
   extension=opentelemetry.so
   ```

4. Verify that the extension is installed and enabled:

   ```sh
   php --ri opentelemetry
   ```

5. Add additional dependencies to your application, which are required for the
   automatic instrumentation of your code:

   ```sh
   composer config allow-plugins.php-http/discovery false
   composer require \
     open-telemetry/sdk \
     open-telemetry/opentelemetry-auto-slim
   ```

With the OpenTelemetry PHP extension set up and an auto-instrumentation package
installed, you can now run your application and generate some traces:

```sh
env OTEL_PHP_AUTOLOAD_ENABLED=true \
    OTEL_TRACES_EXPORTER=console \
    OTEL_METRICS_EXPORTER=none \
    OTEL_LOGS_EXPORTER=none \
    php -S localhost:8080
```

Open <http://localhost:8080/rolldice> in your web browser and reload the page a
few times. After a while you should see the spans printed to your console:

<details>
<summary>View example output</summary>

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

## Add manual instrumentation

### Traces

Manual tracing requires a `TracerProvider`. There are a number of ways to set
one up. In this example we will use the autoloaded TracerProvider, which is
globally available.

Replace `index.php` with the following code:

```php
<?php

use OpenTelemetry\API\Common\Instrumentation\Globals;
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

Start the built-in web server again, and browse to
<http://localhost:8080/rolldice>. You should see similar output, but with the
addition of a new span named `manual-span`.

Note that the manual span's `parent_span_id` contains the same value as the
"{closure}" span's `context.span_id`. Manual and automatic instrumentation work
well together, since under the hood they use the same APIs.

### Logging

Now let's add some logging. We will use the popular `monolog` logging library to
do this, via a handler which will emit the logs in the OpenTelemetry format.

First, let's install some more dependencies:

```shell
composer require \
  monolog/monolog \
  open-telemetry/opentelemetry-logger-monolog
```

Replace the `index.php` file with the following code:

```php
<?php

use Monolog\Logger;
use OpenTelemetry\API\Common\Instrumentation\Globals;
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

Start the built-in web server with the following command (note the change to
`OTEL_LOGS_EXPORTER`):

```shell
env OTEL_PHP_AUTOLOAD_ENABLED=true \
    OTEL_TRACES_EXPORTER=console \
    OTEL_METRICS_EXPORTER=none \
    OTEL_LOGS_EXPORTER=console \
    php -S localhost:8080
```

This time when browsing to <http://localhost:8080/rolldice> you should see the
automatic instrumentation traces as before, and also a log record which was
generated from the monolog handler.

Note that `trace_id` and `span_id` were added to the log output, and that the
values correspond to the active span at the time the log message was generated.

<details>
<summary>View example output</summary>

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

## What's next?

For more:

- Run this example with another [exporter][] for telemetry data.
- Try [automatic instrumentation](../automatic/) on one of your own apps.
- Learn more about [manual instrumentation][] and try out some
  [examples](/docs/instrumentation/php/examples/).
- Take a look at the [OpenTelemetry Demo](/docs/demo/), which includes the PHP
  based [Quote Service](/docs/demo/services/quote/).

[traces]: /docs/concepts/signals/traces/
[metrics]: /docs/concepts/signals/metrics/
[logs]: /docs/concepts/signals/logs/
[exporter]: ../exporters/
[manual instrumentation]: ../manual/
