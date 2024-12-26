---
title: Експортери
weight: 50
default_lang_commit: 5489ba34bff91356aa2c501cd55f07eeb30cc355
cSpell:ignore: fastcgi pecl блокуючими
---

{{% docs/languages/exporters/intro %}}

> [!NOTE]
>
> Якщо ви використовуєте [інструментування без коду](/docs/zero-code/php/), ви можете налаштувати експортери за допомогою [конфігурації без коду для налаштування експортерів](/docs/zero-code/php#configuration).

## OTLP

Щоб надіслати дані трасування на точку доступу OTLP (наприклад, [колектор](/docs/collector) або Jaeger), вам потрібно використовувати пакунок `open-telemetry/exporter-otlp` та HTTP клієнт, який задовольняє `psr/http-client-implementation`:

```shell
composer require \
  open-telemetry/exporter-otlp \
  php-http/guzzle7-adapter
```

Щоб використовувати експортер [gRPC](https://grpc.io/), вам також потрібно встановити пакунок `open-telemetry/transport-grpc` та розширення `grpc`:

```shell
pecl install grpc
composer require open-telemetry/transport-grpc
```

Далі, налаштуйте експортер з точкою доступу OTLP. Наприклад:

{{< tabpane text=true >}} {{% tab gRPC %}}

```php
<?php

require __DIR__ . '/vendor/autoload.php';

use OpenTelemetry\API\Signals;
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

{{% /tab %}} {{% tab JSON %}}

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

{{% /tab %}} {{% tab NDJSON %}}

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

Потім додайте наступний код для генерації відрізка:

```php
$tracer = $tracerProvider->getTracer('io.opentelemetry.contrib.php');
$tracer
  ->spanBuilder('example')
  ->startSpan()
  ->end();
```

Щоб спробувати приклад вище, ви можете запустити [Jaeger](https://www.jaegertracing.io/) у контейнері Docker:

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

Якщо ви використовуєте [Zipkin](https://zipkin.io/) для візуалізації трасувань, вам потрібно спочатку налаштувати його. Ось як запустити його локально у контейнері Docker.

```shell
docker run --rm -d -p 9411:9411 --name zipkin openzipkin/zipkin
```

Встановіть пакунок експорту як залежність для вашого застосунку:

```shell
composer require open-telemetry/exporter-zipkin
```

Оновіть приклад для використання експорту Zipkin і надсилання даних на ваш бекенд Zipkin:

```php
$transport = \OpenTelemetry\SDK\Common\Export\Http\PsrTransportFactory::discover()
    ->create('http://zipkin:9411/api/v2/spans', 'application/json');
$zipkinExporter = new ZipkinExporter($transport);
$tracerProvider =  new TracerProvider(
    new SimpleSpanProcessor($zipkinExporter)
);
$tracer = $tracerProvider->getTracer('io.opentelemetry.contrib.php');
```

## Мінімізація затримок експорту {#minimize-export-delays}

Більшість PHP середовищ є синхронними та блокуючими. Надсилання телеметричних даних [може затримати](/docs/specs/otel/performance/#shutdown-and-explicit-flushing-could-block) отримання HTTP відповідей вашими користувачами.

Якщо ви використовуєте `fastcgi`, ви можете викликати `fastcgi_finish_request()` після надсилання відповіді користувачу, що означає, що затримки у надсилання телеметричних даних не будуть затримувати обробку запитів.

Щоб мінімізувати вплив повільного транспорту телеметричних даних, особливо для зовнішніх або хмарних бекендів, вам слід розглянути використання [OpenTelemetry Collector](/docs/collector/) як [агента](/docs/collector/deploy/agent/). Агент може швидко приймати, а потім пакетно відправляти телеметричні дані до бекенду.
