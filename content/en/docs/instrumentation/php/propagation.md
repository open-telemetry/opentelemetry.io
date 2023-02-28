---
title: Propagation
description: Context propagation for the PHP SDK
aliases: [/docs/instrumentation/php/api/propagation]
weight: 7
---

Propagation is the mechanism that moves data between services and processes.
Although not limited to tracing, it is what allows traces to build causal
information about a system across services that are arbitrarily distributed
across process and network boundaries.

## Context propagation with frameworks and libraries

Auto-instrumentation exists for some popular PHP frameworks (eg Symfony, Laravel, Slim)
and HTTP libraries which facilitates context propagation for incoming and outgoing HTTP requests.

### Incoming

Auto-instrumentation for frameworks which implement the [PSR-15](https://www.php-fig.org/psr/psr-15/)
`RequestHandlerInterface` will automatically extract W3C tracecontext headers, create a root span,
and set a remote parent for the root span.

```shell
$ composer require open-telemetry/opentelemetry-auto-psr15
```

### Outgoing

[PSR-18](https://www.php-fig.org/psr/psr-18/) auto-instrumentation will automatically apply W3C tracecontext headers to
outgoing HTTP requests for any library which implements the PSR-18 interface.

```shell
$ open-telemetry/opentelemetry-auto-psr18
```

## Manual W3C Trace Context Propagation

In some cases, it is not possible to propagate context with an instrumentation
library. There may not be an instrumentation library that matches a library
you're using to have services communicate with one another. Or you many have
requirements that instrumentation libraries cannot fulfill, even if they exist.

When you must propagate context manually, you can use the  context api.

The following generic example demonstrates how you can propagate trace context
manually.

First, on the sending service, you'll need to inject the current `context`:

```php
// Sending service
$carrier = [];
// Serialize the traceparent and tracestate from context into
// a carrier.
//
// This example uses the active trace context, but you can
// use whatever context is appropriate to your scenario.
TraceContextPropagator::getInstance()->inject($carrier);

//$carrier now contains traceparent and tracestate
$request = new Request('example.com');
foreach ($carrier as $name => $value) {
    $request = $request->withHeader($name, $value);
}
const { traceparent, tracestate } = output;
// You can then pass the traceparent and tracestate
// data to whatever mechanism you use to propagate
// across services.
```

On the receiving service, you'll need to extract `context` (for example, from
parsed HTTP headers) and then set them as the current trace context.

```php
// Receiving service

// assume $request represents an incoming HTTP request
$parent = TraceContextPropagator::getInstance()->extract($request->getHeaders());
// Extracts the 'traceparent' and 'tracestate' data into a context object.
//
// You can then treat this context as the active context for your
// traces.
$span = $tracer->spanBuilder('demo')
    ->setParent($parent)
    ->setSpanKind(SpanKind::KIND_SERVER)
    ->startSpan();

// Set the created span as active in the context. Future spans will be created as
// children of this span.
$scope = $span->activate();
```

From there, when you have an active context, you can create spans
that will be a part of the same trace from the other service.
