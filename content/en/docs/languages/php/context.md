---
title: Context
weight: 55
cSpell:ignore: Swoole
description: Learn how context works in instrumented applications.
---

In order for OpenTelemetry to work, it must store and propagate important
telemetry data. For example, when a request is received and a span is started it
must be available to a component which creates its child span. To solve this
problem, OpenTelemetry stores the span in the Context.

More information:

- [Context specification](/docs/specs/otel/context/)

## Context

Context is globally available, and there can only be one
[active context](#active-context) in the current execution context. Context can
store values (for example, a `Span`).

### Storage

Context uses `Storage` to keep track of values. By default, a generic
`ContextStorage` is used. OpenTelemetry for PHP supports other context storage
for more exotic use-cases (eg for asynchronous/concurrent execution with
`fibers`).

## Context Keys

Context entries are key-value pairs. Keys can be created by calling
`OpenTelemetry\Context\Context::createKey()`.

```php
use OpenTelemetry\Context\Context;

$key1 = Context::createKey('My first key');
$key2 = Context::createKey('My second key');
```

Context keys are used to store and retrieve values from context.

## Basic Operations

### Store and Retrieve values

Values are stored in Context by using the `$context->with($key, $value)` method.
Setting a context entry creates a new context with the new entry in its storage,
containing `$value`.

Context is immutable, and setting a context entry does not modify the previous
context. Once a value is stored in a context, it can be retrieved via
`$context->get($key)`:

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

## Active Context

The active context is the context which is returned by `Context::getCurrent()`.
The context object contains entries which allow telemetry components to
communicate with each other. For example, when a span is created it may be
activated, which creates a new active context and stores the span. Later, when
another span is created it may use the span from the active context as its
parent span. If no context is active, the root context is returned, which is
just the empty context object.

```php
use OpenTelemetry\Context\Context;

// Returns the active context
// If no context is active, the root context is returned
$context = Context::getCurrent();
```

### Set Active Context

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
scope to "de-activate" that context, which will make the previously-active
context the active context again.

The return value of `$scope->detach()` is an integer. A zero return value means
that the scope was successfully detached. A non-zero value means that the call
was unexpected; either the context associated with the scope was:

- already detached
- not a part of the current execution context
- not the active context

#### DebugScope

To assist developers in locating issues with context and scope, there is
`DebugScope`. In development (that is, a PHP runtime with assertions enabled),
an activated `Context` will be wrapped in a `DebugScope`. The `DebugScope` keeps
track of when the scope was activated, and has a destructor which triggers an
error if the scope was not detached. The error output contains a backtrace of
which code activated the context.

The following code would trigger an error, complaining that a scope was not
detached, and giving a backtrace of where the scope was created:

```php
use OpenTelemetry\Context\Context;

$key = Context::createKey('my-key');
$scope = Context::getCurrent()->with($key, 'value')->activate();

//exit without detaching $scope
```

This can be problematic in some situations, particularly in legacy applications
which might `exit` or `die` - any active spans will not be completed and
exported, but the `DebugScope` will also complain loudly.

If you understand why `DebugScope` is complaining and accept the risks, then you
can disable the feature entirely by setting `OTEL_PHP_DEBUG_SCOPES_DISABLED` to
a truthy value.

### Nested Context

Active context executions may be nested, and this is how traces can have nested
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

### Asynchronous context

For asynchronous PHP programming, for example `Swoole` or the Fiber-based
`Revolt` event loop, there can be multiple active `Context`s, but still only one
active context per execution context.

For fiber-based implementations, `Context` will be associated with the active
fiber, and will fork, switch and be destroyed as appropriate by hooking in to
PHP's fiber initialization, forking and destruction handlers.

For other async implementations, custom context storage may be needed to
interoperate correctly. Check the [registry](/ecosystem/registry/?language=php)
for storage implementations.
