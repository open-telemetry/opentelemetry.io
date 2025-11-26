---
title: Exporters
weight: 50
description: Process and export your telemetry data
---

{{% docs/languages/exporters/intro %}}

## Dependencies {#otlp-dependencies}

If you want to send telemetry data to an OTLP endpoint (like the
[OpenTelemetry Collector](#collector-setup), [Jaeger](#jaeger) or
[Prometheus](#prometheus)), you can choose between three different protocols to
transport your data:

- [HTTP/protobuf](https://www.npmjs.com/package/@opentelemetry/exporter-trace-otlp-proto)
- [HTTP/JSON](https://www.npmjs.com/package/@opentelemetry/exporter-trace-otlp-http)
- [gRPC](https://www.npmjs.com/package/@opentelemetry/exporter-trace-otlp-grpc)

Start by installing the respective exporter packages as a dependency for your
project:

{{< tabpane text=true >}} {{% tab "HTTP/Proto" %}}

```shell
npm install --save @opentelemetry/exporter-trace-otlp-proto \
  @opentelemetry/exporter-metrics-otlp-proto
```

{{% /tab %}} {{% tab "HTTP/JSON" %}}

```shell
npm install --save @opentelemetry/exporter-trace-otlp-http \
  @opentelemetry/exporter-metrics-otlp-http
```

{{% /tab %}} {{% tab gRPC %}}

```shell
npm install --save @opentelemetry/exporter-trace-otlp-grpc \
  @opentelemetry/exporter-metrics-otlp-grpc
```

{{% /tab %}} {{< /tabpane >}}

## Usage with Node.js

Next, configure the exporter to point at an OTLP endpoint. For example you can
update the file `instrumentation.ts` (or `instrumentation.js` if you use
JavaScript) from the
[Getting Started](/docs/languages/js/getting-started/nodejs/) like the following
to export traces and metrics via OTLP (`http/protobuf`) :

{{< tabpane text=true >}} {{% tab TypeScript %}}

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

## Usage in the Browser

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

### Use OTLP exporter with HTTP/JSON or HTTP/protobuf

[OpenTelemetry Collector Exporter with gRPC][] works only with Node.js,
therefore you are limited to use the [OpenTelemetry Collector Exporter with
HTTP/JSON][] or [OpenTelemetry Collector Exporter with HTTP/protobuf][].

Make sure that the receiving end of your exporter (collector or observability
backend) accepts `http/json` if you are using [OpenTelemetry Collector Exporter
with HTTP/JSON][], and that you are exporting your data to the right endpoint
with your port set to 4318.

### Configure CSPs

If your website is making use of Content Security Policies (CSPs), make sure
that the domain of your OTLP endpoint is included. If your collector endpoint is
`https://collector.example.com:4318/v1/traces`, add the following directive:

```text
connect-src collector.example.com:4318/v1/traces
```

If your CSP is not including the OTLP endpoint, you will see an error message,
stating that the request to your endpoint is violating the CSP directive.

### Configure CORS headers

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

### Securely expose your collector

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

To debug your instrumentation or see the values locally in development, you can
use exporters writing telemetry data to the console (stdout).

If you followed the
[Getting Started](/docs/languages/js/getting-started/nodejs/) or
[Manual Instrumentation](/docs/languages/js/instrumentation) guides, you already
have the console exporter installed.

The `ConsoleSpanExporter` is included in the
[`@opentelemetry/sdk-trace-node`](https://www.npmjs.com/package/@opentelemetry/sdk-trace-node)
package and the `ConsoleMetricExporter` is included in the
[`@opentelemetry/sdk-metrics`](https://www.npmjs.com/package/@opentelemetry/sdk-metrics)
package:

{{% include "exporters/jaeger.md" %}}

{{% include "exporters/prometheus-setup.md" %}}

## Dependencies {#prometheus-dependencies}

Install the
[exporter package](https://www.npmjs.com/package/@opentelemetry/exporter-prometheus)
as a dependency for your application:

```shell
npm install --save @opentelemetry/exporter-prometheus
```

Update your OpenTelemetry configuration to use the exporter and to send data to
your Prometheus backend:

{{< tabpane text=true >}} {{% tab TypeScript %}}

```ts
import * as opentelemetry from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { PrometheusExporter } from '@opentelemetry/exporter-prometheus';

const sdk = new opentelemetry.NodeSDK({
  metricReader: new PrometheusExporter({
    port: 9464, // optional - default is 9464
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
  metricReader: new PrometheusExporter({
    port: 9464, // optional - default is 9464
  }),
  instrumentations: [getNodeAutoInstrumentations()],
});
sdk.start();
```

{{% /tab %}} {{< /tabpane >}}

With the above you can access your metrics at <http://localhost:9464/metrics>.
Prometheus or an OpenTelemetry Collector with the Prometheus receiver can scrape
the metrics from this endpoint.

{{% include "exporters/zipkin-setup.md" %}}

## Dependencies {#zipkin-dependencies}

To send your trace data to [Zipkin](https://zipkin.io/), you can use the
`ZipkinExporter`.

Install the
[exporter package](https://www.npmjs.com/package/@opentelemetry/exporter-zipkin)
as a dependency for your application:

```shell
npm install --save @opentelemetry/exporter-zipkin
```

Update your OpenTelemetry configuration to use the exporter and to send data to
your Zipkin backend:

{{< tabpane text=true >}} {{% tab TypeScript %}}

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

{{% include "exporters/outro.md" `https://open-telemetry.github.io/opentelemetry-js/interfaces/_opentelemetry_sdk-trace-base.SpanExporter.html` %}}

{{< tabpane text=true >}} {{% tab TypeScript %}}

```ts
/*instrumentation.ts*/
import * as opentelemetry from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';

const sdk = new NodeSDK({
  spanProcessors: [new SimpleSpanProcessor(exporter)],
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
  spanProcessors: [new SimpleSpanProcessor(exporter)],
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
