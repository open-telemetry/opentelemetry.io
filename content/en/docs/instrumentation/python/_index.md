---
title: Python
description: >-
  <img width="35" src="https://raw.github.com/open-telemetry/opentelemetry.io/main/iconography/32x32/Python_SDK.svg"></img>
  A language-specific implementation of OpenTelemetry in Python.
aliases: [/python, /python/metrics, /python/tracing]
weight: 22
---

This is the OpenTelemetry for Python documentation. OpenTelemetry is an
observability framework -- an API, SDK, and tools that are designed to aid in
the generation and collection of application telemetry data such as metrics,
logs, and traces. This documentation is designed to help you understand how to
get started using OpenTelemetry for Python.

## Version support

OpenTelemetry-Python supports Python 3.6 and higher.

## Status and Releases

The current status of the major functional components for OpenTelemetry Python
is as follows:

- **Traces** ([API][api/t], [SDK][sdk/t]): [Stable][]
- **Metrics** ([API][api/m], [SDK][sdk/m]): [Alpha][Experimental]
- **Logs** ([SDK][sdk/l]): [Experimental][]

[api/m]: https://opentelemetry-python.readthedocs.io/en/stable/api/metrics.html
[api/t]: https://opentelemetry-python.readthedocs.io/en/stable/api/trace.html
[Experimental]:
    /docs/reference/specification/versioning-and-stability/#experimental
[sdk/l]: https://opentelemetry-python.readthedocs.io/en/stable/sdk/logs.html
[sdk/m]: https://opentelemetry-python.readthedocs.io/en/stable/sdk/metrics.html
[sdk/t]: https://opentelemetry-python.readthedocs.io/en/stable/sdk/trace.html
[Stable]: /docs/reference/specification/versioning-and-stability/#stable

{{% latest_release "python" /%}}

## Installation

The API and SDK packages are available on PyPI, and can installed via pip:

```console
$ pip install opentelemetry-api
$ pip install opentelemetry-sdk
```

In addition, there are several extension packages which can be installed
separately as:

```console
$ pip install opentelemetry-exporter-{exporter}
$ pip install opentelemetry-instrumentation-{instrumentation}
```

These are for exporter and instrumentation packages respectively. The Jaeger,
Zipkin, OTLP and OpenCensus Exporters can be found in the
[exporter](https://github.com/open-telemetry/opentelemetry-python/blob/main/exporter/)
directory of the repository. Instrumentations and additional exporters can be
found in the [Contrib repo
instrumentation](https://github.com/open-telemetry/opentelemetry-python-contrib/tree/main/instrumentation)
and [Contrib repo
exporter](https://github.com/open-telemetry/opentelemetry-python-contrib/tree/main/exporter)
directories.

## Extensions

To find related projects like exporters, instrumentation libraries, tracer
implementations, etc., visit the [Registry](/registry/?s=python).

### Installing Cutting-edge Packages

There is some functionality that has not yet been released to PyPI. In that
situation, you may want to install the packages directly from the repo. This can
be done by cloning the repository and doing an [editable
install](https://pip.pypa.io/en/stable/reference/pip_install/#editable-installs):

```console
$ git clone https://github.com/open-telemetry/opentelemetry-python.git
$ cd opentelemetry-python
$ pip install -e ./opentelemetry-api
$ pip install -e ./opentelemetry-sdk
```

## Learn more

- [API reference][]
- [Examples][]
- [Contrib repository][]
- [Performance benchmarks][]

[API reference]: https://opentelemetry-python.readthedocs.io/en/stable/
[Contrib repository]:
    https://github.com/open-telemetry/opentelemetry-python-contrib
[Examples]: https://opentelemetry-python.readthedocs.io/en/stable/examples/
[Performance benchmarks]:
    https://open-telemetry.github.io/opentelemetry-python/benchmarks/
