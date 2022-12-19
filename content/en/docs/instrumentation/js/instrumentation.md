---
title: Instrumentation
aliases: [/docs/instrumentation/js/api/tracing]
weight: 4
---

Manual instrumentation is the process of adding observability code to your
application.

## Tracing

### Initialize Tracing

To start [tracing](/docs/concepts/signals/traces/#tracing-in-opentelemetry),
you'll need to have an initialized
[`TracerProvider`](/docs/concepts/signals/traces/#tracer-provider) that will let
you create a [`Tracer`](/docs/concepts/signals/traces/#tracer).

If a `TracerProvider` is not created, the OpenTelemetry APIs for tracing will
use a no-op implementation and fail to generate data.

#### Node.js

To initialize tracing with the Node.js SDK, first ensure you have the SDK
package and OpenTelemetry API installed:

```shell
npm install \
  @opentelemetry/api \
  @opentelemetry/resources \
  @opentelemetry/semantic-conventions \
  @opentelemetry/sdk-trace-node \
  @opentelemetry/instrumentation
```

Next, create a separate `tracing.js|ts` file that has all the SDK initialization
code in it:

{{< tabpane langEqualsHeader=true >}}

{{< tab TypeScript >}}
/*tracing.ts*/
import { BatchSpanProcessor, ConsoleSpanExporter } from "@opentelemetry/sdk-trace-base";
import { Resource } from "@opentelemetry/resources";
import { SemanticResourceAttributes } from "@opentelemetry/semantic-conventions";
import { NodeTracerProvider } from "@opentelemetry/sdk-trace-node";
import { registerInstrumentations } from "@opentelemetry/instrumentation";


// Optionally register instrumentation libraries
registerInstrumentations({
  instrumentations: [],
});

const resource =
  Resource.default().merge(
    new Resource({
      [SemanticResourceAttributes.SERVICE_NAME]: "service-name-here",
      [SemanticResourceAttributes.SERVICE_VERSION]: "0.1.0",
    })
  );

const provider = new NodeTracerProvider({
    resource: resource,
});
const exporter = new ConsoleSpanExporter();
const processor = new BatchSpanProcessor(exporter);
provider.addSpanProcessor(processor);

provider.register();
{{< /tab >}}

{{< tab JavaScript >}}
/*tracing.js*/
const opentelemetry = require("@opentelemetry/api");
const { Resource } = require("@opentelemetry/resources");
const { SemanticResourceAttributes } = require("@opentelemetry/semantic-conventions");
const { NodeTracerProvider } = require("@opentelemetry/sdk-trace-node");
const { registerInstrumentations } = require("@opentelemetry/instrumentation");
const { ConsoleSpanExporter, BatchSpanProcessor } = require("@opentelemetry/sdk-trace-base");

// Optionally register instrumentation libraries
registerInstrumentations({
  instrumentations: [],
});

const resource =
  Resource.default().merge(
    new Resource({
      [SemanticResourceAttributes.SERVICE_NAME]: "service-name-here",
      [SemanticResourceAttributes.SERVICE_VERSION]: "0.1.0",
    })
  );

const provider = new NodeTracerProvider({
    resource: resource,
});
const exporter = new ConsoleSpanExporter();
const processor = new BatchSpanProcessor(exporter);
provider.addSpanProcessor(processor);

provider.register();
{{< /tab >}}

{{< /tabpane>}}

Next, ensure that `tracing.js|ts` is required in your node invocation. This is also
required if you're registering instrumentation libraries. For example:

{{< tabpane lang=shell >}}

{{< tab TypeScript >}}
ts-node --require './tracing.ts' <app-file.ts>
{{< /tab >}}

{{< tab JavaScript >}}
node --require './tracing.js' <app-file.js>
{{< /tab >}}

{{< /tabpane >}}

#### Browser

First, ensure you've got the right packages:

```shell
npm install \
  @opentelemetry/api \
  @opentelemetry/resources \
  @opentelemetry/semantic-conventions \
  @opentelemetry/sdk-trace-web \
  @opentelemetry/instrumentation
```

Create a `tracing.js|ts` file that initialized the Web SDK, creates a
`TracerProvider`, and exports a `Tracer`.

{{< tabpane langEqualsHeader=true >}}
{{< tab TypeScript >}}
import { Resource } from "@opentelemetry/resources";
import { SemanticResourceAttributes } from "@opentelemetry/semantic-conventions";
import { WebTracerProvider } from "@opentelemetry/sdk-trace-web";
import { registerInstrumentations } from "@opentelemetry/instrumentation";
import { BatchSpanProcessor, ConsoleSpanExporter } from "@opentelemetry/sdk-trace-base";


// Optionally register automatic instrumentation libraries
registerInstrumentations({
  instrumentations: [],
});

const resource =
  Resource.default().merge(
    new Resource({
      [SemanticResourceAttributes.SERVICE_NAME]: "service-name-here",
      [SemanticResourceAttributes.SERVICE_VERSION]: "0.1.0",
    })
  );

const provider = new WebTracerProvider({
    resource: resource,
});
const exporter = new ConsoleSpanExporter();
const processor = new BatchSpanProcessor(exporter);
provider.addSpanProcessor(processor);

provider.register();
{{< /tab >}}

{{< tab JavaScript >}}
const opentelemetry = require("@opentelemetry/api");
const { Resource } = require("@opentelemetry/resources");
const { SemanticResourceAttributes } = require("@opentelemetry/semantic-conventions");
const { WebTracerProvider } = require("@opentelemetry/sdk-trace-web");
const { registerInstrumentations } = require("@opentelemetry/instrumentation");
const { ConsoleSpanExporter, BatchSpanProcessor } = require("@opentelemetry/sdk-trace-base");

// Optionally register automatic instrumentation libraries
registerInstrumentations({
  instrumentations: [],
});

const resource =
  Resource.default().merge(
    new Resource({
      [SemanticResourceAttributes.SERVICE_NAME]: "service-name-here",
      [SemanticResourceAttributes.SERVICE_VERSION]: "0.1.0",
    })
  );

const provider = new WebTracerProvider({
    resource: resource,
});
const exporter = new ConsoleSpanExporter();
const processor = new BatchSpanProcessor(exporter);
provider.addSpanProcessor(processor);

provider.register();
{{< /tab >}}

{{< /tabpane>}}

You'll need to bundle this file with your web application to be able to use
tracing throughout the rest of your web application.

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

{{< tabpane langEqualsHeader=true >}}
{{< tab TypeScript >}}
import opentelemetry from "@opentelemetry/api";
//...

const tracer = opentelemetry.trace.getTracer(
  'my-service-tracer'
);

// You can now use a 'tracer' to do tracing!
{{< /tab >}}
{{< tab JavaScript >}}
const opentelemetry = require("@opentelemetry/api");
//...

const tracer = opentelemetry.trace.getTracer(
  'my-service-tracer'
);

// You can now use a 'tracer' to do tracing!
{{< /tab >}}
{{< /tabpane>}}

It's generally recommended to call `getTracer` in your app when you need it
rather than exporting the `tracer` instance to the rest of your app. This helps
avoid trickier application load issues when other required dependencies are
involved.

### Create spans

Now that you have a [`Tracer`](/docs/concepts/signals/traces/#tracer)
initialized, you can create
[`Span`s](/docs/concepts/signals/traces/#spans-in-opentelemetry).

```javascript
// Create a span. A span must be closed.
tracer.startActiveSpan('main', span => {
  for (let i = 0; i < 10; i += 1) {
    console.log(i)
  }

  // Be sure to end the span!
  span.end();
});
```

The above code sample shows how to create an active span, which is the most
common kind of span to create.

### Create nested spans

Nested [spans](/docs/concepts/signals/traces/#spans-in-opentelemetry) let you
track work that's nested in nature. For example, the `doWork` function below
represents a nested operation. The following sample creates a nested span that
tracks the `doWork` function:

```javascript
const mainWork = () => {
  tracer.startActiveSpan('main', parentSpan => {
    for (let i = 0; i < 3; i += 1) {
      doWork(i);
    }
    // Be sure to end the parent span!
    parentSpan.end();
  });
}

const doWork = (i) => {
  tracer.startActiveSpan(`doWork:${i}`, span => {
    // simulate some random work.
    for (let i = 0; i <= Math.floor(Math.random() * 40000000); i += 1) {
      // empty
    }

    // Make sure to end this child span! If you don't,
    // it will continue to track work beyond 'doWork'!
    span.end();
  });
}
```

This code will create 3 child spans that have `parentSpan`'s span ID as their
parent IDs.

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
}
```

In this example, `span1`, `span2`, and `span3` are sibling spans and none of
them are considered the currently active span. They share the same parent rather
than being nested under one another.

This arrangement can be helpful if you have units of work that are grouped
together but are conceptually independent from one another.

### Get the current span

Sometimes it's helpful to do something with the current/active
[span](/docs/concepts/signals/traces/#spans-in-opentelemetry) at a particular
point in program execution.

```js
const activeSpan = opentelemetry.trace.getActiveSpan();

// do something with the active span, optionally ending it if that is appropriate for your use case.
```

### Get a span from context

It can also be helpful to get the
[span](/docs/concepts/signals/traces/#spans-in-opentelemetry) from a given
context that isn't necessarily the active span.

```js
const ctx = getContextFromSomewhere();
const span = opentelemetry.trace.getSpan(ctx);

// do something with the acquired span, optionally ending it if that is appropriate for your use case.
```

### Attributes

[Attributes](/docs/concepts/signals/traces/#attributes) let you attach key/value
pairs to a [`Span`](/docs/concepts/signals/traces/#spans-in-opentelemetry) so it
carries more information about the current operation that it's tracking.

```javascript
tracer.startActiveSpan('app.new-span', span => {
  // do some work...

  // Add an attribute to the span
  span.setAttribute('attribute1', 'value1');
  
  span.end();
});
```
You can also add attributes to a span as it's created:

```javascript
tracer.startActiveSpan(
  'app.new-span',
  { attributes: { attribute1: 'value1' } },
  span => {
    // do some work...
    
    span.end();
  });
```

#### Semantic Attributes

There are semantic conventions for spans representing operations in well-known
protocols like HTTP or database calls. Semantic conventions for these spans are
defined in the specification at [Trace Semantic Conventions]({{< relref
"/docs/reference/specification/trace/semantic_conventions" >}}). In the simple
example of this guide the source code attributes can be used.

First add the semantic conventions as a dependency to your application:

```shell
npm install --save @opentelemetry/semantic-conventions
```

Add the following to the top of your application file:

{{< tabpane langEqualsHeader=true >}}
{{< tab TypeScript >}}
import { SemanticAttributes } from "@opentelemetry/semantic-conventions";
{{< /tab >}}
{{< tab JavaScript >}}
const { SemanticAttributes } = require('@opentelemetry/semantic-conventions');
{{< /tab >}}
{{< /tabpane>}}

Finally, you can update your file to include semantic attributes:

```javascript
const doWork = () => {
  tracer.startActiveSpan('app.doWork', span => {
    span.setAttribute(SemanticAttributes.CODE_FUNCTION, 'doWork');
    span.setAttribute(SemanticAttributes.CODE_FILEPATH, __filename);
  
    // Do some work...

    span.end();
  });
}
```

### Span events

A [Span Event](/docs/concepts/signals/traces/#span-events) is a human-readable
message on an [`Span`](/docs/concepts/signals/traces/#spans-in-opentelemetry)
that represents a discrete event with no duration that can be tracked by a
single time stamp. You can think of it like a primitive log.

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

[`Span`s](/docs/concepts/signals/traces/#spans-in-opentelemetry) can be created
with zero or more [`Link`s](/docs/concepts/signals/traces/#span-links) to other
Spans that are causally related. A common scenario is to correlate one or more
traces with the current span.


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

{{< tabpane langEqualsHeader=true >}}
{{< tab TypeScript >}}
import opentelemetry from "@opentelemetry/api";

// ...

tracer.startActiveSpan('app.doWork', span => {
  for (let i = 0; i <= Math.floor(Math.random() * 40000000); i += 1) {
    if (i > 10000) {
      span.setStatus({
        code: opentelemetry.SpanStatusCode.ERROR,
        message: 'Error'
      });
    }
  }

  span.end();
});
{{< /tab >}}
{{< tab JavaScript >}}
const opentelemetry = require("@opentelemetry/api");

// ...

tracer.startActiveSpan('app.doWork', span => {
  for (let i = 0; i <= Math.floor(Math.random() * 40000000); i += 1) {
    if (i > 10000) {
      span.setStatus({
        code: opentelemetry.SpanStatusCode.ERROR,
        message: 'Error'
      });
    }
  }
  
  span.end();
});
{{< /tab >}}
{{< /tabpane>}}

By default, the status for all spans is `Unset` rather than `Ok`. It is
typically the job of another component in your telemetry pipeline to interpret
the `Unset` status of a span, so it's best not to override this unless you're
explicitly tracking an error.

### Recording exceptions

It can be a good idea to record exceptions when they happen. It's recommended to
do this in conjunction with setting [span status](#span-status).

{{< tabpane langEqualsHeader=true >}}
{{< tab TypeScript >}}
import opentelemetry from "@opentelemetry/api";

// ...

try {
  doWork();
} catch (ex) {
  span.recordException(ex);
  span.setStatus({ code: opentelemetry.SpanStatusCode.ERROR });
}
{{< /tab >}}
{{< tab JavaScript >}}
const opentelemetry = require("@opentelemetry/api");

// ...

try {
  doWork();
} catch (ex) {
  span.recordException(ex);
  span.setStatus({ code: opentelemetry.SpanStatusCode.ERROR });
}
{{< /tab >}}
{{< /tabpane>}}

### Using `sdk-trace-base` and manually propagating span context

In some cases, you may not be able to use either the Node.js SDK nor the Web
SDK. The biggest difference, aside from initialization code, is that you'll have
to manually set spans as active in the current context to be able to create
nested spans.

#### Initializing tracing with `sdk-trace-base`

Initializing tracing is similar to how you'd do it with Node.js or the Web SDK.

{{< tabpane langEqualsHeader=true >}}
{{< tab TypeScript >}}
import opentelemetry from "@opentelemetry/api";
import {
  BasicTracerProvider,
  BatchSpanProcessor,
  ConsoleSpanExporter
} from "@opentelemetry/sdk-trace-base";

const provider = new BasicTracerProvider();

// Configure span processor to send spans to the exporter
provider.addSpanProcessor(new BatchSpanProcessor(new ConsoleSpanExporter()));
provider.register();

// This is what we'll access in all instrumentation code
const tracer = opentelemetry.trace.getTracer(
  'example-basic-tracer-node'
);
{{< /tab >}}
{{< tab JavaScript >}}
const opentelemetry = require("@opentelemetry/api");
const {
  BasicTracerProvider,
  ConsoleSpanExporter,
  BatchSpanProcessor,
} = require("@opentelemetry/sdk-trace-base");

const provider = new BasicTracerProvider();

// Configure span processor to send spans to the exporter
provider.addSpanProcessor(new BatchSpanProcessor(new ConsoleSpanExporter()));
provider.register();

// This is what we'll access in all instrumentation code
const tracer = opentelemetry.trace.getTracer(
    'example-basic-tracer-node'
);
{{< /tab >}}
{{< /tabpane>}}

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
}

const doWork = (parent, i) => {
  // To create a child span, we need to mark the current (parent) span as the active span
  // in the context, then use the resulting context to create a child span.
  const ctx = opentelemetry.trace.setSpan(
    opentelemetry.context.active(),
    parent
  );
  const span = tracer.startSpan(`doWork:${i}`, undefined, ctx);

  // simulate some random work.
  for (let i = 0; i <= Math.floor(Math.random() * 40000000); i += 1) {
    // empty
  }

  // Make sure to end this child span! If you don't,
  // it will continue to track work beyond 'doWork'!
  span.end();
}
```

All other APIs behave the same when you use `sdk-trace-base` compared with the
Node.js or Web SDKs.

## Metrics

To start [metrics](/docs/concepts/signals/metrics), you'll need to have an
initialized `MeterProvider` that lets you create a `Meter`. `Meter`s let you
create `Instrument`s that you can use to create different kinds of metrics.
OpenTelemetry JavaScript currently supports the following `Instrument`s:

* Counter, a synchronous instrument which supports non-negative increments
* Asynchronous Counter, a asynchronous instrument which supports non-negative
  increments
* Histogram, a synchronous instrument which supports arbitrary values that are
  statistically meaningful, such as histograms, summaries or percentile
* Asynchronous Gauge, an asynchronous instrument which supports non-additive
  values, such as room temperature
* UpDownCounter, a synchronous instrument which supports increments and
  decrements, such as number of active requests
* Asynchronous UpDownCounter, an asynchronous instrument which supports
  increments and decrements

If a `MeterProvider` is not created either by an instrumentation library or
manually, the OpenTelemetry Metrics API will use a no-op implementation and
fail to generate data.

### Initialize Metrics

To initialize metrics, make sure you have the right packages installed:

```shell
npm install \
  @opentelemetry/api \
  @opentelemetry/resources \
  @opentelemetry/semantic-conventions \
  @opentelemetry/sdk-metrics \
  @opentelemetry/instrumentation
```

Next, create a separate `instrumentation.js|ts` file that has all the SDK
initialization code in it:
{{< tabpane langEqualsHeader=true >}}
{{< tab TypeScript >}}
import otel from "@opentelemetry/api";
import {
  ConsoleMetricExporter,
  MeterProvider,
  PeriodicExportingMetricReader
} from "@opentelemetry/sdk-metrics";
import { Resource } from "@opentelemetry/resources";
import { SemanticResourceAttributes } from "@opentelemetry/semantic-conventions";

const resource =
  Resource.default().merge(
    new Resource({
      [SemanticResourceAttributes.SERVICE_NAME]: "service-name-here",
      [SemanticResourceAttributes.SERVICE_VERSION]: "0.1.0",
    })
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
otel.metrics.setGlobalMeterProvider(myServiceMeterProvider)
{{< /tab >}}

{{< tab JavaScript >}}
const otel = require('@opentelemetry/api')
const {
    MeterProvider,
    PeriodicExportingMetricReader,
    ConsoleMetricExporter
  } = require('@opentelemetry/sdk-metrics');
const { Resource } = require('@opentelemetry/resources');
const { SemanticResourceAttributes } = require('@opentelemetry/semantic-conventions');

const resource =
  Resource.default().merge(
    new Resource({
      [SemanticResourceAttributes.SERVICE_NAME]: "service-name-here",
      [SemanticResourceAttributes.SERVICE_VERSION]: "0.1.0",
    })
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
otel.metrics.setGlobalMeterProvider(myServiceMeterProvider)
{{< /tab >}}
{{< /tabpane>}}

You'll need to `--require` this file when you run your app, such as:

{{< tabpane lang=shell >}}

{{< tab TypeScript >}}
ts-node --require './instrumentation.ts' <app-file.ts>
{{< /tab >}}

{{< tab JavaScript >}}
node --require './instrumentation.js' <app-file.js>
{{< /tab >}}

{{< /tabpane >}}

Now that a `MeterProvider` is configured, you can acquire a `Meter`.

### Acquiring a Meter

Anywhere in your application where you have manually instrumented code you can call
`getMeter` to acquire a meter. For example:

{{< tabpane langEqualsHeader=true >}}
{{< tab TypeScript >}}
import otel from "@opentelemetry/api";

const myMeter = otel.metrics.getMeter(
  'my-service-meter'
);

// You can now use a 'meter' to create instruments!
{{< /tab >}}

{{< tab JavaScript >}}
const otel = require('@opentelemetry/api')

const myMeter = otel.metrics.getMeter(
  'my-service-meter'
);

// You can now use a 'meter' to create instruments!
{{< /tab >}}
{{< /tabpane>}}

It’s generally recommended to call `getMeter` in your app when you need it
rather than exporting the meter instance to the rest of your app. This helps
avoid trickier application load issues when other required dependencies are
involved.

### Synchronous and asynchronous instruments

OpenTelemetry provides two major categories of instruments: synchronous and anynchronous (observable) instruments. Synchronous instruments can be used anywhere in the code. Using these, measurements can be pushed to the instrument at any time during the execution. This means that during an export cycle, multiple or no measurements can take place. Asynchronous instruments, on the other hand, provide a measurement at the request of the SDK. When the SDK exports, a callback that was provided to the instrument on creation is invoked. This callback provides the SDK with a measurement, which is then immediately exported. Therefore all measurement on asynchronous instruments are performed once per export cycle. 

### Using Counters

Counters can by used to measure a non-negative, increasing value. They are
useful when increasing the counter is computationally cheap.

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

For example, here's how you might report a distribution of response times for an
API route with Express:

{{< tabpane langEqualsHeader=true >}}
{{< tab TypeScript >}}
import express from "express";

const app = express();

app.get('/', (_req, _res) => {
  const histogram = myMeter.createHistogram("taks.duration");
  const startTime = new Date().getTime()

  // do some work in an API call

  const endTime = new Date().getTime()
  const executionTime = endTime - startTime

  // Record the duration of the task operation
  histogram.record(executionTime)
});
{{< /tab >}}

{{< tab JavaScript >}}
const express = require('express');

const app = express();

app.get('/', (_req, _res) => {
  const histogram = myMeter.createHistogram("taks.duration");
  const startTime = new Date().getTime()

  // do some work in an API call

  const endTime = new Date().getTime()
  const executionTime = endTime - startTime

  // Record the duration of the task operation
  histogram.record(executionTime)
});
{{< /tab >}}
{{< /tabpane>}}

### Describing instruments

When you create instruments like counters, histograms, etc. you can give them a
description.

```js
const httpServerResponseDuration = myMeter.createHistogram("http.server.duration", {
  description: 'A distribution of the HTTP server response times',
  unit: 'milliseconds',
  valueType: ValueType.INT
});
```

In JavaScript, each configuration type means the following:

* `description` - a human-readable description for the instrument
* `unit` - The description of the unit of measure that the value is intended to
  represent. For example, `milliseconds` to meaure duration, or `bytes` to count
  number of bytes.
* `valueType` - The kind of numeric value used in measurements.

It's generally recommended to describe each instrument you create.

### Adding attributes

You can add Attributes to metrics when they are generated.

```js
const counter = myMeter.createCounter('my.counter');

cntr.add(1, { 'some.optional.attribute': 'some value' });
```

## Next steps

You'll also want to configure an appropriate exporter to [export your telemetry
data](/docs/instrumentation/js/exporters) to one or more telemetry backends.
