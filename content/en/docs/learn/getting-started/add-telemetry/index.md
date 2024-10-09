---
title: Add Telemetry
description: Add traces, metrics and logs to your application
weight: 30
---

In this section we will capture traces, metrics and logs from your application.
You will learn how to extract telemetry from your dependencies, and how you can
add telemetry to your custom code.

## Instrumenting libraries

As a first step, you will learn how to extract traces, metrics and logs from
your dependencies. There are three different situations you will encounter, when
looking into the observability of a library or framework:

- The library is _natively instrumented_, and comes with OpenTelemetry support
  by default. You can get traces, metrics and logs emitted from that library by
  adding and setting up the OpenTelemetry SDK with your app.
- If a library is not _natively instrumented_, there might be an
  _instrumnetation library_ available, which is an additional dependency you can
  add to your project. This instrumentation library will inject OpenTelemetry
  API calls into the other library, such that it will emit telemetry.
- In some cases, you will encounter libraries which are neither _natively
  instrumented_ nor can be instrumented using an existing _instrumentation
  library_. We will skip this situation in this beginners tutorial.

### Using natively instrumented libraries

### Using instrumentation libraries

### Finding instrumentation for libraries

## Instrumenting custom code

Add logs, metrics, traces

### Add traces

### Add metrics

### Add logs
