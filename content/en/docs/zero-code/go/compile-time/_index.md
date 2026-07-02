---
title: Go compile-time instrumentation
linkTitle: Compile-time
description: Instrument Go applications at build time, without code changes.
weight: 20
---

Compile-time instrumentation for Go automatically instruments your application
during the build, capturing telemetry from many popular libraries and frameworks
without any changes to your source code. It works by hooking into the Go build
process and injecting instrumentation as your application is compiled.

It is one of several zero-code options for Go: it complements the
[Auto SDK](/docs/zero-code/go/autosdk/), while eBPF-based instrumentation is
available through [OBI](/docs/zero-code/obi/).

This project is currently work in progress. To learn more and get started, visit
the
[opentelemetry-go-compile-instrumentation repository](https://github.com/open-telemetry/opentelemetry-go-compile-instrumentation).
