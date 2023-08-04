---
title: Exporters
weight: 50
---

In order to visualize and analyze your traces, you will need to export them to a
backend such as [Jaeger](https://www.jaegertracing.io/) or
[Zipkin](https://zipkin.io/). OpenTelemetry JS provides exporters for some
common open source backends.

Below you will find some introductions on how to set up backends and the
matching exporters.

## OTLP endpoint

To send trace data to a OTLP endpoint (like the [collector](/docs/collector) or
Jaeger) you'll want to use an exporter package, such as
`@opentelemetry/exporter-trace-otlp-proto`:

```shell
npm install --save @opentelemetry/exporter-trace-otlp-proto \
  @opentelemetry/exporter-metrics-otlp-proto
```

Next, configure the exporter to point at an OTLP endpoint. For example you can
update `instrumentation.ts|js` from the
[Getting Started](/docs/instrumentation/js/getting-started/nodejs/) like the
following:

<!-- markdownlint-disable -->
<!-- prettier-ignore-start -->

{{< tabpane langEqualsHeader=true >}}
{{< tab Typescript >}}
/*instrumentation.ts*/
import * as opentelemetry from "@opentelemetry/sdk-node";
import {
  getNodeAutoInstrumentations,
} from "@opentelemetry/auto-instrumentations-node";
import {
  OTLPTraceExporter,
} from "@opentelemetry/exporter-trace-otlp-proto";
import {
  OTLPMetricExporter
} from "@opentelemetry/exporter-metrics-otlp-proto";
import {
  PeriodicExportingMetricReader
} from "@opentelemetry/sdk-metrics";

const sdk = new opentelemetry.NodeSDK({
  traceExporter: new OTLPTraceExporter({
    // optional - default url is http://localhost:4318/v1/traces
    url: "<your-otlp-endpoint>/v1/traces",
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
{{< /tab >}}

{{< tab JavaScript >}}
/*instrumentation.js*/
const opentelemetry = require("@opentelemetry/sdk-node");
const {
  getNodeAutoInstrumentations,
} = require("@opentelemetry/auto-instrumentations-node");
const {
  OTLPTraceExporter,
} = require("@opentelemetry/exporter-trace-otlp-proto");
const {
  OTLPMetricExporter
} = require("@opentelemetry/exporter-metrics-otlp-proto");
const {
  PeriodicExportingMetricReader
} = require('@opentelemetry/sdk-metrics');

const sdk = new opentelemetry.NodeSDK({
  traceExporter: new OTLPTraceExporter({
    // optional - default url is http://localhost:4318/v1/traces
    url: "<your-otlp-endpoint>/v1/traces",
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
{{< /tab >}}

{{< /tabpane>}}

<!-- prettier-ignore-end -->
<!-- markdownlint-restore -->

To try out the `OTLPTraceExporter` quickly, you can run Jaeger in a docker
container:

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

### Usage with the WebTracer

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
backend) accepts `http/json` if you are using [OpenTelemetry Collector
Exporter with HTTP/JSON][], and that you are exporting your data to the right
endpoint with your port set to 4318.

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

## Zipkin

To set up Zipkin as quickly as possible, run it in a docker container:

```shell
docker run --rm -d -p 9411:9411 --name zipkin openzipkin/zipkin
```

Install the exporter package as a dependency for your application:

```shell
npm install --save @opentelemetry/exporter-zipkin
```

Update your OpenTelemetry configuration to use the exporter and to send data to
your Zipkin backend:

<!-- markdownlint-disable -->
<!-- prettier-ignore-start -->
{{< tabpane langEqualsHeader=true >}}
{{< tab Typescript >}}
import { ZipkinExporter } from "@opentelemetry/exporter-zipkin";
import { BatchSpanProcessor } from "@opentelemetry/sdk-trace-base";

provider.addSpanProcessor(new BatchSpanProcessor(new ZipkinExporter()));
{{< /tab>}}

{{< tab JavaScript >}}
const { ZipkinExporter } = require("@opentelemetry/exporter-zipkin");
const { BatchSpanProcessor } = require("@opentelemetry/sdk-trace-base");

provider.addSpanProcessor(new BatchSpanProcessor(new ZipkinExporter()));
{{< /tab >}}
{{< /tabpane>}}
<!-- prettier-ignore-end -->
<!-- markdownlint-restore -->

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
