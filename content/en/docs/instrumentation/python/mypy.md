---
title: Using mypy
weight: 120
---

If you're using [mypy](http://mypy-lang.org/), you'll need to turn on
[namespace packages](https://mypy.readthedocs.io/en/stable/command_line.html#cmdoption-mypy-namespace-packages),
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
