---
title: Node.js
aliases: [/docs/js/getting_started/nodejs]
---

This guide will show you how to get started with tracing in Node.js.

## Prerequisites

Ensure that you have the following installed locally:

- [Node.js](https://nodejs.org/en/download/)
- [TypeScript](https://www.typescriptlang.org/download), if you will be using
  TypeScript.

## Example Application

This is a small example application we will monitor in this guide.

### Dependencies

Create an empty package.json:

```shell
npm init -f
```

Install dependencies used by the example.

<!-- prettier-ignore-start -->
{{< tabpane lang=shell persistLang=false >}}

{{< tab TypeScript >}}
npm install express typescript ts-node @types/express @types/node
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

## Tracing

### Dependencies

The following dependencies are required to trace a Node.js application.

#### Core Dependencies

These dependencies are required to configure the tracing SDK and create spans.

```shell
npm install @opentelemetry/sdk-node @opentelemetry/api
```

#### Exporter

In the following example, we will use the `ConsoleSpanExporter` which prints all
spans to the console.

In order to visualize and analyze your traces, you will need to export them to a
tracing backend. Follow [these instructions](../../exporters) for setting up a
backend and exporter.

You may also want to use the `BatchSpanProcessor` to export spans in batches in
order to more efficiently use resources.

#### Instrumentation Modules

Many common modules such as the `http` standard library module, `express`, and
others can be automatically instrumented using autoinstrumentation modules. To
find autoinstrumentation modules, you can look at the
[registry](/ecosystem/registry/?language=js&component=instrumentation).

You can also install all instrumentations maintained by the OpenTelemetry
authors by using the `@opentelemetry/auto-instrumentations-node` module.

```shell
npm install @opentelemetry/auto-instrumentations-node
```

### Setup

The tracing setup and configuration should be run before your application code.
One tool commonly used for this task is the
[`-r, --require module`](https://nodejs.org/api/cli.html#cli_r_require_module)
flag.

Create a file named `tracing.ts|js`, which will contain your tracing setup code.

<!-- prettier-ignore-start -->
{{< tabpane langEqualsHeader=true >}}

{{< tab TypeScript >}}
/*tracing.ts*/
// Require dependencies
import * as opentelemetry from "@opentelemetry/sdk-node";
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { diag, DiagConsoleLogger, DiagLogLevel } from '@opentelemetry/api';

// For troubleshooting, set the log level to DiagLogLevel.DEBUG
diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.INFO);

const sdk = new opentelemetry.NodeSDK({
  traceExporter: new opentelemetry.tracing.ConsoleSpanExporter(),
  instrumentations: [getNodeAutoInstrumentations()]
});

sdk.start()
{{< /tab >}}

{{< tab JavaScript >}}
/*tracing.js*/
// Require dependencies
const opentelemetry = require("@opentelemetry/sdk-node");
const { getNodeAutoInstrumentations } = require("@opentelemetry/auto-instrumentations-node");
const { diag, DiagConsoleLogger, DiagLogLevel } = require('@opentelemetry/api');

// For troubleshooting, set the log level to DiagLogLevel.DEBUG
diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.INFO);

const sdk = new opentelemetry.NodeSDK({
  traceExporter: new opentelemetry.tracing.ConsoleSpanExporter(),
  instrumentations: [getNodeAutoInstrumentations()]
});

sdk.start()
{{< /tab >}}

{{< /tabpane >}}
<!-- prettier-ignore-end -->

### Run Application

Now you can run your application as you normally would, but you can use the
`--require` flag to load the tracing code before the application code.

<!-- prettier-ignore-start -->
{{< tabpane lang=console persistLang=false >}}

{{< tab TypeScript >}}
$ ts-node --require './tracing.ts' app.ts
Listening for requests on http://localhost:8080
{{< /tab >}}

{{< tab JavaScript >}}
$ node --require './tracing.js' app.js
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

Did something go wrong? Remember that you need to explicitly enable logging in
order to see logs from OpenTelemetry:

<!-- prettier-ignore-start -->
{{< tabpane langEqualsHeader=true >}}

{{< tab TypeScript >}}
/*tracing.ts*/
import { diag, DiagConsoleLogger, DiagLogLevel } from '@opentelemetry/api';

// For troubleshooting, set the log level to DiagLogLevel.DEBUG
diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.INFO);

// const sdk = new opentelemetry.NodeSDK({...
{{< /tab >}}

{{< tab JavaScript >}}
/*tracing.js*/
// Require dependencies
const { diag, DiagConsoleLogger, DiagLogLevel } = require('@opentelemetry/api');

// For troubleshooting, set the log level to DiagLogLevel.DEBUG
diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.INFO);

// const sdk = new opentelemetry.NodeSDK({...
{{< /tab >}}

{{< /tabpane >}}
<!-- prettier-ignore-end -->
