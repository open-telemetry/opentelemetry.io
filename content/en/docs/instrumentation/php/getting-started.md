---
title: Getting Started
description: Get up and running with OpenTelemetry for PHP.
aliases: [/docs/instrumentation/php/getting_started]
weight: 10
spelling: cSpell:ignore Wordpress Symfony Laravel rolldice autoload strval PECL
spelling: cSpell:ignore darwin
---

This page will show you how to get started with OpenTelemetry in PHP.

You will learn how you can instrument a simple PHP application automatically, in
such a way that [traces][], [metrics][] and [logs][] are emitted to the console.

## Prerequisites

Ensure that you have the following installed locally: open source

- [PHP 8.0+](https://www.php.net/)
- [PECL](https://pecl.php.net/)
- [composer](https://getcomposer.org/)

Before you get started make sure that you have both available in your shell:

```sh
php -v
composer -v
```

{{% alert title="Important" color="warning" %}}While OpenTelemetry PHP is in a pre-GA state,
please ensure you set `minimum-stability` to `beta` in `composer.json`, otherwise you will get the early `0.x`
versions of many of our packages.{{% /alert %}}

## Example Application

The following example uses a basic [Slim](https://www.slimframework.com/)
application. If you are not using Slim, that's ok — you can use OpenTelemetry
PHP with other web frameworks as well, such as Wordpress, Symfony and Laravel.
For a complete list of libraries for supported frameworks, see the
[registry](/ecosystem/registry/?component=instrumentation&language=php).

### Dependencies

In an empty directory initialize a minimal `composer.json` file in your
directory:

```sh
composer init \
  --no-interaction \
  --stability beta \
  --require slim/slim:"^4" \
  --require slim/psr7:"^1"
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

$app->get('/rolldice', function (Request $request, Response $response, $args) {
    $response->getBody()->write(strval(random_int(1,6)));
    return $response;
});

$app->run();

```

Run the application with the following command and open
<http://localhost:8080/rolldice> in your web browser to ensure it is working.

```sh
php -S localhost:8080
```

## Instrumentation

Next, you’ll use the OpenTelemetry PHP extension to
[automatically instrument](../automatic) the application at launch time.

1. Since the extension is built from source, you need to setup some build tools

   {{< tabpane lang=shell persistLang=false >}}

   {{< tab "Linux (apt)" >}}sudo apt-get install gcc make autoconf{{< /tab >}}

   {{< tab "MacOS (homebrew)" >}}brew install gcc make autoconf{{< /tab >}}

   {{< /tabpane >}}

2. Build the extension with `PECL`:

   ```sh
   pecl install opentelemetry-beta
   ```

   {{% alert title="Note" color="warning" %}}If you want to pickle or the
   docker-specific use php-extension-installer to build/install the extension,
   [read the instructions here](../automatic). {{% /alert %}}

3. Add the extension to your `php.ini` file:

   ```ini
   [opentelemetry]
   extension=opentelemetry.so
   ```

4. Verify that the extension is installed and enabled:

   ```sh
   php -m | grep opentelemetry
   ```

5. Add additional dependencies to your application, which are required for the
   automatic instrumentation of your code:

   ```sh
   composer config allow-plugins.php-http/discovery true
   composer require php-http/guzzle7-adapter open-telemetry/sdk open-telemetry/opentelemetry-auto-slim
   ```

With the OpenTelemetry PHP extension set up you can now run your application and
automatically instrument it at launch time:

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

## What's next?

For more:

- Run this example with another [exporter][] for telemetry data.
- Try [automatic instrumentation](../automatic/) on one of your own apps.
- Learn about [manual instrumentation][] and try out more
  [examples](/docs/instrumentation/java/examples/).

[traces]: /docs/concepts/signals/traces/
[metrics]: /docs/concepts/signals/metrics/
[logs]: /docs/concepts/signals/logs/
[exporter]:
  https://github.com/open-telemetry/opentelemetry-java/blob/main/sdk-extensions/autoconfigure/README.md#exporters
[manual instrumentation]: ../manual
