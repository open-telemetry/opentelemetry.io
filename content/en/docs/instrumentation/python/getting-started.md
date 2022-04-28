---
title: Getting Started
weight: 1
---

In this page, you'll learn how to set up and get tracing telemetry from an HTTP
server with Flask. If you're not using Flask, that's fine - this guide will also
work with Django, FastAPI, [and
more](https://github.com/open-telemetry/opentelemetry-python-contrib/tree/main/instrumentation).

For more elaborate examples, see
[examples](https://github.com/open-telemetry/opentelemetry-python/tree/main/docs/examples/).

## Installation

To begin, set up an environment and install dependencies:

```console
$ mkdir otel-getting-started
$ cd otel-getting-started
$ python3 -m venv .
$ source ./bin/activate
```

Now install the HTTP server:

```console
$ pip install flask
```

And finally, install OpenTelemetry:

```console
$ pip install opentelemetry-distro
```

The `opentelemetry-distro` package installs the API, SDK, and the
`opentelemetry-bootstrap` and `opentelemetry-instrument` tools that you'll use
soon.

## Add automatic instrumentation

Automatic instrumentation will generate telemetry data on your behalf. There are
several options you can take, covered in more detail in [Automatic
Instrumentation]({{< relref "automatic" >}}). Here we'll use the
`opentelemetry-instrument` agent.

First, create a file `app.py`:

```python
from random import randint
from flask import Flask, request

app = Flask(__name__)

@app.route("/roll")
def roll():
    sides = int(request.args.get('sides'))
    rolls = int(request.args.get('rolls'))
    return roll_sum(sides,rolls)


def roll_sum(sides, rolls):
    sum = 0
    for r in range(0,rolls):
        result = randint(1,sides)
        sum += result
    return str(sum)
```

Next, install automatic instrumentation:

```console
$ opentelemetry-bootstrap -a install
```

This will install Flask instrumentation.

## Run the instrumented app

You can now run your instrumented app with `opentelemetry-instrument` and have
it print to the console for now:

```console
$ opentelemetry-instrument --traces_exporter console flask run
```

When you access the server, you'll get a result in a trace printed to the
console, such as the following:

```console
{
    "name": "/roll",
    "context": {
        "trace_id": "0xdcd253b9501348b63369d83219da0b14",
        "span_id": "0x886c05bc23d2250e",
        "trace_state": "[]"
    },
    "kind": "SpanKind.SERVER",
    "parent_id": null,
    "start_time": "2022-04-27T23:53:11.533109Z",
    "end_time": "2022-04-27T23:53:11.534097Z",
    "status": {
        "status_code": "UNSET"
    },
    "attributes": {
        "http.method": "GET",
        "http.server_name": "127.0.0.1",
        "http.scheme": "http",
        "net.host.port": 5000,
        "http.host": "localhost:5000",
        "http.target": "/roll?sides=10&rolls=2",
        "net.peer.ip": "127.0.0.1",
        "http.user_agent": "curl/7.68.0",
        "net.peer.port": 52538,
        "http.flavor": "1.1",
        "http.route": "/roll",
        "http.status_code": 200
    },
    "events": [],
    "links": [],
    "resource": {
        "telemetry.sdk.language": "python",
        "telemetry.sdk.name": "opentelemetry",
        "telemetry.sdk.version": "1.11.1",
        "telemetry.auto.version": "0.30b1",
        "service.name": "unknown_service"
    }
}
```

You can learn how to configure different exporters in the [Exporters page]({{<
relref "exporters" >}}).

## Add manual instrumentation to automatic instrumentation

Automatic instrumentation captures telemetry at the edges of your systems, such
as inbound and outbound HTTP requests, but it doesn't capture what's going on in
your application. For that you'll need to write some [manual
instrumentation]({{< relref"manual" >}}). Here's how you can easily link up
manual instrumentation with automatic instrumentation.

First, modify `app.py` to include code that initializes a tracer and uses it to
create a trace that's a child of the one that's automatically generated:

```python
from opentelemetry import trace
from opentelemetry.sdk.trace import TracerProvider

from random import randint
from flask import Flask, request

provider = TracerProvider()
trace.set_tracer_provider(provider)
tracer = trace.get_tracer(__name__)

app = Flask(__name__)

@app.route("/roll")
def roll():
    sides = int(request.args.get('sides'))
    rolls = int(request.args.get('rolls'))
    return roll_sum(sides,rolls)


def roll_sum(sides, rolls):
    # This creates a new trace that's the child of thw current one, if it exists
    with tracer.start_as_current_span("roll_sum"):  
        sum = 0
        for r in range(0,rolls):
            result = randint(1,sides)
            sum += result
        return  str(sum)
```

Now run the app again:

```console
$ opentelemetry-instrument --traces_exporter console flask run
```

You'll now see two spans in the trace emitted to the console, and the one called
`roll_sum` registers its parent as the automatically created one:

```console
{
    "name": "roll_sum",
    "context": {
        "trace_id": "0x48da59d77e13beadd1a961dc8fcaa74e",
        "span_id": "0x40c38b50bc8da6b7",
        "trace_state": "[]"
    },
    "kind": "SpanKind.INTERNAL",
    "parent_id": "0x84f8c5d92970d94f",
    "start_time": "2022-04-28T00:07:55.892307Z",
    "end_time": "2022-04-28T00:07:55.892331Z",
    "status": {
        "status_code": "UNSET"
    },
    "attributes": {},
    "events": [],
    "links": [],
    "resource": {
        "telemetry.sdk.language": "python",
        "telemetry.sdk.name": "opentelemetry",
        "telemetry.sdk.version": "1.11.1",
        "telemetry.auto.version": "0.30b1",
        "service.name": "unknown_service"
    }
}
{
    "name": "/roll",
    "context": {
        "trace_id": "0x48da59d77e13beadd1a961dc8fcaa74e",
        "span_id": "0x84f8c5d92970d94f",
        "trace_state": "[]"
    },
    "kind": "SpanKind.SERVER",
    "parent_id": null,
    "start_time": "2022-04-28T00:07:55.891500Z",
    "end_time": "2022-04-28T00:07:55.892552Z",
    "status": {
        "status_code": "UNSET"
    },
    "attributes": {
        "http.method": "GET",
        "http.server_name": "127.0.0.1",
        "http.scheme": "http",
        "net.host.port": 5000,
        "http.host": "localhost:5000",
        "http.target": "/roll?sides=10&rolls=2",
        "net.peer.ip": "127.0.0.1",
        "http.user_agent": "curl/7.68.0",
        "net.peer.port": 53824,
        "http.flavor": "1.1",
        "http.route": "/roll",
        "http.status_code": 200
    },
    "events": [],
    "links": [],
    "resource": {
        "telemetry.sdk.language": "python",
        "telemetry.sdk.name": "opentelemetry",
        "telemetry.sdk.version": "1.11.1",
        "telemetry.auto.version": "0.30b1",
        "service.name": "unknown_service"
    }
}
```

The `parent_id` of `roll_sum` is the same is the `span_id` for `/roll`,
indicating a parent-child reletionship!

## Next steps

There are several options available for automatic instrumentation and Python.
See [Automatic Instrumentation]({{< relref "automatic" >}}) to learn about them
and how to configure them.

There's a lot more to manual instrumentation than just creating a child span. To
learn details about initializing manual instrumentation and many more parts of
the OpenTelemetry API you can use, see [Manual Instrumentation]({{< relref
"manual"
>}}).

Finally, there are several options for exporting your telemetry data with
OpenTelemetry. To learn how to export your data to a preferred backend, see
[Exporters]({{< relref "exporters" >}}).
