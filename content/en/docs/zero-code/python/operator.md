---
title: Using the OpenTelemetry Operator to Inject Auto-Instrumentation
linkTitle: Operator
aliases: [/docs/languages/python/automatic/operator]
weight: 30
cSpell:ignore: grpcio myapp psutil PYTHONPATH
---

If you run your Python service in Kubernetes, you can take advantage of the
[OpenTelemetry Operator](https://github.com/open-telemetry/opentelemetry-operator)
to inject auto-instrumentation without having to modify each of your services
directly.
[See the OpenTelemetry Operator Auto-instrumentation docs for more details.](/docs/kubernetes/operator/automatic/)

### Python-specific topics

#### Libraries with binary wheels

Some Python packages we instrument or need in our instrumentation libraries,
might ship with some binary code. This is the case, for example, of `grpcio` and
`psutil` (used in `opentelemetry-instrumentation-system-metrics`).

The binary code is tied to a specific C library version (glibc or musl) and to a
specific Python version. The
[OpenTelemetry Operator](https://github.com/open-telemetry/opentelemetry-operator)
provides images for a single Python version based on the glibc C library. If you
want to use it you might need to build your own image operator Docker image for
Python auto-instrumentation.

Since operator v0.113.0 it is possible to build an image with both glibc and
musl based auto-instrumentation and
[configure it at runtime](/docs/kubernetes/operator/automatic/#annotations-python-musl).

#### Django applications

Applications that run from their own executable like Django requires to set in
your deployment file two environment variables:

- `PYTHONPATH`, with the path to the Django application root directory, e.g.
  "/app"
- `DJANGO_SETTINGS_MODULE`, with the name of the Django settings module, e.g.
  "myapp.settings"
