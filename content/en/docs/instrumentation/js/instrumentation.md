---
title: Instrumentation
weight: 3
---

This guide will cover creating and annotating spans, creating and annotating metrics, how to pass context, and a guide to automatic instrumentation for JavaScript. This simple example works in the browser as well as with Node.js

## Example Application

In the following this guide will use the following sample app:

```javascript
'use strict';

for (let i = 0; i < 10; i += 1) {
  doWork();
}

function doWork() {
  console.log('work...');
  // simulate some random work.
  for (let i = 0; i <= Math.floor(Math.random() * 40000000); i += 1) {}
}
```

## Initializing a Tracer

As you have learned in the previous [Getting Started][] guide you need a
TracerProvider and an Exporter. Install the dependencies and add them to the head of
your application code to get started:

```shell
npm install @opentelemetry/api
npm install @opentelemetry/sdk-trace-base
```

Next, initialize a tracer, preferably in a separate file (e.g., `instrumentation-setup.js`):

```javascript
const {
  BasicTracerProvider,
  ConsoleSpanExporter,
  SimpleSpanProcessor,
} = require('@opentelemetry/sdk-trace-base');
const opentelemetry = require('@opentelemetry/api');

const provider = new BasicTracerProvider();

// Configure span processor to send spans to the exporter
provider.addSpanProcessor(new SimpleSpanProcessor(new ConsoleSpanExporter()));
provider.register();

// This is what we'll access in all instrumentation code
export const tracer = opentelemetry.trace.getTracer(
  'example-basic-tracer-node'
);
```

This registers a tracer provider with the OpenTelemetry API as the global tracer provider, and exports a tracer instance that you can use to create spans.

If you do not register a global tracer provider, any instrumentation calls will be a no-op, so this is important to do!

## Create spans

Add a first span to the sample application. Modify your code like the following:

```javascript
// Create a span. A span must be closed.
const parentSpan = tracer.startSpan('main');
for (let i = 0; i < 10; i += 1) {
  doWork(parentSpan);
}
// Be sure to end the span.
parentSpan.end();
```

Run your application and you will see traces being exported to the console:

```json
{
  "traceId": "833bac85797c7ace581235446c4c769a",
  "parentId": undefined,
  "name": "main",
  "id": "5c82d9e39d58229e",
  "kind": 0,
  "timestamp": 1603790966012813,
  "duration": 13295,
  "attributes": {},
  "status": { "code": 0 },
  "events": []
}
```

## Create nested spans

Nested spans let you track work that's nested in nature. For example, the `doWork` function below represents a nested operation. The following sample creates a nested span that tracks the `doWork` function:

```javascript
// Create a span. A span must be closed.
const parentSpan = tracer.startSpan('main');
for (let i = 0; i < 10; i += 1) {
  doWork(parentSpan);
}

/* ... */

function doWork(parent) {
  // Start another span. In this example, the main function already started a
  // span, so that'll be the parent span, and this will be a child span.
  const ctx = opentelemetry.trace.setSpan(
    opentelemetry.context.active(),
    parent
  );
  const span = tracer.startSpan('doWork', undefined, ctx);

  // simulate some random work.
  for (let i = 0; i <= Math.floor(Math.random() * 40000000); i += 1) {
    // empty
  }

  // Make sure to end this child span! If you don't,
  // it will continue to track work beyond 'doWork'!
  span.end();
}

// Be sure to end the parent span.
parentSpan.end();
```

If you run the application again, you'll see the parent span and then a span for each call to `doWork`, each listing `parentSpan`'s ID as its `parentId`.

## Get the current span

Sometimes it's helpful to do something with the current/active span at a particular point in program execution.

```js
const span = opentelemetry.trace.getSpan(opentelemetry.context.active());

// do something with the current span, optionally ending it if that is appropriate for your use case.
```

## Attributes

Attributes can be used to describe your spans. Attributes can be added to a span at any time before the span is finished:

```javascript
function doWork(parent) {
  const ctx = opentelemetry.trace.setSpan(
    opentelemetry.context.active(),
    parent
  );

  // Add an attribute to a span at the time of creation
  const span = tracer.startSpan(
    'doWork',
    { attributes: { attribute1: 'value1' } },
    ctx
  );

  for (let i = 0; i <= Math.floor(Math.random() * 40000000); i += 1) {
    // empty
  }

  // Add an attribute to the same span later on
  span.setAttribute('attribute2', 'value2');

  // Be sure to end the span!
  span.end();
}
```

### Semantic Attributes

There are semantic conventions for spans representing operations in well-known protocols like HTTP or database calls. Semantic conventions for these spans are defined in the specification at [Trace Semantic Conventions]({{< relref "/docs/reference/specification/trace/semantic_conventions" >}}). In the simple example of this guide the source code attributes can be used.

First add the semantic conventions as a dependency to your application:

```shell
npm install --save @opentelemetry/semantic-conventions
```

Add the following to the top of your application file:

```javascript
const { SemanticAttributes } = require('@opentelemetry/semantic-conventions');
```

Finally, you can update your file to include semantic attributes:

```javascript
function doWork(parent) {
  const ctx = opentelemetry.trace.setSpan(
    opentelemetry.context.active(),
    parent
  );
  const span = tracer.startSpan(
    'doWork',
    { attributes: { [SemanticAttributes.CODE_FUNCTION]: 'doWork' } },
    ctx
  );
  for (let i = 0; i <= Math.floor(Math.random() * 40000000); i += 1) {
    // empty
  }
  span.setAttribute(SemanticAttributes.CODE_FILEPATH, __filename);
  span.end();
}
```

## Span events

An event is a human-readable message attached to a span that represents "something happening" during its lifetime. You can think of it like a primitive log.

```js
span.addEvent('Doing something');

const result = doWork();

span.addEvent('Did something');
```

You can also add an object with more data to go along with the message:

```js
span.addEvent('some log', {
  'log.severity': 'error',
  'log.message': 'Data not found',
  'request.id': requestId,
});
```

## Span links

Spans can be created with causal links to other spans.

```js
function someFunction(spanToLinkFrom) {
  const options = {
    links: [
      {
         context: spanToLinkFrom.spanContext()
      }
    ]
  };

  const span = tracer.startSpan('someWork', options: options);

  // do more work

  span.end();
}
```

## Span Status

A status can be set on a span, typically to indicate that it did not complete
successuflly - `SpanStatusCode.ERROR`. In rare situations, you may wish to
override this with `SpanStatusCode.OK`. But don't set the status to `OK`
each time a span successfully completes.

The status can be set at any time before the span is finished:

```javascript
function doWork(parent) {
  const ctx = opentelemetry.trace.setSpan(
    opentelemetry.context.active(),
    parent
  );
  const span = tracer.startSpan('doWork', undefined, ctx);

  for (let i = 0; i <= Math.floor(Math.random() * 40000000); i += 1) {
    if (i > 10000) {
      span.setStatus({
        code: opentelemetry.SpanStatusCode.ERROR,
        message: 'Error'
      });
    }
  }

  span.end();
}
```

## Recording exceptions

It can be a good idea to record exceptions when they happen. It's recommended to do this in conjunction with setting [span status](#span-status).

```js
try {
  doWork();
} catch (ex) {
  span.recordException(ex);
  span.setStatus({ code: otel.SpanStatusCode.ERROR });
}
```

[Getting Started]: {{< relref "getting-started" >}}
