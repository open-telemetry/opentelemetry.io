---
title: Using mypy
weight: 5
---

If you're using [mypy](http://mypy-lang.org/), you'll need to turn on [namespace
packages](https://mypy.readthedocs.io/en/stable/command_line.html#cmdoption-mypy-namespace-packages).

In your project configuration file, add the following:

```toml
[tool.mypy]
namespace_packages = true
```

Or if you'd prefer a command-line switch, use `--namespace-packages`:

```console
mypy --namespace-packages
```

If you don't turn on namespace packages, then mypy won't be able to correctly
run.
