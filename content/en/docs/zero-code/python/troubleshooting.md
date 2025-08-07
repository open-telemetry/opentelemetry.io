---
title: Troubleshooting Python automatic instrumentation issues
linkTitle: Troubleshooting
weight: 40
cSpell:ignore: gunicorn
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

### Pre-fork servers can break metrics export

A pre-fork server, such as Gunicorn with multiple workers, could be run like
this:

```sh
gunicorn myapp.main:app --workers 4
```

However, specifying more than one `--workers` may break the generation metrics when
auto-instrumentation is applied. This is because forking, the creation of
worker/child processes, creates inconsistencies between each child in the
background threads and locks assumed by key OpenTelemetry SDK components.
Specifically, the PeriodicExportingMetricReader spawns its own thread to
periodically flush data to the exporter. After forking, each child seeks a
thread object in memory that is not actually run, and any original locks may not
unlock for each child. See also forks and deadlocks described in
[Python issue6721](https://bugs.python.org/issue6721).

This table summarizes the current support of telemetry export by auto-instrumented
web server gateways that have been pre-forked with multiple workers:

| Stack                    | Traces             | Metrics            | Logs               |
| ------------------------ | ------------------ | ------------------ | ------------------ |
| Uvicorn                  | :white_check_mark: | :x:                | :white_check_mark: |
| Gunicorn                 | :white_check_mark: | :x:                | :white_check_mark: |
| Gunicorn + UvicornWorker | :white_check_mark: | :white_check_mark: | :white_check_mark: |

To instrument a server with multiple workers, it is recommended to deploy using
Gunicorn with `uvicorn.workers.UvicornWorker` if it is an ASGI app (FastAPI,
Starlette, etc). The UvicornWorker class is specifically designed to handle
forks with preservation of background processes and threads. For example:

```sh
opentelemetry-instrument gunicorn \
  --workers 4 \
  --worker-class uvicorn.workers.UvicornWorker \
  --bind 0.0.0.0:8000 \
  myapp.main:app
```

If the app is not ASGI-based, consider setting up a separate instance of
[Prometheus](/docs/languages/python/exporters/#prometheus-setup) to collect
metrics from all workers.

Or, initialize OpenTelemetry inside the worker process with
[manual or programmatic instrumentation](/docs/zero-code/python/example/) after
the server fork, instead of automatically. For example:

```python
from opentelemetry.instrumentation.auto_instrumentation.sitecustomize import initialize
initialize()

from your_app import app
```

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
