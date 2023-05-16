---
title: Exporters
weight: 5
---

In order to visualize and analyze your telemetry, you will need to export it to
a backend. OpenTelemetry PHP provides exporters for some common open source
backends.

## OTLP

To send trace data to a OTLP endpoint (like the [collector](/docs/collector) or
Jaeger) you'll need to use the `open-telemetry/exporter-otlp` package:

```shell
composer require open-telemetry/exporter-otlp
```

If you use gRPC, you will also need to install the
`open-telemetry/transport-grpc` package:

```shell
composer require open-telemetry/transport-grpc
```

Next, configure the exporter with an OTLP endpoint. For example, you can update
`GettingStarted.php` from [Getting Started](../getting-started/) like the
following:

<!-- prettier-ignore-start -->
{{< tabpane >}}
{{< tab gRPC >}}
use OpenTelemetry\API\Common\Signal\Signals;
use OpenTelemetry\Contrib\Grpc\GrpcTransportFactory;
use OpenTelemetry\Contrib\Otlp\OtlpUtil;
use OpenTelemetry\Contrib\Otlp\SpanExporter;
use OpenTelemetry\SDK\Trace\SpanProcessor\SimpleSpanProcessor;
use OpenTelemetry\SDK\Trace\TracerProvider;

$transport = (new GrpcTransportFactory())->create('http://collector:4317' . OtlpUtil::method(Signals::TRACE));
$exporter = new SpanExporter($transport);
{{< /tab >}}
{{< tab protobuf >}}
use OpenTelemetry\Contrib\Otlp\OtlpHttpTransportFactory;
use OpenTelemetry\Contrib\Otlp\SpanExporter;
use OpenTelemetry\SDK\Trace\SpanProcessor\SimpleSpanProcessor;
use OpenTelemetry\SDK\Trace\TracerProvider;

$transport = (new OtlpHttpTransportFactory())->create('http://collector:4318/v1/traces', 'application/x-protobuf');
$exporter = new SpanExporter($transport);
{{< /tab>}}
{{< tab json >}}
use OpenTelemetry\Contrib\Otlp\OtlpHttpTransportFactory;
use OpenTelemetry\Contrib\Otlp\SpanExporter;
use OpenTelemetry\SDK\Trace\SpanProcessor\SimpleSpanProcessor;
use OpenTelemetry\SDK\Trace\TracerProvider;

$transport = (new OtlpHttpTransportFactory())->create('http://collector:4318/v1/traces', 'application/json');
$exporter = new SpanExporter($transport);
{{< /tab >}}
{{< tab nd-json >}}
/* newline-delimited JSON */
use OpenTelemetry\Contrib\Otlp\OtlpHttpTransportFactory;
use OpenTelemetry\Contrib\Otlp\SpanExporter;
use OpenTelemetry\SDK\Trace\SpanProcessor\SimpleSpanProcessor;
use OpenTelemetry\SDK\Trace\TracerProvider;

$transport = (new OtlpHttpTransportFactory())->create('http://collector:4318/v1/traces', 'application/x-ndjson');
$exporter = new SpanExporter($transport);
{{< /tab >}}
{{< /tabpane >}}
<!-- prettier-ignore-end -->

Then, register the exporter in a tracer provider:

```php
$tracerProvider =  new TracerProvider(
   new SimpleSpanProcessor($exporter)
);
$tracer = $tracerProvider->getTracer('io.opentelemetry.contrib.php');
```

To try out the example locally, you can run
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
$transport = PsrTransportFactory::discover()->create('http://zipkin:9411/api/v2/spans', 'application/json');
$zipkinExporter = new ZipkinExporter($transport);
$tracerProvider =  new TracerProvider(
    new SimpleSpanProcessor($zipkinExporter)
);
$tracer = $tracerProvider->getTracer('io.opentelemetry.contrib.php');
```

# Minimizing export delays

Most PHP runtimes are synchronous and blocking. Sending telemetry data
[can delay](/docs/reference/specification/performance/#shutdown-and-explicit-flushing-could-block)
HTTP responses being received by your users.

If you are using `fastcgi`, you could issue a call to `fastcgi_finish_request()`
after sending a user response, which means that delays in sending telemetry data
will not hold up request processing.

To minimize the impact of slow transport of telemetry data, particularly for
external or cloud-based backends, you should consider using a local
[opentelemetry collector](/docs/collector). A local collector can quickly
accept, then batch and send all of your telemetry to the backend. Such a setup
will make your system more robust and scalable.
