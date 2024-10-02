---
title: Setup the SDK
description: Add the OpenTelemetry SDK to the sample application
weight: 20
---

In this section you will learn how to add the OpenTelemetry SDK to the [sample application](../sample-application/) and
how to configure it.

## Add Dependencies

In the directory of the [player service](../sample-application/#create-and-launch-the-player-service) run the following
command to install the OpenTelemetry SDK packages

{{% multicode "add-dependencies" %}}

## Initialize the OpenTelemetry SDK

First, we’ll initialize the OpenTelemetry SDK. This is required for any application that exports telemetry.

Create {{% _var "otel-file" %}} with OpenTelemetry SDK bootstrapping code:

{{% multicode "init-sdk" %}}