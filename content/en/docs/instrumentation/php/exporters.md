---
title: Exporters
weight: 50
cSpell:ignore: autoload fastcgi ndjson pecl
---

In order to visualize and analyze your telemetry, you will need to export it to
a backend. OpenTelemetry PHP provides exporters for some common protocols, which
you can send to a number of open source backends.

## OTLP

To send trace data to a OTLP endpoint (like the [collector](/docs/collector) or
Jaeger) you'll need to use the `open-telemetry/exporter-otlp` package and an
HTTP client that satisfied `psr/http-client-implementation`:

```shell
composer require \
  open-telemetry/exporter-otlp \
  php-http/guzzle7-adapter
```

To use the [gRPC](https://grpc.io/) exporter, you will also need to install the
`open-telemetry/transport-grpc` package, and the `grpc` extension:

```shell
pecl install grpc
composer require open-telemetry/transport-grpc
```

Next, configure an exporter with an OTLP endpoint. For example:

{{< tabpane text=true >}} {{% tab gRPC %}}

```php
<?php

require __DIR__ . '/vendor/autoload.php';

use OpenTelemetry\API\Common\Signal\Signals;
use OpenTelemetry\Contrib\Grpc\GrpcTransportFactory;
use OpenTelemetry\Contrib\Otlp\OtlpUtil;
use OpenTelemetry\Contrib\Otlp\SpanExporter;
use OpenTelemetry\SDK\Trace\SpanProcessor\SimpleSpanProcessor;
use OpenTelemetry\SDK\Trace\TracerProvider;

$transport = (new GrpcTransportFactory())->create('http://jaeger:4317' . OtlpUtil::method(Signals::TRACE));
$exporter = new SpanExporter($transport);

$tracerProvider =  new TracerProvider(
    new SimpleSpanProcessor($exporter)
);
```

{{% /tab %}} {{% tab protobuf %}}

```php
<?php

require __DIR__ . '/vendor/autoload.php';

use OpenTelemetry\Contrib\Otlp\OtlpHttpTransportFactory;
use OpenTelemetry\Contrib\Otlp\SpanExporter;
use OpenTelemetry\SDK\Trace\SpanProcessor\SimpleSpanProcessor;
use OpenTelemetry\SDK\Trace\TracerProvider;

$transport = (new OtlpHttpTransportFactory())->create('http://jaeger:4318/v1/traces', 'application/x-protobuf');
$exporter = new SpanExporter($transport);

$tracerProvider =  new TracerProvider(
    new SimpleSpanProcessor($exporter)
);
```

{{% /tab %}} {{% tab json %}}

```php
<?php

require __DIR__ . '/vendor/autoload.php';

use OpenTelemetry\Contrib\Otlp\OtlpHttpTransportFactory;
use OpenTelemetry\Contrib\Otlp\SpanExporter;
use OpenTelemetry\SDK\Trace\SpanProcessor\SimpleSpanProcessor;
use OpenTelemetry\SDK\Trace\TracerProvider;

$transport = (new OtlpHttpTransportFactory())->create('http://jaeger:4318/v1/traces', 'application/json');
$exporter = new SpanExporter($transport);

$tracerProvider =  new TracerProvider(
    new SimpleSpanProcessor($exporter)
);
$tracer = $tracerProvider->getTracer('io.opentelemetry.contrib.php');
$tracer->spanBuilder('example')->startSpan()->end();
```

{{% /tab %}} {{% tab nd-json %}}

```php
<?php

require __DIR__ . '/vendor/autoload.php';

use OpenTelemetry\Contrib\Otlp\OtlpHttpTransportFactory;
use OpenTelemetry\Contrib\Otlp\SpanExporter;
use OpenTelemetry\SDK\Trace\SpanProcessor\SimpleSpanProcessor;
use OpenTelemetry\SDK\Trace\TracerProvider;

$transport = (new OtlpHttpTransportFactory())->create('http://jaeger:4318/v1/traces', 'application/x-ndjson');
$exporter = new SpanExporter($transport);

$tracerProvider =  new TracerProvider(
    new SimpleSpanProcessor($exporter)
);
$tracer = $tracerProvider->getTracer('io.opentelemetry.contrib.php');
$tracer->spanBuilder('example')->startSpan()->end();
```

{{% /tab %}} {{< /tabpane >}}

Then, append the following code to generate a span:

```php
$tracer = $tracerProvider->getTracer('io.opentelemetry.contrib.php');
$tracer
  ->spanBuilder('example')
  ->startSpan()
  ->end();
```

To try out the example above, you can run
[Jaeger](https://www.jaegertracing.io/) in a docker container:

```shell
docker run -d --name jaeger \
  -e COLLECTOR_ZIPKIN_HOST_PORT=:9411 \
  -e COLLECTOR_OTLP_ENABLED=true \
  -p 6831:6831/udp \
  -p 6832:6832/udp \
  -p 5778:5778 \
  -p 16686:16686 \
  -p 4317:4317 \
  -p 4318:4318 \
  -p 14250:14250 \
  -p 14268:14268 \
  -p 14269:14269 \
  -p 9411:9411 \
  jaegertracing/all-in-one:latest
```

## Zipkin

If you're using [Zipkin](https://zipkin.io/) to visualize traces, you'll need to
set it up first. Here's how to run it locally in a docker container.

```shell
docker run --rm -d -p 9411:9411 --name zipkin openzipkin/zipkin
```

Install the exporter package as a dependency for your application:

```shell
composer require open-telemetry/exporter-zipkin
```

Update the example to use the Zipkin exporter and to send data to your zipkin
backend:

```php
$transport = \OpenTelemetry\SDK\Common\Export\Http\PsrTransportFactory::discover()
    ->create('http://zipkin:9411/api/v2/spans', 'application/json');
$zipkinExporter = new ZipkinExporter($transport);
$tracerProvider =  new TracerProvider(
    new SimpleSpanProcessor($zipkinExporter)
);
$tracer = $tracerProvider->getTracer('io.opentelemetry.contrib.php');
```

## Minimizing export delays

Most PHP runtimes are synchronous and blocking. Sending telemetry data
[can delay](/docs/specs/otel/performance/#shutdown-and-explicit-flushing-could-block)
HTTP responses being received by your users.

If you are using `fastcgi`, you could issue a call to `fastcgi_finish_request()`
after sending a user response, which means that delays in sending telemetry data
will not hold up request processing.

To minimize the impact of slow transport of telemetry data, particularly for
external or cloud-based backends, you should consider using the
[OpenTelemetry Collector](/docs/collector/) as an
[agent](/docs/collector/deployment/agent/). The agent can quickly accept, then
batch send telemetry data to the backend.
