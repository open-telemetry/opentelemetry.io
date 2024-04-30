---
title: Using instrumentation libraries
linkTitle: Libraries
weight: 40
---

{{% docs/languages/libraries-intro "C++" %}}

## Using instrumentation libraries

When you develop an app, you might use third-party libraries and frameworks to
accelerate your work. If you then instrument your app using OpenTelemetry, you
might want to avoid spending additional time to manually add traces, logs, and
metrics to the third-party libraries and frameworks you use.

Many libraries and frameworks already support OpenTelemetry or are supported
through OpenTelemetry
[instrumentation](https://opentelemetry.io/docs/concepts/instrumentation/libraries/),
so that they can generate telemetry you can export to an observability backend.

If you are instrumenting an app or service that use third-party libraries or
frameworks, follow these instructions to learn how to use natively instrumented
libraries and instrumentation libraries for your dependencies.

## Use natively instrumented libraries

If a library comes with OpenTelemetry support by default, you can get traces,
metrics, and logs emitted from that library by adding and setting up the
OpenTelemetry SDK with your app.

The library might require some additional configuration for the instrumentation.
See the documentation for that library to learn more.

If a library doesn't include OpenTelemetry support, you can use
[instrumentation libraries](https://opentelemetry.io/docs/specs/otel/glossary/#instrumentation-library)
to generate telemetry data for a library or framework.


## Setup

To set up an instrumentation library see
[otel-cpp-contrib](https://github.com/open-telemetry/opentelemetry-cpp-contrib/tree/main/instrumentation)

## Available packages

A full list of instrumentation libraries available can be found in the
[OpenTelemetry registry](https://opentelemetry.io/ecosystem/registry/?language=cpp&component=instrumentation)

## Next steps

After you've set up instrumentation libraries, you might want to add
[additional instrumentation](https://opentelemetry.io/docs/languages/cpp/instrumentation/)
to collect custom telemetry data.

You might also want to configure an appropriate exporter to
[export your telemetry data](https://opentelemetry.io/docs/languages/cpp/exporters/)
to one or more telemetry backends.
