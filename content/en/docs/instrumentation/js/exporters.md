---
title: "Exporters"
weight: 3
---

In order to visualize and analyze your traces and metrics, you will need to export them to a  backend such as [Jaeger](https://www.jaegertracing.io/) or [Zipkin](https://zipkin.io/). OpenTelemetry JS provides exporters for some common open source backends.

Below you will find some introductions on how to setup backends and the matching exporters.

## OTLP endpoint or Collector

To send trace data to a Collector you'll want to use an exporter package, such as `@opentelemetry/exporter-trace-otlp-http`:

```console
$ npm install --save @opentelemetry/exporter-trace-otlp-http
```

Next, configure the exporter to point at an endpoint.

For example, here's how to point at an instance of an [OpenTelemetry Collector](/docs/collector/getting-started/):

```js
const { OTLPTraceExporter } = require('@opentelemetry/exporter-trace-otlp-http');
const { SimpleSpanProcessor } = require('@opentelemetry/sdk-trace-base');

const exporter = new OTLPTraceExporter({
  // optional - url default value is http://localhost:4318/v1/traces
  url: '<your-collector-endpoint>/v1/traces',

  // optional - collection of custom headers to be sent with each request, empty by default
  headers: {}, 
});
```

Use environment variables to set values like headers and an endpoint URL for production.

## Jaeger

To set up Jaeger as quickly as possible, run it in a docker container:

```shell
$ docker run -d --name jaeger \
  -e COLLECTOR_ZIPKIN_HOST_PORT=:9411 \
  -p 5775:5775/udp \
  -p 6831:6831/udp \
  -p 6832:6832/udp \
  -p 5778:5778 \
  -p 16686:16686 \
  -p 14268:14268 \
  -p 14250:14250 \
  -p 9411:9411 \
  jaegertracing/all-in-one:latest
```

Install the exporter package as a dependency for your application:

```shell
npm install --save @opentelemetry/exporter-jaeger
```

Update your opentelemetry configuration to use the exporter and to send data to your jaeger backend:

```javascript
const { JaegerExporter } = require("@opentelemetry/exporter-jaeger");
const { BatchSpanProcessor } = require("@opentelemetry/sdk-trace-base");

provider.addSpanProcessor(new BatchSpanProcessor(new JaegerExporter()))
```

## Zipkin

To set up Zipkin as quickly as possible, run it in a docker container:

```shell
docker run --rm -d -p 9411:9411 --name zipkin openzipkin/zipkin
```

Install the exporter package as a dependency for your application:

```shell
npm install --save @opentelemetry/exporter-zipkin
```

Update your opentelemetry configuration to use the exporter and to send data to your zipkin backend:

```javascript
const { ZipkinExporter } = require("@opentelemetry/exporter-zipkin");
const { BatchSpanProcessor } = require("@opentelemetry/sdk-trace-base");

provider.addSpanProcessor(new BatchSpanProcessor(new ZipkinExporter()))
```

## Prometheus

To set up Prometheus as quickly as possible, run it in a docker container.
You will need a `prometheus.yml` to configure the backend, use the following example
and modify it to your needs:

```yml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: "prometheus"
    static_configs:
      - targets: ["localhost:9090"]
```

With this file you can now start the docker container:

```shell
docker run \
    -p 9090:9090 \
    -v ${PWD}/prometheus.yml:/etc/prometheus/prometheus.yml \
    prom/prometheus
```

Install the exporter package as a dependency for your application:

```shell
npm install --save @opentelemetry/exporter-prometheus
```

Update your opentelemetry configuration to use the exporter and to send data to your prometheus backend:

```javascript
const { PrometheusExporter } = require('@opentelemetry/exporter-prometheus');
const { MeterProvider }  = require('@opentelemetry/sdk-metrics-base');
const meter = new MeterProvider({
  exporter: new PrometheusExporter({port: 9090}),
  interval: 1000,
}).getMeter('prometheus');
```
