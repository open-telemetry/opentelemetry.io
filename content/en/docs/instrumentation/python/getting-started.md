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

To begin, set up an environment and install dependencies in a new directory:

```console
mkdir otel-getting-started
cd otel-getting-started
python3 -m venv .
source ./bin/activate
```

Now install Flask and OpenTelemetry:

```console
pip install flask
pip install opentelemetry-distro
```

The `opentelemetry-distro` package installs the API, SDK, and the
`opentelemetry-bootstrap` and `opentelemetry-instrument` tools that you'll use
soon.

## Create the sample HTTP Server

Create a file `app.py`:

```python
from random import randint
from flask import Flask, request

app = Flask(__name__)

@app.route("/rolldice")
def roll_dice():
    return str(do_roll())

def do_roll():
    return randint(1, 6)
```

When run, this will launch an HTTP server with a `/rolldice` route.

## Add automatic instrumentation

Automatic instrumentation will generate telemetry data on your behalf. There are
several options you can take, covered in more detail in [Automatic
Instrumentation]({{< relref "automatic" >}}). Here we'll use the
`opentelemetry-instrument` agent.

Run the `opentelemetry-bootstrap` command:

```console
opentelemetry-bootstrap -a install
```

This will install Flask instrumentation.

## Run the instrumented app

You can now run your instrumented app with `opentelemetry-instrument` and have
it print to the console for now:

```console
$ opentelemetry-instrument --traces_exporter console flask run
```

When you send a request to the server, you'll get a result in a trace with a
single span printed to the console, such as the following:

<details>

```json
{
    "name": "/rolldice",
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

</details>

The span generated for you tracks the lifetime of a request to the `/doroll`
route.

## Add manual instrumentation to automatic instrumentation

Automatic instrumentation captures telemetry at the edges of your systems, such
as inbound and outbound HTTP requests, but it doesn't capture what's going on in
your application. For that you'll need to write some [manual
instrumentation]({{< relref"manual" >}}). Here's how you can easily link up
manual instrumentation with automatic instrumentation.

First, modify `app.py` to include code that initializes a tracer and uses it to
create a trace that's a child of the one that's automatically generated:

```python
# These are the necessary import declarations
from opentelemetry import trace

from random import randint
from flask import Flask, request

# Acquire a tracer. This is actually
# set up for you in the opentelemetry-instrument agent.
tracer = trace.get_tracer(__name__)

app = Flask(__name__)

@app.route("/rolldice")
def roll_dice():
    return str(do_roll())

def do_roll():
    # This creates a new trace that's the child of the current one
    with tracer.start_as_current_span("do_roll") as rollspan:  
        res = randint(1, 6)
        rollspan.set_attribute("roll.value", res)
        return res
```

Now run the app again:

```console
opentelemetry-instrument --traces_exporter console flask run
```

When you send a request to the server, you'll see two spans in the trace emitted
to the console, and the one called `do_roll` registers its parent as the
automatically created one:

<details>

```json
{
    "name": "do_roll",
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
    "attributes": {
        "roll.value": 4
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

</details>

The `parent_id` of `do_roll` is the same is the `span_id` for `/rolldice`,
indicating a parent-child reletionship!

## Send traces to an OpenTelemetry Collector

The [OpenTelemetry Collector](/docs/collector/getting-started/) is a critical
component of most production deployments. Some examples of when it's beneficial
to use a collector:

* A single telemetry sink shared by multiple services, to reduce overhead of
  switching exporters
* Aggregating traces across multiple services, running on multiple hosts
* A central place to process traces prior to exporting them to a backend

Unless you have just a single service or are experimenting, you'll want to use a
collector in production deployments.

### Configure and run a local collector

First, write the following collector configuration code into `/tmp/`:

```yaml
# /tmp/otel-collector-config.yaml
receivers:
    otlp:
        protocols:
            grpc:
            http:
exporters:
    logging:
        loglevel: debug
processors:
    batch:
service:
    pipelines:
        traces:
            receivers: [otlp]
            exporters: [logging]
            processors: [batch]
```

Then run the docker command to acquire and run the collector based on this
configuration:

```
docker run -p 4317:4317 \
    -v /tmp/otel-collector-config.yaml:/etc/otel-collector-config.yaml \
    otel/opentelemetry-collector:latest \
    --config=/etc/otel-collector-config.yaml
```

You will now have an OpenTelemetry Collector instance running locally.

### Modify the code to export spans via OTLP

The next step is to modify the code to send spans to the Collector via OTLP
instead of the console.

To do this, install the OTLP exporter package:

```
pip install opentelemetry-exporter-otlp
```

Then configure the exporter. By default, it will send to `locahost:4317`, which
is what the collector listens on.

```python
# These are the necessary import declarations
from opentelemetry import trace
from opentelemetry.sdk.trace.export import (
    BatchSpanProcessor,
)
from opentelemetry.exporter.otlp.proto.http.trace_exporter import (
    OTLPSpanExporter,
)

from random import randint
from flask import Flask, request

# Get the tracer provider used in opentelemetry-instrument
# and have it export spans over OTLP
provider = trace.get_tracer_provider()
processor = BatchSpanProcessor(OTLPSpanExporter())
provider.add_span_processor(processor)
trace.set_tracer_provider(provider)

tracer = trace.get_tracer(__name__)

app = Flask(__name__)

@app.route("/rolldice")
def roll_dice():
    return str(do_roll())

def do_roll():
    # This creates a new trace that's the child of the current one
    with tracer.start_as_current_span("do_roll") as rollspan:  
        res = randint(1, 6)
        rollspan.set_attribute("roll.value", res)
        return res
```

### Run the application

Finally, you can run the application. Use the same command as before, but this
time without exporting to the console:

```
opentelemetry-instrument flask run
```

When you access the `/rolldice` route now, you'll see output from the collector
process instead of the flask process, which should look something like this:

<details>

```
2022-05-11T23:25:24.025Z        INFO    loggingexporter/logging_exporter.go:41   TracesExporter  {"#spans": 2}
2022-05-11T23:25:24.025Z        DEBUG   loggingexporter/logging_exporter.go:51   ResourceSpans #0
Resource labels:
     -> telemetry.sdk.language: STRING(python)
     -> telemetry.sdk.name: STRING(opentelemetry)
     -> telemetry.sdk.version: STRING(1.11.1)
     -> telemetry.auto.version: STRING(0.30b1)
     -> service.name: STRING(unknown_service)
InstrumentationLibrarySpans #0
InstrumentationLibrary app 
Span #0
    Trace ID       : 7840fce18857dd73622be53793ea085c
    Parent ID      : ff6696dc1af70131
    ID             : 6521d08561e8cd03
    Name           : do_roll
    Kind           : SPAN_KIND_INTERNAL
    Start time     : 2022-05-11 23:25:23.330808486 +0000 UTC
    End time       : 2022-05-11 23:25:23.330836966 +0000 UTC
    Status code    : STATUS_CODE_UNSET
    Status message : 
Attributes:
     -> roll.value: INT(2)
InstrumentationLibrarySpans #1
InstrumentationLibrary opentelemetry.instrumentation.flask 0.30b1
Span #0
    Trace ID       : 7840fce18857dd73622be53793ea085c
    Parent ID      : 
    ID             : ff6696dc1af70131
    Name           : /rolldice
    Kind           : SPAN_KIND_SERVER
    Start time     : 2022-05-11 23:25:23.330153446 +0000 UTC
    End time       : 2022-05-11 23:25:23.331035135 +0000 UTC
    Status code    : STATUS_CODE_UNSET
    Status message : 
Attributes:
     -> http.method: STRING(GET)
     -> http.server_name: STRING(127.0.0.1)
     -> http.scheme: STRING(http)
     -> net.host.port: INT(5000)
     -> http.host: STRING(localhost:5000)
     -> http.target: STRING(/rolldice?vscodeBrowserReqId=1652311523254)
     -> net.peer.ip: STRING(127.0.0.1)
     -> http.user_agent: STRING(Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/101.0.4951.54 Safari/537.36)
     -> net.peer.port: INT(45942)
     -> http.flavor: STRING(1.1)
     -> http.route: STRING(/rolldice)
     -> http.status_code: INT(200)
```

</details>

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
