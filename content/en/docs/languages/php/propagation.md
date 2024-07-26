---
title: Propagation
description: Context propagation for the PHP API
weight: 60
---

{{% docs/languages/propagation php %}}

Propagation is the mechanism that moves data between services and processes.
Although not limited to tracing, propagation allows traces to build causal
information about a system across services that are arbitrarily distributed
across process and network boundaries.

OpenTelemetry provides a text-based approach to propagate context to remote
services using the [W3C Trace Context](https://www.w3.org/TR/trace-context/)
HTTP headers.

## Automatic context propagation

Auto-instrumentation exists for some popular PHP frameworks, such as Symfony,
Laravel, or Slim. HTTP libraries propagate context for incoming and outgoing
HTTP requests.

{{% alert title="Note" %}}

Use auto-instrumentation or instrumentation libraries to propagate context.
Although you can propagate context manually, the PHP auto-instrumentation and
instrumentation libraries are well-tested and easier to use.

{{% /alert %}}

### Incoming requests

Auto-instrumentation for frameworks which implement the
[PSR-15](https://www.php-fig.org/psr/psr-15/) `RequestHandlerInterface`
automatically extract W3C tracecontext headers, create a root span, and set a
remote parent for the root span.

```shell
composer require open-telemetry/opentelemetry-auto-psr15
```

### Outgoing requests

[PSR-18](https://www.php-fig.org/psr/psr-18/) auto-instrumentation automatically
apply W3C tracecontext headers to outgoing HTTP requests for any library which
implements the PSR-18 interface.

```shell
open-telemetry/opentelemetry-auto-psr18
```

## Manual context propagation

In some cases, it is not possible to propagate context using an instrumentation
library. There might not be an instrumentation library that matches a library
you're using to have services communicate with each other. Or you might have
requirements that instrumentation libraries cannot fulfill, even if they exist.

When you must propagate context manually, use the context API.

The following snippet shows an example of an outgoing HTTP request:

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

Similarly, use the text-based approach to read the W3C Trace Context from
incoming requests. The following presents an example of processing an incoming
HTTP request:

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

## Next steps

To learn more about propagation, read the
[Propagators API specification](/docs/specs/otel/context/api-propagators/).
