---
title: Troubleshooting Python automatic instrumentation issues
linkTitle: Troubleshooting
weight: 40
cSpell:ignore: ASGI gunicorn uvicorn
---

## Installation issues

### Python package installation failure

The Python package installs require `gcc` and `gcc-c++`, which you may need to
install if you’re running a slim version of Linux, such as CentOS.

<!-- markdownlint-disable blanks-around-fences -->

{{< tabpane text=true >}} {{% tab "CentOS" %}}

```sh
yum -y install python3-devel
yum -y install gcc-c++
```

{{% /tab %}} {{% tab "Debian/Ubuntu" %}}

```sh
apt install -y python3-dev
apt install -y build-essential
```

{{% /tab %}} {{% tab "Alpine" %}}

```sh
apk add python3-dev
apk add build-base
```

{{% /tab %}} {{< /tabpane >}}

{#bootstrap-using-uv}

### Bootstrap using uv

Running `opentelemetry-bootstrap -a install` when using the
[uv](https://docs.astral.sh/uv/) package manager may result in errored or
unexpected dependency setups.

Instead, you can generate OpenTelemetry requirements dynamically and install
them using `uv`.

First, install the appropriate packages (or add them to your project file and
run `uv sync`):

```sh
uv pip install opentelemetry-distro opentelemetry-exporter-otlp
```

Now, you can install the auto instrumentation:

```sh
uv run opentelemetry-bootstrap -a requirements | uv pip install --requirement -
```

Finally, use `uv run` to start your application (see
[Configuring the agent](/docs/zero-code/python/#configuring-the-agent)):

```sh
uv run opentelemetry-instrument python myapp.py
```

Please note that you have to reinstall the auto instrumentation every time you
run `uv sync` or update existing packages. It is therefore recommended to make
the installation part of your build pipeline.

## Instrumentation issues

### Flask debug mode with reloader breaks instrumentation

The debug mode can be enabled in the Flask app like this:

```python
if __name__ == "__main__":
    app.run(port=8082, debug=True)
```

The debug mode can break instrumentation from happening because it enables a
reloader. To run instrumentation while the debug mode is enabled, set the
`use_reloader` option to `False`:

```python
if __name__ == "__main__":
    app.run(port=8082, debug=True, use_reloader=False)
```

### Pre-fork server issues

A pre-fork server, such as Gunicorn with multiple workers, could be run like
this:

```sh
gunicorn myapp.main:app --workers 4
```

However, specifying more than one `--workers` may break the generation of
metrics when auto-instrumentation is applied. This is because forking, the
creation of worker/child processes, creates inconsistencies between each child
in the background threads and locks assumed by key OpenTelemetry SDK components.
Specifically, the `PeriodicExportingMetricReader` spawns its own thread to
periodically flush data to the exporter. See also issues
[#2767](https://github.com/open-telemetry/opentelemetry-python/issues/2767) and
[#3307](https://github.com/open-telemetry/opentelemetry-python/issues/3307#issuecomment-1579101152).
After forking, each child seeks a thread object in memory that is not actually
run, and any original locks may not unlock for each child. See also forks and
deadlocks described in [Python issue 6721](https://bugs.python.org/issue6721).

#### Workarounds

There are some workarounds for pre-fork servers with OpenTelemetry. The
following table summarizes the current support of signal export by different
auto-instrumented web server gateway stacks that have been pre-forked with
multiple workers. See below for more details and options:

| Stack with multiple workers | Traces | Metrics | Logs |
| --------------------------- | ------ | ------- | ---- |
| Uvicorn                     | x      |         | x    |
| Gunicorn                    | x      |         | x    |
| Gunicorn + UvicornWorker    | x      | x       | x    |

##### Deploy with Gunicorn and UvicornWorker

To auto-instrument a server with multiple workers, it is recommended to deploy
using Gunicorn with `uvicorn.workers.UvicornWorker` if it is an Asynchronous
Server Gateway Interface (ASGI) app (FastAPI, Starlette, etc). The UvicornWorker
class is specifically designed to handle forks with preservation of background
processes and threads. For example:

```sh
opentelemetry-instrument gunicorn \
  --workers 4 \
  --worker-class uvicorn.workers.UvicornWorker \
  --bind 0.0.0.0:8000 \
  myapp.main:app
```

##### Use programmatic auto-instrumentation

Initialize OpenTelemetry inside the worker process with
[programmatic auto-instrumentation](https://github.com/open-telemetry/opentelemetry-python-contrib/blob/main/opentelemetry-instrumentation/README.rst#programmatic-auto-instrumentation)
after the server fork, instead of with `opentelemetry-instrument`. For example:

```python
from opentelemetry.instrumentation.auto_instrumentation import initialize
initialize()

from your_app import app
```

If using FastAPI, note that `initialize()` must be called before importing
`FastAPI` because of how instrumentation is patched. For example:

```python
from opentelemetry.instrumentation.auto_instrumentation import initialize
initialize()

from fastapi import FastAPI

app = FastAPI()

@app.get("/")
async def root():
    return {"message": "Hello World"}
```

Then, run the server with:

```sh
uvicorn main:app --workers 2
```

##### Use Prometheus with direct OTLP

Consider using a recent version of
[Prometheus](/docs/languages/python/exporters/#prometheus-setup) to receive OTLP
metrics directly. Set up a `PeriodicExportingMetricReader` and one OTLP worker
per process to push to Prometheus server. We recommend _not_ using
`PrometheusMetricReader` with forking -- see issue
[#3747](https://github.com/open-telemetry/opentelemetry-python/issues/3747).

##### Use a single worker

Alternatively, use a single worker in pre-fork with zero-code instrumentation:

```sh
opentelemetry-instrument gunicorn your_app:app --workers 1
```

## Connectivity issues

### gRPC Connectivity

To debug Python gRPC connectivity issues, set the following gRPC debug
environment variables:

```sh
export GRPC_VERBOSITY=debug
export GRPC_TRACE=http,call_error,connectivity_state
opentelemetry-instrument python YOUR_APP.py
```
