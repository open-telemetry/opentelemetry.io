---
title: Python zero-code instrumentation
linkTitle: Python
weight: 30
aliases: [/docs/languages/python/automatic]
# prettier-ignore
cSpell:ignore: devel distro mkdir myapp pyproject uninstrumented virtualenv Werkzeug
---

Automatic instrumentation with Python uses a Python agent that can be attached
to any Python application. This agent primarily uses
[monkey patching](https://en.wikipedia.org/wiki/Monkey_patch) to modify library
functions at runtime, allowing for the capture of telemetry data from many
popular libraries and frameworks.

## Setup

Run the following commands to install the appropriate packages.

```sh
pip install opentelemetry-distro opentelemetry-exporter-otlp
opentelemetry-bootstrap -a install
```

The `opentelemetry-distro` package installs the API, SDK, and the
`opentelemetry-bootstrap` and `opentelemetry-instrument` tools.

{{% alert title="Note" color="info" %}}

You must install a distro package to get auto instrumentation working. The
`opentelemetry-distro` package contains the default distro to automatically
configure some of the common options for users. For more information, see
[OpenTelemetry distro](/docs/languages/python/distro/).

{{% /alert %}}

The `opentelemetry-bootstrap -a install` command reads through the list of
packages installed in your active `site-packages` folder, and installs the
corresponding instrumentation libraries for these packages, if applicable. For
example, if you already installed the `flask` package, running
`opentelemetry-bootstrap -a install` will install
`opentelemetry-instrumentation-flask` for you. The OpenTelemetry Python agent
will use monkey patching to modify functions in these libraries at runtime.

Running `opentelemetry-bootstrap` without arguments lists the recommended
instrumentation libraries to be installed. For more information, see
[`opentelemetry-bootstrap`](https://github.com/open-telemetry/opentelemetry-python-contrib/tree/main/opentelemetry-instrumentation#opentelemetry-bootstrap).

## Configuring the agent

The agent is highly configurable.

One option is to configure the agent by way of configuration properties from the
CLI:

```sh
opentelemetry-instrument \
    --traces_exporter console,otlp \
    --metrics_exporter console \
    --service_name your-service-name \
    --exporter_otlp_endpoint 0.0.0.0:4317 \
    python myapp.py
```

Alternatively, you can use environment variables to configure the agent:

```sh
OTEL_SERVICE_NAME=your-service-name \
OTEL_TRACES_EXPORTER=console,otlp \
OTEL_METRICS_EXPORTER=console \
OTEL_EXPORTER_OTLP_TRACES_ENDPOINT=0.0.0.0:4317
opentelemetry-instrument \
    python myapp.py
```

To see the full range of configuration options, see
[Agent Configuration](configuration).

## Supported libraries and frameworks

A number of popular Python libraries are auto-instrumented, including
[Flask](https://github.com/open-telemetry/opentelemetry-python-contrib/tree/main/instrumentation/opentelemetry-instrumentation-flask)
and
[Django](https://github.com/open-telemetry/opentelemetry-python-contrib/tree/main/instrumentation/opentelemetry-instrumentation-django).
For the full list, see the
[Registry](/ecosystem/registry/?language=python&component=instrumentation).

## Troubleshooting

### Python package installation failure

The Python package installs require `gcc` and `gcc-c++`, which you may need to
install if you’re running a slim version of Linux, such as CentOS.

<!-- markdownlint-disable blanks-around-fences -->

- CentOS
  ```sh
  yum -y install python3-devel
  yum -y install gcc-c++
  ```
- Debian/Ubuntu
  ```sh
  apt install -y python3-dev
  apt install -y build-essential
  ```
- Alpine
  ```sh
  apk add python3-dev
  apk add build-base
  ```

### gRPC Connectivity

To debug Python gRPC connectivity issues, set the following gRPC debug
environment variables:

```sh
export GRPC_VERBOSITY=debug
export GRPC_TRACE=http,call_error,connectivity_state
opentelemetry-instrument python YOUR_APP.py
```
