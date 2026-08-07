---
title: Go compile-time instrumentation
linkTitle: Compile-time
description: Instrument Go applications at build time, without code changes.
weight: 20
cSpell:ignore: otelc toolexec
---

Compile-time instrumentation for Go automatically instruments your application
during the build, capturing telemetry from many popular libraries and frameworks
without any changes to your source code. It works by hooking into the Go build
process and injecting instrumentation as your application is compiled, so the
resulting binary contains the instrumentation code with no runtime agent
required.

> [!NOTE]
>
> This project is stable and ready for production use as of v1.0.0. To follow
> development or get involved, visit the
> [opentelemetry-go-compile-instrumentation repository](https://github.com/open-telemetry/opentelemetry-go-compile-instrumentation).

## How it works

The `otelc` tool wraps your regular `go build` invocation. During the build it:

1. Intercepts compilation of each package using the Go toolchain's `-toolexec`
   mechanism.
2. Matches packages and functions against a set of instrumentation rules that
   describe where telemetry hooks belong.
3. Injects lightweight hook points into the matched functions and links them to
   OpenTelemetry instrumentation code.

Because instrumentation is baked into the binary at compile time, it also covers
third-party dependencies you don't control, and it adds no runtime attach or
startup steps.

## When to use it

Compile-time instrumentation is one of several
[zero-code](/docs/concepts/instrumentation/zero-code/) options for Go: it
complements the [Auto SDK](/docs/zero-code/go/autosdk/), while eBPF-based
instrumentation is available through [OBI](/docs/zero-code/obi/). Compile-time
instrumentation is a good fit when you can modify the build pipeline but not the
source code, when you want instrumentation inside third-party libraries, or when
you can't run a privileged agent alongside your application.
