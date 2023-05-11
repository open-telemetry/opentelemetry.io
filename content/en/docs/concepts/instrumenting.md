---
title: Instrumenting
description: >-
  How OpenTelemetry facilitates automatic and manual instrumentation of
  applications.
weight: 40
---

In order to make a system observable, it must be **instrumented**: That is, code
from the system's components must emit
[traces](/docs/concepts/observability-primer/#distributed-traces),
[metrics](/docs/concepts/observability-primer/#reliability--metrics), and
[logs](/docs/concepts/observability-primer/#logs).

Without being required to modify the source code you can collect telemetry from
an application using [Automatic Instrumentation][]. If you previously used an
APM agent to extract telemetry from your application, Automatic Instrumentation
will give you a similar out of the box experience.

To facilitate the instrumentation of applications even more, you can [manually
instrument][] your applications by coding against the OpenTelemetry APIs.

For that you don't need to instrument all the dependencies used in your
application:

- some of your libraries will be observable out of the box by calling the
  OpenTelemetry API themselves directly. Those libraries are sometimes called
  **natively instrumented**.
- for libraries without such an integration the OpenTelemetry projects provide
  language specific [Instrumentation Libraries][]

Note, that for most languages it is possible to use both manual and automatic
instrumentation at the same time: Automatic Instrumentation will allow you to
gain insights into your application quickly and manual instrumentation will
enable you to embed granular observability into your code.

The exact installation mechanism for manual and automatic instrumentation varies
based on the language you’re developing in, but there are some similarities
covered in the sections below.

## Automatic Instrumentation

If applicable a language specific implementation of OpenTelemetry will provide a
way to instrument your application without touching your source code. While the
underlying mechanism depends on the language, at a minimum this will add the
OpenTelemetry API and SDK capabilities to your application. Additionally they
may add a set of Instrumentation Libraries and exporter dependencies.

Configuration is available via environment variables and possibly language
specific means such as system properties in Java. At a minimum, a service name
must be configured to identify the service being instrumented. A variety of
other configuration options are available and may include:

- Data source specific configuration
- Exporter configuration
- Propagator configuration
- Resource configuration

## Manual Instrumentation

### Import the OpenTelemetry API and SDK

You'll first need to import OpenTelemetry to your service code. If you're
developing a library or some other component that is intended to be consumed by
a runnable binary, then you would only take a dependency on the API. If your
artifact is a standalone process or service, then you would take a dependency on
the API and the SDK. For more information about the OpenTelemetry API and SDK,
see the [specification](/docs/specs/otel/).

### Configure the OpenTelemetry API

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

### Configure the OpenTelemetry SDK

If you're building a service process, you'll also need to configure the SDK with
appropriate options for exporting your telemetry data to some analysis backend.
We recommend that this configuration be handled programmatically through a
configuration file or some other mechanism. There are also per-language tuning
options you may wish to take advantage of.

### Create Telemetry Data

Once you've configured the API and SDK, you'll then be free to create traces and
metric events through the tracer and meter objects you obtained from the
provider. Make use of Instrumentation Libraries for your dependencies -- check
out the [registry](/ecosystem/registry/) or your language's repository for more
information on these.

### Export Data

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

In addition to open-source tools such as Jaeger or Prometheus, a growing list of
companies support ingesting telemetry data from OpenTelemetry. For details, see
[Vendors](/ecosystem/vendors/).

[automatic instrumentation]:
  /docs/specs/otel/glossary/#automatic-instrumentation
[manually instrument]: /docs/specs/otel/glossary/#manual-instrumentation
[instrumentation libraries]:
  /docs/specs/otel/overview/#instrumentation-libraries
