---
title: "Getting Started"
weight: 2
---

This guide uses the example application provided below, but the steps to instrument your own application should be broadly the same. Here is an overview of what we will be doing.

- Install the required OpenTelemetry libraries
- Initialize a global tracer
- Initialize and register a trace exporter

```python
from flask import Flask, request

app = Flask(__name__)

@app.route("/")
def server_request():
    return "Hello World"

if __name__ == "__main__":
    app.run(port=8080)
```


# Installation

To create traces on python, you will need `opentelemetry-sdk`, `opentelemetry-instrumentation`, and any plugins required by your application such as gRPC, or HTTP. If you are using the example application, you will need to install `opentelemetry-instrumentation-flask`.

```sh
$ pip install opentelemetry-sdk
$ pip install opentelemetry-instrumentation
$ pip install opentelemetry-instrumentation-flask
$ pip install requests
```

# Initialization and Configuration

All tracing initialization should happen before your application’s code runs. You need minor code changes to your code if you plan to use auto instrumentation.

## Creating a Tracer Provider

Add the following to the top of your application code:

```python
from opentelemetry import trace
from opentelemetry.sdk.trace import TracerProvider

app = Flask(__name__)

trace.set_tracer_provider(TracerProvider())
```

Run your application now with `opentelemetry-instrument python3 app.py`, your application will create and propagate traces over HTTP. If an already instrumented service that supports [Trace Context](https://www.w3.org/TR/trace-context/) headers calls your application using HTTP, and you call another application using HTTP, the Trace Context headers will be correctly propagated.

If you wish to see a completed trace, however, there is one more step. You must register an exporter.

## Creating a Metric Provider

In order to create and monitor metrics, we will need a `Meter`. In OpenTelemetry, a `Meter` is the mechanism used to create and manage metrics, labels, and metric exporters.

Create a file named `monitoring.js` and add the following code:

```javascript
'use strict';

const { MeterProvider } = require('@opentelemetry/metrics');

const meter = new MeterProvider().getMeter('your-meter-name');
```

Now, you can require this file from your application code and use the `Meter` to create and manage metrics. The simplest of these metrics is a counter. Let's create and export a middleware function that Flask can use to count all requests by route. Modify your file so that it looks like this:

```python

```

Now let's import and use this middleware in our application code:

```python

```

Now, when we make requests (e.g. `curl http://localhost:8080`) to our service our meter will count all requests.

**Note**: Creating a new `labelSet` and `binding` on every request is not ideal as creating the `labelSet` can often be an expensive operation. This is why instruments are created and stored in a `Map` according to the route key.

## Creating a Console Exporter

To export traces, add the following code:

```python
from opentelemetry.sdk.trace.export import (
    ConsoleSpanExporter,
    SimpleExportSpanProcessor,
)
```

and

```python
trace.get_tracer_provider().add_span_processor(
    SimpleExportSpanProcessor(ConsoleSpanExporter())
)
```

To export metrics, additionally add the following:

```python

```

Now, restart your application and add some load, you will see traces & metrics printed to your console:

```javascript
{
  traceId: 'f27805526b1c74293bbc9345cd48ff3b',
  parentId: 'd6bdf2a18df04ef0',
  name: 'middleware - query',
  id: '36335b81de12cc4a',
  kind: 0,
  timestamp: 1603789083744612,
  duration: 365,
  attributes: {
    component: 'express',
    'express.name': 'query',
    'express.type': 'middleware'
  },
  status: { code: 0 },
  events: []
}
{
  name: 'requests',
  description: 'Count all incoming requests',
  unit: '1',
  metricKind: 0,
  valueType: 1
}
{ route: '/' }
value: 1
```

# Quick Start
