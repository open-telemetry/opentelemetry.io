---
title: "Tracing"
---

This page contains documentation for OpenTelemetry JS.

# Quick Start

**Please note** that this library is currently in *alpha*, and shouldn't be used in production environments.

To begin, install the appropriate packages via your package manager.

```bash
npm install --save @opentelemetry/api
npm install --save @opentelemetry/tracing
npm install --save @opentelemetry/exporter-jaeger
```

Next, import the OpenTelemetry packages and Jaeger exporter and initialize them.

```js
const opentelemetry = require('@opentelemetry/api');
const { BasicTracerProvider, SimpleSpanProcessor } = require('@opentelemetry/tracing');
const { JaegerExporter } = require('@opentelemetry/exporter-jaeger');

const exporter = new JaegerExporter({
  serviceName: 'myService'
});

const provider = new BasicTracerProvider();

provider.addSpanProcessor(new SimpleSpanProcessor(exporter));
opentelemetry.trace.initGlobalTracerProvider(provider);
```

Now, you're ready to create spans!

```js
const tracer = opentelemetry.trace.getTracer('example-basic-tracer-node');
const span = tracer.startSpan('main');
for (let i = 0; i < 10; i++) {
  doWork(span);
}
// Be sure to end the span.
span.end();

// flush and close the connection.
exporter.shutdown();

function doWork(parent) {
  // Start another span. In this example, the main method already started a
  // span, so that'll be the parent span, and this will be a child span.
  const span = tracer.startSpan('doWork', {
    parent: parent
  });

  // simulate some random work.
  for (let i = 0; i <= Math.floor(Math.random() * 40000000); i++) { }

  // Set attributes to the span.
  span.setAttribute('key', 'value');

  // Annotate our span to capture metadata about our operation
  span.addEvent('invoking doWork');

  span.end();
}
```
See [this GitHub repository](https://github.com/open-telemetry/opentelemetry-js/tree/master/examples/basic-tracer-node) for a working code sample in node.js.

Looking for an example of how to use OpenTelemetry in the browser? [Check out this GitHub repository](https://github.com/open-telemetry/opentelemetry-js/tree/master/examples).

# API Reference

See the [API documentation](https://open-telemetry.github.io/opentelemetry-js/interfaces/tracer.html) for more detail, and the [opentelemetry-basic-app](https://github.com/open-telemetry/opentelemetry-js/tree/master/examples/basic-tracer-node) for a complete example.
