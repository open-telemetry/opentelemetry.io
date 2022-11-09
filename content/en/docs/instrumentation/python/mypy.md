---
title: Using mypy
weight: 49
---

If you're using [mypy](http://mypy-lang.org/), you'll need to turn on [namespace
packages](https://mypy.readthedocs.io/en/stable/command_line.html#cmdoption-mypy-namespace-packages),
otherwise `mypy` won't be able to run correctly.

To turn on namespace packages, do one of the following:

Add the following to your project configuration file:

```toml
[tool.mypy]
namespace_packages = true
```

Or, use a command-line switch:

```shell
mypy --namespace-packages
```

## Using the `strict` option

If you're using the `strict` option with mypy, and you're using the
OpenTelemetry Python SDK (instead of just the API), you'll need to also set the
following in your project configuration file:

```toml
[mypy-opentelemetry.sdk.*]
implicit_reexport = True
```
