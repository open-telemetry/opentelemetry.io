---
title: Attribute-based Instrumentation
description: >-
  Automatically create spans using PHP 8 attributes with OpenTelemetry PHP
  Distro.
weight: 4
cSpell:ignore: SpanAttribute WithSpan
---

OpenTelemetry PHP Distro supports automatic span creation using PHP 8
attributes. Annotate methods or functions with `#[WithSpan]` to create spans
without writing instrumentation code manually.

## Prerequisites

- PHP 8.0 or later (PHP attributes require PHP 8+).
- `open-telemetry/api` package installed in your application.
- `OTEL_PHP_ATTR_HOOKS_ENABLED=true` set in the environment (disabled by
  default).

## Enable

```sh
export OTEL_PHP_ATTR_HOOKS_ENABLED=true
```

Or in `php.ini`:

```ini
opentelemetry_distro.attr_hooks_enabled=true
```

## Basic usage

```php
use OpenTelemetry\API\Instrumentation\WithSpan;

class OrderService
{
    #[WithSpan]
    public function processOrder(int $orderId): string
    {
        // A span named "OrderService::processOrder" is created automatically.
        return "processed-{$orderId}";
    }
}
```

## `#[WithSpan]` options

```php
#[WithSpan(
    span_name: 'custom.span.name',          // default: "ClassName::methodName"
    span_kind: SpanKind::KIND_SERVER,        // default: KIND_INTERNAL
    attributes: ['key' => 'value'],          // static attributes added to the span
)]
```

All arguments are optional and can be passed positionally or by name:

```php
// Positional
#[WithSpan('payment.charge', SpanKind::KIND_CLIENT, ['db.system' => 'redis'])]

// Named — any subset
#[WithSpan(span_kind: SpanKind::KIND_PRODUCER)]
#[WithSpan(span_name: 'message.publish', span_kind: SpanKind::KIND_PRODUCER)]
```

## Capturing parameter values with `#[SpanAttribute]`

Add `#[SpanAttribute]` to function parameters to include their runtime values as
span attributes:

```php
use OpenTelemetry\API\Instrumentation\WithSpan;
use OpenTelemetry\API\Instrumentation\SpanAttribute;

class UserService
{
    #[WithSpan]
    public function createUser(
        #[SpanAttribute] string $username,               // attribute key = "username"
        string                  $password,               // not captured
        #[SpanAttribute('user.email')] string $email,   // attribute key = "user.email"
    ): int {
        // ...
    }
}
```

## Capturing property values with `#[SpanAttribute]`

Apply `#[SpanAttribute]` to class properties to capture their value at the time
the method is called:

```php
class InvoiceService
{
    #[SpanAttribute]
    public string $customerId = '';

    #[SpanAttribute('invoice.currency')]
    public string $currency = 'EUR';

    #[WithSpan('invoice.generate')]
    public function generate(): string
    {
        // Span attributes include: customerId, invoice.currency
    }
}
```

## Exception recording

If the annotated method throws, the span automatically records the exception and
sets status to `ERROR`. The exception propagates normally.

```php
#[WithSpan]
public function riskyOperation(): void
{
    throw new \RuntimeException('something went wrong');
    // Span is ended with STATUS_ERROR and exception event attached.
}
```

## Nested spans

Calling one `#[WithSpan]` method from another creates nested spans
automatically:

```php
class Pipeline
{
    #[WithSpan('pipeline.run')]
    public function run(): void
    {
        $this->step1(); // child span: "pipeline.step1"
        $this->step2(); // child span: "pipeline.step2"
    }

    #[WithSpan('pipeline.step1')]
    private function step1(): void {}

    #[WithSpan('pipeline.step2')]
    private function step2(): void {}
}
```

## Standalone functions

`#[WithSpan]` works on standalone functions, not only methods:

```php
#[WithSpan('compute.result')]
function computeResult(#[SpanAttribute] int $input): int
{
    return $input * 2;
}
```

## Standard span attributes

Every `#[WithSpan]` span includes these attributes from the declaration site:

| Attribute        | Value                                       |
| ---------------- | ------------------------------------------- |
| `code.function`  | Function or method name                     |
| `code.namespace` | Class name (empty for standalone functions) |
| `code.filepath`  | Source file path                            |
| `code.lineno`    | Line number of the declaration              |

## Compatibility

`#[WithSpan]` and `#[SpanAttribute]` are the same attributes used by the
official
[opentelemetry-php-instrumentation](https://github.com/open-telemetry/opentelemetry-php-instrumentation)
extension. Applications already using that extension can enable this feature
without code changes.
