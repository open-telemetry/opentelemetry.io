---
title: Getting Started
description: Learn how to instrument your application step-by-step
weight: 160
---

In this tutorial you will learn how you can add OpenTelemetry to the code of an
application, such that it emits telemetry (traces, metrics, logs) to an
OpenTelemetry Collector.

You will be starting with an uninstrumented distributed sample app.
Uninstrumented means, that this app will initially not have any code, that will
emit telemetry.

You will add the OpenTelemetry SDK to that application, and afterwards
instrument the application by adding traces, metrics and logs. You will do that,
for your dependencies and for your custom code.

When you have successfully instrumented the app, you will learn how to export
your telemetry to the console and then using OTLP to the OpenTelemetry
Collector. You will see how you can receive telemetry with the collector,
process that telemetry and eventually export it to a backend, that can visualize
your data.

Finally, you will learn how OpenTelemetry can correlate telemetry across service
boundaries, and how you can add more context, like service, container or host
information to your telemetry.

By the end of the tutorial, you will have learned how to instrument your own app
using OpenTelemetry.

Start by setting up the sample application that will be used throughout the
tutorial.
