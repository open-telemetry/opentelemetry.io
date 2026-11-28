---
title: Getting Started by Example
description: Get telemetry for your app in less than 5 minutes!
weight: 10
cSpell:ignore: diceroller distro randint rolldice rollspan venv
---

This page will show you how to get started with OpenTelemetry in Python.

You will learn how you can instrument a simple Python application automatically,
in such a way that [traces][], [metrics][], and [logs][] are emitted to the
console.

## Prerequisites

Ensure that you have the following installed locally:

- [Python 3.10+](https://www.python.org/)

> [!NOTE]
>
> On Windows, Python is typically invoked using `python` rather than `python3`.
> The following examples show the correct commands for your operating system.

> [!Python Version]
>
> The guide assumes that you have Python 3.10 or newer. If your system Python3
> installation is older than that, please install a newer version. One way to
> maintain multiple installations of Python on your system is by using
> [uv](https://docs.astral.sh/uv/guides/install-python/)

## Example Application

The following example uses a basic [Flask](https://flask.palletsprojects.com/)
application. If you are not using Flask, that's OK — you can use OpenTelemetry
Python with other web frameworks as well, such as Django and FastAPI. For a
complete list of libraries for supported frameworks, see the
[registry](/ecosystem/registry/?component=instrumentation&language=python).

For more elaborate examples, see [examples](/docs/languages/python/examples/).

## Installation

To begin, set up an environment in a new directory:

{{< tabpane text=true >}} {{% tab "Linux/macOS" %}}

```shell
mkdir otel-getting-started
cd otel-getting-started
python3 -m venv venv
source ./venv/bin/activate
```

{{% /tab %}} {{% tab "Windows (PowerShell)" %}}

```powershell
mkdir otel-getting-started
cd otel-getting-started
python -m venv venv
.\venv\Scripts\Activate.ps1
```

{{% /tab %}} {{< /tabpane >}}

Now install Flask:

```shell
pip install flask
```

### Create and launch an HTTP Server

Create a file `app.py` and add the following code to it:

```python
from random import randint
from flask import Flask, request
import logging

app = Flask(__name__)
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@app.route("/rolldice")
def roll_dice():
    player = request.args.get('player', default=None, type=str)
    result = str(roll())
    if player:
        logger.warning("%s is rolling the dice: %s", player, result)
    else:
        logger.warning("Anonymous player is rolling the dice: %s", result)
    return result


def roll():
    return randint(1, 6)
```

Run the application with the following command and open
<http://localhost:8080/rolldice> in your web browser to ensure it is working.

```sh
flask run -p 8080
```

## Instrumentation

Zero-code instrumentation will generate telemetry data on your behalf. There are
several options you can take, covered in more detail in
[Zero-code Instrumentation](/docs/zero-code/python/). Here we'll use the
`opentelemetry-instrument` agent.

Install the `opentelemetry-distro` package, which contains the OpenTelemetry
API, SDK and also the tools `opentelemetry-bootstrap` and
`opentelemetry-instrument` you will use below.

```shell
pip install opentelemetry-distro
```

Run the `opentelemetry-bootstrap` command:

```shell
opentelemetry-bootstrap -a install
```

This will install Flask instrumentation.

## Configure the SDK and run the instrumented app

Since the `v1.44.0` release of `opentelemetry-python`, the SDK supports
[declarative configuration](https://opentelemetry-python.readthedocs.io/en/latest/sdk/configuration.html#)
as an experimental feature.

To opt into this functionality, install the `file-configuration` extra for the
SDK with:

```shell
pip install opentelemetry-sdk[file-configuration]
```

A minimal configuration for the SDK is below:

```yaml
#otel-config.yaml
file_format: "1.0"

resource:
  attributes:
    - name: service.name
      value: dice-server

tracer_provider:
  processors:
    - simple:
        exporter:
          console: {}
  sampler:
    parent_based:
      root:
        always_on: {}

meter_provider:
  readers:
    - periodic:
        interval: 60000
        exporter:
          console: {}

logger_provider:
  processors:
    - simple:
        exporter:
          console: {}

propagator:
  composite:
    - tracecontext: {}
```

You can now run your instrumented app with `opentelemetry-instrument` and have
it print to the console for now:

{{< tabpane text=true >}} {{% tab "Linux/macOS" %}}

```shell
opentelemetry-instrument \
    --config_file otel-config.yaml \
    flask run -p 8080
```

{{% /tab %}} {{% tab "Windows (PowerShell)" %}}

```powershell
opentelemetry-instrument `
    --config_file otel-config.yaml `
    flask run -p 8080
```

{{% /tab %}} {{< /tabpane >}}

Alternatively, you can set the environment variable `OTEL_CONFIG_FILE` to point
to the file. If you want to reference environment variables within the SDK
configuration file, please refer to the section on
[environment variable substitution](https://opentelemetry-python.readthedocs.io/en/latest/sdk/configuration.html#environment-variable-substitution).

If you prefer to pass the configuration options via the CLI instead of the
configuration file you can do so by:

{{< tabpane text=true >}} {{% tab "Linux/macOS" %}}

```shell
opentelemetry-instrument \
    --traces_exporter console \
    --metrics_exporter console \
    --logs_exporter console \
    --service_name dice-server \
    flask run -p 8080
```

{{% /tab %}} {{% tab "Windows (PowerShell)" %}}

```powershell
opentelemetry-instrument `
    --traces_exporter console `
    --metrics_exporter console `
    --logs_exporter console `
    --service_name dice-server `
    flask run -p 8080
```

{{% /tab %}} {{< /tabpane >}}

All examples henceforth will use the declarative configuration. If you want an
overview of the various methods of configuring the SDK, please refer to
[OpenTelemetry SDK configuration specification](/docs/specs/otel/configuration/).

Open <http://localhost:8080/rolldice> in your web browser and reload the page a
few times. After a while you should see the spans printed in the console, such
as the following:

<details>
<summary>View example output</summary>

```json
{
    "body": "127.0.0.1 - - [10/Nov/2026 20:37:17] \"GET /rolldice HTTP/1.1\" 200 -",
    "severity_number": 9,
    "severity_text": "INFO",
    "attributes": null,
    "dropped_attributes": 0,
    "timestamp": "2026-11-11T03:37:17.226821Z",
    "observed_timestamp": "2026-11-11T03:37:17.227016Z",
    "trace_id": "0x00000000000000000000000000000000",
    "span_id": "0x0000000000000000",
    "trace_flags": 0,
    "resource": {
        "attributes": {
            "telemetry.sdk.language": "python",
            "telemetry.sdk.name": "opentelemetry",
            "telemetry.sdk.version": "1.45.2",
            "service.name": "dice-server"
        },
        "schema_url": ""
    },
    "event_name": ""
}
{
    "name": "GET /rolldice",
    "context": {
        "trace_id": "0x7e0fe04579d47fdc16412d2c4f3c8fcf",
        "span_id": "0xb589c76e57afe801",
        "trace_state": "[]"
    },
    "kind": "SpanKind.SERVER",
    "parent_id": null,
    "start_time": "2026-11-11T03:37:17.224756Z",
    "end_time": "2026-11-11T03:37:17.226227Z",
    "status": {
        "status_code": "UNSET"
    },
    "attributes": {
        "http.method": "GET",
        "http.server_name": "127.0.0.1",
        "http.scheme": "http",
        "net.host.name": "localhost:8080",
        "http.host": "localhost:8080",
        "net.host.port": 8080,
        "http.target": "/rolldice",
        "net.peer.ip": "127.0.0.1",
        "net.peer.port": 63882,
        "http.user_agent": "oha/1.12.0",
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
            "telemetry.sdk.version": "1.45.2",
            "service.name": "dice-server"
        },
        "schema_url": ""
    }
}
```

</details>

The generated span tracks the lifetime of a request to the `/rolldice` route.

The log line emitted during the request contains the same trace ID and span ID
and is exported to the console via the log exporter.

Send a few more requests to the endpoint, and then either wait for a little bit
or terminate the app and you'll see metrics in the console output, such as the
following:

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
          "telemetry.sdk.version": "1.45.2",
          "service.name": "dice-server"
        },
        "schema_url": ""
      },
      "scope_metrics": [
        {
          "scope": {
            "name": "opentelemetry.instrumentation.flask",
            "version": "0.66b2",
            "schema_url": "https://opentelemetry.io/schemas/1.11.0",
            "attributes": null
          },
          "metrics": [
            {
              "name": "http.server.active_requests",
              "description": "Measures the number of concurrent HTTP requests that are currently in-flight.",
              "unit": "requests",
              "data": {
                "data_points": [
                  {
                    "attributes": {
                      "http.method": "GET",
                      "http.server_name": "127.0.0.1",
                      "http.scheme": "http",
                      "http.host": "localhost:8080",
                      "http.flavor": "1.1"
                    },
                    "start_time_unix_nano": 1794368346087716000,
                    "time_unix_nano": 1794368353425970000,
                    "value": 0,
                    "exemplars": []
                  }
                ],
                "aggregation_temporality": 2,
                "is_monotonic": false
              }
            },
            {
              "name": "http.server.duration",
              "description": "Measures the duration of inbound HTTP requests.",
              "unit": "ms",
              "data": {
                "data_points": [
                  {
                    "attributes": {
                      "http.method": "GET",
                      "http.server_name": "127.0.0.1",
                      "http.scheme": "http",
                      "net.host.name": "localhost:8080",
                      "http.host": "localhost:8080",
                      "net.host.port": 8080,
                      "http.flavor": "1.1",
                      "http.status_code": 200,
                      "http.target": "/rolldice"
                    },
                    "start_time_unix_nano": 1794368346088491000,
                    "time_unix_nano": 1794368353425970000,
                    "count": 25,
                    "sum": 44,
                    "bucket_counts": [
                      5, 20, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
                    ],
                    "explicit_bounds": [
                      0.0, 5.0, 10.0, 25.0, 50.0, 75.0, 100.0, 250.0, 500.0,
                      750.0, 1000.0, 2500.0, 5000.0, 7500.0, 10000.0
                    ],
                    "min": 0,
                    "max": 4,
                    "exemplars": [
                      {
                        "filtered_attributes": {},
                        "value": 0,
                        "time_unix_nano": 1794368346091981000,
                        "span_id": 5352008083787969880,
                        "trace_id": 15998216991376934704876311030777507946
                      },
                      {
                        "filtered_attributes": {},
                        "value": 2,
                        "time_unix_nano": 1794368346103213000,
                        "span_id": 18142619375541615681,
                        "trace_id": 35769804078956673853127052238733925384
                      }
                    ]
                  }
                ],
                "aggregation_temporality": 2
              }
            }
          ],
          "schema_url": "https://opentelemetry.io/schemas/1.11.0"
        }
      ],
      "schema_url": ""
    }
  ]
}
```

</details>

## Add manual instrumentation to automatic instrumentation

Automatic instrumentation captures telemetry at the edges of your systems, such
as inbound and outbound HTTP requests, but it doesn't capture what's going on in
your application. For that you'll need to write some
[manual instrumentation](../instrumentation/). Here's how you can easily link up
manual instrumentation with automatic instrumentation.

### Traces

First, modify `app.py` to include code that initializes a tracer and uses it to
create a trace that's a child of the one that's automatically generated:

```python
from random import randint
from flask import Flask

from opentelemetry import trace

# Acquire a tracer
tracer = trace.get_tracer("diceroller.tracer")

app = Flask(__name__)

@app.route("/rolldice")
def roll_dice():
    return str(roll())

def roll():
    # This creates a new span that's the child of the current one
    with tracer.start_as_current_span("roll") as rollspan:
        res = randint(1, 6)
        rollspan.set_attribute("roll.value", res)
        return res
```

Now run the app again:

{{< tabpane text=true >}} {{% tab "Linux/macOS" %}}

```shell
opentelemetry-instrument \
    --config_file otel-config.yaml
    flask run -p 8080
```

{{% /tab %}} {{% tab "Windows (PowerShell)" %}}

```powershell
opentelemetry-instrument `
    --config_file otel-config.yaml `
    flask run -p 8080
```

{{% /tab %}} {{< /tabpane >}}

When you send a request to the server, you'll see two spans in the trace emitted
to the console, and the one called `roll` registers its parent as the
automatically created one:

<details>
<summary>View example output</summary>

```json
{
    "name": "roll",
    "context": {
        "trace_id": "0x5dadb3637c75e026a9ddb0b1602e56fc",
        "span_id": "0xf4babecfca2d2d6d",
        "trace_state": "[]"
    },
    "kind": "SpanKind.INTERNAL",
    "parent_id": "0x32e6594143b6c0e0",
    "start_time": "2026-11-11T03:40:58.092640Z",
    "end_time": "2026-11-11T03:40:58.092657Z",
    "status": {
        "status_code": "UNSET"
    },
    "attributes": {
        "roll.value": 5
    },
    "events": [],
    "links": [],
    "resource": {
        "attributes": {
            "telemetry.sdk.language": "python",
            "telemetry.sdk.name": "opentelemetry",
            "telemetry.sdk.version": "1.45.2",
            "service.name": "dice-server"
        },
        "schema_url": ""
    }
}
{
    "name": "GET /rolldice",
    "context": {
        "trace_id": "0x5dadb3637c75e026a9ddb0b1602e56fc",
        "span_id": "0x32e6594143b6c0e0",
        "trace_state": "[]"
    },
    "kind": "SpanKind.SERVER",
    "parent_id": null,
    "start_time": "2026-11-11T03:40:58.092048Z",
    "end_time": "2026-11-11T03:40:58.092761Z",
    "status": {
        "status_code": "UNSET"
    },
    "attributes": {
        "http.method": "GET",
        "http.server_name": "127.0.0.1",
        "http.scheme": "http",
        "net.host.name": "localhost:8080",
        "http.host": "localhost:8080",
        "net.host.port": 8080,
        "http.target": "/rolldice",
        "net.peer.ip": "127.0.0.1",
        "net.peer.port": 64458,
        "http.user_agent": "curl/8.7.1",
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
            "telemetry.sdk.version": "1.45.2",
            "service.name": "dice-server"
        },
        "schema_url": ""
    }
}
```

</details>

The `parent_id` of `roll` is the same as the `span_id` for `/rolldice`,
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
import logging

# Acquire a tracer
tracer = trace.get_tracer("diceroller.tracer")
# Acquire a meter.
meter = metrics.get_meter("diceroller.meter")

# Now create a counter instrument to make measurements with
roll_counter = meter.create_counter(
    "dice.rolls",
    description="The number of rolls by roll value",
)

app = Flask(__name__)
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@app.route("/rolldice")
def roll_dice():
    # This creates a new span that's the child of the current one
    with tracer.start_as_current_span("roll") as roll_span:
        player = request.args.get('player', default = None, type = str)
        result = str(roll())
        roll_span.set_attribute("roll.value", result)
        # This adds 1 to the counter for the given roll value
        roll_counter.add(1, {"roll.value": result})
        if player:
            logger.warning("%s is rolling the dice: %s", player, result)
        else:
            logger.warning("Anonymous player is rolling the dice: %s", result)
        return result

def roll():
    return randint(1, 6)
```

Now run the app again:

{{< tabpane text=true >}} {{% tab "Linux/macOS" %}}

```shell
opentelemetry-instrument \
    --config_file otel-config.yaml \
    flask run -p 8080
```

{{% /tab %}} {{% tab "Windows (PowerShell)" %}}

```powershell
opentelemetry-instrument `
    --config_file otel-config.yaml `
    flask run -p 8080
```

{{% /tab %}} {{< /tabpane >}}

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
          "telemetry.sdk.version": "1.45.2",
          "service.name": "dice-server"
        },
        "schema_url": ""
      },
      "scope_metrics": [
        {
          "scope": {
            "name": "opentelemetry.instrumentation.flask",
            "version": "0.66b2",
            "schema_url": "https://opentelemetry.io/schemas/1.11.0",
            "attributes": null
          },
          "metrics": [
            {
              "name": "http.server.active_requests",
              "description": "Measures the number of concurrent HTTP requests that are currently in-flight.",
              "unit": "requests",
              "data": {
                "data_points": [
                  {
                    "attributes": {
                      "http.method": "GET",
                      "http.server_name": "127.0.0.1",
                      "http.scheme": "http",
                      "http.host": "localhost:8080",
                      "http.flavor": "1.1"
                    },
                    "start_time_unix_nano": 1794368504803167000,
                    "time_unix_nano": 1794368516252913000,
                    "value": 0,
                    "exemplars": []
                  }
                ],
                "aggregation_temporality": 2,
                "is_monotonic": false
              }
            },
            {
              "name": "http.server.duration",
              "description": "Measures the duration of inbound HTTP requests.",
              "unit": "ms",
              "data": {
                "data_points": [
                  {
                    "attributes": {
                      "http.method": "GET",
                      "http.server_name": "127.0.0.1",
                      "http.scheme": "http",
                      "net.host.name": "localhost:8080",
                      "http.host": "localhost:8080",
                      "net.host.port": 8080,
                      "http.flavor": "1.1",
                      "http.status_code": 200,
                      "http.target": "/rolldice"
                    },
                    "start_time_unix_nano": 1794368504804300000,
                    "time_unix_nano": 1794368516252913000,
                    "count": 25,
                    "sum": 44,
                    "bucket_counts": [
                      1, 24, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
                    ],
                    "explicit_bounds": [
                      0.0, 5.0, 10.0, 25.0, 50.0, 75.0, 100.0, 250.0, 500.0,
                      750.0, 1000.0, 2500.0, 5000.0, 7500.0, 10000.0
                    ],
                    "min": 0,
                    "max": 3,
                    "exemplars": [
                      {
                        "filtered_attributes": {},
                        "value": 0,
                        "time_unix_nano": 1794368504804985000,
                        "span_id": 2175337851338618927,
                        "trace_id": 71164776724963741533153286724981940859
                      },
                      {
                        "filtered_attributes": {},
                        "value": 2,
                        "time_unix_nano": 1794368504820476000,
                        "span_id": 1685896432892059137,
                        "trace_id": 79596083832888797490931352134353827836
                      }
                    ]
                  }
                ],
                "aggregation_temporality": 2
              }
            }
          ],
          "schema_url": "https://opentelemetry.io/schemas/1.11.0"
        },
        {
          "scope": {
            "name": "diceroller.meter",
            "version": "",
            "schema_url": "",
            "attributes": null
          },
          "metrics": [
            {
              "name": "dice.rolls",
              "description": "The number of rolls by roll value",
              "unit": "",
              "data": {
                "data_points": [
                  {
                    "attributes": {
                      "roll.value": "1"
                    },
                    "start_time_unix_nano": 1794368504803708000,
                    "time_unix_nano": 1794368516252913000,
                    "value": 5,
                    "exemplars": [
                      {
                        "filtered_attributes": {},
                        "value": 1,
                        "time_unix_nano": 1794368504803685000,
                        "span_id": 1503872195131524,
                        "trace_id": 184173619300326621420488609769867237983
                      }
                    ]
                  },
                  {
                    "attributes": {
                      "roll.value": "3"
                    },
                    "start_time_unix_nano": 1794368504804822000,
                    "time_unix_nano": 1794368516252913000,
                    "value": 3,
                    "exemplars": [
                      {
                        "filtered_attributes": {},
                        "value": 1,
                        "time_unix_nano": 1794368504807734000,
                        "span_id": 2653818759422671711,
                        "trace_id": 139347967803891771202055761577825080360
                      }
                    ]
                  },
                  {
                    "attributes": {
                      "roll.value": "4"
                    },
                    "start_time_unix_nano": 1794368504805580000,
                    "time_unix_nano": 1794368516252913000,
                    "value": 4,
                    "exemplars": [
                      {
                        "filtered_attributes": {},
                        "value": 1,
                        "time_unix_nano": 1794368504809642000,
                        "span_id": 9463678871779963690,
                        "trace_id": 59455009298870112794805988423610057164
                      }
                    ]
                  },
                  {
                    "attributes": {
                      "roll.value": "2"
                    },
                    "start_time_unix_nano": 1794368504806010000,
                    "time_unix_nano": 1794368516252913000,
                    "value": 4,
                    "exemplars": [
                      {
                        "filtered_attributes": {},
                        "value": 1,
                        "time_unix_nano": 1794368504809044000,
                        "span_id": 10497948505202081576,
                        "trace_id": 38626065422102000085803067302854236516
                      }
                    ]
                  },
                  {
                    "attributes": {
                      "roll.value": "5"
                    },
                    "start_time_unix_nano": 1794368504810792000,
                    "time_unix_nano": 1794368516252913000,
                    "value": 5,
                    "exemplars": [
                      {
                        "filtered_attributes": {},
                        "value": 1,
                        "time_unix_nano": 1794368504814333000,
                        "span_id": 7860173951321253390,
                        "trace_id": 137661689513470679213687045946718064253
                      }
                    ]
                  },
                  {
                    "attributes": {
                      "roll.value": "6"
                    },
                    "start_time_unix_nano": 1794368504813348000,
                    "time_unix_nano": 1794368516252913000,
                    "value": 4,
                    "exemplars": [
                      {
                        "filtered_attributes": {},
                        "value": 1,
                        "time_unix_nano": 1794368504813334000,
                        "span_id": 5925670029419188984,
                        "trace_id": 260337936798013175894713164277665291747
                      }
                    ]
                  }
                ],
                "aggregation_temporality": 2,
                "is_monotonic": true
              }
            }
          ],
          "schema_url": ""
        }
      ],
      "schema_url": ""
    }
  ]
}
```

</details>

## Send telemetry to an OpenTelemetry Collector

The [OpenTelemetry Collector](/docs/collector/) is a critical component of most
production deployments. Some examples of when it's beneficial to use a
collector:

- A single telemetry sink shared by multiple services, to reduce overhead of
  switching exporters
- Aggregating traces across multiple services, running on multiple hosts
- A central place to process traces prior to exporting them to a backend

Unless you have just a single service or are experimenting, you'll want to use a
collector in production deployments.

### Configure and run a local collector

First, save the following collector configuration code to a file. On
Linux/macOS, save it to `/tmp/otel-collector-config.yaml`. On Windows, save it
to `$env:TEMP\otel-collector-config.yaml`:

```yaml
# otel-collector-config.yaml
receivers:
  otlp:
    protocols:
      grpc:
        endpoint: 0.0.0.0:4317
      http:
        endpoint: 0.0.0.0:4318
exporters:
  # NOTE: Prior to v0.86.0 use `logging` instead of `debug`.
  debug:
    verbosity: detailed
service:
  pipelines:
    traces:
      receivers: [otlp]
      exporters: [debug]
    metrics:
      receivers: [otlp]
      exporters: [debug]
    logs:
      receivers: [otlp]
      exporters: [debug]
```

Then run the docker command to acquire and run the collector based on this
configuration:

{{< tabpane text=true >}} {{% tab "Linux/macOS" %}}

```shell
docker run -p 4317:4317 \
    -v /tmp/otel-collector-config.yaml:/etc/otel-collector-config.yaml \
    otel/opentelemetry-collector:latest \
    --config=/etc/otel-collector-config.yaml
```

{{% /tab %}} {{% tab "Windows (PowerShell)" %}}

```powershell
docker run -p 4317:4317 `
    -v "${env:TEMP}\otel-collector-config.yaml:/etc/otel-collector-config.yaml" `
    otel/opentelemetry-collector:latest `
    --config=/etc/otel-collector-config.yaml
```

{{% /tab %}} {{< /tabpane >}}

You will now have a collector instance running locally, listening on port 4317.

### Modify the command to export spans and metrics via OTLP

The next step is to modify the command to send spans and metrics to the
collector via OTLP instead of the console.

To do this, install the OTLP exporter package:

```shell
pip install opentelemetry-exporter-otlp
```

The `opentelemetry-instrument` agent will detect the package you just installed
and default to OTLP export when it's run next.

### Run the application

Run the application like before, but don't export to the console. Update the
configuration for the SDK as shown here:

```yaml
#otel-config.yaml
file_format: "1.0"

resource:
  attributes:
    - name: service.name
      value: dice-server

tracer_provider:
  processors:
    - simple:
        exporter:
          otlp_grpc:
            endpoint: http://localhost:4317/v1/traces
  sampler:
    parent_based:
      root:
        always_on: {}

meter_provider:
  readers:
    - periodic:
        interval: 60000
        exporter:
          otlp_grpc:
            endpoint: http://localhost:4317/v1/metrics

logger_provider:
  processors:
    - simple:
        exporter:
          otlp_grpc:
            endpoint: http://localhost:4317/v1/logs

propagator:
  composite:
    - tracecontext: {}
```

{{< tabpane text=true >}} {{% tab "Linux/macOS" %}}

```shell
opentelemetry-instrument --config_file otel-config.yaml flask run -p 8080
```

{{% /tab %}} {{% tab "Windows (PowerShell)" %}}

```powershell
opentelemetry-instrument --config_file otel-config.yaml flask run -p 8080
```

{{% /tab %}} {{< /tabpane >}}

By default, `opentelemetry-instrument` exports traces and metrics over OTLP/gRPC
and will send them to `localhost:4317`, which is what the collector is listening
on.

When you access the `/rolldice` route now, you'll see output in the collector
process instead of the flask process, which should look something like this:

<details>
<summary>View example output</summary>

```text
2026-11-11T03:43:20.121Z	info	Logs	{"resource": {"service.instance.id": "33d084c3-bd02-4169-8c8f-9f8abd4aa4be", "service.name": "otelcol", "service.version": "0.165.0"}, "otelcol.component.id": "debug", "otelcol.component.kind": "exporter", "otelcol.signal": "logs", "resource logs": 1, "log records": 2}
2026-11-11T03:43:20.121Z	info	ResourceLog #0
Resource SchemaURL:
Resource attributes:
     -> telemetry.sdk.language: Str(python)
     -> telemetry.sdk.name: Str(opentelemetry)
     -> telemetry.sdk.version: Str(1.45.2)
     -> service.name: Str(dice-server)
ScopeLogs #0
ScopeLogs SchemaURL:
InstrumentationScope app
LogRecord #0
ObservedTimestamp: 2026-11-11 03:43:19.85316 +0000 UTC
Timestamp: 2026-11-11 03:43:19.853020928 +0000 UTC
SeverityText: WARN
SeverityNumber: Warn(13)
Body: Str(Anonymous player is rolling the dice: 3)
Trace ID: d46996b3f8fb8dcbee5841c99225edbf
Span ID: 2499414913b4f3d1
Flags: 3
ScopeLogs #1
ScopeLogs SchemaURL:
InstrumentationScope werkzeug
LogRecord #0
ObservedTimestamp: 2026-11-11 03:43:19.853869 +0000 UTC
Timestamp: 2026-11-11 03:43:19.853819904 +0000 UTC
SeverityText: INFO
SeverityNumber: Info(9)
Body: Str(127.0.0.1 - - [10/Nov/2026 20:43:19] "GET /rolldice HTTP/1.1" 200 -)
Trace ID:
Span ID:
Flags: 0
	{"resource": {"service.instance.id": "33d084c3-bd02-4169-8c8f-9f8abd4aa4be", "service.name": "otelcol", "service.version": "0.165.0"}, "otelcol.component.id": "debug", "otelcol.component.kind": "exporter", "otelcol.signal": "logs"}
2026-11-11T03:43:21.055Z	info	Traces	{"resource": {"service.instance.id": "33d084c3-bd02-4169-8c8f-9f8abd4aa4be", "service.name": "otelcol", "service.version": "0.165.0"}, "otelcol.component.id": "debug", "otelcol.component.kind": "exporter", "otelcol.signal": "traces", "resource spans": 1, "spans": 2}
2026-11-11T03:43:21.056Z	info	ResourceSpans #0
Resource SchemaURL:
Resource attributes:
     -> telemetry.sdk.language: Str(python)
     -> telemetry.sdk.name: Str(opentelemetry)
     -> telemetry.sdk.version: Str(1.45.2)
     -> service.name: Str(dice-server)
ScopeSpans #0
ScopeSpans SchemaURL:
InstrumentationScope diceroller.tracer
Span #0
    Trace ID       : d46996b3f8fb8dcbee5841c99225edbf
    Parent ID      : 1572ca491bca2e5f
    ID             : 2499414913b4f3d1
    Name           : roll
    Kind           : Internal
    Start time     : 2026-11-11 03:43:19.852911 +0000 UTC
    End time       : 2026-11-11 03:43:19.853218 +0000 UTC
    Status code    : Unset
    Status message :
    DroppedAttributesCount: 0
    DroppedEventsCount: 0
    DroppedLinksCount: 0
Attributes:
     -> roll.value: Str(3)
ScopeSpans #1
ScopeSpans SchemaURL: https://opentelemetry.io/schemas/1.11.0
InstrumentationScope opentelemetry.instrumentation.flask 0.66b2
Span #0
    Trace ID       : d46996b3f8fb8dcbee5841c99225edbf
    Parent ID      :
    ID             : 1572ca491bca2e5f
    Name           : GET /rolldice
    Kind           : Server
    Start time     : 2026-11-11 03:43:19.852043 +0000 UTC
    End time       : 2026-11-11 03:43:19.853391 +0000 UTC
    Status code    : Unset
    Status message :
    DroppedAttributesCount: 0
    DroppedEventsCount: 0
    DroppedLinksCount: 0
Attributes:
     -> http.method: Str(GET)
     -> http.server_name: Str(127.0.0.1)
     -> http.scheme: Str(http)
     -> net.host.name: Str(localhost:8080)
     -> http.host: Str(localhost:8080)
     -> net.host.port: Int(8080)
     -> http.target: Str(/rolldice)
     -> net.peer.ip: Str(127.0.0.1)
     -> net.peer.port: Int(64835)
     -> http.user_agent: Str(curl/8.7.1)
     -> http.flavor: Str(1.1)
     -> http.route: Str(/rolldice)
     -> http.status_code: Int(200)
	{"resource": {"service.instance.id": "33d084c3-bd02-4169-8c8f-9f8abd4aa4be", "service.name": "otelcol", "service.version": "0.165.0"}, "otelcol.component.id": "debug", "otelcol.component.kind": "exporter", "otelcol.signal": "traces"}
2026-11-11T03:44:06.048Z	info	Metrics	{"resource": {"service.instance.id": "33d084c3-bd02-4169-8c8f-9f8abd4aa4be", "service.name": "otelcol", "service.version": "0.165.0"}, "otelcol.component.id": "debug", "otelcol.component.kind": "exporter", "otelcol.signal": "metrics", "resource metrics": 1, "metrics": 3, "data points": 3}
2026-11-11T03:44:06.048Z	info	ResourceMetrics #0
Resource SchemaURL:
Resource attributes:
     -> telemetry.sdk.language: Str(python)
     -> telemetry.sdk.name: Str(opentelemetry)
     -> telemetry.sdk.version: Str(1.45.2)
     -> service.name: Str(dice-server)
ScopeMetrics #0
ScopeMetrics SchemaURL: https://opentelemetry.io/schemas/1.11.0
InstrumentationScope opentelemetry.instrumentation.flask 0.66b2
Metric #0
Descriptor:
     -> Name: http.server.active_requests
     -> Description: Measures the number of concurrent HTTP requests that are currently in-flight.
     -> Unit: requests
     -> DataType: Sum
     -> IsMonotonic: false
     -> AggregationTemporality: Cumulative
NumberDataPoints #0
Data point attributes:
     -> http.method: Str(GET)
     -> http.server_name: Str(127.0.0.1)
     -> http.scheme: Str(http)
     -> http.host: Str(localhost:8080)
     -> http.flavor: Str(1.1)
StartTimestamp: 2026-11-11 03:43:19.85229 +0000 UTC
Timestamp: 2026-11-11 03:44:06.037524 +0000 UTC
Value: 0
Metric #1
Descriptor:
     -> Name: http.server.duration
     -> Description: Measures the duration of inbound HTTP requests.
     -> Unit: ms
     -> DataType: Histogram
     -> AggregationTemporality: Cumulative
HistogramDataPoints #0
Data point attributes:
     -> http.method: Str(GET)
     -> http.server_name: Str(127.0.0.1)
     -> http.scheme: Str(http)
     -> net.host.name: Str(localhost:8080)
     -> http.host: Str(localhost:8080)
     -> net.host.port: Int(8080)
     -> http.flavor: Str(1.1)
     -> http.status_code: Int(200)
     -> http.target: Str(/rolldice)
StartTimestamp: 2026-11-11 03:43:19.853486 +0000 UTC
Timestamp: 2026-11-11 03:44:06.037524 +0000 UTC
Count: 1
Sum: 1.000000
Min: 1.000000
Max: 1.000000
ExplicitBounds #0: 0.000000
ExplicitBounds #1: 5.000000
ExplicitBounds #2: 10.000000
ExplicitBounds #3: 25.000000
ExplicitBounds #4: 50.000000
ExplicitBounds #5: 75.000000
ExplicitBounds #6: 100.000000
ExplicitBounds #7: 250.000000
ExplicitBounds #8: 500.000000
ExplicitBounds #9: 750.000000
ExplicitBounds #10: 1000.000000
ExplicitBounds #11: 2500.000000
ExplicitBounds #12: 5000.000000
ExplicitBounds #13: 7500.000000
ExplicitBounds #14: 10000.000000
Buckets #0, Count: 0
Buckets #1, Count: 1
Buckets #2, Count: 0
Buckets #3, Count: 0
Buckets #4, Count: 0
Buckets #5, Count: 0
Buckets #6, Count: 0
Buckets #7, Count: 0
Buckets #8, Count: 0
Buckets #9, Count: 0
Buckets #10, Count: 0
Buckets #11, Count: 0
Buckets #12, Count: 0
Buckets #13, Count: 0
Buckets #14, Count: 0
Buckets #15, Count: 0
Exemplars:
Exemplar #0
     -> Trace ID: d46996b3f8fb8dcbee5841c99225edbf
     -> Span ID: 1572ca491bca2e5f
     -> Timestamp: 2026-11-11 03:43:19.853437 +0000 UTC
     -> Value: 1
ScopeMetrics #1
ScopeMetrics SchemaURL:
InstrumentationScope diceroller.meter
Metric #0
Descriptor:
     -> Name: dice.rolls
     -> Description: The number of rolls by roll value
     -> Unit:
     -> DataType: Sum
     -> IsMonotonic: true
     -> AggregationTemporality: Cumulative
NumberDataPoints #0
Data point attributes:
     -> roll.value: Str(3)
StartTimestamp: 2026-11-11 03:43:19.852978 +0000 UTC
Timestamp: 2026-11-11 03:44:06.037524 +0000 UTC
Value: 1
Exemplars:
Exemplar #0
     -> Trace ID: d46996b3f8fb8dcbee5841c99225edbf
     -> Span ID: 2499414913b4f3d1
     -> Timestamp: 2026-11-11 03:43:19.852953 +0000 UTC
     -> Value: 1
	{"resource": {"service.instance.id": "33d084c3-bd02-4169-8c8f-9f8abd4aa4be", "service.name": "otelcol", "service.version": "0.165.0"}, "otelcol.component.id": "debug", "otelcol.component.kind": "exporter", "otelcol.signal": "metrics"}
```

</details>

## Next steps

There are several options available for automatic instrumentation and Python.
See [Zero-code Instrumentation](/docs/zero-code/python/) to learn about them and
how to configure them.

There's a lot more to manual instrumentation than just creating a child span. To
learn details about initializing manual instrumentation and many more parts of
the OpenTelemetry API you can use, see
[Manual Instrumentation](../instrumentation/).

There are several options for exporting your telemetry data with OpenTelemetry.
To learn how to export your data to a preferred backend, see
[Exporters](../exporters/).

If you'd like to explore a more complex example, take a look at the
[OpenTelemetry Demo](/docs/demo/), which includes the Python based
[Recommendation Service](/docs/demo/services/recommendation/) and
[Load Generator](/docs/demo/services/load-generator/).

[traces]: /docs/concepts/signals/traces/
[metrics]: /docs/concepts/signals/metrics/
[logs]: /docs/concepts/signals/logs/
