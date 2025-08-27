---
title: Node.js
description: Get telemetry for your app in less than 5 minutes!
aliases: [/docs/js/getting_started/nodejs]
weight: 10
cSpell:ignore: autoinstrumentations rolldice
---

This page will show you how to get started with OpenTelemetry in Node.js.

You will learn how to instrument both [traces][] and [metrics][] and log them to
the console.

{{% alert title="Note" %}} The logging library for OpenTelemetry for Node.js is
still under development hence an example for it is not provided below. For
status details, see
[Status and Releases](/docs/languages/js/#status-and-releases). {{% /alert %}}

## Prerequisites

Ensure that you have the following installed locally:

- [Node.js](https://nodejs.org/en/download/)
- [TypeScript](https://www.typescriptlang.org/download), if you will be using
  TypeScript.

## Example Application

The following example uses a basic [Express](https://expressjs.com/)
application. If you are not using Express, that's OK — you can use OpenTelemetry
JavaScript with other web frameworks as well, such as Koa and Nest.JS. For a
complete list of libraries for supported frameworks, see the
[registry](/ecosystem/registry/?component=instrumentation&language=js).

For more elaborate examples, see [examples](/docs/languages/js/examples/).

### Dependencies

To begin, set up an empty `package.json` in a new directory:

```shell
npm init -y
```

Next, install Express dependencies.

{{< tabpane text=true >}} {{% tab TypeScript %}}

```sh
npm install express @types/express
npm install -D tsx  # a tool to run TypeScript (.ts) files directly with node
```

{{% /tab %}} {{% tab JavaScript %}}

```sh
npm install express
```

{{% /tab %}} {{< /tabpane >}}

### Create and launch an HTTP Server

Create a file named `app.ts` (or `app.js` if not using TypeScript) and add the
following code to it:

{{% tabpane text=true %}} {{% tab TypeScript %}}

```ts
/*app.ts*/
import express, { Express } from 'express';

const PORT: number = parseInt(process.env.PORT || '8080');
const app: Express = express();

function getRandomNumber(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

app.get('/rolldice', (req, res) => {
  res.send(getRandomNumber(1, 6).toString());
});

app.listen(PORT, () => {
  console.log(`Listening for requests on http://localhost:${PORT}`);
});
```

{{% /tab %}} {{% tab JavaScript %}}

```js
/*app.js*/
const express = require('express');

const PORT = parseInt(process.env.PORT || '8080');
const app = express();

function getRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

app.get('/rolldice', (req, res) => {
  res.send(getRandomNumber(1, 6).toString());
});

app.listen(PORT, () => {
  console.log(`Listening for requests on http://localhost:${PORT}`);
});
```

{{% /tab %}} {{% /tabpane %}}

Run the application with the following command and open
<http://localhost:8080/rolldice> in your web browser to ensure it is working.

{{< tabpane text=true >}} {{% tab TypeScript %}}

```console
$ npx tsx app.ts
Listening for requests on http://localhost:8080
```

{{% /tab %}} {{% tab JavaScript %}}

```console
$ node app.js
Listening for requests on http://localhost:8080
```

{{% /tab %}} {{< /tabpane >}}

## Instrumentation

The following shows how to install, initialize, and run an application
instrumented with OpenTelemetry.

### More Dependencies

First, install the Node SDK and autoinstrumentations package.

The Node SDK lets you initialize OpenTelemetry with several configuration
defaults that are correct for the majority of use cases.

The `auto-instrumentations-node` package installs instrumentation libraries that
will automatically create spans corresponding to code called in libraries. In
this case, it provides instrumentation for Express, letting the example app
automatically create spans for each incoming request.

```shell
npm install @opentelemetry/sdk-node \
  @opentelemetry/api \
  @opentelemetry/auto-instrumentations-node \
  @opentelemetry/sdk-metrics \
  @opentelemetry/sdk-trace-node
```

To find all autoinstrumentation modules, you can look at the
[registry](/ecosystem/registry/?language=js&component=instrumentation).

### Setup

The instrumentation setup and configuration must be run _before_ your
application code. One tool commonly used for this task is the
[--import](https://nodejs.org/api/cli.html#--importmodule) flag.

Create a file named `instrumentation.ts` (or `instrumentation.mjs` if not using
TypeScript), which will contain your instrumentation setup code.

{{% alert title="Note" %}} The following examples using
`--import instrumentation.ts` (TypeScript) require Node.js v.20 or later. If you
are using Node.js v.18, please use the JavaScript example. {{% /alert %}}

{{< tabpane text=true >}} {{% tab TypeScript %}}

```ts
/*instrumentation.ts*/
import { NodeSDK } from '@opentelemetry/sdk-node';
import { ConsoleSpanExporter } from '@opentelemetry/sdk-trace-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import {
  PeriodicExportingMetricReader,
  ConsoleMetricExporter,
} from '@opentelemetry/sdk-metrics';

const sdk = new NodeSDK({
  traceExporter: new ConsoleSpanExporter(),
  metricReader: new PeriodicExportingMetricReader({
    exporter: new ConsoleMetricExporter(),
  }),
  instrumentations: [getNodeAutoInstrumentations()],
});

sdk.start();
```

{{% /tab %}} {{% tab JavaScript %}}

```js
/*instrumentation.mjs*/
import { NodeSDK } from '@opentelemetry/sdk-node';
import { ConsoleSpanExporter } from '@opentelemetry/sdk-trace-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import {
  PeriodicExportingMetricReader,
  ConsoleMetricExporter,
} from '@opentelemetry/sdk-metrics';

const sdk = new NodeSDK({
  traceExporter: new ConsoleSpanExporter(),
  metricReader: new PeriodicExportingMetricReader({
    exporter: new ConsoleMetricExporter(),
  }),
  instrumentations: [getNodeAutoInstrumentations()],
});

sdk.start();
```

{{% /tab %}} {{< /tabpane >}}

## Run the instrumented app

Now you can run your application as you normally would, but you can use the
`--import` flag to load the instrumentation before the application code. Make
sure you don't have other conflicting `--import` or `--require` flags such as
`--require @opentelemetry/auto-instrumentations-node/register` in your
`NODE_OPTIONS` environment variable.

{{< tabpane text=true >}} {{% tab TypeScript %}}

```console
$ npx tsx --import ./instrumentation.ts app.ts
Listening for requests on http://localhost:8080
```

{{% /tab %}} {{% tab JavaScript %}}

```console
$ node --import ./instrumentation.mjs app.js
Listening for requests on http://localhost:8080
```

{{% /tab %}} {{< /tabpane >}}

Open <http://localhost:8080/rolldice> in your web browser and reload the page a
few times. After a while you should see the spans printed in the console by the
`ConsoleSpanExporter`.

<details>
<summary>View example output</summary>

```js
{
  resource: {
    attributes: {
      'host.arch': 'arm64',
      'host.id': '8FEBBC33-D6DA-57FC-8EF0-1A9C14B919F8',
      'process.pid': 12460,
      // ... some resource attributes elided ...
      'process.runtime.version': '22.17.1',
      'process.runtime.name': 'nodejs',
      'process.runtime.description': 'Node.js',
      'telemetry.sdk.language': 'nodejs',
      'telemetry.sdk.name': 'opentelemetry',
      'telemetry.sdk.version': '2.0.1'
    }
  },
  instrumentationScope: {
    name: '@opentelemetry/instrumentation-express',
    version: '0.52.0',
    schemaUrl: undefined
  },
  traceId: '61e8960c349ca2a3a51289e050fd3b82',
  parentSpanContext: {
    traceId: '61e8960c349ca2a3a51289e050fd3b82',
    spanId: '631b666604f933bc',
    traceFlags: 1,
    traceState: undefined
  },
  traceState: undefined,
  name: 'request handler - /rolldice',
  id: 'd8fcc05ac4f60c99',
  kind: 0,
  timestamp: 1755719307779000,
  duration: 2801.5,
  attributes: {
    'http.route': '/rolldice',
    'express.name': '/rolldice',
    'express.type': 'request_handler'
  },
  status: { code: 0 },
  events: [],
  links: []
}
{
  resource: {
    attributes: {
      'host.arch': 'arm64',
      'host.id': '8FEBBC33-D6DA-57FC-8EF0-1A9C14B919F8',
      'process.pid': 12460,
      // ... some resource attributes elided ...
      'process.runtime.version': '22.17.1',
      'process.runtime.name': 'nodejs',
      'process.runtime.description': 'Node.js',
      'telemetry.sdk.language': 'nodejs',
      'telemetry.sdk.name': 'opentelemetry',
      'telemetry.sdk.version': '2.0.1'
    }
  },
  instrumentationScope: {
    name: '@opentelemetry/instrumentation-http',
    version: '0.203.0',
    schemaUrl: undefined
  },
  traceId: '61e8960c349ca2a3a51289e050fd3b82',
  parentSpanContext: undefined,
  traceState: undefined,
  name: 'GET /rolldice',
  id: '631b666604f933bc',
  kind: 1,
  timestamp: 1755719307777000,
  duration: 4705.75,
  attributes: {
    'http.url': 'http://localhost:8080/rolldice',
    'http.host': 'localhost:8080',
    'net.host.name': 'localhost',
    'http.method': 'GET',
    'http.scheme': 'http',
    'http.target': '/rolldice',
    'http.user_agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:141.0) Gecko/20100101 Firefox/141.0',
    'http.flavor': '1.1',
    'net.transport': 'ip_tcp',
    'net.host.ip': '::ffff:127.0.0.1',
    'net.host.port': 8080,
    'net.peer.ip': '::ffff:127.0.0.1',
    'net.peer.port': 63067,
    'http.status_code': 200,
    'http.status_text': 'OK',
    'http.route': '/rolldice'
  },
  status: { code: 0 },
  events: [],
  links: []
}
```

</details>

The generated span tracks the lifetime of a request to the `/rolldice` route.

Send a few more requests to the endpoint. After a moment, you'll see metrics in
the console output, such as the following:

<details>
<summary>View example output</summary>

```yaml
{
  descriptor: {
    name: 'http.server.duration',
    type: 'HISTOGRAM',
    description: 'Measures the duration of inbound HTTP requests.',
    unit: 'ms',
    valueType: 1,
    advice: {}
  },
  dataPointType: 0,
  dataPoints: [
    {
      attributes: {
        'http.scheme': 'http',
        'http.method': 'GET',
        'net.host.name': 'localhost',
        'http.flavor': '1.1',
        'http.status_code': 200,
        'net.host.port': 8080,
        'http.route': '/rolldice'
      },
      startTime: [ 1755719307, 782000000 ],
      endTime: [ 1755719482, 940000000 ],
      value: {
        min: 1.439792,
        max: 5.775,
        sum: 15.370167,
        buckets: {
          boundaries: [
               0,    5,    10,   25,
              50,   75,   100,  250,
             500,  750,  1000, 2500,
            5000, 7500, 10000
          ],
          counts: [
            0, 5, 1, 0, 0, 0,
            0, 0, 0, 0, 0, 0,
            0, 0, 0, 0
          ]
        },
        count: 6
      }
    },
    {
      attributes: {
        'http.scheme': 'http',
        'http.method': 'GET',
        'net.host.name': 'localhost',
        'http.flavor': '1.1',
        'http.status_code': 304,
        'net.host.port': 8080,
        'http.route': '/rolldice'
      },
      startTime: [ 1755719433, 609000000 ],
      endTime: [ 1755719482, 940000000 ],
      value: {
        min: 1.39575,
        max: 1.39575,
        sum: 1.39575,
        buckets: {
          boundaries: [
               0,    5,    10,   25,
              50,   75,   100,  250,
             500,  750,  1000, 2500,
            5000, 7500, 10000
          ],
          counts: [
            0, 1, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0,
            0, 0, 0, 0
          ]
        },
        count: 1
      }
    }
  ]
}
{
  descriptor: {
    name: 'nodejs.eventloop.utilization',
    type: 'OBSERVABLE_GAUGE',
    description: 'Event loop utilization',
    unit: '1',
    valueType: 1,
    advice: {}
  },
  dataPointType: 2,
  dataPoints: [
    {
      attributes: {},
      startTime: [ 1755719362, 939000000 ],
      endTime: [ 1755719482, 940000000 ],
      value: 0.00843049454565211
    }
  ]
}
{
  descriptor: {
    name: 'v8js.gc.duration',
    type: 'HISTOGRAM',
    description: 'Garbage collection duration by kind, one of major, minor, incremental or weakcb.',
    unit: 's',
    valueType: 1,
    advice: { explicitBucketBoundaries: [ 0.01, 0.1, 1, 10 ] }
  },
  dataPointType: 0,
  dataPoints: [
    {
      attributes: { 'v8js.gc.type': 'minor' },
      startTime: [ 1755719303, 5000000 ],
      endTime: [ 1755719482, 940000000 ],
      value: {
        min: 0.0005120840072631835,
        max: 0.0022552499771118163,
        sum: 0.006526499509811401,
        buckets: { boundaries: [ 0.01, 0.1, 1, 10 ], counts: [ 6, 0, 0, 0, 0 ] },
        count: 6
      }
    },
    {
      attributes: { 'v8js.gc.type': 'incremental' },
      startTime: [ 1755719310, 812000000 ],
      endTime: [ 1755719482, 940000000 ],
      value: {
        min: 0.0003403329849243164,
        max: 0.0012867081165313721,
        sum: 0.0016270411014556885,
        buckets: { boundaries: [ 0.01, 0.1, 1, 10 ], counts: [ 2, 0, 0, 0, 0 ] },
        count: 2
      }
    },
    {
      attributes: { 'v8js.gc.type': 'major' },
      startTime: [ 1755719310, 830000000 ],
      endTime: [ 1755719482, 940000000 ],
      value: {
        min: 0.0025888750553131105,
        max: 0.005744750022888183,
        sum: 0.008333625078201293,
        buckets: { boundaries: [ 0.01, 0.1, 1, 10 ], counts: [ 2, 0, 0, 0, 0 ] },
        count: 2
      }
    }
  ]
}
```

</details>

## Next Steps

Enrich your instrumentation generated automatically with
[manual instrumentation](/docs/languages/js/instrumentation) of your own
codebase. This gets you customized observability data.

You'll also want to configure an appropriate exporter to
[export your telemetry data](/docs/languages/js/exporters) to one or more
telemetry backends.

If you'd like to explore a more complex example, take a look at the
[OpenTelemetry Demo](/docs/demo/), which includes the JavaScript based
[Payment Service](/docs/demo/services/payment/) and the TypeScript based
[Frontend Service](/docs/demo/services/frontend/).

## Troubleshooting

Did something go wrong? You can enable diagnostic logging to validate that
OpenTelemetry is initialized correctly:

{{< tabpane text=true >}} {{% tab TypeScript %}}

```ts
/*instrumentation.ts*/
import { diag, DiagConsoleLogger, DiagLogLevel } from '@opentelemetry/api';

// For troubleshooting, set the log level to DiagLogLevel.DEBUG
diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.INFO);

// const sdk = new NodeSDK({...
```

{{% /tab %}} {{% tab JavaScript %}}

```js
/*instrumentation.mjs*/
import { diag, DiagConsoleLogger, DiagLogLevel } from '@opentelemetry/api';

// For troubleshooting, set the log level to DiagLogLevel.DEBUG
diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.INFO);

// const sdk = new NodeSDK({...
```

{{% /tab %}} {{< /tabpane >}}

[traces]: /docs/concepts/signals/traces/
[metrics]: /docs/concepts/signals/metrics/
