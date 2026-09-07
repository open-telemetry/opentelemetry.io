---
title: Supported Technologies
description: >-
  Supported PHP versions, SAPIs, operating systems, frameworks, and libraries
  for OpenTelemetry PHP Distro.
weight: 2
cSpell:ignore: apk httplug musl mysqli psr
---

OpenTelemetry PHP Distro is a distribution of OpenTelemetry PHP. It inherits
OpenTelemetry compatibility and extends runtime features with native components.

## Auto-instrumentation scope

Auto-instrumentation captures telemetry for supported frameworks and libraries,
but it does not instrument:

- Proprietary or custom framework internals
- Closed-source components without instrumentation hooks
- Application-specific business logic

For unsupported areas, use manual OpenTelemetry instrumentation.

## PHP versions

Supported PHP versions: `8.1` to `8.5`.

## Supported SAPIs

- `php-cli`
- `php-fpm`
- `php-cgi`/`fcgi`
- `mod_php` (prefork)

## Supported operating systems

- Linux
  - Architectures: `x86_64`, `arm64`
  - glibc-based systems: `deb`, `rpm`
  - musl-based systems (Alpine): `apk`

## Instrumented frameworks

- Laravel `6.x` to `13.x`
- Slim `4.x`

## Instrumented libraries

- cURL
- HTTP async (`php-http/httplug`)
- MySQLi
- PDO
- PostgreSQL
- PSR-18 HTTP Client (`psr/http-client`)

## Included auto-instrumentation packages

| Name                | Included from distro version | Package                                                                                                                     |
| ------------------- | ---------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `curl`              | 1.0                          | [open-telemetry/opentelemetry-auto-curl](https://packagist.org/packages/open-telemetry/opentelemetry-auto-curl)             |
| `http-async-client` | 1.0                          | [open-telemetry/opentelemetry-auto-http-async](https://packagist.org/packages/open-telemetry/opentelemetry-auto-http-async) |
| `laravel`           | 1.0                          | [open-telemetry/opentelemetry-auto-laravel](https://packagist.org/packages/open-telemetry/opentelemetry-auto-laravel)       |
| `mysqli`            | 1.0                          | [open-telemetry/opentelemetry-auto-mysqli](https://packagist.org/packages/open-telemetry/opentelemetry-auto-mysqli)         |
| `pdo`               | 1.0                          | [open-telemetry/opentelemetry-auto-pdo](https://packagist.org/packages/open-telemetry/opentelemetry-auto-pdo)               |
| `postgresql`        | 1.2                          | [open-telemetry/opentelemetry-auto-postgresql](https://packagist.org/packages/open-telemetry/opentelemetry-auto-postgresql) |
| `psr18`             | 0.5                          | [open-telemetry/opentelemetry-auto-psr18](https://packagist.org/packages/open-telemetry/opentelemetry-auto-psr18)           |
| `slim`              | 1.0                          | [open-telemetry/opentelemetry-auto-slim](https://packagist.org/packages/open-telemetry/opentelemetry-auto-slim)             |

## Included metrics packages

| Included from distro version | Package                                                                                                                     | Emitted metrics                          |
| ---------------------------- | --------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------- |
| 0.6.0                        | [open-telemetry/opentelemetry-metrics-runtime](https://packagist.org/packages/open-telemetry/opentelemetry-metrics-runtime) | PHP memory usage, GC cycles, peak memory |

## Additional runtime features

- Automatic root span creation
- Root span URL grouping
- Inferred spans
- [Attribute-based instrumentation](/docs/zero-code/php/distro/reference/attribute-instrumentation/)
  (`#[WithSpan]`, `#[SpanAttribute]`)
- Background telemetry sending
- PHP runtime metrics (memory, GC — exported automatically via the native async
  transport)

Background sending (non-blocking export) works with OTLP `http/protobuf`
(default). If the exporter or protocol is changed to an unsupported transport
(for example gRPC), export becomes synchronous.
