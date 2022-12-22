---
title: Agent Configuration
weight: 45
spelling: cSpell:ignore distro mkdir uninstrumented virtualenv
---

Automatic instrumentation with Python uses a Python agent binary that can be attached to any Python application. It dynamically injects bytecode to capture telemetry from many popular libraries and frameworks.

## Setup

Run the following commands to install the appropriate packages.

```console
pip install opentelemetry-distro \
	opentelemetry-exporter-otlp

opentelemetry-bootstrap -a install
```

The `opentelemetry-distro` package installs the API, SDK, and the `opentelemetry-bootstrap` and `opentelemetry-instrument` tools.

The `opentelemetry-bootstrap -a install` command reads through the list of packages installed in your active `site-packages` folder, and installs the corresponding auto-instrumentation libraries for these packages, if applicable. For example, if you already installed the `flask` package, running `opentelemetry-bootstrap -a install` will install `opentelemetry-instrumentation-flask` for you.

> **NOTE:** If you leave out `-a install`, the command will simply list out the recommended auto-instrumentation packages to be installed.
More information can be found [here](https://github.com/open-telemetry/opentelemetry-python-contrib/tree/main/opentelemetry-instrumentation#opentelemetry-bootstrap).

## Configuring the agent

The agent is highly configurable, either by:
* Passing it configuration properties
* Setting [environment variables](https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/sdk-environment-variables.md)

### Configuration properties

Example of agent configuration via configuration properties:

```console
opentelemetry-instrument \
    --traces_exporter console,otlp \
    --metrics_exporter console \
    --service_name <service_name> \
    --exporter_otlp_endpoint <your_observability_backend_endpoint> \
	--exporter_otlp_headers <your_otlp_header> \
    python <your_app>.py
```

Noteworthy items:

* `traces_exporter` specifies which trace exporter to use. In this case, traces are being exported to `console` (stdout) and to `otlp`. The `otlp` option tells `opentelemetry-instrument` to send it to an endpoint that accepts OTLP via gRPC. The full list of available options for traces_exporter can be found [here](https://github.com/open-telemetry/opentelemetry-python-contrib/tree/main/opentelemetry-instrumentation).
* `otlp` used above for `traces_exporter` is the equivalent of using `otlp_proto_grpc`. To send traces via HTTP instead of gRPC, replace `otlp_proto_grpc` (or `otlp`) with `otlp_proto_http`.
* `metrics_exporter` specifies which metrics exporter to use. In this case, metrics are being exported to `console` (stdout).
* `service_name` sets the name of the service associated to the trace, and is sent to your [Observability back-end](/vendors).
* `exporter_otlp_endpoint` tells `opentelemetry-instrument` to send the traces to the given [Observability back-end's](/vendors) endpiont via gRPC, or directly to the [OpenTelemetry Collector](/docs/collector/).
* `exporter_otlp_headers` is required depending on your chosen Observability back-end. More info exporter OTLP headers be found [here](/docs/concepts/sdk-configuration/otlp-exporter-configuration/#otel_exporter_otlp_headers).
* If `exporter_otlp_endpoint` is omitted, the agent assumes that you are using the default Collector gRPC endpoint, `0.0.0.0:4317`. The above command is the equivalent of saying:

	```console
	opentelemetry-instrument \
	--traces_exporter console,otlp_proto_grpc \
	--metrics_exporter console\
	--service_name <service_name> \
	--exporter_otlp_endpoint "0.0.0.0:4317" \
	--exporter_otlp_insecure true \
	python <your_app>.py
	```

	For HTTP, simply replace `otlp_proto_grpc` with `otlp_proto_http` and `0.0.0.0:4317` with `0.0.0.0:4318` (default Collector HTTP endpoint)

### Environment Variables

Example of agent configuration via [environment variables](https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/sdk-environment-variables.md):

```console
OTEL_SERVICE_NAME=<your-service-name> \
OTEL_TRACES_EXPORTER=console,otlp_proto_http \
OTEL_METRICS_EXPORTER=console \
OTEL_EXPORTER_OTLP_TRACES_ENDPOINT=<your_observability_backend_endpoint>
OTEL_EXPORTER_OTLP_TRACES_HEADERS="<your_traces_headers>"
opentelemetry-instrument \
    python <your_app>.py
```

## Supported libraries and frameworks

A number of popular Python libraries are auto-instrumented, including [Flask](https://github.com/open-telemetry/opentelemetry-python-contrib/tree/main/instrumentation/opentelemetry-instrumentation-flask) and [Django](https://github.com/open-telemetry/opentelemetry-python-contrib/tree/main/instrumentation/opentelemetry-instrumentation-django). You can find the full list [here](https://github.com/open-telemetry/opentelemetry-python-contrib/tree/main/instrumentation).

## Troubleshooting

### Python package installs

The Python package installs require `gcc` and `gcc-c++`, which you may need to install if you’re running a slim version of Linux (e.g., CentOS).

Centos:

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

To debug Python gRPC connectivity issues, set the following gRPC debug environment variables:

```console
export GRPC_VERBOSITY=debug
export GRPC_TRACE=http,call_error,connectivity_state
opentelemetry-instrument python <your_app>.py
```