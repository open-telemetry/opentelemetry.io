---
title: Automatic Instrumentation
linkTitle: Automatic
weight: 20
spelling: cSpell:ignore distro mkdir uninstrumented virtualenv devel myapp
---

Automatic instrumentation with Python uses a Python agent that can be attached
to any Python application. It dynamically injects bytecode to capture telemetry
from many popular libraries and frameworks.

## Setup

Run the following commands to install the appropriate packages.

```sh
pip install opentelemetry-distro opentelemetry-exporter-otlp
opentelemetry-bootstrap -a install
```

The `opentelemetry-distro` package installs the API, SDK, and the
`opentelemetry-bootstrap` and `opentelemetry-instrument` tools.

The `opentelemetry-bootstrap -a install` command reads through the list of
packages installed in your active `site-packages` folder, and installs the
corresponding instrumentation libraries for these packages, if applicable. For
example, if you already installed the `flask` package, running
`opentelemetry-bootstrap -a install` will install
`opentelemetry-instrumentation-flask` for you.

> **NOTE:** If you leave out `-a install`, the command will simply list out the
> recommended auto-instrumentation packages to be installed. More information
> can be found
> [here](https://github.com/open-telemetry/opentelemetry-python-contrib/tree/main/opentelemetry-instrumentation#opentelemetry-bootstrap).

## Configuring the agent

The agent is highly configurable.

One option is to configure the agent by way of configuration properties from the
CLI:

```console
opentelemetry-instrument \
    --traces_exporter console,otlp \
    --metrics_exporter console \
    --service_name your-service-name \
    --exporter_otlp_endpoint 0.0.0.0:4317 \
    python myapp.py
```

Alternatively, you can use environment variables to configure the agent:

```console
OTEL_SERVICE_NAME=your-service-name \
OTEL_TRACES_EXPORTER=console,otlp \
OTEL_METRICS_EXPORTER=console \
OTEL_EXPORTER_OTLP_TRACES_ENDPOINT=0.0.0.0:4317
opentelemetry-instrument \
    python myapp.py
```

To see the full range of configuration options, see
[Agent Configuration](agent-config).

## Supported libraries and frameworks

A number of popular Python libraries are auto-instrumented, including
[Flask](https://github.com/open-telemetry/opentelemetry-python-contrib/tree/main/instrumentation/opentelemetry-instrumentation-flask)
and
[Django](https://github.com/open-telemetry/opentelemetry-python-contrib/tree/main/instrumentation/opentelemetry-instrumentation-django).
You can find the full list
[here](/ecosystem/registry/?language=python&component=instrumentation).

## Troubleshooting

### Python package installation failure

The Python package installs require `gcc` and `gcc-c++`, which you may need to
install if you’re running a slim version of Linux (e.g., CentOS).

CentOS:

```console
yum -y install python3-devel
yum -y install gcc-c++
```

Debian/Ubuntu:

```console
apt install -y python3-dev
apt install -y build-essential
```

Alpine:

```console
apk add python3-dev
apk add build-base
```

### gRPC Connectivity

To debug Python gRPC connectivity issues, set the following gRPC debug
environment variables:

```console
export GRPC_VERBOSITY=debug
export GRPC_TRACE=http,call_error,connectivity_state
opentelemetry-instrument python <your_app>.py
```
