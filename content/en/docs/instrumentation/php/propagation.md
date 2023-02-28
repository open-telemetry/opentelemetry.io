---
title: Propagation
description: Context propagation for the PHP API
aliases: [/docs/instrumentation/php/api/propagation]
weight: 7
---

Propagation is the mechanism that moves data between services and processes.
Although not limited to tracing, it is what allows traces to build causal
information about a system across services that are arbitrarily distributed
across process and network boundaries.


OpenTelemetry provides a text-based approach to propagate context to remote
services using the [W3C Trace Context](https://www.w3.org/TR/trace-context/)
HTTP headers.

## Context propagation with frameworks and libraries

Auto-instrumentation exists for some popular PHP frameworks (eg Symfony,
Laravel, Slim) and HTTP libraries propagate context for incoming and outgoing
HTTP requests.

**It is highly recommend that you use auto-instrumentation or instrumentation
libraries to propagate context**. Although it is possible to propagate context
manually, the PHP auto-instrumentation and instrumentation libraries are
well-tested and easier to use.

### Incoming

Auto-instrumentation for frameworks which implement the
[PSR-15](https://www.php-fig.org/psr/psr-15/) `RequestHandlerInterface` will
automatically extract W3C tracecontext headers, create a root span, and set a
remote parent for the root span.

```shell
$ composer require open-telemetry/opentelemetry-auto-psr15
```

### Outgoing

[PSR-18](https://www.php-fig.org/psr/psr-18/) auto-instrumentation will
automatically apply W3C tracecontext headers to outgoing HTTP requests for any
library which implements the PSR-18 interface.

```shell
$ open-telemetry/opentelemetry-auto-psr18
```

## Manual W3C Trace Context Propagation

In some cases, it is not possible to propagate context with an instrumentation
library. There may not be an instrumentation library that matches a library
you're using to have services communicate with one another. Or you many have
requirements that instrumentation libraries cannot fulfill, even if they exist.

When you must propagate context manually, you can use the context api.

The following presents an example of an outgoing HTTP request:

```php
$request = new Request('GET', 'http://localhost:8080/resource');
$outgoing = $tracer->spanBuilder('/resource')->setSpanKind(SpanKind::CLIENT)->startSpan();
$outgoing->setAttribute(TraceAttributes::HTTP_METHOD, $request->getMethod());
$outgoing->setAttribute(TraceAttributes::HTTP_URL, (string) $request->getUri());

$carrier = [];
TraceContextPropagator::getInstance()->inject($carrier);
foreach ($carrier as $name => $value) {
    $request = $request->withAddedHeader($name, $value);
}
try {
    $response = $client->send($request);
} finally {
    $outgoing->end();
}
```

Similarly, the text-based approach can be used to read the W3C Trace Context
from incoming requests. The following presents an example of processing an
incoming HTTP request:

```php
$request = ServerRequestCreator::createFromGlobals();
$context = TraceContextPropagator::getInstance()->extract($request->getHeaders());
$root = $tracer->spanBuilder('HTTP ' . $request->getMethod())
    ->setStartTimestamp((int) ($request->getServerParams()['REQUEST_TIME_FLOAT'] * 1e9))
    ->setParent($context)
    ->setSpanKind(SpanKind::KIND_SERVER)
    ->startSpan();
$scope = $root->activate();
try {
    /* do stuff */
} finally {
    $root->end();
    $scope->detach();
}
```
