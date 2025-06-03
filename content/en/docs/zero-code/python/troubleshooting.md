---
title: Troubleshooting Python automatic instrumentation issues
linkTitle: Troubleshooting
weight: 40
aliases: [/docs/languages/python/automatic/troubleshooting]
cSpell:ignore: distro
---

## Common issues

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

### Bootstrap using uv

When using the [uv](https://docs.astral.sh/uv/) package manager, you might face
some difficulty when running `opentelemetry-bootstrap -a install`.

Instead, you can generate the requirements dynamically and install them using
`uv`.

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
[Configuring the agent](#configuring-the-agent)):

```sh
uv run opentelemetry-instrument python myapp.py
```

Please note that you have to reinstall the auto instrumentation every time you
run `uv sync` or update existing packages. It is therefore recommended to make
the installation part of your build pipeline.
