---
title: Node.js
aliases: [/docs/js/getting_started/nodejs]
weight: 2
---

This guide will show you how to get started with OpenTelemetry in Node.js.

## Prerequisites

Ensure that you have the following installed locally:

- [Node.js](https://nodejs.org/en/download/)
- [TypeScript](https://www.typescriptlang.org/download), if you will be using
  TypeScript.

## Example Application

The following example uses a basic Express application.

### Dependencies

First, create an empty package.json:

```shell
npm init -f
```

Next, install Express dependencies.

<!-- prettier-ignore-start -->
{{< tabpane lang=shell persistLang=false >}}

{{< tab TypeScript >}}
npm install typescript \
  ts-node \
  @types/node \
  express \
  @types/express \
{{< /tab >}}

{{< tab JavaScript >}}
npm install express
{{< /tab >}}

{{< /tabpane >}}
<!-- prettier-ignore-end -->

### Code

If you are using TypeScript, then run following command:

```shell
tsc --init
```

Create `app.ts|js` and add the following code to the file:

<!-- prettier-ignore-start -->
{{< tabpane langEqualsHeader=true >}}

{{< tab TypeScript >}}
/*app.ts*/
import express, { Express } from "express";

const PORT: number = parseInt(process.env.PORT || "8080");
const app: Express = express();

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.listen(PORT, () => {
  console.log(`Listening for requests on http://localhost:${PORT}`);
});
{{< /tab >}}

{{< tab JavaScript >}}
/*app.js*/
const express = require("express");

const PORT = parseInt(process.env.PORT || "8080");
const app = express();

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.listen(PORT, () => {
  console.log(`Listening for requests on http://localhost:${PORT}`);
});
{{< /tab >}}

{{< /tabpane>}}
<!-- prettier-ignore-end -->

Run the application with the following request and open <http://localhost:8080>
in your web browser to ensure it is working.

<!-- prettier-ignore-start -->
{{< tabpane lang=console persistLang=false >}}

{{< tab TypeScript >}}
$ ts-node app.ts
Listening for requests on http://localhost:8080
{{< /tab >}}

{{< tab JavaScript >}}
$ node app.js
Listening for requests on http://localhost:8080
{{< /tab >}}

{{< /tabpane >}}
<!-- prettier-ignore-end -->

## Instrumentation

The following shows how to install, initialize, and run an application
instrumented with OpenTelemetry.

### Dependencies

First, install the Node SDK and autoinstrumentations package.

The Node SDK lets you initialize OpenTelemetry with several configuration
defaults that are correct for the majority of use cases.

The `auto-instrumentations-node` package installs instrumentation packages that
will automatically create spans corresponding to code called in libraries. In
this case, it provides instrumentation for Express, letting the example app
automatically create spans for each incoming request.

```shell
npm install @opentelemetry/sdk-node \
  @opentelemetry/auto-instrumentations-node \
  @opentelemetry/sdk-metrics
```

To find all autoinstrumentation modules, you can look at the
[registry](/ecosystem/registry/?language=js&component=instrumentation).

### Setup

The instrumentation setup and configuration must be run _before_ your
application code. One tool commonly used for this task is the
[`-r, --require module`](https://nodejs.org/api/cli.html#cli_r_require_module)
flag.

Create a file named `instrumentation.ts|js`, which will contain your
instrumentation setup code.

<!-- prettier-ignore-start -->
{{< tabpane langEqualsHeader=true >}}

{{< tab TypeScript >}}
/*instrumentation.ts*/
import { NodeSDK } from '@opentelemetry/sdk-node';
import { ConsoleSpanExporter } from '@opentelemetry/sdk-trace-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';

const sdk = new NodeSDK({
  traceExporter: new ConsoleSpanExporter(),
  metricReader: new PeriodicExportingMetricReader({
    exporter: new opentelemetry.metrics.ConsoleMetricExporter()
  }),
  instrumentations: [getNodeAutoInstrumentations()]
});

sdk
  .start()

{{< /tab >}}

{{< tab JavaScript >}}
/*instrumentation.js*/
// Require dependencies
const opentelemetry = require("@opentelemetry/sdk-node");
const { getNodeAutoInstrumentations } = require("@opentelemetry/auto-instrumentations-node");
const { PeriodicExportingMetricReader } = require('@opentelemetry/sdk-metrics');

const sdk = new opentelemetry.NodeSDK({
  traceExporter: new opentelemetry.tracing.ConsoleSpanExporter(),
  metricReader: new PeriodicExportingMetricReader({
    exporter: new opentelemetry.metrics.ConsoleMetricExporter()
  }),
  instrumentations: [getNodeAutoInstrumentations()]
});

sdk
  .start()
{{< /tab >}}

{{< /tabpane >}}
<!-- prettier-ignore-end -->

### Run Application

Now you can run your application as you normally would, but you can use the
`--require` flag to load the instrumentation before the application code.

<!-- prettier-ignore-start -->
{{< tabpane lang=console persistLang=false >}}

{{< tab TypeScript >}}
$ ts-node --require ./instrumentation.ts app.ts
Listening for requests on http://localhost:8080
{{< /tab >}}

{{< tab JavaScript >}}
$ node --require ./instrumentation.js app.js
Listening for requests on http://localhost:8080
{{< /tab >}}

{{< /tabpane >}}
<!-- prettier-ignore-end -->

Open <http://localhost:8080> in your web browser and reload the page a few
times, after a while you should see the spans printed in the console by the
`ConsoleSpanExporter`.

<details>
<summary>View example output</summary>

```json
{
  "traceId": "3f1fe6256ea46d19ec3ca97b3409ad6d",
  "parentId": "f0b7b340dd6e08a7",
  "name": "middleware - query",
  "id": "41a27f331c7bfed3",
  "kind": 0,
  "timestamp": 1624982589722992,
  "duration": 417,
  "attributes": {
    "http.route": "/",
    "express.name": "query",
    "express.type": "middleware"
  },
  "status": { "code": 0 },
  "events": []
}
{
  "traceId": "3f1fe6256ea46d19ec3ca97b3409ad6d",
  "parentId": "f0b7b340dd6e08a7",
  "name": "middleware - expressInit",
  "id": "e0ed537a699f652a",
  "kind": 0,
  "timestamp": 1624982589725778,
  "duration": 673,
  "attributes": {
    "http.route": "/",
    "express.name": "expressInit",
    "express.type": "middleware"
  },
  "status": { code: 0 },
  "events": []
}
{
  "traceId": "3f1fe6256ea46d19ec3ca97b3409ad6d",
  "parentId": "f0b7b340dd6e08a7",
  "name": "request handler - /",
  "id": "8614a81e1847b7ef",
  "kind": 0,
  "timestamp": 1624982589726941,
  "duration": 21,
  "attributes": {
    "http.route": "/",
    "express.name": "/",
    "express.type": "request_handler"
  },
  "status": { code: 0 },
  "events": []
}
{
  "traceId": "3f1fe6256ea46d19ec3ca97b3409ad6d",
  "parentId": undefined,
  "name": "GET /",
  "id": "f0b7b340dd6e08a7",
  "kind": 1,
  "timestamp": 1624982589720260,
  "duration": 11380,
  "attributes": {
    "http.url": "http://localhost:8080/",
    "http.host": "localhost:8080",
    "net.host.name": "localhost",
    "http.method": "GET",
    "http.route": "",
    "http.target": "/",
    "http.user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36",
    "http.flavor": "1.1",
    "net.transport": "ip_tcp",
    "net.host.ip": "::1",
    "net.host.port": 8080,
    "net.peer.ip": "::1",
    "net.peer.port": 61520,
    "http.status_code": 304,
    "http.status_text": "NOT MODIFIED"
  },
  "status": { "code": 1 },
  "events": []
}
{
  descriptor: {
    name: 'http.server.duration',
    type: 'HISTOGRAM',
    description: 'measures the duration of the inbound HTTP requests',
    unit: 'ms',
    valueType: 1
  },
  dataPointType: 0,
  dataPoints: []
}
{
  descriptor: {
    name: 'http.client.duration',
    type: 'HISTOGRAM',
    description: 'measures the duration of the outbound HTTP requests',
    unit: 'ms',
    valueType: 1
  },
  dataPointType: 0,
  dataPoints: []
}
{
  descriptor: {
    name: 'db.client.connections.usage',
    type: 'UP_DOWN_COUNTER',
    description: 'The number of connections that are currently in the state referenced by the attribute "state".',
    unit: '{connections}',
    valueType: 1
  },
  dataPointType: 3,
  dataPoints: []
}
```

</details>

## Next Steps

Enrich your instrumentation generated automatically with
[manual instrumentation](/docs/instrumentation/js/instrumentation) of your own
codebase. This gets you customized observability data.

You'll also want to configure an appropriate exporter to
[export your telemetry data](/docs/instrumentation/js/exporters) to one or more
telemetry backends.

## Troubleshooting

Did something go wrong? You can enable diagnostic logging to validate that
OpenTelemetry is initialized correctly:

<!-- prettier-ignore-start -->
{{< tabpane langEqualsHeader=true >}}

{{< tab TypeScript >}}
/*instrumentation.ts*/
import { diag, DiagConsoleLogger, DiagLogLevel } from '@opentelemetry/api';

// For troubleshooting, set the log level to DiagLogLevel.DEBUG
diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.INFO);

// const sdk = new opentelemetry.NodeSDK({...
{{< /tab >}}

{{< tab JavaScript >}}
/*instrumentation.js*/
// Require dependencies
const { diag, DiagConsoleLogger, DiagLogLevel } = require('@opentelemetry/api');

// For troubleshooting, set the log level to DiagLogLevel.DEBUG
diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.INFO);

// const sdk = new opentelemetry.NodeSDK({...
{{< /tab >}}

{{< /tabpane >}}
<!-- prettier-ignore-end -->
