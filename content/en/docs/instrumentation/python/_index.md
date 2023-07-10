---
title: Python
description: >-
  <img width="35" class="img-initial" src="/img/logos/32x32/Python_SDK.svg"
  alt="Python"> A language-specific implementation of OpenTelemetry in Python.
aliases: [/python, /python/metrics, /python/tracing]
weight: 22
---

{{% docs/instrumentation/index-intro python /%}}

## Version support

OpenTelemetry-Python supports Python 3.6 and higher.

## Installation

The API and SDK packages are available on PyPI, and can be installed via pip:

```sh
pip install opentelemetry-api
pip install opentelemetry-sdk
```

In addition, there are several extension packages which can be installed
separately as:

```sh
pip install opentelemetry-exporter-{exporter}
pip install opentelemetry-instrumentation-{instrumentation}
```

These are for exporter and instrumentation packages respectively. The Jaeger,
Zipkin, Prometheus, OTLP and OpenCensus Exporters can be found in the
[exporter](https://github.com/open-telemetry/opentelemetry-python/blob/main/exporter/)
directory of the repository. Instrumentations and additional exporters can be
found in the contrib repo
[instrumentation](https://github.com/open-telemetry/opentelemetry-python-contrib/tree/main/instrumentation)
and
[exporter](https://github.com/open-telemetry/opentelemetry-python-contrib/tree/main/exporter)
directories.

## Extensions

To find related projects like exporters, instrumentation libraries, tracer
implementations, etc., visit the [Registry](/ecosystem/registry/?s=python).

### Installing Cutting-edge Packages

There is some functionality that has not yet been released to PyPI. In that
situation, you may want to install the packages directly from the repository. This can
be done by cloning the repository and doing an
[editable install](https://pip.pypa.io/en/stable/reference/pip_install/#editable-installs):

```sh
git clone https://github.com/open-telemetry/opentelemetry-python.git
cd opentelemetry-python
pip install -e ./opentelemetry-api
pip install -e ./opentelemetry-sdk
```

## Repositories and benchmarks

- Main repo: [opentelemetry-python][]
- Contrib repo: [opentelemetry-python-contrib][]

[opentelemetry-python]: https://github.com/open-telemetry/opentelemetry-python
[opentelemetry-python-contrib]:
  https://github.com/open-telemetry/opentelemetry-python-contrib
