---
title: >- 
    Overview
description: What you'll be building
weight: -1
---

For this tutorial, you will be starting with an _uninstrumented_ distributed [sample app](./sample-application/). _Uninstrumented_ means, that this
app will initially not have any code, that will emit telemetry, such as [traces](/docs/concepts/signals/traces), [metrics](/docs/concepts/signals/metrics) and [logs](/docs/concepts/signals/logs).

You will [add the OpenTelemetry SDK](./sdk-setup/code/) to that application, and afterwards [_instrument_](./add-telemetry/) the application by adding traces, metrics
and logs. You will do that, for your dependencies and for your custom code.

When you have successfully instrumented the app, you will learn how to [export your telemetry](./export-telemetry/) to the console and then using OTLP
to the OpenTelemetry collector. You will see how you can [receive telemetry with the collector](./collector-setup/), process that telemetry and eventually
export it to a backend, that can [visualize your data](./visualization/).

Finally, you will learn how OpenTelemetry can [correlate telemetry across service boundaries](./correlate-across-services/), and how you can [add more context](./add-context/), like service, container or
host information to your telemetry.

By the end of the tutorial, you will have learned how to instrument your own app using OpenTelemetry.

Start by setting up the [sample application](./sample-application/) that will be used throughout the tutorial.

{{% alert title="Note" color="info" %}}

You can follow the tutorial using your own application as well, but we recommend that you use the provided [sample application](./sample-application.md)
when you go through it for the first time, such that you have an easier time when you need to troubleshoot or go back some steps.

{{% /alert %}}