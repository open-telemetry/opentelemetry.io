---
title: Context
weight: 55
description: Learn how the context API works in instrumented applications.
cSpell:ignore: Swoole
---

OpenTelemetry works by storing and propagating telemetry data. For example, when
an instrumented application receives a request and a span starts, the span must
be available to a component which creates child spans. To address this need,
OpenTelemetry stores the span in the active context.

## PHP execution context

The context API is globally available within a single PHP execution context, and
there can only be one [active context](#active-context) in the current execution
context.

### Storage

Context can store values (for example, a `Span`), and it uses `Storage` to keep
track of the stored values. By default, a generic `ContextStorage` is used.
OpenTelemetry for PHP supports other context storage for less common use cases,
like asynchronous or concurrent execution with `fibers`.

## Context keys

Values are stored in context as key-value pairs. Context keys are used to store
and retrieve values from context.

Keys can be created by calling `OpenTelemetry\Context\Context::createKey()`, for
example:

```php
use OpenTelemetry\Context\Context;

$key1 = Context::createKey('My first key');
$key2 = Context::createKey('My second key');
```

## Active context

The active context is the context which is returned by `Context::getCurrent()`.
The context object contains entries which allow telemetry components to
communicate with each other. For example, when a span is created it can be
activated, which creates a new active context and stores the span. Later, when
another span is created it can use the span from the active context as its
parent span. If no context is active, the root context is returned, which is
just the empty context object.

```php
use OpenTelemetry\Context\Context;

// Returns the active context
// If no context is active, the root context is returned
$context = Context::getCurrent();
```

### Set and get context values

Values are stored in Context by using the `$context->with($key, $value)` method.
Setting a context entry creates a new context with the new entry in its storage,
containing `$value`.

Context is immutable. Setting a context entry creates a new context with the new
entry in its storage: `$context->with($key, $value)`. Retrieve values using
`$context->get($key)`, for example:

```php
use OpenTelemetry\Context\Context;

$key = Context::createKey('some key');

// add a new entry
$ctx2 = Context::getCurrent()->with($key, 'context 2');

// ctx2 contains the new entry
var_dump($ctx2->get($key)); // "context 2"

// active context is unchanged
var_dump(Context::getCurrent()->get($key)); // NULL
```

If a value is not found in the current context, then each parent is checked
until either the key is found, or the root context is reached.

### Activate a context

A context can be made active by calling `$context->activate()`.

```php
use OpenTelemetry\Context\Context;

$key = Context::createKey('my-key');
$ctx = Context::getCurrent();
$ctx2 = $ctx->with($key, 'context 2');
$ctx2->activate();
assert($ctx2 === Context::getCurrent());
```

#### Scope

The return value of `$context->activate()` is a `Scope`. You must `detach()` the
scope to deactivate that context, which reactivates the previously-active
context.

The return value of `$scope->detach()` is an integer. A return value of `0`
means that the scope was successfully detached. A non-zero value means that the
call was unexpected. This could happen if the context associated with the scope
was:

- Already detached
- Not a part of the current execution context
- Not the active context

#### DebugScope

To assist developers in locating issues with context and scope, there is
`DebugScope`. In a PHP runtime with assertions enabled, an activated `Context`
is wrapped in a `DebugScope`. The `DebugScope` keeps track of when the scope was
activated, and has a destructor which triggers an error if the scope was not
detached. The error output contains a backtrace of which code activated the
context.

The following code would trigger an error, complaining that a scope was not
detached, and giving a backtrace of where the scope was created:

```php
use OpenTelemetry\Context\Context;

$key = Context::createKey('my-key');
$scope = Context::getCurrent()->with($key, 'value')->activate();

//exit without detaching $scope
```

This can be problematic in some situations, particularly in legacy applications
which might `exit` or `die`. In that case, active spans are not completed and
exported, and the `DebugScope` complains loudly.

If you understand why `DebugScope` is complaining and accept the risks, then you
can disable the feature entirely by setting `OTEL_PHP_DEBUG_SCOPES_DISABLED` to
a truthy value.

### Nested context

Active context executions can be nested. This is how traces can have nested
spans:

```php
use OpenTelemetry\Context\Context;

$key = Context::createKey('my-key');

var_dump(Context::getCurrent()->get($key)); //NULL
$scope2 = Context::getCurrent()->with($key, 'context 2')->activate();
var_dump(Context::getCurrent()->get($key)); //'context 2'
$scope3 = Context::getCurrent()->with($key, 'context 3')->activate();
var_dump(Context::getCurrent()->get($key)); //'context 3'

$scope3->detach(); //context 2 is active
$scope2->detach(); //original context is active
var_dump(Context::getCurrent()->get($key)); //NULL
```

### Context in asynchronous environments

For asynchronous PHP programming, for example `Swoole` or the Fiber-based
`Revolt` event loop, there can be multiple active contexts, but still only one
active context per execution context.

For fiber-based implementations, `Context` is associated with the active fiber,
and forks, switches and is destroyed as appropriate by hooking into PHP's fiber
initialization, forking, and destruction handlers.

For other async implementations, custom context storage might be needed to
interoperate correctly. Check the [registry](/ecosystem/registry/?language=php)
for storage implementations.
