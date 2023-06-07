---
title: Manual
description: >-
  Learn about the essential steps to manually instrument your application.
weight: 20
---

## Import the OpenTelemetry API and SDK

You'll first need to import OpenTelemetry to your service code. If you're
developing a library or some other component that is intended to be consumed by
a runnable binary, then you would only take a dependency on the API. If your
artifact is a standalone process or service, then you would take a dependency on
the API and the SDK. For more information about the OpenTelemetry API and SDK,
see the [specification](/docs/specs/otel/).

## Configure the OpenTelemetry API

In order to create traces or metrics, you'll need to first create a tracer
and/or meter provider. In general, we recommend that the SDK should provide a
single default provider for these objects. You'll then get a tracer or meter
instance from that provider, and give it a name and version. The name you choose
here should identify what exactly is being instrumented -- if you're writing a
library, for example, then you should name it after your library (for example
`com.legitimatebusiness.myLibrary`) as this name will namespace all spans or
metric events produced. It is also recommended that you supply a version string
(i.e., `semver:1.0.0`) that corresponds to the current version of your library
or service.

## Configure the OpenTelemetry SDK

If you're building a service process, you'll also need to configure the SDK with
appropriate options for exporting your telemetry data to some analysis backend.
We recommend that this configuration be handled programmatically through a
configuration file or some other mechanism. There are also per-language tuning
options you may wish to take advantage of.

## Create Telemetry Data

Once you've configured the API and SDK, you'll then be free to create traces and
metric events through the tracer and meter objects you obtained from the
provider. Make use of Instrumentation Libraries for your dependencies -- check
out the [registry](/ecosystem/registry/) or your language's repository for more
information on these.

## Export Data

Once you've created telemetry data, you'll want to send it somewhere.
OpenTelemetry supports two primary methods of exporting data from your process
to an analysis backend, either directly from a process or by proxying it through
the [OpenTelemetry Collector](/docs/collector).

In-process export requires you to import and take a dependency on one or more
_exporters_, libraries that translate OpenTelemetry's in-memory span and metric
objects into the appropriate format for telemetry analysis tools like Jaeger or
Prometheus. In addition, OpenTelemetry supports a wire protocol known as `OTLP`,
which is supported by all OpenTelemetry SDKs. This protocol can be used to send
data to the OpenTelemetry Collector, a standalone binary process that can be run
as a proxy or sidecar to your service instances or run on a separate host. The
Collector can then be configured to forward and export this data to your choice
of analysis tools.

In addition to open source tools such as Jaeger or Prometheus, a growing list of
companies support ingesting telemetry data from OpenTelemetry. For details, see
[Vendors](/ecosystem/vendors/).
