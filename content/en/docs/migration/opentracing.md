---
title: Migrating from OpenTracing 
weight: 20
draft: true
---

The OpenTelemetry project aims to provide backwards compatibility with the
[OpenTracing](https://opentracing.io) project, in order to ease migration to 
OpenTelemetry. The intention is to allow OpenTracing instrumentation to be
recorded using the OpenTelemetry SDK, and to allow both the OpenTelemetry 
and the OpenTracing APIs to be used together in the same codebase.

To accomplish this, each OpenTelemetry SDK provides an **OpenTracing Shim**, 
which can be installed in order to connect the SDK to the OpenTracing API.
Please note that the OpenTracing Shim is not enabled by default.

## Language version support

For reference see the following table, listing the OpenTracing
and OpenTelemetry APIs minimum **language** version, as of
January 2022:

| Language   | OpenTracing API  | OpenTelemetry API |
| ---------- | ---------------- | ----------------- |
| [Go](https://pkg.go.dev/go.opentelemetry.io/otel/bridge/opentracing)         | 1.13             | 1.16              |
| [Java](https://github.com/open-telemetry/opentelemetry-java/tree/main/opentracing-shim)       | 7                | 8                 |
| [Python](https://opentelemetry-python.readthedocs.io/en/stable/shim/opentracing_shim/opentracing_shim.html)     | 2.7              | 3.6               |
| [Javascript](https://www.npmjs.com/package/@opentelemetry/shim-opentracing) | 6                | 8.5               |
| [.NET](https://opentelemetry.io/docs/instrumentation/net/shim/)     | 1.3              | 1.4               |

Users are also encouraged to check and update their language and runtime
components before using the Shim layer, as the OpenTelemetry APIs and SDKs
may have higher version requirements than their OpenTracing counterparts.
e.g. OpenTracing Python supports Python 2.6 and higher, whereas the
OpenTelemetry Python API supports Python 3.5 and higher.

## Migration overview

Currently, there are many codebases which are instrumented with OpenTracing.
These codebases may use the OpenTracing API to instrument their application 
code, and they may install OpenTracing plugins to instrument the libraries and
frameworks.

For a simple approach to migrating to OpenTelemetry, you can do the following.

1. Install the OpenTelemetry SDK, and remove the current OpenTracing
implementation (e.g. the Jaeger client).
2. Install the OpenTelemetry instrumentation libraries, and remove the
OpenTracing equivalents.
3. Update your dashboards, alerts, etc, to consume the new OpenTelemetry data.
4. When writing new application code, write all new instrumentation using the
OpenTelemetry API.
5. Re-instrument your existing application code using the OpenTelemetry API when
it is convenient. There is no hard requirement to remove existing OpenTracing
API calls from your application, they will continue to work.

The above approach works. However, replacing all existing OpenTracing
instrumentation libraries at once could be burdensome.  To avoid any break in
observability, we recommend that OpenTracing users progressively migrate their
applications. The steps below present a careful, incremental approach to
transitioning to OpenTelemetry.

### Step 1: install the OpenTelemetry SDK

Before changing any instrumentation, ensure that you can switch to the
OpenTelemetry SDK without causing any break in the telemetry the application
currently emits. Doing this step on its own – without simultaneously introducing
any new instrumentation – is recommended, as it makes it easier to determine whether
there is any kind of break in instrumentation.

1. Replace the OpenTracing Tracer implementation you are currently using with
the OpenTelemetry SDK. For example, if you are using the Jaeger, remove the
Jaeger client and install the equivalent OpenTelemetry client.
2. Install the OpenTracing Shim. This shim allows the OpenTelemetry SDK to
consume OpenTracing instrumentation.
3. Configure the OpenTelemetry SDK to export data using the same protocol and
format that the OpenTracing client was using. For example, if you were using an
OpenTracing client that exported tracing data in Zipkin format, configure the
OpenTelemetry client to do the same.
4. Alternatively, configure the OpenTelemetry SDK to emit OTLP, and send the
data to a Collector, where you can manage exporting data in multiple formats.

Once you have the OpenTelemetry SDK installed, confirm that you can deploy your
application and still receive the same OpenTracing-based telemetry. In other
words, confirm that your dashboards, alerts, and other tracing-based analysis
tools are still working.

### Step 2: progressively replace instrumentation

Once the OpenTelemetry SDK is installed, all new instrumentation can now be
written using the OpenTelemetry API. With few exceptions, OpenTelemetry and
OpenTracing instrumentation will work together seamlessly (see "limits on
compatibility" below).

What about existing instrumentation? There is no hard requirement to migrate
existing application code to OpenTelemetry. However, we do recommend migrating
from any OpenTracing instrumentation libraries – libraries used to instrument
web frameworks, HTTP clients, database clients, etc. – to their OpenTelemetry
equivalents. This will improve support, as many OpenTracing libraries will be
retired and may no longer be updated.

It is important to note that when switching to an OpenTelemetry instrumentation
library, the data which is produced will change. OpenTelemetry has an improved
model for how we instrument software (what we refer to as our "semantic
conventions"). In many cases OpenTelemetry produces better, more comprehensive
tracing data. However, "better" also means "different." This means that existing
dashboards, alerts, etc. based on older OpenTracing instrumentation libraries
may no longer work when those libraries are replaced.

For existing instrumentation, it is recommended that 
1. Replace one piece of OpenTracing instrumentation with its OpenTelemetry
equivalent.
2. Observe how this changes the telemetry which your application produces.
3. Create new dashboards, alerts, etc which consume this new telemetry. Set up
these dashboards before deploying the new OpenTelemetry library to production.
4. Optionally, add processing rules to the Collector which convert the new
telemetry back into the old telemetry. The Collector can then be configured to
emit both versions of the same telemetry, creating a data overlap. This allows
new dashboards to populate themselves while you continue to use the old
dashboards.

## Limits on compatibility

When migrating to OpenTelemetry, there are several notable edge cases to be
aware of.

### Semantic conventions
As mentioned above, OpenTelemetry has an improved model for instrumenting
software. This means that the "tags" which are set by OpenTracing
instrumentation may be different than the "attributes" which are set by
OpenTelemetry. In other words, when replacing existing instrumentation, the data
OpenTelemetry produces may be different from the data OpenTracing produces. 

Again, for clarity: When changing instrumentation, be sure to also update any
dashboards, alerts, etc. which relied on the old data.

### Baggage
In OpenTracing, baggage is carried with a SpanContext object associated with a
Span. In OpenTelemetry, context and propagation are lower-level concepts –
spans, baggage, metrics instruments, and other items are carried within a
context object.
`
As a result of this change, baggage which is set using the OpenTracing API is
not available to OpenTelemetry Propagators. As a result, mixing the
OpenTelemetry and OpenTracing APIs is not recommended when using baggage. 

Specifically, when baggage is set using the OpenTracing API:
* It is not accessible via the OpenTelemetry API.
* It is not injected by the OpenTelemetry propagators.

If you are using baggage, it is recommended that all baggage-related API calls
be switched to OpenTelemetry at the same time. Be sure to check that any
critical baggage items are still being propagated before rolling these changes
into production.

### Context management in Javascript

In Javascript, the OpenTelemetry API makes use of commonly available context
managers, such as `async_hooks` for NodeJS and `Zones.js` for the browser. These
context managers make tracing instrumentation a much less invasive and onerous
task, compared to adding a span as a parameter to every method which needs to
be traced.

However, the OpenTracing API predates the common use of these context managers.
OpenTracing code which passes the current active span as a parameter may create
problems when mixed with OpenTelemetry code that stores the active span in a
context manager. Using both methods within the same trace may create broken or
mismatched spans, and is not recommended. 

Instead of mixing the two APIs in the same trace, we recommend that you migrate
complete codepaths from OpenTracing to OpenTelemetry as a single unit, so that
only one API is used at a time.


## Specification and implementation details
For details on how each individual OpenTracing shim works, please see the
appropriate language-specific documentation. For details on the design of the
OpenTracing shim, please see the
[specification](https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/compatibility/opentracing.md).