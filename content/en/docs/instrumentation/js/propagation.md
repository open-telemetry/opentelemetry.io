---
title: Propagation
description: Context propagation for the JS SDK
aliases: [/docs/instrumentation/js/api/propagation]
weight: 65
spelling: cSpell:ignore traceparent tracestate
---

Propagation is the mechanism that moves data between services and processes.
Although not limited to tracing, it is what allows traces to build causal
information about a system across services that are arbitrarily distributed
across process and network boundaries.

## Context propagation with libraries

For the vast majority of use cases, context propagation is done with
instrumentation libraries.

For example, if you have several Node.js services that communicate over HTTP,
you can use the
[`express`](https://www.npmjs.com/package/@opentelemetry/instrumentation-express)
and [`http`](https://www.npmjs.com/package/@opentelemetry/instrumentation-http)
instrumentation libraries to automatically propagate trace context across
services for you.

**It is highly recommend that you use instrumentation libraries to propagate
context.** Although it is possible to propagate context manually, if your system
uses libraries to communicate between services, use a matching instrumentation
library to propagate context.

Refer to [Libraries](/docs/instrumentation/js/libraries) to learn more about
instrumentation libraries and how to use them.

## Manual W3C Trace Context Propagation

In some cases, it is not possible to propagate context with an instrumentation
library. There may not be an instrumentation library that matches a library
you're using to have services communicate with one another. Or you many have
requirements that instrumentation libraries cannot fulfill, even if they exist.

When you must propagate context manually, you can use the
[context api](/docs/instrumentation/js/context).

The following generic example demonstrates how you can propagate trace context
manually.

First, on the sending service, you'll need to inject the current `context`:

```js
// Sending service
import { context, propagation, trace } from '@opentelemetry/api';
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

On the receiving service, you'll need to extract `context` (for example, from
parsed HTTP headers) and then set them as the current trace context.

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
  activeContext
);

// Set the created span as active in the deserialized context.
trace.setSpan(activeContext, span);
```

From there, when you have a deserialized active context, you can create spans
that will be a part of the same trace from the other service.

You can also use the [Context](/docs/instrumentation/js/context) API to modify
or set the deserialized context in other ways.
