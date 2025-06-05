---
title: Troubleshooting Python automatic instrumentation issues
linkTitle: Troubleshooting
weight: 40
---

## Installation issues

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

## Connectivity issues

### gRPC Connectivity

To debug Python gRPC connectivity issues, set the following gRPC debug
environment variables:

```sh
export GRPC_VERBOSITY=debug
export GRPC_TRACE=http,call_error,connectivity_state
opentelemetry-instrument python YOUR_APP.py
```
