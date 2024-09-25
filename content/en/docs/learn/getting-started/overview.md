---
title: >- 
    Overview
description: What you'll be building
weight: -1
---

For this tutorial, you will be starting with an _uninstrumented_ distributed sample app. _Uninstrumented_ means, that this
app will initially not have any code, that will emit telemetry, such as traces, metrics and logs.

You will add the OpenTelemetry SDK to that application, and afterwards _instrument_ the application by adding traces, metrics
and logs. You will do that, for your dependencies and for your custom code.

When you have successfully instrumented the app, you will learn how to export your telemetry to the console and then using OTLP
to the OpenTelemetry collector. You will see how you can receive telemetry with the collector, process that telemetry and finally
export it to a backend, that can visualize your data.

By the end of the tutorial, you will have learned how to instrument your own app using OpenTelemetry.

{{% alert title="Note" color="info" %}}

You can follow the tutorial using your own application as well, but we recommend that you use the provided [sample application](./sample-application.md)
when you go through it for the first time, such that you have an easier time when you need to troubleshoot or go back some steps.

{{% /alert %}}