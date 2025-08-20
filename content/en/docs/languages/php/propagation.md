---
title: Propagation
description: Context propagation for the PHP API
weight: 60
---

{{% docs/languages/propagation %}}

Propagation is the mechanism that moves data between services and processes.
Although not limited to tracing, propagation allows traces to build causal
information about a system across services that are arbitrarily distributed
across process and network boundaries.

OpenTelemetry provides a text-based approach to propagate context to remote
services using the [W3C Trace Context](https://www.w3.org/TR/trace-context/)
HTTP headers.

## Automatic context propagation

Auto-instrumentation exists for some of the most popular frameworks, libraries,
and PHP extensions. Many of them perform incoming and/or outgoing context
propagation, and can be discovered through the
[Registry](/ecosystem/registry/?language=php&component=instrumentation) or
[Packagist](https://packagist.org/packages/open-telemetry/).

{{% alert title="Note" %}}

Use auto-instrumentation or instrumentation libraries to propagate context.
Although you can propagate context manually, the PHP auto-instrumentation and
instrumentation libraries are well-tested and easier to use.

{{% /alert %}}

### Incoming requests

Context propagation can be automatically handled in a number of ways:

- by using a supported PHP Framework (for example: Laravel, Symfony, Slim) along
  with its corresponding auto-instrumentation package
- by implementing the [PSR-15](https://www.php-fig.org/psr/psr-15/)
  `RequestHandlerInterface` in your code, along with its corresponding
  auto-instrumentation package
- by using the experimental [auto root span](../sdk/#configuration) feature

### Outgoing requests

Auto-instrumentation packages for HTTP clients and interfaces automatically
inject W3C tracecontext headers to outgoing HTTP requests include.

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
