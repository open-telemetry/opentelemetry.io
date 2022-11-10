---
title: Python
description: >-
  <img width="35"
  src="https://raw.github.com/open-telemetry/opentelemetry.io/main/iconography/32x32/Python_SDK.svg"
  alt="Python"></img>
  A language-specific implementation of OpenTelemetry in Python.
aliases: [/python, /python/metrics, /python/tracing]
weight: 22
---

{{% lang_instrumentation_index_head "python" %}}

## Version support

OpenTelemetry-Python supports Python 3.6 and higher.

## Installation

The API and SDK packages are available on PyPI, and can be installed via pip:

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
Zipkin, Prometheus, OTLP and OpenCensus Exporters can be found in the
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

## Repositories and benchmarks

- Main repo: [opentelemetry-python](https://github.com/open-telemetry/opentelemetry-python)
- Contrib repo: [opentelemetry-python-contrib][]
- [Performance benchmarks][]

[opentelemetry-python-contrib]:
    https://github.com/open-telemetry/opentelemetry-python-contrib
[Performance benchmarks]:
    https://open-telemetry.github.io/opentelemetry-python/benchmarks/
