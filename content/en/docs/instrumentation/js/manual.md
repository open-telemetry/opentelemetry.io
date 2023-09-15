---
title: Manual
aliases:
  - /docs/instrumentation/js/api/tracing
  - /docs/instrumentation/js/instrumentation
weight: 30
cSpell:ignore: dicelib Millis rolldice
description: Manual instrumentation for OpenTelemetry JavaScript
---

{{% docs/instrumentation/manual-intro %}}

{{% alert title="Note" color="info" %}}

On this page you will learn how you can add traces, metrics and logs to your
code _manually_. But, you are not limited to only use one kind of
instrumentation: use
[automatic instrumentation](/docs/instrumentation/js/automatic/) to get started
and then enrich your code with manual instrumentation as needed.

Also, for libraries your code depends on, you don't have to write
instrumentation code yourself, since they might come with OpenTelemetry built-in
_natively_ or you can make use of
[instrumentation libraries](/docs/instrumentation/js/libraries/).

{{% /alert %}}

## Example app preparation {#example-app}

This page uses a modified version of the example app from
[Getting Started](/docs/instrumentation/js/getting-started/nodejs/) to help you
learn about manual instrumentation.

You don't have to use the example app: if you want to instrument your own app or
library, follow the instructions here to adapt the process to your own code.

### Dependencies {#example-app-dependencies}

Create an empty NPM `package.json` file in a new directory:

```shell
npm init -y
```

Next, install Express dependencies.

{{< tabpane text=true >}} {{% tab TypeScript %}}

```sh
npm install typescript \
  ts-node \
  @types/node \
  express \
  @types/express
```

{{% /tab %}} {{% tab JavaScript %}}

```sh
npm install express
```

{{% /tab %}} {{< /tabpane >}}

### Create and launch an HTTP Server

To highlight the difference between instrumenting a _library_ and a standalone
_app_, split out the dice rolling into a _library file_, which then will be
imported as a dependency by the _app file_.

Create the _library file_ named `dice.ts` (or `dice.js` if you are not using
TypeScript) and add the following code to it:

{{< tabpane text=true langEqualsHeader=true >}} {{% tab TypeScript %}}

```ts
/*dice.ts*/
function rollOnce(min: number, max: number) {
  return Math.floor(Math.random() * (max - min) + min);
}

export function rollTheDice(rolls: number, min: number, max: number) {
  const result: number[] = [];
  for (let i = 0; i < rolls; i++) {
    result.push(rollOnce(min, max));
  }
  return result;
}
```

{{% /tab %}} {{% tab JavaScript %}}

```js
/*dice.js*/
function rollOnce(min, max) {
  return Math.floor(Math.random() * (max - min) + min);
}

function rollTheDice(rolls, min, max) {
  const result = [];
  for (let i = 0; i < rolls; i++) {
    result.push(rollOnce(min, max));
  }
  return result;
}

module.exports = { rollTheDice };
```

{{% /tab %}} {{< /tabpane >}}

Create the _app file_ named `app.ts` (or `app.js` if not using TypeScript) and
add the following code to it:

{{< tabpane text=true langEqualsHeader=true >}} {{% tab TypeScript %}}

```ts
/*app.ts*/
import express, { Request, Express } from 'express';
import { rollTheDice } from './dice';

const PORT: number = parseInt(process.env.PORT || '8080');
const app: Express = express();

app.get('/rolldice', (req, res) => {
  const rolls = req.query.rolls ? parseInt(req.query.rolls.toString()) : NaN;
  if (isNaN(rolls)) {
    res
      .status(400)
      .send("Request parameter 'rolls' is missing or not a number.");
    return;
  }
  res.send(JSON.stringify(rollTheDice(rolls, 1, 6)));
});

app.listen(PORT, () => {
  console.log(`Listening for requests on http://localhost:${PORT}`);
});
```

{{% /tab %}} {{% tab JavaScript %}}

```js
/*app.js*/
const express = require('express');
const { rollTheDice } = require('./dice.js');

const PORT = parseInt(process.env.PORT || '8080');
const app = express();

app.get('/rolldice', (req, res) => {
  const rolls = req.query.rolls ? parseInt(req.query.rolls.toString()) : NaN;
  if (isNaN(rolls)) {
    res
      .status(400)
      .send("Request parameter 'rolls' is missing or not a number.");
    return;
  }
  res.send(JSON.stringify(rollTheDice(rolls, 1, 6)));
});

app.listen(PORT, () => {
  console.log(`Listening for requests on http://localhost:${PORT}`);
});
```

{{% /tab %}} {{< /tabpane >}}

To ensure that it is working, run the application with the following command and
open <http://localhost:8080/rolldice?rolls=12> in your web browser.

{{< tabpane text=true >}} {{% tab TypeScript %}}

```console
$ npx ts-node app.ts
Listening for requests on http://localhost:8080
```

{{% /tab %}} {{% tab JavaScript %}}

```console
$ node app.js
Listening for requests on http://localhost:8080
```

{{% /tab %}} {{< /tabpane >}}

## Manual instrumentation setup

### Dependencies

Install OpenTelemetry API packages:

```shell
npm install @opentelemetry/api @opentelemetry/resources @opentelemetry/semantic-conventions
```

### Initialize the SDK

{{% alert title="Note" color="info" %}} If you’re instrumenting a library,
**skip this step**. {{% /alert %}}

If you instrument a Node.js application install the
[OpenTelemetry SDK for Node.js](https://www.npmjs.com/package/@opentelemetry/sdk-node):

```shell
npm install @opentelemetry/sdk-node
```

Before any other module in your application is loaded, you must initialize the
SDK. If you fail to initialize the SDK or initialize it too late, no-op
implementations will be provided to any library that acquires a tracer or meter
from the API.

{{< tabpane text=true langEqualsHeader=true >}} {{% tab TypeScript %}}

```ts
/*instrumentation.ts*/
import { NodeSDK } from '@opentelemetry/sdk-node';
import { ConsoleSpanExporter } from '@opentelemetry/sdk-trace-node';
import {
  PeriodicExportingMetricReader,
  ConsoleMetricExporter,
} from '@opentelemetry/sdk-metrics';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';

const sdk = new NodeSDK({
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: 'yourServiceName',
    [SemanticResourceAttributes.SERVICE_VERSION]: '1.0',
  }),
  traceExporter: new ConsoleSpanExporter(),
  metricReader: new PeriodicExportingMetricReader({
    exporter: new ConsoleMetricExporter(),
  }),
});

sdk.start();
```

{{% /tab %}} {{% tab JavaScript %}}

```js
/*instrumentation.js*/
const { NodeSDK } = require('@opentelemetry/sdk-node');
const { ConsoleSpanExporter } = require('@opentelemetry/sdk-trace-node');
const {
  PeriodicExportingMetricReader,
  ConsoleMetricExporter,
} = require('@opentelemetry/sdk-metrics');
const { Resource } = require('@opentelemetry/resources');
const {
  SemanticResourceAttributes,
} = require('@opentelemetry/semantic-conventions');

const sdk = new NodeSDK({
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: 'dice-server',
    [SemanticResourceAttributes.SERVICE_VERSION]: '0.1.0',
  }),
  traceExporter: new ConsoleSpanExporter(),
  metricReader: new PeriodicExportingMetricReader({
    exporter: new ConsoleMetricExporter(),
  }),
});

sdk.start();
```

{{% /tab %}} {{< /tabpane >}}

For debugging and local development purposes, the following example exports
telemetry to the console. After you have finished setting up manual
instrumentation, you need to configure an appropriate exporter to
[export the app's telemetry data](/docs/instrumentation/js/exporters/) to one or
more telemetry backends.

The example also sets up the mandatory SDK default attribute `service.name`,
which holds the logical name of the service, and the optional (but highly
encouraged!) attribute `service.version`, which holds the version of the service
API or implementation.

Alternative methods exist for setting up resource attributes. For more
information, see [Resources](/docs/instrumentation/js/resources/).

To verify your code, run the app by requiring the library:

{{< tabpane text=true >}} {{% tab TypeScript %}}

```sh
npx ts-node --require ./instrumentation.ts app.ts
```

{{% /tab %}} {{% tab JavaScript %}}

```sh
node --require ./instrumentation.js app.js
```

{{% /tab %}} {{< /tabpane >}}

This basic setup has no effect on your app yet. You need to add code for
[traces](#traces), [metrics](#metrics), and/or [logs](#logs).

You can register instrumentation libraries with the OpenTelemetry SDK for
Node.js in order to generate telemetry data for your dependencies. For more
information, see [Libraries](/docs/instrumentation/js/libraries/).

## Traces

### Initialize Tracing

{{% alert title="Note" color="info" %}} If you’re instrumenting a library,
**skip this step**. {{% /alert %}}

To enable [tracing](/docs/concepts/signals/traces/) in your app, you'll need to
have an initialized
[`TracerProvider`](/docs/concepts/signals/traces/#tracer-provider) that will let
you create a [`Tracer`](/docs/concepts/signals/traces/#tracer).

If a `TracerProvider` is not created, the OpenTelemetry APIs for tracing will
use a no-op implementation and fail to generate data. As explained next, modify
the `instrumentation.ts` (or `instrumentation.js`) file to include all the SDK
initialization code in Node and the browser.

#### Node.js

If you followed the instructions to [initialize the SDK](#initialize-the-sdk)
above, you have a `TracerProvider` setup for you already. You can continue with
[acquiring a tracer](#acquiring-a-tracer).

#### Browser

{{% alert title="Warning" color="warning" %}}
{{% _param notes.browser-instrumentation %}} {{% /alert %}}

First, ensure you've got the right packages:

```shell
npm install @opentelemetry/sdk-trace-web
```

Next, update `instrumentation.ts` (or `instrumentation.js`) to contain all the
SDK initialization code in it:

{{< tabpane text=true langEqualsHeader=true >}} {{% tab TypeScript %}}

```ts
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { WebTracerProvider } from '@opentelemetry/sdk-trace-web';
import {
  BatchSpanProcessor,
  ConsoleSpanExporter,
} from '@opentelemetry/sdk-trace-base';

const resource = Resource.default().merge(
  new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: 'service-name-here',
    [SemanticResourceAttributes.SERVICE_VERSION]: '0.1.0',
  }),
);

const provider = new WebTracerProvider({
  resource: resource,
});
const exporter = new ConsoleSpanExporter();
const processor = new BatchSpanProcessor(exporter);
provider.addSpanProcessor(processor);

provider.register();
```

{{% /tab %}} {{% tab JavaScript %}}

```js
const opentelemetry = require('@opentelemetry/api');
const { Resource } = require('@opentelemetry/resources');
const {
  SemanticResourceAttributes,
} = require('@opentelemetry/semantic-conventions');
const { WebTracerProvider } = require('@opentelemetry/sdk-trace-web');
const {
  ConsoleSpanExporter,
  BatchSpanProcessor,
} = require('@opentelemetry/sdk-trace-base');

const resource = Resource.default().merge(
  new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: 'service-name-here',
    [SemanticResourceAttributes.SERVICE_VERSION]: '0.1.0',
  }),
);

const provider = new WebTracerProvider({
  resource: resource,
});
const exporter = new ConsoleSpanExporter();
const processor = new BatchSpanProcessor(exporter);
provider.addSpanProcessor(processor);

provider.register();
```

{{% /tab %}} {{< /tabpane >}}

You'll need to bundle this file with your web application to be able to use
tracing throughout the rest of your web application.

This will have no effect on your app yet: you need to
[create spans](#create-spans) to have telemetry emitted by your app.

#### Picking the right span processor

By default, the Node SDK uses the `BatchSpanProcessor`, and this span processor
is also chosen in the Web SDK example. The `BatchSpanProcessor` processes spans
in batches before they are exported. This is usually the right processor to use
for an application.

In contrast, the `SimpleSpanProcessor` processes spans as they are created. This
means that if you create 5 spans, each will be processed and exported before the
next span is created in code. This can be helpful in scenarios where you do not
want to risk losing a batch, or if you're experimenting with OpenTelemetry in
development. However, it also comes with potentially significant overhead,
especially if spans are being exported over a network - each time a call to
create a span is made, it would be processed and sent over a network before your
app's execution could continue.

In most cases, stick with `BatchSpanProcessor` over `SimpleSpanProcessor`.

### Acquiring a tracer

Anywhere in your application where you write manual tracing code should call
`getTracer` to acquire a tracer. For example:

{{< tabpane text=true langEqualsHeader=true >}} {{% tab TypeScript %}}

```ts
import opentelemetry from '@opentelemetry/api';
//...

const tracer = opentelemetry.trace.getTracer(
  'instrumentation-scope-name',
  'instrumentation-scope-version',
);

// You can now use a 'tracer' to do tracing!
```

{{% /tab %}} {{% tab JavaScript %}}

```js
const opentelemetry = require('@opentelemetry/api');
//...

const tracer = opentelemetry.trace.getTracer(
  'instrumentation-scope-name',
  'instrumentation-scope-version',
);

// You can now use a 'tracer' to do tracing!
```

{{% /tab %}} {{< /tabpane >}}

The values of `instrumentation-scope-name` and `instrumentation-scope-version`
should uniquely identify the
[instrumentation scope](/docs/specs/otel/glossary/#instrumentation-scope), such
as the package, module or class name. While the name is required, the version is
still recommended despite being optional.

It's generally recommended to call `getTracer` in your app when you need it
rather than exporting the `tracer` instance to the rest of your app. This helps
avoid trickier application load issues when other required dependencies are
involved.

In the case of the [example app](#example-app), there are two places where a
tracer may be acquired with an appropriate instrumentation scope:

First, in the _application file_ `app.ts` (or `app.js`):

{{< tabpane text=true langEqualsHeader=true >}} {{% tab TypeScript %}}

```ts
/*app.ts*/
import { trace } from '@opentelemetry/api';
import express, { Express } from 'express';
import { rollTheDice } from './dice';

const tracer = trace.getTracer('dice-server', '0.1.0');

const PORT: number = parseInt(process.env.PORT || '8080');
const app: Express = express();

app.get('/rolldice', (req, res) => {
  const rolls = req.query.rolls ? parseInt(req.query.rolls.toString()) : NaN;
  if (isNaN(rolls)) {
    res
      .status(400)
      .send("Request parameter 'rolls' is missing or not a number.");
    return;
  }
  res.send(JSON.stringify(rollTheDice(rolls, 1, 6)));
});

app.listen(PORT, () => {
  console.log(`Listening for requests on http://localhost:${PORT}`);
});
```

{{% /tab %}} {{% tab JavaScript %}}

```js
/*app.js*/
const { trace } = require('@opentelemetry/api');
const express = require('express');
const { rollTheDice } = require('./dice.js');

const tracer = trace.getTracer('dice-server', '0.1.0');

const PORT = parseInt(process.env.PORT || '8080');
const app = express();

app.get('/rolldice', (req, res) => {
  const rolls = req.query.rolls ? parseInt(req.query.rolls.toString()) : NaN;
  if (isNaN(rolls)) {
    res
      .status(400)
      .send("Request parameter 'rolls' is missing or not a number.");
    return;
  }
  res.send(JSON.stringify(rollTheDice(rolls, 1, 6)));
});

app.listen(PORT, () => {
  console.log(`Listening for requests on http://localhost:${PORT}`);
});
```

{{% /tab %}} {{< /tabpane >}}

And second, in the _library file_ `dice.ts` (or `dice.js`):

{{< tabpane text=true langEqualsHeader=true >}} {{% tab TypeScript %}}

```ts
/*dice.ts*/
import { trace } from '@opentelemetry/api';

const tracer = trace.getTracer('dice-lib');

function rollOnce(min: number, max: number) {
  return Math.floor(Math.random() * (max - min) + min);
}

export function rollTheDice(rolls: number, min: number, max: number) {
  const result: number[] = [];
  for (let i = 0; i < rolls; i++) {
    result.push(rollOnce(min, max));
  }
  return result;
}
```

{{% /tab %}} {{% tab JavaScript %}}

```js
/*dice.js*/
const { trace } = require('@opentelemetry/api');

const tracer = trace.getTracer('dice-lib');

function rollOnce(min, max) {
  return Math.floor(Math.random() * (max - min) + min);
}

function rollTheDice(rolls, min, max) {
  const result = [];
  for (let i = 0; i < rolls; i++) {
    result.push(rollOnce(min, max));
  }
  return result;
}

module.exports = { rollTheDice };
```

{{% /tab %}} {{< /tabpane >}}

### Create spans

Now that you have [tracers](/docs/concepts/signals/traces/#tracer) initialized,
you can create [spans](/docs/concepts/signals/traces/#spans).

The API of OpenTelemetry JavaScript exposes two methods that allow you to create
spans:

- [`tracer.startSpan`](https://open-telemetry.github.io/opentelemetry-js/interfaces/_opentelemetry_api.Tracer.html#startSpan):
  Starts a new span without setting it on context.
- [`tracer.startActiveSpan`](https://open-telemetry.github.io/opentelemetry-js/interfaces/_opentelemetry_api.Tracer.html#startActiveSpan):
  Starts a new span and calls the given callback function passing it the created
  span as first argument. The new span gets set in context and this context is
  activated for the duration of the function call.

In most cases you want to use the latter (`tracer.startActiveSpan`), as it takes
care of setting the span and its context active.

The code below illustrates how to create an active span.

{{< tabpane text=true langEqualsHeader=true >}} {{% tab TypeScript %}}

```ts
import { trace, Span } from '@opentelemetry/api';

/* ... */

export function rollTheDice(rolls: number, min: number, max: number) {
  // Create a span. A span must be closed.
  return tracer.startActiveSpan('rollTheDice', (span: Span) => {
    const result: number[] = [];
    for (let i = 0; i < rolls; i++) {
      result.push(rollOnce(min, max));
    }
    // Be sure to end the span!
    span.end();
    return result;
  });
}
```

{{% /tab %}} {{% tab JavaScript %}}

```js
function rollTheDice(rolls, min, max) {
  // Create a span. A span must be closed.
  return tracer.startActiveSpan('rollTheDice', (span) => {
    const result = [];
    for (let i = 0; i < rolls; i++) {
      result.push(rollOnce(min, max));
    }
    // Be sure to end the span!
    span.end();
    return result;
  });
}
```

{{% /tab %}} {{< /tabpane >}}

If you followed the instructions using the [example app](#example-app) up to
this point, you can copy the code above in your library file `dice.ts` (or
`dice.js`). You should now be able to see spans emitted from your app.

Start your app as follows, and then send it requests by visiting
<http://localhost:8080/rolldice?rolls=12> with your browser or `curl`.

{{< tabpane text=true >}} {{% tab TypeScript %}}

```sh
ts-node --require ./instrumentation.ts app.ts
```

{{% /tab %}} {{% tab JavaScript %}}

```sh
node --require ./instrumentation.js app.js
```

{{% /tab %}} {{< /tabpane >}}

After a while, you should see the spans printed in the console by the
`ConsoleSpanExporter`, something like this:

```json
{
  "traceId": "6cc927a05e7f573e63f806a2e9bb7da8",
  "parentId": undefined,
  "name": "rollTheDice",
  "id": "117d98e8add5dc80",
  "kind": 0,
  "timestamp": 1688386291908349,
  "duration": 501,
  "attributes": {},
  "status": { "code": 0 },
  "events": [],
  "links": []
}
```

### Create nested spans

Nested [spans](/docs/concepts/signals/traces/#spans) let you track work that's
nested in nature. For example, the `rollOnce()` function below represents a
nested operation. The following sample creates a nested span that tracks
`rollOnce()`:

{{< tabpane text=true langEqualsHeader=true >}} {{% tab TypeScript %}}

```ts
function rollOnce(i: number, min: number, max: number) {
  return tracer.startActiveSpan(`rollOnce:${i}`, (span: Span) => {
    const result = Math.floor(Math.random() * (max - min) + min);
    span.end();
    return result;
  });
}

export function rollTheDice(rolls: number, min: number, max: number) {
  // Create a span. A span must be closed.
  return tracer.startActiveSpan('rollTheDice', (parentSpan: Span) => {
    const result: number[] = [];
    for (let i = 0; i < rolls; i++) {
      result.push(rollOnce(i, min, max));
    }
    // Be sure to end the span!
    parentSpan.end();
    return result;
  });
}
```

{{% /tab %}} {{% tab JavaScript %}}

```js
function rollOnce(i, min, max) {
  return tracer.startActiveSpan(`rollOnce:${i}`, (span) => {
    const result = Math.floor(Math.random() * (max - min) + min);
    span.end();
    return result;
  });
}

function rollTheDice(rolls, min, max) {
  // Create a span. A span must be closed.
  return tracer.startActiveSpan('rollTheDice', (parentSpan) => {
    const result = [];
    for (let i = 0; i < rolls; i++) {
      result.push(rollOnce(i, min, max));
    }
    // Be sure to end the span!
    parentSpan.end();
    return result;
  });
}
```

{{% /tab %}} {{< /tabpane >}}

This code creates a child span for each _roll_ that has `parentSpan`'s ID as
their parent ID:

```json
{
  "traceId": "ff1d39e648a3dc53ba710e1bf1b86e06",
  "parentId": "9214ff209e6a8267",
  "name": "rollOnce:4",
  "id": "7eccf70703e2bccd",
  "kind": 0,
  "timestamp": 1688387049511591,
  "duration": 22,
  "attributes": {},
  "status": { "code": 0 },
  "events": [],
  "links": []
}
{
  "traceId": "ff1d39e648a3dc53ba710e1bf1b86e06",
  "parentId": undefined,
  "name": "rollTheDice",
  "id": "9214ff209e6a8267",
  "kind": 0,
  "timestamp": 1688387049510303,
  "duration": 1314,
  "attributes": {},
  "status": { "code": 0 },
  "events": [],
  "links": []
}
```

### Create independent spans

The previous examples showed how to create an active span. In some cases, you'll
want to create inactive spans that are siblings of one another rather than being
nested.

```javascript
const doWork = () => {
  const span1 = tracer.startSpan('work-1');
  // do some work
  const span2 = tracer.startSpan('work-2');
  // do some more work
  const span3 = tracer.startSpan('work-3');
  // do even more work

  span1.end();
  span2.end();
  span3.end();
};
```

In this example, `span1`, `span2`, and `span3` are sibling spans and none of
them are considered the currently active span. They share the same parent rather
than being nested under one another.

This arrangement can be helpful if you have units of work that are grouped
together but are conceptually independent from one another.

### Get the current span

Sometimes it's helpful to do something with the current/active
[span](/docs/concepts/signals/traces/#spans) at a particular point in program
execution.

```js
const activeSpan = opentelemetry.trace.getActiveSpan();

// do something with the active span, optionally ending it if that is appropriate for your use case.
```

### Get a span from context

It can also be helpful to get the [span](/docs/concepts/signals/traces/#spans)
from a given context that isn't necessarily the active span.

```js
const ctx = getContextFromSomewhere();
const span = opentelemetry.trace.getSpan(ctx);

// do something with the acquired span, optionally ending it if that is appropriate for your use case.
```

### Attributes

[Attributes](/docs/concepts/signals/traces/#attributes) let you attach key/value
pairs to a [`Span`](/docs/concepts/signals/traces/#spans) so it carries more
information about the current operation that it's tracking.

{{< tabpane text=true langEqualsHeader=true >}} {{% tab TypeScript %}}

```ts
function rollOnce(i: number, min: number, max: number) {
  return tracer.startActiveSpan(`rollOnce:${i}`, (span: Span) => {
    const result = Math.floor(Math.random() * (max - min) + min);

    // Add an attribute to the span
    span.setAttribute('dicelib.rolled', result.toString());

    span.end();
    return result;
  });
}
```

{{% /tab %}} {{% tab JavaScript %}}

```js
function rollOnce(i, min, max) {
  return tracer.startActiveSpan(`rollOnce:${i}`, (span) => {
    const result = Math.floor(Math.random() * (max - min) + min);

    // Add an attribute to the span
    span.setAttribute('dicelib.rolled', result.toString());

    span.end();
    return result;
  });
}
```

{{% /tab %}} {{< /tabpane >}}

You can also add attributes to a span as it's created:

```javascript
tracer.startActiveSpan(
  'app.new-span',
  { attributes: { attribute1: 'value1' } },
  (span) => {
    // do some work...

    span.end();
  },
);
```

{{< tabpane text=true langEqualsHeader=true >}} {{% tab TypeScript %}}

```ts
function rollTheDice(rolls: number, min: number, max: number) {
  return tracer.startActiveSpan(
    'rollTheDice',
    { attributes: { 'dicelib.rolls': rolls.toString() } },
    (span: Span) => {
      /* ... */
    },
  );
}
```

{{% /tab %}} {{% tab JavaScript %}}

```js
function rollTheDice(rolls, min, max) {
  return tracer.startActiveSpan(
    'rollTheDice',
    { attributes: { 'dicelib.rolls': rolls.toString() } },
    (span) => {
      /* ... */
    },
  );
}
```

{{% /tab %}} {{< /tabpane >}}

#### Semantic Attributes

There are semantic conventions for spans representing operations in well-known
protocols like HTTP or database calls. Semantic conventions for these spans are
defined in the specification at
[Trace Semantic Conventions](/docs/specs/otel/trace/semantic_conventions/). In
the simple example of this guide the source code attributes can be used.

First add the semantic conventions as a dependency to your application:

```shell
npm install --save @opentelemetry/semantic-conventions
```

Add the following to the top of your application file:

{{< tabpane text=true langEqualsHeader=true >}} {{% tab TypeScript %}}

```ts
import { SemanticAttributes } from '@opentelemetry/semantic-conventions';
```

{{% /tab %}} {{% tab JavaScript %}}

```js
const { SemanticAttributes } = require('@opentelemetry/semantic-conventions');
```

{{% /tab %}} {{< /tabpane >}}

Finally, you can update your file to include semantic attributes:

```javascript
const doWork = () => {
  tracer.startActiveSpan('app.doWork', (span) => {
    span.setAttribute(SemanticAttributes.CODE_FUNCTION, 'doWork');
    span.setAttribute(SemanticAttributes.CODE_FILEPATH, __filename);

    // Do some work...

    span.end();
  });
};
```

### Span events

A [Span Event](/docs/concepts/signals/traces/#span-events) is a human-readable
message on an [`Span`](/docs/concepts/signals/traces/#spans) that represents a
discrete event with no duration that can be tracked by a single timestamp. You
can think of it like a primitive log.

```js
span.addEvent('Doing something');

const result = doWork();
```

You can also create Span Events with additional
[Attributes](/docs/concepts/signals/traces/#attributes):

```js
span.addEvent('some log', {
  'log.severity': 'error',
  'log.message': 'Data not found',
  'request.id': requestId,
});
```

### Span links

[`Span`s](/docs/concepts/signals/traces/#spans) can be created with zero or more
[`Link`s](/docs/concepts/signals/traces/#span-links) to other Spans that are
causally related. A common scenario is to correlate one or more traces with the
current span.

```js
const someFunction = (spanToLinkFrom) => {
  const options = {
    links: [
      {
         context: spanToLinkFrom.spanContext()
      }
    ]
  };

  tracer.startActiveSpan('app.someFunction', options: options, span => {
    // Do some work...

    span.end();
  });
}
```

### Span Status

A [status](/docs/concepts/signals/traces/#span-status) can be set on a span,
typically used to specify that a span has not completed successfully -
`SpanStatusCode.ERROR`.

The status can be set at any time before the span is finished:

{{< tabpane text=true langEqualsHeader=true >}} {{% tab TypeScript %}}

```ts
import opentelemetry, { SpanStatusCode } from '@opentelemetry/api';

// ...

tracer.startActiveSpan('app.doWork', (span) => {
  for (let i = 0; i <= Math.floor(Math.random() * 40000000); i += 1) {
    if (i > 10000) {
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: 'Error',
      });
    }
  }

  span.end();
});
```

{{% /tab %}} {{% tab JavaScript %}}

```js
const opentelemetry = require('@opentelemetry/api');

// ...

tracer.startActiveSpan('app.doWork', (span) => {
  for (let i = 0; i <= Math.floor(Math.random() * 40000000); i += 1) {
    if (i > 10000) {
      span.setStatus({
        code: opentelemetry.SpanStatusCode.ERROR,
        message: 'Error',
      });
    }
  }

  span.end();
});
```

{{% /tab %}} {{< /tabpane >}}

By default, the status for all spans is `Unset` rather than `Ok`. It is
typically the job of another component in your telemetry pipeline to interpret
the `Unset` status of a span, so it's best not to override this unless you're
explicitly tracking an error.

### Recording exceptions

It can be a good idea to record exceptions when they happen. It's recommended to
do this in conjunction with setting [span status](#span-status).

{{< tabpane text=true langEqualsHeader=true >}} {{% tab TypeScript %}}

```ts
import opentelemetry, { SpanStatusCode } from '@opentelemetry/api';

// ...

try {
  doWork();
} catch (ex) {
  span.recordException(ex);
  span.setStatus({ code: SpanStatusCode.ERROR });
}
```

{{% /tab %}} {{% tab JavaScript %}}

```js
const opentelemetry = require('@opentelemetry/api');

// ...

try {
  doWork();
} catch (ex) {
  span.recordException(ex);
  span.setStatus({ code: opentelemetry.SpanStatusCode.ERROR });
}
```

{{% /tab %}} {{< /tabpane >}}

### Using `sdk-trace-base` and manually propagating span context

In some cases, you may not be able to use either the Node.js SDK nor the Web
SDK. The biggest difference, aside from initialization code, is that you'll have
to manually set spans as active in the current context to be able to create
nested spans.

#### Initializing tracing with `sdk-trace-base`

Initializing tracing is similar to how you'd do it with Node.js or the Web SDK.

{{< tabpane text=true langEqualsHeader=true >}} {{% tab TypeScript %}}

```ts
import opentelemetry from '@opentelemetry/api';
import {
  BasicTracerProvider,
  BatchSpanProcessor,
  ConsoleSpanExporter,
} from '@opentelemetry/sdk-trace-base';

const provider = new BasicTracerProvider();

// Configure span processor to send spans to the exporter
provider.addSpanProcessor(new BatchSpanProcessor(new ConsoleSpanExporter()));
provider.register();

// This is what we'll access in all instrumentation code
const tracer = opentelemetry.trace.getTracer('example-basic-tracer-node');
```

{{% /tab %}} {{% tab JavaScript %}}

```js
const opentelemetry = require('@opentelemetry/api');
const {
  BasicTracerProvider,
  ConsoleSpanExporter,
  BatchSpanProcessor,
} = require('@opentelemetry/sdk-trace-base');

const provider = new BasicTracerProvider();

// Configure span processor to send spans to the exporter
provider.addSpanProcessor(new BatchSpanProcessor(new ConsoleSpanExporter()));
provider.register();

// This is what we'll access in all instrumentation code
const tracer = opentelemetry.trace.getTracer('example-basic-tracer-node');
```

{{% /tab %}} {{< /tabpane >}}

Like the other examples in this document, this exports a tracer you can use
throughout the app.

#### Creating nested spans with `sdk-trace-base`

To create nested spans, you need to set whatever the currently-created span is
as the active span in the current context. Don't bother using `startActiveSpan`
because it won't do this for you.

```javascript
const mainWork = () => {
  const parentSpan = tracer.startSpan('main');

  for (let i = 0; i < 3; i += 1) {
    doWork(parentSpan, i);
  }

  // Be sure to end the parent span!
  parentSpan.end();
};

const doWork = (parent, i) => {
  // To create a child span, we need to mark the current (parent) span as the active span
  // in the context, then use the resulting context to create a child span.
  const ctx = opentelemetry.trace.setSpan(
    opentelemetry.context.active(),
    parent,
  );
  const span = tracer.startSpan(`doWork:${i}`, undefined, ctx);

  // simulate some random work.
  for (let i = 0; i <= Math.floor(Math.random() * 40000000); i += 1) {
    // empty
  }

  // Make sure to end this child span! If you don't,
  // it will continue to track work beyond 'doWork'!
  span.end();
};
```

All other APIs behave the same when you use `sdk-trace-base` compared with the
Node.js or Web SDKs.

## Metrics

To start producing [metrics](/docs/concepts/signals/metrics), you'll need to
have an initialized `MeterProvider` that lets you create a `Meter`. `Meter`s let
you create `Instrument`s that you can use to create different kinds of metrics.
OpenTelemetry JavaScript currently supports the following `Instrument`s:

- Counter, a synchronous instrument that supports non-negative increments
- Asynchronous Counter, an asynchronous instrument which supports non-negative
  increments
- Histogram, a synchronous instrument that supports arbitrary values that are
  statistically meaningful, such as histograms, summaries, or percentile
- Asynchronous Gauge, an asynchronous instrument that supports non-additive
  values, such as room temperature
- UpDownCounter, a synchronous instrument that supports increments and
  decrements, such as the number of active requests
- Asynchronous UpDownCounter, an asynchronous instrument that supports
  increments and decrements

For more on synchronous and asynchronous instruments, and which kind is best
suited for your use case, see
[Supplementary Guidelines](/docs/specs/otel/metrics/supplementary-guidelines/).

If a `MeterProvider` is not created either by an instrumentation library or
manually, the OpenTelemetry Metrics API will use a no-op implementation and fail
to generate data.

### Initialize Metrics

{{% alert color="info" %}} If you’re instrumenting a library, skip this step.
{{% /alert %}}

To enable [metrics](/docs/concepts/signals/metrics/) in your app, you'll need to
have an initialized
[`MeterProvider`](/docs/concepts/signals/metrics/#meter-provider) that will let
you create a [`Meter`](/docs/concepts/signals/metrics/#meter).

If a `MeterProvider` is not created, the OpenTelemetry APIs for metrics will use
a no-op implementation and fail to generate data. As explained next, modify the
`instrumentation.ts` (or `instrumentation.js`) file to include all the SDK
initialization code in Node and the browser.

#### Node.js {#initialize-metrics-nodejs}

If you followed the instructions to [initialize the SDK](#initialize-the-sdk)
above, you have a `MeterProvider` setup for you already. You can continue with
[acquiring a meter](#acquiring-a-meter).

##### Initializing metrics with `sdk-metrics`

In some cases you may not be able or may not want to use the
[full OpenTelemetry SDK for Node.js](https://www.npmjs.com/package/@opentelemetry/sdk-node).
This is also true if you want to use OpenTelemetry JavaScript in the browser.

If so, you can initialize metrics with the `@opentelemetry/sdk-metrics` package:

```shell
npm install @opentelemetry/sdk-metrics
```

If you have not created it for tracing already, create a separate
`instrumentation.ts` (or `instrumentation.js`) file that has all the SDK
initialization code in it:

{{< tabpane text=true langEqualsHeader=true >}} {{% tab TypeScript %}}

```ts
import opentelemetry from '@opentelemetry/api';
import {
  ConsoleMetricExporter,
  MeterProvider,
  PeriodicExportingMetricReader,
} from '@opentelemetry/sdk-metrics';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';

const resource = Resource.default().merge(
  new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: 'dice-server',
    [SemanticResourceAttributes.SERVICE_VERSION]: '0.1.0',
  }),
);

const metricReader = new PeriodicExportingMetricReader({
  exporter: new ConsoleMetricExporter(),

  // Default is 60000ms (60 seconds). Set to 3 seconds for demonstrative purposes only.
  exportIntervalMillis: 3000,
});

const myServiceMeterProvider = new MeterProvider({
  resource: resource,
});

myServiceMeterProvider.addMetricReader(metricReader);

// Set this MeterProvider to be global to the app being instrumented.
opentelemetry.metrics.setGlobalMeterProvider(myServiceMeterProvider);
```

{{% /tab %}} {{% tab JavaScript %}}

```js
const opentelemetry = require('@opentelemetry/api');
const {
  MeterProvider,
  PeriodicExportingMetricReader,
  ConsoleMetricExporter,
} = require('@opentelemetry/sdk-metrics');
const { Resource } = require('@opentelemetry/resources');
const {
  SemanticResourceAttributes,
} = require('@opentelemetry/semantic-conventions');

const resource = Resource.default().merge(
  new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: 'service-name-here',
    [SemanticResourceAttributes.SERVICE_VERSION]: '0.1.0',
  }),
);

const metricReader = new PeriodicExportingMetricReader({
  exporter: new ConsoleMetricExporter(),

  // Default is 60000ms (60 seconds). Set to 3 seconds for demonstrative purposes only.
  exportIntervalMillis: 3000,
});

const myServiceMeterProvider = new MeterProvider({
  resource: resource,
});

myServiceMeterProvider.addMetricReader(metricReader);

// Set this MeterProvider to be global to the app being instrumented.
opentelemetry.metrics.setGlobalMeterProvider(myServiceMeterProvider);
```

{{% /tab %}} {{< /tabpane >}}

You'll need to `--require` this file when you run your app, such as:

{{< tabpane text=true >}} {{% tab TypeScript %}}

```sh
ts-node --require ./instrumentation.ts app.ts
```

{{% /tab %}} {{% tab JavaScript %}}

```sh
node --require ./instrumentation.js app.js
```

{{% /tab %}} {{< /tabpane >}}

Now that a `MeterProvider` is configured, you can acquire a `Meter`.

### Acquiring a Meter

Anywhere in your application where you have manually instrumented code you can
call `getMeter` to acquire a meter. For example:

{{< tabpane text=true langEqualsHeader=true >}} {{% tab TypeScript %}}

```ts
import opentelemetry from '@opentelemetry/api';

const myMeter = opentelemetry.metrics.getMeter('my-service-meter');

// You can now use a 'meter' to create instruments!
```

{{% /tab %}} {{% tab JavaScript %}}

```js
const opentelemetry = require('@opentelemetry/api');

const myMeter = opentelemetry.metrics.getMeter('my-service-meter');

// You can now use a 'meter' to create instruments!
```

{{% /tab %}} {{< /tabpane >}}

It’s generally recommended to call `getMeter` in your app when you need it
rather than exporting the meter instance to the rest of your app. This helps
avoid trickier application load issues when other required dependencies are
involved.

### Synchronous and asynchronous instruments

OpenTelemetry instruments are either synchronous or asynchronous (observable).

Synchronous instruments take a measurement when they are called. The measurement
is done as another call during program execution, just like any other function
call. Periodically, the aggregation of these measurements is exported by a
configured exporter. Because measurements are decoupled from exporting values,
an export cycle may contain zero or multiple aggregated measurements.

Asynchronous instruments, on the other hand, provide a measurement at the
request of the SDK. When the SDK exports, a callback that was provided to the
instrument on creation is invoked. This callback provides the SDK with a
measurement that is immediately exported. All measurements on asynchronous
instruments are performed once per export cycle.

Asynchronous instruments are useful in several circumstances, such as:

- When updating a counter is not computationally cheap, and you don't want the
  current executing thread to wait for the measurement
- Observations need to happen at frequencies unrelated to program execution
  (i.e., they cannot be accurately measured when tied to a request lifecycle)
- There is no known timestamp for a measurement value

In cases like these, it's often better to observe a cumulative value directly,
rather than aggregate a series of deltas in post-processing (the synchronous
example). Take note of the use of `observe` rather than `add` in the appropriate
code examples below.

### Using Counters

Counters can be used to measure a non-negative, increasing value.

```js
const counter = myMeter.createCounter('events.counter');

//...

counter.add(1);
```

### Using UpDown Counters

UpDown counters can increment and decrement, allowing you to observe a
cumulative value that goes up or down.

```js
const counter = myMeter.createUpDownCounter('events.counter');

//...

counter.add(1);

//...

counter.add(-1);
```

### Using Histograms

Histograms are used to measure a distribution of values over time.

For example, here's how you report a distribution of response times for an
API route with Express:

{{< tabpane text=true langEqualsHeader=true >}} {{% tab TypeScript %}}

```ts
import express from 'express';

const app = express();

app.get('/', (_req, _res) => {
  const histogram = myMeter.createHistogram('task.duration');
  const startTime = new Date().getTime();

  // do some work in an API call

  const endTime = new Date().getTime();
  const executionTime = endTime - startTime;

  // Record the duration of the task operation
  histogram.record(executionTime);
});
```

{{% /tab %}} {{% tab JavaScript %}}

```js
const express = require('express');

const app = express();

app.get('/', (_req, _res) => {
  const histogram = myMeter.createHistogram('task.duration');
  const startTime = new Date().getTime();

  // do some work in an API call

  const endTime = new Date().getTime();
  const executionTime = endTime - startTime;

  // Record the duration of the task operation
  histogram.record(executionTime);
});
```

{{% /tab %}} {{< /tabpane >}}

### Using Observable (Async) Counters

Observable counters can be used to measure an additive, non-negative,
monotonically increasing value.

```js
let events = [];

const addEvent = (name) => {
  events = append(events, name);
};

const counter = myMeter.createObservableCounter('events.counter');

counter.addCallback((result) => {
  result.observe(len(events));
});

//... calls to addEvent
```

### Using Observable (Async) UpDown Counters

Observable UpDown counters can increment and decrement, allowing you to measure
an additive, non-negative, non-monotonically increasing cumulative value.

```js
let events = [];

const addEvent = (name) => {
  events = append(events, name);
};

const removeEvent = () => {
  events.pop();
};

const counter = myMeter.createObservableUpDownCounter('events.counter');

counter.addCallback((result) => {
  result.observe(len(events));
});

//... calls to addEvent and removeEvent
```

### Using Observable (Async) Gauges

Observable Gauges should be used to measure non-additive values.

```js
let temperature = 32;

const gauge = myMeter.createObservableGauge('temperature.gauge');

gauge.addCallback((result) => {
  result.observe(temperature);
});

//... temperature variable is modified by a sensor
```

### Describing instruments

When you create instruments like counters, histograms, etc. you can give them a
description.

```js
const httpServerResponseDuration = myMeter.createHistogram(
  'http.server.duration',
  {
    description: 'A distribution of the HTTP server response times',
    unit: 'milliseconds',
    valueType: ValueType.INT,
  },
);
```

In JavaScript, each configuration type means the following:

- `description` - a human-readable description for the instrument
- `unit` - The description of the unit of measure that the value is intended to
  represent. For example, `milliseconds` to measure duration, or `bytes` to
  count number of bytes.
- `valueType` - The kind of numeric value used in measurements.

It's generally recommended to describe each instrument you create.

### Adding attributes

You can add Attributes to metrics when they are generated.

```js
const counter = myMeter.createCounter('my.counter');

counter.add(1, { 'some.optional.attribute': 'some value' });
```

### Configure Metric Views

A Metric View provides developers with the ability to customize metrics exposed
by the Metrics SDK.

#### Selectors

To instantiate a view, one must first select a target instrument. The following
are valid selectors for metrics:

- `instrumentType`
- `instrumentName`
- `meterName`
- `meterVersion`
- `meterSchemaUrl`

Selecting by `instrumentName` (of type string) has support for wildcards, so you
can select all instruments using `*` or select all instruments whose name starts
with `http` by using `http*`.

#### Examples

Filter attributes on all metric types:

```js
const limitAttributesView = new View({
  // only export the attribute 'environment'
  attributeKeys: ['environment'],
  // apply the view to all instruments
  instrumentName: '*',
});
```

Drop all instruments with the meter name `pubsub`:

```js
const dropView = new View({
  aggregation: new DropAggregation(),
  meterName: 'pubsub',
});
```

Define explicit bucket sizes for the Histogram named `http.server.duration`:

```js
const histogramView = new View({
  aggregation: new ExplicitBucketHistogramAggregation([
    0, 1, 5, 10, 15, 20, 25, 30,
  ]),
  instrumentName: 'http.server.duration',
  instrumentType: InstrumentType.HISTOGRAM,
});
```

#### Attach to meter provider

Once views have been configured, attach them to the corresponding meter
provider:

```js
const meterProvider = new MeterProvider({
  views: [limitAttributesView, dropView, histogramView],
});
```

## Logs

The logs API & SDK are currently under development.

## Next steps

You'll also want to configure an appropriate exporter to
[export your telemetry data](/docs/instrumentation/js/exporters) to one or more
telemetry backends.
