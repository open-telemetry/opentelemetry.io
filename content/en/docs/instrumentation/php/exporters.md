---
title: Exporters
weight: 5
---

In order to visualize and analyze your traces, you will need to export them to a
backend such as [Jaeger](https://www.jaegertracing.io/) or
[Zipkin](https://zipkin.io/). OpenTelemetry PHP provides exporters for some
common open source backends.

Below you will find some introductions on how to set up backends and the
matching exporters.

## OTLP

To send trace data to a OTLP endpoint (like the [collector](/docs/collector) or
Jaeger) you'll want to use an exporter package, such as
`open-telemetry/exporter-otlp`:

```shell
composer require open-telemetry/exporter-otlp
```

If you wish to use the gRPC protocol, you will also need to install the
`open-telemetry/transport-grpc` package:

```shell
composer require open-telemetry/transport-grpc
```

Next, configure the exporter to point at an OTLP endpoint. For example, you can
update `GettingStarted.php` from
[Getting Started](/docs/instrumentation/php/getting-started/) like the
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

To try out the example quickly, you can run Jaeger in a docker container:

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

To set up Zipkin as quickly as possible, run it in a docker container:

```shell
docker run --rm -d -p 9411:9411 --name zipkin openzipkin/zipkin
```

Install the exporter package as a dependency for your application:

```shell
composer require open-telemetry/exporter-zipkin
```

Update the example to use the Zipkin exporter and to send data to your zipkin
backend:

<!-- prettier-ignore-start -->
$transport = PsrTransportFactory::discover()->create('http://zipkin:9411/api/v2/spans', 'application/json');
$zipkinExporter = new ZipkinExporter($transport);
$tracerProvider =  new TracerProvider(
    new SimpleSpanProcessor($zipkinExporter)
);
$tracer = $tracerProvider->getTracer('io.opentelemetry.contrib.php');
<!-- prettier-ignore-end -->
