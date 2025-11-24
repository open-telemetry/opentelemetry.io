---
title: Propagation
description: Context propagation for the JS SDK
weight: 65
cSpell:ignore: rolldice
---

{{% docs/languages/propagation %}}

## Automatic context propagation

[Instrumentation libraries](../libraries/) like
[`@opentelemetry/instrumentation-http`](https://www.npmjs.com/package/@opentelemetry/instrumentation-http)
or
[`@opentelemetry/instrumentation-express`](https://www.npmjs.com/package/@opentelemetry/instrumentation-express)
propagate context across services for you.

If you followed the [Getting Started Guide](../getting-started/nodejs) you can
create a client application that queries the `/rolldice` endpoint.

{{% alert title="Note" %}}

You can combine this example with the sample application from the Getting
Started guide of any other language as well. Correlation works across
applications written in different languages without any differences.

{{% /alert %}}

Start by creating a new folder called `dice-client` and install the required
dependencies:

{{< tabpane text=true >}} {{% tab TypeScript %}}

```sh
npm init -y
npm install undici \
  @opentelemetry/instrumentation-undici \
  @opentelemetry/sdk-node
npm install -D tsx  # a tool to run TypeScript (.ts) files directly with node
```

{{% /tab %}} {{% tab JavaScript %}}

```sh
npm init -y
npm install undici \
  @opentelemetry/instrumentation-undici \
  @opentelemetry/sdk-node
```

{{% /tab %}} {{< /tabpane >}}

Next, create a new file called `client.ts` (or `client.js`) with the following
content:

{{< tabpane text=true >}} {{% tab TypeScript %}}

```ts
/* client.ts */
import { NodeSDK } from '@opentelemetry/sdk-node';
import {
  SimpleSpanProcessor,
  ConsoleSpanExporter,
} from '@opentelemetry/sdk-trace-node';
import { UndiciInstrumentation } from '@opentelemetry/instrumentation-undici';

const sdk = new NodeSDK({
  spanProcessors: [new SimpleSpanProcessor(new ConsoleSpanExporter())],
  instrumentations: [new UndiciInstrumentation()],
});
sdk.start();

import { request } from 'undici';

request('http://localhost:8080/rolldice').then((response) => {
  response.body.json().then((json: any) => console.log(json));
});
```

{{% /tab %}} {{% tab JavaScript %}}

```js
/* instrumentation.mjs */
import { NodeSDK } from '@opentelemetry/sdk-node';
import {
  SimpleSpanProcessor,
  ConsoleSpanExporter,
} from '@opentelemetry/sdk-trace-node';
import { UndiciInstrumentation } from '@opentelemetry/instrumentation-undici';

const sdk = new NodeSDK({
  spanProcessors: [new SimpleSpanProcessor(new ConsoleSpanExporter())],
  instrumentations: [new UndiciInstrumentation()],
});
sdk.start();

const { request } = require('undici');

request('http://localhost:8080/rolldice').then((response) => {
  response.body.json().then((json) => console.log(json));
});
```

{{% /tab %}} {{% /tabpane %}}

Make sure that you have the instrumented version of `app.ts` (or `app.js`) from
the [Getting Started](../getting-started/nodejs) running in one shell:

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

Start a second shell and run the `client.ts` (or `client.js`):

{{< tabpane text=true >}} {{% tab TypeScript %}}

```shell
npx tsx client.ts
```

{{% /tab %}} {{% tab JavaScript %}}

```shell
node client.js
```

{{% /tab %}} {{< /tabpane >}}

Both shells should emit span details to the console. The client output looks
similar to the following:

```javascript {hl_lines=[7,11]}
{
  resource: {
    attributes: {
      // ...
    }
  },
  traceId: 'cccd19c3a2d10e589f01bfe2dc896dc2',
  parentSpanContext: undefined,
  traceState: undefined,
  name: 'GET',
  id: '6f64ce484217a7bf',
  kind: 2,
  timestamp: 1718875320295000,
  duration: 19836.833,
  attributes: {
    'url.full': 'http://localhost:8080/rolldice',
    // ...
  },
  status: { code: 0 },
  events: [],
  links: []
}
```

Take note of the traceId (`cccd19c3a2d10e589f01bfe2dc896dc2`) and ID
(`6f64ce484217a7bf`). Both can be found in the output of client as well:

```javascript {hl_lines=[6,9]}
{
  resource: {
    attributes: {
      // ...
  },
  traceId: 'cccd19c3a2d10e589f01bfe2dc896dc2',
  parentSpanContext: {
    traceId: 'cccd19c3a2d10e589f01bfe2dc896dc2',
    spanId: '6f64ce484217a7bf',
    traceFlags: 1,
    isRemote: true
  },
  traceState: undefined,
  name: 'GET /rolldice',
  id: '027c5c8b916d29da',
  kind: 1,
  timestamp: 1718875320310000,
  duration: 3894.792,
  attributes: {
    'http.url': 'http://localhost:8080/rolldice',
    // ...
  },
  status: { code: 0 },
  events: [],
  links: []
}
```

Your client and server application successfully report connected spans. If you
send both to a backend now the visualization will show this dependency for you.

## Manual context propagation

In some cases, it is not possible to propagate context automatically as outlined
in the previous section. There might not be an instrumentation library that
matches a library you're using to have services communicate with one another. Or
you might have requirements that these libraries can't fulfill even if they
existed.

When you must propagate context manually, you can use the
[context API](/docs/languages/js/context).

### Generic example

The following generic example demonstrates how you can propagate trace context
manually.

First, on the sending service, you'll need to inject the current `context`:

{{< tabpane text=true >}} {{% tab TypeScript %}}

```typescript
// Sending service
import { context, propagation, trace } from '@opentelemetry/api';

// Define an interface for the output object that will hold the trace information.
interface Carrier {
  traceparent?: string;
  tracestate?: string;
}

// Create an output object that conforms to that interface.
const output: Carrier = {};

// Serialize the traceparent and tracestate from context into
// an output object.
//
// This example uses the active trace context, but you can
// use whatever context is appropriate to your scenario.
propagation.inject(context.active(), output);

// Extract the traceparent and tracestate values from the output object.
const { traceparent, tracestate } = output;

// You can then pass the traceparent and tracestate
// data to whatever mechanism you use to propagate
// across services.
```

{{% /tab %}} {{% tab JavaScript %}}

```js
// Sending service
const { context, propagation } = require('@opentelemetry/api');
const output = {};

// Serialize the traceparent and tracestate from context into
// an output object.
//
// This example uses the active trace context, but you can
// use whatever context is appropriate to your scenario.
propagation.inject(context.active(), output);

const { traceparent, tracestate } = output;
// You can then pass the traceparent and tracestate
// data to whatever mechanism you use to propagate
// across services.
```

{{% /tab %}} {{< /tabpane >}}

On the receiving service, you'll need to extract `context` (for example, from
parsed HTTP headers) and then set them as the current trace context.

{{< tabpane text=true >}} {{% tab TypeScript %}}

```typescript
// Receiving service
import {
  type Context,
  propagation,
  trace,
  Span,
  context,
} from '@opentelemetry/api';

// Define an interface for the input object that includes 'traceparent' & 'tracestate'.
interface Carrier {
  traceparent?: string;
  tracestate?: string;
}

// Assume "input" is an object with 'traceparent' & 'tracestate' keys.
const input: Carrier = {};

// Extracts the 'traceparent' and 'tracestate' data into a context object.
//
// You can then treat this context as the active context for your
// traces.
let activeContext: Context = propagation.extract(context.active(), input);

let tracer = trace.getTracer('app-name');

let span: Span = tracer.startSpan(
  spanName,
  {
    attributes: {},
  },
  activeContext,
);

// Set the created span as active in the deserialized context.
trace.setSpan(activeContext, span);
```

{{% /tab %}} {{% tab JavaScript %}}

```js
// Receiving service
import { context, propagation, trace } from '@opentelemetry/api';

// Assume "input" is an object with 'traceparent' & 'tracestate' keys
const input = {};

// Extracts the 'traceparent' and 'tracestate' data into a context object.
//
// You can then treat this context as the active context for your
// traces.
let activeContext = propagation.extract(context.active(), input);

let tracer = trace.getTracer('app-name');

let span = tracer.startSpan(
  spanName,
  {
    attributes: {},
  },
  activeContext,
);

// Set the created span as active in the deserialized context.
trace.setSpan(activeContext, span);
```

{{% /tab %}} {{< /tabpane >}}

From there, when you have a deserialized active context, you can create spans
that will be a part of the same trace from the other service.

You can also use the [Context](/docs/languages/js/context) API to modify or set
the deserialized context in other ways.

### Custom protocol example

A common use case for when you need to propagate context manually is when you
use a custom protocol between services for communication. The following example
uses a basic text-based TCP protocol to send a serialized object from one
service to another.

Start with creating a new folder called `propagation-example` and initialize it
with dependencies as follows:

```shell
npm init -y
npm install @opentelemetry/api @opentelemetry/sdk-node
```

Next create files `client.js` and `server.js` with the following content:

```javascript
// client.js
const net = require('net');
const { context, propagation, trace } = require('@opentelemetry/api');

let tracer = trace.getTracer('client');

// Connect to the server
const client = net.createConnection({ port: 8124 }, () => {
  // Send the serialized object to the server
  let span = tracer.startActiveSpan('send', { kind: 1 }, (span) => {
    const output = {};
    propagation.inject(context.active(), output);
    const { traceparent, tracestate } = output;

    const objToSend = { key: 'value' };

    if (traceparent) {
      objToSend._meta = { traceparent, tracestate };
    }

    client.write(JSON.stringify(objToSend), () => {
      client.end();
      span.end();
    });
  });
});
```

```javascript
// server.js
const net = require('net');
const { context, propagation, trace } = require('@opentelemetry/api');

let tracer = trace.getTracer('server');

const server = net.createServer((socket) => {
  socket.on('data', (data) => {
    const message = data.toString();
    // Parse the JSON object received from the client
    try {
      const json = JSON.parse(message);
      let activeContext = context.active();
      if (json._meta) {
        activeContext = propagation.extract(context.active(), json._meta);
        delete json._meta;
      }
      span = tracer.startSpan('receive', { kind: 1 }, activeContext);
      trace.setSpan(activeContext, span);
      console.log('Parsed JSON:', json);
    } catch (e) {
      console.error('Error parsing JSON:', e.message);
    } finally {
      span.end();
    }
  });
});

// Listen on port 8124
server.listen(8124, () => {
  console.log('Server listening on port 8124');
});
```

Start a first shell to run the server:

```console
$ node server.js
Server listening on port 8124
```

Then in a second shell run the client:

```shell
node client.js
```

The client should terminate immediately and the server should output the
following:

```text
Parsed JSON: { key: 'value' }
```

Since the example so far only took dependency on the OpenTelemetry API all calls
to it are [no-op instructions](<https://en.wikipedia.org/wiki/NOP_(code)>) and
the client and server behave as if OpenTelemetry is not used.

{{% alert title="Note" color="warning" %}}

This is especially important if your server and client code are libraries, since
they should only use the OpenTelemetry API. To understand why, read the
[concept page on how to add instrumentation to your library](/docs/concepts/instrumentation/libraries/).

{{% /alert %}}

To enable OpenTelemetry and see the context propagation in action, create an
additional file called `instrumentation.js` with the following content:

```javascript
// instrumentation.mjs
import { NodeSDK } from '@opentelemetry/sdk-node';
import {
  ConsoleSpanExporter,
  SimpleSpanProcessor,
} from '@opentelemetry/sdk-trace-node';

const sdk = new NodeSDK({
  spanProcessors: [new SimpleSpanProcessor(new ConsoleSpanExporter())],
});

sdk.start();
```

Use this file to run both, the server and the client, with instrumentation
enabled:

```console
$ node --import ./instrumentation.mjs server.js
Server listening on port 8124
```

and

```shell
node --import ./instrumentation.mjs client.js
```

After the client has sent data to the server and terminated you should see spans
in the console output of both shells.

The output for the client looks like the following:

```javascript {hl_lines=[7,11]}
{
  resource: {
    attributes: {
      // ...
    }
  },
  traceId: '4b5367d540726a70afdbaf49240e6597',
  parentId: undefined,
  traceState: undefined,
  name: 'send',
  id: '92f125fa335505ec',
  kind: 1,
  timestamp: 1718879823424000,
  duration: 1054.583,
  // ...
}
```

The output for the server looks like the following:

```javascript {hl_lines=[7,8]}
{
  resource: {
    attributes: {
      // ...
    }
  },
  traceId: '4b5367d540726a70afdbaf49240e6597',
  parentId: '92f125fa335505ec',
  traceState: undefined,
  name: 'receive',
  id: '53da0c5f03cb36e5',
  kind: 1,
  timestamp: 1718879823426000,
  duration: 959.541,
  // ...
}
```

Similar to the [manual example](#manual-context-propagation) the spans are
connected using the `traceId` and the `id`/`parentId`.

## Next steps

To learn more about propagation, read the
[Propagators API specification](/docs/specs/otel/context/api-propagators/).
