---
title: Getting Started
description: Get telemetry for your app in less than 5 minutes!
spelling: cSpell:ignore venv distro rolldice randint 
spelling: cSpell:ignore rollspan loglevel loggingexporter
weight: 1
---

This page will show you how to get started with OpenTelemetry in Python.

You will learn how you can instrument a simple application automatically, in
such a way that [traces][], [metrics][] and [logs][] are emitted to the console.

## Prerequisites

Ensure that you have the following installed locally:

- [Python 3](https://www.python.org/)

## Example Application

The following example uses a basic [Flaks](https://flask.palletsprojects.com/)
application. If you're not using Flask, that's fine — this guide will also work
with Django, FastAPI
[and more](https://opentelemetry.io/ecosystem/registry/?component=instrumentation&language=python)

For more elaborate examples, see
[examples](/docs/instrumentation/python/examples/).

## Installation

To begin, set up an environment in a new directory:

```shell
mkdir otel-getting-started
cd otel-getting-started
python3 -m venv .
source ./bin/activate
```

Now install Flask:

```shell
pip install flask
```

## Create the sample HTTP Server

Create a file `app.py` and add the following code to it:

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

Run the application with the following command and open
<http://localhost:80800/rolldice> in your web browser to ensure it is working.

```console
$ flask run -p 8080
```

## Instrumentation

Automatic instrumentation will generate telemetry data on your behalf. There are
several options you can take, covered in more detail in
[Automatic Instrumentation](../automatic/). Here we'll use the
`opentelemetry-instrument` agent.

Install the `opentelemetry-distro` package, which contains the OpenTelemetry
API, SDK and also the tools `opentelemetry-bootstrap` and
`opentelemetry-instrument` you will use below.

```
pip install opentelemetry-distro
```

Run the `opentelemetry-bootstrap` command:

```shell
opentelemetry-bootstrap -a install
```

This will install Flask instrumentation.

## Run the instrumented app

You can now run your instrumented app with `opentelemetry-instrument` and have
it print to the console for now:

```shell
opentelemetry-instrument \
    --traces_exporter console \
    --metrics_exporter console \
    --logs_exporter console \
    flask run
```

Open <http://localhost:8080/rolldice> in your web browser and reload the page a
few times, after a while you should see the spans printed in the console, such
as the following:

<details>
<summary>View example output</summary>

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
    "http.target": "/rolldice",
    "net.peer.ip": "127.0.0.1",
    "http.user_agent": "curl/7.68.0",
    "net.peer.port": 52538,
    "http.flavor": "1.1",
    "http.route": "/rolldice",
    "http.status_code": 200
  },
  "events": [],
  "links": [],
  "resource": {
    "attributes": {
      "telemetry.sdk.language": "python",
      "telemetry.sdk.name": "opentelemetry",
      "telemetry.sdk.version": "1.14.0",
      "telemetry.auto.version": "0.35b0",
      "service.name": "unknown_service"
    },
    "schema_url": ""
  }
}
```

</details>

The span generated for you tracks the lifetime of a request to the `/rolldice`
route.

Send a few more requests to the endpoint, and then either wait for a little bit
or terminate the app and you'll get metrics printed out to the console, such as
the following

<details>
<summary>View example output</summary>

```json
{
  "resource_metrics": [
    {
      "resource": {
        "attributes": {
          "service.name": "unknown_service",
          "telemetry.auto.version": "0.34b0",
          "telemetry.sdk.language": "python",
          "telemetry.sdk.name": "opentelemetry",
          "telemetry.sdk.version": "1.13.0"
        },
        "schema_url": ""
      },
      "schema_url": "",
      "scope_metrics": [
        {
          "metrics": [
            {
              "data": {
                "aggregation_temporality": 2,
                "data_points": [
                  {
                    "attributes": {
                      "http.flavor": "1.1",
                      "http.host": "localhost:5000",
                      "http.method": "GET",
                      "http.scheme": "http",
                      "http.server_name": "127.0.0.1"
                    },
                    "start_time_unix_nano": 1666077040061693305,
                    "time_unix_nano": 1666077098181107419,
                    "value": 0
                  }
                ],
                "is_monotonic": false
              },
              "description": "measures the number of concurrent HTTP requests that are currently in-flight",
              "name": "http.server.active_requests",
              "unit": "requests"
            },
            {
              "data": {
                "aggregation_temporality": 2,
                "data_points": [
                  {
                    "attributes": {
                      "http.flavor": "1.1",
                      "http.host": "localhost:5000",
                      "http.method": "GET",
                      "http.scheme": "http",
                      "http.server_name": "127.0.0.1",
                      "http.status_code": 200,
                      "net.host.port": 5000
                    },
                    "bucket_counts": [0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                    "count": 1,
                    "explicit_bounds": [
                      0, 5, 10, 25, 50, 75, 100, 250, 500, 1000
                    ],
                    "max": 1,
                    "min": 1,
                    "start_time_unix_nano": 1666077040063027610,
                    "sum": 1,
                    "time_unix_nano": 1666077098181107419
                  }
                ]
              },
              "description": "measures the duration of the inbound HTTP request",
              "name": "http.server.duration",
              "unit": "ms"
            }
          ],
          "schema_url": "",
          "scope": {
            "name": "opentelemetry.instrumentation.flask",
            "schema_url": "",
            "version": "0.34b0"
          }
        }
      ]
    }
  ]
}
```

</details>

## Add manual instrumentation to automatic instrumentation

Automatic instrumentation captures telemetry at the edges of your systems, such
as inbound and outbound HTTP requests, but it doesn't capture what's going on in
your application. For that you'll need to write some
[manual instrumentation](../manual/). Here's how you can easily link up manual
instrumentation with automatic instrumentation.

### Traces

First, modify `app.py` to include code that initializes a tracer and uses it to
create a trace that's a child of the one that's automatically generated:

```python
# These are the necessary import declarations
from opentelemetry import trace

from random import randint
from flask import Flask, request

# Acquire a tracer
tracer = trace.get_tracer(__name__)

app = Flask(__name__)

@app.route("/rolldice")
def roll_dice():
    return str(do_roll())

def do_roll():
    # This creates a new span that's the child of the current one
    with tracer.start_as_current_span("do_roll") as rollspan:
        res = randint(1, 6)
        rollspan.set_attribute("roll.value", res)
        return res
```

Now run the app again:

```shell
opentelemetry-instrument \
    --traces_exporter console \
    --metrics_exporter console \
    flask run
```

When you send a request to the server, you'll see two spans in the trace emitted
to the console, and the one called `do_roll` registers its parent as the
automatically created one:

<details>
<summary>View example output</summary>

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
        "attributes": {
            "telemetry.sdk.language": "python",
            "telemetry.sdk.name": "opentelemetry",
            "telemetry.sdk.version": "1.14.0",
            "telemetry.auto.version": "0.35b0",
            "service.name": "unknown_service"
        },
        "schema_url": ""
    }
}
{
    "name": "/rolldice",
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
        "http.target": "/rolldice",
        "net.peer.ip": "127.0.0.1",
        "http.user_agent": "curl/7.68.0",
        "net.peer.port": 53824,
        "http.flavor": "1.1",
        "http.route": "/rolldice",
        "http.status_code": 200
    },
    "events": [],
    "links": [],
    "resource": {
        "attributes": {
            "telemetry.sdk.language": "python",
            "telemetry.sdk.name": "opentelemetry",
            "telemetry.sdk.version": "1.14.0",
            "telemetry.auto.version": "0.35b0",
            "service.name": "unknown_service"
        },
        "schema_url": ""
    }
}
```

</details>

The `parent_id` of `do_roll` is the same is the `span_id` for `/rolldice`,
indicating a parent-child relationship!

### Metrics

Now modify `app.py` to include code that initializes a meter and uses it to
create a counter instrument which counts the number of rolls for each possible
roll value:

```python
# These are the necessary import declarations
from opentelemetry import trace
from opentelemetry import metrics

from random import randint
from flask import Flask, request

tracer = trace.get_tracer(__name__)
# Acquire a meter.
meter = metrics.get_meter(__name__)

# Now create a counter instrument to make measurements with
roll_counter = meter.create_counter(
    "roll_counter",
    description="The number of rolls by roll value",
)

app = Flask(__name__)

@app.route("/rolldice")
def roll_dice():
    return str(do_roll())

def do_roll():
    with tracer.start_as_current_span("do_roll") as rollspan:
        res = randint(1, 6)
        rollspan.set_attribute("roll.value", res)
        # This adds 1 to the counter for the given roll value
        roll_counter.add(1, {"roll.value": res})
        return res
```

Now run the app again:

```shell
opentelemetry-instrument \
    --traces_exporter console \
    --metrics_exporter console \
    flask run
```

When you send a request to the server, you'll see the roll counter metric
emitted to the console, with separate counts for each roll value:

<details>
<summary>View example output</summary>

```json
{
  "resource_metrics": [
    {
      "resource": {
        "attributes": {
          "telemetry.sdk.language": "python",
          "telemetry.sdk.name": "opentelemetry",
          "telemetry.sdk.version": "1.12.0rc1",
          "telemetry.auto.version": "0.31b0",
          "service.name": "unknown_service"
        },
        "schema_url": ""
      },
      "scope_metrics": [
        {
          "scope": {
            "name": "app",
            "version": "",
            "schema_url": null
          },
          "metrics": [
            {
              "name": "roll_counter",
              "description": "The number of rolls by roll value",
              "unit": "",
              "data": {
                "data_points": [
                  {
                    "attributes": {
                      "roll.value": 4
                    },
                    "start_time_unix_nano": 1654790325350232600,
                    "time_unix_nano": 1654790332211598800,
                    "value": 3
                  },
                  {
                    "attributes": {
                      "roll.value": 6
                    },
                    "start_time_unix_nano": 1654790325350232600,
                    "time_unix_nano": 1654790332211598800,
                    "value": 4
                  },
                  {
                    "attributes": {
                      "roll.value": 5
                    },
                    "start_time_unix_nano": 1654790325350232600,
                    "time_unix_nano": 1654790332211598800,
                    "value": 1
                  },
                  {
                    "attributes": {
                      "roll.value": 1
                    },
                    "start_time_unix_nano": 1654790325350232600,
                    "time_unix_nano": 1654790332211598800,
                    "value": 2
                  },
                  {
                    "attributes": {
                      "roll.value": 3
                    },
                    "start_time_unix_nano": 1654790325350232600,
                    "time_unix_nano": 1654790332211598800,
                    "value": 1
                  }
                ],
                "aggregation_temporality": 2,
                "is_monotonic": true
              }
            }
          ],
          "schema_url": null
        }
      ],
      "schema_url": ""
    }
  ]
}
```

</details>

## Send telemetry to an OpenTelemetry Collector

The [OpenTelemetry Collector](/docs/collector/getting-started/) is a critical
component of most production deployments. Some examples of when it's beneficial
to use a collector:

- A single telemetry sink shared by multiple services, to reduce overhead of
  switching exporters
- Aggregating traces across multiple services, running on multiple hosts
- A central place to process traces prior to exporting them to a backend

Unless you have just a single service or are experimenting, you'll want to use a
collector in production deployments.

### Configure and run a local collector

First, save the following collector configuration code to a file in the `/tmp/`
directory:

```yaml
# /tmp/otel-collector-config.yaml
receivers:
  otlp:
    protocols:
      grpc:
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
    metrics:
      receivers: [otlp]
      exporters: [logging]
      processors: [batch]
```

Then run the docker command to acquire and run the collector based on this
configuration:

```shell
docker run -p 4317:4317 \
    -v /tmp/otel-collector-config.yaml:/etc/otel-collector-config.yaml \
    otel/opentelemetry-collector:latest \
    --config=/etc/otel-collector-config.yaml
```

You will now have an collector instance running locally, listening on port 4317.

### Modify the command to export spans and metrics via OTLP

The next step is to modify the command to send spans and metrics to the
collector via OTLP instead of the console.

To do this, install the OTLP exporter package:

```
pip install opentelemetry-exporter-otlp
```

The `opentelemetry-instrument` agent will detect the package you just installed
and default to OTLP export when it's run next.

### Run the application

Run the application like before, but don't export to the console:

```
opentelemetry-instrument flask run
```

By default, `opentelemetry-instrument` exports traces and metrics over OTLP/gRPC
and will send them to `localhost:4317`, which is what the collector is listening
on.

When you access the `/rolldice` route now, you'll see output in the collector
process instead of the flask process, which should look something like this:

<details>
<summary>View example output</summary>

```
2022-06-09T20:43:39.915Z        DEBUG   loggingexporter/logging_exporter.go:51  ResourceSpans #0
Resource labels:
     -> telemetry.sdk.language: STRING(python)
     -> telemetry.sdk.name: STRING(opentelemetry)
     -> telemetry.sdk.version: STRING(1.12.0rc1)
     -> telemetry.auto.version: STRING(0.31b0)
     -> service.name: STRING(unknown_service)
InstrumentationLibrarySpans #0
InstrumentationLibrary app
Span #0
    Trace ID       : 7d4047189ac3d5f96d590f974bbec20a
    Parent ID      : 0b21630539446c31
    ID             : 4d18cee9463a79ba
    Name           : do_roll
    Kind           : SPAN_KIND_INTERNAL
    Start time     : 2022-06-09 20:43:37.390134089 +0000 UTC
    End time       : 2022-06-09 20:43:37.390327687 +0000 UTC
    Status code    : STATUS_CODE_UNSET
    Status message :
Attributes:
     -> roll.value: INT(5)
InstrumentationLibrarySpans #1
InstrumentationLibrary opentelemetry.instrumentation.flask 0.31b0
Span #0
    Trace ID       : 7d4047189ac3d5f96d590f974bbec20a
    Parent ID      :
    ID             : 0b21630539446c31
    Name           : /rolldice
    Kind           : SPAN_KIND_SERVER
    Start time     : 2022-06-09 20:43:37.388733595 +0000 UTC
    End time       : 2022-06-09 20:43:37.390723792 +0000 UTC
    Status code    : STATUS_CODE_UNSET
    Status message :
Attributes:
     -> http.method: STRING(GET)
     -> http.server_name: STRING(127.0.0.1)
     -> http.scheme: STRING(http)
     -> net.host.port: INT(5000)
     -> http.host: STRING(localhost:5000)
     -> http.target: STRING(/rolldice)
     -> net.peer.ip: STRING(127.0.0.1)
     -> http.user_agent: STRING(curl/7.82.0)
     -> net.peer.port: INT(53878)
     -> http.flavor: STRING(1.1)
     -> http.route: STRING(/rolldice)
     -> http.status_code: INT(200)

2022-06-09T20:43:40.025Z        INFO    loggingexporter/logging_exporter.go:56  MetricsExporter {"#metrics": 1}
2022-06-09T20:43:40.025Z        DEBUG   loggingexporter/logging_exporter.go:66  ResourceMetrics #0
Resource labels:
     -> telemetry.sdk.language: STRING(python)
     -> telemetry.sdk.name: STRING(opentelemetry)
     -> telemetry.sdk.version: STRING(1.12.0rc1)
     -> telemetry.auto.version: STRING(0.31b0)
     -> service.name: STRING(unknown_service)
InstrumentationLibraryMetrics #0
InstrumentationLibrary app
Metric #0
Descriptor:
     -> Name: roll_counter
     -> Description: The number of rolls by roll value
     -> Unit:
     -> DataType: Sum
     -> IsMonotonic: true
     -> AggregationTemporality: AGGREGATION_TEMPORALITY_CUMULATIVE
NumberDataPoints #0
Data point attributes:
     -> roll.value: INT(5)
StartTimestamp: 2022-06-09 20:43:37.390226915 +0000 UTC
Timestamp: 2022-06-09 20:43:39.848587966 +0000 UTC
Value: 1
```

</details>

## Next steps

There are several options available for automatic instrumentation and Python.
See [Automatic Instrumentation](../automatic/) to learn about them and how to
configure them.

There's a lot more to manual instrumentation than just creating a child span. To
learn details about initializing manual instrumentation and many more parts of
the OpenTelemetry API you can use, see [Manual Instrumentation](../manual/).

Finally, there are several options for exporting your telemetry data with
OpenTelemetry. To learn how to export your data to a preferred backend, see
[Exporters](../exporters/).

[traces]: https://opentelemetry.io/docs/concepts/signals/traces/
[metrics]: https://opentelemetry.io/docs/concepts/signals/metrics/
[logs]: https://opentelemetry.io/docs/concepts/signals/logs/
