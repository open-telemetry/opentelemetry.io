---
title: PHP
description: >-
  <img width="35" class="img-initial" src="/img/logos/32x32/PHP.svg" alt="PHP">
  A language-specific implementation of OpenTelemetry in PHP.
weight: 21
cSpell:ignore: autoload mbstring opcache packagist symfony zend
---

{{% docs/instrumentation/index-intro php /%}}

## Further Reading

- [OpenTelemetry for PHP on GitHub](https://github.com/open-telemetry/opentelemetry-php)
- [Installation](https://github.com/open-telemetry/opentelemetry-php#installation)
- [Examples](https://github.com/open-telemetry/opentelemetry-php/tree/main/examples)

## Requirements

OpenTelemetry for PHP requires a minimum PHP version of 7.4, and
auto-instrumentation requires version 8.0+.

### Dependencies

Some of the `SDK` and `Contrib` packages have a dependency on both a
[HTTP Factories (PSR-17)](https://www.php-fig.org/psr/psr-17/) and a
[php-http/async-client](https://docs.php-http.org/en/latest/clients.html)
implementation. You can find appropriate composer packages implementing given
standards on [packagist.org](https://packagist.org/).

See
[http-factory-implementations](https://packagist.org/providers/psr/http-factory-implementation)
to find a `PSR-17 (HTTP factories)` implementation, and
[async-client-implementations](https://packagist.org/providers/php-http/async-client-implementation)
to find a `php-http/async-client` implementation.

### Optional PHP extensions

| Extension                                                                 | Purpose                                                           |
| ------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| [ext-grpc](https://github.com/grpc/grpc/tree/master/src/php)              | Required to use gRPC as a transport for the OTLP exporter         |
| [ext-mbstring](https://www.php.net/manual/en/book.mbstring.php)           | More performant than the fallback, `symfony/polyfill-mbstring`    |
| [ext-zlib](https://www.php.net/manual/en/book.zlib.php)                   | If you want to compress exported data                             |
| [ext-ffi](https://www.php.net/manual/en/book.ffi.php)                     | Fiber-based context storage                                       |
| [ext-protobuf](https://github.com/protocolbuffers/protobuf/tree/main/php) | _Significant_ performance improvement for otlp+protobuf exporting |

#### ext-ffi

Fibers support can be enabled by setting the `OTEL_PHP_FIBERS_ENABLED`
environment variable to `true`. Using fibers with non-`CLI` SAPIs may require
preloading of bindings. One way to achieve this is setting
[`ffi.preload`](https://www.php.net/manual/en/ffi.configuration.php#ini.ffi.preload)
to `src/Context/fiber/zend_observer_fiber.h` and setting
[`opcache.preload`](https://www.php.net/manual/en/opcache.preloading.php) to
`vendor/autoload.php`.

#### ext-protobuf

The [native protobuf library](https://packagist.org/packages/google/protobuf) is
significantly slower than the extension. We strongly encourage the use of the
extension.

## Setup

OpenTelemetry for PHP is distributed via
[packagist](https://packagist.org/packages/open-telemetry/), in a number of
packages. We recommend that you install only the packages that you need, which
as a minimum is usually `API`, `Context`, `SDK` and an exporter.

We strongly encourage that your code only depend on classes and interfaces in
the `API` package.
