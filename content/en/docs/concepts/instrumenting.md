---
title: "Instrumenting"
weight: 40
---

The OpenTelemetry project facilitates the instrumenting of applications.
Instrumentation libraries offer a core repository per language. They may or may
not offer additional repositories for automatic instrumentation or non-core
components. For example, Java instrumentation libraries provide the following
repositories:

- **[Core](https://github.com/open-telemetry/opentelemetry-java):** Provides an
  implementation of the OpenTelemetry API and SDK and can be used to manually
  instrument an application.
- **[Instrumentation](https://github.com/open-telemetry/opentelemetry-java-instrumentation):**
  All the core functionality plus automatic instrumentation for a variety of
  libraries and frameworks.
- **[Contrib](https://github.com/open-telemetry/opentelemetry-java-contrib):**
  Optional components such as JMX metric gathers.

Some instrumentation libraries, for example Ruby, offer a [single
repository](https://github.com/open-telemetry/opentelemetry-ruby) that supports
both manual and automatic instrumentation. Other languages, for example JS,
support both manual and automatic instrumentation, but separate
[core](https://github.com/open-telemetry/opentelemetry-js) components from
[contrib](https://github.com/open-telemetry/opentelemetry-js-contrib)
components in separate repositories.

The exact installation mechanism for OpenTelemetry varies based on the language
you're developing in, but there are some similarities covered in the sections
below.

> Instrumentation libraries may be offered as a distribution, see [here](../distributions) for more information.

## Automatic Instrumentation

### Add dependencies

In order to enable automatic instrumentation, one or more dependencies need to
be added. How dependencies are added are language specific. At a minimum, these
dependencies will add OpenTelemetry API and SDK capabilities. Some languages
also require per instrumentation dependencies. Exporter dependencies may also
be required. For more information about the OpenTelemetry API and SDK, see the
[specification](/docs/reference/specification/).

### Configure OpenTelemetry Instrumentation

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
artifact is a standalone process or service, then you would take a dependency
on the API and the SDK. For more information about the OpenTelemetry API and
SDK, see the [specification](/docs/reference/specification/).

### Configure the OpenTelemetry API

In order to create traces or metrics, you'll need to first create a tracer
and/or meter provider. In general, we recommend that the SDK should provide a
single default provider for these objects. You'll then get a tracer or meter
instance from that provider, and give it a name and version. The name you
choose here should identify what exactly is being instrumented -- if you're
writing a library, for example, then you should name it after your library
(i.e., `com.legitimatebusiness.myLibrary` or some other unique identifier) as
this name will namespace all spans or metric events produced. It is also
recommended that you supply a version string (i.e., `semver:1.0.0`) that
corresponds to the current version of your library or service.

### Configure the OpenTelemetry SDK

If you're building a service process, you'll also need to configure the SDK
with appropriate options for exporting your telemetry data to some analysis
backend. We recommend that this configuration be handled programmatically
through a configuration file or some other mechanism. There are also
per-language tuning options you may wish to take advantage of.

### Create Telemetry Data

Once you've configured the API and SDK, you'll then be free to create traces
and metric events through the tracer and meter objects you obtained from the
provider. You can also utilize a plugin or integration to create traces and
metric events for you -- check out the [registry](/registry) or your language's
repository for more information on these.

### Export Data

Once you've created telemetry data, you'll want to send it somewhere.
OpenTelemetry supports two primary methods of exporting data from your process
to an analysis backend, either directly from a process or by proxying it
through the [OpenTelemetry Collector](/docs/collector).

In-process export requires you to import and take a dependency on one or more
_exporters_, libraries that translate OpenTelemetry's in-memory span and metric
objects into the appropriate format for telemetry analysis tools like Jaeger or
Prometheus. In addition, OpenTelemetry supports a wire protocol known as
`OTLP`, which is supported by all OpenTelemetry SDKs. This protocol can be used
to send data to the OpenTelemetry Collector, a standalone binary process that
can be run as a proxy or sidecar to your service instances or run on a separate
host. The Collector can then be configured to forward and export this data to
your choice of analysis tools.

In addition to open source tools such as Jaeger or Prometheus, a growing list
of companies support ingesting telemetry data from OpenTelemetry. Please see
[this page](/vendors) for more details.
