---
title: Exporters
weight: 50
description: Process and export your telemetry data
---

{{% docs/instrumentation/exporters-intro js %}}

{{% alert title="Note" color="info" %}}

If you use [automatic instrumentation](/docs/instrumentation/js/automatic) you
can learn how to setup exporters following the
[Configuration Guide](/docs/instrumentation/js/automatic/module-config/)

{{% /alert %}}

## OTLP

### Backend

There are many open source and commercial backends available that support OTLP
to receive telemetry data. Take a look at this
[non-exhaustive list](/ecosystem/vendors/), to find a backend that fits your
needs. In this section you will find instructions to set up the
[OpenTelemetry Collector](/docs/collector/), [Jaeger](https://jaegertracing.io)
and [Prometheus](https://prometheus.io) to quickly get started.

#### OpenTelemetry Collector

We recommend that you setup an [OpenTelemetry Collector](/docs/collector/) to
export your telemetry to. To try out and verify your instrumentation quickly, you
can run the collector in a docker container that writes telemetry directly to the console.

In an empty directory, create a file called `collector-config.yaml` with the
following content:

```yaml
receivers:
  otlp:
    protocols:
      grpc:
      http:
exporters:
  debug:
    verbosity: detailed
service:
  pipelines:
    traces:
      receivers: [otlp]
      exporters: [debug]
    metrics:
      receivers: [otlp]
      exporters: [debug]
    logs:
      receivers: [otlp]
      exporters: [debug]
```

Now run the collector in a docker container:

```shell
docker run --rm -v $(pwd)/collector-config.yaml:/etc/otelcol-contrib/config.yaml otel/opentelemetry-collector-contrib
```

You can now continue with [installing the OTLP exporter packages](#dependencies)
. Later you may want to [configure the collector](/docs/collector/configuration)
to send your telemetry to your observability backend.

#### Jaeger (Traces)

As an alternative and for a quick way to visualize your traces, we recommend
using [Jaeger](https://jaegertracing.io). You can run Jaeger in a docker
container with the UI accessible on port 16686 and OTLP enabled on ports 4137
and 4138:

```shell
docker run --rm \
  -e COLLECTOR_OTLP_ENABLED=true \
  -p 16686:16686 \
  -p 4317:4317 \
  -p 4318:4318 \
  jaegertracing/all-in-one:latest
```

#### Prometheus (Metrics)

As an alternative and for a quick way to visualize your metrics, we recommend
using [Prometheus](https://prometheus.io). You can run Prometheus in a docker
container with the UI accessible on port 9090:

```shell
echo > prometheus.yml
docker run --rm -v ${PWD}/prometheus.yml:/prometheus/prometheus.yml -p 9090:9090 prom/prometheus --enable-feature=otlp-write-receive
```

{{% alert title="Note" color="info" %}}

When using Prometheus' OTLP Receiver, make sure that you set the OTLP endpoint
for metrics in your application to `http://localhost:9090/api/v1/otlp`.

{{% /alert %}}

### Dependencies

If you want to send telemetry data to an OTLP endpoint (like the
[collector](/docs/collector), [Jaeger](https://www.jaegertracing.io/) or
[Prometheus](https://prometheus.io/)), you can choose between three different
protocols to transport your data:

- HTTP/protobuf
- HTTP/JSON
- gRPC

Start by installing the respective exporter packages as a dependency for your
project:

{{< tabpane text=true langEqualsHeader=false >}} {{% tab "HTTP/Proto" %}}

```shell
npm install --save @opentelemetry/exporter-trace-otlp-proto \
  @opentelemetry/exporter-metrics-otlp-proto
```

{{% /tab %}} {{% tab "HTTP/JSON" %}}

```shell
npm install --save @opentelemetry/exporter-trace-otlp-http \
  @opentelemetry/exporter-metrics-otlp-http
```

{{% /tab %}} {{% tab "gRPC" %}}

```shell
npm install --save @opentelemetry/exporter-trace-otlp-grpc \
  @opentelemetry/exporter-metrics-otlp-grpc
```

{{% /tab %}} {{< /tabpane >}}

### Usage with Node.js

Next, configure the exporter to point at an OTLP endpoint. For example you can
update the file `instrumentation.ts` (or `instrumentation.js` if you use
JavaScript) from the
[Getting Started](/docs/instrumentation/js/getting-started/nodejs/) like the
following to export traces and metrics via OTLP (`http/protobuf`) :

{{< tabpane text=true langEqualsHeader=true >}} {{% tab Typescript %}}

```ts
/*instrumentation.ts*/
import * as opentelemetry from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-proto';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-proto';
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';

const sdk = new opentelemetry.NodeSDK({
  traceExporter: new OTLPTraceExporter({
    // optional - default url is http://localhost:4318/v1/traces
    url: '<your-otlp-endpoint>/v1/traces',
    // optional - collection of custom headers to be sent with each request, empty by default
    headers: {},
  }),
  metricReader: new PeriodicExportingMetricReader({
    exporter: new OTLPMetricExporter({
      url: '<your-otlp-endpoint>/v1/metrics', // url is optional and can be omitted - default is http://localhost:4318/v1/metrics
      headers: {}, // an optional object containing custom headers to be sent with each request
    }),
  }),
  instrumentations: [getNodeAutoInstrumentations()],
});
sdk.start();
```

{{% /tab %}} {{% tab JavaScript %}}

```js
/*instrumentation.js*/
const opentelemetry = require('@opentelemetry/sdk-node');
const {
  getNodeAutoInstrumentations,
} = require('@opentelemetry/auto-instrumentations-node');
const {
  OTLPTraceExporter,
} = require('@opentelemetry/exporter-trace-otlp-proto');
const {
  OTLPMetricExporter,
} = require('@opentelemetry/exporter-metrics-otlp-proto');
const { PeriodicExportingMetricReader } = require('@opentelemetry/sdk-metrics');

const sdk = new opentelemetry.NodeSDK({
  traceExporter: new OTLPTraceExporter({
    // optional - default url is http://localhost:4318/v1/traces
    url: '<your-otlp-endpoint>/v1/traces',
    // optional - collection of custom headers to be sent with each request, empty by default
    headers: {},
  }),
  metricReader: new PeriodicExportingMetricReader({
    exporter: new OTLPMetricExporter({
      url: '<your-otlp-endpoint>/v1/metrics', // url is optional and can be omitted - default is http://localhost:4318/v1/metrics
      headers: {}, // an optional object containing custom headers to be sent with each request
      concurrencyLimit: 1, // an optional limit on pending requests
    }),
  }),
  instrumentations: [getNodeAutoInstrumentations()],
});
sdk.start();
```

{{% /tab %}} {{< /tabpane >}}

### Usage in the Browser

When you use the OTLP exporter in a browser-based application, you need to note
that:

1. Using gRPC for exporting is not supported
2. [Content Security Policies][] (CSPs) of your website might block your exports
3. [Cross-Origin Resource Sharing][] (CORS) headers might not allow your exports
   to be sent
4. You might need to expose your collector to the public internet

Below you will find instructions to use the right exporter, to configure your
CSPs and CORS headers and what precautions you have to take when exposing your
collector.

#### Use OTLP exporter with HTTP/JSON or HTTP/protobuf

[OpenTelemetry Collector Exporter with gRPC][] works only with Node.js,
therefore you are limited to use the [OpenTelemetry Collector Exporter with
HTTP/JSON][] or [OpenTelemetry Collector Exporter with HTTP/protobuf][].

Make sure that the receiving end of your exporter (collector or observability
backend) accepts `http/json` if you are using [OpenTelemetry Collector Exporter
with HTTP/JSON][], and that you are exporting your data to the right endpoint
with your port set to 4318.

#### Configure CSPs

If your website is making use of Content Security Policies (CSPs), make sure
that the domain of your OTLP endpoint is included. If your collector endpoint is
`https://collector.example.com:4318/v1/traces`, add the following directive:

```text
connect-src collector.example.com:4318/v1/traces
```

If your CSP is not including the OTLP endpoint, you will see an error message,
stating that the request to your endpoint is violating the CSP directive.

#### Configure CORS headers

If your website and collector are hosted at a different origin, your browser
might block the requests going out to your collector. You need to configure
special headers for Cross-Origin Resource Sharing (CORS).

The OpenTelemetry Collector provides [a feature][] for http-based receivers to
add the required headers to allow the receiver to accept traces from a web
browser:

```yaml
receivers:
  otlp:
    protocols:
      http:
        include_metadata: true
        cors:
          allowed_origins:
            - https://foo.bar.com
            - https://*.test.com
          allowed_headers:
            - Example-Header
          max_age: 7200
```

#### Securely expose your collector

To receive telemetry from a web application you need to allow the browsers of
your end-users to send data to your collector. If your web application is
accessible from the public internet, you also have to make your collector
accessible for everyone.

It is recommended that you do not expose your collector directly, but that you
put a reverse proxy (NGINX, Apache HTTP Server, ...) in front of it. The reverse
proxy can take care of SSL-offloading, setting the right CORS headers, and many
other features specific to web applications.

Below you will find a configuration for the popular NGINX web server to get you
started:

```nginx
server {
    listen 80 default_server;
    server_name _;
    location / {
        # Take care of preflight requests
        if ($request_method = 'OPTIONS') {
             add_header 'Access-Control-Max-Age' 1728000;
             add_header 'Access-Control-Allow-Origin' 'name.of.your.website.example.com' always;
             add_header 'Access-Control-Allow-Headers' 'Accept,Accept-Language,Content-Language,Content-Type' always;
             add_header 'Access-Control-Allow-Credentials' 'true' always;
             add_header 'Content-Type' 'text/plain charset=UTF-8';
             add_header 'Content-Length' 0;
             return 204;
        }

        add_header 'Access-Control-Allow-Origin' 'name.of.your.website.example.com' always;
        add_header 'Access-Control-Allow-Credentials' 'true' always;
        add_header 'Access-Control-Allow-Headers' 'Accept,Accept-Language,Content-Language,Content-Type' always;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_pass http://collector:4318;
    }
}
```

## Console

To debug your instrumentation, you can use exporters writing telemetry data to
the console (stdout).

If you followed the
[Getting Started](/docs/instrumentation/js/getting-started/nodejs/) or
[Manual Instrumentation](/docs/instrumentation/js/manual) guides, you already
have the console exporter installed.

The `ConsoleSpanExporter` is included in the `@opentelemetry/sdk-trace-node`
package and the `ConsoleMetricExporter` is included in the
`@opentelemetry/sdk-metrics` package:

## Jaeger

[Jaeger](https://www.jaegertracing.io/) natively supports OTLP to receive trace
data, so you can use the same exporter as for the [OTLP backend](#otlp).

## Prometheus

To send your metric data to [Prometheus](https://prometheus.io/), you can either
[enable Prometheus' OTLP Receiver](https://prometheus.io/docs/prometheus/latest/feature_flags/#otlp-receiver)
and use the [OTLP exporter](#otlp) or you can use the `PrometheusExporter`.

Install the exporter package as a dependency for your application:

```shell
npm install --save @opentelemetry/exporter-prometheus
```

Update your OpenTelemetry configuration to use the exporter and to send data to
your Prometheus backend:

{{< tabpane text=true langEqualsHeader=true >}} {{% tab Typescript %}}

```ts
import * as opentelemetry from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { PrometheusExporter } from '@opentelemetry/exporter-prometheus';
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';

const sdk = new opentelemetry.NodeSDK({
  metricReader: new PeriodicExportingMetricReader({
    exporter: new PrometheusExporter({
      port: 9464, // optional - default is 9464
    }),
  }),
  instrumentations: [getNodeAutoInstrumentations()],
});
sdk.start();
```

{{% /tab %}} {{% tab JavaScript %}}

```js
const opentelemetry = require('@opentelemetry/sdk-node');
const {
  getNodeAutoInstrumentations,
} = require('@opentelemetry/auto-instrumentations-node');
const { PrometheusExporter } = require('@opentelemetry/exporter-prometheus');
const { PeriodicExportingMetricReader } = require('@opentelemetry/sdk-metrics');
const sdk = new opentelemetry.NodeSDK({
  metricReader: new PeriodicExportingMetricReader({
    exporter: new PrometheusExporter({
      port: 9464, // optional - default is 9464
    }),
  }),
  instrumentations: [getNodeAutoInstrumentations()],
});
sdk.start();
```

You can run Zipkin on your local machine with Docker, by running the following
command:

```shell
docker run --rm -d -p 9411:9411 --name zipkin openzipkin/zipkin
```

{{% /tab %}} {{< /tabpane >}}

## Zipkin

To send your trace data to [Zipkin](https://zipkin.io/), you can use the
`ZipkinExporter`.

Install the exporter package as a dependency for your application:

```shell
npm install --save @opentelemetry/exporter-zipkin
```

Update your OpenTelemetry configuration to use the exporter and to send data to
your Zipkin backend:

{{< tabpane text=true langEqualsHeader=true >}} {{% tab Typescript %}}

```ts
import * as opentelemetry from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { ZipkinExporter } from '@opentelemetry/exporter-zipkin';

const sdk = new opentelemetry.NodeSDK({
  traceExporter: new ZipkinExporter({}),
  instrumentations: [getNodeAutoInstrumentations()],
});
sdk.start();
```

{{% /tab %}} {{% tab JavaScript %}}

```js
const opentelemetry = require('@opentelemetry/sdk-node');
const {
  getNodeAutoInstrumentations,
} = require('@opentelemetry/auto-instrumentations-node');
const { ZipkinExporter } = require('@opentelemetry/exporter-zipkin');

const sdk = new opentelemetry.NodeSDK({
  traceExporter: new ZipkinExporter({}),
  instrumentations: [getNodeAutoInstrumentations()],
});
```

{{% /tab %}} {{< /tabpane >}}

You can run Zipkin on your local machine with Docker, by running the following
command:

```shell
docker run --rm -d -p 9411:9411 --name zipkin openzipkin/zipkin
```

## Other available exporters

There are many other exporters available. For a list of available exporters, see
the
[registry](https://opentelemetry.io/ecosystem/registry/?component=exporter&language=js).

Finally, you can also write your own exporter. For more information, see the
[SpanExporter Interface in the API documentation](https://open-telemetry.github.io/opentelemetry-js/interfaces/_opentelemetry_sdk_trace_base.SpanExporter.html).

## Batching spans

For traces the OpenTelemetry SDK provides a set of default span processors, that
allow you to either emit spans one-by-one or batched. If not specified otherwise
the SDK will use the `BatchSpanProcessor`. If you do not want to batch your
spans, you can use the `SimpleSpanProcessor` instead as follows:

{{< tabpane text=true langEqualsHeader=true >}} {{% tab Typescript %}}

```ts
/*instrumentation.ts*/
import * as opentelemetry from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';

const sdk = new opentelemetry.NodeSDK({
  spanProcessor: new SimpleSpanProcessor(exporter),
  instrumentations: [getNodeAutoInstrumentations()],
});
sdk.start();
```

{{% /tab %}} {{% tab JavaScript %}}

```js
/*instrumentation.js*/
const opentelemetry = require('@opentelemetry/sdk-node');
const {
  getNodeAutoInstrumentations,
} = require('@opentelemetry/auto-instrumentations-node');

const sdk = new opentelemetry.NodeSDK({
  spanProcessor: new SimpleSpanProcessor(exporter)
  instrumentations: [getNodeAutoInstrumentations()],
});
sdk.start();
```

{{% /tab %}} {{< /tabpane >}}

[content security policies]:
  https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/
[cross-origin resource sharing]:
  https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
[opentelemetry collector exporter with grpc]:
  https://www.npmjs.com/package/@opentelemetry/exporter-trace-otlp-grpc
[opentelemetry collector exporter with http/protobuf]:
  https://www.npmjs.com/package/@opentelemetry/exporter-trace-otlp-proto
[opentelemetry collector exporter with http/json]:
  https://www.npmjs.com/package/@opentelemetry/exporter-trace-otlp-http
[a feature]:
  https://github.com/open-telemetry/opentelemetry-collector/blob/main/config/confighttp/README.md
